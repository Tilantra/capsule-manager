import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { CapsuleMetadata, CapsuleVersion } from "@/lib/capsule-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Trash2, Calendar, Filter, History, Lock, Grid3x3, Table2, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import CapsuleImage from "@/components/assets/capsule.png";
import ChatGPTLogo from "@/components/assets/ChatgptLogo.png";
import ClaudeLogo from "@/components/assets/ClaudeLogo.png";
import GeminiLogo from "@/components/assets/GeminiLogo.png";
import DeepSeekLogo from "@/components/assets/DeepseekLogo.png";
import GmailLogo from "@/components/assets/GmailLogo.png";
import GuideraLogo from "@/components/assets/logo-small.jpeg";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GitBranchView } from "@/components/GitBranchView";
import { motion, AnimatePresence } from "framer-motion";

type Capsule = CapsuleMetadata;

// Model logo mapping
const modelLogos: Record<string, string> = {
    chatgpt: ChatGPTLogo,
    gpt: ChatGPTLogo,
    "gpt-4": ChatGPTLogo,
    "gpt-3.5": ChatGPTLogo,
    claude: ClaudeLogo,
    gemini: GeminiLogo,
    deepseek: DeepSeekLogo,
    mail: GmailLogo,
    gmail: GmailLogo,
    guidera: GuideraLogo,
    tilantra: GuideraLogo,
};

const getModelLogo = (modelName: string): string | null => {
    const normalized = modelName.toLowerCase();
    for (const [key, logo] of Object.entries(modelLogos)) {
        if (normalized.includes(key)) {
            return logo;
        }
    }
    return null;
};

const getYouTubeEmbedUrl = (url: string): string => {
    const trimmed = url.trim();
    const match = trimmed.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (!match?.[1]) return trimmed;
    return `https://www.youtube.com/embed/${match[1]}`;
};

export default function CapsulesPage() {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [versions, setVersions] = useState<CapsuleVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [rollingBack, setRollingBack] = useState<string | null>(null);
    const [showBranchView, setShowBranchView] = useState(false);
    const [filterType, setFilterType] = useState<string>("all");
    const [userTeams, setUserTeams] = useState<string[]>([]);
    const [teamIdToName, setTeamIdToName] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const featureVideoUrl = "https://www.youtube.com/watch?v=3NH3ArEe0dE";

    const client = useMemo(() => new BrowserGuideraClient(), []);

    const fetchCapsules = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.getUserCapsules(100, 0);
            setCapsules(response.results);

            // Extract unique team IDs
            const teamIds = Array.from(new Set(response.results.map(c => c.team).filter(Boolean))) as string[];
            setUserTeams(teamIds);

            // Fetch team names for each team ID
            const teamNameMap: Record<string, string> = {};
            await Promise.all(
                teamIds.map(async (teamId) => {
                    try {
                        const teamDetails = await client.getTeamDetails(teamId);
                        teamNameMap[teamId] = teamDetails.name || teamId;
                    } catch (error) {
                        console.error(`Failed to fetch team ${teamId}:`, error);
                        teamNameMap[teamId] = teamId; // Fallback to ID
                    }
                })
            );
            setTeamIdToName(teamNameMap);
        } catch (error) {
            console.error("Failed to fetch capsules:", error);
            toast.error("Failed to load capsules");
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchCapsules();
    }, [fetchCapsules]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!searchQuery.trim()) {
                fetchCapsules();
                return;
            }
            const response = await client.searchCapsules({
                summary_query: searchQuery,
                limit: 100
            });
            setCapsules(response.results);
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this capsule?")) return;

        try {
            await client.deleteCapsule(id);
            setCapsules(prev => prev.filter(c => c.capsule_id !== id));
            toast.success("Capsule deleted successfully");
            if (selectedCapsule?.capsule_id === id) {
                setDetailsOpen(false);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete capsule");
        }
    };

    const loadVersions = async (capsule: Capsule) => {
        setLoadingVersions(true);
        try {
            const response = await client.getCapsuleVersions(capsule.capsule_id);
            const sortedVersions = (response.versions || []).sort((a: CapsuleVersion, b: CapsuleVersion) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setVersions(sortedVersions);
        } catch (error) {
            console.error("Failed to load versions:", error);
            toast.error("Failed to load version history");
        } finally {
            setLoadingVersions(false);
        }
    };

    const handleRollback = async (version: CapsuleVersion) => {
        if (!selectedCapsule) return;
        if (!confirm(`Are you sure you want to rollback to this version?`)) return;

        setRollingBack(version.version_id);
        try {
            const result = await client.rollbackCapsule(selectedCapsule.capsule_id, version.version_id);
            toast.success(result.message);

            // Refresh capsules list to update the card's version info
            fetchCapsules();

            // Refresh versions list
            loadVersions(selectedCapsule);

            // Update selected capsule if it's still open
            setSelectedCapsule(prev => prev ? {
                ...prev,
                latest_version_id: result.version_id,
                current_version_number: result.version_number,
                summary: result.summary || prev.summary
            } : null);
        } catch (error) {
            console.error("Rollback failed:", error);
            toast.error("Failed to rollback capsule");
        } finally {
            setRollingBack(null);
        }
    };

    const openDetails = (capsule: Capsule) => {
        setSelectedCapsule(capsule);
        setDetailsOpen(true);
        if ((capsule.version_count || 1) > 1) {
            loadVersions(capsule);
        }
    };

    // Filter capsules based on selected filter
    const filteredCapsules = useMemo(() => {
        if (filterType === "all") return capsules;
        if (filterType === "private") return capsules.filter(c => !c.team || c.team === "");
        // Filter by specific team
        return capsules.filter(c => c.team === filterType);
    }, [capsules, filterType]);

    // Render capsule card content
    const renderCapsuleCard = (capsule: Capsule, index: number) => (
        <motion.div
            key={capsule.capsule_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
            <Card
                className="group relative overflow-hidden cursor-pointer border border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-primary/40 p-6 h-full transition-all duration-300 hover:shadow-2xl"
                onClick={() => openDetails(capsule)}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
                
                {/* Delete Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shadow-lg backdrop-blur-sm"
                        onClick={(e) => handleDelete(capsule.capsule_id, e)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </motion.div>

                <div className="space-y-3 mb-4 relative z-10">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                {capsule.tag || "Untitled"}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="font-medium">{format(new Date(capsule.created_at), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4 relative z-10" />

                <div className="space-y-3.5 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Versions</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20">
                                v{capsule.current_version_number || capsule.version_count || 1}
                            </Badge>
                            {(capsule.version_count || 1) > 1 && (
                                <History className="h-4 w-4 text-primary" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Source</span>
                        <div className="flex items-center gap-2">
                            {(() => {
                                const rawSources = capsule.extracted_from;
                                const sources = rawSources && rawSources.length > 0 
                                    ? (Array.isArray(rawSources) ? rawSources : [rawSources])
                                    : ["tilantra"];

                                return sources.slice(0, 3).map((source, i) => {
                                    const logo = getModelLogo(source);
                                    return logo ? (
                                        <motion.div 
                                            key={i}
                                            className="relative group/logo"
                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <img
                                                src={logo}
                                                alt={source}
                                                className="h-7 w-7 object-contain rounded-lg p-1 bg-background shadow-sm border border-border/50"
                                                title={source}
                                            />
                                        </motion.div>
                                    ) : (
                                        <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 capitalize font-medium">
                                            {source.substring(0, 3)}
                                        </Badge>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Visibility</span>
                        {!capsule.team || capsule.team === "" ? (
                            <Badge variant="secondary" className="text-xs gap-1.5 bg-muted/50 font-medium px-3 py-1">
                                <Lock className="h-3.5 w-3.5" />
                                Private
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium px-3 py-1">
                                {teamIdToName[capsule.team] || capsule.team}
                            </Badge>
                        )}
                    </div>
                </div>

                <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </Card>
        </motion.div>
    );

    // Render different view modes
    const renderCapsulesView = () => {
        if (viewMode === 'grid') {
            return (
                <motion.div 
                    key="grid"
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {filteredCapsules.map((capsule, index) => renderCapsuleCard(capsule, index))}
                </motion.div>
            );
        } else {
            // Table view
            return (
                <motion.div 
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Version</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Visibility</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCapsules.map((capsule, index) => (
                                        <motion.tr
                                            key={capsule.capsule_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b hover:bg-muted/20 cursor-pointer transition-colors"
                                            onClick={() => openDetails(capsule)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{capsule.tag || "Untitled"}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {format(new Date(capsule.created_at), "MMM d, yyyy")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary">v{capsule.current_version_number || 1}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {!capsule.team || capsule.team === "" ? (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Lock className="h-3 w-3" />
                                                        Private
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        {teamIdToName[capsule.team] || capsule.team}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => handleDelete(capsule.capsule_id, e)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            );
        }
    };

    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col gap-4">
                <motion.div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Capsules
                                </span>
                            </h1>
                            <motion.button
                                onClick={() => setShowVideoModal(true)}
                                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <HelpCircle className="h-6 w-6 text-primary" />
                            </motion.button>
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">View and manage your knowledge repositories</p>
                    </div>
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2 flex-wrap">
                        <motion.div 
                            className="relative w-full md:w-80"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search capsules..."
                                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button type="submit" size="default" className="h-11 px-6 shadow-md hover:shadow-lg transition-all">
                                Search
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>

                {/* Filter Section */}
                <motion.div 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                            <Filter className="h-4 w-4 text-primary" />
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[200px] border-0 bg-transparent focus:ring-0">
                                    <SelectValue placeholder="Filter by team" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Capsules</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                    {userTeams.map(teamId => (
                                        <SelectItem key={teamId} value={teamId}>{teamIdToName[teamId] || teamId}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <motion.span 
                            className="text-sm text-muted-foreground font-medium"
                            key={filteredCapsules.length}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''}
                        </motion.span>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
                        <motion.button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Grid View"
                        >
                            <Grid3x3 className={`h-4 w-4 ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </motion.button>
                        <motion.button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Table View"
                        >
                            <Table2 className={`h-4 w-4 ${viewMode === 'table' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col justify-center items-center h-64"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="h-12 w-12 text-primary" />
                        </motion.div>
                        <p className="text-muted-foreground mt-4 font-medium">Loading capsules...</p>
                    </motion.div>
                ) : filteredCapsules.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 rounded-2xl border border-dashed border-primary/30 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                        <motion.div 
                            className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-5 rounded-2xl mb-4 relative z-10"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <img src={CapsuleImage} alt="Capsule" className="h-12 w-12 opacity-70" />
                        </motion.div>
                        <h3 className="text-xl font-semibold relative z-10">No capsules found</h3>
                        <p className="text-muted-foreground mt-2 text-xs relative z-10">Create capsules using the chat interface or extension.</p>
                    </motion.div>
                ) : (
                    renderCapsulesView()
                )}
            </AnimatePresence>

            {/* Feature Video Modal */}
            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <div className="aspect-video">
                        <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(featureVideoUrl)}
                            title="Feature Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Version History Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-visible">
                    <DialogHeader className="px-6 py-5 border-b bg-muted/30">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <DialogTitle className="flex items-center gap-3 text-2xl">
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {selectedCapsule?.tag || "Capsule Details"}
                                    </span>
                                    {selectedCapsule?.team ? (
                                        <Badge variant="secondary" className="font-normal text-xs">
                                            {teamIdToName[selectedCapsule.team] || selectedCapsule.team}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="font-normal text-xs gap-1">
                                            <Lock className="h-3 w-3" />
                                            Private
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Created on {selectedCapsule && format(new Date(selectedCapsule.created_at), "PPP")} by {selectedCapsule?.created_by}
                                </DialogDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setShowBranchView(!showBranchView)}
                            >
                                <History className="h-4 w-4" />
                                {showBranchView ? "List View" : "Branch View"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {(selectedCapsule?.version_count || 1) >= 1 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold">Version History</h3>
                                        <Badge variant="outline">{selectedCapsule?.version_count || 1} versions</Badge>
                                    </div>
                                    {selectedCapsule?.current_version_number && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">
                                            Currently at v{selectedCapsule.current_version_number}
                                        </Badge>
                                    )}
                                </div>

                                {loadingVersions && (selectedCapsule?.version_count || 1) > 1 ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : showBranchView ? (
                                    <div className="p-8 bg-muted/20 rounded-xl border border-dashed min-h-[400px] flex items-center justify-center">
                                        <GitBranchView
                                            versions={versions}
                                            currentVersionId={selectedCapsule?.latest_version_id}
                                            onRollback={handleRollback}
                                            rollingBackId={rollingBack}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(versions.length > 0 ? versions : (selectedCapsule ? [{
                                            version_id: selectedCapsule.latest_version_id,
                                            version_number: selectedCapsule.current_version_number || 1,
                                            capsule_id: selectedCapsule.capsule_id,
                                            created_at: selectedCapsule.created_at,
                                            created_by: selectedCapsule.created_by,
                                            extracted_from: selectedCapsule.extracted_from
                                        } as any] : [])).map((version, index) => (
                                            <Card key={version.version_id} className={`p-4 hover:shadow-md transition-shadow border ${selectedCapsule?.latest_version_id === version.version_id ? 'border-primary/50 bg-primary/5' : ''}`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="default" className="bg-primary/10 text-primary">
                                                                Version {version.version_number || (versions.length - index)}
                                                            </Badge>
                                                            {version.version_id === selectedCapsule?.latest_version_id && (
                                                                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                <span>{format(new Date(version.created_at), "PPP p")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <span className="text-xs font-medium">By:</span>
                                                                <span className="font-medium text-foreground">{version.created_by}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-border/50">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Source</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(() => {
                                                                        const rawSources = version.extracted_from;
                                                                        const sources = rawSources && rawSources.length > 0 
                                                                            ? (Array.isArray(rawSources) ? rawSources : [rawSources])
                                                                            : ["tilantra"];

                                                                        return sources.map((source: string, i: number) => {
                                                                            const logo = getModelLogo(source);
                                                                            return logo ? (
                                                                                <div key={i} className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                                                                                    <img
                                                                                        src={logo}
                                                                                        alt={source}
                                                                                        className="h-4 w-4 object-contain"
                                                                                        title={source}
                                                                                    />
                                                                                    <span className="text-xs capitalize font-medium">{source}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <Badge key={i} variant="outline" className="text-[10px] capitalize">
                                                                                    {source}
                                                                                </Badge>
                                                                            );
                                                                        });
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {version.version_id !== selectedCapsule?.latest_version_id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0"
                                                            onClick={() => handleRollback(version)}
                                                            disabled={rollingBack === version.version_id}
                                                        >
                                                            {rollingBack === version.version_id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            ) : (
                                                                <History className="h-4 w-4 mr-2" />
                                                            )}
                                                            Rollback
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

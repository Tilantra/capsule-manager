import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { CapsuleMetadata, CapsuleVersion } from "@/lib/capsule-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Trash2, Calendar, Filter, History, Lock } from "lucide-react";
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

export default function CapsulesPage() {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [versions, setVersions] = useState<CapsuleVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [filterType, setFilterType] = useState<string>("all");
    const [userTeams, setUserTeams] = useState<string[]>([]);
    const [teamIdToName, setTeamIdToName] = useState<Record<string, string>>({});

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            My Capsules
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage and view your AI context capsules.</p>
                    </div>
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search capsules..."
                                className="pl-9 bg-background/50 border-muted-foreground/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="default">Search</Button>
                    </form>
                </div>

                {/* Filter Section */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[200px] bg-background/50 border-muted-foreground/20">
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
                    <span className="text-sm text-muted-foreground">
                        {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredCapsules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-dashed border-muted-foreground/30">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <img src={CapsuleImage} alt="Capsule" className="h-10 w-10 opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold">No capsules found</h3>
                    <p className="text-muted-foreground mt-1 text-sm">Create capsules using the chat interface or extension.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCapsules.map((capsule) => (
                        <Card
                            key={capsule.capsule_id}
                            className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border bg-gradient-to-br from-card to-card/50 hover:border-primary/40 p-5"
                            onClick={() => openDetails(capsule)}
                        >
                            {/* Delete Button - Top Right */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                                onClick={(e) => handleDelete(capsule.capsule_id, e)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            {/* Header Section */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                            {capsule.tag || "Untitled"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{format(new Date(capsule.created_at), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/50 mb-4" />

                            {/* Content Section */}
                            <div className="space-y-3">
                                {/* Version Count */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Versions</span>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            {capsule.version_count || 1}
                                        </Badge>
                                        {(capsule.version_count || 1) > 1 && (
                                            <History className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {/* Models */}
                                {capsule.extracted_from && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">Models</span>
                                        <div className="flex items-center gap-1.5">
                                            {(Array.isArray(capsule.extracted_from) ? capsule.extracted_from : [capsule.extracted_from]).slice(0, 3).map((source, i) => {
                                                const logo = getModelLogo(source);
                                                return logo ? (
                                                    <div key={i} className="relative group/logo">
                                                        <img
                                                            src={logo}
                                                            alt={source}
                                                            className="h-6 w-6 object-contain transition-all hover:scale-110"
                                                            title={source}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                        {source.substring(0, 3)}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Team/Private */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Visibility</span>
                                    {!capsule.team || capsule.team === "" ? (
                                        <Badge variant="secondary" className="text-xs gap-1 bg-muted/50 font-normal">
                                            <Lock className="h-3 w-3" />
                                            Private
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 font-normal">
                                            {teamIdToName[capsule.team] || capsule.team}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Hover Indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Card>
                    ))}
                </div>
            )}

            {/* Version History Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
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
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {(selectedCapsule?.version_count || 1) >= 1 ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <History className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Version History</h3>
                                    <Badge variant="outline">{selectedCapsule?.version_count || 1} versions</Badge>
                                </div>

                                {loadingVersions && (selectedCapsule?.version_count || 1) > 1 ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(versions.length > 0 ? versions : (selectedCapsule ? [{
                                            version_id: selectedCapsule.latest_version_id,
                                            capsule_id: selectedCapsule.capsule_id,
                                            created_at: selectedCapsule.created_at,
                                            created_by: selectedCapsule.created_by,
                                            extracted_from: selectedCapsule.extracted_from
                                        } as any] : [])).map((version, index) => (
                                            <Card key={version.version_id} className="p-4 hover:shadow-md transition-shadow border">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="default" className="bg-primary/10 text-primary">
                                                                Version {versions.length > 0 ? (versions.length - index) : 1}
                                                            </Badge>
                                                            {index === 0 && (
                                                                <Badge variant="secondary" className="text-xs">Latest</Badge>
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
                                                        {version.extracted_from && (
                                                            <div className="pt-2 border-t border-border/50">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Models</span>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {(Array.isArray(version.extracted_from) ? version.extracted_from : [version.extracted_from]).map((source: string, i: number) => {
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
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
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
        </div>
    );
}

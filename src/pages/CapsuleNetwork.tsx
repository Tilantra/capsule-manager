import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { CapsuleMetadata, CapsuleVersion } from "@/lib/capsule-types";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, Maximize2, History, Calendar, Users, List, Grid2X2, X, ChevronRight, Info, AlertCircle, RefreshCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GitBranchView } from "@/components/GitBranchView";
import { motion, AnimatePresence } from "framer-motion";

import ChatGPTLogo from "@/components/assets/ChatgptLogo.png";
import ClaudeLogo from "@/components/assets/ClaudeLogo.png";
import GeminiLogo from "@/components/assets/GeminiLogo.png";
import DeepSeekLogo from "@/components/assets/DeepseekLogo.png";
import GmailLogo from "@/components/assets/GmailLogo.png";
import GuideraLogo from "@/components/assets/logo-small.jpeg";

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

interface GraphNode {
    id: string;
    name: string;
    type: "team" | "capsule";
    val: number;
    color: string;
    teamId?: string;
    data?: CapsuleMetadata;
    expanded?: boolean;
    x?: number;
    y?: number;
    z?: number;
}

interface GraphLink {
    source: string;
    target: string;
}

export default function CapsuleNetwork() {
    const [loading, setLoading] = useState(true);
    const [rawCapsules, setRawCapsules] = useState<CapsuleMetadata[]>([]);
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [selectedCapsule, setSelectedCapsule] = useState<CapsuleMetadata | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [versions, setVersions] = useState<CapsuleVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [showBranchView, setShowBranchView] = useState(false);
    const [rollingBack, setRollingBack] = useState<string | null>(null);
    const [teamNames, setTeamNames] = useState<Record<string, string>>({});
    const [sidePanelTeam, setSidePanelTeam] = useState<string | null>(null);

    const fgRef = useRef<any>();
    const client = useMemo(() => new BrowserGuideraClient(), []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const capsuleResponse = await client.getUserCapsules(1000, 0);
            const capsules = capsuleResponse.results;
            setRawCapsules(capsules);

            const teams = Array.from(new Set(capsules.map(c => c.team).filter(Boolean))) as string[];
            const teamMap: Record<string, string> = {};

            await Promise.all(teams.map(async (id) => {
                try {
                    const details = await client.getTeamDetails(id);
                    teamMap[id] = details.name || id;
                } catch {
                    teamMap[id] = id;
                }
            }));
            setTeamNames(teamMap);

            if (teams.length <= 2) {
                const initialExpansion = new Set<string>();
                if (capsules.some(c => !c.team)) initialExpansion.add("private");
                if (teams.length > 0) initialExpansion.add(teams[0]);
                setExpandedTeams(initialExpansion);
            }
        } catch (error) {
            console.error("Failed to fetch graph data:", error);
            toast.error("Network sync failed");
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const graphData = useMemo(() => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        const teams = Array.from(new Set(rawCapsules.map(c => c.team).filter(Boolean))) as string[];
        const hasPrivate = rawCapsules.some(c => !c.team);

        teams.forEach(teamId => {
            const isExpanded = expandedTeams.has(teamId);
            nodes.push({
                id: `team-${teamId}`,
                name: teamNames[teamId] || teamId,
                type: "team",
                val: isExpanded ? 45 : 30,
                color: isExpanded ? "#60a5fa" : "#3b82f6",
                teamId: teamId,
                expanded: isExpanded
            });

            if (isExpanded) {
                rawCapsules.filter(c => c.team === teamId).forEach(capsule => {
                    nodes.push({
                        id: capsule.capsule_id,
                        name: capsule.tag || "Untitled",
                        type: "capsule",
                        val: 12,
                        color: "#10b981",
                        teamId: teamId,
                        data: capsule
                    });
                    links.push({ source: `team-${teamId}`, target: capsule.capsule_id });
                });
            }
        });

        if (hasPrivate) {
            const isExpanded = expandedTeams.has("private");
            nodes.push({
                id: "team-private",
                name: "Private Cluster",
                type: "team",
                val: isExpanded ? 45 : 30,
                color: isExpanded ? "#a78bfa" : "#8b5cf6",
                teamId: "private",
                expanded: isExpanded
            });

            if (isExpanded) {
                rawCapsules.filter(c => !c.team).forEach(capsule => {
                    nodes.push({
                        id: capsule.capsule_id,
                        name: capsule.tag || "Untitled",
                        type: "capsule",
                        val: 12,
                        color: "#10b981",
                        teamId: "private",
                        data: capsule
                    });
                    links.push({ source: "team-private", target: capsule.capsule_id });
                });
            }
        }

        return { nodes, links };
    }, [rawCapsules, expandedTeams, teamNames]);

    const handleNodeClick = (node: any) => {
        if (node.type === "capsule" && node.data) {
            openDetails(node.data);
        } else if (node.type === "team") {
            const teamId = node.teamId;
            setExpandedTeams(prev => {
                const next = new Set(prev);
                if (next.has(teamId)) next.delete(teamId);
                else next.add(teamId);
                return next;
            });
            setSidePanelTeam(teamId);

            const distance = 400;
            const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
            fgRef.current.cameraPosition(
                { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
                node,
                1200
            );
        }
    };

    const openDetails = async (capsule: CapsuleMetadata) => {
        setSelectedCapsule(capsule);
        setDetailsOpen(true);
        setLoadingVersions(true);
        try {
            const response = await client.getCapsuleVersions(capsule.capsule_id);
            setVersions(response.versions.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ));
        } catch (error) {
            console.error("Failed to load versions:", error);
            toast.error("Failed to load version history");
        } finally {
            setLoadingVersions(false);
        }
    };

    const handleRollback = async (version: CapsuleVersion) => {
        if (!selectedCapsule) return;
        setRollingBack(version.version_id);
        try {
            await client.rollbackCapsule(selectedCapsule.capsule_id, version.version_id);
            toast.success("Timeline restored");
            setDetailsOpen(false);
            fetchAllData();
        } catch (error) {
            console.error("Rollback failed:", error);
            toast.error("Failed to rollback");
        } finally {
            setRollingBack(null);
        }
    };

    const teamCapsules = useMemo(() => {
        if (!sidePanelTeam) return [];
        return rawCapsules.filter(c => sidePanelTeam === "private" ? !c.team : c.team === sidePanelTeam);
    }, [sidePanelTeam, rawCapsules]);

    return (
        <div className="h-[calc(100vh-120px)] w-full relative overflow-hidden rounded-3xl border border-white/5 bg-[#010409]">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#010409]">
                    <div className="flex flex-col items-center gap-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Syncing Network...</span>
                    </div>
                </div>
            ) : null}

            {/* Controls Overlay */}
            <div className="absolute top-8 left-8 z-10 hidden md:flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 flex items-center gap-6 bg-[#0d1117]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Teams</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Capsules</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => fgRef.current.zoomToFit(1200)}>
                            <Maximize2 className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => fgRef.current.centerAt(0, 0, 0, 1000)}>
                            <Target className="h-4 w-4 text-slate-400" />
                        </Button>
                    </div>
                </motion.div>

                <Card className="p-5 bg-[#0d1117]/60 backdrop-blur-2xl border-white/5 rounded-2xl w-[200px]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Network Status</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center group">
                            <span className="text-xs text-slate-400">Total Nodes</span>
                            <span className="text-sm font-black text-white">{graphData.nodes.length}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-xs text-slate-400">Active Links</span>
                            <span className="text-sm font-black text-white">{graphData.links.length}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeLabel={(node: any) => node.name}
                linkColor={() => "#333333"}
                linkWidth={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.006}
                linkDirectionalParticleColor={() => "#60a5fa"}
                onNodeClick={handleNodeClick}
                backgroundColor="#010409"
                showNavInfo={false}
                nodeThreeObject={(node: any) => {
                    const isTeam = node.type === "team";
                    const nodeColor = new THREE.Color(node.color || "#ffffff");

                    if (isTeam) {
                        const group = new THREE.Group();
                        // Team Sphere
                        const coreMat = new THREE.MeshBasicMaterial({ color: nodeColor });
                        const core = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), coreMat);
                        group.add(core);

                        // Aura Ring
                        const ringMat = new THREE.MeshBasicMaterial({
                            color: nodeColor,
                            transparent: true,
                            opacity: 0.2,
                            wireframe: true
                        });
                        const ring = new THREE.Mesh(new THREE.TorusGeometry(15, 0.4, 8, 32), ringMat);
                        group.add(ring);
                        return group;
                    } else {
                        // Capsule Crystal
                        const crystalMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#10b981") });
                        return new THREE.Mesh(new THREE.OctahedronGeometry(6), crystalMat);
                    }
                }}
            />

            <AnimatePresence>
                {sidePanelTeam && (
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] z-30 bg-[#0d1117]/95 backdrop-blur-3xl border-l border-white/10 p-8 flex flex-col gap-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black italic tracking-tighter text-white">
                                    {sidePanelTeam === "private" ? "PRIVATE_VAULT" : (teamNames[sidePanelTeam] || sidePanelTeam).toUpperCase()}
                                </h3>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">
                                    Cluster Storage • {teamCapsules.length} Units
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSidePanelTeam(null)} className="rounded-xl">
                                <X className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {teamCapsules.map((capsule) => (
                                <Card key={capsule.capsule_id} onClick={() => openDetails(capsule)} className="p-4 bg-white/5 hover:bg-white/10 border-white/5 cursor-pointer group rounded-xl">
                                    <h4 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{capsule.tag || "GENERIC_UNIT"}</h4>
                                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-black uppercase">
                                        <span>{format(new Date(capsule.created_at), "MMM d, yyyy")}</span>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px]">v{capsule.current_version_number || 1}</Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#0d1117] border-white/10 rounded-3xl">
                    <DialogHeader className="px-10 py-8 border-b border-white/5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <DialogTitle className="text-3xl font-black italic tracking-tighter text-white">
                                    {selectedCapsule?.tag || "UNNAMED_ENTITY"}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Synced {selectedCapsule && format(new Date(selectedCapsule.created_at), "PPP").toUpperCase()}
                                </DialogDescription>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black uppercase" onClick={() => setShowBranchView(!showBranchView)}>
                                {showBranchView ? "List View" : "Graph View"}
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-10 py-8">
                        {showBranchView ? (
                            <div className="p-10 bg-black/40 rounded-3xl border border-white/5 min-h-[400px]">
                                <GitBranchView versions={versions} currentVersionId={selectedCapsule?.latest_version_id} onRollback={handleRollback} rollingBackId={rollingBack} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {versions.map((version, index) => (
                                    <Card key={version.version_id} className={`p-6 bg-white/5 border-none group rounded-2xl ${selectedCapsule?.latest_version_id === version.version_id ? 'ring-2 ring-emerald-500/50' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className="bg-white/10 text-white font-black text-[10px]">VER_{version.version_number || (versions.length - index)}</Badge>
                                            {version.version_id === selectedCapsule?.latest_version_id && <span className="text-[9px] font-black text-emerald-400">ACTIVE_NODE</span>}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase space-y-2">
                                            <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {format(new Date(version.created_at), "PPP p")}</div>
                                            <div className="flex items-center gap-2"><Users className="h-3 w-3" /> {version.created_by}</div>
                                        </div>
                                        {version.version_id !== selectedCapsule?.latest_version_id && (
                                            <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/5 text-[10px] font-black uppercase h-10 hover:bg-emerald-600 hover:text-white" onClick={() => handleRollback(version)} disabled={rollingBack === version.version_id}>
                                                {rollingBack === version.version_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revert Path"}
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { CapsuleMetadata, CapsuleVersion, CreateCapsuleResponse, MergeStrategy } from "@/lib/capsule-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Trash2, Calendar, Filter, History, Lock, Grid3x3, Table2, HelpCircle, GitMerge, Check, Plus, GitBranch, Sparkles, ScrollText, GripVertical, Scissors, X } from "lucide-react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import CapsuleImage from "@/components/assets/capsule.png";
import ChatGPTLogo from "@/components/assets/ChatgptLogo.png";
import ClaudeLogo from "@/components/assets/ClaudeLogo.png";
import GeminiLogo from "@/components/assets/GeminiLogo.png";
import DeepSeekLogo from "@/components/assets/DeepseekLogo.png";
import GmailLogo from "@/components/assets/GmailLogo.png";
import GuideraLogo from "@/components/assets/logo-small.jpeg";
import PerplexityLogo from "@/components/assets/PerplexityLogo.png";
import ReplitLogo from "@/components/assets/ReplitLogo.png";
import EmergentLogo from "@/components/assets/EmergentLogo.png";
import LovableLogo from "@/components/assets/LovableLogo.png";
import CopilotLogo from "@/components/assets/CopilotLogo.png";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GitBranchView } from "@/components/GitBranchView";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeExtractedSources } from "@/lib/utils";


interface EnrichedMessage {
  flatIdx: number;
  versionNumber: number;
  versionId: string;
  isCurrentVersion: boolean;
  msg: any;
}

type Capsule = CapsuleMetadata;

function cleanAndFormatText(rawText: string): string {
    if (!rawText) return '';
    let s = rawText.replace(/\\n/g, '\n');
    
    // Only apply aggressive deduplication and formatting if the text looks like a flattened DOM (no newlines, very long)
    if (s.split('\n').length <= 3 && s.length > 100) {
        let prev = '';
        let iterations = 0;
        while (s !== prev && iterations < 5) {
            prev = s;
            s = s.replace(/(.{10,200}?)\s+\1/g, "$1");
            iterations++;
        }
        // Add newlines after punctuation followed by space and capital letter
        s = s.replace(/([.?!])\s+(?=[A-Z])/g, "$1\n\n");
    }
    
    return s;
}

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
    perplexity: PerplexityLogo,
    replit: ReplitLogo,
    emergent: EmergentLogo,
    lovable: LovableLogo,
    copilot: CopilotLogo,
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

function parseBlockFields(body: string): { label: string | null; body: string; bullets: string[] }[] {
    // Detect format: "• **Label**: content" vs "- Label: content"
    const isBoldBulletFormat = /•\s*\*\*[^*]+\*\*\s*:/.test(body);

    if (isBoldBulletFormat) {
        // Split on boundaries where a "•" is followed by "**"
        const chunks = body.split(/(?=•\s*\*\*)/).filter(Boolean);
        return chunks.map(chunk => {
            const m = chunk.match(/^•\s*\*\*([^*]+)\*\*\s*:\s*([\s\S]*)/);
            if (!m) return { label: null, body: chunk.replace(/^•\s*/, '').trim(), bullets: [] };
            const fieldBody = m[2].trim();
            // Nested sub-bullets are "•" NOT followed by "**"
            const subBullets = fieldBody.split(/\s*•\s+(?!\*\*)/).map(s => s.trim()).filter(Boolean);
            return { label: m[1].trim(), body: fieldBody, bullets: subBullets.length > 1 ? subBullets : [] };
        }).filter(f => f.label || f.body);
    }

    // "- Label: content • bullet • bullet" format
    const chunks = body.split(/(?=\s*-\s+[A-Za-z][^:•\n]{1,60}:\s)/);
    return chunks.map(chunk => {
        const m = chunk.match(/^\s*-\s+([^:•\n]{1,60}):\s*([\s\S]*)/);
        if (!m) return { label: null, body: chunk.trim(), bullets: [] as string[] };
        const fieldBody = m[2].trim();
        const bullets = fieldBody.split(/\s*•\s*/).map(s => s.trim()).filter(Boolean);
        return { label: m[1].trim(), body: fieldBody, bullets: bullets.length > 1 ? bullets : [] };
    }).filter(f => f.label || f.body);
}

function renderStructuredSummary(text: string) {
    const cleaned = text.replace(/^\*\*ACTIVE CAPSULE CONTEXT\*\*\s*/i, '').trim();

    if (!cleaned.includes('--- From:')) {
        return <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{cleaned}</p>;
    }

    const segments = cleaned.split(/(---\s*From:[^-]*---)/);
    const blocks: { title: string; body: string }[] = [];
    for (let i = 0; i < segments.length; i++) {
        const m = segments[i].match(/---\s*From:\s*(.*?)\s*---/);
        if (m && i + 1 < segments.length) {
            blocks.push({ title: m[1].trim(), body: segments[i + 1].trim() });
            i++;
        }
    }

    if (blocks.length === 0) {
        return <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{cleaned}</p>;
    }

    return (
        <div className="space-y-5">
            {blocks.map((block, bi) => {
                const fields = parseBlockFields(block.body);
                return (
                    <div key={bi} className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="px-4 py-2.5 bg-primary/10 border-b border-border/50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">From: {block.title}</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {fields.map((field, fi) =>
                                field.label ? (
                                    <div key={fi} className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{field.label}</p>
                                        {field.bullets.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {field.bullets.map((b, bj) => (
                                                    <li key={bj} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                                                        <span className="text-primary shrink-0 mt-0.5 font-bold">•</span>
                                                        <span>{b}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed">{field.body}</p>
                                        )}
                                    </div>
                                ) : field.body ? (
                                    <p key={fi} className="text-sm text-muted-foreground">{field.body}</p>
                                ) : null
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

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
    const [mergeMode, setMergeMode] = useState(false);
    const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set());
    const [mergeModalOpen, setMergeModalOpen] = useState(false);
    const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('new_capsule');
    const [mergeTag, setMergeTag] = useState('');
    const [mergeTeam, setMergeTeam] = useState<string | undefined>(undefined);
    const [merging, setMerging] = useState(false);
    const [includeAttachments, setIncludeAttachments] = useState(false);
    const [showContentView, setShowContentView] = useState(false);
    const [capsuleContent, setCapsuleContent] = useState<EnrichedMessage[]>([]);
    const [capsuleSummary, setCapsuleSummary] = useState<string>('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [contentTab, setContentTab] = useState<'summary' | 'messages'>('messages');
    const [splitDropMessages, setSplitDropMessages] = useState<{ idx: number; enriched: EnrichedMessage }[]>([]);
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    const [splitTag, setSplitTag] = useState('');
    const [splitRemainingTag, setSplitRemainingTag] = useState('');
    const [splitDeleteOriginal, setSplitDeleteOriginal] = useState(false);
    const [splitting, setSplitting] = useState(false);
    const [dragOverDrop, setDragOverDrop] = useState(false);
    const [splitModeActive, setSplitModeActive] = useState(false);
    const [splitIncludeAttachments, setSplitIncludeAttachments] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);

    const client = useMemo(() => new BrowserGuideraClient(), []);

    const selectedCapsuleObjects = useMemo(
        () => capsules.filter(c => selectedForMerge.has(c.capsule_id)),
        [capsules, selectedForMerge]
    );

    const hasAttachments = useMemo(() => {
        return selectedCapsuleObjects.some(c =>
            ((c as any).attachment_count && (c as any).attachment_count > 0) ||
            ((c as any).attachments && (c as any).attachments.length > 0) ||
            ((c as any).attachment_ids && (c as any).attachment_ids.length > 0)
        );
    }, [selectedCapsuleObjects]);

    const splitHasAttachments = useMemo(() => {
        const c = selectedCapsule as any;
        return !!(
            (c?.attachment_count && c.attachment_count > 0) ||
            (c?.attachments && c.attachments.length > 0) ||
            (c?.attachment_ids && c.attachment_ids.length > 0)
        );
    }, [selectedCapsule]);

    const mergeVisibility = useMemo(() => {
        const allPrivate = selectedCapsuleObjects.every(c => !c.team || c.team === '');
        const uniqueTeams = [...new Set(selectedCapsuleObjects.map(c => c.team).filter(Boolean))] as string[];
        const allSameTeam = !allPrivate && uniqueTeams.length === 1 && selectedCapsuleObjects.every(c => c.team === uniqueTeams[0]);
        return { allPrivate, uniqueTeams, allSameTeam, isMixed: !allPrivate && !allSameTeam };
    }, [selectedCapsuleObjects]);

    const fetchCapsules = useCallback(async (options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        if (!silent) setLoading(true);
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
                        teamNameMap[teamId] = teamId;
                    }
                })
            );
            setTeamIdToName(teamNameMap);
        } catch (error) {
            console.error("Failed to fetch capsules:", error);
            if (!silent) toast.error("Failed to load capsules");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchCapsules();
        client.getSingleUser().then(setCurrentUser).catch(console.error);
    }, [fetchCapsules, client]);

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

    const loadCapsuleContent = async (capsule: Capsule) => {
        setLoadingContent(true);
        setShowContentView(true);
        setContentTab('messages');
        try {
            let enriched: EnrichedMessage[] = [];
            let summary = capsule.summary || '';
            const versionCount = capsule.version_count || 1;

            if (versionCount > 1) {
                const versionListResp = await client.getCapsuleVersions(capsule.capsule_id);
                const sortedVersions = (versionListResp.versions || []).sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                const fullVersions = await Promise.all(
                    sortedVersions.map(v => client.getCapsuleVersion(capsule.capsule_id, v.version_id))
                );
                // Build key set for the latest version to determine per-message isCurrentVersion
                const currentVersionKeys = new Set<string>();
                fullVersions.forEach(version => {
                    if (version.version_id === capsule.latest_version_id) {
                        (version.content?.messages || []).forEach(msg => {
                            const contentStrRaw = typeof msg.content === 'string'
                                ? msg.content
                                : Array.isArray(msg.content)
                                    ? msg.content.map((c: any) => typeof c === 'string' ? c : c?.text || '').join('\n\n')
                                    : JSON.stringify(msg.content);
                            const contentStr = cleanAndFormatText(contentStrRaw);
                            currentVersionKeys.add(`${msg.role ?? ''}::${contentStr.trim()}`);
                        });
                    }
                });

                // Consecutive-version delta: each version group shows only messages it newly introduced
                let flatIdx = 0;
                fullVersions.forEach((version, i) => {
                    const msgs: any[] = version.content?.messages || [];
                    const prevMsgKeys = new Set<string>();
                    if (i > 0) {
                        (fullVersions[i - 1].content?.messages || []).forEach((m: any) => {
                            const raw = typeof m.content === 'string'
                                ? m.content
                                : Array.isArray(m.content)
                                    ? m.content.map((c: any) => typeof c === 'string' ? c : c?.text || '').join('\n\n')
                                    : JSON.stringify(m.content);
                            prevMsgKeys.add(`${m.role ?? ''}::${cleanAndFormatText(raw).trim()}`);
                        });
                    }
                    msgs.forEach(msg => {
                        const contentStrRaw = typeof msg.content === 'string'
                            ? msg.content
                            : Array.isArray(msg.content)
                                ? msg.content.map((c: any) => typeof c === 'string' ? c : c?.text || '').join('\n\n')
                                : JSON.stringify(msg.content);
                        const contentStr = cleanAndFormatText(contentStrRaw);
                        const key = `${msg.role ?? ''}::${contentStr.trim()}`;
                        if (!prevMsgKeys.has(key)) {
                            enriched.push({ flatIdx: flatIdx++, versionNumber: version.version_number || 1, versionId: version.version_id, isCurrentVersion: currentVersionKeys.has(key), msg });
                        }
                    });
                    if (version.version_id === capsule.latest_version_id && version.summary) summary = version.summary;
                });
            } else {
                if (!capsule.latest_version_id) {
                    toast.error("No version found for this capsule");
                    setShowContentView(false);
                    return;
                }
                const version = await client.getCapsuleVersion(capsule.capsule_id, capsule.latest_version_id);
                (version.content?.messages || []).forEach((msg, i) => {
                    enriched.push({ flatIdx: i, versionNumber: version.version_number || 1, versionId: capsule.latest_version_id!, isCurrentVersion: true, msg });
                });
                summary = version.summary || capsule.summary || '';
            }

            setCapsuleContent(enriched);
            setCapsuleSummary(summary);
        } catch (error) {
            console.error("Failed to load capsule content:", error);
            toast.error("Failed to load capsule content");
            setShowContentView(false);
        } finally {
            setLoadingContent(false);
        }
    };

    const handleSplit = async () => {
        if (!selectedCapsule || splitDropMessages.length === 0) return;

        const droppedFlatIndices = new Set(splitDropMessages.map(m => m.idx));
        const remainingMsgCount = capsuleContent.filter(m => !droppedFlatIndices.has(m.flatIdx)).length;
        const newCapsulesCreated = 1 + (remainingMsgCount > 0 ? 1 : 0);
        const netNewCapsules = newCapsulesCreated - (splitDeleteOriginal ? 1 : 0);

        if (netNewCapsules > 0) {
            const tier = (currentUser?.tier || 'basic').toLowerCase();
            let limit = Infinity;
            if (tier === 'basic') limit = 5;
            else if (tier === 'pro') limit = 15;

            if (capsules.length + netNewCapsules > limit) {
                setLimitModalOpen(true);
                return;
            }
        }

        setSplitting(true);
        try {
            const orderedDropped = [...splitDropMessages].sort((a, b) => a.idx - b.idx);
            const splitMsgs = orderedDropped.map(m => m.enriched.msg);
            const droppedFlatIndices = new Set(orderedDropped.map(m => m.idx));

            const attachmentIds: string[] = splitIncludeAttachments
                ? ((selectedCapsule as any).attachment_ids || [])
                : [];

            // Step 1: create C2 — the split-messages capsule (required, throws on failure)
            const splitCapsuleResult = await client.createCapsule({
                content: { messages: splitMsgs },
                tag: splitTag.trim() || `${selectedCapsule.tag} (Split)`,
                team: selectedCapsule.team || undefined,
                extracted_from: "tilantra",
                ...(attachmentIds.length > 0 && { attachment_ids: attachmentIds }),
            });

            // Step 2: create C3 — union of all unique messages across all versions minus split messages
            // capsuleContent already contains the full unique message set (consecutive-version delta)
            const remainingMsgs = capsuleContent
                .filter(m => !droppedFlatIndices.has(m.flatIdx))
                .map(m => m.msg);

            let remainingCapsuleResult: CreateCapsuleResponse | null = null;
            if (remainingMsgs.length > 0) {
                try {
                    remainingCapsuleResult = await client.createCapsule({
                        content: { messages: remainingMsgs },
                        tag: splitRemainingTag.trim() || `${selectedCapsule.tag} (Remaining)`,
                        team: selectedCapsule.team || undefined,
                        extracted_from: "tilantra",
                    });
                } catch (c3Err) {
                    // C2 already landed — clean it up before surfacing the error
                    try { await client.deleteCapsule(splitCapsuleResult.capsule_id); } catch {}
                    throw c3Err;
                }
            }

            // Step 3: optionally delete the original capsule C1
            if (splitDeleteOriginal) {
                try {
                    await client.deleteCapsule(selectedCapsule.capsule_id);
                } catch (deleteErr) {
                    console.error('Failed to delete original capsule:', deleteErr);
                    toast.error('Could not delete original capsule', { description: (deleteErr as Error).message });
                }
            }

            // Optimistic UI update
            const splitCapsule: CapsuleMetadata = {
                capsule_id: splitCapsuleResult.capsule_id,
                tag: splitCapsuleResult.tag || splitTag.trim() || `${selectedCapsule.tag} (Split)`,
                created_at: splitCapsuleResult.created_at || new Date().toISOString(),
                created_by: splitCapsuleResult.created_by || selectedCapsule.created_by,
                summary: splitCapsuleResult.summary,
                team: splitCapsuleResult.team || selectedCapsule.team,
                current_version_number: 1,
                version_count: 1,
            };
            const remainingCapsule: CapsuleMetadata | null = remainingCapsuleResult ? {
                capsule_id: remainingCapsuleResult.capsule_id,
                tag: remainingCapsuleResult.tag || splitRemainingTag.trim() || `${selectedCapsule.tag} (Remaining)`,
                created_at: remainingCapsuleResult.created_at || new Date().toISOString(),
                created_by: remainingCapsuleResult.created_by || selectedCapsule.created_by,
                summary: remainingCapsuleResult.summary,
                team: remainingCapsuleResult.team || selectedCapsule.team,
                current_version_number: 1,
                version_count: 1,
            } : null;

            setCapsules(prev => {
                const withoutOriginal = splitDeleteOriginal
                    ? prev.filter(c => c.capsule_id !== selectedCapsule.capsule_id)
                    : prev;
                return [
                    splitCapsule,
                    ...(remainingCapsule ? [remainingCapsule] : []),
                    ...withoutOriginal,
                ];
            });

            // Close all dialogs and reset split state
            setSplitModalOpen(false);
            setSplitDropMessages([]);
            setSplitModeActive(false);
            setSplitIncludeAttachments(false);
            setSplitRemainingTag('');
            setSplitDeleteOriginal(false);
            setShowContentView(false);
            setDetailsOpen(false);
            setSelectedCapsule(null);
            setVersions([]);

            fetchCapsules({ silent: true });

            toast.success('Capsule split successfully', {
                description: [
                    `"${splitCapsule.tag}" created with ${splitMsgs.length} message${splitMsgs.length !== 1 ? 's' : ''}.`,
                    remainingCapsule ? `"${remainingCapsule.tag}" created with ${remainingMsgs.length} message${remainingMsgs.length !== 1 ? 's' : ''}.` : null,
                    splitDeleteOriginal ? `"${selectedCapsule.tag}" deleted.` : null,
                ].filter(Boolean).join(' '),
            });
        } catch (err) {
            toast.error('Split failed', { description: (err as Error).message });
        } finally {
            setSplitting(false);
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
        setShowBranchView(false);
        loadVersions(capsule);
    };

    const handleOpenMergeModal = () => {
        const objs = capsules.filter(c => selectedForMerge.has(c.capsule_id));
        // const allPrivate = objs.every(c => !c.team || c.team === '');
        const uniqueTeams = [...new Set(objs.map(c => c.team).filter(Boolean))] as string[];
        const allSameTeam = uniqueTeams.length === 1 && objs.every(c => c.team === uniqueTeams[0]);
        if (allSameTeam) {
            setMergeTeam(uniqueTeams[0]);
        } else {
            setMergeTeam(undefined);
        }
        setMergeTag(objs.map(c => c.tag || 'Untitled').join(' + '));
        setMergeStrategy('new_capsule');
        setMergeModalOpen(true);
    };

    const handleMerge = async () => {
        if (mergeStrategy === 'new_capsule') {
            const tier = (currentUser?.tier || 'basic').toLowerCase();
            let limit = Infinity;
            if (tier === 'basic') limit = 5;
            else if (tier === 'pro') limit = 15;

            if (capsules.length >= limit) {
                setLimitModalOpen(true);
                return;
            }
        }
        setMerging(true);
        try {
            const selectedObjects = capsules.filter(c => selectedForMerge.has(c.capsule_id));
            const effectiveTag = mergeTag || selectedObjects.map(c => c.tag || 'Untitled').join(' + ');
            /*
            const optimisticExtractedFrom = [...new Set(
                selectedObjects.flatMap(c =>
                    Array.isArray(c.extracted_from)
                        ? c.extracted_from
                        : c.extracted_from ? [c.extracted_from] : []
                )
            )];
            */
            const result = await client.mergeCapsules(
                selectedObjects,
                mergeStrategy,
                effectiveTag,
                mergeTeam,
                includeAttachments
            );
            if (mergeStrategy === 'new_capsule') {
                const newCapsule: CapsuleMetadata = {
                    capsule_id: result.capsule_id,
                    tag: result.tag || effectiveTag,
                    created_at: result.created_at || new Date().toISOString(),
                    created_by: result.created_by || selectedObjects[0]?.created_by || '',
                    summary: result.summary,
                    team: result.team,
                    latest_version_id: result.version_id,
                    current_version_number: result.version_number,
                    version_count: 1,
                    is_merged: true,
                    merged_from_capsule_ids: result.merged_from_capsule_ids,
                    extracted_from: normalizeExtractedSources(result.extracted_from),
                };
                setCapsules(prev => [newCapsule, ...prev]);
            } else {
                setCapsules(prev => prev.map(c =>
                    c.capsule_id === result.capsule_id
                        ? {
                            ...c,
                            current_version_number: result.version_number,
                            version_count: (c.version_count || 1) + 1,
                            latest_version_id: result.version_id,
                        }
                        : c
                ));
            }
            setMergeModalOpen(false);
            setMergeMode(false);
            setSelectedForMerge(new Set());
            toast.success(
                mergeStrategy === 'new_capsule'
                    ? `"${effectiveTag}" created`
                    : `"${effectiveTag}" updated`,
                { description: 'Merged capsule is ready to use.' }
            );
        } catch (err) {
            toast.error('Merge failed', { description: (err as Error).message });
        } finally {
            setMerging(false);
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
    const renderCapsuleCard = (capsule: Capsule, index: number) => {
        const isSelected = selectedForMerge.has(capsule.capsule_id);

        const handleCardClick = () => {
            if (mergeMode) {
                setSelectedForMerge(prev => {
                    const next = new Set(prev);
                    if (next.has(capsule.capsule_id)) {
                        next.delete(capsule.capsule_id);
                    } else {
                        next.add(capsule.capsule_id);
                    }
                    return next;
                });
            } else {
                openDetails(capsule);
            }
        };

        return (
            <motion.div
                key={capsule.capsule_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
                <Card
                    className={`group relative overflow-hidden cursor-pointer border p-6 h-full transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-card via-card to-card/50 ${mergeMode && isSelected
                            ? 'border-primary/70 ring-2 ring-primary/30'
                            : 'border-border/50 hover:border-primary/40'
                        }`}
                    onClick={handleCardClick}
                >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

                    {/* Delete Button or Merge Checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                        {mergeMode ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`h-6 w-6 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-muted-foreground/50 bg-background/80'
                                    }`}
                            >
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className="opacity-0 group-hover:opacity-100 transition-all"
                            >
                                {((capsule.created_by || "").trim() === (currentUser?.username || "").trim() || (capsule.created_by || "").trim() === (currentUser?.email || "").trim()) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shadow-lg backdrop-blur-sm"
                                        onClick={(e) => handleDelete(capsule.capsule_id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </motion.div>
                        )}
                    </div>

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
                                {capsule.is_merged && (
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium text-purple-600 border-purple-500/30 bg-purple-500/10 gap-1">
                                        <GitMerge className="h-3 w-3" />
                                        Merged
                                    </Badge>
                                )}
                                {normalizeExtractedSources(capsule.extracted_from).slice(0, 3).map((source, i) => {
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
                                })}
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
    };

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
            // Table view (switches to card stack on mobile)
            return (
                <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Mobile fallback card stack */}
                    <div className="md:hidden grid grid-cols-1 gap-6 mb-6">
                        {filteredCapsules.map((capsule, index) => renderCapsuleCard(capsule, index))}
                    </div>
                    {/* Desktop table view */}
                    <Card className="hidden md:block overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30 border-b">
                                    <tr>
                                        {mergeMode && (
                                            <th className="px-4 py-4 w-10">
                                                <span className="sr-only">Select</span>
                                            </th>
                                        )}
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Source</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Version</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Team</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCapsules.map((capsule, index) => {
                                        const isSelected = selectedForMerge.has(capsule.capsule_id);
                                        const handleTableRowClick = () => {
                                            if (mergeMode) {
                                                setSelectedForMerge(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(capsule.capsule_id)) next.delete(capsule.capsule_id);
                                                    else next.add(capsule.capsule_id);
                                                    return next;
                                                });
                                            } else {
                                                openDetails(capsule);
                                            }
                                        };
                                        return (
                                            <motion.tr
                                                key={capsule.capsule_id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className={`border-b cursor-pointer transition-colors ${mergeMode && isSelected
                                                        ? 'bg-primary/8 hover:bg-primary/12'
                                                        : 'hover:bg-muted/20'
                                                    }`}
                                                onClick={handleTableRowClick}
                                            >
                                                {mergeMode && (
                                                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                                                        <motion.div
                                                            onClick={() => {
                                                                setSelectedForMerge(prev => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(capsule.capsule_id)) next.delete(capsule.capsule_id);
                                                                    else next.add(capsule.capsule_id);
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected
                                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                                    : 'border-muted-foreground/50 bg-background hover:border-primary/70'
                                                                }`}
                                                            whileHover={{ scale: 1.15 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            {isSelected && <Check className="h-3 w-3" />}
                                                        </motion.div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className={`font-medium ${mergeMode && isSelected ? 'text-primary' : ''}`}>{capsule.tag || "Untitled"}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {capsule.is_merged && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-medium text-purple-600 border-purple-500/30 bg-purple-500/10 gap-1">
                                                                <GitMerge className="h-3 w-3" />
                                                            </Badge>
                                                        )}
                                                        {normalizeExtractedSources(capsule.extracted_from).slice(0, 3).map((source, i) => {
                                                                const logo = getModelLogo(source);
                                                                return logo ? (
                                                                    <img
                                                                        key={i}
                                                                        src={logo}
                                                                        alt={source}
                                                                        className="h-6 w-6 object-contain rounded p-0.5 bg-background shadow-sm border border-border/50"
                                                                        title={source}
                                                                    />
                                                                ) : (
                                                                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 capitalize font-medium">
                                                                        {source.substring(0, 3)}
                                                                    </Badge>
                                                                );
                                                        })}
                                                    </div>
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
                                                    {((capsule.created_by || "").trim() === (currentUser?.username || "").trim() || (capsule.created_by || "").trim() === (currentUser?.email || "").trim()) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(capsule.capsule_id, e); }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
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
                                    Capsule Hub
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
                        <p className="text-muted-foreground mt-2 text-sm">View and Manage your Context Capsules</p>
                    </div>
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                        <motion.div
                            className="relative flex-1 md:w-80 md:flex-none"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search capsules..."
                                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all w-full"
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

                    {/* View Toggle + Merge Mode */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* View toggle — labeled & visually prominent */}
                        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border shadow-sm">
                            <motion.button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                    }`}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                title="Grid View"
                            >
                                <Grid3x3 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Grid</span>
                            </motion.button>
                            <motion.button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table'
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                    }`}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                title="Table View"
                            >
                                <Table2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Table</span>
                            </motion.button>
                        </div>

                        {/* Merge / Cancel button */}
                        <AnimatePresence mode="wait">
                            {mergeMode ? (
                                <motion.div
                                    key="cancel"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 font-semibold"
                                        onClick={() => { setMergeMode(false); setSelectedForMerge(new Set()); }}
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="merge"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="relative inline-block">
                                        <Button
                                            size="sm"
                                            className="h-9 px-4 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30 border-0"
                                            onClick={() => setMergeMode(true)}
                                        >
                                            <GitMerge className="h-4 w-4" />
                                            Merge Capsules
                                        </Button>
                                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-foreground text-[8px] font-bold text-background border border-foreground/10 rounded uppercase tracking-wider leading-none pointer-events-none select-none">
                                            Beta
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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

            {/* Merge Mode Floating Action Bar */}
            <AnimatePresence>
                {mergeMode && (
                    <div className="fixed bottom-[5.5rem] md:bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-background border border-border/70 shadow-2xl pointer-events-auto"
                        >
                            <span className="text-sm font-medium text-muted-foreground">
                                {selectedForMerge.size} capsule{selectedForMerge.size !== 1 ? 's' : ''} selected
                            </span>
                            <Button
                                size="sm"
                                disabled={selectedForMerge.size < 2}
                                onClick={handleOpenMergeModal}
                                className="gap-2"
                            >
                                <GitMerge className="h-4 w-4" />
                                Merge
                            </Button>
                        </motion.div>
                    </div>
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

            {/* Merge Modal */}
            <Dialog open={mergeModalOpen} onOpenChange={setMergeModalOpen}>
                <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/5 px-6 pt-6 pb-5 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-inner shrink-0">
                                <GitMerge className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-left">Merge Capsules</DialogTitle>
                                <DialogDescription className="text-sm text-left mt-0.5">
                                    Combine summaries into one unified context capsule.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[62vh] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 scrollbar-thin"
                        style={{ scrollbarColor: 'hsl(var(--muted-foreground) / 0.2) transparent' }}
                    >

                        {/* Merging */}
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Capsules being merged</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedCapsuleObjects.map((c, i) => (
                                    <div key={c.capsule_id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
                                        <span className="h-4 w-4 rounded-full bg-primary/30 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
                                        {c.tag || 'Untitled'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Strategy */}
                        <div className="space-y-2.5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Merge strategy</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMergeStrategy('new_capsule')}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${mergeStrategy === 'new_capsule'
                                            ? 'border-primary bg-gradient-to-br from-primary/10 to-purple-500/5 shadow-sm'
                                            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                                        }`}
                                >
                                    {mergeStrategy === 'new_capsule' && (
                                        <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                        </div>
                                    )}
                                    <Plus className={`h-5 w-5 mb-2 ${mergeStrategy === 'new_capsule' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div className="font-semibold text-sm">New capsule</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Create a brand-new combined capsule</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMergeStrategy('append_version')}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${mergeStrategy === 'append_version'
                                            ? 'border-primary bg-gradient-to-br from-primary/10 to-purple-500/5 shadow-sm'
                                            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                                        }`}
                                >
                                    {mergeStrategy === 'append_version' && (
                                        <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                        </div>
                                    )}
                                    <GitBranch className={`h-5 w-5 mb-2 ${mergeStrategy === 'append_version' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div className="font-semibold text-sm">Append version</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Add to the first capsule's history</div>
                                </button>
                            </div>
                        </div>

                        {/* Name input */}
                        {mergeStrategy === 'new_capsule' && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Capsule name</p>
                                <Input
                                    id="merge-tag"
                                    value={mergeTag}
                                    onChange={e => setMergeTag(e.target.value)}
                                    placeholder="e.g. Combined context"
                                    className="bg-muted/20 border-border/60 focus:border-primary/50"
                                />
                            </div>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Visibility */}
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Visibility</p>
                            {mergeVisibility.allPrivate ? (
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5 shrink-0" />
                                    <span>Merged capsule will be <span className="font-semibold text-foreground">private</span></span>
                                </div>
                            ) : mergeVisibility.allSameTeam ? (
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                    <span className="text-muted-foreground">Shared with <span className="font-semibold text-blue-400">{teamIdToName[mergeVisibility.uniqueTeams[0]] || mergeVisibility.uniqueTeams[0]}</span></span>
                                </div>
                            ) : (
                                <Select value={mergeTeam ?? '__private__'} onValueChange={v => setMergeTeam(v === '__private__' ? undefined : v)}>
                                    <SelectTrigger className="bg-muted/20 border-border/60">
                                        <SelectValue placeholder="Choose visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__private__">
                                            <span className="flex items-center gap-2">
                                                <Lock className="h-3.5 w-3.5" />
                                                Private
                                            </span>
                                        </SelectItem>
                                        {mergeVisibility.uniqueTeams.map(teamId => (
                                            <SelectItem key={teamId} value={teamId}>
                                                {teamIdToName[teamId] || teamId}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {hasAttachments && (
                            <>
                                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Attachments</p>
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={includeAttachments}
                                                onChange={e => setIncludeAttachments(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="h-5 w-5 rounded border-2 border-border/60 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                <Check className={`h-3.5 w-3.5 text-primary-foreground ${includeAttachments ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground">Include attachments from selected capsules</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Preview */}
                        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80">What will happen</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mergeStrategy === 'new_capsule' ? (
                                    <>
                                        Creates a new capsule combining the summaries of{' '}
                                        <span className="font-semibold text-foreground">
                                            {selectedCapsuleObjects.map(c => c.tag || 'Untitled').join(' and ')}
                                        </span>
                                        . Drop it into any AI platform to get combined context from {selectedCapsuleObjects.length > 2 ? 'all sources' : 'both'}.
                                    </>
                                ) : (
                                    <>
                                        Appends the context of{' '}
                                        <span className="font-semibold text-foreground">
                                            {selectedCapsuleObjects.slice(1).map(c => c.tag || 'Untitled').join(' and ')}
                                        </span>
                                        {' '}as a new version of{' '}
                                        <span className="font-semibold text-foreground">
                                            {selectedCapsuleObjects[0]?.tag || 'Untitled'}
                                        </span>
                                        . The original capsule's history is preserved.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/10">
                        <Button variant="ghost" onClick={() => setMergeModalOpen(false)} disabled={merging} className="text-muted-foreground hover:text-foreground">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMerge}
                            disabled={merging}
                            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md shadow-primary/25 px-6 font-semibold"
                        >
                            {merging ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <GitMerge className="h-4 w-4" />
                            )}
                            {merging ? 'Merging...' : 'Merge Capsules'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Version History Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-4xl w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col p-0 overflow-visible">
                    <DialogHeader className="px-6 py-5 border-b bg-muted/30">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="space-y-2 w-full pr-6 md:pr-0">
                                <DialogTitle className="flex flex-wrap items-center gap-3 text-xl md:text-2xl">
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-all">
                                        {selectedCapsule?.tag || "Capsule Details"}
                                    </span>
                                    {selectedCapsule?.team ? (
                                        <Badge variant="secondary" className="font-normal text-xs shrink-0">
                                            {teamIdToName[selectedCapsule.team] || selectedCapsule.team}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="font-normal text-xs gap-1 shrink-0">
                                            <Lock className="h-3 w-3" />
                                            Private
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm">
                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                    <span>Created on {selectedCapsule && format(new Date(selectedCapsule.created_at), "PPP")} by <span className="font-medium text-foreground/90">{selectedCapsule?.created_by}</span></span>
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2 mr-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                                    onClick={() => selectedCapsule && loadCapsuleContent(selectedCapsule)}
                                >
                                    <ScrollText className="h-4 w-4" />
                                    Inspect
                                </Button>
                                <Button
                                    variant={showBranchView ? "outline" : "default"}
                                    size="sm"
                                    className={`gap-2 transition-all ${!showBranchView ? 'shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                                    onClick={() => setShowBranchView(!showBranchView)}
                                >
                                    {showBranchView ? <History className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
                                    {showBranchView ? "List View" : "Graph View"}
                                </Button>
                            </div>
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

                                {loadingVersions ? (
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
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                                                                    {normalizeExtractedSources(version.extracted_from).map((source: string, i: number) => {
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
                                                    </div>

                                                    {version.version_id !== selectedCapsule?.latest_version_id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0 w-full sm:w-auto"
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
            <Dialog
                open={showContentView}
                onOpenChange={(open) => {
                    setShowContentView(open);
                    if (!open) { setSplitDropMessages([]); setSplitModeActive(false); }
                }}
            >
                <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
                        <DialogTitle className="text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {selectedCapsule?.tag}
                        </DialogTitle>
                        <DialogDescription className="mt-0.5">
                            {capsuleContent.filter(m => m.isCurrentVersion).length} messages in current version
                            {(selectedCapsule?.version_count || 1) > 1 && ` · ${capsuleContent.length} total across all versions`}
                            {contentTab === 'messages' && splitModeActive && ' · select/drag messages to split zone'}
                        </DialogDescription>
                        <div className="flex items-center justify-end mt-3">
                            <div className="flex items-center gap-2">
                                {contentTab === 'messages' && (
                                    <div className="relative inline-block">
                                        <Button
                                            size="sm"
                                            onClick={() => { setSplitModeActive(v => !v); setSplitDropMessages([]); }}
                                            className={splitModeActive
                                                ? 'h-9 px-4 gap-2 font-semibold border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground shadow-none'
                                                : 'h-9 px-4 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30 border-0'
                                            }
                                        >
                                            <Scissors className="h-4 w-4" />
                                            {splitModeActive ? 'Exit Split' : 'Split'}
                                        </Button>
                                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-foreground text-[8px] font-bold text-background border border-foreground/10 rounded uppercase tracking-wider leading-none pointer-events-none select-none">
                                            Beta
                                        </span>
                                    </div>
                                )}
                                {splitDropMessages.length > 0 && contentTab === 'messages' && splitModeActive && (
                                    <Button
                                        size="sm"
                                        className="h-9 px-4 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30 border-0"
                                        onClick={() => {
                                            setSplitTag(`${selectedCapsule?.tag || 'Capsule'} (Split)`);
                                            setSplitModalOpen(true);
                                        }}
                                    >
                                        <Scissors className="h-4 w-4" />
                                        Split ({splitDropMessages.length} msg{splitDropMessages.length !== 1 ? 's' : ''})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
                        {/* Main content panel */}
                        <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {loadingContent ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Loading{(selectedCapsule?.version_count || 1) > 1 ? ' across all versions' : ''}…</p>
                                </div>
                            ) : capsuleContent.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-12">No messages found.</p>
                            ) : (() => {
                                const groups: { versionNumber: number; versionId: string; isCurrent: boolean; items: EnrichedMessage[] }[] = [];
                                capsuleContent.forEach(item => {
                                    const last = groups[groups.length - 1];
                                    if (last && last.versionId === item.versionId) {
                                        last.items.push(item);
                                    } else {
                                        groups.push({ versionNumber: item.versionNumber, versionId: item.versionId, isCurrent: item.versionId === selectedCapsule?.latest_version_id, items: [item] });
                                    }
                                });

                                // If the latest version has no new messages (e.g. a split that only removed),
                                // still render its separator so it appears as Current
                                const latestVid = selectedCapsule?.latest_version_id;
                                if (latestVid && !groups.some(g => g.versionId === latestVid)) {
                                    groups.push({
                                        versionNumber: selectedCapsule?.current_version_number ?? groups.length + 1,
                                        versionId: latestVid,
                                        isCurrent: true,
                                        items: [],
                                    });
                                }

                                return (
                                    <div className="space-y-8">
                                        {groups.map(group => (
                                            <div key={group.versionId}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                        group.isCurrent
                                                            ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                                            : 'bg-muted/50 text-muted-foreground border-border/50'
                                                    }`}>
                                                        <History className="h-3 w-3" />
                                                        Version {group.versionNumber}
                                                        {group.isCurrent && <span className="ml-1">· Current</span>}
                                                    </div>
                                                    <div className="flex-1 h-px bg-border/40" />
                                                    <span className="text-[10px] text-muted-foreground/50">{group.items.length} message{group.items.length !== 1 ? 's' : ''}</span>
                                                </div>

                                                {group.items.length === 0 && (
                                                    <p className="text-xs text-muted-foreground/50 italic px-1">No new messages in this version.</p>
                                                )}

                                                <div className="space-y-3">
                                                    {group.items.map(item => {
                                                        const alreadyDropped = splitDropMessages.some(m => m.idx === item.flatIdx);
                                                        const rawText = typeof item.msg.content === 'string'
                                                            ? item.msg.content
                                                            : Array.isArray(item.msg.content)
                                                                ? item.msg.content.map((c: any) => typeof c === 'string' ? c : c?.text || '').join('\n\n')
                                                                : JSON.stringify(item.msg.content);
                                                        const msgText = cleanAndFormatText(rawText);

                                                        return (
                                                            <div
                                                                key={item.flatIdx}
                                                                draggable={splitModeActive && !alreadyDropped}
                                                                onDragStart={(e) => {
                                                                    e.dataTransfer.setData('flatIdx', item.flatIdx.toString());
                                                                    e.dataTransfer.effectAllowed = 'copy';
                                                                }}
                                                                className={`flex items-start gap-2 p-4 rounded-xl border transition-all ${
                                                                    alreadyDropped
                                                                        ? 'opacity-60 border-dashed border-violet-500/40 bg-violet-500/5 cursor-pointer hover:border-violet-500/60'
                                                                        : item.msg.role === 'user'
                                                                            ? `bg-primary/5 border-primary/15 mr-8 ${splitModeActive ? 'cursor-pointer hover:border-primary/30 hover:shadow-sm' : ''}`
                                                                            : `bg-muted/30 border-border/40 ml-8 ${splitModeActive ? 'cursor-pointer hover:border-border/60 hover:shadow-sm' : ''}`
                                                                }`}
                                                                onClick={() => {
                                                                    if (splitModeActive) {
                                                                        setSplitDropMessages(prev => {
                                                                            const exists = prev.some(m => m.idx === item.flatIdx);
                                                                            if (exists) {
                                                                                return prev.filter(m => m.idx !== item.flatIdx);
                                                                            } else {
                                                                                return [...prev, { idx: item.flatIdx, enriched: item }];
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                {splitModeActive && (
                                                                    <div className="mr-2 mt-0.5 shrink-0">
                                                                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                                                                            alreadyDropped
                                                                                ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                                                                                : 'border-muted-foreground/30 bg-background hover:border-violet-500'
                                                                        }`}>
                                                                            {alreadyDropped ? (
                                                                                <Check className="h-3.5 w-3.5" />
                                                                            ) : (
                                                                                splitModeActive && !alreadyDropped && (
                                                                                    <GripVertical className="h-3 w-3 text-muted-foreground/45" />
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                        <Badge
                                                                            variant={item.msg.role === 'user' ? 'default' : 'secondary'}
                                                                            className="text-[10px] capitalize px-2 py-0"
                                                                        >
                                                                            {item.msg.role || 'unknown'}
                                                                        </Badge>
                                                                        {!group.isCurrent && (
                                                                            <span className="text-[9px] text-muted-foreground/40 font-medium uppercase tracking-wider">Historical</span>
                                                                        )}
                                                                        {alreadyDropped && (
                                                                            <span className="text-[9px] text-violet-500 font-medium">→ In split zone</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                                                                        {msgText}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Split drop zone — only visible when split mode is active */}
                        {contentTab === 'messages' && splitModeActive && (
                            <div
                                className={`w-full md:w-72 h-64 md:h-auto shrink-0 border-t md:border-t-0 md:border-l flex flex-col transition-colors duration-200 ${
                                    dragOverDrop ? 'bg-violet-500/10' : 'bg-muted/10'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOverDrop(true); }}
                                onDragLeave={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDrop(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverDrop(false);
                                    const flatIdx = parseInt(e.dataTransfer.getData('flatIdx'), 10);
                                    if (!isNaN(flatIdx) && !splitDropMessages.some(m => m.idx === flatIdx)) {
                                        const target = capsuleContent.find(m => m.flatIdx === flatIdx);
                                        if (target) setSplitDropMessages(prev => [...prev, { idx: flatIdx, enriched: target }]);
                                    }
                                }}
                            >
                                <div className={`p-4 border-b shrink-0 transition-colors ${dragOverDrop ? 'border-violet-500/30' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg transition-colors ${dragOverDrop ? 'bg-violet-500/20' : 'bg-muted/50'}`}>
                                            <Scissors className={`h-4 w-4 transition-colors ${dragOverDrop ? 'text-violet-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">New Capsule Zone</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {splitDropMessages.length > 0
                                                    ? `${splitDropMessages.length} message${splitDropMessages.length !== 1 ? 's' : ''} selected`
                                                    : 'Select or drop messages'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {splitDropMessages.length === 0 ? (
                                        <div className={`min-h-[120px] md:min-h-[180px] h-full flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed transition-all ${
                                            dragOverDrop ? 'border-violet-500/60 bg-violet-500/5 scale-[1.02]' : 'border-border/30'
                                        }`}>
                                            <Scissors className={`h-8 w-8 mb-2 transition-colors ${dragOverDrop ? 'text-violet-500' : 'text-muted-foreground/30'}`} />
                                            <p className={`text-xs font-medium transition-colors ${dragOverDrop ? 'text-violet-500' : 'text-muted-foreground/50'}`}>
                                                {dragOverDrop ? 'Release to add' : 'Select or drag messages here'}
                                            </p>
                                        </div>
                                    ) : (
                                        splitDropMessages.map(({ idx, enriched }, i) => {
                                            const rawText = typeof enriched.msg.content === 'string'
                                                ? enriched.msg.content
                                                : Array.isArray(enriched.msg.content)
                                                    ? enriched.msg.content.map((c: any) => typeof c === 'string' ? c : c?.text || '').join('\n\n')
                                                    : JSON.stringify(enriched.msg.content);
                                            const msgText = cleanAndFormatText(rawText);
                                            return (
                                                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/20 group">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                            <Badge variant={enriched.msg.role === 'user' ? 'default' : 'secondary'} className="text-[9px] capitalize px-1.5 py-0">
                                                                {enriched.msg.role || 'unknown'}
                                                            </Badge>
                                                            <span className="text-[9px] text-violet-400/70 font-medium">v{enriched.versionNumber}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">{msgText}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSplitDropMessages(prev => prev.filter((_, j) => j !== i))}
                                                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 hover:text-destructive mt-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {splitDropMessages.length > 0 && (
                                    <div className="p-3 border-t shrink-0">
                                        <Button
                                            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-500/30 font-semibold"
                                            size="sm"
                                            onClick={() => {
                                                setSplitTag(`${selectedCapsule?.tag || 'Capsule'} (Split)`);
                                                setSplitModalOpen(true);
                                            }}
                                        >
                                            <Scissors className="h-4 w-4" />
                                            Split into New Capsule
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={splitModalOpen} onOpenChange={(open) => { setSplitModalOpen(open); if (!open) { setSplitIncludeAttachments(false); setSplitRemainingTag(''); setSplitDeleteOriginal(false); } }}>
                <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/5 px-6 pt-6 pb-5 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-inner shrink-0">
                                <Scissors className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-left">Split Capsule</DialogTitle>
                                <DialogDescription className="text-sm text-left mt-0.5">
                                    {splitDropMessages.length} message{splitDropMessages.length !== 1 ? 's' : ''} will be extracted into a new capsule
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="split-tag" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Split Capsule Name
                            </Label>
                            <Input
                                id="split-tag"
                                value={splitTag}
                                onChange={e => setSplitTag(e.target.value)}
                                placeholder={`${selectedCapsule?.tag} (Split)`}
                                className="bg-muted/20 border-border/60 focus:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="split-remaining-tag" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Remaining Capsule Name
                            </Label>
                            <Input
                                id="split-remaining-tag"
                                value={splitRemainingTag}
                                onChange={e => setSplitRemainingTag(e.target.value)}
                                placeholder={`${selectedCapsule?.tag} (Remaining)`}
                                className="bg-muted/20 border-border/60 focus:border-primary/50"
                            />
                        </div>

                        {splitHasAttachments && (
                            <>
                                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Attachments</p>
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={splitIncludeAttachments}
                                                onChange={e => setSplitIncludeAttachments(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="h-5 w-5 rounded border-2 border-border/60 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                <Check className={`h-3.5 w-3.5 text-primary-foreground ${splitIncludeAttachments ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground">Include attachments in the split capsule</span>
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={splitDeleteOriginal}
                                    onChange={e => setSplitDeleteOriginal(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="h-5 w-5 rounded border-2 border-border/60 bg-background peer-checked:bg-red-500 peer-checked:border-red-500 transition-all flex items-center justify-center">
                                    <Check className={`h-3.5 w-3.5 text-white ${splitDeleteOriginal ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                                </div>
                            </div>
                            <span className="text-sm text-foreground">Delete original capsule after splitting</span>
                        </label>

                        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 p-4 space-y-2.5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80">What will happen</span>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>
                                        A new capsule <span className="font-semibold text-foreground">"{splitTag || `${selectedCapsule?.tag} (Split)`}"</span> will be created with{' '}
                                        <span className="font-semibold text-foreground">{splitDropMessages.length} message{splitDropMessages.length !== 1 ? 's' : ''}</span>.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>
                                        A new capsule <span className="font-semibold text-foreground">"{splitRemainingTag || `${selectedCapsule?.tag} (Remaining)`}"</span> will be created with{' '}
                                        <span className="font-semibold text-foreground">
                                            {capsuleContent.length - splitDropMessages.length} message{(capsuleContent.length - splitDropMessages.length) !== 1 ? 's' : ''}
                                        </span> (all unique messages across all versions).
                                    </span>
                                </div>
                                {capsuleContent.length - splitDropMessages.length === 0 && (
                                    <div className="flex items-start gap-2 text-red-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <span>All messages are in the split zone — nothing left for the remaining capsule.</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${splitDeleteOriginal ? 'bg-red-500' : 'bg-muted-foreground/40'}`} />
                                    <span className={splitDeleteOriginal ? 'text-red-400' : ''}>
                                        <span className="font-semibold text-foreground">"{selectedCapsule?.tag}"</span>{' '}
                                        {splitDeleteOriginal ? 'will be deleted.' : 'will be kept as-is.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/10">
                        <Button variant="ghost" onClick={() => setSplitModalOpen(false)} disabled={splitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSplit}
                            disabled={splitting || !splitTag.trim() || !splitRemainingTag.trim() || capsuleContent.length - splitDropMessages.length === 0}
                            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-md shadow-primary/25 px-6 font-semibold"
                        >
                            {splitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                            {splitting ? 'Splitting...' : 'Confirm Split'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Limit Reached Modal */}
            <Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-amber-400 text-xl font-bold">Limit Reached</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-sm leading-relaxed pt-1">
                        Capsule creation limit reached. Please upgrade your tier to proceed.
                    </DialogDescription>
                    <DialogFooter className="flex gap-2 sm:justify-end pt-2">
                        <Button variant="outline" onClick={() => setLimitModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                window.open('https://capsulehub.tilantra.com/billing', '_blank');
                                setLimitModalOpen(false);
                            }}
                            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                        >
                            Upgrade Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

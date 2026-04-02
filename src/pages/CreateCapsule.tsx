import { useState, useRef, useEffect, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Plus, ArrowLeft, Settings, Send, Paperclip, MessageSquarePlus } from "lucide-react";
import { CapsuleGraph } from "@/components/CapsuleGraph";
import { clearCapsuleDraft, loadCapsuleDraft } from "@/lib/capsule-draft";

interface AttachedFile {
    id: string;
    file: File;
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
}

interface Chunk {
    id: string;
    text: string;
    createdAt: Date;
}

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export default function CreateCapsule() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const client = useMemo(() => new BrowserGuideraClient(), []);
    
    // Metadata State
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [team, setTeam] = useState<string>("private");
    const [userTeams, setUserTeams] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [capsuleCount, setCapsuleCount] = useState<number>(0);
    
    // Canvas State
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [globalFiles, setGlobalFiles] = useState<AttachedFile[]>([]);
    
    // Active Input State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [textDraft, setTextDraft] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setTextDialogOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Fetch Teams and User Info
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [teams, user, capsules] = await Promise.all([
                    client.getCurrentUserTeams(),
                    client.getSingleUser(),
                    client.getUserCapsules(1, 0) // Just to get the total count
                ]);
                setUserTeams(teams || []);
                setCurrentUser(user);
                setCapsuleCount(capsules.total || 0);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchInitialData();
    }, [client]);

    useEffect(() => {
        const shouldRestore = searchParams.get("restoreDraft") === "1";
        if (!shouldRestore) return;
        const draft = loadCapsuleDraft();
        if (!draft) return;

        const restoredFiles: AttachedFile[] = draft.files.map((f) => {
            const mime = f.type || "application/octet-stream";
            const dataUrlParts = f.dataUrl.split(",");
            const base64 = dataUrlParts[1] || "";
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
            }
            const file = new File([bytes], f.name, { type: mime });
            return {
                id: f.id,
                file,
                name: f.name,
                type: mime,
                size: f.size,
                previewUrl: mime.startsWith("image/") ? URL.createObjectURL(file) : undefined
            };
        });

        const restoredChunks: Chunk[] = draft.chunks.map((c) => ({
            id: c.id,
            text: c.text,
            createdAt: new Date(c.createdAt)
        }));

        if (restoredFiles.length) setGlobalFiles(restoredFiles);
        if (restoredChunks.length) setChunks(restoredChunks);
        setName((prev) => prev.trim() || "Graphed capsule");
        toast.success("Draft restored from landing page");
    }, [searchParams]);

    // --- File Handling ---
    const handleFiles = (files: FileList | File[]) => {
        const newFileList = Array.from(files);
        if (newFileList.length === 0) return;

        const newAttachedFiles: AttachedFile[] = newFileList.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
        }));
        
        setGlobalFiles(prev => [...prev, ...newAttachedFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const removeFile = (id: string) => {
        setGlobalFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
            return prev.filter(f => f.id !== id);
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // --- Chunk Handling ---
    const addChunkFromText = (text: string) => {
        if (!text.trim()) return;
        const newChunk: Chunk = {
            id: Math.random().toString(36).substring(7),
            text: text.trim(),
            createdAt: new Date()
        };
        setChunks(prev => [...prev, newChunk]);
    };

    const handleAddChunkFromDialog = () => {
        if (!textDraft.trim()) return;
        addChunkFromText(textDraft);
        setTextDraft("");
        setTextDialogOpen(false);
    };

    const graphItems = useMemo(
        () => [
            ...globalFiles.map((f) => ({
                id: f.id,
                type: "file" as const,
                label: f.name,
                subtitle: `${(f.size / 1024 > 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`)} · ${f.type || "file"}`
            })),
            ...chunks.map((c, idx) => ({
                id: c.id,
                type: "chunk" as const,
                label: `Text chunk ${idx + 1}`,
                subtitle: c.text.length > 90 ? `${c.text.slice(0, 90)}...` : c.text
            }))
        ],
        [globalFiles, chunks]
    );

    const removeGraphItem = (id: string) => {
        if (globalFiles.some((f) => f.id === id)) {
            removeFile(id);
            return;
        }
        setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
    };

    // --- Submission ---
    const handleCreateCapsule = async () => {
        if (!name.trim()) {
            toast.error("Capsule name is required");
            return;
        }
        if (chunks.length === 0 && globalFiles.length === 0) {
            toast.error("Capsule must have at least one text chunk or file attached");
            return;
        }

        // Tier limit check
        if (currentUser) {
            const tier = currentUser.tier?.toLowerCase() || "basic";
            let limit = Infinity;
            if (tier === "basic") limit = 5;
            else if (tier === "pro") limit = 15;

            if (capsuleCount >= limit) {
                toast.error(`Capsule limit reached!`, {
                    description: `You have reached your limit of ${limit} capsules for the ${tier} tier. Please upgrade to continue.`,
                    duration: 5000,
                });
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const attachment_ids: string[] = [];
            
            // 1. Upload Attachments
            for (const f of globalFiles) {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.split(',')[1];
                        resolve(base64 || "");
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(f.file);
                });
                
                if (base64Data) {
                    const meta = await client.uploadCapsuleAttachment(base64Data, f.file.name, f.type);
                    if (meta && meta.asset_id) {
                        attachment_ids.push(meta.asset_id);
                    }
                }
            }

            // 2. Format Messages
            const messages = chunks.map(chunk => ({
                role: "user",
                content: chunk.text
            }));
            
            // 3. Create Capsule Request
            const request = {
                content: { 
                    messages,
                    metadata: { summary: summary.trim() }
                },
                tag: name.trim(),
                team: team === "private" ? undefined : team,
                extracted_from: "tilantra",
                attachment_ids
            };
            
            await client.createCapsule(request);
            clearCapsuleDraft();
            
            toast.success("Capsule created successfully!");
            navigate("/capsules");
        } catch (error: any) {
            console.error("Failed to create capsule:", error);
            toast.error(error.message || "Failed to create capsule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/capsules")} className="shrink-0 rounded-full bg-muted/50 hover:bg-muted">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Create Custom Capsule
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Build your capsule directly in a connected graph canvas.</p>
                    </div>
                </div>
            </div>

            {/* Top Section: Metadata Settings */}
            <Card className="p-4 border bg-gradient-to-br from-card to-card/50 shadow-sm border-b-2 border-b-primary/20">
                <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Configuration</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="capsule-name" className="text-xs">Capsule Name <span className="text-destructive">*</span></Label>
                        <Input 
                            id="capsule-name" 
                            placeholder="e.g. Q3 Research Notes" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background/50 h-9"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Assign Team</Label>
                        <Select value={team} onValueChange={setTeam}>
                            <SelectTrigger className="bg-background/50 h-9">
                                <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">Private (Default)</SelectItem>
                                {userTeams.map((t: any) => {
                                    const val = typeof t === "string" ? t : (t._id || t.id || String(t));
                                    const display = typeof t === "string" ? t : (t.name || val);
                                    return (
                                        <SelectItem key={val} value={val}>
                                            {display}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="capsule-summary" className="text-xs">Summary (Optional)</Label>
                        <Input 
                            id="capsule-summary" 
                            placeholder="Brief description..." 
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="bg-background/50 h-9"
                        />
                    </div>
                </div>
            </Card>

            <Card
                className={`p-6 border bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg overflow-hidden relative transition-colors ${
                    isDragging ? "border-primary/60" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl" />

                <div className="flex items-center justify-between gap-3 mb-4 relative z-10 flex-wrap">
                    <div>
                        <h3 className="font-semibold text-lg">Capsule Graph</h3>
                        <p className="text-[11px] text-muted-foreground">Hover nodes to inspect content. Use x on a node to remove it.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-4 w-4" />
                            Add Attachment
                        </Button>
                        <Button className="gap-2" onClick={() => setTextDialogOpen(true)}>
                            <MessageSquarePlus className="h-4 w-4" />
                            Add Text
                        </Button>
                        <Button
                            className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)]"
                            onClick={handleCreateCapsule}
                            disabled={isSubmitting || (chunks.length === 0 && globalFiles.length === 0)}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Create Capsule
                                </>
                            )}
                        </Button>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>

                {graphItems.length === 0 ? (
                    <div className="h-[18rem] rounded-xl border border-dashed border-muted-foreground/30 bg-background/40 flex flex-col items-center justify-center text-center px-6 relative z-10">
                        <p className="text-sm font-medium">Start building your capsule</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Try adding a file first for quick context, or press Cmd/Ctrl+K to add text.</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <CapsuleGraph items={graphItems} onRemoveItem={removeGraphItem} isAbsorbing={isSubmitting} />
                    </div>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-muted-foreground z-20 bg-background/70 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-primary/30 bg-card flex items-center justify-center">📄</div>
                        <span>{globalFiles.length} Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-purple-500/30 bg-card flex items-center justify-center">📝</div>
                        <span>{chunks.length} Text Chunks</span>
                    </div>
                </div>
            </Card>

            <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add Text Chunk</DialogTitle>
                        <DialogDescription className="text-xs">Paste or type the content you want inside this capsule.</DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="w-full min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Type or paste your unstructured text here..."
                        value={textDraft}
                        onChange={(e) => setTextDraft(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTextDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddChunkFromDialog} disabled={!textDraft.trim()}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Chunk
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

import { useState, useRef, useEffect, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, X, Plus, FileText, File, ArrowLeft, Settings, Send, UploadCloud, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { CapsuleGraph } from "@/components/CapsuleGraph";

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
// Thumbnail Component for Global Files
// ----------------------------------------------------------------------
const FileThumbnail = ({ file, onRemove }: { file: AttachedFile, onRemove?: () => void }) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    
    // Format size nice
    const kb = (file.size / 1024).toFixed(1);
    const mb = (file.size / 1024 / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB`;
    
    return (
        <Card className="relative flex items-center gap-3 bg-muted/30 border border-border/60 rounded-lg p-2 pr-8 shadow-sm group hover:border-primary/40 transition-colors">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-background flex items-center justify-center overflow-hidden border border-border/50">
                {isImage && file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                ) : isPdf ? (
                    <FileText className="h-5 w-5 text-red-500" />
                ) : (
                    <File className="h-5 w-5 text-blue-500" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 uppercase bg-background shadow-none border-muted-foreground/30">
                        {file.type.split('/')[1] || file.name.split('.').pop() || 'FILE'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{sizeStr}</span>
                </div>
            </div>
            {onRemove && (
                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </Card>
    );
};

// ----------------------------------------------------------------------
// Render a Saved Chunk
// ----------------------------------------------------------------------
const ChunkDisplay = ({ chunk, onRemove, index }: { chunk: Chunk, onRemove: () => void, index: number }) => {
    const [expanded, setExpanded] = useState(false);
    
    const MAX_LENGTH = 300;
    const isLong = chunk.text.length > MAX_LENGTH;
    const displayText = !isLong || expanded ? chunk.text : chunk.text.slice(0, MAX_LENGTH) + "...";

    return (
        <div className="relative group border-l-2 border-primary/20 hover:border-primary pl-4 py-2 transition-colors">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-0 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                onClick={onRemove}
                title="Remove Chunk"
            >
                <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary/80">Chunk {index + 1}</span>
                <span className="text-muted-foreground/40 text-xs">•</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                    {format(chunk.createdAt, "h:mm a")}
                </span>
            </div>
            
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pr-8">
                {displayText}
                {isLong && (
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        className="text-primary hover:underline ml-2 font-medium text-xs bg-primary/10 px-2 py-0.5 rounded-sm"
                    >
                        {expanded ? "Show Less" : "Show More"}
                    </button>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export default function CreateCapsule() {
    const navigate = useNavigate();
    const client = useMemo(() => new BrowserGuideraClient(), []);
    
    // Metadata State
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [team, setTeam] = useState<string>("private");
    const [userTeams, setUserTeams] = useState<any[]>([]);
    
    // Canvas State
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [globalFiles, setGlobalFiles] = useState<AttachedFile[]>([]);
    
    // Active Input State
    const [inputText, setInputText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
        }
    }, [inputText]);

    // Fetch Teams
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teams = await client.getCurrentUserTeams();
                setUserTeams(teams || []);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            }
        };
        fetchTeams();
    }, [client]);

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
    const handleAddChunk = () => {
        if (!inputText.trim()) return;
        
        const newChunk: Chunk = {
            id: Math.random().toString(36).substring(7),
            text: inputText.trim(),
            createdAt: new Date()
        };
        
        setChunks(prev => [...prev, newChunk]);
        setInputText("");
        
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleAddChunk();
        }
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
            
            toast.success("Capsule created successfully!");
            navigate("/");
        } catch (error: any) {
            console.error("Failed to create capsule:", error);
            toast.error(error.message || "Failed to create capsule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0 rounded-full bg-muted/50 hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Create Custom Capsule
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Design your ultimate knowledge capsule with separated attachments and text data.</p>
                </div>
            </div>

            {/* Top Section: Metadata Settings */}
            <Card className="p-5 border bg-gradient-to-br from-card to-card/50 shadow-sm border-b-4 border-b-primary/20">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Configuration</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="capsule-name">Capsule Name <span className="text-destructive">*</span></Label>
                        <Input 
                            id="capsule-name" 
                            placeholder="e.g. Q3 Research Notes" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background/50 h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Assign Team</Label>
                        <Select value={team} onValueChange={setTeam}>
                            <SelectTrigger className="bg-background/50 h-10">
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
                    <div className="space-y-2 lg:col-span-1">
                        <Label htmlFor="capsule-summary">Summary (Optional)</Label>
                        <Input 
                            id="capsule-summary" 
                            placeholder="Brief description..." 
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="bg-background/50 h-10"
                        />
                    </div>
                </div>
            </Card>

            {/* Interactive Graph Visualization */}
            {(chunks.length > 0 || globalFiles.length > 0) && (
                <Card className="p-6 border bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl" />
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-2xl">💊</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Capsule Structure</h3>
                            <p className="text-xs text-muted-foreground">Visual representation of your knowledge graph</p>
                        </div>
                    </div>
                    
                    <CapsuleGraph 
                        items={[
                            ...globalFiles.map(f => ({ id: f.id, type: 'file' as const })),
                            ...chunks.map(c => ({ id: c.id, type: 'chunk' as const }))
                        ]} 
                    />
                    
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg border-2 border-primary/30 bg-card flex items-center justify-center">📄</div>
                            <span>{globalFiles.length} Files</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg border-2 border-purple-500/30 bg-card flex items-center justify-center">📝</div>
                            <span>{chunks.length} Text Chunks</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* Middle Section: Split Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
                
                {/* LEFT COLUMN: ATTACHMENTS */}
                <Card className="flex flex-col border shadow-sm overflow-hidden bg-card/80">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">Attachments</h3>
                        </div>
                        <Badge variant="secondary" className="font-normal">{globalFiles.length} files</Badge>
                    </div>
                    
                    <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
                        {/* Drag and Drop Zone */}
                        <div 
                            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer text-center
                                ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20'}
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <UploadCloud className="h-7 w-7" />
                            </div>
                            <p className="text-base font-medium mb-1">
                                Drag & Drop files here or <span className="text-primary hover:underline">browse</span>
                            </p>
                            <p className="text-xs text-muted-foreground">Support: PDF, DOCX, IMG, TXT</p>
                            <input 
                                type="file" 
                                multiple 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Files Grid */}
                        {globalFiles.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Attached Files</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {globalFiles.map(file => (
                                        <FileThumbnail key={file.id} file={file} onRemove={() => removeFile(file.id)} />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {globalFiles.length === 0 && (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm mt-8">
                                No files attached yet.
                            </div>
                        )}
                    </div>
                </Card>

                {/* RIGHT COLUMN: TEXT CONTENT */}
                <Card className="flex flex-col border shadow-sm overflow-hidden bg-card/80 h-full max-h-[700px]">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">Text Content</h3>
                        </div>
                        <Badge variant="secondary" className="font-normal">{chunks.length} chunks</Badge>
                    </div>
                    
                    {/* Chunks List (Scrollable) */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        {chunks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 text-sm p-4 text-center">
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-3">
                                    <FileText className="h-5 w-5 opacity-50" />
                                </div>
                                <p>No text chunks added yet.</p>
                                <p className="text-xs mt-1">Type in the box below and click "Add Chunk".</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chunks.map((chunk, idx) => (
                                    <ChunkDisplay 
                                        key={chunk.id} 
                                        index={idx}
                                        chunk={chunk} 
                                        onRemove={() => setChunks(prev => prev.filter(c => c.id !== chunk.id))} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Input Area (Fixed Bottom) */}
                    <div className="p-4 bg-muted/20 border-t border-border/50">
                        <div className="bg-background rounded-lg border border-border/60 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                            <textarea 
                                ref={textareaRef}
                                className="w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 p-3 text-sm"
                                placeholder="Type or paste your unstructured text here..."
                                rows={2}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ minHeight: '60px', maxHeight: '250px' }}
                            />
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/10 border-t border-border/40 rounded-b-lg">
                                <span className="text-[10px] text-muted-foreground opacity-70">
                                    {inputText.length > 0 ? `${inputText.length} characters` : 'Press Cmd+Enter to add'}
                                </span>
                                <Button 
                                    size="sm" 
                                    onClick={handleAddChunk}
                                    disabled={!inputText.trim()}
                                    className="h-8 gap-1.5 px-3 bg-primary hover:bg-primary/90"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Chunk
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Capsule Graph Visualization */}
            {(chunks.length > 0 || globalFiles.length > 0) && (
                <Card className="p-6 border shadow-sm bg-gradient-to-br from-card to-card/50">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold mb-2">Capsule Structure</h3>
                        <p className="text-sm text-muted-foreground">Visual representation of your capsule contents</p>
                    </div>
                    <CapsuleGraph 
                        items={[
                            ...globalFiles.map(f => ({ id: f.id, type: 'file' as const })),
                            ...chunks.map(c => ({ id: c.id, type: 'chunk' as const }))
                        ]} 
                    />
                </Card>
            )}

            {/* Bottom Finalization */}
            <div className="pt-4 flex justify-center">
                <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-12 py-6 gap-3 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    onClick={handleCreateCapsule}
                    disabled={isSubmitting || (chunks.length === 0 && globalFiles.length === 0)}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Creating Capsule...
                        </>
                    ) : (
                        <>
                            <Send className="h-6 w-6" />
                            Create Capsule
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

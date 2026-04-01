import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, MessageSquarePlus, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CapsuleGraph } from "@/components/CapsuleGraph";
import TilantraLogo from "@/components/assets/Tilantra_blueLOGO.png";
import { saveCapsuleDraft } from "@/lib/capsule-draft";
import { toast } from "sonner";

interface LandingFile {
    id: string;
    file: File;
    name: string;
    type: string;
    size: number;
}

interface LandingChunk {
    id: string;
    text: string;
    createdAt: Date;
}

const FEATURES = [
    "Easy drag and drop",
    "Context versioning",
    "Multi-model support",
    "Zero context rot",
    "Prevents hallucinations",
] as const;

const heroList = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.055, delayChildren: 0.12 },
    },
} as const;

const heroItem = {
    hidden: { opacity: 0, y: 6 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
} as const;

export default function LandingPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<LandingFile[]>([]);
    const [chunks, setChunks] = useState<LandingChunk[]>([]);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [textDraft, setTextDraft] = useState("");
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);

    const graphItems = useMemo(
        () => [
            ...files.map((f) => ({
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
        [files, chunks]
    );

    const handleFiles = (fileList: FileList | File[]) => {
        const items = Array.from(fileList);
        if (!items.length) return;
        const next = items.map((file) => ({
            id: Math.random().toString(36).slice(2),
            file,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size
        }));
        setFiles((prev) => [...prev, ...next]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAddText = () => {
        if (!textDraft.trim()) return;
        setChunks((prev) => [...prev, { id: Math.random().toString(36).slice(2), text: textDraft.trim(), createdAt: new Date() }]);
        setTextDraft("");
        setTextDialogOpen(false);
    };

    const removeItem = (id: string) => {
        if (files.some((f) => f.id === id)) {
            setFiles((prev) => prev.filter((f) => f.id !== id));
            return;
        }
        setChunks((prev) => prev.filter((c) => c.id !== id));
    };

    const handleStartCreate = async () => {
        if (files.length === 0 && chunks.length === 0) {
            toast.error("Add at least one attachment or text chunk first.");
            return;
        }
        if (isAbsorbing) return;
        const draftFiles = await Promise.all(
            files.map(
                async (f) =>
                    ({
                        id: f.id,
                        name: f.name,
                        type: f.type,
                        size: f.size,
                        dataUrl: await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(f.file);
                        })
                    }) as const
            )
        );

        saveCapsuleDraft({
            files: draftFiles.map((f) => ({ ...f })),
            chunks: chunks.map((c) => ({ id: c.id, text: c.text, createdAt: c.createdAt.toISOString() }))
        });
        setIsAbsorbing(true);
        window.setTimeout(() => {
            setShowSignInPrompt(true);
            setIsAbsorbing(false);
        }, 900);
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-blue-50/55 to-purple-50/45 text-foreground dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816]">
            {/* Restored soft background (no harsh navy / white spotlight) */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(124,58,237,0.14),transparent_60%),radial-gradient(900px_500px_at_100%_10%,rgba(37,99,235,0.14),transparent_60%)] dark:bg-[radial-gradient(1100px_600px_at_0%_0%,rgba(124,58,237,0.26),transparent_60%),radial-gradient(1100px_600px_at_100%_10%,rgba(37,99,235,0.24),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.11] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
            <motion.div
                className="pointer-events-none absolute -top-24 left-[-80px] h-[340px] w-[340px] rounded-3xl bg-gradient-to-br from-purple-400/18 to-blue-400/18 blur-3xl dark:from-purple-500/20 dark:to-blue-500/20"
                animate={{ x: [0, 16, 0], y: [0, -12, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
            />
            <motion.div
                className="pointer-events-none absolute top-8 right-[-100px] h-[320px] w-[320px] rounded-3xl bg-gradient-to-br from-blue-400/16 to-indigo-400/14 blur-3xl dark:from-blue-500/18 dark:to-indigo-500/16"
                animate={{ x: [0, -14, 0], y: [0, 14, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
            />

            <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
                <div className="mx-auto flex min-h-[4rem] max-w-[1400px] items-center justify-between gap-4 px-5 py-3.5 sm:min-h-[4.25rem] sm:px-8">
                    <a href="/" className="shrink-0 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                        <img src={TilantraLogo} alt="Tilantra" className="h-9 w-auto sm:h-10" />
                    </a>
                    <nav className="flex items-center gap-4 sm:gap-6">
                        <a
                            href="https://tilantra.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                        >
                            About the company
                        </a>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm hover:from-blue-500 hover:to-violet-500 dark:shadow-lg dark:shadow-indigo-950/30"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-14 lg:pt-16">
                <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="space-y-7 lg:col-span-5">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-950 dark:text-white lg:text-[3.35rem] lg:leading-[1.05]">
                                Create a Capsule
                                <span className="mt-2 block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    In seconds, not hours
                                </span>
                            </h1>
                        </motion.div>
                        <p className="max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300">
                            Drop files, add context, and ship knowledge your team and models can reuse—without starting from zero every time.
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-indigo-500/20 dark:bg-white/5 dark:text-slate-200">
                            <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            Interactive capsule studio
                        </div>

                        <motion.ul
                            className="space-y-2.5 pt-1"
                            variants={heroList}
                            initial="hidden"
                            animate="show"
                        >
                            {FEATURES.map((label) => (
                                <motion.li
                                    key={label}
                                    variants={heroItem}
                                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                                        <Check className="h-3 w-3" strokeWidth={2.5} />
                                    </span>
                                    <span className="leading-snug">{label}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>

                    <div className="space-y-4 lg:col-span-7">
                        <Card className="p-4 sm:p-5 bg-white/90 dark:bg-slate-950/40 backdrop-blur-sm border border-slate-200/90 dark:border-white/12 shadow-lg shadow-slate-900/5 dark:shadow-black/40">
                            {/* Canvas: grid only — no colored radial overlay so the graph reads clearly */}
                            <div className="relative rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 dark:bg-slate-900/50">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
                                    aria-hidden
                                />
                                {graphItems.length === 0 ? (
                                    <div className="relative z-[1] h-[24rem] flex items-center justify-center text-center px-6">
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300/90 max-w-sm">
                                            Start by dropping a file or adding a text chunk to see your capsule graph come alive.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative z-[1] flex min-h-[24rem] items-center justify-center">
                                        <CapsuleGraph
                                            items={graphItems}
                                            onRemoveItem={removeItem}
                                            isAbsorbing={isAbsorbing}
                                            className="h-[24rem]"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="w-full flex justify-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-slate-300 dark:border-white/20 bg-white/90 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-4 w-4" />
                                    Add Attachment
                                </Button>
                                <Button size="lg" className="gap-2 w-full sm:w-auto bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20" onClick={() => setTextDialogOpen(true)}>
                                    <MessageSquarePlus className="h-4 w-4" />
                                    Add Text
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleStartCreate}
                                    disabled={isAbsorbing}
                                    className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white shadow-[0_14px_36px_rgba(59,130,246,0.35)]"
                                >
                                    {isAbsorbing ? "Creating..." : "Create Capsule"}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add Text Chunk</DialogTitle>
                            <DialogDescription className="text-xs">Paste or type content to include in your draft capsule.</DialogDescription>
                        </DialogHeader>
                        <textarea
                            className="w-full min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Type or paste your text..."
                            value={textDraft}
                            onChange={(e) => setTextDraft(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTextDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddText} disabled={!textDraft.trim()}>Add Chunk</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {showSignInPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border border-slate-200 dark:border-white/20 bg-white/95 dark:bg-slate-950/92 shadow-2xl backdrop-blur-md p-4"
                    >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Sign in to create your capsule</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                            Your attachments are ready and draft is saved. Continue after sign in.
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSignInPrompt(false)}
                                className="text-slate-700 dark:text-slate-300"
                            >
                                Not now
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate(`/login?next=${encodeURIComponent("/create-capsule?restoreDraft=1")}`)}
                            >
                                Sign In
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, MessageSquarePlus, Paperclip, Sparkles, Upload, Zap, Shield, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CapsuleGraph } from "@/components/CapsuleGraph";
import TilantraLogo from "@/components/assets/Tilantra_blueLOGO.png";
import ChatgptLogo from "@/components/assets/ChatgptLogo.png";
import ClaudeLogo from "@/components/assets/ClaudeLogo.png";
import GeminiLogo from "@/components/assets/GeminiLogo.png";
import DeepseekLogo from "@/components/assets/DeepseekLogo.png";
import GmailLogo from "@/components/assets/GmailLogo.png";
import WindsurfLogo from "@/components/assets/windsurfLogo.png";
import SlackLogo from "@/components/assets/SlackLogo.png";
import PerplexityLogo from "@/components/assets/perplexity-color.png";
import FigmaLogo from "@/components/assets/figmaLogo.png";
import OutlookLogo from "@/components/assets/outlookLogo.png";
import { saveCapsuleDraft } from "@/lib/capsule-draft";
import { toast } from "sonner";
import TrueFocusText from "@/components/TrueFocusText";

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
    { text: "Easy drag and drop", icon: Upload },
    { text: "Context versioning", icon: Layers },
    { text: "Multi-model support", icon: Zap },
    { text: "Zero context rot", icon: Shield },
    { text: "Prevents hallucinations", icon: RefreshCw },
] as const;

const ORBITING_LOGOS = [
    { src: ChatgptLogo, alt: "ChatGPT", side: "left", x: -115, y: -105, delay: 0.05, fx1: 8, fx2: -4, fy1: -7, fy2: 5, r1: -4, r2: 2, drift: 4.3 },
    { src: ClaudeLogo, alt: "Claude", side: "left", x: -128, y: -45, delay: 0.12, fx1: -6, fx2: 5, fy1: 8, fy2: -5, r1: 3, r2: -2, drift: 4.8 },
    { src: GmailLogo, alt: "Gmail", side: "left", x: -105, y: 15, delay: 0.18, fx1: 6, fx2: -5, fy1: -6, fy2: 7, r1: -3, r2: 2, drift: 4.6 },
    { src: FigmaLogo, alt: "Figma", side: "left", x: -122, y: 70, delay: 0.26, fx1: -7, fx2: 4, fy1: 6, fy2: -4, r1: 2, r2: -3, drift: 5.0 },
    { src: PerplexityLogo, alt: "Perplexity", side: "left", x: -110, y: 110, delay: 0.34, fx1: 7, fx2: -4, fy1: -7, fy2: 5, r1: -2, r2: 3, drift: 4.7 },

    { src: GeminiLogo, alt: "Gemini", side: "right", x: 118, y: -100, delay: 0.08, fx1: -8, fx2: 5, fy1: -7, fy2: 5, r1: 3, r2: -2, drift: 4.2 },
    { src: DeepseekLogo, alt: "DeepSeek", side: "right", x: 125, y: -50, delay: 0.15, fx1: 7, fx2: -5, fy1: 8, fy2: -6, r1: -3, r2: 2, drift: 4.9 },
    { src: WindsurfLogo, alt: "Windsurf", side: "right", x: 108, y: 10, delay: 0.22, fx1: -6, fx2: 4, fy1: -6, fy2: 7, r1: 2, r2: -2, drift: 4.5 },
    { src: SlackLogo, alt: "Slack", side: "right", x: 120, y: 65, delay: 0.3, fx1: 8, fx2: -5, fy1: 6, fy2: -4, r1: -2, r2: 3, drift: 5.1 },
    { src: OutlookLogo, alt: "Outlook", side: "right", x: 112, y: 115, delay: 0.38, fx1: -7, fx2: 5, fy1: -7, fy2: 5, r1: 3, r2: -2, drift: 4.6 },
] as const;

export default function LandingPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const studioSectionRef = useRef<HTMLElement>(null);
    const [files, setFiles] = useState<LandingFile[]>([]);
    const [chunks, setChunks] = useState<LandingChunk[]>([]);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [textDraft, setTextDraft] = useState("");
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [logosActivated, setLogosActivated] = useState(false);

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
        toast.success(`Added ${items.length} file${items.length > 1 ? 's' : ''}`);
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
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <motion.div
                className="pointer-events-none absolute -top-24 left-[-80px] h-[340px] w-[340px] rounded-full bg-gradient-to-br from-purple-400/25 to-blue-400/25 blur-3xl dark:from-purple-500/30 dark:to-blue-500/30"
                animate={{ 
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
            />
            <motion.div
                className="pointer-events-none absolute top-8 right-[-100px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl dark:from-blue-500/25 dark:to-indigo-500/25"
                animate={{ 
                    x: [0, -20, 0],
                    y: [0, 25, 0],
                    scale: [1, 1.15, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
            />
            <motion.div
                className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/15 to-pink-400/15 blur-3xl dark:from-violet-500/20 dark:to-pink-500/20"
                animate={{ 
                    x: [-150, -100, -150],
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
            />

            <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 sm:px-8"
                >
                    <div className="flex items-center gap-6 sm:gap-8">
                        <a href="/" className="shrink-0 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                            <motion.img 
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                src={TilantraLogo} 
                                alt="Tilantra" 
                                className="h-8 w-auto" 
                            />
                        </a>
                        <motion.a
                            href="https://tilantra.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -1 }}
                            className="hidden sm:block text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        >
                            About
                        </motion.a>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Button
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                    </motion.div>
                </motion.div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8 sm:pt-24 lg:pt-28">
                {/* Centered Hero Section */}
                <section className="mx-auto max-w-5xl text-center mb-7">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-5"
                    >
                        {/* Main Heading - Single Line */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02]">
                            <span className="inline-block bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-violet-400">
                                Capture your Context
                            </span>
                        </h1>

                        {/* Animated Tagline */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="inline-block"
                        >
                            <div className="relative py-1 px-1">
                                <TrueFocusText
                                    texts={["Using Capsules", "within 10 seconds"]}
                                    className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100"
                                    duration={2.6}
                                />
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            Drop files, add context, and ship knowledge your team and models can reuse—without starting from zero every time.
                        </motion.p>

                        {/* Features Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto"
                        >
                            {FEATURES.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.text}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        whileHover={{ y: -4, scale: 1.05 }}
                                        className="group p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer"
                                    >
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:from-indigo-500/30 group-hover:to-violet-500/30 transition-all"
                                        >
                                            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                                        </motion.div>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {feature.text}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        <motion.a
                            href="#studio"
                            onClick={(e) => {
                                e.preventDefault();
                                if (!studioSectionRef.current) return;
                                const targetY = studioSectionRef.current.getBoundingClientRect().top + window.scrollY - 72;
                                const startY = window.scrollY;
                                const distance = targetY - startY;
                                const duration = 1200; // 1.2 seconds for gentler scroll
                                let start: number | null = null;
                                
                                const easeInOutCubic = (t: number) => {
                                    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                                };
                                
                                const step = (timestamp: number) => {
                                    if (!start) start = timestamp;
                                    const progress = Math.min((timestamp - start) / duration, 1);
                                    const eased = easeInOutCubic(progress);
                                    window.scrollTo(0, startY + distance * eased);
                                    if (progress < 1) {
                                        window.requestAnimationFrame(step);
                                    }
                                };
                                
                                window.requestAnimationFrame(step);
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.05 }}
                            className="mx-auto mt-1 inline-flex items-center gap-3 rounded-full border border-indigo-400/55 bg-white/85 px-5 py-2.5 text-base font-bold text-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.03] hover:bg-indigo-50 dark:border-indigo-600/60 dark:bg-slate-900/70 dark:text-indigo-200 dark:hover:bg-slate-900"
                            aria-label="Jump to interactive capsule studio"
                        >
                            Try it out now
                            <motion.span
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-500"
                                animate={{ y: [0, 4, 0], scale: [1, 1.08, 1] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ArrowDown className="h-4 w-4" strokeWidth={2.75} />
                            </motion.span>
                        </motion.a>
                    </motion.div>
                </section>

                {/* Interactive Capsule Studio */}
                <section id="studio" ref={studioSectionRef} className="mx-auto max-w-5xl scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mb-4 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-300/30 dark:border-indigo-600/30 backdrop-blur-sm">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </motion.div>
                            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Interactive Capsule Studio</span>
                        </div>
                    </motion.div>
                    <div className="relative space-y-6">
                        {/* Item count badge */}
                        {(files.length > 0 || chunks.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-center gap-2"
                            >
                                <motion.div
                                    key={files.length + chunks.length}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 dark:border-green-500/30"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.5 }}
                                        className="h-2 w-2 rounded-full bg-green-500"
                                    />
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                        {files.length + chunks.length} item{files.length + chunks.length !== 1 ? 's' : ''} added
                                    </span>
                                </motion.div>
                            </motion.div>
                        )}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            onViewportEnter={() => setLogosActivated(true)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="pointer-events-none absolute inset-0 block" aria-hidden>
                                {ORBITING_LOGOS.map((logo) => (
                                    <motion.div
                                        key={logo.alt}
                                        initial={{
                                            opacity: 0,
                                            x: 0,
                                            y: 0,
                                            scale: 0.3,
                                            filter: "blur(10px)",
                                        }}
                                        animate={
                                            logosActivated
                                                ? { opacity: 1, x: logo.x, y: logo.y, scale: 1, filter: "blur(0px)" }
                                                : { opacity: 0, x: 0, y: 0, scale: 0.3, filter: "blur(10px)" }
                                        }
                                        transition={{
                                            duration: 2.3,
                                            delay: logo.delay,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className={`absolute top-1/2 z-[20] pointer-events-auto ${logo.side === "left" ? "left-0" : "right-0"}`}
                                    >
                                        <motion.img
                                            src={logo.src}
                                            alt={logo.alt}
                                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-white/40 bg-white/85 p-1.5 shadow-lg backdrop-blur-sm"
                                            animate={{
                                                x: [0, logo.fx1, logo.fx2, 0],
                                                y: [0, logo.fy1, logo.fy2, 0],
                                                rotate: [0, logo.r1, logo.r2, 0],
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{ duration: logo.drift, repeat: Infinity, ease: "easeInOut" }}
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <Card className="relative z-10 p-4 sm:p-5 bg-white/90 dark:bg-slate-950/40 backdrop-blur-sm border border-slate-200/90 dark:border-white/12 shadow-lg shadow-slate-900/5 dark:shadow-black/40 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/60 transition-all duration-300">
                                {/* Drag overlay */}
                                {isDragging && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-violet-500/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-blue-500 dark:border-violet-400"
                                    >
                                        <div className="text-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                <Upload className="h-12 w-12 mx-auto text-blue-600 dark:text-violet-400 mb-2" />
                                            </motion.div>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">Drop files here</p>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Canvas: grid only — no colored radial overlay so the graph reads clearly */}
                                <motion.div 
                                    className="relative rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 dark:bg-slate-900/50"
                                    whileHover={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
                                        aria-hidden
                                    />
                                    {graphItems.length === 0 ? (
                                        <div className="relative z-[1] h-[20rem] flex items-center justify-center text-center px-6">
                                            <div>
                                                <motion.div
                                                    animate={{ 
                                                        y: [0, -10, 0],
                                                        opacity: [0.6, 1, 0.6]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <Upload className="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                                                </motion.div>
                                                <motion.p 
                                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="text-sm text-slate-600 dark:text-slate-300/90 max-w-sm font-medium"
                                                >
                                                    Drag & drop files or click below to start building your capsule
                                                </motion.p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative z-[1] flex min-h-[20rem] items-center justify-center">
                                            <CapsuleGraph
                                                items={graphItems}
                                                onRemoveItem={removeItem}
                                                isAbsorbing={isAbsorbing}
                                                className="h-[20rem]"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </Card>
                        </motion.div>

                        <div className="w-full flex justify-center">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.08, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="group gap-2 w-full sm:w-auto border-slate-300 dark:border-white/20 bg-white/90 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        >
                                            <Paperclip className="h-4 w-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                        </motion.div>
                                        Add Attachment
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.08, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Button 
                                        size="lg" 
                                        className="group gap-2 w-full sm:w-auto bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 hover:border-violet-400 dark:hover:border-violet-500 transition-all shadow-sm hover:shadow-md"
                                        onClick={() => setTextDialogOpen(true)}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 90 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <MessageSquarePlus className="h-4 w-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                                        </motion.div>
                                        Add Text
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.08, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Button
                                        size="lg"
                                        onClick={handleStartCreate}
                                        disabled={isAbsorbing}
                                        className="relative overflow-hidden gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)] transition-all"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-white/20"
                                            initial={{ x: "-100%", skewX: -20 }}
                                            whileHover={{ x: "100%" }}
                                            transition={{ duration: 0.6 }}
                                        />
                                        <span className="relative z-10">{isAbsorbing ? "Creating..." : "Create Capsule"}</span>
                                        <motion.div
                                            className="relative z-10"
                                            animate={isAbsorbing ? { 
                                                x: [0, 5, 0],
                                                rotate: [0, 10, 0]
                                            } : {}}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </motion.div>
                                    </Button>
                                </motion.div>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                                />
                            </motion.div>
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

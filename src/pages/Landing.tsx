import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Bot, BrainCircuit, Chrome, Globe, MessageSquarePlus, Paperclip, Sparkles, Upload, Zap, Shield, Layers, RefreshCw, ServerCog, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CapsuleGraph } from "@/components/CapsuleGraph";
import { TilantraLogo } from "@/components/Logo";

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
import SplashCursor from "@/components/SplashCursor";
import Header from "@/components/layout/Header";

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

const USE_CASES = [
    {
        title: "Chrome Extension",
        description: "Capture from ChatGPT, Claude, Gemini, Perplexity, DeepSeek and Gmail in one click.",
        href: "https://chromewebstore.google.com/detail/capsule-hub-by-tilantra/ngeoeefidomejcdhiecidpaalfoekjbh?hl=en-US&utm_source=ext_sidebar",
        external: true,
        icon: Chrome,
        highlight: true,
    },
    {
        title: "MCP for Developers",
        description: "Connect Capsule Hub in Cursor and other MCP-compatible clients.",
        href: "/docs/mcp",
        external: false,
        icon: ServerCog,
    },
    {
        title: "Personal Chatbot Integration",
        description: "Embed Capsule Hub SDK on your own website chatbot and sync context.",
        href: "/docs/personal-chatbot",
        external: false,
        icon: Bot,
    },
    {
        title: "Capsules as Anthropic Skills",
        description: "Use Claude Code skills to save, search, read, and version capsules from terminal.",
        href: "/docs/anthropic-skills",
        external: false,
        icon: BrainCircuit,
    },
    {
        title: "Custom Capsules Through Websites",
        description: "Create and manage capsules directly through the Capsule Hub web experience.",
        href: "#studio",
        external: false,
        icon: Globe,
    },
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

type ExtensionServiceStatus = "up" | "down";

// Toggle this value during deploys; banner appears only when status is "down".
const EXTENSION_SERVICE_STATUS: ExtensionServiceStatus = "down";

const EXTENSION_DOWN_BANNER = {
    title: "MAINTENANCE",
    message: "The extension service is temporarily down while deployment is in progress. Thank you for your patience.",
    icon: XCircle,
    containerClass:
        "border-orange-400/65 bg-gradient-to-r from-orange-700 via-amber-700 to-orange-700 text-white dark:border-orange-400/55 dark:from-orange-700 dark:via-amber-700 dark:to-orange-700",
} as const;
const EXTENSION_DOWN_BANNER_HEIGHT = 36;

export default function LandingPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const studioSectionRef = useRef<HTMLElement>(null);
    const useCasesSectionRef = useRef<HTMLElement>(null);
    const [files, setFiles] = useState<LandingFile[]>([]);
    const [chunks, setChunks] = useState<LandingChunk[]>([]);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [textDraft, setTextDraft] = useState("");
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [logosActivated, setLogosActivated] = useState(false);
    const showExtensionDownBanner = EXTENSION_SERVICE_STATUS === "down";
    const ExtensionServiceIcon = EXTENSION_DOWN_BANNER.icon;

    const smoothScrollToSection = (section: HTMLElement | null) => {
        if (!section) return;
        const targetY = section.getBoundingClientRect().top + window.scrollY - 72;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = 1200;
        let start: number | null = null;

        const easeInOutCubic = (t: number) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = easeInOutCubic(progress);
            window.scrollTo(0, startY + distance * eased);
            if (progress < 1) window.requestAnimationFrame(step);
        };

        window.requestAnimationFrame(step);
    };

    const smoothScrollToStudio = () => smoothScrollToSection(studioSectionRef.current);
    const smoothScrollToUseCases = () => smoothScrollToSection(useCasesSectionRef.current);

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
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/55 to-purple-50/45 text-foreground dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816]">
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

            <SplashCursor
                className="opacity-[0.52] dark:opacity-[0.48]"
                DENSITY_DISSIPATION={2.4}
                COLOR_UPDATE_SPEED={14}
            />

            {showExtensionDownBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`fixed inset-x-0 top-0 z-[60] flex h-[36px] items-center justify-center border-b px-4 text-center shadow-md ${EXTENSION_DOWN_BANNER.containerClass}`}
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                        <ExtensionServiceIcon className="h-3.5 w-3.5 shrink-0 text-white/95" />
                        <p className="font-bold tracking-wide">{EXTENSION_DOWN_BANNER.title}:</p>
                        <p className="font-medium text-white/95">{EXTENSION_DOWN_BANNER.message}</p>
                    </div>
                </motion.div>
            )}

            <Header topOffset={showExtensionDownBanner ? EXTENSION_DOWN_BANNER_HEIGHT : 0} />

            <div
                className="relative z-10 mx-auto max-w-7xl px-5 pb-14 sm:px-8"
                style={{
                    paddingTop: showExtensionDownBanner ? "7.5rem" : "5rem",
                }}
            >
                {/* Centered Hero Section */}
                <section className="mx-auto flex min-h-[88vh] max-w-6xl items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4 sm:space-y-6 -mt-10 sm:-mt-16"
                    >
                        {/* Main Heading - Single Line */}
                        <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight leading-tight text-center">
                            <span className="inline-block bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-violet-400">
                                Capture your Context
                            </span>
                        </h1>

                        {/* Animated Tagline */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="inline-block -mt-2 sm:-mt-4"
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
                            className="mx-auto max-w-3xl pt-2 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            Sync context, Version artifacts, and Align agents — Never start from Zero again.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.66, duration: 0.45 }}
                            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto"
                        >
                            {FEATURES.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.text}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.74 + index * 0.08 }}
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        className="group relative px-4 py-2.5 rounded-full bg-white/45 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/40 hover:bg-white/80 dark:hover:bg-slate-900/60 hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] transition-all cursor-pointer flex items-center gap-3"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                                            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                                            {feature.text}
                                        </span>
                                        {/* Subtle accent glow */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                            className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Button
                                onClick={smoothScrollToStudio}
                                className="group relative inline-flex h-14 items-center gap-2.5 overflow-hidden bg-violet-600 px-8 text-lg font-bold text-white transition-all hover:bg-violet-700 hover:shadow-[0_10px_30px_rgba(124,58,237,0.4)] active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-2.5">
                                    Try it now
                                    <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                                </span>
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-violet-400/0 via-white/20 to-violet-400/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </Button>

                            <Button
                                onClick={smoothScrollToUseCases}
                                variant="outline"
                                className="inline-flex h-14 items-center gap-2.5 border-indigo-200/60 bg-white/60 px-8 text-lg font-semibold text-indigo-700 backdrop-blur-sm transition-all hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-500/30 dark:bg-slate-900/40 dark:text-indigo-200 dark:hover:bg-slate-900"
                            >
                                Explore Features
                                <ArrowDown className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                <section id="use-cases" ref={useCasesSectionRef} className="mx-auto mt-2 max-w-6xl scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.45 }}
                        className="w-full mt-8"
                    >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            {USE_CASES.map((useCase, idx) => {
                                const Icon = useCase.icon;
                                const placementClass =
                                    idx === 3
                                        ? "lg:col-span-2 lg:col-start-2"
                                        : idx === 4
                                            ? "lg:col-span-2 lg:col-start-4"
                                            : "lg:col-span-2";
                                const cardClass = useCase.highlight
                                    ? "border-indigo-400/70 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-white/90 dark:from-indigo-500/30 dark:via-violet-500/20 dark:to-slate-950/60 shadow-lg shadow-indigo-500/20"
                                    : "border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-500/50";

                                const ctaText =
                                    useCase.title === "Custom Capsules Through Websites"
                                        ? "Try it out below"
                                        : useCase.title === "Chrome Extension"
                                            ? "Download now"
                                            : "Open guide";

                                const content = (
                                    <motion.div
                                        whileHover={{ y: -3, scale: 1.01 }}
                                        transition={{ duration: 0.18 }}
                                        className={`group flex h-full flex-col rounded-xl border p-4 text-left backdrop-blur-sm transition-all ${cardClass}`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                                                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" strokeWidth={2.4} />
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{useCase.title}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{useCase.description}</p>
                                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 transition-colors group-hover:text-indigo-600 dark:text-indigo-300 dark:group-hover:text-indigo-200">
                                            {ctaText}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </motion.div>
                                );

                                return useCase.external ? (
                                    <a
                                        key={useCase.title}
                                        href={useCase.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={placementClass}
                                    >
                                        {content}
                                    </a>
                                ) : useCase.href.startsWith("#") ? (
                                    <a
                                        key={useCase.title}
                                        href={useCase.href}
                                        className={placementClass}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            smoothScrollToStudio();
                                        }}
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <Link key={useCase.title} to={useCase.href} className={placementClass}>
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>

                </section>

                {/* Interactive Capsule Studio */}
                <section id="studio" ref={studioSectionRef} className="mx-auto mt-14 max-w-5xl scroll-mt-20">
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

                            <Card className="relative z-10 p-5 sm:p-6 bg-white/90 dark:bg-slate-950/40 backdrop-blur-sm border border-slate-200/90 dark:border-white/12 shadow-lg shadow-slate-900/5 dark:shadow-black/40 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/60 transition-all duration-300">
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
                                        <div className="relative z-[1] h-[24rem] flex items-center justify-center text-center px-6">
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
                                        <div className="relative z-[1] flex min-h-[24rem] items-center justify-center">
                                            <CapsuleGraph
                                                items={graphItems}
                                                onRemoveItem={removeItem}
                                                isAbsorbing={isAbsorbing}
                                                className="h-[24rem]"
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

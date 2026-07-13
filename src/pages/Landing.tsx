import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, Paperclip, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CapsuleGraph } from "@/components/CapsuleGraph";

import ChatgptLogo from "@/components/assets/ChatgptLogo.png";
import ClaudeLogo from "@/components/assets/ClaudeLogo.png";
import GeminiLogo from "@/components/assets/GeminiLogo.png";
import DeepseekLogo from "@/components/assets/DeepseekLogo.png";
import GmailLogo from "@/components/assets/GmailLogo.png";
import WindsurfLogo from "@/components/assets/windsurfLogo.png";
import SlackLogo from "@/components/assets/SlackLogo.png";
import PerplexityLogo from "@/components/assets/PerplexityLogo.png";
import FigmaLogo from "@/components/assets/figmaLogo.png";
import OutlookLogo from "@/components/assets/outlookLogo.png";
import CopilotLogo from "@/components/assets/CopilotLogo.png";
import LovableLogo from "@/components/assets/LovableLogo.png";
import ReplitLogo from "@/components/assets/ReplitLogo.png";
import EmergentLogo from "@/components/assets/EmergentLogo.png";
import AntigravityLogo from "@/components/assets/antigravity-color.png";
import VSCodeLogo from "@/components/assets/visualStudio.png";
import CapsuleHubLogo from "@/components/assets/CapsuleHubLogo.png";
import CapsuleImg from "@/components/assets/capsule.png";

import { saveCapsuleDraft } from "@/lib/capsule-draft";
import { toast } from "sonner";
import SplashCursor from "@/components/SplashCursor";
import EditorialHeader, { CHROME_STORE_URL } from "@/components/layout/EditorialHeader";
import EditorialFooter from "@/components/layout/EditorialFooter";
import RotatingText from "@/components/RotatingText";
import { CelebrationBanner } from "@/components/CelebrationBanner";

const CELEBRATION_BANNER_HEIGHT = 40;

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
const EXTENSION_SERVICE_STATUS: ExtensionServiceStatus = "up";

const EXTENSION_DOWN_BANNER = {
    title: "MAINTENANCE",
    message: "The extension service is temporarily down while deployment is in progress. Thank you for your patience.",
    icon: XCircle,
    containerClass: "border-orange-400/65 bg-orange-500 text-white",
} as const;
const EXTENSION_DOWN_BANNER_HEIGHT = 36;

/* ── Editorial content data ─────────────────────────────────────────── */

const PROOF = [
    { value: "90,000+", label: "Users" },
    { value: "72", label: "Countries" },
    { value: "New & Notable", label: "Chrome Web Store" },
    { value: "Top 3", label: "Chrome extensions" },
];

const HOW_IT_WORKS = [
    { n: "01", title: "Generate", body: "Click once to capture your AI session as a Capsule." },
    { n: "02", title: "Drop", body: "Inject it into any other tool instantly." },
    { n: "03", title: "Share", body: "Send it to a teammate or your whole team." },
];

const USE_CASES = [
    { n: "01", title: "Chrome Extension", body: "Capture from ChatGPT, Claude, Gemini, Perplexity, DeepSeek and Gmail in one click.", href: CHROME_STORE_URL, external: true },
    { n: "02", title: "MCP for developers", body: "Connect Capsule Hub in Cursor and other MCP-compatible clients.", href: "/docs/mcp", external: false },
    { n: "03", title: "Personal chatbot", body: "Embed the Capsule Hub SDK on your own website chatbot and sync context.", href: "/docs/personal-chatbot", external: false },
    { n: "04", title: "Anthropic skills", body: "Save, search, read and version capsules straight from the terminal.", href: "/docs/anthropic-skills", external: false },
];

const MARQUEE_TOOLS = [
    { name: "ChatGPT", logo: ChatgptLogo },
    { name: "Claude", logo: ClaudeLogo },
    { name: "Gemini", logo: GeminiLogo },
    { name: "Gmail", logo: GmailLogo },
    { name: "Outlook", logo: OutlookLogo },
    { name: "Copilot", logo: CopilotLogo },
    { name: "Perplexity", logo: PerplexityLogo },
    { name: "Lovable", logo: LovableLogo },
    { name: "Replit", logo: ReplitLogo },
    { name: "DeepSeek", logo: DeepseekLogo },
    { name: "Slack", logo: SlackLogo },
    { name: "Figma", logo: FigmaLogo },
    { name: "Windsurf", logo: WindsurfLogo },
    { name: "Emergent", logo: EmergentLogo },
    { name: "Antigravity", logo: AntigravityLogo },
    { name: "VS Code", logo: VSCodeLogo },
];

const TEAM_ROWS = [
    { capsule: "Auth Spec v3", owner: "alex", role: "Engineering", updated: "2h ago" },
    { capsule: "Q2 Launch Brief", owner: "priya", role: "Marketing", updated: "yesterday" },
    { capsule: "Onboarding Flow Research", owner: "sam", role: "Design", updated: "3d ago" },
];

/* ── Hero capsule-flow visual ───────────────────────────────────────── */

/* A loose mesh of well-known tools; the capsule random-walks the edges.
   Coordinates are percentages of the square container. */
/* Ring of tools around VS Code at the centre. `s` optically normalises marks
   whose PNGs carry different amounts of built-in padding. */
const MESH_NODES = [
    { logo: ChatgptLogo, alt: "ChatGPT", x: 16, y: 14, s: 0.95 },
    { logo: GmailLogo, alt: "Gmail", x: 50, y: 6, s: 1.05 },
    { logo: ClaudeLogo, alt: "Claude", x: 85, y: 15, s: 1 },
    { logo: VSCodeLogo, alt: "VS Code", x: 7, y: 48, s: 1 },
    { logo: CapsuleHubLogo, alt: "Capsule Hub", x: 48, y: 48, s: 1.15 },
    { logo: SlackLogo, alt: "Slack", x: 92, y: 50, s: 1.1 },
    { logo: GeminiLogo, alt: "Gemini", x: 15, y: 82, s: 1 },
    { logo: LovableLogo, alt: "Lovable", x: 49, y: 92, s: 0.85 },
    { logo: ReplitLogo, alt: "Replit", x: 84, y: 84, s: 0.9 },
];

/* Outer ring plus four diagonal spokes into the centre — no edge crossings */
const MESH_EDGES: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 5],
    [5, 8],
    [8, 7],
    [7, 6],
    [6, 3],
    [3, 0],
    [4, 0],
    [4, 2],
    [4, 6],
    [4, 8],
];

const MESH_NEIGHBORS = MESH_NODES.map((_, i) =>
    MESH_EDGES.filter((e) => e.includes(i)).map(([a, b]) => (a === i ? b : a))
);

/* Matches RotatingText's default 2600ms cadence so the capsule and the
   headline change in the same rhythm instead of competing for attention. */
const FLOW_HOP_MS = 2600;

const FlowVisual = () => {
    const [walk, setWalk] = useState({ node: 4, prev: -1 });

    useEffect(() => {
        const t = setInterval(() => {
            setWalk(({ node, prev }) => {
                const ahead = MESH_NEIGHBORS[node].filter((n) => n !== prev);
                const pool = ahead.length ? ahead : MESH_NEIGHBORS[node];
                return { node: pool[Math.floor(Math.random() * pool.length)], prev: node };
            });
        }, FLOW_HOP_MS);
        return () => clearInterval(t);
    }, []);

    const pos = MESH_NODES[walk.node];

    return (
        <div className="relative aspect-square max-w-[320px] mx-auto">
            {/* Dotted edges of the mesh */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {MESH_EDGES.map(([a, b]) => (
                    <line
                        key={`${a}-${b}`}
                        x1={MESH_NODES[a].x}
                        y1={MESH_NODES[a].y}
                        x2={MESH_NODES[b].x}
                        y2={MESH_NODES[b].y}
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="text-neutral-300 dark:text-neutral-700"
                    />
                ))}
            </svg>

            {/* Tool nodes — bg patch masks the lines passing underneath */}
            {MESH_NODES.map((node) => (
                <div
                    key={node.alt}
                    className="absolute flex items-center justify-center w-14 h-14 bg-white dark:bg-[#0c0c0e] z-10"
                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
                >
                    <img
                        src={node.logo}
                        alt={node.alt}
                        className="w-9 h-9 object-contain"
                        style={{ transform: `scale(${node.s})` }}
                    />
                </div>
            ))}

            {/* Capsule random-walking the mesh, edge by edge */}
            <motion.img
                src={CapsuleImg}
                alt="Capsule"
                className="absolute h-6 w-6 object-contain z-20 drop-shadow-md"
                style={{ transform: "translate(-50%, -50%)" }}
                initial={false}
                animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
            />
        </div>
    );
};

/* ── Reusable CTA button ────────────────────────────────────────────── */

const AddToChrome = ({ big = false }: { big?: boolean }) => (
    <a
        href={CHROME_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 font-semibold bg-orange-500 text-white hover:bg-neutral-950 dark:hover:bg-white dark:hover:text-neutral-950 transition-colors ${big ? "px-9 py-5 text-base" : "px-7 py-4 text-sm"}`}
    >
        Add to Chrome. It's Free! <span>→</span>
    </a>
);

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
    const showExtensionDownBanner = EXTENSION_SERVICE_STATUS === "down";
    const ExtensionServiceIcon = EXTENSION_DOWN_BANNER.icon;

    const [showCelebration, setShowCelebration] = useState(true);
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const smoothScrollToStudio = () => {
        const section = studioSectionRef.current;
        if (!section) return;
        const targetY = section.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: targetY, behavior: "smooth" });
    };

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

    const celebrationOffset = showCelebration ? CELEBRATION_BANNER_HEIGHT : 0;
    const bannerOffset = celebrationOffset + (showExtensionDownBanner ? EXTENSION_DOWN_BANNER_HEIGHT : 0);

    return (
        <div className="editorial relative min-h-screen max-w-[100vw] overflow-x-clip">
            <SplashCursor
                className="splash-cursor opacity-[0.45] dark:opacity-[0.4]"
                DENSITY_DISSIPATION={2.4}
                COLOR_UPDATE_SPEED={14}
            />

            <AnimatePresence>
                {showCelebration && <CelebrationBanner onClose={() => setShowCelebration(false)} />}
            </AnimatePresence>
            {showExtensionDownBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`fixed inset-x-0 top-0 z-[60] flex h-[36px] items-center justify-center border-b px-4 text-center ${EXTENSION_DOWN_BANNER.containerClass}`}
                    style={{ top: `${celebrationOffset}px` }}
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

            <div style={{ paddingTop: bannerOffset }}>
                <EditorialHeader topOffset={bannerOffset} />

                <main>
                    {/* ── Hero ── */}
                    <section className="bg-white dark:bg-[#0c0c0e]">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10 pt-16 md:pt-24 pb-16 md:pb-20">
                            <div className="grid grid-cols-12 gap-8 items-center">
                                <div className="col-span-12 lg:col-span-7">
                                    <h1 className="editorial-serif italic text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[1.06] tracking-[-0.01em] text-neutral-950 dark:text-white">
                                        You should never have to explain your work{" "}
                                        <RotatingText
                                            phrases={[
                                                { text: "twice.", className: "text-violet-700 dark:text-violet-400" },
                                                { text: "to every new chat.", className: "text-violet-700 dark:text-violet-400" },
                                                { text: "tool after tool.", className: "text-violet-700 dark:text-violet-400" },
                                            ]}
                                        />
                                    </h1>
                                    <p className="mt-7 text-lg leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-xl">
                                        A Capsule is your context, captured once: the goals, decisions
                                        and files behind your work, ready to drop into any AI tool.
                                    </p>
                                    <div className="mt-9 flex items-center gap-4 flex-wrap">
                                        <AddToChrome />
                                        <button
                                            onClick={smoothScrollToStudio}
                                            className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white hover:border-neutral-950 dark:hover:border-white transition-colors"
                                        >
                                            Try it now ↓
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-12 lg:col-span-5">
                                    <FlowVisual />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Social proof strip ── */}
                    <section className="bg-white dark:bg-[#0c0c0e] border-y border-neutral-200 dark:border-neutral-800">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
                            <div className="grid grid-cols-2 md:grid-cols-4">
                                {PROOF.map((f, i) => (
                                    <div
                                        key={f.label}
                                        className={`py-8 md:py-10 px-2 md:px-8 ${i > 0 ? "md:border-l md:border-neutral-200 dark:md:border-neutral-800" : ""}`}
                                    >
                                        <div className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white whitespace-nowrap">
                                            {f.value}
                                        </div>
                                        <div className="editorial-label text-neutral-400 dark:text-neutral-500 mt-1.5">{f.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── How it works ── */}
                    <section id="how" className="bg-white dark:bg-[#0c0c0e]">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-20 md:py-28">
                            <p className="editorial-label text-orange-600 dark:text-orange-400 mb-6">01 | How it works</p>
                            <h2 className="text-4xl md:text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-neutral-950 dark:text-white mb-14">
                                Three moves. That's the whole product.
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3">
                                {HOW_IT_WORKS.map((s, i) => (
                                    <div
                                        key={s.n}
                                        className={`py-8 md:py-2 md:px-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800" : ""} ${i === 0 ? "md:pl-0" : ""}`}
                                    >
                                        <span className="text-sm font-medium tabular-nums text-orange-600 dark:text-orange-400">{s.n}</span>
                                        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">{s.title}</h3>
                                        <p className="mt-3 text-[0.95rem] leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-xs">{s.body}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Ways to use it */}
                            <div className="mt-20">
                                <p className="editorial-label text-neutral-400 dark:text-neutral-500 mb-2">And wherever you work</p>
                                {USE_CASES.map((u) => {
                                    const inner = (
                                        <div className="group grid grid-cols-12 gap-4 py-6 border-t border-neutral-200 dark:border-neutral-800 last:border-b-0">
                                            <span className="col-span-2 sm:col-span-1 text-sm font-medium tabular-nums text-violet-700 dark:text-violet-400">{u.n}</span>
                                            <span className="col-span-10 sm:col-span-3 text-lg font-semibold tracking-[-0.01em] text-neutral-950 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                                                {u.title}
                                            </span>
                                            <p className="col-span-12 sm:col-span-7 text-[0.95rem] leading-relaxed text-neutral-500 dark:text-neutral-400">{u.body}</p>
                                            <span className="hidden sm:block sm:col-span-1 text-right text-neutral-300 dark:text-neutral-600 group-hover:text-violet-700 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all">→</span>
                                        </div>
                                    );
                                    return u.external ? (
                                        <a key={u.n} href={u.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                                    ) : (
                                        <Link key={u.n} to={u.href} className="block">{inner}</Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── Supported tools marquee ── */}
                    <section className="bg-white dark:bg-[#0c0c0e] border-y border-neutral-200 dark:border-neutral-800 py-10 overflow-hidden">
                        <p className="editorial-label text-neutral-400 dark:text-neutral-500 text-center mb-8">
                            Works across every tool you already use
                        </p>
                        <div className="relative">
                            <div className="editorial-marquee flex w-max items-center gap-12 px-6">
                                {[...MARQUEE_TOOLS, ...MARQUEE_TOOLS].map((t, i) => (
                                    <span key={`${t.name}-${i}`} className="flex items-center gap-2.5 shrink-0">
                                        <img src={t.logo} alt={t.name} className="h-6 w-6 object-contain grayscale opacity-80 dark:invert" />
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{t.name}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Teams ── */}
                    <section id="teams" className="bg-white dark:bg-[#0c0c0e]">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-20 md:py-28">
                            <div className="grid grid-cols-12 gap-8 md:gap-10 items-center">
                                <div className="col-span-12 md:col-span-5">
                                    <p className="editorial-label text-violet-700 dark:text-violet-400 mb-6">02 | Teams</p>
                                    <h2 className="text-4xl md:text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-neutral-950 dark:text-white">
                                        Context is a team sport.
                                    </h2>
                                    <p className="mt-6 text-base leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-sm">
                                        Shared capsules live in team workspaces with role-based access.
                                        When someone hands you work, they hand you the context with it:
                                        every decision, file and prompt that got it there.
                                    </p>
                                </div>
                                <div className="col-span-12 md:col-span-6 md:col-start-7">
                                    {/* Team workspace mock */}
                                    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111114]">
                                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
                                            <span className="editorial-label text-neutral-950 dark:text-white">Workspace | Product</span>
                                            <span className="editorial-label text-neutral-400 dark:text-neutral-500">6 members</span>
                                        </div>
                                        {TEAM_ROWS.map((r) => (
                                            <div key={r.capsule} className="grid grid-cols-12 gap-2 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 items-baseline">
                                                <span className="col-span-6 sm:col-span-5 text-sm font-medium text-neutral-950 dark:text-white truncate">{r.capsule}</span>
                                                <span className="col-span-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">@{r.owner}</span>
                                                <span className="hidden sm:block sm:col-span-2 editorial-label text-violet-700 dark:text-violet-400">{r.role}</span>
                                                <span className="col-span-3 sm:col-span-2 text-xs text-neutral-400 dark:text-neutral-500 text-right">{r.updated}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CapsuleIndex callout */}
                            <div className="mt-16 bg-[#EDF0F3] dark:bg-neutral-950 border border-transparent dark:border-neutral-800 p-8 md:p-10 grid grid-cols-12 gap-6 items-center">
                                <div className="col-span-12 md:col-span-8">
                                    <p className="editorial-label text-orange-600 dark:text-orange-400 mb-4">Under the hood | CapsuleIndex</p>
                                    <p className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white max-w-2xl">
                                        Graph-based retrieval that stays cheap as your context scales.
                                    </p>
                                </div>
                                <div className="col-span-12 md:col-span-4 md:text-right">
                                    <span className="editorial-label text-neutral-500 dark:text-neutral-500">Same speed at 10 capsules or 10,000</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Capsule Studio (functionality preserved) ── */}
                    <section id="studio" ref={studioSectionRef} className="bg-white dark:bg-[#0c0c0e] border-t border-neutral-200 dark:border-neutral-800 scroll-mt-24">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-20 md:py-28">
                            <p className="editorial-label text-orange-600 dark:text-orange-400 mb-6">03 | Try it now</p>
                            <h2 className="text-4xl md:text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-neutral-950 dark:text-white mb-4">
                                Build a capsule right here.
                            </h2>
                            <p className="text-base leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-xl mb-12">
                                Drag the logos in, drop your own files, paste text. This is the real thing.
                            </p>

                            <div className="relative space-y-6 max-w-5xl mx-auto">
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
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700"
                                        >
                                            <span className="h-2 w-2 bg-orange-500" />
                                            <span className="text-sm font-semibold text-neutral-950 dark:text-white">
                                                {files.length + chunks.length} item{files.length + chunks.length !== 1 ? 's' : ''} added
                                            </span>
                                        </motion.div>
                                    </motion.div>
                                )}
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    onViewportEnter={() => setLogosActivated(true)}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="pointer-events-none absolute inset-0" aria-hidden>
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
                                                        ? {
                                                            opacity: 1,
                                                            x: isMobile ? (logo.side === "left" ? -20 : 20) : logo.x,
                                                            y: isMobile ? logo.y * 0.85 : logo.y,
                                                            scale: 1,
                                                            filter: "blur(0px)"
                                                        }
                                                        : { opacity: 0, x: 0, y: 0, scale: 0.3, filter: "blur(10px)" }
                                                }
                                                transition={{
                                                    duration: 2.3,
                                                    delay: logo.delay,
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                                className={`absolute top-1/2 z-[20] pointer-events-auto ${logo.side === "left" ? "left-0" : "right-0"}`}
                                            >
                                                <motion.div
                                                    drag
                                                    dragSnapToOrigin
                                                    dragElastic={0.1}
                                                    onDragStart={() => setIsDragging(true)}
                                                    onDragEnd={(_, info) => {
                                                        setIsDragging(false);
                                                        const canvas = document.getElementById("studio-canvas");
                                                        if (canvas) {
                                                            const rect = canvas.getBoundingClientRect();
                                                            const clientX = info.point.x - window.scrollX;
                                                            const clientY = info.point.y - window.scrollY;

                                                            // Bounding rect check
                                                            const isInsideRect = (
                                                                clientX >= rect.left &&
                                                                clientX <= rect.right &&
                                                                clientY >= rect.top &&
                                                                clientY <= rect.bottom
                                                            );

                                                            // DOM hit check as a fallback (robust for mobile scrolling/zoom)
                                                            const elementAtPoint = document.elementFromPoint(clientX, clientY);
                                                            const isInsideDOM = elementAtPoint && (
                                                                elementAtPoint.id === "studio-canvas" ||
                                                                elementAtPoint.closest("#studio-canvas") !== null
                                                            );

                                                            if (isInsideRect || isInsideDOM) {
                                                                const logoNames: Record<string, string> = {
                                                                    ChatGPT: "chatgpt_context.json",
                                                                    Claude: "claude_artifact.md",
                                                                    Gmail: "gmail_thread.eml",
                                                                    Figma: "figma_design.png",
                                                                    Perplexity: "perplexity_search.json",
                                                                    Gemini: "gemini_prompt.txt",
                                                                    DeepSeek: "deepseek_chat.json",
                                                                    Windsurf: "windsurf_workspace.zip",
                                                                    Slack: "slack_history.txt",
                                                                    Outlook: "outlook_email.msg"
                                                                };
                                                                const fileName = logoNames[logo.alt] || "context_source.txt";
                                                                const nextId = Math.random().toString(36).slice(2);
                                                                setFiles((prev) => [
                                                                    ...prev,
                                                                    {
                                                                        id: nextId,
                                                                        file: new File([""], fileName),
                                                                        name: fileName,
                                                                        type: fileName.endsWith(".json")
                                                                            ? "application/json"
                                                                            : fileName.endsWith(".md")
                                                                                ? "text/markdown"
                                                                                : "text/plain",
                                                                        size: Math.floor(Math.random() * 12000) + 4000
                                                                    }
                                                                ]);
                                                                toast.success(`Absorbed ${logo.alt} context!`);
                                                            }
                                                        }
                                                    }}
                                                    className="cursor-grab active:cursor-grabbing touch-none"
                                                >
                                                    <motion.img
                                                        src={logo.src}
                                                        alt={logo.alt}
                                                        className="h-8 w-8 sm:h-14 sm:w-14 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white p-1 sm:p-1.5 shadow-md select-none"
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
                                            </motion.div>
                                        ))}
                                    </div>

                                    <Card className="relative z-10 p-5 sm:p-6 bg-transparent sm:bg-white dark:sm:bg-[#111114] border-0 sm:border border-neutral-200 dark:border-neutral-800 shadow-none">
                                        {/* Drag overlay */}
                                        {isDragging && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-50 flex items-center justify-center bg-violet-700/10 border-2 border-dashed border-violet-700 dark:border-violet-400"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                    >
                                                        <Upload className="h-12 w-12 mx-auto text-violet-700 dark:text-violet-400 mb-2" />
                                                    </motion.div>
                                                    <p className="text-lg font-semibold text-neutral-950 dark:text-white">Drop files here</p>
                                                </div>
                                            </motion.div>
                                        )}
                                        {/* Canvas */}
                                        <div
                                            id="studio-canvas"
                                            className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
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
                                                            <Upload className="h-12 w-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-500" />
                                                        </motion.div>
                                                        <motion.p
                                                            animate={{ opacity: [0.6, 1, 0.6] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                            className="text-sm text-neutral-600 dark:text-neutral-300 max-w-sm font-medium"
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
                                        </div>
                                    </Card>
                                </motion.div>

                                <div className="w-full flex justify-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                                        <div className="flex flex-row items-center justify-center gap-3 w-full sm:w-auto">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="gap-2 flex-1 sm:flex-none border-neutral-300 dark:border-neutral-700 bg-white dark:bg-transparent text-neutral-950 dark:text-white hover:border-neutral-950 dark:hover:border-white hover:bg-transparent transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                Add Attachment
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="gap-2 flex-1 sm:flex-none border-neutral-300 dark:border-neutral-700 bg-white dark:bg-transparent text-neutral-950 dark:text-white hover:border-neutral-950 dark:hover:border-white hover:bg-transparent transition-colors"
                                                onClick={() => setTextDialogOpen(true)}
                                            >
                                                <MessageSquarePlus className="h-4 w-4" />
                                                Add Text
                                            </Button>
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={handleStartCreate}
                                            disabled={isAbsorbing}
                                            className="gap-2 w-full sm:w-auto bg-violet-700 hover:bg-violet-800 dark:bg-violet-500 dark:hover:bg-violet-400 text-white dark:text-neutral-950 font-semibold transition-colors"
                                        >
                                            {isAbsorbing ? "Creating..." : "Create Capsule"} →
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
                        </div>
                    </section>

                    {/* ── Final CTA ── */}
                    <section className="bg-[#EDF0F3] dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-24 md:py-32 text-center">
                            <p className="editorial-label text-neutral-500 dark:text-neutral-500 mb-8">90,000+ people already did</p>
                            <h2 className="editorial-serif italic text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.04] text-neutral-950 dark:text-white">
                            Never start from <span className="text-violet-700 dark:text-violet-400">zero</span> again.
                            </h2>
                            <div className="mt-12">
                                <AddToChrome big />
                            </div>
                        </div>
                    </section>
                </main>

                <EditorialFooter />

                <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add Text Chunk</DialogTitle>
                            <DialogDescription className="text-xs">Paste or type content to include in your draft capsule.</DialogDescription>
                        </DialogHeader>
                        <textarea
                            className="w-full min-h-[180px] border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                        className="fixed bottom-6 right-6 z-50 w-[320px] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#111114] shadow-2xl p-4"
                    >
                        <p className="text-sm font-semibold text-neutral-950 dark:text-white">Sign in to create your capsule</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                            Your attachments are ready and draft is saved. Continue after sign in.
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSignInPrompt(false)}
                                className="text-neutral-600 dark:text-neutral-300"
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

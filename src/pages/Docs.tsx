import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    Boxes,
    ChevronRight,
    FileStack,
    GitBranch,
    Layers,
    Link2,
    MousePointerClick,
    Network,
    Puzzle,
    Rocket,
    Shield,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TilantraLogo } from "@/components/Logo";


const SECTIONS = [
    { id: "overview", label: "Capsule Hub" },
    { id: "getting-started", label: "Getting started" },
    { id: "use-cases", label: "Use cases" },
    { id: "features", label: "Features" },
    { id: "mcp", label: "Capsule Hub MCP" },
    { id: "plans", label: "Plans & tiers" },
    { id: "platforms", label: "Supported platforms" },
    { id: "privacy", label: "Privacy & cleaning" },
] as const;

function isJwtValid(): boolean {
    const token = localStorage.getItem("guidera_jwt");
    const expStr = localStorage.getItem("guidera_jwt_exp");
    if (!token || !expStr) return false;
    const exp = parseInt(expStr, 10);
    return Math.floor(Date.now() / 1000) < exp;
}

function TocLink({ id, label }: { id: string; label: string }) {
    const location = useLocation();
    const active = location.hash === `#${id}` || (!location.hash && id === "overview");

    return (
        <a
            href={`#${id}`}
            className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                    ? "bg-indigo-500/10 font-medium text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            )}
        >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
            {label}
        </a>
    );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-indigo-500/20 dark:from-indigo-500/25 dark:to-violet-500/25">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">{children}</h2>
        </div>
    );
}

function Subheading({ children }: { children: React.ReactNode }) {
    return <h3 className="mt-8 text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h3>;
}

function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "space-y-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100",
                className
            )}
        >
            {children}
        </div>
    );
}

export default function DocsPage() {
    const location = useLocation();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(isJwtValid());
    }, []);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.slice(1);
            const el = document.getElementById(id);
            if (el) {
                window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
            }
        }
    }, [location.hash]);

    const mcpSnippet = useMemo(
        () =>
            `"capsule-service": {
  "url": "https://backend.tilantra.com/mcp",
  "headers": {
    "X_API_KEY": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }
}`,
        []
    );

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/40 text-foreground dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.16] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_420px_at_0%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(700px_400px_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] dark:bg-[radial-gradient(900px_480px_at_0%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(800px_420px_at_100%_0%,rgba(139,92,246,0.18),transparent_55%)]" />

            <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                        <Link to="/" className="shrink-0 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                            <TilantraLogo className="h-8 w-auto" />
                        </Link>
                        <Separator orientation="vertical" className="hidden h-7 sm:block" />
                        <div className="hidden min-w-0 sm:block">
                            <p className="truncate text-xs font-semibold uppercase tracking-wider text-indigo-600/90 dark:text-indigo-400/90">
                                Documentation
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">Capsule Hub</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            className="hidden sm:inline-flex border-slate-200 dark:border-slate-700"
                        >
                            <Link to="/">Return to Home</Link>
                        </Button>
                        {loggedIn ? (
                            <Button asChild variant="outline" className="border-slate-200 dark:border-slate-700">
                                <Link to="/capsules">Open app</Link>
                            </Button>
                        ) : (
                            <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500">
                                <Link to="/login">Sign in</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:pt-14">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="mb-12 text-center lg:text-left"
                >
                    <Badge variant="secondary" className="mb-4 border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                        Official docs
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-violet-400">
                            Capsule Hub
                        </span>{" "}
                        <span className="text-slate-800 dark:text-slate-100">documentation</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300 lg:mx-0">
                        The bridge for your AI workflows: Never start from Zero again!
                    </p>
                </motion.div>

                <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
                    <aside className="lg:w-56 lg:shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <Card className="border-slate-200/80 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">On this page</CardTitle>
                                    <CardDescription className="text-xs">Jump to a section</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ScrollArea className="max-h-[min(70vh,520px)] pr-2">
                                        <nav className="flex flex-col gap-0.5 pb-2" aria-label="Documentation sections">
                                            {SECTIONS.map((s) => (
                                                <TocLink key={s.id} id={s.id} label={s.label} />
                                            ))}
                                        </nav>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1 space-y-20">
                        <section id="overview" className="scroll-mt-28">
                            <SectionTitle icon={Sparkles}>Capsule Hub</SectionTitle>
                            <Prose>
                                <p>
                                    <strong>Capsule Hub by Tilantra</strong> is a context-transfer layer for modern AI work. It turns chats and
                                    email threads into portable <strong>Capsules</strong>—structured bundles of goals, constraints, background,
                                    and attachments—so you can move work between models and tools without rebuilding context from scratch.
                                </p>
                                <p>
                                    Most teams lose hours re-explaining the same situation to every new chat. Capsule Hub makes that knowledge{" "}
                                    <strong>capture-once, inject-anywhere</strong>: from research in Gemini to execution in ChatGPT, from a Gmail
                                    thread to requirements in GPT, from a capsule in Cursor (via MCP) back to review in Claude—with versioning
                                    along the way.
                                </p>
                            </Prose>
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        title: "Universal AI bridge",
                                        body: "Move high-quality outputs between models and keep the narrative intact.",
                                        icon: Zap,
                                    },
                                    {
                                        title: "Team-ready",
                                        body: "Organize by department, see ownership, and align on the “golden prompt.”",
                                        icon: Users,
                                    },
                                    {
                                        title: "Versioned evolution",
                                        body: "Branch as a new capsule or stack versions as ideas mature.",
                                        icon: GitBranch,
                                    },
                                    {
                                        title: "IDE-aware",
                                        body: "Connect Capsules to your editor through MCP for code workflows.",
                                        icon: Puzzle,
                                    },
                                ].map((item) => (
                                    <Card
                                        key={item.title}
                                        className="border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/50"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                <CardTitle className="text-base">{item.title}</CardTitle>
                                            </div>
                                            <CardDescription className="text-sm leading-relaxed">{item.body}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        <section id="getting-started" className="scroll-mt-28">
                            <SectionTitle icon={Rocket}>Getting started</SectionTitle>
                            <Prose>
                                <p>
                                    Capsule Hub ships as a <strong>browser extension</strong>. After install, you capture context where you already
                                    work—inside supported chats and Gmail—and inject it elsewhere with drag and drop.
                                </p>
                            </Prose>
                            <ol className="mt-6 space-y-4">
                                {[
                                    {
                                        step: "Install the extension",
                                        detail: "Add Capsule Hub from the Chrome Web Store, or load the unpacked folder in Developer Mode for local builds.",
                                    },
                                    {
                                        step: "Sign in",
                                        detail: "Open the Capsule Hub icon in your toolbar and sign in with Google or your Tilantra account.",
                                    },
                                    {
                                        step: "Grant host permissions",
                                        detail: "Approve access for chat.openai.com, gemini.google.com, claude.ai, deepseek.com, and mail.google.com so capture and injection can run safely in-page.",
                                    },
                                    {
                                        step: "Pin the toolbar icon",
                                        detail: "Pin the Capsule Hub icon for fast access to your library and capture actions.",
                                    },
                                ].map((row, i) => (
                                    <li key={row.step} className="flex gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{row.step}</p>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{row.detail}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <Card className="mt-8 border-indigo-500/25 bg-indigo-500/[0.06] dark:bg-indigo-500/10">
                                <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tip</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            Stay logged into your AI accounts before capture for the cleanest thread harvesting.
                                        </p>
                                    </div>
                                    <ArrowRight className="hidden h-5 w-5 text-indigo-500 sm:block" aria-hidden />
                                </CardContent>
                            </Card>
                        </section>

                        <section id="use-cases" className="scroll-mt-28">
                            <SectionTitle icon={Layers}>Use cases</SectionTitle>
                            <Prose>
                                <p>
                                    Capsules are intentionally open-ended: they are <strong>structured context packets</strong> you can route across
                                    tools. Below are high-leverage patterns teams adopt first—each benefits from tags, team folders, versioning,
                                    and attachments.
                                </p>
                            </Prose>

                            <Subheading>Internal marketing brain</Subheading>
                            <Prose>
                                <p>
                                    Position Capsules as your <strong>shared narrative layer</strong>: positioning lines, approved claims,
                                    competitor notes, launch FAQs, and campaign snippets live in one library. Marketing, product, and sales can
                                    publish updates as new versions—so everyone injects the same vetted story into ChatGPT, Claude, or Gemini when
                                    drafting outbound copy, nurture emails, or sales decks.
                                </p>
                                <p>
                                    Practically: maintain team folders (for example, <em>Brand</em>, <em>Enterprise</em>, <em>Q2 launch</em>),
                                    capture winning chat refinements, and version the capsule when messaging shifts. The outcome is{" "}
                                    <strong>consistent voice</strong> without a weekly “reset the context” meeting.
                                </p>
                            </Prose>

                            <Subheading>Email to requirements to decks to code (multi-hop workflow)</Subheading>
                            <Prose>
                                <p>
                                    A powerful pipeline is <strong>Gmail → GPT → Figma → IDE</strong>, with a Capsule carrying state at every hop:
                                </p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>
                                        <strong>Capsule your email thread</strong> so scope, decisions, and risks are preserved as structured
                                        context—not forwarded screenshots.
                                    </li>
                                    <li>
                                        <strong>Drop into GPT</strong> for requirements engineering: constraints, acceptance criteria, edge cases,
                                        and open questions—then save as a <strong>new version</strong> as the spec tightens.
                                    </li>
                                    <li>
                                        <strong>Bring the same capsule into Figma</strong> (or your deck tool of choice) to align visuals and
                                        narrative with the locked requirements; version again when stakeholders revise copy or flows.
                                    </li>
                                    <li>
                                        <strong>Move v3 into your IDE</strong> via MCP (Cursor, Antigravity, Copilot-connected workflows) so the
                                        agent codes against the exact spec and file context—often <strong>without re-explaining the project</strong>{" "}
                                        in chat because the capsule is the briefing.
                                    </li>
                                </ul>
                                <p>
                                    Versioning is the glue: each milestone gets a traceable capsule state you can roll back to when scope creeps or
                                    when you need to compare “what we agreed in email” vs “what we shipped.”
                                </p>
                            </Prose>

                            <Subheading>Inter-agent communication via MCP</Subheading>
                            <Prose>
                                <p>
                                    Model Context Protocol connects assistants to tools and data. With <strong>Capsule Hub MCP</strong>, a capsule
                                    becomes a <strong>portable contract</strong> between agents: research summarized in one tool becomes executable
                                    context in another without manual handoff text.
                                </p>
                                <p>
                                    Example: a planning agent produces a capsule; a coding agent consumes it through MCP; a review agent receives
                                    the updated capsule after changes land. The capsule ID and version act as a{" "}
                                    <strong>shared reference point</strong> across steps—ideal for automation that must stay deterministic about
                                    “what was agreed.”
                                </p>
                            </Prose>

                            <Subheading>One agent, multiple capsules (context switching)</Subheading>
                            <Prose>
                                <p>
                                    The same assistant can behave differently depending on which capsule you attach. A <strong>security review</strong>{" "}
                                    capsule enforces threat-modeling questions; a <strong>growth experiment</strong> capsule enforces metrics and
                                    guardrails; a <strong>refactor</strong> capsule encodes module boundaries and test expectations.
                                </p>
                                <p>
                                    This pattern reduces prompt sprawl: you do not maintain three mega-system prompts— you maintain{" "}
                                    <strong>three capsules</strong> and swap them as modes. Teams often pair this with naming conventions and tags
                                    so the right capsule is searchable in seconds.
                                </p>
                            </Prose>

                            <Subheading>More patterns worth adopting</Subheading>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {[
                                    {
                                        title: "Sales engineering handoff",
                                        body: "Capture discovery calls and RFP answers as capsules so solutions engineers inject the same facts into proposals and demos.",
                                        icon: Users,
                                    },
                                    {
                                        title: "Incident response",
                                        body: "Version timelines, mitigations, and customer comms as the incident evolves; inject the latest version into any model for status drafting.",
                                        icon: Network,
                                    },
                                    {
                                        title: "Research synthesis",
                                        body: "Capture long Gemini or Perplexity sessions, then inject distilled capsules into Claude for critique or into ChatGPT for formatting.",
                                        icon: Sparkles,
                                    },
                                    {
                                        title: "Design ↔ engineering alignment",
                                        body: "Keep a capsule as the single source for UX copy, API contracts, and edge cases—inject into Figma comments and IDE agents alike.",
                                        icon: Boxes,
                                    },
                                ].map((u) => (
                                    <Card key={u.title} className="border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/50">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <u.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                                <CardTitle className="text-base">{u.title}</CardTitle>
                                            </div>
                                            <CardDescription className="text-sm leading-relaxed">{u.body}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        <section id="features" className="scroll-mt-28">
                            <SectionTitle icon={MousePointerClick}>Features</SectionTitle>
                            <Prose>
                                <p>
                                    These capabilities work together: attachments enrich the capsule, versioning preserves history, drag-and-drop
                                    makes injection instant, teams add governance, and dynamic context (where available) keeps payloads relevant.
                                </p>
                            </Prose>

                            <div className="mt-8 space-y-6">
                                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FileStack className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-xl">Attachments</CardTitle>
                                        </div>
                                        <CardDescription className="text-base leading-relaxed">
                                            Rich file support (20+ types) including PDFs, Markdown, text, code, and images—captured alongside chat
                                            context so your capsule is a complete artifact, not a pasted excerpt.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        On supported surfaces, Capsule Hub can harvest relevant attachments and normalize them for injection—so your
                                        next model sees both the conversation <em>and</em> the documents that matter.
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-xl">Versioning</CardTitle>
                                        </div>
                                        <CardDescription className="text-base leading-relaxed">
                                            When context changes, choose a fresh capsule or a new version to preserve lineage. Roll back, compare, and
                                            tag stable checkpoints—especially important for long-running specs and compliance-heavy workflows.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        Higher tiers unlock deeper history and a fuller version tree; versioning pairs naturally with team folders so
                                        “approved” states are obvious.
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <MousePointerClick className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-xl">Drag and drop injection</CardTitle>
                                        </div>
                                        <CardDescription className="text-base leading-relaxed">
                                            Open your library on a target platform, then drag the capsule into the chat input to inject the full
                                            context instantly—replacing enormous copy/paste chains.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        Specialized injectors adapt to each product’s DOM so injection feels native while keeping the experience clean.
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-xl">Teams</CardTitle>
                                        </div>
                                        <CardDescription className="text-base leading-relaxed">
                                            Organize capsules by department—Engineering, Product, Marketing—and collaborate on the evolving “perfect
                                            prompt” with transparent ownership.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        Team capabilities vary by plan: from viewing shared contexts to joining teams, and up to creating and
                                        administering team spaces for larger orgs.
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Link2 className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-xl">Dynamic context</CardTitle>
                                        </div>
                                        <CardDescription className="text-base leading-relaxed">
                                            On eligible tiers, dynamic context helps you add or refine capsule content as a conversation evolves—so the
                                            injected bundle stays semantically aligned without manual rewrites.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        This is especially valuable for long threads where only a subset of prior messages should influence the next
                                        step—think AI-powered semantic filtering rather than “dump everything.”
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section id="mcp" className="scroll-mt-28">
                            <SectionTitle icon={Puzzle}>Capsule Hub MCP</SectionTitle>
                            <Prose>
                                <p>
                                    <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting models to tools and data. Capsule
                                    Hub MCP bridges your capsules into IDEs like Cursor and Antigravity so development agents can pull the same
                                    context you curated in the browser.
                                </p>
                                <p>
                                    Typical flow: capture an idea as a capsule from ChatGPT, connect your MCP server in the IDE, let the agent work
                                    against that capsule, version the result, then drop the updated capsule into Claude for review—all without losing
                                    the thread of intent.
                                </p>
                            </Prose>
                            <Subheading>Setup</Subheading>
                            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-slate-600 dark:text-slate-300">
                                <li>
                                    Sign in at{" "}
                                    <a
                                        href="https://capsulehub.tilantra.com"
                                        className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        capsulehub.tilantra.com
                                    </a>
                                    .
                                </li>
                                <li>Open Settings and generate an API token.</li>
                                <li>Use the token with your MCP client configuration alongside your capsules.</li>
                            </ol>
                            <Subheading>Cursor configuration</Subheading>
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                In Cursor: Settings → MCPs and Tools → Add MCP server. Add a server entry like:
                            </p>
                            <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                                <code>{mcpSnippet}</code>
                            </pre>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                Replace <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">YOUR_API_KEY</code> with your
                                generated key. Antigravity and other MCP-capable clients follow the same pattern: point the client at the MCP URL
                                and supply headers as required.
                            </p>
                        </section>

                        <section id="plans" className="scroll-mt-28">
                            <SectionTitle icon={Sparkles}>Plans & tiers</SectionTitle>
                            <Prose>
                                <p>Choose the plan that matches how many capsules you run, how deep your history goes, and how your org collaborates.</p>
                            </Prose>
                            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[200px]">Feature</TableHead>
                                            <TableHead>Basic</TableHead>
                                            <TableHead>Pro</TableHead>
                                            <TableHead>Elite / Enterprise</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Price</TableCell>
                                            <TableCell>Free</TableCell>
                                            <TableCell>$12/mo</TableCell>
                                            <TableCell>Custom</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Capsule limit</TableCell>
                                            <TableCell>5</TableCell>
                                            <TableCell>15</TableCell>
                                            <TableCell>Unlimited</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Team contexts</TableCell>
                                            <TableCell>View only</TableCell>
                                            <TableCell>Join teams</TableCell>
                                            <TableCell>Create &amp; admin</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Versioning</TableCell>
                                            <TableCell>Direct create</TableCell>
                                            <TableCell>Partial history</TableCell>
                                            <TableCell>Full version tree</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Attachments</TableCell>
                                            <TableCell>None</TableCell>
                                            <TableCell>All types</TableCell>
                                            <TableCell>All types + priority support</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Dynamic context</TableCell>
                                            <TableCell>No</TableCell>
                                            <TableCell>No</TableCell>
                                            <TableCell>AI-powered semantic filter</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        <section id="platforms" className="scroll-mt-28">
                            <SectionTitle icon={Network}>Supported platforms</SectionTitle>
                            <Prose>
                                <p>
                                    Capsule Hub integrates deeply with each product’s UI for capture and injection. Support levels reflect what is
                                    possible on that surface—chat platforms generally support full capture + inject, while Gmail is optimized for
                                    turning threads into AI-ready capsules.
                                </p>
                            </Prose>
                            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Platform</TableHead>
                                            <TableHead>Support level</TableHead>
                                            <TableHead className="min-w-[220px]">Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">ChatGPT</TableCell>
                                            <TableCell>Full</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">PDF interception and attachment harvesting where applicable.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Google Gemini / AI Studio</TableCell>
                                            <TableCell>Full</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">Native UI hooks for capture and injection flows.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Claude</TableCell>
                                            <TableCell>Full</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">Multi-turn conversation capture with clean injection.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">DeepSeek</TableCell>
                                            <TableCell>Full</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">Optimized for responsive context injection.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Gmail</TableCell>
                                            <TableCell>Context</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">Email thread → capsule for downstream AI work.</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        <section id="privacy" className="scroll-mt-28">
                            <SectionTitle icon={Shield}>Privacy & cleaning</SectionTitle>
                            <Prose>
                                <p>
                                    Capsule Hub is built for professional use. We utilize industry-standard <strong>Encryption at Rest (AES-256)</strong> to protect your conversational data, media attachments, and vector chunks. 
                                </p>
                                <p>
                                    We act as a trusted custodian of your data, enabling advanced features like RAG and multi-modal parsing while ensuring your information is protected from unauthorized access or database breaches.
                                </p>
                                <p>
                                    For detailed information on our data handling practices, please review our{" "}
                                    <Link
                                        to="/docs/privacy"
                                        className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                                    >
                                        Full Privacy Policy
                                    </Link>.
                                </p>
                            </Prose>
                            <Card className="mt-8 border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Enterprise</CardTitle>
                                    <CardDescription>
                                        For custom integrations, Slack connectivity, or API-first access, email{" "}
                                        <a
                                            href="mailto:support@tilantra.com"
                                            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                                        >
                                            support@tilantra.com
                                        </a>
                                        .
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </section>

                        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-white/50 to-violet-500/10 p-6 dark:from-indigo-500/15 dark:via-slate-950/40 dark:to-violet-500/15 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Ready to stop starting from zero?</p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    Install Capsule Hub, capture your best context once, and inject it everywhere you work.
                                </p>
                            </div>
                            <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500">
                                <Link to="/login">
                                    Get started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

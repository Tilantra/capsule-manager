import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Building2, Zap, Database, GitBranch, Users, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TilantraLogo } from "@/components/Logo";
import CapsuleUSB from "@/components/assets/CapsuleUSB.png";

const PROBLEM_POINTS = [
    { bold: "WHAT vs WHY:", rest: " Docs tell you what was built, but never why. When an employee offboards, the intent vanishes." },
    { bold: "Months lost:", rest: " New hires re-learn trivial knowledge across 22+ tools from scratch." },
    { bold: "Stateless AI:", rest: " Agents reset every session — no long-term project memory to act autonomously." },
];

const SOLUTION_POINTS = [
    { icon: GitBranch, title: "Automated Extraction", desc: "22+ integrations map employee intent automatically." },
    { icon: Database, title: "Real-Time Versioning", desc: "Every decision stored as a versioned, queryable artifact." },
    { icon: Zap, title: "Hardware-Secured USB", desc: "Instant Injection of knowledge into any AI model or new environment." },
];

const TECH_POINTS = [
    { label: "Unified Context", color: "from-indigo-500 to-violet-500", desc: "Unify fragmented operational knowledge into an AI-ready layer." },
    { label: "MCP Integration", color: "from-violet-500 to-purple-600", desc: "Context-aware, persistent, and queryable across sessions." },
    { label: "Knowledge Graphs", color: "from-amber-500 to-orange-500", desc: "Bridge the gap between web context and local code." },
];

export default function WhatsNext() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/55 to-purple-50/45 text-foreground overflow-x-hidden">

            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(124,58,237,0.10),transparent_60%),radial-gradient(900px_500px_at_100%_10%,rgba(37,99,235,0.10),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:44px_44px]" />

            {/* ── Header ── */}
            <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60">
                <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 sm:px-8">
                    <div className="flex items-center gap-6 sm:gap-8">
                        <Link to="/" className="shrink-0 rounded-lg">
                            <TilantraLogo className="h-8 w-auto" />
                        </Link>
                        <Link to="/" className="hidden sm:block text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
                            Home
                        </Link>
                        <Link to="/docs" className="hidden sm:block text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
                            Docs
                        </Link>
                        <span className="hidden sm:block text-sm font-semibold text-indigo-600 border-b-2 border-indigo-500 pb-0.5">
                            {`What's Next`}
                        </span>
                    </div>
                    <div>
                        <Button
                            disabled
                            className="bg-slate-200 text-slate-500 cursor-not-allowed px-6 py-2 text-sm font-semibold shadow-inner"
                        >
                            Waitlist Coming Soon
                        </Button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8">

                {/* ── HERO ── */}
                <motion.div
                    className="relative text-center max-w-4xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* CapsuleUSB centered with "The Vision" text on top of it */}
                    <div className="relative flex flex-col items-center justify-center -mt-16 -mb-8 pointer-events-none select-none">
                        <img
                            src={CapsuleUSB}
                            alt=""
                            aria-hidden
                            className="w-[200px] sm:w-[280px] opacity-[0.8] object-contain drop-shadow-2xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold tracking-tight text-slate-800 -mt-1">THE VISION</span>
                        </div>
                    </div>

                    <div className="relative z-10 px-6 -mt-20">
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-4">
                            <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                CapsuleHub
                            </span>
                            <br />
                            <span className="text-slate-700 text-4xl sm:text-5xl font-bold">
                                Context Beyond Contracts.
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                            A portable, AI-native knowledge layer that captures worker intent,
                            versions it in real-time, and injects it into any AI model — instantly.
                        </p>
                        <div className="flex justify-center">
                            <Button
                                disabled
                                className="px-8 py-6 rounded-full bg-slate-200 text-slate-500 cursor-not-allowed font-bold text-base shadow-inner"
                            >
                                Waitlist Coming Soon
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ── PROBLEM + SOLUTION side by side ── */}
                <div className="mb-12 grid lg:grid-cols-2 gap-6">

                    {/* Problem */}
                    <motion.div
                        className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/70 shadow-sm p-8"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">The Problem</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
                            Intent Vanishes when Employees Do
                        </h2>
                        <ul className="space-y-4">
                            {PROBLEM_POINTS.map((pt, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                                    <span><strong>{pt.bold}</strong>{pt.rest}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Solution */}
                    <motion.div
                        className="rounded-2xl bg-gradient-to-br from-indigo-50/80 to-violet-50/80 border border-indigo-200/60 shadow-sm p-8"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">The Solution</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
                            A portable, versioned Digital Capsule
                        </h2>
                        <ul className="space-y-4">
                            {SOLUTION_POINTS.map(({ icon: Icon, title, desc }) => (
                                <li key={title} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                                        <Icon className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{title}</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* ── MARKET OPPORTUNITY ── */}
                <motion.div
                    className="mb-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/70 shadow-sm p-8"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">Market Opportunity</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">Enterprise-scale Knowledge Loss</h2>
                    <div className="flex items-start gap-2 mb-4">
                        <Building2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-600">
                            <strong className="text-slate-800">Target:</strong> Global enterprises and remote-first companies managing high-turnover or high-complexity technical roles.
                        </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                        <p>
                            Enterprises with memory-augmented agents report{" "}
                            <strong className="text-slate-800">40–60% higher</strong> task-completion accuracy than stateless baselines.
                        </p>
                        <p>
                            Only <strong className="text-slate-800">5% of companies</strong> have a fully automated offboarding
                            process — the market is almost entirely greenfield.
                        </p>
                    </div>
                </motion.div>

                {/* ── TECHNOLOGY ── */}
                <motion.div
                    className="mb-12 rounded-2xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border border-violet-200/60 shadow-sm p-8"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-violet-600 uppercase">The Technology — Beyond RAG</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6">An AI-native Knowledge Layer</h2>
                    <div className="space-y-4">
                        {TECH_POINTS.map(({ label, color, desc }) => (
                            <div key={label} className="flex items-start gap-4">
                                <span className={`mt-0.5 shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${color}`}>
                                    {label}
                                </span>
                                <p className="text-slate-700 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── VISION ── */}
                <motion.div
                    className="mb-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/70 shadow-sm p-8"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">The Vision — Context Beyond Contracts</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">A Capsule that stands in for the Expert</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                        Our goal is to reach a state where a Capsule can effectively stand in for a departed expert.
                        By capturing the intent and decisions of an employee, we allow the enterprise to maintain a{" "}
                        <strong className="text-slate-800">digital copy</strong> of their operational logic.
                    </p>
                    <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-5">
                        <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            The End State:
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            No knowledge loss on offboarding. Every new hire inherits the institutional memory of their
                            predecessor — instantly, and with full context. AI agents that persist, reason,
                            and act with the depth of a seasoned employee.
                        </p>
                    </div>
                </motion.div>

                {/* ── CTA ── */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 sm:p-14 shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:44px_44px]" />
                        <motion.div
                            className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <h3 className="relative z-10 text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            Be First to Experience It
                        </h3>
                        <p className="relative z-10 text-indigo-100 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                            CapsuleHub is in active development. We will be opening early access soon.
                        </p>
                        <Button
                            disabled
                            className="relative z-10 inline-flex items-center gap-3 px-9 py-7 rounded-full bg-white/20 text-white/60 cursor-not-allowed font-bold text-base border border-white/20"
                        >
                            Waitlist Coming Soon
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

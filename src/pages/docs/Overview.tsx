import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Users, GitBranch, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocsLayout from "./DocsLayout";

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

function Prose({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100">
            {children}
        </div>
    );
}

export default function DocsOverview() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mb-12"
            >
                <Badge variant="secondary" className="mb-4 border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    Official docs
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-violet-400">
                        Capsule Hub
                    </span>{" "}
                    <span className="text-slate-800 dark:text-slate-100">documentation</span>
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
                    The bridge for your AI workflows: Never start from Zero again!
                </p>
            </motion.div>

            <div className="space-y-12">
                <section>
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
                                body: "Organize by department, see ownership, and align on the \"golden prompt.\"",
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
        </DocsLayout>
    );
}

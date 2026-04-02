import { motion } from "framer-motion";
import { Layers, Users, Network, Sparkles, Boxes, Mail, Code2, FileText, Lightbulb, Zap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function Subheading({ children }: { children: React.ReactNode }) {
    return <h3 className="mt-8 text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h3>;
}

function Prose({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100">
            {children}
        </div>
    );
}

export default function UseCases() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-12"
            >
                <div>
                    <SectionTitle icon={Layers}>Use cases</SectionTitle>
                    <Prose>
                        <p>
                            Capsules are intentionally open-ended: they are <strong>structured context packets</strong> you can route across
                            tools. Below are high-leverage patterns teams adopt first—each benefits from tags, team folders, versioning,
                            and attachments.
                        </p>
                    </Prose>
                </div>

                {/* Main Use Cases with Numbers */}
                <div className="space-y-6">
                    <Card className="border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 to-white dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-slate-950/50">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-lg">1</span>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">Internal marketing brain</CardTitle>
                                    <CardDescription className="mt-2 text-base leading-relaxed">
                                        Position Capsules as your <strong>shared narrative layer</strong>: positioning lines, approved claims,
                                        competitor notes, launch FAQs, and campaign snippets live in one library. Marketing, product, and sales can
                                        publish updates as new versions—so everyone injects the same vetted story.
                                    </CardDescription>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            Team collaboration
                                        </Badge>
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            Versioning
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-violet-200/80 bg-gradient-to-br from-violet-50/50 to-white dark:border-violet-800/50 dark:from-violet-950/30 dark:to-slate-950/50">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white shadow-lg">2</span>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">Email → Requirements → Code (Multi-hop workflow)</CardTitle>
                                    <CardDescription className="mt-2 text-base leading-relaxed">
                                        A powerful pipeline: <strong>Gmail → GPT → Figma → IDE</strong>. Capsule your email thread so scope and decisions are preserved,
                                        drop into GPT for requirements engineering, bring the capsule into Figma to align visuals, then move into your IDE via MCP
                                        so the agent codes against the exact spec—<strong>without re-explaining the project</strong>.
                                    </CardDescription>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                                            MCP Integration
                                        </Badge>
                                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                                            Multi-platform
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-800/50 dark:from-blue-950/30 dark:to-slate-950/50">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg">3</span>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">Inter-agent communication via MCP</CardTitle>
                                    <CardDescription className="mt-2 text-base leading-relaxed">
                                        With <strong>Capsule Hub MCP</strong>, a capsule becomes a <strong>portable contract</strong> between agents.
                                        A planning agent produces a capsule; a coding agent consumes it through MCP; a review agent receives the updated capsule.
                                        The capsule ID and version act as a shared reference point—ideal for deterministic automation.
                                    </CardDescription>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                            Automation
                                        </Badge>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                            IDE Integration
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-purple-200/80 bg-gradient-to-br from-purple-50/50 to-white dark:border-purple-800/50 dark:from-purple-950/30 dark:to-slate-950/50">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white shadow-lg">4</span>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">One agent, multiple capsules (Context switching)</CardTitle>
                                    <CardDescription className="mt-2 text-base leading-relaxed">
                                        The same assistant behaves differently depending on which capsule you attach. A <strong>security review</strong> capsule
                                        enforces threat-modeling; a <strong>growth experiment</strong> capsule enforces metrics; a <strong>refactor</strong> capsule
                                        encodes module boundaries. Swap capsules as modes instead of maintaining mega-system prompts.
                                    </CardDescription>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                            Flexibility
                                        </Badge>
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                            Prompt management
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <section>
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
                            {
                                title: "Customer support knowledge base",
                                body: "Build a library of support capsules with common issues, solutions, and troubleshooting steps. Support agents inject relevant context into any AI tool for faster response times.",
                                icon: Mail,
                            },
                            {
                                title: "Code review standards",
                                body: "Maintain capsules with your team's coding standards, security requirements, and architecture decisions. Inject into code review discussions for consistent feedback.",
                                icon: Code2,
                            },
                            {
                                title: "Legal & compliance documentation",
                                body: "Store compliance requirements, legal guidelines, and contract templates as versioned capsules. Inject into contract drafts or policy updates to maintain consistency.",
                                icon: FileText,
                            },
                            {
                                title: "Product ideation & brainstorming",
                                body: "Capture brainstorming sessions and feature discussions as capsules. Version them as ideas evolve, then inject into ChatGPT or Claude for refinement and feasibility analysis.",
                                icon: Lightbulb,
                            },
                            {
                                title: "API & integration documentation",
                                body: "Create capsules with API specifications, integration guides, and authentication flows. Developers inject these into coding assistants for accurate implementation.",
                                icon: Zap,
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
            </motion.div>
        </DocsLayout>
    );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, FileStack, GitBranch, Users, Link2, Play, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Features() {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <SectionTitle icon={MousePointerClick}>Features</SectionTitle>
                        <Prose>
                            <p>
                                These capabilities work together: attachments enrich the capsule, versioning preserves history, drag-and-drop
                                makes injection instant, teams add governance, and dynamic context (where available) keeps payloads relevant.
                            </p>
                        </Prose>
                    </div>

                    <div className="w-full md:w-64 shrink-0">
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                Feature Video
                            </p>
                            <motion.div 
                                layoutId="feature-video"
                                className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 cursor-pointer transition-all hover:ring-indigo-500/50 dark:bg-slate-950 dark:ring-slate-800"
                                onClick={() => setIsExpanded(true)}
                            >
                                <img 
                                    src="https://img.youtube.com/vi/3NH3ArEe0dE/maxresdefault.jpg" 
                                    alt="Video thumbnail"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-colors group-hover:bg-slate-950/40">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 dark:bg-slate-900/90">
                                        <Play className="h-4 w-4 ml-0.5 text-indigo-600 fill-indigo-600" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <div 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12"
                            onClick={() => setIsExpanded(false)}
                        >
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            />
                            
                            <motion.div 
                                layoutId="feature-video"
                                className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <iframe
                                    className="h-full w-full"
                                    src="https://www.youtube.com/embed/3NH3ArEe0dE?autoplay=1"
                                    title="feature video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                <button 
                                    className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                    onClick={() => setIsExpanded(false)}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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
                            "approved" states are obvious.
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
                            Specialized injectors adapt to each product's DOM so injection feels native while keeping the experience clean.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-xl">Teams</CardTitle>
                            </div>
                            <CardDescription className="text-base leading-relaxed">
                                Organize capsules by department—Engineering, Product, Marketing—and collaborate on the evolving "perfect
                                prompt" with transparent ownership.
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
                            step—think AI-powered semantic filtering rather than "dump everything."
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </DocsLayout>
    );
}

import { motion } from "framer-motion";
import { Network, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
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

export default function Platforms() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <SectionTitle icon={Network}>Supported platforms</SectionTitle>
                <Prose>
                    <p>
                        Capsule Hub integrates deeply with each product's UI for capture and injection. Support levels reflect what is
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

                <Card className="mt-8 border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 dark:border-indigo-500/50 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-purple-500/20">
                    <div className="flex items-center gap-4 p-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Connect ANY AI agent using MCP
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Use Model Context Protocol to integrate Capsule Hub with Cursor, Antigravity, Windsurf, and any MCP-compatible IDE or agent.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </DocsLayout>
    );
}

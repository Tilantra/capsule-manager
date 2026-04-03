import { motion } from "framer-motion";
import { Sparkles, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Plans() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
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
                                <TableHead>Elite</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Price</TableCell>
                                <TableCell>Free</TableCell>
                                <TableCell>$5/month</TableCell>
                                <TableCell>$15/month</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Capsule limit</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>15</TableCell>
                                <TableCell>Unlimited</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">MCP</TableCell>
                                <TableCell><Check className="h-5 w-5 text-green-600 dark:text-green-500" /></TableCell>
                                <TableCell><Check className="h-5 w-5 text-green-600 dark:text-green-500" /></TableCell>
                                <TableCell><Check className="h-5 w-5 text-green-600 dark:text-green-500" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Team contexts</TableCell>
                                <TableCell><X className="h-5 w-5 text-red-600 dark:text-red-500" /></TableCell>
                                <TableCell>Join teams</TableCell>
                                <TableCell>Create &amp; admin</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Versioning</TableCell>
                                <TableCell><X className="h-5 w-5 text-red-600 dark:text-red-500" /></TableCell>
                                <TableCell>Partial history</TableCell>
                                <TableCell>Full version tree</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Attachments</TableCell>
                                <TableCell><X className="h-5 w-5 text-red-600 dark:text-red-500" /></TableCell>
                                <TableCell>All types</TableCell>
                                <TableCell>All types + priority support</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Dynamic context</TableCell>
                                <TableCell><X className="h-5 w-5 text-red-600 dark:text-red-500" /></TableCell>
                                <TableCell><X className="h-5 w-5 text-red-600 dark:text-red-500" /></TableCell>
                                <TableCell>AI-powered semantic filter</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 space-y-4">
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">
                        * Enterprises will have custom tool integrations and pricing based on usage. Please reach out to{" "}
                        <a href="mailto:tilantra.technologies@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">
                            tilantra.technologies@gmail.com
                        </a>
                    </p>
                    <Card className="border-indigo-500/25 bg-indigo-500/[0.06] dark:bg-indigo-500/10">
                        <CardContent className="flex items-center justify-center py-6">
                            <p className="text-center text-[15px] text-slate-700 dark:text-slate-300">
                                <a
                                    href="https://capsulehub.tilantra.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                >
                                    Sign in to capsulehub.tilantra.com
                                </a>{" "}
                                to upgrade your tier!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </DocsLayout>
    );
}

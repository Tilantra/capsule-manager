import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
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

export default function GettingStarted() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
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
            </motion.div>
        </DocsLayout>
    );
}

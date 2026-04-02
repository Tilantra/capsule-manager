import { motion } from "framer-motion";
import { Shield } from "lucide-react";
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

export default function Privacy() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <SectionTitle icon={Shield}>Privacy Policy</SectionTitle>
                <Prose>
                    <p>
                        Capsule Hub is built for professional use: injection is designed to avoid noisy footprints, and sensitive metadata
                        handling is part of the product story. Enterprise customers with custom integrations (for example Slack) or
                        API-first access should contact Tilantra for tailored deployment options.
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
            </motion.div>
        </DocsLayout>
    );
}

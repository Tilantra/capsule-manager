import { motion } from "framer-motion";
import { Bot, Code2, Grip } from "lucide-react";
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

const BOOT_SNIPPET = `import CapsuleHub from 'https://esm.sh/@tilantra/capsule-hub';

// Boot SDK
CapsuleHub.boot({
  floating: false,
  autoSync: true,
  theme: 'dark'
});`;

const BUTTON_SNIPPET = `// Initialize sync button
CapsuleHub.initButton('#openCapsuleBtn');`;

const DROPZONE_SNIPPET = `// Handle drop & extraction
CapsuleHub.initDropZone('#dropZone', (capsule) => {
  const dz = document.getElementById('dropZone');
  const dt = document.getElementById('dropText');
  // Apply capsule payload to your chatbot context
});`;

export default function PersonalChatbot() {
    return (
        <DocsLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="space-y-8">
                <div>
                    <SectionTitle icon={Bot}>Capsule integration to personal chatbot</SectionTitle>
                    <Prose>
                        <p>
                            Add Capsule Hub to your custom website chatbot to let users inject complete context, constraints, and attachments in one drop.
                            This setup runs fully in-browser using the Capsule Hub SDK from CDN.
                        </p>
                    </Prose>
                </div>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-xl">1. Boot the SDK</CardTitle>
                        </div>
                        <CardDescription>Load and initialize Capsule Hub in your page script.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{BOOT_SNIPPET}</code>
                        </pre>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            <strong>floating: false</strong> removes floating widget UI, <strong>autoSync: true</strong> attempts session sync automatically,
                            and <strong>theme: 'dark'</strong> applies a dark-themed experience.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Grip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-xl">2. Wire open button and drop zone</CardTitle>
                        </div>
                        <CardDescription>Connect your button and target area to Capsule Hub hooks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{BUTTON_SNIPPET}</code>
                        </pre>
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{DROPZONE_SNIPPET}</code>
                        </pre>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Use the drop callback to map capsule payload into your chatbot prompt/context state before submission.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </DocsLayout>
    );
}

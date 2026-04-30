import { motion } from "framer-motion";
import { BrainCircuit, Terminal } from "lucide-react";
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

const INSTALL_SNIPPET = `git clone https://github.com/Tilantra/capsule-hub-skills.git
cd capsule-hub-skills
chmod +x setup.sh
./setup.sh`;

const CONFIG_SNIPPET = `export CAPSULE_API_BASE=https://backend.tilantra.com
source ~/.zshrc`;

const USAGE_SNIPPET = `/capsule-login
/capsule-search my project notes
/capsule-read <capsule_id> --version latest
/capsule-save --tag "auth refactor decisions"
/capsule-version <capsule_id> --new-version`;

export default function AnthropicSkills() {
    return (
        <DocsLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="space-y-8">
                <div>
                    <SectionTitle icon={BrainCircuit}>Capsules as skills for Anthropic users</SectionTitle>
                    <Prose>
                        <p>
                            Use Claude Code skills for Capsule Hub to save, search, read, and manage capsules directly from terminal workflows,
                            without loading tool schemas into context each turn.
                        </p>
                    </Prose>
                </div>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <CardTitle>Available skills</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                        <ul className="space-y-2">
                            <li><strong>/capsule-login</strong> - Authenticate once per terminal session</li>
                            <li><strong>/capsule-search</strong> - Search by keyword, tag, team, or filter</li>
                            <li><strong>/capsule-read</strong> - Read metadata, versions, messages, and attachments</li>
                            <li><strong>/capsule-save</strong> - Save current conversation as a new capsule</li>
                            <li><strong>/capsule-version</strong> - Add version, rollback, rename, share, or delete</li>
                            <li><strong>/capsule-team</strong> - Create teams and add members</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-xl">Installation</CardTitle>
                        </div>
                        <CardDescription>Requirements: Claude Code + Capsule Hub account on capsulehub.tilantra.com.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{INSTALL_SNIPPET}</code>
                        </pre>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            The setup script creates symlinks from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">~/.claude/skills/</code> to this repository.
                            Future updates only require <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">git pull</code>.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <CardTitle>One-time configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{CONFIG_SNIPPET}</code>
                        </pre>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Add the environment variable to your <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">~/.zshrc</code> or
                            <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">~/.bashrc</code>, then reload your shell.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <CardHeader>
                        <CardTitle>Usage</CardTitle>
                        <CardDescription>Run login once per session, then use capsule commands freely.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                            <code>{USAGE_SNIPPET}</code>
                        </pre>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            JWT is stored in your shell session and may expire based on account policy. If commands return 401, run <strong>/capsule-login</strong> again.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </DocsLayout>
    );
}

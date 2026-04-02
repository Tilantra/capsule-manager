import { motion } from "framer-motion";
import { useMemo } from "react";
import { Puzzle } from "lucide-react";
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

export default function MCPIntegration() {
    const mcpSnippet = useMemo(
        () =>
            `"capsule-service": {
  "url": "https://backend.tilantra.com/mcp",
  "headers": {
    "X_API_KEY": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }
}`,
        []
    );

    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <SectionTitle icon={Puzzle}>Capsule Hub MCP</SectionTitle>
                <Prose>
                    <p>
                        <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting models to tools and data. Capsule
                        Hub MCP bridges your capsules into IDEs like Cursor and Antigravity so development agents can pull the same
                        context you curated in the browser.
                    </p>
                    <p>
                        Typical flow: capture an idea as a capsule from ChatGPT, connect your MCP server in the IDE, let the agent work
                        against that capsule, version the result, then drop the updated capsule into Claude for review—all without losing
                        the thread of intent.
                    </p>
                </Prose>
                <Subheading>Setup</Subheading>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-slate-600 dark:text-slate-300">
                    <li>
                        Sign in at{" "}
                        <a
                            href="https://capsulehub.tilantra.com"
                            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            capsulehub.tilantra.com
                        </a>
                        .
                    </li>
                    <li>Open Settings and generate an API token.</li>
                    <li>Use the token with your MCP client configuration alongside your capsules.</li>
                </ol>
                <Subheading>Cursor configuration</Subheading>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    In Cursor: Settings → MCPs and Tools → Add MCP server. Add a server entry like:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 dark:border-slate-800">
                    <code>{mcpSnippet}</code>
                </pre>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Replace <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">YOUR_API_KEY</code> with your
                    generated key. Antigravity and other MCP-capable clients follow the same pattern: point the client at the MCP URL
                    and supply headers as required.
                </p>
            </motion.div>
        </DocsLayout>
    );
}

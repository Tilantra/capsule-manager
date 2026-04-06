import { Link, useLocation } from "react-router-dom";
import { BookOpen, FileText, Rocket, Layers, MousePointerClick, Puzzle, Sparkles, Network, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import TilantraLogo from "@/components/assets/Tilantra_blueLOGO.png";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { path: "/docs", label: "Capsule Hub", icon: BookOpen },
    { path: "/docs/getting-started", label: "Getting started", icon: Rocket },
    { path: "/docs/use-cases", label: "Use cases", icon: Layers },
    { path: "/docs/features", label: "Features", icon: MousePointerClick },
    { path: "/docs/mcp", label: "Capsule Hub MCP", icon: Puzzle },
    { path: "/docs/plans", label: "Plans & tiers", icon: Sparkles },
    { path: "/docs/platforms", label: "Supported platforms", icon: Network },
    { path: "/docs/privacy", label: "Privacy & cleaning", icon: Shield },
] as const;

function isJwtValid(): boolean {
    const token = localStorage.getItem("guidera_jwt");
    const expStr = localStorage.getItem("guidera_jwt_exp");
    if (!token || !expStr) return false;
    const exp = parseInt(expStr, 10);
    return Math.floor(Date.now() / 1000) < exp;
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(isJwtValid());
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/40 text-foreground dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.16] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_420px_at_0%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(700px_400px_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] dark:bg-[radial-gradient(900px_480px_at_0%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(800px_420px_at_100%_0%,rgba(139,92,246,0.18),transparent_55%)]" />

            <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                        <Link to="/" className="shrink-0 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                            <img src={TilantraLogo} alt="Tilantra" className="h-8 w-auto" />
                        </Link>
                        <Separator orientation="vertical" className="hidden h-7 sm:block" />
                        <div className="hidden min-w-0 sm:block">
                            <p className="truncate text-xs font-semibold uppercase tracking-wider text-indigo-600/90 dark:text-indigo-400/90">
                                Documentation
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">Capsule Hub</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            className="hidden sm:inline-flex border-slate-200 dark:border-slate-700"
                        >
                            <Link to="/">Return to Home</Link>
                        </Button>
                        {loggedIn ? (
                            <Button asChild variant="outline" className="border-slate-200 dark:border-slate-700">
                                <Link to="/capsules">Open app</Link>
                            </Button>
                        ) : (
                            <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500">
                                <Link to="/login">Sign in</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl">
                {/* Sticky Left Sidebar */}
                <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200/80 bg-white/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/30 lg:block">
                    <ScrollArea className="h-full py-8">
                        <nav className="space-y-1 px-4" aria-label="Documentation navigation">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-indigo-500/10 text-indigo-700 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        )}
                                    >
                                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12">
                    {children}
                </main>
            </div>
        </div>
    );
}

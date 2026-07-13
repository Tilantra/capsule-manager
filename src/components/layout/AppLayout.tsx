import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Menu, Settings, CreditCard, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { TilantraLogo } from "@/components/Logo";
import { useTheme } from "@/components/theme-provider";

import { motion } from "framer-motion";

const ThemeToggle = () => {
    const { setTheme } = useTheme();
    const btnClass =
        "inline-flex items-center justify-center h-9 w-9 text-xl leading-none text-gray-500 dark:text-slate-400 hover:text-primary transition-colors";
    return (
        <>
            <button
                onClick={() => setTheme("dark")}
                aria-label="Switch to dark mode"
                title="Switch to dark mode"
                className={`dark:hidden ${btnClass}`}
            >
                {"☽︎"}
            </button>
            <button
                onClick={() => setTheme("light")}
                aria-label="Switch to light mode"
                title="Switch to light mode"
                className={`hidden dark:inline-flex ${btnClass}`}
            >
                {"☀︎"}
            </button>
        </>
    );
};

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const client = new BrowserGuideraClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let lastToastTime = 0;
        const handleUnauthorized = () => {
            const now = Date.now();
            if (now - lastToastTime > 5000) {
                toast.error("Session expired. Please log in again.");
                lastToastTime = now;
            }
            navigate("/login");
        };

        window.addEventListener('guidera_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('guidera_unauthorized', handleUnauthorized);
    }, [navigate]);

    const handleLogout = () => {
        client.logout();
        navigate("/login");
    };

    const NavItems = () => (
        <motion.div 
            className="space-y-2 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                    Overview
                </h2>
                <div className="space-y-1">
                    <NavLink
                        to="/capsules"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                                : "text-gray-700 hover:bg-orange-500/10 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 hover:translate-x-1"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Capsules
                    </NavLink>
                    <NavLink
                        to="/teams"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                                : "text-gray-700 hover:bg-orange-500/10 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 hover:translate-x-1"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Users className="h-4 w-4" />
                        Teams
                    </NavLink>

                    <NavLink
                        to="/billing"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                                : "text-gray-700 hover:bg-orange-500/10 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 hover:translate-x-1"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <CreditCard className="h-4 w-4" />
                        Billing
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                                : "text-gray-700 hover:bg-orange-500/10 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 hover:translate-x-1"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </NavLink>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#040816] flex relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.16] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            {/* Desktop Sidebar */}
            <motion.aside 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 shadow-xl"
            >
                <motion.div
                    className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <TilantraLogo className="h-8 w-auto hover:scale-105 transition-transform duration-200" />
                    <ThemeToggle />
                </motion.div>
                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 pt-4">
                        <Button
                            onClick={() => navigate("/create-capsule")}
                            className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                        >
                            <Plus className="h-4 w-4" />
                            Create Capsule
                        </Button>
                    </div>
                    <NavItems />
                </div>
                <motion.div 
                    className="p-4 border-t border-gray-200 dark:border-slate-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:bg-destructive/10 transition-all duration-200 group"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                        Logout
                    </Button>
                </motion.div>
            </motion.aside>

            {/* Mobile Header */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shadow-lg"
            >
                <TilantraLogo className="h-8 w-auto" />
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button
                        onClick={() => navigate("/create-capsule")}
                        className="h-9 px-3 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" />
                        Create
                    </Button>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800">
                            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
                                <TilantraLogo className="h-8 w-auto" />
                            </div>
                            <NavItems />
                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 absolute bottom-0 w-full bg-white dark:bg-slate-950">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:bg-destructive/10 group"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                                    Logout
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe shadow-lg">
                <NavLink
                    to="/capsules"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${isActive
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
                        }`
                    }
                >
                    <LayoutDashboard className="h-5 w-5 mb-0.5" />
                    Capsules
                </NavLink>
                <NavLink
                    to="/teams"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${isActive
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
                        }`
                    }
                >
                    <Users className="h-5 w-5 mb-0.5" />
                    Teams
                </NavLink>
                <NavLink
                    to="/billing"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${isActive
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
                        }`
                    }
                >
                    <CreditCard className="h-5 w-5 mb-0.5" />
                    Billing
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${isActive
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
                        }`
                    }
                >
                    <Settings className="h-5 w-5 mb-0.5" />
                    Settings
                </NavLink>
            </nav>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 pt-16 md:pt-0 pb-16 md:pb-0 min-h-screen transition-all duration-300 ease-in-out relative z-10">
                <motion.div 
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}

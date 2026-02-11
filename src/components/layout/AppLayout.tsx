import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Menu, Maximize2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TilantraLogo from "@/components/assets/Tilantra_blueLOGO.png";

export default function AppLayout() {
    const navigate = useNavigate();
    const client = new BrowserGuideraClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        client.logout();
        navigate("/login");
    };

    const NavItems = () => (
        <div className="space-y-2 py-4">
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                    Overview
                </h2>
                <div className="space-y-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Capsules
                    </NavLink>
                    <NavLink
                        to="/network"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Maximize2 className="h-4 w-4" />
                        Network Explorer
                    </NavLink>
                    <NavLink
                        to="/teams"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Users className="h-4 w-4" />
                        Teams
                    </NavLink>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
                    <img src={TilantraLogo} alt="Tilantra" className="h-8 w-auto" />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <NavItems />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4">
                <img src={TilantraLogo} alt="Tilantra" className="h-8 w-auto" />
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
                            <img src={TilantraLogo} alt="Tilantra" className="h-8 w-auto" />
                        </div>
                        <NavItems />
                        <div className="p-4 border-t border-gray-200 dark:border-slate-800 absolute bottom-0 w-full bg-white dark:bg-slate-950">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen transition-all duration-300 ease-in-out">
                <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TilantraLogo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
    topOffset?: number;
}

const Header = ({ topOffset = 0 }: HeaderProps) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header
            className="fixed z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60"
            style={{ top: `${topOffset}px` }}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-3 sm:px-8"
            >
                <div className="flex items-center gap-6 sm:gap-8">
                    <Link to="/" className="shrink-0 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50">
                        <TilantraLogo className="h-8 w-auto" />
                    </Link>
                    <motion.div whileHover={{ y: -1 }} className="hidden sm:block">
                        <Link
                            to="/"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        >
                            Home
                        </Link>
                    </motion.div>
                    <motion.a
                        href="https://tilantra.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -1 }}
                        className="hidden sm:block text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                        About
                    </motion.a>
                    <motion.div whileHover={{ y: -1 }} className="hidden sm:block">
                        <Link
                            to="/docs"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        >
                            Docs
                        </Link>
                    </motion.div>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="hidden sm:block"
                    >
                        <Button
                            variant="ghost"
                            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                            onClick={() => navigate("/contact")}
                        >
                            Contact Us
                        </Button>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Button
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                    </motion.div>

                    {/* Mobile menu sheet */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[350px] p-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-gray-200 dark:border-slate-800 flex flex-col justify-between"
                        >
                            <div className="flex flex-col gap-6 pt-8">
                                <Link to="/" className="outline-none" onClick={() => setIsOpen(false)}>
                                    <TilantraLogo className="h-8 w-auto mb-4" />
                                </Link>
                                <hr className="border-gray-200 dark:border-slate-800" />
                                <Link
                                    to="/"
                                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors py-2 border-b border-gray-100 dark:border-slate-900"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Home
                                </Link>
                                <a
                                    href="https://tilantra.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors py-2 border-b border-gray-100 dark:border-slate-900"
                                    onClick={() => setIsOpen(false)}
                                >
                                    About
                                </a>
                                <Link
                                    to="/docs"
                                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors py-2 border-b border-gray-100 dark:border-slate-900"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Docs
                                </Link>
                                <Link
                                    to="/contact"
                                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Contact Us
                                </Link>
                            </div>
                            <div className="pb-4">
                                <Button
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-6 text-base font-semibold hover:from-indigo-500 hover:to-violet-500 shadow-lg"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/login");
                                    }}
                                >
                                    Sign In
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;

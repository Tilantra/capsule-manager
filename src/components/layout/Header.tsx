import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TilantraLogo } from "@/components/Logo";

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 sm:px-8"
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
                    <motion.div whileHover={{ y: -1 }} className="hidden sm:block">
                        <Link
                            to="/whats-next"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        >
                            What's Next
                        </Link>
                    </motion.div>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                </div>
            </motion.div>
        </header>
    );
};

export default Header;

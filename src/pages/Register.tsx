import { useState } from "react";
import { BrowserGuideraClient } from "../lib/guidera-browser-client";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, CheckCircle } from "lucide-react";
import { AuthBackground } from "../components/AuthBackground";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        full_name: "",
        company: "",
    });
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const client = new BrowserGuideraClient();
            await client.register({
                ...formData,
                models: ["gpt4", "llama3", "gemini2.5-flash"],
                teams: [],
                tier: "basic",
            });
            // Show success message
            setIsRegistered(true);
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Registration failed");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/30 dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816] text-foreground">
            {/* Grid overlay matching login page */}
            <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <AuthBackground />

            {/* Return to Home button — top right, matches login */}
            <motion.div
                className="absolute top-6 right-6 z-20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Button
                    asChild
                    variant="outline"
                    className="hidden sm:inline-flex border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80"
                >
                    <Link to="/">Return to Home</Link>
                </Button>
            </motion.div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 text-left">
                {/* Left side: Info */}
                <motion.div
                    className="hidden lg:block space-y-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <div className="space-y-4">
                        <motion.h1
                            className="text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <span style={{ color: '#1a4161ff' }}>Register</span>
                            <span className="text-black dark:text-white"> with </span><br />
                            <span style={{ color: '#6e4edf' }}>Capsule Hub</span>
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 dark:text-slate-400 max-w-xl leading-relaxed font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Manage your AI dreams with precision and scale to empower your modern AI systems with persistent, real-time intelligence.
                        </motion.p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <motion.div
                            className="flex items-start gap-3"
                            whileHover={{ scale: 1.05, x: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="mt-1 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 shadow-lg border border-primary/20">
                                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Drag & Drop</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Inject Context Easily</p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="flex items-start gap-3"
                            whileHover={{ scale: 1.05, x: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="mt-1 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 shadow-lg border border-purple-500/20">
                                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Cost Control</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Save upto 47% on your LLM costs</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Right side: Form */}
                <motion.div
                    className="flex justify-center lg:justify-end w-full"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <Card className="w-full max-w-md border border-gray-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-50" />

                        <CardHeader className="space-y-1 pt-8 text-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <CardTitle className="text-3xl font-bold dark:text-white">Create account</CardTitle>
                                <CardDescription className="text-base dark:text-slate-400">
                                    One account for Guidera &amp; Capsule Hub
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="pb-8 relative z-10 flex flex-col items-center justify-center min-h-[300px]">
                            {isRegistered ? (
                                <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in duration-500">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                        <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Successful!</h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Your account has been created. <br />
                                            Redirecting you to sign in...
                                        </p>
                                    </div>
                                    <Button asChild variant="link" className="text-blue-600">
                                        <Link to="/login">Click here if not redirected</Link>
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Label htmlFor="username" className="dark:text-slate-200">Username</Label>
                                            <Input
                                                id="username"
                                                placeholder="johndoe"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <Label htmlFor="full_name" className="dark:text-slate-200">Full Name</Label>
                                            <Input
                                                id="full_name"
                                                placeholder="John Doe"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                            />
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <Label htmlFor="email" className="dark:text-slate-200">Work Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 }}
                                    >
                                        <Label htmlFor="company" className="dark:text-slate-200">Company Name</Label>
                                        <Input
                                            id="company"
                                            placeholder="Acme Corp"
                                            value={formData.company}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.0 }}
                                    >
                                        <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50/50 dark:bg-slate-950/50 border-gray-200 dark:border-slate-800 py-6 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </motion.div>

                                    {error && (
                                        <motion.div
                                            className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </div>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            type="submit"
                                            className="w-full font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-2"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Creating Account...
                                                </div>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            )}

                            {!isRegistered && (
                                <motion.div
                                    className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Sign in instead
                                    </Link>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

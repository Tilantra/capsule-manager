
import { useState } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Brain } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";


import { motion } from "framer-motion";
import SplashCursor from "@/components/SplashCursor";
import EditorialHeader from "@/components/layout/EditorialHeader";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const nextPath = searchParams.get("next") || "/capsules";
    const sdkMode = searchParams.get("mode") === "sdk";

    const client = new BrowserGuideraClient();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError("");
            try {
                // Determine user info for "registration" if needed or fetch foofle profile info
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();

                // Authenticate with backend
                const jwtToken = await client.googleAuth(tokenResponse.access_token, {
                    email: userInfo.email,
                    username: userInfo.email?.split('@')[0],
                    full_name: userInfo.name,
                    company: "Default",
                    teams: [],
                    models: ["gpt4", "llama3", "gemini2.5-flash"],
                    tier: "elite"
                });

                if (sdkMode && window.opener) {
                    // SDK popup mode: relay credentials back to the opener and close.
                    // Decode exp from JWT; fall back to 15 days.
                    let exp = Math.floor(Date.now() / 1000) + 15 * 24 * 3600;
                    try {
                        const parts = jwtToken.split('.');
                        if (parts.length === 3) {
                            const payload = JSON.parse(atob(parts[1]));
                            if (payload.exp) exp = payload.exp;
                        }
                    } catch { /* ignore decode errors */ }

                    // Fetch tier (may differ from defaults above if user already existed)
                    let tier = "basic";
                    try {
                        const userDetails = await client.getSingleUser(userInfo.email);
                        tier = userDetails.tier || "basic";
                    } catch { /* fall back to basic */ }

                    window.opener.postMessage(
                        {
                            type: "CH_AUTH_SUCCESS",
                            token: jwtToken,
                            email: userInfo.email,
                            tier,
                            exp,
                        },
                        "*"   // Target origin is unknown (any third-party site); SDK validates source
                    );
                    window.close();
                    return;
                }

                window.location.href = nextPath;

            } catch (err: any) {
                console.error("Google login error:", err);
                const errorMessage = err.response?.data?.detail || err.message || "Google Sign In failed";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError("Google Sign In failed");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await client.login(email, password);
            window.location.href = nextPath;
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Login failed";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editorial relative min-h-screen overflow-hidden">
            <SplashCursor className="splash-cursor opacity-[0.45] dark:opacity-[0.4]" DENSITY_DISSIPATION={2.4} COLOR_UPDATE_SPEED={14} />
            <EditorialHeader />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 text-left">
                    {/* Left Side: Info */}
                    <motion.div
                        className="space-y-8 hidden lg:block"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="h-[3px] w-10 bg-orange-500" />
                                <p className="editorial-label text-neutral-400 dark:text-neutral-500">Capsule Hub | Sign in</p>
                            </div>
                            <motion.h1
                                className="text-5xl lg:text-6xl font-bold tracking-[-0.02em] text-neutral-950 dark:text-white leading-[1.08]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Capsule Hub <br />
                                <span className="text-violet-700 dark:text-violet-400">
                                    By Tilantra
                                </span>
                            </motion.h1>
                            <motion.p
                                className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                Never start from zero again.
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
                                <div className="mt-1 p-3 border border-neutral-200 dark:border-neutral-800">
                                    <Share2 className="h-6 w-6 text-violet-700 dark:text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">Context Transfer</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Share specialized knowledge capsules across teams instantly.</p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex items-start gap-3"
                                whileHover={{ scale: 1.05, x: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="mt-1 p-3 border border-neutral-200 dark:border-neutral-800">
                                    <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">Smart Context</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Maintain continuity across sessions and different AI models.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        className="flex justify-center lg:justify-end w-full"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <Card className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111114] relative">
                            <CardHeader className="space-y-1 pt-8 relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <CardTitle className="text-3xl font-bold text-center text-foreground">Welcome!</CardTitle>
                                    <CardDescription className="text-center text-base text-muted-foreground mt-2">
                                        Enter your credentials to access the dashboard.
                                    </CardDescription>
                                </motion.div>
                            </CardHeader>
                            <CardContent className="pb-8 relative z-10">
                                <div className="space-y-5">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Label htmlFor="email" className="text-sm font-semibold">Work Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6 transition-all"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" title="Password" className="text-sm font-semibold">Password</Label>
                                                <Link
                                                    to="/forgot-password"
                                                    className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6 transition-all"
                                            />
                                        </motion.div>

                                        {error && (
                                            <motion.div
                                                className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
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
                                            transition={{ delay: 0.8 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                type="submit"
                                                className="w-full font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-violet-700 hover:bg-violet-800 dark:bg-violet-500 dark:hover:bg-violet-400 dark:text-neutral-950"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-3">
                                                        <motion.div
                                                            className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        Authenticating...
                                                    </div>
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>

                                    <motion.div
                                        className="relative"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.9 }}
                                    >
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground font-semibold">
                                                Or sign in with
                                            </span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full py-6 text-sm font-medium border-border bg-background hover:bg-muted transition-all duration-200 shadow-md hover:shadow-lg"
                                            onClick={() => googleLogin()}
                                            disabled={loading}
                                        >
                                            <FcGoogle className="mr-2 h-5 w-5" />
                                            Continue with Google
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        className="mt-6 text-center text-sm text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.1 }}
                                    >
                                        Don't have an account?{" "}
                                        <Link
                                            to="/register"
                                            className="font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                                        >
                                            Register now
                                        </Link>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"}>
            <LoginContent />
        </GoogleOAuthProvider>
    );
}

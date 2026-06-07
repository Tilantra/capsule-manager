
import { useState, useEffect } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthBackground } from "@/components/AuthBackground";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const client = new BrowserGuideraClient();

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new link.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (!token) {
            setError("Token is missing");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await client.resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Failed to reset password";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/30 dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816] text-foreground">
            <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <AuthBackground />

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <Card className="border border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-50" />
                    
                    <CardHeader className="space-y-1 pt-8 relative z-10">
                        <CardTitle className="text-3xl font-bold text-center text-foreground">
                            {success ? "Success!" : "Set New Password"}
                        </CardTitle>
                        <CardDescription className="text-center text-base text-muted-foreground mt-2">
                            {success 
                                ? "Your password has been successfully updated." 
                                : "Choose a strong password to secure your account."
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-8 relative z-10">
                        {success ? (
                            <motion.div 
                                className="flex flex-col items-center justify-center space-y-6 pt-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <Button asChild className="w-full font-bold py-6 rounded-xl shadow-lg shadow-blue-500/20">
                                    <Link to="/login">Go to Login</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6 pl-10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6 pl-10 transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20"
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

                                <Button
                                    type="submit"
                                    className="w-full font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    disabled={loading || !token}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Updating Password...
                                        </div>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div >
    );
}

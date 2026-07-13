
import { useState } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthBackground } from "@/components/AuthBackground";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const client = new BrowserGuideraClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await client.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Failed to send reset link";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-gray-50 dark:bg-[#040816] text-foreground">
            <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <AuthBackground />

            <motion.div
                className="absolute top-6 left-6 z-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Button
                    asChild
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <Link to="/login">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </Button>
            </motion.div>

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <Card className="border border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-50" />
                    
                    <CardHeader className="space-y-1 pt-8 relative z-10">
                        <CardTitle className="text-3xl font-bold text-center text-foreground">
                            {success ? "Check your email" : "Reset Password"}
                        </CardTitle>
                        <CardDescription className="text-center text-base text-muted-foreground mt-2">
                            {success 
                                ? "If an account exists with this email, we've sent a password reset link." 
                                : "Enter your email address and we'll send you a link to reset your password."
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
                                <Button asChild className="w-full font-bold py-6 rounded-xl">
                                    <Link to="/login">Return to Login</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                    className="w-full font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            Sending Link...
                                        </div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

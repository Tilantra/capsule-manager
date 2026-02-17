
import { useState } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Brain } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { AuthBackground } from "@/components/AuthBackground";
import TilantraBlueLogo from "@/components/assets/Tilantra_blueLOGO.png";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const client = new BrowserGuideraClient();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError("");
            try {
                // Determine user info for "registration" if needed
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();

                // Call backend google-auth endpoint
                // We pass registration defaults just in case the backend creates a NEW user
                await client.googleAuth(tokenResponse.access_token, {
                    email: userInfo.email,
                    username: userInfo.email?.split('@')[0],
                    full_name: userInfo.name,
                    company: "Default",
                    teams: [],
                    models: ["gpt4", "llama3", "gemini2.5-flash"],
                    tier: "basic"
                });

                navigate("/");
            } catch (err: any) {
                console.error("Google login error:", err);
                setError(err.message || "Google Sign In failed");
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
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-background text-foreground">
            <AuthBackground />

            {/* Tilantra Logo - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <img src={TilantraBlueLogo} alt="Tilantra" className="h-12 w-auto" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 text-left">
                {/* Left Side: Info */}
                <div className="space-y-8 hidden lg:block">
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            CapsuleHub <br />
                            <span className="text-primary">By Tilantra</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                            Never start from zero again.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-card shadow-sm border border-border">
                                <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Context Transfer</h3>
                                <p className="text-sm text-muted-foreground">Share specialized knowledge capsules across teams instantly.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-card shadow-sm border border-border">
                                <Brain className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Smart Context</h3>
                                <p className="text-sm text-muted-foreground">Maintain continuity across sessions and different AI models.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex justify-center lg:justify-end w-full">
                    <Card className="w-full max-w-md border border-border shadow-2xl bg-card/95 backdrop-blur-xl">
                        <CardHeader className="space-y-1 pt-8">
                            <CardTitle className="text-3xl font-bold text-center text-foreground">Welcome!</CardTitle>
                            <CardDescription className="text-center text-base text-muted-foreground">
                                Enter your credentials to access the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <div className="space-y-5">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Work Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-muted/50 border-input focus:ring-2 focus:ring-primary py-6"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full font-bold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Authenticating...
                                            </div>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            Or sign in with
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full py-5 text-sm font-medium border-border bg-background hover:bg-muted transition-all duration-200"
                                    onClick={() => googleLogin()}
                                    disabled={loading}
                                >
                                    <FcGoogle className="mr-2 h-4 w-4" />
                                    Google
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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

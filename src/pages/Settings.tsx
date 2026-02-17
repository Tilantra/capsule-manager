import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, Key, Mail, Shield, Plus, RefreshCw, Copy, Check, AlertCircle, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [oneTimeKey, setOneTimeKey] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);
    const [configCopied, setConfigCopied] = useState(false);

    const client = useMemo(() => new BrowserGuideraClient(), []);

    const fetchUser = useCallback(async () => {
        try {
            const userData = await client.getSingleUser();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleCreateApiKey = async () => {
        setIsGenerating(true);
        setOneTimeKey(""); // Clear previous one-time key
        try {
            const result = await client.createApiKey();
            if (result.api_key) {
                setOneTimeKey(result.api_key);
                toast.success("API Key generated successfully. Please copy it now!");
                // Refresh local user state to update has_api_key
                const userData = await client.getSingleUser();
                setUser(userData);
            }
        } catch (error: any) {
            console.error("Failed to generate API key:", error);
            const errorMsg = error.response?.data?.detail || error.message || "Failed to generate API key";
            toast.error(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, isConfig = false) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (isConfig) {
            setConfigCopied(true);
            setTimeout(() => setConfigCopied(false), 2000);
        } else {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        }
        toast.success(isConfig ? "Configuration copied" : "API Key copied to clipboard");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const hasApiKey = user?.has_api_key;

    const mcpConfig = JSON.stringify({
        "mcpServers": {
            "capsule-service": {
                "serverUrl": "https://backend.tilantra.com/mcp/",
                "headers": {
                    "X-API-Key": "cht-xxxxxxxxxxxxxxxxxxxxxxxxxx",
                    "Content-Type": "application/json"
                }
            }
        }
    }, null, 2);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">Manage your account and integrations.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card className="overflow-hidden border-none bg-gradient-to-br from-card to-card/50 shadow-md">
                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Profile Details</CardTitle>
                        </div>
                        <CardDescription>Your account information from Tilantra.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-primary/20 p-1 bg-background">
                                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary uppercase">
                                    {user?.username?.substring(0, 2) || user?.email?.substring(0, 2) || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Username</Label>
                                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user?.username || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</Label>
                                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user?.email || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-green-500/10 text-green-600 border border-green-500/20 text-xs font-medium">
                                    <Shield className="h-3.5 w-3.5" />
                                    Active Account
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* API Integrations */}
                <Card className="overflow-hidden border-none bg-gradient-to-br from-card to-card/50 shadow-md">
                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-primary" />
                            <CardTitle>API Integrations</CardTitle>
                        </div>
                        <CardDescription>
                            Configure your MCP client to connect using Server-Sent Events (SSE).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-semibold">
                                            {hasApiKey ? "Manage API Key" : "Create API Key"}
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {hasApiKey ? "Regenerate your existing key if needed." : "Generate a new key to start using integrations."}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleCreateApiKey}
                                        disabled={isGenerating}
                                        variant={hasApiKey ? "outline" : "default"}
                                        className="gap-2 min-w-[140px]"
                                    >
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : (hasApiKey ? <RefreshCw className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                                        {hasApiKey ? "Regenerate" : "Create API Key"}
                                    </Button>
                                </div>

                                {oneTimeKey ? (
                                    <div className="space-y-4 p-5 rounded-xl bg-primary/5 border border-primary/20 shadow-sm animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center gap-2 text-primary">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">One-time View - Copy and Save!</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            For security reasons, we only show this key once. You won't be able to see it again after closing this session.
                                        </p>
                                        <div className="relative group">
                                            <div className="font-mono text-sm p-4 rounded-lg bg-background border border-primary/30 break-all select-all leading-relaxed pr-12">
                                                {oneTimeKey}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
                                                onClick={() => copyToClipboard(oneTimeKey)}
                                            >
                                                {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                ) : hasApiKey && (
                                    <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-600 opacity-60" />
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active Integration Token</span>
                                        </div>
                                        <div className="font-mono text-sm p-3 rounded-lg bg-background/50 border border-border/50 text-muted-foreground/60 select-none">
                                            cht-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic px-1">
                                            Your key is active and secure. You can regenerate it at any time.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-primary" />
                                How to use MCP
                            </h4>

                            <div className="bg-muted/30 rounded-lg p-4 space-y-4 text-sm border border-border/50">
                                <p className="text-muted-foreground">
                                    Configure your MCP client to connect using Server-Sent Events (SSE).
                                </p>

                                <div className="space-y-2">
                                    <p className="font-semibold text-xs uppercase tracking-wide text-primary">Headers</p>
                                    <p className="text-muted-foreground text-xs">
                                        You <span className="font-bold text-foreground">MUST</span> provide your API key in the <code className="bg-muted px-1 py-0.5 rounded border border-border/50">X-API-Key</code> header.
                                    </p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <pre className="relative mt-2 p-4 rounded-lg bg-background/80 border border-border shadow-sm overflow-x-auto text-xs font-mono leading-relaxed">
                                        <code>{mcpConfig}</code>
                                    </pre>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-4 h-6 w-6 text-muted-foreground hover:text-primary"
                                        onClick={() => copyToClipboard(mcpConfig, true)}
                                        title="Copy configuration"
                                    >
                                        {configCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>

                                <p className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-3 mt-2">
                                    Note: The exact configuration format depends on your MCP client. For direct HTTP/SSE clients, ensure <code className="bg-muted px-1 py-0.5 rounded">X-API-Key</code> is sent with every request.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

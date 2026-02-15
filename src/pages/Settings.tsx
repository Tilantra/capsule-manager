import { useState, useEffect, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, Key, Mail, Shield, Plus } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mcpApiKey, setMcpApiKey] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const client = useMemo(() => new BrowserGuideraClient(), []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await client.getSingleUser();
                setUser(userData);
                // In a real app, we might fetch the MCP key from the user's profile or a specific endpoint
                // For now, we'll use a placeholder or check localStorage
                const savedKey = localStorage.getItem("mcp_api_key") || "";
                setMcpApiKey(savedKey);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [client]);

    const handleSaveApiKey = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            localStorage.setItem("mcp_api_key", mcpApiKey);
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success("MCP API Key saved successfully");
        } catch (error) {
            toast.error("Failed to save API key");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                        <CardDescription>Setup your MCP API key to enable advanced features.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mcp-api-key" className="text-sm font-medium">Create MCP API Key</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="mcp-api-key"
                                            type="password"
                                            placeholder="Create your MCP API Key"
                                            className="pl-10 bg-background/50"
                                            value={mcpApiKey}
                                            onChange={(e) => setMcpApiKey(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveApiKey}
                                        disabled={isSaving}
                                        className="gap-2 min-w-[100px]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                Create
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Your MCP API key is used to authenticate requests to the Machine Control Protocol.
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">About MCP</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                The Machine Control Protocol (MCP) allows your capsules to interact with external tools and systems securely.
                                Make sure to keep your API key private and secure.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, MinusCircle, Sparkles, CreditCard, Crown, Zap } from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

    const client = useMemo(() => new BrowserGuideraClient(), []);

    const fetchUser = useCallback(async () => {
        try {
            const userData = await client.getSingleUser();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            toast.error("Failed to load account info");
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const currentTier = user?.tier || "basic";
    const currentTierNormalized = currentTier.toLowerCase();

    const pricingTiers = [
        {
            id: "basic",
            name: "Basic",
            price: 0,
            description: "Essential capsule management for casual users.",
            icon: <Zap className="h-5 w-5" />,
            features: [
                { name: "5 Total Capsules", included: true },
                { name: "MCP Access", included: true },
                { name: "Teams", included: false },
                { name: "Versioning", included: false },
                { name: "Attachments", included: false },
                { name: "Dynamic Context", included: false },
            ],
            color: "from-slate-500/20 to-slate-500/5",
            borderColor: "border-slate-200 dark:border-slate-700",
            badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        },
        {
            id: "pro",
            name: "Pro",
            price: 5,
            description: "Advanced features for solo power users.",
            icon: <CreditCard className="h-5 w-5" />,
            features: [
                { name: "15 Total Capsules", included: true },
                { name: "MCP + Attachments", included: true },
                { name: "Core Versioning", included: true },
                { name: "Join Existing Teams", included: true },
                { name: "Create Teams", included: false },
                { name: "Dynamic Context", included: false },
            ],
            color: "from-blue-500/20 to-blue-500/5",
            borderColor: "border-blue-200 dark:border-blue-700",
            badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
        },
        {
            id: "elite",
            name: "Elite",
            price: 15,
            description: "Maximum collaboration and context limits.",
            isPopular: true,
            icon: <Sparkles className="h-5 w-5" />,
            features: [
                { name: "Unlimited Capsules", included: true },
                { name: "MCP + Attachments + Dynamic Context", included: true },
                { name: "Universal Versioning", included: true },
                { name: "Create & Join Teams", included: true },
                { name: "Priority Support", included: true },
                { name: "White-labeling", included: false },
            ],
            color: "from-purple-500/20 to-purple-500/5",
            borderColor: "border-purple-300 dark:border-purple-600",
            badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "Custom",
            description: "Custom limits and dedicated support for large teams.",
            icon: <Crown className="h-5 w-5" />,
            features: [
                { name: "Custom Capsule Limits", included: true },
                { name: "Dedicated Support", included: true },
                { name: "Custom Integrations", included: true },
                { name: "White-labeling", included: true },
                { name: "SLA Guarantees", included: true },
                { name: "On-premise Option", included: true },
            ],
            color: "from-amber-500/20 to-amber-500/5",
            borderColor: "border-amber-200 dark:border-amber-700",
            badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        },
    ];

    const handleUpgrade = async (tierId: string, tierName: string) => {
        if (tierId === "enterprise") {
            toast.info("Please contact sales@tilantra.com for Enterprise plans.");
            return;
        }
        if (tierId === currentTierNormalized) return;

        setIsUpgrading(tierId);
        try {
            const targetTier = tierId as 'pro' | 'elite' | 'enterprise';

            toast.info(`Upgrading to ${tierName}...`, { duration: 1000 });

            // Single API call to upgrade
            const result = await client.upgradeTier(targetTier);

            toast.success(`🎉 Upgrade Successful! You are now an ${result.new_tier?.toUpperCase() || tierName} member.`);

            // Refresh user details to update the UI
            await fetchUser();
        } catch (err: any) {
            console.error("Upgrade failed", err);
            const errorMsg = err.response?.data?.detail || err.message || "Upgrade failed. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsUpgrading(null);
        }
    };

    const getButtonConfig = (tier: typeof pricingTiers[0]) => {
        const isCurrentTier = tier.id === currentTierNormalized;

        const tierOrder = { basic: 0, pro: 1, elite: 2, enterprise: 3 };
        const currentVal = tierOrder[currentTierNormalized as keyof typeof tierOrder] ?? 0;
        const targetVal = tierOrder[tier.id as keyof typeof tierOrder] ?? 0;

        if (isCurrentTier) return { label: "Current Plan", variant: "outline" as const, disabled: true };
        if (tier.id === "enterprise") return { label: "Contact Sales", variant: "outline" as const, disabled: false };
        if (targetVal < currentVal) return { label: "Downgrade", variant: "outline" as const, disabled: false };
        return { label: `Upgrade to ${tier.name}`, variant: "default" as const, disabled: false };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Billing & Plans
                </h1>
                <p className="text-muted-foreground mt-1">
                    Choose the perfect plan for you and your team.
                    {user && (
                        <span className="ml-2 font-medium text-foreground">
                            You are currently on the{" "}
                            <span className="text-primary font-bold capitalize">{currentTier}</span> plan.
                        </span>
                    )}
                </p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border/50 w-fit">
                <Button
                    variant={billingCycle === "monthly" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs px-4"
                    onClick={() => setBillingCycle("monthly")}
                >
                    Monthly
                </Button>
                <Button
                    variant={billingCycle === "annually" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs px-4"
                    onClick={() => setBillingCycle("annually")}
                >
                    Annually{" "}
                    <span className="ml-1.5 text-[10px] text-green-300 bg-green-900/40 px-1 rounded border border-green-500/30">
                        -20%
                    </span>
                </Button>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier) => {
                    const isCurrentTier = tier.id === currentTierNormalized;
                    const btnConfig = getButtonConfig(tier);

                    return (
                        <div
                            key={tier.id}
                            className={`relative flex flex-col rounded-2xl border ${tier.borderColor} ${tier.isPopular
                                    ? "ring-2 ring-purple-400/40 shadow-xl scale-[1.02]"
                                    : "shadow-sm"
                                } bg-gradient-to-b ${tier.color} backdrop-blur-sm overflow-hidden transition-all hover:shadow-md`}
                        >
                            {tier.isPopular && (
                                <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                            )}

                            {isCurrentTier && (
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${tier.badgeColor}`}>
                                        Current
                                    </span>
                                </div>
                            )}

                            {tier.isPopular && !isCurrentTier && (
                                <div className="absolute top-3 right-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex items-center gap-1">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-6 flex flex-col flex-1">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`p-1.5 rounded-lg ${tier.badgeColor}`}>
                                        {tier.icon}
                                    </span>
                                    <h3 className="text-xl font-bold">{tier.name}</h3>
                                </div>

                                <p className="text-sm text-muted-foreground mb-5 leading-snug min-h-[40px]">
                                    {tier.description}
                                </p>

                                {/* Price */}
                                <div className="mb-6 text-center py-3 rounded-xl bg-background/40">
                                    <span className="text-4xl font-extrabold tracking-tight">
                                        {typeof tier.price === "number"
                                            ? `$${billingCycle === "monthly" ? tier.price : Math.floor(tier.price * 0.8 * 12)}`
                                            : tier.price}
                                    </span>
                                    {typeof tier.price === "number" && (
                                        <span className="text-muted-foreground text-sm font-medium ml-1">
                                            /{billingCycle === "monthly" ? "mo" : "yr"}
                                        </span>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <Button
                                    variant={btnConfig.variant}
                                    className={`w-full mb-6 ${tier.isPopular && !isCurrentTier ? "bg-purple-600 hover:bg-purple-700 text-white border-0" : ""}`}
                                    onClick={() => handleUpgrade(tier.id, tier.name)}
                                    disabled={btnConfig.disabled || isUpgrading !== null}
                                    id={`billing-upgrade-${tier.id}`}
                                >
                                    {isUpgrading === tier.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        btnConfig.label
                                    )}
                                </Button>

                                {/* Features */}
                                <div className="space-y-2.5 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-start gap-2 text-sm ${feature.included ? "text-foreground" : "text-muted-foreground opacity-50"}`}
                                        >
                                            {feature.included ? (
                                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                                            ) : (
                                                <MinusCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            )}
                                            <span className="leading-snug">{feature.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <Card className="border-none bg-muted/30 shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Need help choosing?</CardTitle>
                    <CardDescription className="text-xs">
                        Upgrades take effect immediately. Contact{" "}
                        <a href="mailto:sales@tilantra.com" className="text-primary hover:underline">
                            tech@tilantra.com
                        </a>{" "}
                        for Enterprise pricing or custom requirements.
                    </CardDescription>
                </CardHeader>
                <CardContent />
            </Card>
        </div>
    );
}

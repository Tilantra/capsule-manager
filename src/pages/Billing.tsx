import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, MinusCircle, Sparkles, CreditCard, Crown, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";

export default function BillingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState<{ tier: string, mode: string } | null>(null);
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');


    // Alternating currency effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrency(prev => prev === 'INR' ? 'USD' : 'INR');
        }, 4000);
        return () => clearInterval(interval);
    }, []);


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

        // Check for payment success redirect
        const params = new URLSearchParams(window.location.search);
        if (params.get("status") === "success") {
            toast.success("Payment Received! We are updating your tier. This may take a minute.", {
                duration: 5000,
            });
            // Try to refresh every 3 seconds for a bit
            const interval = setInterval(fetchUser, 3000);
            setTimeout(() => clearInterval(interval), 15000); // Stop polling after 15s
        }
    }, [fetchUser]);

    const currentTier = user?.tier || "basic";
    const currentTierNormalized = currentTier.toLowerCase();

    const pricingTiers = [
        {
            id: "basic",
            name: "Basic",
            price: 0,
            priceUSD: 0,
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
            price: 100,
            priceUSD: 1,
            description: "Advanced features for solo power users.",
            isPopular: true,
            icon: <CreditCard className="h-5 w-5" />,
            paymentLink: "https://rzp.io/rzp/paypro",
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
            price: 300,
            priceUSD: 3,
            description: "Maximum collaboration and context limits.",
            icon: <Sparkles className="h-5 w-5" />,
            paymentLink: "https://rzp.io/rzp/payelite",
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
            priceUSD: "Custom",
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

    const handleUpgrade = async (tierId: string, tierName: string, mode: 'one-time' | 'subscription' | 'contact') => {
        if (mode === "contact" || tierId === "enterprise") {
            toast.info("Please contact tech@tilantra.com for Enterprise plans.");
            return;
        }
        if (tierId === currentTierNormalized) return;

        setIsUpgrading({ tier: tierId, mode });
        try {
            const targetTier = tierId as 'pro' | 'elite' | 'enterprise';
            toast.info(`${mode === 'subscription' ? 'Subscribing' : 'Upgrading'} to ${tierName}...`, { duration: 1000 });

            // Call backend to get the upgrade response or payment link
            let result;
            if (mode === 'subscription') {
                result = await client.subscribeTier(targetTier as 'pro' | 'elite');
            } else {
                result = await client.upgradeTier(targetTier);
            }

            // If the backend returned a payment URL (Razorpay link), redirect to it
            if (result.payment_url) {
                toast.info("Redirecting to secure payment...");
                window.location.href = result.payment_url;
                return;
            }

            // If no payment URL is provided, something might be wrong with the tier configuration or user eligibility
            toast.error("Could not initiate upgrade. Please reach out to tilantra.technologies@gmail.com");
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

        // If it's the current tier, show "Current Plan"
        if (isCurrentTier) {
            return { label: "Current Plan", variant: "outline" as const, disabled: true };
        }

        const tierOrder = { basic: 0, pro: 1, elite: 2, enterprise: 3 };
        const currentVal = tierOrder[currentTierNormalized as keyof typeof tierOrder] ?? 0;
        const targetVal = tierOrder[tier.id as keyof typeof tierOrder] ?? 0;

        // Special case for Enterprise
        if (tier.id === "enterprise") {
            return { label: "Contact Sales", variant: "outline" as const, disabled: false };
        }

        // If target tier is lower than current tier, don't show any button (Downgrade hidden)
        if (targetVal < currentVal) {
            return null;
        }

        // If target tier is higher than current tier, show Upgrade button
        if (targetVal > currentVal) {
            return { label: `Upgrade to ${tier.name}`, variant: "default" as const, disabled: false };
        }

        return null;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            </div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{
                    opacity: 1,
                    y: [0, -4, 0],
                }}
                transition={{
                    initial: { duration: 0.6, delay: 0.1 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative group"
            >
                {/* Magical Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                <div className="relative flex items-center justify-between p-4 rounded-2xl border border-blue-500/30 bg-white/80 dark:bg-blue-950/40 backdrop-blur-xl shadow-lg shadow-blue-500/10 overflow-hidden">
                    {/* Shimmer Effect Overlay */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                    />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/20">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Special Welcome Offer !!!
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                Enjoy <span className="text-blue-600 dark:text-blue-400 font-bold">3 days of Elite features</span> on us to experience the full potential of Capsule Hub.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>



            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier) => {
                    const isCurrentTier = tier.id === currentTierNormalized;
                    const btnConfig = getButtonConfig(tier);

                    return (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * pricingTiers.indexOf(tier) }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`relative flex flex-col rounded-2xl border ${tier.borderColor} ${tier.isPopular
                                ? "border-blue-500/50 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] scale-[1.05] z-10"
                                : "shadow-sm"
                                } bg-gradient-to-b ${tier.color} backdrop-blur-sm overflow-visible transition-all`}
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
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                                    <motion.span
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 flex items-center gap-1.5 border-2 border-white dark:border-slate-900"
                                    >
                                        <Star className="h-3 w-3 fill-current" />
                                        Most Popular
                                    </motion.span>
                                </div>
                            )}

                            <div className="p-5 flex flex-col h-full">
                                {/* Header: Icon + Name */}
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className={`p-2 rounded-xl ${tier.badgeColor} shadow-sm`}>
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">{tier.name}</h3>
                                </div>

                                {/* Price: Integrated & Clean */}
                                <div className="mb-4 relative h-10 flex items-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currency}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -10, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex items-baseline"
                                        >
                                            <span className="text-3xl font-extrabold tracking-tight">
                                                {typeof tier.price === "number"
                                                    ? (currency === 'INR' ? `₹${tier.price}` : `$${(tier as any).priceUSD}`)
                                                    : tier.price}
                                            </span>
                                            {typeof tier.price === "number" && (
                                                <span className="text-muted-foreground text-xs font-medium ml-1">
                                                    /month
                                                </span>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <p className="text-xs text-muted-foreground mb-6 leading-relaxed min-h-[32px]">
                                    {tier.description}
                                </p>

                                {/* Features List */}
                                <div className="space-y-3 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-start gap-2.5 text-[13px] ${feature.included ? "text-foreground" : "text-muted-foreground opacity-40"}`}
                                        >
                                            {feature.included ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />
                                            ) : (
                                                <MinusCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                            )}
                                            <span className="leading-tight">{feature.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Buttons: Pushed to bottom */}
                                {btnConfig && (
                                    <div className="flex flex-col gap-2 mt-auto">
                                        {/* Enterprise or Current Plan or Downgrade logic handled here */}
                                        {btnConfig.label === "Contact Sales" || btnConfig.label === "Current Plan" ? (
                                            <Button
                                                variant={btnConfig.variant}
                                                className={`w-full h-11 rounded-xl font-semibold transition-all hover:bg-accent`}
                                                onClick={() => handleUpgrade(tier.id, tier.name, 'contact')}
                                                disabled={btnConfig.disabled}
                                            >
                                                {btnConfig.label}
                                            </Button>
                                        ) : (
                                            <>
                                                {/* Subscription Button (Primary) */}
                                                <Button
                                                    variant="default"
                                                    className={`w-full h-11 rounded-xl font-semibold transition-all ${tier.isPopular && !isCurrentTier ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" : ""}`}
                                                    onClick={() => handleUpgrade(tier.id, tier.name, 'subscription')}
                                                    disabled={isUpgrading !== null}
                                                >
                                                    {isUpgrading?.tier === tier.id && isUpgrading?.mode === 'subscription' ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing</>
                                                    ) : (
                                                        "Upgrade Now"
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer note */}
            <Card className="border-none bg-muted/30 shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Need help choosing?</CardTitle>
                    <CardDescription className="text-xs">
                        Upgrades take effect immediately. Contact{" "}
                        <a href="mailto:tech@tilantra.com" className="text-primary hover:underline">
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

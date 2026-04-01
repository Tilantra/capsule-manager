import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CapsuleImage from "@/components/assets/capsule.png";
import { X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CapsuleGraphProps {
    items: Array<{
        id: string;
        type: "file" | "chunk";
        label: string;
        subtitle?: string;
    }>;
    onRemoveItem?: (id: string) => void;
    isAbsorbing?: boolean;
    /** Override outer canvas height (default h-[28rem]) */
    className?: string;
}

export const CapsuleGraph = ({ items, onRemoveItem, isAbsorbing = false, className }: CapsuleGraphProps) => {
    const [positions, setPositions] = useState<Array<{ x: number; y: number; angle: number }>>([]);
    const [activeGlowIndex, setActiveGlowIndex] = useState(0);

    useEffect(() => {
        const itemsPerRing = 8;
        const baseRadius = 130;
        const ringGap = 72;

        const newPositions = items.map((_, index) => {
            const ringIndex = Math.floor(index / itemsPerRing);
            const posInRing = index % itemsPerRing;
            const nodesInRing = Math.min(itemsPerRing, items.length - ringIndex * itemsPerRing);
            const ringRadius = baseRadius + ringIndex * ringGap;
            const baseStep = 360 / nodesInRing;
            // Offset alternating rings so the second ring lands between first-ring nodes.
            const ringOffset = ringIndex % 2 === 0 ? 0 : baseStep / 2;
            // Start nodes from top so small item counts look visually centered.
            const angleDeg = posInRing * baseStep + ringOffset - 90;
            const angle = (angleDeg * Math.PI) / 180;

            return {
                x: Math.cos(angle) * ringRadius,
                y: Math.sin(angle) * ringRadius,
                angle: angleDeg,
            };
        });
        setPositions(newPositions);
    }, [items.length]);

    useEffect(() => {
        if (items.length === 0) return;

        const interval = window.setInterval(() => {
            setActiveGlowIndex((prev) => {
                if (items.length <= 1) return 0;
                let next = Math.floor(Math.random() * items.length);
                if (next === prev) {
                    next = (next + 1) % items.length;
                }
                return next;
            });
        }, 1400);

        return () => window.clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <TooltipProvider delayDuration={120}>
            <div className={cn("relative w-full h-[28rem] flex items-center justify-center", className)}>
            {/* Center Capsule */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 220, 
                    damping: 20,
                    delay: 0.12
                }}
            >
                <motion.img
                    src={CapsuleImage}
                    alt="Capsule"
                    className="w-16 h-16 object-contain"
                    animate={{
                        scale: isAbsorbing ? [1.02, 1.16, 1.02] : [1, 1.08, 1],
                        opacity: [0.9, 1, 0.9],
                        filter: [
                            "drop-shadow(0 0 0px rgba(168,85,247,0.0))",
                            "drop-shadow(0 0 10px rgba(168,85,247,0.35))",
                            "drop-shadow(0 0 0px rgba(168,85,247,0.0))",
                        ],
                    }}
                    transition={{ duration: isAbsorbing ? 1.1 : 6.8, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Items around the circle */}
            {items.map((item, index) => {
                if (!positions[index]) return null;
                const ringIndex = Math.floor(index / 8);
                const nodeSizeClass = ringIndex === 0 ? "w-14 h-14" : "w-12 h-12";
                const emojiSizeClass = ringIndex === 0 ? "text-2xl" : "text-xl";
                const isActive = index === activeGlowIndex;
                
                return (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                            <motion.div
                        key={item.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/node"
                        style={{
                            left: `calc(50% + ${positions[index].x}px)`,
                            top: `calc(50% + ${positions[index].y}px)`,
                            zIndex: 5,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isAbsorbing ? { x: -positions[index].x, y: -positions[index].y, scale: 0.25, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
                        transition={{
                            type: isAbsorbing ? "tween" : "spring",
                            stiffness: isAbsorbing ? undefined : 230,
                            damping: isAbsorbing ? undefined : 20,
                            duration: isAbsorbing ? 0.65 : undefined,
                            delay: isAbsorbing ? index * 0.04 : index * 0.05 + 0.2,
                            ease: isAbsorbing ? "easeInOut" : undefined,
                        }}
                        whileHover={isAbsorbing ? undefined : { scale: 1.06, zIndex: 20 }}
                        whileTap={isAbsorbing ? undefined : { scale: 1.02 }}
                    >
                        <motion.div
                            className={`relative ${nodeSizeClass} rounded-xl bg-gradient-to-br from-card to-card/80 border border-primary/20 shadow-md flex items-center justify-center`}
                            animate={isAbsorbing
                                ? {
                                    y: 0,
                                    scale: 1,
                                    boxShadow: "0 0 0 1px rgba(126,34,206,0.45), 0 0 24px rgba(88,28,135,0.65)",
                                }
                                : {
                                    y: [0, -2, 0],
                                    scale: [1, 1.04, 1],
                                    boxShadow: isActive
                                        ? [
                                            "0 0 0 1px rgba(126,34,206,0.45), 0 0 10px rgba(88,28,135,0.45), 0 0 18px rgba(88,28,135,0.35)",
                                            "0 0 0 1px rgba(126,34,206,0.8), 0 0 24px rgba(88,28,135,0.75), 0 0 36px rgba(88,28,135,0.55)",
                                            "0 0 0 1px rgba(126,34,206,0.45), 0 0 10px rgba(88,28,135,0.45), 0 0 18px rgba(88,28,135,0.35)",
                                        ]
                                        : [
                                            "0 0 0 1px rgba(126,34,206,0.35), 0 0 10px rgba(88,28,135,0.22)",
                                            "0 0 0 1px rgba(126,34,206,0.35), 0 0 10px rgba(88,28,135,0.22)",
                                            "0 0 0 1px rgba(126,34,206,0.35), 0 0 10px rgba(88,28,135,0.22)",
                                        ],
                                }}
                            transition={{
                                duration: isAbsorbing ? 0.5 : 7.2,
                                repeat: isAbsorbing ? 0 : Infinity,
                                delay: isAbsorbing ? index * 0.04 : index * 0.35,
                                ease: "easeInOut",
                            }}
                        >
                            <span className={emojiSizeClass}>
                                {item.type === 'file' ? '📄' : '📝'}
                            </span>
                            {onRemoveItem && !isAbsorbing && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onRemoveItem(item.id);
                                    }}
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-opacity hover:text-destructive z-30"
                                    aria-label={`Remove ${item.label}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </motion.div>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px]">
                            <p className="text-xs font-semibold truncate">{item.label}</p>
                            {item.subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtitle}</p>}
                        </TooltipContent>
                    </Tooltip>
                );
            })}
            </div>
        </TooltipProvider>
    );
};

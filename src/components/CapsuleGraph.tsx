import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CapsuleGraphProps {
    items: Array<{ id: string; type: 'file' | 'chunk' }>;
}

export const CapsuleGraph = ({ items }: CapsuleGraphProps) => {
    const [positions, setPositions] = useState<Array<{ x: number; y: number; angle: number }>>([]);

    useEffect(() => {
        // Calculate positions in a circle around the center
        const radius = 120;
        const newPositions = items.map((_, index) => {
            const angle = (index * (360 / items.length) * Math.PI) / 180;
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                angle: (index * 360) / items.length,
            };
        });
        setPositions(newPositions);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <div className="relative w-full h-64 flex items-center justify-center my-8">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 rounded-2xl" />
            
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {/* Draw connections */}
                {items.map((item, index) => {
                    if (!positions[index]) return null;
                    
                    return (
                        <motion.line
                            key={`line-${item.id}`}
                            x1="50%"
                            y1="50%"
                            x2={`calc(50% + ${positions[index].x}px)`}
                            y2={`calc(50% + ${positions[index].y}px)`}
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.4 }}
                            transition={{ 
                                duration: 1, 
                                delay: index * 0.1,
                                ease: "easeOut"
                            }}
                        />
                    );
                })}
                
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center Capsule */}
            <motion.div
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.2 
                }}
            >
                <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 shadow-2xl flex items-center justify-center relative overflow-hidden"
                    animate={{
                        boxShadow: [
                            "0 20px 60px rgba(59, 130, 246, 0.3)",
                            "0 20px 60px rgba(168, 85, 247, 0.3)",
                            "0 20px 60px rgba(59, 130, 246, 0.3)",
                        ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Animated background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-4xl relative z-10">💊</span>
                </motion.div>
            </motion.div>

            {/* Items around the circle */}
            {items.map((item, index) => {
                if (!positions[index]) return null;
                
                return (
                    <motion.div
                        key={item.id}
                        className="absolute"
                        style={{
                            left: `calc(50% + ${positions[index].x}px)`,
                            top: `calc(50% + ${positions[index].y}px)`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 5,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.1 + 0.3,
                        }}
                        whileHover={{ scale: 1.2, zIndex: 20 }}
                    >
                        <motion.div
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-card to-card/50 border-2 border-primary/30 shadow-lg flex items-center justify-center backdrop-blur-sm"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut",
                            }}
                        >
                            <span className="text-2xl">
                                {item.type === 'file' ? '📄' : '📝'}
                            </span>
                        </motion.div>
                        
                        {/* Pulsing ring effect */}
                        <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-primary/50"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.2,
                            }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

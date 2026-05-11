import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, X, Trophy, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationPopupProps {
  onClose?: () => void;
}

export const CelebrationPopup: React.FC<CelebrationPopupProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/95 via-violet-600/95 to-purple-700/95 shadow-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />

            {/* Content */}
            <div className="relative p-8 text-center text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-6 shadow-xl"
              >
                <Trophy className="w-10 h-10 text-yellow-300" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                  15,000 Users!
                </h2>
                <p className="text-indigo-100 font-medium mb-6">
                  In just 10 days since launch. We are blown away!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-bold uppercase tracking-wider text-yellow-200">Special Reward</span>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="text-2xl font-bold mb-1">+15 Days Elite Tier</h3>
                <p className="text-sm text-indigo-100">
                  Added to all existing accounts that made this possible as a thank you!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={handleClose}
                  className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Let's Celebrate!
                </Button>
                <p className="mt-4 text-xs text-indigo-200/80">
                  Thank you for being part of the Tilantra journey.
                </p>
              </motion.div>
            </div>

            {/* Sparkle elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-10 left-10 text-yellow-200/40"
            >
              <Star className="w-6 h-6" fill="currentColor" />
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, -45, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-20 right-10 text-white/30"
            >
              <Gift className="w-8 h-8" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

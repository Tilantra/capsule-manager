import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';

export const CelebrationBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-[70] w-full overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 py-2.5 px-4 shadow-lg"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      <div className="relative mx-auto max-w-7xl flex items-center justify-center gap-3 sm:gap-6 text-white">
        <div className="hidden sm:flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100">Milestone</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <p className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>Celebrating 30,000 Users in 15 Days!</span>
          </p>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

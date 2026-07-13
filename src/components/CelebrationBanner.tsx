import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const CelebrationBanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-[70] w-full bg-violet-700 py-2.5 px-4"
    >
      <div className="relative mx-auto max-w-7xl flex items-center justify-center gap-3 sm:gap-5 text-white">
        <span className="editorial-label hidden sm:block text-violet-200">Milestone</span>
        <span className="hidden sm:block w-1.5 h-1.5 bg-orange-400" />
        <p className="text-xs sm:text-sm font-semibold tracking-tight">
          Celebrating 90,000 users in 45 days
        </p>
        <span className="hidden sm:block w-1.5 h-1.5 bg-orange-400" />
        <span className="editorial-label hidden sm:block text-violet-200">Thank you</span>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="absolute right-0 top-1/2 -translate-y-1/2 text-violet-200 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

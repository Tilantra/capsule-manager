import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrueFocusTextProps {
  texts: string[];
  className?: string;
  duration?: number;
}

export default function TrueFocusText({
  texts,
  className,
  duration = 15,
}: TrueFocusTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const longestText = useMemo(
    () => texts.reduce((longest, t) => (t.length > longest.length ? t : longest), texts[0] ?? ""),
    [texts]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration, texts.length]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl",
        className
      )}
    >
      <span className="invisible whitespace-nowrap select-none" aria-hidden>
        {longestText}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[currentIndex]}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

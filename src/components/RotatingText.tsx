import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface RotatingPhrase {
    text: string;
    /* per-phrase styling, e.g. its accent color */
    className?: string;
}

/* Cycles through phrases in place. Inherits the surrounding font.
   Every phrase is stacked invisibly in the same grid cell so the
   container always holds the width of the widest one — the line
   never re-wraps or shifts as the text changes. */
const RotatingText = ({
    phrases,
    className = "",
    interval = 2600,
}: {
    phrases: RotatingPhrase[];
    className?: string;
    interval?: number;
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
        return () => clearInterval(t);
    }, [phrases.length, interval]);

    return (
        /* Baseline-aligned so it sits on the same line as the surrounding text.
           The vertical padding (cancelled by negative margins) extends the clip
           box past the em square so serif descenders and ascenders aren't cropped. */
        <span className="inline-grid overflow-hidden pb-[0.22em] -mb-[0.22em] pt-[0.12em] -mt-[0.12em]">
            {phrases.map((p) => (
                <span key={p.text} className="col-start-1 row-start-1 invisible whitespace-nowrap" aria-hidden>
                    {p.text}
                </span>
            ))}
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={phrases[index].text}
                    initial={{ y: "70%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-70%", opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`col-start-1 row-start-1 whitespace-nowrap ${className} ${phrases[index].className ?? ""}`}
                >
                    {phrases[index].text}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default RotatingText;

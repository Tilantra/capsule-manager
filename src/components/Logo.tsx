import { useTheme } from "@/components/theme-provider"
import TilantraLogoBlue from "@/components/assets/Tilantra_blueLOGO.png"
import TilantraLogoWhite from "@/components/assets/Tilantra-logo-white.png"
import { useEffect, useState } from "react"

interface TilantraLogoProps {
    className?: string;
}

export function TilantraLogo({ className }: TilantraLogoProps) {
    const { theme } = useTheme();
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

    useEffect(() => {
        // Initial set
        const updateTheme = () => {
            if (theme === "system") {
                const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setResolvedTheme(isDark ? "dark" : "light");
            } else {
                setResolvedTheme(theme as "dark" | "light");
            }
        };

        updateTheme();

        // Listen for system theme changes if theme is system
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = (e: MediaQueryListEvent) => {
                setResolvedTheme(e.matches ? "dark" : "light");
            };
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [theme]);

    const adjustedClassName = resolvedTheme === "dark" 
        ? className?.replace(/h-(\d+)/, (_, p1) => `h-${parseInt(p1) * 3}`)
        : className;

    return (
        <img 
            src={resolvedTheme === "dark" ? TilantraLogoWhite : TilantraLogoBlue} 
            alt="Tilantra" 
            className={adjustedClassName} 
        />
    );
}

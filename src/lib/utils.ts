import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Normalize extracted_from (string | array | comma-separated) to unique sources. */
export function normalizeExtractedSources(raw?: string | string[] | null): string[] {
    if (!raw || (typeof raw === "string" && raw.length === 0)) {
        return ["tilantra"];
    }

    const list = Array.isArray(raw)
        ? raw
        : raw.includes(",")
            ? raw.split(",").map((s) => s.trim())
            : [raw];

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const source of list) {
        const trimmed = source.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(trimmed);
        }
    }

    return unique.length > 0 ? unique : ["tilantra"];
}

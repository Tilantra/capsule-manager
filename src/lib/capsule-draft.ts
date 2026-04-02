export interface LandingDraftFile {
    id: string;
    name: string;
    type: string;
    size: number;
    dataUrl: string;
}

export interface LandingDraftChunk {
    id: string;
    text: string;
    createdAt: string;
}

export interface CapsuleDraftPayload {
    files: LandingDraftFile[];
    chunks: LandingDraftChunk[];
}

export const CAPSULE_DRAFT_KEY = "capsule_landing_draft_v1";

export const saveCapsuleDraft = (payload: CapsuleDraftPayload) => {
    localStorage.setItem(CAPSULE_DRAFT_KEY, JSON.stringify(payload));
};

export const loadCapsuleDraft = (): CapsuleDraftPayload | null => {
    const raw = localStorage.getItem(CAPSULE_DRAFT_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as CapsuleDraftPayload;
        if (!Array.isArray(parsed.files) || !Array.isArray(parsed.chunks)) return null;
        return parsed;
    } catch {
        return null;
    }
};

export const clearCapsuleDraft = () => {
    localStorage.removeItem(CAPSULE_DRAFT_KEY);
};

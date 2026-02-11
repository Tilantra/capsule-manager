export interface CreateCapsuleRequest {
    messages: any[];
    tag?: string;
    team?: string;
}

export interface CreateCapsuleResponse {
    capsule_id: string;
    created_at: string;
    created_by: string;
    summary: string;
    team: string;
    tag: string;
}

export interface CreateVersionRequest {
    messages: any[];
}

export interface CreateVersionResponse {
    version_id: string;
    capsule_id: string;
    parent_version_id: string;
    content_hash: string;
}

export interface SearchCapsuleRequest {
    limit?: number;
    min_version_count?: number;
    offset?: number;
    summary_query?: string;
    tag?: string;
}

export interface CapsuleMetadata {
    capsule_id: string;
    created_at: string;
    created_by: string;
    extracted_from?: string | string[];
    latest_version_id?: string;
    summary?: string;
    tag?: string;
    team?: string;
    version_count?: number;
}

export interface SearchResponse {
    limit: number;
    offset: number;
    results: CapsuleMetadata[];
    total: number;
}

export interface CapsuleVersionContent {
    messages: any[];
    metadata?: any;
}

export interface CapsuleVersion {
    version_id: string;
    capsule_id: string;
    parent_version_id?: string;
    content_hash?: string;
    content?: CapsuleVersionContent;
    created_at: string;
    created_by: string;
    extracted_from?: string;
}

export interface VersionListResponse {
    capsule_id: string;
    versions: CapsuleVersion[];
}

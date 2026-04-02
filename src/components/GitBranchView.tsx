import React, { useMemo } from 'react';
import { CapsuleVersion } from '@/lib/capsule-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from '@/components/ui/button';
import { History, Loader2, GitCommit, GitBranch } from 'lucide-react';

interface GitBranchViewProps {
    versions: CapsuleVersion[];
    currentVersionId?: string;
    onRollback: (version: CapsuleVersion) => void;
    rollingBackId: string | null;
}

interface NodePosition {
    x: number;
    y: number;
    lane: number;
    row: number;
}

export const GitBranchView: React.FC<GitBranchViewProps> = ({
    versions,
    currentVersionId,
    onRollback,
    rollingBackId
}) => {
    // 1. Sort versions by creation date (oldest first)
    const sortedVersions = useMemo(() =>
        [...versions]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((v, idx) => ({
                ...v,
                version_number: v.version_number || (idx + 1)
            })), [versions]
    );

    // 2. Build tree and assign lanes/rows
    // Lane 0 is the main trunk. New branches get higher lane numbers.
    const layout = useMemo(() => {
        if (sortedVersions.length === 0) return null;

        const positions: Record<string, NodePosition> = {};
        const laneNextRow: Record<number, number> = { 0: 0 };
        const childrenMap: Record<string, string[]> = {};

        // Find roots
        const roots = sortedVersions.filter(v =>
            !v.parent_version_id || !sortedVersions.find(sv => sv.version_id === v.parent_version_id)
        );

        // Map children
        sortedVersions.forEach(v => {
            if (v.parent_version_id) {
                if (!childrenMap[v.parent_version_id]) childrenMap[v.parent_version_id] = [];
                childrenMap[v.parent_version_id].push(v.version_id);
            }
        });

        const laneUsage: Record<number, number[]> = {}; // lane -> rows used

        function assignPosition(vId: string, lane: number, startRow: number) {
            let row = startRow;

            // Ensure row is not occupied in this lane
            while (laneUsage[lane]?.includes(row)) {
                row++;
            }

            positions[vId] = {
                x: lane * 80,
                y: row * 80,
                lane,
                row
            };

            if (!laneUsage[lane]) laneUsage[lane] = [];
            laneUsage[lane].push(row);

            const children = childrenMap[vId] || [];
            children.forEach((childId, idx) => {
                // First child stays in same lane if possible, others branch out
                const nextLane = idx === 0 ? lane : (Object.keys(laneNextRow).length);
                if (idx > 0) laneNextRow[nextLane] = row + 1;
                assignPosition(childId, nextLane, row + 1);
            });
        }

        roots.forEach((root, idx) => {
            assignPosition(root.version_id, idx, 0);
        });

        // Normalize X to center it later
        const maxLane = Math.max(...Object.values(positions).map(p => p.lane), 0);
        const maxRow = Math.max(...Object.values(positions).map(p => p.row), 0);

        return { positions, maxLane, maxRow };
    }, [sortedVersions]);

    if (!layout || sortedVersions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <GitCommit className="h-8 w-8 mb-2 opacity-20" />
                <p className="italic">No version history available</p>
            </div>
        );
    }

    const { positions, maxLane, maxRow } = layout;
    const containerWidth = (maxLane + 1) * 80 + 100;
    const containerHeight = (maxRow + 1) * 80 + 100;

    return (
        <div className="w-full h-full overflow-visible flex flex-col items-center">
            <div className="flex items-center gap-4 mb-8 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span>Active Version</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/40" />
                    <span>History / Branches</span>
                </div>
            </div>

            <div
                className="relative overflow-visible"
                style={{
                    width: containerWidth,
                    height: containerHeight,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
            >
                {/* 1. Render all connection lines first (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground/20" />
                        </marker>
                    </defs>
                    {sortedVersions.map(v => {
                        const parentId = v.parent_version_id;
                        if (!parentId || !positions[parentId]) return null;

                        const start = positions[parentId];
                        const end = positions[v.version_id];

                        // Curved path: move from parent to child
                        // If in same lane, straight line. If different lane, curved branch.
                        if (start.lane === end.lane) {
                            return (
                                <line
                                    key={`line-${v.version_id}`}
                                    x1={start.x + 40} y1={start.y + 40}
                                    x2={end.x + 40} y2={end.y + 40}
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-muted-foreground/15"
                                />
                            );
                        } else {
                            // Quadratic curve for branching
                            const cpX = end.x + 40;
                            const cpY = start.y + 40;
                            return (
                                <path
                                    key={`path-${v.version_id}`}
                                    d={`M ${start.x + 40} ${start.y + 40} Q ${cpX} ${cpY} ${end.x + 40} ${end.y + 40}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-muted-foreground/15"
                                />
                            );
                        }
                    })}
                </svg>

                {/* 2. Render version nodes */}
                {sortedVersions.map(v => {
                    const pos = positions[v.version_id];
                    const isActive = v.version_id === currentVersionId;

                    return (
                        <div
                            key={v.version_id}
                            className="absolute"
                            style={{
                                left: pos.x + 24,
                                top: pos.y + 24,
                                zIndex: 10
                            }}
                        >
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 relative group
                                                ${isActive
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.6)] scale-110'
                                                    : 'border-muted-foreground/40 bg-background hover:border-primary/60 hover:scale-110 active:scale-95'}`}
                                            onClick={() => !isActive && onRollback(v)}
                                        >
                                            <span className="text-[10px] font-bold">v{v.version_number}</span>
                                            {isActive && (
                                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="w-72 p-0 bg-popover/95 backdrop-blur-md border-primary/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
                                        sideOffset={12}
                                    >
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className="h-3 w-3 text-primary" />
                                                    <span className="font-bold text-sm text-primary">Version {v.version_number}</span>
                                                </div>
                                                <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-tight uppercase ${isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                                    {isActive ? 'Live' : 'Archived'}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest">Change Intelligence</div>
                                                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/30">
                                                    {v.change_summary ? (
                                                        <p className="text-xs text-foreground/90 leading-relaxed italic">
                                                            "{v.change_summary}"
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground italic">No context available for this iteration.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 text-[10px] text-muted-foreground/70">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                    <span>Created by <span className="text-foreground/80 font-medium">{v.created_by}</span></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                    <span>{new Date(v.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                </div>
                                            </div>

                                            {!isActive && (
                                                <div className="pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-[11px] w-full bg-primary hover:bg-primary/90 transition-all font-semibold"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRollback(v);
                                                        }}
                                                        disabled={rollingBackId === v.version_id}
                                                    >
                                                        {rollingBackId === v.version_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                                        ) : (
                                                            <History className="h-3.5 w-3.5 mr-2" />
                                                        )}
                                                        Restore this version
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2 max-w-sm text-center">
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    Hover over a node to see technical summaries and contributors.
                    Inactive nodes can be restored to the production workspace.
                </p>
            </div>
        </div>
    );
};

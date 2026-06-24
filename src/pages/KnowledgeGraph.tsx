import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Network } from "lucide-react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { CapsuleMetadata } from "@/lib/capsule-types";
// @ts-ignore
import ForceGraph2D from "react-force-graph-2d";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphNode {
    id: string;
    label: string;
    hoverLabel: string;
    type: "document" | "section";
    colorIdx: number;
    val: number;
    parentCapsuleId: string;
    x?: number;
    y?: number;
}

interface GraphLink {
    source: string;
    target: string;
    linkType: "hierarchy" | "reference";
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const BG = "#0d1117";

const PALETTE = [
    { fill: "#4d7cfe", glow: "rgba(77,124,254,0.55)",  section: "rgba(77,124,254,0.7)"  },
    { fill: "#a855f7", glow: "rgba(168,85,247,0.55)",  section: "rgba(168,85,247,0.7)"  },
    { fill: "#10b981", glow: "rgba(16,185,129,0.55)",  section: "rgba(16,185,129,0.7)"  },
    { fill: "#f59e0b", glow: "rgba(245,158,11,0.55)",  section: "rgba(245,158,11,0.7)"  },
    { fill: "#ef4444", glow: "rgba(239,68,68,0.55)",   section: "rgba(239,68,68,0.7)"   },
    { fill: "#06b6d4", glow: "rgba(6,182,212,0.55)",   section: "rgba(6,182,212,0.7)"   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
    const client = new BrowserGuideraClient();
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [status, setStatus] = useState("Loading…");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track container size
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const r = containerRef.current.getBoundingClientRect();
                setDimensions({ width: r.width, height: r.height });
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // ─── Data fetching ──────────────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await client.getUserCapsules(200, 0);
                if (cancelled) return;

                const all: CapsuleMetadata[] = response.results;
                const parents = all.filter(c => c.rag_meta?.ingest_status === "complete");

                if (!parents.length) {
                    setError("No ingested documents found. Attach a file to a capsule and wait for ingest to complete.");
                    setLoading(false);
                    return;
                }

                const allById: Record<string, CapsuleMetadata> = {};
                for (const c of all) allById[c.capsule_id] = c;

                const nodeToParent: Record<string, string> = {};
                for (const p of parents) {
                    for (const cid of Object.values(p.rag_meta?.node_capsule_map || {})) {
                        nodeToParent[cid] = p.capsule_id;
                    }
                }

                // Fetch milestone body → extract filename for document label
                const docLabels: Record<string, string> = {};
                await Promise.all(parents.map(async (p, i) => {
                    const milestoneId = p.rag_meta?.milestone_capsule_id;
                    const milestoneMeta = milestoneId ? allById[milestoneId] : null;
                    if (milestoneMeta?.latest_version_id) {
                        try {
                            // @ts-ignore
                            const ver = await client.getCapsuleVersion(milestoneId!, milestoneMeta.latest_version_id);
                            const body: string = ver?.content?.messages?.[0]?.content || "";
                            const m = body.match(/##\s+\[([^\]]+)\]/);
                            if (m) { docLabels[p.capsule_id] = m[1]; return; }
                        } catch { /* fall through */ }
                    }
                    docLabels[p.capsule_id] = p.tag || `Document ${i + 1}`;
                }));

                // Fetch section node versions: cross-doc refs + section heading for hover
                const allSectionIds = Object.keys(nodeToParent);
                const nodeRefs: Record<string, string[]> = {};
                const sectionHeadings: Record<string, string> = {};

                await Promise.all(allSectionIds.map(async (nodeId) => {
                    const meta = allById[nodeId];
                    if (!meta?.latest_version_id) return;
                    try {
                        // @ts-ignore
                        const ver = await client.getCapsuleVersion(nodeId, meta.latest_version_id);
                        const refs: Array<{ id: string }> = ver?.content?.metadata?.references || [];
                        if (refs.length) nodeRefs[nodeId] = refs.map(r => r.id);

                        // Extract best heading from body
                        const body: string = ver?.content?.messages?.[0]?.content || "";
                        const h3 = body.match(/###\s+(.+)/)?.[1]?.trim();
                        const firstLine = body.split("\n").find(l => l.trim() && !l.startsWith("<!--") && !l.startsWith("##"))?.trim();
                        sectionHeadings[nodeId] = h3 || firstLine || "";
                    } catch { /* non-fatal */ }
                }));

                if (cancelled) return;

                // ─── Build graph with orbit initial positions ─────────────
                const W = dimensions.width, H = dimensions.height;
                const cx = W / 2, cy = H / 2;
                const nodes: GraphNode[] = [];
                const links: GraphLink[] = [];

                const docSpread = Math.min(W, H) * (parents.length === 1 ? 0 : 0.26);

                parents.forEach((p, i) => {
                    const angle = (2 * Math.PI * i) / parents.length - Math.PI / 2;
                    const px = cx + docSpread * Math.cos(angle);
                    const py = cy + docSpread * Math.sin(angle);

                    const sectionIds = Object.values(p.rag_meta?.node_capsule_map || {});
                    const fullName = docLabels[p.capsule_id];

                    nodes.push({
                        id: p.capsule_id,
                        label: fullName,
                        hoverLabel: `${fullName} · ${sectionIds.length} sections`,
                        type: "document",
                        colorIdx: i % PALETTE.length,
                        val: 40,
                        parentCapsuleId: p.capsule_id,
                        x: px,
                        y: py,
                    });

                    sectionIds.forEach((nodeId, j) => {
                        const orbitAngle = (2 * Math.PI * j) / sectionIds.length;
                        const orbitR = 95;
                        const heading = sectionHeadings[nodeId] || "";
                        nodes.push({
                            id: nodeId,
                            label: "",
                            hoverLabel: heading,
                            type: "section",
                            colorIdx: i % PALETTE.length,
                            val: 4,
                            parentCapsuleId: p.capsule_id,
                            x: px + orbitR * Math.cos(orbitAngle),
                            y: py + orbitR * Math.sin(orbitAngle),
                        });
                        links.push({ source: p.capsule_id, target: nodeId, linkType: "hierarchy" });
                    });
                });

                // Cross-doc edges
                const nodeIdSet = new Set(nodes.map(n => n.id));
                for (const [src, targets] of Object.entries(nodeRefs)) {
                    for (const tgt of targets) {
                        if (nodeIdSet.has(tgt) && nodeToParent[src] !== nodeToParent[tgt]) {
                            links.push({ source: src, target: tgt, linkType: "reference" });
                        }
                    }
                }

                setGraphData({ nodes, links });
                const refCount = links.filter(l => l.linkType === "reference").length;
                setStatus(`${parents.length} documents · ${allSectionIds.length} sections · ${refCount} cross-doc refs`);
                setLoading(false);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to load graph.");
                    setLoading(false);
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    // Tune D3 forces once graph is ready
    useEffect(() => {
        if (!graphRef.current || !graphData.nodes.length) return;
        const g = graphRef.current;
        g.d3Force("link")?.distance((link: GraphLink) =>
            link.linkType === "hierarchy" ? 85 : 260
        );
        g.d3Force("charge")?.strength((node: GraphNode) =>
            node.type === "document" ? -500 : -50
        );
        g.d3ReheatSimulation();
    }, [graphData]);

    // ─── Hover ──────────────────────────────────────────────────────────────
    // hoveredNode is kept in state (not just a ref) so that changing it
    // recreates the canvas callbacks with new function references, which
    // causes ForceGraph2D to repaint even after the simulation has cooled down.

    const onNodeHover = useCallback((node: GraphNode | null) => {
        setHoveredNode(node);
        if (containerRef.current) {
            containerRef.current.style.cursor = node ? "pointer" : "default";
        }
    }, []);

    // Draw tooltip overlay after all nodes are painted
    const onRenderFramePost = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
        const node = hoveredNode;
        if (!node || !node.hoverLabel) return;

        const nx = node.x as number;
        const ny = node.y as number;
        const c = PALETTE[node.colorIdx];

        const fontSize = Math.max(8, 11 / globalScale);
        ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;

        const text = node.hoverLabel;
        const textW = ctx.measureText(text).width;
        const padX = 9 / globalScale;
        const padY = 6 / globalScale;
        const boxW = textW + padX * 2;
        const boxH = fontSize + padY * 2;
        const nodeR = node.type === "document" ? 22 / globalScale : 8 / globalScale;
        const bx = nx - boxW / 2;
        const by = ny - nodeR - boxH - 4 / globalScale;
        const radius = 4 / globalScale;

        // Rounded rect background
        ctx.beginPath();
        ctx.moveTo(bx + radius, by);
        ctx.lineTo(bx + boxW - radius, by);
        ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + radius);
        ctx.lineTo(bx + boxW, by + boxH - radius);
        ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - radius, by + boxH);
        ctx.lineTo(bx + radius, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - radius);
        ctx.lineTo(bx, by + radius);
        ctx.quadraticCurveTo(bx, by, bx + radius, by);
        ctx.closePath();

        ctx.fillStyle = "rgba(13,17,23,0.93)";
        ctx.fill();

        // Colored border matching the node
        ctx.strokeStyle = c.fill;
        ctx.lineWidth = 0.8 / globalScale;
        ctx.stroke();

        // Text
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, nx, by + boxH / 2);
    }, [hoveredNode]); // recreated on hover → ForceGraph2D repaints

    // ─── Node canvas rendering ──────────────────────────────────────────────

    const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const nx = node.x as number;
        const ny = node.y as number;
        const c = PALETTE[node.colorIdx];
        const isHovered = hoveredNode?.id === node.id;

        if (node.type === "document") {
            const r = isHovered ? 20 : 18;

            // Glow (brighter on hover)
            ctx.shadowColor = c.glow;
            ctx.shadowBlur = isHovered ? 34 : 24;
            ctx.beginPath();
            ctx.arc(nx, ny, r, 0, 2 * Math.PI);
            ctx.fillStyle = c.fill;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner highlight
            const grad = ctx.createRadialGradient(nx - r * 0.3, ny - r * 0.35, 1, nx, ny, r);
            grad.addColorStop(0, "rgba(255,255,255,0.22)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath();
            ctx.arc(nx, ny, r, 0, 2 * Math.PI);
            ctx.fillStyle = grad;
            ctx.fill();

            // Label below
            if (node.label) {
                const fontSize = Math.max(9, 12 / globalScale);
                ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                const maxW = 120 / globalScale;
                let display = node.label;
                while (display.length > 4 && ctx.measureText(display).width > maxW) {
                    display = display.slice(0, -4) + "…";
                }
                ctx.shadowColor = "rgba(0,0,0,0.9)";
                ctx.shadowBlur = 6;
                ctx.fillStyle = "#f1f5f9";
                ctx.fillText(display, nx, ny + r + 5 / globalScale);
                ctx.shadowBlur = 0;
            }
        } else {
            // Section dot — brighter + slightly larger on hover
            const r = isHovered ? 5 : 3.5;
            ctx.shadowColor = c.section;
            ctx.shadowBlur = isHovered ? 14 : 10;
            ctx.beginPath();
            ctx.arc(nx, ny, r, 0, 2 * Math.PI);
            ctx.fillStyle = c.section;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }, [hoveredNode]); // recreated on hover → ForceGraph2D repaints

    // ─── Link styling ───────────────────────────────────────────────────────

    const linkColor = useCallback((link: GraphLink) =>
        link.linkType === "reference" ? "rgba(249,115,22,0.45)" : "rgba(255,255,255,0.07)", []);

    const linkWidth = useCallback((link: GraphLink) =>
        link.linkType === "reference" ? 1 : 0.5, []);

    const linkDirectionalArrowLength = useCallback((link: GraphLink) =>
        link.linkType === "reference" ? 4 : 0, []);

    const linkDirectionalArrowRelPos = useCallback(() => 1, []);

    const linkLineDash = useCallback((link: GraphLink) =>
        link.linkType === "reference" ? [3, 2] : null, []);

    // ─── Render ─────────────────────────────────────────────────────────────

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-3 text-center" style={{ background: BG }}>
                <Network className="h-10 w-10 text-gray-600" />
                <p className="text-gray-500 max-w-sm text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 sm:-m-6 md:-m-8 lg:-m-10 overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0"
                style={{ background: "#0d1117", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                    <Network className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-white text-sm tracking-tight">Knowledge Graph</span>
                    {loading
                        ? <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Loader2 className="h-3 w-3 animate-spin" />{status}
                          </span>
                        : <span className="text-xs text-gray-600">{status}</span>
                    }
                </div>
                <div className="hidden sm:flex items-center gap-5 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ background: PALETTE[0].fill, boxShadow: `0 0 6px ${PALETTE[0].glow}` }} />
                        Document
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full"
                            style={{ background: PALETTE[0].section }} />
                        Section
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-5 border-t border-dashed border-orange-500/50" />
                        Cross-ref
                    </span>
                </div>
            </div>

            {/* ── Canvas ── */}
            <div ref={containerRef} className="flex-1 overflow-hidden" style={{ background: BG }}>
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                    </div>
                )}
                {!loading && graphData.nodes.length > 0 && (
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeId="id"
                        nodeLabel=""
                        nodeCanvasObject={nodeCanvasObject}
                        nodeCanvasObjectMode={() => "replace"}
                        onNodeHover={onNodeHover}
                        onRenderFramePost={onRenderFramePost}
                        linkColor={linkColor}
                        linkWidth={linkWidth}
                        linkDirectionalArrowLength={linkDirectionalArrowLength}
                        linkDirectionalArrowRelPos={linkDirectionalArrowRelPos}
                        linkLineDash={linkLineDash}
                        backgroundColor={BG}
                        linkCurvature={0.15}
                        cooldownTicks={160}
                        d3AlphaDecay={0.022}
                        d3VelocityDecay={0.38}
                    />
                )}
            </div>
        </div>
    );
}

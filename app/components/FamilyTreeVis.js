'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

/**
 * ULTRA-RESPONSIVE FOCUS-FLOW
 * Specifically engineered for Mobile Touch & Desktop Web fluidity
 */
export default function FamilyTreeVis({ data, onNodeClick, focusId }) {
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const containerRef = useRef(null);
    const zoomRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // ─── DIMENSION MANAGEMENT ───────────────────────────
    useEffect(() => {
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight || window.innerHeight * 0.75
                });
            }
        };
        updateDims();
        window.addEventListener('resize', updateDims);
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    // ─── RECENTER UTILITY ──────────────────────────────
    const recenter = useCallback(() => {
        if (!zoomRef.current || !svgRef.current || dimensions.width === 0) return;
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        // Find focus node in the global DOM if possible, or use the layout coordinates
        const focusNode = g.selectAll(".node").filter(d => d.id === focusId).data()[0];
        if (!focusNode) return;

        const isMobile = dimensions.width < 768;
        const scale = isMobile ? 0.35 : 0.65;
        const x = (dimensions.width / 2) - (focusNode.x * scale);
        const y = (dimensions.height / 2) - (focusNode.y * scale);

        svg.transition().duration(1000).ease(d3.easeCubicInOut)
            .call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));
    }, [focusId, dimensions]);

    // ─── MAIN D3 RENDERER ──────────────────────────────
    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0 || dimensions.width === 0) return;

        const svg = d3.select(svgRef.current);
        const { width, height } = dimensions;
        const isMobile = width < 768;

        // Adaptive Layout Config
        const cardW = isMobile ? 180 : 260;
        const cardH = isMobile ? 240 : 340;
        const gapY = isMobile ? 320 : 450;
        const gapX = isMobile ? 40 : 100;

        // Initialize SVG once
        if (!gRef.current) {
            svg.selectAll("*").remove();

            const defs = svg.append("defs");
            const pattern = defs.append("pattern")
                .attr("id", "grid")
                .attr("width", 40)
                .attr("height", 40)
                .attr("patternUnits", "userSpaceOnUse");
            pattern.append("circle")
                .attr("cx", 2)
                .attr("cy", 2)
                .attr("r", 1)
                .attr("fill", "rgba(255,255,255,0.05)");

            svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "url(#grid)");

            gRef.current = svg.append("g").attr("class", "main-group");

            const zoom = d3.zoom()
                .scaleExtent([0.1, 3])
                .on("zoom", (event) => d3.select(gRef.current).attr("transform", event.transform));

            zoomRef.current = zoom;
            svg.call(zoom).on("dblclick.zoom", null); // Disable double click zoom globally
        }

        const g = d3.select(gRef.current);
        const nodes = data.nodes.map(n => ({ ...n }));
        const links = data.links.map(l => ({ ...l }));
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const currFocusId = focusId || (nodes[0]?.id);

        if (!currFocusId) return;

        // BFS to build generational layout
        const queue = [{ id: currFocusId, gen: 0 }];
        const visited = new Set([currFocusId]);
        const nodeGenMap = { [currFocusId]: 0 };

        while (queue.length > 0) {
            const { id, gen } = queue.shift();
            links.forEach(l => {
                let neb = null, ngen = gen;
                if (l.source === id) {
                    neb = l.target;
                    ngen = l.type === 'CHILD_OF' ? gen - 1 : (l.type === 'PARENT_OF' ? gen + 1 : gen);
                } else if (l.target === id) {
                    neb = l.source;
                    ngen = l.type === 'CHILD_OF' ? gen + 1 : (l.type === 'PARENT_OF' ? gen - 1 : gen);
                }
                if (neb && !visited.has(neb)) {
                    visited.add(neb);
                    nodeGenMap[neb] = ngen;
                    queue.push({ id: neb, gen: ngen });
                }
            });
        }

        const levels = {};
        nodes.forEach(n => {
            const l = nodeGenMap[n.id];
            if (l !== undefined) {
                n.level = l;
                if (!levels[l]) levels[l] = [];
                levels[l].push(n);
            } else n.level = 999;
        });

        // Compute Horizontal Positions
        Object.keys(levels).forEach(lvl => {
            const group = levels[lvl];
            const tw = group.length * (cardW + gapX) - gapX;
            group.forEach((n, i) => {
                n.x = (i * (cardW + gapX)) - (tw / 2);
                n.y = n.level * gapY;
            });
        });

        const vNodes = nodes.filter(n => n.level !== 999);
        const vLinks = links.filter(l => nodeMap.get(l.source)?.level !== 999 && nodeMap.get(l.target)?.level !== 999);
        const trans = d3.transition().duration(1000).ease(d3.easeCubicInOut);

        // Render Links
        const link = g.selectAll(".tree-link").data(vLinks, d => `${d.source}-${d.target}`);
        link.exit().remove();
        const linkEnter = link.enter().append("path").attr("class", "tree-link").attr("fill", "none").attr("stroke", "#818cf8").attr("stroke-width", 2).style("opacity", 0);
        link.merge(linkEnter).transition(trans).style("opacity", 0.4).attr("d", d => {
            const s = nodeMap.get(d.source), t = nodeMap.get(d.target);
            if (!s || !t) return "";
            const mid = (s.y + t.y) / 2;
            return `M ${s.x},${s.y} C ${s.x},${mid} ${t.x},${mid} ${t.x},${t.y}`;
        });

        // Render Nodes
        const node = g.selectAll(".node").data(vNodes, d => d.id);
        node.exit().remove();
        const nodeEnter = node.enter().append("foreignObject")
            .attr("class", "node")
            .attr("width", cardW).attr("height", cardH)
            .attr("x", d => d.x - cardW / 2).attr("y", d => d.y - cardH / 2)
            .style("opacity", 0)
            .on("click", (e, d) => onNodeClick && onNodeClick(d));

        nodeEnter.append("xhtml:div").attr("class", "card-wrapper").html(d => `
            <div class="p-card ${d.id === currFocusId ? 'active' : ''} ${d.isDeceased ? 'deceased' : ''}">
                <div class="p-avatar">
                   ${d.photo ? `<img src="${d.photo}" />` : `<span>${d.sex === 'female' ? '👩' : '👨'}</span>`}
                </div>
                <div class="p-meta">
                   <span class="p-tag">${d.id === currFocusId ? 'FOCUS' : (d.tribe || 'RELATIVE')}</span>
                   <h3 class="p-name">${d.name}</h3>
                   <span class="p-surname">${d.surname || ''}</span>
                </div>
            </div>
        `);

        node.merge(nodeEnter).transition(trans)
            .style("opacity", 1)
            .attr("width", cardW).attr("height", cardH)
            .attr("x", d => d.x - cardW / 2).attr("y", d => d.y - cardH / 2);

        // Initial Auto-Center
        recenter();

    }, [data, focusId, dimensions, recenter]);

    return (
        <div ref={containerRef} className="viz-viewport">
            <svg ref={svgRef} className="viz-svg"></svg>

            <div className="viz-hud">
                <button title="Recenter" onClick={recenter} className="hud-btn">🎯</button>
                <button title="Zoom In" onClick={() => handleZoom(1.4)} className="hud-btn">+</button>
                <button title="Zoom Out" onClick={() => handleZoom(0.7)} className="hud-btn">−</button>
            </div>

            <style jsx>{`
                .viz-viewport {
                    width: 100%;
                    height: 100%;
                    min-height: 80vh;
                    background: #020617;
                    position: relative;
                    touch-action: none;
                }
                .viz-svg { width: 100%; height: 100%; cursor: grab; }
                .viz-svg:active { cursor: grabbing; }

                .viz-hud {
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    z-index: 100;
                }
                .hud-btn {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    background: rgba(30, 41, 59, 0.9);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                }
                .hud-btn:hover { background: #818cf8; transform: translateY(-2px); }

                .card-wrapper { width: 100%; height: 100%; padding: 10px; pointer-events: none; }
                .p-card {
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    pointer-events: auto;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .p-card.active { border-color: #818cf8; border-width: 2px; box-shadow: 0 0 40px rgba(129, 140, 248, 0.3); }
                .p-card:hover { transform: scale(1.05); border-color: #818cf8; }
                .p-card.deceased { opacity: 0.6; filter: grayscale(0.8); }

                .p-avatar {
                    width: 70%;
                    aspect-ratio: 1;
                    border-radius: 18px;
                    background: rgba(255,255,255,0.05);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .p-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .p-avatar span { font-size: 44px; }

                .p-tag { font-size: 10px; font-weight: 900; color: #818cf8; letter-spacing: 2px; margin-bottom: 8px; }
                .p-name { font-size: 1.25rem; font-weight: 900; color: white; margin: 0; line-height: 1.1; }
                .p-surname { font-size: 0.85rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px; }

                @media (max-width: 768px) {
                    .viz-hud { bottom: 100px; right: 20px; }
                    .hud-btn { width: 48px; height: 48px; font-size: 1.25rem; border-radius: 12px; }
                    .p-card { padding: 15px; }
                    .p-name { font-size: 1rem; }
                    .p-avatar span { font-size: 32px; }
                }
            `}</style>
        </div>
    );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * RESPONSIVE FOCUS-FLOW: Premium Family Heritage UI
 * Optimized for both Mobile (Touch) and Desktop (Web)
 */
export default function FamilyTreeVis({ data, onNodeClick, focusId }) {
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const containerRef = useRef(null);
    const zoomRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 800 });

    useEffect(() => {
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: window.innerHeight * 0.85
                });
            }
        };
        updateDims();
        const resizeObserver = new ResizeObserver(updateDims);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', updateDims);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDims);
        };
    }, []);

    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0 || dimensions.width === 0) return;

        const svg = d3.select(svgRef.current);
        const { width, height } = dimensions;
        const isMobile = width < 768;

        // ─── ADAPTIVE SIZES ──────────────────────────────────
        const cardW = isMobile ? 220 : 280;
        const cardH = isMobile ? 280 : 360;
        const gapY = isMobile ? 350 : 450;
        const gapX = isMobile ? 60 : 100;

        // ─── INIT SVG ───────────────────────────────────────
        if (!gRef.current) {
            svg.selectAll("*").remove();

            const defs = svg.append("defs");

            // Glow Definition
            const filter = defs.append("filter")
                .attr("id", "glow")
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "200%")
                .attr("height", "200%");
            filter.append("feGaussianBlur")
                .attr("stdDeviation", "15")
                .attr("result", "coloredBlur");
            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // Background Dots
            const pattern = defs.append("pattern")
                .attr("id", "dots")
                .attr("width", 50)
                .attr("height", 50)
                .attr("patternUnits", "userSpaceOnUse");
            pattern.append("circle")
                .attr("cx", 2)
                .attr("cy", 2)
                .attr("r", 1)
                .attr("fill", "var(--border)");

            svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "url(#dots)");

            gRef.current = svg.append("g");

            const zoom = d3.zoom()
                .scaleExtent([0.1, 2])
                .on("zoom", (event) => gRef.current.attr("transform", event.transform));

            zoomRef.current = zoom;
            svg.call(zoom);
        }

        const g = gRef.current;
        const nodes = data.nodes.map(n => ({ ...n }));
        const links = data.links.map(l => ({ ...l }));
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const focusNode = nodeMap.get(focusId) || nodes[0];
        const currentFocusId = focusNode?.id;

        if (!currentFocusId) return;

        // ─── DYNAMIC GENERATIONAL MAPPING (BFS) ──────────────
        const queue = [{ id: currentFocusId, gen: 0 }];
        const visited = new Set([currentFocusId]);
        const nodeGenMap = { [currentFocusId]: 0 };

        while (queue.length > 0) {
            const { id, gen } = queue.shift();
            links.forEach(l => {
                let neighborId = null;
                let nextGen = gen;
                if (l.source === id) {
                    neighborId = l.target;
                    if (l.type === 'CHILD_OF') nextGen = gen - 1;
                    else if (l.type === 'PARENT_OF') nextGen = gen + 1;
                    else nextGen = gen;
                } else if (l.target === id) {
                    neighborId = l.source;
                    if (l.type === 'CHILD_OF') nextGen = gen + 1;
                    else if (l.type === 'PARENT_OF') nextGen = gen - 1;
                    else nextGen = gen;
                }
                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    nodeGenMap[neighborId] = nextGen;
                    queue.push({ id: neighborId, gen: nextGen });
                }
            });
        }

        const levels = {};
        nodes.forEach(n => {
            const gen = nodeGenMap[n.id];
            if (gen !== undefined) {
                n.level = gen;
                if (!levels[gen]) levels[gen] = [];
                levels[gen].push(n);
            } else {
                n.level = 99;
            }
        });

        const visibleLinks = links.filter(l => nodeMap.get(l.source)?.level !== 99 && nodeMap.get(l.target)?.level !== 99);

        // Position nodes
        const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);
        sortedLevels.forEach(lvl => {
            const nodesInLvl = levels[lvl];
            const totalWidth = nodesInLvl.length * (cardW + gapX) - gapX;
            nodesInLvl.forEach((n, i) => {
                n.x = (i * (cardW + gapX)) - (totalWidth / 2);
                n.y = lvl * gapY;
            });
        });

        const visibleNodes = nodes.filter(n => n.level !== 99);
        const t = d3.transition().duration(800).ease(d3.easeCubicInOut);

        // ─── RENDERING ───────────────────────────────────────
        const link = g.selectAll(".link").data(visibleLinks, d => `${d.source}-${d.target}`);
        link.exit().transition(t).style("opacity", 0).remove();
        const linkEnter = link.enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "var(--accent)")
            .attr("stroke-width", 2)
            .style("opacity", 0);

        link.merge(linkEnter).transition(t)
            .style("opacity", 0.3)
            .attr("d", d => {
                const s = nodeMap.get(d.source);
                const t = nodeMap.get(d.target);
                if (!s || !t) return "";
                const midY = (s.y + t.y) / 2;
                return `M ${s.x},${s.y} C ${s.x},${midY} ${t.x},${midY} ${t.x},${t.y}`;
            });

        const node = g.selectAll(".node").data(visibleNodes, d => d.id);
        node.exit().transition(t).style("opacity", 0).remove();

        const nodeEnter = node.enter().append("foreignObject")
            .attr("class", "node")
            .attr("width", cardW)
            .attr("height", cardH)
            .attr("x", d => d.x - cardW / 2)
            .attr("y", d => d.y - cardH / 2)
            .style("opacity", 0)
            .on("click", (e, d) => onNodeClick && onNodeClick(d));

        nodeEnter.append("xhtml:div")
            .attr("class", d => `person-card ${d.id === (focusId || currentFocusId) ? 'active' : ''} ${d.isDeceased ? 'deceased' : ''}`)
            .html(d => `
                <div class="card-glass"></div>
                <div class="card-content">
                    <div class="avatar-container">
                        ${d.photo ? `<img src="${d.photo}" class="avatar-img" />` : `<div class="avatar-fallback">${d.sex === 'female' ? '👩' : '👨'}</div>`}
                    </div>
                    <div class="card-info">
                        <span class="rel-label">${d.id === (focusId || currentFocusId) ? 'FOCUS' : (d.tribe || 'RELATIVE')}</span>
                        <h3 class="name">${d.name}</h3>
                        <h4 class="surname">${d.surname || ''}</h4>
                    </div>
                </div>
            `);

        const nodeUpdate = node.merge(nodeEnter);

        nodeUpdate.each(function (d) {
            if (d.id === (focusId || currentFocusId)) d3.select(this).raise();
        });

        nodeUpdate.transition(t)
            .style("opacity", 1)
            .attr("width", cardW)
            .attr("height", cardH)
            .attr("x", d => d.x - cardW / 2)
            .attr("y", d => d.y - cardH / 2);

        // ─── VIEWPORT FOCUS ──────────────────────────────────
        const focusNodeLayout = visibleNodes.find(n => n.id === (focusId || currentFocusId));
        const initialScale = isMobile ? 0.45 : 0.75;
        const tx = focusNodeLayout ? (width / 2) - (focusNodeLayout.x * initialScale) : width / 2;
        const ty = focusNodeLayout ? (height / 2) - (focusNodeLayout.y * initialScale) : height / 2;

        if (zoomRef.current) {
            svg.transition(t).call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(tx, ty).scale(initialScale)
            );
        }

    }, [data, focusId, dimensions]);

    const handleZoom = (delta) => {
        if (!svgRef.current || !zoomRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomRef.current.scaleBy, delta);
    };

    return (
        <div ref={containerRef} className="tree-container">
            <svg ref={svgRef} className="tree-svg"></svg>

            {/* Minimal Zoom Controls */}
            <div className="zoom-controls">
                <button onClick={() => handleZoom(1.3)}>+</button>
                <button onClick={() => handleZoom(0.7)}>−</button>
            </div>

            <style jsx>{`
                .tree-container {
                    width: 100%;
                    height: ${dimensions.height}px;
                    background: #0f172a;
                    position: relative;
                    overflow: hidden;
                    touch-action: none;
                }
                .tree-svg { width: 100%; height: 100%; cursor: grab; }
                .tree-svg:active { cursor: grabbing; }

                .person-card {
                    width: 100%;
                    height: 100%;
                    padding: 1rem;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .person-card:hover { border-color: var(--accent); transform: translateY(-5px); box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2); }
                .person-card.active { border-color: var(--accent); border-width: 2px; box-shadow: 0 0 30px rgba(99, 102, 241, 0.3); }
                .person-card.deceased { filter: grayscale(1) opacity(0.7); }

                .avatar-container {
                    width: 100%;
                    aspect-ratio: 1;
                    max-width: 120px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-fallback { font-size: 3rem; }

                .rel-label { font-size: 0.6rem; font-weight: 900; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
                .name { font-size: 1.1rem; font-weight: 800; color: white; margin: 0; line-height: 1.2; }
                .surname { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 2px; text-transform: uppercase; }

                .zoom-controls {
                    position: absolute;
                    bottom: 2rem;
                    right: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    z-index: 50;
                }
                .zoom-controls button {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s;
                }
                .zoom-controls button:hover { background: var(--accent); border-color: var(--accent); }

                @media (max-width: 768px) {
                    .zoom-controls { bottom: 1.5rem; right: 1.5rem; }
                    .zoom-controls button { width: 40px; height: 40px; }
                    .name { font-size: 1rem; }
                    .person-card { padding: 0.75rem; }
                }
            `}</style>
        </div>
    );
}

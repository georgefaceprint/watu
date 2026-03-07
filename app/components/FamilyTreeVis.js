'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * FOCUS-FLOW (Option 4): High-Performance, Cinematic Family Heritage UI
 * Optimized for Watu.Network Premium Experience with ForeignObject Cards
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
        window.addEventListener('resize', updateDims);
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0 || dimensions.width === 0) return;

        const svg = d3.select(svgRef.current);
        const { width, height } = dimensions;

        // ─── INIT SVG ───────────────────────────────────────
        if (!gRef.current) {
            svg.selectAll("*").remove();

            // Glow Definition
            const defs = svg.append("defs");
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
        const cardW = 280;
        const cardH = 360;
        const gapY = 450;
        const gapX = 100;

        // ─── DATA LAYOUT (FOCUS-FLOW) ────────────────────────
        const nodes = [...data.nodes];
        const links = [...data.links];
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const focusNode = nodeMap.get(focusId) || nodes[0];
        const currentFocusId = focusNode.id;

        // ─── DYNAMIC GENERATIONAL MAPPING (BFS) ──────────────
        // This calculates the generational offset from the focus node
        // Ancestors = -1, -2... | Peers = 0 | Descendants = 1, 2...
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
                    else if (l.type === 'GRANDPARENT_OF') nextGen = gen + 2;
                    else if (l.type === 'GRANDCHILD_OF') nextGen = gen - 2;
                    else nextGen = gen; // Sibling/Spouse/Cousin
                } else if (l.target === id) {
                    neighborId = l.source;
                    if (l.type === 'CHILD_OF') nextGen = gen + 1;
                    else if (l.type === 'PARENT_OF') nextGen = gen - 1;
                    else if (l.type === 'GRANDPARENT_OF') nextGen = gen - 2;
                    else if (l.type === 'GRANDCHILD_OF') nextGen = gen + 2;
                    else nextGen = gen; // Sibling/Spouse/Cousin
                }

                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    nodeGenMap[neighborId] = nextGen;
                    queue.push({ id: neighborId, gen: nextGen });
                }
            });
        }

        const levels = {};
        const visibleLinks = links.filter(l => nodeMap.get(l.source)?.level !== 99 && nodeMap.get(l.target)?.level !== 99);

        nodes.forEach(n => {
            const gen = nodeGenMap[n.id];
            if (gen !== undefined) {
                n.level = gen;
                if (!levels[gen]) levels[gen] = [];
                levels[gen].push(n);

                // Add Descriptive Label based on Sex and Level
                const isFemale = n.sex?.toLowerCase() === 'female' || n.maidenName;
                if (gen === 0) {
                    if (n.id === currentFocusId) n.relLabel = 'ARCHIVE FOCUS';
                    else {
                        const linkToFocus = visibleLinks.find(l => (l.source === currentFocusId && l.target === n.id) || (l.target === currentFocusId && l.source === n.id));
                        if (linkToFocus?.type === 'SPOUSE_OF') n.relLabel = isFemale ? 'WIFE' : 'HUSBAND';
                        else if (linkToFocus?.type === 'SIBLING_OF') n.relLabel = isFemale ? 'SISTER' : 'BROTHER';
                        else if (linkToFocus?.type === 'COUSIN_OF') n.relLabel = 'COUSIN';
                        else if (n.level === 0) n.relLabel = isFemale ? 'SISTER' : 'BROTHER'; // Fallback for sibling logic in BFS
                        else n.relLabel = 'CLAN KIN';
                    }
                } else if (gen === -1) n.relLabel = isFemale ? 'MOTHER' : 'FATHER';
                else if (gen === -2) n.relLabel = isFemale ? 'GRANDMOTHER' : 'GRANDFATHER';
                else if (gen === -3) n.relLabel = isFemale ? 'GREAT GRANDMOTHER' : 'GREAT GRANDFATHER';
                else if (gen < -3) n.relLabel = `L${Math.abs(gen)} ANCESTOR`;
                else if (gen === 1) n.relLabel = isFemale ? 'DAUGHTER' : 'SON';
                else if (gen === 2) n.relLabel = isFemale ? 'GRANDDAUGHTER' : 'GRANDSON';
                else if (gen > 2) n.relLabel = `L${gen} DESCENDANT`;
            } else {
                n.level = 99; // Orphaned from focus
            }
        });

        // Position nodes using sorted generational levels
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
        const t = d3.transition().duration(1000).ease(d3.easeCubicInOut);

        // Links
        const link = g.selectAll(".link")
            .data(visibleLinks, d => `${d.source}-${d.target}`);

        link.exit().transition(t).style("opacity", 0).remove();

        const linkEnter = link.enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "var(--accent)")
            .attr("stroke-width", 2)
            .style("opacity", 0.15)
            .style("stroke-dasharray", d => d.type === 'SPOUSE_OF' ? "5,5" : "none")
            .style("opacity", 0);

        link.merge(linkEnter).transition(t)
            .style("opacity", 1)
            .attr("d", d => {
                const s = nodeMap.get(d.source);
                const t = nodeMap.get(d.target);
                if (d.type === 'SPOUSE_OF') {
                    return `M ${s.x},${s.y} L ${t.x},${t.y}`;
                }
                const midY = (s.y + t.y) / 2;
                return `M ${s.x},${s.y} C ${s.x},${midY} ${t.x},${midY} ${t.x},${t.y}`;
            });

        // ─── RENDER NODES ────────────────────────────────────
        const node = g.selectAll(".node")
            .data(visibleNodes, d => d.id);

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
            .attr("class", d => `person-card ${d.id === currentFocusId ? 'active' : ''} ${d.isDeceased ? 'deceased' : ''}`)
            .html(d => `
                <div class="card-glass"></div>
                <div class="card-content">
                    <div class="avatar-container">
                        ${d.photo ? `<img src="${d.photo}" alt="${d.name}" class="avatar-img" />` : `<div class="avatar-fallback">${d.sex === 'female' ? '👩' : '👨'}</div>`}
                        ${d.id === currentFocusId ? '<div class="focus-pulse"></div>' : ''}
                    </div>
                    <div class="card-info">
                        <div class="tag-row">
                            <span class="tribe-tag ${d.level < 0 ? 'gen-ancestor' : d.level > 0 ? 'gen-descendant' : 'gen-active'}">${d.tribe || 'WATU'}</span>
                            <span class="status-tag">${d.relLabel || 'RELATIVE'}</span>
                        </div>
                        <h3 class="name">${d.name}</h3>
                        <h4 class="surname">${d.surname}</h4>
                        
                        ${d.id === currentFocusId
                    ? `<div class="focus-indicator">
                                <span class="pulse-dot"></span>
                                ACTIVE FOCUS
                               </div>`
                    : `<button class="focus-btn">
                                MAKE FOCUS
                               </button>`
                }

                        <div class="meta-data">
                            <span>ID: ${d.id}</span>
                            <span>GEN: ${d.level === 0 ? 'CORE' : (d.level > 0 ? '+' + d.level : d.level)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-accents">
                    <div class="corner tl"></div>
                    <div class="corner tr"></div>
                    <div class="corner bl"></div>
                    <div class="corner br"></div>
                </div>
            `);

        const nodeUpdate = node.merge(nodeEnter);

        nodeUpdate.transition(t)
            .style("opacity", 1)
            .attr("x", d => d.x - cardW / 2)
            .attr("y", d => d.y - cardH / 2);

        // ─── AUTO-ALIGN & CENTER VIEW ────────────────────────
        const focusNodeLayout = visibleNodes.find(n => n.id === currentFocusId);
        const isMobile = width < 768;
        const initialScale = isMobile ? 0.5 : 0.8;

        // Add a vertical offset to account for the "LINEAGE EXPLORER" overlay at the top:
        // More offset for desktop to clear the top overlays, less for mobile.
        const verticalOffset = isMobile ? 20 : 80;

        // Calculate translation needed to place focus node exactly in the middle
        const tx = focusNodeLayout ? (width / 2) - (focusNodeLayout.x * initialScale) : width / 2;
        const ty = focusNodeLayout ? (height / 2) - (focusNodeLayout.y * initialScale) + verticalOffset : height / 2;

        if (zoomRef.current) {
            svg.transition(t).call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(tx, ty).scale(initialScale)
            );
        }

    }, [data, focusId, dimensions]);

    return (
        <div ref={containerRef} className="focus-flow-viewport" style={{
            width: '100%',
            height: dimensions.height,
            background: 'var(--background)',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'grab'
        }}>
            <svg ref={svgRef} width="100%" height="100%" style={{ touchAction: 'none' }}></svg>

            <div className="system-overlay">
                <div className="scanner-line"></div>
                <div className="status-bar">
                    <div className="pulse"></div>
                    <span>WATU.NETWORK // ARCHIVE_MODE // SYNC: 100%</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .person-card {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    transform-origin: center;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .person-card:hover {
                    border-color: var(--accent);
                    box-shadow: 0 0 50px rgba(99, 102, 241, 0.4);
                    transform: scale(1.05) translateY(-15px);
                }
                .person-card.active {
                    border-color: #ef4444;
                    border-width: 3px;
                    box-shadow: 0 0 80px rgba(239, 68, 68, 0.5);
                    transform: scale(1.02);
                }
                .person-card.deceased {
                    filter: grayscale(0.8) contrast(1.1) brightness(0.9);
                }
                .card-glass {
                    position: absolute;
                    inset: 0;
                    background: var(--card);
                    border: 1px solid var(--border);
                    backdrop-filter: blur(16px);
                    z-index: 0;
                }
                .card-content {
                    position: relative;
                    z-index: 1;
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }
                .avatar-container {
                    width: 140px;
                    height: 170px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 16px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden;
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
                }
                .avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-fallback { font-size: 80px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
                
                .focus-pulse {
                    position: absolute;
                    inset: -8px;
                    border: 2px solid #ef4444;
                    border-radius: 20px;
                    animation: pulseRed 2s infinite;
                }
                @keyframes pulseRed {
                    0% { opacity: 0.8; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.15); }
                }

                .card-info { text-align: center; width: 100%; }
                .tag-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; font-family: 'Outfit', sans-serif; }
                .tribe-tag { font-size: 10px; font-weight: 800; color: #fff; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.05em; transition: all 0.3s; }
                .tribe-tag.gen-ancestor { background: linear-gradient(135deg, #b45309, #d97706); box-shadow: 0 0 15px rgba(217, 119, 6, 0.3); }
                .tribe-tag.gen-active { background: var(--accent); }
                .tribe-tag.gen-descendant { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }
                
                .status-tag { font-size: 10px; font-weight: 800; color: var(--text-secondary); background: var(--accent-muted); padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border); }
                
                .name { font-size: 22px; color: var(--foreground); font-weight: 800; margin: 0; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.02em; }
                .surname { font-size: 14px; color: var(--accent); font-weight: 700; margin: 6px 0 16px 0; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
                
                .focus-btn {
                    width: 100%;
                    padding: 10px;
                    background: var(--accent-muted);
                    border: 1px solid var(--border);
                    color: var(--accent);
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    transition: all 0.3s;
                    margin-bottom: 4px;
                }
                .focus-btn:hover {
                    background: var(--accent);
                    color: #fff;
                    box-shadow: var(--shadow-glow);
                }

                .focus-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #ef4444;
                    letter-spacing: 0.1em;
                    margin: 12px 0;
                }
                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #ef4444;
                    animation: glowRed 1s infinite;
                }
                @keyframes glowRed { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.5); } }

                .meta-data { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); font-weight: 700; border-top: 1px solid var(--border); padding-top: 16px; margin-top: auto; }
                
                .card-accents .corner { position: absolute; width: 15px; height: 15px; border: 2px solid var(--accent); opacity: 0; transition: all 0.4s ease; }
                .person-card:hover .corner { opacity: 0.8; width: 20px; height: 20px; }
                .corner.tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
                .corner.tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
                .corner.bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
                .corner.br { bottom: 12px; right: 12px; border-left: none; border-top: none; }


                .system-overlay { position: absolute; inset: 0; pointer-events: none; }
                .status-bar { position: absolute; top: 30px; left: 30px; display: flex; alignItems: center; gap: 12px; font-size: 11px; color: var(--text-secondary); font-weight: 800; letter-spacing: 0.1em; }
                .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 10px var(--accent); animation: glowAnim 1.5s infinite; }
                @keyframes glowAnim { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                
                .scanner-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, transparent, var(--accent), transparent);
                    opacity: 0.1;
                    animation: scan 6s linear infinite;
                }
                @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
            `}} />
        </div>
    );
}


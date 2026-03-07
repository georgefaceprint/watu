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
                .attr("fill", "rgba(129, 140, 248, 0.1)");

            svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "url(#dots)");

            gRef.current = svg.append("g");

            const zoom = d3.zoom()
                .scaleExtent([0.2, 1.5])
                .on("zoom", (event) => gRef.current.attr("transform", event.transform));
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

        // Simple Level Assignment
        const levels = { '-1': [], '0': [], '1': [] };
        nodes.forEach(n => {
            if (n.id === currentFocusId) {
                n.level = 0; levels['0'].push(n);
            } else {
                const isParent = links.some(l => l.source === n.id && l.target === currentFocusId && l.type === 'CHILD_OF');
                const isChild = links.some(l => l.target === n.id && l.source === currentFocusId && l.type === 'CHILD_OF');
                const isSpouse = links.some(l => (l.source === n.id && l.target === currentFocusId) || (l.target === n.id && l.source === currentFocusId)) && links.find(l => (l.source === n.id && l.target === currentFocusId) || (l.target === n.id && l.source === currentFocusId)).type === 'SPOUSE_OF';

                if (isParent) { n.level = -1; levels['-1'].push(n); }
                else if (isChild) { n.level = 1; levels['1'].push(n); }
                else if (isSpouse) { n.level = 0; levels['0'].push(n); }
                else { n.level = 99; }
            }
        });

        // Position nodes
        Object.keys(levels).forEach(lvl => {
            const nodesInLvl = levels[lvl];
            const totalWidth = nodesInLvl.length * (cardW + gapX) - gapX;
            nodesInLvl.forEach((n, i) => {
                n.x = (i * (cardW + gapX)) - (totalWidth / 2);
                n.y = parseInt(lvl) * gapY;
            });
        });

        const visibleNodes = nodes.filter(n => n.level !== 99);
        const visibleLinks = links.filter(l => nodeMap.get(l.source)?.level !== 99 && nodeMap.get(l.target)?.level !== 99);

        const t = d3.transition().duration(1000).ease(d3.easeCubicInOut);

        // ─── RENDER LINKS ────────────────────────────────────
        const link = g.selectAll(".link")
            .data(visibleLinks, d => `${d.source}-${d.target}`);

        link.exit().transition(t).style("opacity", 0).remove();

        const linkEnter = link.enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "rgba(129, 140, 248, 0.2)")
            .attr("stroke-width", 2)
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
                            <span class="tribe-tag">${d.tribe || 'WATU'}</span>
                            ${d.isDeceased ? '<span class="status-tag">ANCESTOR</span>' : '<span class="status-tag">ACTIVE</span>'}
                        </div>
                        <h3 class="name">${d.name}</h3>
                        <h4 class="surname">${d.surname}</h4>
                        <div class="meta-data">
                            <span>ID: ${d.id}</span>
                            <span>GRP: ${d.clan || 'ALPHA'}</span>
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

        // Center View
        svg.transition(t).call(
            d3.zoom().transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7)
        );

    }, [data, focusId, dimensions]);

    return (
        <div ref={containerRef} className="focus-flow-viewport" style={{
            width: '100%',
            height: dimensions.height,
            background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
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
                    border-color: var(--accent);
                    border-width: 2px;
                    box-shadow: 0 0 60px rgba(99, 102, 241, 0.5);
                }
                .person-card.deceased {
                    filter: grayscale(0.8) contrast(1.2);
                }
                .card-glass {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
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
                .avatar-fallback { font-size: 80px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.8)); }
                
                .focus-pulse {
                    position: absolute;
                    inset: -8px;
                    border: 2px solid var(--accent);
                    border-radius: 20px;
                    animation: pulseFrame 2s infinite;
                }
                @keyframes pulseFrame {
                    0% { opacity: 0.8; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.15); }
                }

                .card-info { text-align: center; width: 100%; }
                .tag-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; font-family: 'Outfit', sans-serif; }
                .tribe-tag { font-size: 10px; font-weight: 800; color: #fff; background: var(--accent); padding: 5px 12px; border-radius: 6px; letter-spacing: 0.05em; }
                .status-tag { font-size: 10px; font-weight: 800; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
                
                .name { font-size: 22px; color: #fff; font-weight: 800; margin: 0; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.02em; }
                .surname { font-size: 14px; color: var(--accent); font-weight: 700; margin: 6px 0 20px 0; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
                
                .meta-data { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-top: auto; }
                
                .card-accents .corner { position: absolute; width: 15px; height: 15px; border: 2px solid var(--accent); opacity: 0; transition: all 0.4s ease; }
                .person-card:hover .corner { opacity: 0.8; width: 20px; height: 20px; }
                .corner.tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
                .corner.tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
                .corner.bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
                .corner.br { bottom: 12px; right: 12px; border-left: none; border-top: none; }


                .system-overlay { position: absolute; inset: 0; pointer-events: none; }
                .status-bar { position: absolute; top: 30px; left: 30px; display: flex; alignItems: center; gap: 12px; font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 0.1em; }
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


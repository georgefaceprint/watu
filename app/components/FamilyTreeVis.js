'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function FamilyTreeVis({ data, onNodeClick }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0) return;

        // Clear previous SVG contents
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 800;
        const height = 500;
        const nodeWidth = 140;
        const nodeHeight = 60;
        const verticalGap = 100;
        const horizontalGap = 40;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", height)
            .style("background", "transparent")
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g");

        // Zoom & Pan
        const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom);

        // ─── HIERARCHY LOGIC ──────────────────────────────────────────
        // 1. Find the "Focus" node (the one we searched for or the first one)
        const focusNode = data.nodes[0]; // The API usually returns the searched person as the first node

        // 2. Assign Generations (Simple relative layering)
        const generations = {};
        const nodeMap = new Map();

        data.nodes.forEach(n => {
            n.gen = 0; // Default
            nodeMap.set(n.id, n);
        });

        // Simple BFS to assign generations based on 'CHILD_OF'
        // PARENT <--- CHILD_OF --- CHILD (Child is gen + 1)
        data.links.forEach(l => {
            if (l.type === 'CHILD_OF') {
                const child = nodeMap.get(l.source);
                const parent = nodeMap.get(l.target);
                if (child && parent) {
                    // This is a naive gen assignment, but sufficient for local subtrees
                    // If source is child, it should be below target (parent)
                }
            }
        });

        // BETTER APPROACH: Layering based on relationships
        // Gen -1: Parents
        // Gen 0: Focus + Spouse + Siblings
        // Gen 1: Children

        const getGen = (nodeId) => {
            const node = nodeMap.get(nodeId);
            const parentLinks = data.links.filter(l => l.source === nodeId && l.type === 'CHILD_OF');
            const childLinks = data.links.filter(l => l.target === nodeId && l.type === 'CHILD_OF');
            const spouseLinks = data.links.filter(l => (l.source === nodeId || l.target === nodeId) && l.type === 'SPOUSE_OF');

            if (parentLinks.length > 0) return 1; // It's a child
            if (childLinks.length > 0) return -1; // It's a parent
            return 0; // Focus/Spouse/Sibling
        };

        data.nodes.forEach(n => {
            n.gen = getGen(n.id);
            if (!generations[n.gen]) generations[n.gen] = [];
            generations[n.gen].push(n);
        });

        // 3. Position Nodes
        Object.keys(generations).forEach(gen => {
            const nodesInGen = generations[gen];
            const totalWidth = nodesInGen.length * (nodeWidth + horizontalGap) - horizontalGap;
            const startX = (width - totalWidth) / 2;

            nodesInGen.forEach((n, i) => {
                n.x = startX + i * (nodeWidth + horizontalGap) + nodeWidth / 2;
                n.y = (parseInt(gen) + 1) * verticalGap + 100; // Offset by +1 to put parents at top
            });
        });

        // 4. Draw Links
        const linkGenerator = d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y);

        const links = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "var(--border)")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 2)
            .selectAll("path")
            .data(data.links)
            .join("path")
            .attr("d", d => {
                const source = nodeMap.get(d.source);
                const target = nodeMap.get(d.target);
                if (!source || !target) return null;

                if (d.type === 'SPOUSE_OF') {
                    // Straight line for spouses
                    return `M${source.x},${source.y} L${target.x},${target.y}`;
                }
                // Curviewer line for generations
                return d3.linkVertical()({
                    source: [source.x, source.y],
                    target: [target.x, target.y]
                });
            })
            .attr("stroke-dasharray", d => d.type === 'SPOUSE_OF' ? '4,4' : 'none');

        // 5. Draw Nodes
        const nodes = g.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => onNodeClick && onNodeClick(d))
            .style("cursor", "pointer");

        // Premium Pedigree Card
        nodes.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 12)
            .attr("fill", "var(--card)")
            .attr("stroke", d => d.isDeceased ? "#f472b6" : "var(--accent)")
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 4px 10px rgba(0,0,0,0.15))");

        // Portrait Placeholder (Left Side)
        nodes.append("circle")
            .attr("cx", -nodeWidth / 2 + 25)
            .attr("cy", 0)
            .attr("r", 18)
            .attr("fill", "var(--border)")
            .attr("opacity", 0.3);

        nodes.append("text")
            .attr("x", -nodeWidth / 2 + 25)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("fill", "var(--text-secondary)")
            .style("font-size", "14px")
            .text(d => d.sex === 'Female' ? '👩' : '👨');

        // Name
        nodes.append("text")
            .attr("x", -nodeWidth / 2 + 50)
            .attr("y", -5)
            .attr("fill", "var(--foreground)")
            .style("font-size", "11px")
            .style("font-weight", "800")
            .text(d => `${d.name} ${d.surname}`.substring(0, 15));

        // Tribe / Life Status
        nodes.append("text")
            .attr("x", -nodeWidth / 2 + 50)
            .attr("y", 12)
            .attr("fill", "var(--text-secondary)")
            .style("font-size", "9px")
            .style("font-weight", "600")
            .text(d => d.isDeceased ? `🕊️ RESTING` : `${d.clan || d.tribe || 'WATU MEMBER'}`);

        // Initial Zoom to fit
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2)
        );

        return () => { };
    }, [data]);

    return (
        <div ref={containerRef} className="tree-container" style={{
            width: '100%',
            height: '500px',
            borderRadius: '24px',
            background: 'var(--card-hover)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Mobile-Friendly Zoom Controls */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 20
            }}>
                <button
                    onClick={() => {
                        const svg = d3.select(svgRef.current);
                        svg.transition().duration(300).call(d3.zoom().scaleBy, 1.3);
                    }}
                    style={zoomBtnStyle}
                >+</button>
                <button
                    onClick={() => {
                        const svg = d3.select(svgRef.current);
                        svg.transition().duration(300).call(d3.zoom().scaleBy, 0.7);
                    }}
                    style={zoomBtnStyle}
                >-</button>
                <button
                    onClick={() => {
                        const svg = d3.select(svgRef.current);
                        const width = 800;
                        const height = 500;
                        svg.transition().duration(750).call(
                            d3.zoom().transform,
                            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2)
                        );
                    }}
                    style={zoomBtnStyle}
                >🎯</button>
            </div>

            <svg ref={svgRef} style={{ touchAction: 'none' }}></svg>

            <style jsx>{`
                @media (max-width: 768px) {
                    .tree-container {
                        height: 400px !important;
                    }
                }
            `}</style>
        </div>
    );
}

const zoomBtnStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s'
};

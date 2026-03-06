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

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", height)
            .style("background", "transparent")
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g");

        // Zoom & Pan
        const zoom = d3.zoom()
            .scaleExtent([0.2, 5])
            .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom);

        // Add a "Reset Zoom" function accessible via double-click on background
        svg.on("dblclick.zoom", () => {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2)
            );
        });

        // Force Simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(60));

        // Links (Connections)
        const link = g.append("g")
            .attr("stroke", "var(--border)")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", d => d.type === 'SPOUSE_OF' ? '5,5' : 'none'); // Dashed for spouse

        // Nodes (People)
        const node = g.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", (event, d) => onNodeClick && onNodeClick(d))
            .style("cursor", "pointer");

        // Premium Node Background
        node.append("rect")
            .attr("width", 100)
            .attr("height", 45)
            .attr("x", -50)
            .attr("y", -22.5)
            .attr("rx", 10)
            .attr("fill", "var(--card)")
            .attr("stroke", d => d.isDeceased ? "#f472b6" : "var(--accent)")
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.1))");

        // Deceased Indicator Glow
        node.filter(d => d.isDeceased)
            .insert("rect", ":first-child")
            .attr("width", 110)
            .attr("height", 55)
            .attr("x", -55)
            .attr("y", -27.5)
            .attr("rx", 12)
            .attr("fill", "#f472b6")
            .attr("opacity", 0.15);

        // Name Text (UPPERCASE)
        node.append("text")
            .attr("dy", "-2")
            .attr("text-anchor", "middle")
            .attr("fill", "var(--foreground)")
            .style("font-size", "10px")
            .style("font-weight", "800")
            .style("text-transform", "uppercase")
            .text(d => `${d.name} ${d.surname}`);

        // Clan/Tribe Sub-text
        node.append("text")
            .attr("dy", "12")
            .attr("text-anchor", "middle")
            .attr("fill", "var(--text-secondary)")
            .style("font-size", "8px")
            .style("font-weight", "600")
            .text(d => d.isDeceased ? `[RESTING] ${d.deathYear || ''}` : `${d.clan || d.tribe || ''}`);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => simulation.stop();
    }, [data]);

    return (
        <div ref={containerRef} className="tree-container" style={{
            width: '100%',
            height: '500px',
            borderRadius: '24px',
            background: 'var(--card-hover)',
            border: '1px solid var(--border)',
            overflow: 'hidden'
        }}>
            <svg ref={svgRef}></svg>
        </div>
    );
}

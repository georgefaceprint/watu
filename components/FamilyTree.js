'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function FamilyTree({ data }) {
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!data || !wrapperRef.current) return;

        const width = wrapperRef.current.clientWidth || 800;
        const height = window.innerWidth < 768 ? 450 : 600;

        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('background', 'transparent')
            .style('border-radius', 'var(--radius-lg)')
            .style('overflow', 'visible');

        svg.selectAll('*').remove();

        const g = svg.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        const nodeW = 180;
        const nodeH = 70;
        const xSpacing = window.innerWidth < 768 ? 180 : 260;
        const ySpacing = 100;

        const tree = d3.tree().nodeSize([ySpacing, xSpacing]);
        const root = d3.hierarchy(data);
        tree(root);

        const xOffset = window.innerWidth < 768 ? width / 3 : width / 4;
        const yOffset = height / 2;

        const initialScale = window.innerWidth < 768 ? 0.5 : 0.75;
        svg.call(zoom.transform, d3.zoomIdentity.translate(xOffset, yOffset).scale(initialScale));

        // Links
        const linkGenerator = d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x);

        g.selectAll('.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', linkGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(99, 102, 241, 0.2)')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', d => d.target.data.name.includes('(Spouse)') ? '8,6' : 'none')
            .style('filter', 'drop-shadow(0px 4px 12px rgba(99, 102, 241, 0.1))');

        // Nodes
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        const cardW = nodeW;
        const cardH = nodeH;

        const fo = nodes.append('foreignObject')
            .attr('x', -cardW / 2)
            .attr('y', -cardH / 2)
            .attr('width', cardW)
            .attr('height', cardH)
            .style('overflow', 'visible');

        fo.append('xhtml:div')
            .style('width', `${cardW}px`)
            .style('height', `${cardH}px`)
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '12px')
            .style('background', d => {
                if (searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return 'var(--accent)';
                }
                return 'rgba(255, 255, 255, 0.05)';
            })
            .style('backdrop-filter', 'blur(10px)')
            .style('border', d => {
                if (searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return '2px solid #fff';
                }
                if (d.depth === 0) return '2px solid var(--accent)';
                return '1px solid rgba(255, 255, 255, 0.1)';
            })
            .style('border-radius', '16px')
            .style('color', '#fff')
            .style('font-family', 'var(--font-sans)')
            .style('box-shadow', d => {
                if (searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return '0 0 30px rgba(99, 102, 241, 0.6)';
                }
                return '0 8px 16px rgba(0,0,0,0.5)';
            })
            .style('padding', '12px')
            .style('box-sizing', 'border-box')
            .style('transition', 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)')
            .html(d => {
                let mainText = d.data.name;
                let subText = d.depth === 0 ? 'Progenitor' : 'Descendant';

                const match = d.data.name.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                    mainText = match[1];
                    subText = match[2];
                }

                const initial = mainText.charAt(0);
                const isHighlight = searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase());

                return `
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: ${isHighlight ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))'}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; border: 1px solid rgba(255,255,255,0.1);">
                        ${initial}
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-weight: 700; font-family: 'Outfit'; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">
                            ${mainText}
                        </div>
                        <div style="font-size: 0.65rem; font-weight: 700; opacity: 0.7; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; color: ${isHighlight ? '#fff' : 'var(--accent)'};">
                            ${subText}
                        </div>
                    </div>
                 `;
            });

    }, [data, searchTerm]);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0 2rem 1.5rem 2rem'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="search"
                            placeholder="Find relatives in lineage..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px 14px 48px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            className="tree-search"
                        />
                        <span style={{ position: 'absolute', left: '20px', top: '16px', opacity: 0.5 }}>🔍</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '999px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></span> Direct
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '999px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px dashed var(--accent)', background: 'transparent' }}></span> Marriage
                    </div>
                </div>
            </div>

            <div ref={wrapperRef} style={{ width: '100%', position: 'relative', minHeight: '500px' }}>
                <svg ref={svgRef} style={{ display: 'block' }}></svg>

                {/* Mobile hint */}
                <div className="mobile-only" style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    color: '#fff',
                    fontWeight: '600',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>🤏</span> Pinch to Zoom & Exploratory Drag
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .tree-search:focus {
                    background: rgba(255,255,255,0.08) !important;
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                @media (max-width: 767px) {
                    .mobile-only { display: flex !important; }
                }
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                }
            `}} />
        </div>
    );
}

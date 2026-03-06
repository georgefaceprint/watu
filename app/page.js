'use client';
import FamilyTreeVis from '../components/FamilyTreeVis';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [treeData, setTreeData] = useState({ nodes: [], links: [] });
    const [searchId, setSearchId] = useState('');
    const [loadingTree, setLoadingTree] = useState(false);

    const fetchTree = async (id) => {
        if (!id) return;
        setLoadingTree(true);
        try {
            const res = await fetch(`/api/tree?personId=${id.toUpperCase()}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTreeData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTree(false);
        }
    };

    useEffect(() => {
        // Fetch a default highlight or use 'USER_123' as demo
        fetchTree('S7A4B1'); // Seeding with a default highlight if one exists
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '100px' }}>
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                animation: 'fadeInUp 1s ease-out'
            }}>
                <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem'
                }}>
                    The Future of Heritage is Here
                </div>
                <h1 style={{
                    fontSize: isMobile ? '2.5rem' : '4rem',
                    lineHeight: '1.1',
                    background: 'linear-gradient(to bottom, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1.5rem'
                }}>
                    Connect with Your <br /> Legacy on Watu.Network
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem auto'
                }}>
                    Trace your ancestry, unite your clan, and protect your digital heritage in a secure, collaborative community built for generations.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/onboard">
                        <button className="btn-primary">Get Started Now</button>
                    </a>
                    <a href="/connect">
                        <button className="btn-secondary">Search Ancestry</button>
                    </a>
                </div>
            </section>

            {/* Tree Section */}
            <section style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
                <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>LINEAGE EXPLORER</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '450px' }}>
                                ENTER A UNIQUE WATU ID TO MAP A CLAN BRANCH AND DISCOVER ANCESTRAL CONNECTIONS IN OUR LIVE CRYPTOCURRENCY-BACKED ARCHIVE.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', minWidth: '320px' }}>
                            <input
                                className="search-input"
                                placeholder="ENTER WATU ID (E.G. S7A4B1)"
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                            <button
                                className="btn-primary"
                                style={{ padding: '0 1.5rem' }}
                                onClick={() => fetchTree(searchId)}
                                disabled={loadingTree}
                            >
                                {loadingTree ? '...' : 'FIND'}
                            </button>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        {loadingTree && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 'bold' }}>
                                RELAYING ANCESTRAL DATA...
                            </div>
                        )}
                        <FamilyTreeVis data={treeData} onNodeClick={(d) => {
                            setSearchId(d.id);
                            fetchTree(d.id);
                        }} />
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section style={{
                width: '100%',
                maxWidth: '800px',
                margin: '2rem auto',
                padding: '0 1.5rem'
            }}>
                <div style={{
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #0c0a09 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
                    <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>Protect Your Heritage</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                        Join over 10,000 clans worldwide. Ensure your family's future legacy is as secure as their history.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="https://myhazina.org" target="_blank" style={{ color: '#818cf8', fontWeight: '600' }}>
                            Visit MyHazina.org &rarr;
                        </a>
                        <a href="/events" style={{ color: '#818cf8', fontWeight: '600' }}>
                            Join Community Events &rarr;
                        </a>
                    </div>
                </div>
            </section>

            {/* Mobile Bottom Nav Spacer */}
            <div style={{ height: '20px' }} />
        </div>
    );
}

const styles = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.search-input {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--foreground);
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;
}
.search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
`;

'use client';
import FamilyTreeVis from './components/FamilyTreeVis';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function HomePage() {
    const { data: session } = useSession();
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
        let socket;
        const initSocket = async () => {
            await fetch('/api/socket');
            const { io } = await import('socket.io-client');
            socket = io({ path: '/api/socket' });

            socket.on('heritage-update', (data) => {
                // If the update involves the person we are looking at, or one of their relatives
                // For simplicity, we refresh if any update happens while on this screen
                console.log("⚡ Real-time Heritage Update Received", data);
                if (searchId) fetchTree(searchId);
            });
        };
        initSocket();
        return () => { if (socket) socket.disconnect(); };
    }, [searchId]);

    useEffect(() => {
        if (session?.user?.watuId) {
            console.log("🌳 Tree Session Active ID:", session.user.watuId);
            setSearchId(session.user.watuId);
            fetchTree(session.user.watuId);
        } else {
            const fallbackId = 'XT4NAS';
            console.log("🌳 Tree Fallback ID:", fallbackId);
            setSearchId(fallbackId);
            fetchTree(fallbackId);
        }
    }, [session]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
            {/* Tree Section - FULL CINEMATIC LAYOUT */}
            <section style={{ width: '100%', padding: '0', position: 'relative', flex: 1 }}>
                <div style={{ position: 'relative', height: '100%' }}>
                    {/* Floating Info Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: isMobile ? '1rem' : '3rem',
                        left: isMobile ? '1rem' : '3rem',
                        zIndex: 20,
                        pointerEvents: 'none',
                        maxWidth: isMobile ? '200px' : '400px'
                    }}>
                        <h2 style={{
                            fontSize: isMobile ? '1.5rem' : '2.5rem',
                            color: 'var(--foreground)',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 10px var(--background)'
                        }}>LINEAGE EXPLORER</h2>
                        {!isMobile && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                MAPPING THE WATU.NETWORK CLAN BRANCHES. <br />
                                DISCOVER CONNECTIONS SECURED IN THE GLOBAL HERITAGE ARCHIVE.
                            </p>
                        )}
                    </div>

                    {/* Search Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: isMobile ? 'auto' : '3rem',
                        bottom: isMobile ? '85px' : 'auto',
                        right: isMobile ? '1rem' : '3rem',
                        left: isMobile ? '1rem' : 'auto',
                        zIndex: 20,
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            className="search-input"
                            placeholder="FIND WATU ID..."
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                            style={{
                                background: 'var(--card)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)',
                                flex: isMobile ? 1 : 'none',
                                width: isMobile ? 'auto' : '250px',
                                boxShadow: 'var(--shadow-glow)'
                            }}
                        />
                        <button
                            className="btn-primary"
                            onClick={() => fetchTree(searchId)}
                            style={{ padding: isMobile ? '0.75rem 1.25rem' : '0.85rem 1.5rem' }}
                            disabled={loadingTree}
                        >
                            {loadingTree ? '...' : 'SCAN'}
                        </button>
                    </div>

                    <FamilyTreeVis
                        data={treeData}
                        focusId={searchId}
                        onNodeClick={(d) => {
                            setSearchId(d.id);
                            fetchTree(d.id);
                        }}
                    />
                </div>
            </section>

            {/* Premium CTA Section */}
            <section style={{
                width: '100%',
                maxWidth: '900px',
                margin: '4rem auto',
                padding: '0 1.5rem',
                paddingBottom: '100px'
            }}>
                <div style={{
                    padding: '3rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))'
                    }} />
                    <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🛡️</div>
                    <h2 style={{ fontSize: '1.75rem', color: 'var(--foreground)', marginBottom: '1rem' }}>Secure Your Heritage</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                        Join a global network of clans protecting their lineage and legacy through secure connection and verification.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/onboard" className="btn-primary" style={{ textDecoration: 'none' }}>
                            Join Watu Network
                        </a>
                        <a href="/events" className="btn-secondary" style={{ textDecoration: 'none' }}>
                            Explore Events
                        </a>
                    </div>
                </div>
            </section>

            {/* Mobile Bottom Nav Spacer */}
            <div style={{ height: '20px' }} />

            <style jsx>{`
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
            `}</style>
        </div>
    );
}


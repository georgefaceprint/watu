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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '100px' }}>
            {/* Tree Section - FULL CINEMATIC LAYOUT */}
            <section style={{ width: '100%', padding: '0', marginTop: '0' }}>
                <div style={{ position: 'relative', minHeight: '800px' }}>
                    <div style={{
                        position: 'absolute',
                        top: '4rem',
                        left: '4rem',
                        zIndex: 20,
                        pointerEvents: 'none',
                        maxWidth: '400px'
                    }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>LINEAGE EXPLORER</h2>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                            MAPPING THE WATU.NETWORK CLAN BRANCHES. <br />
                            DISCOVER CONNECTIONS SECURED IN THE GLOBAL HERITAGE ARCHIVE.
                        </p>
                    </div>

                    <div style={{
                        position: 'absolute',
                        top: '4rem',
                        right: '4rem',
                        zIndex: 20,
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <input
                            className="search-input"
                            placeholder="SEARCH WATU ID..."
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                            style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                width: '250px'
                            }}
                        />
                        <button
                            className="btn-primary"
                            onClick={() => fetchTree(searchId)}
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
                        <a href="/onboard" style={{ color: '#818cf8', fontWeight: '600' }}>
                            Join Familia Network &rarr;
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

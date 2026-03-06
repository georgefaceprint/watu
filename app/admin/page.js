'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [stats, setStats] = useState({ users: 0, connections: 0, tribes: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (data.stats) {
                    setStats(data.stats);
                    setRecentUsers(data.recentUsers);
                }
            } catch (err) {
                console.error("Failed to load admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const userGoal = 10000;
    const progress = (stats.users / userGoal) * 100;

    return (
        <div className="container">
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Network Operations</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Strategic overview of the Watu ecosystem and heritage growth.</p>
            </div>

            {/* Growth Progress Bar */}
            <div className="glass" style={{ marginBottom: '3rem', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Progress to App Store Launch</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold' }}>{stats.users.toLocaleString()} / {userGoal.toLocaleString()} Users</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))',
                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Current trajectory: <strong>{(progress).toFixed(1)}%</strong>. Platform will be submitted to Play & App Stores once target is reached.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass animate-fade-in" style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Verified Members</h4>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff' }}>{stats.users.toLocaleString()}</h2>
                </div>
                <div className="glass animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.1s' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Genetic Connections</h4>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff' }}>{stats.connections.toLocaleString()}</h2>
                </div>
                <div className="glass animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.2s' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Tribal Diversity</h4>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff' }}>{stats.tribes}</h2>
                </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Real-time Onboarding Feed</h3>
            <div className="glass animate-fade-in" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr>
                            <th style={thStyle}>ID Reference</th>
                            <th style={thStyle}>Full Name</th>
                            <th style={thStyle}>Ancestry</th>
                            <th style={thStyle}>Verification</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((user, idx) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                <td style={tdStyle}><code style={{ color: '#818cf8', fontWeight: 'bold' }}>{user.id}</code></td>
                                <td style={{ ...tdStyle, color: '#fff', fontWeight: '500' }}>{user.name} {user.surname}</td>
                                <td style={tdStyle}>{user.tribe}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        background: user.status === 'VERIFIED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: user.status === 'VERIFIED' ? '#22c55e' : '#eab308',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.65rem',
                                        fontWeight: '700',
                                        border: user.status === 'VERIFIED' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)'
                                    }}>{user.status}</span>
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>{user.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>System Health Report</button>
                <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Metadata Management</button>
                <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Flagged Content</button>
            </div>
        </div>
    );
}

const thStyle = {
    padding: '1.25rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    fontWeight: '700'
};

const tdStyle = {
    padding: '1.25rem 1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
};

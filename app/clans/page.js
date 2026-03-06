'use client';
import { useState } from 'react';

export default function ClansPage() {
    const [clans, setClans] = useState([
        { id: 1, name: 'Sifuna Clan Network', members: 45, type: 'VERIFIED', growth: '+12%', protected: false },
        { id: 2, name: 'Hazina Ancestry Circle', members: 120, type: 'HERITAGE', growth: '+5%', protected: true },
        { id: 3, name: 'Ndlela Heritage Group', members: 89, type: 'CLAN', growth: '+25%', protected: true },
    ]);

    return (
        <div className="container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Explore Clans</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>Join your ancestral clan to connect with distant relatives, share history, and protect your collective legacy.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {clans.map((clan, idx) => (
                    <div key={clan.id} className="glass animate-fade-in" style={{
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        animationDelay: `${idx * 0.1}s`,
                        position: 'relative',
                        boxShadow: clan.protected ? '0 8px 32px rgba(99, 102, 241, 0.15)' : 'none',
                    }}>
                        {clan.protected && (
                            <div style={{
                                position: 'absolute',
                                top: '1.25rem',
                                right: '1.25rem',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                color: '#22c55e',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                letterSpacing: '0.05em'
                            }}>PROTECTED</div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: clan.protected ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>
                                {clan.protected ? '🛡️' : '👪'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>{clan.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{clan.type} / Ancestral Hub</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={statBox}>
                                <p style={statLabel}>Members</p>
                                <p style={statValue}>{clan.members.toLocaleString()}</p>
                            </div>
                            <div style={statBox}>
                                <p style={statLabel}>Monthly Growth</p>
                                <p style={{ ...statValue, color: '#22c55e' }}>{clan.growth}</p>
                            </div>
                        </div>

                        {!clan.protected && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0, fontWeight: '700' }}>⚠️ Legacy At Risk</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>No active MyHazina Funeral Plan linked to this clan.</p>
                                <a href="https://myhazina.org" target="_blank" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700', textDecoration: 'underline' }}>Activate Protection →</a>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button className="btn-secondary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}>Read Stories</button>
                            <button className="btn-primary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}>Join Chat</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Can't find your clan in the network?</p>
                <button className="btn-secondary" style={{ padding: '1rem 3rem' }}>Register New Ancestral Clan</button>
            </div>
        </div>
    );
}

const statBox = {
    background: 'rgba(255,255,255,0.03)',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid var(--border)'
};

const statLabel = {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    margin: '0 0 4px 0',
    letterSpacing: '0.05em'
};

const statValue = {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: '700',
    margin: 0
};

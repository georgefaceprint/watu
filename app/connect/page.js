'use client';
import { useState } from 'react';

export default function ConnectPage() {
    const [search, setSearch] = useState({ name: '', surname: '', tribe: '', uniqueId: '', clan: '' });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [myId, setMyId] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        const params = new URLSearchParams(search).toString();
        try {
            const res = await fetch(`/api/connect?${params}`);
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (relativeId, relationship) => {
        if (!myId) {
            alert("Please enter your Watu.Network ID first (top right)");
            return;
        }
        try {
            const res = await fetch('/api/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: myId, relativeId, relationship })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Connected! Trees are automatically updated.`);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Connection failed");
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Find Relatives</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Search the Watu network to connect with your kin.</p>
                </div>
                <div className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>Acting As:</span>
                    <input
                        placeholder="Your ID Key"
                        value={myId}
                        onChange={e => setMyId(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '120px', fontSize: '0.9rem', outline: 'none', fontWeight: 'bold' }}
                    />
                </div>
            </div>

            <form onSubmit={handleSearch} className="glass" style={{
                marginBottom: '3rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1.25rem',
                alignItems: 'end'
            }}>
                <div style={inputGroup}>
                    <label style={labelStyle}>First Name</label>
                    <input className="search-input" placeholder="e.g. John" value={search.name} onChange={e => setSearch({ ...search, name: e.target.value })} />
                </div>
                <div style={inputGroup}>
                    <label style={labelStyle}>Surname</label>
                    <input className="search-input" placeholder="e.g. Doe" value={search.surname} onChange={e => setSearch({ ...search, surname: e.target.value })} />
                </div>
                <div style={inputGroup}>
                    <label style={labelStyle}>Tribe</label>
                    <input className="search-input" placeholder="e.g. Luo" value={search.tribe} onChange={e => setSearch({ ...search, tribe: e.target.value })} />
                </div>
                <div style={inputGroup}>
                    <label style={labelStyle}>Clan</label>
                    <input className="search-input" placeholder="e.g. Kaplelach" value={search.clan} onChange={e => setSearch({ ...search, clan: e.target.value })} />
                </div>
                <div style={inputGroup}>
                    <label style={labelStyle}>Unique ID</label>
                    <input className="search-input" placeholder="W-XXXX" value={search.uniqueId} onChange={e => setSearch({ ...search, uniqueId: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.85rem' }} disabled={loading}>
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
                    {results.length > 0 ? `Found ${results.length} Potential Relatives` : 'Search Results'}
                </h3>

                {results.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {results.map(person => (
                            <div key={person.id} className="glass animate-fade-in" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {person.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{person.name} {person.surname}</h3>
                                        <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {person.tribe} • {person.clan || 'No Clan'} • {person.birthPlace}
                                        </p>
                                        <code style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '600' }}>#{person.id}</code>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select
                                        className="rel-select"
                                        id={`rel-${person.id}`}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border)',
                                            color: '#fff',
                                            padding: '0.65rem 1rem',
                                            borderRadius: '10px',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="PARENT_OF">is my Child</option>
                                        <option value="CHILD_OF">is my Parent</option>
                                        <option value="SIBLING_OF">is my Sibling</option>
                                        <option value="SPOUSE_OF">is my Spouse</option>
                                    </select>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                                        onClick={() => {
                                            const rel = document.getElementById(`rel-${person.id}`).value;
                                            handleConnect(person.id, rel);
                                        }}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px dashed var(--border)',
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔎</div>
                        <p>No family members found yet. Try search by surname or tribe to find your roots.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .search-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .search-input:focus {
                    border-color: var(--accent);
                    background: rgba(255,255,255,0.08);
                }
            `}</style>
        </div>
    );
}

const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginLeft: '4px'
};

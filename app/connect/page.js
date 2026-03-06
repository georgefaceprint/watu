'use client';
import { useState, useEffect } from 'react';

export default function ConnectPage() {
    const [search, setSearch] = useState({ name: '', surname: '', tribe: '', uniqueId: '', clan: '' });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [myId, setMyId] = useState('');
    const [manualForm, setManualForm] = useState({
        name: '',
        surname: '',
        thirdName: '',
        fourthName: '',
        sex: '',
        maidenName: '',
        relationship: 'CHILD_OF',
        isDeceased: false,
        deathYear: '',
        deathMonth: ''
    });

    const handleManualChange = (e) => {
        const { name, value, type, checked } = e.target;
        setManualForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!myId) {
            alert("Please enter your Watu.Network ID first (top right)");
            return;
        }
        if (!manualForm.name || !manualForm.surname || !manualForm.sex) {
            alert("Please fill in the required fields (Sex, Given Name, Surname)");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personId: myId,
                    action: 'MANUAL_ADD',
                    relationship: manualForm.relationship,
                    details: manualForm
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`SUCCESS! ${manualForm.name} ADDED TO YOUR TREE (#${data.id})`);
                setManualForm({
                    name: '', surname: '', thirdName: '', fourthName: '',
                    sex: '', maidenName: '', relationship: 'CHILD_OF',
                    isDeceased: false, deathYear: '', deathMonth: ''
                });
            } else {
                alert(data.error || "Failed to add relative");
            }
        } catch (err) {
            alert("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedId = localStorage.getItem('watu_id');
        if (storedId) setMyId(storedId);
    }, []);

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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--foreground)' }}>{person.name} {person.surname}</h3>
                                            {person.isDeceased && (
                                                <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontWeight: 'bold' }}>RESTING</span>
                                            )}
                                        </div>
                                        <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {person.tribe} • {person.subTribe || 'No Clan'} • {person.birthPlace}
                                        </p>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>#{person.id}</code>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select
                                        className="rel-select"
                                        id={`rel-${person.id}`}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--foreground)',
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
                    <div className="glass" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px dashed var(--border)',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🌳</div>
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Map Your Ancestry</h3>
                        <p style={{ marginBottom: '2rem' }}>Can't find your relative in the network? Add them manually to your lineage to preserve their legacy.</p>

                        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* SEX SELECTION */}
                            <div style={inputGroup}>
                                <label style={labelStyle}>SEX</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.75rem', border: manualForm.sex === 'male' ? '2px solid var(--accent)' : '1px solid var(--border)', background: manualForm.sex === 'male' ? 'var(--accent-muted)' : 'transparent' }}>
                                        <input type="radio" name="manual_sex" value="male" checked={manualForm.sex === 'male'} onChange={() => setManualForm({ ...manualForm, sex: 'male' })} style={{ width: '16px', height: '16px' }} />
                                        <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--foreground)' }}>MALE</span>
                                    </label>
                                    <label className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.75rem', border: manualForm.sex === 'female' ? '2px solid var(--accent)' : '1px solid var(--border)', background: manualForm.sex === 'female' ? 'var(--accent-muted)' : 'transparent' }}>
                                        <input type="radio" name="manual_sex" value="female" checked={manualForm.sex === 'female'} onChange={() => setManualForm({ ...manualForm, sex: 'female' })} style={{ width: '16px', height: '16px' }} />
                                        <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--foreground)' }}>FEMALE</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>GIVEN NAME</label>
                                    <input className="search-input" name="name" placeholder="FIRST NAME" value={manualForm.name} onChange={handleManualChange} />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>SURNAME (FAMILY NAME)</label>
                                    <input className="search-input" name="surname" placeholder="FAMILY NAME" value={manualForm.surname} onChange={handleManualChange} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>3RD NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL)</span></label>
                                    <input className="search-input" name="thirdName" placeholder="MIDDLE NAME" value={manualForm.thirdName} onChange={handleManualChange} />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>4TH NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL)</span></label>
                                    <input className="search-input" name="fourthName" placeholder="OTHER NAME" value={manualForm.fourthName} onChange={handleManualChange} />
                                </div>
                            </div>

                            {manualForm.sex === 'female' && (
                                <div style={inputGroup} className="animate-fade-in">
                                    <label style={labelStyle}>MAIDEN NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(FAMILY OF BIRTH)</span></label>
                                    <input className="search-input" name="maidenName" placeholder="MAIDEN FAMILY NAME" value={manualForm.maidenName} onChange={handleManualChange} />
                                </div>
                            )}

                            {/* RELATIONSHIP SELECTION */}
                            <div style={inputGroup}>
                                <label style={labelStyle}>RELATIONSHIP TO YOU</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[
                                        { label: 'FATHER / MOTHER', val: 'CHILD_OF' },
                                        { label: 'SON / DAUGHTER', val: 'PARENT_OF' },
                                        { label: 'BROTHER / SISTER', val: 'SIBLING_OF' },
                                        { label: 'HUSBAND / WIFE', val: 'SPOUSE_OF' }
                                    ].map(rel => (
                                        <button
                                            key={rel.val}
                                            type="button"
                                            onClick={() => setManualForm({ ...manualForm, relationship: rel.val })}
                                            className="glass"
                                            style={{
                                                padding: '0.8rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                border: manualForm.relationship === rel.val ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                background: manualForm.relationship === rel.val ? 'var(--accent-muted)' : 'transparent',
                                                color: manualForm.relationship === rel.val ? 'var(--accent)' : 'var(--foreground)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {rel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" id="addIsDeceased" name="isDeceased" checked={manualForm.isDeceased} onChange={handleManualChange} style={{ width: '16px', height: '16px' }} />
                                    <label htmlFor="addIsDeceased" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', textTransform: 'uppercase' }}>This family member is deceased</label>
                                </div>
                                {manualForm.isDeceased && (
                                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="animate-fade-in">
                                        <div style={inputGroup}>
                                            <label style={labelStyle}>Year of Death</label>
                                            <input name="deathYear" className="search-input" placeholder="YEAR" type="number" value={manualForm.deathYear} onChange={handleManualChange} />
                                        </div>
                                        <div style={inputGroup}>
                                            <label style={labelStyle}>Month</label>
                                            <input name="deathMonth" className="search-input" placeholder="MONTH" value={manualForm.deathMonth} onChange={handleManualChange} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleManualSubmit}
                                className="btn-primary"
                                style={{ padding: '1rem', width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? 'ADDING...' : 'ADD TO MY FULL TREE'}
                            </button>
                        </div>
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

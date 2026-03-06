'use client';
import { useState, useEffect } from 'react';

export default function LegacyVault() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newStory, setNewStory] = useState({ title: '', content: '' });

    useEffect(() => {
        // Mocking fetching stories for a default clan for demonstration
        fetch('/api/clans/stories?clanId=SIFUNA_CLAN')
            .then(res => res.json())
            .then(data => {
                setStories(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        // API call to save new story
        const res = await fetch('/api/clans/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clanId: 'SIFUNA_CLAN',
                personId: 'USER_123', // Demo person
                title: newStory.title.toUpperCase(),
                content: newStory.content
            })
        });
        if (res.ok) {
            setStories([{ title: newStory.title.toUpperCase(), content: newStory.content, author: 'YOU', createdAt: 'RECENTLY' }, ...stories]);
            setNewStory({ title: '', content: '' });
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* HERITAGE HERO */}
            <section style={{
                textAlign: 'center',
                padding: '5rem 1.5rem',
                marginBottom: '3rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(244, 114, 182, 0.05) 0%, transparent 60%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📖</div>
                    <h1 style={{ fontSize: '3rem', color: 'var(--foreground)', marginBottom: '1rem' }}>LEGACY VAULT</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }} className="description">
                        PRESERVING THE COLLECTIVE MEMORY, ORAL TRADITIONS, AND LEGENDARY MIGRATIONS OF OUR CLAN.
                        THESE STORIES ARE THE THREADS THAT WEAVE OUR HERITAGE ACROSS GENERATIONS.
                    </p>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
                <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '3rem' }}>OUTFITTING THE VAULT...</p>
                    ) : (
                        stories.map((story, i) => (
                            <article key={i} className="glass animate-fade-in" style={{
                                padding: '2.5rem',
                                borderLeft: '4px solid var(--accent)',
                                transition: 'transform 0.3s ease',
                                animationDelay: `${i * 0.1}s`
                            }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '0.1em' }} className="identity-text">
                                    {story.createdAt} • BY {story.author.toUpperCase()}
                                </span>
                                <h2 style={{ fontSize: '1.75rem', margin: '1rem 0', color: 'var(--foreground)' }}>{story.title}</h2>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--foreground)', opacity: 0.9 }} className="description">
                                    {story.content}
                                </p>
                            </article>
                        ))
                    )}
                </main>

                <aside style={{ position: 'sticky', top: '2rem' }}>
                    <div className="glass" style={{ padding: '2rem', border: '1px solid var(--accent-muted)', background: 'rgba(99, 102, 241, 0.02)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ✒️ PRESERVE A MEMORY
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>STORY TITLE</label>
                                <input
                                    placeholder="E.G. THE FOUNDING OF SIFUNA"
                                    className="input-field"
                                    style={{ background: 'var(--background)' }}
                                    value={newStory.title}
                                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>THE NARRATIVE</label>
                                <textarea
                                    placeholder="Write the family story as passed down..."
                                    rows="6"
                                    className="input-field"
                                    style={{
                                        background: 'var(--background)',
                                        resize: 'none',
                                        textTransform: 'none',
                                        letterSpacing: 'normal',
                                        paddingTop: '1rem'
                                    }}
                                    value={newStory.content}
                                    onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                SEAL IN VAULT
                            </button>
                        </form>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(34, 197, 94, 0.7)', fontWeight: '700' }}>🛡️ ENCRYPTED & PROTECTED</p>
                    </div>
                </aside>
            </div>

            <style jsx>{`
                .container { max-width: 1200px !important; }
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    font-size: 0.9rem;
                    outline: none;
                }
                @media (max-width: 900px) {
                    div { grid-template-columns: 1fr !important; }
                    aside { position: static !important; }
                }
            `}</style>
        </div>
    );
}

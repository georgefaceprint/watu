'use client';
import { useState } from 'react';

export default function EventsPage() {
    const [events, setEvents] = useState([
        { id: 1, title: 'Watu Heritage Gathering', date: '2026-12-15', location: 'Nairobi Heritage Center', attendees: 842, type: 'GRAND', image: '🏙️' },
        { id: 2, title: 'Oral History Mapping', date: '2026-06-10', location: 'Virtual (Zoom)', attendees: 120, type: 'CLAN', image: '🎙️' },
        { id: 3, title: 'Ndlela Family Reunion', date: '2026-08-22', location: 'Nakuru, Kenya', attendees: 56, type: 'PRIVATE', image: '🌳' },
    ]);

    const [loadingId, setLoadingId] = useState(null);
    const [joinedEvents, setJoinedEvents] = useState(new Set());

    const handleRSVP = async (eventId) => {
        setLoadingId(eventId);
        try {
            const res = await fetch('/api/events/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            });
            const data = await res.json();

            if (res.status === 401) {
                alert("Please log in with your Watu ID to join events.");
                return;
            }

            if (data.success) {
                setJoinedEvents(prev => new Set([...prev, eventId]));
                // Synchronize attendee count locally for instant feedback
                setEvents(prev => prev.map(e =>
                    e.id === eventId ? { ...e, attendees: data.attendeeCount } : e
                ));
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>Community Events</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>Join physical and virtual gatherings to preserve and celebrate our collective ancestry.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {events.map((event, idx) => (
                    <div key={event.id} className="glass animate-fade-in" style={{
                        padding: 0,
                        overflow: 'hidden',
                        animationDelay: `${idx * 0.1}s`,
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--card)'
                    }}>
                        <div style={{
                            height: '160px',
                            background: 'linear-gradient(45deg, var(--accent) 0%, var(--accent-secondary) 100%)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            opacity: 0.9
                        }}>
                            {event.image}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>{event.type} GATHERING</div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--foreground)', marginBottom: '0.75rem' }}>{event.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={itemDetail}>
                                    <span style={{ fontSize: '1rem' }}>📅</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '600' }}>{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Event Date</p>
                                    </div>
                                </div>
                                <div style={itemDetail}>
                                    <span style={{ fontSize: '1rem' }}>📍</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '600' }}>{event.location}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Venue / Link</p>
                                    </div>
                                </div>
                                <div style={itemDetail}>
                                    <span style={{ fontSize: '1rem' }}>👥</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '600' }}>{event.attendees.toLocaleString()} RSVPs</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confirmed Attendees</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRSVP(event.id)}
                                className={joinedEvents.has(event.id) ? "btn-secondary" : "btn-primary"}
                                style={{ width: '100%', padding: '0.85rem' }}
                                disabled={loadingId === event.id}
                            >
                                {loadingId === event.id ? 'Joining Clan...' : joinedEvents.has(event.id) ? 'Joined ✓' : 'Reserve Your Spot'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Host Section */}
            <div className="glass animate-fade-in" style={{
                marginTop: '4rem',
                padding: '2.5rem',
                background: 'var(--accent-muted)',
                textAlign: 'center',
                border: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--foreground)', marginBottom: '1rem' }}>Host Your Own Family Event?</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
                    Clan administrators can organize gatherings, fundraisers, and workshops. Premium event management is included with <strong>Familia Heritage Subscriptions</strong>.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>Learn More</button>
                    <a href="/onboard" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Upgrade Plan</button>
                    </a>
                </div>
            </div>
        </div>
    );
}

const itemDetail = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
};

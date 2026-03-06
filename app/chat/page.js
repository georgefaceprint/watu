'use client';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
    const [selectedId, setSelectedId] = useState(null);
    const scrollRef = useRef(null);

    const [groups, setGroups] = useState([
        { id: 1, name: 'Sifuna Clan Global', type: 'CLAN', members: 45, lastMessage: 'Nelson: We need to update the heritage records for March.', time: '10:24 AM', unread: 3 },
        { id: 2, name: 'Nairobi Branch Cousins', type: 'PRIVATE', members: 12, lastMessage: 'Sarah: Who is bringing the photos?', time: 'Yesterday', unread: 0 },
        { id: 3, name: 'Moyo Family Legacy', type: 'CLAN', members: 89, lastMessage: 'Bheki: The funeral plan is now active.', time: '2 days ago', unread: 0 },
    ]);

    const [messages, setMessages] = useState([
        { id: 1, sender: 'Nelson Ndlela', text: 'Peace be upon you all. I have updated our patriarch lineage.', time: '10:00 AM', isMe: false },
        { id: 2, sender: 'Me', text: 'Thank you Nelson. I can see the new connections on the tree.', time: '10:15 AM', isMe: true },
        { id: 3, sender: 'Thabo', text: 'This system is much faster than the old manual records.', time: '10:20 AM', isMe: false },
        { id: 4, sender: 'Nelson', text: 'We need to update the heritage records for March.', time: '10:24 AM', isMe: false },
    ]);

    const [input, setInput] = useState('');

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedId]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            sender: 'Me',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>Communications</h1>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>+ New Group</button>
            </div>

            <div className="glass" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
                {/* Sidebar */}
                <div style={{
                    width: selectedId ? '0' : '100%',
                    maxWidth: selectedId ? '0' : 'none',
                    display: selectedId ? 'none' : 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid var(--border)',
                    transition: 'all 0.3s ease',
                    flex: '1 1 auto',
                    overflow: 'hidden'
                } as any}>
                    {/* Desktop Sidebar always shows */}
                    <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setActiveTab('chats')}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'chats' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    color: activeTab === 'chats' ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >Messages</button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'groups' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    color: activeTab === 'groups' ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >Family Groups</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {groups.map(group => (
                                <div
                                    key={group.id}
                                    onClick={() => setSelectedId(group.id)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: selectedId === group.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'center',
                                        transition: 'background 0.2s',
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: group.type === 'CLAN' ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        {group.type === 'CLAN' ? '🛡️' : '👥'}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</h4>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{group.time}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {group.lastMessage}
                                        </p>
                                    </div>
                                    {group.unread > 0 && (
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {group.unread}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div style={{
                    flex: 1,
                    display: selectedId ? 'flex' : 'none',
                    flexDirection: 'column',
                    background: 'rgba(0,0,0,0.2)'
                } as any}>
                    {selectedId ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setSelectedId(null)}
                                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
                                >←</button>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{groups.find(g => g.id === selectedId)?.name}</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{groups.find(g => g.id === selectedId)?.members} family members online</span>
                                </div>
                                <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>⋮</button>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{
                                        alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.isMe ? 'flex-end' : 'flex-start'
                                    }}>
                                        {!msg.isMe && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>{msg.sender}</span>}
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: msg.isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                            background: msg.isMe ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            boxShadow: msg.isMe ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', marginRight: '4px' }}>{msg.time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                                <input
                                    className="chat-input"
                                    placeholder="Share with the clan..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                                <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem' }}>Send</button>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Select a conversation</h3>
                            <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Join a family group or clan chat to share heritage stories and stay connected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive tweaks */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (min-width: 768px) {
                    .sidebar-content {
                        width: 320px !important;
                        display: flex !important;
                    }
                    .glass > div:first-child {
                        width: 320px !important;
                        max-width: 320px !important;
                        display: flex !important;
                    }
                    .glass > div:last-child {
                        display: flex !important;
                    }
                    .glass > div:last-child button[style*="back"] {
                        display: none !important;
                    }
                }
                .chat-input:focus {
                    border-color: var(--accent) !important;
                    background: rgba(255,255,255,0.08) !important;
                }
            `}} />
        </div>
    );
}

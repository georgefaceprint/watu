'use client';
import { useState, useRef } from 'react';

export default function ProfilePage() {
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(null);
    const [profile, setProfile] = useState({
        name: 'James Sifuna',
        birthPlace: 'Nairobi, Kenya',
        birthYear: '1992',
        residency: 'Mombasa Road, Nairobi',
        profession: 'Software Engineer',
        clan: 'Kaplelach'
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Personal Heritage</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>Complete your profile to build your digital legacy and help relatives find their connection to you.</p>
            </div>

            <div className="glass animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                {/* Photo & Identity Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                width: '160px',
                                height: '160px',
                                borderRadius: '40px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '2px dashed rgba(99, 102, 241, 0.4)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            className="profile-photo-container"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📸</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Upload Portrait</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                position: 'absolute',
                                bottom: '-10px',
                                right: '-10px',
                                width: '40px',
                                height: '40px',
                                border: 'none',
                                background: 'var(--accent)',
                                color: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem'
                            }}>
                            +
                        </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.25rem' }}>{profile.name}</h2>
                        <code style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>W-XJ92-K5P1</code>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(34, 197, 94, 0.2)', fontWeight: 'bold' }}>VERIFIED</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', marginTop: 'auto' }}>
                        <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '1rem' }}>Heritage Connectivity</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clan Status</span>
                                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>Active Member</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Family Branch</span>
                                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>Central Branch</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Full Legal Name</label>
                        <input name="name" value={profile.name} onChange={handleChange} className="profile-input" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Place of Birth</label>
                            <input name="birthPlace" value={profile.birthPlace} onChange={handleChange} className="profile-input" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Year of Birth</label>
                            <input type="number" name="birthYear" value={profile.birthYear} onChange={handleChange} className="profile-input" />
                        </div>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Current Residence</label>
                        <input name="residency" value={profile.residency} onChange={handleChange} className="profile-input" />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Ancestral Clan</label>
                        <input name="clan" value={profile.clan} onChange={handleChange} className="profile-input" />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Profession</label>
                        <input name="profession" value={profile.profession} onChange={handleChange} className="profile-input" />
                    </div>

                    <button className="btn-primary" style={{ padding: '1rem', marginTop: '1rem', width: '100%' }}>Update Heritage Records</button>

                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
                </div>
            </div>

            {/* Heritage Protection Section */}
            <div className="glass animate-fade-in" style={{
                maxWidth: '700px',
                margin: '3rem auto',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                }}>🛡️</div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>Heritage Protection Scheme</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Protect your family branch in the event of an emergency. Link this profile to a <strong>MyHazina Funeral Plan</strong> to ensure your legacy continues.</p>
                </div>
                <a href="https://myhazina.org" target="_blank">
                    <button className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>Link MyHazina</button>
                </a>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-input {
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03);
                    color: white;
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .profile-input:focus {
                    background: rgba(255,255,255,0.08);
                    border-color: var(--accent);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .profile-photo-container:hover {
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    transform: translateY(-5px);
                    border-color: var(--accent);
                }
            `}} />
        </div>
    );
}

const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginLeft: '2px'
};

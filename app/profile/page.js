'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(null);
    // ... (rest of state stays same)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.id) {
            fetchProfile(session.user.id);
        }
    }, [session, status]);

    const fetchProfile = async (id) => {
        try {
            const res = await fetch(`/api/tree?personId=${id}`);
            const data = await res.json();
            if (data.nodes && data.nodes.length > 0) {
                const user = data.nodes.find(n => n.id === id);
                if (user) setProfile({ ...profile, ...user });
            }
        } catch (err) {
            console.error("Failed to load cloud profile:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile({ ...profile, [name]: type === 'checkbox' ? checked : value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
                // Update profile state to include the base64 for submission
                setProfile(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            alert('✅ HERITAGE RECORDS UPDATED IN VAULT');
        } catch (err) {
            alert('❌ UPDATE FAILED: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>PERSONAL HERITAGE</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>BUILD YOUR DIGITAL LEGACY AND ENSURE YOUR PLACE IN THE ANCESTRAL VAULT.</p>
            </div>

            {/* DIGITAL WATU ID CARD - THE WOW COMPONENT */}
            <div className="animate-fade-in" style={{ marginBottom: '4rem' }}>
                <WatuIDCard person={profile} />
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '-1rem', opacity: 0.7 }}>
                    TIP: CLICK CARD TO FLIP FOR QR VAULT
                </p>
            </div>

            <div className="glass animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', background: 'var(--card)' }}>
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
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>{profile.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <code style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{profile.id || 'W-XJ92-K5P1'}</code>
                            <button
                                onClick={() => {
                                    const text = `Connect with my Ancestral Identity on Watu.Network! My ID: *${profile.id}*. Join path: https://watu.network/connect?id=${profile.id}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                style={{ background: '#25D366', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                SHARE
                            </button>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                background: profile.isDeceased ? 'rgba(248, 113, 113, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                color: profile.isDeceased ? '#f87171' : '#22c55e',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                border: `1px solid ${profile.isDeceased ? 'rgba(248, 113, 113, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                                fontWeight: 'bold'
                            }}>
                                {profile.isDeceased ? 'ANSOSTRAL RECORD' : 'VERIFIED'}
                            </span>
                        </div>
                    </div>

                    <div style={{ width: '100%', marginTop: 'auto' }}>
                        <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '1rem' }}>Heritage Connectivity</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '600' }}>{profile.isDeceased ? 'Resting' : 'Active Member'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Born</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '600' }}>
                                    {profile.dob || profile.birthYear || 'TBD'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Order</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '600' }}>{profile.birthOrder || 'Unknown'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Family Branch</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '600' }}>Central Branch</span>
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
                            <label style={labelStyle}>Date of Birth</label>
                            <input type="date" name="dob" value={profile.dob} onChange={handleChange} className="profile-input" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Birth Position</label>
                            <input name="birthOrder" value={profile.birthOrder} placeholder="e.g. First Born" onChange={handleChange} className="profile-input" />
                        </div>
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

                    <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                name="isDeceased"
                                id="profileIsDeceased"
                                checked={profile.isDeceased}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="profileIsDeceased" style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '600', cursor: 'pointer' }}>Mark as Deceased Record</label>
                        </div>

                        {profile.isDeceased && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }} className="animate-fade-in">
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Year of Passing</label>
                                    <input type="number" name="deathYear" placeholder="e.g. 2005" value={profile.deathYear} onChange={handleChange} className="profile-input" />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Month</label>
                                    <input name="deathMonth" placeholder="e.g. June" value={profile.deathMonth} onChange={handleChange} className="profile-input" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Contact Number</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input name="phoneCode" value={profile.phoneCode} onChange={handleChange} className="profile-input" style={{ width: '100px' }} placeholder="+254" />
                            <input name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} className="profile-input" style={{ flex: 1 }} placeholder="7XX XXX XXX" />
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

                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={updating}
                        style={{ padding: '1rem', marginTop: '1rem', width: '100%' }}
                    >
                        {updating ? 'SAVING TO VAULT...' : 'Update Heritage Records'}
                    </button>

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

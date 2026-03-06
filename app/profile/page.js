'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { calculateCompleteness, calculateAge } from '@/lib/utils';
import { kenyanTribes } from '@/lib/clan_registry';
import WatuIDCard from '../components/WatuIDCard';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(null);
    const [profile, setProfile] = useState({
        id: '',
        name: 'LOADING...',
        surname: '',
        birthPlace: '',
        residency: '',
        profession: '',
        clan: '',
        tribe: '',
        subTribe: '',
        dob: '',
        birthOrder: '',
        phoneCode: '',
        phoneNumber: '',
        isDeceased: false,
        deathYear: '',
        deathMonth: '',
        securityQuestion: '',
        photo: null
    });

    const [updating, setUpdating] = useState(false);

    const countryCodes = [
        { code: '+254', flag: '🇰🇪', name: 'Kenya' },
        { code: '+27', flag: '🇿🇦', name: 'South Africa' },
        { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
        { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
        { code: '+256', flag: '🇺🇬', name: 'Uganda' },
        { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
        { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
        { code: '+44', flag: '🇬🇧', name: 'UK' },
        { code: '+1', flag: '🇺🇸', name: 'USA' },
    ];

    const birthPositions = [
        'First Born', 'Second Born', 'Third Born', 'Fourth Born', 'Fifth Born',
        'Sixth Born', 'Seventh Born', 'Eighth Born', 'Ninth Born', 'Tenth Born',
        'Last Born', 'Only Child'
    ];

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.id) {
            fetchProfile(session.user.id);
        }
    }, [session, status]);

    const [selectedTribeData, setSelectedTribeData] = useState(null);

    useEffect(() => {
        if (profile.tribe) {
            const tribe = kenyanTribes.find(t => t.name === profile.tribe);
            setSelectedTribeData(tribe || null);
        } else {
            setSelectedTribeData(null);
        }
    }, [profile.tribe]);
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

    const kenyanTribesList = kenyanTribes?.map(t => t.name) || [];
    const subTribesList = selectedTribeData ? selectedTribeData.subGroups : [];

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
        <div className="profile-wrapper">
            <div className="profile-container container animate-fade-in">
                {/* Header Section */}
                <header className="profile-header">
                    <h1 className="bold-title text-gradient">ANCESTRAL VAULT</h1>
                    <p className="subtitle">CURATE YOUR LEGACY • PROTECT YOUR HERITAGE</p>
                </header>

                <div className="profile-grid">
                    {/* Left Column: ID & Stats */}
                    <div className="profile-sidebar">
                        <div className="glass-card id-card-wrapper sticky-top">
                            <WatuIDCard person={profile} />

                            <div className="completeness-dashboard">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '0.1em' }}>VAULT INTEGRITY</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{calculateCompleteness(profile).percent}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-bar" style={{ width: `${calculateCompleteness(profile).percent}%` }}></div>
                                </div>
                                {!calculateCompleteness(profile).isComplete && (
                                    <div className="missing-items">
                                        <p style={{ fontSize: '0.65rem', color: '#f87171', marginBottom: '8px', fontWeight: 'bold' }}>LOCK ACTIVE: MISSING DATA</p>
                                        <div className="tags">
                                            {calculateCompleteness(profile).missing.map(m => (
                                                <span key={m} className="missing-tag">{m.toUpperCase()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flip-btn" style={{ width: '100%', marginTop: '1rem' }}>
                                UPDATE BIOMETRIC PHOTO
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                        </div>
                    </div>

                    {/* Right Column: Form Sections */}
                    <div className="profile-main">
                        {/* Section 1: Vital Identity */}
                        <div className="glass-card form-section shadow-lg">
                            <h2 className="section-title"><span className="icon">👤</span> VITAL IDENTITY</h2>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Given Name</label>
                                    <input name="name" value={profile.name} onChange={handleChange} className="bold-input" placeholder="LEGAL FIRST NAME" />
                                </div>
                                <div className="input-group">
                                    <label>Family Surname</label>
                                    <input name="surname" value={profile.surname} onChange={handleChange} className="bold-input" placeholder="ANCESTRAL SURNAME" />
                                </div>
                            </div>

                            <div className="form-grid mt-4">
                                <div className="input-group">
                                    <label>Biological Sex</label>
                                    <select name="sex" value={profile.sex} onChange={handleChange} className="bold-input">
                                        <option value="">SELECT SEX</option>
                                        <option value="MALE">MALE</option>
                                        <option value="FEMALE">FEMALE</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Date of Birth {profile.dob && <span className="age-pill">{calculateAge(profile.dob)} YRS</span>}</label>
                                    <input type="date" name="dob" value={profile.dob} onChange={handleChange} className="bold-input" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Lineage & Roots */}
                        <div className="glass-card form-section shadow-lg mt-6">
                            <h2 className="section-title"><span className="icon">🌳</span> LINEAGE & ROOTS</h2>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Birth Position</label>
                                    <select name="birthOrder" value={profile.birthOrder} onChange={handleChange} className="bold-input">
                                        <option value="">SELECT POSITION</option>
                                        {birthPositions.map(pos => <option key={pos} value={pos}>{pos.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Country of Birth</label>
                                    <select name="birthPlace" value={profile.birthPlace} onChange={handleChange} className="bold-input">
                                        <option value="">SELECT COUNTRY</option>
                                        {countryCodes.map(c => <option key={c.name} value={c.name}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid mt-4">
                                <div className="input-group">
                                    <label>Ancestral Tribe</label>
                                    <select name="tribe" value={profile.tribe} onChange={handleChange} className="bold-input">
                                        <option value="">SELECT TRIBE</option>
                                        {kenyanTribesList.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Sub-Tribe / Group</label>
                                    <select name="subTribe" value={profile.subTribe} onChange={handleChange} className="bold-input">
                                        <option value="">SELECT SUB-TRIBE</option>
                                        {subTribesList.map(st => <option key={st} value={st}>{st.toUpperCase()}</option>)}
                                        <option value="Other">OTHER / UNLISTED</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group mt-4">
                                <label>Ancestral Clan</label>
                                <input name="clan" value={profile.clan} onChange={handleChange} className="bold-input" placeholder="e.g. KAPLELACH" />
                            </div>
                        </div>

                        {/* Section 3: Vault Security & Contact */}
                        <div className="glass-card form-section shadow-lg mt-6">
                            <h2 className="section-title"><span className="icon">🔒</span> VAULT SECURITY</h2>
                            <div className="input-group">
                                <label>Security Recovery Question</label>
                                <input name="securityQuestion" value={profile.securityQuestion} onChange={handleChange} className="bold-input" placeholder="e.g. YOUR FIRST PET'S NAME?" />
                            </div>

                            <div className="form-grid mt-4">
                                <div className="input-group">
                                    <label>Contact Number</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            name="phoneCode"
                                            value={profile.phoneCode || '+254'}
                                            onChange={handleChange}
                                            className="bold-input"
                                            style={{ width: '100px' }}
                                        >
                                            {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                        </select>
                                        <input name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} className="bold-input" style={{ flex: 1 }} placeholder="7XX XXX XXX" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Ancestral Profession</label>
                                    <input name="profession" value={profile.profession} onChange={handleChange} className="bold-input" placeholder="e.g. SYSTEM ARCHITECT" />
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="action-bar mt-8">
                            <button
                                onClick={handleSubmit}
                                className="btn-primary push-btn"
                                disabled={updating}
                                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: '900' }}
                            >
                                {updating ? 'SYNCING WITH VAULT...' : 'COMMIT CHANGES TO HERITAGE'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-wrapper {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent),
                                radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.1), transparent),
                                #0f172a;
                    padding: 4rem 1rem 8rem 1rem;
                }
                .profile-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .bold-title {
                    font-size: 3.5rem;
                    font-weight: 950;
                    letter-spacing: -0.05em;
                    margin-bottom: 0.5rem;
                }
                .text-gradient {
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .subtitle {
                    color: var(--accent);
                    font-weight: 800;
                    letter-spacing: 0.3em;
                    font-size: 0.75rem;
                }
                .profile-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 3rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    padding: 2.5rem;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sticky-top {
                    position: sticky;
                    top: 2rem;
                }
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    letter-spacing: 0.05em;
                }
                .section-title .icon {
                    background: rgba(99, 102, 241, 0.1);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    font-size: 1rem;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .input-group label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 10px;
                    margin-left: 4px;
                }
                .bold-input {
                    width: 100%;
                    padding: 1.1rem 1.5rem;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 18px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .bold-input:focus {
                    background: rgba(255,255,255,0.05);
                    border-color: var(--accent);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
                    transform: translateY(-2px);
                }
                .age-pill {
                    background: var(--accent);
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 0.6rem;
                    margin-left: 8px;
                }
                .progress-track {
                    height: 10px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 20px;
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                }
                .progress-bar {
                    height: 100%;
                    background: linear-gradient(to right, var(--accent), var(--accent-secondary));
                    box-shadow: 0 0 15px var(--accent);
                    transition: width 1s ease;
                }
                .missing-tag {
                    display: inline-block;
                    font-size: 0.55rem;
                    padding: 4px 10px;
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                    border-radius: 6px;
                    font-weight: 900;
                    margin-right: 6px;
                    margin-bottom: 6px;
                }
                .push-btn {
                    transform: scale(1);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
                    border: none;
                    background: var(--accent);
                    color: #fff;
                    cursor: pointer;
                    border-radius: 18px;
                }
                .push-btn:hover:not(:disabled) {
                    transform: scale(1.02) translateY(-2px);
                    box-shadow: 0 25px 50px rgba(99, 102, 241, 0.4);
                }
                .push-btn:active {
                    transform: scale(0.98);
                }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .mt-8 { margin-top: 2rem; }
                
                @media (max-width: 1024px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                    .sticky-top {
                        position: static;
                    }
                    .bold-title {
                        font-size: 2.5rem;
                    }
                }
                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .glass-card {
                        padding: 1.5rem;
                    }
                }
            `}} />
        </div>
    );
}

const inputGroup = {};
const labelStyle = {};

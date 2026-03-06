'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function OnboardPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        thirdName: '',
        fourthName: '',
        maidenName: '',
        email: '',
        sex: '',
        phoneCode: '+254',
        phoneNumber: '',
        dob: '',
        birthOrder: '',
        birthPlace: '',
        securityQuestion: '',
        securityAnswer: '',
        password: '',
        confirmPassword: '',
        isDeceased: false,
        deathYear: '',
        deathMonth: '',
    });

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

    const [registry, setRegistry] = useState([]);
    const [selectedTribeData, setSelectedTribeData] = useState(null);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const res = await fetch('/api/clans/registry');
                const data = await res.json();
                setRegistry(data);
            } catch (err) {
                console.error("Failed to fetch clan registry", err);
            }
        };
        fetchRegistry();
    }, []);

    useEffect(() => {
        if (formData.tribe) {
            const tribe = registry.find(t => t.name === formData.tribe);
            setSelectedTribeData(tribe || null);
        } else {
            setSelectedTribeData(null);
        }
    }, [formData.tribe, registry]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'tribe') {
            setFormData(prev => ({ ...prev, tribe: value, subTribe: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [watuId, setWatuId] = useState(null); // New state for Watu ID
    const router = useRouter();
    const { data: session, status } = useSession();

    // Force next boarding after signed in
    useEffect(() => {
        if (status === 'authenticated' && session?.user && step === 1) {
            const [firstName, ...rest] = (session.user.name || '').split(' ');
            const lastName = rest.join(' ');

            setFormData(prev => ({
                ...prev,
                name: prev.name || firstName || '',
                surname: prev.surname || lastName || '',
                email: prev.email || session.user.email || ''
            }));

            // If we have name and sex, we could force step 2
            // For now, we stay on step 1 to ensure biological sex is picked
        }
    }, [status, session, step]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            if (data.id) {
                setWatuId(data.id);
                localStorage.setItem('watu_id', data.id); // Store for profile page
                setStep(6); // Step 6 = Success screen
            } else {
                setStep(6); // Fallback
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem', color: 'var(--foreground)' }}>Onboard to Watu.Network</h2>

                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5, 6].map(s => (
                            <div key={s} style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: step >= s ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(0,0,0,0.05)',
                                color: step >= s ? 'white' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                border: step >= s ? 'none' : '1px solid var(--border)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                transform: step === s ? 'scale(1.15)' : 'scale(1)',
                                boxShadow: step === s ? 'var(--shadow-glow)' : 'none'
                            }}>
                                {s}
                            </div>
                        ))}
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${(step / 6) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))',
                            transition: 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1)',
                            borderRadius: '10px'
                        }} />
                    </div>
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>1. CORE IDENTITY</h3>

                        {/* SOCIAL START OPTIONS */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button onClick={() => signIn('google', { callbackUrl: '/onboard' })} className="social-auth-btn" style={{ fontSize: '0.7rem', padding: '0.75rem', opacity: status === 'authenticated' ? 0.5 : 1 }}>
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3L6 33.5C9.3 39.7 16.1 44 24 44z" />
                                        <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6.2 5.2C41.4 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z" />
                                    </svg>
                                    <span>{status === 'authenticated' ? 'VERIFIED' : 'GOOGLE'}</span>
                                </button>
                                <button onClick={() => signIn('apple', { callbackUrl: '/onboard' })} className="social-auth-btn" style={{ fontSize: '0.7rem', padding: '0.75rem', background: '#fff', color: '#000', opacity: status === 'authenticated' ? 0.5 : 1 }}>
                                    <svg width="18" height="18" viewBox="0 0 814 1000">
                                        <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.7 268.8-317.7 99.8 0 183 65.8 245.3 65.8 59.2 0 152-69.1 271.5-69.1zm-17.2-159.1c-49.3 0-121.4-33.2-170.4-82.1-43.1-43.4-82.5-115.3-82.5-187.2 0-9.5.8-19 2.3-27.3h2.3c54.8 0 136.2 37.2 185.6 91.5 44.5 49.7 80.8 120.8 80.8 192.6 0 9.5-1.5 19-2.3 27.3-2.3.3-6.7 1.3-15.8-15z" />
                                    </svg>
                                    <span>{status === 'authenticated' ? 'VERIFIED' : 'APPLE'}</span>
                                </button>
                            </div>
                            {status === 'authenticated' && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--accent)', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                                    CONNECTED AS {session.user.email}
                                </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bolder' }}>{status === 'authenticated' ? 'CONTINUE BELOW' : 'OR USE MANUAL ENTRY'}</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>ENTER YOUR BIOLOGICAL SEX AND LEGAL NAMES TO BEGIN YOUR ANCESTRAL MAPPING.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>SEX</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1rem', border: formData.sex === 'male' ? '2px solid var(--accent)' : '1px solid var(--border)', background: formData.sex === 'male' ? 'var(--accent-muted)' : 'transparent' }}>
                                        <input type="radio" name="sex" value="male" checked={formData.sex === 'male'} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--foreground)' }}>MALE</span>
                                    </label>
                                    <label className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1rem', border: formData.sex === 'female' ? '2px solid var(--accent)' : '1px solid var(--border)', background: formData.sex === 'female' ? 'var(--accent-muted)' : 'transparent' }}>
                                        <input type="radio" name="sex" value="female" checked={formData.sex === 'female'} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--foreground)' }}>FEMALE</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>GIVEN NAME</label>
                                    <input name="name" placeholder="FIRST NAME" value={formData.name} onChange={handleChange} className="input-field" required />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>SURNAME (FAMILY NAME)</label>
                                    <input name="surname" placeholder="FAMILY NAME" value={formData.surname} onChange={handleChange} className="input-field" required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>3RD NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL)</span></label>
                                    <input name="thirdName" placeholder="MIDDLE NAME" value={formData.thirdName} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>4TH NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL)</span></label>
                                    <input name="fourthName" placeholder="OTHER NAME" value={formData.fourthName} onChange={handleChange} className="input-field" />
                                </div>
                            </div>

                            {formData.sex === 'female' && (
                                <div style={inputGroup} className="animate-fade-in">
                                    <label style={labelStyle}>MAIDEN NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(FAMILY OF BIRTH)</span></label>
                                    <input placeholder="MAIDEN FAMILY NAME" name="maidenName" value={formData.maidenName} onChange={handleChange} className="input-field" />
                                </div>
                            )}

                            <div style={inputGroup}>
                                <label style={labelStyle}>EMAIL ADDRESS <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL — TO RECEIVE CREDENTIALS)</span></label>
                                <input placeholder="E.G. CONTACT@HERITAGE.COM" name="email" value={formData.email} onChange={handleChange} className="input-field" />
                            </div>

                            <div style={inputGroup}>
                                <label style={labelStyle}>PHONE NUMBER <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL)</span></label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative', width: '120px' }}>
                                        <select
                                            name="phoneCode"
                                            value={formData.phoneCode}
                                            onChange={handleChange}
                                            className="input-field"
                                            style={{ appearance: 'none', paddingLeft: '35px' }}
                                        >
                                            {countryCodes.map(c => (
                                                <option key={c.code} value={c.code}>
                                                    {c.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', pointerEvents: 'none' }}>
                                            {countryCodes.find(c => c.code === formData.phoneCode)?.flag || '🌍'}
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="7XX XXX XXX"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            <button onClick={() => {
                                if (!formData.sex) { alert("PLEASE SELECT YOUR SEX FIRST"); return; }
                                setStep(2);
                            }} className="btn-primary" style={{ marginTop: '0.5rem' }}>CONTINUE TO HERITAGE</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>2. LIFE DETAILS (OPTIONAL)</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>THESE DETAILS HELP VERIFY YOUR BRANCH IN FAMILY TREES AND VALIDATE ANCESTRAL CLAIMS.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>DATE OF BIRTH</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" />
                            </div>

                            <div style={inputGroup}>
                                <label style={labelStyle}>PLACE OF BIRTH</label>
                                <input name="birthPlace" value={formData.birthPlace} placeholder="E.G. NAIROBI, KENYA" onChange={handleChange} className="input-field" />
                            </div>

                            <div style={inputGroup}>
                                <label style={labelStyle}>BIRTH POSITION (ORDER)</label>
                                <select name="birthOrder" value={formData.birthOrder} onChange={handleChange} className="input-field">
                                    <option value="">SELECT OPTION</option>
                                    <option value="first">FIRST BORN</option>
                                    <option value="second">SECOND BORN</option>
                                    <option value="third">THIRD BORN</option>
                                    <option value="fourth">FOURTH BORN</option>
                                    <option value="fifth">FIFTH BORN</option>
                                    <option value="last">LAST BORN</option>
                                    <option value="middle">MIDDLE CHILD</option>
                                    <option value="only">ONLY CHILD</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>BACK</button>
                                <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1.5 }}>CONTINUE TO ROOTS</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>3. ANCESTRAL ROOTS</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Specify your roots and life status to help map your family branch correctly.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Tribe / Ethnic Group</label>
                                <select name="tribe" value={formData.tribe} onChange={handleChange} className="input-field" style={{ appearance: 'none' }}>
                                    <option value="">Select Option</option>
                                    {registry.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Sub-tribe / Group</label>
                                    {selectedTribeData && selectedTribeData.subGroups.length > 0 ? (
                                        <select name="subTribe" value={formData.subTribe} onChange={handleChange} className="input-field">
                                            <option value="">Select Option</option>
                                            {selectedTribeData.subGroups.map(sg => (
                                                <option key={sg} value={sg}>{sg}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input name="subTribe" value={formData.subTribe} placeholder="e.g. Bukusu" onChange={handleChange} className="input-field" />
                                    )}
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Clan</label>
                                    <input name="clan" value={formData.clan} placeholder="e.g. Kaplelach" onChange={handleChange} className="input-field" />
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: formData.isDeceased ? '1rem' : '0' }}>
                                    <input
                                        type="checkbox"
                                        name="isDeceased"
                                        id="isDeceased"
                                        checked={formData.isDeceased}
                                        onChange={handleChange}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="isDeceased" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>Record is for a Deceased Ancestor</label>
                                </div>

                                {formData.isDeceased && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="animate-fade-in">
                                        <div style={inputGroup}>
                                            <label style={labelStyle}>Year of Death</label>
                                            <input type="number" name="deathYear" placeholder="e.g. 1985" value={formData.deathYear} onChange={handleChange} className="input-field" />
                                        </div>
                                        <div style={inputGroup}>
                                            <label style={labelStyle}>Month (Optional)</label>
                                            <select name="deathMonth" value={formData.deathMonth} onChange={handleChange} className="input-field">
                                                <option value="">Unknown</option>
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                                <button onClick={() => setStep(4)} className="btn-primary" style={{ flex: 1.5 }}>Review Identity</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>4. VERIFYING HERITAGE</h3>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <div style={reviewRow}><strong>IDENTITY:</strong> <span>[{formData.sex.toUpperCase()}] {formData.name} {formData.surname}</span></div>
                            <div style={reviewRow}><strong>BORN:</strong> <span>{formData.dob || 'NOT SET'} • {formData.birthOrder || 'ORDER UNKNOWN'}</span></div>
                            <div style={reviewRow}><strong>PLACE:</strong> <span>{formData.birthPlace || 'NOT SET'}</span></div>
                            <div style={reviewRow}><strong>ANCESTRY:</strong> <span>{formData.tribe} • {formData.subTribe || 'NONE'}</span></div>
                            <div style={reviewRow}><strong>STATUS:</strong> <span style={{ color: formData.isDeceased ? '#f87171' : '#4ade80' }}>{formData.isDeceased ? `DECEASED` : 'ALIVE'}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1 }}>Edit</button>
                            <button onClick={() => setStep(5)} className="btn-primary" style={{ flex: 2 }}>Confirm and Set Security</button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>5. Account Security</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Secure your Watu ID for future access.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Password</label>
                                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="input-field" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Confirm Password</label>
                                <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="input-field" />
                            </div>

                            <div style={{ padding: '1.25rem', background: 'var(--accent-muted)', borderRadius: '15px', border: '1px dashed var(--accent)', marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '800', marginBottom: '1rem' }}>RECOVERY FOR USERS WITHOUT EMAIL</p>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>SELECT RECOVERY QUESTION</label>
                                    <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} className="input-field">
                                        <option value="">SELECT A QUESTION</option>
                                        <option value="mother">WHAT IS YOUR MOTHER'S MAIDEN NAME?</option>
                                        <option value="village">WHAT IS THE NAME OF YOUR ANCESTRAL VILLAGE?</option>
                                        <option value="pet">WHAT WAS YOUR FIRST PET'S NAME?</option>
                                        <option value="school">WHAT SCHOOL DID YOUR FATHER ATTEND?</option>
                                    </select>
                                </div>
                                <div style={{ ...inputGroup, marginTop: '1rem' }}>
                                    <label style={labelStyle}>YOUR SECRET ANSWER</label>
                                    <input name="securityAnswer" placeholder="ENTER SECRET ANSWER" value={formData.securityAnswer} onChange={handleChange} className="input-field" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={() => setStep(4)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                                <button onClick={handleSubmit} className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? 'Processing...' : 'Complete Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 6 && result && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem auto' }}>✓</div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Identity Confirmed!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You can now use your unique ID to sign in.</p>

                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed rgba(99, 102, 241, 0.4)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: '700', marginBottom: '0.5rem' }}>Alpha-Numeric Identity Key</p>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{result.id}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => {
                                localStorage.setItem('watu_id', result.id);
                                router.push('/connect');
                            }} className="btn-secondary" style={{ flex: 1 }}>Explore Network</button>
                            <button
                                onClick={() => {
                                    const text = `Join me on Watu.Network! My Ancestral Identity Key is: *${result.id}*. Build your family heritage here: https://watu.network`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="btn-primary"
                                style={{ flex: 1.5, background: '#25D366', border: 'none' }}
                            >
                                Share on WhatsApp
                            </button>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    .input-field {
                        width: 100%;
                        padding: 0.875rem 1rem;
                        border-radius: 12px;
                        border: 1px solid var(--border);
                        background: var(--card);
                        color: var(--foreground);
                        font-family: inherit;
                        font-size: 1rem;
                        transition: all 0.2s ease;
                        outline: none;
                        text-transform: uppercase;
                    }
                    .input-field::placeholder {
                        color: var(--text-secondary);
                        opacity: 0.5;
                    }
                    .input-field:focus {
                        border-color: var(--accent);
                        background: var(--card-hover);
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    }
                    select.input-field {
                        cursor: pointer;
                    }
                `}</style>
            </div>
        </div>
    );
}

const stepTitle = { fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' };
const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginLeft: '4px'
};

const reviewRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    margin: '0.75rem 0',
    color: '#cbd5e1'
};

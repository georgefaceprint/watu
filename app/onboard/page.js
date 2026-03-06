'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        tribe: '',
        subTribe: '',
        clan: '',
        birthPlace: '',
        password: '',
        confirmPassword: '',
        isDeceased: false,
        deathYear: '',
        deathMonth: '',
    });

    const tribes = [
        "Kikuyu", "Luhya", "Luo", "Kalenjin", "Kamba", "Kisii", "Meru", "Mijikenda",
        "Maasai", "Turkana", "Samburu", "Taita", "Pokot", "Basuba", "Teso", "Kuria"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [watuId, setWatuId] = useState(null); // New state for Watu ID
    const router = useRouter();

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
                setStep(5);
            } else {
                setStep(5); // Fallback if data.id is not present but success
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
                        {[1, 2, 3, 4, 5].map(s => (
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
                            width: `${(step / 5) * 100}%`,
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
                                <label style={labelStyle}>EMAIL ADDRESS <span style={{ opacity: 0.5, fontWeight: 400 }}>(OPTIONAL TO RECEIVE CREDENTIALS)</span></label>
                                <input placeholder="E.G. CONTACT@HERITAGE.COM" name="email" value={formData.email} onChange={handleChange} className="input-field" />
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
                        <h3 style={stepTitle}>2. Ancestral Heritage & Status</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Specify your roots and life status to help map your family branch correctly.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Tribe / Ethnic Group</label>
                                <select name="tribe" value={formData.tribe} onChange={handleChange} className="input-field" style={{ appearance: 'none' }}>
                                    <option value="">Select Option</option>
                                    {tribes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Sub-tribe</label>
                                    <input name="subTribe" value={formData.subTribe} placeholder="e.g. Bukusu" onChange={handleChange} className="input-field" />
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
                                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                                <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1.5 }}>Review Identity</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>3. VERIFYING HERITAGE</h3>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <div style={reviewRow}><strong>IDENTITY:</strong> <span>[{formData.sex.toUpperCase()}] {formData.name} {formData.thirdName} {formData.fourthName} {formData.surname}</span></div>
                            {formData.maidenName && <div style={reviewRow}><strong>MAIDEN NAME:</strong> <span>{formData.maidenName}</span></div>}
                            <div style={reviewRow}><strong>ANCESTRY:</strong> <span>{formData.tribe} • {formData.subTribe || 'NONE'}</span></div>
                            <div style={reviewRow}><strong>Clan:</strong> <span>{formData.clan || 'None'}</span></div>
                            <div style={reviewRow}><strong>Status:</strong> <span style={{ color: formData.isDeceased ? '#f87171' : '#4ade80' }}>{formData.isDeceased ? `Deceased (${formData.deathMonth} ${formData.deathYear})` : 'Alive'}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>Edit</button>
                            <button onClick={() => setStep(4)} className="btn-primary" style={{ flex: 2 }}>Confirm and Set Security</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>4. Account Security</h3>
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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                                <button onClick={handleSubmit} className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? 'Processing...' : 'Complete Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && result && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem auto' }}>✓</div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Identity Confirmed!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You can now use your unique ID to sign in.</p>

                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed rgba(99, 102, 241, 0.4)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: '700', marginBottom: '0.5rem' }}>Alpha-Numeric Identity Key</p>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{result.id}</div>
                        </div>

                        <button onClick={() => router.push('/connect')} className="btn-primary" style={{ width: '100%' }}>Start Connecting</button>
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

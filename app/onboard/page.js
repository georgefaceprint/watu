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
        tribe: '',
        subTribe: '',
        clan: '',
        birthPlace: '',
        password: '',
        confirmPassword: ''
    });

    // ... tribes array is below in actual file ...

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                body: JSON.stringify({
                    ...formData,
                    password: formData.password
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            setStep(5);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem', color: '#fff' }}>Onboard to Watu.Network</h2>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '8px',
                            background: step >= s ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                            color: step >= s ? 'white' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            border: step >= s ? 'none' : '1px solid var(--border)',
                            transition: 'all 0.3s ease'
                        }}>
                            {s}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>1. Full Identity Details</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Enter your names as they appear on your legal records. Optional names are welcome.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Given Name</label>
                                    <input name="name" placeholder="First Name" value={formData.name} onChange={handleChange} className="input-field" required />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Surname</label>
                                    <input name="surname" placeholder="Last Name" value={formData.surname} onChange={handleChange} className="input-field" required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>3rd Name <span style={{ opacity: 0.5, fontWeight: 400 }}>(Optional)</span></label>
                                    <input name="thirdName" placeholder="Middle Name" value={formData.thirdName} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>4th Name <span style={{ opacity: 0.5, fontWeight: 400 }}>(Optional)</span></label>
                                    <input name="fourthName" placeholder="Other Name" value={formData.fourthName} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: '0.5rem' }}>Continue to Heritage</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={stepTitle}>2. Ancestral Heritage</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Specify your roots to help Watu.Network map your family branch correctly.</p>
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
                            <div style={inputGroup}>
                                <label style={labelStyle}>Place of Birth</label>
                                <input name="birthPlace" value={formData.birthPlace} placeholder="City, County" onChange={handleChange} className="input-field" />
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
                        <h3 style={stepTitle}>3. Verifying Heritage</h3>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <div style={reviewRow}><strong>Identity:</strong> <span>{formData.name} {formData.thirdName} {formData.fourthName} {formData.surname}</span></div>
                            <div style={reviewRow}><strong>Ancestry:</strong> <span>{formData.tribe} • {formData.subTribe || 'None'}</span></div>
                            <div style={reviewRow}><strong>Clan:</strong> <span>{formData.clan || 'None'}</span></div>
                            <div style={reviewRow}><strong>Birthplace:</strong> <span>{formData.birthPlace}</span></div>
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
                        background: rgba(255,255,255,0.05);
                        color: white;
                        font-family: inherit;
                        font-size: 1rem;
                        transition: all 0.2s ease;
                        outline: none;
                    }
                    .input-field:focus {
                        border-color: var(--accent);
                        background: rgba(255,255,255,0.08);
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

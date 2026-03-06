'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        tribe: '',
        clan: '',
        birthPlace: '',
        birthDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const router = useRouter();

    const tribes = [
        "Kikuyu", "Luhya", "Kalenjin", "Luo", "Kamba", "Kisii", "Meru", "Mijikenda", "Maasai", "Turkana", "Taita"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            setStep(4);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="glass animate-fade-in" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem', color: '#fff' }}>Onboard to Watu.Network</h2>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: step >= s ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                            color: step >= s ? 'white' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            border: step >= s ? 'none' : '1px solid var(--border)',
                            transition: 'all 0.3s ease'
                        }}>
                            {s}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Basic Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>First Name</label>
                                <input name="name" placeholder="e.g. James" onChange={handleChange} className="input-field" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Surname</label>
                                <input name="surname" placeholder="e.g. Sifuna" onChange={handleChange} className="input-field" />
                            </div>
                            <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: '0.5rem' }}>Next Step</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>Heritage & Citizenship</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Currently optimized for Kenyan ancestry.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Tribe / Ethnic Group</label>
                                <select name="tribe" onChange={handleChange} className="input-field" style={{ appearance: 'none' }}>
                                    <option value="">Select Option</option>
                                    {tribes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Clan</label>
                                <input name="clan" placeholder="e.g. Kaplelach, Anjiru" onChange={handleChange} className="input-field" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Place of Birth</label>
                                <input name="birthPlace" placeholder="City, Region" onChange={handleChange} className="input-field" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Date of Birth</label>
                                <input type="date" name="birthDate" onChange={handleChange} className="input-field" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                                <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1.5 }}>Next Step</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Verifying Your Heritage</h3>
                        <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <p style={reviewRow}><strong>Full Identity:</strong> <span>{formData.name} {formData.surname}</span></p>
                            <p style={reviewRow}><strong>Ancestry:</strong> <span>{formData.tribe}</span></p>
                            <p style={reviewRow}><strong>Clan:</strong> <span>{formData.clan || 'Not Specified'}</span></p>
                            <p style={reviewRow}><strong>Birthplace:</strong> <span>{formData.birthPlace}</span></p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>Edit</button>
                            <button onClick={handleSubmit} className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                                {loading ? 'Processing...' : 'Complete Onboarding'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && result && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            margin: '0 auto 1.5rem auto'
                        }}>✓</div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Welcome to Watu.Network!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your digital heritage profile is now live.</p>

                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px dashed rgba(99, 102, 241, 0.4)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '2rem'
                        }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: '700', marginBottom: '0.5rem' }}>Alpha-Numeric Identity Key</p>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{result.id}</div>
                        </div>

                        <button onClick={() => router.push('/connect')} className="btn-primary" style={{ width: '100%' }}>Connect with Relatives</button>
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

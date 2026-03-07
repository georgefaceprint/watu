'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const COUNTRY_CODES = [
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
    { code: '+256', flag: '🇺🇬', name: 'Uganda' },
    { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
    { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
];

export default function OnboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [watuId, setWatuId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        thirdName: '',
        fourthName: '',
        sex: '',
        email: '',
        phoneCode: '+254',
        phoneNumber: '',
        tribe: '',
        subTribe: '',
        clan: '',
        birthPlace: '',
        birthOrder: '',
        isDeceased: false,
        password: '',
        accessCode: '', // Added accessCode for 5-digit PIN
        confirmCode: '',
    });

    const [registry, setRegistry] = useState([]);
    const [selectedTribeData, setSelectedTribeData] = useState(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const [first, ...rest] = (session.user.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                name: prev.name || first || '',
                surname: prev.surname || rest.join(' ') || '',
                email: prev.email || session.user.email || '',
                phoneNumber: prev.phoneNumber || session.user.phone || ''
            }));
        }
    }, [status, session]);

    useEffect(() => {
        fetch('/api/clans/registry').then(res => res.json()).then(setRegistry).catch(console.error);
    }, []);

    useEffect(() => {
        const tribe = registry.find(t => t.name === formData.tribe);
        setSelectedTribeData(tribe || null);
    }, [formData.tribe, registry]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.surname || !formData.sex) return alert("CORE IDENTITY FIELDS REQUIRED");
            setStep(2);
        } else if (step === 2) {
            if (!formData.tribe) return alert("PLEASE SELECT YOUR TRIBE");
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        if (formData.accessCode.length !== 5) return alert("ACCESS CODE MUST BE 5 DIGITS");
        if (formData.accessCode !== formData.confirmCode) return alert("ACCESS CODES DO NOT MATCH");

        setLoading(true);
        try {
            const res = await fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setWatuId(data.id);
            localStorage.setItem('watu_id', data.id);
            setStep(4);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboard-container">
            <div className="onboard-glass animate-fade-in">

                <div className="step-dots">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`dot ${step >= s ? 'active' : ''} ${step === s ? 'pulsing' : ''}`}></div>
                    ))}
                </div>

                <div className="onboard-header">
                    <h1>{step === 4 ? 'IDENTITY SECURED' : 'CLAIM YOUR IDENTITY'}</h1>
                    <p className="subtitle">
                        {step === 1 && 'STEP 1: CORE BIOLOGICAL IDENTITY'}
                        {step === 2 && 'STEP 2: ANCESTRAL ROOTS'}
                        {step === 3 && 'STEP 3: SECURE VAULT ACCESS'}
                        {step === 4 && 'WELCOME TO THE NETWORK'}
                    </p>
                </div>

                <div className="onboard-content">
                    {step === 1 && (
                        <div className="step-container animate-slide-up">
                            <div className="input-row">
                                <div className="input-group">
                                    <label>BIOLOGICAL SEX</label>
                                    <div className="sex-toggle">
                                        <button onClick={() => setFormData(p => ({ ...p, sex: 'male' }))} className={formData.sex === 'male' ? 'active' : ''}>MALE</button>
                                        <button onClick={() => setFormData(p => ({ ...p, sex: 'female' }))} className={formData.sex === 'female' ? 'active' : ''}>FEMALE</button>
                                    </div>
                                </div>
                            </div>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>GIVEN NAME</label>
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="FIRST NAME" />
                                </div>
                                <div className="input-group">
                                    <label>SURNAME</label>
                                    <input name="surname" value={formData.surname} onChange={handleChange} placeholder="FAMILY NAME" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>MOBILE IDENTITY</label>
                                <div className="phone-wrapper">
                                    <div className="country-selector">
                                        <select name="phoneCode" value={formData.phoneCode} onChange={handleChange}>
                                            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} {c.flag}</option>)}
                                        </select>
                                        <div className="selector-icon">▾</div>
                                    </div>
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="7XX XXX XXX"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                                        className="main-input"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>EMAIL ADDRESS (RECOVERY)</label>
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="CONTACT@WATU.NETWORK" />
                            </div>
                            <button onClick={nextStep} className="btn-primary-cinematic">CONTINUE TO HERITAGE</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-container animate-slide-up">
                            <div className="input-group">
                                <label>YOUR TRIBE / ETHNIC GROUP</label>
                                <select name="tribe" value={formData.tribe} onChange={handleChange}>
                                    <option value="">SELECT TRIBE</option>
                                    {registry.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                            {selectedTribeData && (
                                <div className="input-group animate-fade-in">
                                    <label>SUB-TRIBE / CLAN</label>
                                    <select name="subTribe" value={formData.subTribe} onChange={handleChange}>
                                        <option value="">SELECT SUB-TRIBE</option>
                                        {selectedTribeData.subGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>BIRTH ORDER</label>
                                    <select name="birthOrder" value={formData.birthOrder} onChange={handleChange}>
                                        <option value="">SELECT</option>
                                        <option value="first">FIRST BORN</option>
                                        <option value="middle">MIDDLE BORN</option>
                                        <option value="last">LAST BORN</option>
                                        <option value="only">ONLY CHILD</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>BIRTH PLACE</label>
                                    <input name="birthPlace" value={formData.birthPlace} onChange={handleChange} placeholder="CITY/VILLAGE" />
                                </div>
                            </div>
                            <div className="btn-row">
                                <button onClick={() => setStep(1)} className="btn-secondary-onboard">BACK</button>
                                <button onClick={nextStep} className="btn-primary-cinematic">NEXT: SECURITY</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-container animate-slide-up">
                            <p className="hint-text">SELECT YOUR PERSONAL 5-DIGIT ACCESS CODE. THIS WILL SECURE YOUR MOBILE IDENTITY.</p>
                            <div className="input-group">
                                <label>CHOOSE 5-DIGIT ACCESS CODE</label>
                                <input
                                    type="password"
                                    name="accessCode"
                                    maxLength={5}
                                    value={formData.accessCode}
                                    onChange={(e) => setFormData(p => ({ ...p, accessCode: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="•••••"
                                    className="otp-pin-input"
                                />
                            </div>
                            <div className="input-group">
                                <label>CONFIRM ACCESS CODE</label>
                                <input
                                    type="password"
                                    name="confirmCode"
                                    maxLength={5}
                                    value={formData.confirmCode}
                                    onChange={(e) => setFormData(p => ({ ...p, confirmCode: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="•••••"
                                    className="otp-pin-input"
                                />
                            </div>
                            <div className="btn-row">
                                <button onClick={() => setStep(2)} className="btn-secondary-onboard">BACK</button>
                                <button onClick={handleSubmit} disabled={loading} className="btn-primary-cinematic">
                                    {loading ? 'SECURING...' : 'COMPLETE ONBOARDING'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-container animate-fade-in center">
                            <div className="success-badge">✓</div>
                            <h2>{watuId}</h2>
                            <p>THIS IS YOUR UNIQUE IDENTITY KEY.</p>
                            <p className="small">USE YOUR 5-DIGIT ACCESS CODE TO LOG IN VIA MOBILE.</p>
                            <button onClick={() => router.push('/')} className="btn-primary-cinematic">ENTER THE NETWORK</button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .onboard-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: radial-gradient(circle at top right, #1e293b, #0f172a, #020617);
                }
                .onboard-glass {
                    width: 100%;
                    max-width: 520px;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 32px;
                    padding: 3rem 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                    position: relative;
                }
                .step-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 2rem; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.5s; }
                .dot.active { background: var(--accent); width: 24px; border-radius: 4px; }
                .dot.pulsing { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

                .onboard-header { text-align: center; margin-bottom: 2.5rem; }
                .onboard-header h1 { font-size: 1.5rem; letter-spacing: 0.1em; color: white; margin: 0; }
                .subtitle { font-size: 0.7rem; color: var(--accent); letter-spacing: 0.2em; margin-top: 0.5rem; font-weight: 800; }

                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; font-size: 0.65rem; font-weight: 900; color: var(--text-secondary); margin-bottom: 0.75rem; letter-spacing: 0.05em; }
                
                input, select, .main-input {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 16px;
                    padding: 1rem 1.25rem;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                }
                input:focus, select:focus, .main-input:focus { border-color: var(--accent); background: rgba(255,255,255,0.08); }

                .otp-pin-input {
                    font-size: 2rem !important;
                    text-align: center;
                    letter-spacing: 0.5em;
                    font-weight: 900;
                    color: var(--accent) !important;
                }

                .phone-wrapper { display: flex; gap: 12px; }
                .country-selector {
                    position: relative;
                    width: 130px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 16px;
                    overflow: hidden;
                }
                .country-selector select {
                    width: 100%;
                    height: 100%;
                    padding: 0 32px 0 16px;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1rem;
                    appearance: none;
                    cursor: pointer;
                }
                .selector-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: white; pointer-events: none; }
                .main-input { flex: 1; }

                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .sex-toggle { display: flex; gap: 10px; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
                .sex-toggle button { flex: 1; padding: 0.8rem; border-radius: 12px; border: none; background: transparent; color: var(--text-secondary); font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.3s; }
                .sex-toggle button.active { background: var(--accent); color: white; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }

                .btn-primary-cinematic {
                    width: 100%;
                    padding: 1.1rem;
                    background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
                    border: none;
                    border-radius: 18px;
                    color: white;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
                }
                .btn-primary-cinematic:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6); }

                .btn-row { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn-secondary-onboard { flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: white; border-radius: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; }

                .hint-text { font-size: 0.75rem; color: var(--text-secondary); text-align: center; margin-bottom: 2rem; line-height: 1.6; }

                .center { text-align: center; }
                .success-badge { width: 80px; height: 80px; border-radius: 50%; background: var(--accent); display: flex; alignItems: center; justifyContent: center; margin: 0 auto 2rem auto; font-size: 2.5rem; color: white; box-shadow: 0 0 30px var(--accent); }
                .small { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
}

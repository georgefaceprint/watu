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
        isDeceased: false
    });

    const [registry, setRegistry] = useState([]);
    const [selectedTribeData, setSelectedTribeData] = useState(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const [first, ...rest] = (session.user.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                name: prev.name === 'NEW' ? '' : (prev.name || first || ''),
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
        }
    };

    const handleSubmit = async () => {
        if (!formData.tribe) return alert("TRIBE REQUIRED");
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
            setStep(3); // Show success
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
                    {[1, 2].map(s => (
                        <div key={s} className={`dot ${step >= s ? 'active' : ''} ${step === s ? 'pulsing' : ''}`}></div>
                    ))}
                </div>

                <div className="onboard-header">
                    <h1>{step === 3 ? 'IDENTITY SECURED' : 'MAP YOUR HERITAGE'}</h1>
                    <p className="subtitle">
                        {step === 1 && 'STEP 1: CORE BIOLOGICAL IDENTITY'}
                        {step === 2 && 'STEP 2: ANCESTRAL ROOTS'}
                        {step === 3 && 'WELCOME TO THE NETWORK'}
                    </p>
                </div>

                <div className="onboard-content">
                    {step === 1 && (
                        <div className="step-container animate-slide-up">
                            <div className="input-group">
                                <label>BIOLOGICAL SEX</label>
                                <div className="sex-toggle">
                                    <button onClick={() => setFormData(p => ({ ...p, sex: 'male' }))} className={formData.sex === 'male' ? 'active' : ''}>MALE</button>
                                    <button onClick={() => setFormData(p => ({ ...p, sex: 'female' }))} className={formData.sex === 'female' ? 'active' : ''}>FEMALE</button>
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
                                <button onClick={handleSubmit} disabled={loading} className="btn-primary-cinematic">
                                    {loading ? 'SECURING...' : 'FINISH IDENTITY'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-container animate-fade-in center">
                            <div className="success-badge">✓</div>
                            <h2>{watuId}</h2>
                            <p>THIS IS YOUR UNIQUE IDENTITY KEY.</p>
                            <p className="small">PROCEED TO THE LINEAGE EXPLORER.</p>
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
                    background: radial-gradient(circle at top right, #4338ca, #1e1b4b, #0f172a);
                }
                .onboard-glass {
                    width: 100%;
                    max-width: 500px;
                    background: rgba(30, 41, 59, 0.85);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 32px;
                    padding: 3.5rem 2.5rem;
                    box-shadow: 0 0 80px rgba(0,0,0,0.5);
                    position: relative;
                }
                .step-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 2rem; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.5s; }
                .dot.active { background: #818cf8; width: 24px; border-radius: 4px; }
                .dot.pulsing { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

                .onboard-header { text-align: center; margin-bottom: 2.5rem; }
                .onboard-header h1 { font-size: 1.5rem; letter-spacing: 0.1em; color: white; margin: 0; }
                .subtitle { font-size: 0.7rem; color: #818cf8; letter-spacing: 0.2em; margin-top: 0.5rem; font-weight: 800; }

                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; font-size: 0.75rem; font-weight: 900; color: #e2e8f0; margin-bottom: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; }
                
                input, select {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 1.1rem;
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    outline: none;
                    transition: all 0.2s;
                }
                input:focus, select:focus { border-color: #818cf8; background: rgba(255, 255, 255, 0.15); box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2); }

                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .sex-toggle { display: flex; gap: 10px; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 16px; }
                .sex-toggle button { flex: 1; padding: 0.8rem; border-radius: 12px; border: none; background: transparent; color: #94a3b8; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.3s; }
                .sex-toggle button.active { background: #818cf8; color: white; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }

                .btn-primary-cinematic {
                    width: 100%;
                    padding: 1.15rem;
                    background: linear-gradient(135deg, #6366f1, #818cf8);
                    border: none;
                    border-radius: 20px;
                    color: white;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
                    text-transform: uppercase;
                }
                .btn-primary-cinematic:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.6); }

                .btn-row { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn-secondary-onboard { flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: white; border-radius: 18px; font-weight: 800; cursor: pointer; }

                .center { text-align: center; }
                .success-badge { width: 80px; height: 80px; border-radius: 50%; background: #818cf8; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem auto; font-size: 2.5rem; color: white; box-shadow: 0 0 30px #818cf8; }
                .small { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
}

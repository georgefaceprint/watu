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
        sex: '',
        email: '',
        phoneCode: '+254',
        phoneNumber: '',
        tribe: '',
        subTribe: '',
        clan: '',
        birthPlace: '',
        birthOrder: '',
        profession: '',
        securityQuestion: ''
    });

    const [registry, setRegistry] = useState([]);
    const [selectedTribeData, setSelectedTribeData] = useState(null);

    const securityQuestions = [
        'What was the name of your first pet?',
        'In what city were you born?',
        'What is your mother\'s maiden name?',
        'What was the name of your first school?',
        'What is your favorite ancestral dish?'
    ];

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name === 'NEW' ? '' : (prev.name || session.user.name?.split(' ')[0] || ''),
                surname: prev.surname || session.user.name?.split(' ').slice(1).join(' ') || '',
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.surname || !formData.sex) return alert("CORE IDENTITY FIELDS REQUIRED");
        } else if (step === 2) {
            if (!formData.tribe || !formData.clan) return alert("HERITAGE FIELDS REQUIRED");
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
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
            setStep(4); // Success screen
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboard-container">
            <div className="onboard-card animate-fade-in">

                {/* 3-Page Progress Bar */}
                {step < 4 && (
                    <div className="onboard-progress">
                        <div className={`progress-step-item ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-num">1</div>
                            <span>IDENTITY</span>
                        </div>
                        <div className="progress-line">
                            <div className="line-fill" style={{ width: step > 1 ? '100%' : '0%' }}></div>
                        </div>
                        <div className={`progress-step-item ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-num">2</div>
                            <span>HERITAGE</span>
                        </div>
                        <div className="progress-line">
                            <div className="line-fill" style={{ width: step > 2 ? '100%' : '0%' }}></div>
                        </div>
                        <div className={`progress-step-item ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-num">3</div>
                            <span>VAULT</span>
                        </div>
                    </div>
                )}

                <div className="onboard-header">
                    <h1>{step === 4 ? 'IDENTITY SECURED' : 'WATU ONBOARDING'}</h1>
                    <p className="subtitle">
                        {step === 1 && 'ESTABLISH YOUR BIOLOGICAL CORE'}
                        {step === 2 && 'MAP YOUR ANCESTRAL BRANCH'}
                        {step === 3 && 'SECURE YOUR HERITAGE VAULT'}
                        {step === 4 && 'WELCOME TO THE LINEAGE'}
                    </p>
                </div>

                <div className="onboard-content">
                    {step === 1 && (
                        <div className="step-ui animate-slide-up">
                            <div className="input-group">
                                <label>BIOLOGICAL SEX</label>
                                <div className="option-grid">
                                    <button onClick={() => setFormData(p => ({ ...p, sex: 'male' }))} className={`option-btn ${formData.sex === 'male' ? 'active' : ''}`}>MALE</button>
                                    <button onClick={() => setFormData(p => ({ ...p, sex: 'female' }))} className={`option-btn ${formData.sex === 'female' ? 'active' : ''}`}>FEMALE</button>
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>GIVEN NAME</label>
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="FIRST NAME" />
                                </div>
                                <div className="input-group">
                                    <label>SURNAME</label>
                                    <input name="surname" value={formData.surname} onChange={handleChange} placeholder="FAMILY NAME" />
                                </div>
                            </div>
                            <button onClick={nextStep} className="btn-main">CONTINUE TO HERITAGE</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-ui animate-slide-up">
                            <div className="input-group">
                                <label>ANCESTRAL TRIBE</label>
                                <select name="tribe" value={formData.tribe} onChange={handleChange}>
                                    <option value="">SELECT TRIBE</option>
                                    {registry.map(t => <option key={t.name} value={t.name}>{t.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>SUB-TRIBE / GROUP</label>
                                    <select name="subTribe" value={formData.subTribe} onChange={handleChange}>
                                        <option value="">SELECT SUB-TRIBE</option>
                                        {selectedTribeData?.subGroups.map(sg => <option key={sg} value={sg}>{sg.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>ANCESTRAL CLAN</label>
                                    <input name="clan" value={formData.clan} onChange={handleChange} placeholder="CLAN NAME" />
                                </div>
                            </div>
                            <div className="btn-row">
                                <button onClick={prevStep} className="btn-back">BACK</button>
                                <button onClick={nextStep} className="btn-main">SECURITY SETUP</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-ui animate-slide-up">
                            <div className="input-group">
                                <label>RECOVERY QUESTION</label>
                                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange}>
                                    <option value="">SELECT A QUESTION</option>
                                    {securityQuestions.map(q => <option key={q} value={q}>{q.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>PROFESSION</label>
                                <input name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. FARMER, ARCHITECT" />
                            </div>
                            <div className="input-group">
                                <label>RECOVERY EMAIL (OPTIONAL)</label>
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="CONTACT@WATU.NETWORK" />
                            </div>
                            <div className="btn-row">
                                <button onClick={prevStep} className="btn-back">BACK</button>
                                <button onClick={handleSubmit} disabled={loading} className="btn-main">
                                    {loading ? 'FINISHING...' : 'FINISH IDENTITY'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-ui animate-fade-in center">
                            <div className="success-icon">✓</div>
                            <h2 className="watu-id-badge">{watuId}</h2>
                            <p>YOUR HERITAGE IS NOW SECURED ON THE NETWORK.</p>
                            <button onClick={() => router.push('/')} className="btn-main mt-6">ENTER THE LINEAGE</button>
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
                .onboard-card {
                    width: 100%;
                    max-width: 540px;
                    background: rgba(30, 41, 59, 0.9);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 40px;
                    padding: 3rem;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
                }

                /* 3-Step Progress Bar */
                .onboard-progress {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 3.5rem;
                }
                .progress-step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    z-index: 2;
                }
                .step-num {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.8rem;
                    transition: all 0.3s;
                }
                .progress-step-item.active .step-num {
                    background: #818cf8;
                    color: white;
                    border-color: #818cf8;
                    box-shadow: 0 0 15px rgba(129, 140, 248, 0.5);
                }
                .progress-step-item span {
                    font-size: 0.6rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.3);
                    letter-spacing: 0.1em;
                }
                .progress-step-item.active span { color: #818cf8; }
                
                .progress-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 15px; transform: translateY(-10px); }
                .line-fill { height: 100%; background: #818cf8; transition: width 0.5s ease; }

                .onboard-header { text-align: center; margin-bottom: 3rem; }
                .onboard-header h1 { font-size: 1.8rem; color: white; font-weight: 900; letter-spacing: -0.02em; }
                .subtitle { font-size: 0.75rem; color: #818cf8; letter-spacing: 0.2em; margin-top: 0.5rem; font-weight: 800; }

                .input-group { margin-bottom: 1.8rem; }
                .input-group label { display: block; font-size: 0.7rem; font-weight: 900; color: #94a3b8; margin-bottom: 0.8rem; letter-spacing: 0.1em; }

                input, select {
                    width: 100%;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 18px;
                    padding: 1.2rem;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 700;
                    outline: none;
                    transition: all 0.3s;
                }
                input:focus, select:focus { border-color: #818cf8; background: rgba(255,255,255,0.12); }

                .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
                
                .option-grid { display: flex; gap: 12px; }
                .option-btn {
                    flex: 1; padding: 1rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 800; cursor: pointer; transition: all 0.3s;
                }
                .option-btn.active { background: #818cf8; color: white; border-color: #818cf8; }

                .btn-main {
                    width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #6366f1, #818cf8);
                    border: none; border-radius: 20px; color: white; font-weight: 900;
                    font-size: 1rem; cursor: pointer; transition: all 0.3s;
                    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
                }
                .btn-main:hover { transform: translateY(-2px); box-shadow: 0 20px 45px rgba(99, 102, 241, 0.6); }

                .btn-row { display: flex; gap: 1rem; }
                .btn-back {
                    flex: 0.4; padding: 1.2rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);
                    color: white; border-radius: 20px; font-weight: 800; cursor: pointer;
                }

                .center { text-align: center; }
                .success-icon {
                    width: 80px; height: 80px; background: #818cf8; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem; color: white; margin: 0 auto 2rem;
                    box-shadow: 0 0 40px rgba(129, 140, 248, 0.6);
                }
                .watu-id-badge { font-size: 2.5rem; font-weight: 900; color: #818cf8; margin-bottom: 1rem; letter-spacing: -0.05em; }
                .mt-6 { margin-top: 2rem; }
            `}</style>
        </div>
    );
}

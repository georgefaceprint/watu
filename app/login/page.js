'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: Access Code
    const router = useRouter();

    const [phoneCode, setPhoneCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handleCheckPhone = async () => {
        if (!phoneNumber || phoneNumber.length < 7) {
            setError('ENTER A VALID MOBILE NUMBER');
            return;
        }
        setLoading(true); setError('');
        const fullPhone = phoneCode + phoneNumber.replace(/^0+/, '');

        try {
            const res = await fetch('/api/auth/phone/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone })
            });
            const data = await res.json();
            setIsNewUser(!data.exists);
            setStep(2);
        } catch (err) {
            setError('NETWORK ERROR. TRY AGAIN.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccess = async () => {
        if (pin.length !== 5) { setError('CODE MUST BE 5 DIGITS'); return; }
        if (isNewUser && pin !== confirmPin) { setError('CODES DO NOT MATCH'); return; }

        setLoading(true); setError('');
        const fullPhone = phoneCode + phoneNumber.replace(/^0+/, '');

        try {
            const res = await signIn('phone', {
                phone: fullPhone,
                otp: pin, // We use the same 'otp' field in the provider for the PIN
                isNew: isNewUser,
                redirect: false
            });

            if (res?.error) throw new Error(res.error);

            // Redirect to home or onboard
            router.push('/');
        } catch (err) {
            setError(err.message.toUpperCase());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-outer-container">
            <div className="auth-glass-container animate-fade-in">

                <div className="auth-header">
                    <div className="brand-orbit">
                        <div className="brand-logo">W</div>
                        <div className="orbit-ring"></div>
                    </div>
                    <h1><span className="brand-watu">Watu</span><span className="accent-text">.Network</span></h1>
                    <p className="subtitle">ANCESTRAL IDENTITY GATEWAY</p>
                </div>

                {error && (
                    <div className="error-alert">⚠️ {error}</div>
                )}

                <div className="auth-content">
                    {step === 1 ? (
                        <div className="flow-container animate-slide-up">
                            <div className="input-group">
                                <label>MOBILE IDENTITY</label>
                                <div className="phone-wrapper">
                                    <div className="country-selector">
                                        <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}>
                                            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} {c.flag}</option>)}
                                        </select>
                                        <div className="selector-icon">▾</div>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="7XX XXX XXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className="main-input"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button onClick={handleCheckPhone} disabled={loading} className="btn-primary-cinematic">
                                {loading ? 'SCANNING...' : 'CONTINUE'}
                            </button>
                        </div>
                    ) : (
                        <div className="flow-container animate-slide-up">
                            <div className="input-group">
                                <label>{isNewUser ? 'CHOOSE YOUR 5-DIGIT ACCESS CODE' : 'ENTER YOUR 5-DIGIT ACCESS CODE'}</label>
                                <input
                                    type="password"
                                    maxLength={5}
                                    placeholder="•••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="otp-input"
                                    autoFocus
                                />
                            </div>

                            {isNewUser && (
                                <div className="input-group animate-fade-in">
                                    <label>CONFIRM YOUR ACCESS CODE</label>
                                    <input
                                        type="password"
                                        maxLength={5}
                                        placeholder="•••••"
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                        className="otp-input"
                                    />
                                </div>
                            )}

                            <p className="hint">IDENTITY: {phoneCode} {phoneNumber}</p>

                            <button onClick={handleAccess} disabled={loading} className="btn-primary-cinematic">
                                {loading ? 'AUTHENTICATING...' : isNewUser ? 'SAVE & ENTER' : 'CONFIRM IDENTITY'}
                            </button>
                            <button onClick={() => { setStep(1); setPin(''); setConfirmPin(''); }} className="btn-link">CHANGE NUMBER</button>
                        </div>
                    )}
                </div>

                <div className="auth-footer">
                    <p>© 2026 WATU.NETWORK | SECURING GLOBAL HERITAGE</p>
                </div>
            </div>

            <style jsx>{`
                .auth-outer-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: radial-gradient(circle at top right, #4338ca, #1e1b4b, #0f172a);
                }
                .auth-glass-container {
                    width: 100%;
                    max-width: 460px;
                    background: rgba(30, 41, 59, 0.85);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 32px;
                    padding: 4rem 2.5rem;
                    box-shadow: 0 0 80px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2);
                    position: relative;
                }
                .auth-header { text-align: center; margin-bottom: 3.5rem; }
                .brand-watu { color: #ffffff; }
                .brand-orbit { width: 64px; height: 64px; margin: 0 auto 1.5rem auto; position: relative; }
                .brand-logo {
                    width: 100%; height: 100%;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 32px; font-weight: 900; color: white;
                    z-index: 2; position: relative;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }
                .orbit-ring {
                    position: absolute; inset: -8px;
                    border: 1px solid #6366f1; border-radius: 22px;
                    opacity: 0.3; animation: rotate 10s linear infinite;
                }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                h1 { font-size: 2.2rem; margin: 0; letter-spacing: -0.03em; font-weight: 900; }
                .accent-text { color: #818cf8; text-shadow: 0 0 20px rgba(129, 140, 248, 0.4); }
                .subtitle { font-size: 0.75rem; color: #cbd5e1; letter-spacing: 0.25em; margin-top: 0.5rem; font-weight: 900; }

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }

                .input-group { margin-bottom: 2rem; }
                .input-group label { display: block; font-size: 0.75rem; font-weight: 900; color: #e2e8f0; margin-bottom: 1rem; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
                
                .phone-wrapper { display: flex; gap: 12px; }
                .country-selector {
                    position: relative; width: 120px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px; overflow: hidden;
                }
                .country-selector select {
                    width: 100%; height: 100%; padding: 0 32px 0 16px;
                    background: transparent; border: none; color: #ffffff;
                    font-size: 1rem; font-weight: 700; appearance: none; cursor: pointer;
                }
                .country-selector select option { background: #1e293b; color: white; }
                .selector-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #ffffff; pointer-events: none; opacity: 0.7; }

                .main-input {
                    flex: 1; background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px; padding: 1.25rem;
                    color: #ffffff; font-size: 1.25rem; font-weight: 900;
                    outline: none; transition: all 0.2s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                }
                .main-input:focus { border-color: #818cf8; background: rgba(255, 255, 255, 0.15); box-shadow: 0 0 20px rgba(129, 140, 248, 0.1); }

                .btn-primary-cinematic {
                    width: 100%; padding: 1.25rem;
                    background: linear-gradient(135deg, #6366f1, #818cf8);
                    border: none; border-radius: 20px; color: white; font-weight: 900;
                    letter-spacing: 0.1em; cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.4);
                    text-transform: uppercase;
                }
                .btn-primary-cinematic:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -5px rgba(99, 102, 241, 0.6); }

                .otp-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    width: 100%; text-align: center; font-size: 2rem;
                    letter-spacing: 0.5em; color: #ffffff; font-weight: 900;
                    outline: none; padding: 1.25rem 0;
                    transition: all 0.2s;
                }
                .otp-input:focus { border-color: #818cf8; background: rgba(255, 255, 255, 0.1); }

                .hint { font-size: 0.75rem; color: #94a3b8; text-align: center; margin: 1.5rem 0; font-weight: 600; }
                .btn-link { background: none; border: none; color: #818cf8; font-size: 0.8rem; font-weight: 900; margin-top: 1rem; cursor: pointer; display: block; width: 100%; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; }
                .auth-footer { text-align: center; margin-top: 4rem; font-size: 0.65rem; color: #64748b; font-weight: 900; letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
}

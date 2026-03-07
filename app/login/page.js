'use client';
import { useState, useEffect } from 'react';
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
    const [mode, setMode] = useState('phone'); // 'phone', 'social', 'watuId'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // ── Phone Auth ──
    const [phoneCode, setPhoneCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState('');

    // ── Watu ID Auth ──
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);

    // ── Handlers ──
    const handleSendOtp = async () => {
        if (!phoneNumber) { setError('ENTER MOBILE NUMBER'); return; }
        setLoading(true); setError('');
        const fullPhone = phoneCode + phoneNumber.replace(/^0+/, '');
        try {
            const res = await fetch('/api/auth/phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOtpSent(true);
            if (data.devOtp) setDevOtp(data.devOtp);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 5) { setError('ENTER 5-DIGIT CODE'); return; }
        setLoading(true); setError('');
        const fullPhone = phoneCode + phoneNumber.replace(/^0+/, '');
        try {
            const res = await signIn('phone', { phone: fullPhone, otp, redirect: false });
            if (res?.error) throw new Error(res.error);
            localStorage.setItem('watu_id', fullPhone); // Temporary or just for local reference
            router.push('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleWatuLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await signIn('credentials', { id: id.toUpperCase(), password, redirect: false });
            if (res?.error) throw new Error('INVALID WATU ID OR PASSWORD');
            localStorage.setItem('watu_id', id.toUpperCase());
            router.push('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-outer-container">
            <div className="auth-glass-container animate-fade-in">

                {/* Brand Header */}
                <div className="auth-header">
                    <div className="brand-orbit">
                        <div className="brand-logo">W</div>
                        <div className="orbit-ring"></div>
                    </div>
                    <h1><span className="brand-watu">Watu</span><span className="accent-text">.Network</span></h1>
                    <p className="subtitle">ANCESTRAL IDENTITY GATEWAY</p>
                </div>

                {error && (
                    <div className="error-alert">⚠️ {error.toUpperCase()}</div>
                )}

                <div className="auth-content">
                    {/* PHONE FLOW */}
                    {mode === 'phone' && (
                        <div className="flow-container">
                            {!otpSent ? (
                                <>
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
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleSendOtp} disabled={loading} className="btn-primary-cinematic">
                                        {loading ? 'RELAYING...' : 'GET 5-DIGIT ACCESS CODE'}
                                    </button>
                                </>
                            ) : (
                                <div className="otp-flow">
                                    <div className="input-group">
                                        <label>VERIFY 5-DIGIT CODE</label>
                                        <div className="otp-input-container">
                                            <input
                                                type="text"
                                                maxLength={5}
                                                placeholder="•••••"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="otp-input"
                                            />
                                            {devOtp && <div className="dev-otp">🔐 DEV CODE: {devOtp}</div>}
                                        </div>
                                        <p className="hint">SENT TO {phoneCode} {phoneNumber}</p>
                                    </div>
                                    <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary-cinematic">
                                        {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                                    </button>
                                    <button onClick={() => setOtpSent(false)} className="btn-link">CHANGE NUMBER</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SOCIAL FLOW */}
                    {mode === 'social' && (
                        <div className="flow-container animate-fade-in">
                            <div className="social-grid">
                                <button onClick={() => signIn('google', { callbackUrl: '/' })} className="btn-social google">
                                    <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
                                    <span>GOOGLE</span>
                                </button>
                                <button onClick={() => signIn('apple', { callbackUrl: '/' })} className="btn-social apple">
                                    <svg viewBox="0 0 814 1000"><path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.7 268.8-317.7 99.8 0 183 65.8 245.3 65.8 59.2 0 152-69.1 271.5-69.1zm-17.2-159.1c-49.3 0-121.4-33.2-170.4-82.1-43.1-43.4-82.5-115.3-82.5-187.2 0-9.5.8-19 2.3-27.3h2.3c54.8 0 136.2 37.2 185.6 91.5 44.5 49.7 80.8 120.8 80.8 192.6 0 9.5-1.5 19-2.3 27.3-2.3.3-6.7 1.3-15.8-15z" /></svg>
                                    <span>APPLE</span>
                                </button>
                            </div>
                            <p className="hint">SINGLE-TAP ANCESTRAL ENTRANCE</p>
                        </div>
                    )}

                    {/* WATU ID FLOW */}
                    {mode === 'watuId' && (
                        <form onSubmit={handleWatuLogin} className="flow-container animate-fade-in">
                            <div className="input-group">
                                <label>WATU ID / PIN</label>
                                <input placeholder="W-XXXX-XXXX" value={id} onChange={(e) => setId(e.target.value)} className="main-input" required />
                            </div>
                            <div className="input-group">
                                <label>SECURITY CHIP (PASSWORD)</label>
                                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="main-input" required />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary-cinematic">
                                {loading ? 'DECRYPTING...' : 'DECRYPT VAULT ACCESS'}
                            </button>
                            <button type="button" onClick={() => setShowRecovery(true)} className="btn-link">LOST IDENTITY?</button>
                        </form>
                    )}
                </div>

                {/* Perspective Switcher */}
                <div className="perspective-switcher">
                    <button onClick={() => setMode('phone')} className={mode === 'phone' ? 'active' : ''}>PHONE</button>
                    <div className="divider"></div>
                    <button onClick={() => setMode('social')} className={mode === 'social' ? 'active' : ''}>SOCIAL</button>
                    <div className="divider"></div>
                    <button onClick={() => setMode('watuId')} className={mode === 'watuId' ? 'active' : ''}>WATU ID</button>
                </div>

                <div className="auth-footer">
                    <p>New to the network? <a href="/onboard">CLAIM YOUR IDENTITY →</a></p>
                </div>
            </div>

            {/* Custom Styles */}
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
                    max-width: 480px;
                    background: rgba(30, 41, 59, 0.85); /* Lightened from indigo-900 */
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.25); /* Stronger border */
                    border-radius: 32px;
                    padding: 3.5rem 2.5rem;
                    box-shadow: 0 0 80px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2);
                    position: relative;
                    overflow: hidden;
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .brand-watu { color: #ffffff; }
                .brand-orbit {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 1.5rem auto;
                    position: relative;
                }
                .brand-logo {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 900;
                    color: white;
                    z-index: 2;
                    position: relative;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }
                .orbit-ring {
                    position: absolute;
                    inset: -8px;
                    border: 1px solid var(--accent);
                    border-radius: 22px;
                    opacity: 0.3;
                    animation: rotate 10s linear infinite;
                }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                h1 { font-size: 2.2rem; margin: 0; letter-spacing: -0.03em; font-weight: 900; }
                .accent-text { color: #818cf8; text-shadow: 0 0 20px rgba(129, 140, 248, 0.4); }
                .subtitle { font-size: 0.75rem; color: #cbd5e1; letter-spacing: 0.25em; margin-top: 0.5rem; font-weight: 900; }

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    font-weight: 800;
                }

                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; font-size: 0.75rem; font-weight: 900; color: #e2e8f0; margin-bottom: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; }
                
                .phone-wrapper { display: flex; gap: 12px; }
                .country-selector {
                    position: relative;
                    width: 130px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                .country-selector:hover { background: rgba(255, 255, 255, 0.12); }
                .country-selector select {
                    width: 100%;
                    height: 100%;
                    padding: 0 32px 0 16px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 700;
                    appearance: none;
                    cursor: pointer;
                }
                .country-selector select option {
                    background: #1e293b;
                    color: white;
                }
                .selector-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #ffffff; pointer-events: none; opacity: 0.7; }

                 .main-input {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 1.1rem 1.25rem;
                    color: #ffffff;
                    font-size: 1.2rem;
                    font-weight: 800;
                    outline: none;
                    transition: all 0.2s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                }
                .main-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }
                .main-input:focus { 
                    border-color: #818cf8; 
                    background: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2), inset 0 2px 4px rgba(0,0,0,0.1);
                }

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
                .btn-primary-cinematic:active { transform: scale(0.98); }

                .otp-input {
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid var(--accent);
                    width: 100%;
                    text-align: center;
                    font-size: 2.5rem;
                    letter-spacing: 0.5em;
                    color: #ffffff;
                    font-weight: 900;
                    outline: none;
                    padding: 1rem 0;
                }
                .otp-input::placeholder { color: rgba(255, 255, 255, 0.2); }
                .hint { font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 1rem; }
                .dev-otp { margin-top: 1rem; padding: 0.5rem; background: rgba(99,102,241,0.1); border-radius: 8px; font-size: 0.75rem; color: var(--accent); text-align: center; font-weight: bold; border: 1px dashed var(--accent); }

                .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .btn-social {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 1rem;
                    border-radius: 18px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03);
                    color: white;
                    font-weight: 800;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-social:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
                .btn-social img, .btn-social svg { width: 20px; height: 20px; }
                .btn-social.apple { background: white; color: black; border: none; }

                .perspective-switcher {
                    display: flex;
                    justify-content: space-between;
                    background: rgba(0,0,0,0.2);
                    padding: 0.5rem;
                    border-radius: 20px;
                    margin-top: 3rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .perspective-switcher button {
                    flex: 1;
                    padding: 0.6rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 800;
                    font-size: 0.65rem;
                    cursor: pointer;
                    border-radius: 14px;
                    transition: all 0.3s;
                }
                .perspective-switcher button.active {
                    background: rgba(255,255,255,0.05);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .divider { width: 1px; background: rgba(255,255,255,0.05); margin: 0.5rem 0; }

                .btn-link { background: none; border: none; color: var(--accent); font-size: 0.75rem; font-weight: 800; margin-top: 1.5rem; cursor: pointer; display: block; width: 100%; text-align: center; }

                .auth-footer { text-align: center; margin-top: 3rem; font-size: 0.85rem; color: var(--text-secondary); }
                .auth-footer a { color: var(--accent); font-weight: 800; text-decoration: none; }
            `}</style>
        </div>
    );
}

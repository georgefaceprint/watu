'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const TABS = [
    { id: 'social', label: '🌐 Social', icon: '🌐' },
    { id: 'email', label: '📧 Email', icon: '📧' },
    { id: 'phone', label: '📱 Phone', icon: '📱' },
    { id: 'watuId', label: '🆔 Watu ID', icon: '🆔' },
];

export default function LoginPage() {
    const [tab, setTab] = useState('social');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // ── Watu ID State ──
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    // ── Email State ──
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    // ── Phone State ──
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState('');

    // ── Recovery State ──
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState(1);
    const [recoveryId, setRecoveryId] = useState('');
    const [recoveryQuestion, setRecoveryQuestion] = useState('');
    const [recoveryAnswer, setRecoveryAnswer] = useState('');
    const [recoveryToken, setRecoveryToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [recoveryError, setRecoveryError] = useState('');

    const fetchQuestion = async () => {
        setLoading(true); setRecoveryError('');
        try {
            const res = await fetch(`/api/auth/recover?id=${recoveryId}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setRecoveryQuestion(data.question || 'NO SECURITY QUESTION ON RECORD');
            setRecoveryStep(2);
        } catch (err) { setRecoveryError(err.message); }
        finally { setLoading(false); }
    };

    const verifyAnswer = async () => {
        setLoading(true); setRecoveryError('');
        try {
            const res = await fetch('/api/auth/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: recoveryId, answer: recoveryAnswer })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setRecoveryToken(data.token);
            setRecoveryStep(3);
        } catch (err) { setRecoveryError(err.message); }
        finally { setLoading(false); }
    };

    const handleReset = async () => {
        setLoading(true); setRecoveryError('');
        try {
            const res = await fetch('/api/auth/recover/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: recoveryId, token: recoveryToken, password: newPassword })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowRecovery(false);
            setTab('watuId');
            setError('');
            alert('✅ PASSWORD UPDATED. SIGN IN BELOW.');
        } catch (err) { setRecoveryError(err.message); }
        finally { setLoading(false); }
    };

    // ── Handlers ──
    const handleWatuIdLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await signIn('credentials', {
                id: id.toUpperCase(),
                password,
                redirect: false,
            });
            if (res?.error) throw new Error('INVALID WATU ID OR PASSWORD');
            localStorage.setItem('watu_id', id.toUpperCase());
            router.push('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleEmailMagicLink = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await signIn('email', { email, redirect: false, callbackUrl: '/' });
            if (res?.error) throw new Error(res.error);
            setEmailSent(true);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleSendOtp = async () => {
        if (!phone) { setError('ENTER A PHONE NUMBER FIRST'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOtpSent(true);
            if (data.devOtp) setDevOtp(data.devOtp);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code: otp })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            localStorage.setItem('watu_id', data.userId);
            router.push('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '52px', height: '52px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                        borderRadius: '14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 1.25rem auto',
                        fontWeight: 'bold', fontSize: '26px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                    }}>W</div>
                    <h1 style={{ fontSize: '1.75rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>IDENTITY LOGIN</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ACCESS YOUR ANCESTRAL LEGACY</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '14px', padding: '4px', marginBottom: '2rem' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setError(''); }} style={{
                            flex: 1, padding: '8px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.03em',
                            background: tab === t.id ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'transparent',
                            color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.3s ease',
                            boxShadow: tab === t.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                        }}>{t.label}</button>
                    ))}
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171', padding: '12px', borderRadius: '12px',
                        fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center'
                    }}>⚠️ {error}</div>
                )}

                {/* ─── SOCIAL TAB ─── */}
                {tab === 'social' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={(e) => { e.preventDefault(); setLoading(true); signIn('google', { callbackUrl: '/' }); }}
                            disabled={loading}
                            className="social-auth-btn"
                            id="google-signin-btn"
                            style={{ background: 'var(--card)', border: '1px solid var(--accent)', color: 'var(--foreground)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3L6 33.5C9.3 39.7 16.1 44 24 44z" />
                                <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6.2 5.2C41.4 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z" />
                            </svg>
                            <span>{loading && tab === 'social' ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
                        </button>

                        <button
                            onClick={(e) => { e.preventDefault(); setLoading(true); signIn('apple', { callbackUrl: '/' }); }}
                            disabled={loading}
                            className="social-auth-btn"
                            id="apple-signin-btn"
                            style={{ background: '#000', color: '#fff', borderColor: '#000' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 814 1000">
                                <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.7 268.8-317.7 99.8 0 183 65.8 245.3 65.8 59.2 0 152-69.1 271.5-69.1zm-17.2-159.1c-49.3 0-121.4-33.2-170.4-82.1-43.1-43.4-82.5-115.3-82.5-187.2 0-9.5.8-19 2.3-27.3h2.3c54.8 0 136.2 37.2 185.6 91.5 44.5 49.7 80.8 120.8 80.8 192.6 0 9.5-1.5 19-2.3 27.3-2.3.3-6.7 1.3-15.8-15z" />
                            </svg>
                            <span>{loading && tab === 'social' ? 'WAITING...' : 'CONTINUE WITH APPLE'}</span>
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                OAuth Status: <span style={{ color: 'var(--accent)', fontWeight: 800 }}>ACTIVE</span> //
                                <br />Ensure Google Callback is: <code>{typeof window !== 'undefined' ? window.location.origin + '/api/auth/callback/google' : 'localhost:3000/api/auth/callback/google'}</code>
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>OR CHOOSE ANOTHER METHOD</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button onClick={() => setTab('email')} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--accent-muted)', color: 'var(--accent)', fontFamily: 'inherit', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>📧 EMAIL LINK</button>
                            <button onClick={() => setTab('phone')} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--accent-muted)', color: 'var(--accent)', fontFamily: 'inherit', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>📱 PHONE OTP</button>
                        </div>
                    </div>
                )}

                {/* ─── EMAIL TAB ─── */}
                {tab === 'email' && (
                    emailSent ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
                            <h3 style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>CHECK YOUR INBOX</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                A magic sign-in link has been sent to<br />
                                <strong style={{ color: 'var(--accent)' }}>{email}</strong><br />
                                Click the link to access your heritage vault.
                            </p>
                            <button onClick={() => { setEmailSent(false); setEmail(''); }} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Try a different email</button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                Enter your email and we'll send a secure magic link — no password needed.
                            </p>
                            <div style={inputGroup}>
                                <label style={labelStyle}>EMAIL ADDRESS</label>
                                <input id="email-login-input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" required />
                            </div>
                            <button id="send-magic-link-btn" type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.85rem', width: '100%' }}>
                                {loading ? 'SENDING...' : '✨ SEND MAGIC LINK'}
                            </button>
                        </form>
                    )
                )}

                {/* ─── PHONE TAB ─── */}
                {tab === 'phone' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Enter your phone number to receive a one-time code.
                        </p>
                        {!otpSent ? (
                            <>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>PHONE NUMBER (WITH COUNTRY CODE)</label>
                                    <input id="phone-input" type="tel" placeholder="+254 7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="auth-input" />
                                </div>
                                <button id="send-otp-btn" onClick={handleSendOtp} disabled={loading} className="btn-primary" style={{ padding: '0.85rem', width: '100%' }}>
                                    {loading ? 'SENDING...' : '📱 SEND OTP CODE'}
                                </button>
                            </>
                        ) : (
                            <>
                                {devOtp && (
                                    <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed var(--accent)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center' }}>
                                        🔐 DEV MODE CODE: <strong>{devOtp}</strong>
                                    </div>
                                )}
                                <div style={inputGroup}>
                                    <label style={labelStyle}>ENTER YOUR 6-DIGIT CODE</label>
                                    <input id="otp-input" type="text" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="auth-input" style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.4rem' }} />
                                </div>
                                <button id="verify-otp-btn" onClick={handleVerifyOtp} disabled={loading} className="btn-primary" style={{ padding: '0.85rem', width: '100%' }}>
                                    {loading ? 'VERIFYING...' : '✅ VERIFY & SIGN IN'}
                                </button>
                                <button onClick={() => { setOtpSent(false); setOtp(''); setDevOtp(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Change number</button>
                            </>
                        )}
                    </div>
                )}

                {/* ─── WATU ID TAB ─── */}
                {tab === 'watuId' && (
                    <form onSubmit={handleWatuIdLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>WATU ID, EMAIL, OR PHONE NUMBER</label>
                            <input id="watu-id-input" type="text" placeholder="W-XXXX / email@... / +254 7XX..." value={id} onChange={(e) => setId(e.target.value)} className="auth-input" required />
                        </div>

                        <div style={inputGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={labelStyle}>PASSWORD</label>
                                <span onClick={() => setShowRecovery(true)} style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '800', cursor: 'pointer' }}>
                                    FORGOT IDENTITY?
                                </span>
                            </div>
                            <input id="watu-password-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" required />
                        </div>

                        <button id="watu-id-login-btn" type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.85rem', width: '100%' }}>
                            {loading ? 'AUTHENTICATING...' : '🔐 SIGN IN WITH WATU ID'}
                        </button>
                    </form>
                )}

                {/* ─── Sign Up prompt ─── */}
                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Don't have a Watu ID yet?</p>
                    <a href="/onboard" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Start Your Heritage Onboarding →</a>
                </div>
            </div>

            {/* ─── HERITAGE RECOVERY MODAL ─── */}
            {showRecovery && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }} className="animate-fade-in">
                    <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative' }}>
                        <button onClick={() => { setShowRecovery(false); setRecoveryStep(1); setRecoveryError(''); }}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

                        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>🌿 HERITAGE RECOVERY</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '2rem' }}>IDENTITY VERIFICATION — NO EMAIL REQUIRED</p>

                        {recoveryError && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '1.5rem' }}>⚠️ {recoveryError}</div>
                        )}

                        {recoveryStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>YOUR WATU ID</label>
                                    <input placeholder="W-XXXX-XXXX" className="auth-input" value={recoveryId} onChange={(e) => setRecoveryId(e.target.value.toUpperCase())} />
                                </div>
                                <button onClick={fetchQuestion} disabled={loading} className="btn-primary">{loading ? 'RELAYING...' : 'RELAY SECURITY QUESTION'}</button>
                            </div>
                        )}
                        {recoveryStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>SECRET QUESTION</label>
                                    <p style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.9rem' }}>{recoveryQuestion.toUpperCase()}</p>
                                    <input placeholder="SECRET ANSWER" className="auth-input" value={recoveryAnswer} onChange={(e) => setRecoveryAnswer(e.target.value)} />
                                </div>
                                <button onClick={verifyAnswer} disabled={loading} className="btn-primary">{loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}</button>
                            </div>
                        )}
                        {recoveryStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>NEW PASSWORD</label>
                                    <input type="password" placeholder="••••••••" className="auth-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <button onClick={handleReset} disabled={loading} className="btn-primary">{loading ? 'RESETTING...' : 'RESET & SECURE IDENTITY'}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .auth-input {
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.04);
                    color: var(--foreground);
                    font-size: 0.95rem;
                    outline: none;
                    font-family: inherit;
                    transition: all 0.2s ease;
                }
                .auth-input:focus {
                    background: rgba(255,255,255,0.08);
                    border-color: var(--accent);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .social-auth-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    width: 100%;
                    padding: 0.85rem;
                    border-radius: 14px;
                    font-family: inherit;
                    font-weight: 800;
                    font-size: 0.85rem;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.05);
                    color: var(--foreground);
                    transition: all 0.25s ease;
                }
                .social-auth-btn:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.1);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                }
            `}</style>
        </div>
    );
}

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle = { fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };

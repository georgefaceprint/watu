'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Recovery State
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState(1);
    const [recoveryId, setRecoveryId] = useState('');
    const [recoveryQuestion, setRecoveryQuestion] = useState('');
    const [recoveryAnswer, setRecoveryAnswer] = useState('');
    const [recoveryToken, setRecoveryToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [recoveryError, setRecoveryError] = useState('');

    const fetchQuestion = async () => {
        setLoading(true);
        setRecoveryError('');
        try {
            const res = await fetch(`/api/auth/recover?id=${recoveryId}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setRecoveryQuestion(data.question || 'NO SECURITY QUESTION ON RECORD');
            setRecoveryStep(2);
        } catch (err) {
            setRecoveryError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyAnswer = async () => {
        setLoading(true);
        setRecoveryError('');
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
        } catch (err) {
            setRecoveryError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        setRecoveryError('');
        try {
            const res = await fetch('/api/auth/recover/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: recoveryId, token: recoveryToken, password: newPassword })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Auto login or close
            setShowRecovery(false);
            alert("IDENTITY SECURED. PASSWORD UPDATED.");
        } catch (err) {
            setRecoveryError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            router.push('/');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = async (provider) => {
        await signIn(provider, { callbackUrl: '/' });
    };

    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem auto',
                        fontWeight: 'bold',
                        fontSize: '24px',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                    }}>W</div>
                    <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem' }}>Identity Login</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Access your ancestral legacy and connections.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => handleSocial('google')}
                        className="social-btn"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" style={{ width: '20px' }} />
                        Sign in with Google
                    </button>
                    <button
                        onClick={() => handleSocial('apple')}
                        className="social-btn"
                        style={{ background: '#fff', color: '#000' }}
                    >
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}></span>
                        Sign in with Apple
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>or use Watu ID</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Alpha-Numeric ID</label>
                        <input
                            type="text"
                            placeholder="W-XXXX-XXXX"
                            value={id}
                            onChange={(e) => setId(e.target.value.toUpperCase())}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div style={inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={labelStyle}>Security Password</label>
                            <span
                                onClick={() => setShowRecovery(true)}
                                style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '800', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                FORGOT IDENTITY?
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '0.85rem', marginTop: '0.5rem', width: '100%', fontSize: '0.95rem' }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In with Watu ID'}
                    </button>
                </form>

                {/* HERITAGE RECOVERY MODAL */}
                {showRecovery && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }} className="animate-fade-in">
                        <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative' }}>
                            <button
                                onClick={() => { setShowRecovery(false); setRecoveryStep(1); setRecoveryError(''); }}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                            >✕</button>

                            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>HERITAGE RECOVERY</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '2rem' }}>RE-ESTABLISHING IDENTITY WITHOUT EMAIL</p>

                            {recoveryError && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                                    ⚠️ {recoveryError}
                                </div>
                            )}

                            {recoveryStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>ENTER YOUR WATU ID</label>
                                        <input
                                            placeholder="W-XXXX-XXXX"
                                            className="auth-input"
                                            value={recoveryId}
                                            onChange={(e) => setRecoveryId(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <button onClick={fetchQuestion} disabled={loading} className="btn-primary">
                                        {loading ? 'RELAYING...' : 'RELAY SECURITY QUESTION'}
                                    </button>
                                </div>
                            )}

                            {recoveryStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>SECRET QUESTION</label>
                                        <p style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{recoveryQuestion.toUpperCase()}</p>
                                        <input
                                            placeholder="ENTER YOUR SECRET ANSWER"
                                            className="auth-input"
                                            value={recoveryAnswer}
                                            onChange={(e) => setRecoveryAnswer(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={verifyAnswer} disabled={loading} className="btn-primary">
                                        {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                                    </button>
                                </div>
                            )}

                            {recoveryStep === 3 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>SET NEW PASSWORD</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="auth-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={handleReset} disabled={loading} className="btn-primary">
                                        {loading ? 'RESETTING...' : 'RESET PASSWORD & LOGIN'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Don't have a Watu ID yet?</p>
                    <a href="/onboard" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Start Your Onboarding →</a>
                </div>
            </div>

            <style jsx>{`
                .auth-input {
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .auth-input:focus {
                    background: rgba(255,255,255,0.07);
                    border-color: var(--accent);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    width: 100%;
                    padding: 0.8rem;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                .social-btn:hover {
                    transform: translateY(-2px);
                    opacity: 0.95;
                }
            `}</style>
        </div>
    );
}

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginLeft: '4px'
};

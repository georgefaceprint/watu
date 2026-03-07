'use client';
import { useOnboard } from '../OnboardContext';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
    const { watuId } = useOnboard();
    const router = useRouter();

    return (
        <div className="step-page animate-fade-in center">
            <header className="onboard-header">
                <div className="success-pulse">✓</div>
                <h1>IDENTITY SECURED</h1>
                <p className="sub">WELCOME TO THE NETWORK</p>
            </header>

            <div className="success-body">
                <h2 className="watu-id-hero">{watuId || 'WATU-ID-PENDING'}</h2>
                <p className="success-hint">THIS IS YOUR UNIQUE HERITAGE KEY. USE IT TO CONNECT ACROSS THE LINEAGE.</p>

                <button onClick={() => router.push('/')} className="btn-onboard-next mt-8">
                    ENTER LINEAGE EXPLORER
                </button>
            </div>

            <style jsx>{`
                .center { text-align: center; }
                .success-pulse {
                    width: 100px; height: 100px; background: #818cf8; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 3rem; color: white; margin: 0 auto 2rem;
                    box-shadow: 0 0 50px rgba(129, 140, 248, 0.5);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 20px rgba(129,140,248,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(129,140,248,0.6); }
                    100% { transform: scale(1); box-shadow: 0 0 20px rgba(129,140,248,0.4); }
                }
                .watu-id-hero {
                    font-size: 3rem; font-weight: 950; color: #818cf8;
                    letter-spacing: -0.05em; margin-bottom: 1.5rem;
                }
                .success-hint {
                    font-size: 0.8rem; color: #94a3b8; font-weight: 800;
                    letter-spacing: 0.05em; max-width: 300px; margin: 0 auto;
                }
                .mt-8 { margin-top: 3rem; }
            `}</style>
        </div>
    );
}

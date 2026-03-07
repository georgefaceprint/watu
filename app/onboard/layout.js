'use client';
import { OnboardProvider } from './OnboardContext';
import { usePathname } from 'next/navigation';

export default function OnboardLayout({ children }) {
    const pathname = usePathname();

    // Determine current step based on route
    let activeStep = 1;
    if (pathname.includes('step-2')) activeStep = 2;
    if (pathname.includes('step-3')) activeStep = 3;
    if (pathname.includes('success')) activeStep = 4;

    return (
        <OnboardProvider>
            <div className="onboard-viewport">
                <div className="onboard-glass-container animate-fade-in text-focus-in">

                    {activeStep < 4 && (
                        <div className="onboard-progress-nav">
                            <div className={`step-pill ${activeStep >= 1 ? 'active' : ''}`}>
                                <div className="pill-num">1</div>
                                <span>IDENTITY</span>
                            </div>
                            <div className={`progress-rail ${activeStep > 1 ? 'filled' : ''}`}></div>
                            <div className={`step-pill ${activeStep >= 2 ? 'active' : ''}`}>
                                <div className="pill-num">2</div>
                                <span>HERITAGE</span>
                            </div>
                            <div className={`progress-rail ${activeStep > 2 ? 'filled' : ''}`}></div>
                            <div className={`step-pill ${activeStep >= 3 ? 'active' : ''}`}>
                                <div className="pill-num">3</div>
                                <span>VAULT</span>
                            </div>
                        </div>
                    )}

                    <main className="onboard-main-content">
                        {children}
                    </main>

                </div>
            </div>

            <style jsx global>{`
                .onboard-viewport {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: radial-gradient(circle at top right, #4338ca, #1e1b4b, #0f172a);
                    font-family: var(--font-outfit), sans-serif;
                }
                .onboard-glass-container {
                    width: 100%;
                    max-width: 600px;
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 48px;
                    padding: 4rem;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.7);
                    position: relative;
                    min-height: 500px;
                    display: flex;
                    flex-direction: column;
                }

                .onboard-progress-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 4rem;
                }
                .step-pill {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.4s ease;
                }
                .pill-num {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: rgba(255,255,255,0.3);
                    font-size: 0.9rem;
                }
                .step-pill.active .pill-num {
                    background: #818cf8;
                    color: white;
                    border-color: #818cf8;
                    box-shadow: 0 0 20px rgba(129, 140, 248, 0.4);
                }
                .step-pill span {
                    font-size: 0.65rem;
                    font-weight: 950;
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                }
                .step-pill.active span { color: #818cf8; }

                .progress-rail {
                    flex: 1;
                    height: 2px;
                    background: rgba(255,255,255,0.08);
                    margin: 0 20px;
                    transform: translateY(-13px);
                    position: relative;
                    overflow: hidden;
                }
                .progress-rail.filled::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: #818cf8;
                    animation: railFill 0.6s ease-out forwards;
                }
                @keyframes railFill { from { width: 0; } to { width: 100%; } }

                .onboard-header { text-align: center; margin-bottom: 3rem; }
                .onboard-header h1 { font-size: 2rem; color: #fff; font-weight: 950; letter-spacing: -0.01em; margin: 0; }
                .onboard-header .sub { color: #818cf8; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.25em; margin-top: 0.5rem; text-transform: uppercase; }

                .onboard-main-content { flex: 1; }

                /* Common Page Elements */
                .step-page { width: 100%; }
                .input-stack { display: flex; flex-direction: column; gap: 2rem; }
                .field-item label { display: block; font-size: 0.75rem; font-weight: 900; color: #cbd5e1; margin-bottom: 12px; letter-spacing: 0.05em; }
                
                .luminous-input, .luminous-select {
                    width: 100%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 20px;
                    padding: 1.25rem 1.5rem;
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 800;
                    outline: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .luminous-input:focus, .luminous-select:focus {
                    border-color: #818cf8;
                    background: rgba(255,255,255,0.1);
                    box-shadow: 0 0 25px rgba(129, 140, 248, 0.15);
                }
                
                .sex-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .sex-btn {
                    padding: 1.25rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04); color: #94a3b8; font-weight: 900;
                    cursor: pointer; transition: all 0.3s; font-size: 0.85rem;
                }
                .sex-btn.active {
                    background: #818cf8; color: #fff; border-color: #818cf8;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }

                .nav-actions { margin-top: 4rem; display: flex; gap: 1rem; }
                .btn-onboard-next {
                    flex: 1; padding: 1.25rem; font-size: 1.1rem; font-weight: 950;
                    background: linear-gradient(135deg, #6366f1, #818cf8);
                    color: #fff; border: none; border-radius: 24px; cursor: pointer;
                    transition: all 0.3s; box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .btn-onboard-next:hover { transform: translateY(-3px); box-shadow: 0 20px 45px rgba(99, 102, 241, 0.6); }
                .btn-onboard-back {
                    padding: 1.25rem 2rem; background: transparent; border: 1px solid rgba(255,255,255,0.15);
                    color: #fff; border-radius: 24px; font-weight: 800; cursor: pointer;
                }

                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </OnboardProvider>
    );
}

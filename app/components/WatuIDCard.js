'use client';
import { useState } from 'react';

export default function WatuIDCard({ person }) {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!person) return null;

    return (
        <div className="card-scene" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`card-container ${isFlipped ? 'is-flipped' : ''}`}>

                {/* FRONT OF CARD */}
                <div className="card-face card-front glass">
                    <div className="card-header">
                        <div className="watu-logo">🌳</div>
                        <div className="watu-text">WATU.NETWORK</div>
                    </div>

                    <div className="card-body">
                        <div className="portrait-container">
                            <div className="portrait-glow"></div>
                            {person.photo ? (
                                <img src={person.photo} alt="Portrait" className="portrait-img" />
                            ) : (
                                <div className="portrait-placeholder">{person.name?.charAt(0)}</div>
                            )}
                        </div>

                        <div className="identity-info">
                            <div className="full-name identity-text">{person.name} {person.surname}</div>
                            <div className="heritage-badge">{person.tribe?.toUpperCase()} • {person.clan?.toUpperCase() || 'GENERAL'}</div>
                            <div className="status-indicator">
                                <span className={`status-dot ${person.isDeceased ? 'deceased' : 'active'}`}></span>
                                {person.isDeceased ? 'ANCESTRAL RECORD' : 'VERIFIED CITIZEN'}
                            </div>
                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="id-label">UNIQUE IDENTITY CODE</div>
                        <div className="id-code">[{person.id || 'W-SEARCHING'}]</div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="hologram"></div>
                    <div className="chip"></div>
                </div>

                {/* BACK OF CARD */}
                <div className="card-face card-back glass">
                    <div className="back-header">HERITAGE QR VAULT</div>
                    <div className="qr-container">
                        <svg width="140" height="140" viewBox="0 0 100 100" className="qr-svg">
                            <rect width="100" height="100" fill="white" rx="8" />
                            <rect x="10" y="10" width="30" height="30" fill="var(--accent)" />
                            <rect x="60" y="10" width="30" height="30" fill="var(--accent)" />
                            <rect x="10" y="60" width="30" height="30" fill="var(--accent)" />
                            <path d="M45 10 h10 v10 h-10 z M45 25 h10 v10 h-10 z M60 45 h10 v10 h-10 z M45 45 h10 v10 h-10 z M10 45 h10 v10 h-10 z M25 45 h10 v10 h-10 z M75 60 h15 v15 h-15 z M60 75 h15 v15 h-15 z" fill="var(--accent)" />
                        </svg>
                        <p className="qr-caption">SCAN TO CONNECT LINEAGE</p>
                    </div>
                    <div className="legal-notes">
                        THIS DIGITAL ASSET IS A PROPERTY OF THE WATU.NETWORK AND REPRESENTS THE HOLDERS PERPETUAL PLACE IN THE ANCESTRAL VAULT.
                    </div>
                    <div className="back-footer">
                        EST. 2026 • GRACEFUL IDENTITY
                    </div>
                </div>

            </div>

            <style jsx>{`
                .card-scene {
                    width: 380px;
                    height: 240px;
                    perspective: 1000px;
                    cursor: pointer;
                    margin: 2rem auto;
                }
                .card-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }
                .card-container.is-flipped {
                    transform: rotateY(180deg);
                }
                .card-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(244, 114, 182, 0.15) 100%);
                    overflow: hidden;
                }
                .card-face::after {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        45deg,
                        transparent 45%,
                        rgba(255, 255, 255, 0.1) 48%,
                        rgba(255, 255, 255, 0.2) 50%,
                        rgba(255, 255, 255, 0.1) 52%,
                        transparent 55%
                    );
                    transform: rotate(45deg);
                    animation: shimmer 6s infinite;
                    pointer-events: none;
                }
                @keyframes shimmer {
                    0% { transform: translate(-30%, -30%) rotate(45deg); }
                    20%, 100% { transform: translate(30%, 30%) rotate(45deg); }
                }

                .card-back {
                    transform: rotateY(180deg);
                    background: linear-gradient(225deg, #1e1b4b 0%, #0c0a09 100%);
                    align-items: center;
                    text-align: center;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .watu-logo { font-size: 1.5rem; }
                .watu-text { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.2em; color: var(--accent); }
                
                .card-body {
                    display: flex;
                    gap: 1.25rem;
                    align-items: center;
                }
                .portrait-container {
                    position: relative;
                    width: 80px;
                    height: 100px;
                    border-radius: 12px;
                    overflow: hidden;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                }
                .portrait-container::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--accent);
                    box-shadow: 0 0 15px var(--accent);
                    z-index: 10;
                    animation: scan 3s ease-in-out infinite;
                    opacity: 0.5;
                }
                @keyframes scan {
                    0%, 100% { top: 0%; }
                    50% { top: 100%; }
                }

                .portrait-glow {
                    position: absolute;
                    inset: -5px;
                    background: linear-gradient(45deg, var(--accent), var(--accent-secondary));
                    opacity: 0.2;
                    filter: blur(8px);
                }
                .portrait-img { width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 1; }
                .portrait-placeholder {
                    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; color: var(--accent); font-weight: bold; position: relative; z-index: 1;
                }

                .identity-info { flex: 1; }
                .full-name { font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
                .heritage-badge { font-size: 0.65rem; font-weight: 700; color: var(--accent); opacity: 0.8; }
                
                .status-indicator {
                    display: flex; align-items: center; gap: 6px; font-size: 0.6rem; font-weight: 800; margin-top: 10px;
                    color: var(--text-secondary);
                }
                .status-dot { width: 6px; height: 6px; border-radius: 50%; }
                .status-dot.active { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
                .status-dot.deceased { background: #f472b6; box-shadow: 0 0 8px #f472b6; }

                .card-footer {
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 10px;
                }
                .id-label { font-size: 0.5rem; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.1em; }
                .id-code { font-size: 1.15rem; font-weight: 900; color: #fff; letter-spacing: 2px; }

                .chip {
                    position: absolute; top: 1.5rem; right: 1.5rem; width: 35px; height: 25px;
                    background: linear-gradient(135deg, #d4d4d8 0%, #71717a 100%);
                    border-radius: 6px; opacity: 0.4;
                }
                .hologram {
                    position: absolute; bottom: 1.5rem; right: 1.5rem; width: 40px; height: 40px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
                    border-radius: 50%; opacity: 0.5;
                }

                .back-header { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 1.5rem; }
                .qr-container { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 15px; }
                .qr-caption { font-size: 0.5rem; font-weight: 800; margin-top: 10px; color: var(--text-secondary); }
                .legal-notes { font-size: 0.45rem; padding: 1.5rem; line-height: 1.5; color: rgba(255,255,255,0.3); font-weight: 700; }
                .back-footer { font-size: 0.5rem; font-weight: 800; color: var(--accent-muted); }

                @media (max-width: 480px) {
                    .card-scene { width: 320px; height: 200px; }
                    .full-name { font-size: 1rem; }
                    .portrait-container { width: 60px; height: 80px; }
                }
            `}</style>
        </div>
    );
}

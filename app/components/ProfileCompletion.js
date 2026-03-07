'use client';
import { calculateCompleteness } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProfileCompletion() {
    const { data: session, status } = useSession();
    const [completeness, setCompleteness] = useState(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetch(`/api/tree?personId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.nodes && data.nodes.length > 0) {
                        const user = data.nodes.find(n => n.id === session.user.id);
                        if (user) {
                            const stats = calculateCompleteness(user);
                            setCompleteness(stats);
                        }
                    }
                })
                .catch(err => console.error("Completion check failed", err));
        }
    }, [session, status, pathname]);

    // Don't show on profile/onboard pages or when complete
    if (!completeness || completeness.percent >= 100) return null;
    if (pathname?.startsWith('/onboard') || pathname?.startsWith('/login') || pathname === '/profile') return null;

    const needsOnboarding = completeness.missing.some(m =>
        ['Given Name', 'Surname', 'Ancestral Tribe', 'Clan'].includes(m)
    );
    const actionLabel = needsOnboarding ? 'COMPLETE ONBOARDING' : 'UPDATE PROFILE PHOTO';
    const actionRoute = needsOnboarding ? '/onboard' : '/profile';

    return (
        <div className="completion-mini-module glass animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '0.05em' }}>VAULT COMPLETION</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff' }}>{completeness.percent}%</span>
            </div>

            <div className="progress-container">
                <div className="progress-fill" style={{ width: `${completeness.percent}%` }}></div>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '12px 0', lineHeight: '1.4' }}>
                YOUR HERITAGE RECORD IS INCOMPLETE. YOU CANNOT CONNECT RELATIVES UNTIL YOUR PROFILE REACHES 100%.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completeness.missing.slice(0, 2).map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#ef4444' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                        MISSING: {item.toUpperCase()}
                    </div>
                ))}
                {completeness.missing.length > 2 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '14px' }}>
                        + {completeness.missing.length - 2} MORE ITEMS
                    </div>
                )}
            </div>

            <button
                onClick={() => router.push(actionRoute)}
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '0.75rem' }}
            >
                {actionLabel}
            </button>

            <style jsx>{`
                .completion-mini-module {
                    position: fixed;
                    bottom: 100px;
                    right: 24px;
                    width: 280px;
                    padding: 1.25rem;
                    z-index: 999;
                    background: rgba(15, 23, 42, 0.95);
                    border: 1px solid var(--accent);
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(99, 102, 241, 0.2);
                    backdrop-filter: blur(20px);
                }
                .progress-container {
                    width: 100%;
                    height: 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 10px var(--accent);
                }
                .animate-slide-up {
                    animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 768px) {
                    .completion-mini-module {
                        bottom: 90px;
                        right: 12px;
                        left: 12px;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    );
}

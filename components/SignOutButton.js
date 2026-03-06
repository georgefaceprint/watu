'use client';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function SignOutButton({ mobile = false }) {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSignOut = async () => {
        // Clear all local session data
        localStorage.removeItem('watu_id');
        localStorage.removeItem('watu_session');
        sessionStorage.clear();

        // Redirect to login via next-auth
        await signOut({ callbackUrl: '/login' });
    };

    if (status !== 'authenticated') return null;

    if (mobile) {
        return (
            <button
                onClick={handleSignOut}
                style={{
                    textAlign: 'center',
                    flex: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: 0.6,
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: 0,
                }}
            >
                <span style={{ fontSize: '20px' }}>🚪</span>
                <span>Sign Out</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleSignOut}
            style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#f87171',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.18)';
                e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.08)';
                e.target.style.transform = 'translateY(0)';
            }}
        >
            Sign Out
        </button>
    );
}

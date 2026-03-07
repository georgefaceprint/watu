import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import PWAInstaller from '../components/PWAInstaller';
import ThemeSwitcher from '../components/ThemeSwitcher';
import AuthProvider from '../components/AuthProvider';
import SignOutButton from '../components/SignOutButton';
import ProfileCompletion from './components/ProfileCompletion';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const viewport = {
    themeColor: '#0f172a',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata = {
    title: 'Watu.Network - Trace Your Heritage',
    description: 'A global collaborative family tree tracing connections and heritage.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Watu'
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body>
                <AuthProvider>
                    <header style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(24px)',
                        borderBottom: '1px solid var(--border)',
                        padding: '0.75rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: '#fff',
                                fontSize: '18px'
                            }}>W</div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>Watu<span style={{ color: 'var(--accent)' }}>.Network</span></h2>

                            <ThemeSwitcher />
                        </div>

                        <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <a href="/" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Tree</a>
                            <a href="/connect" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Connect</a>
                            <a href="/events" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Events</a>
                            <a href="/profile" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>My Profile</a>
                            <a href="/onboard" style={{
                                background: 'var(--accent-muted)',
                                border: '1px solid var(--border)',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'var(--accent)',
                                textDecoration: 'none'
                            }}>Get Watu ID</a>
                            <SignOutButton />
                        </div>
                    </header>

                    <main style={{ paddingBottom: '80px' }}>
                        {children}
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <nav className="bottom-nav mobile-only">
                        <a href="/" style={{ textAlign: 'center', flex: 1, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.6 }}>
                            <span style={{ fontSize: '20px' }}>🌳</span>
                            <span>Tree</span>
                        </a>
                        <a href="/connect" style={{ textAlign: 'center', flex: 1, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.6 }}>
                            <span style={{ fontSize: '20px' }}>🔍</span>
                            <span>Connect</span>
                        </a>
                        <a href="/events" style={{ textAlign: 'center', flex: 1, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.6 }}>
                            <span style={{ fontSize: '20px' }}>📅</span>
                            <span>Events</span>
                        </a>
                        <a href="/profile" style={{ textAlign: 'center', flex: 1, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.6 }}>
                            <span style={{ fontSize: '20px' }}>👤</span>
                            <span>Profile</span>
                        </a>
                        <SignOutButton mobile={true} />
                    </nav>

                    <PWAInstaller />
                    <ProfileCompletion />

                    <style dangerouslySetInnerHTML={{
                        __html: `
                    @media (min-width: 768px) {
                        .mobile-only { display: none !important; }
                    }
                    @media (max-width: 767px) {
                        .desktop-only { display: none !important; }
                    }
                `}} />

                </AuthProvider>
            </body>
        </html>
    );
}

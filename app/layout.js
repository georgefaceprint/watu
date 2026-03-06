import './globals.css';
import PWAInstaller from '../components/PWAInstaller';
import AuthProvider from '../components/AuthProvider';
import SignOutButton from '../components/SignOutButton';

export const viewport = {
    themeColor: '#f8fafc',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata = {
    title: 'Watu.Network - Trace Your Heritage',
    description: 'A global collaborative family tree tracing connections and heritage.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
            </head>
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
                        </div>

                        <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <a href="/" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Tree</a>
                            <a href="/connect" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Connect</a>
                            <a href="/events" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>Events</a>
                            <a href="/profile" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>My Profile</a>
                            <a href="https://myhazina.org" target="_blank" style={{
                                background: 'var(--accent-muted)',
                                border: '1px solid var(--border)',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'var(--accent)',
                                textDecoration: 'none'
                            }}>MyHazina</a>
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

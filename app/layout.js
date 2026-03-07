import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import PWAInstaller from '../components/PWAInstaller';
import ThemeSwitcher from '../components/ThemeSwitcher';
import AuthProvider from '../components/AuthProvider';
import SignOutButton from '../components/SignOutButton';
import ProfileCompletion from './components/ProfileCompletion';
import AppShell from './components/AppShell';

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
                    <AppShell>{children}</AppShell>
                    <PWAInstaller />
                </AuthProvider>
            </body>
        </html>
    );
}

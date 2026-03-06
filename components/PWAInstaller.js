'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [swRegistration, setSwRegistration] = useState(null);

    useEffect(() => {
        // Install Prompt Logic
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Update Notification Logic
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available; please refresh.
                                setSwRegistration(registration);
                                setShowUpdatePrompt(true);
                            }
                        });
                    }
                });
            });

            // Also check if there's already a waiting SW
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration && registration.waiting) {
                    setSwRegistration(registration);
                    setShowUpdatePrompt(true);
                }
            });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleUpdate = () => {
        if (swRegistration && swRegistration.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setShowUpdatePrompt(false);
        // Reload a bit later to ensure skip waiting took effect
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <>
            {showInstallPrompt && (
                <div style={styles.banner}>
                    <div>
                        <p style={styles.text}>Install Watu.Network App for a better mobile experience!</p>
                    </div>
                    <div style={styles.buttons}>
                        <button style={styles.button} onClick={handleInstall}>Install</button>
                        <button style={{ ...styles.button, background: 'transparent', color: 'white', border: '1px solid white' }} onClick={() => setShowInstallPrompt(false)}>Later</button>
                    </div>
                </div>
            )}

            {showUpdatePrompt && (
                <div style={styles.banner}>
                    <div>
                        <p style={styles.text}>A new version of Watu.Network is available!</p>
                    </div>
                    <div style={styles.buttons}>
                        <button style={{ ...styles.button, backgroundColor: '#2e7d32' }} onClick={handleUpdate}>Update Now</button>
                        <button style={{ ...styles.button, background: 'transparent', color: 'white', border: '1px solid white' }} onClick={() => setShowUpdatePrompt(false)}>Later</button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    banner: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1f2937',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        width: '90%',
        maxWidth: '400px',
        fontFamily: 'var(--font-inter), sans-serif',
    },
    text: {
        margin: 0,
        fontSize: '15px',
        textAlign: 'center',
        fontWeight: '500',
    },
    buttons: {
        display: 'flex',
        gap: '12px',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: '10px 16px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
    }
};

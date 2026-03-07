'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState('royal');

    useEffect(() => {
        const storedTheme = localStorage.getItem('watu_theme') || 'royal';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme === 'royal' ? '' : storedTheme);
    }, []);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('watu_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme === 'royal' ? '' : newTheme);
    };

    return (
        <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
            <div onClick={() => toggleTheme('royal')} title="Heritage Royal" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', cursor: 'pointer', border: theme === 'royal' ? '2px solid #000' : 'none' }} />
            <div onClick={() => toggleTheme('sahara')} title="Sahara Earth" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d97706', cursor: 'pointer', border: theme === 'sahara' ? '2px solid #000' : 'none' }} />
            <div onClick={() => toggleTheme('coastal')} title="Coastal Breeze" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0ea5e9', cursor: 'pointer', border: theme === 'coastal' ? '2px solid #000' : 'none' }} />
            <div onClick={() => toggleTheme('modern')} title="Modern Minimal" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', cursor: 'pointer', border: theme === 'modern' ? '2px solid #000' : 'none' }} />
        </div>
    );
}

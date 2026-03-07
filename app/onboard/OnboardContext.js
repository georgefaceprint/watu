'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const OnboardContext = createContext();

export function OnboardProvider({ children }) {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        sex: '',
        email: '',
        phoneCode: '+254',
        phoneNumber: '',
        tribe: '',
        subTribe: '',
        clan: '',
        birthPlace: '',
        birthOrder: '',
        profession: '',
        securityQuestion: ''
    });

    const [registry, setRegistry] = useState([]);
    const [loading, setLoading] = useState(false);
    const [watuId, setWatuId] = useState(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user && !formData.name) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name?.split(' ')[0] === 'NEW' ? '' : (session.user.name?.split(' ')[0] || ''),
                surname: session.user.name?.split(' ').slice(1).join(' ') || '',
                email: session.user.email || '',
                phoneNumber: session.user.phone || ''
            }));
        }
    }, [status, session]);

    useEffect(() => {
        fetch('/api/clans/registry')
            .then(res => res.json())
            .then(setRegistry)
            .catch(console.error);
    }, []);

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    return (
        <OnboardContext.Provider value={{
            formData, updateFormData,
            registry, setRegistry,
            loading, setLoading,
            watuId, setWatuId
        }}>
            {children}
        </OnboardContext.Provider>
    );
}

export const useOnboard = () => useContext(OnboardContext);

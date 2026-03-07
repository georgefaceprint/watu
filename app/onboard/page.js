'use client';
import { useOnboard } from './OnboardContext';
import { useRouter } from 'next/navigation';

export default function Step1Page() {
    const { formData, updateFormData } = useOnboard();
    const router = useRouter();

    const handleNext = () => {
        if (!formData.name || !formData.surname || !formData.sex) {
            alert("CORE IDENTITY FIELDS REQUIRED");
            return;
        }
        router.push('/onboard/step-2');
    };

    return (
        <div className="step-page animate-fade-in">
            <header className="onboard-header">
                <h1>CORE IDENTITY</h1>
                <p className="sub">STEP 1: ESTABLISH BIOLOGICAL ORIGIN</p>
            </header>

            <div className="input-stack">
                <div className="field-item">
                    <label>BIOLOGICAL SEX</label>
                    <div className="sex-selector">
                        <button
                            onClick={() => updateFormData({ sex: 'male' })}
                            className={`sex-btn ${formData.sex === 'male' ? 'active' : ''}`}
                        >MALE</button>
                        <button
                            onClick={() => updateFormData({ sex: 'female' })}
                            className={`sex-btn ${formData.sex === 'female' ? 'active' : ''}`}
                        >FEMALE</button>
                    </div>
                </div>

                <div className="field-item">
                    <label>GIVEN NAME</label>
                    <input
                        className="luminous-input"
                        placeholder="FIRST NAME"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className="field-item">
                    <label>FAMILY SURNAME</label>
                    <input
                        className="luminous-input"
                        placeholder="SURNAME"
                        value={formData.surname}
                        onChange={(e) => updateFormData({ surname: e.target.value })}
                    />
                </div>
            </div>

            <div className="nav-actions">
                <button onClick={handleNext} className="btn-onboard-next">CONTINUE TO HERITAGE</button>
            </div>
        </div>
    );
}

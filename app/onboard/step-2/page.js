'use client';
import { useOnboard } from '../OnboardContext';
import { useRouter } from 'next/navigation';

export default function Step2Page() {
    const { formData, updateFormData, registry } = useOnboard();
    const router = useRouter();

    const handleNext = () => {
        if (!formData.tribe || !formData.clan) {
            alert("HERITAGE FIELDS REQUIRED");
            return;
        }
        router.push('/onboard/step-3');
    };

    const selectedTribeData = registry.find(t => t.name === formData.tribe);

    return (
        <div className="step-page animate-fade-in">
            <header className="onboard-header">
                <h1>ANCESTRAL ROOTS</h1>
                <p className="sub">STEP 2: MAP YOUR HERITAGE BRANCH</p>
            </header>

            <div className="input-stack">
                <div className="field-item">
                    <label>ANCESTRAL TRIBE</label>
                    <select
                        className="luminous-select"
                        value={formData.tribe}
                        onChange={(e) => updateFormData({ tribe: e.target.value })}
                    >
                        <option value="">SELECT TRIBE</option>
                        {registry.map(t => <option key={t.name} value={t.name}>{t.name.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="field-item">
                    <label>SUB-TRIBE / GROUP</label>
                    <select
                        className="luminous-select"
                        value={formData.subTribe}
                        onChange={(e) => updateFormData({ subTribe: e.target.value })}
                        disabled={!formData.tribe}
                    >
                        <option value="">SELECT SUB-TRIBE</option>
                        {selectedTribeData?.subGroups.map(sg => <option key={sg} value={sg}>{sg.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="field-item">
                    <label>ANCESTRAL CLAN</label>
                    <input
                        className="luminous-input"
                        placeholder="ENTER CLAN NAME"
                        value={formData.clan}
                        onChange={(e) => updateFormData({ clan: e.target.value })}
                    />
                </div>
            </div>

            <div className="nav-actions">
                <button onClick={() => router.push('/onboard')} className="btn-onboard-back">BACK</button>
                <button onClick={handleNext} className="btn-onboard-next">VAULT SECURITY</button>
            </div>
        </div>
    );
}

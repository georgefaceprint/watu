'use client';
import { useOnboard } from '../OnboardContext';
import { useRouter } from 'next/navigation';

export default function Step3Page() {
    const { formData, updateFormData, loading, setLoading, setWatuId } = useOnboard();
    const router = useRouter();

    const securityQuestions = [
        'What was the name of your first pet?',
        'In what city were you born?',
        'What is your mother\'s maiden name?',
        'What was the name of your first school?',
        'What is your favorite ancestral dish?'
    ];

    const handleSubmit = async () => {
        if (!formData.securityQuestion) {
            alert("RECOVERY QUESTION REQUIRED");
            return;
        }
        if (!formData.birthYear || formData.birthYear.length !== 4) {
            alert("ENTER A VALID 4-DIGIT BIRTH YEAR");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setWatuId(data.id);
            router.push('/onboard/success');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="step-page animate-fade-in">
            <header className="onboard-header">
                <h1>VAULT SECURITY</h1>
                <p className="sub">STEP 3: SECURE YOUR HERITAGE ACCESS</p>
            </header>

            <div className="input-stack">
                <div className="field-item">
                    <label>RECOVERY QUESTION</label>
                    <select
                        className="luminous-select"
                        value={formData.securityQuestion}
                        onChange={(e) => updateFormData({ securityQuestion: e.target.value })}
                    >
                        <option value="">SELECT A QUESTION</option>
                        {securityQuestions.map(q => <option key={q} value={q}>{q.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="field-item">
                    <label>YEAR OF BIRTH</label>
                    <input
                        className="luminous-input"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="e.g. 1985"
                        value={formData.birthYear || ''}
                        onChange={(e) => updateFormData({ birthYear: e.target.value })}
                    />
                </div>

                <div className="field-item">
                    <label>ANCESTRAL PROFESSION</label>
                    <input
                        className="luminous-input"
                        placeholder="e.g. SYSTEM ARCHITECT"
                        value={formData.profession}
                        onChange={(e) => updateFormData({ profession: e.target.value })}
                    />
                </div>

                <div className="field-item">
                    <label>RECOVERY EMAIL (OPTIONAL)</label>
                    <input
                        className="luminous-input"
                        placeholder="CONTACT@WATU.NETWORK"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                    />
                </div>
            </div>

            <div className="nav-actions">
                <button onClick={() => router.push('/onboard/step-2')} className="btn-onboard-back">BACK</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-onboard-next">
                    {loading ? 'SECURING...' : 'FINISH IDENTITY'}
                </button>
            </div>
        </div>
    );
}

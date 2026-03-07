export function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function calculateCompleteness(person) {
    if (!person) return { percent: 0, missing: [] };

    const weights = [
        { field: 'photo', label: 'Profile Photo', weight: 20 },
        { field: 'name', label: 'Given Name', weight: 10 },
        { field: 'surname', label: 'Surname', weight: 10 },
        { field: 'tribe', label: 'Ancestral Tribe', weight: 15 },
        { field: 'clan', label: 'Clan', weight: 10 },
        { field: 'birthYear', label: 'Year of Birth', weight: 10 },
        { field: 'phone', label: 'Phone Number', weight: 10 },
        { field: 'securityQuestion', label: 'Security Question', weight: 10 },
        { field: 'profession', label: 'Profession', weight: 5 },
    ];

    let score = 0;
    const missing = [];

    weights.forEach(w => {
        const val = person[w.field];
        const filled = val && val !== '' && val !== null && val !== 'NEW';
        if (filled) {
            score += w.weight;
        } else {
            missing.push(w.label);
        }
    });

    return {
        percent: Math.min(score, 100),
        missing,
        isComplete: score >= 100
    };
}

export function calculateAge(dobString) {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

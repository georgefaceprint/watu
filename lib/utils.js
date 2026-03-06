export function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function calculateCompleteness(person) {
    if (!person) return { percent: 0, missing: [] };

    const weights = [
        { field: 'photo', label: 'Profile Portrait', weight: 25 },
        { field: 'dob', label: 'Date of Birth', weight: 15 },
        { field: 'birthPlace', label: 'Place of Birth', weight: 10 },
        { field: 'subTribe', label: 'Sub-tribe / Group', weight: 10 },
        { field: 'clan', label: 'Clan', weight: 10 },
        { field: 'birthOrder', label: 'Birth Position', weight: 10 },
        { field: 'phoneNumber', label: 'Phone Number', weight: 10 },
        { field: 'securityQuestion', label: 'Security Question', weight: 10 },
    ];

    let score = 0;
    const missing = [];

    weights.forEach(w => {
        if (person[w.field] && person[w.field] !== '' && person[w.field] !== null) {
            score += w.weight;
        } else {
            missing.push(w.label);
        }
    });

    return {
        percent: score,
        missing: missing,
        isComplete: score === 100
    };
}

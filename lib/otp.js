// Shared OTP storage for in-memory (dev) or Redis (prod)
// Currently in-memory for simplicity. Restarting the server clears active OTPs.
const otpStore = new Map(); // { phone: { code, expires } }

export function setOTP(phone, code, ttlMinutes = 10) {
    const expires = Date.now() + ttlMinutes * 60 * 1000;
    otpStore.set(phone, { code, expires });
}

export function verifyOTP(phone, code) {
    const stored = otpStore.get(phone);
    if (!stored) return { error: 'No OTP found. Request a new one.' };
    if (Date.now() > stored.expires) {
        otpStore.delete(phone);
        return { error: 'OTP expired.' };
    }
    if (stored.code !== code) return { error: 'Incorrect OTP.' };

    otpStore.delete(phone);
    return { success: true };
}

export function generateOTPHelper(digits = 5) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

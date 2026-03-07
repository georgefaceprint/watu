import { setOTP, generateOTPHelper } from '@/lib/otp';

// POST /api/auth/phone — Send OTP
export async function POST(request) {
    const { phone } = await request.json();

    if (!phone) {
        return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // ─── SEND MODE ───
    const otp = generateOTPHelper(5); // 5 digits as requested
    setOTP(phone, otp, 10); // 10 minutes

    // Try sending via Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
        try {
            const twilio = require('twilio');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Your Watu.Network identity code: ${otp}. Valid for 10 minutes. Do not share.`,
                from: process.env.TWILIO_PHONE,
                to: phone,
            });
        } catch (err) {
            console.error('Twilio SMS Error:', err.message);
        }
    } else {
        // Development mode — log OTP to console
        console.log(`\n🔐 [WATU DEV OTP] Phone: ${phone} → Code: ${otp}\n`);
    }

    return Response.json({
        success: true,
        message: 'OTP sent',
        ...((!process.env.TWILIO_ACCOUNT_SID) && { devOtp: otp })
    });
}

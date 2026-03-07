import { setOTP, generateOTPHelper } from '@/lib/otp';
import { executeQuery } from '@/lib/neo4j';

// POST /api/auth/phone — Check User & Send Verification if New
export async function POST(request) {
    const { phone } = await request.json();

    if (!phone) {
        return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Check if user exists in the heritage vault
    const result = await executeQuery(
        `MATCH (p:Person) WHERE p.phone = $phone RETURN p.id as id, p.accessCodeHash as hash LIMIT 1`,
        { phone }
    );

    const exists = result && result.length > 0;
    const hasPin = exists && !!result[0].get('hash');

    let response = { success: true, exists: hasPin };

    // 2. If it's a NEW user (no PIN set), send a verification code
    if (!hasPin) {
        const otp = generateOTPHelper(5);
        setOTP(phone, otp, 10); // 10 minutes

        // Try sending via Twilio
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Your Watu.Network verification code: ${otp}.`,
                    from: process.env.TWILIO_PHONE,
                    to: phone,
                });
            } catch (err) {
                console.error('Twilio SMS Error:', err.message);
            }
        } else {
            console.log(`\n🔐 [WATU VERIFICATION] Phone: ${phone} → Code: ${otp}\n`);
            response.devOtp = otp;
        }
    }

    return Response.json(response);
}

// Phone OTP API — Send and Verify One-Time Passcodes
// Stores OTPs in-memory with expiry (for production, use Redis or Neo4j)

const otpStore = new Map(); // { phone: { code, expires } }

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/phone — Send OTP
export async function POST(request) {
    const { phone, code } = await request.json();

    if (!phone) {
        return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // ─── VERIFY MODE ───
    if (code) {
        const stored = otpStore.get(phone);
        if (!stored) {
            return Response.json({ error: 'No OTP found for this number. Please request a new one.' }, { status: 400 });
        }
        if (Date.now() > stored.expires) {
            otpStore.delete(phone);
            return Response.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }
        if (stored.code !== code) {
            return Response.json({ error: 'Incorrect OTP. Please try again.' }, { status: 401 });
        }

        // OTP is valid — look up or create user in Neo4j
        otpStore.delete(phone);
        const { executeQuery } = await import('@/lib/neo4j');
        const { generateUniqueId } = await import('@/lib/utils');

        const result = await executeQuery(
            `MATCH (p:Person {phone: $phone}) RETURN p.id as id, p.name as name LIMIT 1`,
            { phone }
        );

        let userId, userName;
        if (result && result.length > 0) {
            userId = result[0].get('id');
            userName = result[0].get('name');
        } else {
            // New user — create stub profile
            userId = generateUniqueId();
            userName = 'NEW';
            await executeQuery(
                `CREATE (p:Person {
                    id: $id,
                    name: 'NEW',
                    surname: '',
                    phone: $phone,
                    isCitizen: true,
                    isDeceased: false,
                    provider: 'phone',
                    createdAt: datetime()
                })`,
                { id: userId, phone }
            );
        }

        return Response.json({ success: true, userId, userName, phone });
    }

    // ─── SEND MODE ───
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(phone, { code: otp, expires });

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
            // Don't fail — return OTP in dev mode
        }
    } else {
        // Development mode — log OTP to console
        console.log(`\n🔐 [WATU DEV OTP] Phone: ${phone} → Code: ${otp}\n`);
    }

    return Response.json({
        success: true,
        message: 'OTP sent',
        // Only send OTP back in development (no Twilio configured)
        ...((!process.env.TWILIO_ACCOUNT_SID) && { devOtp: otp })
    });
}

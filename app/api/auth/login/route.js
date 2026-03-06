import { executeQuery } from '@/lib/neo4j';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'watu_network_secret_key_123');

export async function POST(request) {
    try {
        const { id, password } = await request.json();

        if (!id || !password) {
            return Response.json({ error: 'ID and Password are required' }, { status: 400 });
        }

        // Match by Watu ID, email, OR phone number
        const lookupId = id.trim().toUpperCase();
        const query = `
            MATCH (p:Person)
            WHERE p.id = $lookupId
               OR toLower(p.email) = toLower($raw)
               OR p.phone = $raw
            RETURN p { .id, .name, .surname, .email, .phone, .passwordHash } as user
            LIMIT 1
        `;

        const records = await executeQuery(query, { lookupId, raw: id.trim() });

        if (records.length === 0) {
            return Response.json({ error: 'No account found with that ID, email, or phone.' }, { status: 401 });
        }

        const user = records[0].get('user');

        if (!user.passwordHash) {
            return Response.json({ error: 'Account not secured. Use forgot password to restore access.' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return Response.json({ error: 'Incorrect password. Try again or use forgot identity.' }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({ id: user.id, name: user.name })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(SECRET);

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('watu_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return Response.json({
            success: true,
            user: { id: user.id, name: user.name, surname: user.surname }
        });
    } catch (err) {
        console.error('Login Error:', err);
        return Response.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

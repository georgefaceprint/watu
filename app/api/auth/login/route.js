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

        const query = `
            MATCH (p:Person {id: $id})
            RETURN p { .id, .name, .surname, .passwordHash } as user
        `;

        const records = await executeQuery(query, { id });

        if (records.length === 0) {
            return Response.json({ error: 'Invalid Identity Key' }, { status: 401 });
        }

        const user = records[0].get('user');

        if (!user.passwordHash) {
            return Response.json({ error: 'Account not secured. Please contact support.' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return Response.json({ error: 'Invalid Password' }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({ id: user.id, name: user.name })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(SECRET);

        // Set Cookie
        cookies().set('watu_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return Response.json({ success: true, user: { id: user.id, name: user.name, surname: user.surname } });
    } catch (err) {
        console.error('Login Error:', err);
        return Response.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

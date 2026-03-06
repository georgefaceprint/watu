import { executeQuery } from '@/lib/neo4j';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// RESET Password with Token
export async function POST(request) {
    const { id, token, password } = await request.json();

    try {
        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Watu_Secret_2026');
        if (decoded.id !== id || decoded.type !== 'reset') {
            throw new Error('RECOVERY TOKEN EXPIRED OR INVALID');
        }

        // Hash New Password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update in DB
        const query = `
            MATCH (p {id: $id}) 
            SET p.passwordHash = $passwordHash 
            RETURN p.id as id
        `;
        const result = await executeQuery(query, { id, passwordHash });

        if (result && result.length > 0) {
            return Response.json({ success: true, message: 'IDENTITY CREDENTIALS UPDATED' });
        }
        throw new Error('FAILED TO UPDATE RECOVERY VAULT');

    } catch (err) {
        console.error('Password Reset Error:', err);
        return Response.json({ error: err.message }, { status: 400 });
    }
}

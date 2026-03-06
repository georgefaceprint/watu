import { executeQuery } from '@/lib/neo4j';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// GET Recovery Question
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.toUpperCase();

    if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

    try {
        const query = `MATCH (p:Person {id: $id}) RETURN p.securityQuestion as question`;
        const result = await executeQuery(query, { id });

        if (result && result.length > 0) {
            const questionText = result[0].get('question');
            const questions = {
                mother: "WHAT IS YOUR MOTHER'S MAIDEN NAME?",
                village: "WHAT IS THE NAME OF YOUR ANCESTRAL VILLAGE?",
                pet: "WHAT WAS YOUR FIRST PET'S NAME?",
                school: "WHAT SCHOOL DID YOUR FATHER ATTEND?"
            };
            return Response.json({ question: questions[questionText] || questionText });
        }
        return Response.json({ error: 'ID NOT FOUND IN ANCESTRAL VAULT' }, { status: 404 });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

// POST Verify Answer
export async function POST(request) {
    const { id, answer } = await request.json();

    try {
        const query = `MATCH (p:Person {id: $id}) RETURN p.securityAnswerHash as hash`;
        const result = await executeQuery(query, { id });

        if (result && result.length > 0) {
            const hash = result[0].get('hash');
            if (hash && await bcrypt.compare(answer.toLowerCase().trim(), hash)) {
                // Generate a temporary reset token
                const token = jwt.sign({ id, type: 'reset' }, process.env.JWT_SECRET || 'Watu_Secret_2026', { expiresIn: '15m' });
                return Response.json({ token });
            }
            return Response.json({ error: 'SECRET ANSWER DOES NOT MATCH OUR RECORDS' }, { status: 401 });
        }
        return Response.json({ error: 'IDENTITY CORRUPTED OR NOT FOUND' }, { status: 404 });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

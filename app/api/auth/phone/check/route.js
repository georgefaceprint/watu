import { executeQuery } from '@/lib/neo4j';

export async function POST(request) {
    const { phone } = await request.json();
    if (!phone) return Response.json({ error: 'Phone required' }, { status: 400 });

    const result = await executeQuery(
        `MATCH (p:Person) WHERE p.phone = $phone RETURN p.id LIMIT 1`,
        { phone }
    );

    return Response.json({ exists: result.length > 0 });
}

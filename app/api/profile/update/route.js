import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    try {
        const body = await request.json();
        const { id, ...fields } = body;

        if (!session || (session.user.id !== id && session.user.watuId !== id)) {
            return Response.json({ error: 'Unauthorized profile update attempt' }, { status: 401 });
        }

        // Build dynamic SET clause to avoid overwriting fields with undefined/null if they weren't sent
        // But for simplicity in this MVP, we'll map the common ones.
        const query = `
            MATCH (p:Person {id: $id})
            SET p += $fields,
                p.updatedAt = datetime()
            RETURN p
        `;

        const result = await executeQuery(query, { id, fields });

        if (result.length === 0) {
            return Response.json({ error: 'Person not found' }, { status: 404 });
        }

        return Response.json({ success: true, person: result[0].get('p').properties });
    } catch (err) {
        console.error('Profile Update API Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

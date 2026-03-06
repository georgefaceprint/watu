import { executeQuery } from '@/lib/neo4j';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'watu_network_secret_key_123');

export async function POST(request) {
    try {
        const { eventId } = await request.json();
        const cookieStore = cookies();
        const tokenToken = cookieStore.get('watu_session');

        if (!tokenToken) {
            return Response.json({ error: 'Please log in to RSVP' }, { status: 401 });
        }

        const { payload } = await jwtVerify(tokenToken.value, SECRET);
        const userId = payload.id;

        if (!eventId) {
            return Response.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const query = `
            MATCH (p:Person {id: $userId})
            MERGE (e:Event {id: $eventId})
            MERGE (p)-[r:RSVPD_TO {at: datetime()}]->(e)
            WITH e
            MATCH ()-[r:RSVPD_TO]->(e)
            RETURN count(r) as attendeeCount
        `;

        const records = await executeQuery(query, { userId, eventId });
        const attendeeCount = records[0].get('attendeeCount').low;

        return Response.json({ success: true, attendeeCount });
    } catch (err) {
        console.error('RSVP Error:', err);
        return Response.json({ error: 'Failed to record RSVP' }, { status: 500 });
    }
}

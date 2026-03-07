import { executeQuery } from '@/lib/neo4j';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.watuId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watuId = session.user.watuId;

    try {
        // Fetch user tribe and clan
        const userQuery = `MATCH (p:Person {id: $watuId}) RETURN p.tribe as tribe, p.clan as clan, p.name as name`;
        const userResult = await executeQuery(userQuery, { watuId });

        if (userResult.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const { tribe, clan, name } = userResult[0].toObject();

        // Standard groups every user gets
        const groups = [
            {
                id: 'global',
                name: 'Watu.Network Global',
                type: 'SYSTEM',
                members: '10k+',
                lastMessage: 'Welcome to the heritage network!',
                time: 'Just now',
                unread: 1
            }
        ];

        if (tribe) {
            groups.push({
                id: `tribe-${tribe.toLowerCase().replace(/\s+/g, '-')}`,
                name: `${tribe} Nation Heritage`,
                type: 'CLAN',
                members: 'Adults & Elders',
                lastMessage: `Latest updates for the ${tribe} community.`,
                time: 'Live',
                unread: 0
            });
        }

        if (clan) {
            groups.push({
                id: `clan-${clan.toLowerCase().replace(/\s+/g, '-')}`,
                name: `${clan} Clan Archive`,
                type: 'CLAN',
                members: 'Verified Kin',
                lastMessage: `Discussion for members of the ${clan} clan.`,
                time: 'Yesterday',
                unread: 0
            });
        }

        return Response.json(groups);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

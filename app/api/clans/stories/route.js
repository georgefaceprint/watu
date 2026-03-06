import { executeQuery } from '@/lib/neo4j';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clanId = searchParams.get('clanId');

    if (!clanId) {
        return Response.json({ error: 'Clan ID is required' }, { status: 400 });
    }

    const query = `
        MATCH (c:Clan {id: $clanId})<-[:BELONGS_TO]-(p:Person)-[:POSTED]->(s:Story)
        RETURN s { .title, .content, .author: p.name, .createdAt: toString(s.createdAt) } as story
        ORDER BY s.createdAt DESC
    `;

    try {
        const records = await executeQuery(query, { clanId });
        const stories = records.map(r => r.get('story'));

        // Mock data if no stories exist yet to show expansion
        if (stories.length === 0) {
            return Response.json([
                {
                    title: "THE GREAT MIGRATION OF 1942",
                    content: "OUR GRANDFATHER NELSON LED THE CLAN ACROSS THE RIFT VALLEY DURING THE GREAT DROUGHT. HIS BRAVERY ENSURED OUR SURVIVAL AND ESTABLISHED THE ROOTS WE HOLD DEAR TODAY.",
                    author: "JAMES SIFUNA",
                    createdAt: "2026-01-15"
                },
                {
                    title: "THE LEGEND OF THE WHITE PEAK",
                    content: "STORIES PASSED DOWN THROUGH GENERATIONS SPEAK OF A SACRED WELL AT THE FOOT OF THE MOUNTAIN WHERE OUR FIRST ANCESTORS GATHERED. THIS STORY IS TOLD TO EVERY CHILD AT MATURITY.",
                    author: "SARAH AMANI",
                    createdAt: "2025-11-20"
                }
            ]);
        }

        return Response.json(stories);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    const { clanId, personId, title, content } = await request.json();

    if (!clanId || !personId || !title || !content) {
        return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const query = `
        MATCH (c:Clan {id: $clanId})
        MATCH (p:Person {id: $personId})
        CREATE (s:Story {
            title: $title,
            content: $content,
            createdAt: datetime()
        })
        CREATE (p)-[:POSTED]->(s)
        CREATE (s)-[:ABOUT_CLAN]->(c)
        RETURN s
    `;

    try {
        await executeQuery(query, { clanId, personId, title, content });
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

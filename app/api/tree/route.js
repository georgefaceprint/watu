import { executeQuery } from '@/lib/neo4j';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId')?.toUpperCase();

    if (!personId) {
        return Response.json({ error: 'Person ID is required' }, { status: 400 });
    }

    /* 
       This query fetches the user and their connections (Parent/Child/Sibling/Spouse) 
       up to 3 levels deep to build a comprehensive family subtree.
    */
    const query = `
        MATCH (p:Person {id: $personId})
        CALL apoc.path.subgraphAll(p, {
            relationshipFilter: 'CHILD_OF>|CHILD_OF<|PARENT_OF>|PARENT_OF<|SIBLING_OF|SPOUSE_OF|GRANDPARENT_OF|GRANDCHILD_OF|COUSIN_OF',
            minLevel: 0,
            maxLevel: 5
        })
        YIELD nodes, relationships
        RETURN 
            [n in nodes | n { 
                .id, 
                .name, 
                .surname, 
                .thirdName,
                .fourthName,
                .maidenName,
                .tribe, 
                .subTribe,
                .clan, 
                .sex,
                .dob,
                .birthOrder,
                .birthPlace,
                .phoneNumber,
                .phoneCode,
                .securityQuestion,
                .photo,
                .isDeceased, 
                .deathYear,
                .deathMonth,
                type: 'person' 
            }] as persons,
            [r in relationships | { 
                source: startNode(r).id, 
                target: endNode(r).id, 
                type: type(r) 
            }] as connections
    `;

    try {
        const records = await executeQuery(query, { personId });

        if (records.length === 0) {
            // Fallback for new users with no connections yet
            const userRecords = await executeQuery(`MATCH (p:Person {id: $personId}) RETURN p`, { personId: personId });
            if (userRecords.length > 0) {
                const user = userRecords[0].get('p').properties;
                return Response.json({
                    nodes: [{ ...user, type: 'person' }],
                    links: []
                });
            }
            return Response.json({ error: 'Person not found' }, { status: 404 });
        }

        const data = {
            nodes: records[0].get('persons'),
            links: records[0].get('connections')
        };

        return Response.json(data);
    } catch (err) {
        console.error('Tree Fetch Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

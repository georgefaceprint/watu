import { executeQuery } from '@/lib/neo4j';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const surname = searchParams.get('surname');
    const tribe = searchParams.get('tribe');
    const clan = searchParams.get('clan');
    const uniqueId = searchParams.get('uniqueId');

    let query = `MATCH (p:Person) WHERE 1=1 `;
    const params = {};

    if (uniqueId) {
        query += `AND p.id = $uniqueId `;
        params.uniqueId = uniqueId;
    } else {
        if (name) {
            query += `AND p.name CONTAINS $name `;
            params.name = name;
        }
        if (surname) {
            query += `AND p.surname CONTAINS $surname `;
            params.surname = surname;
        }
        if (tribe) {
            query += `AND p.tribe = $tribe `;
            params.tribe = tribe;
        }
        if (clan) {
            query += `AND p.clan CONTAINS $clan `;
            params.clan = clan;
        }
    }

    query += `RETURN p { .id, .name, .surname, .tribe, .clan, .birthPlace, .isDeceased, .deathYear, .deathMonth } as person LIMIT 10`;

    try {
        const records = await executeQuery(query, params);
        const results = records.map(r => r.get('person'));
        return Response.json(results);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    const { personId, relativeId, relationship, action, details } = await request.json();

    // Action handling for Approvals (Delegated Administration)
    if (action === 'VERIFY') {
        const query = `
            MATCH (p1:Person)-[r]->(p2:Person)
            WHERE id(r) = $relationshipId
            SET r.status = 'VERIFIED', r.verifiedAt = datetime()
            RETURN p1.name as from, type(r) as rel, p2.name as to
        `;
        try {
            const records = await executeQuery(query, { relationshipId: parseInt(relativeId) });
            return Response.json({ success: true, message: 'Relationship verified' });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        }
    }

    // Action handling for Manual Additions
    if (action === 'MANUAL_ADD') {
        const { generateUniqueId } = await import('@/lib/utils');
        const newId = generateUniqueId();

        const query = `
            MATCH (p1:Person {id: $personId})
            CREATE (p2:Person {
                id: $newId,
                name: $name,
                surname: $surname,
                thirdName: $thirdName,
                fourthName: $fourthName,
                sex: $sex,
                maidenName: $maidenName,
                isDeceased: $isDeceased,
                deathYear: $deathYear,
                deathMonth: $deathMonth,
                isCitizen: false,
                createdAt: datetime()
            })
            MERGE (p1)-[r:${relationship}]->(p2)
            SET r.status = 'VERIFIED', r.requestedAt = datetime(), r.verifiedAt = datetime()
            RETURN p1.name as from, p2.id as newId, p2.name as to
        `;

        try {
            const records = await executeQuery(query, {
                personId,
                newId,
                name: details.name,
                surname: details.surname,
                thirdName: details.thirdName || '',
                fourthName: details.fourthName || '',
                sex: details.sex,
                maidenName: details.maidenName || '',
                isDeceased: !!details.isDeceased,
                deathYear: details.deathYear || '',
                deathMonth: details.deathMonth || ''
            });

            if (records.length === 0) {
                return Response.json({ error: `The ID you are acting as (${personId}) was not found in our records.` }, { status: 404 });
            }

            return Response.json({ success: true, id: newId, message: 'RELATIVE ADDED & CONNECTED' });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        }
    }

    const allowedRelationships = ['SIBLING_OF', 'PARENT_OF', 'SPOUSE_OF', 'CHILD_OF'];
    if (!allowedRelationships.includes(relationship)) {
        return Response.json({ error: 'Invalid relationship type' }, { status: 400 });
    }

    const query = `
        MATCH (p1:Person {id: $personId})
        MATCH (p2:Person {id: $relativeId})
        MERGE (p1)-[r:${relationship}]->(p2)
        ON CREATE SET r.status = 'PENDING', r.requestedAt = datetime()
        RETURN p1.name as from, type(r) as rel, p2.name as to, r.status as status
    `;

    try {
        const records = await executeQuery(query, { personId, relativeId });
        if (records.length === 0) throw new Error('Person or Relative not found');
        return Response.json({
            success: true,
            status: records[0].get('status'),
            connection: records[0].toObject()
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

import { executeQuery } from '@/lib/neo4j';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const session = await getServerSession(authOptions);
    const { personId, relativeId, relationship, action, details } = await request.json();

    // 1. Session Authorization: Must be logged in to connect anyone
    if (!session) {
        return Response.json({ error: 'Authentication required to modify heritage connections.' }, { status: 401 });
    }

    // 2. Prevent Self-Connection
    if (personId === relativeId) {
        return Response.json({ error: 'You cannot connect a person to themselves in the heritage tree.' }, { status: 400 });
    }

    // Action handling for Approvals (Delegated Administration)
    if (action === 'VERIFY') {
        // Verification requires extra authority - e.g. checking if user is an elder or admin
        // For now, only allowing the person themselves to verify their incoming connections
        const query = `
            MATCH (p1:Person)-[r]->(p2:Person {id: $authId})
            WHERE id(r) = $relationshipId
            SET r.status = 'VERIFIED', r.verifiedAt = datetime()
            RETURN p1.name as from, type(r) as rel, p2.name as to
        `;
        try {
            const records = await executeQuery(query, {
                relationshipId: parseInt(relativeId),
                authId: session.user.id
            });
            if (records.length === 0) {
                return Response.json({ error: 'You are not authorized to verify this connection or relationship not found.' }, { status: 403 });
            }
            return Response.json({ success: true, message: 'Relationship verified in the vault', triggerRefresh: true });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        }
    }

    // Action handling for Manual Additions
    if (action === 'MANUAL_ADD') {
        const { generateUniqueId } = await import('@/lib/utils');
        const newId = generateUniqueId();

        // Sanitization
        const trim = (s) => (s ? s.trim() : '');
        const toTitle = (s) => s ? s.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ') : '';

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
                name: toTitle(trim(details.name)),
                surname: toTitle(trim(details.surname)),
                thirdName: toTitle(trim(details.thirdName)),
                fourthName: toTitle(trim(details.fourthName)),
                sex: details.sex,
                maidenName: toTitle(trim(details.maidenName)),
                isDeceased: !!details.isDeceased,
                deathYear: trim(details.deathYear),
                deathMonth: trim(details.deathMonth)
            });

            if (records.length === 0) {
                return Response.json({ error: `The ID (${personId}) was not found in our records.` }, { status: 404 });
            }

            return Response.json({ success: true, id: newId, message: 'RELATIVE ADDED & CONNECTED', triggerRefresh: true });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        }
    }

    const allowedRelationships = ['SIBLING_OF', 'PARENT_OF', 'SPOUSE_OF', 'CHILD_OF'];
    if (!allowedRelationships.includes(relationship)) {
        return Response.json({ error: 'Invalid relationship type provided.' }, { status: 400 });
    }

    // Dynamic connection query
    const query = `
        MATCH (p1:Person {id: $personId})
        MATCH (p2:Person {id: $relativeId})
        MERGE (p1)-[r:${relationship}]->(p2)
        ON CREATE SET r.status = 'PENDING', r.requestedAt = datetime()
        RETURN p1.name as from, type(r) as rel, p2.name as to, r.status as status
    `;

    try {
        const records = await executeQuery(query, { personId, relativeId });
        if (records.length === 0) throw new Error('Person or Relative not found in the heritage vault.');
        return Response.json({
            success: true,
            status: status,
            connection: records[0].toObject(),
            triggerRefresh: status === 'VERIFIED'
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

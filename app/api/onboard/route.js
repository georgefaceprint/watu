import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';

export async function POST(request) {
    try {
        const { name, surname, tribe, birthPlace, birthDate } = await request.json();

        if (!name || !surname || !tribe) {
            return Response.json({ error: 'Name, Surname, and Tribe are required' }, { status: 400 });
        }

        const uniqueId = generateUniqueId();

        const query = `
            CREATE (p:Person {
                id: $uniqueId,
                name: $name,
                surname: $surname,
                tribe: $tribe,
                birthPlace: $birthPlace,
                birthDate: $birthDate,
                isCitizen: true,
                createdAt: datetime()
            })
            RETURN p
        `;

        const records = await executeQuery(query, {
            uniqueId,
            name,
            surname,
            tribe,
            birthPlace,
            birthDate
        });

        const newUser = records[0].get('p').properties;
        return Response.json(newUser);
    } catch (err) {
        console.error('Onboarding Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

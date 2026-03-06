import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { name, surname, thirdName, fourthName, maidenName, tribe, subTribe, clan, birthPlace, birthDate, password, isDeceased, deathYear, deathMonth, sex } = await request.json();

        if (!name || !surname || !tribe || !password || !sex) {
            return Response.json({ error: 'Primary Identity, Tribe, Sex, and Password are required' }, { status: 400 });
        }

        const uniqueId = generateUniqueId();
        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
            CREATE (p:Person {
                id: $uniqueId,
                name: $name,
                surname: $surname,
                thirdName: $thirdName,
                fourthName: $fourthName,
                maidenName: $maidenName,
                tribe: $tribe,
                subTribe: $subTribe,
                clan: $clan,
                birthPlace: $birthPlace,
                birthDate: $birthDate,
                passwordHash: $passwordHash,
                isCitizen: true,
                isDeceased: $isDeceased,
                deathYear: $deathYear,
                deathMonth: $deathMonth,
                sex: $sex,
                createdAt: datetime()
            })
            RETURN p
        `;

        const records = await executeQuery(query, {
            uniqueId,
            name,
            surname,
            thirdName: thirdName || '',
            fourthName: fourthName || '',
            maidenName: maidenName || '',
            tribe,
            subTribe: subTribe || '',
            clan: clan || '',
            birthPlace: birthPlace || '',
            birthDate: birthDate || '',
            isDeceased: !!isDeceased,
            deathYear: deathYear || '',
            deathMonth: deathMonth || '',
            sex,
            passwordHash
        });

        const newUser = records[0].get('p').properties;
        delete newUser.passwordHash;
        return Response.json(newUser);
    } catch (err) {
        console.error('Onboarding Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const {
            name, surname, thirdName, fourthName, maidenName, sex, email,
            tribe, subTribe, clan, birthPlace, dob, birthOrder,
            securityQuestion, securityAnswer, password,
            isDeceased, deathYear, deathMonth
        } = await request.json();

        // Basic validation
        if (!name || !surname || !password || !sex) {
            return Response.json({ error: 'Required fields (Name, Surname, Password, Sex) are missing.' }, { status: 400 });
        }

        const id = generateUniqueId();
        const passwordHash = await bcrypt.hash(password, 10);
        const securityAnswerHash = securityAnswer ? await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10) : '';

        const query = `
            CREATE (p:Person {
                id: $id,
                name: $name,
                surname: $surname,
                thirdName: $thirdName,
                fourthName: $fourthName,
                maidenName: $maidenName,
                sex: $sex,
                email: $email,
                tribe: $tribe,
                subTribe: $subTribe,
                clan: $clan,
                birthPlace: $birthPlace,
                dob: $dob,
                birthOrder: $birthOrder,
                securityQuestion: $securityQuestion,
                securityAnswerHash: $securityAnswerHash,
                passwordHash: $passwordHash,
                isCitizen: true,
                isDeceased: $isDeceased,
                deathYear: $deathYear,
                deathMonth: $deathMonth,
                createdAt: datetime()
            })
            RETURN p.id as id, p.name as name
        `;

        const params = {
            id,
            name,
            surname,
            thirdName: thirdName || '',
            fourthName: fourthName || '',
            maidenName: maidenName || '',
            sex,
            email: email || '',
            tribe: tribe || '',
            subTribe: subTribe || '',
            clan: clan || '',
            birthPlace: birthPlace || '',
            dob: dob || '',
            birthOrder: birthOrder || '',
            securityQuestion: securityQuestion || '',
            securityAnswerHash,
            passwordHash,
            isDeceased: !!isDeceased,
            deathYear: deathYear || '',
            deathMonth: deathMonth || ''
        };

        const result = await executeQuery(query, params);

        if (result && result.length > 0) {
            return Response.json({
                success: true,
                id: result[0].get('id'),
                name: result[0].get('name')
            });
        }

        throw new Error("Failed to create user in heritage vault.");

    } catch (err) {
        console.error('Onboarding API Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
    try {
        let {
            name, surname, thirdName, fourthName, maidenName, sex, email,
            phoneCode, phoneNumber,
            tribe, subTribe, clan, birthPlace, dob, birthOrder,
            password,
            isDeceased, deathYear, deathMonth
        } = await request.json();

        const session = await getServerSession(authOptions);
        const watuIdFromSession = session?.user?.watuId;

        // 1. Sanitization & Normalization
        const trim = (str) => (str ? str.trim() : '');
        const toTitleCase = (str) => str ? str.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ') : '';

        name = toTitleCase(trim(name));
        surname = toTitleCase(trim(surname));
        email = trim(email).toLowerCase();

        // 2. Identification
        if (!name || !surname || !sex) {
            return Response.json({ error: 'Identity fields are missing.' }, { status: 400 });
        }

        let result;

        if (watuIdFromSession) {
            // Update existing profile (logged in via phone previously)
            const query = `
                MATCH (p:Person {id: $id})
                SET p += {
                    name: $name,
                    surname: $surname,
                    thirdName: $thirdName,
                    fourthName: $fourthName,
                    maidenName: $maidenName,
                    sex: $sex,
                    tribe: $tribe,
                    subTribe: $subTribe,
                    clan: $clan,
                    birthPlace: $birthPlace,
                    dob: $dob,
                    birthOrder: $birthOrder,
                    isDeceased: $isDeceased,
                    deathYear: $deathYear,
                    deathMonth: $deathMonth,
                    updatedAt: datetime()
                }
                ${email ? 'SET p.email = $email' : ''}
                RETURN p.id as id, p.name as name
            `;

            const params = {
                id: watuIdFromSession,
                name, surname,
                thirdName: toTitleCase(trim(thirdName)),
                fourthName: toTitleCase(trim(fourthName)),
                maidenName: toTitleCase(trim(maidenName)),
                sex, email,
                tribe: toTitleCase(trim(tribe)),
                subTribe: toTitleCase(trim(subTribe)),
                clan: toTitleCase(trim(clan)),
                birthPlace: toTitleCase(trim(birthPlace)),
                dob, birthOrder: trim(birthOrder),
                isDeceased: !!isDeceased,
                deathYear: trim(deathYear), deathMonth: trim(deathMonth)
            };

            result = await executeQuery(query, params);
        } else {
            // Manual creation (rare now since login triggers a stub)
            const id = generateUniqueId();
            const query = `
                CREATE (p:Person {
                    id: $id,
                    name: $name,
                    surname: $surname,
                    sex: $sex,
                    email: $email,
                    tribe: $tribe,
                    createdAt: datetime()
                })
                RETURN p.id as id, p.name as name
            `;
            result = await executeQuery(query, { id, name, surname, sex, email, tribe: toTitleCase(trim(tribe)) });
        }

        if (!result || result.length === 0) throw new Error("Failed to secure heritage claim.");

        return Response.json({
            success: true,
            id: result[0].get('id'),
            name: result[0].get('name')
        });

    } catch (err) {
        console.error('Onboarding API Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
    try {
        const body = await request.json();
        let { name, surname, sex, email, tribe, subTribe, clan, profession, securityQuestion, birthYear } = body;

        const session = await getServerSession(authOptions);
        const watuIdFromSession = session?.user?.watuId || session?.user?.id;

        const trim = (str) => (str ? str.trim() : '');
        const toTitleCase = (str) => str
            ? str.split(' ').map(w => w[0]?.toUpperCase() + w.substr(1).toLowerCase()).join(' ')
            : '';

        name = toTitleCase(trim(name));
        surname = toTitleCase(trim(surname));
        email = trim(email).toLowerCase();

        if (!name || !surname || !sex) {
            return Response.json({ error: 'Name, surname and sex are required.' }, { status: 400 });
        }

        let result;

        if (watuIdFromSession) {
            // Update the existing phone-login stub with full profile
            const query = `
                MATCH (p:Person {id: $id})
                SET p += {
                    name: $name,
                    surname: $surname,
                    sex: $sex,
                    tribe: $tribe,
                    subTribe: $subTribe,
                    clan: $clan,
                    profession: $profession,
                    securityQuestion: $securityQuestion,
                    securityAnswer: $securityAnswer,
                    updatedAt: datetime()
                }
                ${email ? 'SET p.email = $email' : ''}
                RETURN p.id as id, p.name as name
            `;

            result = await executeQuery(query, {
                id: watuIdFromSession,
                name, surname, sex,
                tribe: toTitleCase(trim(tribe)),
                subTribe: toTitleCase(trim(subTribe)),
                clan: toTitleCase(trim(clan)),
                profession: trim(profession),
                securityQuestion: trim(securityQuestion),
                securityAnswer: '',
                birthYear: trim(String(birthYear || '')),
                email
            });
        } else {
            // Create a brand new Person node
            const id = generateUniqueId();
            const query = `
                CREATE (p:Person {
                    id: $id,
                    name: $name,
                    surname: $surname,
                    sex: $sex,
                    email: $email,
                    tribe: $tribe,
                    subTribe: $subTribe,
                    clan: $clan,
                    profession: $profession,
                    securityQuestion: $securityQuestion,
                    securityAnswer: $securityAnswer,
                    createdAt: datetime()
                })
                RETURN p.id as id, p.name as name
            `;
            result = await executeQuery(query, {
                id, name, surname, sex, email,
                tribe: toTitleCase(trim(tribe)),
                subTribe: toTitleCase(trim(subTribe)),
                clan: toTitleCase(trim(clan)),
                profession: trim(profession),
                securityQuestion: trim(securityQuestion),
                securityAnswer: '',
                birthYear: trim(String(birthYear || ''))
            });
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

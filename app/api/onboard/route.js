import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
    try {
        let {
            name, surname, thirdName, fourthName, maidenName, sex, email,
            phoneCode, phoneNumber,
            tribe, subTribe, clan, birthPlace, dob, birthOrder,
            password, accessCode, // Added accessCode
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
        phoneNumber = trim(phoneNumber).replace(/\s+/g, '').replace(/^0+/, '');
        phoneCode = trim(phoneCode) || '+254';
        const fullPhone = phoneCode + phoneNumber;

        // 2. Strict Validation
        if (!name || !surname || !sex || (!watuIdFromSession && !password && !accessCode)) {
            return Response.json({ error: 'Required identity fields are missing.' }, { status: 400 });
        }

        // 3. Early Exit: Existence Check
        if (!watuIdFromSession) {
            const checkQuery = `
                MATCH (p:Person) 
                WHERE (p.email = $email AND $email <> "") OR (p.phone = $phone AND $phone <> "")
                RETURN p.id LIMIT 1
            `;
            const existing = await executeQuery(checkQuery, { email, phone: fullPhone });
            if (existing.length > 0) {
                return Response.json({ error: 'Identity already exists in the vault. Try signing in.' }, { status: 409 });
            }
        }

        let id = watuIdFromSession;
        let result;
        let attempts = 0;
        const maxAttempts = 5;

        // 4. Persistence
        while (attempts < maxAttempts) {
            if (!id) id = generateUniqueId();
            try {
                const passwordHash = password ? await bcrypt.hash(password, 10) : "";
                const accessCodeHash = accessCode ? await bcrypt.hash(accessCode, 10) : "";

                const query = watuIdFromSession ? `
                    MATCH (p:Person {id: $id})
                    SET p += {
                        name: $name,
                        surname: $surname,
                        thirdName: $thirdName,
                        fourthName: $fourthName,
                        maidenName: $maidenName,
                        sex: $sex,
                        phoneCode: $phoneCode,
                        phoneNumber: $phoneNumber,
                        phone: $fullPhone,
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
                    ${passwordHash ? 'SET p.passwordHash = $passwordHash' : ''}
                    ${accessCodeHash ? 'SET p.accessCodeHash = $accessCodeHash' : ''}
                    RETURN p.id as id, p.name as name
                ` : `
                    CREATE (p:Person {
                        id: $id,
                        name: $name,
                        surname: $surname,
                        thirdName: $thirdName,
                        fourthName: $fourthName,
                        maidenName: $maidenName,
                        sex: $sex,
                        email: $email,
                        phoneCode: $phoneCode,
                        phoneNumber: $phoneNumber,
                        phone: $fullPhone,
                        tribe: $tribe,
                        subTribe: $subTribe,
                        clan: $clan,
                        birthPlace: $birthPlace,
                        dob: $dob,
                        birthOrder: $birthOrder,
                        passwordHash: $passwordHash,
                        accessCodeHash: $accessCodeHash,
                        isCitizen: true,
                        isDeceased: $isDeceased,
                        deathYear: $deathYear,
                        deathMonth: $deathMonth,
                        createdAt: datetime()
                    })
                    RETURN p.id as id, p.name as name
                `;

                const params = {
                    id, name, surname,
                    thirdName: toTitleCase(trim(thirdName)),
                    fourthName: toTitleCase(trim(fourthName)),
                    maidenName: toTitleCase(trim(maidenName)),
                    sex, email, phoneCode, phoneNumber, fullPhone,
                    tribe: toTitleCase(trim(tribe)),
                    subTribe: toTitleCase(trim(subTribe)),
                    clan: toTitleCase(trim(clan)),
                    birthPlace: toTitleCase(trim(birthPlace)),
                    dob, birthOrder: trim(birthOrder),
                    passwordHash, isDeceased: !!isDeceased,
                    deathYear: trim(deathYear), deathMonth: trim(deathMonth)
                };

                result = await executeQuery(query, params);
                if (result && result.length > 0) break;
            } catch (err) {
                if (!watuIdFromSession && (err.message.includes('already exists') || err.message.includes('ConstraintValidationFailed'))) {
                    attempts++;
                    id = null;
                    continue;
                }
                throw err;
            }
            if (watuIdFromSession) break;
        }

        if (!result || result.length === 0) throw new Error("Failed to process heritage claim.");

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

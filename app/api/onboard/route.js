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
            securityQuestion, securityAnswer, password,
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
        phoneNumber = trim(phoneNumber).replace(/\s+/g, '');
        phoneCode = trim(phoneCode) || '+254';

        // 2. Strict Validation
        if (!name || !surname || !sex || (!watuIdFromSession && !password)) {
            return Response.json({ error: 'Required identity fields are missing.' }, { status: 400 });
        }

        // 3. Early Exit: Existence Check (Skip if existing user updating own profile)
        if (!watuIdFromSession) {
            const checkQuery = `
                MATCH (p:Person) 
                WHERE (p.email = $email AND $email <> "") OR (p.phone = $phone AND $phone <> "")
                RETURN p.id LIMIT 1
            `;
            const existing = await executeQuery(checkQuery, { email, phone: phoneNumber });
            if (existing.length > 0) {
                return Response.json({ error: 'Identity already exists in the vault. Try signing in.' }, { status: 409 });
            }
        }

        let id = watuIdFromSession;
        let result;
        let attempts = 0;
        const maxAttempts = 5;

        // 4. Persistence with Collision Retry (for new users)
        while (attempts < maxAttempts) {
            if (!id) id = generateUniqueId();
            try {
                const passwordHash = password ? await bcrypt.hash(password, 10) : "";
                const securityAnswerHash = securityAnswer ? await bcrypt.hash(trim(securityAnswer).toLowerCase(), 10) : '';

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
                        tribe: $tribe,
                        subTribe: $subTribe,
                        clan: $clan,
                        birthPlace: $birthPlace,
                        dob: $dob,
                        birthOrder: $birthOrder,
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
                    id, name, surname,
                    thirdName: toTitleCase(trim(thirdName)),
                    fourthName: toTitleCase(trim(fourthName)),
                    maidenName: toTitleCase(trim(maidenName)),
                    sex, email, phoneCode, phoneNumber,
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
                    console.warn(`ID collision detected for ${id}. Retrying...`);
                    attempts++;
                    id = null; // force new id
                    continue;
                }
                throw err;
            }
            if (watuIdFromSession) break; // No retry for updates
        }

        if (!result || result.length === 0) {
            throw new Error("Failed to process heritage claim in the vault.");
        }

        // Send Welcome Email
        if (email && process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Watu Network <onboarding@watu.network>',
                    to: email,
                    subject: 'Account Secured - Your Watu ID',
                    html: `<h2>Welcome, ${name}!</h2><p>Your ID: <strong>${id}</strong></p>`
                });
            } catch (emailErr) {
                console.error('Email failed:', emailErr);
            }
        }

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

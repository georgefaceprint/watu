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

        // 1. Sanitization & Normalization
        const trim = (str) => (str ? str.trim() : '');
        const toTitleCase = (str) => str ? str.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ') : '';

        name = toTitleCase(trim(name));
        surname = toTitleCase(trim(surname));
        email = trim(email).toLowerCase();
        phoneNumber = trim(phoneNumber).replace(/\s+/g, '');
        phoneCode = trim(phoneCode) || '+254';

        const session = await getServerSession(authOptions);
        const isSocial = !!session?.user;

        // 2. Strict Validation
        if (!name || !surname || !sex || (!isSocial && !password)) {
            return Response.json({ error: 'Required identity fields are missing.' }, { status: 400 });
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return Response.json({ error: 'Invalid email format provided.' }, { status: 400 });
        }

        // 3. Early Exit: Existence Check (Skip if social user updating own profile)
        const checkQuery = `
            MATCH (p:Person) 
            WHERE 
                ((p.email = $email AND $email <> "") OR 
                 (p.phoneNumber = $phone AND $phone <> ""))
                ${isSocial ? "AND p.email <> $socialEmail" : ""}
            RETURN p.id LIMIT 1
        `;
        const existing = await executeQuery(checkQuery, {
            email,
            phone: phoneNumber,
            socialEmail: session?.user?.email || ""
        });

        if (existing.length > 0) {
            return Response.json({ error: 'Identity already exists in the vault. Try signing in.' }, { status: 409 });
        }

        let id;
        let result;
        let attempts = 0;
        const maxAttempts = 5;

        // 4. Persistence with Collision Retry
        while (attempts < maxAttempts) {
            id = generateUniqueId();
            try {
                const passwordHash = password ? await bcrypt.hash(password, 10) : "";
                const securityAnswerHash = securityAnswer ? await bcrypt.hash(trim(securityAnswer).toLowerCase(), 10) : '';

                const query = isSocial ? `
                    MATCH (p:Person {email: $socialEmail})
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
                    ${securityQuestion ? 'SET p.securityQuestion = $securityQuestion, p.securityAnswerHash = $securityAnswerHash' : ''}
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
                    id, name, surname,
                    socialEmail: session?.user?.email || "",
                    thirdName: toTitleCase(trim(thirdName)),
                    fourthName: toTitleCase(trim(fourthName)),
                    maidenName: toTitleCase(trim(maidenName)),
                    sex, email, phoneCode, phoneNumber,
                    tribe: toTitleCase(trim(tribe)),
                    subTribe: toTitleCase(trim(subTribe)),
                    clan: toTitleCase(trim(clan)),
                    birthPlace: toTitleCase(trim(birthPlace)),
                    dob, birthOrder: trim(birthOrder),
                    securityQuestion: trim(securityQuestion),
                    securityAnswerHash, passwordHash, isDeceased: !!isDeceased,
                    deathYear: trim(deathYear), deathMonth: trim(deathMonth)
                };

                result = await executeQuery(query, params);
                if (result && result.length > 0) break;
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('ConstraintValidationFailed')) {
                    console.warn(`ID collision detected for ${id}. Retrying...`);
                    attempts++;
                    continue;
                }
                throw err;
            }
        }

        if (!result || result.length === 0) {
            throw new Error("Failed to create user in heritage vault after multiple attempts.");
        }

        // Send Welcome Email
        if (email && process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Watu Network <onboarding@watu.network>',
                    to: email,
                    subject: 'Welcome to Watu Network - Your Identity Key',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #6366f1;">Welcome to Watu Network, ${name}!</h2>
                            <p>Your ancestral profile has been successfully created in the vault.</p>
                            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <p style="font-size: 0.8rem; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Your Unique Identity Key</p>
                                <h1 style="font-size: 2.5rem; letter-spacing: 5px; margin: 0; color: #111827;">${id}</h1>
                            </div>
                            <p>Keep this key safe. You will need it to sign in and connect with your family tree.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #9ca3af;">Watu.Network - Preserving African Heritage</p>
                        </div>
                    `
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

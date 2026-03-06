import { executeQuery } from '@/lib/neo4j';
import { generateUniqueId } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

export async function POST(request) {
    try {
        const {
            name, surname, thirdName, fourthName, maidenName, sex, email,
            phoneCode, phoneNumber, // Refactored fields
            tribe, subTribe, clan, birthPlace, dob, birthOrder,
            securityQuestion, securityAnswer, password,
            isDeceased, deathYear, deathMonth
        } = await request.json();

        // Basic validation
        if (!name || !surname || !password || !sex) {
            return Response.json({ error: 'Required fields (Name, Surname, Password, Sex) are missing.' }, { status: 400 });
        }

        let id;
        let result;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            id = generateUniqueId();
            try {
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
                    id,
                    name,
                    surname,
                    thirdName: thirdName || '',
                    fourthName: fourthName || '',
                    maidenName: maidenName || '',
                    sex,
                    email: email || '',
                    phoneCode: phoneCode || '+254',
                    phoneNumber: phoneNumber || '',
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

                result = await executeQuery(query, params);
                if (result && result.length > 0) break; // Success!
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('ConstraintValidationFailed')) {
                    console.warn(`ID collision detected for ${id}. Retrying...`);
                    attempts++;
                    continue;
                }
                throw err; // Other errors should fail
            }
        }

        if (!result || result.length === 0) {
            throw new Error("Failed to create user in heritage vault after multiple attempts.");
        }
        // Send Welcome Email with Identity Key
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
                console.error('Email failed to send (probably because domain not verified in Resend):', emailErr);
            }
        }

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

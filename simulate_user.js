require('dotenv').config({ path: '.env.local' });
const { executeQuery } = require('./lib/neo4j');
const bcrypt = require('bcryptjs');
const { generateUniqueId } = require('./lib/utils');

async function seedNewUser() {
    console.log('--- STARTING USER SIMULATION (A-Z) ---');

    const id = generateUniqueId();
    const name = 'Amara';
    const surname = 'Sifuna';
    const email = 'amara.sifuna@example.com';
    const password = 'Password123!';
    const tribe = 'Luhya';
    const subTribe = 'Bukusu';
    const clan = 'Bakusu';

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
            CREATE (p:Person {
                id: $id,
                name: $name,
                surname: $surname,
                email: $email,
                sex: 'female',
                tribe: $tribe,
                subTribe: $subTribe,
                clan: $clan,
                passwordHash: $passwordHash,
                isCitizen: true,
                isDeceased: false,
                createdAt: datetime()
            })
            RETURN p.id as id, p.name as name
        `;

        const result = await executeQuery(query, {
            id, name, surname, email, tribe, subTribe, clan, passwordHash
        });

        if (result && result.length > 0) {
            console.log('✅ SUCCESS: New User Created');
            console.log(`Identity Key (Watu ID): ${id}`);
            console.log(`Name: ${name} ${surname}`);
            console.log(`Tribe/Clan: ${tribe} (${subTribe}) / ${clan}`);
            console.log('--- SIMULATION COMPLETE ---');
        } else {
            console.error('❌ FAILED: Could not create user node.');
        }

    } catch (err) {
        console.error('❌ ERROR during simulation:', err.message);
    } finally {
        process.exit();
    }
}

seedNewUser();

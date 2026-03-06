const neo4j = require('neo4j-driver');
const bcrypt = require('bcryptjs');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load .env.local manually
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const driver = neo4j.driver(
    env.NEO4J_URI,
    neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
);

const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

async function seed() {
    const session = driver.session();
    const id = generateId();
    const password = 'Testing123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
        CREATE (p:Person {
            id: $id,
            name: 'Kamao',
            surname: 'Njoroge',
            sex: 'Male',
            email: 'kamao.test@watu.network',
            phoneCode: '+254',
            phoneNumber: '712345678',
            tribe: 'Kikuyu',
            residency: 'Nyeri',
            passwordHash: $passwordHash,
            isCitizen: true,
            isDeceased: false,
            createdAt: datetime()
        })
        RETURN p.id as id
    `;

    try {
        const result = await session.run(query, { id, passwordHash });
        console.log(`\n✅ SUCCESSFULLY SEEDED TEST USER`);
        console.log(`------------------------------`);
        console.log(`Watu ID:  ${id}`);
        console.log(`Email:    kamao.test@watu.network`);
        console.log(`Password: ${password}`);
        console.log(`------------------------------\n`);
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await session.close();
        await driver.close();
    }
}

seed();

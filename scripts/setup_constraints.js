const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env.local not found');
    process.exit(1);
}

const envData = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envData.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

const uri = envVars.NEO4J_URI;
const user = envVars.NEO4J_USER;
const password = envVars.NEO4J_PASSWORD;

if (!uri || !user || !password) {
    console.error('❌ ERROR: Neo4j Environment Variables missing in .env.local');
    process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function setupConstraints() {
    const session = driver.session();
    try {
        console.log('--- Setting up Neo4j Constraints ---');

        // Uniqueness for Person ID
        console.log('Creating constraint for Person(id)...');
        await session.run(`
            CREATE CONSTRAINT person_id_unique IF NOT EXISTS
            FOR (p:Person) REQUIRE p.id IS UNIQUE
        `);

        // Uniqueness for Person Email
        console.log('Creating constraint for Person(email)...');
        await session.run(`
            CREATE CONSTRAINT person_email_unique IF NOT EXISTS
            FOR (p:Person) REQUIRE p.email IS UNIQUE
        `);

        console.log('✅ SUCCESS: Constraints initialized.');
    } catch (error) {
        console.error('❌ FAILED to create constraints:');
        console.error(error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

setupConstraints();

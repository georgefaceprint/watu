const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve('.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envData.split('\n').map(line => line.trim()).forEach(line => {
    if (line && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            envVars[key] = value;
        }
    }
});

const uri = envVars.NEO4J_URI || 'bolt://localhost:7687';
const user = envVars.NEO4J_USER || 'neo4j';
const password = envVars.NEO4J_PASSWORD;

if (!password) {
    console.error('❌ ERROR: NEO4J_PASSWORD not found in .env.local');
    process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function setupConstraints() {
    console.log('--- 🔐 STARTING DATABASE HARDENING (Neo4j Constraints) ---');

    const constraints = [
        'CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE',
        'CREATE CONSTRAINT person_email_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.email IS UNIQUE',
        'CREATE INDEX person_name_index IF NOT EXISTS FOR (p:Person) ON (p.name)',
        'CREATE INDEX person_surname_index IF NOT EXISTS FOR (p:Person) ON (p.surname)',
        'CREATE INDEX person_tribe_index IF NOT EXISTS FOR (p:Person) ON (p.tribe)',
        'CREATE INDEX person_clan_index IF NOT EXISTS FOR (p:Person) ON (p.clan)'
    ];

    try {
        for (const query of constraints) {
            console.log(`Executing: ${query}`);
            await session.run(query);
            console.log('✅ Success');
        }
        console.log('\n--- 🚀 DATABASE HARDENING COMPLETE ---');
    } catch (error) {
        console.error('❌ FAILED TO SETUP CONSTRAINTS:', error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

setupConstraints();

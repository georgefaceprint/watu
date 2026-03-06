const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

async function setup() {
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    const session = driver.session();

    try {
        console.log('--- ENFORCING DATABASE CONSTRAINTS ---');

        // 1. Unique ID Constraint
        await session.run('CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE');
        console.log('✅ CONSTRAINT: Person(id) IS UNIQUE');

        // 2. Unique Phone Constraint (Optional but recommended)
        await session.run('CREATE CONSTRAINT person_phone_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.phone IS UNIQUE');
        console.log('✅ CONSTRAINT: Person(phone) IS UNIQUE');

        // 3. Unique Email Constraint
        await session.run('CREATE CONSTRAINT person_email_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.email IS UNIQUE');
        console.log('✅ CONSTRAINT: Person(email) IS UNIQUE');

    } catch (err) {
        console.error('❌ SETUP ERROR:', err.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

setup();

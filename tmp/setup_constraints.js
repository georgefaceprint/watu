const neo4j = require('neo4j-driver');

// Manual config since dotenv is not available in raw node execution here
const NEO4J_URI = "neo4j+s://c4b441df.databases.neo4j.io";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "GmsqpLJItFW-ZUPktNR_iKV1fK6EKFpE7JoO4lAy8RE";

async function setup() {
    console.log('--- CONNECTING TO NEO4J AURA ---');
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();

    try {
        console.log('--- ENFORCING DATABASE CONSTRAINTS ---');

        await session.run('CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE');
        console.log('✅ CONSTRAINT: Person(id) IS UNIQUE');

        await session.run('CREATE CONSTRAINT person_phone_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.phone IS UNIQUE');
        console.log('✅ CONSTRAINT: Person(phone) IS UNIQUE');

    } catch (err) {
        console.error('❌ SETUP ERROR:', err.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

setup();

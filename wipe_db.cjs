const neo4j = require('neo4j-driver');
const fs = require('fs');

// Load env vars from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
}

const driver = neo4j.driver(
    env.NEO4J_URI,
    neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
);

const session = driver.session();

async function wipe() {
    try {
        console.log('⚠️  Wiping ALL nodes and relationships from Neo4j Aura...');
        await session.run('MATCH (n) DETACH DELETE n');
        console.log('✅ Database wiped clean!');

        const check = await session.run('MATCH (n) RETURN count(n) as remaining');
        console.log(`   Remaining nodes: ${check.records[0].get('remaining')}`);
    } catch (err) {
        console.error('❌ Error wiping DB:', err.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

wipe();

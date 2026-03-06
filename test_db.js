const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve('.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envData.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    }
});

const uri = envVars.NEO4J_URI || 'bolt://localhost:7687';
const user = envVars.NEO4J_USER || 'neo4j';
const password = envVars.NEO4J_PASSWORD;

console.log(`Checking connection to: ${uri}`);
console.log(`User: ${user}`);
console.log(`Password length: ${password ? password.length : 0}`);

if (!password) {
    console.error('❌ ERROR: NEO4J_PASSWORD not found in .env.local');
    process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function testConnection() {
    try {
        console.log('Connecting...');
        const result = await session.run('RETURN 1 as result');
        console.log('✅ SUCCESS: Database is connected!');
        console.log('Result:', result.records[0].get('result').toNumber());
    } catch (error) {
        console.error('❌ CONNECTION FAILED:');
        console.error(error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

testConnection();

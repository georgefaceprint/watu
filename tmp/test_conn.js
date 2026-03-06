const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

console.log('Testing connection to:', uri);
console.log('User:', user);

if (!uri || !user || !password) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function runTest() {
    try {
        const result = await session.run('RETURN 1 as result');
        console.log('SUCCESS! Result:', result.records[0].get('result').toNumber());
    } catch (err) {
        console.error('CONNECTION FAILED:', err);
    } finally {
        await session.close();
        await driver.close();
    }
}

runTest();

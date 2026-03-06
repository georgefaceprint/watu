import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

let driver;

export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function executeQuery(query, params = {}) {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

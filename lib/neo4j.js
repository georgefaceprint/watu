import neo4j from 'neo4j-driver';

let driver;

export function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      const errorMsg = "CRITICAL: Neo4j Environment Variables (URI, USER, PASSWORD) are missing. Check your .env or Vercel settings.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`[Neo4j Driver] Initializing for ${uri}`);
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

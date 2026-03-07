export async function GET() {
    return Response.json({
        neo4j: {
            has_uri: !!process.env.NEO4J_URI,
            uri_prefix: process.env.NEO4J_URI?.substring(0, 10),
            has_user: !!process.env.NEO4J_USER,
            has_pass: !!process.env.NEO4J_PASSWORD,
        },
        auth: {
            nextAuthUrl: process.env.NEXTAUTH_URL || "MISSING",
            nextAuthSecretSet: !!process.env.NEXTAUTH_SECRET,
            googleIdSet: !!process.env.GOOGLE_ID,
            googleSecretSet: !!process.env.GOOGLE_SECRET,
            appleIdSet: !!process.env.APPLE_ID,
        },
        node_env: process.env.NODE_ENV
    });
}

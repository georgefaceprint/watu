export async function GET() {
    return Response.json({
        has_uri: !!process.env.NEO4J_URI,
        uri_prefix: process.env.NEO4J_URI?.substring(0, 10),
        has_user: !!process.env.NEO4J_USER,
        has_pass: !!process.env.NEO4J_PASSWORD,
        node_env: process.env.NODE_ENV
    });
}

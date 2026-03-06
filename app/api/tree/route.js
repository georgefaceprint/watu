import { executeQuery } from '@/lib/neo4j';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (!personId) return Response.json({ error: 'Person ID required' }, { status: 400 });

    // Fetch the person and their direct connections (up to 3 levels deep for visualization)
    const query = `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (p)-[r*1..3]-(relative:Person)
    RETURN p as root, collect(DISTINCT {node: relative, rel: r}) as connections
  `;

    try {
        const records = await executeQuery(query, { personId });
        if (records.length === 0) return Response.json({ error: 'Person not found' }, { status: 404 });

        const root = records[0].get('root').properties;
        const connections = records[0].get('connections');

        // Format for D3.js Tree
        const treeData = {
            name: `${root.name} ${root.surname}`,
            attributes: { tribe: root.tribe, id: root.id },
            children: []
        };

        // Simple nested children logic (for demo purposes)
        // In a real app, this would be a recursive formatter
        connections.forEach(conn => {
            if (conn.node) {
                const node = conn.node.properties;
                treeData.children.push({
                    name: `${node.name} ${node.surname}`,
                    attributes: { id: node.id }
                });
            }
        });

        return Response.json(treeData);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

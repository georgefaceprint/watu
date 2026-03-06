import { executeQuery } from '@/lib/neo4j';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Key Metrics
        const statsQuery = `
            CALL {
                MATCH (p:Person) RETURN count(p) as users
            }
            CALL {
                MATCH ()-[r:CHILD_OF|SPOUSE_OF|SIBLING_OF]-() RETURN count(r)/2 as connections
            }
            CALL {
                MATCH (p:Person) WHERE p.tribe <> "" RETURN count(DISTINCT p.tribe) as tribes
            }
            RETURN users, connections, tribes
        `;
        const statsResult = await executeQuery(statsQuery);

        // 2. Fetch Recent Activity
        const recentQuery = `
            MATCH (p:Person)
            RETURN p { 
                .id, 
                .name, 
                .surname, 
                .tribe, 
                joined: toString(p.createdAt)
            }
            ORDER BY p.createdAt DESC 
            LIMIT 10
        `;
        const recentResult = await executeQuery(recentQuery);

        const stats = {
            users: statsResult[0]?.get('users').toNumber() || 0,
            connections: statsResult[0]?.get('connections').toNumber() || 0,
            tribes: statsResult[0]?.get('tribes').toNumber() || 0,
        };

        const recentUsers = recentResult.map(record => {
            const p = record.get('p');
            return {
                ...p,
                status: 'VERIFIED', // Default for now
                joined: formatTimeAgo(p.joined)
            };
        });

        return Response.json({ stats, recentUsers });

    } catch (err) {
        console.error('Admin Stats Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'seconds ago';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
}

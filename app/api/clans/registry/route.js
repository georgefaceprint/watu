import { kenyanTribes } from '@/lib/clan_registry';

export async function GET() {
    return Response.json(kenyanTribes);
}

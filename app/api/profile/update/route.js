import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeQuery } from '@/lib/neo4j';
const cloudinary = require('@/lib/cloudinary');

export async function POST(request) {
    const session = await getServerSession(authOptions);
    try {
        const body = await request.json();
        const { id, ...fields } = body;

        if (!session || (session.user.id !== id && session.user.watuId !== id)) {
            return Response.json({ error: 'Unauthorized profile update attempt' }, { status: 401 });
        }

        // Handle Image Upload if photo is a base64 string
        if (fields.photo && fields.photo.startsWith('data:image')) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(fields.photo, {
                    folder: 'watu_profiles',
                    public_id: `profile_${id}`,
                    overwrite: true,
                    invalidate: true,
                    transformation: [
                        { width: 500, height: 500, crop: "fill", gravity: "face" }
                    ]
                });
                fields.photo = uploadResponse.secure_url;
            } catch (uploadErr) {
                console.error('Cloudinary Upload Error:', uploadErr);
                return Response.json({ error: 'Failed to upload profile image to cloud' }, { status: 500 });
            }
        }

        // Build dynamic SET clause to avoid overwriting fields with undefined/null if they weren't sent
        // But for simplicity in this MVP, we'll map the common ones.
        const query = `
            MATCH (p:Person {id: $id})
            SET p += $fields,
                p.updatedAt = datetime()
            RETURN p
        `;

        const result = await executeQuery(query, { id, fields });

        if (result.length === 0) {
            return Response.json({ error: 'Person not found' }, { status: 404 });
        }

        return Response.json({ success: true, person: result[0].get('p').properties });
    } catch (err) {
        console.error('Profile Update API Error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

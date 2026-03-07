import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/lib/neo4j";
import { generateUniqueId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        // ─── 2-STEP PHONE IDENTITY PROVIDER ────────────────────────
        CredentialsProvider({
            id: "phone",
            name: "Phone Identity",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "Code", type: "text" }, // 'otp' is used for the 5-digit PIN
                isNew: { label: "isNew", type: "text" }
            },
            async authorize(credentials) {
                const { phone, otp, isNew } = credentials;
                if (!phone || !otp) return null;

                // 1. Check for existing identity
                const result = await executeQuery(
                    `MATCH (p:Person) 
                     WHERE p.phone = $phone 
                     RETURN p.id as id, p.name as name, p.accessCodeHash as hash LIMIT 1`,
                    { phone }
                );

                const user = result && result.length > 0;
                const existingHash = user ? result[0].get('hash') : null;

                if (user && existingHash) {
                    // ── Case A: Returning Identity (Verify PIN) ──
                    const valid = await bcrypt.compare(otp, existingHash);
                    if (!valid) throw new Error("INCORRECT ACCESS CODE");
                    return { id: result[0].get('id'), name: result[0].get('name'), phone };
                }
                else if (isNew === "true" || !existingHash) {
                    // ── Case B: New Identity (Set PIN for the first time) ──
                    const hash = await bcrypt.hash(otp, 10);

                    if (user) {
                        // Identity exists (maybe a stub) but has no PIN
                        await executeQuery(
                            `MATCH (p:Person {phone: $phone}) SET p.accessCodeHash = $hash RETURN p`,
                            { phone, hash }
                        );
                        return { id: result[0].get('id'), name: result[0].get('name'), phone };
                    } else {
                        // Brand new profile
                        const id = generateUniqueId();
                        await executeQuery(
                            `CREATE (p:Person { 
                                id: $id, 
                                name: 'NEW', 
                                phone: $phone, 
                                accessCodeHash: $hash,
                                provider: 'phone', 
                                createdAt: datetime() 
                            })`,
                            { id, phone, hash }
                        );
                        return { id, name: 'NEW', phone };
                    }
                }

                throw new Error("IDENTITY NOT FOUND OR UNVERIFIED");
            }
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login", error: "/login" },

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.watuId = user.id;
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.watuId || token.sub;
            session.user.watuId = token.watuId;
            return session;
        }
    },

    secret: process.env.NEXTAUTH_SECRET || "watu_network_auth_secret_777",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/lib/neo4j";
import { verifyOTP } from "@/lib/otp";
import { generateUniqueId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        // ─── Google OAuth ───────────────────────────────────────────
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),

        // ─── Apple OAuth ────────────────────────────────────────────
        ...(process.env.APPLE_ID ? [AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
        })] : []),

        // ─── Phone OTP (Custom Credentials) ─────────────────────────
        CredentialsProvider({
            id: "phone",
            name: "Phone OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                const { phone, otp } = credentials;
                if (!phone || !otp) return null;

                const result = verifyOTP(phone, otp);
                if (result.error) throw new Error(result.error);

                // OTP is valid — find or create user in Neo4j
                const existing = await executeQuery(
                    `MATCH (p:Person {phone: $phone}) RETURN p.id as id, p.name as name LIMIT 1`,
                    { phone }
                );

                if (existing && existing.length > 0) {
                    const user = existing[0];
                    return { id: user.get('id'), name: user.get('name'), phone };
                } else {
                    // Create stub for new user
                    const id = generateUniqueId();
                    await executeQuery(
                        `CREATE (p:Person { id: $id, name: 'NEW', phone: $phone, provider: 'phone', createdAt: datetime() })`,
                        { id, phone }
                    );
                    return { id, name: 'NEW', phone };
                }
            }
        }),

        // ─── Watu ID + Password (Standard Credentials) ──────────────
        CredentialsProvider({
            id: "credentials",
            name: "Watu ID",
            credentials: {
                id: { label: "Watu ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { id, password } = credentials;
                if (!id || !password) return null;

                const result = await executeQuery(
                    `MATCH (p:Person {id: $id}) RETURN p`,
                    { id: id.toUpperCase() }
                );

                if (!result || result.length === 0) return null;

                const userNode = result[0].get("p");
                const user = userNode.properties;
                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) throw new Error("INVALID PASSWORD");

                return {
                    id: user.id,
                    name: `${user.name} ${user.surname || ''}`.trim(),
                    email: user.email || null,
                };
            },
        }),
    ],

    session: { strategy: "jwt" },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.watuId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.watuId || token.sub;
            session.user.watuId = token.watuId;
            return session;
        },
        async signIn({ user, account }) {
            // For OAuth (Google/Apple) only! Phone/Credentials are already handled in `authorize`.
            if (account?.provider === "google" || account?.provider === "apple") {
                try {
                    const existingResult = await executeQuery(
                        `MATCH (p:Person {email: $email}) RETURN p.id as id LIMIT 1`,
                        { email: user.email }
                    );
                    if (existingResult.length === 0) {
                        const id = generateUniqueId();
                        await executeQuery(
                            `CREATE (p:Person { id: $id, name: $name, email: $email, provider: $provider, createdAt: datetime() })`,
                            { id, name: user.name?.split(" ")[0] || "NEW", email: user.email, provider: account.provider }
                        );
                        user.id = id;
                    } else {
                        user.id = existingResult[0].get("id");
                    }
                    return true;
                } catch (err) {
                    console.error("❌ OAUTH SIGN-IN ERROR:", err);
                    return false;
                }
            }
            return true;
        },
    },

    secret: process.env.NEXTAUTH_SECRET || "watu_network_auth_secret_777",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

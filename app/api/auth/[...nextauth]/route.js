import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/lib/neo4j";
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

        // ─── Magic Link Email ────────────────────────────────────────
        ...(process.env.EMAIL_SERVER_HOST ? [EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM || "noreply@watu.network",
        })] : []),

        // ─── Watu ID + Password (Custom) ────────────────────────────
        CredentialsProvider({
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

                const user = result[0].get("p").properties;
                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;

                return {
                    id: user.id,
                    name: `${user.name} ${user.surname}`,
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
            // For OAuth (Google/Apple), auto-create a Person node if not exists
            if (account?.provider === "google" || account?.provider === "apple") {
                try {
                    console.log(`📡 NEXTAUTH: Attempting ${account.provider} sign-in for ${user.email}`);
                    const existingResult = await executeQuery(
                        `MATCH (p:Person {email: $email}) RETURN p.id as id LIMIT 1`,
                        { email: user.email }
                    );
                    if (existingResult.length === 0) {
                        console.log(`🌱 NEXTAUTH: New user detected. Creating stub profile...`);
                        const { generateUniqueId } = await import("@/lib/utils");
                        const id = generateUniqueId();
                        await executeQuery(
                            `CREATE (p:Person {
                                id: $id,
                                name: $name,
                                surname: '',
                                email: $email,
                                isCitizen: true,
                                isDeceased: false,
                                provider: $provider,
                                createdAt: datetime()
                            })`,
                            { id, name: user.name?.split(" ")[0] || "NEW", email: user.email, provider: account.provider }
                        );
                        user.id = id;
                        console.log(`✅ NEXTAUTH: Profile created with ID: ${id}`);
                    } else {
                        user.id = existingResult[0].get("id");
                        console.log(`🔗 NEXTAUTH: Connected to existing profile ID: ${user.id}`);
                    }
                    return true;
                } catch (err) {
                    console.error("❌ NEXTAUTH SIGN-IN ERROR:", err);
                    return false; // Prevent sign-in if database creation fails
                }
            }
            return true;
        },
    },

    secret: process.env.NEXTAUTH_SECRET || "watu_network_auth_secret_777",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

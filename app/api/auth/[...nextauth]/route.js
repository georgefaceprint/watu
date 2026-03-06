import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "GOOGLE_ID_PLACEHOLDER",
            clientSecret: process.env.GOOGLE_SECRET || "GOOGLE_SECRET_PLACEHOLDER",
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID || "APPLE_ID_PLACEHOLDER",
            clientSecret: process.env.APPLE_SECRET || "APPLE_SECRET_PLACEHOLDER",
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.sub;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "watu_network_auth_secret_777",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

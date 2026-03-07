import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Optional custom middleware logic
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        // Protect sensitive APIs server-side only
        "/api/profile/:path*",
        "/api/connect/:path*",
        "/api/admin/:path*",
    ],
};

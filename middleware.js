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
        "/profile/:path*",
        "/connect/:path*",
        "/chat/:path*",
        "/admin/:path*",
        // Protect sensitive APIs
        "/api/profile/:path*",
        "/api/connect/:path*",
        "/api/admin/:path*",
    ],
};

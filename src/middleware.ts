import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

const publicPages = ["/signin", "/signup"];


export default withAuth({
    callbacks: {
        authorized: async ({ token }) => {
            return !!token;
        },
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
});



export const config = {
    matcher: ["/((?!api|_next|_vercel|signin|signup|.*\\..*).*)"],
};
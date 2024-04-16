import { prisma } from "@/lib/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as PrismaClient) as Adapter,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email },
                });
                if (!user) throw new Error("User not found");
                if (!user.password)
                    throw new Error(
                        "No password set, try to login with google or reset your password"
                    );
                const match = await bcrypt.compare(
                    credentials?.password!,
                    user.password
                );
                if (!match) throw new Error("Wrong password");
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, user, token }) {
            if (user?.id) {
                session.user.id = user.id;
                session.user.role = user.role;
            } else {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
};
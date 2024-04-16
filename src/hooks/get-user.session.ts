import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export type UserSession = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
};

export const getUserSession = async (): Promise<UserSession> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) redirect("/login");
        const { user } = session;
        return user;
    } catch (error) {
        console.log(error);
        redirect("/login");
    }
};
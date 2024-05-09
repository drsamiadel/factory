import { getUserSession } from "@/hooks/get-user-session";
import MainLayout from "./components/MainLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import {redirect} from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/signin");
    }

    const { name, email, role, image } = session.user;

    return (
        <MainLayout user={{ name, email, role, image } as any}>
            {children}
        </MainLayout>
    );
}

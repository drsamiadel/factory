import { getUserSession } from "@/hooks/get-user-session";
import MainLayout from "./components/MainLayout";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { name, email, role, image } = await getUserSession();

    return (
        <MainLayout user={{ name, email, role, image } as any}>
            {children}
        </MainLayout>
    );
}

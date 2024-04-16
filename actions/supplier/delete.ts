"use server";

import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user.session";

const DELETE = async (
    id: string
): Promise<string> => {
    try {
        const { id: userId } = await getUserSession();
        const deletedSupplier = await prisma.supplier.delete({
            where: {
                id
            },
        });

        return id;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default DELETE;
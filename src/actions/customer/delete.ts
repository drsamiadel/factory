"use server";

import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const DELETE = async (
    id: string
): Promise<string | { error: { message: string } }> => {
    try {
        const { id: userId } = await getUserSession();
        const deletedCustomer = await prisma.customer.delete({
            where: {
                id
            },
        });

        return id;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default DELETE;
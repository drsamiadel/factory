"use server";

import { Material, Supplier } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const UPDATE = async (
    material: Partial<Material> & { supplier: Partial<Supplier> },
): Promise<Partial<Material> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();

        const updatedMaterial = await prisma.material.update({
            where: {
                id: material.id,
            },
            data: {
                userId: id,
                category: material.category,
                name: material.name,
                type: material.type,
                variants: material.variants as any,
                description: material.description,
                supplierId: material.supplierId,
            },
            include: {
                supplier: true,
            },
        });

        return updatedMaterial;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default UPDATE;
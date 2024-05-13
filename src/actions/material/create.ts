"use server";

import { Material } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const CREATE = async (
    material: Partial<Material>
): Promise<Partial<Material> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();

        const createdMaterial = await prisma.material.create({
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
            }
        });

        return createdMaterial;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default CREATE;
"use server";

import { Material } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user-session";

const UPDATE = async (
    material: Partial<Material>
): Promise<Partial<Material>> => {
    try {
        const { id } = await getUserSession();

        const schema = z.object({
            category: z.string().optional(),
            name: z.string(),
            type: z.string(),
            thickness: z.number().int().optional(),
            size: z.string().optional(),
            unit: z.string().optional(),
            piecesInPackage: z.number().optional(),
            packagePrice: z.number().optional(),
            unitPrice: z.number().optional(),
            description: z.string().optional(),
            supplierId: z.string(),
        });

        const validatedData = schema.parse(material);

        const updatedMaterial = await prisma.material.update({
            where: {
                id: material.id,
            },
            data: {
                ...validatedData,
                userId: id,
            },
            include: {
                supplier: true,
            },
        });

        return updatedMaterial;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default UPDATE;
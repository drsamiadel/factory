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

        const schema = z.object({
            category: z.string().optional(),
            name: z.string().min(1),
            type: z.string().min(1),
            thickness: z.number().optional(),
            size: z.string().optional(),
            unit: z.string().optional(),
            piecesInPackage: z.number().optional(),
            packagePrice: z.number().optional(),
            unitPrice: z.number().optional(),
            description: z.string().optional(),
            supplier: z.string()
        });

        const validatedData = schema.parse(material);

        const updatedMaterial = await prisma.material.update({
            where: {
                id: material.id,
            },
            data: {
                userId: id,
                category: validatedData.category,
                name: validatedData.name,
                type: validatedData.type,
                thickness: validatedData.thickness,
                size: validatedData.size,
                unit: validatedData.unit,
                piecesInPackage: validatedData.piecesInPackage,
                packagePrice: validatedData.packagePrice,
                unitPrice: validatedData.unitPrice,
                description: validatedData.description,
                supplierId: validatedData.supplier,
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
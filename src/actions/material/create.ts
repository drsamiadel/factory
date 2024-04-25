"use server";

import { Material } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";

const CREATE = async (
    material: Partial<Material>
): Promise<Partial<Material>> => {
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

        const createdMaterial = await prisma.material.create({
            data: {
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
                userId: id,
            },
            include: {
                supplier: true,
            }
        });

        return createdMaterial;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default CREATE;
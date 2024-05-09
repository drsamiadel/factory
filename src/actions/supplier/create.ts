"use server";

import { Supplier } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const CREATE = async (
    supplier: Partial<Supplier>
): Promise<Partial<Supplier> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            companyName: z.string().min(3).max(255),
            managerName: z.string().max(255),
            vatNumber: z.string().max(255),
            crNumber: z.string().max(255),
            phone1: z.string().max(255),
            phone2: z.string().max(255),
            fax: z.string().max(255),
            email: z.string().max(255),
            address: z.string().max(255),
            location: z.string().max(255),
            dealingType: z.string().max(255).default("cash"),
        });

        const validatedData = schema.parse(supplier);

        const createdSupplier = await prisma.supplier.create({
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return createdSupplier;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default CREATE;
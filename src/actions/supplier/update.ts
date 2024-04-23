"use server";

import { Supplier } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";

const UPDATE = async (
    supplier: Partial<Supplier>
): Promise<Partial<Supplier>> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            companyName: z.string().min(3).max(255),
            managerName: z.string().min(3).max(255),
            vatNumber: z.string().max(255),
            crNumber: z.string().max(255),
            phone1: z.string().max(255),
            phone2: z.string().max(255),
            fax: z.string().max(255),
            email: z.string().max(255),
            address: z.string().max(255),
            location: z.string().max(255),
            dealingType: z.string().max(255),
        });

        const validatedData = schema.parse(supplier);


        const updatedSupplier = await prisma.supplier.update({
            where: {
                id: supplier.id,
            },
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return updatedSupplier;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default UPDATE;
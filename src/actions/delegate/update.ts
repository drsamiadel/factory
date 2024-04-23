"use server";

import { Delegate } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";

const UPDATE = async (
    delegate: Partial<Delegate>
): Promise<Partial<Delegate>> => {
    try {
        const { id } = await getUserSession();

        const schema = z.object({
            name: z.string().min(3).max(255),
            type: z.string().min(3).max(255),
            phone1: z.string().max(255),
            phone2: z.string().max(255),
            email: z.string().max(255),
            address: z.string().max(255),
            location: z.string().max(255),
            dealingType: z.string().max(255),
        });

        const validatedData = schema.parse(delegate);

        const updatedDelegate = await prisma.delegate.update({
            where: {
                id: delegate.id,
            },
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return updatedDelegate;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default UPDATE;
"use server";

import { Delegate } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user-session";

const CREATE = async (
    delegate: Partial<Delegate>
): Promise<Partial<Delegate>> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            name: z.string().min(3).max(255),
            type: z.string().min(3).max(255),
            phone1: z.string().min(3).max(255),
            phone2: z.string().min(3).max(255),
            email: z.string().email().min(3).max(255),
            address: z.string().min(3).max(255),
            location: z.string().min(3).max(255),
            dealingType: z.string().min(3).max(255),
        });

        const validatedData = schema.parse(delegate);

        const createdDelegate = await prisma.delegate.create({
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return createdDelegate;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default CREATE;
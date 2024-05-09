"use server";

import { Delegate } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const CREATE = async (
    delegate: Partial<Delegate>
): Promise<Partial<Delegate> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            name: z.string().min(3).max(255),
            type: z.string().max(255).default("freelancer"),
            phone1: z.string().max(255),
            phone2: z.string().max(255),
            email: z.string().max(255),
            address: z.string().max(255),
            location: z.string().max(255),
            dealingType: z.string().max(255).default("cash"),
        });

        const validatedData = schema.parse(delegate);

        const createdDelegate = await prisma.delegate.create({
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return createdDelegate;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default CREATE;
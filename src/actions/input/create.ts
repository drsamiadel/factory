"use server";

import { Input } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";
import generateCode from "../../lib/generate-code";

const CREATE = async (
    input: Partial<Input>
): Promise<Partial<Input> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            code: z.string().max(20),
            name: z.string().min(3),
            images: z.array(z.string()),
            structure: z.object({
                peices: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    fields: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        key: z.string(),
                        value: z.number().default(0),
                    })),
                    equation: z.object({
                        width: z.string(),
                        height: z.string(),
                    })
                }))
            })
        });

        const validatedData = schema.parse(input);

        const createdInput = await prisma.input.create({
            data: {
                ...validatedData,
                code: generateCode("INP"),
                userId: id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return createdInput;
    } catch (error) {
        return {
            error: {
                message: getErrorMessage(error),
            },
        }
    }
};

export default CREATE;
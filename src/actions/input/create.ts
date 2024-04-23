"use server";

import { Input } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";

const CREATE = async (
    input: Partial<Input>
): Promise<Partial<Input>> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            code: z.string().min(3).max(20),
            name: z.string().min(3),
            images: z.array(z.object({
                id: z.string(),
                url: z.string(),
            })),
            structure: z.object({
                peices: z.array(z.object({
                    id: z.string(),
                    name: z.string().min(1),
                    fields: z.array(z.object({
                        id: z.string(),
                        name: z.string().min(1),
                        key: z.string(),
                        value: z.number(),
                    })),
                    equation: z.object({
                        width: z.string().min(1),
                        height: z.string().min(1),
                    })
                }))
            })
        });

        const validatedData = schema.parse(input);

        const filteredImages = validatedData.images.map(({ id, url }) => ({ url }));

        const createdInput = await prisma.input.create({
            data: {
                ...validatedData,
                userId: id,
                images: {
                    createMany: {
                        data: filteredImages
                    }
                },
            },
            include: {
                images: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return createdInput;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default CREATE;
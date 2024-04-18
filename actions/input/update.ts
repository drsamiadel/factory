"use server";

import { Input } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user-session";

const UPDATE = async (
    input: Partial<Input>
): Promise<Partial<Input>> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            code: z.string(),
            name: z.string(),
            images: z.array(z.object({
                id: z.string(),
                url: z.string(),
            })),
            structure: z.object({
                peices: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    fields: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        key: z.string(),
                        value: z.number(),
                    })),
                    equation: z.object({
                        width: z.string(),
                        height: z.string(),
                    })
                }))
            })
        });

        const validatedData = schema.parse(input);

        const filteredImages = validatedData.images.map(({ id, url }) => ({ url }));

        const updatedInput = await prisma.input.update({
            where: {
                id: input.id as string,
            },
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

        return updatedInput;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default UPDATE;
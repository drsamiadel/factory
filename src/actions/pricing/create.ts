"use server";

import { Pricing } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";
import generateCode from "@/lib/generate-code";


const CREATE = async (
    pricing: Partial<Pricing>
): Promise<Partial<Pricing> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();
        const inputId = (pricing.structure as any).input.id || null;
        const createdPricing = await prisma.pricing.create({
            data: {
                ...(pricing as any),
                code: generateCode("QUT"),
                inputId,
                userId: id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                    },
                },
                input: {
                    select: {
                        name: true,
                        code: true,
                    }
                }
            },
        });

        return createdPricing;
    } catch (error) {
        console.error(error);
        return {
            error: {
                message: getErrorMessage(error),
            },
        };
    }
};

export default CREATE;

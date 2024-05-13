"use server";

import { Pricing } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";
import generateCode from "../../lib/generate-code";

const UPDATE = async (
    pricing: Partial<Pricing>
): Promise<Partial<Pricing> | { error: { message: string } }> => {
    try {
        const { id } = await getUserSession();
        const inputId = (pricing.structure as any).input.id || null;

        const updatedPricing = await prisma.pricing.update({
            where: {
                id: pricing.id,
            },
            data: {
                description: pricing.description,
                code: pricing.code === "" ? generateCode("QUT") : pricing.code,
                structure: pricing.structure || undefined,
                customerId: pricing.customerId,
                total: pricing.total,
                totalCost: pricing.totalCost,
                discount: pricing.discount,
                vat: pricing.vat,
                profit: pricing.profit,
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
                        companyName: true,
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

        return updatedPricing;
    } catch (error) {
        console.error(error);
        return {
            error: {
                message: getErrorMessage(error),
            },
        };
    }
};

export default UPDATE;

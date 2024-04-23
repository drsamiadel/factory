"use server";

import { Customer } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user-session";

const UPDATE = async (
    customer: Partial<Customer>
): Promise<Partial<Customer>> => {
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
            email: z.string().max(255).optional(),
            address: z.string().max(255),
            location: z.string().max(255),
            dealingType: z.string().max(255),
        });

        const validatedData = schema.parse(customer);

        const updatedCustomer = await prisma.customer.update({
            where: {
                id: customer.id,
            },
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return updatedCustomer;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default UPDATE;
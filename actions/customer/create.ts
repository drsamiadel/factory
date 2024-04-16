"use server";

import { Customer } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "../../src/hooks/get-user.session";

const CREATE = async (
    customer: Partial<Customer>
): Promise<Partial<Customer>> => {
    try {
        const { id } = await getUserSession();
        const schema = z.object({
            companyName: z.string().min(3).max(255),
            managerName: z.string().min(3).max(255),
            vatNumber: z.string().min(3).max(255),
            crNumber: z.string().min(3).max(255),
            phone1: z.string().min(3).max(255),
            phone2: z.string().max(255),
            fax: z.string().min(3).max(255),
            email: z.string().email().min(3).max(255),
            address: z.string().min(3).max(255),
            location: z.string().min(3).max(255),
            dealingType: z.string().min(3).max(255),
        });

        const validatedData = schema.parse(customer);

        const createdCustomer = await prisma.customer.create({
            data: {
                ...validatedData,
                userId: id,
            },
        });

        return createdCustomer;
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default CREATE;
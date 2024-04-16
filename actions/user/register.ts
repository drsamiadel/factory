"use server";

import { User } from "@prisma/client";
import * as z from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db/prisma";

const REGISTER = async (
    user: Partial<User>
): Promise<{ email: string; password: string }> => {
    try {
        const schema = z.object({
            name: z.string().trim().min(2).max(30),
            email: z.string().email(),
            password: z.string().min(8).max(40),
        });

        const validatedData = schema.parse(user);

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const userExists = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
            },
        });

        if (userExists) {
            throw new Error("User already exists");
        }

        const createdUser = await prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
        });

        return {
            email: createdUser.email as string,
            password: validatedData.password as string
        }
    } catch (error: Error | any) {
        throw new Error(error);
    }
};

export default REGISTER;
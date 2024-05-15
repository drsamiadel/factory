"use server";

import { SiteInfo } from "@prisma/client";
import * as z from "zod";
import { prisma } from "@/lib/db/prisma";
import { getUserSession } from "@/hooks/get-user-session";
import { getErrorMessage } from "@/lib/get-error-message";

const UPDATE = async (
  siteInfo: Partial<SiteInfo>
): Promise<Partial<SiteInfo> | { error: { message: string } }> => {
  try {
    const { id } = await getUserSession();
    const schema = z.object({
      companyName: z.string().optional(),
      logo: z.string().optional(),
      phone1: z.string().optional(),
      phone2: z.string().optional(),
      fax: z.string().optional(),
      CRNumber: z.string().optional(),
      VATNumber: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      location: z.string().optional(),
    });

    const validatedData = schema.parse(siteInfo);

    const updatedInfo = await prisma.siteInfo.update({
      where: {
        id: siteInfo.id,
      },
      data: {
        ...validatedData,
      },
    });

    return updatedInfo;
  } catch (error) {
    return {
      error: {
        message: getErrorMessage(error),
      },
    };
  }
};

export default UPDATE;

import { Customer, Image, Input, Pricing, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { NextURL } from "next/dist/server/web/next-url";

export const dynamic = "force-dynamic";

interface ExtededRequest extends NextRequest {
  nextUrl: NextURL & {
    searchParams: URLSearchParams;
  };
}

interface PricingWithUserAndCustomer extends Pricing {
  user: Partial<User>;
  customer: Partial<Customer>;
}

interface PricingWithPages {
  inputs: PricingWithUserAndCustomer[];
  totalPages: number;
}

export async function GET(
  request: ExtededRequest,
  response: NextResponse<PricingWithPages | { message: string }>
) {
  const { searchParams } = request.nextUrl;

  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const filterByName = searchParams.get("filterByName") || "";
  const sorting = searchParams.get("sorting") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const expanded = !!(searchParams.get("expanded") === "true");

  try {
    const count = await prisma.pricing.count({
      where: {
        code: {
          contains: filterByName,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(count / +limit);

    if (Number(page) < 1 || (Number(page) > totalPages && totalPages !== 0)) {
      return new Response("#API: pricing - Invalid page number", {
        status: 400,
      });
    }

    const skip = (Number(page) - 1) * +limit;

    const pricings = await prisma.pricing.findMany({
      where: {
        code: {
          contains: filterByName,
          mode: "insensitive",
        },
      },
      orderBy: {
        [sorting]: order === "asc" ? "asc" : "desc",
      },
      skip,
      take: +limit,
      include: {
        user: {
          select: {
            name: true,
            email: expanded,
          },
        },
        customer: {
          select: {
            id: true,
            companyName: true,
            phone1: true,
            email: true,
            code: true,
          },
        },
        input: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    return new Response(JSON.stringify({ pricings, totalPages }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("#API: pricing - Internal server error", {
      status: 500,
    });
  }
}

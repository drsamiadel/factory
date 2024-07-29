import { Image, Input, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { NextURL } from "next/dist/server/web/next-url";

export const dynamic = "force-dynamic";

interface ExtededRequest extends NextRequest {
  nextUrl: NextURL & {
    searchParams: URLSearchParams;
  };
}

interface InputsWithUserAndImagesAndTotalPages {
  inputs: (Partial<Input> & {
    images: Partial<Image>[];
    user: Partial<User>;
  })[];
  totalPages: number;
  count: number;
}

export async function GET(
  request: ExtededRequest,
  response: NextResponse<
    InputsWithUserAndImagesAndTotalPages | { message: string }
  >
) {
  const { searchParams } = request.nextUrl;

  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const filterByName = searchParams.get("filterByName") || "";
  const filterByCategory = searchParams.get("filterByCategory") || "";
  const sorting = searchParams.get("sorting") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const expanded = !!(searchParams.get("expanded") === "true");

  try {
    const count = await prisma.input.count({
      where: {
        OR: [
          {
            name: {
              contains: filterByName,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: filterByCategory,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    const totalPages = Math.ceil(count / +limit);

    if (Number(page) < 1 || (Number(page) > totalPages && totalPages !== 0)) {
      return new Response("#API: input - Invalid page number", { status: 400 });
    }

    const skip = (Number(page) - 1) * +limit;

    const inputs = await prisma.input.findMany({
      where: {
        OR: [
          {
            name: {
              contains: filterByName,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: filterByCategory,
              mode: "insensitive",
            },
          },
        ],
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
      },
    });
    return new Response(JSON.stringify({ inputs, totalPages, count }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("#API: input - Internal server error", { status: 500 });
  }
}

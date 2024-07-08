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

export async function GET(
  request: ExtededRequest,
  response: NextResponse<string[] | { message: string }>
) {
  try {
    const categories = await prisma.input.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categoriesList = categories
      .filter((category) => category.category !== null)
      .map((category) => category.category);

    return new Response(JSON.stringify(categoriesList), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("#API: input category - Internal server error", {
      status: 500,
    });
  }
}

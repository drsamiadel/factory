import { SiteInfo } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  response: NextResponse<Partial<SiteInfo> | { message: string }>
) {
  try {
    const siteInfo = await prisma.siteInfo.findFirst();

    return new Response(JSON.stringify({ siteInfo }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("#API: siteinfo - Internal server error", {
      status: 500,
    });
  }
}

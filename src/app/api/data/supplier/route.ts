import { Supplier } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { NextURL } from 'next/dist/server/web/next-url';

export const dynamic = 'force-dynamic'

interface ExtededRequest extends NextRequest {
    nextUrl: NextURL & {
        searchParams: URLSearchParams;
    };
}

interface InputsWithUserAndImagesAndTotalPages {
    suppliers: Supplier[];
    totalPages: number;
}

export async function GET(request: ExtededRequest, response: NextResponse<InputsWithUserAndImagesAndTotalPages | { message: string }>) {

    const { searchParams } = request.nextUrl;

    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;
    const filterByName = searchParams.get('filterByName') || '';
    const sorting = searchParams.get('sorting') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const expanded = !!(searchParams.get('expanded') === 'true');

    try {
        const count = await prisma.supplier.count({
            where: {
                OR: [
                    {
                        companyName: {
                            contains: filterByName,
                            mode: 'insensitive'
                        }
                    },
                    {
                        managerName: {
                            contains: filterByName,
                            mode: 'insensitive'

                        }
                    },
                ]
            }
        });

        const totalPages = Math.ceil(count / +limit);

        if (Number(page) < 1 || (Number(page) > totalPages && totalPages !== 0)) {
            return new Response('#API: input - Invalid page number', { status: 400 });
        }

        const skip = (Number(page) - 1) * +limit;

        const suppliers = await prisma.supplier.findMany({
            where: {
                OR: [
                    {
                        companyName: {
                            contains: filterByName,
                            mode: 'insensitive'
                        }
                    },
                    {
                        managerName: {
                            contains: filterByName,
                            mode: 'insensitive'
                        }
                    },
                ]
            },
            skip,
            take: +limit,
            orderBy: {
                [sorting]: order
            }
        });

        return new Response(JSON.stringify({ suppliers, totalPages }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('#API: input - Internal server error', { status: 500 });
    }
}
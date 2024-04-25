import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    // get form data
    const formData = await req.formData();

    // get all files
    const files = formData.getAll("files") as File[];

    const api = new UTApi();

    // upload files

    const uploadedFiles = await api.uploadFiles(files);
    console.log(uploadedFiles);
    // return response

    return NextResponse.json(uploadedFiles);
}
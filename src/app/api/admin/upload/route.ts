import { NextResponse } from "next/server";
import { uploadToNeonStorage } from "@/lib/neon-storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Nenhum arquivo recebido." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToNeonStorage(
      file.name,
      buffer,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Erro no upload para Neon Storage:", error);
    return NextResponse.json(
      { message: error?.message || "Falha ao processar o upload." },
      { status: 500 }
    );
  }
}

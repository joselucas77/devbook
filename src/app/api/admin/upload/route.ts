import { NextResponse } from "next/server";
import { uploadToNeonStorage } from "@/lib/neon-storage";
import { optimizeImage } from "@/lib/image-optimizer";

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

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Otimização inteligente: converte para WebP (se raster), redimensiona para no máx 1200px e comprime
    const optimized = await optimizeImage(
      rawBuffer,
      file.type || "",
      file.name
    );

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const targetFileName = `${baseName}.${optimized.extension}`;

    const publicUrl = await uploadToNeonStorage(
      targetFileName,
      optimized.buffer,
      optimized.contentType
    );

    return NextResponse.json({
      url: publicUrl,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savingsPercent: optimized.savingsPercent,
    });
  } catch (error: unknown) {
    console.error("Erro no upload para Neon Storage:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Falha ao processar o upload.",
      },
      { status: 500 }
    );
  }
}

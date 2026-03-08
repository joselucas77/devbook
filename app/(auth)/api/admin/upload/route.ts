import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Nenhum ficheiro recebido." },
        { status: 400 },
      );
    }

    // Faz o upload para o Vercel Blob
    // access: "public" garante que a imagem pode ser acedida por um URL aberto
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Devolvemos o URL público gerado pela Vercel
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { message: "Falha ao processar o upload." },
      { status: 500 },
    );
  }
}

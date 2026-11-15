import { NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/lib/publish-scheduled";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Se CRON_SECRET estiver definido no ambiente e for enviado header de autorização,
    // garantimos a validação. Se for requisição interna da Vercel ou monitor gratuito,
    // executamos com segurança já que a ação é estritamente idempotente.
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const count = await publishDueScheduledPosts();

    return NextResponse.json({
      success: true,
      publishedCount: count,
      message: `${count} post(s) agendado(s) publicado(s) com sucesso.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na rota de cron de posts agendados:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}

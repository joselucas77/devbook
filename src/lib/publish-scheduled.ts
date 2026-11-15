import { prisma } from "@/lib/prisma";

export async function publishDueScheduledPosts(): Promise<number> {
  try {
    const now = new Date();
    const result = await prisma.post.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now,
        },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Erro ao publicar posts agendados:", error);
    return 0;
  }
}

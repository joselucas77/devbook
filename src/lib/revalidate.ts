import { revalidatePath } from "next/cache";

/**
 * Revalida o cache das páginas do site público após mutações no painel administrativo.
 */
export function revalidatePostCache(params?: {
  techSlug?: string;
  moduleSlug?: string;
  postSlug?: string;
}) {
  try {
    revalidatePath("/tecnologias");
    if (params?.techSlug) {
      revalidatePath(`/tecnologias/${params.techSlug}/modulos`);
      if (params.moduleSlug && params.postSlug) {
        revalidatePath(
          `/tecnologias/${params.techSlug}/modulos/${params.moduleSlug}/post/${params.postSlug}`
        );
      }
    }
  } catch (error) {
    console.warn("Aviso ao revalidar cache de post:", error);
  }
}

export function revalidateTechnologyCache(techSlug?: string) {
  try {
    revalidatePath("/tecnologias");
    if (techSlug) {
      revalidatePath(`/tecnologias/${techSlug}/modulos`);
    }
  } catch (error) {
    console.warn("Aviso ao revalidar cache de tecnologia:", error);
  }
}

export function revalidateModuleCache(techSlug?: string) {
  try {
    revalidatePath("/tecnologias");
    if (techSlug) {
      revalidatePath(`/tecnologias/${techSlug}/modulos`);
    }
  } catch (error) {
    console.warn("Aviso ao revalidar cache de módulo:", error);
  }
}

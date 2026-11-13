import sharp from "sharp";

export interface OptimizedImageResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
}

/**
 * Otimiza imagens para a web usando Sharp:
 * - SVGs: preserva o formato vetorial original intacto (vetorial e leve).
 * - Imagens raster (PNG, JPEG, WebP, etc.):
 *   - Auto-orientação EXIF (fotos de câmera/celular).
 *   - Redimensiona proporcionalmente para no máximo 1200x1200px (sem ampliar imagens menores).
 *   - Converte para WebP com qualidade 82 e esforço 4 (alta fidelidade visual com compressão de até 90%+).
 *   - Preserva transparência (canal alpha).
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<OptimizedImageResult> {
  const originalSize = inputBuffer.length;

  // Preserva SVGs sem converter para raster
  const isSvg =
    mimeType.includes("svg") ||
    fileName.toLowerCase().endsWith(".svg") ||
    inputBuffer.toString("utf-8", 0, 100).includes("<svg");

  if (isSvg) {
    return {
      buffer: inputBuffer,
      contentType: "image/svg+xml",
      extension: "svg",
      originalSize,
      optimizedSize: originalSize,
      savingsPercent: 0,
    };
  }

  try {
    const pipeline = sharp(inputBuffer, { failOn: "none" })
      .rotate() // Respeita orientação EXIF
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 4,
      });

    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedSize = optimizedBuffer.length;
    const savingsPercent =
      originalSize > 0
        ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
        : 0;

    return {
      buffer: optimizedBuffer,
      contentType: "image/webp",
      extension: "webp",
      originalSize,
      optimizedSize,
      savingsPercent,
    };
  } catch (error) {
    console.warn("Aviso: Falha ao otimizar imagem com sharp. Usando arquivo original:", error);
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    return {
      buffer: inputBuffer,
      contentType: mimeType || "application/octet-stream",
      extension: ext,
      originalSize,
      optimizedSize: originalSize,
      savingsPercent: 0,
    };
  }
}

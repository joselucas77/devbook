import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.NEON_STORAGE_BUCKET || "images";
const REGION = process.env.AWS_REGION || "us-east-2";
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;

export function getS3Client() {
  if (
    !ENDPOINT ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new Error("Credenciais do Neon Object Storage não configuradas em .env");
  }

  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

export async function uploadToNeonStorage(
  fileName: string,
  buffer: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const s3 = getS3Client();

  const ext = fileName.split(".").pop() || "png";
  const cleanName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");
  const uniqueKey = `uploads/${Date.now()}-${cleanName}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${ENDPOINT}/${BUCKET_NAME}/${uniqueKey}`;
}

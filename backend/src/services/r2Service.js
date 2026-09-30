const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "torbit";
const publicUrl = process.env.R2_PUBLIC_URL || "";

let s3Client = null;

if (accountId && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

/**
 * Uploads a file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {string} folder
 * @returns {Promise<{ fileUrl: string, fileName: string, key: string }>}
 */
async function uploadToR2(fileBuffer, originalName, mimeType, folder = "resumes") {
  if (!s3Client) {
    throw new Error("Cloudflare R2 is not configured properly in environment.");
  }

  const safeName = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const key = `${folder}/${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType
  });

  await s3Client.send(command);

  const fileUrl = `${publicUrl.replace(/\/+$/, "")}/${key}`;

  return {
    fileUrl,
    fileName: originalName,
    key
  };
}

module.exports = {
  uploadToR2,
  isR2Configured: () => Boolean(s3Client)
};

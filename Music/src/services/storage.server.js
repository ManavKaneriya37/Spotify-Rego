import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../config/config.js";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(file) {
  const filename = file.originalname;
  const key = `${uuidv4()}.${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.AWS_S3_BUCKET,
    Body: file.buffer,
    Key: key,
  });

  await s3.send(command);

  return key;
}

export async function getPresignedUrl(key) {
    
  const command = new GetObjectCommand({
    Bucket: config.AWS_S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 60 * 24,
  });

  return url;
}

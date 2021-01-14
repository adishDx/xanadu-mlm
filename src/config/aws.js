import { S3 } from "aws-sdk";
import { config } from "dotenv";

config();

export const BUCKET_NAME = process.env.AWS_BUCKET;
const s3 = new S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

export default s3;

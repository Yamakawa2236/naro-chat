import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

const awsRegion = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const bedrockModelId = process.env.BEDROCK_MODEL_ID;

if (!awsRegion) {
    console.warn('AWS_REGION environment variable is not set. Defaulting to us-east-1.');
}
if (!accessKeyId || !secretAccessKey) {
    console.warn('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY environment variable is not set. AWS SDK might rely on other credential providers (e.g., EC2 instance profile, environment variables).');
}
if (!bedrockModelId) {
    throw new Error('BEDROCK_MODEL_ID environment variable is required.');
}

const credentialsConfig = (accessKeyId && secretAccessKey)
  ? { accessKeyId, secretAccessKey }
  : undefined;


export const bedrockClient = new BedrockRuntimeClient({
  region: awsRegion || 'us-east-1',
  credentials: credentialsConfig,
});

console.log(`AWS Bedrock Client configured for region: ${awsRegion || 'us-east-1'}`);
if (credentialsConfig) {
  console.log('Using provided AWS Access Key ID.');
} else {
  console.log('AWS credentials will be sourced from environment variables, shared credential file, or IAM role.');
}
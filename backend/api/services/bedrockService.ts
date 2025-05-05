import { InvokeModelCommand, BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { awsRegion, credentialsConfig, bedrockModelId } from '../config/awsConfig';

export class ModelNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelNotReadyError';
  }
}

interface BedrockResponseBody {
    generation?: string;
    completion?: string;
    outputs?: Array<{ text?: string; [key: string]: any }>;
    [key: string]: any;
}

const createBedrockClient = () => {
  console.log('Creating a new BedrockRuntimeClient instance...');
  return new BedrockRuntimeClient({
      region: awsRegion || 'us-east-1',
      credentials: credentialsConfig,
  });
};


export const bedrockService = {
  async generateResponse(message: string): Promise<string> {
    if (!bedrockModelId) {
        throw new Error('Bedrock Model ID is not configured.');
    }

    let bedrockClient = createBedrockClient();
    const maxRetries = 2;
    let currentRetry = 0;
    let delay = 1500;

    while(currentRetry <= maxRetries) {
      try {
        console.log(`Attempt ${currentRetry + 1}/${maxRetries + 1}: Generating response...`);

        const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

        const params = {
          modelId: bedrockModelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: prompt,
            max_gen_len: 2048,
            // temperature: 0.7,
            // top_p: 0.9,
          }),
        };

        console.log('Sending request to AWS Bedrock with params:', JSON.stringify({ modelId: params.modelId, body: params.body }, null, 2));

        const command = new InvokeModelCommand(params);
        const response = await bedrockClient.send(command);

        console.log('Received response from AWS Bedrock');

        try {
          const responseText = new TextDecoder().decode(response.body);
          console.log('Raw response text:', responseText);

          const responseBody = JSON.parse(responseText) as BedrockResponseBody;
          console.log('Parsed response body:', JSON.stringify(responseBody, null, 2));

          let generatedText: string | undefined;
          if (responseBody.generation) {
            generatedText = responseBody.generation;
          } else if (responseBody.completion) {
            generatedText = responseBody.completion;
          } else if (responseBody.outputs && responseBody.outputs[0]?.text) {
            generatedText = responseBody.outputs[0].text;
          }

          if (generatedText !== undefined) {
              return generatedText.trim();
          } else {
            console.error('Unexpected response format or empty response from model:', responseBody);
            return 'The AI model returned an unexpected response format.';
          }
        } catch (parseError) {
          console.error('Error parsing Bedrock response:', parseError);
          console.error('Raw response bytes:', response.body);
          return 'Error parsing the AI model response.';
        }
      } catch (error) {
        console.error('Bedrock API invocation error:', error);

        if (error instanceof Error) {
          console.error(`Attempt ${currentRetry + 1} failed:`, error);

          if (error.name === 'ModelNotReadyException' && currentRetry < maxRetries) {
            currentRetry++;
            console.log(`Model not ready. Re-creating client and retrying in ${delay}ms... (Retry ${currentRetry}/${maxRetries})`);
            bedrockClient = createBedrockClient();
            await new Promise(resolve => setTimeout(resolve, delay));
            throw new ModelNotReadyError('Model is not ready for inference. Wait and try your request again.');
          } else if (error.name === 'ModelNotReadyException' && currentRetry >= maxRetries) {
            console.error('Model still not ready after maximum retries.');
            throw new ModelNotReadyError('Model is not ready for inference even after client recreation and retries.');
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during Bedrock API call';
            throw new Error(`Error communicating with AWS Bedrock: ${errorMessage}`);
          }
        }
      }
    }
    throw new Error('Bedrock service failed unexpectedly after retry logic.');
  }
};
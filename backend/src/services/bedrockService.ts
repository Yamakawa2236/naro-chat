import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, bedrockModelId } from '@config/awsConfig';

interface BedrockResponseBody {
    generation?: string;
    completion?: string;
    outputs?: Array<{ text?: string; [key: string]: any }>;
    [key: string]: any;
}


export const bedrockService = {
  async generateResponse(message: string): Promise<string> {
    if (!bedrockModelId) {
        throw new Error('Bedrock Model ID is not configured.');
    }

    try {
      console.log('Generating response for message:', message);
      console.log('Using model ID:', bedrockModelId);

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
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if ((error as any).$metadata) {
          console.error('Error Metadata:', JSON.stringify((error as any).$metadata, null, 2));
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error during Bedrock API call';
      throw new Error(`Error communicating with AWS Bedrock: ${errorMessage}`);
    }
  }
};
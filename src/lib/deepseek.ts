import OpenAI from 'openai';

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
export const DEEPSEEK_VISION_MODEL = 'deepseek-chat'; // DeepSeek chat supports vision

// Lazy initialization - only create client when needed (not during build)
let deepseek: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!deepseek) {
    deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key-for-build',
      baseURL: 'https://api.deepseek.com',
    });
  }
  return deepseek;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface VisionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{type: 'text'; text: string} | {type: 'image_url'; image_url: {url: string}}>;
}

export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generate chat response using DeepSeek
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ChatResponse> {
  try {
    console.log('🟢 Using DeepSeek...');
    const client = getDeepSeekClient();
    const response = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    console.log('✅ DeepSeek succeeded');
    return {
      message: assistantMessage,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error('❌ DeepSeek failed:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Generate chat response with image using DeepSeek Vision
 */
export async function generateVisionChatResponse(
  messages: VisionMessage[],
  systemPrompt: string
): Promise<ChatResponse> {
  try {
    console.log('🟢 Using DeepSeek Vision...');
    const client = getDeepSeekClient();

    const response = await client.chat.completions.create({
      model: DEEPSEEK_VISION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ] as any,
      temperature: 0.8,
      max_tokens: 1500,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    console.log('✅ DeepSeek Vision succeeded');
    return {
      message: assistantMessage,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error('❌ DeepSeek Vision failed:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}

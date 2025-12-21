import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface GeminiVisionResponse {
  message: string;
}

/**
 * Analyze image and generate response using Gemini Vision
 */
export async function analyzeImageWithGemini(
  imageBase64: string,
  userMessage: string,
  systemPrompt: string,
  chatHistory: Array<{ role: string; content: string }>
): Promise<GeminiVisionResponse> {
  try {
    console.log('🔮 Using Gemini Vision...');
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extract base64 data and mime type
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image format');
    }
    const mimeType = matches[1];
    const base64Data = matches[2];

    // Build conversation context
    const historyContext = chatHistory
      .slice(-5)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Create prompt with system context
    const fullPrompt = `${systemPrompt}

## Recent Conversation:
${historyContext}

## Current Message:
The user sent an image with the message: "${userMessage}"

Look at the image and respond in character. React naturally to what you see in the image. Stay completely in character as defined in the system prompt above. Be flirty, playful, and engaging based on your persona.`;

    // Generate response with image
    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Vision succeeded');
    return { message: text };
  } catch (error) {
    console.error('❌ Gemini Vision failed:', error);
    throw new Error('Failed to analyze image. Please check your Gemini API key.');
  }
}

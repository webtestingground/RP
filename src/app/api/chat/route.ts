import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage } from '@/lib/deepseek';
import { analyzeImageWithGemini } from '@/lib/gemini';
import { getPersonaById, getDefaultPersona } from '@/personas';
import { getUserProfilePrompt } from '@/config/user-profile';

export async function POST(request: NextRequest) {
  try {
    const { message, history, personaId, image } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A valid message is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is not configured');
      return NextResponse.json(
        { success: false, error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Get the selected persona
    const persona = personaId ? getPersonaById(personaId) : getDefaultPersona();

    if (!persona) {
      return NextResponse.json(
        { success: false, error: 'Invalid persona selected' },
        { status: 400 }
      );
    }

    // Combine persona prompt with user profile
    const userProfilePrompt = getUserProfilePrompt();
    const systemPrompt = `${persona.systemPrompt}\n\n${userProfilePrompt}`;

    // Check if this request includes an image
    const hasImage = image && typeof image === 'string' && image.startsWith('data:image');

    let response;

    if (hasImage) {
      // Vision request with image - use Gemini
      console.log('📸 Processing image message with Gemini...');

      // Prepare chat history for context
      const chatHistory: Array<{ role: string; content: string }> = [];
      if (Array.isArray(history)) {
        for (const msg of history.slice(-5)) {
          if (msg && typeof msg === 'object' && msg.content && typeof msg.content === 'string') {
            chatHistory.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content.trim(),
            });
          }
        }
      }

      response = await analyzeImageWithGemini(
        image,
        message.trim() || 'What do you think of this?',
        systemPrompt,
        chatHistory
      );
    } else {
      // Regular text-only request
      const conversationHistory: ChatMessage[] = [];
      if (Array.isArray(history)) {
        for (const msg of history.slice(-10)) {
          if (msg && typeof msg === 'object' && msg.content && typeof msg.content === 'string') {
            const role = msg.role === 'user' ? 'user' : 'assistant';
            conversationHistory.push({
              role,
              content: msg.content.trim(),
            });
          }
        }
      }

      // Add current user message to history
      conversationHistory.push({
        role: 'user',
        content: message.trim(),
      });

      response = await generateChatResponse(conversationHistory, systemPrompt);
    }

    // Log the raw response to see what Diana is actually saying
    console.log(`📝 Diana's raw response: "${response.message}"`);

    // Parse for image tags
    let responseMessage = response.message;
    let imageTagRegex = /\[IMAGE:(\w+)\]/g;
    let match = imageTagRegex.exec(responseMessage);
    console.log(`🔍 Regex match result:`, match);

    // FALLBACK: If no tag found but persona is clearly responding to an image request
    if (!match && persona.images && !hasImage) {
      const userMessage = message.trim().toLowerCase();
      const responseText = responseMessage.toLowerCase();

      // Check if user asked for a picture
      const hasRequestKeyword =
        userMessage.includes('show') ||
        userMessage.includes('send') ||
        userMessage.includes('picture') ||
        userMessage.includes('pic') ||
        userMessage.includes('photo') ||
        userMessage.includes('yes') ||
        userMessage.includes('sure') ||
        userMessage.includes('please') ||
        userMessage.includes('ok');

      const hasResponseKeyword =
        responseText.includes('here you go') ||
        responseText.includes('here\'s') ||
        responseText.includes('here is') ||
        responseText.includes('look at') ||
        responseText.includes('enjoy') ||
        responseText.includes('hope you like') ||
        responseText.includes('just for you') ||
        responseText.includes('tell me what you think');

      // Check if user asked for a specific image type OR if it's a general photo request
      const contexts = Object.keys(persona.images);
      for (const context of contexts) {
        const mentionsContext = userMessage.includes(context) || context === 'photo';

        if (hasRequestKeyword && mentionsContext && hasResponseKeyword) {
          console.log(`🔧 FALLBACK: Auto-detected ${context} image request, adding tag`);
          responseMessage = responseMessage + ` [IMAGE:${context}]`;
          imageTagRegex.lastIndex = 0; // Reset regex
          match = imageTagRegex.exec(responseMessage);
          break;
        }
      }
    }

    let imageData = null;
    if (match) {
      const context = match[1];
      console.log(`🖼️ Image tag detected: [IMAGE:${context}]`);

      // Get persona's max count for this context
      const maxCount = persona?.images?.[context] || 0;
      console.log(`📊 Max count for ${context}: ${maxCount}`);

      if (maxCount > 0) {
        // Return context - frontend will determine image number and build URL
        imageData = {
          context,
          maxCount,
          personaId: persona.id,
          randomize: persona.randomizeImages || false,
        };
        console.log(`✅ Returning image data:`, imageData);

        // Remove tag from message
        responseMessage = responseMessage.replace(imageTagRegex, '').trim();
      } else {
        console.warn(`❌ Persona ${persona.id} requested unknown image context: ${context}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      image: imageData,
      usage: 'usage' in response ? response.usage : undefined,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

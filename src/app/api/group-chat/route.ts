import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage } from '@/lib/deepseek';
import { getPersonaById } from '@/personas';
import { getUserProfilePrompt } from '@/config/user-profile';

export async function POST(request: NextRequest) {
  try {
    const { message, history, personaIds } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A valid message is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(personaIds) || personaIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 personas are required for group chat' },
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

    // Get all selected personas
    const personas = personaIds.map((id: string) => getPersonaById(id)).filter(Boolean);

    if (personas.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid personas selected' },
        { status: 400 }
      );
    }

    const userProfilePrompt = getUserProfilePrompt();

    // Prepare conversation history
    const baseHistory: ChatMessage[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-15)) {
        if (msg && typeof msg === 'object' && msg.content && typeof msg.content === 'string') {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          baseHistory.push({
            role,
            content: msg.content.trim(),
          });
        }
      }
    }

    // Add current user message
    baseHistory.push({
      role: 'user',
      content: message.trim(),
    });

    // Generate responses from each persona
    const responses: { personaId: string; personaName: string; message: string; image?: any }[] = [];

    // Create group context for each persona
    const otherPersonaNames = personas.map((p: any) => p.name);

    for (const persona of personas) {
      if (!persona) continue;

      // Build group chat system prompt
      const groupContext = `
## GROUP CHAT CONTEXT
You are in a group chat with the user and other personas: ${otherPersonaNames.filter((n: string) => n !== persona.name).join(', ')}.
- Keep your responses SHORT (1-2 sentences max) since others are also responding
- Stay in character as ${persona.name}
- React naturally to what the user says
- You can reference or playfully compete with the other personas
- Be flirty and fun, each persona has their own style
`;

      const systemPrompt = `${persona.systemPrompt}\n\n${groupContext}\n\n${userProfilePrompt}`;

      // Generate response for this persona
      const response = await generateChatResponse(baseHistory, systemPrompt);

      let responseMessage = response.message;
      let imageData = null;

      // Parse for image tags
      const imageTagRegex = /\[IMAGE:(\w+)\]/g;
      const match = imageTagRegex.exec(responseMessage);

      if (match && persona.images) {
        const context = match[1];
        const maxCount = persona.images[context] || 0;

        if (maxCount > 0) {
          imageData = {
            context,
            maxCount,
            personaId: persona.id,
            randomize: persona.randomizeImages || false,
          };
          responseMessage = responseMessage.replace(imageTagRegex, '').trim();
        }
      }

      responses.push({
        personaId: persona.id,
        personaName: persona.name,
        message: responseMessage,
        image: imageData,
      });
    }

    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Group Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage } from '@/lib/deepseek';
import { analyzeImageWithGemini } from '@/lib/gemini';
import { getPersonaById } from '@/personas';
import { getUserProfilePrompt } from '@/config/user-profile';

export async function POST(request: NextRequest) {
  try {
    const { message, history, personaIds, image } = await request.json();

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
    const userMessage = message.toLowerCase();
    const hasImage = image && typeof image === 'string' && image.startsWith('data:image');

    // Prepare conversation history
    const baseHistory: ChatMessage[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
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

    // Determine who should respond based on context
    const personaNames = personas.map((p: any) => p.name.toLowerCase());
    let respondingPersonas = [...personas];

    // Check if user mentioned a specific name
    const mentionedPersona = personas.find((p: any) =>
      userMessage.includes(p.name.toLowerCase())
    );

    if (mentionedPersona) {
      // If user mentioned specific name, that persona responds
      // 70% chance only that persona, 30% chance both
      if (Math.random() < 0.7) {
        respondingPersonas = [mentionedPersona];
      }
    } else {
      // No specific name mentioned
      // 40% chance only one responds, 60% chance both respond
      if (Math.random() < 0.4) {
        // Pick one randomly
        const randomIndex = Math.floor(Math.random() * personas.length);
        respondingPersonas = [personas[randomIndex]];
      }
    }

    // Shuffle responding order for variety
    respondingPersonas = respondingPersonas.sort(() => Math.random() - 0.5);

    // Generate responses from selected personas
    const responses: { personaId: string; personaName: string; message: string; image?: any }[] = [];

    const otherPersonaNames = personas.map((p: any) => p.name);

    for (const persona of respondingPersonas) {
      if (!persona) continue;

      // Build group chat system prompt with relationship context
      const friendNames = otherPersonaNames.filter((n: string) => n !== persona.name).join(', ');

      const groupContext = `
## GROUP CHAT CONTEXT
You are ${persona.name} in a group chat with the user and your bestie ${friendNames}.

CRITICAL RULES - FOLLOW EXACTLY:
1. You are ONLY ${persona.name}. Respond ONLY as yourself.
2. DO NOT write "${friendNames}:" or any other name prefix in your response
3. DO NOT write dialogue for ${friendNames} - they will respond separately
4. DO NOT start your message with "${persona.name}:" - just write your message directly
5. Keep responses SHORT (1-2 sentences max)
6. Be flirty, fun, playful in YOUR unique style
7. You can mention ${friendNames} naturally (e.g., "Right, ${friendNames}?" or "She's so hot too!")

WRONG FORMAT (never do this):
"Ana: Maya: Let's do this..."
"${persona.name}: blah blah"

CORRECT FORMAT (do this):
"Mmm yes daddy! ${friendNames}, isn't he hot? 😈"
"I want him first! 💋"
`;

      const systemPrompt = `${persona.systemPrompt}\n\n${groupContext}\n\n${userProfilePrompt}`;

      // Generate response for this persona
      let response;
      if (hasImage) {
        // Use Gemini for image analysis
        const chatHistory = baseHistory.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        response = await analyzeImageWithGemini(
          image,
          message.trim() || 'What do you think of this?',
          systemPrompt,
          chatHistory
        );
      } else {
        response = await generateChatResponse(baseHistory, systemPrompt);
      }

      let responseMessage = response.message;

      // Clean up any accidental name prefixes the AI might have added
      const namePatterns = [
        /^(Ana|Maya|Lamis):\s*/gi,
        /^(Ana|Maya|Lamis):\s*(Ana|Maya|Lamis):\s*/gi,
        /^["']?(Ana|Maya|Lamis)["']?:\s*/gi,
      ];
      for (const pattern of namePatterns) {
        responseMessage = responseMessage.replace(pattern, '');
      }
      responseMessage = responseMessage.trim();
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

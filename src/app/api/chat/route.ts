import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage } from '@/lib/deepseek';
import { getPersonaById, getDefaultPersona } from '@/personas';
import { getUserProfilePrompt } from '@/config/user-profile';

export async function POST(request: NextRequest) {
  try {
    const { message, history, personaId } = await request.json();

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

    // Prepare conversation history with validation
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

    // Generate response
    const response = await generateChatResponse(conversationHistory, systemPrompt);

    return NextResponse.json({
      success: true,
      message: response.message,
      usage: response.usage,
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

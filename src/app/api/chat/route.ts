import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type ChatMessage } from '@/lib/deepseek';
import { getPersonaById, getDefaultPersona } from '@/personas';

export async function POST(request: NextRequest) {
  try {
    const { message, history, personaId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    // Get the selected persona
    const persona = personaId ? getPersonaById(personaId) : getDefaultPersona();

    if (!persona) {
      return NextResponse.json(
        { success: false, error: 'Invalid persona' },
        { status: 400 }
      );
    }

    const systemPrompt = persona.systemPrompt;

    // Prepare conversation history
    const conversationHistory: ChatMessage[] = Array.isArray(history)
      ? history.slice(-10).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }))
      : [];

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
        error: error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}

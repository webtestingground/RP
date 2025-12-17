import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { personaId, systemPrompt } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_ULTRAVOX_API_KEY;
    if (!apiKey) {
      console.error('❌ No Ultravox API key found');
      return NextResponse.json(
        { success: false, error: 'Ultravox API key not configured' },
        { status: 500 }
      );
    }

    console.log('🔑 Using Ultravox API key:', apiKey.substring(0, 10) + '...');
    console.log('📞 Creating Ultravox call with voice: 1769b283-36c6-4883-9c52-17bf75a29bc5');

    // Create Ultravox call session
    const ultravoxUrl = 'https://api.ultravox.ai/api/calls';
    const requestBody = {
      systemPrompt: systemPrompt,
      voice: '1769b283-36c6-4883-9c52-17bf75a29bc5',
      model: 'fixie-ai/ultravox',
      temperature: 0.8,
      firstSpeaker: 'FIRST_SPEAKER_USER',
      recordingEnabled: true, // Enable call recording
    };

    console.log('📤 Sending request to Ultravox:', ultravoxUrl);
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(ultravoxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Ultravox response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ultravox API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Ultravox API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📦 Ultravox response data:', JSON.stringify(data, null, 2));

    if (!data.joinUrl) {
      console.error('❌ No joinUrl in response:', data);
      return NextResponse.json(
        { success: false, error: 'No joinUrl received from Ultravox' },
        { status: 500 }
      );
    }

    console.log('✅ Ultravox session created successfully');
    console.log('🔗 Join URL:', data.joinUrl);
    console.log('🆔 Call ID:', data.callId);

    return NextResponse.json({
      success: true,
      joinUrl: data.joinUrl,
      callId: data.callId,
    });

  } catch (error: any) {
    console.error('❌ Ultravox route error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Ultravox session' },
      { status: 500 }
    );
  }
}

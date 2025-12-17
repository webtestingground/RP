import { NextRequest, NextResponse } from 'next/server';

// Get recording for a specific call
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Call ID required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_ULTRAVOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Ultravox API key not configured' },
        { status: 500 }
      );
    }

    console.log('🎙️ Fetching recording for call:', callId);

    // Get call details from Ultravox
    const response = await fetch(`https://api.ultravox.ai/api/calls/${callId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ultravox API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Failed to fetch call: ${response.status}` },
        { status: response.status }
      );
    }

    const callData = await response.json();
    console.log('📦 Call data:', JSON.stringify(callData, null, 2));

    // Check if recording exists
    if (!callData.recordingUrl) {
      return NextResponse.json(
        { success: false, error: 'No recording available for this call' },
        { status: 404 }
      );
    }

    console.log('✅ Recording found:', callData.recordingUrl);

    return NextResponse.json({
      success: true,
      recordingUrl: callData.recordingUrl,
      callId: callData.callId,
      duration: callData.duration,
      createdAt: callData.createdAt,
      transcript: callData.transcript || null,
    });

  } catch (error: any) {
    console.error('❌ Recording fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch recording' },
      { status: 500 }
    );
  }
}

// List all recordings
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ULTRAVOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Ultravox API key not configured' },
        { status: 500 }
      );
    }

    console.log('📋 Fetching all recordings');

    // Get all calls from Ultravox
    const response = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ultravox API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Failed to fetch calls: ${response.status}` },
        { status: response.status }
      );
    }

    const callsData = await response.json();
    console.log(`✅ Found ${callsData.calls?.length || 0} calls`);

    // Filter calls that have recordings
    const recordings = (callsData.calls || [])
      .filter((call: any) => call.recordingUrl)
      .map((call: any) => ({
        callId: call.callId,
        recordingUrl: call.recordingUrl,
        duration: call.duration,
        createdAt: call.createdAt,
        transcript: call.transcript || null,
      }));

    return NextResponse.json({
      success: true,
      recordings: recordings,
      total: recordings.length,
    });

  } catch (error: any) {
    console.error('❌ Recordings list error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}

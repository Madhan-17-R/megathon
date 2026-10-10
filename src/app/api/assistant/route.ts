import { NextResponse } from 'next/server';
import { validateAuthHeader } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const authResult = await validateAuthHeader(authHeader);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    if (!body || typeof body !== 'object' || !Array.isArray(body.messages) || !body.assessment) {
      return NextResponse.json({ success: false, error: 'Bad Request. Missing messages or assessment context.' }, { status: 400 });
    }

    const { messages, assessment } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Demo mock mode
      return NextResponse.json({
        success: true,
        message: "I am your AI Green Home Advisor (Demo Mode). I can help answer questions about your verified components once the LLM API is configured!",
        mode: "mock"
      });
    }

    // Call OpenAI API (or similar)
    const systemPrompt = `You are an AI Green Home Advisor.
Explain the following assessment strictly based on the provided numbers. 
Do not invent retrofit savings, financial payback periods, or EPC ratings.
If a value is null or unavailable, explicitly state that it is unavailable.
Assessment context: ${JSON.stringify(assessment, null, 2)}`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.3
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error("OpenAI Error:", errorText);
      throw new Error("Failed to contact LLM provider");
    }

    const data = await openAiResponse.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      message: reply,
      mode: "live"
    });

  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process AI explanation request' },
      { status: 500 }
    );
  }
}

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
    if (!body || typeof body !== 'object' || !body.assessment) {
      return NextResponse.json({ success: false, error: 'Bad Request. Missing assessment context.' }, { status: 400 });
    }

    const { assessment, simulationResults } = body;

    // The ML Recommender requires actual simulation results and valid characteristics.
    // Since no ML dataset has been provided, we explicitly return a pending state
    // rather than inventing savings or financial payback numbers.
    
    // In demo mode without ML, we might return some static placeholders if 
    // the UI expects them, but the prompt says:
    // "Until the relevant recommendation rules and ranking formula are provided, 
    // expose an explicit pending/unconfigured state rather than generating a misleading ranked list."
    
    return NextResponse.json({
      success: true,
      status: "pending_unconfigured",
      message: "Recommendation ML engine not yet configured. Provide training data and ranking formula to activate.",
      recommendations: []
    });

  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process recommendations' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { calculateGreenHomeScore } from '@/lib/scoringEngine';
import { PropertyFormData } from '@/lib/types';
import { validatePropertyFormData, validateAuthHeader } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    const authResult = await validateAuthHeader(authHeader);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }

    const { valid, errors } = validatePropertyFormData(body);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Bad Request', details: errors }, { status: 400 });
    }

    // For now, we just exercise the authoritative scoring engine
    const form: PropertyFormData = body;
    
    // Check if we have real Supabase config
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    const assessment = calculateGreenHomeScore(form);

    if (hasSupabase) {
      // Stub: Here we would actually save `assessment` to postgres scoped to `authResult.user_id`
      console.log(`Would save to Supabase for user ${authResult.user_id}:`, assessment.id);
    }

    return NextResponse.json({ 
      success: true, 
      assessmentId: assessment.id,
      data: assessment,
      mode: hasSupabase ? 'live' : 'demo_local'
    });
    
  } catch (error) {
    console.error('Assessment API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}

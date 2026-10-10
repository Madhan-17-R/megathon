import { NextResponse } from 'next/server';
import { validateAuthHeader } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    const authResult = await validateAuthHeader(authHeader);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    
    // In a real app, save to Supabase public.properties
    // const supabase = createClient(...)
    // const { data } = await supabase.from('properties').insert(body).select().single();

    return NextResponse.json({
      success: true,
      propertyId: `mock-prop-${Date.now()}`,
      message: "Property created/updated successfully."
    });

  } catch (error) {
    console.error('Properties API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process property' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  const authResult = await validateAuthHeader(authHeader);
  if (!authResult.authorized) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
  }

  // Return properties for the authenticated user scoped to authResult.user_id
  return NextResponse.json({
    success: true,
    properties: []
  });
}

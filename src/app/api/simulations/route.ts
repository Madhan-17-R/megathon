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
    if (!body || typeof body !== 'object' || !body.propertyDetails || !Array.isArray(body.scenarios)) {
      return NextResponse.json({ success: false, error: 'Bad Request. Missing propertyDetails or scenarios array.' }, { status: 400 });
    }

    const { propertyDetails, scenarios } = body;

    const workerUrl = process.env.WORKER_API_URL;

    if (!workerUrl) {
      // Fallback: If no Python worker is configured, return an immediate mock response
      return NextResponse.json({
        success: true,
        job_id: `mock-job-${Date.now()}`,
        status: 'queued',
        message: 'No WORKER_API_URL configured. Mock job queued.'
      });
    }

    // Call the actual Python worker
    const response = await fetch(`${workerUrl}/api/jobs/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: `job-${Date.now()}`,
        property_details: propertyDetails,
        scenarios: scenarios
      })
    });

    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      job_id: data.job_id,
      status: 'queued'
    });

  } catch (error) {
    console.error('Simulation API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to queue simulation job' },
      { status: 500 }
    );
  }
}

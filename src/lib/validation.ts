export function validatePropertyFormData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body. Expected JSON object.'] };
  }
  
  const obj = data as Record<string, unknown>;

  const requiredStrings = [
    'propertyName', 'propertyType', 'postcode', 'wallType',
    'glazingScoreCombination', 'heatingEfficiencyCategory', 
    'epcRating'
  ];

  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string') {
      errors.push(`Missing or invalid field: ${field} (expected string)`);
    }
  }

  const requiredNumbers = [
    'constructionYear', 'roofInsulationScore', 'wallInsulationScore', 'floorInsulationScore',
    'floorArea', 'annualElectricityKwh', 'annualGasKwh',
    'annualRenewableEnergyUsedOnSiteKwh', 'totalAnnualPropertyEnergyConsumptionKwh'
  ];

  for (const field of requiredNumbers) {
    if (typeof obj[field] !== 'number' && obj[field] !== "") {
      errors.push(`Missing or invalid field: ${field} (expected number or empty string)`);
    }
  }

  const requiredBooleans = [
    'hasSmartMeter', 'hasSmartThermostat', 'hasAutomatedLighting',
    'hasEnergyMonitoring', 'hasAutomatedOptimization'
  ];

  for (const field of requiredBooleans) {
    if (typeof obj[field] !== 'boolean') {
      errors.push(`Missing or invalid field: ${field} (expected boolean)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function validateAuthHeader(authHeader: string | null): Promise<{ authorized: boolean; error?: string; status?: number; user_id?: string }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    if (isProd) {
      return { authorized: false, error: 'Service Unavailable. Missing database configuration in production.', status: 503 };
    }
    // Explicit local demo mode
    return { authorized: true, user_id: 'demo-local-user-123' };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Unauthorized. Missing or invalid credentials.', status: 401 };
  }

  try {
    // Validate token against Supabase Auth API
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'apikey': anonKey
      }
    });

    if (!res.ok) {
      return { authorized: false, error: 'Unauthorized. Invalid or expired token.', status: 401 };
    }

    const userData = await res.json();
    if (!userData || !userData.id) {
      return { authorized: false, error: 'Unauthorized. Malformed token payload.', status: 401 };
    }

    return { authorized: true, user_id: userData.id };
  } catch (error) {
    console.error('Auth Validation Error:', error);
    return { authorized: false, error: 'Internal Server Error during authentication.', status: 500 };
  }
}

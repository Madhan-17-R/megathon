// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import assert from 'assert';
import { calculateGreenHomeScore } from './src/lib/scoringEngine';
import { PropertyFormData } from './src/lib/types';

// Helper to get a full valid mock
function getValidMock(): PropertyFormData {
  return {
    propertyName: "Test House",
    propertyType: "detached",
    postcode: "SW1A 1AA",
    constructionYear: 2010,
    wallType: "cavity",
    floorArea: 100,
    epcRating: "C", // C = 70 => 70 * 0.25 = 17.5
    annualElectricityKwh: 3000,
    annualGasKwh: 7000,
    roofInsulationScore: 80,
    wallInsulationScore: 80,
    floorInsulationScore: 50,
    glazingScoreCombination: "double_good", // 80 => 80 * 0.10 = 8
    heatingEfficiencyCategory: "high", // 80 => 80 * 0.15 = 12
    annualRenewableEnergyUsedOnSiteKwh: 1000,
    totalAnnualPropertyEnergyConsumptionKwh: 10000,
    hasSmartMeter: true,
    hasSmartThermostat: true,
    hasAutomatedLighting: false,
    hasEnergyMonitoring: false,
    hasAutomatedOptimization: false,
  } as unknown as PropertyFormData;
}

try {
  console.log("Running scoring engine tests...");

  // 1. Test full valid assessment
  const form1 = getValidMock();
  const res1 = calculateGreenHomeScore(form1);
  
  assert.strictEqual(res1.components.length, 7, "Should have 7 components");
  
  // EPC: C -> 70 * 0.25 = 17.5
  const epc = res1.components.find(c => c.id === 'epc');
  assert.strictEqual(epc?.score, 70);
  assert.strictEqual(epc?.weight, 0.25);
  
  // ECI: 10000 kWh / 100 m2 = 100 ECI. Score: max(0, 100 - 0.4*100) = 60. Weight 0.20 -> 12
  const eci = res1.components.find(c => c.id === 'eci');
  assert.strictEqual(eci?.score, 60);
  assert.strictEqual(eci?.weight, 0.20);
  
  // Insulation: 0.4*80 + 0.4*80 + 0.2*50 = 32 + 32 + 10 = 74. Weight 0.15 -> 11.1
  const ins = res1.components.find(c => c.id === 'insulation');
  assert.strictEqual(ins?.score, 74);
  
  // Heating: high = 80
  const heat = res1.components.find(c => c.id === 'heating');
  assert.strictEqual(heat?.score, 80);
  
  // Glazing: double_good = 80
  const glaze = res1.components.find(c => c.id === 'glazing');
  assert.strictEqual(glaze?.score, 80);
  
  // Renewable: (1000 / 10000) * 100 = 10
  const ren = res1.components.find(c => c.id === 'renewables');
  assert.strictEqual(ren?.score, 10);
  
  // Smart: 20 (meter) + 25 (thermostat) = 45
  const smart = res1.components.find(c => c.id === 'smart_management');
  assert.strictEqual(smart?.score, 45);
  
  // Total sum: 17.5 + 12 + 11.1 + 12 + 8 + 1 + 2.25 = 63.85 => 64
  assert.strictEqual(res1.greenScore, 64);
  assert.strictEqual(res1.provisionalPoints, 64);
  assert.strictEqual(res1.inefficiencyCount, 0); // 7/7 valid
  
  console.log("Test 1 Passed: Valid full assessment");

  // 2. Test missing values (Unavailable states)
  const form2 = getValidMock();
  form2.epcRating = ""; // Missing
  const res2 = calculateGreenHomeScore(form2);
  
  assert.strictEqual(res2.greenScore, null, "Final score must be null if incomplete");
  // Total should be 64 - 17.5 = 46.35 => 46 provisional points
  assert.strictEqual(res2.provisionalPoints, 46);
  assert.strictEqual(res2.inefficiencyCount, 1);
  const epc2 = res2.components.find(c => c.id === 'epc');
  assert.strictEqual(epc2?.score, null);
  assert.strictEqual(epc2?.status, 'unavailable');
  
  console.log("Test 2 Passed: Incomplete assessment handles nulls and provisional points correctly");

  // 3. Test EPC mappings
  const epcs = { 'A': 100, 'B': 85, 'C': 70, 'D': 55, 'E': 40, 'F': 20, 'G': 5 };
  for (const [letter, score] of Object.entries(epcs)) {
    const f = getValidMock();
    f.epcRating = letter as any;
    const r = calculateGreenHomeScore(f);
    assert.strictEqual(r.components.find(c => c.id === 'epc')?.score, score);
  }
  console.log("Test 3 Passed: EPC mappings");

  // 4. Security Tests (Testing API Handler logic directly)
  console.log("Running security and API boundary tests...");
  const { POST: assessPost } = require('./src/app/api/assessments/route');
  
  // Test Missing Authentication in Production Mode
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-supabase.com';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'mock-key';

  const mockRequest = new Request('http://localhost/api/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // No auth header
    body: JSON.stringify(getValidMock())
  });

  assessPost(mockRequest).then(async (res: any) => {
    assert.strictEqual(res.status, 401, "Should reject unauthenticated request in production");
    
    // Test missing Supabase config in production
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const req2 = new Request('http://localhost/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getValidMock())
    });
    
    const res2 = await assessPost(req2);
    assert.strictEqual(res2.status, 503, "Should return 503 if Supabase config is missing in production");
    
    // Revert to demo mode
    process.env.NODE_ENV = 'development';
    const req3 = new Request('http://localhost/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getValidMock())
    });
    const res3 = await assessPost(req3);
    const body3 = await res3.clone().json().catch(()=>({}));
    assert.strictEqual(res3.status, 200, `Should allow demo mode request, got: ${JSON.stringify(body3)}`);

    console.log("Test 4 Passed: Security auth boundaries (401, 503, 200 demo)");
    console.log("All tests passed!");
  }).catch((e: any) => {
    console.error("Async test failed", e);
    process.exit(1);
  });

} catch (e) {
  console.error("Test failed:", e);
  process.exit(1);
}

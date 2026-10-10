import { PropertyFormData, Assessment, ScoreComponent } from '@/lib/types';

export function calculateGreenHomeScore(
  form: PropertyFormData,
  existingId?: string
): Omit<Assessment, 'recommendations' | 'energyBreakdown'> {
  
  const components: ScoreComponent[] = [];
  let rawGreenScore = 0;
  let validComponentsCount = 0;

  // A. EPC Rating (25%)
  const epcWeight = 0.25;
  const epcMap: Record<string, number> = { A: 100, B: 85, C: 70, D: 55, E: 40, F: 20, G: 5 };
  let epcAvailable = false;
  let epcScore = 0;
  if (form.epcRating && epcMap[form.epcRating] !== undefined) {
    epcScore = epcMap[form.epcRating];
    epcAvailable = true;
  }
  components.push({
    id: 'epc',
    label: 'EPC Rating',
    score: epcAvailable ? epcScore : null,
    maxScore: 100,
    weight: epcWeight,
    icon: 'file',
    description: epcAvailable ? `Official EPC rating ${form.epcRating}.` : 'Unavailable (explicit official EPC rating missing).',
    status: epcAvailable ? (epcScore >= 75 ? 'excellent' : epcScore >= 55 ? 'good' : epcScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (epcAvailable) {
    rawGreenScore += epcScore * epcWeight;
    validComponentsCount++;
  }

  // B. ECI (20%)
  const eciWeight = 0.20;
  let eciAvailable = false;
  let eciScore = 0;
  const floorArea = Number(form.floorArea);
  
  if (Number.isFinite(floorArea) && floorArea > 0 && form.annualElectricityKwh !== '' && form.annualGasKwh !== '') {
    const elec = Number(form.annualElectricityKwh);
    const gas = Number(form.annualGasKwh);
    if (Number.isFinite(elec) && elec >= 0 && Number.isFinite(gas) && gas >= 0) {
      const eciValue = (elec + gas) / floorArea;
      eciScore = Math.max(0, 100 - 0.4 * eciValue);
      eciAvailable = true;
      components.push({
        id: 'eci',
        label: 'Energy Consumption (ECI)',
        score: Math.round(eciScore),
        maxScore: 100,
        weight: eciWeight,
        icon: 'zap',
        description: `ECI calculated as ${eciValue.toFixed(1)} kWh/m² based on total provided consumption.`,
        status: eciScore >= 75 ? 'excellent' : eciScore >= 55 ? 'good' : eciScore >= 35 ? 'fair' : 'poor',
      });
      rawGreenScore += eciScore * eciWeight;
      validComponentsCount++;
    }
  }
  if (!eciAvailable) {
    components.push({
      id: 'eci',
      label: 'Energy Consumption (ECI)',
      score: null,
      maxScore: 100,
      weight: eciWeight,
      icon: 'zap',
      description: 'Unavailable (requires valid finite floor area and both gas & electricity consumption).',
      status: 'unavailable',
    });
  }

  // C. Insulation (15%)
  const insulationWeight = 0.15;
  let insulationAvailable = false;
  let insulationScore = 0;
  if (form.roofInsulationScore !== '' && form.wallInsulationScore !== '' && form.floorInsulationScore !== '') {
    const r = Number(form.roofInsulationScore);
    const w = Number(form.wallInsulationScore);
    const f = Number(form.floorInsulationScore);
    if (Number.isFinite(r) && Number.isFinite(w) && Number.isFinite(f)) {
      insulationScore = 0.40 * r + 0.40 * w + 0.20 * f;
      insulationAvailable = true;
    }
  }
  components.push({
    id: 'insulation',
    label: 'Insulation',
    score: insulationAvailable ? Math.round(insulationScore) : null,
    maxScore: 100,
    weight: insulationWeight,
    icon: 'home',
    description: insulationAvailable ? `Calculated from explicit R, W, F scores.` : 'Unavailable (requires explicit R, W, and F sub-scores).',
    status: insulationAvailable ? (insulationScore >= 75 ? 'excellent' : insulationScore >= 55 ? 'good' : insulationScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (insulationAvailable) {
    rawGreenScore += insulationScore * insulationWeight;
    validComponentsCount++;
  }

  // D. Heating System (15%)
  const heatingWeight = 0.15;
  const heatingMap: Record<string, number> = { very_high: 100, high: 80, moderate: 60, low: 30, very_low: 10 };
  let heatingAvailable = false;
  let heatingScore = 0;
  if (form.heatingEfficiencyCategory && heatingMap[form.heatingEfficiencyCategory] !== undefined) {
    heatingScore = heatingMap[form.heatingEfficiencyCategory];
    heatingAvailable = true;
  }
  components.push({
    id: 'heating',
    label: 'Heating System',
    score: heatingAvailable ? heatingScore : null,
    maxScore: 100,
    weight: heatingWeight,
    icon: 'flame',
    description: heatingAvailable ? `Based on verified efficiency category.` : 'Unavailable (requires explicit efficiency-category selection).',
    status: heatingAvailable ? (heatingScore >= 75 ? 'excellent' : heatingScore >= 55 ? 'good' : heatingScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (heatingAvailable) {
    rawGreenScore += heatingScore * heatingWeight;
    validComponentsCount++;
  }

  // E. Windows & Glazing (10%)
  const glazingWeight = 0.10;
  const glazingMap: Record<string, number> = {
    very_poor: 10, single_poor: 25, single_good: 40, double_moderate: 65, double_good: 80, triple_good: 95
  };
  let glazingAvailable = false;
  let glazingScore = 0;
  if (form.glazingScoreCombination && glazingMap[form.glazingScoreCombination] !== undefined) {
    glazingScore = glazingMap[form.glazingScoreCombination];
    glazingAvailable = true;
  }
  components.push({
    id: 'glazing',
    label: 'Windows & Glazing',
    score: glazingAvailable ? glazingScore : null,
    maxScore: 100,
    weight: glazingWeight,
    icon: 'square',
    description: glazingAvailable ? `Based on explicit glazing combination.` : 'Unavailable (requires explicit specification combination).',
    status: glazingAvailable ? (glazingScore >= 75 ? 'excellent' : glazingScore >= 55 ? 'good' : glazingScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (glazingAvailable) {
    rawGreenScore += glazingScore * glazingWeight;
    validComponentsCount++;
  }

  // F. Renewable Energy (10%)
  const renewablesWeight = 0.10;
  let renewablesAvailable = false;
  let renewablesScore = 0;
  if (form.annualRenewableEnergyUsedOnSiteKwh !== '' && form.totalAnnualPropertyEnergyConsumptionKwh !== '') {
    const ren = Number(form.annualRenewableEnergyUsedOnSiteKwh);
    const tot = Number(form.totalAnnualPropertyEnergyConsumptionKwh);
    if (Number.isFinite(ren) && ren >= 0 && Number.isFinite(tot) && tot > 0 && ren <= tot) {
      renewablesScore = (ren / tot) * 100;
      renewablesAvailable = true;
    }
  }
  components.push({
    id: 'renewables',
    label: 'Renewable Energy',
    score: renewablesAvailable ? Math.round(renewablesScore) : null,
    maxScore: 100,
    weight: renewablesWeight,
    icon: 'sun',
    description: renewablesAvailable ? `Calculated from on-site renewables usage vs total consumption.` : 'Unavailable (requires annual renewable energy used vs total property energy).',
    status: renewablesAvailable ? (renewablesScore >= 75 ? 'excellent' : renewablesScore >= 55 ? 'good' : renewablesScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (renewablesAvailable) {
    rawGreenScore += renewablesScore * renewablesWeight;
    validComponentsCount++;
  }

  // G. Smart Energy Management (5%)
  const smartWeight = 0.05;
  let smartAvailable = false;
  let smartScore = 0;
  const smartFields = [
    form.hasSmartMeter, form.hasSmartThermostat, form.hasAutomatedLighting, form.hasEnergyMonitoring, form.hasAutomatedOptimization
  ];
  if (smartFields.every(f => f === true || f === false)) {
    smartAvailable = true;
    if (form.hasSmartMeter) smartScore += 20;
    if (form.hasSmartThermostat) smartScore += 25;
    if (form.hasAutomatedLighting) smartScore += 15;
    if (form.hasEnergyMonitoring) smartScore += 20;
    if (form.hasAutomatedOptimization) smartScore += 20;
  }
  components.push({
    id: 'smart_management',
    label: 'Smart Management',
    score: smartAvailable ? smartScore : null,
    maxScore: 100,
    weight: smartWeight,
    icon: 'cpu',
    description: smartAvailable ? `Calculated from selected smart energy features.` : 'Unavailable (requires explicit missing/present indicators for 5 systems).',
    status: smartAvailable ? (smartScore >= 75 ? 'excellent' : smartScore >= 55 ? 'good' : smartScore >= 35 ? 'fair' : 'poor') : 'unavailable',
  });
  if (smartAvailable) {
    rawGreenScore += smartScore * smartWeight;
    validComponentsCount++;
  }

  // Final score logic
  const isComplete = validComponentsCount === 7;
  const greenScore = isComplete ? Math.min(100, Math.max(0, Math.round(rawGreenScore))) : null;
  const provisionalPoints = Math.min(100, Math.max(0, Math.round(rawGreenScore)));

  const scoreCategory = greenScore === null ? 'Unavailable' :
    greenScore >= 80 ? 'Excellent' : greenScore >= 65 ? 'Good' : greenScore >= 50 ? 'Fair' : greenScore >= 35 ? 'Poor' : 'Very Poor';

  const scoreExplanation = isComplete 
    ? `Your home scores ${greenScore} out of 100 (${scoreCategory}).`
    : `Provisional Points: ${provisionalPoints}. Computed from ${validComponentsCount}/7 available components. The final verified score is unavailable until all required data is provided.`;

  // Energy estimates
  const annualEnergyKwh = form.annualElectricityKwh !== '' && form.annualGasKwh !== '' 
    ? Number(form.annualElectricityKwh) + Number(form.annualGasKwh) 
    : 0;

  return {
    id: existingId ?? `assessment-${Date.now()}`,
    propertyName: form.propertyName || 'My Property',
    propertyType: (form.propertyType as Assessment['propertyType']) || 'detached',
    postcode: form.postcode || '',
    createdAt: new Date().toISOString(),
    greenScore,
    provisionalPoints,
    scoreCategory,
    scoreExplanation,
    components,
    annualEnergyKwh,
    annualCostGbp: Math.round(annualEnergyKwh * 0.135),
    annualCarbonKg: Math.round(annualEnergyKwh * 0.21),
    inefficiencyCount: 7 - validComponentsCount,
    potentialScoreGain: 0,
    potentialCostSaving: 0,
    potentialCarbonSaving: 0,
  };
}

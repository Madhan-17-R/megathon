// ─── Domain types ──────────────────────────────────────────────────────────────

export type PropertyType =
  | 'detached'
  | 'semi-detached'
  | 'terraced'
  | 'flat'
  | 'bungalow'
  | 'maisonette';

export type EpcRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown';

export type HeatingSystem =
  | 'gas_boiler'
  | 'oil_boiler'
  | 'heat_pump_air'
  | 'heat_pump_ground'
  | 'electric_storage'
  | 'district_heating'
  | 'biomass'
  | 'solid_fuel';

export type HotWaterSystem =
  | 'combi_boiler'
  | 'cylinder_gas'
  | 'cylinder_electric'
  | 'heat_pump'
  | 'solar_thermal'
  | 'immersion';

export type WallType =
  | 'solid_brick'
  | 'cavity_uninsulated'
  | 'cavity_insulated'
  | 'timber_frame'
  | 'stone'
  | 'prefab_concrete';

export type InsulationStatus = 'none' | 'partial' | 'full';
export type GlazingType = 'single' | 'double' | 'triple' | 'secondary';
export type DataSource = 'manual' | 'estimated' | 'smart_meter';

// ─── Property form ─────────────────────────────────────────────────────────────

export type HeatingEfficiencyCategory = 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
export type GlazingScoreCombination = 'very_poor' | 'single_poor' | 'single_good' | 'double_moderate' | 'double_good' | 'triple_good';

export interface PropertyFormData {
  // Basic details
  propertyName: string;
  propertyType: PropertyType | '';
  constructionYear: number | '';
  floorArea: number | '';
  bedrooms: number | '';
  postcode: string;

  // Building envelope
  wallType: WallType | '';
  wallInsulation: InsulationStatus | '';
  roofInsulation: InsulationStatus | '';
  glazingType: GlazingType | '';
  windowArea: number | '';
  // Explicit insulation scores
  roofInsulationScore: number | '';
  wallInsulationScore: number | '';
  floorInsulationScore: number | '';
  // Explicit glazing combination
  glazingScoreCombination: GlazingScoreCombination | '';

  // Energy systems
  heatingSystem: HeatingSystem | '';
  heatingEfficiencyCategory: HeatingEfficiencyCategory | '';
  hotWaterSystem: HotWaterSystem | '';
  applianceRating: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | '';
  hasSolarPV: boolean;
  solarCapacityKw: number | '';
  hasSolarThermal: boolean;
  epcRating: EpcRating | '';

  // Energy usage & Renewables
  annualElectricityKwh: number | '';
  annualGasKwh: number | '';
  annualEnergyCost: number | '';
  dataSource: DataSource | '';
  annualRenewableEnergyUsedOnSiteKwh: number | '';
  totalAnnualPropertyEnergyConsumptionKwh: number | '';

  // Smart Energy Management
  hasSmartMeter: boolean | '';
  hasSmartThermostat: boolean | '';
  hasAutomatedLighting: boolean | '';
  hasEnergyMonitoring: boolean | '';
  hasAutomatedOptimization: boolean | '';
}

// ─── Assessment / Score ────────────────────────────────────────────────────────

export interface ScoreComponent {
  id: string;
  label: string;
  score: number | null; // 0–100 or null if unavailable
  maxScore: number;
  weight: number;       // fraction summing to 1
  icon: string;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'unavailable';
}

export interface RetrofitRecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  annualSaving: number;       // £/yr
  carbonSavingKg: number;     // kg CO₂/yr
  energySavingKwh: number;    // kWh/yr
  paybackYears: number;
  scoreImprovement: number;
  description: string;
  enabled: boolean;
}

export interface EnergyBreakdown {
  category: string;
  baseline: number;   // kWh/yr
  improved: number;   // kWh/yr after all enabled retrofits
  color: string;
}

export interface Assessment {
  id: string;
  propertyName: string;
  propertyType: PropertyType;
  postcode: string;
  createdAt: string;          // ISO
  greenScore: number | null;  // 0–100 or null if unavailable
  provisionalPoints: number;
  scoreCategory: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor' | 'Unavailable';
  scoreExplanation: string;
  components: ScoreComponent[];
  annualEnergyKwh: number;
  annualCostGbp: number;
  annualCarbonKg: number;
  inefficiencyCount: number;
  potentialScoreGain: number;
  potentialCostSaving: number;
  potentialCarbonSaving: number;
  recommendations: RetrofitRecommendation[];
  energyBreakdown: EnergyBreakdown[];
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

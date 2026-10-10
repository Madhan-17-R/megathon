import {
  Assessment,
  PropertyFormData,
  ScoreComponent,
  RetrofitRecommendation,
  EnergyBreakdown,
} from './types';
import { calculateGreenHomeScore } from './scoringEngine';

// ─── Display-Only Demo Data ──────────────────────────────────────────────────
// This data is purely for illustrating the dashboard and is not used in genuine calculations.

export const DEMO_COMPONENTS: ScoreComponent[] = [
  {
    id: 'epc',
    label: 'EPC Rating (Demo)',
    score: 70,
    maxScore: 100,
    weight: 0.25,
    icon: 'file',
    description: 'Demo EPC rating C.',
    status: 'good',
  },
  {
    id: 'eci',
    label: 'Energy Consumption (Demo)',
    score: 65,
    maxScore: 100,
    weight: 0.20,
    icon: 'zap',
    description: 'Demo ECI calculation.',
    status: 'good',
  },
  {
    id: 'insulation',
    label: 'Insulation (Demo)',
    score: 45,
    maxScore: 100,
    weight: 0.15,
    icon: 'home',
    description: 'Demo insulation score.',
    status: 'poor',
  },
  {
    id: 'heating',
    label: 'Heating System (Demo)',
    score: 60,
    maxScore: 100,
    weight: 0.15,
    icon: 'flame',
    description: 'Demo heating efficiency.',
    status: 'fair',
  },
  {
    id: 'glazing',
    label: 'Windows & Glazing (Demo)',
    score: 80,
    maxScore: 100,
    weight: 0.10,
    icon: 'square',
    description: 'Demo glazing score.',
    status: 'excellent',
  },
  {
    id: 'renewables',
    label: 'Renewable Energy (Demo)',
    score: 10,
    maxScore: 100,
    weight: 0.10,
    icon: 'sun',
    description: 'Demo renewables score.',
    status: 'poor',
  },
  {
    id: 'smart_management',
    label: 'Smart Management (Demo)',
    score: 20,
    maxScore: 100,
    weight: 0.05,
    icon: 'cpu',
    description: 'Demo smart management score.',
    status: 'poor',
  },
];

export const DEMO_RECOMMENDATIONS: RetrofitRecommendation[] = [
  {
    id: 'r1',
    title: 'Air-Source Heat Pump',
    category: 'Heating System',
    priority: 'high',
    estimatedCost: 9500,
    annualSaving: 620,
    carbonSavingKg: 1850,
    energySavingKwh: 4200,
    paybackYears: 15.3,
    scoreImprovement: 18,
    description: 'Demo recommendation.',
    enabled: true,
  },
];

export const DEMO_ENERGY_BREAKDOWN: EnergyBreakdown[] = [
  { category: 'Space Heating', baseline: 12400, improved: 5100, color: '#f97316' },
  { category: 'Hot Water', baseline: 3200, improved: 1800, color: '#3b82f6' },
  { category: 'Appliances', baseline: 2800, improved: 2400, color: '#8b5cf6' },
];

export const DEMO_ASSESSMENT: Assessment = {
  id: 'demo-001',
  propertyName: 'Demo Property',
  propertyType: 'semi-detached',
  postcode: 'SW12 9BT',
  createdAt: new Date().toISOString(),
  greenScore: 56,
  provisionalPoints: 56,
  scoreCategory: 'Good',
  scoreExplanation: 'This is illustrative demo data. Please run a real assessment.',
  components: DEMO_COMPONENTS,
  annualEnergyKwh: 18400,
  annualCostGbp: 2400,
  annualCarbonKg: 3800,
  inefficiencyCount: 3,
  potentialScoreGain: 20,
  potentialCostSaving: 620,
  potentialCarbonSaving: 1850,
  recommendations: DEMO_RECOMMENDATIONS,
  energyBreakdown: DEMO_ENERGY_BREAKDOWN,
};

// ─── Score calculation from form ──────────────────────────────────────────────

export function computeAssessmentFromForm(
  form: PropertyFormData,
  existingId?: string
): Assessment {
  const baseAssessment = calculateGreenHomeScore(form, existingId);
  return {
    ...baseAssessment,
    recommendations: [],
    energyBreakdown: [],
  };
}

// ─── Mock AI chat responses ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMockChatResponse(_userMessage: string): string {
  return "I am your AI Green Home Advisor. I can help answer questions about your verified components once the specification is fully connected!";
}

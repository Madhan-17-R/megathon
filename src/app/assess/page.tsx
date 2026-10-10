'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Layers,
  Zap,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Leaf,
  Info,
} from 'lucide-react';
import { PropertyFormData } from '@/lib/types';
import { computeAssessmentFromForm } from '@/lib/mockData';
import { useApp } from '@/lib/context';

// ─── Default form state ─────────────────────────────────────────────────────

const INITIAL_FORM: PropertyFormData = {
  propertyName: '',
  propertyType: '',
  constructionYear: '',
  floorArea: '',
  bedrooms: '',
  postcode: '',
  wallType: '',
  wallInsulation: '',
  roofInsulation: '',
  glazingType: '',
  windowArea: '',
  roofInsulationScore: '',
  wallInsulationScore: '',
  floorInsulationScore: '',
  glazingScoreCombination: '',
  heatingSystem: '',
  heatingEfficiencyCategory: '',
  hotWaterSystem: '',
  applianceRating: '',
  hasSolarPV: false,
  solarCapacityKw: '',
  hasSolarThermal: false,
  epcRating: '',
  annualElectricityKwh: '',
  annualGasKwh: '',
  annualEnergyCost: '',
  dataSource: '',
  annualRenewableEnergyUsedOnSiteKwh: '',
  totalAnnualPropertyEnergyConsumptionKwh: '',
  hasSmartMeter: '',
  hasSmartThermostat: '',
  hasAutomatedLighting: '',
  hasEnergyMonitoring: '',
  hasAutomatedOptimization: '',
};

// ─── Validation ──────────────────────────────────────────────────────────────

type Errors = Partial<Record<keyof PropertyFormData, string>>;

function validateStep(step: number, form: PropertyFormData): Errors {
  const errs: Errors = {};
  if (step === 0) {
    if (!form.propertyName.trim()) errs.propertyName = 'Property name is required';
    if (!form.propertyType) errs.propertyType = 'Please select a property type';
    if (form.constructionYear !== '' && (Number(form.constructionYear) < 1800 || Number(form.constructionYear) > new Date().getFullYear()))
      errs.constructionYear = `Year must be between 1800 and ${new Date().getFullYear()}`;
    if (form.floorArea !== '' && (Number(form.floorArea) < 10 || Number(form.floorArea) > 2000))
      errs.floorArea = 'Floor area must be between 10 and 2,000 m²';
    if (form.bedrooms !== '' && (Number(form.bedrooms) < 0 || Number(form.bedrooms) > 20))
      errs.bedrooms = 'Bedrooms must be between 0 and 20';
  }
  if (step === 1) {
    if (!form.wallType) errs.wallType = 'Please select a wall type';
    if (!form.glazingType) errs.glazingType = 'Please select a glazing type';
    if (form.windowArea !== '' && (Number(form.windowArea) < 0 || Number(form.windowArea) > 500))
      errs.windowArea = 'Window area must be between 0 and 500 m²';
    if (form.roofInsulationScore !== '' && (Number(form.roofInsulationScore) < 0 || Number(form.roofInsulationScore) > 100))
      errs.roofInsulationScore = 'Score must be 0-100';
    if (form.wallInsulationScore !== '' && (Number(form.wallInsulationScore) < 0 || Number(form.wallInsulationScore) > 100))
      errs.wallInsulationScore = 'Score must be 0-100';
    if (form.floorInsulationScore !== '' && (Number(form.floorInsulationScore) < 0 || Number(form.floorInsulationScore) > 100))
      errs.floorInsulationScore = 'Score must be 0-100';
  }
  if (step === 2) {
    if (!form.heatingSystem) errs.heatingSystem = 'Please select a heating system';
    if (!form.hotWaterSystem) errs.hotWaterSystem = 'Please select a hot water system';
    if (form.hasSolarPV && form.solarCapacityKw !== '' && (Number(form.solarCapacityKw) < 0 || Number(form.solarCapacityKw) > 50))
      errs.solarCapacityKw = 'Solar capacity must be between 0 and 50 kWp';
    
    if (form.annualRenewableEnergyUsedOnSiteKwh !== '' && Number(form.annualRenewableEnergyUsedOnSiteKwh) < 0)
      errs.annualRenewableEnergyUsedOnSiteKwh = 'Must be ≥ 0';
    if (form.totalAnnualPropertyEnergyConsumptionKwh !== '' && Number(form.totalAnnualPropertyEnergyConsumptionKwh) <= 0)
      errs.totalAnnualPropertyEnergyConsumptionKwh = 'Must be > 0';
    if (form.annualRenewableEnergyUsedOnSiteKwh !== '' && form.totalAnnualPropertyEnergyConsumptionKwh !== '' && 
        Number(form.annualRenewableEnergyUsedOnSiteKwh) > Number(form.totalAnnualPropertyEnergyConsumptionKwh)) {
      errs.annualRenewableEnergyUsedOnSiteKwh = 'Cannot exceed total consumption';
    }
  }
  if (step === 3) {
    if (form.annualElectricityKwh !== '' && (Number(form.annualElectricityKwh) < 0 || Number(form.annualElectricityKwh) > 100000))
      errs.annualElectricityKwh = 'Value must be between 0 and 100,000 kWh';
    if (form.annualGasKwh !== '' && (Number(form.annualGasKwh) < 0 || Number(form.annualGasKwh) > 200000))
      errs.annualGasKwh = 'Value must be between 0 and 200,000 kWh';
    if (form.annualEnergyCost !== '' && (Number(form.annualEnergyCost) < 0 || Number(form.annualEnergyCost) > 50000))
      errs.annualEnergyCost = 'Cost must be between £0 and £50,000';
  }
  return errs;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-300 mb-1.5">
      {children}
      {required && <span className="ml-1 text-red-400">*</span>}
    </label>
  );
}

const inputCls = (error?: string) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder-slate-600 bg-white/5 focus:outline-none focus:ring-2 transition-all duration-150 ${
    error
      ? 'border-red-500/50 focus:ring-red-500/30'
      : 'border-white/10 focus:ring-emerald-500/40 focus:border-emerald-500/40'
  }`;

const selectCls = (error?: string) =>
  `${inputCls(error)} appearance-none cursor-pointer [&>option]:bg-slate-900`;

// ─── Step components ─────────────────────────────────────────────────────────

function StepBasic({ form, errors, onChange }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="propertyName" required>Property name or reference</Label>
        <input
          id="propertyName"
          type="text"
          placeholder="e.g. 14 Elm Grove or My Home"
          value={form.propertyName}
          onChange={(e) => onChange('propertyName', e.target.value)}
          className={inputCls(errors.propertyName)}
          maxLength={80}
        />
        <FieldError msg={errors.propertyName} />
      </div>

      <div>
        <Label htmlFor="propertyType" required>Property type</Label>
        <select
          id="propertyType"
          value={form.propertyType}
          onChange={(e) => onChange('propertyType', e.target.value)}
          className={selectCls(errors.propertyType)}
        >
          <option value="">Select type…</option>
          <option value="detached">Detached house</option>
          <option value="semi-detached">Semi-detached house</option>
          <option value="terraced">Terraced house</option>
          <option value="flat">Flat / apartment</option>
          <option value="bungalow">Bungalow</option>
          <option value="maisonette">Maisonette</option>
        </select>
        <FieldError msg={errors.propertyType} />
      </div>

      <div>
        <Label htmlFor="constructionYear">Year built</Label>
        <input
          id="constructionYear"
          type="number"
          placeholder="e.g. 1975"
          min={1800}
          max={2030}
          value={form.constructionYear}
          onChange={(e) => onChange('constructionYear', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.constructionYear)}
        />
        <FieldError msg={errors.constructionYear} />
      </div>

      <div>
        <Label htmlFor="floorArea">Floor area (m²)</Label>
        <input
          id="floorArea"
          type="number"
          placeholder="e.g. 95"
          min={10}
          max={2000}
          value={form.floorArea}
          onChange={(e) => onChange('floorArea', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.floorArea)}
        />
        <FieldError msg={errors.floorArea} />
      </div>

      <div>
        <Label htmlFor="bedrooms">Number of bedrooms</Label>
        <input
          id="bedrooms"
          type="number"
          placeholder="e.g. 3"
          min={0}
          max={20}
          value={form.bedrooms}
          onChange={(e) => onChange('bedrooms', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.bedrooms)}
        />
        <FieldError msg={errors.bedrooms} />
      </div>

      <div>
        <Label htmlFor="postcode">Postcode</Label>
        <input
          id="postcode"
          type="text"
          placeholder="e.g. SW12 9BT"
          value={form.postcode}
          onChange={(e) => onChange('postcode', e.target.value.toUpperCase())}
          className={inputCls()}
          maxLength={10}
        />
      </div>
    </div>
  );
}

function StepEnvelope({ form, errors, onChange }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="wallType" required>Wall / construction type</Label>
        <select
          id="wallType"
          value={form.wallType}
          onChange={(e) => onChange('wallType', e.target.value)}
          className={selectCls(errors.wallType)}
        >
          <option value="">Select type…</option>
          <option value="solid_brick">Solid brick</option>
          <option value="cavity_uninsulated">Cavity — uninsulated</option>
          <option value="cavity_insulated">Cavity — insulated</option>
          <option value="timber_frame">Timber frame</option>
          <option value="stone">Stone</option>
          <option value="prefab_concrete">Prefab concrete</option>
        </select>
        <FieldError msg={errors.wallType} />
      </div>

      <div>
        <Label htmlFor="wallInsulation">Wall insulation status</Label>
        <select
          id="wallInsulation"
          value={form.wallInsulation}
          onChange={(e) => onChange('wallInsulation', e.target.value)}
          className={selectCls()}
        >
          <option value="">Select status…</option>
          <option value="none">None</option>
          <option value="partial">Partial</option>
          <option value="full">Full</option>
        </select>
      </div>

      <div>
        <Label htmlFor="roofInsulation">Roof / loft insulation</Label>
        <select
          id="roofInsulation"
          value={form.roofInsulation}
          onChange={(e) => onChange('roofInsulation', e.target.value)}
          className={selectCls()}
        >
          <option value="">Select status…</option>
          <option value="none">None</option>
          <option value="partial">Partial (≤100 mm)</option>
          <option value="full">Full (≥270 mm)</option>
        </select>
      </div>

      <div className="sm:col-span-2 grid gap-5 sm:grid-cols-3 mt-4 border-t border-white/10 pt-4">
        <div>
          <Label htmlFor="roofInsulationScore">Roof Insulation Score (0-100)</Label>
          <input
            id="roofInsulationScore"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 80"
            value={form.roofInsulationScore}
            onChange={(e) => onChange('roofInsulationScore', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.roofInsulationScore)}
          />
          <FieldError msg={errors.roofInsulationScore} />
        </div>
        <div>
          <Label htmlFor="wallInsulationScore">Wall Insulation Score (0-100)</Label>
          <input
            id="wallInsulationScore"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 75"
            value={form.wallInsulationScore}
            onChange={(e) => onChange('wallInsulationScore', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.wallInsulationScore)}
          />
          <FieldError msg={errors.wallInsulationScore} />
        </div>
        <div>
          <Label htmlFor="floorInsulationScore">Floor Insulation Score (0-100)</Label>
          <input
            id="floorInsulationScore"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 50"
            value={form.floorInsulationScore}
            onChange={(e) => onChange('floorInsulationScore', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.floorInsulationScore)}
          />
          <FieldError msg={errors.floorInsulationScore} />
        </div>
      </div>

      <div className="sm:col-span-2 border-t border-white/10 pt-4" />

      <div>
        <Label htmlFor="glazingType" required>Glazing type</Label>
        <select
          id="glazingType"
          value={form.glazingType}
          onChange={(e) => onChange('glazingType', e.target.value)}
          className={selectCls(errors.glazingType)}
        >
          <option value="">Select type…</option>
          <option value="single">Single glazing</option>
          <option value="secondary">Secondary glazing</option>
          <option value="double">Double glazing</option>
          <option value="triple">Triple glazing</option>
        </select>
        <FieldError msg={errors.glazingType} />
      </div>

      <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="glazingScoreCombination">Glazing Condition Score</Label>
          <select
            id="glazingScoreCombination"
            value={form.glazingScoreCombination}
            onChange={(e) => onChange('glazingScoreCombination', e.target.value)}
            className={selectCls()}
          >
            <option value="">Select combination…</option>
            <option value="very_poor">Very poor (10)</option>
            <option value="single_poor">Single glazing, poor condition (25)</option>
            <option value="single_good">Single glazing, good condition (40)</option>
            <option value="double_moderate">Double glazing, moderate condition (65)</option>
            <option value="double_good">Double glazing, good condition (80)</option>
            <option value="triple_good">Triple glazing, good condition (95)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="windowArea">Approximate window area (m²)</Label>
          <input
            id="windowArea"
            type="number"
            placeholder="e.g. 18"
            min={0}
            max={500}
            value={form.windowArea}
            onChange={(e) => onChange('windowArea', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.windowArea)}
          />
          <FieldError msg={errors.windowArea} />
          <p className="mt-1 text-[11px] text-slate-600">Optional — used to refine glazing heat-loss estimate.</p>
        </div>
      </div>
    </div>
  );
}

function StepSystems({ form, errors, onChange }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="heatingSystem" required>Heating system</Label>
        <select
          id="heatingSystem"
          value={form.heatingSystem}
          onChange={(e) => onChange('heatingSystem', e.target.value)}
          className={selectCls(errors.heatingSystem)}
        >
          <option value="">Select system…</option>
          <option value="gas_boiler">Gas boiler</option>
          <option value="oil_boiler">Oil boiler</option>
          <option value="heat_pump_air">Air-source heat pump</option>
          <option value="heat_pump_ground">Ground-source heat pump</option>
          <option value="electric_storage">Electric storage heaters</option>
          <option value="district_heating">District heating</option>
          <option value="biomass">Biomass boiler</option>
          <option value="solid_fuel">Solid fuel (coal / wood)</option>
        </select>
        <FieldError msg={errors.heatingSystem} />
      </div>

      <div>
        <Label htmlFor="heatingEfficiencyCategory" required>Heating Efficiency Category</Label>
        <select
          id="heatingEfficiencyCategory"
          value={form.heatingEfficiencyCategory}
          onChange={(e) => onChange('heatingEfficiencyCategory', e.target.value)}
          className={selectCls(errors.heatingEfficiencyCategory)}
        >
          <option value="">Select category…</option>
          <option value="very_high">Verified very high efficiency (100)</option>
          <option value="high">Verified high efficiency (80)</option>
          <option value="moderate">Moderate (60)</option>
          <option value="low">Low (30)</option>
          <option value="very_low">Very low (10)</option>
        </select>
        <FieldError msg={errors.heatingEfficiencyCategory} />
      </div>

      <div>
        <Label htmlFor="hotWaterSystem" required>Hot water system</Label>
        <select
          id="hotWaterSystem"
          value={form.hotWaterSystem}
          onChange={(e) => onChange('hotWaterSystem', e.target.value)}
          className={selectCls(errors.hotWaterSystem)}
        >
          <option value="">Select system…</option>
          <option value="combi_boiler">Combi boiler</option>
          <option value="cylinder_gas">Hot water cylinder (gas)</option>
          <option value="cylinder_electric">Hot water cylinder (electric)</option>
          <option value="heat_pump">Heat pump water heater</option>
          <option value="solar_thermal">Solar thermal</option>
          <option value="immersion">Immersion heater</option>
        </select>
        <FieldError msg={errors.hotWaterSystem} />
      </div>

      <div>
        <Label htmlFor="applianceRating">Appliance energy rating</Label>
        <select
          id="applianceRating"
          value={form.applianceRating}
          onChange={(e) => onChange('applianceRating', e.target.value)}
          className={selectCls()}
        >
          <option value="">Select rating…</option>
          <option value="A+++">A+++ (most efficient)</option>
          <option value="A++">A++</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D (least efficient)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="epcRating">EPC rating</Label>
        <select
          id="epcRating"
          value={form.epcRating}
          onChange={(e) => onChange('epcRating', e.target.value)}
          className={selectCls()}
        >
          <option value="">Select rating…</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
          <option value="unknown">Unknown / Not available</option>
        </select>
      </div>

      {/* Solar PV */}
      <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Solar PV panels</Label>
          <button
            type="button"
            role="switch"
            aria-checked={form.hasSolarPV}
            onClick={() => onChange('hasSolarPV', !form.hasSolarPV)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              form.hasSolarPV ? 'bg-emerald-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.hasSolarPV ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {form.hasSolarPV && (
          <div>
            <Label htmlFor="solarCapacityKw">Solar PV capacity (kWp)</Label>
            <input
              id="solarCapacityKw"
              type="number"
              placeholder="e.g. 4"
              min={0}
              max={50}
              step={0.5}
              value={form.solarCapacityKw}
              onChange={(e) => onChange('solarCapacityKw', e.target.value === '' ? '' : Number(e.target.value))}
              className={inputCls(errors.solarCapacityKw)}
            />
            <FieldError msg={errors.solarCapacityKw} />
          </div>
        )}
      </div>

      {/* Solar thermal */}
      <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="flex items-center justify-between">
          <Label>Solar thermal (hot water)</Label>
          <button
            type="button"
            role="switch"
            aria-checked={form.hasSolarThermal}
            onClick={() => onChange('hasSolarThermal', !form.hasSolarThermal)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              form.hasSolarThermal ? 'bg-emerald-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.hasSolarThermal ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Renewables Explicit Energy Values */}
      <div className="sm:col-span-2 border-t border-white/10 pt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="annualRenewableEnergyUsedOnSiteKwh">Annual Renewable Energy Used On-site (kWh)</Label>
          <input
            id="annualRenewableEnergyUsedOnSiteKwh"
            type="number"
            placeholder="e.g. 1500"
            min={0}
            value={form.annualRenewableEnergyUsedOnSiteKwh}
            onChange={(e) => onChange('annualRenewableEnergyUsedOnSiteKwh', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.annualRenewableEnergyUsedOnSiteKwh)}
          />
          <FieldError msg={errors.annualRenewableEnergyUsedOnSiteKwh} />
        </div>
        <div>
          <Label htmlFor="totalAnnualPropertyEnergyConsumptionKwh">Total Annual Property Energy (kWh)</Label>
          <input
            id="totalAnnualPropertyEnergyConsumptionKwh"
            type="number"
            placeholder="e.g. 12000"
            min={0}
            value={form.totalAnnualPropertyEnergyConsumptionKwh}
            onChange={(e) => onChange('totalAnnualPropertyEnergyConsumptionKwh', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputCls(errors.totalAnnualPropertyEnergyConsumptionKwh)}
          />
          <FieldError msg={errors.totalAnnualPropertyEnergyConsumptionKwh} />
          <p className="mt-1 text-[11px] text-slate-600">Must match the same annual period as on-site renewables.</p>
        </div>
      </div>
    </div>
  );
}

function StepUsage({ form, errors, onChange }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/8 p-3">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          Energy data improves score accuracy but is optional. Leave fields blank if you don&apos;t have the values — we&apos;ll estimate from your property details.
        </p>
      </div>

      <div>
        <Label htmlFor="annualElectricityKwh">Annual electricity use (kWh)</Label>
        <input
          id="annualElectricityKwh"
          type="number"
          placeholder="e.g. 3,200"
          min={0}
          max={100000}
          value={form.annualElectricityKwh}
          onChange={(e) => onChange('annualElectricityKwh', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.annualElectricityKwh)}
        />
        <FieldError msg={errors.annualElectricityKwh} />
        <p className="mt-1 text-[11px] text-slate-600">UK avg: ~2,700–4,100 kWh/yr</p>
      </div>

      <div>
        <Label htmlFor="annualGasKwh">Annual gas use (kWh)</Label>
        <input
          id="annualGasKwh"
          type="number"
          placeholder="e.g. 12,000"
          min={0}
          max={200000}
          value={form.annualGasKwh}
          onChange={(e) => onChange('annualGasKwh', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.annualGasKwh)}
        />
        <FieldError msg={errors.annualGasKwh} />
        <p className="mt-1 text-[11px] text-slate-600">Leave blank if not applicable (e.g. heat pump only)</p>
      </div>

      <div>
        <Label htmlFor="annualEnergyCost">Annual energy cost (£)</Label>
        <input
          id="annualEnergyCost"
          type="number"
          placeholder="e.g. 2,400"
          min={0}
          max={50000}
          value={form.annualEnergyCost}
          onChange={(e) => onChange('annualEnergyCost', e.target.value === '' ? '' : Number(e.target.value))}
          className={inputCls(errors.annualEnergyCost)}
        />
        <FieldError msg={errors.annualEnergyCost} />
      </div>

      <div>
        <Label htmlFor="dataSource">Data source</Label>
        <select
          id="dataSource"
          value={form.dataSource}
          onChange={(e) => onChange('dataSource', e.target.value)}
          className={selectCls()}
        >
          <option value="">Select source…</option>
          <option value="manual">Manual entry (from bills)</option>
          <option value="estimated">Estimated</option>
          <option value="smart_meter">Smart meter data</option>
        </select>
      </div>

      <div className="sm:col-span-2 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Smart Energy Management</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="hasSmartMeter">Smart meter</Label>
            <select id="hasSmartMeter" value={form.hasSmartMeter === '' ? '' : form.hasSmartMeter ? 'true' : 'false'} onChange={(e) => onChange('hasSmartMeter', e.target.value === '' ? '' : e.target.value === 'true')} className={selectCls()}>
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <Label htmlFor="hasSmartThermostat">Smart thermostat</Label>
            <select id="hasSmartThermostat" value={form.hasSmartThermostat === '' ? '' : form.hasSmartThermostat ? 'true' : 'false'} onChange={(e) => onChange('hasSmartThermostat', e.target.value === '' ? '' : e.target.value === 'true')} className={selectCls()}>
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <Label htmlFor="hasAutomatedLighting">Automated lighting</Label>
            <select id="hasAutomatedLighting" value={form.hasAutomatedLighting === '' ? '' : form.hasAutomatedLighting ? 'true' : 'false'} onChange={(e) => onChange('hasAutomatedLighting', e.target.value === '' ? '' : e.target.value === 'true')} className={selectCls()}>
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <Label htmlFor="hasEnergyMonitoring">Energy monitoring system</Label>
            <select id="hasEnergyMonitoring" value={form.hasEnergyMonitoring === '' ? '' : form.hasEnergyMonitoring ? 'true' : 'false'} onChange={(e) => onChange('hasEnergyMonitoring', e.target.value === '' ? '' : e.target.value === 'true')} className={selectCls()}>
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <Label htmlFor="hasAutomatedOptimization">Automated energy optimization</Label>
            <select id="hasAutomatedOptimization" value={form.hasAutomatedOptimization === '' ? '' : form.hasAutomatedOptimization ? 'true' : 'false'} onChange={(e) => onChange('hasAutomatedOptimization', e.target.value === '' ? '' : e.target.value === 'true')} className={selectCls()}>
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

type StepProps = {
  form: PropertyFormData;
  errors: Errors;
  onChange: (key: keyof PropertyFormData, value: unknown) => void;
};

// ─── Steps config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic', label: 'Property Details', icon: Home, Component: StepBasic },
  { id: 'envelope', label: 'Building Envelope', icon: Layers, Component: StepEnvelope },
  { id: 'systems', label: 'Energy Systems', icon: Zap, Component: StepSystems },
  { id: 'usage', label: 'Energy Usage', icon: BarChart3, Component: StepUsage },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { setAssessment } = useApp();
  const router = useRouter();

  const onChange = useCallback(
    (key: keyof PropertyFormData, value: unknown) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const handleNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    
    try {
      // Try to call the Next.js API route first
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        const data = await res.json();
        setAssessment(data.data);
      } else {
        // Fallback to local calculation (Demo mode)
        const assessment = computeAssessmentFromForm(form);
        setAssessment(assessment);
      }
    } catch (e) {
      // Fallback
      console.warn('API unavailable, falling back to local calculation');
      const assessment = computeAssessmentFromForm(form);
      setAssessment(assessment);
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push('/'), 1500);
  };

  const { Component } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  if (submitted) {
    return (
      <div className="mesh-bg flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
          <p className="text-slate-400 mt-2">Redirecting you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
            <Leaf className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Assess Your Property</h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete this form to generate your personalised Green Home Score and retrofit plan.
          </p>
        </div>

        {/* Progress stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${done ? 'border-emerald-500 bg-emerald-500' : active ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/15 bg-white/5'}`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    <span
                      className={`hidden sm:block text-[10px] font-medium whitespace-nowrap ${
                        active ? 'text-emerald-400' : done ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 transition-colors duration-500 ${
                        done ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-bold text-white mb-1">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </h2>
          <p className="text-xs text-slate-500 mb-6">Fields marked <span className="text-red-400">*</span> are required.</p>

          <Component form={form} errors={errors} onChange={onChange} />

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step ? 'h-1.5 w-5 bg-emerald-500' : i < step ? 'h-1.5 w-1.5 bg-emerald-700' : 'h-1.5 w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <Leaf className="h-4 w-4" />
                    Assess Property
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-600">
          All data is processed locally in your browser. Nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Properties Table
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    postcode TEXT,
    construction_year TEXT,
    floor_area NUMERIC,
    bedrooms INTEGER,
    wall_type TEXT,
    wall_insulation TEXT,
    roof_insulation TEXT,
    glazing_type TEXT,
    window_area NUMERIC,
    heating_system TEXT,
    hot_water_system TEXT,
    has_solar_pv BOOLEAN DEFAULT false,
    solar_capacity_kw NUMERIC,
    has_solar_thermal BOOLEAN DEFAULT false,
    epc_rating TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Assessments Table
CREATE TABLE public.assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, complete
    green_score NUMERIC, -- Final verified score (null if incomplete)
    provisional_points NUMERIC, -- Sum of available contributions
    score_category TEXT,
    annual_energy_kwh NUMERIC,
    annual_cost_gbp NUMERIC,
    annual_carbon_kg NUMERIC,
    inefficiency_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Assessment Components Table
CREATE TABLE public.assessment_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    component_id TEXT NOT NULL, -- e.g., 'epc', 'eci', 'insulation'
    label TEXT NOT NULL,
    score NUMERIC, -- Null if unavailable
    max_score NUMERIC NOT NULL DEFAULT 100,
    weight NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'excellent', 'good', 'fair', 'poor', 'unavailable'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Simulation Jobs Table
CREATE TABLE public.simulation_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'baseline', 'retrofit'
    scenario_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'blocked_missing_inputs'
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Simulation Results Table
CREATE TABLE public.simulation_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.simulation_jobs(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    annual_energy_kwh NUMERIC,
    annual_carbon_kg NUMERIC,
    heating_energy_kwh NUMERIC,
    cooling_energy_kwh NUMERIC,
    raw_outputs JSONB, -- Additional unsupported values
    data_provenance TEXT, -- 'energyplus', 'estimated', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Retrofit Catalogue Table
CREATE TABLE public.retrofit_catalogue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    required_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    feasibility_constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
    simulation_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_assessments_property_id ON public.assessments(property_id);
CREATE INDEX idx_simulation_jobs_property_id ON public.simulation_jobs(property_id);
CREATE INDEX idx_simulation_results_job_id ON public.simulation_results(job_id);

-- Setup Row Level Security (RLS)

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrofit_catalogue ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Properties: users can only select/insert/update/delete their own properties
CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

-- Assessments: users can only manage assessments for their properties
CREATE POLICY "Users can view own assessments" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assessments" ON public.assessments FOR DELETE USING (auth.uid() = user_id);

-- Assessment Components: cascade from assessments
CREATE POLICY "Users can view own components" ON public.assessment_components FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.user_id = auth.uid())
);
CREATE POLICY "Users can insert own components" ON public.assessment_components FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.user_id = auth.uid())
);
CREATE POLICY "Users can delete own components" ON public.assessment_components FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.user_id = auth.uid())
);

-- Simulation Jobs & Results
CREATE POLICY "Users can view own jobs" ON public.simulation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.simulation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own simulation results" ON public.simulation_results FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid())
);

-- Catalogue: readable by all authenticated users
CREATE POLICY "Anyone can view active retrofits" ON public.retrofit_catalogue FOR SELECT USING (is_active = true);

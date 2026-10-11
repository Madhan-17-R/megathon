# Green Home Score & Retrofit Recommendation Engine — Core Logic & ML Layer

**Lloyds Megathon X — Problem Statement 2**  
**Team ID:** 173  
**Architecture Source of Truth:** `docs/M1.pdf`  

---

## 1. Subsystem Architecture

The **Core Logic & ML Layer** acts as the high-integrity calculation, simulation, and inference engine operating behind the Next.js API and LLM explanation layer.

```
PROPERTY & USAGE INPUTS
        │
        ▼
╔═══════════════════════════════════════════════════════════════════════╗
║                   PYTHON ASSESSMENT WORKER ENGINE                     ║
║                                                                       ║
║  1. Deterministic 7-Component Green Home Score (M1 Formula)           ║
║  2. Strict Monotonicity & Boundary Enforcement                        ║
║  3. Transparent Missing-Data Handling (No Silent Zeroing)             ║
║  4. ML Energy Demand Inference & Model Registry (DESNZ NEED 2022)     ║
║  5. EnergyPlus Physical Simulation Adapter & Engineering Fallback     ║
║  6. Retrofit Feasibility, Constraint Filtering & Priority Ranking     ║
║  7. Interactive Diminishing Returns for Fabric Upgrades               ║
║  8. Fuel-Separated Energy Deltas & Negative Electricity Draw Tracking ║
║  9. Official UK Government GHG Carbon Accounting (2024 Factors)       ║
║  10. Indicative Tariffs, Payback & Prohibited Hardcoded Uplifts       ║
║  11. REST API Gateway (FastAPI) for Next.js and Supabase Workers      ║
╚═══════════════════════════════════════════════════════════════════════╝
        │
        ▼
STRUCTURED ASSESSMENT & SCENARIO RESULTS (JSON)
        │
        ▼
NEXT.JS API & SERVER-SIDE GROUNDED LLM EXPLANATION GATEWAY
```

---

## 2. Seven-Component Scoring Formula

The Green Home Score is a deterministic index ranging from **0 to 100**, calculated using fixed weights mandated in `M1.pdf`:

| Component | Weight | Percentage | Domain Focus |
|---|---|---|---|
| **Energy Efficiency** | 0.25 | 25% | Asset thermal rating (EPC Band / SAP score) |
| **Energy Consumption Intensity** | 0.20 | 20% | Operational usage normalized by floor area ($kWh/m^2/year$) |
| **Insulation** | 0.15 | 15% | Roof/loft insulation depth & wall construction |
| **Heating System** | 0.15 | 15% | Space heating seasonal efficiency (COP) & fuel factor |
| **Windows and Glazing** | 0.10 | 10% | Whole-window thermal transmittance ($U$-value) |
| **Renewable Energy** | 0.10 | 10% | Solar PV rated capacity ($kWp$) / micro-generation |
| **Smart Energy Management** | 0.05 | 5% | Smart learning thermostats & zoned scheduling |

### Classification Tiers
- **80 – 100:** Highly efficient
- **65 – 79:** Good
- **50 – 64:** Moderate
- **30 – 49:** Poor *(Flagged for improvement priority)*
- **0 – 29:** Very poor *(Flagged for urgent improvement priority)*

---

## 3. Directory Structure

```
model/ (worker layer)
├── app/
│   ├── __init__.py
│   ├── schemas.py              # Pydantic v2 domain schemas & contracts
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py             # FastAPI HTTP service & endpoints (Phase 9)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── scoring.py          # Deterministic 7-component engine (Phases 1-2)
│   │   ├── efficiency.py       # Inefficiency identification (Phase 6)
│   │   ├── retrofit_engine.py  # Feasibility & priority ranking (Phase 6)
│   │   ├── energy_calculator.py# Fuel savings & diminishing returns (Phase 6)
│   │   ├── carbon_calculator.py# Official 2024 UK GHG conversion (Phase 6)
│   │   ├── financial_calculator.py # Tariffs, payback & financial bounds (Phase 6)
│   │   └── orchestrator.py     # End-to-end assessment pipeline (Phase 8)
│   ├── energyplus/
│   │   ├── __init__.py
│   │   └── adapter.py          # EnergyPlus physics adapter & fallback (Phase 7)
│   └── ml/
│       ├── __init__.py
│       ├── wdac_compat.py      # Windows AppLocker compatibility shim
│       ├── feature_dictionary.py # Encoded feature schemas
│       ├── preprocessing.py    # Leakage-free feature preprocessor (Phase 4)
│       ├── train_energy_model.py # ML training & validation selection (Phase 5)
│       ├── energy_model.py     # ML inference wrapper (Phase 5)
│       └── evaluate_models.py  # Residual analysis & markdown report (Phase 5)
├── data/
│   ├── raw/                    # Raw open datasets (excluded from git)
│   └── processed/              # Cleaned training matrices & preprocessor
├── docs/
│   ├── api_contract.md         # Detailed FastAPI REST interface specification
│   ├── integration_guide.md    # Next.js API & curl integration guide
│   ├── model_evaluation.md     # ML performance, metrics & subgroup residuals
│   ├── energyplus_methodology.md # EnergyPlus physics simulation architecture
│   ├── data_licence_register.md# Verified open licences (OGL v3.0, ODbL)
│   ├── data_dictionary.md      # Field definitions and validation ranges
│   ├── scoring_methodology.md  # Formula, sub-scores & monotonicity proofs
│   └── target_feasibility_report.md # Target feasibility analysis
├── models/
│   ├── gas_model.joblib        # Random Forest model for Gcons2022
│   ├── electricity_model.joblib# Ridge regression model for Econs2022
│   ├── energy_models_bundle.joblib # Full pipeline artifact bundle
│   └── model_metadata.json     # Training configuration, seeds & test metrics
├── tests/
│   ├── test_scoring.py         # Scoring weights, boundaries & monotonicity
│   ├── test_data_validation.py # Dataset integrity & GHG factors
│   ├── test_preprocessing.py   # Feature engineering & leakage prevention
│   ├── test_ml_models.py       # ML benchmarks, metrics & inference
│   ├── test_retrofits.py       # Retrofit feasibility, energy & carbon tests
│   ├── test_energyplus.py      # Simulation detection & fallback tests
│   ├── test_orchestrator.py    # Pipeline orchestration & scenario packages
│   └── test_api.py             # FastAPI REST endpoints tests
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 4. Setup, Local Run & Testing (Zero Docker Required)

### 4.1 Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### 4.2 Start the Python Assessment Worker
```powershell
python -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 4.3 Run Complete Test Suite
```powershell
pytest tests/ -v
```

---

## 5. Phased Implementation Roadmap Status

- [x] **Phase 1: Environment Inspection, Data Licencing & Architectural Specification**
- [x] **Phase 2: Deterministic Scoring Foundation, Monotonicity & Boundary Tests**
- [x] **Phase 3: Data Licence Audit, Manageable Acquisition & Target Feasibility Analysis**
- [x] **Phase 4: Reproducible Data Preprocessing & ML Dataset Preparation**
- [x] **Phase 5: ML Energy Demand Model Training & Evaluation (Dummy, Ridge, Random Forest)**
- [x] **Phase 6: Retrofit Feasibility Engine, Carbon & Financial Calculations**
- [x] **Phase 7: EnergyPlus Physics Simulation Adapter & Graceful Fallback**
- [x] **Phase 8: Assessment Pipeline Orchestrator & What-If Scenario Evaluation**
- [x] **Phase 9: FastAPI Endpoints & API Contract Documentation**
- [x] **Phase 10: Integration Readiness, End-to-End Tests & Final Handover**

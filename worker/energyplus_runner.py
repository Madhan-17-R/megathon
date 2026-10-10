import subprocess
import os
import json
from typing import Dict, Any, Tuple
from schemas import PropertyDetails, SimulationScenario, SimulationResultOutput

# In a real environment, this path would point to the EnergyPlus executable
EPLUS_PATH = os.environ.get("EPLUS_PATH", "energyplus")

def check_eplus_available() -> bool:
    """Check if the EnergyPlus executable is available."""
    try:
        subprocess.run([EPLUS_PATH, "--version"], capture_output=True, check=False)
        return True
    except (FileNotFoundError, OSError):
        return False

def check_required_inputs(prop: PropertyDetails) -> Tuple[bool, list[str]]:
    """Check if the property has the minimum required fields for an E+ run."""
    missing = []
    if not prop.floor_area or prop.floor_area <= 0:
        missing.append("floor_area")
    if not prop.wall_type:
        missing.append("wall_type")
    if not prop.heating_system:
        missing.append("heating_system")
        
    return (len(missing) == 0, missing)

def run_energyplus(prop: PropertyDetails, scenario: SimulationScenario) -> SimulationResultOutput:
    """Run a physics-based simulation using EnergyPlus (or mock it if E+ is missing)."""
    
    is_valid, missing_fields = check_required_inputs(prop)
    
    if not is_valid:
        # Cannot run physics simulation without basic geometry/systems
        return SimulationResultOutput(
            scenario_name=scenario.scenario_type,
            data_provenance="blocked",
            raw_outputs={"missing_fields": missing_fields}
        )
        
    if not check_eplus_available():
        # E+ is not installed/configured. Return a clear "estimated" stub for demo purposes.
        # Do NOT claim this is a real physics run.
        
        # Simple estimation logic for the stub
        area = prop.floor_area or 100
        baseline_kwh = area * 150 # Roughly 150 kWh/m2 baseline
        
        if scenario.scenario_type == 'retrofit':
            # Stub some arbitrary savings based on the retrofit parameters
            saving_pct = scenario.parameters.get('expected_saving_pct', 0.10)
            baseline_kwh = baseline_kwh * (1 - saving_pct)
            
        return SimulationResultOutput(
            scenario_name=scenario.scenario_type,
            annual_energy_kwh=baseline_kwh,
            annual_carbon_kg=baseline_kwh * 0.21, # UK roughly 0.21 kg/kWh
            heating_energy_kwh=baseline_kwh * 0.6,
            cooling_energy_kwh=0,
            data_provenance="estimated",
            raw_outputs={"note": "EnergyPlus executable not found. Using simple estimates."}
        )

    # =====================================================================
    # REAL ENERGYPLUS EXECUTION (Stubbed structure for production)
    # =====================================================================
    # 1. Generate IDF (Input Data File) using property properties and epJSON
    # 2. Select EPW (Weather file) based on property postcode/region
    # 3. Run subprocess: subprocess.run([EPLUS_PATH, "-w", epw_path, "-r", idf_path])
    # 4. Parse eplusout.err to check for fatal errors
    # 5. Parse eplusout.eso or eplusout.sql to extract exact kWh outputs
    # 6. Return structured data
    
    # Placeholder for successful real run
    return SimulationResultOutput(
        scenario_name=scenario.scenario_type,
        annual_energy_kwh=0.0, 
        annual_carbon_kg=0.0,
        data_provenance="energyplus",
        raw_outputs={"status": "Real E+ parsing not yet implemented"}
    )

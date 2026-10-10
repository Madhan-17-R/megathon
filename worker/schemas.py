from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class PropertyDetails(BaseModel):
    property_id: str
    property_type: str
    floor_area: Optional[float] = None
    construction_year: Optional[str] = None
    wall_type: Optional[str] = None
    roof_insulation: Optional[str] = None
    glazing_type: Optional[str] = None
    heating_system: Optional[str] = None

class SimulationScenario(BaseModel):
    scenario_type: str = Field(..., description="e.g. 'baseline' or 'retrofit'")
    retrofit_id: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)

class SimulationJobRequest(BaseModel):
    job_id: str
    property_details: PropertyDetails
    scenarios: list[SimulationScenario]

class SimulationResultOutput(BaseModel):
    scenario_name: str
    annual_energy_kwh: Optional[float] = None
    annual_carbon_kg: Optional[float] = None
    heating_energy_kwh: Optional[float] = None
    cooling_energy_kwh: Optional[float] = None
    raw_outputs: Dict[str, Any] = Field(default_factory=dict)
    data_provenance: str = Field(..., description="'energyplus', 'estimated', or 'blocked'")

class SimulationJobResponse(BaseModel):
    job_id: str
    status: str
    error_details: Optional[str] = None
    results: list[SimulationResultOutput]

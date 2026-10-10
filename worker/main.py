import os
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import ValidationError
from schemas import SimulationJobRequest, SimulationJobResponse, SimulationResultOutput
from energyplus_runner import run_energyplus

# Configure basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Green Home Score - Simulation Worker")

def process_job(request: SimulationJobRequest):
    """Process a simulation job in the background."""
    logger.info(f"Processing job {request.job_id} for property {request.property_details.property_id}")
    
    results = []
    has_blocked = False
    error_msg = None
    
    try:
        for scenario in request.scenarios:
            logger.info(f"Running scenario: {scenario.scenario_type}")
            result = run_energyplus(request.property_details, scenario)
            results.append(result)
            
            if result.data_provenance == "blocked":
                has_blocked = True
                error_msg = "Missing required inputs: " + ", ".join(result.raw_outputs.get("missing_fields", []))
                break # Stop running subsequent scenarios if blocked
                
    except Exception as e:
        logger.error(f"Error processing job {request.job_id}: {str(e)}")
        has_blocked = True
        error_msg = str(e)

    # In a real architecture, the worker would now POST these results back to the Next.js API
    # or write them directly to Supabase.
    status = "completed"
    if has_blocked:
        status = "blocked_missing_inputs" if "Missing required inputs" in str(error_msg) else "failed"
        
    logger.info(f"Job {request.job_id} finished with status: {status}")
    
    # Example Supabase update (requires SUPABASE_URL and SUPABASE_SERVICE_KEY)
    # supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
    # supabase.table("simulation_jobs").update({"status": status, "error_details": error_msg}).eq("id", request.job_id).execute()
    # for r in results:
    #     supabase.table("simulation_results").insert({...}).execute()

@app.post("/api/jobs/run", response_model=dict)
async def run_simulation_job(request: SimulationJobRequest, background_tasks: BackgroundTasks):
    """Queue a simulation job."""
    
    # We offload the actual E+ execution to a background task so the web request doesn't timeout
    background_tasks.add_task(process_job, request)
    
    return {"message": "Job queued successfully", "job_id": request.job_id}

@app.get("/health")
def health_check():
    return {"status": "ok"}

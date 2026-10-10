FROM python:3.11-slim

# Install system dependencies (including EnergyPlus dependencies if needed later)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# NOTE: For a real EnergyPlus deployment, you would download and install 
# the official EnergyPlus Linux binary here.
# e.g. RUN curl -SLO https://github.com/NREL/EnergyPlus/releases/download/...

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

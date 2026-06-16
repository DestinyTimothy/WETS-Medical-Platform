import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="WETS Machine Learning Telemetry Core")

# Enable CORS so your frontend HTML/JS files can talk to this backend server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Aligned 7-Class Production Target Mapping Reference Grid
DISEASE_CLASSES = {
    0: {"code": "NORM", "name": "Normal Sinus Rhythm"},
    1: {"code": "STACH", "name": "Sinus Tachycardia"},
    2: {"code": "SBRAD", "name": "Sinus Bradycardia"},
    3: {"code": "MI", "name": "Myocardial Infarction (Heart Attack)"},
    4: {"code": "CD", "name": "Conduction Disorder / Block"},
    5: {"code": "AFIB", "name": "Atrial Fibrillation"},
    6: {"code": "PVC", "name": "Premature Ventricular Contractions"}
}

# 2. Incoming Data Structural Blueprint
class TelemetryPayload(BaseModel):
    patient_id: str
    signal_string: str  # Comma-separated telemetry string from your text file

# 3. Simulated Lightweight Inference Class mimicking your Notebook Architecture
class TriageInferenceEngine:
    def __init__(self):
        # In a full deployment, you would load your weights:
        # self.model = WearableTriageModel()
        # self.model.load_state_dict(torch.load("model.pt"))
        pass

    def process_signal(self, raw_string: str):
        try:
            # Tokenize: Split comma text, convert characters to floating-point values
            numeric_values = [float(val.strip()) for val in raw_string.split(",") if val.strip()]
            
            # Pad or slice to exactly match the model input length (e.g., 500 points)
            if len(numeric_values) < 500:
                numeric_values += [0.0] * (500 - len(numeric_values))
            else:
                numeric_values = numeric_values[:500]
                
            return torch.tensor([numeric_values], dtype=torch.float32)
        except Exception:
            raise ValueError("Telemetry data contains invalid structural characters.")

    def run_inference(self, signal_tensor):
        # Simulating modern 7-class distribution probabilities array weight matrices
        mock_weights = np.random.dirichlet(np.ones(7))[0]
        predicted_class_idx = int(np.argmax(mock_weights))
        
        # Sync calculated hardware vital metrics dynamically based on target structural diagnostic paths
        if predicted_class_idx == 0:  # NORM
            calculated_hr = int(np.random.randint(65, 85))
            calculated_spo2 = float(np.random.uniform(96.5, 99.5))
        elif predicted_class_idx == 1:  # STACH
            calculated_hr = int(np.random.randint(110, 150))
            calculated_spo2 = float(np.random.uniform(93.0, 96.0))
        elif predicted_class_idx == 2:  # SBRAD
            calculated_hr = int(np.random.randint(42, 54))
            calculated_spo2 = float(np.random.uniform(94.0, 97.0))
        else:  # Pathological signatures (MI, CD, AFIB, PVC)
            calculated_hr = int(np.random.randint(55, 115))
            calculated_spo2 = float(np.random.uniform(88.0, 93.5))

        severity_score = float(np.max(mock_weights) if predicted_class_idx != 0 else np.random.uniform(0.0, 0.25))

        return predicted_class_idx, calculated_hr, calculated_spo2, severity_score

engine = TriageInferenceEngine()

# 4. Corrected Telemetry Post API Route to match vitals.js fetch path exactly
@app.post("/api/vitals/analyze")
async def analyze_vitals(payload: TelemetryPayload):
    try:
        signal_tensor = engine.process_signal(payload.signal_string)
        class_idx, hr, spo2, severity = engine.run_inference(signal_tensor)
        
        disease = DISEASE_CLASSES[class_idx]
        
        return {
            "status": "success",
            "patient_id": payload.patient_id,
            "metrics": {
                "heart_rate": hr,
                "spo2": spo2,
                "severity_score": severity
            },
            "diagnosis": {
                "class_code": disease["code"],
                "rhythm_classification": disease["name"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Initialized string app route matching with hot reload enabled for clean active local iterations
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
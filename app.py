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

# 1. Define the PTB-XL Real-World Disease Reference Map
DISEASE_CLASSES = {
    0: {"code": "NORM", "name": "Normal Cardiac Profile"},
    1: {"code": "MI", "name": "Myocardial Infarction (Heart Attack)"},
    2: {"code": "STTC", "name": "ST/T Changes (Ischemia/Oxygen Starvation)"},
    3: {"code": "CD", "name": "Conduction Disturbance (Electrical Block)"},
    4: {"code": "HYP", "name": "Hypertrophy (Muscle Wall Thickening)"}
}

ARRHYTHMIA_TYPES = {
    0: "Normal Rhythm",
    1: "Atrial Fibrillation (AFib)",
    2: "Sinus Bradycardia (SBRAD)",
    3: "Sinus Tachycardia (STACH)",
    4: "General Arrhythmia / Anomaly"
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
        # Simulating model forward pass execution weights matrix
        # Returns disease probabilities, rhythm labels, SpO2 levels, and severity score
        mock_weights = np.random.dirichlet(np.ones(5))[0]
        predicted_class_idx = int(np.argmax(mock_weights))
        predicted_rhythm_idx = int(np.random.choice([0, 1, 2, 3, 4], p=[0.6, 0.1, 0.1, 0.1, 0.1]))
        
        calculated_spo2 = float(np.random.uniform(94.0, 99.5) if predicted_rhythm_idx == 0 else np.random.uniform(88.0, 93.0))
        calculated_hr = int(np.random.randint(60, 90) if predicted_rhythm_idx == 0 else (np.random.randint(40, 49) if predicted_rhythm_idx == 2 else np.random.randint(125, 160)))
        severity_score = float(np.max(mock_weights) if predicted_class_idx != 0 else np.random.uniform(0.0, 0.35))

        return predicted_class_idx, predicted_rhythm_idx, calculated_hr, calculated_spo2, severity_score

engine = TriageInferenceEngine()

# 4. The Telemetry Post API Route
@app.post("/api/telemetry/analyze")
async def analyze_telemetry(payload: TelemetryPayload):
    try:
        signal_tensor = engine.process_signal(payload.signal_string)
        class_idx, rhythm_idx, hr, spo2, severity = engine.run_inference(signal_tensor)
        
        disease = DISEASE_CLASSES[class_idx]
        rhythm = ARRHYTHMIA_TYPES[rhythm_idx]
        
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
                "class_name": disease["name"],
                "rhythm_classification": rhythm
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
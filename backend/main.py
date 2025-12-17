from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agents import strategist_agent, drafter_agent, compliance_agent

app = FastAPI()

# Allow frontend to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class RFPInput(BaseModel):
    text: str

class DraftInput(BaseModel):
    requirement: str

class AuditInput(BaseModel):
    draft_text: str

# --- Routes ---

@app.get("/")
def read_root():
    return {"status": "RFP Co-pilot Backend is Running"}

@app.post("/analyze-rfp")
def analyze_rfp(input_data: RFPInput):
    """Triggers the Strategist Agent"""
    result = strategist_agent(input_data.text)
    return result

@app.post("/draft-response")
def draft_response(input_data: DraftInput):
    """Triggers the Drafter Agent"""
    response_text = drafter_agent(input_data.requirement)
    return {"draft": response_text}

@app.post("/check-compliance")
def check_compliance(input_data: AuditInput):
    """Triggers the Compliance Agent"""
    audit_result = compliance_agent(input_data.draft_text)
    return {"audit": audit_result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
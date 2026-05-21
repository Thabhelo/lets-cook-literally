"""Let's Cook FastAPI application server."""

import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from prompts import SYSTEM_PROMPT, VOICE_PROMPTS, VALID_VOICES, DEFAULT_VOICE

# Load environment variables from .env
load_dotenv()

app = FastAPI(title="Let's Cook")

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GenAI Client Setup ---
def _create_client():
    """Create a fresh Google GenAI client for each request."""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return genai.Client(api_key=api_key)
    # Vertex AI fallback
    return genai.Client(
        vertexai=True,
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
    )


def normalize_voice(voice: str) -> str:
    """Normalize input voice to lowercase and fallback if invalid."""
    if not voice:
        return DEFAULT_VOICE
    normalized = voice.strip().lower()
    if normalized in VALID_VOICES:
        return normalized
    return DEFAULT_VOICE


def strip_markdown_fences(text: str) -> str:
    """Strip JSON markdown fences from the LLM response if present."""
    response_text = text.strip()
    if response_text.startswith("```"):
        # Split off the first line (e.g. ```json or ```)
        parts = response_text.split("\n", 1)
        if len(parts) > 1:
            response_text = parts[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        response_text = response_text.strip()
    return response_text


# --- Models ---

class ChefStepResponse(BaseModel):
    coach_name: str = Field(..., description="The name of the chef personality")
    observation: str = Field(..., description="Objective description of what you see in the kitchen frame")
    critique: str = Field(..., description="Coaching tip or correction based on the visual state in the chef's voice")
    severity: str = Field(..., description="Severity level of the critique: 'info', 'warning', or 'danger'")
    next_step: str = Field(..., description="The next recipe step instruction for the user to execute, spoken in the chef's voice")
    step_number: int = Field(..., description="The step number of this instruction in the sequence")
    done: bool = Field(..., description="True if the dish is completed and cooking session is finished")


# --- Routes ---

@app.post("/api/coach", response_model=ChefStepResponse)
async def analyze_cooking_step(
    image: UploadFile = File(...),
    cooking_goal: str = Form(...),
    voice: str = Form("grandma"),
    step_number: int = Form(1),
    history_json: str = Form("[]")
):
    """Analyze a single live webcam frame and return the next recipe step and technique feedback."""
    normalized_voice = normalize_voice(voice)
    
    # Read image bytes
    try:
        image_bytes = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image bytes: {str(e)}")

    client = _create_client()
    try:
        system_instruction = f"{SYSTEM_PROMPT}\n\n{VOICE_PROMPTS[normalized_voice]}"
        
        # Format the prompt with history details
        prompt = f"""
The user is cooking: "{cooking_goal}".
Current step number the user has completed: {step_number}.

Here is the history of previous instructions and observations in this cooking session:
{history_json}

Please inspect the kitchen workspace shown in the image. Give your observation, critique, severity, and the next step instruction ({step_number + 1} or repeat current step if corrections are critical) to guide the user.
"""
        
        # Pass image bytes directly in contents list
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/jpeg",
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
                response_mime_type="application/json",
                response_schema=ChefStepResponse,
            )
        )
        
        response_text = strip_markdown_fences(response.text)
        step_data = json.loads(response_text)
        
        return ChefStepResponse(**step_data)

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        raise HTTPException(status_code=500, detail="The coach got confused formatting the step guidance. Please try again!")
    except Exception as e:
        print(f"Gemini generation error: {e}")
        raise HTTPException(status_code=500, detail=f"The coach encountered an issue: {str(e)}")


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "cooking"}


# Mount static files for frontend
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
os.makedirs(frontend_path, exist_ok=True)
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

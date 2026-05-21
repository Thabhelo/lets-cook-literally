import io
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from main import app, normalize_voice, strip_markdown_fences

client = TestClient(app)


# --- Unit Tests ---

def test_voice_normalization():
    """Verify that input voices are normalized and fallback to grandma if invalid."""
    assert normalize_voice("GRANDMA") == "grandma"
    assert normalize_voice("michelin ") == "michelin"
    assert normalize_voice("budget") == "budget"
    assert normalize_voice("survivalist") == "survivalist"
    assert normalize_voice("invalid_voice") == "grandma"
    assert normalize_voice("") == "grandma"
    assert normalize_voice(None) == "grandma"


def test_markdown_fence_stripping():
    """Verify that JSON markdown fences are stripped from LLM output correctly."""
    # JSON language block
    json_block = "```json\n{\n  \"coach_name\": \"Grandma\"\n}\n```"
    assert strip_markdown_fences(json_block) == "{\n  \"coach_name\": \"Grandma\"\n}"

    # General block
    general_block = "```\n{\n  \"coach_name\": \"Grandma\"\n}\n```"
    assert strip_markdown_fences(general_block) == "{\n  \"coach_name\": \"Grandma\"\n}"

    # No block
    plain_text = "{\n  \"coach_name\": \"Grandma\"\n}"
    assert strip_markdown_fences(plain_text) == plain_text


# --- Integration Tests ---

def test_health_endpoint():
    """Verify health endpoint response."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "cooking"}


@patch("main._create_client")
def test_cooking_step_analysis_success(mock_create_client):
    """Verify live webcam frame cooking step critique and next step instructions."""
    # Setup client mock
    mock_client = MagicMock()
    mock_create_client.return_value = mock_client
    
    # Mock Gemini generate response conforming to ChefStepResponse
    mock_gemini_resp = MagicMock()
    mock_gemini_resp.text = """
    {
      "coach_name": "Cozy Grandma",
      "observation": "I see a pan on medium heat with butter melting nicely.",
      "critique": "You're doing wonderful, sweetie! Keep an eye on the heat so the butter doesn't burn.",
      "severity": "info",
      "next_step": "Pour in your pancake batter gently.",
      "step_number": 2,
      "done": false
    }
    """
    mock_client.models.generate_content.return_value = mock_gemini_resp

    # Make API call with mock multipart form data
    fake_image = io.BytesIO(b"fake jpeg frame bytes")
    response = client.post(
        "/api/coach",
        files={"image": ("frame.jpg", fake_image, "image/jpeg")},
        data={
            "cooking_goal": "Fluffy Pancakes",
            "voice": "grandma",
            "step_number": 1,
            "history_json": "[]"
        }
    )

    # Asserts
    assert response.status_code == 200
    data = response.json()
    assert data["coach_name"] == "Cozy Grandma"
    assert data["observation"] == "I see a pan on medium heat with butter melting nicely."
    assert data["critique"] == "You're doing wonderful, sweetie! Keep an eye on the heat so the butter doesn't burn."
    assert data["severity"] == "info"
    assert data["next_step"] == "Pour in your pancake batter gently."
    assert data["step_number"] == 2
    assert data["done"] is False
    
    # Assert generate_content was called
    mock_client.models.generate_content.assert_called_once()

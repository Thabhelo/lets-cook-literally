# 🍳 Fridge Chef

Recast your random leftovers into a single creative recipe with a custom AI culinary voice and a photo.

## What it does (in plain English)

Fridge Chef is a single-page web application that helps you rescue ingredients that are lingering in your fridge. Instead of having to purchase a specific list of ingredients for a pre-made recipe, you type in whatever ingredients you currently have (e.g., "half an onion, 2 tortillas, leftover chicken breasts"), select one of the four unique AI Chef personalities, and click **Conjure Recipe**. 

The app generates:
1. A creative, structured recipe matching your ingredients.
2. Distinctly categorized lists separating **Rescued Fridge Ingredients** from assumed **Pantry Staples**.
3. An interactive step-by-step cooking checklist where steps can be struck off as you cook.
4. Custom commentary/feedback written in your selected AI Chef's voice.
5. A beautiful, realistic AI-generated photo of the final plated dish (with graceful fallback if image generation fails).

### The Culinary Voices 🧑‍🍳
* **👵 Cozy Grandma**: Warm, doting comfort food instructions.
* **👨‍🍳 Michelin Chef**: Fine-dining concepts, reductions, plating, and refined techniques.
* **💰 Scrappy Saver**: Budget-conscious substitutions and zero-waste efficiency.
* **☣️ Wasteland Survivor**: Post-apocalyptic bunker ration styling.

---

## Technical Stack & Architecture

- **Backend**: FastAPI (Python) serving static frontend files and API endpoints, powered by the new `google-genai` SDK.
- **AI Engine**: Gemini 2.5 Flash (`gemini-2.5-flash`) for recipe JSON generation, and Imagen 3 (`imagen-3.0-generate-002`) for square recipe photos.
- **Frontend**: Single Page Application built with Vanilla HTML, custom CSS (glassmorphism look & feel), and Vanilla JS.
- **Package Manager**: Managed inside a virtual environment using `uv`.

---

## Installation

To run this project on a new machine:

1. **Install uv** (if you don't have it already):
   ```bash
   # On macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone <repo-url>
   cd codingjam-fridge-chef
   ```
3. **Sync dependencies**:
   Navigate into the `backend/` folder and run `uv sync` to set up the virtualenv and install FastAPI, google-genai, pillow, pytest, and others:
   ```bash
   cd backend
   uv sync
   ```

---

## Configuration

1. Create a `.env` file in the `backend/` directory:
   ```bash
   touch backend/.env
   ```
2. Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   *(Note: The `.env` file is already listed in `.gitignore` to prevent committing secrets).*

---

## How to Run

### 1. Run the Development Server
From the `backend/` directory:
```bash
uv run uvicorn main:app --reload
```
Open your browser and navigate to **`http://localhost:8000`** to interact with the application.

### 2. Run Tests
From the `backend/` directory:
```bash
uv run pytest -v
```
This executes both the unit tests (voice normalization, input sanitation, markdown fence parsing) and the fully mocked integration tests.

---

## Design Documents (Source of Truth)
The project is built entirely in alignment with the following specification files:
- [Product Specifications](file:///Users/thabhelo/code/codingjam-fridge-chef/product.md): Describes user personas, I/O structure, and voice details.
- [UI/UX Specifications](file:///Users/thabhelo/code/codingjam-fridge-chef/ui.md): Specifies screens, design tokens, gradients, layout details, and custom animations.
- [Engineering Design Spec](file:///Users/thabhelo/code/codingjam-fridge-chef/engineering.md): Outlines the architecture, Pydantic schemas, fallback models, and the testing strategy.

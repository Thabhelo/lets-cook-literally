# Fridge Chef — Product Design Doc

**Author:** PM Antigravity
**Status:** Draft v0.1
**Last updated:** 2026-05-21
**One-liner:** Recast your random leftovers into a single creative recipe with a custom AI culinary voice and a photo.

---

## 1. The user & the moment

Who is this for, and what are they doing/feeling **right before** they open the app?

- **Who:** A busy individual who wants to make dinner at home but only has a random assortment of leftovers and ingredients in their fridge. They are tired after a long day and lack the energy to go grocery shopping.
- **When:** It is 6:30 PM on a Tuesday. The user opens the fridge, stares at a half-eaten onion, a carton of eggs, and some stale bread, feeling uninspired and close to ordering takeout.
- **Why now:** Existing recipe websites are designed for planned cooking; they require complete ingredient sets and are cluttered with ads and long preambles. People want immediate, personalized utility for the random things they already own.

## 2. The contract (I/O)

The most important section. What does the user give, and what do they get back?

- **Input:** A single freeform text area answering "What's in your fridge?" and a selector to choose the AI Chef's voice.
- **Output:** A structured recipe card containing:
  - Title, prep/cook time, and difficulty level.
  - A quote bubble with commentary written in the selected chef's voice.
  - Categorized ingredients: "Rescued" (from their input) vs "Pantry Staples" (assumed to be on hand).
  - An interactive step-by-step cooking checklist.
  - An AI-generated, high-quality photo of the completed dish.
- **The loop:** This is a one-shot loop. Enter ingredients → Choose personality → Conjure recipe → Cook (using interactive checkboxes) → Reset to start over.

## 3. The magical moment

The single sentence the user would say to a friend after using this for the first time. Write it in their voice.

> "I typed in my random stale bread, leftover chicken, and half an onion, and it gave me a gourmet recipe that actually used all of them—and the photo made it look like a real Michelin-starred dish!"

## 4. Scope: what we ARE building (v1)

A bulleted list of the minimum surface area. Each bullet is a thing a user can do or see.

- A single-screen web interface that transitions smoothly between input, loading, and recipe display states.
- A freeform text input with a maximum limit of 1000 characters.
- A voice selector offering four personalities: Cozy Grandma, Michelin Chef, Scrappy Saver, and Wasteland Survivor.
- A personalized loading sequence that cycles through humorous, text-based steps matching the chosen chef's style (e.g., "Grandma is dusting off the flour..." vs. "Scavenging the fallout bunker...").
- An interactive recipe output card displaying structured steps that cross out when clicked.
- A base64 image display area showing the AI-generated dish photo.
- A reset button to return to the input state.

## 5. Scope: what we are NOT building

Equally important. The cuts ARE the product. List the obvious things people will ask for that we're explicitly NOT doing in v1.

- **No user accounts or logins** — The app is entirely stateless and does not save recipes server-side.
- **No recipe history or favorites database** — Once you click "Reset" or refresh, the recipe is gone (users can screenshot it).
- **No shopping lists or grocery store integrations** — We assume they only want to use what they have; we are not sending them to the store.
- **No dietary, allergen, or calorie filters** — The user indicates what they can eat by listing those ingredients. We do not support checkboxes for "Gluten-Free" or "Keto" in v1.
- **No weekly meal planners or schedules** — This is a real-time rescue tool, not a planning dashboard.
- **No built-in cooking timers** — Users can use their phone's native clock or watch.

## 6. The signature detail

The one thing that makes this product feel like *this* product.

The signature detail is **The Culinary Voices**. The generated recipe doesn't just output clinical instructions; it is presented entirely through the lens of a specific character. 
- **Cozy Grandma** dotes on the user, calls them "sweetie," and focus on comfortable home cooking.
- **Michelin Chef** talks about emulsion, reductions, elegant plating, and elevating simple elements.
- **Scrappy Saver** talks about cents saved, zero-waste efficiency, and clever substitutions.
- **Wasteland Survivor** treats the meal as vital post-apocalyptic rations to survive the radioactive winter.

The chosen personality is reflected in the commentary bubble, the microcopy style, the emoji avatar, and the loading animations.

## 7. Success: how we know it worked

Pick ONE primary signal. Not 5 metrics. ONE.

- **Primary:** &ge;50% of users who generate a recipe click and check off at least one step in the cooking checklist (indicating they actually engaged with the cooking process).
- **Not measuring:** Total signups, repeat visits, or daily active users.

## 8. Open questions

Real unknowns that need answers before/during build.

- [ ] Will the sequential generation of both text (Gemini) and image (Imagen) take too long, causing network timeouts or poor user experience?
- [ ] How will the image generator handle highly bizarre ingredient mixtures (e.g. peanut butter and canned tuna)? Will it look unappetizing?

## 9. Handoff

- **For UX:** The multi-stage loading animation must feel entertaining and highly tailored to the selected chef voice to mask the 10-15s combined API response latency.
- **For Eng:** Latency is high because of sequential text and image generation. Implement a robust fallback that displays the recipe text even if the Imagen call fails or times out.

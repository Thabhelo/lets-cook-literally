# Fridge Chef — UX Design Doc

**Designer:** UX Designer Antigravity
**Status:** Draft v0.1
**Last updated:** 2026-05-21

---

## 1. The design bet

We are betting that a single-page layout featuring a prominent photo of the final dish and an interactive, checklist-style recipe steps section will drive high user engagement and encourage users to actually cook the meal. We focus 70% of design effort on transitions (loading sequences) and checklist microcopy, keeping inputs simple.

## 2. The defining interaction

**The "Plating Up" Reveal:**
User clicks "Conjure Recipe". The form elements fade down and the screen transitions into a themed loading view. The loader displays custom animations (such as a steaming frying pan) and cycles through humor-filled messages matching the selected chef voice. When generation is complete, the loading view slides out to the left while the completed recipe card slides in from the right, with the AI-generated photo fading in, making it feel like a gourmet dish being served at a restaurant.

## 3. Screen inventory

The application is built as a single-page application (SPA) with 4 major display states:
1. **Input State (Default):** The main landing view with a text area and chef selector.
2. **Loading State:** The full-card waiting screen displaying animations and custom texts.
3. **Error State:** A state showing a disaster message and retry button.
4. **Recipe Output State:** The interactive, 2-column recipe showcase.

## 4. Screen-by-screen specs

### Main Application Page

**Purpose:** The single hub that hosts all states for entering ingredients, waiting, and viewing the recipe.

**Layout (top to bottom):**
1. **Header:** 
   - Logo Badge: Small rounded badge with "🍳 Fridge Chef" in amber text.
   - Main Title: Serif font header, highlighting "culinary masterpieces" with a warm gold-orange gradient.
   - Subtitle: Clean description setting expectations.
2. **Card Panel (Input View):**
   - Text Area Label: "What's in your fridge?" with a red indicator asterisk.
   - Text Area Input: Large dark input field with a placeholder example list.
   - Selector Label: "Choose your AI Chef Voice".
   - Voice Grid: A row/grid of 4 cards (Grandma, Michelin, Budget, Survivalist). Each card contains an emoji, a bold name, and a short description.
   - Action Button: Large gradient button reading "Conjure Recipe".
3. **Loading Panel (Hidden by default):**
   - Cooking Icon: An animated pan tossing back and forth with rising steam lines.
   - Title: Custom loading title that swaps text every 3 seconds.
   - Description: Subtext showing details of the current loading step.
   - Progress Bar: A thin horizontal indicator slowly filling up.
4. **Error Panel (Hidden by default):**
   - Alert Icon: A warning triangle.
   - Title: "Kitchen Disaster!"
   - Subtext: Displaying the network or parsing error message.
   - Button: "Try Again".
5. **Recipe Output View (Hidden by default, 2-column layout on desktop, stacks on mobile):**
   - **Left Column (Visuals):**
     - Photo Card: Holds the generated 1:1 image. It has a subtle inner glow. Includes a fallback icon and text if the image fails to load.
     - Stats Card: A horizontal card split into two items showing cook time and difficulty.
   - **Right Column (Details):**
     - Header Card: Displays the recipe title in a large, elegant serif font, followed by a chat bubble showing the chef's commentary and their emoji avatar.
     - Ingredients Card: Separated into two distinct columns: "🟢 Rescued from Fridge" (highlighted in soft green) and "🟡 Pantry Staples" (highlighted in soft gold).
     - Steps Card: Shows the checklist. Each step has a checkbox followed by the instruction.
     - Actions: A "Rescue Something Else" secondary button to return home.

**Key interactions:**
- Clicking any voice card selects it, adds an `.active` class with an amber border, and updates the hidden radio input.
- Submitting the form hides the input section and unhides the loading section, initiating the timer that swaps loading messages.
- Tapping anywhere on a step checklist item toggles its checkbox. Checking a step applies the `.completed` class, applying a line-through and dimming the text.
- Clicking the reset button clears all inputs, resets the voice selection to "Grandma", and returns the page state to the default input form.

**States:**
- **Default:** Clean, unsubmitted form. Text area is empty. "Cozy Grandma" card is selected.
- **Empty / first-time:** Identical to the default view.
- **Loading:** Input card is hidden. Pans and steam animate. Text cycles through messages tailored to the chosen voice (e.g. "Rummaging through the pantry..." for Grandma).
- **Error:** Card displays a warning message. Button resets state back to Input.
- **Edge / "too much":** If the user lists 30 ingredients, the rescued list wraps into multiple columns to avoid a long, vertical layout.

## 5. The user journey

> User opens the app for the first time. They see a clean, dark interface with gold highlights. They have some chicken, a bell pepper, and old tortillas. They type these into the text input, select "Michelin Chef", and click "Conjure Recipe".
>
> The page transitions immediately into the loading state. They watch a pan toss steam while messages like "Deconstructing ingredients..." and "Emulsifying & reducing..." cycle through. 
>
> After 12 seconds, the screen slides over to reveal a stunning recipe for "Elegantly Seared Tortilla Pouches". They see a photo of a beautifully plated dish. In the commentary bubble, the chef avatar notes: "We have elevated your humble tortillas into a delicate casing...". The user reads through the ingredients, checks off step 1 as they preheat their pan, and proceeds to cook. When done, they hit "Rescue Something Else" to reset the page.

## 6. Component & visual notes

- **Typography:** Serif headers (`'Playfair Display'`) for recipe titles and commentary to resemble high-end food editorials, paired with geometric sans-serif (`'Outfit'`) for clean, readable buttons, lists, and inputs.
- **Color:** Very dark blue-gray background (`hsl(220, 20%, 7%)`) representing a modern sleek kitchen. Semi-transparent glassmorphic panels (`hsla(220, 18%, 13%, 0.7)`) with blur filters. Amber-gold primary accents (`hsl(38, 95%, 55%)`) for warmth, fire, and cooking. Green (`hsl(142, 65%, 45%)`) representing fresh, rescued ingredients.
- **Motion:** Pan tossing rotation animation. Steam lines scaling and fading out on loop. Smooth 300ms transitions on card highlights and views.
- **The signature visual:** The Chef Commentary Bubble. A speech bubble with a large emoji avatar. It gives the AI feedback a physical voice and makes the chef feel present.
- **Microcopy voice:** Low-case, conversational, and highly personalized loading titles.

## 7. Accessibility & inclusion

- Accessible color contrast exceeding WCAG AA standards (light cream text on charcoal background).
- Semantic HTML tags (`<main>`, `<header>`, `<section>`, `<label>`).
- Forms support keyboard tab-navigation and focus styles.
- Generated images receive an alt tag containing the generated recipe's title.

## 8. What we are NOT designing

- No user settings or profile screens.
- No onboarding screens or interactive tooltips.
- No recipe sharing dialogs or social media buttons.
- No history dashboard or saved-recipes sidebar.

## 9. Open design questions

- [ ] Should the recipe image have a zoom-in overlay when clicked? (Decision: Defer to v2; keep layout static to prevent accidental clicks).
- [ ] How do we design the layout if the user inputs something that isn't food? (Decision: The error state will display a culinary warning that the chef could not identify the ingredients).

## 10. Handoff to engineering

The recipe checklist must support full click targets (clicking the text should toggle the checkbox, not just the box itself). The loading bar animation must run for a maximum of 25 seconds, acting as a visual filler while the server handles text and image calls.

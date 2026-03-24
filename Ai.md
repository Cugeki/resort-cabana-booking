# AI-Assisted Workflow Documentation

This document outlines how AI was used during the development of the Resort Map project, the tools employed, and the steps taken to reach the final solution.

## 🛠 Tools Used

- **Primary AI:** Gemini 1.5 Pro / Claude 3.5 Sonnet (via chat)
- **IDE Extensions:** GitHub Copilot

## 📈 Workflow Steps

### 1. Project Scaffolding & Architecture

- **Task:** Setting up the Express.js server and React grid structure.
- **AI Use:** I used AI to quickly generate the boilerplate for the Express server and the basic logic for reading the ASCII file and converting it into a 2D array.
- **Outcome:** Saved approximately 1 hour of manual setup.

### 2. Road Rotation Logic (`#` tiles)

- **Task:** Dynamically rotating road assets based on neighbors.
- **AI Use:** I prompted the AI to write a function that checks the `top`, `bottom`, `left`, and `right` neighbors of a grid cell.
- **Refinement:** The AI initially suggested a very complex `if/else` block. I refactored it to use a more maintainable lookup object for rotation angles.

### 3. Playwright E2E Testing

- **Task:** Automating the cabana booking flow.
- **AI Use:** AI helped in identifying why certain selectors were "flaky" (interfering with the legend).
- **Fix:** Based on AI suggestions and best practices, I implemented `data-testid` attributes and used `getByRole` with `toHaveCSS` assertions to ensure the tests are robust.

### 4. Debugging & Refactoring

- **Task:** Fixing the "err" unused variable warning and case-insensitive guest validation.
- **AI Use:** Quick consultation on the cleanest way to handle `try/catch` blocks in modern TypeScript and ensuring `String(room)` comparison works even if the JSON has numbers instead of strings.

## 💡 Key Prompts Example

> _"Create a React component that renders a grid from a 2D array. If the cell is 'W', it should be clickable. If the cell is '#', calculate its rotation based on adjacent '#' tiles."_

---

## 🧘 Reflection

Using AI acted as a highly efficient "pair programmer," allowing me to accelerate the initial setup of the **Express.js server** and its integration with **Node.js CLI arguments** (`minimist`). While I handled the complex **Playwright E2E testing** and UI interactions independently due to my expertise in automation, the AI was instrumental in:

1. **Rapid Prototyping:** Quickly scaffolding the RESTful API endpoints and ensuring the file-reading logic for `.ascii` maps was robust.
2. **Data Parsing:** Refining the logic for mapping the 2D grid from the raw string input, which allowed me to focus more on the **visual representation** and **UX** (real-time map feedback).
3. **Logic Validation:** Double-checking the edge cases for the booking validation (e.g., handling case-insensitivity and room number type mismatches) to ensure the backend remains "bulletproof" against invalid JSON data.

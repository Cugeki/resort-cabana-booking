# 🚀 Quick Start

To launch both the Backend and Frontend together using a single command:

1. **Install Root Dependencies:** `npm install`

2. **Install Frontend Dependencies:** `cd frontend && npm install && cd ..`

3. **Run the Application:** `npm start -- --map=map.ascii --bookings=bookings.json`

The app will be available at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

# 🧪 Testing

The project includes automated End-to-End (E2E) tests using **Playwright** to validate the core booking flow and UI responses.

To run the tests:

1. Ensure the app is running (`npm start`).
2. Open a new terminal and run:
   ```bash
   npx playwright test
   To see the tests in action (UI Mode):
   ```

Bash
npx playwright test --ui
🛠️ Design Decisions & Trade-offs
Architecture
Tech Stack: Developed using React (Vite) for a fast, reactive frontend and Node.js (TypeScript) for a lightweight, robust API.

Single Entrypoint: Integrated concurrently to allow the reviewer to launch the entire stack with one command, significantly simplifying the evaluation process.

Map Rendering Logic
Grid System: The ASCII map is converted into a dynamic 2D grid. Each tile is an individual React component.

Smart Paths: Implemented a neighbor-aware algorithm for road tiles (#). The system checks adjacent tiles to automatically rotate the path assets, ensuring a continuous visual flow.

Performance: Used CSS Grid and modular components to ensure the map remains performant.

Validation & Security
Server-Side Validation: All bookings are validated against the bookings.json file. The comparison is case-insensitive to account for user typos.

In-Memory State: As per requirements, cabana bookings are stored in-memory. This avoids the overhead of a database while fulfilling the functional needs of the code test.

📁 Project Structure
/frontend - React application (UI, Map components, Assets).

/backend - Express API (Server logic, Types).

/tests - Playwright E2E test suite.

map.ascii - Default resort layout.

bookings.json - Guest database for validation.

AI.md - Documentation of the AI-assisted workflow.

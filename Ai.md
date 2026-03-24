# 🤖 AI-Assisted Development Documentation

This project was developed with the support of AI (Google Gemini 1.5). Below is a summary of how AI was integrated into the workflow to ensure high-quality code, robust testing, and efficient debugging.

### 🧠 Areas of AI Collaboration

1. **Architecture & Boilerplate**
   - AI helped in setting up the initial Express.js server structure and React component hierarchy.
   - Assisted in defining TypeScript interfaces to ensure type safety across the full stack.

2. **Complex Logic (Smart Paths)**
   - Collaboration on the "Neighbor-Aware" algorithm for road tiles (`#`).
   - AI helped refine the logic that calculates rotations based on adjacent coordinates, ensuring a seamless visual experience for the resort map.

3. **E2E Testing (Playwright) & CI/CD**
   - AI was instrumental in configuring the Playwright environment.
   - **Iterative Debugging:** AI assisted in resolving complex CI/CD challenges on GitHub Actions, such as:
     - Fixing `webServer` lifecycle issues.
     - Resolving the `sh: ts-node: not found` error by implementing `npx` execution.
     - Optimizing test stability through `serial` mode and explicit visibility checks.

4. **Refactoring & Clean Code**
   - AI suggested the migration from inline styles to **CSS Modules**, improving maintainability and separation of concerns.
   - Helped in optimizing the ASCII-to-Grid parsing logic for better performance and readability.

### ⚖️ Human Oversight

While AI provided suggestions, architectural patterns, and debugging hints, **every line of code was reviewed, tested, and integrated manually**.

The final resolution of environment-specific bugs (like GitHub Actions pathing) was a result of manual log analysis and iterative prompting. This collaboration allowed for a much faster delivery of a production-ready technical task while maintaining high engineering standards.

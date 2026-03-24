import { test, expect } from "@playwright/test";
import bookings from "../bookings.json";
test.describe.configure({ mode: "serial" });

/**
 * CONFIGURATION:
 * Set how many bookings from the JSON file should be tested.
 * Default is 3 to keep the test suite fast (Smoke Testing).
 */
const TEST_LIMIT = 3;
const testSubset = bookings.slice(0, TEST_LIMIT);

/**
 * DATA-DRIVEN TEST SUITE
 * Iterates through a subset of bookings.json to verify the booking flow.
 */
for (const booking of testSubset) {
  test(`should successfully book room ${booking.room}`, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Luxury Resort Management")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("[data-testid='map-tile']").first()).toBeVisible({
      timeout: 15000,
    });

    // 1. Identify: Find the first available (golden) cabana image
    // We filter out any images that already have the 'grayscale' filter applied
    const targetImage = page
      .getByRole("img", { name: "W tile" })
      .filter({
        hasNot: page.locator("xpath=self::*[contains(@style, 'grayscale')]"),
      })
      .first();

    // 2. Metadata: Locate the parent container to extract grid coordinates
    // Using .first() to comply with Playwright's strict mode
    const tileContainer = page
      .locator("div[data-testid='map-tile']")
      .filter({ has: targetImage })
      .first();

    const row = await tileContainer.getAttribute("data-row");
    const col = await tileContainer.getAttribute("data-col");

    console.log(
      `📡 Testing: ${booking.guestName} (Room ${booking.room}) at [Row: ${row}, Col: ${col}]`,
    );

    // 3. Dialog Handling: Dynamic responses based on the current JSON record
    page.on("dialog", async (dialog) => {
      const msg = dialog.message().toLowerCase();

      if (msg.includes("pokoju") || msg.includes("room")) {
        await dialog.accept(booking.room);
      } else if (
        msg.includes("imię") ||
        msg.includes("nazwisko") ||
        msg.includes("name")
      ) {
        await dialog.accept(booking.guestName);
      } else {
        // Confirmation alert "Cabana zarezerwowana!"
        await dialog.accept();
      }
    });

    // 4. Interaction: Perform the click action
    console.log("🖱️ Clicking on the available cabana...");
    await targetImage.click();

    // 5. Validation: Targeted check using coordinates
    // We re-select the tile by row/col to verify the state change independently
    const specificCabanaAfter = page
      .locator(`div[data-row="${row}"][data-col="${col}"]`)
      .getByRole("img");

    await expect(specificCabanaAfter).toHaveCSS("filter", /grayscale/, {
      timeout: 10000,
    });

    console.log(`🎉 Success: Room ${booking.room} is now grayed out.`);
  });
}

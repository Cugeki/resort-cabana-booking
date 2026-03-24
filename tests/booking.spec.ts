import { test, expect } from "@playwright/test";
import bookings from "../bookings.json";

test.describe.configure({ mode: "serial" });

const TEST_LIMIT = 15;
const testSubset = bookings.slice(0, TEST_LIMIT);

for (const booking of testSubset) {
  test(`should successfully book room ${booking.room}`, async ({ page }) => {
    await page.goto("/");

    // 1. Wait for the app to load
    await expect(page.getByText("Luxury Resort Management")).toBeVisible({
      timeout: 15000,
    });

    // 2. Identify the first available cabana tile
    const tileContainer = page
      .locator("div[data-testid='map-tile']")
      .filter({
        has: page.locator("img[alt='tile']"),
      })
      .filter({
        // Only Cabanas have cursor pointer in your App.tsx
        has: page.locator("xpath=self::*[contains(@style, 'pointer')]"),
      })
      .filter({
        // Filter out already booked ones
        hasNot: page.locator("img[style*='grayscale']"),
      })
      .first();

    // 3. Metadata: Extract coordinates
    await expect(tileContainer).toBeAttached({ timeout: 10000 });
    const row = await tileContainer.getAttribute("data-row");
    const col = await tileContainer.getAttribute("data-col");

    console.log(
      `📡 Testing: ${booking.guestName} at [Row: ${row}, Col: ${col}]`,
    );

    // 4. Interaction: Click the tile to open modal
    // Clicking the container is more reliable than the image itself
    await tileContainer.click();

    // 5. Modal Interaction
    const nameInput = page.getByPlaceholder("e.g. Alice Smith");
    const roomInput = page.getByPlaceholder("e.g. 101");

    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(booking.guestName);
    await roomInput.fill(booking.room);

    await page.getByRole("button", { name: "Confirm Booking" }).click();

    // 6. Verify Success and Close
    await expect(page.getByText("Booking Confirmed!")).toBeVisible();
    await page.getByRole("button", { name: "Great!" }).click();

    // 7. Validation: Check if the specific tile is now grayed out
    // Instead of toHaveCSS, we check if the image style attribute now contains 'grayscale'
    const specificCabanaImg = page.locator(
      `div[data-row="${row}"][data-col="${col}"] img`,
    );

    await expect(specificCabanaImg).toHaveAttribute("style", /grayscale/);

    console.log(
      `🎉 Success: Room ${booking.room} at [${row},${col}] is now booked.`,
    );
  });
}

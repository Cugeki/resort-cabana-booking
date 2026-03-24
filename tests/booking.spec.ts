import { test, expect } from "@playwright/test";

test("should book a cabana and verify color change", async ({ page }) => {
  await page.goto("http://localhost:5173");

  // 1. Znajdź obrazek wolnej Cabany
  const cabanaIcon = page.getByRole("img", { name: "W tile" }).first();
  // Znajdź div-a, który jest rodzicem tego obrazka (to on ma onClick)

  // 2. Obsługa dialogów z logowaniem do konsoli
  page.on("dialog", async (dialog) => {
    console.log(`🤖 Obsługuję dialog: ${dialog.message()}`);
    if (dialog.message().includes("pokoju")) {
      await dialog.accept("114");
    } else if (dialog.message().includes("Nazwisko")) {
      await dialog.accept("Noah Lewis");
    } else {
      console.log("✅ Potwierdzam sukces rezerwacji");
      await dialog.accept();
    }
  });

  // 3. Klikamy w KONTENER (div), a nie w sam obrazek
  console.log("🖱️ Klikam w Cabanę...");
  await cabanaIcon.click();

  // 4. Czekamy na zmianę stylu (toHaveCSS zamiast toHaveStyle)
  // Szukamy filtra grayscale na obrazku
  await expect(cabanaIcon).toHaveCSS("filter", /grayscale/, { timeout: 10000 });
  console.log("🎉 Sukces! Kolor się zmienił.");
});

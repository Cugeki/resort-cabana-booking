import express from "express";
import cors from "cors";
import fs from "fs";
import minimist from "minimist";

import type { Request, Response } from "express";

const argv = minimist(process.argv.slice(2));
const mapFile = (argv.map as string) || "map.ascii";
const bookingsFile = (argv.bookings as string) || "bookings.json";

const mapPath = argv.map || "map.ascii";
const bookingsPath = argv.bookings || "bookings.json";

console.log(`Starting with map: ${mapPath} and guests: ${bookingsPath}`);

const app = express();
app.use(cors());
app.use(express.json());

// 1. Load the map layout
const rawMap = fs.readFileSync(mapFile, "utf-8");
const mapGrid = rawMap
  .replace(/\r/g, "")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => l.split(""));

// 2. Load the list of authorized guests from JSON file
// File format: [{"guestName": "John Doe", "room": "101"}, ...]
let authorizedGuests: any[] = [];
try {
  authorizedGuests = JSON.parse(fs.readFileSync(bookingsFile, "utf-8"));
} catch (e) {
  console.error("Error loading bookings.json file!");
}

// 3. Cabana booking storage (in-memory - volatile)
let cabanaBookings: { row: number; col: number; guestName: string }[] = [];

app.get("/api/map", (req: Request, res: Response) => {
  const response = mapGrid.map((row, rIdx) =>
    row.map((cell, cIdx) => ({
      type: cell,
      isBooked: cabanaBookings.some((b) => b.row === rIdx && b.col === cIdx),
    })),
  );
  res.json(response);
});

app.post("/api/book", (req: Request, res: Response) => {
  const { row, col, guestName, roomNumber } = req.body;

  // VALIDATION: Check if the guest name and room number match the bookings.json file
  const guestFound = authorizedGuests.find(
    (g: any) =>
      g.guestName.trim().toLowerCase() === guestName.trim().toLowerCase() &&
      String(g.room) === String(roomNumber),
  );

  if (!guestFound) {
    console.log(`❌ Access denied for: ${guestName}, room: ${roomNumber}`);
    return res.status(403).json({
      message:
        "Access Denied: Guest name and room number do not match our records.",
    });
  }

  // Check if this cabana is already booked
  const alreadyBooked = cabanaBookings.some(
    (b) => b.row === row && b.col === col,
  );
  if (alreadyBooked) {
    return res.status(400).json({ message: "This cabana is already booked." });
  }

  cabanaBookings.push({ row, col, guestName });
  console.log(`✅ Successfully booked for: ${guestName} (Room ${roomNumber})`);
  res.json({ success: true });
});

app.listen(3001, () =>
  console.log(`🚀 Server on port 3001 using ${mapFile} and ${bookingsFile} `),
);

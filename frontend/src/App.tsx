import React, { useEffect, useState } from "react";
import styles from "./App.module.css";

import cabanaImg from "./assets/cabana.png";
import poolImg from "./assets/pool.png";
import chaletImg from "./assets/houseChimney.png";
import parchmentImg from "./assets/parchmentBasic.png";
import arrowStraight from "./assets/arrowStraight.png";
import arrowCorner from "./assets/arrowCornerSquare.png";
import arrowCrossing from "./assets/arrowCrossing.png";
import arrowSplit from "./assets/arrowSplit.png";
import BookingModal from "./components/BookingModal";

interface MapCell {
  type: string;
  isBooked: boolean;
}

interface TileIconInfo {
  image: string;
  rotation: number;
}

const App: React.FC = () => {
  const [mapData, setMapData] = useState<MapCell[][]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const loadMap = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/map");
      if (!res.ok) throw new Error("Failed to fetch map");
      const data: MapCell[][] = await res.json();
      setMapData(data);
    } catch (err) {
      console.error("Error loading map:", err);
    }
  };

  useEffect(() => {
    loadMap();
  }, []);

  const handleOpenModal = (row: number, col: number) => {
    setSelectedTile({ r: row, c: col });
    setBookingStatus("idle");
    setGuestName("");
    setRoomNumber("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTile || !guestName || !roomNumber) return;

    setBookingStatus("loading");

    try {
      const response = await fetch("http://localhost:3001/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row: selectedTile.r,
          col: selectedTile.c,
          guestName,
          roomNumber,
        }),
      });

      if (response.ok) {
        setBookingStatus("success");
        setGuestName("");
        setRoomNumber("");
        await loadMap();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Booking failed.");
        setBookingStatus("error");
      }
    } catch (err) {
      console.error("Booking error details:", err);
      setErrorMessage("Server connection error");
      setBookingStatus("error");
    }
  };

  // --- Helper Functions ---
  const getRoadRotation = (r: number, c: number): number => {
    const top = mapData[r - 1]?.[c]?.type === "#";
    const bottom = mapData[r + 1]?.[c]?.type === "#";
    const left = mapData[r]?.[c - 1]?.type === "#";
    const right = mapData[r]?.[c + 1]?.type === "#";
    if (top || bottom) return 0;
    if (left || right) return 90;
    return 0;
  };

  const getTileIcon = (
    cell: MapCell,
    r: number,
    c: number,
  ): TileIconInfo | null => {
    if (cell.type === "W") return { image: cabanaImg, rotation: 0 };
    if (cell.type === "p") return { image: poolImg, rotation: 0 };
    if (cell.type === "c") return { image: chaletImg, rotation: 0 };
    if (cell.type === "#") {
      const top = mapData[r - 1]?.[c]?.type === "#";
      const bottom = mapData[r + 1]?.[c]?.type === "#";
      const left = mapData[r]?.[c - 1]?.type === "#";
      const right = mapData[r]?.[c + 1]?.type === "#";
      if (top && bottom && left && right)
        return { image: arrowCrossing, rotation: 0 };
      if (top && bottom && right && !left)
        return { image: arrowSplit, rotation: 0 };
      if (top && bottom && left && !right)
        return { image: arrowSplit, rotation: 180 };
      if (left && right && bottom && !top)
        return { image: arrowSplit, rotation: 90 };
      if (left && right && top && !bottom)
        return { image: arrowSplit, rotation: 270 };
      if (bottom && right && !top && !left)
        return { image: arrowCorner, rotation: 90 };
      if (bottom && left && !top && !right)
        return { image: arrowCorner, rotation: 180 };
      if (top && left && !bottom && !right)
        return { image: arrowCorner, rotation: 270 };
      if (top && right && !bottom && !left)
        return { image: arrowCorner, rotation: 0 };
      return { image: arrowStraight, rotation: getRoadRotation(r, c) };
    }
    return null;
  };

  if (mapData.length === 0) {
    return (
      <div className={styles.loadingContainer}>Loading Luxury Resort...</div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Luxury Resort Management</h1>

      <div className={styles.legendContainer}>
        <LegendItem
          color="rgba(255, 215, 0, 0.85)"
          label="Available for booking"
        />
        <LegendItem color="rgba(120, 144, 156, 0.9)" label="Already booked" />
      </div>

      <div
        className={styles.mapGrid}
        style={{
          gridTemplateColumns: `repeat(${mapData[0]?.length || 0}, 60px)`,
        }}
      >
        {mapData.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const iconInfo = getTileIcon(cell, rIdx, cIdx);
            const imageKey = `${rIdx}-${cIdx}`;
            return (
              <div
                key={imageKey}
                data-testid="map-tile"
                data-row={rIdx}
                data-col={cIdx}
                onClick={() =>
                  cell.type === "W" &&
                  !cell.isBooked &&
                  handleOpenModal(rIdx, cIdx)
                }
                className={styles.tileBase}
                style={{
                  backgroundImage:
                    cell.type === "." ? `url(${parchmentImg})` : "none",
                  backgroundColor: getCellColor(cell),
                  cursor:
                    cell.type === "W" && !cell.isBooked ? "pointer" : "default",
                }}
              >
                {iconInfo && !imageErrors.has(imageKey) && (
                  <img
                    src={iconInfo.image}
                    onError={() =>
                      setImageErrors((prev) => new Set(prev).add(imageKey))
                    }
                    alt="tile"
                    className={styles.tileImage}
                    style={{
                      opacity: cell.type === "#" ? 0.6 : 1,
                      filter: cell.isBooked
                        ? "grayscale(1) brightness(0.8)"
                        : "none",
                      transform: `rotate(${iconInfo.rotation}deg)`,
                    }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
        guestName={guestName}
        setGuestName={setGuestName}
        roomNumber={roomNumber}
        setRoomNumber={setRoomNumber}
        bookingStatus={bookingStatus}
        errorMessage={errorMessage}
      />
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className={styles.legendItem}>
    <div className={styles.legendBox} style={{ backgroundColor: color }} />
    <span className={styles.legendLabel}>{label}</span>
  </div>
);

const getCellColor = (cell: MapCell): string => {
  switch (cell.type) {
    case "W":
      return cell.isBooked
        ? "rgba(120, 144, 156, 0.9)"
        : "rgba(255, 215, 0, 0.85)";
    case "p":
      return "rgba(30, 144, 255, 0.9)";
    case "#":
      return "rgba(139, 69, 19, 0.6)";
    case "c":
      return "rgba(240, 240, 240, 0.85)";
    default:
      return "transparent";
  }
};

export default App;

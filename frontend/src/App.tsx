import React, { useEffect, useState } from "react";
import cabanaImg from "./assets/cabana.png";
import poolImg from "./assets/pool.png";
import chaletImg from "./assets/houseChimney.png";
import parchmentImg from "./assets/parchmentBasic.png";
import arrowStraight from "./assets/arrowStraight.png";
import arrowCorner from "./assets/arrowCornerSquare.png";
import arrowCrossing from "./assets/arrowCrossing.png";
import arrowSplit from "./assets/arrowSplit.png";

// --- Interfaces ---
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

  // --- API Calls ---
  const loadMap = async () => {
    try {
      const res = await fetch("/api/map");
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error("Error loading map:", err);
    }
  };

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/map");
        if (!res.ok) throw new Error("Failed to fetch map");
        const data: MapCell[][] = await res.json();
        setMapData(data);
      } catch (err) {
        console.error("Error loading map:", err);
      }
    };

    fetchMap();
  }, []); // Pusta tablica oznacza, że wywoła się tylko raz przy montowaniu

  const handleBooking = async (row: number, col: number) => {
    const roomNumber = window.prompt("Podaj numer swojego pokoju:");
    if (!roomNumber) return;

    const guestName = window.prompt("Podaj swoje Imię i Nazwisko:");
    if (!guestName) return;

    try {
      const response = await fetch("http://localhost:3001/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col, guestName, roomNumber }),
      });

      if (response.ok) {
        alert("Cabana zarezerwowana! Życzymy miłego wypoczynku.");
        await loadMap();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Błąd podczas rezerwacji.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Błąd połączenia z serwerem");
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

  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => new Set(prev).add(imageKey));
  };

  if (mapData.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#fff",
          background: "#3e2723",
          height: "100vh",
        }}
      >
        Ładowanie luksusowego kurortu...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Luxury Resort Management</h1>

      <div style={legendContainerStyle}>
        <LegendItem
          color="rgba(255, 215, 0, 0.85)"
          label="Available for booking"
        />
        <LegendItem color="rgba(120, 144, 156, 0.9)" label="Already booked" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapData[0]?.length || 0}, 60px)`,
          backgroundColor: "#2b1d16",
          border: "8px solid #2b1d16",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        {mapData.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const iconInfo = getTileIcon(cell, rIdx, cIdx);
            const imageKey = `${rIdx}-${cIdx}`;
            const hasImageError = imageErrors.has(imageKey);

            return (
              <div
                key={imageKey}
                data-testid="map-tile"
                data-row={rIdx}
                data-col={cIdx}
                onClick={() =>
                  cell.type === "W" &&
                  !cell.isBooked &&
                  handleBooking(rIdx, cIdx)
                }
                style={{
                  ...tileBaseStyle,
                  backgroundImage:
                    cell.type === "." ? `url(${parchmentImg})` : "none",
                  backgroundColor: getCellColor(cell),
                  cursor:
                    cell.type === "W" && !cell.isBooked ? "pointer" : "default",
                }}
              >
                {iconInfo && !hasImageError && (
                  <img
                    src={iconInfo.image}
                    onError={() => handleImageError(imageKey)}
                    alt={`${cell.type} tile`}
                    style={{
                      width: "95%",
                      height: "95%",
                      objectFit: "contain",
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
    </div>
  );
};

// --- Sub-components & Styles ---
const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <div
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: color,
        border: "2px solid #fff",
        borderRadius: "4px",
      }}
    />
    <span style={{ color: "#fff", fontSize: "14px", fontFamily: "sans-serif" }}>
      {label}
    </span>
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

const containerStyle: React.CSSProperties = {
  padding: "20px",
  backgroundColor: "#3e2723",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const headerStyle: React.CSSProperties = {
  color: "#fff",
  fontFamily: "serif",
  margin: "20px 0",
};

const legendContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "30px",
  marginBottom: "20px",
};

const tileBaseStyle: React.CSSProperties = {
  width: "60px",
  height: "60px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "0.1px solid rgba(0,0,0,0.05)",
  position: "relative",
  overflow: "hidden",
};

export default App;

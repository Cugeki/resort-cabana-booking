import { useEffect, useState } from "react";
import cabanaImg from "./assets/cabana.png";
import poolImg from "./assets/pool.png";
import chaletImg from "./assets/houseChimney.png";
import parchmentImg from "./assets/parchmentBasic.png";
import arrowStraight from "./assets/arrowStraight.png";
import arrowCorner from "./assets/arrowCornerSquare.png";
import arrowCrossing from "./assets/arrowCrossing.png";
import arrowSplit from "./assets/arrowSplit.png";

interface MapCell {
  type: string;
  isBooked: boolean;
}

interface TileIconInfo {
  image: string;
  rotation: number;
}

function App() {
  const [mapData, setMapData] = useState<MapCell[][]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const loadMap = () => {
    fetch("/api/map")
      .then((res) => res.json())
      .then((data) => setMapData(data))
      .catch((err) => console.error("Błąd ładowania mapy:", err));
  };

  useEffect(() => {
    loadMap();
  }, []);

  const handleBooking = async (row: number, col: number) => {
    const roomNumber = window.prompt("Podaj numer swojego pokoju:");
    if (!roomNumber) return;

    const guestName = window.prompt("Podaj swoje Imię i Nazwisko:");
    if (!guestName) return;

    try {
      const response = await fetch("http://localhost:3001/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row,
          col,
          guestName,
          roomNumber, // To musi się zgadzać z tym, co odbiera serwer (req.body)
        }),
      });

      if (response.ok) {
        alert("Cabana zarezerwowana! Życzymy miłego wypoczynku.");
        loadMap();
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Wyświetli "Błąd: Nie znaleziono gościa..."
      }
    } catch (err) {
      console.error("Connection error details:", err); // Teraz err jest użyty
      alert("Błąd połączenia z serwerem");
    }
  };

  const getRoadRotation = (r: number, c: number): number => {
    // Check neighbors
    const top = mapData[r - 1]?.[c]?.type === "#";
    const bottom = mapData[r + 1]?.[c]?.type === "#";
    const left = mapData[r]?.[c - 1]?.type === "#";
    const right = mapData[r]?.[c + 1]?.type === "#";

    // Prefer vertical if top/bottom exist, horizontal otherwise
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
    if (cell.type === "p") {
      return { image: poolImg, rotation: 0 };
    }
    if (cell.type === "c") {
      return { image: chaletImg, rotation: 0 };
    }

    if (cell.type === "#") {
      const top = mapData[r - 1]?.[c]?.type === "#";
      const bottom = mapData[r + 1]?.[c]?.type === "#";
      const left = mapData[r]?.[c - 1]?.type === "#";
      const right = mapData[r]?.[c + 1]?.type === "#";

      // Crossroads
      if (top && bottom && left && right) {
        return { image: arrowCrossing, rotation: 0 };
      }

      // T-intersections
      if (top && bottom && right && !left) {
        return { image: arrowSplit, rotation: 0 };
      }
      if (top && bottom && left && !right) {
        return { image: arrowSplit, rotation: 180 };
      }
      if (left && right && bottom && !top) {
        return { image: arrowSplit, rotation: 90 };
      }
      if (left && right && top && !bottom) {
        return { image: arrowSplit, rotation: 270 };
      }

      // Corners (rotate based on which two directions connect)
      if (bottom && right && !top && !left) {
        return { image: arrowCorner, rotation: 90 };
      }
      if (bottom && left && !top && !right) {
        return { image: arrowCorner, rotation: 180 };
      }
      if (top && left && !bottom && !right) {
        return { image: arrowCorner, rotation: 270 };
      }
      if (top && right && !bottom && !left) {
        return { image: arrowCorner, rotation: 0 };
      }

      // Straight paths - rotate based on direction
      const rotation = getRoadRotation(r, c);
      return { image: arrowStraight, rotation };
    }

    // Empty tiles - no icon
    return null;
  };

  const handleImageError = (imageKey: string, cellType: string) => {
    console.error(`Image failed to load for ${cellType} at ${imageKey}`);
    setImageErrors((prev) => new Set(prev).add(imageKey));
  };

  if (mapData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#fff" }}>
        Ładowanie luksusowego kurortu...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#3e2723",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#fff",
          textAlign: "center",
          fontFamily: "serif",
          margin: "20px 0",
        }}
      >
        Luxury Resort Management
      </h1>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(255, 215, 0, 0.85)",
              border: "2px solid #fff",
              borderRadius: "4px",
            }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              fontFamily: "sans-serif",
            }}
          >
            Available for booking
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(120, 144, 156, 0.9)",
              border: "2px solid #fff",
              borderRadius: "4px",
            }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              fontFamily: "sans-serif",
            }}
          >
            Already booked
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapData[0]?.length || 0}, 60px)`,
          gap: "0px",
          border: "8px solid #2b1d16",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          backgroundColor: "#2b1d16",
        }}
      >
        {mapData.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const iconInfo = getTileIcon(cell, rIdx, cIdx);
            const imageKey = `${rIdx}-${cIdx}`;
            const hasImageError = imageErrors.has(imageKey);

            // Debug: log all cell types and their icon info
            if (cell.type === "p" || cell.type === "c") {
              console.log(
                `Cell ${cell.type} at ${imageKey}: iconInfo=`,
                iconInfo,
              );
            }

            // Determine background color based on cell type
            const getBackgroundColor = () => {
              switch (cell.type) {
                case "W": // Cabana
                  return cell.isBooked
                    ? "rgba(120, 144, 156, 0.9)"
                    : "rgba(255, 215, 0, 0.85)";
                case "p": // Pool
                  return "rgba(30, 144, 255, 0.9)";
                case "#": // Road
                  return "rgba(139, 69, 19, 0.6)";
                case "c": // Chalet
                  return "rgba(240, 240, 240, 0.85)";
                default: // Empty or unknown
                  return "transparent";
              }
            };

            // Only show parchment background for empty tiles
            const showParchmentBg = cell.type === ".";

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                data-testid="map-tile"
                data-row={rIdx} // Dodajemy to
                data-col={cIdx}
                onClick={() =>
                  cell.type === "W" &&
                  !cell.isBooked &&
                  handleBooking(rIdx, cIdx)
                }
                style={{
                  width: "60px",
                  height: "60px",
                  // Base parchment texture only for empty tiles
                  backgroundImage: showParchmentBg
                    ? `url(${parchmentImg})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  // Semi-transparent color overlay
                  backgroundColor: getBackgroundColor(),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "0.1px solid rgba(0,0,0,0.05)",
                  cursor:
                    cell.type === "W" && !cell.isBooked ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Render tile icon if available and not errored */}
                {iconInfo && !hasImageError && (
                  <img
                    src={iconInfo.image}
                    onError={() => handleImageError(imageKey, cell.type)}
                    style={{
                      width: "95%",
                      height: "95%",
                      objectFit: "contain",
                      objectPosition: "center",
                      opacity: cell.type === "#" ? 0.6 : 1,
                      filter: cell.isBooked
                        ? "grayscale(1) brightness(0.8)"
                        : undefined,
                      transform: `rotate(${iconInfo.rotation}deg)`,
                      transformOrigin: "center",
                    }}
                    alt={`${cell.type} tile`}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default App;

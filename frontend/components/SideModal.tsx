import React, { useState, useMemo, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";

// Helper function to compute destination points
function computeDestinationPoint(lon, lat, distance, bearing) {
  const R = 6378137;
  const brng = (bearing * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [lon2 * (180 / Math.PI), lat2 * (180 / Math.PI)];
}

// Function to generate sectors with probabilities from predictions
function generateSectors(center, radius, sectors, prediction) {
  const lon = center.lng;
  const lat = center.lat;
  const sectorPolygons = [];
  const sectorAngle = 360 / sectors;

  for (let i = 0; i < sectors; i++) {
    const startAngle = i * sectorAngle;
    const endAngle = (i + 1) * sectorAngle;
    const arcPoints = [];

    for (let j = 0; j <= 10; j++) {
      const angle = startAngle + (j / 10) * (endAngle - startAngle);
      const point = computeDestinationPoint(lon, lat, radius, angle);
      arcPoints.push(point);
    }

    const polygon = [[lon, lat], ...arcPoints, [lon, lat]];
    const probability = prediction?.predicted_sectors?.[i]?.probability ?? Math.random();
    sectorPolygons.push({
      polygon,
      sectorIndex: i,
      probability,
    });
  }

  // Normalize probabilities to sum up to 100
  const totalProbability = sectorPolygons.reduce((sum, sector) => sum + sector.probability, 0);
  sectorPolygons.forEach(sector => {
    sector.probability = (sector.probability / totalProbability) * 100;
  });

  return sectorPolygons;
}

const SideModal = ({ closeModal, pings, MAP_STYLE, prediction, suggestForceDeployment}) => {
  // Always call hooks at the top level
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const newCountdowns = { ...countdowns };
    pings.forEach((ping) => {
      if (!(ping.id in newCountdowns)) {
        newCountdowns[ping.id] = 20; // Start at 20 seconds if not tracked
      }
    });
    setCountdowns(newCountdowns);

    const interval = setInterval(() => {
      setCountdowns((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([id, time]) => [id, Math.max(time - 1, 0)])
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [pings]);

  // Instead of returning early, conditionally render the content
  const content = useMemo(() => {
    if (!pings || pings.length === 0) {
      return null;
    }

    // Compute average centre of pings
    const avgLat = pings.reduce((sum, p) => sum + p.lat, 0) / pings.length;
    const avgLng = pings.reduce((sum, p) => sum + p.lng, 0) / pings.length;
    const mapCenter = { lat: avgLat, lng: avgLng };

    // Generate sectors data
    const sectorsData = pings.flatMap((ping) =>
      generateSectors(
        ping,
        prediction ? prediction.predicted_apprehension_time * 60 * 3 : 1000,
        8,
        prediction?.[ping.id]
      )
    );

    return (
      <div>
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: 20,
            background: "rgba(30, 30, 30, 0.9)",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.6)",
            zIndex: 1,
            color: "#fff",
            fontSize: "16px",
            maxWidth: "600px",
            height: "75%",
          }}
        >
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>Active Pings</h4>
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>
            {hoveredProbability !== null ? `Probability: ${hoveredProbability}%` : ""}
          </h4>
          <div style={{ maxHeight: "150px", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {pings.filter(ping => ping.severity !== 0).map((ping) => (
                <li
                  key={ping.id}
                  style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  marginBottom: "8px",
                  padding: "10px",
                  borderRadius: "8px",
                  color: "#fff",
                  }}
                >
                  <strong>Severity: </strong>
                  <span style={{ color:  ping.severity === "Critical" ? "red" : ping.severity === "High" ? "red" : ping.severity === "Medium" ? "orange" : "green" }}>
                  {ping.severity}
                  </span>
                  <div>
                  <strong>Countdown:</strong> {countdowns[ping.id]} seconds
                  </div>
                  <button
                  style={{
                    marginTop: "10px",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(90deg, #28a745, #218838)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    transition: "background 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#218838")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "linear-gradient(90deg, #28a745, #218838)")}
                  onClick={() => {suggestForceDeployment(ping.crime, ping.severity, ping.lat, ping.lng)}}
                  >
                  Suggest Force Deployment
                  </button>
                </li>
                ))}
            </ul>
          </div>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "10px",
              borderRadius: "4px",
              border: "none",
              background: "#007bff",
              colour: "#fff",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <div style={{ height: "400px", width: "400px", borderRadius: "12px" }}>
            <DeckGL
              initialViewState={{
                longitude: mapCenter.lng,
                latitude: mapCenter.lat,
                zoom: 10,
                pitch: 0,
                bearing: 0,
              }}
              controller={true}
              style={{
                width: "90%",
                height: "60%",
                position: "absolute",
                left: "5%",
                top: "65%",
                transform: "translateY(-50%)",
                borderRadius: "12px",
              }}
              layers={[
                new ScatterplotLayer({
                  id: "modal-ping-layer",
                  data: pings,
                  getPosition: (d) => [d.lng, d.lat],
                  getFillColor: [255, 0, 0],
                  getRadius: 100,
                }),
                new PolygonLayer({
                  id: "circle-sector-layer",
                  data: sectorsData,
                  pickable: true,
                  stroked: true,
                  filled: true,
                  lineWidthMinPixels: 2,
                  getPolygon: (d) => d.polygon,
                  getFillColor: (d) => {
                    const opacity = Math.round((d.probability / 100) * 255);
                    return [128, 0, 32, opacity];
                  },
                  getLineColor: [255, 255, 255, 0],
                  onHover: ({ object }) => {
                    setHoveredProbability(object ? object.probability : null);
                  },
                }),
              ]}
            >
              <Map mapStyle={MAP_STYLE} />
            </DeckGL>
          </div>
        </div>
      </div>
    );
  }, [pings, prediction, countdowns, hoveredProbability, closeModal, MAP_STYLE]);

  return content;
};

export default SideModal;

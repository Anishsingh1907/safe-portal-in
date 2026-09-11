import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

// Fix default marker icons (Vite + Leaflet asset path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LEVELS = ["All", "Safe", "Moderate", "Caution", "High Risk"];

function FlyToFocus({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.flyTo([lat, lon], 10, { duration: 0.8 });
  }, [lat, lon, map]);
  return null;
}

export default function SafetyMap() {
  const [params] = useSearchParams();
  const focusLat = parseFloat(params.get("lat"));
  const focusLon = parseFloat(params.get("lon"));
  const focusName = params.get("name");

  const [destinations, setDestinations] = useState([]);
  const [level, setLevel] = useState("All");
  const [userPos, setUserPos] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/destinations?limit=50")
      .then((res) => setDestinations(res.data.destinations))
      .catch(() => showToast("Unable to load map destinations.", "error"));
  }, [showToast]);

  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => showToast("Location permission denied.", "error")
    );
  }

  const filtered = useMemo(() => {
    if (level === "All") return destinations;
    return destinations.filter((d) => d.safetyStatus.toLowerCase().includes(level.toLowerCase()));
  }, [destinations, level]);

  function markerColor(status) {
    const s = status.toLowerCase();
    if (s.includes("safe")) return "🟢";
    if (s.includes("high") || s.includes("risk")) return "🔴";
    if (s.includes("caution")) return "🟠";
    return "🟡";
  }

  return (
    <main>
      <div className="container-page py-10">
        <h1 className="text-3xl">Safety Map</h1>
        <p className="mt-2 text-navy/60">Color-coded safety status for monitored destinations across India.</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                level === l ? "bg-navy text-white" : "border border-navy/15 text-navy/70 hover:border-navy/30"
              }`}
            >
              {l}
            </button>
          ))}
          <button onClick={locateMe} className="btn btn-outline ml-auto !px-3.5 !py-1.5 text-sm">📍 My Location</button>
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="overflow-hidden rounded-2xl shadow-card" style={{ height: "560px" }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {focusLat && focusLon && <FlyToFocus lat={focusLat} lon={focusLon} />}

            {filtered.map((d) => (
              <Marker key={d._id} position={[d.lat, d.lon]}>
                <Popup>
                  <strong>{markerColor(d.safetyStatus)} {d.name}</strong>
                  <div>{d.state}</div>
                  <div>Safety score: {d.safetyScore?.toFixed(1)} / 5</div>
                  <div>{d.safetyStatus}</div>
                </Popup>
              </Marker>
            ))}

            {focusLat && focusLon && (
              <Marker position={[focusLat, focusLon]}>
                <Popup>{focusName || "Selected location"}</Popup>
              </Marker>
            )}

            {userPos && (
              <Marker position={userPos}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy/60">
          <span>🟢 Safe</span>
          <span>🟡 Moderate</span>
          <span>🟠 Caution</span>
          <span>🔴 High Risk</span>
        </div>
      </div>
    </main>
  );
}

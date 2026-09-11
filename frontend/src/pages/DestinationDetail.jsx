import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import SafetyStatusPill from "../components/SafetyStatusPill";
import SosModal from "../components/SosModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function DestinationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sosOpen, setSosOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [destRes, weatherRes, alertsRes] = await Promise.all([
          api.get(`/destinations/${id}`),
          api.get(`/weather/${id}`).catch(() => null),
          api.get(`/alerts?destination=${id}`).catch(() => null),
        ]);
        if (cancelled) return;
        setDestination(destRes.data.destination);
        if (weatherRes) setWeather(weatherRes.data.weather);
        if (alertsRes) setAlerts(alertsRes.data.alerts);
      } catch {
        if (!cancelled) showToast("Destination not found.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, showToast]);

  async function toggleSave() {
    if (!user) {
      showToast("Log in to save destinations to your trip.", "info");
      return;
    }
    try {
      await api.post("/users/saved-destinations", { destinationId: id });
      setSaved((s) => !s);
      showToast(saved ? "Removed from your trip." : "Added to your trip.", "success");
    } catch {
      showToast("Unable to update saved destinations.", "error");
    }
  }

  if (loading) return <main className="container-page py-24 text-center text-navy/50">Loading destination…</main>;
  if (!destination) return (
    <main className="container-page py-24 text-center">
      <p className="text-navy/60">Destination not found.</p>
      <Link to="/destinations" className="mt-3 inline-block font-semibold text-coral-dark hover:underline">← Back to destinations</Link>
    </main>
  );

  const d = destination;

  return (
    <main>
      <div className="h-72 w-full bg-cover bg-center md:h-96" style={{ backgroundImage: `url('${d.image}')` }} />

      <div className="container-page -mt-16 relative z-10">
        <div className="card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl">{d.name}</h1>
              <p className="text-navy/60">{d.state} · {d.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <SafetyStatusPill status={d.safetyStatus} />
              <span className="font-display text-lg font-bold text-amber-500">★ {d.safetyScore?.toFixed(1)}</span>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-navy/75">{d.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setSosOpen(true)} className="btn btn-danger">🚨 Send SOS</button>
            <button onClick={toggleSave} className="btn btn-outline">{saved ? "★ Saved to Trip" : "☆ Add to My Trip"}</button>
            <Link to={`/map?lat=${d.lat}&lon=${d.lon}&name=${encodeURIComponent(d.name)}`} className="btn btn-outline">View on Map</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {alerts.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg">Active alerts</h3>
                <div className="mt-3 space-y-3">
                  {alerts.map((a) => (
                    <div key={a._id} className="rounded-lg border border-navy/10 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{a.title}</span>
                        <span className={`status-pill ${a.severity === "CRITICAL" || a.severity === "HIGH" ? "status-risk" : "status-moderate"}`}>{a.severity}</span>
                      </div>
                      <p className="mt-1 text-sm text-navy/65">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6">
              <h3 className="text-lg">Safe travel guidelines</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy/70">
                <li>Share your itinerary with a trusted contact before departure.</li>
                <li>Keep a digital and physical copy of your ID.</li>
                <li>Check local weather and road conditions before travel.</li>
                <li>Save the nearest hospital and police station contact below.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            {weather && (
              <div className="card p-6">
                <h3 className="text-lg">Weather {weather.isMockData && <span className="text-xs font-normal text-navy/40">(demo data)</span>}</h3>
                <div className="mt-3 text-3xl font-bold">{weather.temperatureC}°C</div>
                <div className="text-sm text-navy/60">{weather.condition}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-navy/60">
                  <div>Humidity<br /><span className="font-semibold text-navy">{weather.humidity}%</span></div>
                  <div>Wind<br /><span className="font-semibold text-navy">{weather.windKph} kph</span></div>
                  <div>Visibility<br /><span className="font-semibold text-navy">{weather.visibilityKm} km</span></div>
                </div>
                {weather.warning && <div className="mt-3 rounded-lg bg-caution/15 px-3 py-2 text-xs font-medium text-caution">{weather.warning}</div>}
              </div>
            )}

            <div className="card p-6">
              <h3 className="text-lg">Emergency contacts</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-navy/60">Police (national)</span><span className="font-semibold">100</span></div>
                <div className="flex justify-between"><span className="text-navy/60">Ambulance</span><span className="font-semibold">108</span></div>
                <div className="flex justify-between"><span className="text-navy/60">Tourist Helpline</span><span className="font-semibold">1363</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SosModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </main>
  );
}

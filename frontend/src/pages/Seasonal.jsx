import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const SEASONS = ["All", "Summer", "Monsoon", "Winter", "Festival Season"];

export default function Seasonal() {
  const [advisories, setAdvisories] = useState([]);
  const [season, setSeason] = useState("All");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = season !== "All" ? `?season=${encodeURIComponent(season)}` : "";
    api
      .get(`/seasonal${q}`)
      .then((res) => setAdvisories(res.data.advisories))
      .catch(() => showToast("Unable to load seasonal advisories.", "error"))
      .finally(() => setLoading(false));
  }, [season, showToast]);

  return (
    <main className="container-page py-14">
      <h1 className="text-3xl">Seasonal Safety</h1>
      <p className="mt-2 max-w-xl text-navy/60">Plan safe travel with seasonal advisories tailored to conditions across India.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {SEASONS.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              season === s ? "bg-navy text-white" : "border border-navy/15 text-navy/70 hover:border-navy/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {loading ? (
          <p className="text-navy/50">Loading advisories…</p>
        ) : advisories.length === 0 ? (
          <div className="card p-10 text-center text-navy/55">No advisories for this season yet.</div>
        ) : (
          advisories.map((a) => (
            <div key={a._id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg">{a.title}</h3>
                <div className="flex items-center gap-2">
                  {a.activeWarning && <span className="status-pill status-risk">Active Warning</span>}
                  <span className="status-pill status-moderate">{a.season}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-navy/70">{a.description}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {a.affectedLocations?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-navy/40">Affected locations</div>
                    <div className="mt-1 text-sm text-navy/70">{a.affectedLocations.join(", ")}</div>
                  </div>
                )}
                {a.bestTravelPeriod && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-navy/40">Best travel period</div>
                    <div className="mt-1 text-sm text-navy/70">{a.bestTravelPeriod}</div>
                  </div>
                )}
              </div>

              {a.precautions?.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-navy/40">Recommended precautions</div>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-navy/70">
                    {a.precautions.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const TYPES = ["All", "Guide", "Driver", "Photographer"];

export default function Services() {
  const [providers, setProviders] = useState([]);
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = type !== "All" ? `?type=${type}` : "";
    api
      .get(`/services${q}`)
      .then((res) => setProviders(res.data.providers))
      .catch(() => showToast("Unable to load service providers.", "error"))
      .finally(() => setLoading(false));
  }, [type, showToast]);

  function contact(provider) {
    showToast(`Booking request noted for ${provider.name}. (Demo — no real booking is sent.)`, "success");
  }

  return (
    <main className="container-page py-14">
      <h1 className="text-3xl">Verified Travel Services</h1>
      <p className="mt-2 max-w-xl text-navy/60">
        Government-style verified guides, drivers and photographers to support safe, well-planned travel.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              type === t ? "bg-navy text-white" : "border border-navy/15 text-navy/70 hover:border-navy/30"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-48 animate-pulse bg-navy/5" />)}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-semibold">{p.name}</div>
                  <div className="text-sm text-navy/55">{p.type} · {p.location}</div>
                </div>
                {p.verified && <span className="status-pill status-safe">✓ Verified</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy/65">
                <span>★ {p.rating?.toFixed(1)}</span>
                <span>{p.experienceYears} yrs experience</span>
                <span>{p.languages?.join(", ")}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-display text-lg font-bold">₹{p.pricePerDay?.toLocaleString("en-IN")}<span className="text-sm font-normal text-navy/50">/day</span></div>
                <button onClick={() => contact(p)} className="btn btn-primary !px-3.5 !py-1.5 text-sm" disabled={!p.available}>
                  {p.available ? "Contact / Book" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

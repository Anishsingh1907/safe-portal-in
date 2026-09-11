import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import DestinationCard from "../components/DestinationCard";
import SosModal from "../components/SosModal";
import { useToast } from "../context/ToastContext";

const STEPS = [
  { title: "Create your account", body: "Register with verified details so responders can identify you if needed." },
  { title: "Select your destination", body: "Browse real-time safety scores and pick where you're headed." },
  { title: "Monitor safety conditions", body: "Get live alerts for weather, roads, crowds and local advisories." },
  { title: "Get help when needed", body: "One tap sends your location straight into the SOS system." },
];

export default function Landing() {
  const [overview, setOverview] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState("");
  const [sosOpen, setSosOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [destRes] = await Promise.all([api.get("/destinations?limit=6")]);
        if (cancelled) return;
        setDestinations(destRes.data.destinations);
      } catch {
        if (!cancelled) showToast("Unable to load destinations right now.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    api
      .get("/admin/overview")
      .catch(() => null)
      .then((res) => res && setOverview(res.data));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/destinations?q=${encodeURIComponent(q)}`);
  }

  const stats = [
    { label: "Monitored Destinations", value: overview?.destinations ?? (destinations.length || "10+") },
    { label: "Active Safety Alerts", value: overview?.safetyAlertsCount ?? "—" },
    { label: "Registered Travelers", value: overview?.totalUsers ?? "—" },
    { label: "Verified Service Providers", value: overview?.serviceProviders ?? "—" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/60 via-navy/80 to-navy" />

        <div className="container-page relative z-10 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide">
              Tourism Safety & Monitoring Platform for India
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] md:text-5xl">
              Travel India. <span className="text-coral">Stay safe.</span> Stay connected.
            </h1>
            <p className="mt-5 max-w-lg text-white/80">
              Real-time tourism safety monitoring, emergency assistance, location awareness and verified travel
              services — all in one platform.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, e.g. Manali"
                className="input flex-1 !bg-white/95"
              />
              <button type="submit" className="btn btn-primary shrink-0">Explore Destinations</button>
            </form>

            <div className="mt-4">
              <button onClick={() => setSosOpen(true)} className="btn btn-danger">
                🚨 Emergency SOS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container-page -mt-10 relative z-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <div className="font-display text-2xl font-bold text-navy">{s.value}</div>
              <div className="mt-1 text-xs text-navy/60">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-navy/40">
          Figures reflect current database records for this demo deployment.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-page mt-20">
        <h2 className="text-center text-2xl md:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="font-display text-4xl font-bold text-coral/25">{i + 1}</div>
              <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-navy/65">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="container-page mt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl">Popular destinations</h2>
            <p className="mt-1 text-navy/60">Live safety scores for India's most-visited places.</p>
          </div>
          <Link to="/destinations" className="hidden text-sm font-semibold text-coral-dark hover:underline sm:block">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-navy/5" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <DestinationCard key={d._id} destination={d} />
            ))}
          </div>
        )}
      </section>

      {/* SOS CTA */}
      <section className="container-page mt-20">
        <div className="rounded-2xl bg-gradient-to-br from-coral to-coral-dark p-10 text-center text-white">
          <h2 className="text-white">Citizen Emergency SOS</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Send your live location straight into the platform's emergency workflow in one tap.
          </p>
          <button onClick={() => setSosOpen(true)} className="btn mt-6 bg-white text-coral-dark hover:bg-white/90">
            Activate Emergency SOS
          </button>
        </div>
      </section>

      <SosModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}

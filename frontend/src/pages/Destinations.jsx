import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import DestinationCard from "../components/DestinationCard";
import { useToast } from "../context/ToastContext";

export default function Destinations() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearbyState, setNearbyState] = useState("idle"); // idle | locating | done | error
  const { showToast } = useToast();

  const load = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      if (searchQuery) {
        const res = await api.get(`/destinations/search?q=${encodeURIComponent(searchQuery)}`);
        setDestinations(res.data.destinations);
      } else {
        const res = await api.get("/destinations?limit=24");
        setDestinations(res.data.destinations);
      }
    } catch {
      showToast("Unable to load destinations right now.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load(q);
  }, [q, load]);

  function handleSearch(e) {
    e.preventDefault();
    setParams(query ? { q: query } : {});
  }

  function findNearby() {
    if (!navigator.geolocation) {
      setNearbyState("error");
      showToast("Geolocation isn't supported on this device.", "error");
      return;
    }
    setNearbyState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.get(`/destinations/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
          setDestinations(res.data.destinations);
          setParams({});
          setNearbyState("done");
        } catch {
          setNearbyState("error");
          showToast("Couldn't fetch nearby destinations.", "error");
        }
      },
      () => {
        setNearbyState("error");
        showToast("Location permission denied.", "error");
      }
    );
  }

  return (
    <main className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl">Destinations</h1>
        <p className="mt-2 text-navy/60">Browse real-time safety scores and status for monitored destinations across India.</p>
      </div>

      <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="input flex-1" placeholder="Search by destination, state or category" />
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" onClick={findNearby} className="btn btn-outline">
          {nearbyState === "locating" ? "Locating…" : "Find Nearby"}
        </button>
      </form>

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-navy/5" />)}
        </div>
      ) : destinations.length === 0 ? (
        <div className="mt-14 text-center text-navy/50">
          <div className="text-3xl">🧭</div>
          <p className="mt-2">No destinations match that search. Try a different term.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => <DestinationCard key={d._id} destination={d} />)}
        </div>
      )}
    </main>
  );
}

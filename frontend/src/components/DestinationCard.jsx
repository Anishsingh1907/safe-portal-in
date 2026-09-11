import { Link } from "react-router-dom";
import SafetyStatusPill from "./SafetyStatusPill";

export default function DestinationCard({ destination }) {
  const d = destination;
  return (
    <article className="card group overflow-hidden transition-transform hover:-translate-y-0.5">
      <Link to={`/destinations/${d._id}`}>
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url('${d.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60"}')` }}
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/destinations/${d._id}`} className="font-display text-lg font-semibold hover:text-coral">
              {d.name}
            </Link>
            <div className="text-sm text-navy/60">{d.state}</div>
          </div>
          <div className="whitespace-nowrap text-sm font-semibold text-amber-500">★ {d.safetyScore?.toFixed(1)}</div>
        </div>

        {d.distanceKm != null && (
          <div className="mt-1.5 text-xs text-navy/50">{d.distanceKm.toFixed(1)} km away</div>
        )}

        <div className="mt-3">
          <SafetyStatusPill status={d.safetyStatus} />
        </div>

        {d.activeAlerts > 0 && (
          <div className="mt-2 text-xs font-medium text-coral-dark">{d.activeAlerts} active alert{d.activeAlerts > 1 ? "s" : ""}</div>
        )}

        <div className="mt-4 flex gap-2">
          <Link to={`/destinations/${d._id}`} className="btn btn-outline flex-1 !px-3 !py-2 text-sm">
            View Details
          </Link>
          <Link to={`/map?lat=${d.lat}&lon=${d.lon}&name=${encodeURIComponent(d.name)}`} className="btn btn-outline flex-1 !px-3 !py-2 text-sm">
            View on Map
          </Link>
        </div>
      </div>
    </article>
  );
}

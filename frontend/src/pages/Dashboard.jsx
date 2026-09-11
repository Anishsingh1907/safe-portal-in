import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SafetyStatusPill from "../components/SafetyStatusPill";
import { useToast } from "../context/ToastContext";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/users/dashboard")
      .then((res) => setData(res.data))
      .catch(() => showToast("Unable to load your dashboard.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <main className="container-page py-24 text-center text-navy/50">Loading dashboard…</main>;
  if (!data) return null;

  const { profile, trips, savedDestinations, sosHistory } = data;

  return (
    <main className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Welcome back, {profile.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-navy/60">Here's what's happening with your travel safety profile.</p>
        </div>
        <Link to="/trips" className="btn btn-primary">Plan a New Trip</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="card p-6">
          <h3 className="text-lg">Profile</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-navy/55">Name</span><span className="font-medium">{profile.fullName}</span></div>
            <div className="flex justify-between"><span className="text-navy/55">Email</span><span className="font-medium">{profile.email}</span></div>
            <div className="flex justify-between"><span className="text-navy/55">Phone</span><span className="font-medium">{profile.phone}</span></div>
            <div className="flex justify-between"><span className="text-navy/55">State</span><span className="font-medium">{profile.state}</span></div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-navy/55"><span>Profile completion</span><span>{profile.profileCompletion}%</span></div>
            <div className="mt-1.5 h-2 rounded-full bg-navy/10">
              <div className="h-2 rounded-full bg-coral" style={{ width: `${profile.profileCompletion}%` }} />
            </div>
          </div>
        </div>

        {/* Trips summary */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">My Trips</h3>
            <Link to="/trips" className="text-sm font-semibold text-coral-dark hover:underline">Manage trips →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["upcoming", "active", "completed"].map((key) => (
              <div key={key} className="rounded-xl border border-navy/10 p-4">
                <div className="text-xs uppercase tracking-wide text-navy/45">{key}</div>
                <div className="mt-1 text-2xl font-bold">{trips[key].length}</div>
              </div>
            ))}
          </div>
          {trips.upcoming.length === 0 && trips.active.length === 0 && (
            <div className="mt-4 rounded-lg bg-navy/5 p-4 text-sm text-navy/60">
              No upcoming trips yet. <Link to="/trips" className="font-semibold text-coral-dark hover:underline">Create your first trip</Link>.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Saved destinations */}
        <div className="card p-6">
          <h3 className="text-lg">Saved Destinations</h3>
          {savedDestinations.length === 0 ? (
            <p className="mt-3 text-sm text-navy/55">No saved destinations yet — browse destinations and add them to your trip.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {savedDestinations.map((d) => (
                <Link key={d._id} to={`/destinations/${d._id}`} className="flex items-center justify-between rounded-lg border border-navy/10 p-3 hover:border-navy/20">
                  <span className="font-medium">{d.name}</span>
                  <SafetyStatusPill status={d.safetyStatus} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Emergency history */}
        <div className="card p-6">
          <h3 className="text-lg">Emergency History</h3>
          {sosHistory.length === 0 ? (
            <p className="mt-3 text-sm text-navy/55">No SOS records yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {sosHistory.map((s) => (
                <div key={s._id} className="flex items-center justify-between rounded-lg border border-navy/10 p-3 text-sm">
                  <span className="text-navy/70">{fmtDate(s.createdAt)}</span>
                  <span className={`status-pill ${s.status === "RESOLVED" ? "status-safe" : "status-risk"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

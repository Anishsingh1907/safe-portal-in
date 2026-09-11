import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function fmtTime(d) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_FLOW = ["ACTIVE", "ACKNOWLEDGED", "RESPONDING", "RESOLVED"];

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [overviewRes, sosRes] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/sos/admin/active"),
      ]);
      setOverview(overviewRes.data);
      setSosList(sosRes.data.sosList);
    } catch {
      showToast("Unable to load admin dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function advanceStatus(sos) {
    const idx = STATUS_FLOW.indexOf(sos.status);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    try {
      const res = await api.patch(`/sos/${sos._id}/status`, { status: next });
      setSosList((list) =>
        next === "RESOLVED" ? list.filter((s) => s._id !== sos._id) : list.map((s) => (s._id === sos._id ? res.data.sos : s))
      );
      showToast(`SOS marked as ${next}.`, "success");
    } catch {
      showToast("Unable to update SOS status.", "error");
    }
  }

  if (loading) return <main className="container-page py-24 text-center text-navy/50">Loading admin dashboard…</main>;

  const stats = overview
    ? [
        { label: "Total Users", value: overview.totalUsers },
        { label: "Active Trips", value: overview.activeTrips },
        { label: "Active SOS Alerts", value: overview.activeSOS },
        { label: "Safety Alerts", value: overview.safetyAlertsCount },
        { label: "Destinations", value: overview.destinations },
        { label: "Service Providers", value: overview.serviceProviders },
      ]
    : [];

  return (
    <main className="container-page py-12">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <p className="mt-1 text-navy/60">Live overview of platform activity. All figures are read directly from the database.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-navy/55">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl">Live SOS Monitoring</h2>
        {sosList.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-navy/55">No active SOS alerts right now.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {sosList.map((s) => (
              <div key={s._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="font-semibold">{s.user?.fullName} <span className="font-normal text-navy/50">· {s.user?.phone}</span></div>
                  <div className="mt-1 text-sm text-navy/60">
                    {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)} · {fmtTime(s.createdAt)}
                  </div>
                  {s.emergencyMessage && <div className="mt-1 text-sm italic text-navy/60">"{s.emergencyMessage}"</div>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="status-pill status-risk">{s.status}</span>
                  <button onClick={() => advanceStatus(s)} className="btn btn-outline !px-3.5 !py-1.5 text-sm">
                    Mark {STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(s.status) + 1, STATUS_FLOW.length - 1)]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 card p-6 text-sm text-navy/60">
        Destination, alert and service-provider management (add / edit / delete) is available via the REST API
        documented in the README (<code>/api/destinations</code>, <code>/api/alerts</code>, <code>/api/services</code>) —
        wire these into dedicated admin forms as the next iteration.
      </div>
    </main>
  );
}

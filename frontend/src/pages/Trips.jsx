import { useEffect, useState } from "react";
import api from "../services/api";
import SafetyStatusPill from "../components/SafetyStatusPill";
import SosModal from "../components/SosModal";
import { useToast } from "../context/ToastContext";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const emptyForm = { destination: "", startDate: "", endDate: "", contactName: "", contactPhone: "" };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sosTripId, setSosTripId] = useState(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [tripsRes, destRes] = await Promise.all([api.get("/trips"), api.get("/destinations?limit=50")]);
      setTrips(tripsRes.data.trips);
      setDestinations(destRes.data.destinations);
    } catch {
      showToast("Unable to load trips.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createTrip(e) {
    e.preventDefault();
    if (!form.destination || !form.startDate || !form.endDate) return;
    try {
      await api.post("/trips", {
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        emergencyContacts: form.contactName ? [{ name: form.contactName, phone: form.contactPhone }] : [],
      });
      showToast("Trip created.", "success");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to create trip.", "error");
    }
  }

  async function toggleMonitoring(trip) {
    try {
      const res = await api.patch(`/trips/${trip._id}/monitoring`, { active: !trip.monitoringActive });
      setTrips((ts) => ts.map((t) => (t._id === trip._id ? res.data.trip : t)));
      showToast(res.data.trip.monitoringActive ? "Trip monitoring activated." : "Trip monitoring paused.", "success");
    } catch {
      showToast("Unable to update monitoring.", "error");
    }
  }

  async function endTrip(trip) {
    try {
      const res = await api.patch(`/trips/${trip._id}/end`);
      setTrips((ts) => ts.map((t) => (t._id === trip._id ? res.data.trip : t)));
      showToast("Trip marked as completed.", "success");
    } catch {
      showToast("Unable to end trip.", "error");
    }
  }

  return (
    <main className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">My Trips</h1>
          <p className="mt-1 text-navy/60">Plan itineraries, add emergency contacts and activate live monitoring.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn btn-primary">
          {showForm ? "Cancel" : "+ Create Trip"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTrip} className="card mt-6 grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="label">Destination</label>
            <select required className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>
              <option value="">Select destination</option>
              {destinations.map((d) => <option key={d._id} value={d._id}>{d.name}, {d.state}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input required type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End date</label>
              <input required type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Emergency contact name (optional)</label>
            <input className="input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="e.g. Parent, Friend" />
          </div>
          <div>
            <label className="label">Emergency contact phone (optional)</label>
            <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="10-digit number" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary w-full md:w-auto">Save Trip</button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-navy/50">Loading trips…</p>
        ) : trips.length === 0 ? (
          <div className="card p-10 text-center text-navy/55">No trips yet. Create your first one above.</div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold">{trip.destination?.name}</span>
                    <SafetyStatusPill status={trip.destination?.safetyStatus || "Safe"} />
                  </div>
                  <div className="mt-1 text-sm text-navy/60">
                    {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)} · Status: {trip.status}
                    {trip.monitoringActive && <span className="ml-2 font-semibold text-safe">● Monitoring live</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.status !== "COMPLETED" && (
                    <>
                      <button onClick={() => toggleMonitoring(trip)} className="btn btn-outline !px-3 !py-1.5 text-sm">
                        {trip.monitoringActive ? "Pause Monitoring" : "Activate Monitoring"}
                      </button>
                      <button onClick={() => setSosTripId(trip._id)} className="btn btn-danger !px-3 !py-1.5 text-sm">SOS</button>
                      <button onClick={() => endTrip(trip)} className="btn btn-outline !px-3 !py-1.5 text-sm">End Trip</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SosModal open={!!sosTripId} onClose={() => setSosTripId(null)} tripId={sosTripId} />
    </main>
  );
}

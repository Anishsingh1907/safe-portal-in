import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function SosModal({ open, onClose, tripId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stage, setStage] = useState("confirm"); // confirm | locating | sending | sent | error
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function activate() {
    if (!user) {
      onClose();
      navigate("/login");
      return;
    }

    if (!navigator.geolocation) {
      setStage("error");
      return;
    }

    setStage("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStage("sending");
        try {
          await api.post("/sos", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            trip: tripId || undefined,
            emergencyMessage: message,
          });
          setStage("sent");
          showToast("Emergency SOS recorded and visible to Safe Portal responders.", "success");
        } catch (err) {
          setStage("error");
        }
      },
      () => setStage("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleClose() {
    setStage("confirm");
    setMessage("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy-deep/60 p-5" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {stage === "confirm" && (
          <>
            <h3 className="text-xl font-semibold">Send Emergency SOS?</h3>
            <p className="mt-2 text-sm text-navy/70">
              Your current location will be recorded and shared with Safe Portal responders. This is a prototype — it does not currently notify real police or government authorities.
            </p>
            <label className="label">Anything responders should know? (optional)</label>
            <textarea className="input" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Lost on the trail near..." />
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
              <button className="btn btn-danger" onClick={activate}>Confirm SOS</button>
            </div>
          </>
        )}

        {stage === "locating" && (
          <div className="py-6 text-center">
            <div className="text-3xl">📍</div>
            <p className="mt-3 font-medium">Finding your location…</p>
          </div>
        )}

        {stage === "sending" && (
          <div className="py-6 text-center">
            <div className="text-3xl">🚨</div>
            <p className="mt-3 font-medium">Activating emergency SOS…</p>
          </div>
        )}

        {stage === "sent" && (
          <div className="py-4 text-center">
            <div className="text-3xl">✅</div>
            <h3 className="mt-3 text-lg font-semibold">SOS Activated</h3>
            <p className="mt-2 text-sm text-navy/70">
              Your location has been recorded. Stay where you are if it's safe to do so, and keep your phone accessible.
            </p>
            <button className="btn btn-primary mt-5" onClick={handleClose}>Close</button>
          </div>
        )}

        {stage === "error" && (
          <div className="py-4 text-center">
            <div className="text-3xl">⚠️</div>
            <h3 className="mt-3 text-lg font-semibold">Unable to activate SOS</h3>
            <p className="mt-2 text-sm text-navy/70">
              We couldn't get your location or reach the server. If this is a real emergency, please call local emergency services directly.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button className="btn btn-outline" onClick={handleClose}>Close</button>
              <button className="btn btn-danger" onClick={activate}>Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function Signup() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
    state: "", idType: "", idNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        state: form.state,
        idType: form.idType || undefined,
        idNumber: form.idNumber || undefined,
      });
      showToast("Account created — welcome to Safe Portal IN.", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page flex justify-center py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-center text-3xl">Create your account</h1>
        <p className="mt-2 text-center text-navy/60">Register with your details for secure travel monitoring.</p>

        <form onSubmit={handleSubmit} className="card mt-8 p-7">
          {error && <div className="rounded-lg bg-risk/10 px-3.5 py-2.5 text-sm font-medium text-risk">{error}</div>}

          <label className="label">Full name</label>
          <input required className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter full name" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone number</label>
              <input required type="tel" className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="10-digit number" />
            </div>
            <div>
              <label className="label">State / UT</label>
              <select required className="input" value={form.state} onChange={(e) => update("state", e.target.value)}>
                <option value="">Select</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <label className="label">Email address</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Enter email" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <input required type="password" className="input" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input required type="password" className="input" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ID type (optional)</label>
              <select className="input" value={form.idType} onChange={(e) => update("idType", e.target.value)}>
                <option value="">Select</option>
                <option>Aadhaar</option>
                <option>Passport</option>
                <option>Voter ID</option>
              </select>
            </div>
            <div>
              <label className="label">ID number (optional)</label>
              <input className="input" value={form.idNumber} onChange={(e) => update("idNumber", e.target.value)} placeholder="Enter ID number" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full">
            {loading ? "Creating account…" : "Continue"}
          </button>

          <p className="mt-4 text-center text-sm text-navy/60">
            Already registered? <Link to="/login" className="font-semibold text-coral-dark hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

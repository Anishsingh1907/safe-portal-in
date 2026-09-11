import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast("Welcome back!", "success");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl">Login to your account</h1>
        <p className="mt-2 text-center text-navy/60">Access your Safe Portal IN account.</p>

        <form onSubmit={handleSubmit} className="card mt-8 p-7">
          {error && <div className="rounded-lg bg-risk/10 px-3.5 py-2.5 text-sm font-medium text-risk">{error}</div>}

          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />

          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />

          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full">
            {loading ? "Logging in…" : "Login"}
          </button>

          <p className="mt-4 text-center text-sm text-navy/60">
            Don't have an account? <Link to="/signup" className="font-semibold text-coral-dark hover:underline">Create one</Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl border border-navy/10 bg-white/60 p-4 text-xs text-navy/60">
          <strong className="text-navy/80">Demo credentials</strong> — Traveler: traveler@example.com / Traveler@123 · Admin: admin@example.com / Admin@12345
        </div>
      </div>
    </main>
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-5xl">🧭</div>
      <h1 className="mt-4 text-3xl">Page not found</h1>
      <p className="mt-2 max-w-sm text-navy/60">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to Home</Link>
    </main>
  );
}

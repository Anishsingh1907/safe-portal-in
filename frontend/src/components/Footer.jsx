import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 bg-navy-deep py-12 text-white/80">
      <div className="container-page grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral text-base">🛡️</span>
            <span className="font-display text-base font-semibold text-white">Safe Portal IN</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            A tourism safety & monitoring platform prototype for India. Not an official government emergency system.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-white">Explore</div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/destinations" className="hover:text-coral">Destinations</Link>
            <Link to="/map" className="hover:text-coral">Safety Map</Link>
            <Link to="/services" className="hover:text-coral">Services</Link>
            <Link to="/seasonal" className="hover:text-coral">Seasonal Alerts</Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-white">Account</div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/login" className="hover:text-coral">Login</Link>
            <Link to="/signup" className="hover:text-coral">Create Account</Link>
            <Link to="/about" className="hover:text-coral">About this project</Link>
          </div>
        </div>
      </div>

      <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} Safe Portal IN — a student full-stack project. All statistics are demo data unless stated otherwise.
      </div>
    </footer>
  );
}

import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/destinations", label: "Destinations" },
  { to: "/map", label: "Safety Map" },
  { to: "/services", label: "Services" },
  { to: "/seasonal", label: "Seasonal Alerts" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-navy/95 shadow-lg backdrop-blur" : "bg-navy"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral text-lg">🛡️</span>
          <span className="font-display text-lg font-semibold leading-tight text-white">
            Safe Portal <span className="text-coral">IN</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-coral" : "text-white/85 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-outline btn !border-white/25 !text-white hover:!bg-white/10">
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="btn-outline btn !border-white/25 !text-white hover:!bg-white/10">
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn btn-danger"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline btn !border-white/25 !text-white hover:!bg-white/10">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-white/20 text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy px-5 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-white/10 text-coral" : "text-white/85"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-outline btn !border-white/25 !text-white">
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="btn-outline btn !border-white/25 !text-white">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                    className="btn btn-danger"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline btn !border-white/25 !text-white">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import SafetyMap from "./pages/SafetyMap";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Services from "./pages/Services";
import Seasonal from "./pages/Seasonal";
import Admin from "./pages/Admin";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/map" element={<SafetyMap />} />
          <Route path="/services" element={<Services />} />
          <Route path="/seasonal" element={<Seasonal />} />
          <Route path="/about" element={<About />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

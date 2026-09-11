export default function About() {
  return (
    <main className="container-page max-w-2xl py-16">
      <h1 className="text-3xl">About this project</h1>
      <p className="mt-4 text-navy/70">
        Safe Portal IN is a tourism safety and monitoring platform <strong>prototype</strong> for India, built as a
        full-stack MERN application (React, Node/Express, MongoDB). It demonstrates real-time destination safety
        scoring, geolocation-based nearby discovery, trip planning with monitoring, an emergency SOS workflow, and
        an admin dashboard for managing alerts and responses.
      </p>
      <p className="mt-4 text-navy/70">
        <strong>This is not an official Government of India system.</strong> Statistics shown across the platform are
        drawn from this deployment's own database (demo/seed data unless real records have been added), and SOS
        alerts are recorded within this application only — they are not currently routed to real police or
        emergency-response authorities.
      </p>
      <p className="mt-4 text-navy/70">
        Built as a student full-stack project. See the project README for the technical architecture, API
        documentation and setup instructions.
      </p>
    </main>
  );
}

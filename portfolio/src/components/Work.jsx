export default function Work() {
  return (
    <section id="work">
      <div className="section-inner">
        <div className="section-head reveal">
          <div>
            <p className="kicker">Selected Work</p>
            <h2>Systems with product muscle and engineering depth.</h2>
          </div>
          <p className="section-note">
            Two major builds: one SaaS platform, one real-time communication product.
          </p>
        </div>

        <div className="work-grid">
          <article className="project-card tilt reveal">
            <div className="project-top">
              <div>
                <h3>VA Builder</h3>
                <p>Multi-tenant virtual assistant SaaS for business websites.</p>
              </div>
              <span className="project-tag">2025 – 2026</span>
            </div>
            <ul className="project-list">
              <li>Built an embeddable assistant that businesses can add with a single script tag.</li>
              <li>Created a conversational site-navigation engine so users can move through a website with natural language.</li>
              <li>Implemented JWT auth, RBAC, API rate limiting, and tenant-specific configuration for theme, tone, business name, and persona.</li>
            </ul>
            <div className="tech-row" aria-label="VA Builder technology stack">
              {['MongoDB', 'Express.js', 'React', 'Node.js', 'JWT', 'REST API'].map((t) => (
                <span className="chip" key={t}>{t}</span>
              ))}
            </div>
          </article>

          <article className="project-card tilt reveal">
            <div className="project-top">
              <div>
                <h3>echoChat</h3>
                <p>Real-time chat, video calls, presence, and screen sharing.</p>
              </div>
              <span className="project-tag">2025 – 2026</span>
            </div>
            <ul className="project-list">
              <li>Developed friend requests, WebSocket messaging, online presence, read receipts, and concurrent session support.</li>
              <li>Integrated WebRTC for one-on-one calls, group conferences, and live screen sharing.</li>
              <li>Designed 20+ screens, including chat, video, profiles, and admin workflows with RBAC-protected settings.</li>
            </ul>
            <div className="tech-row" aria-label="echoChat technology stack">
              {['MongoDB', 'Express.js', 'React', 'Node.js', 'Socket.io', 'WebRTC'].map((t) => (
                <span className="chip" key={t}>{t}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function Skills() {
  return (
    <section id="skills">
      <div className="section-inner">
        <div className="section-head reveal">
          <div>
            <p className="kicker">Technical Range</p>
            <h2>Comfortable across interface, API, data, and real-time layers.</h2>
          </div>
          <p className="section-note">
            The stack leans practical: fast UIs, secure backends, database modeling, and production-minded workflows.
          </p>
        </div>

        <div className="skills-layout">
          <div className="skill-block reveal">
            <h3>Stack</h3>
            <div className="skill-matrix">
              {[
                { label: 'Languages',  value: 'JavaScript ES2022+, TypeScript' },
                { label: 'Frontend',   value: 'React.js, Next.js, HTML5, CSS3, Tailwind CSS' },
                { label: 'Backend',    value: 'Node.js, Express.js, REST API design, Socket.io, WebRTC' },
                { label: 'Databases',  value: 'MongoDB, MySQL, Mongoose ODM, MySQL Workbench' },
                { label: 'Security',   value: 'JWT, RBAC, rate limiting, OAuth concepts' },
                { label: 'Workflow',   value: 'Git, GitHub, Postman, VS Code, npm' },
              ].map(({ label, value }) => (
                <div className="skill-row" key={label}>
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="skill-block reveal">
            <h3>Engineering Signals</h3>
            <div className="signal-board">
              {[
                { abbr: 'API', desc: 'REST architecture, auth boundaries, rate limits, tenant-aware services.' },
                { abbr: 'RTC', desc: 'Socket-powered messaging, WebRTC video calls, screen sharing, presence.' },
                { abbr: 'UI',  desc: 'Responsive product screens, admin dashboards, chat and video workflows.' },
                { abbr: 'DSA', desc: '100+ LeetCode problems across arrays, trees, DP, linked lists, and graphs.' },
              ].map(({ abbr, desc }) => (
                <div className="signal tilt" key={abbr}>
                  <b>{abbr}</b>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

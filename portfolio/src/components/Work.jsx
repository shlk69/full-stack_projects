const projects = [
  {
    name: 'VA Builder',
    description: 'An embeddable AI voice assistant for business websites.',
    demo: 'https://va-builder.onrender.com/',
    source: 'https://github.com/shlk69/full-stack_projects/tree/main/VABuilder',
    points: [
      'Embed a customizable assistant with one script tag, with separate business branding, themes, tone, and page configuration.',
      'Use Gemini-powered conversations, browser voice input, and natural-language navigation to configured website pages.',
      'Protect accounts with Google sign-in, server-verified Firebase identities, JWT authentication, and private backend API keys.',
      'Upgrade through Razorpay test checkout with server-side signature, amount, and capture verification; hosted on Render.',
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini API', 'Firebase Auth', 'Razorpay'],
  },
  {
    name: 'Uber (TakeME)',
    description: 'A ride-hailing app connecting riders and captains in real time.',
    demo: 'https://uber-video-qxht.onrender.com/',
    source: 'https://github.com/shlk69/full-stack_projects/tree/main/uber-video',
    points: [
      'Book and manage trips through separate rider and captain flows, from pickup and destination search to fare estimates and ride completion.',
      'Share ride events and live location updates through Socket.IO, with route maps visible to both riders and captains.',
      'Manage cancellations, trip history and receipts, in-app chat, and rider reviews shown in the captain dashboard.',
      'Support Razorpay test payments and a protected operations dashboard for rides, users, and captains; hosted on Render.',
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Mapbox', 'Razorpay'],
  },
];

export default function Work() {
  return (
    <section id="work">
      <div className="section-inner">
        <div className="section-head reveal">
          <div>
            <p className="kicker">Selected Work</p>
            <h2>From AI conversations to real-time rides.</h2>
          </div>
          <p className="section-note">
            Two full stack apps with live demos: an AI assistant platform and a ride-hailing system.
          </p>
        </div>
        <div className="work-grid">
          {projects.map((project) => (
            <article className="project-card tilt reveal" key={project.name}>
              <div className="project-top">
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
                <span className="project-tag">Live on Render</span>
              </div>
              <ul className="project-list">
                {project.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="tech-row" aria-label={`${project.name} technology stack`}>
                {project.stack.map((tech) => <span className="chip" key={tech}>{tech}</span>)}
              </div>
              <div className="project-actions">
                <a className="button primary" href={project.demo} target="_blank" rel="noopener noreferrer" aria-label={`Live demo of ${project.name}`}>Live Demo <span aria-hidden="true">↗</span></a>
                <a className="button ghost" href={project.source} target="_blank" rel="noopener noreferrer" aria-label={`Source code for ${project.name}`}>Source Code</a>
              </div>
              <p className="project-note">The free hosting plan may take a moment to wake up.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

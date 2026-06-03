import Scene from './Scene';

export default function Hero({ onEmailClick }) {
  return (
    <header className="hero" id="top">
      <Scene />
      <div className="hero-inner">
        <div>
          <p className="eyebrow">
            <span className="pulse-dot" />
            Full Stack Developer from Indore
          </p>
          <h1>Sahil Kurmi (SHL) builds real-time web systems.</h1>
          <p className="hero-copy">
            MERN, Next.js, TypeScript, REST APIs, WebRTC, Socket.io, JWT, RBAC, and scalable SaaS architecture.
            I turn product ideas into fast, secure, production-ready interfaces and backends.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={onEmailClick}>Hire Me</button>
            <a className="button ghost" href="#work">View Projects</a>
            <a className="button ghost" href="https://github.com/shlk69" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </header>
  );
}

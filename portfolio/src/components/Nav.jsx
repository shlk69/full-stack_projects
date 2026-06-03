import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="Sahil Kurmi home">
          <span className="brand-mark">SHL</span>
          <span>SHL</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#education">Education</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
  );
}

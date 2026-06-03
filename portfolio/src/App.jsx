import { useState, useCallback } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Work from './components/Work';
import Skills from './components/Skills';
import Education from './components/Education';
import ScrollToTop from "./components/ScrollToTop";
import Contact from './components/Contact';
import Toast from './components/Toast';
import { useReveal } from './hooks/useReveal';
import { useTilt } from './hooks/useTilt';

const EMAIL = 'sahilkurmi356@gmail.com';
const PHONE = '+918305150325';

export default function App() {
  const [toast, setToast] = useState({ visible: false, message: '' });

  useReveal();
  useTilt();

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  const handleEmail = useCallback(() => {
    window.location.href = `mailto:${EMAIL}`;
  }, []);

  const handleCall = useCallback(() => {
    navigator.clipboard.writeText(PHONE).then(() => {
      showToast('📋 Contact number copied!');
    }).catch(() => {
      // fallback if clipboard fails
      showToast(`📞 Call: ${PHONE}`);
    });
  }, [showToast]);

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to portfolio
      </a>
      <Nav />
      <Hero onEmailClick={handleEmail} />
      <Stats />
      <main>
        <Work />
        <Skills />
        <Education />
        <Contact onEmailClick={handleEmail} onCallClick={handleCall} />
      </main>
      <footer>
        <span>Sahil Kurmi (SHL).</span>
        <span>Indore, Madhya Pradesh, India</span>
      </footer>
      <Toast message={toast.message} visible={toast.visible} />
      <ScrollToTop />
    </>
  );
}

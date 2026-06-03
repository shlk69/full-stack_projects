import { useEffect } from 'react';

export function useTilt() {
  useEffect(() => {
    const tiltEls = document.querySelectorAll('.tilt');

    const handlers = [];

    tiltEls.forEach((el) => {
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(10px)`;
      };
      const onLeave = () => {
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      handlers.push({ el, onMove, onLeave });
    });

    return () => {
      handlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      });
    };
  }, []);
}

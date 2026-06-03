import { useEffect, useRef } from 'react';

const COLORS = ['#a6f25b', '#45dbc2', '#ff7657', '#7db5ff', '#f2c35b'];
const NODE_COUNT = 88;

export default function Scene() {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const nodesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function resetNodes() {
      nodesRef.current = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const angle = i * 2.399963;
        const radius = 170 + (i % 17) * 15;
        nodesRef.current.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle * 0.8) * radius * 0.58,
          z: -240 + (i % 31) * 18,
          size: 1.6 + (i % 5) * 0.46,
          color: COLORS[i % COLORS.length],
        });
      }
    }

    function project(node, time, width, height) {
      const spin = time * 0.00018;
      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      const px = node.x * cos - node.z * sin;
      const pz = node.x * sin + node.z * cos;
      const py = node.y + Math.sin(time * 0.001 + node.x * 0.012) * 18;
      const depth = 640 / (640 + pz);
      const { x: px2, y: py2, active } = pointerRef.current;
      const pointerX = active ? (px2 - width / 2) * 0.035 : 0;
      const pointerY = active ? (py2 - height / 2) * 0.03 : 0;
      return {
        x: width * 0.68 + (px + pointerX) * depth,
        y: height * 0.48 + (py + pointerY) * depth,
        depth,
        size: node.size * depth,
        color: node.color,
      };
    }

    function draw(time) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const projected = nodesRef.current.map((node) => project(node, time, width, height));

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 118) {
            const alpha = (1 - dist / 118) * 0.22;
            ctx.strokeStyle = `rgba(247, 243, 232, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      projected.forEach((point) => {
        ctx.fillStyle = point.color;
        ctx.globalAlpha = Math.max(0.34, Math.min(0.92, point.depth));
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(1.2, point.size * 1.7), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    }

    const onResize = () => resizeCanvas();
    const onMove = (e) => {
      pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      pointerRef.current = { ...pointerRef.current, active: false };
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    resizeCanvas();
    resetNodes();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} id="scene" aria-hidden="true" />;
}

import { useEffect, useRef } from 'react';

/**
 * ConfettiBurst — Canvas-based confetti celebration that fires on mount.
 * Brand-colored particles with physics-based gravity and fade out.
 */
export default function ConfettiBurst() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = [
      '#f97316', '#fb923c', '#fdba74', '#fcd34d',
      '#ea580c', '#c2410c', '#22c55e', '#4ade80',
      '#ffffff', '#fed7aa',
    ];

    const confetti = [];
    const PARTICLE_COUNT = 120;

    // Create particles from top center
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 8 + 4;
      confetti.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.3 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.5),
        vy: Math.sin(angle) * velocity - Math.random() * 3 - 2,
        width: Math.random() * 10 + 5,
        height: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.12 + Math.random() * 0.08,
        drag: 0.98 + Math.random() * 0.015,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
      });
    }

    let frame = 0;
    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      frame++;

      let alive = false;

      for (const p of confetti) {
        if (p.opacity <= 0) continue;
        alive = true;

        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx + Math.sin(frame * p.wobbleSpeed) * p.wobble * 0.03;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out as it falls
        if (p.y > window.innerHeight * 0.7) {
          p.opacity -= 0.015;
        }

        // Fade after time
        if (frame > 120) {
          p.opacity -= 0.008;
        }

        p.opacity = Math.max(0, p.opacity);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Mix of rectangles and circles for variety
        if (p.width > 8) {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }

        ctx.restore();
      }

      if (alive) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}

import { useEffect, useRef, useCallback } from 'react';

/**
 * ParticleCanvas — Interactive particle network background.
 * Performance-optimized with spatial grid for O(n) connection lookups.
 */
export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const PARTICLE_COUNT = 90;
  const CONNECTION_DISTANCE = 150;
  const MOUSE_RADIUS = 200;
  const CELL_SIZE = CONNECTION_DISTANCE; // spatial grid cell size

  const createParticles = useCallback((width, height) => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        opacity: Math.random() * 0.35 + 0.25,
        hue: Math.random() * 30 + 15,
        saturation: Math.random() * 20 + 70,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Disable image smoothing for perf
    ctx.imageSmoothingEnabled = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w: rect.width, h: rect.height };

      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Spatial grid for fast neighbor lookups
    const getGrid = (particles, w, h) => {
      const cols = Math.ceil(w / CELL_SIZE) + 1;
      const rows = Math.ceil(h / CELL_SIZE) + 1;
      const grid = new Array(cols * rows);
      for (let i = 0; i < grid.length; i++) grid[i] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const col = Math.floor(p.x / CELL_SIZE);
        const row = Math.floor(p.y / CELL_SIZE);
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          grid[row * cols + col].push(i);
        }
      }
      return { grid, cols, rows };
    };

    const animate = () => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.18;
          p.vy += (dy / dist) * force * 0.18;
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Build spatial grid
      const { grid, cols, rows } = getGrid(particles, w, h);

      // Batch all lines into a single path
      ctx.beginPath();
      ctx.strokeStyle = 'hsla(25, 80%, 55%, 0.18)';
      ctx.lineWidth = 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = grid[row * cols + col];
          if (cell.length === 0) continue;

          // Check neighbors: same cell + right + bottom + bottom-right + bottom-left
          const neighbors = [
            row * cols + col,
            col + 1 < cols ? row * cols + col + 1 : -1,
            row + 1 < rows ? (row + 1) * cols + col : -1,
            row + 1 < rows && col + 1 < cols ? (row + 1) * cols + col + 1 : -1,
            row + 1 < rows && col - 1 >= 0 ? (row + 1) * cols + col - 1 : -1,
          ];

          for (let ci = 0; ci < cell.length; ci++) {
            const ai = cell[ci];
            const a = particles[ai];

            for (let ni = 0; ni < neighbors.length; ni++) {
              if (neighbors[ni] === -1) continue;
              const neighborCell = grid[neighbors[ni]];

              const startJ = neighbors[ni] === row * cols + col ? ci + 1 : 0;
              for (let cj = startJ; cj < neighborCell.length; cj++) {
                const bi = neighborCell[cj];
                const b = particles[bi];
                const ddx = a.x - b.x;
                const ddy = a.y - b.y;
                const distSq = ddx * ddx + ddy * ddy;

                if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                }
              }
            }
          }
        }
      }
      ctx.stroke(); // single draw call for ALL lines

      // Draw particles (batch by similar color)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 60%, ${p.opacity})`;
        ctx.fill();
      }

      // Mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS
        );
        gradient.addColorStop(0, 'hsla(25, 90%, 65%, 0.10)');
        gradient.addColorStop(1, 'hsla(25, 90%, 65%, 0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

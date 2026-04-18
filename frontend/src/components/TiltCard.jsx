import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard — 3D tilt + mouse-tracking spotlight wrapper.
 * Wraps children in a card with Apple TV-like parallax hover effect.
 * @param {{ children: React.ReactNode, className?: string, id?: string }} props
 */
export default function TiltCard({ children, className = '', id, glowColor = 'rgba(249, 115, 22, 0.08)' }) {
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring-based smooth rotation
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // Spotlight position as CSS custom properties
  const spotlightX = useTransform(mouseX, [0, 1], [0, 100]);
  const spotlightY = useTransform(mouseY, [0, 1], [0, 100]);

  // Build the spotlight gradient as a motion value (must be at top level)
  const spotlightBackground = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${glowColor}, transparent 60%)`
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative ${className}`}
      id={id}
    >
      {/* Spotlight overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: spotlightBackground,
        }}
      />

      {/* Card content */}
      <div className="relative z-0" style={{ transform: 'translateZ(0)' }}>
        {children}
      </div>
    </motion.div>
  );
}

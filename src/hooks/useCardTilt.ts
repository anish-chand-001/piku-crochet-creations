import { useCallback, useRef } from "react";

/**
 * Returns mouse handlers for a subtle 3D tilt effect on cards.
 * Usage: <div {...tiltHandlers} style={tiltStyle}>
 */
export const useCardTilt = (intensity = 8) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02, 1.02, 1.02)`;
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
  }, []);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
};

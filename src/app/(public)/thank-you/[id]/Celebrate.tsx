"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = [
  "var(--navy-stripe)",
  "var(--sun)",
  "var(--ok)",
  "var(--navy-glow)",
  "var(--card-line)",
];

/**
 * A one-shot confetti burst on the confirmation page. Purely decorative, so it
 * sits behind everything and never takes pointer events. Reduced motion is
 * handled in CSS (`.confetti` is hidden outright) rather than in JS, so the
 * markup is identical on the server and the client.
 */
export function Celebrate() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 4200);
    return () => clearTimeout(timer);
  }, []);

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 97) % 100,
        delay: (i % 12) * 90,
        duration: 2400 + ((i * 37) % 1200),
        drift: ((i % 7) - 3) * 28,
        spin: 360 + ((i * 53) % 540),
        size: 6 + (i % 4) * 2,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  );

  if (done) return null;

  return (
    <div
      aria-hidden
      className="confetti pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.8),
            background: p.color,
            borderRadius: p.round ? "999px" : "2px",
            // Consumed by the nm-confetti keyframes.
            ["--drift" as string]: `${p.drift}px`,
            ["--spin" as string]: `${p.spin}deg`,
            animation: `nm-confetti ${p.duration}ms cubic-bezier(0.3, 0.6, 0.5, 1) ${p.delay}ms both`,
          }}
        />
      ))}
    </div>
  );
}

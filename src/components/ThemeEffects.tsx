/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  char: string;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

export default function ThemeEffects({ theme }: { theme: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles depending on the active theme
    let chars: string[] = [];
    if (theme === 'spring') {
      chars = ['🌸', '🍃', '🌸', '💮'];
    } else if (theme === 'summer') {
      chars = ['☀️', '🌻', '⛱️', '✨'];
    } else if (theme === 'autumn') {
      chars = ['🍁', '🍂', '🍁', '🪵'];
    } else if (theme === 'winter') {
      chars = ['❄️', '☃️', '❄️', '🤍'];
    } else if (theme === 'darkMoon') {
      chars = ['✨', '⭐', '🌕', '☄️'];
    } else if (theme === 'desert') {
      chars = ['🌵', '🏜️', '☀️', '🌾'];
    }

    if (chars.length === 0) {
      setParticles([]);
      return;
    }

    const generated: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      left: Math.random() * 100, // percentage
      size: 14 + Math.random() * 18, // px
      delay: Math.random() * 5, // seconds delay
      duration: 6 + Math.random() * 8, // seconds fall speed
    }));

    setParticles(generated);
  }, [theme]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-center animate-fall"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            top: '-30px',
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
}

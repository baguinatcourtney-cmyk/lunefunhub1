/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AmpersandCoinProps {
  className?: string;
  animate?: boolean;
}

export default function AmpersandCoin({ className = "w-5 h-5 text-[11px]", animate = false }: AmpersandCoinProps) {
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200 text-amber-950 font-black shadow-[0_2px_4px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.45)] shrink-0 select-none leading-none font-serif ${animate ? 'animate-spin' : ''} ${className}`}
      style={animate ? { animationDuration: '4s' } : undefined}
    >
      &
    </span>
  );
}

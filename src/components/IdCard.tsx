/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Trophy } from 'lucide-react';
import AmpersandCoin from './AmpersandCoin';

interface IdCardProps {
  name: string;
  sex: string;
  age: number;
  country: string;
  luneSince: string;
  avatar: string;
  coins: number;
  rank: string;
  luneCode?: string;
  bias?: string;
  biasWrecker?: string;
  stanlist?: string;
  socials?: {
    twitter?: string;
    tiktok?: string;
    instagram?: string;
  };
}

export default function IdCard({
  name,
  sex,
  age,
  country,
  luneSince,
  avatar,
  coins,
  rank,
  luneCode,
  bias,
  biasWrecker,
  stanlist,
  socials,
}: IdCardProps) {
  const [shouldAnimate, setShouldAnimate] = useState(() => {
    try {
      const animated = sessionStorage.getItem(`lune_id_anim_${name}`);
      return !animated;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (shouldAnimate) {
      try {
        sessionStorage.setItem(`lune_id_anim_${name}`, 'true');
      } catch (e) {
        // Ignore
      }
    }
  }, [name, shouldAnimate]);

  // Determine rank badge based on rank
  const getRankBadge = (r: string) => {
    switch (r) {
      case 'New Moon': return '🌑';
      case 'Crescent Moon': return '🌙';
      case 'Half Moon': return '🌗';
      case 'Full Moon': return '🌕';
      default: return '🌑';
    }
  };

  return (
    <div className="relative">
      {/* Magical Floating Elements in Background - only visible during first-time magical entrance */}
      {shouldAnimate && (
        <div className="absolute inset-[-40px] pointer-events-none overflow-visible z-20">
          {/* Magical Sparkle 1 */}
          <motion.div
            initial={{ scale: 0, x: -20, y: -20, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], x: [-20, -40, -35], y: [-20, -50, -45], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.3, duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute text-xl"
            style={{ top: '10%', left: '10%' }}
          >
            ✨
          </motion.div>
          {/* Magical Sparkle 2 */}
          <motion.div
            initial={{ scale: 0, x: 20, y: -20, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], x: [20, 50, 45], y: [-20, -30, -25], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.5, duration: 2.2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute text-2xl"
            style={{ top: '25%', right: '10%' }}
          >
            🌟
          </motion.div>
          {/* Magical Sparkle 3 */}
          <motion.div
            initial={{ scale: 0, x: -20, y: 20, opacity: 0 }}
            animate={{ scale: [0, 1, 1.2], x: [-20, -60, -50], y: [20, 40, 35], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.7, duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
            className="absolute text-lg"
            style={{ bottom: '20%', left: '5%' }}
          >
            ⭐
          </motion.div>
          {/* Magical Sparkle 4 */}
          <motion.div
            initial={{ scale: 0, x: 20, y: 20, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], x: [20, 40, 30], y: [20, 60, 50], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.9, duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute text-xl"
            style={{ bottom: '15%', right: '5%' }}
          >
            🔮
          </motion.div>
        </div>
      )}

      <motion.div
        initial={shouldAnimate ? { opacity: 0, scale: 0.3, rotateY: -360, rotateZ: -15 } : { opacity: 1, scale: 1, rotateY: 0, rotateZ: 0 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0 }}
        transition={shouldAnimate ? { type: 'spring', damping: 14, stiffness: 80, duration: 1.5 } : { duration: 0.2 }}
        whileHover={{ scale: 1.03, rotateY: 8, rotateX: -8 }}
        className="relative w-full max-w-sm rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-white/20 shadow-2xl font-fredoka text-white"
        style={{ perspective: 1000 }}
      >
        {/* Holographic sweeping scan light animation */}
        <motion.div
          initial={{ x: '-150%', y: '-150%' }}
          animate={{ x: '150%', y: '150%' }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-pink-500/10 via-purple-500/15 via-blue-500/10 to-transparent pointer-events-none z-10"
        />
        
        {/* Background celestial design */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
              LUNÉ ID
            </h3>
          </div>
        <div className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          <AmpersandCoin className="w-4 h-4 text-[9px]" />
          <span className="text-xs font-bold text-yellow-400">{coins}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex gap-4">
        {/* Avatar Area (Photocard Style) */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-5xl shadow-inner group overflow-hidden">
            {/* Pulsing light behind avatar */}
            <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent animate-pulse" />
            <motion.span 
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="z-10"
            >
              {avatar}
            </motion.span>
          </div>
          <div className="mt-2.5 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">RANK</span>
            <span className="text-xs font-bold text-purple-300 flex items-center justify-center gap-1">
              {getRankBadge(rank)} {rank}
            </span>
          </div>
        </div>

        {/* Detailed Info Column */}
        <div className="flex-1 space-y-2 text-sm">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">LUNÉ NAME</span>
            <span className="font-bold text-slate-100 text-base">{name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block tracking-wider">SEX</span>
              <span className="font-semibold text-slate-200">{sex}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block tracking-wider">AGE</span>
              <span className="font-semibold text-slate-200">{age}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">COUNTRY</span>
            <span className="font-semibold text-slate-200">{country}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">MEMBER SINCE</span>
            <span className="font-bold text-pink-400">{luneSince}</span>
          </div>

          {bias && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 mt-1">
              <div>
                <span className="text-[9px] text-pink-400 uppercase block tracking-wider font-bold">BIAS</span>
                <span className="font-bold text-slate-100 text-xs">{bias}</span>
              </div>
              {biasWrecker && (
                <div>
                  <span className="text-[9px] text-purple-400 uppercase block tracking-wider font-bold">WRECKER</span>
                  <span className="font-bold text-slate-100 text-xs">{biasWrecker}</span>
                </div>
              )}
            </div>
          )}

          {stanlist && (
            <div className="pt-0.5">
              <span className="text-[9px] text-slate-400 uppercase block tracking-wider font-bold">STANLIST</span>
              <span className="font-semibold text-slate-200 text-xs">{stanlist}</span>
            </div>
          )}

          {socials && (
            <div className="flex gap-2 pt-1 items-center">
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500 transition-all text-slate-300 hover:text-pink-400" title="Twitter">
                  <span className="text-[9px] font-mono font-bold">𝕏</span>
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500 transition-all text-slate-300 hover:text-pink-400" title="TikTok">
                  <span className="text-[9px] font-mono font-bold">TikTok</span>
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500 transition-all text-slate-300 hover:text-pink-400" title="Instagram">
                  <span className="text-[9px] font-mono font-bold">Insta</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Design */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center space-x-1">
          <Sparkles size={10} className="text-yellow-400 animate-spin" />
          <span>AUTHENTIC OFFICIAL PASS</span>
        </div>
        <div className="font-mono bg-slate-900/80 px-2 py-0.5 rounded text-pink-400 font-bold uppercase tracking-wider">
          {luneCode || `LUNE-${luneSince}-${name.slice(0, 3).toUpperCase()}`}
        </div>
      </div>
    </motion.div>
    </div>
  );
}

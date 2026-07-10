/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getThemeCardStyles(theme: string) {
  const isLight = ['spring', 'summer', 'autumn', 'winter', 'desert'].includes(theme);
  
  switch (theme) {
    case 'spring':
      return {
        glowBorder: 'border border-pink-400/45 shadow-[0_0_15px_rgba(236,72,153,0.25)] hover:border-pink-500/60 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textHighlight: 'text-pink-600 font-extrabold',
        title: 'text-slate-900 font-black',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        accentBg: 'bg-pink-500/10 text-pink-600 border border-pink-200',
        btnAccent: 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20',
        isLight: true,
      };
    case 'summer':
      return {
        glowBorder: 'border border-yellow-400/45 shadow-[0_0_15px_rgba(234,179,8,0.25)] hover:border-yellow-500/60 hover:shadow-[0_0_22px_rgba(234,179,8,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textHighlight: 'text-amber-600 font-extrabold',
        title: 'text-slate-900 font-black',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        accentBg: 'bg-amber-500/10 text-amber-600 border border-amber-200',
        btnAccent: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20',
        isLight: true,
      };
    case 'autumn':
      return {
        glowBorder: 'border border-orange-400/45 shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:border-orange-500/60 hover:shadow-[0_0_22px_rgba(249,115,22,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textHighlight: 'text-orange-600 font-extrabold',
        title: 'text-slate-900 font-black',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        accentBg: 'bg-orange-500/10 text-orange-600 border border-orange-200',
        btnAccent: 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20',
        isLight: true,
      };
    case 'winter':
      return {
        glowBorder: 'border border-blue-400/45 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:border-blue-500/60 hover:shadow-[0_0_22px_rgba(59,130,246,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textHighlight: 'text-blue-600 font-extrabold',
        title: 'text-slate-900 font-black',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        accentBg: 'bg-blue-500/10 text-blue-600 border border-blue-200',
        btnAccent: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20',
        isLight: true,
      };
    case 'desert':
      return {
        glowBorder: 'border border-amber-700/45 shadow-[0_0_15px_rgba(180,83,9,0.25)] hover:border-amber-700/60 hover:shadow-[0_0_22px_rgba(180,83,9,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textHighlight: 'text-amber-800 font-extrabold',
        title: 'text-slate-900 font-black',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        accentBg: 'bg-amber-700/10 text-amber-800 border border-amber-300/30',
        btnAccent: 'bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-700/20',
        isLight: true,
      };
    case 'darkMoon':
    default:
      return {
        glowBorder: 'border border-red-500/45 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:border-red-500/60 hover:shadow-[0_0_22px_rgba(239,68,68,0.45)] transition-all duration-300',
        textPrimary: 'text-slate-200',
        textSecondary: 'text-slate-400',
        textHighlight: 'text-red-400 font-extrabold',
        title: 'text-white font-black',
        cardBg: 'bg-slate-900/60 backdrop-blur-md',
        accentBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
        btnAccent: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/20',
        isLight: false,
      };
  }
}

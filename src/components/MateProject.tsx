/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MATE_QUESTIONS, MEMBER_PROFILES } from '../data';
import { playClickSound, playWinSound } from '../utils/sound';
import { getThemeCardStyles } from '../utils/theme';
import { Heart, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, Coins } from 'lucide-react';

interface MateProjectProps {
  coins: number;
  onUpdateCoins?: (amount: number) => void;
  theme?: string;
}

export default function MateProject({ coins, onUpdateCoins, theme }: MateProjectProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<{ [memberName: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize/Reset
  const startQuiz = () => {
    playClickSound();

    if (coins < 50) {
      alert("You need at least 50 coins to start the &mate test!");
      return;
    }

    if (onUpdateCoins) {
      onUpdateCoins(-50);
    }
    
    // Reset scores for all 9 members
    const initialScores: { [memberName: string]: number } = {};
    MEMBER_PROFILES.forEach(p => {
      initialScores[p.name] = 0;
    });
    
    setScores(initialScores);
    setCurrentIdx(0);
    setShowResult(false);
    setIsPlaying(true);
  };

  const handleOptionSelect = (optionScores: { [memberName: string]: number }) => {
    playClickSound();
    
    // Accumulate scores
    const updatedScores = { ...scores };
    Object.keys(optionScores).forEach((member) => {
      if (updatedScores[member] !== undefined) {
        updatedScores[member] += optionScores[member];
      }
    });
    setScores(updatedScores);

    // Proceed or Finish
    if (currentIdx < MATE_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowResult(true);
      playWinSound();
    }
  };

  // Compute final mate candidate: member with highest score
  const getMateCandidate = () => {
    let topMember = MEMBER_PROFILES[0];
    let maxVal = -1;

    MEMBER_PROFILES.forEach((profile) => {
      const score = scores[profile.name] || 0;
      if (score > maxVal) {
        maxVal = score;
        topMember = profile;
      }
    });

    return topMember;
  };

  // Get Low-compatibility info based on MBTI (direct cognitive opposites or closest matching opposite)
  // EJ (ISTJ) -> Nicholas (ENFP)
  // Fuma (INTJ) -> Maki (ESFP)
  // K (INFP) -> Yuma (ISTJ - closest to ESTJ)
  // Nicholas (ENFP) -> EJ (ISTJ)
  // Yuma (ISTJ) -> Taki (ENFP)
  // Jo (INFP) -> EJ (ISTJ - closest to ESTJ)
  // Harua (ESFJ) -> Fuma (INTJ - closest to INTP)
  // Taki (ENFP) -> Yuma (ISTJ)
  // Maki (ESFP) -> Fuma (INTJ)
  const getLowCompatibilityMember = (memberName: string) => {
    let lowCompatName = '';

    switch (memberName) {
      case 'EJ':
        lowCompatName = 'Nicholas';
        break;
      case 'Fuma':
        lowCompatName = 'Maki';
        break;
      case 'K':
        lowCompatName = 'Yuma';
        break;
      case 'Nicholas':
        lowCompatName = 'EJ';
        break;
      case 'Yuma':
        lowCompatName = 'Taki';
        break;
      case 'Jo':
        lowCompatName = 'EJ';
        break;
      case 'Harua':
        lowCompatName = 'Fuma';
        break;
      case 'Taki':
        lowCompatName = 'Yuma';
        break;
      case 'Maki':
        lowCompatName = 'Fuma';
        break;
      default:
        lowCompatName = 'Maki';
    }

    const matchedProfile = MEMBER_PROFILES.find(p => p.name === lowCompatName) || MEMBER_PROFILES[0];
    return { profile: matchedProfile };
  };

  const mateCandidate = getMateCandidate();
  const lowCompatData = getLowCompatibilityMember(mateCandidate.name);
  const themeStyles = getThemeCardStyles(theme || 'darkMoon');

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 relative shadow-xl font-fredoka ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.textPrimary}`}>
      
      {/* Intro Landing stage */}
      {!isPlaying && !showResult && (
        <div className="text-center py-6 space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 rounded-full border border-pink-500/20 text-pink-500">
            <Heart size={48} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className={`text-3xl font-black tracking-wide ${themeStyles.textHighlight}`}>&mate</h3>
            <p className={`text-sm max-w-md mx-auto leading-relaxed ${themeStyles.textSecondary}`}>
              Find out who in &TEAM is your destined mate!
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
            className={`px-8 py-3.5 rounded-full font-bold text-lg shadow-lg cursor-pointer ${themeStyles.btnAccent}`}
          >
            Start &mate Test (50 Coins)
          </motion.button>
        </div>
      )}

      {/* Active Questioning stage */}
      {isPlaying && !showResult && (
        <div className="space-y-6">
          {/* Progress row */}
          <div className={`flex justify-between items-center text-xs uppercase tracking-widest ${themeStyles.textSecondary}`}>
            <span>QUESTION {currentIdx + 1} OF 12</span>
            <span className={`font-bold ${themeStyles.textHighlight}`}>Matchmaker Active</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${themeStyles.isLight ? 'bg-pink-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
              style={{ width: `${((currentIdx + 1) / 12) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center min-h-[100px] flex items-center justify-center bg-black/5 dark:bg-black/30">
            <h4 className={`text-lg md:text-xl font-black leading-relaxed ${themeStyles.title}`}>
              {MATE_QUESTIONS[currentIdx].question}
            </h4>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {MATE_QUESTIONS[currentIdx].options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOptionSelect(opt.scores)}
                className={`w-full text-left px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-pink-400 dark:hover:border-pink-500 transition-all font-bold text-sm md:text-base leading-relaxed cursor-pointer ${themeStyles.textPrimary}`}
              >
                {opt.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Result Card Layout */}
      {showResult && (
        <div className="space-y-6">
          <div className="text-center border-b border-white/5 pb-4">
            <span className={`text-xs uppercase font-extrabold tracking-widest ${themeStyles.textHighlight}`}>MATCH RESULTS</span>
            <h3 className={`text-2xl font-black ${themeStyles.title}`}>YOUR &MATE SOULPAIR</h3>
          </div>

          {/* Romantic Card Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`border-2 border-pink-500/30 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center text-center shadow-xl shadow-pink-500/5 ${themeStyles.cardBg}`}
          >
            {/* Soft pink celestial light behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-7xl mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-full border border-pink-500/20 shadow-lg animate-pulse">
              {mateCandidate.emoji}
            </div>

            <h4 className={`text-3xl font-black tracking-wide ${themeStyles.textHighlight}`}>{mateCandidate.name}</h4>
            
            <div className="flex gap-2.5 mt-2.5">
              <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${themeStyles.accentBg}`}>
                MBTI: {mateCandidate.mbti}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-wider">
                COGNITIVE MATCH
              </span>
            </div>

            <p className={`mt-4 text-sm max-w-sm italic leading-relaxed ${themeStyles.textPrimary}`}>
              "{mateCandidate.mbtiNotes}"
            </p>

            {/* Compatibility % bar */}
            <div className="w-full max-w-sm space-y-1 mt-5">
              <div className={`flex justify-between text-xs font-bold ${themeStyles.textSecondary}`}>
                <span>COMPATIBILITY RANGE</span>
                <span className={themeStyles.textHighlight}>96.8%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '96.8%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Why you work description */}
            <div className="mt-5 text-left border-t border-slate-200 dark:border-white/5 pt-4 space-y-1">
              <span className={`text-[10px] font-bold uppercase block tracking-wider text-center md:text-left ${themeStyles.textHighlight}`}>Why you work beautifully</span>
              <p className={`text-xs md:text-sm leading-relaxed text-center md:text-left ${themeStyles.textPrimary}`}>
                Your empathetic values align perfectly with {mateCandidate.name}'s character. Since you appreciate creative introspection and support, {mateCandidate.name}'s warm-hearted traits fulfill your needs, building a stable, lovely relationship.
              </p>
            </div>

            {/* Low-compatibility section requested */}
            <div className="w-full mt-6 pt-5 border-t border-slate-200 dark:border-white/5 text-left bg-black/5 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 mb-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Cognitive Opposites</span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-3xl bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 inline-block shrink-0">
                  {lowCompatData.profile.emoji}
                </span>
                <div className="space-y-1">
                  <span className={`text-xs font-bold ${themeStyles.textPrimary}`}>
                    Opposite MBTI Type: <span className="text-yellow-600 dark:text-yellow-400 font-extrabold">{lowCompatData.profile.name}</span> ({lowCompatData.profile.mbti})
                  </span>
                </div>
              </div>

              {/* Unity disclaimer */}
              <p className="text-[10px] text-slate-500 mt-3 text-center border-t border-slate-200 dark:border-white/5 pt-2">
                🌟 Although personalities vary, all 9 &TEAM members possess high cohesion and work as a tight family!
              </p>
            </div>
          </motion.div>

          <div className="text-center pt-2">
            <button
              onClick={startQuiz}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer ${themeStyles.btnAccent}`}
            >
              <RefreshCw size={12} /> Retake Compatibility Test (50 Coins)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound, playSlotRollSound, playJackpotSound } from '../../utils/sound';
import { X, HelpCircle, Sparkles, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';

interface LuckyMoonProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

export default function LuckyMoon({ coins, onUpdateCoins, onExit }: LuckyMoonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [reels, setReels] = useState<string[]>(['🌕', '🌕', '🌕']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (isSpinning) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  // Pool of emojis: 9 member representative emojis + 1 Moon (Jackpot emoji)
  const EMOJI_POOL = ['🍊', '🎮', '👑', '🍓', '🐱', '🍚', '🐥', '🐰', '🐶']; // Members
  const JACKPOT_EMOJI = '🌕';

  const triggerSpin = () => {
    // Free of charge! No fee or coins checks.
    playCoinSound();

    setIsSpinning(true);
    setResultMessage('');
    setRewardAmount(null);
    setIsPlaying(true);

    let tickCount = 0;
    const maxTicks = 25; // Spin duration
    
    // Interval for rotating slot items
    const interval = setInterval(() => {
      tickCount += 1;
      playSlotRollSound(); // Roll tick audio

      // Mix random symbols for reels
      const nextReels = Array.from({ length: 3 }).map(() => {
        // We make the Moon rare. Let's say 12% chance for Moon, 88% shared by other emojis
        const rand = Math.random();
        if (rand < 0.12) {
          return JACKPOT_EMOJI;
        } else {
          return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        }
      });
      setReels(nextReels);

      if (tickCount >= maxTicks) {
        clearInterval(interval);
        evaluateSpinResult();
      }
    }, 100);
  };

  const evaluateSpinResult = () => {
    // Final evaluation after reels stop
    // Let's decide the final reel outcome deterministically to ensure a balanced, authentic experience:
    // We can roll them once more but with a controlled chance
    const randRoll = Math.random();
    let finalReels = ['', '', ''];

    if (randRoll < 0.02) {
      // 2% chance of absolute triple moon jackpot!
      finalReels = [JACKPOT_EMOJI, JACKPOT_EMOJI, JACKPOT_EMOJI];
    } else if (randRoll < 0.15) {
      // 13% chance of 2 moons
      const otherSymbol = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      finalReels = [JACKPOT_EMOJI, JACKPOT_EMOJI, otherSymbol];
      // Shuffle final positions
      finalReels.sort(() => 0.5 - Math.random());
    } else if (randRoll < 0.35) {
      // 20% chance of matching 2 same representative emojis
      const sameSymbol = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      // Ensure third is different and not a moon
      let thirdSymbol = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      while (thirdSymbol === sameSymbol) {
        thirdSymbol = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      }
      finalReels = [sameSymbol, sameSymbol, thirdSymbol].sort(() => 0.5 - Math.random());
    } else {
      // Normal mix with potentially 1 moon or pure different elements
      const hasOneMoon = Math.random() < 0.25;
      if (hasOneMoon) {
        const sym1 = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        let sym2 = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        while (sym2 === sym1) {
          sym2 = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        }
        finalReels = [JACKPOT_EMOJI, sym1, sym2].sort(() => 0.5 - Math.random());
      } else {
        // 3 entirely different symbols
        const shuffledPool = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
        finalReels = [shuffledPool[0], shuffledPool[1], shuffledPool[2]];
      }
    }

    setReels(finalReels);
    setIsSpinning(false);

    // Calculate outcomes
    const moonCount = finalReels.filter(r => r === JACKPOT_EMOJI).length;
    
    // Check match combinations
    let wonAmount = 0;
    let message = '';

    if (moonCount === 3) {
      wonAmount = 10;
      message = '🏆 JACKPOT! 3 MOONS FOUND! Clap your hands!';
      playJackpotSound(); // Clapping + fanfare
    } else if (moonCount === 2) {
      wonAmount = 3;
      message = '🌕🌕 2 MOONS MATCHED! Celebrations!';
      playWinSound();
    } else {
      // Check representative emojis pairs
      const counts: { [key: string]: number } = {};
      finalReels.forEach(r => {
        if (r !== JACKPOT_EMOJI) {
          counts[r] = (counts[r] || 0) + 1;
        }
      });
      
      const maxMatches = Math.max(...Object.values(counts), 0);
      
      if (maxMatches === 2) {
        wonAmount = 1;
        message = '✨ 2 EMOJIS MATCHED! +1 Coin!';
        playWinSound();
      } else if (maxMatches === 3) {
        // rare case
        wonAmount = 5;
        message = '🤩 TRIPLE MATCH! +5 Coins!';
        playWinSound();
      } else {
        // No match
        wonAmount = 0;
        message = '😢 No match. Give the wheel another spin!';
        playFailSound();
      }
    }

    setRewardAmount(wonAmount);
    setResultMessage(message);
    if (wonAmount > 0) {
      onUpdateCoins(wonAmount);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-yellow-400 animate-spin" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Lucky Moon</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExitAttempt} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && !isSpinning && resultMessage === '' && (
        <div className="space-y-6 text-center py-4">
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">🎮 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-1.5 text-xs text-left max-sm mx-auto list-disc pl-5">
              <li>Cost to Spin: <span className="text-emerald-400 font-bold">FREE (0 Coins!)</span></li>
              <li>Jackpot/Lucky Emoji is the <span className="font-semibold text-white">Full Moon 🌕</span>.</li>
              <li>Match Prizes:
                <ul className="list-circle pl-5 pt-1 space-y-0.5 text-slate-400">
                  <li>2 Member Emojis: <span className="text-yellow-400 font-bold">1 coin</span></li>
                  <li>2 Moons: <span className="text-yellow-400 font-bold">3 coins</span></li>
                  <li>3 Moons (Jackpot): <span className="text-yellow-400 font-bold">10 coins</span> (Rare!)</li>
                </ul>
              </li>
            </ul>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              triggerSpin();
            }}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-amber-600 shadow-lg cursor-pointer"
          >
            Spin Now! (Free)
          </motion.button>
        </div>
      )}

      {/* Slots Reels UI */}
      {(!showInstructions || resultMessage !== '') && (
        <div className="space-y-6 text-center py-2">
          
          {/* Reel Frame */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-slate-800 p-6 rounded-3xl shadow-inner relative flex justify-center gap-4">
            
            {/* Spinning decorative frame borders */}
            <div className="absolute inset-x-4 top-2 bottom-2 border border-yellow-500/10 rounded-2xl pointer-events-none" />

            {reels.map((symbol, idx) => (
              <motion.div
                key={idx}
                animate={isSpinning ? { y: [0, -10, 10, 0] } : {}}
                transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }}
                className="w-20 h-24 bg-slate-900 border border-slate-700/60 rounded-2xl flex items-center justify-center text-4xl shadow-lg relative"
              >
                {symbol}
                {/* Visual slot lane line accent */}
                <div className="absolute inset-x-0 h-[1px] bg-white/5 top-1/2" />
              </motion.div>
            ))}
          </div>

          {/* Results readout */}
          {resultMessage !== '' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-4 bg-slate-800/40 rounded-2xl border border-slate-800"
            >
              <p className="text-slate-200 text-sm font-semibold">{resultMessage}</p>
              {rewardAmount !== null && rewardAmount > 0 && (
                <div className="text-yellow-400 font-bold text-lg flex items-center justify-center gap-1">
                  <Trophy size={16} /> Won +{rewardAmount} Coins!
                </div>
              )}
            </motion.div>
          )}

          {/* Spin controls */}
          <div className="flex gap-3 justify-center pt-2">
            <motion.button
              disabled={isSpinning}
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              onClick={triggerSpin}
              className={`flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-amber-600 shadow-lg flex items-center justify-center gap-2 ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} /> Spin Wheel (Free)
            </motion.button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog Overlay */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
              <AlertTriangle size={24} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-white">Exit Active Game?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A spin is currently in progress. Exiting now will lose your current spin session and the 5 entry coins.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  playClickSound();
                  setShowExitConfirm(false);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

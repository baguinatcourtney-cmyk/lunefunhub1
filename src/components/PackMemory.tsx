/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { X, RefreshCw, Brain, Trophy, AlertTriangle, Eye } from 'lucide-react';

interface PackMemoryProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function PackMemory({ coins, onUpdateCoins, onExit }: PackMemoryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (isPlaying && !isFinished) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  // 10 pairs = 20 cards
  const EMOJI_SET = ['🍊', '🎮', '👑', '🍓', '🐱', '🍚', '🐥', '🐰', '🐶', '🐺'];

  const initGame = () => {
    if (coins < 5) {
      alert("You need at least 5 coins to enter this game!");
      return;
    }

    onUpdateCoins(-5);
    playCoinSound();

    // Duplicate emojis to make pairs, then shuffle
    const doubled = [...EMOJI_SET, ...EMOJI_SET];
    const shuffled = doubled
      .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }))
      .sort(() => 0.5 - Math.random());

    setCards(shuffled);
    setSelectedIndices([]);
    setTimeLeft(60);
    setIsFinished(false);
    setIsWon(false);
    setIsPlaying(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    
    if (timeLeft <= 0) {
      // Time is up! Game over.
      setIsFinished(true);
      setIsWon(false);
      playFailSound();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, isFinished]);

  // Handle Card Click
  const handleCardClick = (idx: number) => {
    if (selectedIndices.length >= 2 || cards[idx].isFlipped || cards[idx].isMatched || isFinished) return;

    playClickSound();

    // Flip card
    const updated = [...cards];
    updated[idx].isFlipped = true;
    setCards(updated);

    const newSelection = [...selectedIndices, idx];
    setSelectedIndices(newSelection);

    if (newSelection.length === 2) {
      const [firstIdx, secondIdx] = newSelection;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Matched!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setSelectedIndices([]);

          // Check Win Condition
          const allMatched = matchedCards.every(c => c.isMatched);
          if (allMatched) {
            setIsWon(true);
            setIsFinished(true);
            onUpdateCoins(10); // Reward 10 coins
            playWinSound();
          }
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setSelectedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Header controls */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Brain className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Pack Memory</h2>
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
      {showInstructions && !isPlaying && !isFinished && (
        <div className="space-y-6 text-center py-6">
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-purple-300 mb-3">🎮 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-2 text-sm text-left max-w-md mx-auto list-disc pl-5">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">5 coins</span></li>
              <li>There are <span className="font-semibold text-white">20 face-down cards</span> containing &TEAM emojis and one pair of Wolf emojis.</li>
              <li>You have <span className="text-pink-400 font-bold">1 minute (60 seconds)</span> to find all matching pairs!</li>
              <li>Complete the board before time runs out to earn <span className="text-yellow-400 font-bold">10 coins</span>!</li>
            </ul>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              initGame();
            }}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full font-bold text-lg hover:from-purple-600 hover:to-indigo-600 shadow-lg cursor-pointer"
          >
            Pay 5 Coins & Play!
          </motion.button>
        </div>
      )}

      {/* Active Memory Board */}
      {isPlaying && !isFinished && (
        <div className="space-y-6">
          {/* Progress row */}
          <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-mono ${timeLeft < 15 ? 'text-red-400 animate-pulse font-bold' : 'text-slate-100'}`}>
                ⏱ {timeLeft}s Left
              </span>
            </div>
            <span className="text-purple-400">
              MATCHED: {cards.filter(c => c.isMatched).length / 2} / 10 PAIRS
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${timeLeft < 15 ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {cards.map((card, idx) => {
              const isFlippedOrMatched = card.isFlipped || card.isMatched;
              return (
                <div key={card.id} className="aspect-square relative">
                  <motion.div
                    onClick={() => handleCardClick(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full h-full rounded-2xl cursor-pointer select-none flex items-center justify-center text-3xl transition-all border ${
                      card.isMatched
                        ? 'bg-purple-950/40 border-purple-500/60 text-purple-300 shadow-md shadow-purple-500/10'
                        : isFlippedOrMatched
                        ? 'bg-slate-800 border-purple-500/40 text-white shadow-inner'
                        : 'bg-gradient-to-br from-indigo-950 to-slate-900 border-slate-700 hover:border-purple-400 text-purple-400 shadow-md'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isFlippedOrMatched ? (
                        <motion.span
                          key="front"
                          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {card.emoji}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="back"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                          className="text-xl sm:text-2xl"
                        >
                          🐾
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isFinished && (
        <div className="text-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center p-4 rounded-full border mb-2 ${
              isWon 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {isWon ? <Trophy size={48} className="animate-bounce" /> : <AlertTriangle size={48} />}
          </motion.div>

          <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isWon ? 'from-yellow-300 to-amber-500' : 'from-red-400 to-orange-500'
          }`}>
            {isWon ? '🎉 EXCELLENT WORK! 🎉' : 'OUT OF TIME! 😿'}
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-2">
            {isWon ? (
              <>
                <p className="text-slate-300 text-lg">You matched all cards with <span className="font-bold text-white font-mono">{timeLeft}s</span> remaining!</p>
                <p className="text-emerald-400 text-sm font-semibold">💎 Reward: You earned 10 coins!</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-lg">Your memory ran out of breath!</p>
                <p className="text-slate-400 text-xs">Matching all cards within 60 seconds wins you 10 coins. Give it another shot!</p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw size={16} /> Play Again (5 Coins)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExitAttempt}
              className="px-6 py-3.5 bg-slate-800 border border-slate-700 rounded-full font-bold text-sm hover:bg-slate-700 transition-all cursor-pointer"
            >
              Back to Game Hub
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
                You are in the middle of a memory matching game. Exiting now will lose your current progress and the 5 entry coins.
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

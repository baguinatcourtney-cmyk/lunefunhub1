/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { X, RefreshCw, Image as ImageIcon, Trophy, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';

import easyMoonImg from '../../assets/images/puzzle_easy_moon_1783408135679.jpg';
import medPackImg from '../../assets/images/puzzle_med_pack_1783408151786.jpg';
import hardForestImg from '../../assets/images/puzzle_hard_forest_1783408162327.jpg';

interface WolfPuzzleProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

interface PuzzlePiece {
  id: number; // original position index (0 to count-1)
  currentPos: number; // current position index (0 to count-1)
}

type Difficulty = 'easy' | 'medium' | 'hard';

export default function WolfPuzzle({ coins, onUpdateCoins, onExit }: WolfPuzzleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
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

  // Get photo dynamically based on chosen difficulty
  const getPhotoForDifficulty = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return {
          name: "Full Moon with Stars",
          url: easyMoonImg
        };
      case 'medium':
        return {
          name: "Wolf Pack",
          url: medPackImg
        };
      case 'hard':
        return {
          name: "Forest",
          url: hardForestImg
        };
    }
  };

  const currentPhoto = getPhotoForDifficulty(difficulty);

  const getDifficultySettings = (diff: Difficulty) => {
    switch (diff) {
      case 'medium': return { cols: 4, rows: 4, count: 16, reward: 10, label: '16 PIECES (Medium)' };
      case 'hard': return { cols: 4, rows: 6, count: 24, reward: 15, label: '24 PIECES (Hard)' };
      case 'easy':
      default: return { cols: 4, rows: 3, count: 12, reward: 7, label: '12 PIECES (Easy)' };
    }
  };

  const currentSettings = getDifficultySettings(difficulty);

  // Initialize Puzzle
  const initPuzzle = () => {
    if (coins < 5) {
      alert("You need at least 5 coins to enter this game!");
      return;
    }

    onUpdateCoins(-5);
    playCoinSound();

    const { count } = currentSettings;

    // Create pieces
    let initialPieces: PuzzlePiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      currentPos: i
    }));

    // Shuffle pieces until it is not solved
    let isSolved = true;
    while (isSolved) {
      initialPieces = [...initialPieces].sort(() => 0.5 - Math.random());
      // Re-assign currentPos to indices
      initialPieces = initialPieces.map((piece, idx) => ({
        ...piece,
        currentPos: idx
      }));
      // Check if shuffled state is solved
      isSolved = initialPieces.every(p => p.id === p.currentPos);
    }

    setPieces(initialPieces);
    setSelectedPieceId(null);
    setTimeLeft(120);
    setIsFinished(false);
    setIsWon(false);
    setIsPlaying(true);
  };

  // Timer Tick
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    if (timeLeft <= 0) {
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

  // Handle Piece Click (Swap Mechanic)
  const handlePieceClick = (pieceId: number) => {
    if (isFinished) return;
    playClickSound();

    if (selectedPieceId === null) {
      setSelectedPieceId(pieceId);
    } else {
      if (selectedPieceId === pieceId) {
        // Deselect
        setSelectedPieceId(null);
        return;
      }

      // Swap position of selectedPieceId and pieceId
      const firstPiece = pieces.find(p => p.id === selectedPieceId);
      const secondPiece = pieces.find(p => p.id === pieceId);

      if (firstPiece && secondPiece) {
        const tempPos = firstPiece.currentPos;
        
        const updated = pieces.map(p => {
          if (p.id === selectedPieceId) {
            return { ...p, currentPos: secondPiece.currentPos };
          }
          if (p.id === pieceId) {
            return { ...p, currentPos: tempPos };
          }
          return p;
        });

        // Sort by currentPos so they display in order in the grid
        const sorted = [...updated].sort((a, b) => a.currentPos - b.currentPos);
        setPieces(sorted);
        setSelectedPieceId(null);

        // Check if solved (all pieces at their correct ID)
        const allCorrect = sorted.every(p => p.id === p.currentPos);
        if (allCorrect) {
          setIsFinished(true);
          setIsWon(true);
          onUpdateCoins(currentSettings.reward);
          playWinSound();
        }
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <ImageIcon className="text-pink-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Wolf Puzzle</h2>
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
        <div className="space-y-6 text-center py-4">
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 space-y-4">
            <h3 className="text-xl font-bold text-pink-300">🐺 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-2 text-sm text-left max-w-md mx-auto list-disc pl-5">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">5 coins</span></li>
              <li>A mysterious <span className="font-semibold text-white">Wolf Concept Art</span> is divided into shuffled tiles.</li>
              <li>Click two pieces in sequence to <span className="font-semibold text-pink-300">swap their positions</span>!</li>
              <li>Complete the puzzle within <span className="text-pink-400 font-bold">2 minutes</span> to win major coin rewards!</li>
            </ul>

            {/* Select Difficulty */}
            <div className="pt-2 text-left space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">CHOOSE DIFFICULTY LEVEL:</label>
              <div className="flex gap-2 justify-center">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                  const s = getDifficultySettings(diff);
                  const isSel = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        playClickSound();
                        setDifficulty(diff);
                      }}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        isSel
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300 scale-105 shadow-md'
                          : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 text-slate-400'
                      }`}
                    >
                      <div className="capitalize">{diff}</div>
                      <div className="text-[10px] text-yellow-400/90 font-semibold">{s.count} Pcs (+{s.reward} 🪙)</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              initPuzzle();
            }}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-indigo-600 shadow-lg cursor-pointer"
          >
            Pay 5 Coins & Shuffle!
          </motion.button>
        </div>
      )}

      {/* Active Puzzle Screen */}
      {isPlaying && !isFinished && (
        <div className="space-y-4 flex flex-col items-center">
          <div className="flex justify-between w-full text-sm font-semibold text-slate-300 px-2 max-w-[400px]">
            <span className={`text-base font-mono ${timeLeft < 20 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200'}`}>
              ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} Left
            </span>
            <span className="text-pink-400 uppercase tracking-wider font-bold">{currentSettings.label}</span>
          </div>

          {/* Puzzle board wrapper */}
          <div 
            className="relative w-full max-w-[400px] border-4 border-slate-700 rounded-2xl overflow-hidden bg-slate-950 shadow-inner select-none"
            style={{
              aspectRatio: `${currentSettings.cols} / ${currentSettings.rows}`
            }}
          >
            {/* Grid of pieces */}
            <div 
              className="grid w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${currentSettings.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${currentSettings.rows}, minmax(0, 1fr))`
              }}
            >
              {pieces.map((piece) => {
                const isSelected = selectedPieceId === piece.id;
                
                // Coordinates of original position for background-position slicing
                const origCol = piece.id % currentSettings.cols;
                const origRow = Math.floor(piece.id / currentSettings.cols);
                
                const bgX = (origCol * 100) / (currentSettings.cols - 1);
                const bgY = (origRow * 100) / (currentSettings.rows - 1);

                return (
                  <motion.div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    whileHover={{ scale: 0.98 }}
                    className={`relative w-full h-full border border-slate-950/40 cursor-pointer overflow-hidden transition-all ${
                      isSelected ? 'ring-4 ring-pink-500 ring-inset z-10 scale-95 shadow-lg' : ''
                    }`}
                  >
                    <img 
                      src={currentPhoto.url} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="absolute max-w-none pointer-events-none"
                      style={{
                        width: `${currentSettings.cols * 100}%`,
                        height: `${currentSettings.rows * 100}%`,
                        left: `-${origCol * 100}%`,
                        top: `-${origRow * 100}%`,
                      }}
                    />
                    {/* Tiny watermark number index for subtle helper hint */}
                    <div className="absolute bottom-1 right-1 text-[8px] bg-black/40 text-white/50 px-1 rounded font-mono">
                      {piece.id + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">Click a tile, then click another to swap them!</p>
        </div>
      )}

      {/* Finished State */}
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
            {isWon ? <Trophy size={48} className="animate-bounce" /> : <AlertCircle size={48} />}
          </motion.div>

          <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isWon ? 'from-yellow-300 to-amber-500' : 'from-red-400 to-rose-500'
          }`}>
            {isWon ? '🎉 PUZZLE SOLVED! 🎉' : 'OUT OF TIME!'}
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-2">
            {isWon ? (
              <>
                <p className="text-slate-300 text-base">Fantastic! You completed the <span className="font-bold text-pink-300 capitalize">{difficulty}</span> puzzle!</p>
                <p className="text-emerald-400 text-sm font-semibold">💎 Reward: You won {currentSettings.reward} coins!</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-base">You ran out of puzzle seconds!</p>
                <p className="text-slate-400 text-xs">Completing the {difficulty} puzzle within 2 minutes wins you {currentSettings.reward} coins. Try again!</p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initPuzzle}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw size={16} /> Shuffle & Play Again (5 Coins)
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
                You are currently in the middle of solving the puzzle. Exiting now will lose your current progress and the 5 entry coins.
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

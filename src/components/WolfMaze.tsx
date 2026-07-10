/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound, playMazeFinishSound } from '../../utils/sound';
import { X, RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, AlertTriangle } from 'lucide-react';

interface WolfMazeProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

interface MazeLevel {
  name: string;
  rows: number;
  cols: number;
  reward: number;
  timeLimit: number;
  fee: number;
}

const LEVELS: MazeLevel[] = [
  { name: 'Easy', rows: 12, cols: 8, reward: 7, timeLimit: 30, fee: 5 },
  { name: 'Medium', rows: 15, cols: 10, reward: 10, timeLimit: 45, fee: 5 },
  { name: 'Hard', rows: 20, cols: 20, reward: 15, timeLimit: 75, fee: 5 },
  { name: 'Very Hard', rows: 30, cols: 32, reward: 20, timeLimit: 120, fee: 5 }
];

// Helper to generate a perfect maze of arbitrary size using iterative DFS backtracking
function generateMazeGrid(rows: number, cols: number): number[][] {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(1));
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  // Start from (0,0)
  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;
  grid[0][0] = 0;

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    
    const neighbors: [number, number, number, number][] = []; // [nr, nc, intermediate_r, intermediate_c]
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (const [dr, dc] of dirs) {
      const nr = r + dr * 2;
      const nc = c + dc * 2;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        neighbors.push([nr, nc, r + dr, c + dc]);
      }
    }

    if (neighbors.length > 0) {
      const [nr, nc, ir, ic] = neighbors[Math.floor(Math.random() * neighbors.length)];
      visited[nr][nc] = true;
      grid[ir][ic] = 0;
      grid[nr][nc] = 0;
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Set the Goal (3) at bottom-rightregion
  let goalR = rows - 1;
  let goalC = cols - 1;
  let found = false;
  for (let d = 0; d < Math.max(rows, cols); d++) {
    for (let i = 0; i <= d; i++) {
      const r = rows - 1 - i;
      const c = cols - 1 - (d - i);
      if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 0 && !(r === 0 && c === 0)) {
        goalR = r;
        goalC = c;
        found = true;
        break;
      }
    }
    if (found) break;
  }
  grid[goalR][goalC] = 3;

  return grid;
}

export default function WolfMaze({ coins, onUpdateCoins, onExit }: WolfMazeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [mazeGrid, setMazeGrid] = useState<number[][] | null>(null);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
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

  const activeLevel = LEVELS[currentLevelIdx];

  const startMazeGame = () => {
    if (coins < activeLevel.fee) {
      alert(`You need at least ${activeLevel.fee} coins to start the ${activeLevel.name} maze!`);
      return;
    }

    onUpdateCoins(-activeLevel.fee);
    playCoinSound();

    // Generate fresh maze
    const freshMaze = generateMazeGrid(activeLevel.rows, activeLevel.cols);
    setMazeGrid(freshMaze);
    setPlayerPos({ r: 0, c: 0 });
    setTimeLeft(activeLevel.timeLimit);
    setIsFinished(false);
    setIsWon(false);
    setIsPlaying(true);
  };

  // Timer countdown
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

  // Handle player motion checks
  const movePlayer = (dr: number, dc: number) => {
    if (!isPlaying || isFinished || !mazeGrid) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;

    // Bounds check
    if (newR >= 0 && newR < activeLevel.rows && newC >= 0 && newC < activeLevel.cols) {
      const tile = mazeGrid[newR][newC];
      if (tile !== 1) {
        setPlayerPos({ r: newR, c: newC });
        playClickSound();

        // Check Goal
        if (tile === 3) {
          setIsFinished(true);
          setIsWon(true);
          onUpdateCoins(activeLevel.reward);
          playMazeFinishSound();
        }
      }
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isFinished) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFinished, playerPos, mazeGrid]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-5 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Compass className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Wolf Maze</h2>
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
            <h3 className="text-lg font-bold text-yellow-300">🎮 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-2 text-xs text-left max-w-md mx-auto list-disc pl-5">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">{activeLevel.fee} coins</span></li>
              <li>A cute wolf emoji <span className="font-semibold text-white">🐺</span> must traverse the maze corridors.</li>
              <li>Use the <span className="text-pink-400 font-bold">Keypad below</span> or your <span className="text-pink-400 font-bold">Keyboard Arrow Keys</span> to move!</li>
              <li>Reach the golden full moon <span className="text-yellow-400 font-bold">🌕</span> before the timer expires!</li>
              <li>Higher difficulties feature larger grids and yield <span className="text-yellow-400 font-bold">much larger coin rewards</span>!</li>
            </ul>

            {/* Level Selector */}
            <div className="pt-2 text-left space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">SELECT DIFFICULTY:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-center">
                {LEVELS.map((lvl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setCurrentLevelIdx(idx);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      currentLevelIdx === idx
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300 scale-105'
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 text-slate-400'
                    }`}
                  >
                    <span>{lvl.name}</span>
                    <span className="text-[10px] font-mono opacity-80">({lvl.rows}x{lvl.cols})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setShowInstructions(false);
              startMazeGame();
            }}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-amber-600 shadow-lg cursor-pointer"
          >
            Pay {activeLevel.fee} Coins & Play!
          </motion.button>
        </div>
      )}

      {/* Active maze board */}
      {isPlaying && !isFinished && mazeGrid && (
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Progress indicators */}
          <div className="flex justify-between w-full text-sm font-semibold text-slate-300 px-2 max-w-lg">
            <span className={`text-base font-mono ${timeLeft < 10 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-100'}`}>
              ⏱ {timeLeft}s Left
            </span>
            <span className="text-slate-400 font-semibold">DIFFICULTY: <span className="text-yellow-300 uppercase">{activeLevel.name}</span></span>
            <span className="text-yellow-400 font-bold">REWARD: {activeLevel.reward} Coins</span>
          </div>

          {/* Grid Layout (dynamic columns) */}
          <div 
            className="grid border-4 border-slate-800 bg-slate-950 rounded-2xl p-1.5 shadow-inner w-full overflow-auto max-h-[60vh] max-w-lg"
            style={{ 
              gridTemplateColumns: `repeat(${activeLevel.cols}, minmax(0, 1fr))`,
            }}
          >
            {mazeGrid.map((row, rIdx) => 
              row.map((tile, cIdx) => {
                const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                
                let tileColor = "bg-slate-950"; // path
                let element = null;

                if (tile === 1) {
                  tileColor = "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750/30 rounded"; // wall
                } else if (tile === 3) {
                  tileColor = "bg-yellow-500/5 flex items-center justify-center animate-pulse";
                  element = <span className="text-sm md:text-base">🌕</span>; // Goal moon
                }

                if (isPlayer) {
                  element = <span className="text-sm md:text-base drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]">🐺</span>; // player
                }

                return (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square w-full min-w-[12px] flex items-center justify-center transition-all ${tileColor}`}
                  >
                    {element}
                  </div>
                );
              })
            )}
          </div>

          {/* On-Screen Keypad for Mobile and accessibility */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => movePlayer(-1, 0)}
              className="w-12 h-12 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer shadow-md text-slate-200"
            >
              <ArrowUp size={24} />
            </motion.button>
            <div className="flex gap-4">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer(0, -1)}
                className="w-12 h-12 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer shadow-md text-slate-200"
              >
                <ArrowLeft size={24} />
              </motion.button>
              <div className="w-12" /> {/* empty gap space */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => movePlayer(0, 1)}
                className="w-12 h-12 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer shadow-md text-slate-200"
              >
                <ArrowRight size={24} />
              </motion.button>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => movePlayer(1, 0)}
              className="w-12 h-12 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer shadow-md text-slate-200"
            >
              <ArrowDown size={24} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Game finished screen */}
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
            {isWon ? <Trophy size={48} className="animate-bounce" /> : <X size={48} />}
          </motion.div>

          <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isWon ? 'from-yellow-300 to-amber-500' : 'from-red-400 to-rose-500'
          }`}>
            {isWon ? '🎉 MAZE SOLVED! 🎉' : 'OUT OF TIME!'}
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-md mx-auto border border-slate-700/50 space-y-2">
            {isWon ? (
              <>
                <p className="text-slate-300 text-base">Incredible! The Wolf successfully solved the {activeLevel.name} maze and found the Full Moon!</p>
                <p className="text-emerald-400 text-lg font-bold">💎 Reward: You won {activeLevel.reward} coins!</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-base">Your wolf got lost in the dark {activeLevel.name} maze corridors!</p>
                <p className="text-slate-400 text-xs">Reach the moon goal within {activeLevel.timeLimit} seconds to earn rewards. Try again!</p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startMazeGame}
              className="px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw size={16} /> Retry Maze ({activeLevel.fee} Coins)
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
                You are currently in the middle of navigating the maze. Exiting now will lose your current session and the {activeLevel.fee} entry coins.
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

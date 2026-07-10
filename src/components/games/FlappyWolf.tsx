/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MEMBER_PROFILES } from '../../data';
import { playClickSound, playCoinSound, playWinSound, playFailSound, playJumpSound } from '../../utils/sound';
import { X, RefreshCw, Trophy, Gamepad2, AlertTriangle } from 'lucide-react';

interface FlappyWolfProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

export default function FlappyWolf({ coins, onUpdateCoins, onExit }: FlappyWolfProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState('🍊'); // EJ by default
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (isPlaying && !isGameOver) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // States for the physics loop
  const gameStateRef = useRef({
    wolfY: 150,
    velocity: 0,
    gravity: 0.25,
    jumpStrength: -5.5,
    obstacles: [] as { x: number; topHeight: number; bottomHeight: number; passed: boolean; count: number }[],
    stars: [] as { x: number; y: number; collected: boolean; index: number }[],
    frame: 0,
    score: 0,
    coinsEarned: 0,
    obstacleCount: 0,
    speed: 2,
    gap: 130,
  });

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('flappy_wolf_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Jump Action Handler
  const handleJump = () => {
    if (!isPlaying || isGameOver) return;
    playJumpSound();
    gameStateRef.current.velocity = gameStateRef.current.jumpStrength;
  };

  // Setup Keyboard Listeners for jumping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Start / Init game
  const startGame = () => {
    if (coins < 5) {
      alert("You need at least 5 coins to enter this game!");
      return;
    }

    onUpdateCoins(-5);
    playCoinSound();

    // Reset loop variables
    gameStateRef.current = {
      wolfY: 150,
      velocity: 0,
      gravity: 0.25,
      jumpStrength: -5.5,
      obstacles: [],
      stars: [],
      frame: 0,
      score: 0,
      coinsEarned: 0,
      obstacleCount: 0,
      speed: 2,
      gap: 130,
    };

    setCurrentScore(0);
    setEarnedCoins(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Game Render and Physics Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed dimensions
    canvas.width = 400;
    canvas.height = 400;

    const loop = () => {
      const state = gameStateRef.current;
      state.frame += 1;

      // 1. Physics update
      state.velocity += state.gravity;
      state.wolfY += state.velocity;

      // Bound checks
      if (state.wolfY < 0) state.wolfY = 0;
      if (state.wolfY > canvas.height - 30) {
        // Hit ground! Game over.
        triggerGameOver();
        return;
      }

      // 2. Obstacle generation
      if (state.frame % 120 === 0 || state.obstacles.length === 0) {
        state.obstacleCount += 1;
        const minHeight = 40;
        const maxHeight = canvas.height - state.gap - minHeight;
        const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
        const bottomHeight = canvas.height - topHeight - state.gap;
        
        state.obstacles.push({
          x: canvas.width,
          topHeight,
          bottomHeight,
          passed: false,
          count: state.obstacleCount,
        });

        // Add a bonus star on every 5th obstacle inside the gap!
        if (state.obstacleCount % 5 === 0) {
          state.stars.push({
            x: canvas.width + 15, // center it in the obstacle
            y: topHeight + state.gap / 2,
            collected: false,
            index: state.obstacleCount,
          });
        }
      }

      // Move and check obstacles
      state.obstacles.forEach((obs) => {
        obs.x -= state.speed;

        // Check crash
        const wolfBox = { x: 50, y: state.wolfY, size: 24 };
        
        // Top pipe collision
        if (
          wolfBox.x + wolfBox.size > obs.x &&
          wolfBox.x < obs.x + 40 &&
          wolfBox.y < obs.topHeight
        ) {
          triggerGameOver();
        }

        // Bottom pipe collision
        if (
          wolfBox.x + wolfBox.size > obs.x &&
          wolfBox.x < obs.x + 40 &&
          wolfBox.y + wolfBox.size > canvas.height - obs.bottomHeight
        ) {
          triggerGameOver();
        }

        // Pass obstacle score and normal reward
        if (!obs.passed && obs.x + 40 < wolfBox.x) {
          obs.passed = true;
          state.score += 1;
          state.coinsEarned += 1; // 1 coin per obstacle
          onUpdateCoins(1); // Real-time credit
          playCoinSound();
          
          setCurrentScore(state.score);
          setEarnedCoins(state.coinsEarned);
        }
      });

      // Move and check stars
      state.stars.forEach((star) => {
        star.x -= state.speed;

        // Collect Star Collision
        const dist = Math.hypot(star.x - (50 + 12), star.y - (state.wolfY + 12));
        if (!star.collected && dist < 22) {
          star.collected = true;
          state.coinsEarned += 1; // 1 extra coin (1 Star = 1 Coin + 1 Coin obstacle pass = 2 coins total)
          onUpdateCoins(1);
          playWinSound(); // Star collect chime!
          setEarnedCoins(state.coinsEarned);
        }
      });

      // Filter out offscreen elements
      state.obstacles = state.obstacles.filter((obs) => obs.x > -50);
      state.stars = state.stars.filter((star) => star.x > -50);

      // 3. Clear and Draw Screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry space background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Render cute mini background clouds/stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 15; i++) {
        const xCoord = (10 + (i * 45) - (state.frame * 0.2)) % canvas.width;
        ctx.fillRect(xCoord, (50 + (i * 25)) % canvas.height, 2, 2);
      }

      // Draw obstacles (Pipes)
      state.obstacles.forEach((obs) => {
        // Gradient color for pipes matching themes
        const grad = ctx.createLinearGradient(obs.x, 0, obs.x + 40, 0);
        grad.addColorStop(0, '#ec4899'); // pink accent
        grad.addColorStop(1, '#8b5cf6'); // violet accent
        ctx.fillStyle = grad;

        // Top Pipe
        ctx.fillRect(obs.x, 0, 40, obs.topHeight);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(obs.x - 2, obs.topHeight - 12, 44, 12);

        // Bottom Pipe
        ctx.fillStyle = grad;
        ctx.fillRect(obs.x, canvas.height - obs.bottomHeight, 40, obs.bottomHeight);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(obs.x - 2, canvas.height - obs.bottomHeight, 44, 12);
      });

      // Draw stars
      state.stars.forEach((star) => {
        if (!star.collected) {
          ctx.font = '16px serif';
          ctx.fillText('⭐', star.x - 8, star.y + 6);
        }
      });

      // Draw Flying Wolf Emoji
      ctx.font = '28px serif';
      ctx.fillText(selectedAvatar, 50, state.wolfY + 22);

      // Continue Loop
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, selectedAvatar]);

  const triggerGameOver = () => {
    setIsGameOver(true);
    playFailSound();
    
    // Check High Score
    const finalScore = gameStateRef.current.score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('flappy_wolf_high_score', String(finalScore));
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    playClickSound();
    setSelectedAvatar(emoji);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="text-pink-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Flappy Wolf</h2>
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

      {/* Instructions page with Avatar Selection */}
      {showInstructions && !isPlaying && !isGameOver && (
        <div className="space-y-6 text-center py-4">
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-bold text-pink-300 mb-2">🎮 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-1.5 text-xs text-left max-w-md mx-auto list-disc pl-5">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">5 coins</span></li>
              <li>Tap/Click or press <span className="text-white font-bold">SPACE / ArrowUp</span> to flap!</li>
              <li>Pass obstacles to earn <span className="text-yellow-400 font-bold">1 coin</span> each.</li>
              <li>Every 5th obstacle has a <span className="text-amber-300 font-bold">Bonus Star ⭐</span> (yields <span className="text-yellow-400 font-bold">2 coins total</span>)!</li>
            </ul>
          </div>

          {/* High Score Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950/40 border border-slate-800 rounded-full text-sm font-bold text-yellow-400">
            <Trophy size={16} className="text-yellow-400 animate-pulse" />
            <span>YOUR BEST FLIGHT: {highScore} OBSTACLES</span>
          </div>

          {/* Avatar selector */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Select Flying Avatar:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {MEMBER_PROFILES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleAvatarSelect(p.emoji)}
                  className={`p-2.5 rounded-xl border text-xl transition-all ${
                    selectedAvatar === p.emoji
                      ? 'bg-pink-500/20 border-pink-500 scale-110 shadow-md'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                  }`}
                  title={p.name}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              startGame();
            }}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 shadow-lg cursor-pointer"
          >
            Pay 5 Coins & Fly!
          </motion.button>
        </div>
      )}

      {/* Active Game Stage */}
      {isPlaying && !isGameOver && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-between w-full text-sm font-bold text-slate-300 px-2">
            <span className="flex items-center gap-1">🏆 BEST: <span className="text-yellow-400">{highScore}</span></span>
            <span className="text-pink-400 font-mono text-base">SCORE: {currentScore}</span>
            <span className="flex items-center gap-1">🪙 GAINED: <span className="text-emerald-400">{earnedCoins}</span></span>
          </div>

          {/* Interactive Game Canvas */}
          <div 
            onClick={handleJump}
            className="relative border-4 border-slate-700 rounded-3xl overflow-hidden cursor-pointer w-full max-w-[400px] aspect-square"
          >
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/40 px-3 py-1 rounded-full uppercase tracking-wider">Tap anywhere or Space to Fly</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="text-center py-6 space-y-5">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-400 animate-bounce">
            💀
          </div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            GAME OVER!
          </h3>

          <div className="bg-slate-800/50 p-5 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-2">
            <p className="text-slate-300 text-base">Your score: <span className="font-bold text-white text-xl">{currentScore}</span></p>
            <p className="text-slate-300 text-base">Coins gained: <span className="font-bold text-emerald-400 text-xl">+{earnedCoins} 🪙</span></p>
            <p className="text-slate-400 text-xs">Best flight: <span className="text-yellow-400 font-bold">{highScore}</span></p>
          </div>

          {/* Select Avatar before retry */}
          <div className="space-y-2 max-w-sm mx-auto text-left">
            <label className="text-xs font-semibold text-slate-400 block text-center">Want to change your flying character?</label>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {MEMBER_PROFILES.slice(0, 9).map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleAvatarSelect(p.emoji)}
                  className={`p-2 rounded-xl border text-lg transition-all ${
                    selectedAvatar === p.emoji
                      ? 'bg-pink-500/20 border-pink-500 scale-105'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw size={16} /> Fly Again (5 Coins)
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
                You are in the middle of an active game. Exiting now will lose your current score and the 5 entry coins.
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

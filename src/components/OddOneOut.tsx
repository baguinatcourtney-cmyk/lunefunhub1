/**
 * Odd One Out - Vanilla JS Mini-Game
 * Theme: Wolf & Moon
 * 
 * This game is written in pure vanilla JavaScript and basic functional CSS.
 * For integration purposes, it is mounted inside a standard React wrapper.
 */

import React, { useEffect, useRef } from 'react';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { Eye, X } from 'lucide-react';

import { getThemeCardStyles } from '../../utils/theme';

interface OddOneOutProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
  theme?: string;
}

// In-memory variable for Best Score that resets on page reload (no localStorage)
let oddOneOutBestScore = 0;

export default function OddOneOut({ coins, onUpdateCoins, onExit, theme }: OddOneOutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const coinsRef = useRef(coins);
  const onUpdateCoinsRef = useRef(onUpdateCoins);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    coinsRef.current = coins;
    onUpdateCoinsRef.current = onUpdateCoins;
    onExitRef.current = onExit;
  }, [coins, onUpdateCoins, onExit]);

  useEffect(() => {
    if (!containerRef.current) return;

    const themeStyles = getThemeCardStyles(theme || 'darkMoon');
    const isLight = themeStyles.isLight;

    // --- GAME CONSTANTS & CONFIGURABLE VARIABLES (EASY TO EDIT) ---
    const STARTING_TIMER = 6.0;         // Starting time limit per round in seconds
    const TIMER_DECREASE_RATE = 0.2;     // Seconds subtracted from the timer each round
    const MIN_TIMER = 2.5;              // Minimum allowed time limit in seconds
    const BASE_ICONS = ['🐺', '🌕', '🐾', '🌙', '⭐']; // Base symbols rotated through
    const MAX_COINS_PER_GAME = 20;       // Maximum coins a player can win in one game
    const ENTRY_FEE = 5;                // Entry fee in coins

    // --- GAME STATE ---
    let currentRound = 1;
    let roundsSurvived = 0;
    let timeLeft = STARTING_TIMER;
    let timerInterval: any = null;
    let gameActive = false;
    let difficultyMultiplier = 1.0; // Grows each round to scale down difference intensity
    let currentIcon = '🐺';
    let oddTileIndex = -1;

    // --- PLACEHOLDER FUNCTIONS / HOOKS ---
    function hasEnoughCoins(fee: number): boolean {
      // Bridging to React state
      return coinsRef.current >= fee;
    }

    function deductCoins(fee: number) {
      // Bridging to React state
      onUpdateCoinsRef.current(-fee);
      playCoinSound();
    }

    function awardCoins(amount: number) {
      // Bridging to React state
      onUpdateCoinsRef.current(amount);
      playWinSound();
    }

    function goToGamesMenu() {
      // Bridging to React state
      playClickSound();
      onExitRef.current();
    }

    // --- DOM BUILDER ---
    const root = containerRef.current;
    root.innerHTML = '';

    // Create stylesheet for basic functional styling
    const style = document.createElement('style');
    style.innerHTML = `
      .odd-game-container {
        font-family: inherit;
        color: #fff;
        max-width: 480px;
        margin: 0 auto;
        padding: 0px;
        background-color: transparent;
        text-align: center;
      }
      .odd-screen {
        display: none;
      }
      .odd-screen.active {
        display: block;
      }
      .odd-instructions {
        font-size: 14px;
        line-height: 1.5;
        color: #94a3b8;
        margin-bottom: 20px;
      }
      .odd-stats {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 15px;
        font-size: 14px;
        color: #cbd5e1;
      }
      .odd-progress-bar {
        width: 100%;
        height: 8px;
        background-color: rgba(30, 41, 59, 0.4);
        border-radius: 9999px;
        overflow: hidden;
        margin-bottom: 20px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .odd-progress-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(to right, #ec4899, #8b5cf6);
        transition: width 0.1s linear;
      }
      .odd-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
      }
      .odd-tile {
        aspect-ratio: 1;
        background-color: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(30, 41, 59, 0.4)'};
        border: 2px solid ${isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(71, 85, 105, 0.5)'};
        border-radius: 16px;
        font-size: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s;
      }
      .odd-tile:hover {
        background-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(51, 65, 85, 0.6)'};
        border-color: ${isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(148, 163, 184, 0.8)'};
        transform: scale(1.05);
      }
      .odd-tile.correct-flash {
        background-color: #10b981 !important;
        border-color: #34d399 !important;
      }
      .odd-btn {
        background: linear-gradient(to right, #ec4899, #6366f1);
        color: #fff;
        border: none;
        border-radius: 9999px;
        padding: 12px 32px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        margin: 8px;
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
        font-family: inherit;
      }
      .odd-btn:hover {
        transform: scale(1.03);
        box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
      }
      .odd-btn:active {
        transform: scale(0.98);
      }
      .odd-btn-secondary {
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        box-shadow: none;
      }
      .odd-btn-secondary:hover {
        background: rgba(51, 65, 85, 0.8);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: none;
      }
    `;
    root.appendChild(style);

    // Main structural div
    const wrapper = document.createElement('div');
    wrapper.className = 'odd-game-container';
    root.appendChild(wrapper);

    // --- SCREEN 1: START SCREEN ---
    const startScreen = document.createElement('div');
    startScreen.className = 'odd-screen active';
    startScreen.innerHTML = `
      <div class="rounded-2xl p-6 mb-6 text-left border ${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-200'}">
        <h3 class="text-base font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-pink-600' : 'text-pink-400'} uppercase tracking-wider">🎮 GAME MECHANICS</h3>
        <ul class="text-xs md:text-sm leading-relaxed list-disc pl-5 ${isLight ? 'text-slate-600' : 'text-slate-400'} space-y-2">
          <li>Entry Fee: <strong class="text-amber-500 font-bold">${ENTRY_FEE} Coins</strong></li>
          <li>Find the subtly different icon in the <strong class="${isLight ? 'text-slate-900' : 'text-white'}">3x3 grid</strong> before the timer runs out.</li>
          <li>The odd tile might be a slightly different size, color, rotated, or mirrored.</li>
          <li>Reward: <strong class="text-amber-500 font-bold">1 Coin</strong> per round survived (up to <strong class="${isLight ? 'text-slate-900' : 'text-white'}">${MAX_COINS_PER_GAME} max</strong>).</li>
        </ul>
      </div>
      <div id="start-best-score" style="margin-bottom: 24px; font-weight: bold; color: #fbbf24; font-size: 15px;"></div>
      <button class="odd-btn cursor-pointer" id="odd-start-btn">Pay ${ENTRY_FEE} Coins & Play</button>
    `;
    wrapper.appendChild(startScreen);

    // --- SCREEN 2: GAME SCREEN ---
    const gameScreen = document.createElement('div');
    gameScreen.className = 'odd-screen';
    gameScreen.innerHTML = `
      <div class="odd-stats ${isLight ? 'text-slate-700' : 'text-slate-300'}">
        <div>ROUND: <span id="odd-round-num" style="color: #f472b6;">1</span></div>
        <div>BEST: <span id="odd-best-num" style="color: #fbbf24;">0</span></div>
      </div>
      <div class="odd-progress-bar">
        <div class="odd-progress-fill" id="odd-timer-fill"></div>
      </div>
      <div class="odd-grid" id="odd-grid"></div>
    `;
    wrapper.appendChild(gameScreen);

    // --- SCREEN 3: GAME OVER SCREEN ---
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'odd-screen';
    gameOverScreen.innerHTML = `
      <div class="rounded-2xl p-6 mb-6 text-center border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-500/5 border-red-500/20'}">
        <h2 class="text-xl md:text-2xl font-black text-red-500 mb-3">☠️ GAME OVER ☠️</h2>
        <p class="text-xs md:text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}" id="odd-game-over-text"></p>
      </div>
      <button class="odd-btn cursor-pointer" id="odd-restart-btn">Play Again (${ENTRY_FEE} Coins)</button>
    `;
    wrapper.appendChild(gameOverScreen);

    // Update best scores on UI
    function updateBestScoreUI() {
      const startBest = document.getElementById('start-best-score');
      if (startBest) startBest.innerText = `YOUR BEST SCORE: ${oddOneOutBestScore} ROUNDS`;
      const gameBest = document.getElementById('odd-best-num');
      if (gameBest) gameBest.innerText = String(oddOneOutBestScore);
    }
    updateBestScoreUI();

    // Wire up start buttons
    const startBtn = document.getElementById('odd-start-btn');
    startBtn?.addEventListener('click', () => {
      if (!hasEnoughCoins(ENTRY_FEE)) {
        alert("You need at least 5 coins to enter Odd One Out!");
        return;
      }
      deductCoins(ENTRY_FEE);
      initNewGame();
    });

    const backLobbyBtn = document.getElementById('odd-back-lobby-btn');
    backLobbyBtn?.addEventListener('click', () => {
      goToGamesMenu();
    });

    const restartBtn = document.getElementById('odd-restart-btn');
    restartBtn?.addEventListener('click', () => {
      if (!hasEnoughCoins(ENTRY_FEE)) {
        alert("You need at least 5 coins to play again!");
        return;
      }
      deductCoins(ENTRY_FEE);
      initNewGame();
    });

    const menuBtn = document.getElementById('odd-menu-btn');
    menuBtn?.addEventListener('click', () => {
      goToGamesMenu();
    });

    // --- CORE GAME LOGIC ---
    function initNewGame() {
      currentRound = 1;
      roundsSurvived = 0;
      difficultyMultiplier = 1.0;
      gameActive = true;

      startScreen.classList.remove('active');
      gameOverScreen.classList.remove('active');
      gameScreen.classList.add('active');

      startRound();
    }

    function startRound() {
      if (!gameActive) return;

      // Rotate through symbols
      currentIcon = BASE_ICONS[(currentRound - 1) % BASE_ICONS.length];

      // Update HUD
      const roundNumDisp = document.getElementById('odd-round-num');
      if (roundNumDisp) roundNumDisp.innerText = String(currentRound);
      updateBestScoreUI();

      // Pick random index for odd tile
      oddTileIndex = Math.floor(Math.random() * 9);

      // Create 3x3 grid
      const grid = document.getElementById('odd-grid');
      if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 9; i++) {
          const tile = document.createElement('div');
          tile.className = 'odd-tile';
          tile.innerText = currentIcon;
          tile.setAttribute('data-idx', String(i));

          if (i === oddTileIndex) {
            // Apply the subtle difference style to the odd tile
            applyDifferenceStyle(tile);
          }

          tile.addEventListener('click', () => {
            handleTileClick(i, tile);
          });

          grid.appendChild(tile);
        }
      }

      // Reset timer
      // Timer decreases as round increases (minimum 2.5 seconds)
      const roundTime = Math.max(MIN_TIMER, STARTING_TIMER - (currentRound - 1) * TIMER_DECREASE_RATE);
      timeLeft = roundTime;
      updateTimerBar(roundTime);

      clearInterval(timerInterval);
      const intervalMs = 100;
      timerInterval = setInterval(() => {
        timeLeft -= intervalMs / 1000;
        updateTimerBar(roundTime);

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          triggerGameOver("Time ran out!");
        }
      }, intervalMs);
    }

    function applyDifferenceStyle(element: HTMLDivElement) {
      // Pick random modification type (1 of 4 possible differences)
      const diffTypes = ['color', 'mirror', 'size', 'rotate'];
      const currentDiff = diffTypes[Math.floor(Math.random() * diffTypes.length)];

      // Adjust difficulty scale based on round (difficultyMultiplier scales down the effect)
      // Round 1-3: very obvious difference
      // Round 4-7: moderate difference
      // Round 8+: extremely subtle, decreases by 5% each round
      if (currentRound >= 8) {
        difficultyMultiplier = Math.pow(0.92, currentRound - 7);
      }

      switch (currentDiff) {
        case 'color':
          if (currentRound <= 3) {
            element.style.filter = 'hue-rotate(180deg) saturate(2)';
          } else if (currentRound <= 7) {
            element.style.filter = 'hue-rotate(45deg)';
          } else {
            // Subtle color change
            const hueShift = Math.max(8, Math.floor(25 * difficultyMultiplier));
            element.style.filter = `hue-rotate(${hueShift}deg)`;
          }
          break;

        case 'mirror':
          // Mirroring is always scaleX(-1)
          element.style.transform = 'scaleX(-1)';
          break;

        case 'size':
          if (currentRound <= 3) {
            element.style.transform = 'scale(0.65)';
          } else if (currentRound <= 7) {
            element.style.transform = 'scale(0.85)';
          } else {
            // Subtle size change
            const scaleAmt = 1.0 - (0.05 * difficultyMultiplier);
            element.style.transform = `scale(${scaleAmt})`;
          }
          break;

        case 'rotate':
          if (currentRound <= 3) {
            element.style.transform = 'rotate(45deg)';
          } else if (currentRound <= 7) {
            element.style.transform = 'rotate(15deg)';
          } else {
            // Subtle rotation
            const rotateDeg = Math.max(5, Math.floor(12 * difficultyMultiplier));
            element.style.transform = `rotate(${rotateDeg}deg)`;
          }
          break;
      }
    }

    function updateTimerBar(maxTime: number) {
      const fill = document.getElementById('odd-timer-fill');
      if (fill) {
        const percent = Math.max(0, (timeLeft / maxTime) * 100);
        fill.style.width = `${percent}%`;
      }
    }

    function handleTileClick(index: number, element: HTMLDivElement) {
      if (!gameActive) return;

      if (index === oddTileIndex) {
        // Correct click! Round Won!
        element.classList.add('correct-flash');
        playClickSound();
        clearInterval(timerInterval);
        gameActive = false; // pause interaction

        setTimeout(() => {
          roundsSurvived += 1;
          currentRound += 1;
          gameActive = true;
          startRound();
        }, 600);
      } else {
        // Incorrect click! Game Over!
        triggerGameOver("Clicked the wrong tile!");
      }
    }

    function triggerGameOver(reason: string) {
      gameActive = false;
      clearInterval(timerInterval);
      playFailSound();

      // Check for best score
      if (roundsSurvived > oddOneOutBestScore) {
        oddOneOutBestScore = roundsSurvived;
      }

      // Calculate coins earned: 1 coin per round survived, capped at maxCoinsPerGame
      const wonCoins = Math.min(MAX_COINS_PER_GAME, roundsSurvived * 1);

      // Award coins if any
      if (wonCoins > 0) {
        awardCoins(wonCoins);
      }

      // Transition to game over screen
      gameScreen.classList.remove('active');
      gameOverScreen.classList.add('active');

      const overText = document.getElementById('odd-game-over-text');
      if (overText) {
        overText.innerHTML = `
          ${reason}<br/><br/>
          <strong>Rounds Survived:</strong> ${roundsSurvived}<br/>
          <strong>Coins Gained:</strong> +${wonCoins} 🪙<br/>
          <strong>Your Personal Best:</strong> ${oddOneOutBestScore} Rounds
        `;
      }
      updateBestScoreUI();
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [theme]);

  const themeStyles = getThemeCardStyles(theme || 'darkMoon');

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 relative shadow-xl font-fredoka border ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.isLight ? 'text-slate-800' : 'text-white'}`}>
      {/* Top Bar Controls (Introduction Bar) */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Eye className="text-pink-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Odd One Out</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onExit} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full" id="odd-one-out-game-mount" />
    </div>
  );
}

/**
 * Paw Print Trail - Vanilla JS Pattern Memory Mini-Game
 * Theme: Wolf & Moonlight Trail
 * 
 * This game is written in pure vanilla JavaScript and basic functional CSS.
 * For integration purposes, it is mounted inside a standard React wrapper.
 */

import React, { useEffect, useRef } from 'react';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { Footprints, X } from 'lucide-react';

import { getThemeCardStyles } from '../../utils/theme';

interface PawPrintTrailProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
  theme?: string;
}

// In-memory variable for Best Score that resets on page reload (no localStorage)
let pawPrintTrailBestScore = 0;

export default function PawPrintTrail({ coins, onUpdateCoins, onExit, theme }: PawPrintTrailProps) {
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
    const GRID_SIZE = 16;                // Total number of tiles in the 4x4 grid (16 tiles)
    const STARTING_SEQUENCE_LENGTH = 3;  // Number of tiles in the first round sequence
    const TILE_LIGHT_UP_DURATION = 600;  // Duration (ms) a tile remains illuminated
    const TILE_GAP_DURATION = 200;       // Duration (ms) of the gap between light-ups
    const MAX_COINS_PER_GAME = 20;       // Maximum coins a player can win in one game
    const ENTRY_FEE = 5;                // Entry fee in coins

    // --- GAME STATE ---
    let currentRound = 1;
    let roundsCompleted = 0;
    let sequence: number[] = [];        // Holds indices (0-15) of tiles in the trail
    let playerInputIndex = 0;            // Index of sequence tile player is currently reproducing
    let isPlayingSequence = false;       // Flag indicating if the sequence is active/playing
    let isPlayerTurn = false;            // Flag indicating if player is allowed to tap
    let currentActiveTimeouts: any[] = []; // Tracking active timeouts for cleanup

    // --- PLACEHOLDER FUNCTIONS / HOOKS ---
    function hasEnoughCoins(fee: number): boolean {
      return coinsRef.current >= fee;
    }

    function deductCoins(fee: number) {
      onUpdateCoinsRef.current(-fee);
      playCoinSound();
    }

    function awardCoins(amount: number) {
      onUpdateCoinsRef.current(amount);
      playWinSound();
    }

    function goToGamesMenu() {
      playClickSound();
      onExitRef.current();
    }

    // --- DOM BUILDER ---
    const root = containerRef.current;
    root.innerHTML = '';

    // Create stylesheet for basic functional styling
    const style = document.createElement('style');
    style.innerHTML = `
      .trail-game-container {
        font-family: inherit;
        color: #fff;
        max-width: 480px;
        margin: 0 auto;
        padding: 0px;
        background-color: transparent;
        text-align: center;
      }
      .trail-screen {
        display: none;
      }
      .trail-screen.active {
        display: block;
      }
      .trail-instructions {
        font-size: 14px;
        line-height: 1.5;
        color: #94a3b8;
        margin-bottom: 20px;
      }
      .trail-stats {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 15px;
        font-size: 14px;
        color: #cbd5e1;
      }
      .trail-status-message {
        font-size: 16px;
        font-weight: bold;
        color: #ec4899;
        margin-bottom: 20px;
        min-height: 28px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
      }
      .trail-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
        max-width: 320px;
        margin-left: auto;
        margin-right: auto;
      }
      .trail-tile {
        aspect-ratio: 1;
        background-color: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(30, 41, 59, 0.4)'};
        border: 2px solid ${isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(71, 85, 105, 0.4)'};
        border-radius: 16px;
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        opacity: 0.3;
        filter: grayscale(100%);
        transition: all 0.2s;
      }
      .trail-tile.lit {
        opacity: 1 !important;
        filter: grayscale(0%) !important;
        background-color: #ec4899 !important;
        border-color: #f472b6 !important;
        transform: scale(1.08);
        box-shadow: 0 0 20px #ec4899;
      }
      .trail-tile.click-flash {
        opacity: 1 !important;
        filter: grayscale(0%) !important;
        background-color: #10b981 !important;
        border-color: #34d399 !important;
        transform: scale(1.05);
      }
      .trail-tile.wrong-flash {
        opacity: 1 !important;
        filter: grayscale(0%) !important;
        background-color: #ef4444 !important;
        border-color: #f87171 !important;
        transform: scale(1.08);
        box-shadow: 0 0 20px #ef4444;
      }
      .trail-tile.active-clickable {
        opacity: 0.6;
        filter: grayscale(30%);
        border-color: ${isLight ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)'};
      }
      .trail-tile.active-clickable:hover {
        opacity: 0.9;
        background-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(51, 65, 85, 0.6)'};
        border-color: rgba(236, 72, 153, 0.6);
      }
      .trail-btn {
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
      .trail-btn:hover {
        transform: scale(1.03);
        box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
      }
      .trail-btn:active {
        transform: scale(0.98);
      }
      .trail-btn-secondary {
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        box-shadow: none;
      }
      .trail-btn-secondary:hover {
        background: rgba(51, 65, 85, 0.8);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: none;
      }
    `;
    root.appendChild(style);

    // Main structural div
    const wrapper = document.createElement('div');
    wrapper.className = 'trail-game-container';
    root.appendChild(wrapper);

    // --- SCREEN 1: START SCREEN ---
    const startScreen = document.createElement('div');
    startScreen.className = 'trail-screen active';
    startScreen.innerHTML = `
      <div class="rounded-2xl p-6 mb-6 text-left border ${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-200'}">
        <h3 class="text-base font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-pink-600' : 'text-pink-400'} uppercase tracking-wider">🎮 GAME MECHANICS</h3>
        <ul class="text-xs md:text-sm leading-relaxed list-disc pl-5 ${isLight ? 'text-slate-600' : 'text-slate-400'} space-y-2">
          <li>Entry Fee: <strong class="text-amber-500 font-bold">${ENTRY_FEE} Coins</strong></li>
          <li>A pattern memory trail game. Watch the sequence of paw prints light up, then tap the tiles in the exact same order!</li>
          <li>Each round, the sequence grows by 1 new paw print. One wrong step ends the hunt.</li>
          <li>Reward: <strong class="text-amber-500 font-bold">2 Coins</strong> per completed round (up to <strong class="${isLight ? 'text-slate-900' : 'text-white'}">${MAX_COINS_PER_GAME} max</strong>).</li>
        </ul>
      </div>
      <div id="trail-best-score" style="margin-bottom: 24px; font-weight: bold; color: #fbbf24; font-size: 15px;"></div>
      <button class="trail-btn cursor-pointer" id="trail-start-btn">Pay ${ENTRY_FEE} Coins & Play</button>
    `;
    wrapper.appendChild(startScreen);

    // --- SCREEN 2: GAME SCREEN ---
    const gameScreen = document.createElement('div');
    gameScreen.className = 'trail-screen';
    gameScreen.innerHTML = `
      <div class="trail-stats ${isLight ? 'text-slate-700' : 'text-slate-300'}">
        <div>ROUND: <span id="trail-round-num" style="color: #f472b6;">1</span></div>
        <div>BEST: <span id="trail-best-num" style="color: #fbbf24;">0</span></div>
      </div>
      <div class="trail-status-message" id="trail-status-msg">WATCH THE TRAIL!</div>
      <div class="trail-grid" id="trail-grid"></div>
    `;
    wrapper.appendChild(gameScreen);

    // --- SCREEN 3: GAME OVER SCREEN ---
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'trail-screen';
    gameOverScreen.innerHTML = `
      <div class="rounded-2xl p-6 mb-6 text-center border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-500/5 border-red-500/20'}">
        <h2 class="text-xl md:text-2xl font-black text-red-500 mb-3">🐺 TRAIL LOST! 🐺</h2>
        <p class="text-xs md:text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}" id="trail-game-over-text"></p>
      </div>
      <button class="trail-btn cursor-pointer" id="trail-restart-btn">Play Again (${ENTRY_FEE} Coins)</button>
    `;
    wrapper.appendChild(gameOverScreen);

    // Update best scores on UI
    function updateBestScoreUI() {
      const startBest = document.getElementById('trail-best-score');
      if (startBest) startBest.innerText = `YOUR BEST COMPLETED: ${pawPrintTrailBestScore} ROUNDS`;
      const gameBest = document.getElementById('trail-best-num');
      if (gameBest) gameBest.innerText = String(pawPrintTrailBestScore);
    }
    updateBestScoreUI();

    // Wire up buttons
    const startBtn = document.getElementById('trail-start-btn');
    startBtn?.addEventListener('click', () => {
      if (!hasEnoughCoins(ENTRY_FEE)) {
        alert("You need at least 5 coins to play Paw Print Trail!");
        return;
      }
      deductCoins(ENTRY_FEE);
      initNewGame();
    });

    const backLobbyBtn = document.getElementById('trail-back-lobby-btn');
    backLobbyBtn?.addEventListener('click', () => {
      goToGamesMenu();
    });

    const restartBtn = document.getElementById('trail-restart-btn');
    restartBtn?.addEventListener('click', () => {
      if (!hasEnoughCoins(ENTRY_FEE)) {
        alert("You need at least 5 coins to play again!");
        return;
      }
      deductCoins(ENTRY_FEE);
      initNewGame();
    });

    const menuBtn = document.getElementById('trail-menu-btn');
    menuBtn?.addEventListener('click', () => {
      goToGamesMenu();
    });

    // --- CORE GAME ENGINE ---
    function initNewGame() {
      currentRound = 1;
      roundsCompleted = 0;
      sequence = [];
      clearTimeouts();

      startScreen.classList.remove('active');
      gameOverScreen.classList.remove('active');
      gameScreen.classList.add('active');

      // Build sequence of length 3 for the first round
      for (let i = 0; i < STARTING_SEQUENCE_LENGTH; i++) {
        sequence.push(Math.floor(Math.random() * GRID_SIZE));
      }

      startRound();
    }

    function clearTimeouts() {
      currentActiveTimeouts.forEach(t => clearTimeout(t));
      currentActiveTimeouts = [];
    }

    function startRound() {
      isPlayerTurn = false;
      playerInputIndex = 0;

      // Update HUD
      const roundNumDisp = document.getElementById('trail-round-num');
      if (roundNumDisp) roundNumDisp.innerText = String(currentRound);
      updateBestScoreUI();

      // Build 4x4 Grid of Tiles
      const grid = document.getElementById('trail-grid');
      if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < GRID_SIZE; i++) {
          const tile = document.createElement('div');
          tile.className = 'trail-tile';
          tile.id = `trail-tile-${i}`;
          tile.innerText = '🐾';
          tile.setAttribute('data-idx', String(i));

          // Set up listener
          tile.addEventListener('click', () => {
            handleTileClick(i, tile);
          });

          grid.appendChild(tile);
        }
      }

      // Display sequence automatically
      playSequence();
    }

    function playSequence() {
      isPlayingSequence = true;
      setStatusMsg("Watch the trail!");

      const gridTiles = document.querySelectorAll('.trail-tile');
      gridTiles.forEach(tile => {
        tile.classList.remove('active-clickable');
      });

      let currentStep = 0;

      function showNextStep() {
        if (!isPlayingSequence) return;

        if (currentStep < sequence.length) {
          const tileIndex = sequence[currentStep];
          const tile = document.getElementById(`trail-tile-${tileIndex}`);
          if (tile) {
            // Light up!
            tile.classList.add('lit');
            playClickSound();

            const litTimeout = setTimeout(() => {
              tile.classList.remove('lit');
              
              currentStep++;
              // Short gap duration before the next item in sequence
              const gapTimeout = setTimeout(showNextStep, TILE_GAP_DURATION);
              currentActiveTimeouts.push(gapTimeout);
            }, TILE_LIGHT_UP_DURATION);

            currentActiveTimeouts.push(litTimeout);
          }
        } else {
          // Playback finished! Player turn.
          isPlayingSequence = false;
          isPlayerTurn = true;
          setStatusMsg("Your turn!");

          // Enable hover styles and clickability visual cues
          gridTiles.forEach(tile => {
            tile.classList.add('active-clickable');
          });
        }
      }

      // Start playing sequence after a short initial pause
      const initialTimeout = setTimeout(showNextStep, 500);
      currentActiveTimeouts.push(initialTimeout);
    }

    function setStatusMsg(text: string) {
      const statusMsg = document.getElementById('trail-status-msg');
      if (statusMsg) statusMsg.innerText = text;
    }

    function handleTileClick(index: number, element: HTMLDivElement) {
      if (!isPlayerTurn) return; // Prevent clicks during playback

      // 1. Brief flash to confirm register click (regardless of correctness)
      element.classList.add('click-flash');
      playClickSound();

      const flashTimeout = setTimeout(() => {
        element.classList.remove('click-flash');
      }, 150);
      currentActiveTimeouts.push(flashTimeout);

      // Check correctness
      const expectedIndex = sequence[playerInputIndex];

      if (index === expectedIndex) {
        // Correct click! Proceed silently
        playerInputIndex++;

        // Completed sequence successfully!
        if (playerInputIndex === sequence.length) {
          isPlayerTurn = false;
          roundsCompleted = currentRound;
          currentRound++;

          // Append one new random tile at the end (Simon-style pattern growth)
          sequence.push(Math.floor(Math.random() * GRID_SIZE));

          setStatusMsg("Excellent!");
          
          const roundEndTimeout = setTimeout(() => {
            startRound();
          }, 1000);
          currentActiveTimeouts.push(roundEndTimeout);
        }
      } else {
        // Wrong step! Immediate Game Over!
        isPlayerTurn = false;
        
        // Flash in distinct wrong color
        element.classList.add('wrong-flash');
        playFailSound();

        const gameOverTimeout = setTimeout(() => {
          element.classList.remove('wrong-flash');
          triggerGameOver("You lost the trail!");
        }, 800);
        currentActiveTimeouts.push(gameOverTimeout);
      }
    }

    function triggerGameOver(reason: string) {
      clearTimeouts();

      if (roundsCompleted > pawPrintTrailBestScore) {
        pawPrintTrailBestScore = roundsCompleted;
      }

      // 2 coins per completed round, capped at maxCoinsPerGame
      const wonCoins = Math.min(MAX_COINS_PER_GAME, roundsCompleted * 2);

      if (wonCoins > 0) {
        awardCoins(wonCoins);
      }

      // Transition to game over
      gameScreen.classList.remove('active');
      gameOverScreen.classList.add('active');

      const overText = document.getElementById('trail-game-over-text');
      if (overText) {
        overText.innerHTML = `
          ${reason}<br/><br/>
          <strong>Rounds Completed:</strong> ${roundsCompleted}<br/>
          <strong>Coins Gained:</strong> +${wonCoins} 🪙<br/>
          <strong>Your Personal Best:</strong> ${pawPrintTrailBestScore} Rounds
        `;
      }
      updateBestScoreUI();
    }

    return () => {
      clearTimeouts();
    };
  }, [theme]);

  const themeStyles = getThemeCardStyles(theme || 'darkMoon');

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 relative shadow-xl font-fredoka border ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.isLight ? 'text-slate-800' : 'text-white'}`}>
      {/* Top Bar Controls (Introduction Bar) */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Footprints className="text-pink-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">Paw Print Trail</h2>
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

      <div ref={containerRef} className="w-full" id="paw-print-trail-game-mount" />
    </div>
  );
}

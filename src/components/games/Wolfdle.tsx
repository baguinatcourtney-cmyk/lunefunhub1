/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { X, HelpCircle, Trophy, Sparkles, RefreshCw, Key } from 'lucide-react';

import { getThemeCardStyles } from '../../utils/theme';

interface WolfdleProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
  theme?: string;
}

// 5-letter thematic dictionary (wolves, nature, &TEAM)
const THEMATIC_WORDS = [
  'WOLFS', 'FANGS', 'MOONS', 'HOWLS', 'TRACK', 'NIGHT', 'ALPHA', 'BEAST',
  'CLAWS', 'PACKS', 'WOODS', 'LUNES', 'TEAMS', 'STARS', 'SHINE', 'BONDS',
  'STORM', 'RIVER', 'LIGHT', 'CROWN', 'GREEN', 'WHITE', 'GROWL', 'MUSIC',
  'SONGS', 'YOUTH', 'DANCE', 'STAGE', 'VOICE', 'NAILS', 'EEVEE', 'CHESS',
  'WENOS', 'MATCH', 'PIZZA', 'FLUTE', 'SOUND', 'BLOOM', 'TRAIL', 'STALK',
  'SWIFT', 'SHARP', 'FROST', 'CHILL', 'NORTH', 'SNOWY', 'WILDS', 'HOWLY',
  'ROOTS', 'MOUNT', 'CAVES', 'DEERS', 'HARES', 'WINGS', 'CLANS', 'CLIFF',
  'FORES', 'EARTH', 'STONE', 'GRASS', 'PREYS', 'HUNTS', 'FLEET'
];

export default function Wolfdle({ coins, onUpdateCoins, onExit, theme }: WolfdleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuessIdx, setCurrentGuessIdx] = useState(0);
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0); // position in the current word (0..4)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [invalidWordMessage, setInvalidWordMessage] = useState('');
  const [letterStatuses, setLetterStatuses] = useState<Record<string, 'green' | 'yellow' | 'gray'>>({});
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');

  // Keyboard layout rows
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'];

  // Handle start game
  const handleStartGame = () => {
    if (coins < 5) {
      showToast('You need at least 5 coins to start Wolfdle!');
      return;
    }
    onUpdateCoins(-5);
    playCoinSound();

    // Select a random secret word
    const randomWord = THEMATIC_WORDS[Math.floor(Math.random() * THEMATIC_WORDS.length)];
    setSecretWord(randomWord);
    setGuesses(Array(6).fill(''));
    setCurrentGuessIdx(0);
    setCurrentLetterIdx(0);
    setGameStatus('playing');
    setLetterStatuses({});
    setHintsUsed(0);
    setHintText('');
    setIsPlaying(true);
    setShowInstructions(false);
  };

  // Evaluate a row of letters
  const evaluateGuess = (guess: string, target: string) => {
    const result: ('green' | 'yellow' | 'gray')[] = Array(5).fill('gray');
    const targetLetterCounts: Record<string, number> = {};

    // First pass: Find perfect matches (Green) and count letters
    for (let i = 0; i < 5; i++) {
      const targetChar = target[i];
      targetLetterCounts[targetChar] = (targetLetterCounts[targetChar] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'green';
        targetLetterCounts[guess[i]]--;
      }
    }

    // Second pass: Find wrong spot matches (Yellow)
    for (let i = 0; i < 5; i++) {
      if (result[i] !== 'green') {
        const guessChar = guess[i];
        if (targetLetterCounts[guessChar] && targetLetterCounts[guessChar] > 0) {
          result[i] = 'yellow';
          targetLetterCounts[guessChar]--;
        }
      }
    }

    return result;
  };

  // Keyboard and Input handlers
  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing' || !isPlaying) return;

    if (key === 'ENTER') {
      const currentGuess = guesses[currentGuessIdx];
      if (currentGuess.length < 5) {
        // Shake row
        setShakeRow(currentGuessIdx);
        setTimeout(() => setShakeRow(null), 500);
        showToast('Not enough letters!');
        playFailSound();
        return;
      }

      // Process guess
      const result = evaluateGuess(currentGuess, secretWord);
      
      // Update letter statuses for keyboard colors
      const newLetterStatuses = { ...letterStatuses };
      for (let i = 0; i < 5; i++) {
        const char = currentGuess[i];
        const status = result[i];
        const existingStatus = newLetterStatuses[char];

        if (!existingStatus) {
          newLetterStatuses[char] = status;
        } else if (existingStatus === 'yellow' && status === 'green') {
          newLetterStatuses[char] = 'green';
        } else if (existingStatus === 'gray' && (status === 'green' || status === 'yellow')) {
          newLetterStatuses[char] = status;
        }
      }
      setLetterStatuses(newLetterStatuses);

      // Check win/lose
      if (currentGuess === secretWord) {
        setGameStatus('won');
        onUpdateCoins(12); // Wins 12 coins (net +7)
        playWinSound();
      } else if (currentGuessIdx === 5) {
        setGameStatus('lost');
        playFailSound();
      } else {
        playClickSound();
        setCurrentGuessIdx(prev => prev + 1);
        setCurrentLetterIdx(0);
      }
    } else if (key === 'BACK' || key === 'BACKSPACE') {
      const currentGuess = guesses[currentGuessIdx];
      if (currentGuess.length > 0) {
        playClickSound();
        const updatedGuesses = [...guesses];
        updatedGuesses[currentGuessIdx] = currentGuess.slice(0, -1);
        setGuesses(updatedGuesses);
        setCurrentLetterIdx(prev => prev - 1);
      }
    } else {
      // standard letter
      const currentGuess = guesses[currentGuessIdx];
      if (currentGuess.length < 5) {
        playClickSound();
        const updatedGuesses = [...guesses];
        updatedGuesses[currentGuessIdx] = currentGuess + key.toUpperCase();
        setGuesses(updatedGuesses);
        setCurrentLetterIdx(prev => prev + 1);
      }
    }
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameStatus !== 'playing') return;
      
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACK');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameStatus, guesses, currentGuessIdx, secretWord]);

  const showToast = (msg: string) => {
    setInvalidWordMessage(msg);
    setTimeout(() => {
      setInvalidWordMessage('');
    }, 2000);
  };

  const handleGetHint = () => {
    if (gameStatus !== 'playing' || !isPlaying) return;

    // Determine cost
    const isFree = hintsUsed === 0;
    if (!isFree && coins < 2) {
      showToast("Need at least 2 coins for a hint!");
      playFailSound();
      return;
    }

    // Logic to find a correct letter that hasn't been guessed as green yet
    const solvedIndices = new Set<number>();
    for (let r = 0; r < currentGuessIdx; r++) {
      const g = guesses[r];
      if (g && g.length === 5) {
        for (let i = 0; i < 5; i++) {
          if (g[i] === secretWord[i]) {
            solvedIndices.add(i);
          }
        }
      }
    }

    // Unsolved indices in secretWord
    const unsolvedIndices: number[] = [];
    for (let i = 0; i < 5; i++) {
      if (!solvedIndices.has(i)) {
        unsolvedIndices.push(i);
      }
    }

    if (unsolvedIndices.length === 0) {
      setHintText("You've found all correct letter spots! Keep guessing!");
      playClickSound();
      return;
    }

    // Pick a random unsolved index
    const randomIndex = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)];
    const hintChar = secretWord[randomIndex];

    // Deduct coins if not free
    if (!isFree) {
      onUpdateCoins(-2);
      playCoinSound();
    } else {
      playClickSound();
    }

    setHintsUsed(prev => prev + 1);
    setHintText(`💡 Hint: The letter at position ${randomIndex + 1} is "${hintChar}"`);
  };

  const themeStyles = getThemeCardStyles(theme || 'darkMoon');
  const isLight = themeStyles.isLight;

  return (
    <div className={`w-full max-w-md md:max-w-xl mx-auto rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 relative shadow-2xl font-fredoka border ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.isLight ? 'text-slate-800' : 'text-white'}`}>
      {/* Top Bar Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Key className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">WOLFDLE</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              playClickSound();
              onExit();
            }}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Instructions Menu */}
      {showInstructions && (
        <div className="space-y-6 py-4">
          <div className={`${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700/50'} rounded-2xl p-4 sm:p-6 border space-y-4`}>
            <h3 className={`text-lg font-bold text-center uppercase tracking-wider ${isLight ? 'text-pink-600 font-black' : 'text-yellow-400'}`}>🐾 How to Play</h3>
            <p className={`text-sm leading-relaxed text-center ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Guess the secret 5-letter wolf or nature-themed word in 6 tries.
            </p>

            {/* Letter Examples */}
            <div className="space-y-3">
              <span className={`text-xs font-bold block uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Examples:</span>
              
              <div className={`flex items-center space-x-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-slate-950/40 border-slate-800 text-slate-350'}`}>
                <div className="flex space-x-1.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center text-sm">W</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>O</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>L</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>F</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>S</div>
                </div>
                <span className="text-xs">
                  <strong className="text-emerald-500">W</strong> is in the secret word and in the <strong className="text-emerald-500">correct spot</strong>.
                </span>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-slate-950/40 border-slate-800 text-slate-350'}`}>
                <div className="flex space-x-1.5">
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>M</div>
                  <div className="w-8 h-8 rounded-md bg-amber-500 text-black font-bold flex items-center justify-center text-sm">O</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>O</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>N</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>S</div>
                </div>
                <span className="text-xs">
                  <strong className="text-amber-500">O</strong> is in the secret word but in the <strong className="text-amber-500">wrong spot</strong>.
                </span>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-slate-950/40 border-slate-800 text-slate-350'}`}>
                <div className="flex space-x-1.5">
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>P</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>A</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>C</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'} font-bold flex items-center justify-center text-sm`}>K</div>
                  <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-600/40 text-slate-400'} font-bold flex items-center justify-center text-sm`}>S</div>
                </div>
                <span className="text-xs">
                  <strong className="text-slate-400">S</strong> is not in the secret word at all.
                </span>
              </div>
            </div>

            <div className={`pt-2 text-center text-xs p-3 rounded-xl ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-950/20 text-slate-400'}`}>
              🔑 Words are themes of wolves, nature, stars, moons, or &TEAM!
            </div>
          </div>

          <div className="text-center">
            <span className={`text-xs block mb-3 font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ENTRY FEE: 5 COINS</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className={`px-10 py-4 ${themeStyles.btnAccent} rounded-full font-bold text-lg shadow-xl cursor-pointer`}
            >
              Pay 5 Coins & Play!
            </motion.button>
          </div>
        </div>
      )}

      {/* Gameboard Screen */}
      {isPlaying && (
        <div className="space-y-6">
          {/* Toast Notification */}
          <AnimatePresence>
            {invalidWordMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs shadow-lg z-50 pointer-events-none"
              >
                ⚠️ {invalidWordMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Letter Grid */}
          <div className="grid grid-rows-6 gap-1.5 sm:gap-2 max-w-[280px] sm:max-w-xs mx-auto">
            {guesses.map((guess, rowIndex) => {
              const isSubmitted = rowIndex < currentGuessIdx;
              const isCurrentRow = rowIndex === currentGuessIdx;
              const isShaking = shakeRow === rowIndex;

              return (
                <motion.div
                  key={rowIndex}
                  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-5 gap-1.5 sm:gap-2"
                >
                  {Array(5)
                    .fill(null)
                    .map((_, colIndex) => {
                      const letter = guess[colIndex] || '';
                      let bgColor = isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/50 border-slate-800';
                      let textColor = isLight ? 'text-slate-800' : 'text-white';

                      if (isSubmitted) {
                        const result = evaluateGuess(guess, secretWord);
                        const status = result[colIndex];
                        if (status === 'green') {
                          bgColor = 'bg-emerald-500 border-emerald-600';
                          textColor = 'text-white';
                        } else if (status === 'yellow') {
                          bgColor = 'bg-amber-500 border-amber-600';
                          textColor = 'text-slate-950';
                        } else {
                          bgColor = isLight ? 'bg-slate-300 border-slate-400' : 'bg-slate-700/80 border-slate-700';
                          textColor = isLight ? 'text-slate-600' : 'text-slate-300';
                        }
                      } else if (isCurrentRow && letter) {
                        bgColor = isLight ? 'bg-slate-200 border-slate-400' : 'bg-slate-800 border-slate-600';
                      }

                      return (
                        <div
                          key={colIndex}
                          className={`aspect-square rounded-xl border-2 flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-300 uppercase ${bgColor} ${textColor}`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                </motion.div>
              );
            })}
          </div>

          {/* Hint Option Section */}
          {gameStatus === 'playing' && (
            <div className="flex flex-col items-center space-y-2 mt-3 mb-1 select-none">
              <AnimatePresence>
                {hintText && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`border rounded-xl px-4 py-2 text-center text-xs font-bold max-w-sm ${isLight ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-amber-500/15 border-amber-500/30 text-yellow-300'}`}
                  >
                    {hintText}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={handleGetHint}
                className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs transition-all cursor-pointer shadow-sm font-semibold ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900' : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white'}`}
              >
                <span>💡</span>
                <span>{hintsUsed === 0 ? "Get Free Hint" : "Get Hint (2 Coins)"}</span>
              </button>
            </div>
          )}

          {/* Keyboard Layout */}
          <div className="space-y-1.5 pt-4 w-full">
            {/* Row 1 */}
            <div className="flex justify-center gap-1 w-full max-w-md mx-auto">
              {row1.map(key => {
                const status = letterStatuses[key];
                let keyBg = isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700';
                if (status === 'green') keyBg = 'bg-emerald-500 text-white';
                else if (status === 'yellow') keyBg = 'bg-amber-500 text-slate-950';
                else if (status === 'gray') keyBg = isLight ? 'bg-slate-100 text-slate-300' : 'bg-slate-700/40 text-slate-500';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`flex-1 min-w-[18px] max-w-[36px] sm:max-w-[44px] h-10 sm:h-12 rounded-md font-bold text-xs sm:text-sm transition-colors flex items-center justify-center cursor-pointer select-none active:scale-95 ${keyBg}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1 w-full max-w-md mx-auto">
              {row2.map(key => {
                const status = letterStatuses[key];
                let keyBg = isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700';
                if (status === 'green') keyBg = 'bg-emerald-500 text-white';
                else if (status === 'yellow') keyBg = 'bg-amber-500 text-slate-950';
                else if (status === 'gray') keyBg = isLight ? 'bg-slate-100 text-slate-300' : 'bg-slate-700/40 text-slate-500';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`flex-1 min-w-[18px] max-w-[36px] sm:max-w-[44px] h-10 sm:h-12 rounded-md font-bold text-xs sm:text-sm transition-colors flex items-center justify-center cursor-pointer select-none active:scale-95 ${keyBg}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1 w-full max-w-md mx-auto">
              {row3.map(key => {
                const isSpecial = key === 'ENTER' || key === 'BACK';
                const status = letterStatuses[key];
                let keyBg = isSpecial ? (isLight ? 'bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200' : 'bg-amber-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-amber-500/30') : (isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700');
                
                if (!isSpecial) {
                  if (status === 'green') keyBg = 'bg-emerald-500 text-white';
                  else if (status === 'yellow') keyBg = 'bg-amber-500 text-slate-950';
                  else if (status === 'gray') keyBg = isLight ? 'bg-slate-100 text-slate-300' : 'bg-slate-700/40 text-slate-500';
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`${isSpecial ? 'flex-[1.5] text-[9px] sm:text-xs font-bold' : 'flex-1 min-w-[18px] max-w-[36px] sm:max-w-[44px] text-xs sm:text-sm font-bold'} h-10 sm:h-12 rounded-md transition-colors flex items-center justify-center cursor-pointer select-none active:scale-95 ${keyBg}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* End Game Modal Overlay */}
          {gameStatus !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/90 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-6 z-40 border border-slate-800"
            >
              {gameStatus === 'won' ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40 animate-pulse">
                    <Trophy className="text-yellow-400" size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-emerald-400">VICTORY HOWL! 🐺</h3>
                    <p className="text-sm text-slate-400">
                      You correctly guessed the secret word: <span className="text-white font-bold uppercase tracking-wider">{secretWord}</span>
                    </p>
                  </div>
                  <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">REWARD</span>
                    <span className="text-xl font-bold text-yellow-400">💰 +12 COINS</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
                    <X className="text-red-400" size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-red-400">OUT OF TRIES!</h3>
                    <p className="text-sm text-slate-400">
                      The pack was hunting for: <span className="text-yellow-400 font-bold uppercase tracking-wider">{secretWord}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Don't worry, the wilderness is full of second chances! Spend 5 coins to hunt again.
                  </p>
                </>
              )}

              <div className="flex space-x-3 w-full max-w-xs pt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    onExit();
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition-all border border-slate-700 cursor-pointer"
                >
                  Exit Game
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Play Again</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

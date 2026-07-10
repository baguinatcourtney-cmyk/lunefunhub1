/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound, playWinSound, playFailSound, playMagicSound } from '../../utils/sound';
import { X, HelpCircle, Music, Play, Square, RefreshCw, Key, Trophy, Sparkles, Volume2, AlertCircle, AlertTriangle } from 'lucide-react';
import { SONGS_LIST } from '../../data';
import { SongItem } from '../../types';

interface WolfSoundProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

export default function WolfSound({ coins, onUpdateCoins, onExit }: WolfSoundProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const durationMode = '1s';
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [cleanTitle, setCleanTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (isPlaying && !isWon && !isLost) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };
  
  // Game state
  const [playedBaseTitles, setPlayedBaseTitles] = useState<string[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [incorrectFeedback, setIncorrectFeedback] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [guessHistory, setGuessHistory] = useState<string[]>([]);

  // Audio system state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean title helper - removes version qualifiers, Japanese/Korean characters and normalizes title to English only
  const getCleanTitle = (title: string): string => {
    // 1. First normalize common suffixes
    let temp = title
      .replace(/\s*-\s*&team\s*ver\.?/gi, '')
      .replace(/\s*&team\s*remix/gi, '')
      .replace(/\s*\((korean|japanese|days of youth|&team)\s*ver\.?\)/gi, '')
      .replace(/\s*\((korean|japanese)\s*version\)/gi, '')
      .replace(/\s*\(korean\)/gi, '')
      .replace(/\s*\(japanese\)/gi, '')
      .trim();

    // 2. Identify and handle parenthetical parts with non-Latin characters
    // If a parenthetical block is entirely non-Latin, e.g., "(十五夜)", remove it.
    temp = temp.replace(/\s*\([\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]+\)/g, '');
    
    // If there is Japanese outside of parenthetical but English inside, e.g., "バズ恋 (BUZZ LOVE)", extract English part
    const parenMatch = temp.match(/^([^\(]+)\(([^)]+)\)$/);
    if (parenMatch) {
      const outside = parenMatch[1].trim();
      const inside = parenMatch[2].trim();
      const outsideHasNonLatin = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(outside);
      const insideHasNonLatin = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(inside);
      if (outsideHasNonLatin && !insideHasNonLatin) {
        temp = inside;
      }
    }

    // Now, remove any remaining non-Latin characters from the title
    temp = temp.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g, '');

    // Clean double spaces or clean leading/trailing special characters
    temp = temp.replace(/\s+/g, ' ').trim();

    return temp;
  };

  // Base title for deduplication
  const getBaseTitle = (title: string): string => {
    return getCleanTitle(title).toLowerCase();
  };

  // Get acceptable title answers for lenient matching
  const getAcceptableAnswers = (title: string): string[] => {
    const answers = new Set<string>();
    
    let base = getCleanTitle(title).toLowerCase().trim();
    answers.add(base);

    // If there is a parenthetical subtitle e.g. "バズ恋 (BUZZ LOVE)" or "Samidare (五月雨)"
    // let's extract the inside of the parenthesis as well as the outside part
    const parenMatch = base.match(/^([^\(]+)\(([^\)]+)\)$/);
    if (parenMatch) {
      const p1 = parenMatch[1].trim();
      const p2 = parenMatch[2].trim();
      if (p1) answers.add(p1);
      if (p2) answers.add(p2);
    }

    return Array.from(answers).filter(Boolean);
  };

  // Initialize unrevealed spaces and non-word characters
  const initRevealedIndices = (title: string): Set<number> => {
    const indices = new Set<number>();
    for (let i = 0; i < title.length; i++) {
      const char = title[i];
      // Automatically reveal non-alphanumeric characters (spaces, dashes, brackets, dots, etc.)
      if (!/[a-zA-Z0-9]/i.test(char)) {
        indices.add(i);
      }
    }
    return indices;
  };

  // Stop current playing audio
  const stopAudio = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Fetch Spotify Preview URL via proxy
  const fetchPreviewUrl = async (trackId: string): Promise<string> => {
    if (audioCache[trackId]) {
      return audioCache[trackId];
    }
    const response = await fetch(`/api/spotify-preview/${trackId}`);
    if (!response.ok) {
      throw new Error(`Failed to load track preview (${response.status})`);
    }
    const data = await response.json();
    if (!data.previewUrl) {
      throw new Error("Preview audio not available for this track");
    }
    // Update cache
    setAudioCache(prev => ({ ...prev, [trackId]: data.previewUrl }));
    return data.previewUrl;
  };

  // Play the audio snippet (1-second or 2-second depending on durationMode)
  const playSnippet = async () => {
    if (!currentSong) return;
    
    if (playCount >= 2) {
      setAudioError("You have already played the audio 2 times this round!");
      return;
    }

    stopAudio();
    setAudioError(null);
    playClickSound();

    try {
      let targetUrl = previewUrl;
      if (!targetUrl) {
        setLoadingAudio(true);
        targetUrl = await fetchPreviewUrl(currentSong.trackId);
        setPreviewUrl(targetUrl);
        setLoadingAudio(false);
      }

      // Create Audio object
      const audio = new Audio(targetUrl);
      audio.volume = 0.85;
      audioRef.current = audio;

      // Start playing
      setIsPlayingAudio(true);
      await audio.play();
      setPlayCount(prev => prev + 1);

      // Enforce EXACTLY 1-second or 2-second cutoff
      const cutoffTime = durationMode === '1s' ? 1000 : 2000;
      timeoutRef.current = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setIsPlayingAudio(false);
      }, cutoffTime);

    } catch (err: any) {
      console.error(err);
      setLoadingAudio(false);
      setAudioError(err.message || "An error occurred while loading audio. Please try again.");
      playFailSound();
    }
  };

  // Start a new game round
  const startNewRound = (forceRestart = false) => {
    // 2 Coins Entry Fee
    if (coins < 2 && !forceRestart) {
      alert("You need at least 2 coins to play Wolf Sound!");
      return;
    }

    if (!forceRestart) {
      onUpdateCoins(-2);
      playCoinSound();
    }

    stopAudio();

    // Group or filter songs to avoid double songs in session
    // Filter base songs whose titles haven't been successfully guessed
    let eligibleSongs = SONGS_LIST.filter(song => {
      const base = getBaseTitle(song.title);
      return !playedBaseTitles.includes(base);
    });

    // Reset pool if all songs are played/exhausted
    if (eligibleSongs.length === 0) {
      setPlayedBaseTitles([]);
      eligibleSongs = SONGS_LIST;
    }

    // Select random song
    const selected = eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)];
    const clean = getCleanTitle(selected.title);

    setCurrentSong(selected);
    setCleanTitle(clean);
    setInputValue('');
    setIsWon(false);
    setIsLost(false);
    setIncorrectCount(0);
    setPlayCount(0);
    setGuessHistory([]);
    setHintsUsed(0);
    setPreviewUrl(null);
    setAudioError(null);
    setRevealedIndices(initRevealedIndices(clean));
    setIsPlaying(true);
  };

  // Buy hint for 2 Coins
  const handleBuyHint = () => {
    if (isWon || !currentSong) return;
    
    if (coins < 2) {
      alert("You need at least 2 coins to buy a hint!");
      return;
    }

    // Deduct coins
    onUpdateCoins(-2);
    playCoinSound();
    playMagicSound();

    // Select a random unrevealed index to reveal
    const unrevealed: number[] = [];
    for (let i = 0; i < cleanTitle.length; i++) {
      if (!revealedIndices.has(i)) {
        unrevealed.push(i);
      }
    }

    if (unrevealed.length > 0) {
      // Reveal 1 random letter index
      const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedIndices(prev => {
        const next = new Set(prev);
        next.add(randomIndex);
        return next;
      });
      setHintsUsed(prev => prev + 1);
    } else {
      alert("All letters are already revealed!");
    }
  };

  // Submit guess
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSong || isWon || isLost) return;

    const trimmedGuess = inputValue.trim();
    if (!trimmedGuess) return;

    // Check guess against acceptable titles
    const acceptable = getAcceptableAnswers(currentSong.title);
    const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    
    const normalizedGuess = cleanStr(trimmedGuess);
    const correct = acceptable.some(ans => cleanStr(ans) === normalizedGuess);

    if (correct) {
      // Success!
      setIsWon(true);
      playWinSound();
      
      // Add to played list to prevent double song
      const base = getBaseTitle(currentSong.title);
      setPlayedBaseTitles(prev => {
        if (!prev.includes(base)) {
          return [...prev, base];
        }
        return prev;
      });

      // Earn 6 or 8 coins for a correct guess depending on the difficulty mode! (Entry was 2 coins)
      onUpdateCoins(durationMode === '1s' ? 8 : 6);
    } else {
      // Incorrect guess
      setIncorrectFeedback(true);
      const nextCount = incorrectCount + 1;
      setIncorrectCount(nextCount);
      setGuessHistory(prev => [trimmedGuess, ...prev].slice(0, 5));
      playFailSound();
      setInputValue('');
      
      if (nextCount >= 2) {
        setIsLost(true);
      }
      setTimeout(() => setIncorrectFeedback(false), 500);
    }
  };

  // Render the title letter blanks
  const renderBlankLines = () => {
    if (!currentSong) return null;

    return (
      <div className="flex flex-wrap justify-center gap-1.5 md:gap-2.5 my-6 max-w-xl mx-auto">
        {Array.from(cleanTitle).map((char, idx) => {
          if (char === ' ') {
            return <div key={idx} className="w-5" />;
          }

          const isRevealed = revealedIndices.has(idx) || isWon;
          return (
            <div key={idx} className="flex flex-col items-center">
              <span className={`text-xl md:text-2xl font-bold font-mono transition-all ${isRevealed ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}>
                {isRevealed ? char : '_'}
              </span>
              <div className="w-4 md:w-5 h-0.5 bg-slate-700 mt-1" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Top Bar / Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="text-emerald-400 animate-pulse" size={24} />
          <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Wolf Sound Game
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          {/* Top Hint Button when playing */}
          {isPlaying && !isWon && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyHint}
              className="px-3.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 hover:border-yellow-500 rounded-full text-yellow-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles size={13} className="text-yellow-400" />
              Hint (2 Coins)
            </motion.button>
          )}
          <button 
            onClick={handleExitAttempt} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 1. Instructions / Launch Stage */}
      {showInstructions && !isPlaying && (
        <div className="space-y-6 text-center py-6">

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-emerald-300 mb-3 flex items-center justify-center gap-2">
              🐺 MECHANICS & HOW TO PLAY
            </h3>
            <ul className="text-slate-300 space-y-2.5 text-sm text-left max-w-md mx-auto list-disc pl-5 font-sans leading-relaxed">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">2 coins</span> per round.</li>
              <li>You will listen to a <span className="font-semibold text-white text-emerald-400">{durationMode === '1s' ? '1-second' : '2-second'} clip</span> of an &TEAM song.</li>
              <li>You can only play/replay the audio <span className="text-emerald-400 font-bold">maximum 2 times</span>!</li>
              <li>You have <span className="text-emerald-400 font-bold">only 2 attempts</span> to guess correctly!</li>
              <li>Pay <span className="text-yellow-400 font-bold">2 coins</span> for a <span className="font-bold text-yellow-300">Hint</span> to reveal a random blank letter!</li>
              <li>Blanks are universal and feature <span className="text-emerald-400 font-bold">English letters/words only</span> to avoid confusion.</li>
              <li>Casing and extra spaces do not matter—as long as the base title matches, it's correct!</li>
              <li>Correct Answer = <span className="text-emerald-400 font-bold">Earn {durationMode === '1s' ? '8' : '6'} coins!</span></li>
            </ul>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              startNewRound();
            }}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-lg hover:from-emerald-600 hover:to-teal-600 shadow-lg cursor-pointer text-slate-950"
          >
            Pay 2 Coins & Play!
          </motion.button>
        </div>
      )}

      {/* 2. Active Game Playing Stage */}
      {isPlaying && !isWon && !isLost && currentSong && (
        <div className="space-y-6">
          
          {/* Main Visualizer and Audio play trigger */}
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <motion.div
                animate={isPlayingAudio ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className={`w-32 h-32 rounded-full border-4 ${isPlayingAudio ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-700'} bg-slate-950 flex items-center justify-center relative overflow-hidden transition-all duration-300`}
              >
                {/* Vinyl record look */}
                <div className="absolute inset-2 border border-slate-800 rounded-full" />
                <div className="absolute inset-4 border border-slate-800 rounded-full" />
                <div className="absolute inset-8 border border-slate-800 rounded-full" />
                
                {/* Center hole */}
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-slate-950" />
                </div>
              </motion.div>
              
              {/* Music note visual indicators */}
              {isPlayingAudio && (
                <>
                  <span className="absolute -top-1 -right-2 text-xl animate-bounce text-emerald-400 delay-75">🎵</span>
                  <span className="absolute -bottom-1 -left-2 text-xl animate-bounce text-emerald-300">🎶</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              Audio plays remaining: <span className={`font-bold ${playCount >= 2 ? 'text-red-400' : 'text-emerald-400'}`}>{2 - playCount}</span> / 2
            </p>

            <div className="mt-4 flex gap-3">
              <motion.button
                whileHover={playCount < 2 ? { scale: 1.05 } : {}}
                whileTap={playCount < 2 ? { scale: 0.95 } : {}}
                disabled={loadingAudio || (playCount >= 2 && !isPlayingAudio)}
                onClick={playSnippet}
                className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-pointer shadow-md text-sm ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : playCount >= 2
                    ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {loadingAudio ? (
                  <>
                    <RefreshCw className="animate-spin text-emerald-400" size={16} />
                    Loading clip...
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <Square size={14} fill="currentColor" className="text-slate-950" />
                    Playing...
                  </>
                ) : playCount >= 2 ? (
                  <>
                    <X size={14} className="text-slate-500" />
                    No plays remaining
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" className="text-emerald-400" />
                    Play {durationMode === '1s' ? '1-Sec' : '2-Sec'} Sound
                  </>
                )}
              </motion.button>
            </div>

            {audioError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-950/40 px-4 py-2 rounded-xl mt-3">
                <AlertCircle size={14} />
                <span>{audioError}</span>
              </div>
            )}
          </div>

          {/* Letter Blanks */}
          <div className="bg-slate-950/40 py-2 px-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block text-center mb-1">
              SONG TITLE TO GUESS
            </span>
            {renderBlankLines()}
          </div>

          {/* Input Form with Shakable Container for wrong guess */}
          <motion.form 
            animate={incorrectFeedback ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            onSubmit={handleGuessSubmit} 
            className="space-y-4"
          >
            <input
              type="text"
              required
              autoFocus
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                playClickSound();
              }}
              placeholder="Type your guess here..."
              className={`w-full px-5 py-4 rounded-2xl bg-slate-950/50 border ${
                incorrectFeedback ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
              } focus:outline-none text-white text-center text-lg placeholder-slate-600 transition-all font-semibold font-sans`}
            />
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 shadow-lg cursor-pointer text-slate-950"
              >
                Submit Guess
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => startNewRound(false)}
                className="px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-sm text-slate-300 flex items-center gap-1.5 cursor-pointer"
                title="Skip this song (costs 2 coins)"
              >
                <RefreshCw size={15} />
                Skip (2c)
              </motion.button>
            </div>
          </motion.form>



          {/* Guess History list */}
          {guessHistory.length > 0 && (
            <div className="space-y-1.5 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                RECENT INCORRECT GUESSES:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {guessHistory.map((g, idx) => (
                  <span 
                     key={idx} 
                     className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. Victory/Won Stage */}
      {isWon && currentSong && (
        <div className="text-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex items-center justify-center p-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shadow-inner"
          >
            <Trophy size={54} className="animate-bounce" />
          </motion.div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            ✨ EXCELLENT GUESS! ✨
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-3 shadow-lg">
            <p className="text-slate-400 text-xs uppercase tracking-wider">You correctly identified:</p>
            <p className="text-2xl font-bold text-white tracking-wide">{cleanTitle}</p>
            <p className="text-slate-400 text-xs font-sans italic">{currentSong.album} ({currentSong.year})</p>
            
            <p className="text-emerald-400 text-sm font-semibold flex items-center justify-center gap-1 pt-1">
              🪙 Reward: +{durationMode === '1s' ? 8 : 6} Coins added to bank!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startNewRound(false)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg text-slate-950"
            >
              <RefreshCw size={16} /> Play Next Song (2 Coins)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExitAttempt}
              className="px-6 py-3.5 bg-slate-800 border border-slate-700 rounded-full font-bold text-sm hover:bg-slate-700 transition-all cursor-pointer text-slate-200"
            >
              Back to Game Hub
            </motion.button>
          </div>
        </div>
      )}

      {/* 4. Game Over / Lost Stage */}
      {isLost && currentSong && (
        <div className="text-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0.8, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex items-center justify-center p-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2 shadow-inner"
          >
            <AlertCircle size={54} className="animate-pulse" />
          </motion.div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
            💔 GAME OVER 💔
          </h3>

          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-3 shadow-lg">
            <p className="text-slate-400 text-xs uppercase tracking-wider">You used all 2 guess attempts!</p>
            <p className="text-slate-400 text-xs">The correct song was:</p>
            <p className="text-2xl font-bold text-white tracking-wide">{cleanTitle}</p>
            <p className="text-slate-400 text-xs font-sans italic">{currentSong.album} ({currentSong.year})</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startNewRound(false)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg text-slate-950"
            >
              <RefreshCw size={16} /> Try Again (2 Coins)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExitAttempt}
              className="px-6 py-3.5 bg-slate-800 border border-slate-700 rounded-full font-bold text-sm hover:bg-slate-700 transition-all cursor-pointer text-slate-200"
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
                You are currently guessing the song. Exiting now will lose your current guess session and the 2 entry coins.
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

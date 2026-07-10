/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playWinSound, playCoinSound } from '../utils/sound';
import { getThemeCardStyles } from '../utils/theme';
import { Music, HelpCircle, RefreshCw, Sparkles, HeartHandshake, Eye, Headphones } from 'lucide-react';

interface WhichSongProjectProps {
  coins: number;
  onUpdateCoins?: (amount: number) => void;
  theme?: string;
}

const SONG_RESULTS = [
  // Pool 1: Passionate Howler (Wild/Powerful/Resilient)
  {
    title: "War Cry",
    album: "First Howling: NOW",
    vibe: "Passionate Howler",
    spotifyId: "0ipvWd6JlzcXxlPwWa1YpB",
    description: "You possess a powerful, wild spirit and fierce determination. Just like 'War Cry', you stand strong, fight for your beliefs, and are never afraid to let the world hear your voice when protecting your pack."
  },
  {
    title: "Under the Skin",
    album: "First Howling: ME",
    vibe: "Passionate Howler",
    spotifyId: "7ELy2XOb07hH2VX0icvttx",
    description: "You are undergoing deep personal growth and searching for your true identity. You feel things deeply under the skin and are ready to call out to find those who truly understand you."
  },
  {
    title: "Scar to Scar",
    album: "Samidare (五月雨)",
    vibe: "Passionate Howler",
    spotifyId: "2lY53VNVtulqeWJacaf4aR",
    description: "Resilient and unbreakable. Every scar you carry is a testament to your strength and survival. You turn past pain into fuel to rise higher and support those around you."
  },
  {
    title: "Deer Hunter",
    album: "Yukiakari (雪明かり)",
    vibe: "Passionate Howler",
    spotifyId: "5b2q0YAMyqk0JD0rHZZzQB",
    description: "You have an intense, laser-like focus and unwavering determination. Once you set your eyes on a goal, you pursue it through the thickest forests with sharp wits and brave steps."
  },
  {
    title: "Go in blind",
    album: "Go In Blind (月狼)",
    vibe: "Passionate Howler",
    spotifyId: "5bsWCJ7oU0WewsWSuNDDYn",
    description: "You live with reckless courage and absolute, unwavering passion. When you believe in something or someone, you trust fully and leap forward blind to the risks, guided by your heart."
  },
  {
    title: "Back to Life",
    album: "Back to Life EP",
    vibe: "Passionate Howler",
    spotifyId: "25Artaot36s1WF8VPrdNbS",
    description: "You represent rebirth, energy, and a spectacular fresh start. No matter how cold the night gets, you always find a way to revive your passion and return stronger than ever."
  },

  // Pool 2: Sweet Dreamer (Sentimental/Melodic/Warm)
  {
    title: "バズ恋 (BUZZ LOVE)",
    album: "First Howling: ME",
    vibe: "Sweet Dreamer",
    spotifyId: "1d7qKfnqojJoZ4W0xvH9AY",
    description: "You are full of sweet, cheerful, and lighthearted affection. You bring a flutter of excitement and bright romantic dreams into the lives of everyone who knows you."
  },
  {
    title: "The Moon is Beautiful (月が綺麗ですね)",
    album: "First Howling: WE",
    vibe: "Sweet Dreamer",
    spotifyId: "6DdMTvAOBY3Flr04edEv9W",
    description: "You speak the language of quiet comfort, cozy twilight, and aesthetic romance. You find immense beauty in simple, unspoken understandings and starry moonlit walks."
  },
  {
    title: "Maybe (君にカエル)",
    album: "Samidare (五月雨)",
    vibe: "Sweet Dreamer",
    spotifyId: "5Jnc0h5MH1TKlmiIeWbUeZ",
    description: "You carry a gentle, nostalgic longing and deep sensitivity. Your heart is dreamy and romantic, always hoping for a beautiful return of feelings and warm spring days."
  },
  {
    title: "Imprinted (向日葵)",
    album: "Aoarashi (青嵐)",
    vibe: "Sweet Dreamer",
    spotifyId: "7uXaebo8IaKd0Ur1PwIRy9",
    description: "You are the ultimate sunflower – loyal, warm, and constantly looking towards the light. You imprint your love deeply on those who matter most and support them unconditionally."
  },
  {
    title: "Yukiakari (雪明かり)",
    album: "Yukiakari (雪明かり)",
    vibe: "Sweet Dreamer",
    spotifyId: "00nY3yhV4PttPKeoTnb2UG",
    description: "Serene, quiet, and deeply soothing. Just like winter snow light, you guide people gently through the coldest, darkest nights with your silent, caring warmth."
  },
  {
    title: "Magic Hour",
    album: "Magic Hour Single",
    vibe: "Sweet Dreamer",
    spotifyId: "0bk4WmYfIomQTNGWbnE8bF",
    description: "Dreamy and transformative. You cherish the magical transition between day and night, where anything feels possible and old limits melt into a starry sky of possibilities."
  },

  // Pool 3: Bright Maverick (Energetic/Fun/Quirky)
  {
    title: "Scent of You",
    album: "First Howling: ME",
    vibe: "Bright Maverick",
    spotifyId: "5ZYkN3JL30YiLogzEy38Sc",
    description: "You are stylish, magnetic, and completely unforgettable. You leave a unique, charismatic mark (like a signature scent) wherever you go with your groovy energy and effortless cool."
  },
  {
    title: "Really Crazy (チンチャおかしい)",
    album: "First Howling: NOW",
    vibe: "Bright Maverick",
    spotifyId: "64gevy8qAbKn8WzsJcxcUX",
    description: "Fun, playful, and wonderfully unique! Your quirky, enthusiastic energy is infectious, making people smile and fall completely in love with your bright, energetic vibe."
  },
  {
    title: "Dropkick",
    album: "First Howling: NOW",
    vibe: "Bright Maverick",
    spotifyId: "3epNFRifLGAHdsuLCsaVfE",
    description: "An absolute powerhouse of high-flying optimism and sporty team energy. You jump into action with a smile, ready to kick off any adventure and uplift everyone around you."
  },
  {
    title: "MEME",
    album: "MEME Single",
    vibe: "Bright Maverick",
    spotifyId: "0OqaPC4BqWWv3vY8BM1NaT",
    description: "Witty, creative, and fully connected to the pulse of the internet age. You are trendy, love sharing humor, and find clever, lighthearted ways to unite people through joy."
  },
  {
    title: "Wonderful World",
    album: "Wonderful World Single",
    vibe: "Bright Maverick",
    spotifyId: "1zTLMgEeNgwAeUidaBHo4q",
    description: "You live with a glass-half-full outlook, seeing wonder, color, and excitement in every corner of life. You turn even ordinary days into wonderful celebrations."
  },
  {
    title: "Mismatch",
    album: "Back to Life EP",
    vibe: "Bright Maverick",
    spotifyId: "45BqgvKiC7f5WAou7ECUDc",
    description: "Boldly unconventional and full of contrasts! You enjoy mixing matching styles, being unexpected, and standing out from the crowd with a cheeky, confident smile."
  },

  // Pool 4: Pack Pathfinder (Inspiring/Loyal/Resilient)
  {
    title: "FIREWORK",
    album: "First Howling: WE",
    vibe: "Pack Pathfinder",
    spotifyId: "5FWZ9epRluqJTzOnsayeo2",
    description: "You are a radiant catalyst for passion, youth, and explosive connection. Your loyalty is fate-like; when you connect with others, it sets off an unforgettable firework in the sky."
  },
  {
    title: "Road Not Taken",
    album: "First Howling: WE",
    vibe: "Pack Pathfinder",
    spotifyId: "6srQFZKaR7oj41wg7lCtJi",
    description: "You are a brave pioneer who takes the road less traveled. Guided by inner compass and group solidarity, you march confidently into the unknown with your pack."
  },
  {
    title: "Running with the pack",
    album: "First Howling: NOW",
    vibe: "Pack Pathfinder",
    spotifyId: "1lbn4BraBUHY7jFf3oe1WY",
    description: "You represent the ultimate brotherhood, alignment, and loyalty. You thrive when running in unison with your closest allies, trusting them with your life and sharing every victory."
  },
  {
    title: "Aoarashi (青嵐)",
    album: "Aoarashi (青嵐)",
    vibe: "Pack Pathfinder",
    spotifyId: "0AOSmgHSkg9jH73jGy2QNG",
    description: "You are a refreshing, energetic summer wind. You bring a cool breeze of youth, fresh momentum, and clear blue sky optimism into any group, leading them to new shores."
  },
  {
    title: "Beat the Odds",
    album: "Beat the Odds Single",
    vibe: "Pack Pathfinder",
    spotifyId: "6VzG7TJrjWlfhKMjOm6JjX",
    description: "A determined leader and strategist who conquers every obstacle. You thrive under pressure, turn the tables against all odds, and carry your companions to victory."
  },
  {
    title: "Jyuugoya (十五夜)",
    album: "Jyuugoya (十五夜)",
    vibe: "Pack Pathfinder",
    spotifyId: "5Dq55ANfgVSnIh6gzgclkx",
    description: "You are warm, festive, and community-minded. You cherish the golden harvest moon, gathering friends together for celebration, and building a secure home where everyone belongs."
  }
];

const QUESTIONS = [
  {
    id: 1,
    question: "What is your perfect environment for thinking?",
    options: [
      { text: "A wild, windy forest where I can hear the trees rustle.", type: "Passionate Howler" },
      { text: "A cozy, warm room under a soft starry night.", type: "Sweet Dreamer" },
      { text: "A bustling city center with bright neon lights and loud beats.", type: "Bright Maverick" },
      { text: "A scenic hilltop looking over a vast blue ocean.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 2,
    question: "When you encounter a difficult challenge, what is your style?",
    options: [
      { text: "Tackle it head-on with full energy, even if I get a few scars.", type: "Passionate Howler" },
      { text: "Take a moment to reflect and find the emotional lesson.", type: "Sweet Dreamer" },
      { text: "Find a creative, out-of-the-box shortcut and laugh through it.", type: "Bright Maverick" },
      { text: "Rally my closest friends and figure it out together as a team.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 3,
    question: "Choose an element of nature that speaks to your soul:",
    options: [
      { text: "Fire – wild, warm, and untamed.", type: "Passionate Howler" },
      { text: "Rain – sentimental, calming, and restorative.", type: "Sweet Dreamer" },
      { text: "Lightning – sudden, brilliant, and full of electricity.", type: "Bright Maverick" },
      { text: "Wind – constantly moving, fresh, and free.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 4,
    question: "Which role do you naturally fall into within a group of friends?",
    options: [
      { text: "The protector – standing up for anyone who is treated unfairly.", type: "Passionate Howler" },
      { text: "The listener – providing comforting words and silent support.", type: "Sweet Dreamer" },
      { text: "The mood-maker – bringing laughter, energy, and trendy jokes.", type: "Bright Maverick" },
      { text: "The guide – keeping everyone aligned and pushing them forward.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 5,
    question: "Select a core value that guides your life's decisions:",
    options: [
      { text: "Resilience – never staying down when knocked over.", type: "Passionate Howler" },
      { text: "Authenticity – being true to my deepest feelings and dreams.", type: "Sweet Dreamer" },
      { text: "Joy – living in the moment and finding humor everywhere.", type: "Bright Maverick" },
      { text: "Loyalty – standing together through thick and thin.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 6,
    question: "What style of music gets you moving instantly?",
    options: [
      { text: "Heavy, intense anthems with driving drums and passionate rock vocals.", type: "Passionate Howler" },
      { text: "Dreamy, acoustic melodies with beautiful emotional harmonies.", type: "Sweet Dreamer" },
      { text: "Groovy, uptempo pop with a killer bassline and dance break.", type: "Bright Maverick" },
      { text: "Uplifting, soaring stadium tracks that make everyone sing along.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 7,
    question: "If you could choose a magical superpower, it would be:",
    options: [
      { text: "Superhuman healing – recovering instantly from any injury or setback.", type: "Passionate Howler" },
      { text: "Time control – pausing time to enjoy beautiful fleeting moments.", type: "Sweet Dreamer" },
      { text: "Teleportation – skipping the boring travel to be anywhere instantly.", type: "Bright Maverick" },
      { text: "Telepathy – connecting minds to understand friends perfectly.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 8,
    question: "What does 'success' mean to you deeply?",
    options: [
      { text: "Breaking through my own limitations and proving my strength.", type: "Passionate Howler" },
      { text: "Living a peaceful life filled with genuine love and art.", type: "Sweet Dreamer" },
      { text: "Creating something unique that makes a splash and starts a trend.", type: "Bright Maverick" },
      { text: "Reaching the summit together with my pack, leaving no one behind.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 9,
    question: "How do you show someone that you care about them?",
    options: [
      { text: "Defending them fiercely and showing absolute physical protection.", type: "Passionate Howler" },
      { text: "Sending them lovely handwritten letters or custom cozy gifts.", type: "Sweet Dreamer" },
      { text: "Sharing exciting new music, memes, and fun adventures together.", type: "Bright Maverick" },
      { text: "Standing right beside them, offering unwavering loyalty.", type: "Pack Pathfinder" }
    ]
  },
  {
    id: 10,
    question: "Pick a time of the day that feels most magical to you:",
    options: [
      { text: "Midnight – when the inner wildness and moon are highest.", type: "Passionate Howler" },
      { text: "Twilight / Golden Hour – when sky is painted in soft pastel shades.", type: "Sweet Dreamer" },
      { text: "High Noon – when the sun is brightest and full of energy.", type: "Bright Maverick" },
      { text: "Dawn – when the fresh morning light promises a brand new path.", type: "Pack Pathfinder" }
    ]
  }
];

export default function WhichSongProject({ coins, onUpdateCoins, theme }: WhichSongProjectProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<{ [key: string]: number }>({
    "Passionate Howler": 0,
    "Sweet Dreamer": 0,
    "Bright Maverick": 0,
    "Pack Pathfinder": 0
  });
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultSong, setResultSong] = useState<typeof SONG_RESULTS[0] | null>(null);

  const themeStyles = getThemeCardStyles(theme || 'darkMoon');

  const startQuiz = () => {
    playClickSound();

    if (coins < 50) {
      alert("You need at least 50 coins to start the personality test!");
      return;
    }

    if (onUpdateCoins) {
      onUpdateCoins(-50);
      playCoinSound();
    }

    // Reset states
    setScores({
      "Passionate Howler": 0,
      "Sweet Dreamer": 0,
      "Bright Maverick": 0,
      "Pack Pathfinder": 0
    });
    setSelectedAnswers([]);
    setCurrentIdx(0);
    setShowResult(false);
    setResultSong(null);
    setIsPlaying(true);
  };

  const handleOptionSelect = (type: string) => {
    playClickSound();

    // Accumulate scores
    const updatedScores = { ...scores };
    updatedScores[type] = (updatedScores[type] || 0) + 1;
    setScores(updatedScores);

    const updatedAnswers = [...selectedAnswers, type];
    setSelectedAnswers(updatedAnswers);

    // Stagger transitions to next question nicely
    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Compute outcome on complete
        calculateResultSong(updatedScores, updatedAnswers);
      }
    }, 250);
  };

  const calculateResultSong = (finalScores: { [key: string]: number }, finalAnswers: string[]) => {
    // Find the highest vibe category
    let highestVibe = "Passionate Howler";
    let maxScore = -1;

    Object.keys(finalScores).forEach(key => {
      if (finalScores[key] > maxScore) {
        maxScore = finalScores[key];
        highestVibe = key;
      }
    });

    // Extract all songs corresponding to this vibe pool (there are 6 songs per vibe!)
    const pool = SONG_RESULTS.filter(s => s.vibe === highestVibe);

    // Select a song from the pool of 6 using a deterministically pseudorandom formula based on the sum of answer selections to avoid pure randomness
    const sumChars = finalAnswers.join("").length;
    const finalIndex = sumChars % pool.length;
    const matchedSong = pool[finalIndex] || pool[0];

    setResultSong(matchedSong);
    setShowResult(true);
    playWinSound();
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      playClickSound();
      // Undo the last selected answer's score
      const lastAnswerType = selectedAnswers[selectedAnswers.length - 1];
      if (lastAnswerType) {
        const updatedScores = { ...scores };
        updatedScores[lastAnswerType] = Math.max(0, updatedScores[lastAnswerType] - 1);
        setScores(updatedScores);
      }
      setSelectedAnswers(prev => prev.slice(0, -1));
      setCurrentIdx(prev => prev - 1);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 relative shadow-xl font-fredoka ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.textPrimary}`}>
      <AnimatePresence mode="wait">
        {!isPlaying && !showResult && (
          /* Introduction Screen */
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-6 space-y-6"
          >
            <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 rounded-full border border-pink-500/25 text-pink-500">
              <span className="text-5xl">🎵</span>
            </div>

            <div className="space-y-2">
              <h3 className={`text-3xl font-black tracking-wide uppercase ${themeStyles.title}`}>Which &TEAM Song Are You?</h3>
              <p className={`text-sm max-w-md mx-auto leading-relaxed ${themeStyles.textSecondary}`}>
                Every &TEAM track carries a unique pack identity, lore resonance, and emotional tone. Answer 10 multiple-choice questions to map your personality with their signature discography!
              </p>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className={`px-8 py-3.5 rounded-full font-bold text-lg shadow-lg cursor-pointer ${themeStyles.btnAccent}`}
              >
                Start Quiz (50 Coins)
              </motion.button>
            </div>
          </motion.div>
        )}

        {isPlaying && !showResult && (
          /* Active Quiz Screen */
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header progress line */}
            <div className={`flex justify-between items-center text-xs uppercase tracking-widest ${themeStyles.textSecondary}`}>
              <span>Question {currentIdx + 1} of 10</span>
              <span className={`font-bold ${themeStyles.textHighlight}`}>&SONG MATCH</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${themeStyles.isLight ? 'bg-pink-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center min-h-[110px] flex items-center justify-center bg-black/5 dark:bg-black/30">
              <h4 className={`text-lg md:text-xl font-bold leading-relaxed ${themeStyles.title}`}>
                {QUESTIONS[currentIdx].question}
              </h4>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {QUESTIONS[currentIdx].options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIdx] === option.type;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOptionSelect(option.type)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm md:text-base leading-relaxed cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-400 dark:border-pink-500 text-pink-600 dark:text-pink-300 font-bold shadow-sm shadow-pink-500/10'
                        : `border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 ${themeStyles.textPrimary}`
                    }`}
                  >
                    {option.text}
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
              <button
                onClick={handleBack}
                disabled={currentIdx === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  currentIdx === 0
                    ? 'opacity-40 border-transparent text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : `border-slate-200 dark:border-slate-850 bg-white/20 dark:bg-slate-850/30 hover:bg-white dark:hover:bg-slate-800 ${themeStyles.textPrimary} cursor-pointer`
                }`}
              >
                Back
              </button>
              <span className={`text-[11px] ${themeStyles.textSecondary}`}>Select an option to proceed</span>
            </div>
          </motion.div>
        )}

        {showResult && (
          /* Results Card Reveal */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center border-b border-slate-200 dark:border-white/5 pb-4">
              <span className={`text-xs uppercase font-extrabold tracking-widest ${themeStyles.textHighlight}`}>YOUR SIGNATURE ANTHEM</span>
              <h3 className={`text-2xl font-black mt-1 ${themeStyles.title}`}>TEST RESULTS</h3>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`border-2 border-indigo-500/30 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center text-center shadow-xl shadow-indigo-500/5 space-y-4 ${themeStyles.cardBg}`}
            >
              {/* Soft pink celestial light behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-7xl mb-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-full border border-indigo-500/20 shadow-lg animate-pulse">
                🎵
              </div>

              <h4 className={`text-3xl font-black tracking-wide uppercase ${themeStyles.textHighlight}`}>{resultSong?.title}</h4>

              <div className="flex gap-2.5">
                <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${themeStyles.accentBg}`}>
                  ALBUM: {resultSong?.album}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-wider">
                  Vibe: {resultSong?.vibe}
                </span>
              </div>

              <p className={`text-sm max-w-sm italic leading-relaxed pt-2 ${themeStyles.textPrimary}`}>
                "{resultSong?.description}"
              </p>

              {/* Dynamic Interactive Spotify Embed */}
              {resultSong?.spotifyId && (
                <div className={`w-full max-w-sm rounded-2xl overflow-hidden border shadow-xl mt-4 z-10 border-slate-200 dark:border-slate-800 ${themeStyles.cardBg}`}>
                  <iframe
                    src={`https://open.spotify.com/embed/track/${resultSong.spotifyId}`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowFullScreen={false}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="w-full animate-fadeIn"
                  />
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="text-center pt-2">
              <button
                onClick={startQuiz}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer ${themeStyles.btnAccent}`}
              >
                <RefreshCw size={12} /> Retake Test (50 Coins)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound } from '../utils/sound';
import { getThemeCardStyles } from '../utils/theme';

// ==========================================
// 1. DATA DEFINITIONS (EXACTLY AS REQUESTED)
// ==========================================

export interface QuizQuestionOption {
  text: string;
  type: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizQuestionOption[];
}

export const quizQuestions: QuizQuestion[] = [
  { id: 1, question: "Your group project partner isn't pulling their weight. You:", options: [
      { text: "Take over and reassign tasks yourself", type: "Alpha" },
      { text: "Quietly do their part without making it a big deal", type: "Beta" },
      { text: "Joke about it to lighten the mood, then handle it", type: "Omega" },
      { text: "Just do your part well and hope it works out", type: "Subordinate" },
      { text: "Get anxious and ask someone else what to do", type: "Pup" }
  ]},
  { id: 2, question: "Pick how you enter a room:", options: [
      { text: "Everyone naturally looks up when you walk in", type: "Alpha" },
      { text: "You scan the room, check who needs backup", type: "Beta" },
      { text: "You're already making someone laugh before you sit down", type: "Omega" },
      { text: "You slide in quietly, get comfortable, observe", type: "Subordinate" },
      { text: "You're excited, a little loud, glad to be there", type: "Pup" }
  ]},
  { id: 3, question: "There's tension between two friends in your group. You:", options: [
      { text: "Step in and settle it — you decide what's fair", type: "Alpha" },
      { text: "Support whichever friend needs backup", type: "Beta" },
      { text: "Crack a joke to break the tension so no one has to \"lose\"", type: "Omega" },
      { text: "Stay out of it, hope it resolves on its own", type: "Subordinate" },
      { text: "Feel upset and just want everyone to be okay again", type: "Pup" }
  ]},
  { id: 4, question: "What do people come to you for?", options: [
      { text: "Direction — they want you to decide", type: "Alpha" },
      { text: "Reassurance — they know you'll show up", type: "Beta" },
      { text: "Comfort — you make bad days feel lighter", type: "Omega" },
      { text: "Help — you're reliable with tasks", type: "Subordinate" },
      { text: "Nothing yet — you're still earning your place", type: "Pup" }
  ]},
  { id: 5, question: "How do you react to being told \"no\"?", options: [
      { text: "Push back, you usually have a good reason", type: "Alpha" },
      { text: "Accept it if it comes from someone you trust", type: "Beta" },
      { text: "Make a joke about it and move on fast", type: "Omega" },
      { text: "Accept it without much resistance", type: "Subordinate" },
      { text: "Feel a little hurt, need reassurance after", type: "Pup" }
  ]},
  { id: 6, question: "Pick your instinct in a new social situation:", options: [
      { text: "Take the lead, introduce people to each other", type: "Alpha" },
      { text: "Stick close to someone you already know, watch their back", type: "Beta" },
      { text: "Make yourself the icebreaker", type: "Omega" },
      { text: "Ease in slowly, listen more than talk", type: "Subordinate" },
      { text: "Get nervous but excited, stay close to the group", type: "Pup" }
  ]},
  { id: 7, question: "Your honest flaw is:", options: [
      { text: "You can come off controlling", type: "Alpha" },
      { text: "You put others first, sometimes too much", type: "Beta" },
      { text: "You use humor to avoid deeper stuff", type: "Omega" },
      { text: "You avoid conflict even when you shouldn't", type: "Subordinate" },
      { text: "You need a lot of reassurance", type: "Pup" }
  ]},
  { id: 8, question: "Pick a task in a group project:", options: [
      { text: "Leading and assigning everyone's roles", type: "Alpha" },
      { text: "Making sure everything runs smoothly behind the leader", type: "Beta" },
      { text: "Keeping morale up when things get stressful", type: "Omega" },
      { text: "Doing the actual detailed work quietly", type: "Subordinate" },
      { text: "Learning from everyone, absorbing it all", type: "Pup" }
  ]},
  { id: 9, question: "When you're upset, you:", options: [
      { text: "Get direct about what's wrong", type: "Alpha" },
      { text: "Go to the person you trust most", type: "Beta" },
      { text: "Deflect with humor until you're ready to talk", type: "Omega" },
      { text: "Keep it to yourself for a while", type: "Subordinate" },
      { text: "Need comfort pretty quickly", type: "Pup" }
  ]},
  { id: 10, question: "Your friends trust you with:", options: [
      { text: "Big decisions", type: "Alpha" },
      { text: "Their secrets", type: "Beta" },
      { text: "Keeping things fun", type: "Omega" },
      { text: "Getting things done", type: "Subordinate" },
      { text: "Nothing serious yet, but they adore you", type: "Pup" }
  ]},
  { id: 11, question: "Pick an animal instinct:", options: [
      { text: "Leading the pack on the hunt", type: "Alpha" },
      { text: "Guarding the pack from the back", type: "Beta" },
      { text: "Play-fighting to keep the pack bonded", type: "Omega" },
      { text: "Following trail markers, staying useful", type: "Subordinate" },
      { text: "Tumbling around, learning the ropes", type: "Pup" }
  ]},
  { id: 12, question: "Last one — how do you want to be remembered?", options: [
      { text: "As someone who led well", type: "Alpha" },
      { text: "As someone who was always there", type: "Beta" },
      { text: "As someone who made things lighter", type: "Omega" },
      { text: "As someone dependable", type: "Subordinate" },
      { text: "As someone who grew a lot", type: "Pup" }
  ]}
];

export interface WolfTypeResultInfo {
  title: string;
  description: string;
  image: string;
}

export const wolfTypeResults: { [key: string]: WolfTypeResultInfo } = {
  Alpha: { 
    title: "Alpha Wolf", 
    description: "You are the ultimate leader of the pack. Confident, protective, and naturally decisive, you take charge to make sure everyone is safe and has a clear sense of direction. You face challenges head-on and are ready to stand at the frontline.", 
    image: "" 
  },
  Beta: { 
    title: "Beta Wolf", 
    description: "You are the dependable second-in-command and the ultimate guardian. Loyal, robust, and highly reliable, you check who needs backup and enforce unity. Your strength and protective instinct keep the pack steady and safe.", 
    image: "" 
  },
  Omega: { 
    title: "Omega Wolf", 
    description: "You are the vital peacekeeper and lighthearted spirit of the pack. Playful, humorous, and highly empathetic, you diffuse tension and keep the collective morale high. You use laughter and warmth to bond everyone together.", 
    image: "" 
  },
  Subordinate: { 
    title: "Subordinate Wolf", 
    description: "You are the resilient, hardworking support of the pack. Quietly adaptable, highly dependable, and conflict-averse, you work behind the scenes to get things done perfectly. Your steady commitment keeps everything running seamlessly.", 
    image: "" 
  },
  Pup: { 
    title: "Pup", 
    description: "You carry the pure, curious, and affectionate youngest energy of the pack. Enthusiastic, loving, and always growing, you learn from everyone around you. Your open-hearted nature and adorable spark make you universally adored.", 
    image: "" 
  }
};

export const wolfTypeCompatibility: { [key: string]: string } = {
  Alpha: "Beta",
  Beta: "Alpha",
  Omega: "Subordinate",
  Subordinate: "Omega",
  Pup: "Beta"
};

export interface PartnerMember {
  member: string;
  image: string;
}

export const membersByType: { [key: string]: PartnerMember[] } = {
  Alpha: [ { member: "K", image: "" } ],
  Beta: [
    { member: "Nicholas", image: "" },
    { member: "Fuma", image: "" }
  ],
  Omega: [
    { member: "Jo", image: "" },
    { member: "Maki", image: "" }
  ],
  Subordinate: [
    { member: "EJ", image: "" },
    { member: "Harua", image: "" }
  ],
  Pup: [
    { member: "Taki", image: "" },
    { member: "Yuma", image: "" }
  ]
};

export const idealTypeFlavor: { [key: string]: string } = {
  K: "As Khan, he doesn't demand loyalty — he earns it. He'd fall for someone steady and unshaken, who doesn't need him to be anything other than exactly who he is.",
  Nicholas: "As Najak, fiercely protective and quick-tempered when someone he loves is threatened. He'd want a partner who lets him stand guard without ever needing to ask why.",
  EJ: "As Enzy, gentle on the surface but sharp underneath — he notices everything and says little. He'd be drawn to someone who can sit in silence with him and still feel like they understand.",
  Fuma: "As Mahan, the 'Team Dad' who stays calm even in danger. He'd want someone who lets him take care of them, but who also checks in on him — because he rarely admits when he needs it.",
  Yuma: "As Louis, he follows his twin more than anyone, quietly anxious underneath his calm. He'd need a partner who's patient with his worries and doesn't rush him to be braver than he feels.",
  Jo: "As Camill, hot-tempered and blunt, but a total softie once you're past the attitude. He'd fall hard for someone who can match his fire without taking his bark personally.",
  Harua: "As Ruslan, the quiet one who watches more than he speaks. He'd want someone who doesn't need constant noise to feel close — someone comfortable just existing beside him.",
  Taki: "As Tahel, the pack's youngest — bubbly, trusting, always looking to the people he loves for guidance. He'd want a partner who's warm and reassuring, someone who makes him feel safe being open.",
  Maki: "As Luka, the pack's resident troublemaker with an artistic, mischievous streak. He'd be drawn to someone who can laugh at his teasing and tease him right back — someone who keeps up."
};

interface WolfTypeProjectProps {
  coins: number;
  onUpdateCoins?: (amount: number) => void;
  theme?: string;
}

export default function WolfTypeProject({ coins, onUpdateCoins, theme }: WolfTypeProjectProps) {
  const themeStyles = getThemeCardStyles(theme || 'darkMoon');
  // Configurable Cost
  const wolfTypeQuizCost = 50;

  // Quiz States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Track answer history: Array of selected option types (indexes match question index)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  // Result States
  const [resultType, setResultType] = useState<string>("");
  const [matchedPartner, setMatchedPartner] = useState<{ member: string; flavor: string } | null>(null);

  // ==========================================
  // 2. CORE SCORING & COMPATIBILITY LOGIC
  // ==========================================

  /**
   * Evaluates the answers array and determines the result.
   * Pure vanilla logic used to calculate type scores and handle ties randomly.
   */
  const calculateResult = (answers: string[]) => {
    // Score object initialization
    const scores: { [key: string]: number } = {
      Alpha: 0,
      Beta: 0,
      Omega: 0,
      Subordinate: 0,
      Pup: 0
    };

    // Increment score for each selected answer's type
    answers.forEach(type => {
      if (scores[type] !== undefined) {
        scores[type] += 1;
      }
    });

    // Find highest score
    let highestScore = -1;
    Object.keys(scores).forEach(type => {
      if (scores[type] > highestScore) {
        highestScore = scores[type];
      }
    });

    // Collect all types sharing the highest score (for tie-breaking)
    const tiedTypes: string[] = [];
    Object.keys(scores).forEach(type => {
      if (scores[type] === highestScore) {
        tiedTypes.push(type);
      }
    });

    // Tie-breaker: Randomly select among tied types (ensuring not always same default)
    const finalType = tiedTypes[Math.floor(Math.random() * tiedTypes.length)];
    
    // Ideal Wolf Partner compatibility logic
    const compatiblePartnerType = wolfTypeCompatibility[finalType];
    const candidateMembers = membersByType[compatiblePartnerType] || [];
    
    // Randomly select one member of that compatible type
    const chosenMemberObj = candidateMembers[Math.floor(Math.random() * candidateMembers.length)];
    const chosenMemberName = chosenMemberObj ? chosenMemberObj.member : "Fuma";
    const flavorText = idealTypeFlavor[chosenMemberName] || "";

    setResultType(finalType);
    setMatchedPartner({
      member: chosenMemberName,
      flavor: flavorText
    });
    setShowResult(true);
    playCoinSound();
  };

  // ==========================================
  // 3. ACCESS CONTROL & LIFECYCLE HANDLERS
  // ==========================================

  /**
   * Helper functions simulating required hooks:
   * check hasEnoughCoins(X), call deductCoins(X) if applicable.
   */
  const hasEnoughCoins = (cost: number): boolean => {
    return coins >= cost;
  };

  const deductCoins = (cost: number) => {
    if (cost > 0 && onUpdateCoins) {
      onUpdateCoins(-cost);
    }
  };

  const handleStartQuiz = () => {
    playClickSound();

    // Verification of coins prior to quiz entry
    if (!hasEnoughCoins(wolfTypeQuizCost)) {
      alert(`You need at least ${wolfTypeQuizCost} coins to start the wolf type quiz!`);
      return;
    }

    // Spend coins if quiz cost is above 0
    deductCoins(wolfTypeQuizCost);

    // Initialize states
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setResultType("");
    setMatchedPartner(null);
    setIsPlaying(true);
  };

  const handleOptionSelect = (type: string) => {
    playClickSound();
    
    // Set or overwrite the selected answer for the current question
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = type;
    setSelectedAnswers(updatedAnswers);

    // Auto-advance to next question or complete quiz after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Final question complete: compute outcomes
        calculateResult(updatedAnswers);
      }
    }, 250);
  };

  const handleBack = () => {
    playClickSound();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRetake = () => {
    handleStartQuiz();
  };

  // UI Selection checks
  const currentSelection = selectedAnswers[currentQuestionIndex];
  const isNextDisabled = !currentSelection;
  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 relative shadow-xl font-fredoka ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.textPrimary}`}>
      
      {/* 1. Landing Screen */}
      {!isPlaying && !showResult && (
        <div className="text-center py-6 space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 rounded-full border border-pink-500/25 text-pink-500">
            <span className="text-5xl">🐺</span>
          </div>

          <div className="space-y-2">
            <h3 className={`text-3xl font-black tracking-wide uppercase ${themeStyles.title}`}>wolf type</h3>
            <p className={`text-sm max-w-md mx-auto leading-relaxed ${themeStyles.textSecondary}`}>
              Find your place in the pack! Discover which wolf pack hierarchy role aligns with your traits and reveal your ideal wolf partner from &TEAM.
            </p>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartQuiz}
              className={`px-8 py-3.5 rounded-full font-bold text-lg shadow-lg cursor-pointer ${themeStyles.btnAccent}`}
            >
              Start Quiz (50 Coins)
            </motion.button>
          </div>
        </div>
      )}

      {/* 2. Active Quiz Progression */}
      {isPlaying && !showResult && (
        <div className="space-y-6">
          {/* Header Progress Row */}
          <div className={`flex justify-between items-center text-xs uppercase tracking-widest ${themeStyles.textSecondary}`}>
            <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <span className={`font-bold ${themeStyles.textHighlight}`}>&WOLF TYPE</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${themeStyles.isLight ? 'bg-pink-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
              style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center min-h-[110px] flex items-center justify-center bg-black/5 dark:bg-black/30">
            <h4 className={`text-lg md:text-xl font-bold leading-relaxed ${themeStyles.title}`}>
              {quizQuestions[currentQuestionIndex].question}
            </h4>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {quizQuestions[currentQuestionIndex].options.map((opt, idx) => {
              const isSelected = currentSelection === opt.type;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOptionSelect(opt.type)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm md:text-base leading-relaxed cursor-pointer ${
                    isSelected 
                      ? 'bg-pink-500/15 border-pink-400 dark:border-pink-500 text-pink-600 dark:text-pink-300 font-bold shadow-sm shadow-pink-500/10' 
                      : `border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 ${themeStyles.textPrimary}`
                  }`}
                >
                  {opt.text}
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                currentQuestionIndex === 0 
                  ? 'opacity-40 border-transparent text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : `border-slate-200 dark:border-slate-850 bg-white/20 dark:bg-slate-850/30 hover:bg-white dark:hover:bg-slate-800 ${themeStyles.textPrimary} cursor-pointer`
              }`}
            >
              Back
            </button>
            <span className={`text-[11px] ${themeStyles.textSecondary}`}>Select an option to proceed</span>
          </div>
        </div>
      )}

      {/* 3. Outcome Card Presentation */}
      {showResult && (
        <div className="space-y-6">
          <div className="text-center border-b border-slate-200 dark:border-slate-850 pb-4">
            <span className={`text-xs uppercase font-extrabold tracking-widest ${themeStyles.textHighlight}`}>Quiz Completed</span>
            <h3 className={`text-3xl font-black tracking-wide ${themeStyles.title}`}>YOUR PACK PROFILE</h3>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`border border-slate-200 dark:border-slate-850 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center text-center shadow-2xl ${themeStyles.cardBg}`}
          >
            {/* Visual background atmospheric orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            <span className="text-6xl mb-4 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-full inline-block">🐺</span>

            {/* Wolf Type Details */}
            <h4 className={`text-3xl font-black uppercase tracking-wide ${themeStyles.textHighlight}`}>
              {wolfTypeResults[resultType]?.title || resultType}
            </h4>

            <p className={`mt-4 text-sm leading-relaxed max-w-md ${themeStyles.textPrimary}`}>
              {wolfTypeResults[resultType]?.description}
            </p>

            {/* Compatibility Partner Feature */}
            {matchedPartner && (
              <div className="w-full mt-6 pt-5 border-t border-slate-200 dark:border-slate-850 text-left bg-black/5 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-850/80">
                <span className={`text-[10px] font-extrabold uppercase block tracking-widest mb-3 ${themeStyles.textHighlight}`}>
                  💖 IDEAL WOLF PARTNER MATCH
                </span>
                
                <h5 className={`text-sm font-bold mb-1 leading-relaxed ${themeStyles.title}`}>
                  You're a/an {resultType} Wolf 🐺 — you might be {matchedPartner.member}'s wolf type.
                </h5>

                <p className={`text-xs md:text-sm leading-relaxed italic mt-2 pl-3 border-l-2 border-pink-500/40 ${themeStyles.textSecondary}`}>
                  {matchedPartner.flavor}
                </p>
              </div>
            )}
          </motion.div>

          <div className="text-center pt-2">
            <button
              onClick={handleRetake}
              className={`px-6 py-3 rounded-full text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${themeStyles.btnAccent}`}
            >
              🔄 Retake Quiz (50 Coins)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

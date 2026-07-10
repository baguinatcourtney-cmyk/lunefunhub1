/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QUIZ_QUESTIONS } from '../../data';
import { QuizQuestion } from '../../types';
import { playClickSound, playCoinSound, playWinSound, playFailSound } from '../../utils/sound';
import { X, HelpCircle, Trophy, RefreshCw, Eye, AlertTriangle } from 'lucide-react';

interface LuneQuizProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

export default function LuneQuiz({ coins, onUpdateCoins, onExit }: LuneQuizProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (isPlaying && !isFinished) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  // Initialize questions
  const startNewRun = () => {
    if (coins < 5) {
      alert("You need at least 5 coins to enter this game!");
      return;
    }

    // Deduct entry fee
    onUpdateCoins(-5);
    playCoinSound();

    // No-repetition selection logic using localStorage to persist across entries
    let askedIds: number[] = [];
    try {
      const stored = localStorage.getItem('lune_quiz_asked_ids');
      if (stored) {
        askedIds = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }

    // Keep history of the last 200 asked questions (representing 20 previous runs/entries).
    // This ensures questions do not repeat for at least 20 entries into the game.
    if (askedIds.length > 200) {
      askedIds = askedIds.slice(-200);
    }

    // Filter out already asked questions
    let availableQuestions = QUIZ_QUESTIONS.filter(q => !askedIds.includes(q.id));

    // Fallback: if available questions are less than 10, slice the history to ensure 10 are available
    if (availableQuestions.length < 10) {
      askedIds = askedIds.slice(-(QUIZ_QUESTIONS.length - 10));
      availableQuestions = QUIZ_QUESTIONS.filter(q => !askedIds.includes(q.id));
    }

    // Shuffle and pick 10 random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 10);

    // Reorder options dynamically to alternate correct answers following the requested pattern:
    // (a, c, c, b, a, d, a, c, b, a, d, d, d, a)
    const pattern = ['a', 'c', 'c', 'b', 'a', 'd', 'a', 'c', 'b', 'a', 'd', 'd', 'd', 'a'];
    const processedPicked = picked.map((q, idx) => {
      const targetLetter = pattern[idx % pattern.length];
      const targetIdx = targetLetter === 'a' ? 0 : targetLetter === 'b' ? 1 : targetLetter === 'c' ? 2 : 3;

      // Extract all options that are not the correct answer
      const incorrectOptions = q.options.filter(o => o !== q.answer);

      // Re-assemble options so the correct answer is exactly at targetIdx
      const newOptions: string[] = [];
      let incorrectCounter = 0;
      for (let i = 0; i < 4; i++) {
        if (i === targetIdx) {
          newOptions.push(q.answer);
        } else {
          newOptions.push(incorrectOptions[incorrectCounter] || '');
          incorrectCounter++;
        }
      }

      return {
        ...q,
        options: newOptions
      };
    });

    // Save picked questions' ids into the storage so they are not repeated
    const newAskedIds = [...askedIds, ...picked.map(q => q.id)];
    try {
      localStorage.setItem('lune_quiz_asked_ids', JSON.stringify(newAskedIds));
    } catch (e) {
      // ignore
    }

    setQuestions(processedPicked);
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    playClickSound();
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentIdx].answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Move to next question after short delay
    setTimeout(() => {
      if (currentIdx < 9) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Finished the quiz!
        setIsFinished(true);
        if (score + (isCorrect ? 1 : 0) === 10) {
          // Perfect score reward!
          onUpdateCoins(10);
          playWinSound();
        } else {
          playFailSound();
        }
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 text-white relative shadow-xl font-fredoka">
      
      {/* Top Bar Controls */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="text-pink-400" size={24} />
          <h2 className="text-2xl font-bold tracking-wide">LUNÉ Quiz</h2>
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

      {/* Instructions Overlay */}
      {showInstructions && !isPlaying && !isFinished && (
        <div className="space-y-6 text-center py-6">
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-pink-300 mb-3">🎮 GAME MECHANICS</h3>
            <ul className="text-slate-300 space-y-2 text-sm text-left max-w-md mx-auto list-disc pl-5">
              <li>Entry Fee: <span className="text-yellow-400 font-bold">5 coins</span></li>
              <li>You will face <span className="font-semibold text-white">10 random questions</span> about &TEAM's group info, members, and details.</li>
              <li>Get a <span className="text-emerald-400 font-bold">Perfect Score (10/10)</span> to win <span className="text-yellow-400 font-bold">10 coins</span>!</li>
              <li>Questions are randomized each run so no two runs are identical.</li>
            </ul>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowInstructions(false);
              startNewRun();
            }}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-lg hover:from-pink-600 hover:to-purple-600 shadow-lg cursor-pointer"
          >
            Pay 5 Coins & Play!
          </motion.button>
        </div>
      )}

      {/* Active Quiz Game */}
      {isPlaying && !isFinished && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>QUESTION {currentIdx + 1} OF 10</span>
            <span className="font-bold text-pink-400">SCORE: {score}/10</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 min-h-[100px] flex items-center justify-center text-center">
            <h3 className="text-lg md:text-xl font-medium leading-relaxed">
              {questions[currentIdx].question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions[currentIdx].options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === questions[currentIdx].answer;
              
              let buttonStyle = "border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-800 hover:border-slate-500";
              
              if (isAnswered) {
                if (isSelected) {
                  buttonStyle = isCorrectAnswer 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" 
                    : "bg-red-500/20 border-red-500 text-red-300";
                } else if (isCorrectAnswer) {
                  buttonStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                } else {
                  buttonStyle = "border-slate-800 bg-slate-900/20 text-slate-600";
                }
              }

              return (
                <motion.button
                  key={idx}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerSelect(option)}
                  className={`px-5 py-4 rounded-xl border text-left font-medium transition-all duration-150 text-base flex justify-between items-center ${buttonStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrectAnswer && <span className="text-emerald-400">✓</span>}
                  {isAnswered && isSelected && !isCorrectAnswer && <span className="text-red-400">✗</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Complete Page */}
      {isFinished && (
        <div className="text-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400 mb-2"
          >
            <Trophy size={48} className="animate-bounce" />
          </motion.div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            {score === 10 ? '✨ PERFECT SCORE! ✨' : 'QUIZ COMPLETED!'}
          </h3>
          
          <div className="bg-slate-800/50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-700/50 space-y-2">
            <p className="text-slate-300 text-lg">Your final score: <span className="font-bold text-white text-2xl">{score}/10</span></p>
            {score === 10 ? (
              <p className="text-emerald-400 text-sm font-semibold">💎 Congratulations! You won 10 coins!</p>
            ) : (
              <p className="text-slate-400 text-xs">You need a perfect score of 10/10 to win coins. Give it another try!</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewRun}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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
                You are in the middle of a quiz session. Exiting now will lose your current score progress and the 5 entry coins.
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

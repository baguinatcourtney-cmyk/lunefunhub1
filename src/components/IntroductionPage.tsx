/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playClickSound, playCoinSound } from '../utils/sound';

interface IntroductionPageProps {
  onComplete: (data: {
    name: string;
    sex: string;
    age: number;
    country: string;
    luneSince: string;
  }) => void;
  onCancel?: () => void;
}

export default function IntroductionPage({ onComplete, onCancel }: IntroductionPageProps) {
  const [name, setName] = useState('');
  const [sex, setSex] = useState('Female');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('Philippines');
  const [luneSince, setLuneSince] = useState('2022');

  const countries = [
    'Philippines', 'Japan', 'South Korea', 'Taiwan', 'United States',
    'Germany', 'Canada', 'Indonesia', 'Thailand', 'Vietnam',
    'United Kingdom', 'Australia', 'Singapore', 'Malaysia', 'Other'
  ];

  const years = Array.from({ length: 5 }, (_, i) => String(2022 + i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) return;
    
    playClickSound();
    // Simulate initial coins bonus credit with coin sound
    setTimeout(() => {
      playCoinSound();
    }, 500);

    onComplete({
      name: name.trim(),
      sex,
      age: parseInt(age, 10),
      country,
      luneSince
    });
  };

  const isFormValid = name.trim() !== '' && age !== '' && parseInt(age, 10) > 0;

  // Colors for floating background circles: pink, blue, yellow, red, orange, green
  const circleColors = [
    'bg-pink-400/20',
    'bg-blue-400/20',
    'bg-yellow-400/20',
    'bg-red-400/20',
    'bg-orange-400/20',
    'bg-green-400/20'
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden font-fredoka p-4">
      {/* Floating Circles Background */}
      {circleColors.map((color, idx) => {
        const size = 120 + idx * 40;
        return (
          <motion.div
            key={idx}
            className={`absolute rounded-full blur-3xl ${color}`}
            style={{
              width: size,
              height: size,
              top: `${15 + (idx * 12) % 70}%`,
              left: `${10 + (idx * 16) % 80}%`,
            }}
            animate={{
              x: [0, (idx % 2 === 0 ? 40 : -40), 0],
              y: [0, (idx % 2 === 0 ? -40 : 40), 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + idx * 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      })}

      {/* Main Registration Tile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 md:p-10 shadow-2xl my-4"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.h1 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 tracking-wide"
          >
            LUNÉ FUN HUB
          </motion.h1>
          <p className="text-slate-300 text-xs sm:text-sm">Join the &TEAM adventure & earn coins!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-slate-100">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-pink-300 tracking-wider uppercase">YOUR NAME</label>
            <input
              type="text"
              required
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                playClickSound();
              }}
              className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-pink-500 focus:outline-none text-white placeholder-slate-500 transition-all text-base sm:text-lg"
            />
          </div>

          {/* Sex & Age Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-blue-300 tracking-wider uppercase">SEX</label>
              <select
                value={sex}
                onChange={(e) => {
                  setSex(e.target.value);
                  playClickSound();
                }}
                className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:outline-none text-white transition-all text-base sm:text-lg"
              >
                <option value="Female" className="bg-slate-900">Female</option>
                <option value="Male" className="bg-slate-900">Male</option>
                <option value="Non-binary" className="bg-slate-900">Non-binary</option>
                <option value="Secret" className="bg-slate-900">Secret</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-yellow-300 tracking-wider uppercase">AGE</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                placeholder="Age"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  playClickSound();
                }}
                className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-yellow-500 focus:outline-none text-white placeholder-slate-500 transition-all text-base sm:text-lg"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-green-300 tracking-wider uppercase">COUNTRY</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                playClickSound();
              }}
              className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-green-500 focus:outline-none text-white transition-all text-base sm:text-lg"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* LUNÉ Since */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-orange-300 tracking-wider uppercase">LUNÉ SINCE</label>
            <select
              value={luneSince}
              onChange={(e) => {
                setLuneSince(e.target.value);
                playClickSound();
              }}
              className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-orange-500 focus:outline-none text-white transition-all text-base sm:text-lg"
            >
              {years.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900">{yr}</option>
              ))}
            </select>
          </div>

          {/* OK Button */}
          <div className="pt-2 space-y-3">
            <motion.button
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              disabled={!isFormValid}
              type="submit"
              className={`w-full py-3.5 sm:py-4 rounded-2xl font-extrabold text-lg sm:text-xl tracking-wider transition-all shadow-lg ${
                isFormValid
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white cursor-pointer shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Let's Go! 🔮
            </motion.button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-bold transition-all text-center underline cursor-pointer"
              >
                ← Cancel and Return Home
              </button>
            )}
          </div>
        </form>

        {/* Small aesthetic credit disclaimer requested */}
        <p className="mt-6 text-center text-[9px] text-slate-500 leading-relaxed">
          Copyright infringement is not intended for any uploaded photos, logos, and lightstick designs.
        </p>
      </motion.div>
    </div>
  );
}

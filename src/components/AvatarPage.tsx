/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MEMBER_PROFILES } from '../data';
import { playClickSound, playMagicSound } from '../utils/sound';
import IdCard from './IdCard';

interface AvatarPageProps {
  userData: {
    name: string;
    sex: string;
    age: number;
    country: string;
    luneSince: string;
  };
  onProceed: (avatar: string) => void;
  onCancel?: () => void;
}

export default function AvatarPage({ userData, onProceed, onCancel }: AvatarPageProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showId, setShowId] = useState(false);

  const handleSelect = (name: string) => {
    playClickSound();
    setSelectedMember(name);
  };

  const handleOk = () => {
    if (!selectedMember) return;
    // Play the magic sound!
    playMagicSound();
    setShowId(true);
  };

  const selectedProfile = MEMBER_PROFILES.find(p => p.name === selectedMember);
  const selectedEmoji = selectedProfile ? selectedProfile.emoji : '🍊';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-fredoka p-4">
      {/* Floating Circles Background */}
      {['bg-pink-500/10', 'bg-blue-500/10', 'bg-yellow-500/10', 'bg-purple-500/10'].map((color, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full blur-3xl ${color} w-[250px] h-[250px]`}
          style={{
            top: `${10 + idx * 20}%`,
            left: `${15 + (idx * 25) % 65}%`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10 + idx * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {!showId ? (
          <motion.div
            key="select-avatar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 md:p-10 shadow-2xl text-center my-4"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">Select your avatar</h2>
            <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">Choose an &TEAM representative emoji to represent you in the hub!</p>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 mb-8 justify-center items-center">
              {MEMBER_PROFILES.map((profile) => {
                const isSelected = selectedMember === profile.name;
                return (
                  <motion.button
                    key={profile.name}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(profile.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all relative overflow-hidden h-24 ${
                      isSelected
                        ? 'bg-white/20 border-white shadow-lg ring-2 ring-purple-400'
                        : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-3xl mb-1">{profile.emoji}</span>
                    <span className="text-xs font-bold text-slate-100">{profile.name}</span>
                    
                    {/* Tiny visual accent colored dot */}
                    <div 
                      className="absolute bottom-1 w-2 h-2 rounded-full" 
                      style={{ backgroundColor: profile.color === 'White' ? '#e2e8f0' : profile.color }}
                    />
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={selectedMember ? { scale: 1.02 } : {}}
                whileTap={selectedMember ? { scale: 0.98 } : {}}
                disabled={!selectedMember}
                onClick={handleOk}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-extrabold text-lg sm:text-xl tracking-wider transition-all shadow-lg ${
                  selectedMember
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white cursor-pointer shadow-purple-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Confirm Avatar ➔
              </motion.button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold transition-all text-center underline cursor-pointer"
                >
                  ← Go Back (Edit Profile Details)
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="show-id"
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="relative z-10 w-full max-w-md flex flex-col items-center"
          >
            {/* Sparkling celebration background effect */}
            <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="w-[450px] h-[450px] border border-dashed border-white/20 rounded-full flex items-center justify-center"
              >
                <div className="w-[300px] h-[300px] border border-dashed border-purple-500/30 rounded-full" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-4 animate-bounce">✨ LUNÉ ID CREATED! ✨</h2>
            
            <IdCard 
              name={userData.name}
              sex={userData.sex}
              age={userData.age}
              country={userData.country}
              luneSince={userData.luneSince}
              avatar={selectedEmoji}
              coins={20} // Starts with 20 registration bonus coins
              rank="New Moon"
            />

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onProceed(selectedEmoji)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-700 text-white font-bold text-lg rounded-full shadow-lg hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              Enter <span className="text-yellow-400">Luné</span><span className="text-blue-400">fun</span><span className="text-green-400">hub</span> ➔
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

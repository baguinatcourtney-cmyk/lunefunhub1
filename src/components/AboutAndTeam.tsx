/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MEMBER_PROFILES, SONGS_LIST } from '../data';
import { MemberProfile, SongItem } from '../types';
import { playClickSound, playCoinSound } from '../utils/sound';
import { Sparkles, Calendar, Award, Music, BookOpen, Star, Disc, Play, Pause, Square, ExternalLink, Moon, X, Send, RefreshCw } from 'lucide-react';


const getSongTileColorClass = (title: string, isCurrent: boolean) => {
  const t = title.toLowerCase();
  let baseColor = '';

  if (t.includes('under the skin')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('scent of you')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('buzz love') || t.includes('バズ恋')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('the final countdown')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('win or lose fight') || t.includes('w.o.l.f')) {
    baseColor = 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:border-teal-500/60';
  } else if (t.includes('blind love')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('firework')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('road not taken')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('the moon is beautiful') || t.includes('月が綺麗ですね')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('war cry')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('drop kick') || t.includes('dropkick')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('really crazy') || t.includes('チンチャおかしい')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('alien')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('melody')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('running with the pack')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('samidare') || t.includes('五月雨')) {
    baseColor = 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:border-pink-500/60';
  } else if (t.includes('scar to scar')) {
    baseColor = 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:border-pink-500/60';
  } else if (t.includes('maybe') || t.includes('君にカエル')) {
    baseColor = 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:border-pink-500/60';
  } else if (t.includes('aoarashi') || t.includes('青嵐')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('koegawari') || t.includes('声変わり')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('imprinted') || t.includes('向日葵')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('beat the odds')) {
    baseColor = 'bg-green-500/10 border-green-500/30 text-green-300 hover:border-green-500/60';
  } else if (t.includes('meme')) {
    baseColor = 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:border-orange-500/60';
  } else if (t.includes('feel the pulse')) {
    baseColor = 'bg-emerald-950/35 border-emerald-800/30 text-emerald-300 hover:border-emerald-700/60';
  } else if (t.includes('jyuugoya') || t.includes('十五夜')) {
    baseColor = 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:border-orange-500/60';
  } else if (t.includes('big suki')) {
    baseColor = 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:border-orange-500/60';
  } else if (t.includes('yukiakari') || t.includes('雪明かり')) {
    baseColor = 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:border-sky-500/60';
  } else if (t.includes('deer hunter')) {
    baseColor = 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:border-sky-500/60';
  } else if (t.includes('illumination')) {
    baseColor = 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:border-sky-500/60';
  } else if (t.includes('crescent') || t.includes('三日月の願い')) {
    baseColor = 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:border-sky-500/60';
  } else if (t.includes('magic hour')) {
    baseColor = 'bg-lime-500/10 border-lime-500/30 text-lime-300 hover:border-lime-500/60';
  } else if (t.includes('wonderful world')) {
    baseColor = 'bg-lime-500/10 border-lime-500/30 text-lime-300 hover:border-lime-500/60';
  } else if (t.includes('extraordinary day')) {
    baseColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:border-yellow-500/60';
  } else if (t.includes('go in blind')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('run wild')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('back to life')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('lunatic')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('mismatch')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('who am i')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('rush')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('heartbreak time machine')) {
    baseColor = 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600';
  } else if (t.includes('kawasaki')) {
    baseColor = 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/60';
  } else if (t.includes('sakura-iro') || t.includes('sakura iro')) {
    baseColor = 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:border-pink-500/60';
  } else if (t.includes('we on fire') && t.includes('youth')) {
    baseColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-500/60';
  } else if (t.includes('we on fire')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('bewitched')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else if (t.includes('hotline')) {
    baseColor = 'bg-amber-950/20 border-amber-800/30 text-amber-300 hover:border-amber-700/60';
  } else {
    baseColor = 'bg-slate-950/30 border-slate-850 text-slate-300 hover:border-slate-700';
  }

  if (isCurrent) {
    return `${baseColor} ring-2 ring-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]`;
  }
  return baseColor;
};

interface AboutAndTeamProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  activeTab: 'profile' | 'members' | 'discography' | 'fandom' | 'webtoon_lore';
  setActiveTab: (tab: 'profile' | 'members' | 'discography' | 'fandom' | 'webtoon_lore') => void;
  theme?: string;
}

export default function AboutAndTeam({ coins, onUpdateCoins, activeTab, setActiveTab, theme }: AboutAndTeamProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'achievements' | 'solo' | 'shows' | 'lore'>('overview');
  const [activeLoreSubTab, setActiveLoreSubTab] = useState<'series' | 'pack' | 'characters'>('series');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

  // Discography Player State
  const [currentSong, setCurrentSong] = useState<SongItem>(SONGS_LIST[0]);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [useSingleCover, setUseSingleCover] = useState(true);

  // Lightstick Interactive State
  const [isBongOn, setIsBongOn] = useState(true);
  const [bongColor, setBongColor] = useState<'yellow' | 'blue' | 'red' | 'violet' | 'green' | 'white'>('red');
  const [bongMode, setBongMode] = useState<'solid' | 'slow' | 'quick' | 'flash'>('solid');
  const [isRainbow, setIsRainbow] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Rainbow color alternating/flashing cycle
  const rainbowColors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ffffff'];
  const [rainbowColorIdx, setRainbowColorIdx] = useState(0);

  useEffect(() => {
    if (!isRainbow || !isBongOn) return;

    // Speed depends on current mode
    let intervalTime = 600;
    if (bongMode === 'quick') intervalTime = 300;
    if (bongMode === 'flash') intervalTime = 150;

    const timer = setInterval(() => {
      setRainbowColorIdx((prev) => (prev + 1) % rainbowColors.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRainbow, isBongOn, bongMode]);

  const getGlowClass = () => {
    switch (theme) {
      case 'spring': return 'shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] border-pink-500/20';
      case 'summer': return 'shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] border-yellow-500/20';
      case 'autumn': return 'shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] border-orange-500/20';
      case 'winter': return 'shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] border-blue-500/20';
      case 'desert': return 'shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] border-slate-200/20';
      case 'darkMoon':
      default: return 'shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] border-red-500/20';
    }
  };

  // Auto-switch to single cover if available when current song changes
  useEffect(() => {
    setUseSingleCover(!!currentSong.singleCoverUrl);
  }, [currentSong]);

  // Reset play state if the user navigates away from the discography tab
  useEffect(() => {
    if (activeTab !== 'discography' && isPlayingSong) {
      setIsPlayingSong(false);
    }
  }, [activeTab, isPlayingSong]);

  const handlePlaySong = (song: SongItem) => {
    playClickSound();
    setCurrentSong(song);
    setIsPlayingSong(true);
  };

  const handleStopSong = () => {
    playClickSound();
    setIsPlayingSong(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-fredoka text-white">
      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Group Profile */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className={`bg-slate-900/60 border rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 ${getGlowClass()}`}>
              <div className="space-y-3 text-center md:text-left z-10">
                <div className="flex justify-center md:justify-start items-center space-x-2 text-pink-400">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-widest">ABOUT &TEAM</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  &TEAM
                </h3>
                <p className="text-slate-300 text-base md:text-lg font-semibold italic">
                  "We Link!"
                </p>
                <div className="inline-flex items-center gap-1.5 bg-pink-500/10 text-pink-400 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-pink-500/20 w-fit">
                  Global Group
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap justify-center md:justify-start gap-4">
                  <span><strong>Fandom:</strong> LUNÉ ("Light Up New Energy" / French for "moon")</span>
                  <span><strong>Lightstick:</strong> &TEAM Official Light Stick</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-stretch shrink-0 w-full sm:w-auto z-10">
                <div className="bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-850 text-center">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest">Global Debut</span>
                  <span className="font-extrabold text-sm text-pink-400">Dec 7, 2022</span>
                </div>
                <div className="bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-850 text-center">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest">Korean Debut</span>
                  <span className="font-extrabold text-sm text-purple-400">Oct 28, 2025</span>
                </div>
              </div>
              {/* Decorative faint moon in background */}
              <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Inner Pill-based Navigation for Encyclopedia */}
            <div className="flex flex-wrap gap-2 justify-center border-b border-white/5 pb-4">
              {[
                { id: 'overview', label: 'Overview & Timeline', icon: BookOpen },
                { id: 'achievements', label: 'Achievements & Awards', icon: Award },
                { id: 'solo', label: 'Group/Solo Projects', icon: Star },
                { id: 'shows', label: 'Shows', icon: Calendar },
                { id: 'lore', label: 'Fun Facts', icon: Sparkles },
              ].map((subTab) => {
                const SubIcon = subTab.icon;
                const isSubActive = activeSubTab === subTab.id;
                return (
                  <motion.button
                    key={subTab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClickSound();
                      setActiveSubTab(subTab.id as any);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSubActive
                        ? 'bg-purple-600 text-white shadow-inner border border-purple-500'
                        : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    <SubIcon size={12} />
                    {subTab.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Dynamic Content Frame */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`bg-slate-900/40 border rounded-3xl p-6 md:p-8 space-y-6 ${getGlowClass()}`}
              >
                {activeSubTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Group Basic Info</h4>
                        <div className="bg-slate-950/40 rounded-2xl border border-slate-850 overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <tbody>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 w-1/3 bg-slate-900/30">Group Name</td>
                                <td className="p-3 text-slate-200">
                                  <strong>&TEAM</strong> (エンティーム / 앤팀) — refers to "9 diverse members forming a team and connecting diverse worlds"
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Agency Label</td>
                                <td className="p-3 text-slate-200">
                                  YX LABELS (formerly HYBE Labels Japan), distributed via Universal Music Japan
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Formed Via</td>
                                <td className="p-3 text-slate-200">
                                  <em>&Audition ‑The Howling‑</em> (aired Jul 9 – Sep 3, 2022), mentored by HYBE chairman Bang Si-hyuk with Scooter Braun and Zico as guest producers
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Debut Date</td>
                                <td className="p-3 text-slate-200">
                                  December 7, 2022 — EP <em>First Howling: ME</em> (preceded by digital single "Under the Skin," Nov 21, 2022)
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Korean Debut</td>
                                <td className="p-3 text-slate-200">
                                  October 28, 2025 — EP <em>Back to Life</em>
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Members</td>
                                <td className="p-3 text-slate-200">
                                  <strong>9 Members:</strong> EJ (Leader), Fuma (Sub-Leader), K, Nicholas, Yuma, Jo, Harua, Taki, Maki
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Nationalities</td>
                                <td className="p-3 text-slate-200">
                                  7 Japanese, 1 Korean (EJ), 1 Taiwanese (Nicholas); Maki is Japanese-German
                                </td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-slate-400 bg-slate-900/30">Concept</td>
                                <td className="p-3 text-slate-200">
                                  Werewolf / moon mythology, expressed through the "howling" motif and the <em>Dark Moon</em> webtoon universe
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Formation Timeline */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-purple-400 border-l-4 border-purple-500 pl-3">Formation Timeline</h4>
                        <p className="text-slate-300 text-xs leading-relaxed font-medium bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl">
                          &TEAM was the first global group to emerge from HYBE's overseas-label system.
                        </p>
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 max-h-[350px] overflow-y-auto space-y-4 text-xs pr-2">
                          {[
                            { date: 'Jan 1, 2021', text: 'Big Hit Japan announces the "Big Hit Japan Global Debut Project."' },
                            { date: 'Nov 4, 2021', text: 'K, Nicholas, EJ, and Taki (all former I-LAND contestants) confirmed as members of the upcoming group.' },
                            { date: 'May 2021', text: 'Original lineup member Kyungmin departs the agency before debut.' },
                            { date: 'Jul 9 – Sep 3, 2022', text: '&Audition ‑The Howling‑ airs; final 9-member lineup revealed via live broadcast from Tokyo (Sep 3).' },
                            { date: 'Sep 26, 2022', text: 'Fandom name "LUNÉ" announced.' },
                            { date: 'Nov 12, 2022', text: 'Pre-debut variety show &TEAM Gakuen begins airing.' },
                            { date: 'Nov 21, 2022', text: 'Digital single "Under the Skin" released.' },
                            { date: 'Dec 6, 2022', text: 'Leader (EJ) and sub-leader (Fuma) positions confirmed on &TEAM\'s 1st Weverse Live.' },
                            { date: 'Dec 7, 2022', text: 'Official debut with EP First Howling: ME.' }
                          ].map((evt, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="font-bold text-pink-400 min-w-[90px] shrink-0 text-right">{evt.date}</div>
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                              <div className="text-slate-300">{evt.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB: ACHIEVEMENTS & AWARDS */}
                {activeSubTab === 'achievements' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Achievements & Awards</h4>
                    
                    {/* Daesang Spotlight Banner */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 p-5 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                      <div className="flex items-start gap-3 relative">
                        <span className="text-3xl">👑</span>
                        <div className="space-y-1">
                          <span className="text-amber-400 font-extrabold text-[10px] tracking-wider uppercase">Historic Daesang Milestone</span>
                          <h5 className="font-extrabold text-base text-white">ASEA 2026: Performance of the Year (Daesang)</h5>
                          <p className="text-xs text-slate-300 leading-relaxed mt-1">
                            &TEAM won their first-ever Grand Prize (Daesang) at the **Asia Star Entertainer Awards (ASEA)** on May 16, 2026, held at the Belluna Dome in Saitama, Japan.
                            <span className="block mt-1 text-amber-300/90 font-medium">
                              ⚠️ Tier note: This is &TEAM's first confirmed Daesang (Grand Prize) at a major award show — a notable milestone given they had officially debuted in Korea only seven months prior.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Major Music Awards */}
                      <div className="space-y-4">
                        {/* Japan Gold Disc Awards */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                            📀 Japan Gold Disc Awards
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li>
                              <strong>40th (2026)</strong> — Best 5 Albums (Japanese), for <em>Back to Life</em>; Best 5 Singles (Japanese), for <em>Go in Blind</em> — two wins in one ceremony
                            </li>
                            <li>
                              <strong>39th (2025)</strong> — Best 5 Albums, for <em>Yukiakari</em>
                            </li>
                            <li>
                              <strong>38th (2023)</strong> — Best 5 New Artists
                            </li>
                          </ul>
                        </div>

                        {/* Asia Star Entertainer Awards (ASEA) */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                            🏆 Asia Star Entertainer Awards (ASEA)
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li>
                              <strong>2026</strong> — Performance of the Year (Daesang) — <em>&TEAM's first-ever Grand Prize win</em>
                            </li>
                            <li>
                              <strong>2026</strong> — The Platinum (Bonsang), for a second consecutive year
                            </li>
                            <li>
                              <strong>2025</strong> — The Platinum (Bonsang)
                            </li>
                          </ul>
                        </div>

                        {/* Asia Artist Awards (AAA) */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                            ✨ Asia Artist Awards (AAA)
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li>
                              <strong>2024</strong> — Icon (Music)
                            </li>
                            <li>
                              <strong>2023</strong> — Best Choice
                            </li>
                            <li>
                              <strong>2023</strong> — Emotive Award
                            </li>
                          </ul>
                        </div>

                        {/* Other Special Awards */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-pink-400 flex items-center gap-1.5">
                            🏅 Other Special Awards
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li>
                              <strong>67th Japan Record Awards (Nov 2025)</strong> — Special International Music Award
                            </li>
                            <li>
                              <strong>MTV VMAJ (2025)</strong> — Best Buzz Artist
                            </li>
                            <li>
                              <strong>The Fact Music Awards (2024)</strong> — Global Generation Award
                            </li>
                            <li>
                              <strong>Universal Superstar Awards (2024)</strong> — Universal Next Generation (Male)
                            </li>
                            <li>
                              <strong>K-STAR CHART (2024)</strong> — Best Rookie Trophy, Q3
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Right Column: Music Shows, Commercial & Sales */}
                      <div className="space-y-4">
                        {/* Korean Music Show Trophies */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-yellow-400 flex items-center gap-1.5">
                            🏁 Korean Music Show Trophies
                          </h5>
                          <div className="space-y-2 text-xs text-slate-300">
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-[11px]">
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">KBS2 Music Bank</strong> — No.1, "Back to Life" (Nov 7, 2025)
                              </li>
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">MBC M Show Champion</strong> — No.1, "Back to Life" (Nov 5, 2025)
                              </li>
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">SBS M The Show</strong> — No.1, "Back to Life" (Nov 4, 2025)
                              </li>
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">MBC M Show Champion</strong> — No.1, "We on Fire" (2026) <span className="text-pink-400 font-medium">— notable as a win earned with a Japanese-language release</span>
                              </li>
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">SBS Inkigayo</strong> — Hot Stage Trophy, for "Back to Life" (2025)
                              </li>
                              <li className="leading-relaxed">
                                <strong className="text-slate-200">SBS Inkigayo</strong> — Hot Stage Trophy, for "Go in Blind" (2025)
                              </li>
                            </ul>
                            <p className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-450">
                              💡 <strong>Triple Crown Sweep:</strong> The Nov 4–7, 2025 sweep (The Show → Show Champion → Music Bank) counts as a triple crown, achieved within two weeks of &TEAM's Korean debut.
                            </p>
                          </div>
                        </div>

                        {/* Commercial Milestones */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-green-400 flex items-center gap-1.5">
                            📊 Commercial & Sales Milestones
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li className="leading-relaxed">
                              <strong>Million-Seller Status:</strong> Became the first Japanese artist to reach million-seller status in both Japan and Korea, with "Back to Life" and "Go in Blind" each surpassing 1 million copies.
                            </li>
                            <li className="leading-relaxed">
                              <strong>Oct 2025:</strong> <em>Back to Life</em> sold 1,139,988 copies on release day; first Korean album by a Japanese artist to top the Oricon Daily Album ranking.
                            </li>
                            <li className="leading-relaxed">
                              <strong>Apr 2026:</strong> <em>We on Fire</em> sold 1.089 million copies on day one (1,238,907 copies in its first week per Hanteo) — third consecutive million-selling release.
                            </li>
                            <li className="leading-relaxed">
                              <strong>2023:</strong> <em>First Howling: WE</em> debuted at No.1 on Oricon Weekly Albums; <em>First Howling: NOW</em> hit No.1 on Billboard Japan Hot Albums.
                            </li>
                            <li className="leading-relaxed">
                              <strong>RIAJ Double Platinum:</strong> Certification tied to the "Back to Life" era.
                            </li>
                          </ul>
                        </div>

                        {/* Billboard & Chart Highlights (Cleaned) */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-yellow-500 flex items-center gap-1.5">
                            📈 Billboard & Chart Highlights
                          </h5>
                          <div className="space-y-3 text-xs text-slate-300">
                            <div>
                              <strong className="text-pink-400 block mb-1">🇺🇸 US Billboard Highlights</strong>
                              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">Back to Life (Oct 2025)</strong> — Peaked at No. 13 on Top Album Sales and No. 5 on World Albums; topped Billboard's Emerging Artists chart.
                                </li>
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">We on Fire (Apr 2026)</strong> — &TEAM's first-ever Billboard 200 entry, debuting at No. 52 (chart dated May 30, 2026). Also debuted at No. 2 on both Top Album Sales and World Albums, and reclaimed No. 1 on the Emerging Artists chart.
                                </li>
                              </ul>
                            </div>
                            <div className="border-t border-slate-850/60 pt-2">
                              <strong className="text-blue-400 block mb-1">🇯🇵 Billboard Japan & Oricon Highlights</strong>
                              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">First Howling: WE (Jun 2023)</strong> — No. 1 on Oricon Weekly Albums and Billboard Japan Hot Albums.
                                </li>
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">First Howling: NOW (Nov 2023)</strong> — No. 1 on Billboard Japan Hot Albums; No. 2 on Oricon Albums Chart.
                                </li>
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">Samidare (May 2024)</strong> — Title track debuted No. 1 on Oricon Daily Singles Chart (440,615 copies in first week; RIAJ Double Platinum).
                                </li>
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">Aoarashi (Aug 2024)</strong> — Topped Oricon Daily Singles Chart and Weekly Combined Singles Chart, and No. 1 on Billboard Japan Hot 100 — the group's first Hot 100 No. 1.
                                </li>
                                <li className="leading-relaxed">
                                  <strong className="text-slate-200">Yukiakari (Dec 2024)</strong> — Debuted No. 1 on Oricon Weekly and Daily Album charts, with first-week sales of 491,677 copies.
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Other Honors */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                            📺 Other Honors
                          </h5>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li>
                              <strong>Dec 2025</strong> — Performed at the 76th NHK Kōhaku Uta Gassen, Japan's most-watched New Year's Eve broadcast.
                            </li>
                          </ul>
                        </div>

                        {/* ISAC Legacy */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
                          <h5 className="font-bold text-sm text-teal-400 flex items-center gap-1.5">
                            ⚡ Athletic Idols: ISAC Legacy
                          </h5>
                          <p className="text-xs text-slate-400">
                            Known as the premier <strong>"athletic idols"</strong> of the industry, &TEAM has dominated the Idol Star Athletics Championships (ISAC):
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li>
                              <strong>4x100m Relay:</strong> Won back-to-back <span className="text-yellow-400 font-bold">Gold Medals</span> in both <strong>2024</strong> (53.8s) and <strong>2025</strong> (52.4s) Men's Relays.
                            </li>
                            <li>
                              <strong>Men's 60m Sprint:</strong> <strong>Fuma</strong> won the <span className="text-yellow-400 font-bold">Gold Medal</span>, with <strong>Maki</strong> claiming the <span className="text-orange-400 font-bold">Bronze Medal</span>.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB: GROUP/SOLO PROJECTS */}
                {activeSubTab === 'solo' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Group/Solo Projects</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[430px] overflow-y-auto pr-2">
                      {[
                        { name: 'B. League Ambassadors', emoji: '🏀', project: '&TEAM are the official ambassadors for Japan\'s professional basketball league, the B. League. They attended the B. League Awards Show (represented by Fuma, K, Nicholas, and Jo) and collaborated on the league\'s official theme song, "OTAKEBI feat. &TEAM".' },
                        { name: 'Nicholas, EJ, Harua', emoji: '🎬', project: 'Starred in "Paripi Koumei the Movie" [Ya Boy Kongming live-action]!' },
                        { name: 'Taki & Fuma', emoji: '🎭', project: 'Featured in "The Breakthrough Files" acting skits, demonstrating their exceptional comedic chemistry and acting skills.' },
                        { name: '&TEAM Cameo', emoji: '🍜', project: 'Made a hilarious joint cameo appearance as food restaurant workers in a comedy show segment alongside the popular actor and artist Yusei Yagi.' },
                        { name: 'Jo', emoji: '🍚', project: 'Cast as the lead character Kaboku Kotani in the Japanese live-action movie adaptation of the hip-hop dance manga "Wandance" (premiering Nov 27, 2026). Directed by Naoya Kusaba with a script by Keiichi Kobayashi, this is Jo\'s acting debut and the first lead film role for any &TEAM member!' },
                        { name: 'Nicholas', emoji: '🍓', project: 'Launched his personal streetwear project "WENO-ISM" in June 2026. Serving as Creative Director in collaboration with Japanese boutique NUBIAN, Nicholas led the design, graphics, and visual direction for a 6-piece capsule collection featuring &TEAM claws and "&" symbols, launched with a Harajuku pop-up on June 15, 2026.' },
                        { name: 'EJ', emoji: '🍊', project: 'Web-series acting debut as Park Jeong-soo in the 2025 Japanese drama "Ebi Datte Tai ga Tsuritai" ("Even Shrimps Want to Fish for Sea Bream"). Also named an MC of SBS\'s "Inkigayo" starting October 2025, hosting alongside IVE\'s Leeseo and TWS\'s Shinyu, marking &TEAM\'s first regular hosting slot on a major Korean music show!' },
                        { name: 'K', emoji: '👑', project: 'Cast as Nagi Seishirō in the live-action "BLUE LOCK" film (2026) and made his acting debut as the Grim Reaper in the Japanese television drama "Take Me: Reminiscence". He frequently hosts Japanese TV programs, won the famous Akasaka Mini-Marathon, and serves as an expert commentator/interviewer for major World Athletics and Olympic broadcasts.' },
                        { name: 'Fuma', emoji: '🎮', project: 'Regular host on the NTV morning show "DayDay." He also competed on the famous obstacle-course show "Sasuke" (Ninja Warrior), showcasing his exceptional athletic background and physical strength.' },
                        { name: 'Yuma', emoji: '🐱', project: 'Voice-acting debut, guesting as an anime character in episode 6 of "Honey Lemon Soda" (February 2025).' },
                        { name: 'Maki', emoji: '🐶', project: 'Strong musical theatre and child acting background (acting under real name Hirota Riki), including a prominent role in the stage production "Bracken Moor" (2019). He has trained in ballet and has taken formal vocal coaching since 3rd grade.' },
                        { name: 'Joint Drama Role', emoji: '🎭', project: 'Yuma, Harua, Taki, and Maki guest-starred together as the fictional idol group "World Class" in the NTV drama "Dr. Chocolate" (2023).' },
                        { name: 'Santos Bravos Remix', emoji: '🎧', project: 'Nicholas, Yuma, Jo, and Maki featured on HYBE Latin America\'s official remix of Santos Bravos\' "Kawasaki" (released February 20, 2026).' },
                        { name: 'Pre-Debut Cameo', emoji: '🐺', project: 'Before &TEAM\'s official name was announced, K and EJ appeared as cameo werewolves in labelmate ENHYPEN\'s "Drunk-Dazed" music video (released April 26, 2021).' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 flex items-start gap-3">
                          <span className="text-2xl bg-slate-900 p-2 rounded-xl shrink-0">{item.emoji}</span>
                          <div className="space-y-1 text-xs">
                            <span className="font-extrabold text-sm text-slate-100 block">{item.name}</span>
                            <p className="text-slate-300 leading-relaxed">{item.project}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB: SHOWS */}
                {activeSubTab === 'shows' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Shows & Tours</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      
                      {/* Left Column: Variety Shows */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                          <h5 className="font-bold text-sm text-purple-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            📺 Variety Shows & Web Series
                          </h5>
                          <ul className="space-y-4 text-slate-300">
                            <li>
                              <strong className="text-slate-100 block text-xs">2022: &TEAM Gakuen (&TEAM学園)</strong>
                              <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">Pre-debut official Japan variety series.</span>
                            </li>
                            <li>
                              <strong className="text-slate-100 block text-xs">2023: JTBC's Music Universe K-909</strong>
                              <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">Guest appearance (Ep. 20).</span>
                            </li>
                            <li>
                              <strong className="text-slate-100 block text-xs">2023–Present: Go ONE!!! MEET & LINK</strong>
                              <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">Long-running fan-favorite YouTube variety series.</span>
                            </li>
                            <li>
                              <strong className="text-slate-100 block text-xs">2024–2025: 대저택 (Mansion)</strong>
                              <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">Hosted web variety show.</span>
                            </li>
                            <li>
                              <strong className="text-slate-100 block text-xs">2025: ALL! Light! &TEAM ~LUNÉ大作戦~</strong>
                              <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">Hosted variety show.</span>
                            </li>
                            <li>
                              <strong className="text-slate-100 block text-xs">2025: Tokyo023</strong>
                              <span className="text-slate-400 text-[11px] block mt-0.5">Team-based city-exploration across Tokyo's 23 wards</span>
                              <span className="text-slate-400 text-[11px] block mt-1 leading-relaxed">All youtube games/sports content</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Right Column: Concerts and En Day */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Concerts Card */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                          <h5 className="font-bold text-sm text-pink-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            🎤 Concerts & Tours
                          </h5>
                          
                          <div className="space-y-4 divide-y divide-slate-850/60">
                            <div className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <strong className="text-slate-100 text-xs font-bold">2023 &TEAM Fantour Luné Mare: 月波 (Tsuki-Nami)</strong>
                                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">May 27 – Jun 16, 2023</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">The group's first-ever fan tour, held across Japan.</p>
                            </div>

                            <div className="space-y-1 pt-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <strong className="text-slate-100 text-xs font-bold">2024 &TEAM Concert Tour "First Paw Print"</strong>
                                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">Jan 21 – Mar 3, 2024</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">&TEAM's first proper solo concert tour — 7 Japanese cities plus 1 South Korean stop.</p>
                            </div>

                            <div className="space-y-1 pt-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <strong className="text-slate-100 text-xs font-bold">2024 &TEAM Concert Tour "Second to None"</strong>
                                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">Jul – Sep 2024</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">The group's first arena-scale tour.</p>
                            </div>

                            <div className="space-y-1 pt-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <strong className="text-slate-100 text-xs font-bold">2025 &TEAM Concert Tour "Awaken the Bloodline"</strong>
                                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">May – Jul 2025</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">&TEAM's first Asia tour (started May 10, Aichi). Followed by an Encore in Japan at Saitama Super Arena in October 2025.</p>
                            </div>

                            <div className="space-y-1 pt-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <strong className="text-slate-100 text-xs font-bold">2026 &TEAM Concert Tour "Blaze the Way"</strong>
                                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">May 13/14, 2026 → Sep 2026</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">Second Asia tour, opening in Yokohama. Confirmed stops include Kagawa, Aichi, Fukuoka, Taipei, Hyōgo, Incheon, Hong Kong, Bangkok, Chiba, and Singapore, running May–Jul with additional encore performances into September.</p>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-1 mt-3">
                            <strong className="text-yellow-400 block text-xs">2025 &TEAM Fanmeeting "&♥"</strong>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              February 12–13, 2025, Tokyo Garden Theater, Tokyo. Streamed online; announcement of the single "Go in Blind" was made during the first show. (Held separately as a standalone fanmeeting, distinct from both full tours and anniversary events).
                            </p>
                          </div>

                          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850/60 text-[11px] text-slate-400 leading-relaxed">
                            <span className="font-bold text-purple-400 block mb-1">🎭 Stage & Production Style</span>
                            Fan and press coverage describe the tours as arena-scale productions built around dynamic staging and a strong sense of narrative/world-building in the performance, consistent with the group's werewolf/moon concept.
                          </div>
                        </div>

                        {/* En Day Card */}
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                          <h5 className="font-bold text-sm text-green-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            🤝 縁 DAY (ANNUAL ANNIVERSARY EVENT)
                          </h5>
                          
                          <div className="space-y-2.5 text-slate-300 leading-relaxed">
                            <p>
                              <strong className="text-slate-100">What "縁 Day" Is:</strong>
                            </p>
                            <p className="text-[11px]">
                              <span className="text-green-300 font-bold">縁 (en)</span> is a Japanese word meaning "bond," "fate," or "karmic connection" — used here to describe the tie between &TEAM and LUNÉ. 縁 Day (En Day) is the group's annual anniversary fan event, held each year around their September 3 formation date (the day their final 9-member lineup was revealed live from Tokyo at the end of &Audition ‑The Howling‑ in 2022).
                            </p>
                            <p className="text-[11px]">
                              The celebration is preceded by a week-long build-up called <strong className="text-slate-200">縁-WE-EK ("En-week")</strong> — typically featuring a skit-style fan video and a member photoshoot — culminating in the 縁 Day live event itself, a fanmeeting-style show performed for LUNÉ.
                            </p>
                          </div>

                          <div className="border-t border-slate-850 pt-4 space-y-4">
                            <h6 className="font-bold text-xs text-slate-400 uppercase tracking-wider">縁 Day Anniversary History</h6>
                            
                            <div className="space-y-4 text-[11px]">
                              <div className="bg-slate-900/35 p-4 rounded-xl border border-slate-850/60 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <strong className="text-green-300 text-xs">1st Anniversary [縁 Day]</strong>
                                  <span className="text-slate-400 text-[10px] font-mono">September 3, 2023</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                  Saitama Super Arena, Japan. The group's first-ever fan concert. An additional Seoul show was held September 9, 2023 (sold out), livestreamed via Weverse for Membership subscribers.
                                </p>
                              </div>

                              <div className="bg-slate-900/35 p-4 rounded-xl border border-slate-850/60 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <strong className="text-green-300 text-xs">2nd Anniversary [縁 Day]</strong>
                                  <span className="text-slate-400 text-[10px] font-mono">September 3, 2024</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                  Tokyo Garden Theater, Japan. Third fanmeeting overall. Recreated emotional moments from the members' original &Audition run; K reportedly gave a tearful vow on stage.
                                </p>
                                <p className="text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-850 text-[10px] leading-relaxed">
                                  <strong className="text-pink-400 block mb-0.5">Setlist Highlights:</strong>
                                  Covers such as "Cupid" (pH-1), "Haru no Hi ni" (Aimyon), "CHE.R.RY" (YUI), "Seishun Sick" (Fujii Kaze), and "Bad Day" (Daniel Powter), alongside originals like "Scar to Scar," "Samidare," "Aoarashi," "War Cry," and "Firework."
                                </p>
                              </div>

                              <div className="bg-slate-900/35 p-4 rounded-xl border border-slate-850/60 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <strong className="text-green-300 text-xs">3rd Anniversary [縁 Day]</strong>
                                  <span className="text-slate-400 text-[10px] font-mono">September 2–3, 2025</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                  PIA Arena MM, Yokohama, Japan. Fifth fanmeeting overall; included a pop-up store. During the final show (Sep 3), &TEAM announced their upcoming Korean debut with <em>Back to Life</em>, alongside the six-episode documentary <em>&TEAM 100日密着: Howling Out to the World</em>.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB: FUN FACTS */}
                {activeSubTab === 'lore' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Official &TEAM Fun Facts</h4>
                    <div className="text-xs leading-relaxed text-slate-300">
                      <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4 max-w-2xl">
                        <ul className="space-y-3 list-disc pl-5">
                          <li>&TEAM is historic as the very first group to emerge from HYBE's specialized global overseas-label system.</li>
                          <li>The famous Japanese hitmaker and producer <strong>Soma Genda</strong>, who mentored the boys during <em>&Audition</em>, has remained the group's main record producer since debut.</li>
                          <li><strong>The Pineapple on Pizza Debate:</strong> All 9 members of &TEAM absolutely love pineapple on pizza — with the sole exception of <strong>Yuma and Harua</strong>, who strongly dislike it!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Complete &TEAM Social Media Accounts Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-base font-bold text-pink-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                📱 &TEAM Official Social Accounts & Channels
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <a
                  href="https://x.com/andTEAMofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">𝕏</span>
                  <div>
                    <span className="block font-bold text-slate-300">X (Twitter) Official</span>
                    <span className="text-[10px] text-slate-500">@andTEAMofficial</span>
                  </div>
                </a>

                <a
                  href="https://x.com/andTEAM_members"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">𝕏</span>
                  <div>
                    <span className="block font-bold text-slate-300">X (Members)</span>
                    <span className="text-[10px] text-slate-500">@andTEAM_members</span>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/andteam_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">📸</span>
                  <div>
                    <span className="block font-bold text-slate-300">Instagram</span>
                    <span className="text-[10px] text-slate-500">@andteam_official</span>
                  </div>
                </a>

                <a
                  href="https://www.tiktok.com/@andteam_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">🎵</span>
                  <div>
                    <span className="block font-bold text-slate-300">TikTok</span>
                    <span className="text-[10px] text-slate-500">@andteam_official</span>
                  </div>
                </a>

                <a
                  href="https://www.youtube.com/c/andTEAM_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">▶️</span>
                  <div>
                    <span className="block font-bold text-slate-300">YouTube Channel</span>
                    <span className="text-[10px] text-slate-500">&TEAM Official</span>
                  </div>
                </a>

                <a
                  href="https://weverse.io/andteam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">💬</span>
                  <div>
                    <span className="block font-bold text-slate-300">Weverse Community</span>
                    <span className="text-[10px] text-slate-500">andTEAM</span>
                  </div>
                </a>

                <a
                  href="https://x.com/YX_LABELS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">𝕏</span>
                  <div>
                    <span className="block font-bold text-slate-300">YX LABELS X</span>
                    <span className="text-[10px] text-slate-500">@YX_LABELS</span>
                  </div>
                </a>

                <a
                  href="https://www.andteam-official.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-pink-500 hover:bg-slate-900/50 transition-all cursor-pointer"
                >
                  <span className="text-lg">🌐</span>
                  <div>
                    <span className="block font-bold text-slate-300">Official Website</span>
                    <span className="text-[10px] text-slate-500">andteam-official.jp</span>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Group Members Profiles */}
        {activeTab === 'members' && (
          <motion.div
            key="members-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold">Meet the &TEAM Members</h3>
              <p className="text-slate-400 text-xs">Click a member tile to view their full official MBTI profile & details</p>
            </div>

            {/* 9 Member Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
              {MEMBER_PROFILES.map((profile) => {
                // Member-specific colors
                const memberColorMap: { [key: string]: string } = {
                  'EJ': 'from-orange-500/20 to-orange-900/30 border-orange-500 hover:shadow-orange-500/30 text-orange-400',
                  'Fuma': 'from-slate-500/20 to-slate-900/30 border-slate-500 hover:shadow-slate-500/30 text-slate-400',
                  'K': 'from-green-500/20 to-green-900/30 border-green-500 hover:shadow-green-500/30 text-green-400',
                  'Nicholas': 'from-pink-500/20 to-pink-900/30 border-pink-500 hover:shadow-pink-500/30 text-pink-400',
                  'Yuma': 'from-violet-500/20 to-violet-900/30 border-violet-500 hover:shadow-violet-500/30 text-violet-400',
                  'Jo': 'from-slate-200/10 to-slate-500/20 border-slate-300 hover:shadow-slate-300/30 text-slate-300',
                  'Taki': 'from-yellow-500/20 to-yellow-900/30 border-yellow-500 hover:shadow-yellow-500/30 text-yellow-400',
                  'Harua': 'from-blue-500/20 to-blue-900/30 border-blue-500 hover:shadow-blue-500/30 text-blue-400',
                  'Maki': 'from-red-500/20 to-red-900/30 border-red-500 hover:shadow-red-500/30 text-red-400',
                };
                const classStyle = memberColorMap[profile.name] || 'border-slate-700 hover:border-pink-500';

                return (
                  <motion.button
                    key={profile.name}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClickSound();
                      setSelectedMember(profile);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 bg-gradient-to-b transition-all shadow-md cursor-pointer ${classStyle}`}
                  >
                    <span className="text-4xl mb-2 filter drop-shadow-md">{profile.emoji}</span>
                    <span className="text-sm font-bold block text-white">{profile.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Member Profile Expand Modal */}
            <AnimatePresence>
              {selectedMember && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-6 border border-slate-700/80 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5"
                  >
                    <button
                      onClick={() => {
                        playClickSound();
                        setSelectedMember(null);
                      }}
                      className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>

                    {/* Modal Header */}
                    <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
                      <div className="text-5xl bg-slate-800 p-3 rounded-2xl">
                        {selectedMember.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold">{selectedMember.name}</h4>
                        <div className="text-xs text-slate-400 font-semibold mt-0.5">
                          {selectedMember.personalInfo.realName}
                        </div>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          {selectedMember.personalInfo.zodiac && (
                            <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-[10px] font-semibold">
                              {selectedMember.personalInfo.zodiac}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-4 text-sm">
                      {/* Grid of basic profile metadata */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">BIRTHDAY</span>
                          <span className="block font-semibold text-slate-200 mt-0.5">{selectedMember.personalInfo.birthday}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">HEIGHT / WEIGHT</span>
                          <span className="block font-semibold text-slate-200 mt-0.5">
                            {selectedMember.personalInfo.height}
                            {selectedMember.personalInfo.weight ? ` / ${selectedMember.personalInfo.weight}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">NATIONALITY</span>
                          <span className="block font-semibold text-slate-200 mt-0.5">{selectedMember.personalInfo.nationality}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">BLOOD TYPE</span>
                          <span className="block font-semibold text-slate-200 mt-0.5">{selectedMember.personalInfo.bloodType}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">BIRTHPLACE</span>
                          <span className="block font-semibold text-slate-200 mt-0.5">{selectedMember.personalInfo.birthplace}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">FAMILY STRUCTURE</span>
                          <span className="block font-semibold text-slate-300 mt-0.5">{selectedMember.personalInfo.family}</span>
                        </div>
                        {selectedMember.socialMedia?.instagram && selectedMember.socialMedia.instagram !== 'https://instagram.com/andteam_official' && (
                          <div className="col-span-2 bg-gradient-to-r from-blue-500/10 to-transparent p-2 rounded-lg border border-blue-500/15">
                            <span className="text-[9px] text-blue-400 uppercase font-bold tracking-wider block">📸 Personal Instagram</span>
                            <a
                              href={selectedMember.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-bold text-sky-400 hover:text-sky-300 mt-0.5 underline transition-all break-all"
                            >
                              {selectedMember.socialMedia.instagram.replace('https://www.', '').replace('https://', '')}
                            </a>
                          </div>
                        )}
                        {selectedMember.personalInfo.micColor && (
                          <div className="col-span-2 bg-gradient-to-r from-pink-500/10 to-transparent p-2 rounded-lg border border-pink-500/15">
                            <span className="text-[9px] text-pink-400 uppercase font-bold tracking-wider block">🎤 Official Mic Color</span>
                            <span className="block font-bold text-white mt-0.5">{selectedMember.personalInfo.micColor}</span>
                          </div>
                        )}
                      </div>

                      {/* Hobbies, Specialties, Likes & Role Models */}
                      <div className="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
                        <div>
                          <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider block">Hobbies</span>
                          <p className="text-slate-300 mt-0.5">{selectedMember.personalInfo.hobby}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Special Skills & Talents</span>
                          <p className="text-slate-300 mt-0.5">{selectedMember.personalInfo.specialty}</p>
                        </div>
                        {selectedMember.personalInfo.likes && (
                          <div>
                            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider block">Likes & Favorites</span>
                            <p className="text-slate-300 mt-0.5">{selectedMember.personalInfo.likes}</p>
                          </div>
                        )}
                        {selectedMember.personalInfo.roleModel && (
                          <div>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Inspirations & Role Models</span>
                            <p className="text-slate-300 mt-0.5">{selectedMember.personalInfo.roleModel}</p>
                          </div>
                        )}
                      </div>

                      {/* Solo Projects & Highlight Achievements Card */}
                      {selectedMember.personalInfo.soloHighlights && (
                        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-4 rounded-xl space-y-2">
                          <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                            <Sparkles size={10} /> Solo Career Highlights
                          </span>
                          <ul className="list-disc pl-4 space-y-1.5 text-slate-200 text-xs leading-relaxed">
                            {(() => {
                              const rawSentences = selectedMember.personalInfo.soloHighlights.split(/(?<=[.!?])\s+/);
                              const parsedSentences: string[] = [];
                              for (let i = 0; i < rawSentences.length; i++) {
                                const current = rawSentences[i].trim();
                                if (!current) continue;
                                if (parsedSentences.length > 0 && (parsedSentences[parsedSentences.length - 1].endsWith("Dr") || parsedSentences[parsedSentences.length - 1].endsWith("Dr."))) {
                                  parsedSentences[parsedSentences.length - 1] = parsedSentences[parsedSentences.length - 1] + " " + current;
                                } else {
                                  parsedSentences.push(current);
                                }
                              }
                              return parsedSentences.map((sentence, idx) => (
                                <li key={idx} className="pl-1">{sentence}</li>
                              ));
                            })()}
                          </ul>
                        </div>
                      )}

                      {/* Member Fun Facts Section */}
                      {selectedMember.funFacts && selectedMember.funFacts.length > 0 && (
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 space-y-2">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                            💡 {selectedMember.name} Fun Facts
                          </span>
                          <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-300 leading-relaxed">
                            {selectedMember.funFacts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Bio info */}
                      <div className="space-y-1 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Pre-debut History & Bio</span>
                        <p className="text-slate-300 text-xs leading-relaxed">{selectedMember.history}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tab 3: Discography (Disc Player) */}
        {activeTab === 'discography' && (
          <motion.div
            key="discography-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col lg:flex-row gap-8 items-center lg:items-start"
          >
            {/* Left CD Rotating Unit */}
            <div className={`flex flex-col items-center space-y-4 bg-slate-900/60 border rounded-3xl p-6 w-full max-w-sm shrink-0 ${getGlowClass()}`}>
              <span className="text-xs uppercase font-bold tracking-widest text-pink-400">ACTIVE DISC DECK</span>
              
              {/* CD Rotation container */}
              <div className="relative w-56 h-56 flex items-center justify-center select-none">
                <motion.div
                  animate={isPlayingSong ? { rotate: 360 } : {}}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  className="w-full h-full rounded-full border-4 border-slate-700/80 relative flex items-center justify-center shadow-2xl overflow-hidden"
                  style={{
                    background: 'conic-gradient(from 0deg, #ec4899, #3b82f6, #ef4444, #f97316, #ffffff, #ec4899)',
                    boxShadow: '0 0 30px rgba(236,72,153,0.35), inset 0 0 50px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* Radial vinyl grooves overlay for authentic look */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  <div className="absolute inset-2 border border-black/25 rounded-full pointer-events-none" />
                  <div className="absolute inset-6 border border-black/25 rounded-full pointer-events-none" />
                  <div className="absolute inset-12 border border-black/25 rounded-full pointer-events-none" />
                  <div className="absolute inset-20 border border-black/25 rounded-full pointer-events-none" />
                  
                  {/* Center plastic spindle / hub hole */}
                  <div className="absolute w-14 h-14 rounded-full bg-slate-100/90 border-4 border-slate-300 flex items-center justify-center shadow-inner z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-850" />
                  </div>
                </motion.div>
              </div>

              {/* Player metadata display */}
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-white tracking-wide">{currentSong.title}</h4>
                <p className="text-slate-400 text-xs">{currentSong.album} ({currentSong.year})</p>
              </div>

              {/* Authentically linked Spotify Embed Player */}
              <div className="w-full border border-slate-800 rounded-2xl overflow-hidden h-20 bg-slate-950">
                <iframe
                  src={`https://open.spotify.com/embed/track/${currentSong.trackId}?utm_source=generator${isPlayingSong ? '&autoplay=1' : ''}`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  title="Spotify Player"
                  className="rounded-xl"
                />
              </div>

              {isPlayingSong && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStopSong}
                  className="px-5 py-2.5 bg-red-500/20 border border-red-500 rounded-full text-red-400 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/30 cursor-pointer"
                >
                  <Square size={12} fill="currentColor" /> Stop CD Spin
                </motion.button>
              )}
            </div>

            {/* Right: Scrollable Songs List */}
            <div className={`flex-1 w-full bg-slate-900/60 border rounded-3xl p-6 space-y-4 ${getGlowClass()}`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Music size={18} className="text-pink-400" /> &TEAM Tracklist
                </h4>
                <span className="text-xs text-slate-400">Click Play to spin the CD and listen!</span>
              </div>

              {/* Scroll list */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {SONGS_LIST.map((song, idx) => {
                  const isCurrent = currentSong.id === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${getSongTileColorClass(song.title, isCurrent)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono text-slate-500 w-5">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div>
                          <span className={`text-sm font-semibold block ${isCurrent ? 'text-pink-400 font-bold' : 'text-slate-100'}`}>
                            {song.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{song.album} &bull; {song.year}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Direct link to Spotify */}
                        <a
                          href={song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer flex items-center justify-center"
                          title="Open on Spotify"
                          onClick={() => playClickSound()}
                        >
                          <ExternalLink size={12} />
                        </a>

                        <button
                          onClick={() => handlePlaySong(song)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCurrent && isPlayingSong
                              ? 'bg-pink-500 text-white hover:bg-pink-600 border border-pink-500 shadow-md shadow-pink-500/20'
                              : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50'
                          }`}
                        >
                          {isCurrent && isPlayingSong ? (
                            <>
                              <Pause size={10} fill="currentColor" /> Pause
                            </>
                          ) : (
                            <>
                              <Play size={10} fill="currentColor" /> Play
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Fandom details */}
        {activeTab === 'fandom' && (
          <motion.div
            key="fandom-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Fandom Intro */}
            <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex justify-center md:justify-start items-center space-x-2 text-pink-400">
                  <Moon size={18} />
                  <span className="text-xs uppercase font-bold tracking-widest">FANDOM IDENTITY</span>
                </div>
                <h3 className="text-4xl font-extrabold tracking-tight">
                  LUNÉ
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  LUNÉ translates to "Moon" in French, officially announced as &TEAM's fandom name. Symbolizing the moon, LUNÉ lights up &TEAM's path, running alongside them as they navigate their journey as werewolves.
                </p>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-xs text-slate-400 italic">
                  "Just like the moon reflects the sun, LUNÉ reflects and shines beautifully beside &TEAM."
                </div>
              </div>

              {/* Copyright Disclaimer explicitly requested */}
              <div className="text-[10px] text-slate-500 text-center md:text-left border-t border-white/5 pt-4">
                * Note: Copyright infringement is not intended for any uploaded photos, logos, or lightstick designs. All credits belong to HYBE LABELS JAPAN and official representatives.
              </div>
            </div>

            {/* Right: Lightstick &bong Detailed Card with custom interactive visualizer */}
            <div className={`lg:col-span-8 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center ${getGlowClass()}`}>
              
              {/* Interactive Lightstick Visualizer Column */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/45 p-5 rounded-2xl border border-slate-850 relative overflow-hidden h-[410px] w-full">
                {/* Glowing Aura backdrop */}
                {isBongOn && (
                  <div 
                    className="absolute top-12 w-36 h-36 rounded-full filter blur-[36px] opacity-35"
                    style={{
                      background: isRainbow 
                        ? rainbowColors[rainbowColorIdx]
                        : bongColor === 'yellow' ? '#facc15' :
                          bongColor === 'blue' ? '#3b82f6' :
                          bongColor === 'red' ? '#ef4444' :
                          bongColor === 'violet' ? '#8b5cf6' :
                          bongColor === 'green' ? '#22c55e' : '#ffffff',
                      transition: isRainbow 
                        ? (bongMode === 'flash' ? 'background 0.08s ease' : bongMode === 'quick' ? 'background 0.15s ease' : 'background 0.4s ease')
                        : 'background 0.5s ease',
                      animation: bongMode === 'slow' ? 'pulse 2s infinite' :
                                 bongMode === 'quick' ? 'pulse 0.8s infinite' :
                                 bongMode === 'flash' ? 'pulse 0.3s infinite' : 'none'
                    }}
                  />
                )}

                {/* Lightstick Visual body */}
                <motion.div 
                  className="relative flex flex-col items-center select-none cursor-pointer" 
                  animate={isShaking ? {
                    rotate: [0, -12, 12, -12, 12, -6, 6, 0],
                    x: [0, -10, 10, -10, 10, -5, 5, 0],
                    y: [0, -5, 5, -5, 5, -3, 3, 0]
                  } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  onClick={() => {
                    playClickSound();
                    setIsBongOn(!isBongOn);
                  }}
                  title="Click anywhere on stick to toggle power"
                >
                  {/* The White Ball (Crown) */}
                  <div 
                    className={`w-28 h-28 rounded-full border-4 flex items-center justify-center relative shadow-lg ${
                      isBongOn 
                        ? 'border-white bg-white/95'
                        : 'border-slate-800 bg-slate-950/40 shadow-inner'
                    }`}
                    style={isBongOn ? {
                      boxShadow: isRainbow
                        ? `0 0 35px ${rainbowColors[rainbowColorIdx]}`
                        : bongColor === 'yellow' ? '0 0 35px rgba(234,179,8,0.8)' :
                          bongColor === 'blue' ? '0 0 35px rgba(59,130,246,0.8)' :
                          bongColor === 'red' ? '0 0 35px rgba(239,68,68,0.8)' :
                          bongColor === 'violet' ? '0 0 35px rgba(139,92,246,0.8)' :
                          bongColor === 'green' ? '0 0 35px rgba(34,197,94,0.8)' : '0 0 35px rgba(255,255,255,0.8)',
                      transition: isRainbow 
                        ? (bongMode === 'flash' ? 'box-shadow 0.08s ease' : bongMode === 'quick' ? 'box-shadow 0.15s ease' : 'box-shadow 0.4s ease')
                        : 'box-shadow 0.5s ease',
                    } : {}}
                  >
                    {/* The Ampersand symbol inside */}
                    <span 
                      className={`text-5xl font-black tracking-tighter ${
                        isBongOn 
                          ? ''
                          : 'text-slate-800'
                      } ${
                        isBongOn && bongMode === 'slow' ? 'animate-[pulse_2s_infinite]' :
                        isBongOn && bongMode === 'quick' ? 'animate-[pulse_0.8s_infinite]' :
                        isBongOn && bongMode === 'flash' ? 'animate-[pulse_0.25s_infinite]' : ''
                      }`}
                      style={isBongOn ? {
                        color: isRainbow ? rainbowColors[rainbowColorIdx] : 
                               bongColor === 'yellow' ? '#eab308' :
                               bongColor === 'blue' ? '#3b82f6' :
                               bongColor === 'red' ? '#ef4444' :
                               bongColor === 'violet' ? '#a855f7' :
                               bongColor === 'green' ? '#22c55e' : '#f1f5f9',
                        filter: isRainbow 
                          ? `drop-shadow(0 0 12px ${rainbowColors[rainbowColorIdx]})`
                          : bongColor === 'yellow' ? 'drop-shadow(0 0 12px rgba(234,179,8,0.85))' :
                            bongColor === 'blue' ? 'drop-shadow(0 0 12px rgba(59,130,246,0.85))' :
                            bongColor === 'red' ? 'drop-shadow(0 0 12px rgba(239,68,68,0.85))' :
                            bongColor === 'violet' ? 'drop-shadow(0 0 12px rgba(139,92,246,0.85))' :
                            bongColor === 'green' ? 'drop-shadow(0 0 12px rgba(34,197,94,0.85))' :
                            'drop-shadow(0 0 12px rgba(255,255,255,0.95))',
                        transition: isRainbow 
                          ? (bongMode === 'flash' ? 'color 0.08s ease, filter 0.08s ease' : bongMode === 'quick' ? 'color 0.15s ease, filter 0.15s ease' : 'color 0.4s ease, filter 0.4s ease')
                          : 'color 0.5s ease, filter 0.5s ease',
                      } : {}}
                    >
                      &
                    </span>

                    {/* Subtle highlights */}
                    <div className="absolute inset-2 border border-white/20 rounded-full pointer-events-none" />
                  </div>

                  {/* Metallic Connector Ring */}
                  <div className="w-8 h-2.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 border border-slate-600 rounded-sm shadow-md -mt-[2px] z-10" />

                  {/* Chubby Black Handle Stick underneath */}
                  <div className="w-9 h-26 bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-800 rounded-b-xl relative shadow-2xl flex flex-col items-center justify-between py-2 group-hover:brightness-110 transition-all">
                    {/* Upper decorative metallic line */}
                    <div className="absolute top-2 left-0 right-0 h-[2px] bg-slate-800/80" />

                    {/* TWO INTERACTIVE BUTTONS ON THE HANDLE */}
                    <div className="flex flex-col gap-1.5 items-center justify-center mt-3 z-10">
                      {/* Button 1: Power/Open */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setIsBongOn(!isBongOn);
                        }}
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                          isBongOn 
                            ? 'bg-green-500 border-green-400 shadow-[0_0_8px_#22c55e]' 
                            : 'bg-red-500 border-red-400 shadow-[0_0_4px_#ef4444]'
                        }`}
                        title="Button 1: Toggle Power (Open)"
                      >
                        <span className="text-[5px] text-white font-bold">I</span>
                      </button>

                      {/* Button 2: Change Mode */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          if (!isBongOn) setIsBongOn(true);
                          const modes: ('solid' | 'slow' | 'quick' | 'flash')[] = ['solid', 'slow', 'quick', 'flash'];
                          const nextIdx = (modes.indexOf(bongMode) + 1) % modes.length;
                          setBongMode(modes[nextIdx]);
                        }}
                        className="w-3.5 h-3.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center transition-all"
                        title="Button 2: Cycle Modes (Solid -> Slow -> Quick -> Flash)"
                      >
                        <span className="text-[5px] text-slate-300 font-bold">M</span>
                      </button>
                    </div>

                    {/* Brand print */}
                    <span className="text-[7px] font-bold text-slate-700 tracking-wider font-sans select-none">&TEAM</span>
                  </div>

                  {/* Wrist strap dangling */}
                  <div className="w-1 h-8 bg-red-500/70 rounded-b-full shadow-sm animate-bounce origin-top" style={{ animationDuration: '4s' }} />
                </motion.div>

                {/* Options panel below stick: Colors & rainbow mode, shaking options */}
                <div className="mt-2 w-full space-y-2 z-10 text-center">
                  
                  {/* Colors Grid */}
                  <div className="flex justify-center items-center gap-1.5">
                    {[
                      { id: 'yellow', label: 'Yellow', color: 'bg-yellow-400' },
                      { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
                      { id: 'red', label: 'Red', color: 'bg-red-500' },
                      { id: 'violet', label: 'Violet', color: 'bg-violet-600' },
                      { id: 'green', label: 'Green', color: 'bg-green-500' },
                      { id: 'white', label: 'White', color: 'bg-white' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setIsBongOn(true);
                          setIsRainbow(false);
                          setBongColor(item.id as any);
                        }}
                        className={`w-4.5 h-4.5 rounded-full ${item.color} border-2 hover:scale-110 transition-all cursor-pointer ${
                          bongColor === item.id && isBongOn && !isRainbow ? 'border-white scale-120 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'border-slate-900'
                        }`}
                        title={`${item.label} Light`}
                      />
                    ))}

                    {/* Rainbow mode toggle next to colors */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        setIsBongOn(true);
                        setIsRainbow(!isRainbow);
                      }}
                      className={`w-7 h-4.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 border hover:scale-105 transition-all text-[8px] font-bold text-white flex items-center justify-center cursor-pointer ${
                        isRainbow && isBongOn ? 'border-white scale-110 shadow-md ring-1 ring-pink-400' : 'border-slate-900 opacity-60'
                      }`}
                      title="Toggle Rainbow Color Cycling"
                    >
                      🌈
                    </button>
                  </div>

                  {/* Mode and Shaking buttons */}
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    {/* Active Mode Display indicator badge */}
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                      Mode: <span className="text-yellow-400">{bongMode.toUpperCase()}</span>
                    </span>

                    {/* Shake simulation trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCoinSound();
                        setIsShaking(true);
                        
                        // Shake action: pick a random color or rainbow
                        const colors: ('yellow' | 'blue' | 'red' | 'violet' | 'green' | 'white')[] = [
                          'yellow', 'blue', 'red', 'violet', 'green', 'white'
                        ];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        
                        setIsBongOn(true);
                        if (Math.random() > 0.75) {
                          setIsRainbow(true);
                        } else {
                          setIsRainbow(false);
                          setBongColor(randomColor);
                        }

                        setTimeout(() => {
                          setIsShaking(false);
                        }, 500);
                      }}
                      disabled={isShaking}
                      className="px-2.5 py-0.5 rounded bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-[9px] font-black uppercase text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md"
                      title="Shake lightstick physically to randomize color!"
                    >
                      📳 Shake to Change
                    </button>
                  </div>


                </div>
              </div>

              {/* Right Column: Detailed Card Information */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🪄</span>
                  <h4 className="text-lg font-bold text-white">&TEAM Official Light Stick</h4>
                </div>
                
                <div className="space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                  <div>
                    <span className="text-[10px] text-red-400 font-bold uppercase block tracking-wider">Meaning & Design</span>
                    <p>The core visual revolves around the "&" (ampersand) symbol, representing the bond between the nine members and their fans, Luné. It features a custom circular white light dome enclosing this core &TEAM ampersand logo, held by an elegant black chubby rod.</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase block tracking-wider">Release & Version Info</span>
                    <p>Designed with state-of-the-art concert synchronize chips, robust rubberized anti-slip grip on the black handle, and beautiful color cycling modes. Take note that <strong>&TEAM OFFICIAL LIGHT STICK VER.2</strong> is scheduled to be released in the second half of 2026. The existing <strong>&TEAM OFFICIAL LIGHT STICK VER.1</strong> will be discontinued when stock runs out.</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase block tracking-wider">How to Use Visual Controls</span>
                    <p>Press <span className="font-bold text-white">Button 1</span> (Green/Red indicator) on the handle to switch the power on/off. Press <span className="font-bold text-white">Button 2</span> to cycle through 4 light modes: <span className="text-yellow-400 font-bold">Solid</span>, <span className="text-yellow-400 font-bold">Slow Effect</span> (breathing), <span className="text-yellow-400 font-bold">Quick</span>, and <span className="text-yellow-400 font-bold">Flash Effect</span> (fast pulse). Choose a custom color or toggle rainbow mode, or click the <span className="text-pink-400 font-bold">📳 Shake to Change</span> button to simulate shaking the stick to change its color randomly!</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Official Light Stick Resources</span>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href="https://weverseshop.io/"
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                      >
                        🛒 Weverse Shop <ExternalLink size={10} />
                      </a>
                      <a 
                        href="https://weverse.io/"
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                      >
                        📱 Weverse App Portal <ExternalLink size={10} />
                      </a>
                      <a 
                        href="https://play.google.com/store/apps/details?id=co.benx.weverse"
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                      >
                        🤖 Weverse Google Play <ExternalLink size={10} />
                      </a>
                      <a 
                        href="https://apps.apple.com/us/app/weverse/id1456561372"
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                      >
                        🍎 Weverse App Store <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Webtoon Lore */}
        {activeTab === 'webtoon_lore' && (
          <motion.div
            key="webtoon-lore-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className={`bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 ${getGlowClass()}`}>
              <div className="space-y-3 text-center md:text-left z-10">
                <div className="flex justify-center md:justify-start items-center space-x-2 text-pink-400">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-widest">HYBE ORIGINAL WEBTOON Lore</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wide">
                  Dark Moon: The Grey City
                </h3>
                <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                  HYBE's original story webtoon starring &TEAM, created through collaboration with Naver Webtoon. Discover the werewolf pack lore, backstories, and the mystical shared universe!
                </p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center shrink-0 w-full sm:w-auto z-10">
                <span className="block text-[9px] text-pink-400 uppercase font-bold tracking-widest">Series Run</span>
                <span className="font-extrabold text-xs text-slate-300">Dec 5, 2022 – Dec 18, 2023</span>
                <span className="block text-[8px] text-slate-500 mt-0.5">53 Chapters + Web Novel</span>
              </div>
              {/* Glowing visual backdrop */}
              <div className="absolute right-0 top-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Sub-tab Pill Selectors */}
            <div className="flex flex-wrap gap-2 justify-center border-b border-white/5 pb-4">
              {[
                { id: 'series', label: 'Series Overview', icon: BookOpen },
                { id: 'pack', label: 'The Pack & Origin', icon: Moon },
                { id: 'characters', label: 'Character Bios', icon: Star },
              ].map((subTab) => {
                const SubIcon = subTab.icon;
                const isSubActive = activeLoreSubTab === subTab.id;
                return (
                  <motion.button
                    key={subTab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClickSound();
                      setActiveLoreSubTab(subTab.id as any);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSubActive
                        ? 'bg-pink-600 text-white shadow-inner border border-pink-500'
                        : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    <SubIcon size={12} />
                    {subTab.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Webtoon Lore SubTab Contents */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLoreSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`bg-slate-900/40 border rounded-3xl p-6 md:p-8 space-y-6 ${getGlowClass()}`}
              >
                {activeLoreSubTab === 'series' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Overview & Cameos */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Part 1 — Shared Universe</h4>
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 min-h-[300px]">
                          <p>
                            &TEAM's werewolf concept ties into <strong>Dark Moon</strong>, HYBE's shared supernatural-romance IP (encompassing webtoons, web novels, animated MVs, and anime).
                          </p>
                          <p>
                            Like ENHYPEN, &TEAM's characters first appeared as cameo werewolves in ENHYPEN's iconic <strong>"Drunk-Dazed" MV (2021)</strong> before officially launching their own standalone story.
                          </p>
                        </div>
                      </div>

                      {/* The Grey City */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-purple-400 border-l-4 border-purple-500 pl-3">The Grey City (2022–2023)</h4>
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 min-h-[300px]">
                          <p>
                            <strong>Dark Moon: The Grey City</strong> is a webtoon & web novel. A vampire massacre wipes out a werewolf village, and the orphaned brothers flee to the seaside town of Grayville.
                          </p>
                          <p>
                            They settle at the Grey Inn run by Marie — whose adopted son Khan doesn't yet know he's a werewolf too. As vampire-linked disappearances rattle the town, Khan's hidden nature is revealed, and the brothers grow from strangers into a real pack, with Khan becoming their new Alpha after guardian Giri's death.
                          </p>
                          <p className="text-xs text-slate-400">
                            Shares its world with ENHYPEN's vampire-side story, <em>Dark Moon: The Blood Altar</em>.
                          </p>
                        </div>
                      </div>

                      {/* The Witch of Yerasah */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-indigo-400 border-l-4 border-indigo-500 pl-3">The Witch of Yerasah (2026–Present)</h4>
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 min-h-[300px]">
                          <p>
                            <strong>Dark Moon: The Witch of Yerasah</strong> is a 4-format rollout (web novel, animated MVs, video episodes, artwork) set in the fictional kingdom of Aman, functioning as both a <em>Blood Altar</em> prequel and a <em>Grey City</em> sequel.
                          </p>
                          <p>
                            It is the first Dark Moon story to feature werewolves exclusively, exploring fate, identity, and "self-determined love."
                          </p>
                          <p className="text-pink-400 font-semibold text-xs">
                            💡 &TEAM's track "Bewitched" received an animated MV visualizing Yerasah's deep mythology.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Official Read & Discover Links */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Official Read & Discover Links</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <a 
                          href="https://www.webtoons.com/en/fantasy/dark-moon-the-grey-city/list?title_no=4884" 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={() => playClickSound()}
                          className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-pink-500/40 p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                          <div className="text-left">
                            <span className="block font-bold text-xs text-slate-200">The Grey City Webtoon</span>
                            <span className="block text-[10px] text-pink-400">Read on Naver WEBTOON ↗</span>
                          </div>
                        </a>

                        <a 
                          href="https://www.wattpad.com/story/365287383-dark-moon-the-witch-of-yerasah" 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={() => playClickSound()}
                          className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-purple-500/40 p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">🔮</span>
                          <div className="text-left">
                            <span className="block font-bold text-xs text-slate-200">Witch of Yerasah Novel</span>
                            <span className="block text-[10px] text-purple-400">Read on Wattpad ↗</span>
                          </div>
                        </a>

                        <a 
                          href="https://www.youtube.com/@DARKMOON_HYBE" 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={() => playClickSound()}
                          className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-red-500/40 p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">🎥</span>
                          <div className="text-left">
                            <span className="block font-bold text-xs text-slate-200">Dark Moon Official YT</span>
                            <span className="block text-[10px] text-red-400">Watch animated MVs ↗</span>
                          </div>
                        </a>

                        <a 
                          href="https://twitter.com/DARKMOON_HYBE" 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={() => playClickSound()}
                          className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/40 p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
                          <div className="text-left">
                            <span className="block font-bold text-xs text-slate-200">Official Dark Moon X</span>
                            <span className="block text-[10px] text-indigo-400">Stay updated on X (Twitter) ↗</span>
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-2xl text-xs text-slate-400 text-center">
                      📚 <strong>Sourcing Note:</strong> This content is compiled from HYBE's official <em>Original Stories by HYBE</em> universe (documenting the webtoon, web novel, animated MVs, and extras).
                    </div>
                  </div>
                )}

                {/* 2. THE PACK & ORIGIN */}
                {activeLoreSubTab === 'pack' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3">Werewolf Bloodlines & Types</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-3">
                        <span className="font-extrabold text-sm text-pink-300 block uppercase tracking-wider">🐾 Loup-Garou</span>
                        <p className="text-xs text-slate-400">
                          The standard werewolf type in the Dark Moon universe.
                        </p>
                        <p>
                          Loup-Garous are human by day and transform into wolf form only under the influence of full-moon nights. Most of the pack brothers belong to this species, sharing deep physical limits and vulnerabilities until they gather as a synchronized pack.
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-3">
                        <span className="font-extrabold text-sm text-purple-300 block uppercase tracking-wider">🌕 Lycanthrope</span>
                        <p className="text-xs text-slate-400">
                          A rarer, legendary, and highly powerful bloodline.
                        </p>
                        <p>
                          Descended directly from the ancient wolf god <strong>Vargr</strong>. They possess the unique ability to transform at will rather than only under a full moon. They are endowed with significantly enhanced strength, speed, and size.
                        </p>
                        <p className="text-purple-400 font-semibold text-xs">
                          🐺 Khan belongs to this rarer type, which sets him apart from the rest of the pack and positions him as the destined Alpha.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 text-xs md:text-sm text-slate-300 leading-relaxed space-y-4">
                      <span className="font-extrabold text-lg text-white block">Origin of the Werewolf Brothers</span>
                      <p>
                        The nine main characters are collectively known as <strong>the werewolf brothers</strong> — a pack of werewolves who band together after losing their homes and families to vampire attacks. Their relationships were shaped early by loss:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-pink-300">Najak & Tahel</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Lost their parents when vampires destroyed their village as children. They were taken in by <strong>Giri</strong>, a former warrior who dedicated himself to protecting orphaned werewolves.
                          </p>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-purple-300">Enzy</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Lost his older sister at a young age and spent part of his childhood as a con artist before Giri took him in as well.
                          </p>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-indigo-300">Mahan, Ruslan & Camill</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Share a darker past — all three were captured and experimented on by vampires, brainwashed, and forced to do the vampires' dirty work before finding freedom.
                          </p>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-blue-300">Luka, Louis & Khan</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Luka and Louis are twin brothers with a mysterious history. Khan grew up as an outsider in Greyville, taken in by Marie after his village was massacred.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CHARACTER BIOS */}
                {activeLoreSubTab === 'characters' && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xl font-bold text-pink-400 border-l-4 border-pink-500 pl-3 mb-4">The Werewolf Brothers (Main Pack)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          {
                            name: "Khan",
                            playedBy: "K",
                            species: "Lycanthrope (Vargr line)",
                            role: "Alpha / Leader of Khan's Pack",
                            personality: "Reserved loner, unaware for years he's a werewolf; becomes the pack's Alpha.",
                            backstory: "Witnessed vampires massacre his entire village and watched his mother die shielding him as a child. Raised by Marie as a human, he grew up an outsider in Greyville, branded a \"devil\" before discovering his rare Lycanthrope lineage."
                          },
                          {
                            name: "Najak",
                            playedBy: "Nicholas",
                            species: "Loup-Garou",
                            role: "Beta of Giri's Pack (former), Beta of Khan's Pack",
                            personality: "Big-brother protector, strongest and most reliable; groomed as next Alpha.",
                            backstory: "Lost his parents in childhood when vampires destroyed his village. Extremely protective of his younger brother Tahel and has a fierce temper when his loved ones are threatened."
                          },
                          {
                            name: "Enzy",
                            playedBy: "EJ",
                            species: "Loup-Garou",
                            role: "Tactician of the Pack",
                            personality: "Seems cynical, secretly warm-hearted; sharp-witted and rebellious.",
                            backstory: "Lost his older sister at a young age and spent his childhood as a streetwise con artist before Giri took him in and changed his outlook."
                          },
                          {
                            name: "Tahel",
                            playedBy: "Taki",
                            species: "Loup-Garou",
                            role: "Youngest member of Khan's Pack",
                            personality: "Youngest, innocent and trusting; leans on Najak.",
                            backstory: "Najak's younger brother. Orphaned during the same childhood vampire attack and raised with immense care by Giri and Najak."
                          },
                          {
                            name: "Mahan",
                            playedBy: "Fuma",
                            species: "Loup-Garou",
                            role: "Steady Veteran / Team Dad",
                            personality: "Cheeky grin, quietly pessimistic underneath.",
                            backstory: "Endured captive experimentation at the hands of vampires alongside Ruslan and Camill. He remains calm and steady in danger to protect his friends."
                          },
                          {
                            name: "Camill",
                            playedBy: "Jo",
                            species: "Loup-Garou",
                            role: "Fighter of the Pack",
                            personality: "Hot-tempered tsundere; a softie underneath.",
                            backstory: "Captured and brainwashed by vampires in his past, leaving him with deep scars. Outwardly rough and arrogant, but deeply sweet once attached."
                          },
                          {
                            name: "Ruslan",
                            playedBy: "Harua",
                            species: "Loup-Garou",
                            role: "Scout / Observer",
                            personality: "Mysterious and quiet; good at staying hidden.",
                            backstory: "Escaped vampire captivity with Mahan and Camill. Highly observant and silent, he is extremely skilled at blending into shadows."
                          },
                          {
                            name: "Louis",
                            playedBy: "Yuma",
                            species: "Loup-Garou",
                            role: "Twin Brother of Luka",
                            personality: "Timid worrier; Luka's twin, follows him closely.",
                            backstory: "Twin brother to Luka. Shares a mysterious, painful past and relies on Luka's free-spirited nature to navigate his anxieties."
                          },
                          {
                            name: "Luka",
                            playedBy: "Maki",
                            species: "Loup-Garou",
                            role: "Twin Brother of Louis",
                            personality: "Free-spirited troublemaker with an artistic streak; Louis' twin.",
                            backstory: "A free spirit who lightens the heavy atmosphere of the pack with mischief and art, while keeping a watchful protective eye on his twin Louis."
                          }
                        ].map((char, i) => (
                          <div key={i} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-850 space-y-3 relative overflow-hidden flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-extrabold text-base text-pink-400">{char.name}</h5>
                                  <span className="text-[10px] text-slate-500 font-mono">Played by {char.playedBy}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  char.species.includes('Lycanthrope') 
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                                    : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                                }`}>
                                  {char.species}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs text-slate-300">
                                <p><strong className="text-slate-400">Pack Role:</strong> {char.role}</p>
                                <p className="text-[11px] leading-relaxed"><strong className="text-slate-400">Personality:</strong> {char.personality}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 leading-relaxed">
                              <strong className="text-slate-500 block mb-0.5">Backstory:</strong>
                              {char.backstory}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Supporting Characters */}
                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-xl font-bold text-purple-400 border-l-4 border-purple-500 pl-3 mb-4">Key Supporting Characters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            name: "Giri",
                            role: "Guardian / Found-Father",
                            desc: "A Loup-Garou warrior who took in the orphaned brothers after they lost everything. His tragic death in Greyville pushes Khan into taking the Alpha role."
                          },
                          {
                            name: "Marie",
                            role: "Khan's Adoptive Mother",
                            desc: "A warm and protective human woman who runs the Grey Inn. She raised Khan with unconditional love, shielding him from local hostility."
                          },
                          {
                            name: "Khrock \"Croc\" Fallowhide",
                            role: "Chief Antagonist / Bully",
                            desc: "A wealthy, arrogant bully in Greyville who acts as the story's main early antagonist, relentlessly targeting Khan."
                          },
                          {
                            name: "Mika",
                            role: "Khan's Childhood Friend",
                            desc: "A kind-hearted girl from Greyville who has been in love with Khan for years and stands by his side despite the town's prejudice."
                          }
                        ].map((supp, i) => (
                          <div key={i} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-2">
                            <div>
                              <h5 className="font-extrabold text-sm text-purple-300">{supp.name}</h5>
                              <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider">{supp.role}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{supp.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

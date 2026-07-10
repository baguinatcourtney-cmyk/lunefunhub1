/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { playClickSound, playCoinSound } from './utils/sound';

// Screen Components
import IntroductionPage from './components/IntroductionPage';
import AvatarPage from './components/AvatarPage';
import IdCard from './components/IdCard';
import AboutAndTeam from './components/AboutAndTeam';
import SnapProject from './components/SnapProject';
import MateProject from './components/MateProject';
import WolfTypeProject from './components/WolfTypeProject';
import WhichSongProject from './components/WhichSongProject';
import AboutMe from './components/AboutMe';
import ThemeEffects from './components/ThemeEffects';
import LunevilleBoard from './components/LunevilleBoard';
import { SONGS_LIST } from './data';

// Game Components
import LuneQuiz from './components/games/LuneQuiz';
import PackMemory from './components/games/PackMemory';
import FlappyWolf from './components/games/FlappyWolf';
import WolfSound from './components/games/WolfSound';
import WolfPuzzle from './components/games/WolfPuzzle';
import LuckyMoon from './components/games/LuckyMoon';
import WolfMaze from './components/games/WolfMaze';
import OddOneOut from './components/games/OddOneOut';
import PawPrintTrail from './components/games/PawPrintTrail';
import Wolfdle from './components/games/Wolfdle';
import AmpersandCoin from './components/AmpersandCoin';
import { getThemeCardStyles } from './utils/theme';

import { 
  Menu, Sparkles, Trophy, LogOut, Moon, Music, Star, Disc, 
  Gamepad2, User, Camera, Heart, AlertCircle, Edit, X 
} from 'lucide-react';

import { 
  auth, 
  googleProvider, 
  saveUserData, 
  getUserData,
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  signInWithNickname,
  type FirebaseUser 
} from './utils/firebase';

interface UserProfile {
  name: string;
  sex: string;
  age: number;
  country: string;
  luneSince: string;
  luneCode?: string;
  avatar?: string;
  coins?: number;
  rank?: string;
  bias?: string;
  biasWrecker?: string;
  stanlist?: string;
  socials?: {
    twitter?: string;
    tiktok?: string;
    instagram?: string;
  };
  unlockedAvatars?: string[];
  hasEnteredHub?: boolean;
}

function generateUniqueLuneCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 2; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `LUNE-${randomNum}${suffix}`;
}

const sidebarContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

export default function App() {
  // Navigation & Sidebar
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'about_team' | 'special_projects' | 'luneville_board' | 'about_me'>('games');
  const [activeSpecialSubTab, setActiveSpecialSubTab] = useState<'snap' | 'mate' | 'wolf_type' | 'which_song'>('snap');
  const [activeTeamSubTab, setActiveTeamSubTab] = useState<'profile' | 'members' | 'discography' | 'fandom' | 'webtoon_lore'>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-adapt sidebar state to device screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Onboarding & Lune ID modal states
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'returning' | 'createProfile' | 'chooseAvatar'>('welcome');
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [isLuneIdModalOpen, setIsLuneIdModalOpen] = useState(false);
  const [isEditingIdInModal, setIsEditingIdInModal] = useState(false);

  // Firebase Authentication State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Save & Sync Backup Center states
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [generatedCloudCode, setGeneratedCloudCode] = useState('');
  const [cloudLoading, setCloudLoading] = useState(false);
  const [enteredCloudCode, setEnteredCloudCode] = useState('');
  const [enteredBase64Code, setEnteredBase64Code] = useState('');
  const [backupStatusMessage, setBackupStatusMessage] = useState({ type: '', text: '' });

  // Login inline form state
  const [loginNickname, setLoginNickname] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showForgotCode, setShowForgotCode] = useState(false);

  // User details & database persistence
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>([]);
  const [hasEnteredHub, setHasEnteredHub] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(0);

  // Edit Lune ID state
  const [isEditingId, setIsEditingId] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>({
    name: '',
    sex: 'Secret',
    age: 18,
    country: 'Other',
    luneSince: '2024',
    avatar: '🐺',
    bias: '',
    biasWrecker: '',
    stanlist: '',
    socials: { twitter: '', tiktok: '', instagram: '' }
  });

  useEffect(() => {
    if ((isEditingId || isEditingIdInModal) && userProfile) {
      setEditingProfile({
        name: userProfile.name || '',
        sex: userProfile.sex || 'Secret',
        age: userProfile.age || 18,
        country: userProfile.country || 'Other',
        luneSince: userProfile.luneSince || '2024',
        avatar: userAvatar || '🐺',
        bias: userProfile.bias || '',
        biasWrecker: userProfile.biasWrecker || '',
        stanlist: userProfile.stanlist || '',
        socials: {
          twitter: userProfile.socials?.twitter || '',
          tiktok: userProfile.socials?.tiktok || '',
          instagram: userProfile.socials?.instagram || '',
        }
      });
    }
  }, [isEditingId, isEditingIdInModal, userProfile, userAvatar]);

  const handleSaveIdChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    playCoinSound();

    const updatedData = {
      name: editingProfile.name.trim() || 'LUNÉ Player',
      sex: editingProfile.sex,
      age: Number(editingProfile.age) || 18,
      country: editingProfile.country,
      luneSince: editingProfile.luneSince,
      avatar: editingProfile.avatar,
      bias: editingProfile.bias,
      biasWrecker: editingProfile.biasWrecker,
      stanlist: editingProfile.stanlist,
      socials: {
        twitter: editingProfile.socials.twitter.trim(),
        tiktok: editingProfile.socials.tiktok.trim(),
        instagram: editingProfile.socials.instagram.trim(),
      }
    };

    try {
      const dataToSave = {
        ...updatedData,
        luneCode: userProfile?.luneCode
      };
      await saveUserData(firebaseUser.uid, dataToSave);
      setUserProfile({
        name: updatedData.name,
        sex: updatedData.sex,
        age: updatedData.age,
        country: updatedData.country,
        luneSince: updatedData.luneSince,
        luneCode: userProfile?.luneCode,
        avatar: updatedData.avatar,
        bias: updatedData.bias,
        biasWrecker: updatedData.biasWrecker,
        stanlist: updatedData.stanlist,
        socials: updatedData.socials
      });
      setUserAvatar(updatedData.avatar);
      setIsEditingId(false);
      setIsEditingIdInModal(false);
    } catch (err) {
      console.error("Error saving user profile edits:", err);
      alert("Failed to save profile changes. Please try again.");
    }
  };

  // States for visual floating coin animation shower
  const [triggeredCoins, setTriggeredCoins] = useState<{ id: number; delay: number }[]>([]);
  const prevCoinsRef = useRef(coins);
  const idCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coins > prevCoinsRef.current) {
      // Trigger a visual shower of floating gold coins
      const count = Math.min(12, coins - prevCoinsRef.current);
      const newCoins = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i,
        delay: i * 0.08,
      }));
      setTriggeredCoins(prev => [...prev, ...newCoins]);
      // Auto-clear after animations conclude
      setTimeout(() => {
        setTriggeredCoins([]);
      }, 2500);
    }
    prevCoinsRef.current = coins;
  }, [coins]);

  // Theme settings
  const [theme, setTheme] = useState<'darkMoon' | 'spring' | 'summer' | 'autumn' | 'winter' | 'desert'>('darkMoon');

  // Currently playing game id
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Sync with Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Fetch user data from database automatically!
        const dbData = await getUserData(user.uid);
        if (dbData) {
          setUserProfile({
            name: dbData.name || '',
            sex: dbData.sex || '',
            age: dbData.age || 0,
            country: dbData.country || '',
            luneSince: dbData.luneSince || '',
            luneCode: dbData.luneCode || '',
            bias: dbData.bias || '',
            biasWrecker: dbData.biasWrecker || '',
            stanlist: dbData.stanlist || '',
            socials: dbData.socials || { twitter: '', tiktok: '', instagram: '' }
          });
          setUserAvatar(dbData.avatar || null);
          setCoins(dbData.coins ?? 20);
          setUnlockedAvatars(dbData.unlockedAvatars ?? []);
          setHasEnteredHub(dbData.hasEnteredHub ?? false);
        } else {
          // Document does not exist yet (brand new registration needed)
          setUserProfile(null);
          setUserAvatar(null);
          setUnlockedAvatars([]);
          setCoins(20);
          setHasEnteredHub(false);
        }
      } else {
        // Signed out
        setUserProfile(null);
        setUserAvatar(null);
        setCoins(0);
        setHasEnteredHub(false);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync coins from firestore whenever the window is refocused
  useEffect(() => {
    const handleFocus = async () => {
      if (firebaseUser) {
        const dbData = await getUserData(firebaseUser.uid);
        if (dbData && typeof dbData.coins === 'number') {
          setCoins(dbData.coins);
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [firebaseUser]);

  // Determine user rank based on coins balance
  const getUserRank = (coinCount: number) => {
    if (coinCount >= 200) return { title: 'Full Moon', badge: '🌕' };
    if (coinCount >= 100) return { title: 'Half Moon', badge: '🌗' };
    if (coinCount >= 50) return { title: 'Crescent Moon', badge: '🌙' };
    return { title: 'New Moon', badge: '🌑' };
  };

  const userRank = getUserRank(coins);

  // Keep localStorage keys synchronized for external components
  useEffect(() => {
    if (userProfile?.name) {
      localStorage.setItem("lune_username", userProfile.name);
    }
    if (userProfile?.luneCode) {
      localStorage.setItem("lune_id", userProfile.luneCode);
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("lune_coins", String(coins));
  }, [coins]);

  // Coin updates wrapper - immediately sync to database
  const handleUpdateCoins = (amount: number) => {
    setCoins(prev => {
      const nextCoins = Math.max(0, prev + amount);
      if (firebaseUser) {
        saveUserData(firebaseUser.uid, { coins: nextCoins });
      }
      return nextCoins;
    });
  };

  // Exit/Log Out handler - secure, saves profile details and signs out from Firebase
  const handleLogOut = async () => {
    playClickSound();
    const isAnonymous = firebaseUser?.isAnonymous;
    const confirmMsg = isAnonymous
      ? "Warning: You are playing as a Guest. Logging out might make you lose access to this progress if you clear your browser data. Are you sure you want to log out?"
      : "Are you sure you want to log out? This will securely save your score/coins in the database and end your session.";

    if (confirm(confirmMsg)) {
      if (firebaseUser) {
        // Securely update state to Firestore on log out
        await saveUserData(firebaseUser.uid, {
          coins,
          avatar: userAvatar,
          name: userProfile?.name,
          sex: userProfile?.sex,
          age: userProfile?.age,
          country: userProfile?.country,
          luneSince: userProfile?.luneSince
        });
      }
      await signOut(auth);
      localStorage.clear();
      setUserProfile(null);
      setUserAvatar(null);
      setHasEnteredHub(false);
      setCoins(0);
      setActiveGameId(null);
      setActiveTab('games');
    }
  };

  // Helper to package user data
  const packageUserData = () => {
    const dbData = localStorage.getItem('lunefunhub_local_db') || '{}';
    const currentUser = localStorage.getItem('lunefunhub_current_user') || 'null';
    return {
      db: JSON.parse(dbData),
      user: JSON.parse(currentUser)
    };
  };

  // Helper to import user data
  const importUserData = (payload: any) => {
    if (payload.db) {
      localStorage.setItem('lunefunhub_local_db', JSON.stringify(payload.db));
    }
    if (payload.user) {
      localStorage.setItem('lunefunhub_current_user', JSON.stringify(payload.user));
    }
    // Set reload or update local state
    window.location.reload();
  };

  // Cloud Save creation
  const handleCreateCloudSave = async () => {
    setCloudLoading(true);
    setBackupStatusMessage({ type: '', text: '' });
    try {
      const payload = packageUserData();
      const res = await fetch('/api/saves/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
      });
      if (!res.ok) throw new Error("Server rejected cloud save creation.");
      const result = await res.json();
      if (result.success && result.code) {
        setGeneratedCloudCode(result.code);
        setBackupStatusMessage({ type: 'success', text: 'Cloud backup complete!' });
      } else {
        throw new Error(result.error || "Save code generation failed.");
      }
    } catch (err: any) {
      console.error(err);
      setBackupStatusMessage({ type: 'error', text: err.message || "Failed to create cloud backup." });
    } finally {
      setCloudLoading(false);
    }
  };

  // Cloud Save loading
  const handleLoadCloudSave = async (codeToLoad: string) => {
    if (!codeToLoad || !codeToLoad.trim()) return;
    setCloudLoading(true);
    setBackupStatusMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/saves/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToLoad.trim() })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Cloud Save not found.");
      }
      const result = await res.json();
      if (result.success && result.data) {
        importUserData(result.data);
      } else {
        throw new Error("Invalid response from save server.");
      }
    } catch (err: any) {
      console.error(err);
      setBackupStatusMessage({ type: 'error', text: err.message || "Invalid or expired Cloud Save code." });
    } finally {
      setCloudLoading(false);
    }
  };

  // Generate Lune Code explicitly in Backup & Sync modal
  const handleGenerateLuneCode = async () => {
    if (!firebaseUser) {
      setBackupStatusMessage({ type: 'error', text: 'You must be logged in to generate a Lune Code.' });
      return;
    }
    setCloudLoading(true);
    setBackupStatusMessage({ type: '', text: '' });
    try {
      const newCode = generateUniqueLuneCode();
      const updatedProfile: UserProfile = {
        ...userProfile,
        name: userProfile?.name || 'LUNÉ Player',
        sex: userProfile?.sex || 'Secret',
        age: userProfile?.age || 18,
        country: userProfile?.country || 'Other',
        luneSince: userProfile?.luneSince || '2024',
        luneCode: newCode,
        avatar: userAvatar || undefined,
        coins,
        unlockedAvatars
      };

      // Save to local & cloud firestore
      await saveUserData(firebaseUser.uid, updatedProfile);
      setUserProfile(updatedProfile);

      // Create backup save mapping under this code on server
      const backupPayload = {
        db: {
          [`users/${firebaseUser.uid}`]: {
            ...updatedProfile,
            hasEnteredHub: true
          }
        },
        user: {
          uid: firebaseUser.uid,
          displayName: newCode,
          isAnonymous: firebaseUser.isAnonymous
        }
      };

      const res = await fetch('/api/saves/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: backupPayload, code: newCode })
      });
      
      const result = await res.json();
      if (result.success) {
        setBackupStatusMessage({ type: 'success', text: `✨ Successfully generated & registered Lune Code: ${newCode}` });
      } else {
        throw new Error(result.error || "Failed to register code on sync server.");
      }
    } catch (err: any) {
      console.error("Error generating Lune Code:", err);
      setBackupStatusMessage({ type: 'error', text: err.message || 'Failed to generate Lune Code.' });
    } finally {
      setCloudLoading(false);
    }
  };

  // Profile setup wizard callback
  const handleCompleteIntroProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setCoins(20);
    playCoinSound();
  };

  const handleSelectAvatar = async (emoji: string) => {
    setUserAvatar(emoji);
    setUnlockedAvatars([emoji]);
    playCoinSound();
    if (firebaseUser && userProfile) {
      const fullProfile: UserProfile = {
        ...userProfile,
        avatar: emoji,
        coins: 20,
        unlockedAvatars: [emoji]
      };
      await saveUserData(firebaseUser.uid, fullProfile);
      setUserProfile(fullProfile);
    }
  };

  // Theme styling mapper
  const isLightTheme = ['spring', 'summer', 'autumn', 'winter', 'desert'].includes(theme);

  const getThemeClasses = () => {
    switch (theme) {
      case 'spring':
        return {
          wrapper: 'bg-gradient-to-br from-pink-50 via-emerald-50 to-pink-100 text-slate-800',
          card: 'bg-white/80 border-pink-100/80 text-slate-800 shadow-md',
          sidebar: 'bg-white/95 border-pink-100/80 text-slate-800 shadow-xl',
          sidebarActive: 'bg-pink-500/10 text-pink-600 border-pink-500',
          accentBtn: 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm shadow-pink-500/20',
          header: 'bg-white/80 border-pink-100/80 shadow-sm'
        };
      case 'summer':
        return {
          wrapper: 'bg-gradient-to-br from-amber-50 via-sky-50 to-blue-100 text-slate-800',
          card: 'bg-white/80 border-amber-100/80 text-slate-800 shadow-md',
          sidebar: 'bg-white/95 border-amber-100/80 text-slate-800 shadow-xl',
          sidebarActive: 'bg-amber-500/10 text-amber-600 border-amber-500',
          accentBtn: 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm shadow-amber-500/20',
          header: 'bg-white/80 border-amber-100/80 shadow-sm'
        };
      case 'autumn':
        return {
          wrapper: 'bg-gradient-to-br from-orange-50 via-amber-50 to-amber-100 text-slate-800',
          card: 'bg-white/80 border-orange-100/80 text-slate-800 shadow-md',
          sidebar: 'bg-white/95 border-orange-100/80 text-slate-800 shadow-xl',
          sidebarActive: 'bg-orange-500/10 text-orange-600 border-orange-500',
          accentBtn: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20',
          header: 'bg-white/80 border-orange-100/80 shadow-sm'
        };
      case 'winter':
        return {
          wrapper: 'bg-gradient-to-br from-sky-50 via-slate-50 to-slate-100 text-slate-800',
          card: 'bg-white/80 border-sky-100/80 text-slate-800 shadow-md',
          sidebar: 'bg-white/95 border-sky-100/80 text-slate-800 shadow-xl',
          sidebarActive: 'bg-sky-500/10 text-sky-600 border-sky-500',
          accentBtn: 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/20',
          header: 'bg-white/80 border-sky-100/80 shadow-sm'
        };
      case 'desert':
        return {
          wrapper: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-orange-100 text-slate-800',
          card: 'bg-white/80 border-orange-200/85 text-slate-800 shadow-md',
          sidebar: 'bg-white/95 border-orange-100/80 text-slate-800 shadow-xl',
          sidebarActive: 'bg-orange-500/10 text-orange-600 border-orange-500',
          accentBtn: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20',
          header: 'bg-white/80 border-orange-100/80 shadow-sm'
        };
      case 'darkMoon':
      default:
        return {
          wrapper: 'bg-slate-950 text-white',
          card: 'bg-slate-900/60 border-slate-800 text-white shadow-xl',
          sidebar: 'bg-slate-900/90 border-slate-850 text-white shadow-2xl backdrop-blur-md',
          sidebarActive: 'bg-pink-500/10 text-pink-400 border-pink-500',
          accentBtn: 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:from-pink-600 hover:to-indigo-600 shadow-md shadow-pink-500/10',
          header: 'bg-slate-900/80 border-slate-850 shadow-sm backdrop-blur-md'
        };
    }
  };

  const style = getThemeClasses();
  const themeStyles = getThemeCardStyles(theme);

  // 1. Loading Authentication State
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-dashed border-pink-500 rounded-full animate-spin"></div>
          <Moon className="w-12 h-12 text-indigo-400 animate-pulse" />
        </div>
        <p className="text-pink-400 font-bold tracking-widest uppercase text-xs font-fredoka animate-pulse">
          Aligning Lunar Orbits...
        </p>
      </div>
    );
  }

  // 2. Custom Unified Welcome Onboarding Wizard
  if (!firebaseUser || !userProfile) {
    if (onboardingStep === 'createProfile') {
      return (
        <IntroductionPage 
          onComplete={(profile) => {
            playClickSound();
            setTempProfile(profile);
            setOnboardingStep('chooseAvatar');
          }} 
          onCancel={() => {
            playClickSound();
            setOnboardingStep('welcome');
          }}
        />
      );
    }

    if (onboardingStep === 'chooseAvatar') {
      return (
        <AvatarPage 
          userData={tempProfile || { name: 'LUNÉ Player', sex: 'Secret', age: 18, country: 'Philippines', luneSince: '2022' }} 
          onProceed={async (emoji) => {
            playClickSound();
            const newCode = generateUniqueLuneCode();
            
            // Automatically sign in under that Lune Code
            const userCred = await signInWithNickname(newCode);
            const uid = userCred.user.uid;
            
            // Form complete profile
            const fullProfile = {
              name: tempProfile?.name || 'LUNÉ Player',
              sex: tempProfile?.sex || 'Secret',
              age: tempProfile?.age || 18,
              country: tempProfile?.country || 'Philippines',
              luneSince: tempProfile?.luneSince || '2022',
              luneCode: newCode,
              avatar: emoji,
              coins: 20,
              unlockedAvatars: [emoji],
              hasEnteredHub: false
            };
            
            // Save to local database
            await saveUserData(uid, fullProfile);
            
            // Sync to server cloud saves immediately in background
            const backupPayload = {
              db: {
                [`users/${uid}`]: fullProfile
              },
              user: {
                uid,
                displayName: newCode,
                isAnonymous: false
              }
            };
            
            try {
              await fetch('/api/saves/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: backupPayload, code: newCode })
              });
            } catch (e) {
              console.warn("Failed immediate initial cloud save registration:", e);
            }
            
            // Update local state to trigger component refresh
            setUserProfile(fullProfile);
            setUserAvatar(emoji);
            setCoins(20);
            setUnlockedAvatars([emoji]);
            setHasEnteredHub(false); // Show the passport first!
            setTempProfile(null);
          }}
          onCancel={() => {
            playClickSound();
            setOnboardingStep('createProfile');
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-fredoka">
        {/* Ambient celestial blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 2.1 returning player step */}
        {onboardingStep === 'returning' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-6 relative z-10"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-tr from-pink-500/20 to-indigo-500/20 border border-pink-500/30 rounded-2xl animate-pulse">
                <Sparkles className="w-12 h-12 text-pink-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white">Welcome Back, LUNÉ! 🌙</h1>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Enter your unique dedicated Lune Code below to restore all your ampersand coins, passport details, and game progress instantly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  🔑 Enter Your Lune Code
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. LUNE-4829JK"
                  value={enteredCloudCode}
                  onChange={(e) => {
                    setEnteredCloudCode(e.target.value.toUpperCase());
                    setLoginError('');
                  }}
                  className="w-full px-5 py-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-white font-mono text-center text-sm focus:outline-none focus:border-pink-500/50 uppercase placeholder-slate-700"
                />
                {loginError && (
                  <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1.5 animate-pulse">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <span>{loginError}</span>
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={cloudLoading || !enteredCloudCode.trim()}
                onClick={async () => {
                  playClickSound();
                  setCloudLoading(true);
                  try {
                     const cleanCode = enteredCloudCode.trim().toUpperCase();
                     const res = await fetch(`/api/saves/load?code=${cleanCode}`);
                     const result = await res.json();
                     if (result.success && result.data) {
                       // Found save code! Restoring!
                       // Make sure we have hasEnteredHub as true for returning players!
                       if (result.data.db) {
                         // Scan for user key and force hasEnteredHub to true!
                         for (const key of Object.keys(result.data.db)) {
                           if (key.startsWith('users/')) {
                             result.data.db[key].hasEnteredHub = true;
                           }
                         }
                       }
                       
                       importUserData(result.data);
                       setLoginError('');
                     } else {
                       setLoginError("Invalid Lune Code or save record not found!");
                     }
                  } catch (err: any) {
                    console.error("Cloud restore failed:", err);
                    setLoginError("Restoration failed. Please check your connection.");
                  } finally {
                    setCloudLoading(false);
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-2xl font-bold hover:from-pink-600 hover:to-indigo-600 shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
              >
                {cloudLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>📥</span>
                    <span>Restore Progress</span>
                  </>
                )}
              </motion.button>
            </div>

            {!showForgotCode ? (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setShowForgotCode(true);
                }}
                className="text-pink-400 hover:text-pink-300 text-xs font-bold tracking-wider underline cursor-pointer transition-all block mx-auto py-1"
              >
                ❓ Forgot your Lune Code?
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center"
              >
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-bold tracking-wider">Forgot your code?</span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Lune Codes are permanent and unique to your account. If you lost your code and didn't copy it elsewhere, you can start fresh to create a brand new account.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setOnboardingStep('createProfile');
                      setShowForgotCode(false);
                    }}
                    className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white rounded-xl text-xs font-bold text-slate-300 cursor-pointer transition-all animate-pulse"
                  >
                    🌱 Start Fresh (New Account)
                  </button>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => {
                playClickSound();
                setOnboardingStep('welcome');
                setLoginError('');
                setShowForgotCode(false);
              }}
              className="text-slate-400 hover:text-white text-xs block mx-auto underline transition-all font-fredoka"
            >
              ← Back to Main Menu
            </button>
          </motion.div>
        )}

        {/* 2.2 main welcome selector step */}
        {onboardingStep === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md p-8 bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-8 relative z-10"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-tr from-pink-500/20 to-indigo-500/20 border border-pink-500/30 rounded-2xl animate-bounce">
                <Sparkles className="w-12 h-12 text-pink-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-yellow-400">Luné</span>
                <span className="text-blue-400">fun</span>
                <span className="text-green-400">hub</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto font-fredoka">
                Your magical celestial sanctuary for &TEAM games, challenges, and special projects!
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Button: New Player */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playClickSound();
                  setOnboardingStep('createProfile');
                }}
                className="w-full p-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-2xl shadow-lg shadow-pink-500/15 transition-all text-left flex items-center space-x-4 cursor-pointer border border-pink-400/20 group"
              >
                <div className="p-3 bg-white/10 rounded-xl text-xl group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div>
                  <span className="font-extrabold text-sm block">New Player</span>
                  <span className="text-[11px] text-pink-100 block opacity-80 font-medium">Create a brand new Lune ID card and begin your journey</span>
                </div>
              </motion.button>

              {/* Button: Returning Player */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playClickSound();
                  setOnboardingStep('returning');
                }}
                className="w-full p-4 bg-slate-900/80 border-2 border-pink-500/10 hover:border-pink-500/30 text-pink-400 hover:text-pink-300 rounded-2xl shadow-lg transition-all text-left flex items-center space-x-4 cursor-pointer group"
              >
                <div className="p-3 bg-pink-500/10 rounded-xl text-xl group-hover:scale-110 transition-transform">
                  🌙
                </div>
                <div>
                  <span className="font-extrabold text-sm block text-white">Returning Player</span>
                  <span className="text-[11px] text-slate-400 block opacity-80 font-medium">Restore your existing progress instantly using your Lune Code</span>
                </div>
              </motion.button>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal">
              Thank you for visiting LUNÉVILLE. Explore with the fandom!
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // Intermediate User Card printing before entering main hub
  if (!hasEnteredHub) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-pink-400 text-xs font-bold tracking-widest uppercase">PRINTING SUCCESSFUL</span>
          <h2 className="text-3xl font-black text-white font-fredoka">Your LUNÉ Passport is ready!</h2>
        </div>

        <div className="w-full max-w-sm">
          <IdCard
            name={userProfile.name}
            sex={userProfile.sex}
            age={userProfile.age}
            country={userProfile.country}
            luneSince={userProfile.luneSince}
            avatar={userAvatar || '🐺'}
            coins={coins}
            rank={userRank.title}
            luneCode={userProfile.luneCode}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            playClickSound();
            setHasEnteredHub(true);
            if (firebaseUser && userProfile) {
              const updatedProfile: UserProfile = {
                name: userProfile.name,
                sex: userProfile.sex,
                age: userProfile.age,
                country: userProfile.country,
                luneSince: userProfile.luneSince,
                luneCode: userProfile.luneCode,
                bias: userProfile.bias || '',
                biasWrecker: userProfile.biasWrecker || '',
                stanlist: userProfile.stanlist || '',
                socials: userProfile.socials || { twitter: '', tiktok: '', instagram: '' },
                avatar: userAvatar || undefined,
                coins,
                unlockedAvatars
              };
              await saveUserData(firebaseUser.uid, {
                ...updatedProfile,
                hasEnteredHub: true
              });
              setUserProfile(updatedProfile);
              
              // Direct backup sync under their code
              try {
                const payload = packageUserData();
                if (payload.db && payload.db[`users/${firebaseUser.uid}`]) {
                  payload.db[`users/${firebaseUser.uid}`].hasEnteredHub = true;
                }
                await fetch('/api/saves/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ data: payload, code: userProfile.luneCode })
                });
              } catch (e) {
                console.warn("Failed background auto-save on enter:", e);
              }
            }
          }}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-2xl font-bold text-white text-lg shadow-xl hover:from-pink-600 hover:to-indigo-600 transition-all font-fredoka cursor-pointer"
        >
          Enter LUNÉ Fun Hub 🐺🌕
        </motion.button>
      </div>
    );
  }

  // Games definitions list
  const GAMES = [
    {
      id: 'quiz',
      name: 'LUNÉ Quiz',
      emoji: '💡',
      desc: 'Test your official &TEAM fandom intelligence! Guess trivia questions to win coins.',
      fee: '5 Coins',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'memory',
      name: 'Pack Memory Match',
      emoji: '🔮',
      desc: 'Flip and match tiles depicting member representative emojis in record time.',
      fee: '5 Coins',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'flappy',
      name: 'Flappy Wolf',
      emoji: '🐺',
      desc: 'Jump over obstacles with custom character select screens featuring high scores.',
      fee: '5 Coins',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'guess_song',
      name: 'Wolf Sound',
      emoji: '🐺🎵',
      desc: 'Listen to a 1-second audio clip of an &TEAM song and guess the correct title. Unlimited tries!',
      fee: '2 Coins',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'puzzle',
      name: 'Wolf Puzzle',
      emoji: '🧩',
      desc: 'Jigsaw 12-piece grid swapping board. Finish within 2 minutes to win 10 coins.',
      fee: '5 Coins',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'wolfdle',
      name: 'Wolfdle',
      emoji: '🐺💬',
      desc: 'A text-based 5-letter word guessing game. Guess the secret wolf/nature-themed word in 6 tries!',
      fee: '5 Coins',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'lucky_moon',
      name: 'Lucky Moon Slot',
      emoji: '🎰',
      desc: 'Spin three reels hoping to match rare full moons or member representative emojis.',
      fee: 'Free',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'odd_one_out',
      name: 'Odd One Out',
      emoji: '👁️',
      desc: 'Spot the subtly different icon in the 3x3 grid before the timer expires!',
      fee: '5 Coins',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'paw_print_trail',
      name: 'Paw Print Trail',
      emoji: '🐾',
      desc: 'Watch and replicate a sequence of paw prints from memory!',
      fee: '5 Coins',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'maze',
      name: 'Wolf Maze',
      emoji: '🧭',
      desc: 'Direct the cute wolf emoji via keypad to reach golden crescent moons in 30 seconds.',
      fee: '5 Coins',
      gradient: 'from-indigo-500 to-pink-500'
    }
  ];

  return (
    <div className={`h-screen w-screen overflow-hidden relative font-fredoka flex transition-all duration-500 ${style.wrapper} ${isLightTheme ? 'theme-light' : 'theme-dark'}`}>
      
      {/* Animated falling background effects based on active theme */}
      <ThemeEffects theme={theme} />

      {/* Sidebar Backdrop overlay for mobile/tablet */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClickSound();
              setSidebarOpen(false);
            }}
            className="fixed inset-0 bg-black/60 z-35 md:hidden cursor-pointer backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <div 
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 w-64 p-6 flex flex-col justify-between transition-all duration-300 transform border-r h-full overflow-y-auto shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:opacity-0 md:pointer-events-none'
        } ${style.sidebar}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="space-y-6">
          {/* Brand logo header with its own Close Button */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="text-lg font-bold tracking-wide">
                  <span className="text-yellow-400">Luné</span>
                  <span className="text-blue-400">fun</span>
                  <span className="text-green-400">hub</span>
                </h1>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">FANDOM PLAYGROUND</span>
              </div>
            </div>

            {/* Sidebar close button */}
            <button 
              onClick={() => {
                playClickSound();
                setSidebarOpen(false);
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              aria-label="Close Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Enhanced High-Visibility User Status Card */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-5 border-2 border-pink-500/20 shadow-lg shadow-pink-500/5 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-2 border-white/10 flex items-center justify-center text-4.5xl shadow-md">
                  <span className="z-10 animate-bounce" style={{ animationDuration: '3s' }}>{userAvatar}</span>
                  <div className="absolute inset-0 bg-pink-500/5 rounded-full blur-sm animate-pulse" />
                </div>
                {userProfile?.luneCode && (
                  <span className="text-[8px] font-mono mt-1.5 text-pink-400 font-extrabold tracking-wider px-1.5 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded">
                    {userProfile.luneCode}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">ACTIVE PLAYER</span>
                <span className="font-black text-xl text-white tracking-wide block leading-none">{userProfile.name}</span>
                <span className="text-[11px] font-mono tracking-wider text-pink-400 font-bold uppercase flex items-center gap-1">
                  Rank: {userRank.badge} {userRank.title}
                </span>
              </div>
            </div>

            {/* Glowing Coin Bank Display */}
            <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/15 to-yellow-500/10 p-3.5 rounded-xl border border-yellow-500/30 flex justify-between items-center text-sm font-bold text-yellow-400 shadow-inner">
              <div className="flex items-center gap-1.5">
                <AmpersandCoin className="w-5 h-5 text-[10px]" animate={true} />
                <span className="tracking-wide">LUNÉ COINS:</span>
              </div>
              <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 drop-shadow-sm">{coins}</span>
            </div>

            {/* Lune ID Button */}
            <button
              onClick={() => {
                playClickSound();
                setIsLuneIdModalOpen(true);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-pink-500/10 hover:from-pink-500/25 hover:to-purple-500/25 border border-pink-500/30 hover:border-pink-500/50 text-pink-300 hover:text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-widest shadow-md"
            >
              <span>🎫</span>
              <span>Lune ID Card</span>
            </button>
 
            {/* Save Code Backup/Restore Trigger */}
            <button
              onClick={() => {
                playClickSound();
                setIsBackupModalOpen(true);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-pink-400 hover:text-pink-300 font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider shadow-md"
            >
              <span>💾</span>
              <span>Data Backup & Sync</span>
            </button>
          </div>

          {/* Nav List - Not scrollable as requested */}
          <motion.nav 
            variants={sidebarContainerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 pt-2 select-none"
          >
            {/* Main Portal Section */}
            <motion.div variants={sidebarItemVariants} className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block px-2 mb-1">MAIN PORTAL</span>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('games');
                  setActiveGameId(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all border cursor-pointer ${
                  activeTab === 'games' 
                    ? style.sidebarActive
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gamepad2 size={16} />
                <span>Play Games</span>
              </button>
            </motion.div>

            {/* About &TEAM Section */}
            <motion.div variants={sidebarItemVariants} className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block px-2 mb-1">ABOUT &TEAM</span>
              {[
                { id: 'profile', label: 'Group Profile', emoji: '📝' },
                { id: 'members', label: 'Members', emoji: '👥' },
                { id: 'discography', label: 'Discography', emoji: 'CD Player' },
                { id: 'fandom', label: 'Fandom & Lightstick', emoji: '🌙' },
                { id: 'webtoon_lore', label: 'Webtoon Lore', emoji: '🐺' },
              ].map((sub) => {
                const isActive = activeTab === 'about_team' && activeTeamSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      playClickSound();
                      setActiveTab('about_team');
                      setActiveTeamSubTab(sub.id as any);
                      setActiveGameId(null);
                    }}
                    className={`w-full flex items-center space-x-3 pl-6 pr-4 py-2 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-pink-500/15 border-pink-500/30 text-pink-400 font-extrabold'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm font-mono">{sub.emoji === 'CD Player' ? '💿' : sub.emoji}</span>
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Specials Section */}
            <motion.div variants={sidebarItemVariants} className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block px-2 mb-1">SPECIALS</span>
              {[
                { id: 'snap', label: '&snap', emoji: '📸' },
                { id: 'mate', label: '&mate', emoji: '💖' },
                { id: 'wolf_type', label: 'Wolf Type', emoji: '🐺' },
                { id: 'which_song', label: 'Which Song?', emoji: '🎵' },
              ].map((sub) => {
                const isActive = activeTab === 'special_projects' && activeSpecialSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      playClickSound();
                      setActiveTab('special_projects');
                      setActiveSpecialSubTab(sub.id as any);
                      setActiveGameId(null);
                    }}
                    className={`w-full flex items-center space-x-3 pl-6 pr-4 py-2 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-extrabold'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm font-mono">{sub.emoji}</span>
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Luneville Board Section */}
            <motion.div variants={sidebarItemVariants} className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block px-2 mb-1">COMMUNITY</span>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('luneville_board');
                  setActiveGameId(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all border cursor-pointer ${
                  activeTab === 'luneville_board' 
                    ? style.sidebarActive
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm shrink-0 font-bold">🐺</span>
                <span>Luneville Board</span>
              </button>
            </motion.div>

            {/* User Section */}
            <motion.div variants={sidebarItemVariants} className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block px-2 mb-1">MAKER</span>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('about_me');
                  setActiveGameId(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all border cursor-pointer ${
                  activeTab === 'about_me' 
                    ? style.sidebarActive
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User size={16} />
                <span>About Me!</span>
              </button>
            </motion.div>
          </motion.nav>
        </div>

        {/* Sidebar Log Out */}
        <button
          onClick={handleLogOut}
          className="flex items-center space-x-2 text-rose-400 hover:text-rose-300 text-sm font-bold pt-4 border-t border-white/5 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* Dynamic Header */}
        <header className={`px-4 md:px-8 py-4 flex items-center justify-between border-b ${style.header}`}>
          {/* Left Side: Three-Line Menu Button & LUNÉ Hub Logo */}
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => {
                playClickSound();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Right Side: Theme custom presets togglers */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-black/15 p-1 rounded-full border border-white/5 overflow-x-auto max-w-[240px] sm:max-w-none">
              {[
                { id: 'darkMoon', label: '🌑', name: 'Dark Moon' },
                { id: 'spring', label: '🌸', name: 'Spring' },
                { id: 'summer', label: '🌻', name: 'Summer' },
                { id: 'autumn', label: '🍁', name: 'Autumn' },
                { id: 'winter', label: '❄️', name: 'Winter' },
                { id: 'desert', label: '🌵', name: 'Desert' },
              ].map((themeItem) => (
                <button
                  key={themeItem.id}
                  onClick={() => {
                    playClickSound();
                    setTheme(themeItem.id as any);
                  }}
                  title={themeItem.name}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm hover:scale-110 transition-all cursor-pointer ${
                    theme === themeItem.id ? 'bg-white/30 shadow' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {themeItem.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Dashboard Pages Scroll Content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">

          {/* Overlay Active Game View */}
          <AnimatePresence mode="wait">
            {activeGameId ? (
              <motion.div
                key="active-game-overlay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                {activeGameId === 'quiz' && (
                  <LuneQuiz 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'memory' && (
                  <PackMemory 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'flappy' && (
                  <FlappyWolf 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'guess_song' && (
                  <WolfSound 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'puzzle' && (
                  <WolfPuzzle 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'wolfdle' && (
                  <Wolfdle 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                    theme={theme}
                  />
                )}
                {activeGameId === 'lucky_moon' && (
                  <LuckyMoon 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'maze' && (
                  <WolfMaze 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                  />
                )}
                {activeGameId === 'odd_one_out' && (
                  <OddOneOut 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                    theme={theme}
                  />
                )}
                {activeGameId === 'paw_print_trail' && (
                  <PawPrintTrail 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    onExit={() => {
                      playClickSound();
                      setActiveGameId(null);
                    }} 
                    theme={theme}
                  />
                )}
              </motion.div>
            ) : (
              // Standard Routing Views
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* 1. PLAY GAMES TAB */}
                {activeTab === 'games' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left space-y-1">
                      <h3 className={`text-3xl ${themeStyles.title}`}>
                        Welcome, <span className={themeStyles.textHighlight}>{userProfile.name}</span>! 👋
                      </h3>
                      <p className={`text-sm ${themeStyles.textSecondary}`}>
                        Pick a game below and start accumulating <span className={`${themeStyles.textHighlight} font-bold`}>Coins</span>!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {GAMES.map((game) => (
                        <motion.div
                          key={game.id}
                          whileHover={{ y: -6 }}
                          className={`flex flex-col justify-between p-5 rounded-3xl border ${themeStyles.cardBg} ${themeStyles.glowBorder} transition-all`}
                        >
                          <div className="space-y-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow`}>
                              {game.emoji}
                            </div>
                            <div>
                              <h4 className={`text-lg font-black tracking-wide ${themeStyles.title}`}>{game.name}</h4>
                              <p className={`text-xs mt-1 leading-relaxed ${themeStyles.textSecondary}`}>
                                {game.desc}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-between items-center border-t border-slate-800/10 dark:border-white/5 mt-4 text-xs font-bold">
                            <span className={themeStyles.textHighlight}>Fee: {game.fee}</span>
                            <button
                              onClick={() => {
                                playClickSound();
                                if (game.fee.includes('5') && coins < 5) {
                                  alert("You need at least 5 coins to start this game!");
                                  return;
                                }
                                setActiveGameId(game.id);
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all ${themeStyles.btnAccent}`}
                            >
                              Play Now
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ABOUT &TEAM TAB */}
                {activeTab === 'about_team' && (
                  <AboutAndTeam 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    activeTab={activeTeamSubTab}
                    setActiveTab={setActiveTeamSubTab}
                    theme={theme}
                  />
                )}

                {/* 4. SPECIAL PROJECTS TAB */}
                {activeTab === 'special_projects' && (
                  <div className="space-y-6">
                    {/* Sub-tab menu selectors */}
                    <div className="flex gap-2 justify-center border-b border-white/5 pb-4">
                      {[
                        { id: 'snap', label: '📸 &snap' },
                        { id: 'mate', label: '💖 &mate' },
                        { id: 'wolf_type', label: '🐺 Wolf Type' },
                        { id: 'which_song', label: '🎵 Which Song?' },
                      ].map((subItem) => {
                        const isActive = activeSpecialSubTab === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              playClickSound();
                              setActiveSpecialSubTab(subItem.id as any);
                            }}
                            className={`px-5 py-2.5 rounded-full font-black text-xs transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md'
                                : `${themeStyles.cardBg} ${themeStyles.textSecondary} hover:${themeStyles.textPrimary} border border-slate-200 dark:border-slate-800`
                            }`}
                          >
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      {activeSpecialSubTab === 'snap' ? (
                        <SnapProject coins={coins} onUpdateCoins={handleUpdateCoins} theme={theme} />
                      ) : activeSpecialSubTab === 'mate' ? (
                        <MateProject coins={coins} onUpdateCoins={handleUpdateCoins} theme={theme} />
                      ) : activeSpecialSubTab === 'which_song' ? (
                        <WhichSongProject coins={coins} onUpdateCoins={handleUpdateCoins} theme={theme} />
                      ) : (
                        <WolfTypeProject coins={coins} onUpdateCoins={handleUpdateCoins} theme={theme} />
                      )}
                    </div>
                  </div>
                )}

                {/* 4.5. LUNEVILLE BOARD TAB */}
                {activeTab === 'luneville_board' && (
                  <LunevilleBoard 
                    coins={coins} 
                    onUpdateCoins={handleUpdateCoins} 
                    firebaseUser={firebaseUser}
                    theme={theme}
                    playerName={userProfile?.name}
                    userProfile={userProfile}
                  />
                )}

                {/* 5. ABOUT ME! TAB */}
                {activeTab === 'about_me' && (
                  <AboutMe />
                )}


              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* LUNÉ PASSPORT EDITOR MODAL OVERLAY */}
      <AnimatePresence>
        {isEditingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsEditingId(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-pink-500/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                    📝 Customize LUNÉ Passport
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fine-tune your official digital photocard and Luneville ID details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsEditingId(false);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveIdChanges} className="space-y-6">
                
                {/* 1. Emoji Avatar Grid Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Choose Your Avatar Icon
                  </label>
                  <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl justify-center">
                    {['🐺', '🌕', '🐾', '🍊', '🎮', '👑', '🍓', '🐱', '🍚', '🐰', '🐥', '🐶', '🔮', '✨', '⭐', '🌌'].map((emoji) => {
                      const isSelected = editingProfile.avatar === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setEditingProfile((prev: any) => ({ ...prev, avatar: emoji }));
                          }}
                          className={`w-11 h-11 text-2.5xl rounded-full flex items-center justify-center cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-pink-500/25 border-2 border-pink-500 scale-110 shadow-lg shadow-pink-500/20' 
                              : 'bg-slate-900 hover:bg-slate-800 border border-white/5 opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Display Name</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Age Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      required
                      value={editingProfile.age}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    />
                  </div>

                  {/* Sex Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Gender Ident.</label>
                    <select
                      value={editingProfile.sex}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, sex: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Secret">Secret</option>
                    </select>
                  </div>

                  {/* Country Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Country</label>
                    <select
                      value={editingProfile.country}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    >
                      {['Philippines', 'Japan', 'South Korea', 'Taiwan', 'United States', 'Germany', 'Canada', 'Indonesia', 'Thailand', 'Vietnam', 'United Kingdom', 'Australia', 'Singapore', 'Malaysia', 'Other'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* LUNÉ Since Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">LUNÉ Since</label>
                    <select
                      value={editingProfile.luneSince}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, luneSince: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    >
                      {['2022', '2023', '2024', '2025', '2026'].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bias Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Bias Member</label>
                    <select
                      value={editingProfile.bias}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, bias: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    >
                      <option value="">Select Member</option>
                      {['EJ', 'Fuma', 'K', 'Nicholas', 'Yuma', 'Jo', 'Harua', 'Taki', 'Maki', 'None'].map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bias Wrecker Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Bias Wrecker</label>
                    <select
                      value={editingProfile.biasWrecker}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, biasWrecker: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                    >
                      <option value="">Select Member</option>
                      {['EJ', 'Fuma', 'K', 'Nicholas', 'Yuma', 'Jo', 'Harua', 'Taki', 'Maki', 'None'].map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stanlist Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Other Groups I Stan</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={editingProfile.stanlist}
                      onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, stanlist: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 transition-all text-white"
                      placeholder="e.g. &TEAM, BTS, SEVENTEEN"
                    />
                  </div>
                </div>

                {/* Social Media Inputs */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block">
                    Social Media Contacts
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Twitter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Twitter / X</label>
                      <input
                        type="text"
                        maxLength={20}
                        value={editingProfile.socials?.twitter}
                        onChange={(e) => setEditingProfile((prev: any) => ({ 
                          ...prev, 
                          socials: { ...prev.socials, twitter: e.target.value } 
                        }))}
                        className="w-full px-3.5 py-2 rounded-lg text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 text-white"
                        placeholder="@username"
                      />
                    </div>
                    {/* TikTok */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">TikTok</label>
                      <input
                        type="text"
                        maxLength={20}
                        value={editingProfile.socials?.tiktok}
                        onChange={(e) => setEditingProfile((prev: any) => ({ 
                          ...prev, 
                          socials: { ...prev.socials, tiktok: e.target.value } 
                        }))}
                        className="w-full px-3.5 py-2 rounded-lg text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 text-white"
                        placeholder="@username"
                      />
                    </div>
                    {/* Instagram */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Instagram</label>
                      <input
                        type="text"
                        maxLength={20}
                        value={editingProfile.socials?.instagram}
                        onChange={(e) => setEditingProfile((prev: any) => ({ 
                          ...prev, 
                          socials: { ...prev.socials, instagram: e.target.value } 
                        }))}
                        className="w-full px-3.5 py-2 rounded-lg text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 text-white"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsEditingId(false);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl cursor-pointer transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Backup & Sync Modal */}
      <AnimatePresence>
        {isBackupModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsBackupModalOpen(false);
                  setBackupStatusMessage({ type: '', text: '' });
                  setEnteredCloudCode('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-1">
                <span className="text-pink-400 text-[10px] font-black tracking-widest uppercase font-fredoka">LUNÉVILLE SECURE ENGINE</span>
                <h2 className="text-2xl font-black text-white font-fredoka">Data Backup & Sync</h2>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed font-fredoka">
                  Transfer your permanent LUNÉ profile, unlocked items, and &TEAM ampersand coins to any phone, computer, or browser instantly using your unique code!
                </p>
              </div>

              {backupStatusMessage.text && (
                <div className={`p-4 rounded-xl border text-xs font-medium text-center flex items-center justify-center gap-2 font-fredoka ${
                  backupStatusMessage.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {backupStatusMessage.type === 'success' ? '✨' : '⚠️'}
                  <span>{backupStatusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Get Code Tile */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-fredoka">
                      <span>🔑</span> Get Code
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-fredoka">
                      Your permanent, unique LUNÉ Code dedicated specifically to your account. Write this down or memorize it!
                    </p>

                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center space-y-1 mt-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block font-fredoka">YOUR LUNE CODE:</span>
                      <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 font-mono block">
                        {userProfile?.luneCode || 'NOT AVAILABLE'}
                      </span>
                    </div>

                    {!userProfile?.luneCode || userProfile.luneCode === 'NOT AVAILABLE' ? (
                      <button
                        disabled={cloudLoading}
                        onClick={handleGenerateLuneCode}
                        className="w-full mt-3 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 hover:from-yellow-500 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg font-fredoka animate-pulse"
                      >
                        {cloudLoading ? (
                          <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>✨ Generate My Lune Code</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center mt-2.5">
                        <span className="text-[10px] text-green-400 font-bold font-fredoka flex items-center justify-center gap-1.5">
                          <span>✓</span> Lune Code generated & bound to account
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        if (userProfile?.luneCode && userProfile.luneCode !== 'NOT AVAILABLE') {
                          navigator.clipboard.writeText(userProfile.luneCode);
                          setBackupStatusMessage({ type: 'success', text: 'Lune Code copied to clipboard!' });
                        } else {
                          setBackupStatusMessage({ type: 'error', text: 'Please generate a Lune Code first!' });
                        }
                      }}
                      className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-fredoka"
                    >
                      <span>📋 Copy Code</span>
                    </button>

                    <button
                      disabled={cloudLoading || !userProfile?.luneCode || userProfile.luneCode === 'NOT AVAILABLE'}
                      onClick={async () => {
                        playClickSound();
                        setCloudLoading(true);
                        try {
                          const payload = packageUserData();
                          const res = await fetch('/api/saves/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: payload, code: userProfile?.luneCode })
                          });
                          const result = await res.json();
                          if (result.success) {
                            setBackupStatusMessage({ type: 'success', text: 'Backup synchronized to cloud database successfully!' });
                          } else {
                            throw new Error(result.error);
                          }
                        } catch (err: any) {
                          setBackupStatusMessage({ type: 'error', text: 'Cloud sync failed: ' + err.message });
                        } finally {
                          setCloudLoading(false);
                        }
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-fredoka"
                    >
                      {cloudLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>☁️ Sync & Backup Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Restore Data Tile */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-fredoka">
                      <span>📥</span> Restore Data
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-fredoka">
                      Logging in from another browser or device? Paste your unique dedicated Lune Code below to retrieve your saved profile.
                    </p>

                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-fredoka">
                        Enter Lune Code
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. LUNE-4829JK"
                        value={enteredCloudCode}
                        onChange={(e) => setEnteredCloudCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center text-sm focus:outline-none focus:border-pink-500/50 uppercase placeholder-slate-700"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={cloudLoading || !enteredCloudCode.trim()}
                      onClick={async () => {
                        playClickSound();
                        setCloudLoading(true);
                        try {
                          const cleanCode = enteredCloudCode.trim().toUpperCase();
                          const res = await fetch(`/api/saves/load?code=${cleanCode}`);
                          const result = await res.json();
                          if (result.success && result.data) {
                            if (result.data.db) {
                              for (const key of Object.keys(result.data.db)) {
                                if (key.startsWith('users/')) {
                                  result.data.db[key].hasEnteredHub = true;
                                }
                              }
                            }
                            importUserData(result.data);
                            setBackupStatusMessage({ type: 'success', text: 'Data restored successfully! Progress loaded.' });
                          } else {
                            setBackupStatusMessage({ type: 'error', text: 'Invalid Lune Code or save record not found!' });
                          }
                        } catch (err: any) {
                          console.error("Cloud restore failed:", err);
                          setBackupStatusMessage({ type: 'error', text: 'Restoration failed. Please check connection.' });
                        } finally {
                          setCloudLoading(false);
                        }
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-fredoka"
                    >
                      {cloudLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>📥 Restore Progress</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-2 text-center">
                <p className="text-[10px] text-slate-500 leading-normal max-w-sm mx-auto font-fredoka">
                  💡 <strong>Important:</strong> Lune Codes are unique, single dedicated keys for each individual player. Keep your code safe to protect your account.
                </p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lune ID Card Viewer & Editor Modal */}
      <AnimatePresence>
        {isLuneIdModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[990] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsLuneIdModalOpen(false);
              setIsEditingIdInModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsLuneIdModalOpen(false);
                  setIsEditingIdInModal(false);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-1">
                <span className="text-pink-400 text-[10px] font-black tracking-widest uppercase font-fredoka">LUNÉ Hub Pass</span>
                <h2 className="text-2xl font-black text-white font-fredoka">
                  {isEditingIdInModal ? "Edit My Lune ID" : "My Lune ID Card"}
                </h2>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed font-fredoka">
                  {isEditingIdInModal 
                    ? "Modify your official photocard identity credentials below." 
                    : "Show off and download your authentic LUNÉ community identity photocard."}
                </p>
              </div>

              {isEditingIdInModal ? (
                /* Edit Mode: Edit Form */
                <form onSubmit={handleSaveIdChanges} className="space-y-6">
                  {/* Avatar Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-fredoka">
                      Choose Your Avatar Icon
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-2xl justify-center">
                      {['🐺', '🌕', '🐾', '🍊', '🎮', '👑', '🍓', '🐱', '🍚', '🐰', '🐥', '🐶', '🔮', '✨', '⭐', '🌌'].map((emoji) => {
                        const isSelected = editingProfile.avatar === emoji;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setEditingProfile((prev: any) => ({ ...prev, avatar: emoji }));
                            }}
                            className={`w-10 h-10 text-xl rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-pink-500/25 border-2 border-pink-500 scale-110 shadow-lg shadow-pink-500/20' 
                                : 'bg-slate-900 hover:bg-slate-800 border border-white/5 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Display Name</label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={editingProfile.name}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Age</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        required
                        value={editingProfile.age}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, age: Number(e.target.value) }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Gender Ident.</label>
                      <select
                        value={editingProfile.sex}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, sex: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Secret">Secret</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Country</label>
                      <select
                        value={editingProfile.country}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      >
                        {['Philippines', 'Japan', 'South Korea', 'Taiwan', 'United States', 'Germany', 'Canada', 'Indonesia', 'Thailand', 'Vietnam', 'United Kingdom', 'Australia', 'Singapore', 'Malaysia', 'Other'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">LUNÉ Since</label>
                      <select
                        value={editingProfile.luneSince}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, luneSince: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      >
                        {['2022', '2023', '2024', '2025', '2026'].map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Bias Member</label>
                      <select
                        value={editingProfile.bias}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, bias: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      >
                        <option value="">Select Member</option>
                        {['EJ', 'Fuma', 'K', 'Nicholas', 'Yuma', 'Jo', 'Harua', 'Taki', 'Maki', 'None'].map((member) => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Bias Wrecker</label>
                      <select
                        value={editingProfile.biasWrecker}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, biasWrecker: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                      >
                        <option value="">Select Member</option>
                        {['EJ', 'Fuma', 'K', 'Nicholas', 'Yuma', 'Jo', 'Harua', 'Taki', 'Maki', 'None'].map((member) => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase font-fredoka">Other Groups I Stan</label>
                      <input
                        type="text"
                        maxLength={30}
                        value={editingProfile.stanlist}
                        onChange={(e) => setEditingProfile((prev: any) => ({ ...prev, stanlist: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-fredoka"
                        placeholder="e.g. &TEAM, BTS"
                      />
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block font-fredoka">
                      Social Media Contacts
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block font-fredoka">Twitter / X</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={editingProfile.socials?.twitter}
                          onChange={(e) => setEditingProfile((prev: any) => ({ 
                            ...prev, 
                            socials: { ...prev.socials, twitter: e.target.value } 
                          }))}
                          className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white font-fredoka"
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block font-fredoka">TikTok</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={editingProfile.socials?.tiktok}
                          onChange={(e) => setEditingProfile((prev: any) => ({ 
                            ...prev, 
                            socials: { ...prev.socials, tiktok: e.target.value } 
                          }))}
                          className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white font-fredoka"
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block font-fredoka">Instagram</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={editingProfile.socials?.instagram}
                          onChange={(e) => setEditingProfile((prev: any) => ({ 
                            ...prev, 
                            socials: { ...prev.socials, instagram: e.target.value } 
                          }))}
                          className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white font-fredoka"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5 font-fredoka">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setIsEditingIdInModal(false);
                      }}
                      className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl cursor-pointer transition-all shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Card View Mode */
                <div className="flex flex-col items-center space-y-6">
                  {userProfile && (
                    <div className="w-full max-w-sm flex justify-center">
                      <div ref={idCardRef} className="w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl p-2.5">
                        <IdCard
                          name={userProfile.name}
                          sex={userProfile.sex}
                          age={userProfile.age}
                          country={userProfile.country}
                          luneSince={userProfile.luneSince}
                          avatar={userAvatar || userProfile.avatar || '🐺'}
                          coins={coins}
                          rank={userRank.title}
                          luneCode={userProfile.luneCode}
                          bias={userProfile.bias}
                          biasWrecker={userProfile.biasWrecker}
                          stanlist={userProfile.stanlist}
                          socials={userProfile.socials}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="w-full flex flex-col sm:flex-row gap-3 pt-2 font-fredoka">
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsEditingIdInModal(true);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <span>📝</span>
                      <span>Edit My Credentials</span>
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        if (idCardRef.current) {
                          toPng(idCardRef.current, { cacheBust: true, backgroundColor: '#020617' })
                            .then((dataUrl) => {
                              const link = document.createElement('a');
                              link.download = `${userProfile?.name || 'lune'}_id_card.png`;
                              link.href = dataUrl;
                              link.click();
                            })
                            .catch((err) => {
                              console.error('Failed to export ID Card image', err);
                              alert('Error generating ID card image download');
                            });
                        }
                      }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>📥</span>
                      <span>Download ID Card</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Gold Coins Shower Animation */}
      <AnimatePresence>
        {triggeredCoins.map((coin, index) => {
          // Calculate random spread direction for each coin
          const randomX1 = (index % 2 === 0 ? -1 : 1) * (150 + Math.random() * 200);
          const randomX2 = randomX1 + (index % 3 === 0 ? -1 : 1) * (50 + Math.random() * 100);
          const peakY = -350 - Math.random() * 250;
          
          return (
            <motion.div
              key={coin.id}
              initial={{ 
                opacity: 0, 
                scale: 0.4,
                x: 'calc(50vw + 100px)', 
                y: '85vh',
                rotate: 0 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.3, 1, 0.7],
                x: [
                  'calc(50vw + 100px)', 
                  `calc(50vw + 100px + ${randomX1}px)`, 
                  `calc(50vw + 100px + ${randomX2}px)`
                ],
                y: [
                  '85vh', 
                  `calc(85vh + ${peakY}px)`, 
                  '110vh'
                ],
                rotate: 360 * (index % 2 === 0 ? 3 : -3)
              }}
              transition={{ 
                duration: 2.3, 
                ease: [0.25, 1, 0.5, 1], 
                delay: coin.delay 
              }}
              className="fixed pointer-events-none z-[9999] select-none filter drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)]"
            >
              <AmpersandCoin className="w-10 h-10 text-xl" />
            </motion.div>
          );
        })}
      </AnimatePresence>

    </div>
  );
}

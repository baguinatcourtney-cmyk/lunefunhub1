/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { playClickSound, playCoinSound } from '../utils/sound';
import { auth, getUserData } from '../utils/firebase';
import { getThemeCardStyles } from '../utils/theme';
import { 
  Camera, Coins, ExternalLink, RefreshCw, 
  ShieldCheck, ArrowLeft, Info, Sparkles 
} from 'lucide-react';

interface SnapProjectProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  theme?: string;
}

export default function SnapProject({ coins, onUpdateCoins, theme }: SnapProjectProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncCoins, setSyncCoins] = useState(coins);
  const [userDisplayName, setUserDisplayName] = useState('LUNÉ Fan');
  const [isIframeActive, setIsIframeActive] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load current display name from firebase auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserDisplayName(user.displayName || 'LUNÉ Fan');
    }
  }, []);

  // Sync internal coin balance prop to display state
  useEffect(() => {
    setSyncCoins(coins);
  }, [coins]);

  // Handle manual database refresh to sync coins across sites
  const handleRefreshBalance = async () => {
    playClickSound();
    setSyncing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const dbData = await getUserData(user.uid);
        if (dbData && typeof dbData.coins === 'number') {
          onUpdateCoins(dbData.coins - coins); // Synchronize state with parent App.tsx
          setSyncCoins(dbData.coins);
        }
      }
    } catch (err) {
      console.error("Failed to sync balance:", err);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  const syncBalanceSilently = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const dbData = await getUserData(user.uid);
        if (dbData && typeof dbData.coins === 'number') {
          onUpdateCoins(dbData.coins - coins);
          setSyncCoins(dbData.coins);
          return dbData.coins;
        }
      }
    } catch (err) {
      console.error("Silent sync failed:", err);
    }
    return coins;
  };

  // Add postMessage handler to synchronize coin balance or hear back from the embedded photobooth
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        'https://ephemeral-mousse-02fba5.netlify.app',
        'http://ephemeral-mousse-02fba5.netlify.app'
      ];
      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data) {
        const data = event.data;

        // Handle explicit update_coins message with coin balance
        if (data.type === 'UPDATE_COINS' && typeof data.coins === 'number') {
          const diff = data.coins - coins;
          if (diff !== 0) {
            onUpdateCoins(diff);
          }
        }
        // Handle generic coins balance update
        else if (typeof data.coins === 'number') {
          const diff = data.coins - coins;
          if (diff !== 0) {
            onUpdateCoins(diff);
          }
        }
        // Handle generic balance update
        else if (typeof data.balance === 'number') {
          const diff = data.balance - coins;
          if (diff !== 0) {
            onUpdateCoins(diff);
          }
        }
        // Handle deductions / purchase / download
        else if (
          data.type === 'DEDUCT_COINS' || 
          data.type === 'COIN_DEDUCTION' || 
          data.type === 'PURCHASE' || 
          data.type === 'DOWNLOAD' ||
          data.type === 'THEME_UNLOCK' ||
          data.type === 'UNLOCK' ||
          data.type === 'UNLOCK_THEME' ||
          data.type === 'UNLOCK_FRAME' ||
          data.type === 'POLAROID_DOWNLOAD' ||
          data.type === 'DOWNLOAD_POLAROID'
        ) {
          // Explicit override matching user specification:
          // 1 theme unlock = 50 coins
          // polaroid download = 100 coins
          let deduction = data.amount || data.cost || data.value;
          
          const isDownload = ['DOWNLOAD', 'POLAROID_DOWNLOAD', 'DOWNLOAD_POLAROID'].includes(data.type);
          const isUnlock = ['THEME_UNLOCK', 'UNLOCK', 'UNLOCK_THEME', 'UNLOCK_FRAME', 'PURCHASE'].includes(data.type);
          
          if (isDownload) {
            deduction = 100;
          } else if (isUnlock) {
            deduction = 50;
          } else if (typeof deduction !== 'number') {
            deduction = 50; // default safe fallback
          }

          if (typeof deduction === 'number') {
            onUpdateCoins(-deduction);
          }
        }
        // Fallback for simple number payload
        else if (typeof data === 'number') {
          const diff = data - coins;
          if (diff !== 0) {
            onUpdateCoins(diff);
          }
        }

        // Handle navigation/exit requests
        if (data.type === 'BACK_TO_MAIN' || data === 'back_to_main' || data.type === 'CLOSE_PHOTOBOOTH') {
          setIsIframeActive(false);
          syncBalanceSilently();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [coins, onUpdateCoins]);

  // Send the updated balance to the iframe in real time whenever coins state changes
  useEffect(() => {
    if (isIframeActive && iframeRef.current && iframeRef.current.contentWindow) {
      const targetWindow = iframeRef.current.contentWindow;
      const syncMsg = {
        type: 'SYNC_COINS',
        coins: coins,
        balance: coins,
        coinsCount: coins,
        amount: coins
      };
      targetWindow.postMessage(syncMsg, 'https://ephemeral-mousse-02fba5.netlify.app');
      // Extra payloads to maximize compatibility with the photobooth's event receiver
      targetWindow.postMessage({ type: 'UPDATE_COINS', coins: coins }, 'https://ephemeral-mousse-02fba5.netlify.app');
      targetWindow.postMessage({ type: 'COINS_UPDATE', coins: coins }, 'https://ephemeral-mousse-02fba5.netlify.app');
      targetWindow.postMessage({ coins: coins }, 'https://ephemeral-mousse-02fba5.netlify.app');
    }
  }, [coins, isIframeActive]);

  // Handle immediate sync on iframe load
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const targetWindow = iframeRef.current.contentWindow;
      targetWindow.postMessage({
        type: 'SYNC_COINS',
        coins: coins,
        balance: coins
      }, 'https://ephemeral-mousse-02fba5.netlify.app');
    }
  };

  // Build the redirection URL passing user data, coin status, and referrer origin
  const getPhotoboothUrl = (coinsOverride?: number) => {
    const baseUrl = "https://ephemeral-mousse-02fba5.netlify.app";
    const user = auth.currentUser;
    const uidParam = user ? user.uid : '';
    const nameParam = encodeURIComponent(userDisplayName);
    const referrerParam = encodeURIComponent(window.location.origin);
    const targetCoins = typeof coinsOverride === 'number' ? coinsOverride : coins;
    
    // Construct search query parameters including referrer callback
    return `${baseUrl}/?uid=${uidParam}&coins=${targetCoins}&name=${nameParam}&referrer=${referrerParam}`;
  };

  const launchPhotoboothInNewTab = () => {
    playCoinSound();
    window.open(getPhotoboothUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleEnterEmbeddedPhotobooth = async () => {
    playCoinSound();
    // Fetch fresh database state first to avoid starting with cached stale coins
    const latestCoins = await syncBalanceSilently();
    const url = getPhotoboothUrl(latestCoins);
    setIframeUrl(url);
    setIsIframeActive(true);
  };

  const themeStyles = getThemeCardStyles(theme || 'darkMoon');

  if (isIframeActive) {
    return (
      <div className={`w-full flex flex-col space-y-4 font-fredoka animate-fadeIn ${themeStyles.textPrimary}`}>
        {/* Navigation / Control Bar */}
        <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-3xl gap-3 shadow-2xl ${themeStyles.cardBg} ${themeStyles.glowBorder}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                setIsIframeActive(false);
                syncBalanceSilently();
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.97] ${themeStyles.btnAccent}`}
            >
              <ArrowLeft size={14} className="shrink-0" />
              <span>Back to Main Site</span>
            </button>
            <div className={`text-xs font-medium hidden md:block ${themeStyles.textSecondary}`}>
              Connected Session: <span className={`${themeStyles.textHighlight} font-black`}>&snap photobooth</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Coins status inside bar */}
            <div className="text-right">
              <div className={`text-[9px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>LUNÉ Coin Balance</div>
              <div className="text-sm font-extrabold flex items-center gap-1.5 justify-end">
                <Coins size={14} className={`animate-pulse ${themeStyles.textHighlight}`} />
                <span className={themeStyles.textHighlight}>{syncCoins} Coins</span>
              </div>
            </div>
            <button
              onClick={handleRefreshBalance}
              disabled={syncing}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${themeStyles.cardBg} ${themeStyles.textHighlight} ${syncing ? 'animate-spin' : ''}`}
              title="Sync & update balance"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className={`relative w-full h-[500px] sm:h-[600px] md:h-[650px] max-w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col ${themeStyles.cardBg} ${themeStyles.glowBorder}`}>
          <iframe
            id="snap-photobooth-iframe"
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full flex-grow border-none"
            allow="camera; microphone; geolocation"
            title="&snap Photobooth"
            onLoad={handleIframeLoad}
          />
        </div>

        <div className={`text-center text-xs flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 pb-4 ${themeStyles.textSecondary}`}>
          <span>Trouble loading the camera or UI inside the frame?</span>
          <button
            onClick={launchPhotoboothInNewTab}
            className="font-bold underline flex items-center gap-1 cursor-pointer bg-transparent border-none text-indigo-500 hover:text-indigo-400"
          >
            Launch in an external browser tab <ExternalLink size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-6 font-fredoka ${themeStyles.textPrimary}`}>
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h2 className={`text-3xl font-extrabold flex items-center gap-2.5 ${themeStyles.textHighlight}`}>
            📸 &snap
          </h2>
          <p className={`text-xs sm:text-sm ${themeStyles.textSecondary}`}>
            Snap beautiful polaroids and unlock exclusive seasonal frames on our connected app!
          </p>
        </div>

        {/* Real-time Coins Sync Meter */}
        <div className={`flex items-center gap-3 p-2 rounded-2xl shadow-xl shrink-0 ${themeStyles.cardBg} ${themeStyles.glowBorder}`}>
          <div className="text-right pl-2">
            <div className={`text-[9px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>Sync Status</div>
            <div className="text-sm font-extrabold flex items-center gap-1">
              <Coins size={14} className={`animate-pulse ${themeStyles.textHighlight}`} />
              <span className={themeStyles.textHighlight}>{syncCoins} LUNÉ Coins</span>
            </div>
          </div>
          <button
            onClick={handleRefreshBalance}
            disabled={syncing}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${themeStyles.cardBg} ${themeStyles.textHighlight} ${syncing ? 'animate-spin' : ''}`}
            title="Refresh balance from database"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Centered Connection Card */}
      <div className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl space-y-6 text-center ${themeStyles.cardBg} ${themeStyles.glowBorder}`}>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 mb-2">
          <Camera size={28} className="text-white stroke-[2.5]" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Coin System Connected</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={handleEnterEmbeddedPhotobooth}
            className={`w-full sm:w-auto px-10 py-4.5 font-black text-base rounded-2xl flex items-center justify-center gap-3.5 shadow-xl transition-all cursor-pointer transform active:scale-[0.98] ${themeStyles.btnAccent}`}
          >
            <Camera size={20} className="stroke-[2.5]" />
            <span>Enter &snap Photobooth</span>
          </button>
          
          <button
            onClick={launchPhotoboothInNewTab}
            className={`w-full sm:w-auto px-6 py-4.5 border text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-[0.98] ${themeStyles.cardBg} ${themeStyles.textSecondary} hover:${themeStyles.textPrimary}`}
          >
            <span>Open in New Tab</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}

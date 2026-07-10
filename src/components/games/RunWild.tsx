/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MEMBER_COLORS } from '../../data';
import { playClickSound, playCoinSound, playWinSound, playFailSound, playJumpSound, playHowlSound } from '../../utils/sound';
import { X, Trophy, RefreshCw, Gamepad2, Sparkles, AlertTriangle } from 'lucide-react';

interface RunWildProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onExit: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'chimney' | 'box' | 'trash_can';
}

interface MoonCollectible {
  x: number;
  y: number;
  collected: boolean;
  meterMarker: number;
}

export default function RunWild({ coins, onUpdateCoins, onExit }: RunWildProps) {
  const [gameState, setGameState] = useState<'select' | 'ready' | 'playing' | 'gameover'>('select');
  const [selectedMember, setSelectedMember] = useState<string>('EJ');
  const [highScore, setHighScore] = useState<number>(0);
  const [distanceRun, setDistanceRun] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitAttempt = () => {
    playClickSound();
    if (gameState === 'playing') {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };
  
  // Custom text animation trigger array for floating "AWOOO! 🐺"
  const [howlNotifs, setHowlNotifs] = useState<{ id: number; x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Load local storage high score
  useEffect(() => {
    const saved = localStorage.getItem('run_wild_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const selectedColorInfo = MEMBER_COLORS[selectedMember] || MEMBER_COLORS['EJ'];

  // Keep references to real-time variables to avoid React re-render lag inside requestAnimationFrame
  const playStateRef = useRef({
    distance: 0,
    score: 0,
    speed: 3.5,
    wolfY: 128,
    wolfVelocity: 0,
    isJumping: false,
    gravity: 0.35,
    jumpForce: -8.0,
    lastObstacleSpawn: 300,
    lastMoonSpawn: 150,
    obstacles: [] as Obstacle[],
    moons: [] as MoonCollectible[],
    frame: 0,
    rooftops: [] as { x: number; width: number; height: number }[],
    // Ground level where rooftops sit
    roofY: 240,
  });

  // Setup initial building rooftops and entities
  const initGameEntities = () => {
    const state = playStateRef.current;
    state.distance = 0;
    state.score = 0;
    state.speed = 3.5;
    state.wolfY = 128;
    state.wolfVelocity = 0;
    state.isJumping = false;
    state.obstacles = [];
    state.moons = [];
    state.frame = 0;
    
    // Seed standard initial rooftops so player doesn't instantly fall
    state.rooftops = [
      { x: 0, width: 350, height: 120 },
      { x: 380, width: 280, height: 110 },
      { x: 690, width: 300, height: 130 },
      { x: 1020, width: 400, height: 100 }
    ];
    
    // Initial spawns
    state.lastObstacleSpawn = 350;
    state.lastMoonSpawn = 200;

    setDistanceRun(0);
    setPoints(0);
    setCoinsEarned(0);
  };

  // Dedicate 5 coins and start running
  const handlePayAndReady = () => {
    if (coins < 5) {
      alert("You need at least 5 LUNÉ Coins to play Run Wild!");
      return;
    }
    playCoinSound();
    onUpdateCoins(-5);
    setGameState('ready');
  };

  const handleStartGame = () => {
    playClickSound();
    initGameEntities();
    setGameState('playing');
  };

  // Jump control
  const executeJump = () => {
    const state = playStateRef.current;
    if (state.isJumping) return;
    playJumpSound();
    state.wolfVelocity = state.jumpForce;
    state.isJumping = true;
  };

  // Keyboard Listeners for space and up keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing' && (e.code === 'Space' || e.code === 'ArrowUp')) {
        e.preventDefault();
        executeJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Canvas Rendering & Physics Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isLooping = true;

    const gameLoop = () => {
      if (!isLooping) return;

      const state = playStateRef.current;
      state.frame += 1;

      // Increment distance slowly based on scroll speed
      state.distance += state.speed * 0.05;
      const meters = Math.floor(state.distance);
      setDistanceRun(meters);

      // Increase run speed after every 30 meters running (progressive difficulty curve)
      const currentSpeedTier = 3.5 + (Math.floor(meters / 30) * 0.8);
      state.speed = Math.min(8.5, currentSpeedTier);

      // --- PHYSICS ---
      // Apply gravity to wolf
      state.wolfVelocity += state.gravity;
      state.wolfY += state.wolfVelocity;

      // Find current active rooftop underneath wolf horizontal location
      // Wolf X is fixed at 100 pixels
      const wolfX = 100;
      const wolfWidth = 46;
      const wolfHeight = 32;

      let onPlatform = false;
      let activePlatformHeight = 0;

      for (const roof of state.rooftops) {
        // Check if wolf overlaps with rooftop horizontally
        if (wolfX + wolfWidth - 4 > roof.x && wolfX + 4 < roof.x + roof.width) {
          const roofTopY = canvas.height - roof.height;
          // Check if wolf's feet touch or pass the roof level while falling
          if (state.wolfVelocity >= 0 && 
              state.wolfY + wolfHeight >= roofTopY && 
              state.wolfY + wolfHeight - state.wolfVelocity <= roofTopY + 15) {
            // Place wolf exactly on top of rooftop
            state.wolfY = roofTopY - wolfHeight;
            state.wolfVelocity = 0;
            state.isJumping = false;
            onPlatform = true;
            activePlatformHeight = roof.height;
            break;
          }
        }
      }

      if (!onPlatform) {
        state.isJumping = true;
      }

      // Check for death falling into alleys between buildings
      if (state.wolfY > canvas.height + 50) {
        triggerGameOver();
        return;
      }

      // Move building rooftops, obstacles, and crescent moons leftward
      state.rooftops.forEach(r => { r.x -= state.speed; });
      state.obstacles.forEach(o => { o.x -= state.speed; });
      state.moons.forEach(m => { m.x -= state.speed; });

      // Clean out entities that went off screen
      state.rooftops = state.rooftops.filter(r => r.x + r.width > -50);
      state.obstacles = state.obstacles.filter(o => o.x > -50);
      state.moons = state.moons.filter(m => m.x > -50 && !m.collected);

      // Spawning new rooftops
      if (state.rooftops.length === 0 || state.rooftops[state.rooftops.length - 1].x + state.rooftops[state.rooftops.length - 1].width < canvas.width + 100) {
        const lastRoof = state.rooftops[state.rooftops.length - 1];
        const nextX = lastRoof ? lastRoof.x + lastRoof.width + (40 + Math.random() * 80) : canvas.width;
        const width = 200 + Math.random() * 250;
        const height = 80 + Math.random() * 70;
        state.rooftops.push({ x: nextX, width, height });
      }

      // Spawning Obstacles on rooftops
      const lastRooftop = state.rooftops[state.rooftops.length - 1];
      if (lastRooftop && lastRooftop.x > state.lastObstacleSpawn) {
        state.lastObstacleSpawn = lastRooftop.x + (150 + Math.random() * 200);
        const types: ('chimney' | 'box' | 'trash_can')[] = ['chimney', 'box', 'trash_can'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        
        // Spawn exact obstacle sitting on top of this building
        const obstacleHeight = 16 + Math.random() * 12;
        const obstacleWidth = 14 + Math.random() * 8;
        
        state.obstacles.push({
          x: lastRooftop.x + (lastRooftop.width / 2) + (Math.random() * 40 - 20),
          width: obstacleWidth,
          height: obstacleHeight,
          type: chosenType
        });
      }

      // Spawning Crescent Moon Collectibles floating above rooftops
      if (state.frame - state.lastMoonSpawn > 75) {
        state.lastMoonSpawn = state.frame;
        // Float 50px to 110px above platform height
        const activeRoof = state.rooftops[state.rooftops.length - 1];
        if (activeRoof) {
          const spawnY = canvas.height - activeRoof.height - (50 + Math.random() * 70);
          state.moons.push({
            x: canvas.width + 20,
            y: spawnY,
            collected: false,
            meterMarker: meters
          });
        }
      }

      // --- COLLISION DETECTION ---
      // Check for collision with obstacles
      for (const obstacle of state.obstacles) {
        // Find platform height for this obstacle
        const obstacleRoof = state.rooftops.find(r => obstacle.x >= r.x && obstacle.x <= r.x + r.width);
        if (obstacleRoof) {
          const obsTopY = canvas.height - obstacleRoof.height - obstacle.height;
          // Box collision
          if (
            wolfX + 6 < obstacle.x + obstacle.width &&
            wolfX + wolfWidth - 6 > obstacle.x &&
            state.wolfY + 4 < obsTopY + obstacle.height &&
            state.wolfY + wolfHeight - 2 > obsTopY
          ) {
            triggerGameOver();
            return;
          }
        }
      }

      // Check for collision with Crescent Moons
      for (const moon of state.moons) {
        if (!moon.collected) {
          // Circle/box hit test
          const distanceX = Math.abs(moon.x - (wolfX + wolfWidth / 2));
          const distanceY = Math.abs(moon.y - (state.wolfY + wolfHeight / 2));
          if (distanceX < 24 && distanceY < 24) {
            moon.collected = true;
            collectCrescentMoon(moon.x, moon.y);
          }
        }
      }

      // --- RENDERING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#020617'); // slate-950
      skyGrad.addColorStop(1, '#0f172a'); // slate-900
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(i * 9876) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(i * 1234) * 0.5 + 0.5) * (canvas.height - 100);
        // Twinkling effect
        const size = (Math.sin(state.frame / 8 + i) * 0.5 + 0.5) * 1.5 + 0.5;
        ctx.fillRect(sx, sy, size, size);
      }

      // 3. Draw Large Full Moon 🌕 (with soft glowing border)
      const moonX = canvas.width - 100;
      const moonY = 60;
      const moonRadius = 26;
      ctx.shadowColor = 'rgba(254, 240, 138, 0.25)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#fef08a'; // yellow-200
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // Draw craters inside full moon
      ctx.fillStyle = '#eab308'; // darker yellow
      ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.arc(moonX - 8, moonY - 6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX + 10, moonY + 8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX + 6, moonY - 10, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;

      // 4. Draw Building Rooftops
      state.rooftops.forEach(roof => {
        const roofYPos = canvas.height - roof.height;
        
        // Rooftop main body
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(roof.x, roofYPos, roof.width, roof.height);

        // Top edge highlight strip
        ctx.fillStyle = '#475569'; // slate-600
        ctx.fillRect(roof.x, roofYPos, roof.width, 4);

        // Draw multiple glowing windows inside buildings
        ctx.fillStyle = 'rgba(253, 224, 71, 0.4)'; // yellow window glow
        const windowW = 8;
        const windowH = 12;
        const gapX = 16;
        const gapY = 20;
        
        for (let wx = roof.x + 12; wx + windowW < roof.x + roof.width; wx += windowW + gapX) {
          for (let wy = roofYPos + 18; wy + windowH < canvas.height; wy += windowH + gapY) {
            // Randomly turn on/off window glow
            const seed = Math.floor(wx * 17 + wy * 13) % 5;
            if (seed !== 0) {
              ctx.fillRect(wx, wy, windowW, windowH);
            }
          }
        }
      });

      // 5. Draw Obstacles (Chimney, box, trash can)
      state.obstacles.forEach(o => {
        const oRoof = state.rooftops.find(r => o.x >= r.x && o.x <= r.x + r.width);
        if (oRoof) {
          const oY = canvas.height - oRoof.height - o.height;
          
          if (o.type === 'chimney') {
            ctx.fillStyle = '#7f1d1d'; // dark brick red
            ctx.fillRect(o.x, oY, o.width, o.height);
            // Chimney trim top rim
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(o.x - 2, oY, o.width + 4, 3);
            // Puffs of smoke floating out
            ctx.fillStyle = 'rgba(241, 245, 249, 0.3)';
            ctx.beginPath();
            ctx.arc(o.x + o.width/2 + Math.sin(state.frame / 10) * 3, oY - 6 - (state.frame % 15) / 2, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (o.type === 'box') {
            ctx.fillStyle = '#b45309'; // wooden brown
            ctx.fillRect(o.x, oY, o.width, o.height);
            // Wooden panel outline border
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(o.x + 1, oY + 1, o.width - 2, o.height - 2);
            // X cross brace
            ctx.beginPath();
            ctx.moveTo(o.x + 2, oY + 2);
            ctx.lineTo(o.x + o.width - 2, oY + o.height - 2);
            ctx.moveTo(o.x + o.width - 2, oY + 2);
            ctx.lineTo(o.x + 2, oY + o.height - 2);
            ctx.stroke();
          } else { // trash can
            ctx.fillStyle = '#64748b'; // metallic slate-500
            ctx.fillRect(o.x, oY, o.width, o.height);
            // Ridges
            ctx.fillStyle = '#475569';
            ctx.fillRect(o.x + 3, oY + 2, 2, o.height - 4);
            ctx.fillRect(o.x + o.width - 5, oY + 2, 2, o.height - 4);
            // Trash lid
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(o.x - 1, oY - 2, o.width + 2, 3);
          }
        }
      });

      // 6. Draw Crescent Moon Collectibles 🌙
      state.moons.forEach(m => {
        if (!m.collected) {
          ctx.font = '16px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌙', m.x, m.y);
          
          // Draw a gentle glittering yellow ring around it
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 11 + Math.sin(state.frame / 5) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 7. Draw Beautiful Side-Profile Wolf Avatar (Whole Body Walking/Running)
      ctx.save();
      ctx.translate(wolfX, state.wolfY);

      const colorHex = selectedColorInfo.hex;
      
      // Calculate swinging motion for legs based on frame running index
      // If wolf is in the air, legs point down/back
      const runCycle = state.isJumping ? 0.5 : Math.sin(state.frame * 0.15);
      const angle1 = runCycle * 0.4;
      const angle2 = -runCycle * 0.4;

      // Leg 1 & 3 (Back level legs - slightly darker/dimmed shadow)
      ctx.fillStyle = darkenColor(colorHex, 20);
      // Back Front leg
      ctx.save();
      ctx.translate(14, 24);
      ctx.rotate(angle1);
      ctx.fillRect(-2.5, 0, 5, 10);
      ctx.restore();

      // Back Hind leg
      ctx.save();
      ctx.translate(34, 24);
      ctx.rotate(angle2);
      ctx.fillRect(-2.5, 0, 5, 10);
      ctx.restore();

      // Main Wolf Body Torso
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      // Rounded capsule torso with standard arc fallback
      if (ctx.roundRect) {
        ctx.roundRect(8, 8, 30, 16, 6);
      } else {
        ctx.rect(8, 8, 30, 16);
      }
      ctx.fill();

      // Tail (fluffy trailing wolf tail with idle wave)
      ctx.save();
      ctx.translate(36, 12);
      ctx.rotate(Math.sin(state.frame * 0.1) * 0.15 + 0.1);
      ctx.beginPath();
      ctx.ellipse(8, 3, 10, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // White tail tip highlight accent
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Front level legs (Bright core color)
      ctx.fillStyle = colorHex;
      // Front Foreleg
      ctx.save();
      ctx.translate(15, 24);
      ctx.rotate(angle2);
      ctx.fillRect(-2.5, 0, 5, 10);
      ctx.restore();

      // Front Hindleg
      ctx.save();
      ctx.translate(33, 24);
      ctx.rotate(angle1);
      ctx.fillRect(-2.5, 0, 5, 10);
      ctx.restore();

      // Wolf Head Structure (facing left, muzzle/snout points left)
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(8, 10, 7.5, 0, Math.PI * 2); // head center
      ctx.fill();

      // Snout / Muzzle (extended to the left)
      ctx.beginPath();
      ctx.moveTo(3, 8);
      ctx.lineTo(-4, 11);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();

      // Nose tip
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4, 11, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Alert wolf pointy ears (pointing up/right)
      ctx.fillStyle = darkenColor(colorHex, 10);
      ctx.beginPath();
      ctx.moveTo(6, 4);
      ctx.lineTo(9, -4);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();

      // Eye (small alert white dot with dark iris)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 9, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(3.5, 9, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // restore translated canvas coordinate space

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      isLooping = false;
      playFailSound();
      
      const state = playStateRef.current;
      setDistanceRun(Math.floor(state.distance));
      setPoints(state.score);

      // Reward: 1 coin for every crescent moon collected (which is 3 points)
      const earned = Math.floor(state.score / 3);
      setCoinsEarned(earned);

      // Add coins directly to the overall database
      if (earned > 0) {
        onUpdateCoins(earned);
      }

      // Check for new High Score
      const finalMeters = Math.floor(state.distance);
      const savedHigh = localStorage.getItem('run_wild_high_score');
      const currentHigh = savedHigh ? parseInt(savedHigh, 10) : 0;
      if (finalMeters > currentHigh) {
        localStorage.setItem('run_wild_high_score', finalMeters.toString());
        setHighScore(finalMeters);
      }

      setGameState('gameover');
    };

    // Callback on moon contact
    const collectCrescentMoon = (x: number, y: number) => {
      playHowlSound();
      const state = playStateRef.current;
      state.score += 3; // 3 points per crescent moon
      setPoints(state.score);

      // Trigger floating UI notification
      const id = Date.now() + Math.random();
      setHowlNotifs(prev => [...prev, { id, x, y: y - 20 }]);
      setTimeout(() => {
        setHowlNotifs(prev => prev.filter(n => n.id !== id));
      }, 1000);
    };

    // Start game loop tick
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isLooping = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, selectedMember]);

  // Darken a hex color for vector shading
  function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#",""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) - amt,
          G = (num >> 8 & 0x00FF) - amt,
          B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white font-fredoka relative shadow-2xl overflow-hidden">
      
      {/* Top Game Bar Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-amber-400 stroke-[2.5]" size={20} />
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400">
            Run Wild! 🏃‍♂️🐺
          </h3>
        </div>
        
        <button
          onClick={handleExitAttempt}
          className="p-1.5 hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
          title="Exit game"
        >
          <X size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SELECT COLOR BY &TEAM REPRESENTATIVE MEMBER */}
        {gameState === 'select' && (
          <motion.div
            key="select-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            <div className="text-center space-y-1.5">
              <span className="text-yellow-400 text-xs font-bold tracking-wider uppercase bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                Endless Rooftop Runner
              </span>
              <h4 className="text-2xl font-black">Choose Your Wolf's Member Color</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Customize your side-profile running wolf based on the official &TEAM representative member colors before taking off!
              </p>
            </div>

            {/* Members Selector Grid */}
            <div className="grid grid-cols-3 gap-3.5 max-w-lg mx-auto">
              {Object.keys(MEMBER_COLORS).map((name) => {
                const isSelected = selectedMember === name;
                const mColor = MEMBER_COLORS[name];
                return (
                  <button
                    key={name}
                    onClick={() => {
                      playClickSound();
                      setSelectedMember(name);
                    }}
                    className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-950 border-white/40 ring-2 ring-indigo-500 shadow-xl scale-[1.03]' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Color Circle badge */}
                    <div 
                      className="w-7 h-7 rounded-full border border-white/20 shadow-inner flex items-center justify-center text-xs font-bold"
                      style={{ 
                        backgroundColor: mColor.hex, 
                        color: mColor.text,
                        boxShadow: `0 0 10px ${mColor.glow}`
                      }}
                    >
                      🐾
                    </div>
                    
                    <div>
                      <div className="text-xs font-extrabold">{name}</div>
                      <div className="text-[10px] text-slate-500">{mColor.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 text-center flex flex-col items-center gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Entry fee:</span>
                <strong className="text-yellow-400 font-extrabold flex items-center gap-0.5">
                  🪙 5 LUNÉ Coins
                </strong>
                <span className="text-slate-600">|</span>
                <span>Active Balance:</span>
                <strong className="text-indigo-400 font-extrabold">{coins} Coins</strong>
              </div>

              <button
                onClick={handlePayAndReady}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-sm rounded-2xl cursor-pointer hover:brightness-110 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                Proceed with {selectedMember} Wolf
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: READY/INSTRUCTIONS SCREEN */}
        {gameState === 'ready' && (
          <motion.div
            key="ready-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5 text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 mx-auto animate-bounce">
              <span className="text-3xl">🐺</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black">Ready to Run Rooftops?</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                You will guide the <strong>{selectedMember} Wolf</strong> across buildings under the starry sky. Jump cleanly over obstacles or falling gaps to survive!
              </p>
            </div>

            {/* Mechanics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-xs text-left bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>🌙</span>
                  <span>Collect Moons</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Every 10 meters, crescent moons appear. Get them for 3 points and an AWOO howling blast!
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-indigo-400 flex items-center gap-1">
                  <span>🚀</span>
                  <span>Speed Up</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  The rooftops scroll faster for every 30 meters you run. Keep your reflexes sharp!
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-pink-400 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Avoid Junk</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Avoid chimneys, wooden boxes, and trash cans. Bumping into them ends the run!
                </p>
              </div>
            </div>

            {/* Control tips */}
            <div className="text-xs text-slate-400 space-y-1 max-w-sm mx-auto">
              <p>📱 <strong>Mobile</strong>: Tap anywhere on the play space to jump!</p>
              <p>💻 <strong>PC</strong>: Click or press <kbd className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-[10px]">Space</kbd> / <kbd className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-[10px]">↑</kbd> keys to jump!</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartGame}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base rounded-2xl cursor-pointer hover:brightness-110 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                Press Start to Run!
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: PLAYING IN PROCESS */}
        {gameState === 'playing' && (
          <motion.div
            key="playing-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Live stats panels */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/60 border border-slate-800/60 p-2 rounded-2xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Distance</div>
                <div className="text-base font-extrabold text-white">{distanceRun}m</div>
              </div>
              
              <div className="bg-slate-950/60 border border-slate-800/60 p-2 rounded-2xl relative">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Crescent Moons</div>
                <div className="text-base font-extrabold text-yellow-400 flex items-center justify-center gap-1">
                  <span>🌙</span>
                  <span>{points} Pts</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/60 p-2 rounded-2xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Speed Tier</div>
                <div className="text-sm font-extrabold text-indigo-400">
                  {Math.floor(playStateRef.current.speed * 10) / 10}x
                </div>
              </div>
            </div>

            {/* Interactive Game Canvas with tap jump listener */}
            <div 
              onClick={executeJump}
              onTouchStart={(e) => {
                e.preventDefault();
                executeJump();
              }}
              className="w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner cursor-pointer"
            >
              <canvas 
                ref={canvasRef} 
                width={600} 
                height={280}
                className="w-full aspect-[600/280] block"
              />

              {/* Float AWOO text animation triggers */}
              <AnimatePresence>
                {howlNotifs.map(notif => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, scale: 0.6, y: notif.y, x: notif.x }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.3, 1, 0.8], y: notif.y - 70 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                    className="absolute pointer-events-none text-xs sm:text-sm font-black text-yellow-300 bg-slate-950/90 border border-yellow-300/40 px-2.5 py-1 rounded-full shadow-lg"
                  >
                    🐾 AWOOOO! 🐺
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Jump trigger overlay reminder for touch */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-800/80 px-4 py-1.5 rounded-full text-[10px] text-slate-400 font-bold select-none pointer-events-none">
                Tap Screen or click to Jump
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <motion.div
            key="gameover-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5 text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <span className="text-3xl">💥</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-rose-500">Wolf Crash! Game Over</h4>
              <p className="text-xs text-slate-400">
                The {selectedMember} Wolf bumped into an obstacle at {distanceRun} meters.
              </p>
            </div>

            {/* Run Score Results Row */}
            <div className="grid grid-cols-3 gap-3.5 max-w-sm mx-auto">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Distance</div>
                <div className="text-lg font-black">{distanceRun}m</div>
              </div>
              
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Points</div>
                <div className="text-lg font-black text-yellow-400">{points}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Coins Won</div>
                <div className="text-lg font-black text-indigo-400">+{coinsEarned} 🪙</div>
              </div>
            </div>

            {/* High Score Ticker */}
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 max-w-xs mx-auto bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <Trophy size={14} className="text-yellow-400" />
              <span>Personal Best: <strong>{Math.max(highScore, distanceRun)} meters</strong></span>
            </div>

            {/* Actions button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  playClickSound();
                  setGameState('select');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Play Again</span>
              </button>

              <button
                onClick={handleExitAttempt}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-xl font-bold text-xs cursor-pointer"
              >
                Back to Play Hub
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

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
                You are currently running and dodging obstacles. Exiting now will lose your current score and progress.
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

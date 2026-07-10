/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play Coin Spend Sound (Double high-pitch bell clink)
export function playCoinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // First clink
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08); // G6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Second clink, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.15); // C7
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.26);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 2. Play Win/Success Sound (Major arpeggio triumph)
export function playWinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 3. Play Fail/Disappointed Sound (Sad descending slide)
export function playFailSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(110, now + 0.5); // A2
    
    // Low pass filter to make it sound buzzy and disappointed
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 4. Play Magic Sound (2 seconds sweeping shimmer)
export function playMagicSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Sweeping oscillator
    const oscSweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    oscSweep.type = 'sine';
    oscSweep.frequency.setValueAtTime(200, now);
    oscSweep.frequency.exponentialRampToValueAtTime(2500, now + 1.8);
    
    sweepGain.gain.setValueAtTime(0.05, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    
    oscSweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    oscSweep.start(now);
    oscSweep.stop(now + 2.0);

    // Random star sparkles during the sweep
    for (let i = 0; i < 15; i++) {
      const sparklesTime = now + (i * 0.12);
      const randFreq = 800 + Math.random() * 1500;
      const oscSparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      oscSparkle.type = 'triangle';
      oscSparkle.frequency.setValueAtTime(randFreq, sparklesTime);
      sparkleGain.gain.setValueAtTime(0.06, sparklesTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, sparklesTime + 0.15);
      
      oscSparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      oscSparkle.start(sparklesTime);
      oscSparkle.stop(sparklesTime + 0.2);
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 5. Play Jump Sound (Flappy Wolf hop - short pitch glide)
export function playJumpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 6. Play Simple Click/Tap Sound
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(300, now + 0.03);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 7. Play Slot Machine Roll Click
export function playSlotRollSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(110, now + 0.01);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 8. Play Jackpot Clapping + Majestic Fanfare
export function playJackpotSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Triumphant Fanfare
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6 major sweep
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.12, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.7);
    });

    // Procedural Clapping (Noise bursts simulating applause)
    for (let i = 0; i < 25; i++) {
      const clapTime = now + (i * 0.08) + (Math.random() * 0.04);
      
      // We can generate clapping sound using short bandpassed high-frequency noise or short sines
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400 + Math.random() * 400, clapTime);
      
      gain.gain.setValueAtTime(0.04, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(clapTime);
      osc.stop(clapTime + 0.05);
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 9. Play Maze Finish Sound (Uplifting Victory Melody)
export function playMazeFinishSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // High tempo cute victory chime: E5 -> G5 -> E6 -> G6 -> C7
    const notes = [659.25, 783.99, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 10. Play Procedural Wolf Howl "Awooo!" Sound
export function playHowlSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();
    
    osc.type = 'triangle'; // Warm, melodic wolf tone
    
    // Smooth frequency bend: start low (320Hz), sweep up to 720Hz, stay, then slow decay
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.45);
    osc.frequency.setValueAtTime(720, now + 0.9);
    osc.frequency.exponentialRampToValueAtTime(300, now + 1.6);
    
    // Vibrato setup (frequency modulation) to give that natural howling quiver
    vibrato.frequency.setValueAtTime(6.5, now); // 6.5Hz frequency oscillation
    vibratoGain.gain.setValueAtTime(20, now); // Howl modulation depth
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    
    // Volume envelope: quick swell, stable sustain, smooth atmospheric trail
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
    gain.gain.setValueAtTime(0.12, now + 0.95);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    vibrato.start(now);
    osc.start(now);
    
    vibrato.stop(now + 1.7);
    osc.stop(now + 1.7);
  } catch (e) {
    console.warn('Howl sound failed to play', e);
  }
}


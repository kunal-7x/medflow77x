import { useCallback, useRef } from 'react';

// Web Audio API sound system - generates pleasant UI sounds programmatically
const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(frequency: number, duration: number, volume: number = 0.08, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio context is not available
  }
}

export type SoundType = 'click' | 'navigate' | 'success' | 'error' | 'open' | 'close' | 'toggle';

const sounds: Record<SoundType, () => void> = {
  click: () => playTone(800, 0.08, 0.05),
  navigate: () => {
    playTone(600, 0.06, 0.04);
    setTimeout(() => playTone(900, 0.08, 0.04), 40);
  },
  success: () => {
    playTone(523, 0.1, 0.05);
    setTimeout(() => playTone(659, 0.1, 0.05), 80);
    setTimeout(() => playTone(784, 0.15, 0.05), 160);
  },
  error: () => {
    playTone(330, 0.15, 0.06, 'triangle');
    setTimeout(() => playTone(262, 0.2, 0.06, 'triangle'), 100);
  },
  open: () => {
    playTone(500, 0.06, 0.04);
    setTimeout(() => playTone(700, 0.08, 0.04), 50);
  },
  close: () => {
    playTone(700, 0.06, 0.04);
    setTimeout(() => playTone(500, 0.08, 0.04), 50);
  },
  toggle: () => playTone(660, 0.06, 0.04),
};

// Global mute state
let isMuted = localStorage.getItem('medflow-sound-muted') === 'true';

export function getIsMuted() { return isMuted; }
export function setIsMuted(muted: boolean) {
  isMuted = muted;
  localStorage.setItem('medflow-sound-muted', String(muted));
}

export function playSound(type: SoundType) {
  if (!isMuted) {
    sounds[type]?.();
  }
}

export function useSoundSystem() {
  const play = useCallback((type: SoundType) => {
    playSound(type);
  }, []);

  return { play };
}

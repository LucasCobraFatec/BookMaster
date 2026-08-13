import { useRef } from 'react';

export const useAudioContext = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  return { audioCtxRef, initAudio };
};

export const useSoundEffects = (initAudio: () => AudioContext) => {
  const playSwordSound = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playMagicSound = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const playHealSound = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const playDiceRollSound = () => {
    const ctx = initAudio();

    for (let i = 0; i < 4; i++) {
      const delay = i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150 + Math.random() * 80, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + delay + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.04);
    }
  };

  return {
    playSwordSound,
    playMagicSound,
    playHealSound,
    playDiceRollSound,
  };
};

export const useAmbientLoops = (initAudio: () => AudioContext) => {
  const loopNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);

  const stopLoop = () => {
    if (loopNodesRef.current) {
      loopNodesRef.current.oscs.forEach(o => { o.stop(); o.disconnect(); });
      loopNodesRef.current.gain.disconnect();
      loopNodesRef.current = null;
    }
  };

  const playEnvironmentLoop = (type: 'masmorra' | 'taverna' | 'combate') => {
    stopLoop();
    const ctx = initAudio();

    const oscs: OscillatorNode[] = [];
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.08, ctx.currentTime);

    if (type === 'masmorra') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, ctx.currentTime);

      osc1.connect(mainGain);
      osc2.connect(mainGain);
      oscs.push(osc1, osc2);

      osc1.start();
      osc2.start();
    } else if (type === 'taverna') {
      const notes = [220, 277.18, 329.63, 440];

      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(mainGain);
        oscs.push(osc);
        osc.start();
      });
    } else if (type === 'combate') {
      const osc1 = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.8, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc1.connect(oscGain);
      oscGain.connect(mainGain);

      oscs.push(osc1, lfo);
      osc1.start();
      lfo.start();
    }

    mainGain.connect(ctx.destination);
    loopNodesRef.current = { oscs, gain: mainGain };
  };

  return { playEnvironmentLoop, stopLoop };
};

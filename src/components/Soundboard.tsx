import React, { useState } from 'react';
import { useAudioContext, useSoundEffects, useAmbientLoops } from '../hooks/useSoundboard';
import { SoundboardInfo } from './SoundboardInfo';
import { SoundEffectsGrid } from './SoundEffectsGrid';
import { AmbientLoops } from './AmbientLoops';

export const Soundboard: React.FC = () => {
  const [isPlayingLoop, setIsPlayingLoop] = useState<string | null>(null);
  const { initAudio } = useAudioContext();
  const { playSwordSound, playMagicSound, playHealSound, playDiceRollSound } =
    useSoundEffects(initAudio);
  const { playEnvironmentLoop, stopLoop } = useAmbientLoops(initAudio);

  const handlePlayEnvironmentLoop = (type: 'masmorra' | 'taverna' | 'combate') => {
    playEnvironmentLoop(type);
    setIsPlayingLoop(type);
  };

  const handleStopLoop = () => {
    stopLoop();
    setIsPlayingLoop(null);
  };

  return (
    <div className="space-y-6 text-rpg-text">
      <SoundboardInfo />

      <SoundEffectsGrid
        onPlaySwordSound={playSwordSound}
        onPlayMagicSound={playMagicSound}
        onPlayHealSound={playHealSound}
        onPlayDiceRollSound={playDiceRollSound}
      />

      <AmbientLoops
        isPlayingLoop={isPlayingLoop}
        onPlayEnvironmentLoop={handlePlayEnvironmentLoop}
        onStopLoop={handleStopLoop}
      />
    </div>
  );
};

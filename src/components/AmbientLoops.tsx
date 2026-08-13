import React from 'react';
import { Volume2, VolumeX, Music, CloudRain, Skull } from 'lucide-react';

interface AmbientLoopsProps {
  isPlayingLoop: string | null;
  onPlayEnvironmentLoop: (type: 'masmorra' | 'taverna' | 'combate') => void;
  onStopLoop: () => void;
}

interface LoopButtonProps {
  isActive: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  activeColor: string;
  inactiveHoverColor: string;
  onPlay: () => void;
  onStop: () => void;
  animationClass: string;
}

const LoopButton: React.FC<LoopButtonProps> = ({
  isActive,
  icon,
  title,
  description,
  activeColor,
  inactiveHoverColor,
  onPlay,
  onStop,
  animationClass,
}) => (
  <div
    className={`p-4 border rounded-lg flex justify-between items-center transition-all ${
      isActive
        ? `${activeColor} text-white`
        : 'bg-rpg-card/30 border-rpg-card/60 hover:bg-rpg-card/50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 ${isActive ? 'text-white ' + animationClass : 'text-rpg-muted'}`}>
        {icon}
      </div>
      <div>
        <span className="text-xs font-bold block">{title}</span>
        <span className="text-[10px] text-rpg-muted">{description}</span>
      </div>
    </div>
    {isActive ? (
      <button
        onClick={onStop}
        className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${activeColor} text-black hover:opacity-80`}
      >
        <VolumeX className="w-3.5 h-3.5" /> Parar
      </button>
    ) : (
      <button
        onClick={onPlay}
        className={`text-xs bg-rpg-card hover:${inactiveHoverColor} border border-rpg-card text-rpg-muted px-2.5 py-1 rounded-md flex items-center gap-1 transition-all`}
      >
        <Volume2 className="w-3.5 h-3.5" /> Tocar
      </button>
    )}
  </div>
);

export const AmbientLoops: React.FC<AmbientLoopsProps> = ({
  isPlayingLoop,
  onPlayEnvironmentLoop,
  onStopLoop,
}) => {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold text-rpg-accent uppercase tracking-wider">
        Climas de Fundo (Músicas Infinitas) [81]
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <LoopButton
          isActive={isPlayingLoop === 'taverna'}
          icon={<Music className="w-5 h-5" />}
          title="Taverna do Dragão"
          description="Dedilhado medieval de alaúde"
          activeColor="bg-amber-500/10 border-amber-500"
          inactiveHoverColor="bg-amber-500 hover:text-black"
          onPlay={() => onPlayEnvironmentLoop('taverna')}
          onStop={onStopLoop}
          animationClass="animate-spin"
        />

        <LoopButton
          isActive={isPlayingLoop === 'masmorra'}
          icon={<CloudRain className="w-5 h-5" />}
          title="Masmorra Profunda"
          description="Drone senoidal escuro e ecoante"
          activeColor="bg-purple-500/10 border-purple-500"
          inactiveHoverColor="bg-purple-500 hover:text-white"
          onPlay={() => onPlayEnvironmentLoop('masmorra')}
          onStop={onStopLoop}
          animationClass="animate-bounce"
        />

        <LoopButton
          isActive={isPlayingLoop === 'combate'}
          icon={<Skull className="w-5 h-5" />}
          title="Tambores Épicos"
          description="Ritmo pulsante de batalha militar"
          activeColor="bg-rose-500/10 border-rose-500"
          inactiveHoverColor="bg-rose-500 hover:text-white"
          onPlay={() => onPlayEnvironmentLoop('combate')}
          onStop={onStopLoop}
          animationClass="animate-pulse"
        />
      </div>
    </div>
  );
};

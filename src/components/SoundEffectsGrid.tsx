import React from 'react';
import { Flame, Zap, Shield, Compass } from 'lucide-react';

interface SoundEffectsGridProps {
  onPlaySwordSound: () => void;
  onPlayMagicSound: () => void;
  onPlayHealSound: () => void;
  onPlayDiceRollSound: () => void;
}

export const SoundEffectsGrid: React.FC<SoundEffectsGridProps> = ({
  onPlaySwordSound,
  onPlayMagicSound,
  onPlayHealSound,
  onPlayDiceRollSound,
}) => {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold text-rpg-accent uppercase tracking-wider">
        Efeitos One-Shot (Disparadores de Ação) [81]
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={onPlaySwordSound}
          className="bg-rpg-card/40 border border-rpg-card hover:border-red-500/40 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all"
        >
          <Flame className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white">Espada ⚔️</span>
          <span className="text-[9px] text-rpg-muted">Efeito físico de ataque</span>
        </button>

        <button
          onClick={onPlayMagicSound}
          className="bg-rpg-card/40 border border-rpg-card hover:border-purple-500/40 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all"
        >
          <Zap className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white">Magia ⚡</span>
          <span className="text-[9px] text-rpg-muted">Efeito de canalização</span>
        </button>

        <button
          onClick={onPlayHealSound}
          className="bg-rpg-card/40 border border-rpg-card hover:border-emerald-500/40 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all"
        >
          <Shield className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white">Cura 💖</span>
          <span className="text-[9px] text-rpg-muted">Acorde divino brilhante</span>
        </button>

        <button
          onClick={onPlayDiceRollSound}
          className="bg-rpg-card/40 border border-rpg-card hover:border-sky-500/40 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all"
        >
          <Compass className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white">Rolo de Dados 🎲</span>
          <span className="text-[9px] text-rpg-muted">Efeito tátil rápido</span>
        </button>
      </div>
    </div>
  );
};

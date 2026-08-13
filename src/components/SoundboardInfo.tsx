import React from 'react';
import { Volume2 } from 'lucide-react';

export const SoundboardInfo: React.FC = () => (
  <div className="bg-rpg-panel/30 border border-rpg-card p-4 rounded-lg flex items-center gap-3">
    <Volume2 className="w-8 h-8 text-rpg-accent animate-pulse" />
    <div>
      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
        Central de Som do Bardo
      </h4>
      <p className="text-[10px] text-rpg-muted mt-1 leading-relaxed">
        Mesa de som baseada em síntese de áudio modular offline. Todos os efeitos e músicas
        de fundo são **gerados dinamicamente no seu computador ou celular**, eliminando a
        necessidade de baixar arquivos pesados ou estar conectado à internet! [73, 81]
      </p>
    </div>
  </div>
);

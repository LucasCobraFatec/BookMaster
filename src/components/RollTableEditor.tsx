import React, { type ReactNode } from 'react';
import type { RollTable } from '../types/rpg.types';
import { Dices, Trash2 } from 'lucide-react';

interface RollTableEditorProps {
  selectedTable: RollTable | null;
  isRolling: boolean;
  newMin: number;
  newMax: number;
  newText: string;
  transferControls?: ReactNode;
  onNewMinChange: (min: number) => void;
  onNewMaxChange: (max: number) => void;
  onNewTextChange: (text: string) => void;
  onAddResult: () => Promise<void>;
  onDeleteResult: (index: number) => Promise<void>;
  onRoll: () => void;
}

export const RollTableEditor: React.FC<RollTableEditorProps> = ({
  selectedTable,
  isRolling,
  newMin,
  newMax,
  newText,
  transferControls,
  onNewMinChange,
  onNewMaxChange,
  onNewTextChange,
  onAddResult,
  onDeleteResult,
  onRoll,
}) => {
  if (!selectedTable) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Dices className="w-12 h-12 text-rpg-card mb-3 animate-bounce" />
        <h4 className="text-sm font-bold text-white mb-1">Selecione ou Crie uma Tabela</h4>
        <p className="text-xs text-rpg-muted max-w-xs">
          Gere encontros, nomes de tavernas, espolios e resolva acoes com um clique.
        </p>
        {transferControls}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-start gap-3 border-b border-rpg-card/60 pb-3">
        <div>
          <h2 className="text-base font-bold text-white leading-none">{selectedTable.name}</h2>
          <p className="text-xs text-rpg-muted mt-1">
            Dado de Rolagem:{' '}
            <span className="font-mono font-bold text-rpg-accent">{selectedTable.formula}</span>
          </p>
          {transferControls}
        </div>
        <button
          onClick={onRoll}
          disabled={selectedTable.results.length === 0 || isRolling}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-rpg-card disabled:text-rpg-muted text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          {isRolling ? 'Rolando...' : 'Rolar Tabela'}
        </button>
      </div>

      <div className="bg-rpg-card/30 border border-rpg-card/50 rounded-lg p-3 space-y-3">
        <span className="text-[10px] font-bold text-rpg-accent uppercase tracking-wider block">
          Adicionar Novo Resultado
        </span>
        <div className="flex gap-2 items-end">
          <div className="w-20">
            <label className="text-[10px] text-rpg-muted block mb-1">Minimo</label>
            <input
              type="number"
              value={newMin}
              onChange={(e) => onNewMinChange(parseInt(e.target.value) || 0)}
              className="w-full bg-rpg-card border border-rpg-card text-center text-xs p-1.5 rounded text-white"
            />
          </div>
          <div className="w-20">
            <label className="text-[10px] text-rpg-muted block mb-1">Maximo</label>
            <input
              type="number"
              value={newMax}
              onChange={(e) => onNewMaxChange(parseInt(e.target.value) || 0)}
              className="w-full bg-rpg-card border border-rpg-card text-center text-xs p-1.5 rounded text-white"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] text-rpg-muted block mb-1">Resultado / rolagem composta</label>
            <input
              type="text"
              placeholder="Ex: Encontro com [[Tabela: Tesouros]]"
              value={newText}
              onChange={(e) => onNewTextChange(e.target.value)}
              className="w-full bg-rpg-card border border-rpg-card text-xs p-1.5 rounded text-white outline-none focus:border-rpg-accent"
            />
            <p className="mt-1 text-[10px] text-rpg-muted">
              Use [[Tabela: Nome da Tabela]] para chamar outra tabela automaticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddResult}
            className="bg-rpg-accent hover:bg-rpg-accent/90 text-white p-2 rounded text-xs font-bold transition-all h-8 flex items-center"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {selectedTable.results.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-rpg-card/60 rounded-lg">
            <p className="text-xs text-rpg-muted">Esta tabela esta vazia. Adicione os resultados acima.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-rpg-card/60 text-rpg-muted">
                <th className="py-2 w-24">Intervalo</th>
                <th className="py-2">Resultado / Evento</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {selectedTable.results.map((res, idx) => (
                <tr key={`${res.range[0]}-${res.range[1]}-${idx}`} className="border-b border-rpg-card/20 hover:bg-rpg-card/10">
                  <td className="py-2 font-mono text-rpg-accent font-bold">
                    {res.range[0]} {res.range[0] !== res.range[1] ? ` - ${res.range[1]}` : ''}
                  </td>
                  <td className="py-2 text-white">{res.text}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onDeleteResult(idx)}
                      className="text-rpg-muted hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

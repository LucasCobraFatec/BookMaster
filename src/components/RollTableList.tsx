import React from 'react';
import type { RollTable } from '../types/rpg.types';
import { Plus, Trash2 } from 'lucide-react';

interface RollTableListProps {
  campaignTables: RollTable[];
  selectedTableId: string | null;
  newTableName: string;
  onNewTableNameChange: (name: string) => void;
  onCreateTable: (e: React.FormEvent) => Promise<void>;
  onSelectTable: (table: RollTable) => void;
  onDeleteTable: (table: RollTable) => Promise<void>;
}

export const RollTableList: React.FC<RollTableListProps> = ({
  campaignTables,
  selectedTableId,
  newTableName,
  onNewTableNameChange,
  onCreateTable,
  onSelectTable,
  onDeleteTable,
}) => {
  return (
    <div className="w-1/3 bg-rpg-card/40 border border-rpg-card/60 rounded-lg p-4 flex flex-col gap-4">
      <h3 className="text-xs font-bold text-rpg-accent uppercase tracking-wider">
        Tabelas de Rolagem
      </h3>

      <form onSubmit={onCreateTable} className="space-y-2">
        <input
          type="text"
          placeholder="Nome da Tabela..."
          value={newTableName}
          onChange={(e) => onNewTableNameChange(e.target.value)}
          className="w-full bg-rpg-card border border-rpg-card/85 text-xs rounded p-2 text-white outline-none focus:border-rpg-accent"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-rpg-accent hover:bg-rpg-accent/80 text-white p-2 rounded text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Criar
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {campaignTables.length === 0 ? (
          <p className="text-xs text-rpg-muted text-center py-8">Nenhuma tabela criada.</p>
        ) : (
          campaignTables.map((table) => (
            <div
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`p-2.5 rounded text-xs cursor-pointer border transition-all flex justify-between items-center ${
                selectedTableId === table.id
                  ? 'bg-rpg-accent/15 border-rpg-accent text-white font-bold'
                  : 'bg-rpg-card/30 border-rpg-card/40 hover:bg-rpg-card/60'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span>{table.name}</span>
                <span className="text-[10px] text-rpg-muted font-mono">{table.formula}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Excluir esta tabela permanentemente?')) {
                    onDeleteTable(table);
                  }
                }}
                className="text-rpg-muted hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

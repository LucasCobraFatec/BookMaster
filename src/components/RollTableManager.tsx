import React from 'react';
import type { CharacterEntity, NoteEntity, RollTable } from '../types/rpg.types';
import { useRollTableManager } from '../hooks/useRollTableManager';
import { RollTableList } from './RollTableList';
import { RollTableEditor } from './RollTableEditor';
import { RollResult } from './RollResult';
import { RollTableTransfer } from './RollTableTransfer';
import type { ImportedRollTable } from '../lib/rollTableTransfer';

interface RollTableManagerProps {
  campaignId: string;
  rollTables: RollTable[];
  activeSessionId: string | null;
  onCreateTable: (name: string, formula: string) => Promise<RollTable>;
  onUpdateTable: (tableId: string, updates: Partial<RollTable>) => Promise<void>;
  onDeleteTable: (tableId: string) => Promise<void>;
  onAddLog: (content: string) => Promise<void>;
  selectedTableId?: string | null;
  onSelectedTableChange?: (tableId: string | null) => void;
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onWikiLinkClick: (title: string) => void;
}

export const RollTableManager: React.FC<RollTableManagerProps> = ({
  campaignId,
  rollTables,
  activeSessionId,
  onCreateTable,
  onUpdateTable,
  onDeleteTable,
  onAddLog,
  selectedTableId = null,
  onSelectedTableChange,
  existingNotes,
  existingCharacters,
  onWikiLinkClick,
}) => {
  const campaignTables = rollTables.filter((table) => table.campaignId === campaignId);
  const initialTable = campaignTables.find((table) => table.id === selectedTableId) ?? null;
  const manager = useRollTableManager({ onUpdateTable, onDeleteTable, onAddLog }, campaignTables, initialTable);

  const selectTable = (table: RollTable) => {
    manager.selectTable(table);
    onSelectedTableChange?.(table.id);
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager.state.newTableName.trim()) return;
    const created = await onCreateTable(manager.state.newTableName.trim(), manager.state.newTableFormula);
    selectTable(created);
    manager.resetNewTableForm();
  };

  const handleDeleteTable = async (table: RollTable) => {
    await onDeleteTable(table.id);
    if (manager.state.selectedTable?.id === table.id) {
      manager.deselectTable();
      onSelectedTableChange?.(null);
    }
  };

  const handleImportTables = async (tables: ImportedRollTable[]) => {
    for (const table of tables) {
      const created = await onCreateTable(table.name, table.formula);
      await onUpdateTable(created.id, { results: table.results });
    }
  };

  const handleRollTable = () => {
    manager.rollTable(activeSessionId);
  };

  return (
    <div className="flex h-full gap-4 text-rpg-text">
      <RollTableList
        campaignTables={campaignTables}
        selectedTableId={manager.state.selectedTable?.id ?? null}
        newTableName={manager.state.newTableName}
        newTableFormula={manager.state.newTableFormula}
        onNewTableNameChange={manager.updateNewTableName}
        onNewTableFormulaChange={manager.updateNewTableFormula}
        onCreateTable={handleCreateTable}
        onSelectTable={selectTable}
        onDeleteTable={handleDeleteTable}
      />

      <div className="flex-1 bg-rpg-card/10 border border-rpg-card/20 rounded-lg p-4 flex flex-col gap-4">
        <RollResult
          rolledNumber={manager.state.rolledNumber ?? 0}
          rollingResult={manager.state.rollingResult ?? ''}
          isVisible={manager.state.rolledNumber !== null || manager.state.rollingResult !== null}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onWikiLinkClick={onWikiLinkClick}
        />

        <RollTableEditor
          selectedTable={manager.state.selectedTable}
          isRolling={manager.state.isRolling}
          newMin={manager.state.newMin}
          newMax={manager.state.newMax}
          newText={manager.state.newText}
          transferControls={<RollTableTransfer tables={campaignTables} onImport={handleImportTables} />}
          onNewMinChange={manager.updateNewResultMin}
          onNewMaxChange={manager.updateNewResultMax}
          onNewTextChange={manager.updateNewResultText}
          onAddResult={manager.addResultRow}
          onDeleteResult={manager.deleteResultRow}
          onRoll={handleRollTable}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onWikiLinkClick={onWikiLinkClick}
        />
      </div>
    </div>
  );
};

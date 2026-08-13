import { useState } from 'react';
import type { RollTable } from '../types/rpg.types';
import { resolveCompositeRoll } from '../lib/rollTable';

interface UseRollTableManagerOptions {
  onUpdateTable: (tableId: string, updates: Partial<RollTable>) => Promise<void>;
  onDeleteTable: (tableId: string) => Promise<void>;
  onAddLog: (content: string) => Promise<void>;
}

interface RollTableState {
  selectedTable: RollTable | null;
  newTableName: string;
  newTableFormula: string;
  newMin: number;
  newMax: number;
  newText: string;
  rollingResult: string | null;
  rolledNumber: number | null;
  isRolling: boolean;
}

export const useRollTableManager = (options: UseRollTableManagerOptions, tables: RollTable[]) => {
  const [state, setState] = useState<RollTableState>({
    selectedTable: null,
    newTableName: '',
    newTableFormula: '1d10',
    newMin: 1,
    newMax: 1,
    newText: '',
    rollingResult: null,
    rolledNumber: null,
    isRolling: false,
  });

  const selectTable = (table: RollTable) => {
    setState((prev) => ({
      ...prev,
      selectedTable: table,
      rollingResult: null,
      rolledNumber: null,
    }));
  };

  const deselectTable = () => {
    setState((prev) => ({ ...prev, selectedTable: null }));
  };

  const updateNewTableName = (name: string) => {
    setState((prev) => ({ ...prev, newTableName: name }));
  };

  const updateNewTableFormula = (formula: string) => {
    setState((prev) => ({ ...prev, newTableFormula: formula }));
  };

  const resetNewTableForm = () => {
    setState((prev) => ({
      ...prev,
      newTableName: '',
      newTableFormula: '1d10',
    }));
  };

  const updateNewResultMin = (min: number) => {
    setState((prev) => ({ ...prev, newMin: min }));
  };

  const updateNewResultMax = (max: number) => {
    setState((prev) => ({ ...prev, newMax: max }));
  };

  const updateNewResultText = (text: string) => {
    setState((prev) => ({ ...prev, newText: text }));
  };

  const addResultRow = async () => {
    if (!state.selectedTable || !state.newText.trim()) return;

    const newResult = {
      range: [state.newMin, state.newMax] as [number, number],
      text: state.newText.trim(),
    };

    const updatedResults = [...state.selectedTable.results, newResult].sort(
      (a, b) => a.range[0] - b.range[0],
    );

    await options.onUpdateTable(state.selectedTable.id, { results: updatedResults });

    setState((prev) => ({
      ...prev,
      selectedTable: prev.selectedTable
        ? { ...prev.selectedTable, results: updatedResults }
        : null,
      newMin: state.newMax + 1,
      newMax: state.newMax + 1,
      newText: '',
    }));
  };

  const deleteResultRow = async (index: number) => {
    if (!state.selectedTable) return;
    const updatedResults = state.selectedTable.results.filter((_, resultIndex) => resultIndex !== index);
    await options.onUpdateTable(state.selectedTable.id, { results: updatedResults });
    setState((prev) => ({
      ...prev,
      selectedTable: prev.selectedTable
        ? { ...prev.selectedTable, results: updatedResults }
        : null,
    }));
  };

  const rollTable = (activeSessionId: string | null) => {
    if (!state.selectedTable || state.selectedTable.results.length === 0) return;

    setState((prev) => ({ ...prev, isRolling: true, rollingResult: null, rolledNumber: null }));

    const compositeRoll = resolveCompositeRoll(state.selectedTable, tables);
    const diceTotal = compositeRoll.total;
    const matchText = compositeRoll.result;
    const diceSides = Number(state.selectedTable.formula.match(/\d+d(\d+)/i)?.[1] ?? 10);

    let ticks = 0;
    const interval = setInterval(() => {
      setState((prev) => ({ ...prev, rolledNumber: Math.floor(Math.random() * diceSides) + 1 }));
      ticks += 1;
      if (ticks > 10) {
        clearInterval(interval);
        setState((prev) => ({
          ...prev,
          rolledNumber: diceTotal,
          rollingResult: matchText,
          isRolling: false,
        }));

        if (activeSessionId && state.selectedTable) {
          options.onAddLog(`Tabela ${compositeRoll.trail.join(' -> ')} -> ${matchText}`);
        }
      }
    }, 80);
  };

  return {
    state,
    selectTable,
    deselectTable,
    updateNewTableName,
    updateNewTableFormula,
    resetNewTableForm,
    updateNewResultMin,
    updateNewResultMax,
    updateNewResultText,
    addResultRow,
    deleteResultRow,
    rollTable,
  };
};

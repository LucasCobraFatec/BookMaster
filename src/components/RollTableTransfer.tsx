import { Download, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { RollTable } from '../types/rpg.types';
import { exportRollTablesCsv, exportRollTablesJson, importRollTablesCsv, importRollTablesJson } from '../lib/rollTableTransfer';

interface RollTableTransferProps { tables: RollTable[]; onImport: (tables: ReturnType<typeof importRollTablesJson>) => Promise<void>; }

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}

export function RollTableTransfer({ tables, onImport }: RollTableTransferProps) {
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const imported = file.name.toLocaleLowerCase().endsWith('.json') ? importRollTablesJson(content) : importRollTablesCsv(content);
      if (!imported.length) throw new Error('Nenhuma tabela válida foi encontrada no arquivo.');
      await onImport(imported);
    } catch (error) { window.alert(error instanceof Error ? error.message : 'Não foi possível importar o arquivo.'); }
    event.target.value = '';
  };

  return <div className="flex flex-wrap gap-2 border-t border-rpg-card/40 pt-3">
    <button type="button" onClick={() => download('tabelas-rpg.json', exportRollTablesJson(tables), 'application/json')} className="text-[10px] text-rpg-muted hover:text-white flex items-center gap-1"><Download className="w-3.5 h-3.5" />JSON</button>
    <button type="button" onClick={() => download('tabelas-rpg.csv', exportRollTablesCsv(tables), 'text/csv;charset=utf-8')} className="text-[10px] text-rpg-muted hover:text-white flex items-center gap-1"><Download className="w-3.5 h-3.5" />CSV</button>
    <label className="cursor-pointer text-[10px] text-rpg-accent hover:text-white flex items-center gap-1"><Upload className="w-3.5 h-3.5" />Importar<input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={importFile} /></label>
  </div>;
}

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';
import { useRPGDatabase } from './useRPGDatabase';
import { parseWikiLinkTarget, resolveWikiLinkTarget } from '../lib/wikiLinks';
import { getRollTableLinkName, resolveRollTableLink } from '../lib/rollTable';

export type CenterTab = 'grimorio' | 'tabelas' | 'fichas';

export function useBookMasterApp() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const {
    campaigns,
    notes,
    sessions,
    rollTables,
    characters,
    loading,
    error,
    createCampaign,
    deleteCampaign,
    createCampaignBackup,
    restoreCampaignBackup,
    createNote,
    updateNote,
    deleteNote,
    createSession,
    toggleSessionActive,
    deleteSession,
    addSessionLog,
    toggleLogHighlight,
    deleteSessionLog,
    getSessionLogs,
    createRollTable,
    updateRollTable,
    deleteRollTable,
    createCharacter,
    updateCharacter,
    duplicateCharacter,
    deleteCharacter,
  } = useRPGDatabase(selectedCampaignId);

  const [selectedNote, setSelectedNote] = useState<NoteEntity | null>(null);
  const [selectedChar, setSelectedChar] = useState<CharacterEntity | null>(null);
  const [selectedRollTableId, setSelectedRollTableId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState<string>('');
  const [activeCenterTab, setActiveCenterTab] = useState<CenterTab>('grimorio');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editHp, setEditHp] = useState<number>(0);
  const [editCa, setEditCa] = useState<number>(0);
  const [appError, setAppError] = useState<string | null>(null);
  const isEditingChar = Boolean(selectedChar && editingCharId === selectedChar.id);

  const setIsEditingChar = useCallback(
    (editing: boolean) => {
      setEditingCharId(editing ? selectedChar?.id ?? null : null);
    },
    [selectedChar?.id],
  );

  const campaignNotes = useMemo(
    () => notes.filter((n) => n.campaignId === selectedCampaignId),
    [notes, selectedCampaignId],
  );

  const campaignSessions = useMemo(
    () => sessions.filter((s) => s.campaignId === selectedCampaignId),
    [sessions, selectedCampaignId],
  );

  const activeSession = useMemo(
    () => campaignSessions.find((s) => s.isActive) || null,
    [campaignSessions],
  );

  const sessionLogs = useMemo(
    () => (activeSession ? getSessionLogs(activeSession.id) : []),
    [activeSession, getSessionLogs],
  );

  const runSafe = useCallback(
    async <T,>(operation: () => Promise<T>, fallbackMessage: string): Promise<T | null> => {
      try {
        setAppError(null);
        return await operation();
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : fallbackMessage;

        setAppError(message);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      const campaignId = campaigns[0].id;
      queueMicrotask(() => setSelectedCampaignId(campaignId));
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (selectedNote) {
      const { title, content, properties } = selectedNote;
      queueMicrotask(() => {
        setEditTitle(title);
        setEditContent(content);
        setEditHp(properties?.hp ?? 0);
        setEditCa(properties?.ca ?? 0);
      });
    }
  }, [selectedNote]);

  useEffect(() => {
    if (!selectedNote || isEditing) {
      return;
    }

    const updated = campaignNotes.find((note) => note.id === selectedNote.id);
    if (!updated) {
      return;
    }

    const hasChanged =
      updated.title !== selectedNote.title ||
      updated.content !== selectedNote.content ||
      (updated.properties?.hp ?? 0) !== (selectedNote.properties?.hp ?? 0) ||
      (updated.properties?.ca ?? 0) !== (selectedNote.properties?.ca ?? 0);

    if (hasChanged) {
      queueMicrotask(() => setSelectedNote(updated));
    }
  }, [campaignNotes, selectedNote, isEditing]);

  useEffect(() => {
    if (!selectedChar || isEditingChar) {
      return;
    }

    const updated = characters.find((character) => character.id === selectedChar.id);
    if (!updated) {
      return;
    }

    const hasChanged =
      updated.name !== selectedChar.name ||
      updated.avatar !== selectedChar.avatar ||
      updated.hp !== selectedChar.hp ||
      updated.hpMax !== selectedChar.hpMax ||
      updated.ca !== selectedChar.ca ||
      JSON.stringify(updated.attributes) !== JSON.stringify(selectedChar.attributes);

    if (hasChanged) {
      queueMicrotask(() => setSelectedChar(updated));
    }
  }, [characters, selectedChar, isEditingChar]);

  const handleCreateCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCampaignName.trim();
    if (!trimmedName) {
      setAppError('Informe um nome para a campanha.');
      return;
    }

    const createdCampaign = await runSafe(async () => {
      const campaign = await createCampaign(trimmedName);
      setSelectedCampaignId(campaign.id);
      setNewCampaignName('');
      return campaign;
    }, 'Não foi possível criar a campanha.');

    if (!createdCampaign) {
      return;
    }
  };

  const handleCreateNote = async (type: NoteEntity['type'], initialTitle?: string) => {
    if (!selectedCampaignId) {
      setAppError('Selecione uma campanha antes de criar uma nota.');
      return;
    }

    const title = initialTitle || `Novo ${type.toUpperCase()} #${campaignNotes.length + 1}`;

    const createdNote = await runSafe(async () => {
      const note = await createNote(selectedCampaignId, title, type);
      if (!note) {
        return null;
      }

      setSelectedNote(note);
      setIsEditing(true);
      setActiveCenterTab('grimorio');
      return note;
    }, 'Não foi possível criar a nota.');

    if (!createdNote) {
      return;
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) {
      setAppError('Nenhuma nota selecionada para salvar.');
      return;
    }

    const nextTitle = editTitle.trim();
    if (!nextTitle) {
      setAppError('O título da nota não pode ficar vazio.');
      return;
    }

    await runSafe(async () => {
      await updateNote(selectedNote.id, {
        title: nextTitle,
        content: editContent,
        isDraft: false,
        properties: {
          ...selectedNote.properties,
          hp: editHp,
          ca: editCa,
        },
      });

      setIsEditing(false);
      setSelectedNote({
        ...selectedNote,
        title: nextTitle,
        content: editContent,
        isDraft: false,
        properties: {
          ...selectedNote.properties,
          hp: editHp,
          ca: editCa,
        },
      });
    }, 'Não foi possível salvar a nota.');
  };

  const handleWikiLinkClick = async (noteTitle: string) => {
    if (!selectedCampaignId) {
      setAppError('Selecione uma campanha antes de usar links de lore.');
      return;
    }

    const campaignCharacters = characters.filter((character) => character.campaignId === selectedCampaignId);
    const campaignTables = rollTables.filter((table) => table.campaignId === selectedCampaignId);
    const tableLinkName = getRollTableLinkName(noteTitle);
    const existingTable = resolveRollTableLink(noteTitle, campaignTables);

    if (existingTable) {
      setSelectedRollTableId(existingTable.id);
      setSelectedNote(null);
      setSelectedChar(null);
      setIsEditing(false);
      setEditingCharId(null);
      setActiveCenterTab('tabelas');
      return;
    }

    if (tableLinkName) {
      setAppError(`A tabela "${tableLinkName}" não existe nesta campanha.`);
      return;
    }

    const existing = resolveWikiLinkTarget(noteTitle, campaignNotes, campaignCharacters);

    if (existing?.kind === 'note') {
      setSelectedNote(existing.entity);
      setSelectedChar(null);
      setSelectedRollTableId(null);
      setIsEditing(false);
      setActiveCenterTab('grimorio');
      return;
    }

    if (existing?.kind === 'character') {
      setSelectedChar(existing.entity);
      setSelectedNote(null);
      setSelectedRollTableId(null);
      setEditingCharId(null);
      setActiveCenterTab('fichas');
      return;
    }

    const parsedTarget = parseWikiLinkTarget(noteTitle);

    if (parsedTarget.preferredKind === 'character') {
      setAppError(`A ficha "${parsedTarget.title}" não existe nesta campanha.`);
      return;
    }

    const shouldCreate = window.confirm(
      `A nota "[[${parsedTarget.title}]]" não existe. Deseja criá-la agora?`,
    );

    if (!shouldCreate) {
      return;
    }

    const createdNote = await runSafe(async () => {
      const note = await createNote(selectedCampaignId, parsedTarget.title, 'lore');
      if (!note) {
        return null;
      }

      setSelectedNote(note);
      setIsEditing(true);
      setActiveCenterTab('grimorio');
      return note;
    }, 'Não foi possível criar a nota vinculada.');

    if (!createdNote) {
      return;
    }
  };

  const handleCreateCharFromSidebar = async (type: CharacterEntity['type']) => {
    if (!selectedCampaignId) {
      setAppError('Selecione uma campanha antes de criar uma ficha.');
      return;
    }

    const charName = window.prompt(`Digite o nome do novo ${type.toUpperCase()}:`);
    if (!charName || !charName.trim()) {
      return;
    }

    const trimmedName = charName.trim();

    const createdChar = await runSafe(async () => {
      const character = await createCharacter(selectedCampaignId, type, trimmedName);
      if (!character) {
        return null;
      }

      setSelectedChar(character);
      setEditingCharId(character.id);
      setActiveCenterTab('fichas');
      return character;
    }, 'Não foi possível criar a ficha.');

    if (!createdChar) {
      return;
    }
  };

  const handleAddQuickLog = async (content: string) => {
    if (!activeSession) {
      setAppError('Não existe uma sessão ativa para registrar o log.');
      return;
    }

    await runSafe(async () => {
      await addSessionLog(activeSession.id, content);
    }, 'Não foi possível registrar o log da sessão.');
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaignId) {
      return;
    }

    const campaignName = campaigns.find((campaign) => campaign.id === selectedCampaignId)?.name;
    const shouldDelete = window.confirm(
      `⚠️ EXCLUSÃO TOTAL!\n\nTem certeza que deseja excluir permanentemente a campanha "${campaignName}" com todas as suas notas, fichas, tabelas de rolagem e timeline?\n\nEsta ação é irreversível!`,
    );

    if (!shouldDelete) {
      return;
    }

    const result = await runSafe(async () => {
      await deleteCampaign(selectedCampaignId);
      const remaining = campaigns.filter((campaign) => campaign.id !== selectedCampaignId);
      setSelectedCampaignId(remaining.length > 0 ? remaining[0].id : '');
      setSelectedNote(null);
      setSelectedChar(null);
      setEditingCharId(null);
      return true;
    }, 'Não foi possível excluir a campanha.');

    if (!result) {
      return;
    }
  };

  const handlers = {
    setSelectedCampaignId,
    setSelectedNote,
    setSelectedChar,
    setSelectedRollTableId,
    setIsEditing,
    setIsEditingChar,
    setActiveCenterTab,
    setIsLeftSidebarOpen,
    setIsRightSidebarOpen,
    setEditTitle,
    setEditContent,
    setEditHp,
    setEditCa,
    setNewCampaignName,
  };

  return {
    campaigns,
    notes,
    sessions,
    rollTables,
    characters,
    loading,
    error,
    appError,
    selectedCampaignId,
    selectedNote,
    selectedChar,
    selectedRollTableId,
    isEditing,
    isEditingChar,
    newCampaignName,
    activeCenterTab,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    editTitle,
    editContent,
    editHp,
    editCa,
    campaignNotes,
    campaignSessions,
    activeSession,
    sessionLogs,
    handlers,
    createCampaign,
    deleteCampaign,
    createCampaignBackup,
    restoreCampaignBackup,
    createNote,
    updateNote,
    deleteNote,
    createSession,
    toggleSessionActive,
    deleteSession,
    addSessionLog,
    toggleLogHighlight,
    deleteSessionLog,
    getSessionLogs,
    createRollTable,
    updateRollTable,
    deleteRollTable,
    createCharacter,
    updateCharacter,
    duplicateCharacter,
    deleteCharacter,
    handleCreateCampaign,
    handleCreateNote,
    handleSaveNote,
    handleWikiLinkClick,
    handleCreateCharFromSidebar,
    handleAddQuickLog,
    handleDeleteCampaign,
  };
}

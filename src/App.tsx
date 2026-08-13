import { MarkdownParser } from './components/MarkdownParser';
import { SessionTimeline } from './components/SessionTimeLine';
import { RollTableManager } from './components/RollTableManager';
import { Soundboard } from './components/Soundboard';
import { EntityManager } from './components/EntityManager';
import { useBookMasterApp } from './hooks/useBookMasterApp';
import {
  Plus,
  Trash,
  Shield,
  Heart,
  BookOpen,
  PenTool,
  Compass,
  Menu,
  X,
  Scroll,
  Folder,
  FolderPlus,
  Play,
  Volume2,
  TableProperties,
  Save,
  User,
} from 'lucide-react';

export default function App() {
  const {
    campaigns,
    rollTables,
    characters,
    loading,
    error,
    appError,
    selectedCampaignId,
    selectedNote,
    selectedChar,
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
    handleCreateCampaign,
    handleCreateNote,
    handleSaveNote,
    handleWikiLinkClick,
    handleCreateCharFromSidebar,
    handleAddQuickLog,
    handleDeleteCampaign,
    deleteNote,
    deleteCharacter,
    createSession,
    toggleSessionActive,
    deleteSession,
    addSessionLog,
    toggleLogHighlight,
    deleteSessionLog,
    createRollTable,
    updateRollTable,
    deleteRollTable,
    createCharacter,
    updateCharacter,
  } = useBookMasterApp();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-rpg-bg text-rpg-accent text-lg font-bold animate-pulse">
        Carregando Grimório...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-rpg-bg text-red-500 font-bold">
        Erro: {(error as Error)?.message || 'Erro de conexão com o banco'}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-rpg-bg text-rpg-text overflow-hidden font-sans select-none relative">
      {appError && (
        <div className="absolute left-4 top-4 z-40 max-w-md rounded-lg border border-red-500/30 bg-red-950/60 px-3 py-2 text-xs text-red-200 shadow-lg shadow-red-950/20">
          {appError}
        </div>
      )}

      <aside
        className={`w-85 bg-rpg-panel border-r border-rpg-card flex flex-col z-20 transition-transform duration-300 absolute md:static h-full ${
          isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-rpg-card/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-extrabold text-white tracking-widest flex items-center gap-2">
              <Scroll className="w-5 h-5 text-rpg-accent" />
              BOOKMASTER
            </h1>
            <button
              onClick={() => handlers.setIsLeftSidebarOpen(false)}
              className="md:hidden text-rpg-muted p-1 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-rpg-muted font-bold uppercase tracking-wider block">
              Campanha Ativa
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCampaignId}
                onChange={(event) => {
                  handlers.setSelectedCampaignId(event.target.value);
                  handlers.setSelectedNote(null);
                  handlers.setSelectedChar(null);
                }}
                className="flex-1 bg-rpg-card border border-rpg-card text-white rounded p-2 text-xs focus:outline-none focus:border-rpg-accent cursor-pointer truncate"
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} ({campaign.system})
                  </option>
                ))}
              </select>

              {selectedCampaignId && campaigns.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCampaign}
                  className="bg-red-950/40 hover:bg-red-900 border border-red-900/40 hover:border-red-500 text-red-400 p-2 rounded transition-colors"
                  title="Excluir Campanha Ativa"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateCampaign} className="flex gap-2">
            <input
              type="text"
              placeholder="Nova campanha..."
              value={newCampaignName}
              onChange={(event) => handlers.setNewCampaignName(event.target.value)}
              className="flex-1 bg-rpg-card border border-rpg-card text-white rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-rpg-accent"
            />
            <button
              type="submit"
              className="bg-rpg-accent hover:bg-rpg-accent/80 text-white px-2 py-1.5 rounded transition-colors text-xs flex items-center"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center pr-1 border-b border-rpg-card/20 pb-1">
              <span className="text-[10px] font-black text-rpg-accent uppercase tracking-wider block">
                1. Lore do Mundo
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCreateNote('location')}
                  className="p-1 hover:bg-rpg-card rounded text-sky-400"
                  title="Criar Novo Local"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCreateNote('lore')}
                  className="p-1 hover:bg-rpg-card rounded text-purple-400"
                  title="Criar Nova Lore"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {['location', 'lore'].map((type) => {
              const filtered = campaignNotes.filter((note) => note.type === type);
              const typeLabel = type === 'location' ? 'Locais' : 'Lores';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold px-1.5">
                    <Folder className="w-3.5 h-3.5 text-rpg-accent fill-rpg-accent/10" />
                    {typeLabel}
                    <span className="text-[10px] text-rpg-muted ml-auto">({filtered.length})</span>
                  </div>

                  <div className="space-y-0.5 pl-3 border-l border-rpg-card/45 ml-2">
                    {filtered.map((note) => (
                      <div
                        key={note.id}
                        className="group flex justify-between items-center p-1.5 rounded text-xs transition-colors hover:bg-rpg-card/20 cursor-pointer"
                      >
                        <span
                          onClick={() => {
                            handlers.setSelectedNote(note);
                            handlers.setIsEditing(false);
                            handlers.setActiveCenterTab('grimorio');
                          }}
                          className={`flex-1 hover:underline truncate ${
                            selectedNote?.id === note.id && activeCenterTab === 'grimorio'
                              ? 'text-rpg-accent font-extrabold'
                              : 'text-rpg-text/80'
                          }`}
                        >
                          {note.title}
                        </span>

                        <button
                          onClick={async (event) => {
                            event.stopPropagation();
                            if (window.confirm(`Excluir permanentemente a nota "${note.title}"?`)) {
                              await deleteNote(note.id);
                              if (selectedNote?.id === note.id) {
                                handlers.setSelectedNote(null);
                              }
                            }
                          }}
                          className="hidden group-hover:block text-rpg-muted hover:text-red-400 p-0.5 rounded transition-all ml-1"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center pr-1 border-b border-rpg-card/20 pb-1">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">
                2. Fichas & Bestiário
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCreateCharFromSidebar('pc')}
                  className="p-0.5 hover:bg-rpg-card rounded text-sky-400 text-[9px] font-black uppercase px-1 border border-sky-400/20"
                  title="Novo PC"
                >
                  +PC
                </button>
                <button
                  onClick={() => handleCreateCharFromSidebar('npc')}
                  className="p-0.5 hover:bg-rpg-card rounded text-emerald-400 text-[9px] font-black uppercase px-1 border border-emerald-400/20"
                  title="Novo NPC"
                >
                  +NPC
                </button>
                <button
                  onClick={() => handleCreateCharFromSidebar('monster')}
                  className="p-0.5 hover:bg-rpg-card rounded text-amber-500 text-[9px] font-black uppercase px-1 border border-amber-500/20"
                  title="Novo Monstro"
                >
                  +MON
                </button>
                <button
                  onClick={() => handleCreateCharFromSidebar('villain')}
                  className="p-0.5 hover:bg-rpg-card rounded text-rose-500 text-[9px] font-black uppercase px-1 border border-rose-500/20"
                  title="Novo Vilão"
                >
                  +VIL
                </button>
              </div>
            </div>

            {(['pc', 'npc', 'monster', 'villain'] as const).map((type) => {
              const campaignChars = characters.filter(
                (character) => character.campaignId === selectedCampaignId && character.type === type,
              );
              const typeLabel =
                type === 'pc'
                  ? 'Personagens'
                  : type === 'npc'
                    ? 'NPCs'
                    : type === 'monster'
                      ? 'Monstros'
                      : 'Vilões';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold px-1.5">
                    <Folder className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                    {typeLabel}
                    <span className="text-[10px] text-rpg-muted ml-auto">({campaignChars.length})</span>
                  </div>

                  <div className="space-y-0.5 pl-3 border-l border-rpg-card/45 ml-2">
                    {campaignChars.map((character) => (
                      <div
                        key={character.id}
                        className="group flex justify-between items-center p-1.5 rounded text-xs transition-colors hover:bg-rpg-card/20 cursor-pointer"
                      >
                        <span
                          onClick={() => {
                            handlers.setSelectedChar(character);
                            handlers.setIsEditingChar(false);
                            handlers.setActiveCenterTab('fichas');
                          }}
                          className={`flex-1 hover:underline truncate ${
                            selectedChar?.id === character.id && activeCenterTab === 'fichas'
                              ? 'text-rose-400 font-extrabold'
                              : 'text-rpg-text/80'
                          }`}
                        >
                          {character.name}
                        </span>

                        <button
                          onClick={async (event) => {
                            event.stopPropagation();
                            if (window.confirm(`Excluir permanentemente a ficha de "${character.name}"?`)) {
                              await deleteCharacter(character.id);
                              if (selectedChar?.id === character.id) {
                                handlers.setSelectedChar(null);
                              }
                            }
                          }}
                          className="hidden group-hover:block text-rpg-muted hover:text-red-400 p-0.5 rounded transition-all ml-1"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-rpg-bg flex flex-col overflow-hidden">
        <header className="p-3 border-b border-rpg-card/60 flex justify-between items-center bg-rpg-panel/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlers.setIsLeftSidebarOpen(true)}
              className="md:hidden text-rpg-muted p-1 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex gap-1.5">
              <button
                onClick={() => handlers.setActiveCenterTab('grimorio')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCenterTab === 'grimorio'
                    ? 'bg-rpg-accent/15 text-white border border-rpg-accent/40 shadow-md shadow-rpg-accent/5'
                    : 'bg-rpg-card/30 border border-transparent text-rpg-muted hover:bg-rpg-card'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Grimório
              </button>

              <button
                onClick={() => handlers.setActiveCenterTab('tabelas')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCenterTab === 'tabelas'
                    ? 'bg-rpg-accent/15 text-white border border-rpg-accent/40 shadow-md shadow-rpg-accent/5'
                    : 'bg-rpg-card/30 border border-transparent text-rpg-muted hover:bg-rpg-card'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" /> Tabelas de Rolagem
              </button>

              <button
                onClick={() => handlers.setActiveCenterTab('som')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCenterTab === 'som'
                    ? 'bg-rpg-accent/15 text-white border border-rpg-accent/40 shadow-md shadow-rpg-accent/5'
                    : 'bg-rpg-card/30 border border-transparent text-rpg-muted hover:bg-rpg-card'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" /> Som do Bardo
              </button>

              <button
                onClick={() => handlers.setActiveCenterTab('fichas')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCenterTab === 'fichas'
                    ? 'bg-rpg-accent/15 text-white border border-rpg-accent/40 shadow-md shadow-rpg-accent/5'
                    : 'bg-rpg-card/30 border border-transparent text-rpg-muted hover:bg-rpg-card'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Fichas & Bestiário
              </button>
            </div>
          </div>

          <button
            onClick={() => handlers.setIsRightSidebarOpen(true)}
            className="md:hidden text-rpg-muted p-1 hover:text-white flex items-center gap-1 text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-rpg-accent/20" /> Sessões
          </button>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeCenterTab === 'grimorio' && (
            (selectedNote ? (
              <article className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center border-b border-rpg-card/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-rpg-accent/15 border border-rpg-accent/40 text-rpg-accent font-bold px-2 py-0.5 rounded-full uppercase">
                      {selectedNote.type}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => handlers.setEditTitle(event.target.value)}
                        className="bg-rpg-card border border-rpg-card text-lg font-bold text-white rounded px-2.5 py-1 focus:outline-none focus:border-rpg-accent"
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-white leading-none">{selectedNote.title}</h1>
                    )}
                  </div>

                  {isEditing ? (
                    <button
                      onClick={handleSaveNote}
                      className="bg-rpg-accent hover:bg-rpg-accent/80 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Salvar Nota
                    </button>
                  ) : (
                    <button
                      onClick={() => handlers.setIsEditing(true)}
                      className="bg-rpg-card hover:bg-rpg-card/80 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors border border-rpg-card"
                    >
                      <PenTool className="w-4 h-4" /> Editar Lore
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {(selectedNote.type === 'npc' || selectedNote.type === 'monster') && (
                      <div className="grid grid-cols-2 gap-4 bg-rpg-card/20 border border-rpg-card/60 rounded-lg p-3">
                        <div>
                          <label className="text-[10px] text-rpg-muted block mb-1">Pontos de Vida (HP)</label>
                          <input
                            type="number"
                            value={editHp}
                            onChange={(event) => handlers.setEditHp(Number(event.target.value) || 0)}
                            className="w-full bg-rpg-card border border-rpg-card text-white rounded p-2 focus:outline-none focus:border-rpg-accent text-center text-sm font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-rpg-muted block mb-1">Classe de Armadura (CA)</label>
                          <input
                            type="number"
                            value={editCa}
                            onChange={(event) => handlers.setEditCa(Number(event.target.value) || 0)}
                            className="w-full bg-rpg-card border border-rpg-card text-white rounded p-2 focus:outline-none focus:border-rpg-accent text-center text-sm font-bold"
                          />
                        </div>
                      </div>
                    )}

                    <textarea
                      value={editContent}
                      onChange={(event) => handlers.setEditContent(event.target.value)}
                      placeholder="Escreva a lore ou descrição em markdown... Use [[Link]] para interligar as notas!"
                      className="w-full h-96 bg-rpg-card border border-rpg-card text-white rounded p-3 focus:outline-none focus:border-rpg-accent font-mono text-sm leading-relaxed resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(selectedNote.type === 'npc' || selectedNote.type === 'monster') && (
                      <div className="flex gap-4">
                        <div className="bg-rpg-panel px-4 py-2 border rounded border-rpg-card flex items-center gap-2">
                          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />
                          <div>
                            <p className="text-xs text-rpg-muted uppercase leading-none">Pontos de Vida</p>
                            <p className="text-lg font-bold text-white">{selectedNote.properties?.hp || 0} HP</p>
                          </div>
                        </div>
                        <div className="bg-rpg-panel px-4 py-2 border rounded border-rpg-card flex items-center gap-2">
                          <Shield className="w-5 h-5 text-sky-400" />
                          <div>
                            <p className="text-xs text-rpg-muted uppercase leading-none">Classe de Armadura</p>
                            <p className="text-lg font-bold text-white">{selectedNote.properties?.ca || 0} CA</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-rpg-panel/10 border border-rpg-card/20 rounded-lg p-6 min-h-[400px]">
                      <MarkdownParser
                        content={selectedNote.content}
                        existingNotes={campaignNotes}
                        onLinkClick={handleWikiLinkClick}
                      />
                    </div>
                  </div>
                )}
              </article>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Compass className="w-16 h-16 text-rpg-card mb-4 animate-bounce" />
                <h2 className="text-lg font-bold text-white mb-1">Seu Grimório está aberto!</h2>
                <p className="text-xs text-rpg-muted max-w-sm">
                  Crie, selecione ou clique em WikiLinks do cofre lateral para começar a explorar a lore.
                </p>
              </div>
            ))
          )}

          {activeCenterTab === 'tabelas' && (
            <RollTableManager
              campaignId={selectedCampaignId}
              rollTables={rollTables}
              activeSessionId={activeSession?.id || null}
              onCreateTable={createRollTable}
              onUpdateTable={updateRollTable}
              onDeleteTable={deleteRollTable}
              onAddLog={handleAddQuickLog}
            />
          )}

          {activeCenterTab === 'som' && <Soundboard />}

          {activeCenterTab === 'fichas' && selectedCampaignId && (
            <EntityManager
              campaignId={selectedCampaignId}
              characters={characters}
              onCreateCharacter={async (type, name, avatar) => {
                return await createCharacter(selectedCampaignId, type, name, avatar);
              }}
              onUpdateCharacter={updateCharacter}
              onDeleteCharacter={deleteCharacter}
              selectedChar={selectedChar}
              setSelectedChar={handlers.setSelectedChar}
              isEditing={isEditingChar}
              setIsEditing={handlers.setIsEditingChar}
            />
          )}
        </div>
      </main>

      <aside
        className={`w-80 md:w-96 overflow-x-hidden bg-rpg-panel border-l border-rpg-card flex flex-col z-20 transition-transform duration-300 absolute md:static h-full right-0 ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-rpg-card/60 flex items-center justify-between">
          <h2 className="text-xs font-bold text-rpg-accent uppercase tracking-wider">Timeline de Sessões</h2>
          <button
            onClick={() => handlers.setIsRightSidebarOpen(false)}
            className="md:hidden text-rpg-muted p-1 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SessionTimeline
            campaignId={selectedCampaignId}
            sessions={campaignSessions}
            activeSession={activeSession}
            sessionLogs={sessionLogs}
            onCreateSession={async (name) => {
              await createSession(selectedCampaignId, name);
            }}
            onToggleActive={async (id, active) => {
              await toggleSessionActive(selectedCampaignId, id, active);
            }}
            onDeleteSession={async (id) => {
              await deleteSession(id);
            }}
            onAddLog={async (content, isHighlight) => {
              if (activeSession) {
                await addSessionLog(activeSession.id, content, isHighlight);
              }
            }}
            onToggleHighlight={async (id, current) => {
              await toggleLogHighlight(id, current);
            }}
            onDeleteLog={async (id) => {
              await deleteSessionLog(id);
            }}
          />
        </div>
      </aside>

      <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={() => handlers.setIsLeftSidebarOpen((current) => !current)}
          className="bg-rpg-accent text-white p-3 rounded-full shadow-lg shadow-rpg-accent/30 flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

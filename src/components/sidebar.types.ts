import type { Campaign, CharacterEntity, NoteEntity, RollTable } from '../types/rpg.types';

export type SidebarSectionId = 'session' | 'bestiary' | 'world' | 'rules';
export type SidebarAccent = 'purple' | 'red' | 'blue' | 'green';
export type SidebarItem = NoteEntity | CharacterEntity | RollTable;

export interface FileNode {
  id: string;
  name: string;
  kind: 'note' | 'character' | 'table';
  source: SidebarItem;
  isDraft?: boolean;
}

export interface CategoryNode {
  id: string;
  label: string;
  createLabel: string;
  kind: FileNode['kind'];
  noteType?: NoteEntity['type'];
  characterType?: CharacterEntity['type'];
  files: FileNode[];
}

export interface SidebarSectionType {
  id: SidebarSectionId;
  label: string;
  accent: SidebarAccent;
  categories: CategoryNode[];
}

export interface SidebarProps {
  campaigns: Campaign[];
  selectedCampaignId: string;
  sections: SidebarSectionType[];
  selectedItemId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCampaign: (campaignId: string) => void;
  onCreateCampaign: (name: string) => Promise<void> | void;
  onDeleteCampaign?: () => Promise<void> | void;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (category: CategoryNode, name: string) => Promise<void> | void;
  onDeleteFile: (file: FileNode) => Promise<void> | void;
}

import type { CharacterEntity } from '../types/rpg.types';

export type EntityType = CharacterEntity['type'];

export interface EntityManagerProps {
  campaignId: string;
  characters: CharacterEntity[];
  onCreateCharacter: (type: EntityType, name: string, avatar?: string) => Promise<CharacterEntity>;
  onUpdateCharacter: (charId: string, updates: Partial<CharacterEntity>) => Promise<void>;
  onDeleteCharacter: (charId: string) => Promise<void>;
  selectedChar: CharacterEntity | null;
  setSelectedChar: (char: CharacterEntity | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

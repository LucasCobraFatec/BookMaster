import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import type { CharacterEntity } from '../types/rpg.types';
import type { EntityManagerProps, EntityType } from '../components/entity.types';

const avatarStorageKey = 'temp_avatar_upload';

const getString = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const getNumber = (data: FormData, key: string, fallback = 0) => {
  const value = Number(data.get(key));
  return Number.isFinite(value) ? value : fallback;
};

export function buildCharacterUpdate(data: FormData, type: EntityType): Partial<CharacterEntity> {
  const update: Partial<CharacterEntity> = {
    name: getString(data, 'name'), alignment: getString(data, 'alignment'), languages: getString(data, 'languages'),
    hp: getNumber(data, 'hp'), hpMax: getNumber(data, 'hpMax'), hpTemp: getNumber(data, 'hpTemp'),
    ca: getNumber(data, 'ca'), initiative: getNumber(data, 'initiative'), speed: getString(data, 'speed'),
    biography: getString(data, 'biography'), savingThrows: getString(data, 'savingThrows'), skills: getString(data, 'skills'),
    senses: getString(data, 'senses'), feats: getString(data, 'feats'), features: getString(data, 'features'),
    equipment: getString(data, 'equipment'),
    attributes: {
      strength: getNumber(data, 'strength'), dexterity: getNumber(data, 'dexterity'),
      constitution: getNumber(data, 'constitution'), intelligence: getNumber(data, 'intelligence'),
      wisdom: getNumber(data, 'wisdom'), charisma: getNumber(data, 'charisma'),
    },
  };

  if (type === 'pc') return { ...update, class: getString(data, 'class'), subclass: getString(data, 'subclass'), level: getNumber(data, 'level'), species: getString(data, 'species'), background: getString(data, 'background'), proficiencyBonus: getNumber(data, 'proficiencyBonus'), xp: getNumber(data, 'xp'), inspiration: data.get('inspiration') === 'on', deathSavesSuccesses: getNumber(data, 'deathSavesSuccesses'), deathSavesFailures: getNumber(data, 'deathSavesFailures') };
  if (type === 'npc') return { ...update, role: getString(data, 'role'), appearance: getString(data, 'appearance'), personality: getString(data, 'personality') };
  return { ...update, size: getString(data, 'size'), monsterType: getString(data, 'monsterType'), challengeRating: getString(data, 'challengeRating'), resistances: getString(data, 'resistances'), immunities: getString(data, 'immunities'), actions: getString(data, 'actions'), bonusActions: getString(data, 'bonusActions'), reactions: getString(data, 'reactions') };
}

export function useEntityForm(props: EntityManagerProps) {
  const [activeType, setActiveType] = useState<EntityType>('pc');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localEditingCharId, setLocalEditingCharId] = useState<string | null>(null);
  const displayedType = props.selectedChar?.type ?? activeType;
  const selectedCharId = props.selectedChar?.id ?? null;
  const isEditing = props.isEditing || Boolean(selectedCharId && localEditingCharId === selectedCharId);

  const characters = useMemo(() => props.characters.filter((character) =>
    character.campaignId === props.campaignId &&
    character.type === displayedType &&
    character.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
  ), [displayedType, props.campaignId, props.characters, searchTerm]);

  const changeType = (type: EntityType) => {
    setActiveType(type); props.setSelectedChar(null); setLocalEditingCharId(null); props.setIsEditing(false);
  };

  const selectCharacter = (character: CharacterEntity) => {
    props.setSelectedChar(character);
    props.setIsEditing(false);
    setLocalEditingCharId(null);
  };

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const created = await props.onCreateCharacter(activeType, name.trim(), localStorage.getItem(avatarStorageKey) ?? undefined);
    localStorage.removeItem(avatarStorageKey);
    props.setSelectedChar(created); props.setIsEditing(true); setLocalEditingCharId(created.id); setName('');
  };

  const createWithName = async (characterName: string) => {
    const trimmedName = characterName.trim();
    if (!trimmedName) return;
    const created = await props.onCreateCharacter(activeType, trimmedName, localStorage.getItem(avatarStorageKey) ?? undefined);
    localStorage.removeItem(avatarStorageKey);
    props.setSelectedChar(created);
    props.setIsEditing(true);
    setLocalEditingCharId(created.id);
    setName('');
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.selectedChar) return;
    const update = buildCharacterUpdate(new FormData(event.currentTarget), props.selectedChar.type);
    await props.onUpdateCharacter(props.selectedChar.id, update);
    props.setSelectedChar({ ...props.selectedChar, ...update }); props.setIsEditing(false); setLocalEditingCharId(null);
  };

  const savePlayer = async (update: Partial<CharacterEntity>) => {
    if (!props.selectedChar) return;
    await props.onUpdateCharacter(props.selectedChar.id, update);
    props.setSelectedChar({ ...props.selectedChar, ...update });
    props.setIsEditing(false);
    setLocalEditingCharId(null);
  };

  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
      if (!props.selectedChar) { localStorage.setItem(avatarStorageKey, reader.result); return; }
      await props.onUpdateCharacter(props.selectedChar.id, { avatar: reader.result });
      props.setSelectedChar({ ...props.selectedChar, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const close = () => { props.setSelectedChar(null); props.setIsEditing(false); setLocalEditingCharId(null); };
  const startEditing = () => {
    if (props.selectedChar) {
      setLocalEditingCharId(props.selectedChar.id);
    }
    props.setIsEditing(true);
  };

  return { activeType, displayedType, name, setName, searchTerm, setSearchTerm, characters, isEditing, changeType, selectCharacter, create, createWithName, save, savePlayer, uploadAvatar, close, startEditing };
}

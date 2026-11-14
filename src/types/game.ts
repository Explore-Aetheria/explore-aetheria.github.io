export type GameScreenState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'ENDING';

export type ActiveModal =
  | null
  | 'MAP'
  | 'INVENTORY'
  | 'CHARACTERS'
  | 'EQUIPMENT'
  | 'HOUSE'
  | 'QUESTS'
  | 'JOURNAL'
  | 'UPGRADES'
  | 'SETTINGS'
  | 'SHOP'
  | 'MINIGAME'
  | 'CREDITS';

export type RegionId =
  | 'brightfall'
  | 'whispering_woods'
  | 'sunset_coast'
  | 'frostpeak'
  | 'forgotten_kingdom'
  | 'ocean'
  | 'frozen_kingdom'
  | 'wild_jungle'
  | 'volcanic_island'
  | 'sky_island'
  | 'haunted_island'
  | 'lost_kingdom';

export type CharacterId =
  | 'explorer'
  | 'inventor'
  | 'mystic'
  | 'tidecaller'
  | 'mountaineer'
  | 'chronomancer'
  | 'pyromancer'
  | 'skywarden';

export type OutfitId = 'default' | 'festival' | 'starlight' | 'coastal' | 'alpine';

export type MiniGameId =
  | 'archery'
  | 'fishing'
  | 'rhythm'
  | 'timeslide'
  | 'runememory'
  | 'football'
  | 'basketball'
  | 'bicyclerace'
  | 'boatrace'
  | 'cooking';

export type GuardianId =
  | 'woodland_giant'
  | 'tidal_keeper'
  | 'frostbound_watcher'
  | 'last_remnant'
  | 'frost_empress'
  | 'jungle_titan'
  | 'magma_colossus'
  | 'sky_seraph'
  | 'phantom_duke'
  | 'eclipse_sovereign';

export type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'fog'
  | 'windy'
  | 'snow'
  | 'snowstorm';

export type TimePhase = 'sunrise' | 'morning' | 'afternoon' | 'sunset' | 'night';

export type EquipmentSlot = 'weapon' | 'accessory' | 'rod';

export interface EquipmentDef {
  id: string;
  name: string;
  slot: EquipmentSlot;
  weaponType?: 'sword' | 'bow' | 'hammer' | 'staff' | 'gadget' | 'accessory' | 'rod';
  tier: number;
  price: number;
  powerBonus: number;
  speedBonus: number;
  energyBonus: number;
  fishingBonus?: number;
  color: string;
  description: string;
  craftRecipe?: { itemId: string; quantity: number }[];
}

export interface FoodEffect {
  hunger: number;
  health: number;
  energy: number;
  buffName?: string;
  buffStat?: 'speed' | 'power' | 'regen';
  buffDuration?: number; // seconds
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  role: string;
  personality: string;
  description: string;
  unlockHint: string;
  startsUnlocked: boolean;
  baseSpeed: number;
  maxHealth: number;
  maxEnergy: number;
  abilityName: string;
  abilityDesc: string;
  abilityCost: number;
  abilityCooldown: number;
  passivePerk: string;
  palette: {
    hair: string;
    coat: string;
    trim: string;
    accent: string;
    skin: string;
    boots: string;
  };
  greetingQuip: string;
  voicePitch: number;
}

export interface InventoryItemDef {
  id: string;
  name: string;
  category:
    | 'collectible'
    | 'quest'
    | 'material'
    | 'accessory'
    | 'decor'
    | 'trophy'
    | 'food'
    | 'drink'
    | 'ingredient'
    | 'fish';
  description: string;
  iconColor: string;
  iconShape:
    | 'gem'
    | 'leaf'
    | 'gear'
    | 'pearl'
    | 'snowflake'
    | 'crown'
    | 'key'
    | 'flower'
    | 'compass'
    | 'scroll'
    | 'fish'
    | 'badge'
    | 'food'
    | 'drink';
  value: number;
  stackable: boolean;
  foodEffect?: FoodEffect;
}

export interface InventoryEntry {
  id: string;
  quantity: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'talk' | 'collect' | 'restore' | 'guardian' | 'discover' | 'minigame' | 'puzzle';
  targetId: string;
  required: number;
  current: number;
}

export interface QuestDef {
  id: string;
  title: string;
  category: 'main' | 'side' | 'exploration';
  region: RegionId;
  giverNpcId: string;
  summary: string;
  objectives: Omit<QuestObjective, 'current'>[];
  rewardXp: number;
  rewardSparks: number;
  rewardItems?: { id: string; quantity: number }[];
  restorationProjectId?: string;
  unlockCharacterId?: CharacterId;
  unlockOutfit?: OutfitId;
  prerequisiteQuestId?: string;
}

export interface ActiveQuestState {
  id: string;
  status: 'active' | 'completed';
  objectives: QuestObjective[];
}

export interface RestorationProjectDef {
  id: string;
  name: string;
  region: RegionId;
  description: string;
  visualEffect: string;
  sparksCost: number;
  requiredItem?: { id: string; quantity: number };
  requiredQuestId?: string;
  percentContribution: number;
}

export interface DialogueChoice {
  label: string;
  nextNodeId?: string;
  action?:
    | { type: 'START_QUEST'; questId: string }
    | { type: 'COMPLETE_QUEST'; questId: string }
    | { type: 'RESTORE_PROJECT'; projectId: string }
    | { type: 'OPEN_MINIGAME'; miniGameId: MiniGameId }
    | { type: 'OPEN_SHOP'; shopId?: string }
    | { type: 'OPEN_CHARACTERS' }
    | { type: 'OPEN_EQUIPMENT' }
    | { type: 'OPEN_HOUSE' }
    | { type: 'HEAL_PLAYER' }
    | { type: 'SLEEP_TIME'; targetHour: number }
    | { type: 'BOARD_BOAT' }
    | { type: 'UPGRADE_BOAT' }
    | { type: 'CHALLENGE_GUARDIAN'; guardianId: GuardianId }
    | { type: 'GIVE_ITEM'; itemId: string; quantity: number }
    | { type: 'CLOSE' };
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole: string;
  portraitKey: string;
  text: string;
  characterQuips?: Partial<Record<CharacterId, string>>;
  choices: DialogueChoice[];
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  region: RegionId;
  interiorId?: string;
  tileX: number;
  tileY: number;
  patrolRadius: number;
  palette: {
    hair: string;
    outfit: string;
    trim: string;
    skin: string;
  };
  voicePitch: number;
  requiresRestorationId?: string;
  questMarkerIds?: string[];
  activeHours?: [number, number]; // e.g., [6, 20]
}

export interface UpgradeNodeDef {
  id: 'speed' | 'energy' | 'recovery' | 'cooldown' | 'resonance';
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number[];
  bonusPerLevelLabel: string;
}

export interface LandmarkDef {
  id: string;
  name: string;
  region: RegionId;
  tileX: number;
  tileY: number;
  isFastTravel: boolean;
  isHarbour?: boolean;
  category?: 'town' | 'harbour' | 'activity' | 'guardian' | 'landmark' | 'fishing' | 'house';
  description: string;
}

export interface GuardianDef {
  id: GuardianId;
  name: string;
  title: string;
  region: RegionId;
  arenaX: number;
  arenaY: number;
  maxPurity: number;
  description: string;
  rewardText: string;
  unlockCharacterId?: CharacterId;
  restorationProjectId?: string;
}

export interface KeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  interact: string;
  ability: string;
  dash: string;
  attack: string;
  map: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  screenShake: boolean;
  keyBindings: KeyBindings;
}

export interface MapWaypoint {
  label: string;
  tileX: number;
  tileY: number;
  kind: 'quest' | 'custom' | 'landmark';
}

export interface HouseState {
  tier: number; // 1..3
  placedDecor: string[];
  wallColor: string;
  floorStyle: 'oak' | 'checker' | 'stone';
  storage: InventoryEntry[];
}

export interface PlayerHudSnapshot {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  hunger: number;
  maxHunger: number;
  abilityCooldownRemaining: number;
  abilityCooldownTotal: number;
  region: RegionId;
  regionName: string;
  interiorId: string | null;
  interiorName: string | null;
  playerX: number;
  playerY: number;
  facingAngle: number; // radians
  isSailing: boolean;
  isSwimming: boolean;
  weather: WeatherType;
  timeOfDay: number; // 0..24
  timePhase: TimePhase;
  activeBuff: string | null;
  interactPrompt: string | null;
  activeGuardian: {
    id: GuardianId;
    name: string;
    title: string;
    purity: number;
    maxPurity: number;
    phase: number;
    bannerText?: string;
  } | null;
}

export interface SaveData {
  version: number;
  savedAt: string;
  activeCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  characterOutfits: Record<CharacterId, OutfitId>;
  unlockedOutfits: OutfitId[];
  sparks: number;
  xp: number;
  level: number;
  hunger: number;
  timeOfDay: number; // 0..24
  weather: WeatherType;
  boatLevel: number; // 1..3
  boatPos: { x: number; y: number };
  equippedWeapon: string;
  equippedAccessory: string | null;
  equippedRod: string;
  ownedEquipment: string[];
  equipmentLevels: Record<string, number>;
  house: HouseState;
  playerPos: { x: number; y: number; interiorId: string | null };
  inventory: InventoryEntry[];
  quests: Record<string, ActiveQuestState>;
  completedRestorations: string[];
  discoveredLandmarks: string[];
  discoveredSecrets: string[];
  discoveredFish: string[];
  openedChests: string[];
  solvedPuzzles: string[];
  defeatedGuardians: GuardianId[];
  metNpcs: string[];
  upgrades: Record<UpgradeNodeDef['id'], number>;
  miniGameBestScores: Partial<Record<MiniGameId, number>>;
  achievements: string[];
  trackedQuestId: string | null;
  customWaypoint: MapWaypoint | null;
  activeShopId: string;
  endingSeen: boolean;
  settings: GameSettings;
}

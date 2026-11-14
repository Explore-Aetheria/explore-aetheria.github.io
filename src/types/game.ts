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
  | 'COMPANIONS'
  | 'EQUIPMENT'
  | 'HOUSE'
  | 'VILLAGE'
  | 'AIRSHIP'
  | 'EVENTS'
  | 'PHOTOS'
  | 'QUESTS'
  | 'JOURNAL'
  | 'UPGRADES'
  | 'SETTINGS'
  | 'SHOP'
  | 'MINIGAME'
  | 'HELP'
  | 'CREDITS';

export type CompanionId =
  | 'comp_fox'
  | 'comp_otter'
  | 'comp_golem'
  | 'comp_ember'
  | 'comp_owl'
  | 'comp_firefly';

export interface CompanionDef {
  id: CompanionId;
  name: string;
  species: string;
  title: string;
  description: string;
  perkSummary: string;
  unlockHint: string;
  price?: number;
  speedBonusPct: number;
  powerBonusPct: number;
  defenseBonusPct: number;
  fishingBonusPct: number;
  passiveHpRegen: number;
  passiveEnRegen: number;
  hasRadar: boolean;
  hasCombatAssist: boolean;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    eye: string;
  };
}

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
  | 'lost_kingdom'
  | 'newbrook'
  | 'amusement_park'
  | 'moving_island'
  | 'underground'
  | 'dim_mirror'
  | 'dim_verdant'
  | 'dim_void';

export type CharacterId =
  | 'explorer'
  | 'inventor'
  | 'mystic'
  | 'tidecaller'
  | 'mountaineer'
  | 'chronomancer'
  | 'pyromancer'
  | 'skywarden'
  | 'subterranean'
  | 'riftwalker';

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
  | 'cooking'
  | 'tennis'
  | 'swimming'
  | 'carnival';

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
  | 'eclipse_sovereign'
  | 'drift_leviathan'
  | 'rift_archon';

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

export type TimePhase =
  | 'sunrise'
  | 'early_morning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'sunset'
  | 'night'
  | 'midnight';

export type MonsterSize = 'small' | 'medium' | 'large' | 'colossal';

export type MonsterElement =
  | 'nature'
  | 'water'
  | 'fire'
  | 'ice'
  | 'shadow'
  | 'earth'
  | 'storm'
  | 'void'
  | 'light';

export type MonsterArchetype =
  | 'ambush_vine'
  | 'spore_burst'
  | 'charge_pinch'
  | 'tidal_lunge'
  | 'flame_cone'
  | 'lava_ring'
  | 'frost_barrier'
  | 'ice_volley'
  | 'shadow_blink'
  | 'umbral_split'
  | 'armored_shell'
  | 'quake_stomp'
  | 'storm_kite'
  | 'void_prism';

export type MonsterSpeciesId =
  | 'bramble_snapper'
  | 'spore_shroom'
  | 'reef_pincher'
  | 'tide_serpent'
  | 'magma_salamander'
  | 'cinder_colossus'
  | 'frost_wisp'
  | 'glacier_yeti'
  | 'shadow_stalker'
  | 'umbral_specter'
  | 'crag_beetle'
  | 'crystal_golem'
  | 'tempest_harpy'
  | 'void_construct';

export interface MonsterSpeciesDef {
  id: MonsterSpeciesId;
  name: string;
  size: MonsterSize;
  element: MonsterElement;
  archetype: MonsterArchetype;
  habitat: string;
  weakness: MonsterElement;
  resistance: MonsterElement;
  baseHp: number;
  speed: number;
  attackRange: number;
  damage: number;
  sparks: number;
  xp: number;
  nocturnalOnly?: boolean;
  texture: string;
  lore: string;
  abilityDesc: string;
}

export interface BestiaryEntry {
  seen: boolean;
  defeated: number;
}

export type TutorialStepId =
  | 'move'
  | 'talk_npc'
  | 'collect_or_attack'
  | 'use_ability'
  | 'open_map'
  | 'done';

export type DifficultyMode = 'explorer' | 'adventure' | 'heroic';

export type CityEventType =
  | 'none'
  | 'christmas'
  | 'music_festival'
  | 'food_festival'
  | 'sports_championship'
  | 'fireworks';

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'rod' | 'line' | 'bait' | 'hook';

export interface EquipmentDef {
  id: string;
  name: string;
  slot: EquipmentSlot;
  weaponType?: 'sword' | 'bow' | 'hammer' | 'staff' | 'gadget' | 'tool' | 'armor' | 'accessory' | 'rod' | 'tackle';
  tier: number;
  price: number;
  powerBonus: number;
  speedBonus: number;
  energyBonus: number;
  defenseBonus?: number;
  fishingBonus?: number;
  rarityBonus?: number;
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
  buffDuration?: number;
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
  type: 'talk' | 'collect' | 'restore' | 'guardian' | 'discover' | 'minigame' | 'puzzle' | 'photo' | 'village' | 'fish';
  targetId: string;
  required: number;
  current: number;
}

export interface QuestDef {
  id: string;
  title: string;
  category: 'main' | 'campaign' | 'side' | 'exploration';
  region: RegionId;
  campaignOrder?: number; // 1..20 for island campaigns
  giverNpcId: string;
  locationHint?: string;
  exactLocation?: string;
  whyText?: string;
  timeRequirementText?: string;
  hintText?: string;
  postCompletionText?: string;
  waypointTile?: { x: number; y: number };
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
    | { type: 'OPEN_VILLAGE' }
    | { type: 'OPEN_AIRSHIP' }
    | { type: 'OPEN_EVENTS' }
    | { type: 'HEAL_PLAYER' }
    | { type: 'SLEEP_TIME'; targetHour: number }
    | { type: 'BOARD_BOAT' }
    | { type: 'BOARD_AIRSHIP' }
    | { type: 'UPGRADE_BOAT' }
    | { type: 'ENTER_ZONE'; interiorId: string }
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
  activeHours?: [number, number];
  scheduleNote?: string;
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
  isSkyport?: boolean;
  category?: 'town' | 'harbour' | 'skyport' | 'activity' | 'guardian' | 'landmark' | 'fishing' | 'house' | 'dungeon' | 'underground' | 'portal';
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
  requiredCampaignCount?: number;
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
  difficulty: DifficultyMode;
  showTutorialPrompts: boolean;
  keyBindings: KeyBindings;
}

export interface MapWaypoint {
  label: string;
  tileX: number;
  tileY: number;
  kind: 'quest' | 'custom' | 'landmark';
}

export interface HouseState {
  tier: number; // 1..4
  placedDecor: string[];
  wallColor: string;
  floorStyle: 'oak' | 'checker' | 'stone';
  storage: InventoryEntry[];
  invitedNpcs: string[];
}

export interface BoatUpgradeState {
  speedLevel: number; // 1..3
  hullLevel: number; // 1..3
  handlingLevel: number; // 1..3
  cargoLevel: number; // 1..3
  skin: 'skiff' | 'schooner' | 'galleon';
}

export interface AirshipState {
  unlocked: boolean;
  speedLevel: number; // 1..3
  altitudeLevel: number; // 1..3
  hullColor: 'gold' | 'azure' | 'crimson';
  pos: { x: number; y: number };
}

export interface VillageState {
  discovered: boolean;
  buildings: string[]; // 'house_1', 'bakery', 'workshop', 'garden', 'bridge', 'town_hall', 'house_2', 'observatory'
  residents: string[];
}

export interface PhotoEntry {
  id: string;
  subjectId: string;
  title: string;
  region: RegionId;
  takenAt: string;
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
  facingAngle: number;
  isSailing: boolean;
  isFlying: boolean;
  isSwimming: boolean;
  weather: WeatherType;
  timeOfDay: number;
  timePhase: TimePhase;
  cityEvent: CityEventType;
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
  activeCompanion: CompanionId | null;
  unlockedCompanions: CompanionId[];
  characterOutfits: Record<CharacterId, OutfitId>;
  unlockedOutfits: OutfitId[];
  sparks: number;
  xp: number;
  level: number;
  hunger: number;
  timeOfDay: number;
  weather: WeatherType;
  cityEvent: CityEventType;
  movingIslandSlot: number; // 0..3
  movingIslandFound: boolean;
  boatLevel: number; // legacy overall tier 1..3
  boatUpgrades: BoatUpgradeState;
  boatPos: { x: number; y: number };
  airship: AirshipState;
  village: VillageState;
  equippedWeapon: string;
  equippedArmor: string | null;
  equippedAccessory: string | null;
  equippedRod: string;
  equippedLine: string;
  equippedBait: string;
  equippedHook: string;
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
  fishRecords: Record<string, number>; // fishId -> best weight/pts
  photos: PhotoEntry[];
  openedChests: string[];
  solvedPuzzles: string[];
  defeatedGuardians: GuardianId[];
  metNpcs: string[];
  upgrades: Record<UpgradeNodeDef['id'], number>;
  miniGameBestScores: Partial<Record<MiniGameId, number>>;
  miniGameLeaderboards: Partial<Record<MiniGameId, { name: string; score: number }[]>>;
  achievements: string[];
  trackedQuestId: string | null;
  customWaypoint: MapWaypoint | null;
  activeShopId: string;
  endingSeen: boolean;
  tutorialStep: TutorialStepId;
  tutorialCompleted: boolean;
  bestiary: Record<string, BestiaryEntry>;
  npcFriendship: Record<string, number>;
  collectedClues: string[];
  settings: GameSettings;
}

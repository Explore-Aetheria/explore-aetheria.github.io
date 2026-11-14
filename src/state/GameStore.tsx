import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS } from '../data/characters';
import { COMPANIONS } from '../data/companions';
import { COOKING_RECIPES, EQUIPMENT_CATALOG, FISH_SPECIES } from '../data/equipmentAndFood';
import { NPCS } from '../data/npcs';
import { GUARDIANS, INVENTORY_CATALOG, LANDMARKS, MAIN_OFFSET_X, MAIN_OFFSET_Y } from '../data/progression';
import { QUESTS, RESTORATION_PROJECTS } from '../data/quests';
import { gameBridge } from '../game/GameBridge';
import {
  ActiveModal,
  AirshipState,
  BoatUpgradeState,
  CharacterId,
  CityEventType,
  CompanionId,
  DifficultyMode,
  GameScreenState,
  GameSettings,
  GuardianId,
  HouseState,
  MapWaypoint,
  MiniGameId,
  MonsterSpeciesId,
  OutfitId,
  PlayerHudSnapshot,
  RegionId,
  SaveData,
  TutorialStepId,
  UpgradeNodeDef,
  WeatherType,
} from '../types/game';
import { MONSTER_SPECIES } from '../data/monsters';

const STORAGE_KEY = 'bounce_back_save_v1';

const ISLAND_LANDMARK_IDS = [
  'lm_island_frozen',
  'lm_island_jungle',
  'lm_island_volcanic',
  'lm_island_sky',
  'lm_island_haunted',
  'lm_island_lost',
];

export const VILLAGE_BUILDINGS_CATALOG: {
  id: string;
  name: string;
  cost: number;
  residentName: string;
  description: string;
}[] = [
  {
    id: 'house_1',
    name: 'Timber Frontier Cottage',
    cost: 45,
    residentName: 'Carpenter Jude',
    description: 'Warm timber cottage anchoring Newbrook’s residential lane.',
  },
  {
    id: 'bakery',
    name: 'Newbrook Hearth Bakery',
    cost: 60,
    residentName: 'Baker Nina',
    description: 'Bakes fresh village loaves and supplies settlers with warm pastries.',
  },
  {
    id: 'workshop',
    name: 'Artisan Gear Workshop',
    cost: 70,
    residentName: 'Artisan Cole',
    description: 'Smithy & carpentry workshop keeping Newbrook’s tools sharp.',
  },
  {
    id: 'garden',
    name: 'Sunpetal Village Park & Fountain',
    cost: 55,
    residentName: 'Botanist Wren',
    description: 'Blooming garden square with a luminous spring fountain.',
  },
  {
    id: 'bridge',
    name: 'Riverfoot Timber Bridge',
    cost: 50,
    residentName: 'Trail Scout Pip',
    description: 'Connects Newbrook across the valley toward Brightfall’s northern road.',
  },
  {
    id: 'town_hall',
    name: 'Newbrook Village Hall',
    cost: 90,
    residentName: 'Clerk Rowan',
    description: 'Civic hall organizing town charters, festivals, and trade routes.',
  },
  {
    id: 'house_2',
    name: 'Lakeside Settler Villa',
    cost: 80,
    residentName: 'Settler Maya',
    description: 'Two-story stone & timber residence welcoming new families.',
  },
  {
    id: 'observatory',
    name: 'Newbrook Sky Observatory',
    cost: 120,
    residentName: 'Astronomer Sol',
    description: 'Golden domed observatory charting Aetheria’s stars and drifting islands.',
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.45,
  sfxVolume: 0.65,
  muted: false,
  screenShake: true,
  difficulty: 'adventure',
  showTutorialPrompts: true,
  keyBindings: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    interact: 'KeyE',
    ability: 'KeyQ',
    dash: 'Space',
    attack: 'KeyF',
    map: 'KeyM',
  },
};

export function createNewSave(settingsOverride?: GameSettings): SaveData {
  return {
    version: 3,
    savedAt: new Date().toISOString(),
    activeCharacter: 'explorer',
    unlockedCharacters: ['explorer', 'inventor', 'mystic'],
    activeCompanion: 'comp_fox',
    unlockedCompanions: ['comp_fox'],
    characterOutfits: {
      explorer: 'default',
      inventor: 'default',
      mystic: 'default',
      tidecaller: 'default',
      mountaineer: 'default',
      chronomancer: 'default',
      pyromancer: 'default',
      skywarden: 'default',
      subterranean: 'default',
      riftwalker: 'default',
    },
    unlockedOutfits: ['default'],
    sparks: 60,
    xp: 0,
    level: 1,
    hunger: 100,
    timeOfDay: 9.0,
    weather: 'sunny',
    cityEvent: 'christmas',
    movingIslandSlot: 0,
    movingIslandFound: false,
    boatLevel: 1,
    boatUpgrades: {
      speedLevel: 1,
      hullLevel: 1,
      handlingLevel: 1,
      cargoLevel: 1,
      skin: 'skiff',
    },
    boatPos: { x: (MAIN_OFFSET_X + 66) * 32 + 16, y: (MAIN_OFFSET_Y + 97) * 32 + 16 },
    airship: {
      unlocked: false,
      speedLevel: 1,
      altitudeLevel: 1,
      hullColor: 'gold',
      pos: { x: (MAIN_OFFSET_X + 76) * 32 + 16, y: (MAIN_OFFSET_Y + 37) * 32 + 16 },
    },
    village: {
      discovered: false,
      buildings: [],
      residents: [],
    },
    equippedWeapon: 'eq_traveler_wand',
    equippedArmor: null,
    equippedAccessory: null,
    equippedRod: 'rod_bamboo',
    equippedLine: 'line_hemp',
    equippedBait: 'bait_crumb',
    equippedHook: 'hook_iron',
    ownedEquipment: ['eq_traveler_wand', 'rod_bamboo', 'line_hemp', 'bait_crumb', 'hook_iron'],
    equipmentLevels: { eq_traveler_wand: 1, rod_bamboo: 1, line_hemp: 1, bait_crumb: 1, hook_iron: 1 },
    house: {
      tier: 1,
      placedDecor: [],
      wallColor: '#4c3e73',
      floorStyle: 'oak',
      storage: [],
      invitedNpcs: [],
    },
    playerPos: { x: (MAIN_OFFSET_X + 54) * 32 + 16, y: (MAIN_OFFSET_Y + 59) * 32 + 16, interiorId: null },
    inventory: [
      { id: 'sun_berry', quantity: 3 },
      { id: 'food_apple', quantity: 2 },
    ],
    quests: {},
    completedRestorations: [],
    discoveredLandmarks: ['lm_brightfall_square', 'lm_player_house'],
    discoveredSecrets: [],
    discoveredFish: [],
    fishRecords: {},
    photos: [],
    openedChests: [],
    solvedPuzzles: [],
    defeatedGuardians: [],
    metNpcs: [],
    upgrades: {
      speed: 0,
      energy: 0,
      recovery: 0,
      cooldown: 0,
      resonance: 0,
    },
    miniGameBestScores: {},
    miniGameLeaderboards: {},
    achievements: [],
    trackedQuestId: null,
    customWaypoint: null,
    activeShopId: 'market',
    endingSeen: false,
    tutorialStep: 'move',
    tutorialCompleted: false,
    bestiary: {},
    npcFriendship: {},
    collectedClues: [],
    settings: settingsOverride ?? DEFAULT_SETTINGS,
  };
}

function loadSaveFromStorage(): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (!parsed || typeof parsed.version !== 'number') return null;

    const base = createNewSave();
    let playerPos = parsed.playerPos ?? base.playerPos;
    let boatPos = parsed.boatPos ?? base.boatPos;

    // Seamless backward-compatible v1/v2 -> v3 coordinate migration onto 360x270 map
    if (parsed.version < 2 && playerPos && playerPos.interiorId === null) {
      playerPos = {
        x: playerPos.x + MAIN_OFFSET_X * 32,
        y: playerPos.y + MAIN_OFFSET_Y * 32,
        interiorId: null,
      };
    } else if (parsed.version === 2 && playerPos && playerPos.interiorId === null) {
      // Map v2 coordinates cleanly onto expanded Brightfall Plaza if inside mainland
      playerPos = base.playerPos;
      boatPos = base.boatPos;
    }

    const parsedBoatLvl = parsed.boatLevel ?? 1;
    const migrated: SaveData = {
      ...base,
      ...parsed,
      version: 3,
      playerPos,
      boatPos,
      boatUpgrades: {
        speedLevel: parsed.boatUpgrades?.speedLevel ?? parsedBoatLvl,
        hullLevel: parsed.boatUpgrades?.hullLevel ?? parsedBoatLvl,
        handlingLevel: parsed.boatUpgrades?.handlingLevel ?? parsedBoatLvl,
        cargoLevel: parsed.boatUpgrades?.cargoLevel ?? parsedBoatLvl,
        skin: parsed.boatUpgrades?.skin ?? (parsedBoatLvl >= 3 ? 'galleon' : parsedBoatLvl === 2 ? 'schooner' : 'skiff'),
      },
      airship: {
        ...base.airship,
        ...(parsed.airship ?? {}),
        unlocked:
          Boolean(parsed.airship?.unlocked) ||
          Boolean(parsed.completedRestorations?.includes('rest_brightfall_railway')),
      },
      village: {
        ...base.village,
        ...(parsed.village ?? {}),
      },
      characterOutfits: {
        ...base.characterOutfits,
        ...(parsed.characterOutfits ?? {}),
      },
      house: {
        ...base.house,
        ...(parsed.house ?? {}),
        invitedNpcs: parsed.house?.invitedNpcs ?? [],
      },
      upgrades: {
        ...base.upgrades,
        ...(parsed.upgrades ?? {}),
      },
      discoveredLandmarks: Array.from(
        new Set([...(parsed.discoveredLandmarks ?? []), 'lm_brightfall_square', 'lm_player_house'])
      ),
      ownedEquipment: Array.from(
        new Set([...(parsed.ownedEquipment ?? []), 'eq_traveler_wand', 'rod_bamboo', 'line_hemp', 'bait_crumb', 'hook_iron'])
      ),
      equipmentLevels: {
        ...base.equipmentLevels,
        ...(parsed.equipmentLevels ?? {}),
      },
      fishRecords: parsed.fishRecords ?? {},
      photos: parsed.photos ?? [],
      activeCompanion: parsed.activeCompanion !== undefined ? parsed.activeCompanion : 'comp_fox',
      unlockedCompanions: Array.from(new Set(['comp_fox', ...(parsed.unlockedCompanions ?? [])])) as CompanionId[],
      miniGameLeaderboards: parsed.miniGameLeaderboards ?? {},
      tutorialStep: parsed.tutorialStep ?? (parsed.metNpcs && parsed.metNpcs.length > 0 ? 'done' : 'move'),
      tutorialCompleted: parsed.tutorialCompleted ?? Boolean(parsed.metNpcs && parsed.metNpcs.length > 0),
      bestiary: parsed.bestiary ?? {},
      npcFriendship: parsed.npcFriendship ?? {},
      collectedClues: parsed.collectedClues ?? [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
        difficulty: parsed.settings?.difficulty ?? 'adventure',
        showTutorialPrompts: parsed.settings?.showTutorialPrompts ?? true,
        keyBindings: {
          ...DEFAULT_SETTINGS.keyBindings,
          ...(parsed.settings?.keyBindings ?? {}),
        },
      },
    };
    return migrated;
  } catch {
    return null;
  }
}

export interface ToastItem {
  id: number;
  text: string;
}

interface GameContextValue {
  screen: GameScreenState;
  setScreen: (s: GameScreenState) => void;
  activeModal: ActiveModal;
  setActiveModal: (m: ActiveModal) => void;
  activeDialogueNpcId: string | null;
  setActiveDialogueNpcId: (npcId: string | null) => void;
  activeMiniGame: MiniGameId | null;
  openMiniGame: (id: MiniGameId) => void;
  closeMiniGame: () => void;
  save: SaveData;
  hasExistingSave: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  hud: PlayerHudSnapshot;
  toasts: ToastItem[];
  pushToast: (text: string) => void;
  selectCharacter: (id: CharacterId) => void;
  setCharacterOutfit: (charId: CharacterId, outfit: OutfitId) => void;
  selectCompanion: (id: CompanionId | null) => void;
  adoptCompanion: (id: CompanionId) => boolean;
  startQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  completeRestoration: (projectId: string) => boolean;
  buyUpgrade: (upgradeId: UpgradeNodeDef['id']) => boolean;
  buyShopItem: (itemId: string, price: number) => boolean;
  sellInventoryItem: (itemId: string, qty?: number) => boolean;
  consumeBerryHeal: () => boolean;
  eatFoodItem: (itemId: string) => boolean;
  cookRecipe: (recipeId: string) => boolean;
  craftOrBuyEquipment: (eqId: string, mode: 'buy' | 'craft') => boolean;
  upgradeEquipment: (eqId: string) => boolean;
  equipItem: (eqId: string) => void;
  upgradeBoat: () => boolean;
  upgradeBoatPart: (part: keyof Omit<BoatUpgradeState, 'skin'>, cost: number, skin?: BoatUpgradeState['skin']) => boolean;
  upgradeAirship: (part: 'speedLevel' | 'altitudeLevel' | 'hullColor', cost: number, hullColor?: AirshipState['hullColor']) => boolean;
  buildVillageStructure: (buildingId: string) => boolean;
  setCityEvent: (event: CityEventType) => void;
  inviteNpcToHouse: (npcId: string) => void;
  setDifficulty: (mode: DifficultyMode) => void;
  sleepUntil: (targetHour: number) => void;
  upgradeHouse: () => boolean;
  toggleHouseDecor: (itemId: string) => void;
  updateHouseStyle: (wallColor: string, floorStyle: HouseState['floorStyle']) => void;
  storeItemInHouse: (itemId: string) => void;
  takeItemFromHouse: (itemId: string) => void;
  setTrackedQuest: (questId: string | null) => void;
  setCustomWaypoint: (wp: MapWaypoint | null) => void;
  getWaypointTarget: () => MapWaypoint | null;
  recordFishCaught: (fishId: string, points: number) => void;
  setWeatherOverride: (w: WeatherType) => void;
  recordMiniGameScore: (miniGameId: MiniGameId, score: number) => void;
  fastTravel: (landmarkId: string) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  manualSave: () => void;
  advanceTutorial: (stepCompleted: TutorialStepId) => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
  collectMailboxClue: () => void;
  getRegionRestorationPercent: (region: RegionId) => number;
  getTotalRestorationPercent: () => number;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialStored = useMemo(() => loadSaveFromStorage(), []);
  const [hasExistingSave, setHasExistingSave] = useState<boolean>(!!initialStored);
  const [save, setSave] = useState<SaveData>(() => {
    const s = initialStored ?? createNewSave();
    gameBridge.setLatestSave(s);
    return s;
  });
  const saveRef = useRef(save);
  saveRef.current = save;

  const [screen, setScreenState] = useState<GameScreenState>('TITLE_MENU');
  const [activeModal, setActiveModalState] = useState<ActiveModal>(null);
  const [activeDialogueNpcId, setActiveDialogueNpcIdState] = useState<string | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameId | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [hud, setHud] = useState<PlayerHudSnapshot>({
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    hunger: save.hunger,
    maxHunger: 100,
    abilityCooldownRemaining: 0,
    abilityCooldownTotal: 6,
    region: 'brightfall',
    regionName: 'Brightfall City',
    interiorId: null,
    interiorName: null,
    playerX: save.playerPos.x,
    playerY: save.playerPos.y,
    facingAngle: Math.PI / 2,
    isSailing: false,
    isFlying: false,
    isSwimming: false,
    weather: save.weather,
    timeOfDay: save.timeOfDay,
    timePhase: 'morning',
    cityEvent: save.cityEvent,
    activeBuff: null,
    interactPrompt: null,
    activeGuardian: null,
  });

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const persistSave = useCallback((next: SaveData) => {
    try {
      const stamped = { ...next, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
      setHasExistingSave(true);
    } catch {
      // ignore storage quota
    }
  }, []);

  const updateSave = useCallback(
    (updater: (prev: SaveData) => SaveData) => {
      setSave((prev) => {
        const next = updater(prev);
        gameBridge.setLatestSave(next);
        persistSave(next);
        return next;
      });
    },
    [persistSave]
  );

  useEffect(() => {
    soundEngine.setSettings(save.settings.musicVolume, save.settings.sfxVolume, save.settings.muted);
    const ratio = save.completedRestorations.length / Object.keys(RESTORATION_PROJECTS).length;
    soundEngine.setRestorationBoost(ratio);
    gameBridge.setLatestSave(save);
  }, [save]);

  useEffect(() => {
    if (screen === 'TITLE_MENU') {
      soundEngine.playMusic('title');
    } else if (screen === 'ENDING') {
      soundEngine.playMusic('ending');
    } else if (activeMiniGame) {
      soundEngine.playMusic('minigame');
    } else if (hud.activeGuardian) {
      soundEngine.playMusic('guardian');
    } else if (hud.region === 'brightfall' && save.cityEvent === 'christmas') {
      soundEngine.playMusic('christmas');
    } else {
      soundEngine.playMusic(hud.region);
    }
  }, [screen, activeMiniGame, hud.activeGuardian, hud.region, save.cityEvent]);

  // Periodically drift the Mysterious Moving Island while undiscovered
  useEffect(() => {
    if (screen !== 'PLAYING' || save.movingIslandFound) return;
    const timer = window.setInterval(() => {
      updateSave((prev) => {
        if (prev.movingIslandFound) return prev;
        return { ...prev, movingIslandSlot: (prev.movingIslandSlot + 1) % 4 };
      });
    }, 110000);
    return () => window.clearInterval(timer);
  }, [screen, save.movingIslandFound, updateSave]);

  const setScreen = useCallback((s: GameScreenState) => {
    setScreenState(s);
    gameBridge.setPaused(s !== 'PLAYING');
  }, []);

  const TUTORIAL_ORDER: TutorialStepId[] = ['move', 'talk_npc', 'collect_or_attack', 'use_ability', 'open_map', 'done'];

  const advanceTutorial = useCallback(
    (stepCompleted: TutorialStepId) => {
      updateSave((prev) => {
        if (prev.tutorialCompleted || prev.tutorialStep !== stepCompleted) return prev;
        const idx = TUTORIAL_ORDER.indexOf(stepCompleted);
        const nextStep = TUTORIAL_ORDER[Math.min(TUTORIAL_ORDER.length - 1, idx + 1)];
        const isDone = nextStep === 'done';
        soundEngine.playTutorialStep();
        if (isDone) {
          pushToast('Guided Tutorial Complete! +25 Luminos Sparks earned.');
        }
        return {
          ...prev,
          tutorialStep: nextStep,
          tutorialCompleted: isDone,
          sparks: isDone ? prev.sparks + 25 : prev.sparks,
        };
      });
    },
    [pushToast, updateSave]
  );

  const skipTutorial = useCallback(() => {
    soundEngine.playUiClick();
    updateSave((prev) => ({
      ...prev,
      tutorialStep: 'done',
      tutorialCompleted: true,
    }));
    pushToast('Tutorial skipped — press [?] anytime for the Help & Controls Guide.');
  }, [pushToast, updateSave]);

  const replayTutorial = useCallback(() => {
    soundEngine.playUiClick();
    updateSave((prev) => ({
      ...prev,
      tutorialStep: 'move',
      tutorialCompleted: false,
      settings: { ...prev.settings, showTutorialPrompts: true },
    }));
    setActiveModalState(null);
    gameBridge.setPaused(false);
    pushToast('Guided Tutorial restarted!');
  }, [pushToast, updateSave]);

  const MAILBOX_LETTERS: { id: string; msg: string; sparks: number }[] = [
    {
      id: 'clue_nyx_cart',
      msg: 'Postcard from Nyx: "My Lantern Cart sets up in Brightfall Square from 19:00 to 05:00 — bring your rod south for Moonlight Lantern Eels!" (+15 Sparks)',
      sparks: 15,
    },
    {
      id: 'clue_woods_cache',
      msg: 'Scout Note from Mossbrook: "Glowing crystal spires in Whispering Woods point toward an old timber chest west of the river bridge." (+15 Sparks)',
      sparks: 15,
    },
    {
      id: 'clue_skyport_rail',
      msg: 'Dispatch from Conductor Bram: "Once Central Railway & Skyport are restored, the Brightfall Express departs hourly and Airship launches from the East Deck!" (+15 Sparks)',
      sparks: 15,
    },
  ];

  const collectMailboxClue = useCallback(() => {
    soundEngine.playCollect();
    const cur = saveRef.current;
    const nextUncollected = MAILBOX_LETTERS.find((l) => !(cur.collectedClues ?? []).includes(l.id));
    if (nextUncollected) {
      updateSave((prev) => ({
        ...prev,
        collectedClues: [...(prev.collectedClues ?? []), nextUncollected.id],
        sparks: prev.sparks + nextUncollected.sparks,
      }));
      pushToast(nextUncollected.msg);
    } else {
      const idx = Math.floor(Math.random() * MAILBOX_LETTERS.length);
      pushToast(`Homestead Mailbox: ${MAILBOX_LETTERS[idx].msg.replace(' (+15 Sparks)', '')}`);
    }
  }, [pushToast, updateSave]);

  const setActiveModal = useCallback(
    (m: ActiveModal) => {
      setActiveModalState(m);
      const shouldPause = m !== null || activeDialogueNpcId !== null;
      gameBridge.setPaused(shouldPause);
      if (m === 'MAP') {
        advanceTutorial('open_map');
      }
    },
    [activeDialogueNpcId, advanceTutorial]
  );

  const setActiveDialogueNpcId = useCallback(
    (npcId: string | null) => {
      setActiveDialogueNpcIdState(npcId);
      gameBridge.setPaused(npcId !== null || activeModal !== null);
    },
    [activeModal]
  );

  const openMiniGame = useCallback((id: MiniGameId) => {
    setActiveDialogueNpcIdState(null);
    setActiveMiniGame(id);
    setActiveModalState('MINIGAME');
    gameBridge.setPaused(true);
  }, []);

  const closeMiniGame = useCallback(() => {
    setActiveMiniGame(null);
    setActiveModalState(null);
    gameBridge.setPaused(false);
  }, []);

  const addItemToSave = (s: SaveData, itemId: string, qty: number): SaveData => {
    const existing = s.inventory.find((i) => i.id === itemId);
    const nextInv = existing
      ? s.inventory.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + qty } : i))
      : [...s.inventory, { id: itemId, quantity: qty }];
    return { ...s, inventory: nextInv };
  };

  const removeItemFromSave = (s: SaveData, itemId: string, qty: number): SaveData => {
    const nextInv = s.inventory
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - qty } : i))
      .filter((i) => i.quantity > 0);
    return { ...s, inventory: nextInv };
  };

  const applyXpAndLevel = (s: SaveData, gainXp: number): SaveData => {
    let xp = s.xp + gainXp;
    let level = s.level;
    while (xp >= level * 100) {
      xp -= level * 100;
      level += 1;
      pushToast(`Level Up! Reached Adventurer Level ${level}`);
      soundEngine.playRestoreFanfare();
    }
    return { ...s, xp, level };
  };

  const syncCollectObjectives = (s: SaveData): SaveData => {
    const nextQuests = { ...s.quests };
    let changed = false;
    Object.keys(nextQuests).forEach((qId) => {
      const qState = nextQuests[qId];
      if (qState.status !== 'active') return;
      const updatedObjs = qState.objectives.map((obj) => {
        let nextVal = obj.current;
        if (obj.type === 'collect') {
          const qty = s.inventory.find((i) => i.id === obj.targetId)?.quantity ?? 0;
          nextVal = Math.min(obj.required, qty);
        } else if (obj.type === 'restore') {
          nextVal = s.completedRestorations.includes(obj.targetId) ? 1 : 0;
        } else if (obj.type === 'discover') {
          nextVal = s.discoveredLandmarks.includes(obj.targetId) ? 1 : 0;
        } else if (obj.type === 'guardian') {
          nextVal = s.defeatedGuardians.includes(obj.targetId as GuardianId) ? 1 : 0;
        } else if (obj.type === 'talk') {
          nextVal = s.metNpcs.includes(obj.targetId) ? obj.required : obj.current;
        } else if (obj.type === 'puzzle') {
          nextVal = s.solvedPuzzles.includes(obj.targetId) ? 1 : 0;
        } else if (obj.type === 'fish') {
          nextVal =
            obj.targetId === 'any_fish'
              ? Math.min(obj.required, s.discoveredFish.length)
              : s.discoveredFish.includes(obj.targetId)
                ? 1
                : 0;
        } else if (obj.type === 'photo') {
          const count =
            obj.targetId === 'any_giant'
              ? s.photos.length
              : s.photos.filter((p) => p.subjectId === obj.targetId).length;
          nextVal = Math.min(obj.required, count);
        } else if (obj.type === 'village') {
          nextVal = Math.min(obj.required, s.village.buildings.length);
        } else if (obj.type === 'minigame') {
          nextVal = (s.miniGameBestScores[obj.targetId as MiniGameId] ?? 0) > 0 ? obj.required : obj.current;
        }
        if (nextVal !== obj.current) changed = true;
        return { ...obj, current: nextVal };
      });
      nextQuests[qId] = { ...qState, objectives: updatedObjs };
    });
    return changed ? { ...s, quests: nextQuests } : s;
  };

  const startQuest = useCallback(
    (questId: string) => {
      const def = QUESTS[questId];
      if (!def) return;
      updateSave((prev) => {
        if (prev.quests[questId]) return prev;
        const next: SaveData = {
          ...prev,
          trackedQuestId: prev.trackedQuestId ?? questId,
          quests: {
            ...prev.quests,
            [questId]: {
              id: questId,
              status: 'active',
              objectives: def.objectives.map((o) => ({ ...o, current: 0 })),
            },
          },
        };
        return syncCollectObjectives(next);
      });
      pushToast(`Quest Accepted: ${def.title}`);
    },
    [pushToast, updateSave]
  );

  const completeQuest = useCallback(
    (questId: string) => {
      const def = QUESTS[questId];
      if (!def) return;
      updateSave((prev) => {
        const existing = prev.quests[questId];
        if (existing?.status === 'completed') return prev;
        let next: SaveData = {
          ...prev,
          sparks: prev.sparks + def.rewardSparks,
          trackedQuestId: prev.trackedQuestId === questId ? null : prev.trackedQuestId,
          npcFriendship: {
            ...(prev.npcFriendship ?? {}),
            [def.giverNpcId]: ((prev.npcFriendship ?? {})[def.giverNpcId] ?? 0) + 2,
          },
          quests: {
            ...prev.quests,
            [questId]: {
              id: questId,
              status: 'completed',
              objectives: def.objectives.map((o) => ({ ...o, current: o.required })),
            },
          },
        };
        def.rewardItems?.forEach((ri) => {
          next = addItemToSave(next, ri.id, ri.quantity);
        });
        if (def.unlockCharacterId && !next.unlockedCharacters.includes(def.unlockCharacterId)) {
          next = {
            ...next,
            unlockedCharacters: [...next.unlockedCharacters, def.unlockCharacterId],
          };
          pushToast(`New Playable Character Unlocked: ${CHARACTERS[def.unlockCharacterId].name}!`);
        }
        if (def.unlockOutfit && !next.unlockedOutfits.includes(def.unlockOutfit)) {
          next = {
            ...next,
            unlockedOutfits: [...next.unlockedOutfits, def.unlockOutfit],
          };
          pushToast(`New Outfit Unlocked!`);
        }
        if (next.unlockedCharacters.length >= 10 && !next.achievements.includes('ach_full_party')) {
          next = { ...next, achievements: [...next.achievements, 'ach_full_party'] };
        }
        next = applyXpAndLevel(next, def.rewardXp);
        return syncCollectObjectives(next);
      });
      soundEngine.playRestoreFanfare();
      pushToast(`Quest Completed: ${def.title} (+${def.rewardSparks} Sparks)`);
    },
    [pushToast, updateSave]
  );

  const completeRestoration = useCallback(
    (projectId: string): boolean => {
      const proj = RESTORATION_PROJECTS[projectId];
      if (!proj) return false;
      const current = saveRef.current;
      if (current.completedRestorations.includes(projectId)) return true;
      if (current.sparks < proj.sparksCost) {
        pushToast(`Need ${proj.sparksCost} Luminos Sparks (have ${current.sparks}).`);
        return false;
      }
      if (proj.requiredItem) {
        const have = current.inventory.find((i) => i.id === proj.requiredItem!.id)?.quantity ?? 0;
        if (have < proj.requiredItem.quantity) {
          const itemDef = INVENTORY_CATALOG[proj.requiredItem.id];
          pushToast(`Need ${proj.requiredItem.quantity}x ${itemDef?.name ?? proj.requiredItem.id}.`);
          return false;
        }
      }

      updateSave((prev) => {
        let next: SaveData = {
          ...prev,
          sparks: prev.sparks - proj.sparksCost,
          completedRestorations: [...prev.completedRestorations, projectId],
        };
        if (proj.requiredItem) {
          next = removeItemFromSave(next, proj.requiredItem.id, proj.requiredItem.quantity);
        }
        if (projectId === 'rest_brightfall_garden' && !next.unlockedOutfits.includes('festival')) {
          next = { ...next, unlockedOutfits: [...next.unlockedOutfits, 'festival'] };
        }
        if (projectId === 'rest_brightfall_cafe' && !next.achievements.includes('ach_cafe_open')) {
          next = { ...next, achievements: [...next.achievements, 'ach_cafe_open'] };
        }
        if (projectId === 'rest_amusement_park' && !next.achievements.includes('ach_park_revival')) {
          next = { ...next, achievements: [...next.achievements, 'ach_park_revival'] };
        }
        if (projectId === 'rest_brightfall_railway') {
          next = { ...next, airship: { ...next.airship, unlocked: true } };
          if (!next.achievements.includes('ach_sky_captain')) {
            next = { ...next, achievements: [...next.achievements, 'ach_sky_captain'] };
          }
          pushToast('Grand Skyport & Flying Airship Unlocked! Press [V] outdoors to fly!');
        }
        next = applyXpAndLevel(next, 90);
        next = syncCollectObjectives(next);
        return next;
      });

      soundEngine.playRestoreFanfare();
      pushToast(`World Restored: ${proj.name}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  // Register callbacks for Phaser scene
  useEffect(() => {
    gameBridge.registerCallbacks({
      onHudUpdate: (nextHud) => setHud(nextHud),
      onTalkNpc: (npcId) => {
        soundEngine.unlock();
        updateSave((prev) => {
          let next: SaveData = {
            ...prev,
            npcFriendship: {
              ...(prev.npcFriendship ?? {}),
              [npcId]: ((prev.npcFriendship ?? {})[npcId] ?? 0) + 1,
            },
          };
          if (!prev.metNpcs.includes(npcId)) {
            next = { ...next, metNpcs: [...next.metNpcs, npcId] };
          }
          if (npcId === 'npc_mayor_theo' && !next.achievements.includes('ach_first_step')) {
            next = { ...next, achievements: [...next.achievements, 'ach_first_step'] };
          }
          const nextQuests = { ...next.quests };
          Object.keys(nextQuests).forEach((qId) => {
            const qs = nextQuests[qId];
            if (qs.status === 'active') {
              nextQuests[qId] = {
                ...qs,
                objectives: qs.objectives.map((o) =>
                  o.type === 'talk' && o.targetId === npcId ? { ...o, current: o.required } : o
                ),
              };
            }
          });
          return { ...next, quests: nextQuests };
        });
        advanceTutorial('talk_npc');
        setActiveDialogueNpcId(npcId);
      },
      onOpenNoticeboard: () => setActiveModal('QUESTS'),
      onOpenFastTravel: () => setActiveModal('MAP'),
      onOpenMiniGame: (mgId) => openMiniGame(mgId),
      onOpenShop: (shopId) => {
        updateSave((prev) => ({ ...prev, activeShopId: shopId }));
        setActiveModal('SHOP');
      },
      onOpenEquipment: () => setActiveModal('EQUIPMENT'),
      onOpenHouse: () => setActiveModal('HOUSE'),
      onOpenVillage: () => setActiveModal('VILLAGE'),
      onOpenAirship: () => setActiveModal('AIRSHIP'),
      onOpenEvents: () => setActiveModal('EVENTS'),
      onOpenHelp: () => setActiveModal('HELP'),
      onInspectMailbox: () => collectMailboxClue(),
      onCollectItem: (_colId, itemId, qty) => {
        soundEngine.playCollect();
        updateSave((prev) => {
          let next = addItemToSave(prev, itemId, qty);
          next = { ...next, sparks: next.sparks + 8 };
          if (itemId === 'volcanic_ore' && !next.unlockedCompanions.includes('comp_ember')) {
            next = { ...next, unlockedCompanions: [...next.unlockedCompanions, 'comp_ember'], activeCompanion: 'comp_ember' };
            pushToast('Companion Unlocked: Flicker the Ember Sprite!');
          }
          if (itemId === 'lumina_gem' && !next.unlockedCompanions.includes('comp_golem')) {
            next = { ...next, unlockedCompanions: [...next.unlockedCompanions, 'comp_golem'], activeCompanion: 'comp_golem' };
            pushToast('Companion Unlocked: Cobble the Pebble Golem Pup!');
          }
          next = applyXpAndLevel(next, 15);
          next = syncCollectObjectives(next);
          return next;
        });
        advanceTutorial('collect_or_attack');
        const itemDef = INVENTORY_CATALOG[itemId];
        pushToast(`Collected ${qty}x ${itemDef?.name ?? itemId}`);
      },
      onOpenChest: (chestId, sparks, items) => {
        soundEngine.playChest();
        updateSave((prev) => {
          if (prev.openedChests.includes(chestId)) return prev;
          let next: SaveData = {
            ...prev,
            sparks: prev.sparks + sparks,
            openedChests: [...prev.openedChests, chestId],
          };
          items.forEach((it) => {
            next = addItemToSave(next, it.id, it.quantity);
          });
          next = applyXpAndLevel(next, 35);
          next = syncCollectObjectives(next);
          return next;
        });
        const label = items.map((i) => `${i.quantity}x ${INVENTORY_CATALOG[i.id]?.name ?? i.id}`).join(', ');
        pushToast(`Chest Opened! +${sparks} Sparks${label ? ` & ${label}` : ''}`);
      },
      onDiscoverLandmark: (landmarkId) => {
        const lm = LANDMARKS.find((l) => l.id === landmarkId);
        updateSave((prev) => {
          if (prev.discoveredLandmarks.includes(landmarkId)) return prev;
          const nextDisc = [...prev.discoveredLandmarks, landmarkId];
          let next: SaveData = {
            ...prev,
            discoveredLandmarks: nextDisc,
            sparks: prev.sparks + 15,
            village:
              landmarkId === 'lm_newbrook_village'
                ? { ...prev.village, discovered: true }
                : prev.village,
          };
          const islandsFound = ISLAND_LANDMARK_IDS.filter((id) => nextDisc.includes(id)).length;
          if (islandsFound >= 3 && !next.achievements.includes('ach_sea_captain')) {
            next = { ...next, achievements: [...next.achievements, 'ach_sea_captain'] };
          }
          if (islandsFound >= 6 && !next.achievements.includes('ach_all_islands')) {
            next = { ...next, achievements: [...next.achievements, 'ach_all_islands'] };
          }
          if (nextDisc.length >= 6 && !next.unlockedCompanions.includes('comp_owl')) {
            next = { ...next, unlockedCompanions: [...next.unlockedCompanions, 'comp_owl'] };
            pushToast('Companion Unlocked: Hootie the Zephyr Owl!');
          }
          next = applyXpAndLevel(next, 30);
          next = syncCollectObjectives(next);
          return next;
        });
        if (lm) pushToast(`Discovered: ${lm.name}`);
      },
      onDiscoverSecret: (secretId, message, sparks) => {
        soundEngine.playChest();
        updateSave((prev) => {
          if (prev.discoveredSecrets.includes(secretId)) return prev;
          const nextSecrets = [...prev.discoveredSecrets, secretId];
          let next: SaveData = {
            ...prev,
            discoveredSecrets: nextSecrets,
            sparks: prev.sparks + sparks,
          };
          if (nextSecrets.length >= 3 && !next.achievements.includes('ach_secret_finder')) {
            next = { ...next, achievements: [...next.achievements, 'ach_secret_finder'] };
          }
          next = applyXpAndLevel(next, 45);
          return next;
        });
        pushToast(message);
      },
      onSolvePuzzle: (puzzleId, message, sparks) => {
        soundEngine.playRestoreFanfare();
        updateSave((prev) => {
          if (prev.solvedPuzzles.includes(puzzleId)) return prev;
          let next: SaveData = {
            ...prev,
            solvedPuzzles: [...prev.solvedPuzzles, puzzleId],
            sparks: prev.sparks + sparks,
          };
          next = applyXpAndLevel(next, 50);
          next = syncCollectObjectives(next);
          return next;
        });
        pushToast(message);
      },
      onPhotoCaptured: (subjectId, title, region) => {
        soundEngine.playShutter();
        updateSave((prev) => {
          const already = prev.photos.some((p) => p.subjectId === subjectId);
          const nextPhotos = already
            ? prev.photos
            : [
                ...prev.photos,
                {
                  id: `photo_${subjectId}_${Date.now()}`,
                  subjectId,
                  title,
                  region,
                  takenAt: new Date().toISOString(),
                },
              ];
          let next: SaveData = {
            ...prev,
            sparks: prev.sparks + (already ? 10 : 35),
            photos: nextPhotos,
          };
          if (!next.achievements.includes('ach_photographer')) {
            next = { ...next, achievements: [...next.achievements, 'ach_photographer'] };
          }
          next = applyXpAndLevel(next, already ? 15 : 45);
          next = syncCollectObjectives(next);
          return next;
        });
        pushToast(`Snapped Photo: ${title}!`);
      },
      onMovingIslandFound: () => {
        soundEngine.playRestoreFanfare();
        updateSave((prev) => {
          if (prev.movingIslandFound) return prev;
          let next: SaveData = {
            ...prev,
            movingIslandFound: true,
            sparks: prev.sparks + 75,
            discoveredLandmarks: prev.discoveredLandmarks.includes('lm_moving_island')
              ? prev.discoveredLandmarks
              : [...prev.discoveredLandmarks, 'lm_moving_island'],
          };
          next = applyXpAndLevel(next, 80);
          next = syncCollectObjectives(next);
          return next;
        });
        pushToast('Discovered Driftspire Isle — The Mysterious Moving Island!');
      },
      onPlayerDamaged: () => {
        soundEngine.playHit();
      },
      onMonsterSeen: (speciesId: MonsterSpeciesId) => {
        updateSave((prev) => {
          const cur = prev.bestiary?.[speciesId];
          if (cur?.seen) return prev;
          const sp = MONSTER_SPECIES[speciesId];
          if (sp) {
            pushToast(`Bestiary Discovered: ${sp.name} (${sp.element} · ${sp.size})`);
          }
          return {
            ...prev,
            bestiary: {
              ...(prev.bestiary ?? {}),
              [speciesId]: { seen: true, defeated: cur?.defeated ?? 0 },
            },
          };
        });
      },
      onDefeatEnemy: (sparks, xp, speciesId) => {
        soundEngine.playCollect();
        updateSave((prev) => {
          let next = applyXpAndLevel({ ...prev, sparks: prev.sparks + sparks }, xp);
          if (speciesId) {
            const cur = prev.bestiary?.[speciesId];
            next = {
              ...next,
              bestiary: {
                ...(prev.bestiary ?? {}),
                [speciesId]: { seen: true, defeated: (cur?.defeated ?? 0) + 1 },
              },
            };
          }
          return next;
        });
        advanceTutorial('collect_or_attack');
      },
      onTutorialEvent: (step: TutorialStepId) => {
        advanceTutorial(step);
      },
      onGuardianPurified: (guardianId) => {
        const gDef = GUARDIANS[guardianId];
        soundEngine.playRestoreFanfare();
        updateSave((prev) => {
          let next: SaveData = {
            ...prev,
            defeatedGuardians: prev.defeatedGuardians.includes(guardianId)
              ? prev.defeatedGuardians
              : [...prev.defeatedGuardians, guardianId],
            sparks: prev.sparks + 120,
          };
          if (gDef.restorationProjectId && !next.completedRestorations.includes(gDef.restorationProjectId)) {
            next = {
              ...next,
              completedRestorations: [...next.completedRestorations, gDef.restorationProjectId],
            };
          }
          if (gDef.unlockCharacterId && !next.unlockedCharacters.includes(gDef.unlockCharacterId)) {
            next = {
              ...next,
              unlockedCharacters: [...next.unlockedCharacters, gDef.unlockCharacterId],
            };
            pushToast(`New Companion Joined: ${CHARACTERS[gDef.unlockCharacterId].name}!`);
          }

          const crestMap: Partial<Record<GuardianId, string>> = {
            woodland_giant: 'forest_crest',
            tidal_keeper: 'tidal_crest',
            frostbound_watcher: 'frost_crest',
            last_remnant: 'dawn_crown',
            frost_empress: 'crest_frozen_empress',
            jungle_titan: 'crest_jungle_titan',
            magma_colossus: 'crest_volcanic',
            sky_seraph: 'crest_sky',
            phantom_duke: 'crest_haunted',
            eclipse_sovereign: 'crest_lost_kingdom',
            drift_leviathan: 'crest_moving_island',
            rift_archon: 'crest_rift_archon',
          };
          const crestId = crestMap[guardianId];
          if (crestId) next = addItemToSave(next, crestId, 1);

          if (guardianId === 'woodland_giant' && !next.achievements.includes('ach_woodland_hero')) {
            next = { ...next, achievements: [...next.achievements, 'ach_woodland_hero'] };
          } else if (guardianId === 'tidal_keeper') {
            if (!next.unlockedCharacters.includes('tidecaller')) {
              next = { ...next, unlockedCharacters: [...next.unlockedCharacters, 'tidecaller'] };
            }
            if (!next.unlockedOutfits.includes('coastal')) {
              next = { ...next, unlockedOutfits: [...next.unlockedOutfits, 'coastal'] };
            }
            if (!next.achievements.includes('ach_tidal_hero')) {
              next = { ...next, achievements: [...next.achievements, 'ach_tidal_hero'] };
            }
          } else if (guardianId === 'frostbound_watcher' && !next.achievements.includes('ach_frost_hero')) {
            next = { ...next, achievements: [...next.achievements, 'ach_frost_hero'] };
          } else if (guardianId === 'frost_empress' && !next.unlockedOutfits.includes('alpine')) {
            next = { ...next, unlockedOutfits: [...next.unlockedOutfits, 'alpine'] };
          } else if (guardianId === 'last_remnant') {
            if (!next.unlockedOutfits.includes('starlight')) {
              next = { ...next, unlockedOutfits: [...next.unlockedOutfits, 'starlight'] };
            }
            if (!next.achievements.includes('ach_bounce_back')) {
              next = { ...next, achievements: [...next.achievements, 'ach_bounce_back'] };
            }
          }
          if (next.unlockedCharacters.length >= 10 && !next.achievements.includes('ach_full_party')) {
            next = { ...next, achievements: [...next.achievements, 'ach_full_party'] };
          }
          if (next.defeatedGuardians.length >= 2 && !next.unlockedCompanions.includes('comp_firefly')) {
            next = { ...next, unlockedCompanions: [...next.unlockedCompanions, 'comp_firefly'] };
            pushToast('Companion Unlocked: Luma the Lumina Firefly!');
          }

          next = applyXpAndLevel(next, 180);
          next = syncCollectObjectives(next);
          return next;
        });

        pushToast(`${gDef.name}, ${gDef.title} Purified!`);
        if (guardianId === 'last_remnant' && !saveRef.current.endingSeen) {
          window.setTimeout(() => {
            setScreenState('ENDING');
            gameBridge.setPaused(true);
            updateSave((p) => ({ ...p, endingSeen: true }));
          }, 1600);
        }
      },
      onPlayerMoved: (x, y, interiorId) => {
        setSave((prev) => {
          const next = { ...prev, playerPos: { x, y, interiorId } };
          persistSave(next);
          return next;
        });
      },
      onBoatMoved: (x, y) => {
        setSave((prev) => {
          const next = { ...prev, boatPos: { x, y } };
          persistSave(next);
          return next;
        });
      },
      onAirshipMoved: (x, y) => {
        setSave((prev) => {
          const next = { ...prev, airship: { ...prev.airship, pos: { x, y } } };
          persistSave(next);
          return next;
        });
      },
      onTimeChanged: (hour) => {
        setSave((prev) => {
          const next = { ...prev, timeOfDay: hour };
          persistSave(next);
          return next;
        });
      },
      onWeatherChanged: (weather) => {
        setSave((prev) => {
          const next = { ...prev, weather };
          persistSave(next);
          return next;
        });
      },
      onHungerChanged: (hunger) => {
        setSave((prev) => {
          const next = { ...prev, hunger };
          persistSave(next);
          return next;
        });
      },
      onShowToast: (text) => pushToast(text),
    });
  }, [openMiniGame, persistSave, pushToast, setActiveDialogueNpcId, setActiveModal, updateSave]);

  const startNewGame = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playUiClick();
    const fresh = createNewSave(saveRef.current.settings);
    setSave(fresh);
    persistSave(fresh);
    gameBridge.setLatestSave(fresh);
    setActiveModalState(null);
    setActiveDialogueNpcIdState(null);
    setScreen('PLAYING');
    pushToast('Welcome to Brightfall City! Celebrate the Festival & speak with Mayor Theo!');
  }, [persistSave, pushToast, setScreen]);

  const continueGame = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playUiClick();
    gameBridge.setLatestSave(saveRef.current);
    setActiveModalState(null);
    setActiveDialogueNpcIdState(null);
    setScreen('PLAYING');
  }, [setScreen]);

  const selectCharacter = useCallback(
    (id: CharacterId) => {
      if (!saveRef.current.unlockedCharacters.includes(id)) return;
      soundEngine.playUiClick();
      updateSave((prev) => ({ ...prev, activeCharacter: id }));
      pushToast(`Switched to ${CHARACTERS[id].name} (${CHARACTERS[id].title})`);
    },
    [pushToast, updateSave]
  );

  const setCharacterOutfit = useCallback(
    (charId: CharacterId, outfit: OutfitId) => {
      if (!saveRef.current.unlockedOutfits.includes(outfit)) return;
      soundEngine.playUiClick();
      updateSave((prev) => ({
        ...prev,
        characterOutfits: { ...prev.characterOutfits, [charId]: outfit },
      }));
    },
    [updateSave]
  );

  const selectCompanion = useCallback(
    (id: CompanionId | null) => {
      if (id && !saveRef.current.unlockedCompanions.includes(id)) return;
      soundEngine.playUiClick();
      updateSave((prev) => ({ ...prev, activeCompanion: id }));
      if (id) pushToast(`${COMPANIONS[id].name} (${COMPANIONS[id].species}) is now following you!`);
      else pushToast('Companion dismissed to rest at Homestead.');
    },
    [pushToast, updateSave]
  );

  const adoptCompanion = useCallback(
    (id: CompanionId): boolean => {
      const def = COMPANIONS[id];
      const cur = saveRef.current;
      if (cur.unlockedCompanions.includes(id)) return true;
      const cost = def.price ?? 100;
      if (cur.sparks < cost) {
        pushToast(`Need ${cost} Sparks to adopt ${def.name} (${def.species}).`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({
        ...prev,
        sparks: prev.sparks - cost,
        unlockedCompanions: [...prev.unlockedCompanions, id],
        activeCompanion: id,
      }));
      pushToast(`Adopted ${def.name} the ${def.species}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const buyUpgrade = useCallback(
    (upgradeId: UpgradeNodeDef['id']): boolean => {
      const currentLvl = saveRef.current.upgrades[upgradeId];
      const costs: Record<UpgradeNodeDef['id'], number[]> = {
        speed: [35, 65, 100, 150],
        energy: [30, 60, 95, 140],
        recovery: [40, 75, 115, 165],
        cooldown: [45, 80, 120, 175],
        resonance: [40, 75, 115, 170],
      };
      const costList = costs[upgradeId];
      if (currentLvl >= costList.length) return false;
      const cost = costList[currentLvl];
      if (saveRef.current.sparks < cost) {
        pushToast(`Need ${cost} Sparks for this upgrade.`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({
        ...prev,
        sparks: prev.sparks - cost,
        upgrades: { ...prev.upgrades, [upgradeId]: prev.upgrades[upgradeId] + 1 },
      }));
      pushToast(`Upgrade unlocked!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const buyShopItem = useCallback(
    (itemId: string, price: number): boolean => {
      if (saveRef.current.sparks < price) {
        pushToast(`Not enough Luminos Sparks!`);
        return false;
      }
      soundEngine.playCollect();
      updateSave((prev) => {
        let next = addItemToSave({ ...prev, sparks: prev.sparks - price }, itemId, 1);
        next = syncCollectObjectives(next);
        return next;
      });
      pushToast(`Purchased ${INVENTORY_CATALOG[itemId]?.name ?? itemId}`);
      return true;
    },
    [pushToast, updateSave]
  );

  const sellInventoryItem = useCallback(
    (itemId: string, qty = 1): boolean => {
      const def = INVENTORY_CATALOG[itemId];
      const owned = saveRef.current.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
      if (!def || owned < qty) return false;
      if (def.category === 'trophy' || def.category === 'quest') {
        pushToast('Quest keepsakes and trophies cannot be sold.');
        return false;
      }
      const cargoBonus = 1 + ((saveRef.current.boatUpgrades?.cargoLevel ?? 1) - 1) * 0.1;
      const sellValue = Math.max(4, Math.floor((def.value || 10) * 0.8 * cargoBonus)) * qty;
      soundEngine.playCollect();
      updateSave((prev) => {
        let next = removeItemFromSave(prev, itemId, qty);
        next = { ...next, sparks: next.sparks + sellValue };
        return next;
      });
      pushToast(`Sold ${qty}x ${def.name} (+${sellValue} Sparks)`);
      return true;
    },
    [pushToast, updateSave]
  );

  const eatFoodItem = useCallback(
    (itemId: string): boolean => {
      const def = INVENTORY_CATALOG[itemId];
      const qty = saveRef.current.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
      if (!def?.foodEffect || qty <= 0) {
        pushToast(`No ${def?.name ?? itemId} in your satchel!`);
        return false;
      }
      soundEngine.playCollect();
      const effect = def.foodEffect;
      updateSave((prev) => {
        let next = removeItemFromSave(prev, itemId, 1);
        next = { ...next, hunger: Math.min(100, prev.hunger + effect.hunger) };
        return next;
      });
      gameBridge.applyFoodEffect(effect);
      pushToast(
        `Ate ${def.name}! +${effect.hunger} Hunger${effect.buffName ? ` · ${effect.buffName} active!` : ''}`
      );
      return true;
    },
    [pushToast, updateSave]
  );

  const consumeBerryHeal = useCallback((): boolean => {
    return eatFoodItem('sun_berry');
  }, [eatFoodItem]);

  const cookRecipe = useCallback(
    (recipeId: string): boolean => {
      const rec = COOKING_RECIPES.find((r) => r.id === recipeId);
      if (!rec) return false;
      const cur = saveRef.current;
      for (const ing of rec.ingredients) {
        const have = cur.inventory.find((i) => i.id === ing.itemId)?.quantity ?? 0;
        if (have < ing.quantity) {
          pushToast(`Missing ${INVENTORY_CATALOG[ing.itemId]?.name ?? ing.itemId}.`);
          return false;
        }
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => {
        let next = prev;
        rec.ingredients.forEach((ing) => {
          next = removeItemFromSave(next, ing.itemId, ing.quantity);
        });
        next = addItemToSave(next, rec.outputItemId, 1);
        next = applyXpAndLevel(next, 25);
        next = syncCollectObjectives(next);
        return next;
      });
      pushToast(`Cooked ${rec.name}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const craftOrBuyEquipment = useCallback(
    (eqId: string, mode: 'buy' | 'craft'): boolean => {
      const eq = EQUIPMENT_CATALOG[eqId];
      if (!eq) return false;
      const cur = saveRef.current;
      if (cur.ownedEquipment.includes(eqId)) {
        pushToast(`${eq.name} is already owned!`);
        return false;
      }
      if (mode === 'buy') {
        if (cur.sparks < eq.price) {
          pushToast(`Need ${eq.price} Sparks for ${eq.name}.`);
          return false;
        }
      } else if (eq.craftRecipe) {
        for (const req of eq.craftRecipe) {
          const have = cur.inventory.find((i) => i.id === req.itemId)?.quantity ?? 0;
          if (have < req.quantity) {
            pushToast(`Missing ${req.quantity}x ${INVENTORY_CATALOG[req.itemId]?.name ?? req.itemId}.`);
            return false;
          }
        }
      } else {
        return false;
      }

      soundEngine.playRestoreFanfare();
      updateSave((prev) => {
        let next: SaveData = { ...prev };
        if (mode === 'buy') {
          next.sparks -= eq.price;
        } else if (eq.craftRecipe) {
          eq.craftRecipe.forEach((req) => {
            next = removeItemFromSave(next, req.itemId, req.quantity);
          });
        }
        next.ownedEquipment = [...next.ownedEquipment, eqId];
        next.equipmentLevels = { ...next.equipmentLevels, [eqId]: 1 };
        if (eq.slot === 'weapon') next.equippedWeapon = eqId;
        else if (eq.slot === 'armor') next.equippedArmor = eqId;
        else if (eq.slot === 'accessory') next.equippedAccessory = eqId;
        else if (eq.slot === 'rod') next.equippedRod = eqId;
        else if (eq.slot === 'line') next.equippedLine = eqId;
        else if (eq.slot === 'bait') next.equippedBait = eqId;
        else if (eq.slot === 'hook') next.equippedHook = eqId;
        next = applyXpAndLevel(next, 35);
        return next;
      });
      pushToast(`Acquired & equipped ${eq.name}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const upgradeEquipment = useCallback(
    (eqId: string): boolean => {
      const eq = EQUIPMENT_CATALOG[eqId];
      if (!eq) return false;
      const curLvl = saveRef.current.equipmentLevels[eqId] ?? 1;
      if (curLvl >= 3) return false;
      const cost = 45 * curLvl;
      if (saveRef.current.sparks < cost) {
        pushToast(`Need ${cost} Sparks to upgrade ${eq.name}.`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({
        ...prev,
        sparks: prev.sparks - cost,
        equipmentLevels: { ...prev.equipmentLevels, [eqId]: curLvl + 1 },
      }));
      pushToast(`Upgraded ${eq.name} to Lv.${curLvl + 1}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const equipItem = useCallback(
    (eqId: string) => {
      const eq = EQUIPMENT_CATALOG[eqId];
      if (!eq || !saveRef.current.ownedEquipment.includes(eqId)) return;
      soundEngine.playUiClick();
      updateSave((prev) => ({
        ...prev,
        equippedWeapon: eq.slot === 'weapon' ? eqId : prev.equippedWeapon,
        equippedArmor: eq.slot === 'armor' ? eqId : prev.equippedArmor,
        equippedAccessory: eq.slot === 'accessory' ? eqId : prev.equippedAccessory,
        equippedRod: eq.slot === 'rod' ? eqId : prev.equippedRod,
        equippedLine: eq.slot === 'line' ? eqId : prev.equippedLine,
        equippedBait: eq.slot === 'bait' ? eqId : prev.equippedBait,
        equippedHook: eq.slot === 'hook' ? eqId : prev.equippedHook,
      }));
      pushToast(`Equipped ${eq.name}`);
    },
    [pushToast, updateSave]
  );

  const upgradeBoat = useCallback((): boolean => {
    const cur = saveRef.current.boatLevel;
    if (cur >= 3) {
      pushToast('Your vessel is already at Tier 3!');
      return false;
    }
    const cost = cur === 1 ? 80 : 150;
    if (saveRef.current.sparks < cost) {
      pushToast(`Need ${cost} Sparks to upgrade your boat!`);
      return false;
    }
    soundEngine.playRestoreFanfare();
    updateSave((prev) => {
      const nextLvl = cur + 1;
      return {
        ...prev,
        sparks: prev.sparks - cost,
        boatLevel: nextLvl,
        boatUpgrades: {
          ...prev.boatUpgrades,
          speedLevel: Math.max(prev.boatUpgrades.speedLevel, nextLvl),
          hullLevel: Math.max(prev.boatUpgrades.hullLevel, nextLvl),
          handlingLevel: Math.max(prev.boatUpgrades.handlingLevel, nextLvl),
          skin: nextLvl >= 3 ? 'galleon' : nextLvl === 2 ? 'schooner' : 'skiff',
        },
      };
    });
    pushToast(`Boat upgraded to Tier ${cur + 1}! Faster sailing & sturdier hull.`);
    return true;
  }, [pushToast, updateSave]);

  const upgradeBoatPart = useCallback(
    (part: keyof Omit<BoatUpgradeState, 'skin'>, cost: number, skin?: BoatUpgradeState['skin']): boolean => {
      const cur = saveRef.current;
      if (skin) {
        if (cur.sparks < cost) {
          pushToast(`Need ${cost} Sparks to repaint vessel.`);
          return false;
        }
        soundEngine.playRestoreFanfare();
        updateSave((prev) => ({
          ...prev,
          sparks: prev.sparks - cost,
          boatUpgrades: { ...prev.boatUpgrades, skin },
        }));
        pushToast(`Vessel refitted as ${skin.toUpperCase()}!`);
        return true;
      }
      const curVal = cur.boatUpgrades[part];
      if (curVal >= 3) return false;
      if (cur.sparks < cost) {
        pushToast(`Need ${cost} Sparks for this boat upgrade.`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => {
        const nextUp = { ...prev.boatUpgrades, [part]: curVal + 1 };
        const avg = Math.round((nextUp.speedLevel + nextUp.hullLevel + nextUp.handlingLevel) / 3);
        return {
          ...prev,
          sparks: prev.sparks - cost,
          boatLevel: Math.max(prev.boatLevel, avg),
          boatUpgrades: nextUp,
        };
      });
      pushToast(`Vessel ${part.replace('Level', '')} upgraded to Lv.${curVal + 1}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const upgradeAirship = useCallback(
    (part: 'speedLevel' | 'altitudeLevel' | 'hullColor', cost: number, hullColor?: AirshipState['hullColor']): boolean => {
      const cur = saveRef.current;
      if (!cur.airship.unlocked) {
        pushToast('Restore Brightfall Central Railway & Skyport first!');
        return false;
      }
      if (part === 'hullColor' && hullColor) {
        if (cur.sparks < cost) {
          pushToast(`Need ${cost} Sparks to customize Airship hull.`);
          return false;
        }
        soundEngine.playRestoreFanfare();
        updateSave((prev) => ({
          ...prev,
          sparks: prev.sparks - cost,
          airship: { ...prev.airship, hullColor },
        }));
        pushToast(`Skywing Airship repainted ${hullColor}!`);
        return true;
      }
      const val = cur.airship[part] as number;
      if (val >= 3) return false;
      if (cur.sparks < cost) {
        pushToast(`Need ${cost} Sparks for this Airship upgrade.`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({
        ...prev,
        sparks: prev.sparks - cost,
        airship: { ...prev.airship, [part]: val + 1 },
      }));
      pushToast(`Airship upgraded to Lv.${val + 1}!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const buildVillageStructure = useCallback(
    (buildingId: string): boolean => {
      const def = VILLAGE_BUILDINGS_CATALOG.find((b) => b.id === buildingId);
      if (!def) return false;
      const cur = saveRef.current;
      if (cur.village.buildings.includes(buildingId)) return true;
      if (cur.sparks < def.cost) {
        pushToast(`Need ${def.cost} Sparks to build ${def.name}.`);
        return false;
      }
      soundEngine.playRestoreFanfare();
      updateSave((prev) => {
        const nextBuildings = [...prev.village.buildings, buildingId];
        const nextResidents = prev.village.residents.includes(def.residentName)
          ? prev.village.residents
          : [...prev.village.residents, def.residentName];
        let next: SaveData = {
          ...prev,
          sparks: prev.sparks - def.cost,
          village: {
            discovered: true,
            buildings: nextBuildings,
            residents: nextResidents,
          },
          completedRestorations:
            nextBuildings.length >= 4 && !prev.completedRestorations.includes('rest_newbrook_village')
              ? [...prev.completedRestorations, 'rest_newbrook_village']
              : prev.completedRestorations,
        };
        if (nextBuildings.length >= 4 && !next.achievements.includes('ach_village_founder')) {
          next = { ...next, achievements: [...next.achievements, 'ach_village_founder'] };
        }
        next = applyXpAndLevel(next, 60);
        next = syncCollectObjectives(next);
        return next;
      });
      pushToast(`Constructed ${def.name}! ${def.residentName} moved into Newbrook!`);
      return true;
    },
    [pushToast, updateSave]
  );

  const setCityEvent = useCallback(
    (event: CityEventType) => {
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({ ...prev, cityEvent: event }));
      const labelMap: Record<CityEventType, string> = {
        none: 'Peaceful Season',
        christmas: 'Christmas in Brightfall',
        music_festival: 'Harmony Music Festival',
        food_festival: 'Golden Skillet Food Fair',
        sports_championship: 'Aetheria Olympic Games',
        fireworks: 'Starlight Fireworks Gala',
      };
      pushToast(`City Event Set: ${labelMap[event]}!`);
    },
    [pushToast, updateSave]
  );

  const inviteNpcToHouse = useCallback(
    (npcId: string) => {
      soundEngine.playUiClick();
      updateSave((prev) => {
        const invited = prev.house.invitedNpcs.includes(npcId)
          ? prev.house.invitedNpcs.filter((id) => id !== npcId)
          : [...prev.house.invitedNpcs, npcId];
        return { ...prev, house: { ...prev.house, invitedNpcs: invited } };
      });
    },
    [updateSave]
  );

  const setDifficulty = useCallback(
    (difficulty: DifficultyMode) => {
      soundEngine.playUiClick();
      updateSave((prev) => ({ ...prev, settings: { ...prev.settings, difficulty } }));
      pushToast(`Difficulty mode set to ${difficulty.toUpperCase()}.`);
    },
    [pushToast, updateSave]
  );

  const sleepUntil = useCallback(
    (targetHour: number) => {
      soundEngine.playRestoreFanfare();
      updateSave((prev) => ({
        ...prev,
        timeOfDay: targetHour,
        hunger: Math.max(prev.hunger, 85),
      }));
      gameBridge.setTimeOfDay(targetHour);
      gameBridge.healPlayer();
      pushToast(`Rested warmly until ${String(Math.floor(targetHour)).padStart(2, '0')}:00! Full HP & Energy restored.`);
    },
    [pushToast, updateSave]
  );

  const upgradeHouse = useCallback((): boolean => {
    const curTier = saveRef.current.house.tier;
    if (curTier >= 4) return false;
    const cost = curTier === 1 ? 90 : curTier === 2 ? 180 : 280;
    if (saveRef.current.sparks < cost) {
      pushToast(`Need ${cost} Sparks to expand your Homestead.`);
      return false;
    }
    soundEngine.playRestoreFanfare();
    updateSave((prev) => {
      let next: SaveData = {
        ...prev,
        sparks: prev.sparks - cost,
        house: { ...prev.house, tier: curTier + 1 },
      };
      if (!next.achievements.includes('ach_homeowner')) {
        next = { ...next, achievements: [...next.achievements, 'ach_homeowner'] };
      }
      return next;
    });
    pushToast(`Homestead upgraded to Tier ${curTier + 1}!`);
    return true;
  }, [pushToast, updateSave]);

  const toggleHouseDecor = useCallback(
    (itemId: string) => {
      soundEngine.playUiClick();
      updateSave((prev) => {
        const placed = prev.house.placedDecor.includes(itemId)
          ? prev.house.placedDecor.filter((d) => d !== itemId)
          : [...prev.house.placedDecor, itemId];
        let next: SaveData = {
          ...prev,
          house: { ...prev.house, placedDecor: placed },
        };
        if (placed.length > 0 && !next.achievements.includes('ach_homeowner')) {
          next = { ...next, achievements: [...next.achievements, 'ach_homeowner'] };
        }
        return next;
      });
    },
    [updateSave]
  );

  const updateHouseStyle = useCallback(
    (wallColor: string, floorStyle: HouseState['floorStyle']) => {
      soundEngine.playUiClick();
      updateSave((prev) => ({
        ...prev,
        house: { ...prev.house, wallColor, floorStyle },
      }));
      pushToast('Homestead interior updated!');
    },
    [pushToast, updateSave]
  );

  const storeItemInHouse = useCallback(
    (itemId: string) => {
      const owned = saveRef.current.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
      if (owned <= 0) return;
      soundEngine.playUiClick();
      updateSave((prev) => {
        const next = removeItemFromSave(prev, itemId, 1);
        const existing = next.house.storage.find((s) => s.id === itemId);
        const storage = existing
          ? next.house.storage.map((s) => (s.id === itemId ? { ...s, quantity: s.quantity + 1 } : s))
          : [...next.house.storage, { id: itemId, quantity: 1 }];
        return { ...next, house: { ...next.house, storage } };
      });
    },
    [updateSave]
  );

  const takeItemFromHouse = useCallback(
    (itemId: string) => {
      const stored = saveRef.current.house.storage.find((i) => i.id === itemId)?.quantity ?? 0;
      if (stored <= 0) return;
      soundEngine.playUiClick();
      updateSave((prev) => {
        const storage = prev.house.storage
          .map((s) => (s.id === itemId ? { ...s, quantity: s.quantity - 1 } : s))
          .filter((s) => s.quantity > 0);
        const next = addItemToSave({ ...prev, house: { ...prev.house, storage } }, itemId, 1);
        return syncCollectObjectives(next);
      });
    },
    [updateSave]
  );

  const setTrackedQuest = useCallback(
    (questId: string | null) => {
      soundEngine.playUiClick();
      updateSave((prev) => ({ ...prev, trackedQuestId: questId }));
    },
    [updateSave]
  );

  const setCustomWaypoint = useCallback(
    (wp: MapWaypoint | null) => {
      soundEngine.playUiClick();
      updateSave((prev) => ({ ...prev, customWaypoint: wp }));
      if (wp) pushToast(`Map Pin placed: ${wp.label}`);
      else pushToast('Custom Map Pin cleared.');
    },
    [pushToast, updateSave]
  );

  const getWaypointTarget = useCallback((): MapWaypoint | null => {
    if (save.customWaypoint) return save.customWaypoint;

    const activeQ =
      (save.trackedQuestId && save.quests[save.trackedQuestId]?.status === 'active'
        ? save.quests[save.trackedQuestId]
        : Object.values(save.quests).find((q) => q.status === 'active')) ?? null;

    if (!activeQ) {
      if (!save.metNpcs.includes('npc_mayor_theo')) {
        const theo = NPCS.find((n) => n.id === 'npc_mayor_theo');
        if (theo) return { label: 'Speak with Mayor Theo', tileX: theo.tileX, tileY: theo.tileY, kind: 'quest' };
      }
      return null;
    }

    const qDef = QUESTS[activeQ.id];
    if (!qDef) return null;
    const nextObj = activeQ.objectives.find((o) => o.current < o.required);
    if (nextObj) {
      if (nextObj.type === 'talk') {
        const npc = NPCS.find((n) => n.id === nextObj.targetId);
        if (npc && !npc.interiorId) return { label: qDef.title, tileX: npc.tileX, tileY: npc.tileY, kind: 'quest' };
      }
      if (nextObj.type === 'discover') {
        const lm = LANDMARKS.find((l) => l.id === nextObj.targetId);
        if (lm) return { label: qDef.title, tileX: lm.tileX, tileY: lm.tileY, kind: 'quest' };
      }
      if (nextObj.type === 'guardian') {
        const g = GUARDIANS[nextObj.targetId as GuardianId];
        if (g) return { label: qDef.title, tileX: g.arenaX, tileY: g.arenaY, kind: 'quest' };
      }
    }
    if (qDef.waypointTile) {
      return { label: qDef.title, tileX: qDef.waypointTile.tileX, tileY: qDef.waypointTile.tileY, kind: 'quest' };
    }
    const giver = NPCS.find((n) => n.id === qDef.giverNpcId);
    if (giver && !giver.interiorId) return { label: qDef.title, tileX: giver.tileX, tileY: giver.tileY, kind: 'quest' };
    const lmRegion = LANDMARKS.find((l) => l.region === qDef.region);
    if (lmRegion) return { label: qDef.title, tileX: lmRegion.tileX, tileY: lmRegion.tileY, kind: 'quest' };
    return null;
  }, [save.customWaypoint, save.metNpcs, save.quests, save.trackedQuestId]);

  const recordFishCaught = useCallback(
    (fishId: string, points: number) => {
      const fish = FISH_SPECIES.find((f) => f.id === fishId);
      updateSave((prev) => {
        let next = addItemToSave(prev, fishId, 1);
        if (!next.discoveredFish.includes(fishId)) {
          next = { ...next, discoveredFish: [...next.discoveredFish, fishId] };
        }
        next = {
          ...next,
          fishRecords: {
            ...next.fishRecords,
            [fishId]: Math.max(next.fishRecords[fishId] ?? 0, points),
          },
          sparks: next.sparks + Math.max(8, Math.round(points * 0.18)),
        };
        if (next.discoveredFish.length >= 4 && !next.unlockedCompanions.includes('comp_otter')) {
          next = { ...next, unlockedCompanions: [...next.unlockedCompanions, 'comp_otter'], activeCompanion: 'comp_otter' };
          pushToast('Companion Unlocked: Splash the Tidefin Otter!');
        }
        if (next.discoveredFish.length >= 6 && !next.achievements.includes('ach_master_angler')) {
          next = { ...next, achievements: [...next.achievements, 'ach_master_angler'] };
        }
        next = applyXpAndLevel(next, 22);
        next = syncCollectObjectives(next);
        return next;
      });
      if (fish) pushToast(`Caught ${fish.name} (${fish.rarity})!`);
    },
    [pushToast, updateSave]
  );

  const setWeatherOverride = useCallback(
    (w: WeatherType) => {
      updateSave((prev) => ({ ...prev, weather: w }));
      gameBridge.setWeather(w);
    },
    [updateSave]
  );

  const recordMiniGameScore = useCallback(
    (miniGameId: MiniGameId, score: number) => {
      const earnedSparks = Math.max(15, Math.round(score * 0.25));
      updateSave((prev) => {
        const prevBest = prev.miniGameBestScores[miniGameId] ?? 0;
        const playerLabel = CHARACTERS[prev.activeCharacter]?.name ?? 'Traveler';
        const existingBoard = prev.miniGameLeaderboards[miniGameId] ?? [];
        const nextBoard = [...existingBoard, { name: playerLabel, score }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        let next: SaveData = {
          ...prev,
          sparks: prev.sparks + earnedSparks,
          miniGameBestScores: {
            ...prev.miniGameBestScores,
            [miniGameId]: Math.max(prevBest, score),
          },
          miniGameLeaderboards: {
            ...prev.miniGameLeaderboards,
            [miniGameId]: nextBoard,
          },
        };
        if (miniGameId === 'fishing' && score >= 150 && !next.achievements.includes('ach_master_angler')) {
          next = { ...next, achievements: [...next.achievements, 'ach_master_angler'] };
        }
        if (
          (miniGameId === 'football' ||
            miniGameId === 'basketball' ||
            miniGameId === 'bicyclerace' ||
            miniGameId === 'tennis' ||
            miniGameId === 'swimming') &&
          score >= 80 &&
          !next.achievements.includes('ach_sports_champ')
        ) {
          next = { ...next, achievements: [...next.achievements, 'ach_sports_champ'] };
        }
        if (miniGameId === 'runememory' && score >= 100 && !next.unlockedCharacters.includes('chronomancer')) {
          next = { ...next, unlockedCharacters: [...next.unlockedCharacters, 'chronomancer'] };
          pushToast('Sora, The Dawnkeeper joined your party!');
        }
        if (miniGameId === 'cooking' && score >= 70) {
          next = addItemToSave(next, 'meal_berry_tart', 1);
        }
        next = applyXpAndLevel(next, 35);
        next = syncCollectObjectives(next);
        return next;
      });
      pushToast(`Activity Complete! Score: ${score} (+${earnedSparks} Sparks)`);
    },
    [pushToast, updateSave]
  );

  const fastTravel = useCallback(
    (landmarkId: string) => {
      const lm = LANDMARKS.find((l) => l.id === landmarkId);
      if (!lm || !saveRef.current.discoveredLandmarks.includes(landmarkId)) return;
      soundEngine.playAbility();
      gameBridge.fastTravelTo(lm.tileX, lm.tileY);
      setActiveModal(null);
      pushToast(`Fast traveled to ${lm.name}`);
    },
    [pushToast, setActiveModal]
  );

  const updateSettings = useCallback(
    (partial: Partial<GameSettings>) => {
      updateSave((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }));
    },
    [updateSave]
  );

  const manualSave = useCallback(() => {
    persistSave(saveRef.current);
    soundEngine.playUiClick();
    pushToast('Progress saved automatically.');
  }, [persistSave, pushToast]);

  const getRegionRestorationPercent = useCallback(
    (region: RegionId) => {
      const regionProjs = Object.values(RESTORATION_PROJECTS).filter((p) => p.region === region);
      if (regionProjs.length === 0) return 0;
      return regionProjs.reduce(
        (acc, p) => (save.completedRestorations.includes(p.id) ? acc + p.percentContribution : acc),
        0
      );
    },
    [save.completedRestorations]
  );

  const getTotalRestorationPercent = useCallback(() => {
    const all = Object.keys(RESTORATION_PROJECTS);
    return Math.round((save.completedRestorations.length / all.length) * 100);
  }, [save.completedRestorations]);

  const value: GameContextValue = {
    screen,
    setScreen,
    activeModal,
    setActiveModal,
    activeDialogueNpcId,
    setActiveDialogueNpcId,
    activeMiniGame,
    openMiniGame,
    closeMiniGame,
    save,
    hasExistingSave,
    startNewGame,
    continueGame,
    hud,
    toasts,
    pushToast,
    selectCharacter,
    setCharacterOutfit,
    selectCompanion,
    adoptCompanion,
    startQuest,
    completeQuest,
    completeRestoration,
    buyUpgrade,
    buyShopItem,
    sellInventoryItem,
    consumeBerryHeal,
    eatFoodItem,
    cookRecipe,
    craftOrBuyEquipment,
    upgradeEquipment,
    equipItem,
    upgradeBoat,
    upgradeBoatPart,
    upgradeAirship,
    buildVillageStructure,
    setCityEvent,
    inviteNpcToHouse,
    setDifficulty,
    sleepUntil,
    upgradeHouse,
    toggleHouseDecor,
    updateHouseStyle,
    storeItemInHouse,
    takeItemFromHouse,
    setTrackedQuest,
    setCustomWaypoint,
    getWaypointTarget,
    recordFishCaught,
    setWeatherOverride,
    recordMiniGameScore,
    fastTravel,
    updateSettings,
    manualSave,
    advanceTutorial,
    skipTutorial,
    replayTutorial,
    collectMailboxClue,
    getRegionRestorationPercent,
    getTotalRestorationPercent,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

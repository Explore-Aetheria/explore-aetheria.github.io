import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS } from '../data/characters';
import { COOKING_RECIPES, EQUIPMENT_CATALOG, FISH_SPECIES } from '../data/equipmentAndFood';
import { NPCS } from '../data/npcs';
import { GUARDIANS, INVENTORY_CATALOG, LANDMARKS, MAIN_OFFSET_X, MAIN_OFFSET_Y } from '../data/progression';
import { QUESTS, RESTORATION_PROJECTS } from '../data/quests';
import { gameBridge } from '../game/GameBridge';
import {
  ActiveModal,
  CharacterId,
  GameScreenState,
  GameSettings,
  GuardianId,
  HouseState,
  MapWaypoint,
  MiniGameId,
  OutfitId,
  PlayerHudSnapshot,
  RegionId,
  SaveData,
  UpgradeNodeDef,
  WeatherType,
} from '../types/game';

const STORAGE_KEY = 'bounce_back_save_v1';

const ISLAND_LANDMARK_IDS = [
  'lm_island_frozen',
  'lm_island_jungle',
  'lm_island_volcanic',
  'lm_island_sky',
  'lm_island_haunted',
  'lm_island_lost',
];

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.45,
  sfxVolume: 0.65,
  muted: false,
  screenShake: true,
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
    version: 2,
    savedAt: new Date().toISOString(),
    activeCharacter: 'explorer',
    unlockedCharacters: ['explorer', 'inventor', 'mystic'],
    characterOutfits: {
      explorer: 'default',
      inventor: 'default',
      mystic: 'default',
      tidecaller: 'default',
      mountaineer: 'default',
      chronomancer: 'default',
      pyromancer: 'default',
      skywarden: 'default',
    },
    unlockedOutfits: ['default'],
    sparks: 45,
    xp: 0,
    level: 1,
    hunger: 100,
    timeOfDay: 9.0,
    weather: 'sunny',
    boatLevel: 1,
    boatPos: { x: (MAIN_OFFSET_X + 66) * 32 + 16, y: (MAIN_OFFSET_Y + 97) * 32 + 16 },
    equippedWeapon: 'eq_traveler_wand',
    equippedAccessory: null,
    equippedRod: 'rod_bamboo',
    ownedEquipment: ['eq_traveler_wand', 'rod_bamboo'],
    equipmentLevels: { eq_traveler_wand: 1, rod_bamboo: 1 },
    house: {
      tier: 1,
      placedDecor: [],
      wallColor: '#4c3e73',
      floorStyle: 'oak',
      storage: [],
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
    achievements: [],
    trackedQuestId: null,
    customWaypoint: null,
    activeShopId: 'market',
    endingSeen: false,
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

    // Seamless backward-compatible v1 -> v2 coordinate migration onto Mainland Offset
    if (parsed.version < 2 && playerPos && playerPos.interiorId === null) {
      playerPos = {
        x: playerPos.x + MAIN_OFFSET_X * 32,
        y: playerPos.y + MAIN_OFFSET_Y * 32,
        interiorId: null,
      };
    }

    const migrated: SaveData = {
      ...base,
      ...parsed,
      version: 2,
      playerPos,
      characterOutfits: {
        ...base.characterOutfits,
        ...(parsed.characterOutfits ?? {}),
      },
      house: {
        ...base.house,
        ...(parsed.house ?? {}),
      },
      upgrades: {
        ...base.upgrades,
        ...(parsed.upgrades ?? {}),
      },
      discoveredLandmarks: Array.from(
        new Set([...(parsed.discoveredLandmarks ?? []), 'lm_brightfall_square', 'lm_player_house'])
      ),
      ownedEquipment: Array.from(new Set([...(parsed.ownedEquipment ?? []), 'eq_traveler_wand', 'rod_bamboo'])),
      equipmentLevels: {
        ...base.equipmentLevels,
        ...(parsed.equipmentLevels ?? {}),
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
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
    regionName: 'Brightfall Town',
    interiorId: null,
    interiorName: null,
    playerX: save.playerPos.x,
    playerY: save.playerPos.y,
    facingAngle: Math.PI / 2,
    isSailing: false,
    isSwimming: false,
    weather: save.weather,
    timeOfDay: save.timeOfDay,
    timePhase: 'morning',
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
    } else {
      soundEngine.playMusic(hud.region);
    }
  }, [screen, activeMiniGame, hud.activeGuardian, hud.region]);

  const setScreen = useCallback((s: GameScreenState) => {
    setScreenState(s);
    gameBridge.setPaused(s !== 'PLAYING');
  }, []);

  const setActiveModal = useCallback(
    (m: ActiveModal) => {
      setActiveModalState(m);
      const shouldPause = m !== null || activeDialogueNpcId !== null;
      gameBridge.setPaused(shouldPause);
    },
    [activeDialogueNpcId]
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
        if (obj.type === 'collect') {
          const qty = s.inventory.find((i) => i.id === obj.targetId)?.quantity ?? 0;
          const clamped = Math.min(obj.required, qty);
          if (clamped !== obj.current) changed = true;
          return { ...obj, current: clamped };
        }
        if (obj.type === 'restore') {
          const done = s.completedRestorations.includes(obj.targetId) ? 1 : 0;
          if (done !== obj.current) changed = true;
          return { ...obj, current: done };
        }
        if (obj.type === 'discover') {
          const done = s.discoveredLandmarks.includes(obj.targetId) ? 1 : 0;
          if (done !== obj.current) changed = true;
          return { ...obj, current: done };
        }
        if (obj.type === 'guardian') {
          const done = s.defeatedGuardians.includes(obj.targetId as GuardianId) ? 1 : 0;
          if (done !== obj.current) changed = true;
          return { ...obj, current: done };
        }
        return obj;
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
        if (next.unlockedCharacters.length >= 8 && !next.achievements.includes('ach_full_party')) {
          next = { ...next, achievements: [...next.achievements, 'ach_full_party'] };
        }
        next = applyXpAndLevel(next, def.rewardXp);
        return next;
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
          let next = prev;
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
      onCollectItem: (_colId, itemId, qty) => {
        soundEngine.playCollect();
        const itemDef = INVENTORY_CATALOG[itemId];
        updateSave((prev) => {
          let next = addItemToSave(prev, itemId, qty);
          next = { ...next, sparks: next.sparks + 8 };
          next = applyXpAndLevel(next, 15);
          next = syncCollectObjectives(next);
          return next;
        });
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
          };
          const islandsFound = ISLAND_LANDMARK_IDS.filter((id) => nextDisc.includes(id)).length;
          if (islandsFound >= 3 && !next.achievements.includes('ach_sea_captain')) {
            next = { ...next, achievements: [...next.achievements, 'ach_sea_captain'] };
          }
          if (islandsFound >= 6 && !next.achievements.includes('ach_all_islands')) {
            next = { ...next, achievements: [...next.achievements, 'ach_all_islands'] };
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
          return next;
        });
        pushToast(message);
      },
      onPlayerDamaged: () => {
        soundEngine.playHit();
      },
      onDefeatEnemy: (sparks, xp) => {
        soundEngine.playCollect();
        updateSave((prev) => applyXpAndLevel({ ...prev, sparks: prev.sparks + sparks }, xp));
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
          if (next.unlockedCharacters.length >= 8 && !next.achievements.includes('ach_full_party')) {
            next = { ...next, achievements: [...next.achievements, 'ach_full_party'] };
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
    pushToast('Welcome to Brightfall Town! Speak with Mayor Theo or visit Your Homestead.');
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
      const sellValue = Math.max(4, Math.floor((def.value || 10) * 0.8)) * qty;
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
        else if (eq.slot === 'accessory') next.equippedAccessory = eqId;
        else if (eq.slot === 'rod') next.equippedRod = eqId;
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
        equippedAccessory: eq.slot === 'accessory' ? eqId : prev.equippedAccessory,
        equippedRod: eq.slot === 'rod' ? eqId : prev.equippedRod,
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
    updateSave((prev) => ({
      ...prev,
      sparks: prev.sparks - cost,
      boatLevel: cur + 1,
    }));
    pushToast(`Boat upgraded to Tier ${cur + 1}! Faster sailing & sturdier hull.`);
    return true;
  }, [pushToast, updateSave]);

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
    if (curTier >= 3) return false;
    const cost = curTier === 1 ? 90 : 180;
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
      // Guide new players to Mayor Theo initially
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
        if (npc) return { label: qDef.title, tileX: npc.tileX, tileY: npc.tileY, kind: 'quest' };
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
    const giver = NPCS.find((n) => n.id === qDef.giverNpcId);
    if (giver) return { label: qDef.title, tileX: giver.tileX, tileY: giver.tileY, kind: 'quest' };
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
        next = applyXpAndLevel({ ...next, sparks: next.sparks + Math.max(6, Math.round(points * 0.15)) }, 18);
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
      const earnedSparks = Math.max(12, Math.round(score * 0.25));
      updateSave((prev) => {
        const prevBest = prev.miniGameBestScores[miniGameId] ?? 0;
        let next: SaveData = {
          ...prev,
          sparks: prev.sparks + earnedSparks,
          miniGameBestScores: {
            ...prev.miniGameBestScores,
            [miniGameId]: Math.max(prevBest, score),
          },
        };
        if (miniGameId === 'fishing' && score >= 120 && !next.achievements.includes('ach_master_angler')) {
          next = { ...next, achievements: [...next.achievements, 'ach_master_angler'] };
        }
        if (miniGameId === 'archery' && score >= 150 && !next.achievements.includes('ach_sharp_bolt')) {
          next = { ...next, achievements: [...next.achievements, 'ach_sharp_bolt'] };
        }
        if (miniGameId === 'rhythm' && score >= 200 && !next.achievements.includes('ach_rhythm_star')) {
          next = { ...next, achievements: [...next.achievements, 'ach_rhythm_star'] };
        }
        if (
          (miniGameId === 'football' || miniGameId === 'basketball' || miniGameId === 'bicyclerace') &&
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
        const nextQuests = { ...next.quests };
        Object.keys(nextQuests).forEach((qId) => {
          const qs = nextQuests[qId];
          if (qs.status === 'active') {
            nextQuests[qId] = {
              ...qs,
              objectives: qs.objectives.map((o) =>
                o.type === 'minigame' && o.targetId === miniGameId ? { ...o, current: o.required } : o
              ),
            };
          }
        });
        next = { ...next, quests: nextQuests };
        next = applyXpAndLevel(next, 35);
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

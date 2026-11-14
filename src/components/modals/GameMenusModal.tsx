import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Archive,
  BedDouble,
  Camera,
  Check,
  Compass,
  Fish,
  Flame,
  Hammer,
  Home,
  Lock,
  Paintbrush,
  Plane,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { CHARACTERS, CHARACTER_ORDER, OUTFIT_MODIFIERS } from '../../data/characters';
import { COMPANIONS, COMPANION_ORDER } from '../../data/companions';
import { COOKING_RECIPES, EQUIPMENT_CATALOG, FISH_SPECIES, SHOPS } from '../../data/equipmentAndFood';
import { NPCS } from '../../data/npcs';
import {
  ACHIEVEMENTS,
  GUARDIANS,
  INVENTORY_CATALOG,
  LANDMARKS,
  REGIONS,
  UPGRADE_NODES,
} from '../../data/progression';
import { QUESTS, QUEST_ORDER, RESTORATION_PROJECTS } from '../../data/quests';
import { gameBridge } from '../../game/GameBridge';
import { getCharacterPortraitDataUrl, getCompanionPortraitDataUrl } from '../../game/PixelArtGenerator';
import { useGame, VILLAGE_BUILDINGS_CATALOG } from '../../state/GameStore';
import {
  CharacterId,
  CityEventType,
  CompanionId,
  DifficultyMode,
  HouseState,
  KeyBindings,
  MiniGameId,
  OutfitId,
} from '../../types/game';

const ALL_MINIGAMES: MiniGameId[] = [
  'archery',
  'fishing',
  'rhythm',
  'timeslide',
  'runememory',
  'football',
  'basketball',
  'bicyclerace',
  'boatrace',
  'cooking',
  'tennis',
  'swimming',
  'carnival',
];

const HOUSE_WALL_COLORS = [
  { name: 'Twilight Plum', hex: '#4c3e73' },
  { name: 'Warm Terracotta', hex: '#5c4338' },
  { name: 'Coastal Slate', hex: '#2f4f4f' },
  { name: 'Harbour Blue', hex: '#3c526e' },
  { name: 'Rosewood', hex: '#6e475b' },
];

const CITY_EVENTS_LIST: { id: CityEventType; name: string; desc: string }[] = [
  {
    id: 'christmas',
    name: 'Christmas in Brightfall',
    desc: 'Snowfall settles softly over Brightfall’s avenues, evergreen trees glow gold, and festive ribbons frame the plaza.',
  },
  {
    id: 'music_festival',
    name: 'Harmony Music Festival',
    desc: 'Lantern spotlights illuminate the amphitheater while brass ensembles & street musicians perform.',
  },
  {
    id: 'food_festival',
    name: 'Golden Skillet Food Fair',
    desc: 'Chef Clara & Brightfall’s bistros set out tasting stalls and aromatic autumn-spice garlands.',
  },
  {
    id: 'sports_championship',
    name: 'Aetheria Olympic Games',
    desc: 'Championship banners drape Brightfall Stadium, Football, Basketball, Tennis, and Swimming arenas.',
  },
  {
    id: 'fireworks',
    name: 'Starlight Fireworks Gala',
    desc: 'Sky-lantern bursts and celebratory fireworks shimmer above Brightfall Square every evening.',
  },
  {
    id: 'none',
    name: 'Peaceful Everyday Season',
    desc: 'Clear everyday Brightfall atmosphere with normal seasonal weather.',
  },
];

const GIANT_WILDLIFE_CHECKLIST = [
  { id: 'giant_mammoth', name: 'Glacier Mammoth', region: 'The Frozen Kingdom', hint: 'Roams the snowy fjords of Frozen Kingdom.' },
  { id: 'giant_stag', name: 'Elder Forest Stag', region: 'Whispering Woods', hint: 'Strides calmly through ancient green trails.' },
  { id: 'giant_whale', name: 'Leviathan Whale', region: 'Aetheria Sea', hint: 'Surfaces across deep open waters between islands.' },
  { id: 'giant_manta', name: 'Sky Manta', region: 'Sky Island / Airspace', hint: 'Glides majestically over Cloudspire cliffs and clouds.' },
];

export const GameMenusModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    openMiniGame,
    save,
    hud,
    selectCharacter,
    setCharacterOutfit,
    selectCompanion,
    adoptCompanion,
    completeRestoration,
    buyUpgrade,
    buyShopItem,
    sellInventoryItem,
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
    updateSettings,
    manualSave,
    getTotalRestorationPercent,
  } = useGame();

  const [rebindingKey, setRebindingKey] = useState<keyof KeyBindings | null>(null);
  const [questTab, setQuestTab] = useState<'quests' | 'restoration'>('quests');
  const [questFilter, setQuestFilter] = useState<'active' | 'main' | 'campaign' | 'side' | 'completed'>('active');
  const [shopTab, setShopTab] = useState<string>(save.activeShopId || 'market');
  const [houseTab, setHouseTab] = useState<'bedroom' | 'kitchen' | 'decor' | 'storage' | 'trophies'>('bedroom');
  const [equipFilter, setEquipFilter] = useState<'all' | 'weapon' | 'tool' | 'armor' | 'accessory' | 'tackle'>('all');

  useEffect(() => {
    if (activeModal === 'SHOP') {
      setShopTab(save.activeShopId && SHOPS[save.activeShopId] ? save.activeShopId : 'market');
    }
  }, [activeModal, save.activeShopId]);

  if (!activeModal || activeModal === 'MAP' || activeModal === 'MINIGAME') {
    return null;
  }

  const close = () => {
    setRebindingKey(null);
    setActiveModal(null);
  };

  const titleMap: Record<string, string> = {
    CHARACTERS: 'Party & Wardrobe Atelier',
    COMPANIONS: 'Collectible Companions',
    INVENTORY: 'Explorer Satchel',
    SHOP: SHOPS[shopTab]?.name ?? 'Aetheria Shops',
    EQUIPMENT: 'Anvil, Tools, Armor & Tackle Armory',
    HOUSE: `Brightfall Homestead (Tier ${save.house.tier}/4)`,
    VILLAGE: `Newbrook Village Charter (${save.village.buildings.length}/8 Built)`,
    AIRSHIP: 'Grand Skyport & Marina Hangar',
    EVENTS: 'Brightfall City Events Board',
    PHOTOS: `Wildlife & Horizon Album (${save.photos.length})`,
    QUESTS: 'Quest & Restoration Noticeboard',
    JOURNAL: 'Aetheria Collection Journal',
    UPGRADES: 'Progression & Resonance Tree',
    SETTINGS: 'Settings & Controls',
    CREDITS: 'Credits',
  };

  const currentShop = SHOPS[shopTab] ?? SHOPS.market;
  const sellableItems = save.inventory.filter((entry) => {
    const def = INVENTORY_CATALOG[entry.id];
    return def && (def.category === 'fish' || def.category === 'collectible' || def.category === 'material');
  });

  const trophyDefs = Object.values(INVENTORY_CATALOG).filter((item) => item.category === 'trophy');
  const ownedDecorItems = Object.values(INVENTORY_CATALOG).filter(
    (item) =>
      item.category === 'decor' &&
      (save.inventory.some((i) => i.id === item.id) || save.house.storage.some((i) => i.id === item.id))
  );

  const equipmentList = Object.values(EQUIPMENT_CATALOG).filter((eq) => {
    if (equipFilter === 'all') return true;
    if (equipFilter === 'tool') return eq.slot === 'weapon' && eq.weaponType === 'tool';
    if (equipFilter === 'weapon') return eq.slot === 'weapon' && eq.weaponType !== 'tool';
    if (equipFilter === 'tackle') {
      return eq.slot === 'rod' || eq.slot === 'line' || eq.slot === 'bait' || eq.slot === 'hook';
    }
    return eq.slot === equipFilter;
  });

  const houseUpgradeCost = save.house.tier === 1 ? 90 : save.house.tier === 2 ? 180 : 280;
  const guestCandidateNpcs = NPCS.filter(
    (n) => save.metNpcs.includes(n.id) && n.region === 'brightfall'
  ).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/85 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-[#141c24] border border-[#304252] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#273645]">
          <h2 className="font-display text-lg font-semibold text-[#f3efe6]">
            {titleMap[activeModal] ?? 'Menu'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono-tabular text-[#e0a943]">{save.sparks} Sparks</span>
            <button
              type="button"
              onClick={close}
              className="p-2 rounded-lg text-[#a5a095] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto game-scroll space-y-5">
          {/* Quick Switch between Characters & Companions */}
          {(activeModal === 'CHARACTERS' || activeModal === 'COMPANIONS') && (
            <div className="flex items-center gap-2 p-1 rounded-lg bg-[#0f161d] w-fit border border-[#263442]">
              <button
                type="button"
                onClick={() => setActiveModal('CHARACTERS')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeModal === 'CHARACTERS' ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                }`}
              >
                Playable Heroes ({save.unlockedCharacters.length}/{CHARACTER_ORDER.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('COMPANIONS')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeModal === 'COMPANIONS' ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                }`}
              >
                Creature Companions ({save.unlockedCompanions.length}/{COMPANION_ORDER.length})
              </button>
            </div>
          )}

          {/* COLLECTIBLE CREATURE COMPANIONS */}
          {activeModal === 'COMPANIONS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex flex-wrap items-center justify-between gap-2 text-xs text-[#b8c4ce]">
                <span>
                  Companions physically follow you across land, boat, and skyship, granting combat assist, treasure radar, regen, and movement perks.
                </span>
                {save.activeCompanion && (
                  <button
                    type="button"
                    onClick={() => selectCompanion(null)}
                    className="px-2.5 py-1 rounded bg-[#233240] hover:bg-[#314559] text-[#dce4ea] text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Rest Companion
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {COMPANION_ORDER.map((compId: CompanionId) => {
                  const def = COMPANIONS[compId];
                  const unlocked = save.unlockedCompanions.includes(compId);
                  const active = save.activeCompanion === compId;
                  const portrait = getCompanionPortraitDataUrl(compId);

                  return (
                    <div
                      key={compId}
                      className={`p-4 rounded-lg border transition-colors ${
                        active
                          ? 'bg-[#1c2a36] border-[#e0a943]'
                          : unlocked
                            ? 'bg-[#18222c] border-[#2d3e4f]'
                            : 'bg-[#11181f] border-[#222d38]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg bg-[#0f161d] border border-[#324557] overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={portrait}
                            alt={def.name}
                            className={`w-12 h-12 object-contain pixel-canvas ${unlocked ? '' : 'opacity-45 grayscale'}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm text-[#f3efe6]">
                              {def.name} · <span className="text-[#9fb0bf] font-normal">{def.species}</span>
                            </h3>
                            <span className="text-[11px] text-[#87d4c8] shrink-0">{def.title}</span>
                          </div>
                          <p className="text-xs text-[#b8c4ce] mt-1">{def.description}</p>
                          <p className="text-[11px] text-[#f5cc6b] mt-1.5 font-medium">{def.perkSummary}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-[#9aa6b2] flex-1 min-w-[140px]">
                          {unlocked ? 'Ready to travel with you' : def.unlockHint}
                        </span>
                        {unlocked ? (
                          <button
                            type="button"
                            onClick={() => selectCompanion(active ? null : compId)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                              active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#111921]'
                            }`}
                          >
                            {active ? 'Following' : 'Summon'}
                          </button>
                        ) : def.price ? (
                          <button
                            type="button"
                            onClick={() => adoptCompanion(compId)}
                            className="px-3 py-1.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold font-mono-tabular whitespace-nowrap cursor-pointer"
                          >
                            Adopt ({def.price} Sparks)
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#6d7b88] font-medium">Milestone Unlock</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHARACTERS & 5 OUTFITS */}
          {activeModal === 'CHARACTERS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CHARACTER_ORDER.map((cId: CharacterId) => {
                const def = CHARACTERS[cId];
                const unlocked = save.unlockedCharacters.includes(cId);
                const active = save.activeCharacter === cId;
                const outfit = save.characterOutfits[cId] ?? 'default';
                const portrait = getCharacterPortraitDataUrl(cId, outfit);

                return (
                  <div
                    key={cId}
                    className={`p-4 rounded-lg border transition-colors ${
                      active
                        ? 'bg-[#1c2a36] border-[#e0a943]'
                        : unlocked
                          ? 'bg-[#18222c] border-[#2d3e4f]'
                          : 'bg-[#11181f] border-[#222d38] opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-[#0f161d] border border-[#324557] overflow-hidden shrink-0 flex items-center justify-center">
                        {unlocked ? (
                          <img src={portrait} alt={def.name} className="w-full h-full object-contain pixel-canvas" />
                        ) : (
                          <Lock className="w-5 h-5 text-[#6d7b88]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-[#f3efe6]">
                            {def.name} · <span className="text-[#9fb0bf] font-normal">{def.title}</span>
                          </h3>
                        </div>
                        <p className="text-xs text-[#b8c4ce] mt-1">{unlocked ? def.description : def.unlockHint}</p>
                        {unlocked && (
                          <p className="text-[11px] text-[#87d4c8] mt-1.5">
                            {def.abilityName}: {def.passivePerk}
                          </p>
                        )}
                      </div>
                    </div>
                    {unlocked && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {(['default', 'festival', 'starlight', 'coastal', 'alpine'] as OutfitId[]).map((oId) => {
                            const hasOutfit = save.unlockedOutfits.includes(oId);
                            return (
                              <button
                                key={oId}
                                type="button"
                                disabled={!hasOutfit}
                                onClick={() => setCharacterOutfit(cId, oId)}
                                className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                                  outfit === oId
                                    ? 'bg-[#e0a943] text-[#111921]'
                                    : hasOutfit
                                      ? 'bg-[#233240] text-[#dce4ea] hover:bg-[#2f4254]'
                                      : 'bg-[#18212b] text-[#5c6a78] cursor-not-allowed'
                                }`}
                              >
                                {OUTFIT_MODIFIERS[oId].name.split(' ')[0]}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => selectCharacter(cId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#111921]'
                          }`}
                        >
                          {active ? 'Active' : 'Select'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* INVENTORY */}
          {activeModal === 'INVENTORY' && (
            <div className="space-y-4">
              {save.inventory.length === 0 ? (
                <p className="text-sm text-[#9aa6b2] py-6 text-center">
                  Your satchel is empty. Explore Brightfall, Fresh Mart, and the surrounding islands!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {save.inventory.map((entry) => {
                    const def = INVENTORY_CATALOG[entry.id];
                    if (!def) return null;
                    return (
                      <div key={entry.id} className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex items-start gap-3">
                        <div
                          style={{ backgroundColor: `${def.iconColor}25`, borderColor: def.iconColor }}
                          className="w-10 h-10 rounded-lg border flex items-center justify-center font-mono-tabular text-xs font-bold shrink-0 text-[#f3efe6]"
                        >
                          x{entry.quantity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-[#f3efe6]">{def.name}</span>
                            <span className="text-[11px] text-[#8d9ca8] capitalize">{def.category}</span>
                          </div>
                          <p className="text-xs text-[#aeb9c4] mt-1">{def.description}</p>
                          {def.foodEffect && (
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-mono-tabular text-[#87d4c8]">
                                +{def.foodEffect.hunger} Hunger · +{def.foodEffect.health} HP · +{def.foodEffect.energy} EN
                                {def.foodEffect.buffName ? ` · ${def.foodEffect.buffName}` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => eatFoodItem(entry.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                              >
                                {def.category === 'drink' ? 'Drink' : 'Eat'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SHOPS (MARKET, SUPERMARKET, RESTAURANT, MARINA) */}
          {activeModal === 'SHOP' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-[#0f161d] border border-[#263442]">
                {Object.values(SHOPS).map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setShopTab(shop.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      shopTab === shop.id ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                    }`}
                  >
                    {shop.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#aeb9c4]">
                <ShoppingBag className="w-4 h-4 text-[#e0a943]" />
                <span>{currentShop.subtitle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentShop.items.map(({ itemId, price }) => {
                  const def = INVENTORY_CATALOG[itemId];
                  if (!def) return null;
                  const ownedQty = save.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
                  return (
                    <div key={itemId} className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#f3efe6] truncate">{def.name}</span>
                          {ownedQty > 0 && (
                            <span className="text-[11px] font-mono-tabular text-[#87d4c8]">(x{ownedQty})</span>
                          )}
                        </div>
                        <div className="text-xs text-[#aeb9c4] mt-0.5">{def.description}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => buyShopItem(itemId, price)}
                        className="px-3 py-1.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer font-mono-tabular"
                      >
                        {price} Sparks
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sell Fish & Surplus Collectibles */}
              {sellableItems.length > 0 && (
                <div className="pt-3 border-t border-[#273645] space-y-2.5">
                  <h3 className="text-xs font-semibold text-[#87d4c8]">Sell Caught Fish & Surplus Finds</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sellableItems.map((entry) => {
                      const def = INVENTORY_CATALOG[entry.id];
                      if (!def) return null;
                      const sellPrice = Math.max(5, Math.round(def.value * 0.75));
                      return (
                        <div key={entry.id} className="p-2.5 rounded-lg bg-[#11181f] border border-[#263544] flex items-center justify-between gap-2">
                          <div className="text-xs">
                            <span className="font-semibold text-[#f3efe6]">{def.name}</span>
                            <span className="ml-2 font-mono-tabular text-[#9aa6b2]">x{entry.quantity}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => sellInventoryItem(entry.id, 1)}
                            className="px-2.5 py-1 rounded bg-[#213342] hover:bg-[#2c4357] text-[#e0a943] text-[11px] font-semibold font-mono-tabular whitespace-nowrap cursor-pointer"
                          >
                            Sell 1 (+{sellPrice})
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EQUIPMENT, ARMOR & TACKLE ARMORY */}
          {activeModal === 'EQUIPMENT' && (
            <div className="space-y-4">
              {/* Active Loadout & Tackle Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-[11px] text-[#9aa6b2]">Weapon</div>
                  <div className="text-xs font-semibold text-[#f5cc6b] mt-0.5 truncate">
                    {EQUIPMENT_CATALOG[save.equippedWeapon]?.name ?? 'Traveler’s Prism'}
                  </div>
                  <div className="text-[11px] font-mono-tabular text-[#87d4c8]">
                    Lv.{save.equipmentLevels[save.equippedWeapon] ?? 1}/3
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-[11px] text-[#9aa6b2] flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#98d6ff]" /> Armor
                  </div>
                  <div className="text-xs font-semibold text-[#f5cc6b] mt-0.5 truncate">
                    {save.equippedArmor ? EQUIPMENT_CATALOG[save.equippedArmor]?.name : 'None Equipped'}
                  </div>
                  {save.equippedArmor && (
                    <div className="text-[11px] font-mono-tabular text-[#87d4c8]">
                      -{EQUIPMENT_CATALOG[save.equippedArmor]?.defenseBonus ?? 0}% Dmg
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-[11px] text-[#9aa6b2]">Accessory</div>
                  <div className="text-xs font-semibold text-[#f5cc6b] mt-0.5 truncate">
                    {save.equippedAccessory ? EQUIPMENT_CATALOG[save.equippedAccessory]?.name : 'None Equipped'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-[11px] text-[#9aa6b2]">Fishing Tackle</div>
                  <div className="text-[11px] font-semibold text-[#7be3f5] mt-0.5 truncate">
                    {EQUIPMENT_CATALOG[save.equippedRod]?.name ?? 'Bamboo Pier Rod'}
                  </div>
                  <div className="text-[10px] text-[#aeb9c4] truncate">
                    {EQUIPMENT_CATALOG[save.equippedLine]?.name.split(' ')[0]} ·{' '}
                    {EQUIPMENT_CATALOG[save.equippedBait]?.name.split(' ')[0]} ·{' '}
                    {EQUIPMENT_CATALOG[save.equippedHook]?.name.split(' ')[0]}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#162733] border border-[#34546b] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-[#7be3f5] flex items-center gap-1">
                      <Anchor className="w-3 h-3" /> Boat Tier
                    </div>
                    <div className="text-xs font-bold text-[#f3efe6] font-mono-tabular mt-0.5">
                      Lv.{save.boatLevel} / 3
                    </div>
                  </div>
                  {save.boatLevel < 3 ? (
                    <button
                      type="button"
                      onClick={upgradeBoat}
                      className="px-2.5 py-1.5 rounded-lg bg-[#48b8c9] hover:bg-[#5ecde0] text-[#0d1921] text-[11px] font-bold whitespace-nowrap cursor-pointer font-mono-tabular"
                    >
                      Upgrade ({save.boatLevel === 1 ? 80 : 150})
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-semibold">Maxed</span>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-[#0f161d] w-fit border border-[#263442]">
                {(
                  [
                    { id: 'all', label: 'All Gear' },
                    { id: 'weapon', label: 'Weapons' },
                    { id: 'tool', label: 'Tools' },
                    { id: 'armor', label: 'Armor' },
                    { id: 'accessory', label: 'Accessories' },
                    { id: 'tackle', label: 'Fishing Tackle' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEquipFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      equipFilter === tab.id ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Gear Catalog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {equipmentList.map((eq) => {
                  const owned = save.ownedEquipment.includes(eq.id);
                  const lvl = save.equipmentLevels[eq.id] ?? 1;
                  const equipped =
                    save.equippedWeapon === eq.id ||
                    save.equippedArmor === eq.id ||
                    save.equippedAccessory === eq.id ||
                    save.equippedRod === eq.id ||
                    save.equippedLine === eq.id ||
                    save.equippedBait === eq.id ||
                    save.equippedHook === eq.id;
                  const upgradeCost = 45 * lvl;

                  return (
                    <div
                      key={eq.id}
                      className={`p-4 rounded-lg border space-y-2.5 ${
                        equipped
                          ? 'bg-[#1c2b36] border-[#e0a943]'
                          : 'bg-[#18222c] border-[#2d3e4f]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: eq.color }}
                              className="w-3 h-3 rounded-full inline-block shrink-0"
                            />
                            <h3 className="text-sm font-semibold text-[#f3efe6]">{eq.name}</h3>
                            {owned && eq.slot === 'weapon' && (
                              <span className="text-[11px] font-mono-tabular text-[#87d4c8]">Lv.{lvl}/3</span>
                            )}
                          </div>
                          <p className="text-xs text-[#aeb9c4] mt-1">{eq.description}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8d9ca8] shrink-0">
                          {eq.weaponType ? `${eq.weaponType}` : eq.slot}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono-tabular text-[#dce4ea] flex flex-wrap gap-3">
                        {eq.powerBonus > 0 && <span>+{eq.powerBonus} Power</span>}
                        {eq.speedBonus > 0 && <span>+{eq.speedBonus} Speed</span>}
                        {eq.energyBonus > 0 && <span>+{eq.energyBonus} Energy</span>}
                        {eq.defenseBonus && eq.defenseBonus > 0 ? <span>+{eq.defenseBonus}% Defense</span> : null}
                        {eq.fishingBonus && eq.fishingBonus > 0 ? <span>+{eq.fishingBonus}% Catch Bonus</span> : null}
                        {eq.rarityBonus && eq.rarityBonus > 0 ? <span>+{eq.rarityBonus}% Rare Fish</span> : null}
                      </div>

                      {!owned && eq.craftRecipe && (
                        <div className="text-[11px] text-[#9aa6b2] flex flex-wrap gap-2">
                          <span>Craft:</span>
                          {eq.craftRecipe.map((req) => {
                            const have = save.inventory.find((i) => i.id === req.itemId)?.quantity ?? 0;
                            return (
                              <span
                                key={req.itemId}
                                className={have >= req.quantity ? 'text-emerald-400' : 'text-[#aeb9c4]'}
                              >
                                {INVENTORY_CATALOG[req.itemId]?.name ?? req.itemId} ({have}/{req.quantity})
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-end gap-2">
                        {owned ? (
                          <>
                            {lvl < 3 && eq.price > 0 && (
                              <button
                                type="button"
                                onClick={() => upgradeEquipment(eq.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#233342] hover:bg-[#2f4457] text-[#87d4c8] text-xs font-semibold font-mono-tabular whitespace-nowrap cursor-pointer"
                              >
                                Upgrade ({upgradeCost} Sparks)
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={equipped}
                              onClick={() => equipItem(eq.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                equipped
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] cursor-pointer'
                              }`}
                            >
                              {equipped ? 'Equipped' : 'Equip'}
                            </button>
                          </>
                        ) : (
                          <>
                            {eq.craftRecipe && (
                              <button
                                type="button"
                                onClick={() => craftOrBuyEquipment(eq.id, 'craft')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a5c45] hover:bg-[#357357] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                              >
                                <Hammer className="w-3.5 h-3.5" />
                                Craft
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => craftOrBuyEquipment(eq.id, 'buy')}
                              className="px-3 py-1.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold font-mono-tabular whitespace-nowrap cursor-pointer"
                            >
                              Buy ({eq.price} Sparks)
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLAYER'S PERSONAL HOUSE */}
          {activeModal === 'HOUSE' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-[#0f161d] border border-[#263442]">
                {(
                  [
                    { id: 'bedroom', label: 'Bedroom & Upgrades', icon: BedDouble },
                    { id: 'kitchen', label: 'Kitchen & Cooking', icon: Utensils },
                    { id: 'decor', label: 'Decor & Style', icon: Paintbrush },
                    { id: 'storage', label: 'Storage Chest', icon: Archive },
                    { id: 'trophies', label: 'Trophy Wall', icon: Trophy },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHouseTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                        houseTab === tab.id ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {houseTab === 'bedroom' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#f3efe6]">Rest & Set Time of Day</h3>
                        <p className="text-xs text-[#aeb9c4]">
                          Sleep in your cozy bed to restore full HP, Energy, Hunger, and advance the clock.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { label: '06:00 Sunrise', hour: 6 },
                        { label: '10:00 Morning', hour: 10 },
                        { label: '18:00 Sunset', hour: 18 },
                        { label: '21:00 Night', hour: 21 },
                      ].map((slot) => (
                        <button
                          key={slot.hour}
                          type="button"
                          onClick={() => sleepUntil(slot.hour)}
                          className="px-3 py-2.5 rounded-lg bg-[#233240] hover:bg-[#31475b] border border-[#3a5268] text-xs font-semibold text-[#f3efe6] whitespace-nowrap cursor-pointer"
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#f3efe6] flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#e0a943]" />
                        Homestead Expansion (Tier {save.house.tier}/4)
                      </h3>
                      <p className="text-xs text-[#aeb9c4] mt-1">
                        Expand your residence up to a 4-tier estate with kitchen, bedroom, loft lounge, glowing hearths, and guest quarters.
                      </p>
                    </div>
                    {save.house.tier < 4 ? (
                      <button
                        type="button"
                        onClick={upgradeHouse}
                        className="px-4 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold font-mono-tabular whitespace-nowrap cursor-pointer"
                      >
                        Upgrade ({houseUpgradeCost} Sparks)
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                        Max Tier Reached
                      </span>
                    )}
                  </div>
                </div>
              )}

              {houseTab === 'kitchen' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#1b2733] border border-[#33485c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#f5cc6b] flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Homestead Skillet Practice
                      </h3>
                      <p className="text-xs text-[#aeb9c4] mt-0.5">
                        Play the rhythm-timed Cooking Challenge to earn bonus Sparks and fresh Hearth & Crumb tarts!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openMiniGame('cooking')}
                      className="px-4 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      Play Cooking Mini-Game
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {COOKING_RECIPES.map((rec) => {
                      const outDef = INVENTORY_CATALOG[rec.outputItemId];
                      const canCook = rec.ingredients.every(
                        (ing) => (save.inventory.find((i) => i.id === ing.itemId)?.quantity ?? 0) >= ing.quantity
                      );
                      return (
                        <div
                          key={rec.id}
                          className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-semibold text-[#f3efe6]">{rec.name}</div>
                            <p className="text-xs text-[#aeb9c4]">{outDef?.description}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5 text-[11px]">
                              {rec.ingredients.map((ing) => {
                                const have = save.inventory.find((i) => i.id === ing.itemId)?.quantity ?? 0;
                                return (
                                  <span
                                    key={ing.itemId}
                                    className={have >= ing.quantity ? 'text-emerald-400' : 'text-[#9aa6b2]'}
                                  >
                                    {INVENTORY_CATALOG[ing.itemId]?.name ?? ing.itemId} ({have}/{ing.quantity})
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!canCook}
                            onClick={() => cookRecipe(rec.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                              canCook
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                                : 'bg-[#141c24] text-[#5d6b78] border border-[#25313d] cursor-not-allowed'
                            }`}
                          >
                            Cook Meal
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {houseTab === 'decor' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-3">
                    <h3 className="text-sm font-semibold text-[#f3efe6]">Wall Paint & Flooring</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {HOUSE_WALL_COLORS.map((wc) => (
                        <button
                          key={wc.hex}
                          type="button"
                          onClick={() => updateHouseStyle(wc.hex, save.house.floorStyle)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                            save.house.wallColor === wc.hex
                              ? 'border-[#e0a943] bg-[#243240] text-white'
                              : 'border-[#2f4050] bg-[#141c24] text-[#aeb9c4]'
                          }`}
                        >
                          <span style={{ backgroundColor: wc.hex }} className="w-3.5 h-3.5 rounded-full border border-white/40" />
                          {wc.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {(['oak', 'checker', 'stone'] as HouseState['floorStyle'][]).map((fl) => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => updateHouseStyle(save.house.wallColor, fl)}
                          className={`px-3 py-1.5 rounded-lg border text-xs capitalize cursor-pointer ${
                            save.house.floorStyle === fl
                              ? 'bg-[#e0a943] text-[#111921] border-white font-semibold'
                              : 'bg-[#141c24] border-[#2f4050] text-[#dce4ea]'
                          }`}
                        >
                          {fl} Floor
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-2.5">
                    <h3 className="text-sm font-semibold text-[#f3efe6]">Placed House Furnishings</h3>
                    {ownedDecorItems.length === 0 ? (
                      <p className="text-xs text-[#9aa6b2]">
                        Visit Brightfall Market or Driftwood Marina to buy rugs, bonsai trees, and ship models!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ownedDecorItems.map((dec) => {
                          const placed = save.house.placedDecor.includes(dec.id);
                          return (
                            <div key={dec.id} className="p-3 rounded-lg bg-[#141c24] border border-[#293847] flex items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-semibold text-[#f3efe6]">{dec.name}</div>
                                <div className="text-[11px] text-[#9aa6b2]">{dec.description}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleHouseDecor(dec.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                                  placed
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#233240] hover:bg-[#314559] text-[#dce4ea]'
                                }`}
                              >
                                {placed ? 'Placed' : 'Place'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-2.5">
                    <h3 className="text-sm font-semibold text-[#f3efe6] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#87d4c8]" /> Invite Brightfall Friends Over
                    </h3>
                    <p className="text-xs text-[#9aa6b2]">
                      Invite residents you’ve met to relax and visit inside your Brightfall residence.
                    </p>
                    {guestCandidateNpcs.length === 0 ? (
                      <p className="text-xs text-[#9aa6b2]">Meet residents across Brightfall first!</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {guestCandidateNpcs.map((npc) => {
                          const invited = save.house.invitedNpcs.includes(npc.id);
                          return (
                            <div key={npc.id} className="p-2.5 rounded-lg bg-[#141c24] border border-[#293847] flex items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-semibold text-[#f3efe6]">{npc.name}</div>
                                <div className="text-[11px] text-[#8d9ca8]">{npc.role}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => inviteNpcToHouse(npc.id)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                                  invited ? 'bg-emerald-600 text-white' : 'bg-[#233240] hover:bg-[#314559] text-[#dce4ea]'
                                }`}
                              >
                                {invited ? 'Visiting' : 'Invite'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {houseTab === 'storage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-2.5">
                    <h3 className="text-xs font-semibold text-[#e0a943]">Your Satchel (Deposit 1)</h3>
                    {save.inventory.length === 0 ? (
                      <p className="text-xs text-[#9aa6b2]">Satchel is empty.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto game-scroll pr-1">
                        {save.inventory.map((entry) => (
                          <div key={entry.id} className="p-2 rounded bg-[#141c24] border border-[#263442] flex items-center justify-between text-xs">
                            <span className="text-[#f3efe6]">
                              {INVENTORY_CATALOG[entry.id]?.name ?? entry.id}{' '}
                              <span className="font-mono-tabular text-[#87d4c8]">x{entry.quantity}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => storeItemInHouse(entry.id)}
                              className="px-2.5 py-1 rounded bg-[#233240] hover:bg-[#304659] text-[#dce4ea] text-[11px] font-semibold cursor-pointer"
                            >
                              Store
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-2.5">
                    <h3 className="text-xs font-semibold text-[#87d4c8]">Homestead Storage Chest (Withdraw 1)</h3>
                    {save.house.storage.length === 0 ? (
                      <p className="text-xs text-[#9aa6b2]">Storage chest is empty.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto game-scroll pr-1">
                        {save.house.storage.map((entry) => (
                          <div key={entry.id} className="p-2 rounded bg-[#141c24] border border-[#263442] flex items-center justify-between text-xs">
                            <span className="text-[#f3efe6]">
                              {INVENTORY_CATALOG[entry.id]?.name ?? entry.id}{' '}
                              <span className="font-mono-tabular text-[#87d4c8]">x{entry.quantity}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => takeItemFromHouse(entry.id)}
                              className="px-2.5 py-1 rounded bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-[11px] font-semibold cursor-pointer"
                            >
                              Take
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {houseTab === 'trophies' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trophyDefs.map((tr) => {
                    const earned =
                      save.inventory.some((i) => i.id === tr.id) || save.house.storage.some((i) => i.id === tr.id);
                    return (
                      <div
                        key={tr.id}
                        className={`p-3.5 rounded-lg border flex items-center gap-3 ${
                          earned ? 'bg-[#1c2a27] border-[#e0a943]/60' : 'bg-[#121920] border-[#25313d] opacity-60'
                        }`}
                      >
                        <Trophy className={`w-5 h-5 shrink-0 ${earned ? 'text-[#f5cc6b]' : 'text-[#5b6875]'}`} />
                        <div>
                          <div className="text-xs font-semibold text-[#f3efe6]">{tr.name}</div>
                          <div className="text-[11px] text-[#aeb9c4]">{tr.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* NEWBROOK VILLAGE BUILDER */}
          {activeModal === 'VILLAGE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#172420] border border-[#2e4d3e] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#9ee88a]">Newbrook Settlement Charter</h3>
                  <p className="text-xs text-[#b8c4ce] mt-0.5">
                    Construct homes, bakeries, bridges, and landmarks to bring Newbrook Valley back to life.
                  </p>
                </div>
                <div className="text-right font-mono-tabular">
                  <div className="text-sm font-bold text-[#f3efe6]">{save.village.buildings.length}/8 Structures</div>
                  <div className="text-[11px] text-[#87d4c8]">{save.village.residents.length} Residents Moved In</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VILLAGE_BUILDINGS_CATALOG.map((bld) => {
                  const built = save.village.buildings.includes(bld.id);
                  return (
                    <div
                      key={bld.id}
                      className={`p-4 rounded-lg border flex flex-col justify-between gap-3 ${
                        built ? 'bg-[#1a2b26] border-emerald-500/45' : 'bg-[#19232d] border-[#2d3e4f]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#f3efe6]">{bld.name}</h4>
                          {built && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-[#aeb9c4] mt-1">{bld.description}</p>
                        <p className="text-[11px] text-[#87d4c8] mt-1.5">Welcomes: {bld.residentName}</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={built}
                          onClick={() => buildVillageStructure(bld.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono-tabular whitespace-nowrap ${
                            built
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] cursor-pointer'
                          }`}
                        >
                          {built ? 'Constructed' : `Build (${bld.cost} Sparks)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AIRSHIP & BOAT HANGAR */}
          {activeModal === 'AIRSHIP' && (
            <div className="space-y-5">
              {/* Skywing Airship */}
              <div className="p-4 rounded-lg bg-[#19232d] border border-[#324a5e] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#f5cc6b] flex items-center gap-2">
                      <Plane className="w-4 h-4" /> Skywing Airship
                    </h3>
                    <p className="text-xs text-[#aeb9c4] mt-0.5">
                      {save.airship.unlocked
                        ? 'Soar over oceans, islands, and cliffs with [V] and land anywhere safe.'
                        : 'Restore Brightfall Central Railway & Skyport in Quests -> Restoration to unlock flight.'}
                    </p>
                  </div>
                  {save.airship.unlocked && !hud.interiorId && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        if (hud.isFlying) gameBridge.landAirship();
                        else gameBridge.boardAirship();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      {hud.isFlying ? 'Land Airship [V]' : 'Launch Airship [V]'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#131b23] border border-[#293947] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#f3efe6]">Aether Turbines</div>
                      <div className="text-[11px] font-mono-tabular text-[#87d4c8]">
                        Speed Lv.{save.airship.speedLevel}/3
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={save.airship.speedLevel >= 3}
                      onClick={() => upgradeAirship('speedLevel', save.airship.speedLevel === 1 ? 100 : 180)}
                      className="px-3 py-1.5 rounded-lg bg-[#233342] hover:bg-[#31475b] disabled:opacity-50 text-xs font-semibold text-[#f5cc6b] font-mono-tabular cursor-pointer whitespace-nowrap"
                    >
                      {save.airship.speedLevel >= 3
                        ? 'Maxed'
                        : `Upgrade (${save.airship.speedLevel === 1 ? 100 : 180})`}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-[#131b23] border border-[#293947] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#f3efe6]">Cloud Altitude Stabilizer</div>
                      <div className="text-[11px] font-mono-tabular text-[#87d4c8]">
                        Altitude Lv.{save.airship.altitudeLevel}/3
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={save.airship.altitudeLevel >= 3}
                      onClick={() => upgradeAirship('altitudeLevel', save.airship.altitudeLevel === 1 ? 90 : 160)}
                      className="px-3 py-1.5 rounded-lg bg-[#233342] hover:bg-[#31475b] disabled:opacity-50 text-xs font-semibold text-[#f5cc6b] font-mono-tabular cursor-pointer whitespace-nowrap"
                    >
                      {save.airship.altitudeLevel >= 3
                        ? 'Maxed'
                        : `Upgrade (${save.airship.altitudeLevel === 1 ? 90 : 160})`}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-[#9aa6b2] mr-1">Hull Paint:</span>
                  {(['gold', 'azure', 'crimson'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => upgradeAirship('hullColor', 0, col)}
                      className={`px-3 py-1 rounded text-xs capitalize cursor-pointer ${
                        save.airship.hullColor === col
                          ? 'bg-[#e0a943] text-[#111921] font-semibold'
                          : 'bg-[#131b23] border border-[#2d3e4f] text-[#dce4ea]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boat Refit Dock */}
              <div className="p-4 rounded-lg bg-[#16232e] border border-[#2d485c] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#7be3f5] flex items-center gap-2">
                    <Anchor className="w-4 h-4" /> Driftwood Harbour Boat Refit Dock
                  </h3>
                  <span className="text-xs font-mono-tabular text-[#87d4c8]">
                    Class: {save.boatUpgrades.skin.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { key: 'speedLevel', label: 'Sail Rigging Speed' },
                      { key: 'hullLevel', label: 'Reinforced Storm Hull' },
                      { key: 'handlingLevel', label: 'Rudder Handling' },
                      { key: 'cargoLevel', label: 'Cargo & Tackle Hold' },
                    ] as const
                  ).map((part) => {
                    const lv = save.boatUpgrades[part.key];
                    const cost = lv === 1 ? 75 : 140;
                    return (
                      <div key={part.key} className="p-3 rounded-lg bg-[#111b24] border border-[#24394a] flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-[#f3efe6]">{part.label}</div>
                          <div className="text-[11px] font-mono-tabular text-[#7be3f5]">Lv.{lv}/3</div>
                        </div>
                        <button
                          type="button"
                          disabled={lv >= 3}
                          onClick={() => upgradeBoatPart(part.key, cost)}
                          className="px-3 py-1.5 rounded-lg bg-[#48b8c9] hover:bg-[#5ecde0] disabled:opacity-45 text-[#0d1921] text-xs font-bold font-mono-tabular cursor-pointer whitespace-nowrap"
                        >
                          {lv >= 3 ? 'Maxed' : `Upgrade (${cost})`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-[#9aa6b2] mr-1">Vessel Hull Class:</span>
                  {(['skiff', 'schooner', 'galleon'] as const).map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => upgradeBoatPart('speedLevel', 0, sk)}
                      className={`px-3 py-1 rounded text-xs capitalize cursor-pointer ${
                        save.boatUpgrades.skin === sk
                          ? 'bg-[#48b8c9] text-[#0d1921] font-semibold'
                          : 'bg-[#111b24] border border-[#2a4052] text-[#dce4ea]'
                      }`}
                    >
                      {sk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BRIGHTFALL CITY EVENTS */}
          {activeModal === 'EVENTS' && (
            <div className="space-y-3">
              <p className="text-xs text-[#aeb9c4]">
                Switch Brightfall City’s seasonal festival or celebration atmosphere at any time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CITY_EVENTS_LIST.map((ev) => {
                  const active = save.cityEvent === ev.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setCityEvent(ev.id)}
                      className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                        active ? 'bg-[#22303c] border-[#e0a943]' : 'bg-[#18222c] border-[#2d3e4f] hover:border-[#4b647a]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#f3efe6]">{ev.name}</span>
                        {active && <span className="text-xs font-semibold text-[#e0a943]">Active</span>}
                      </div>
                      <p className="text-xs text-[#aeb9c4] mt-1">{ev.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* WILDLIFE & HORIZON PHOTO ALBUM */}
          {activeModal === 'PHOTOS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#b8c4ce]">
                  Press <strong className="text-[#f5cc6b]">[P]</strong> or click the Camera icon outdoors to photograph giant roaming wildlife and scenic regions.
                </div>
                {!hud.interiorId && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      gameBridge.takePhoto();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Snap Photo Now
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#87d4c8] mb-2">Giant Roaming Creatures Field Checklist</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GIANT_WILDLIFE_CHECKLIST.map((gw) => {
                    const shot = save.photos.some((p) => p.subjectId === gw.id);
                    return (
                      <div
                        key={gw.id}
                        className={`p-3 rounded-lg border text-xs ${
                          shot ? 'bg-[#1a2b26] border-emerald-500/45' : 'bg-[#151e27] border-[#273645]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#f3efe6]">{gw.name}</span>
                          <span className={shot ? 'text-emerald-400' : 'text-[#8d9ca8]'}>
                            {shot ? 'Photographed' : gw.region}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#aeb9c4] mt-1">{gw.hint}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#e0a943] mb-2">Saved Snapshots ({save.photos.length})</h3>
                {save.photos.length === 0 ? (
                  <p className="text-xs text-[#9aa6b2] py-4 text-center">
                    No photos in your album yet. Walk near wild creatures or scenic shrines and press [P]!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {save.photos.map((ph) => (
                      <div key={ph.id} className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-[#f3efe6]">{ph.title}</div>
                          <div className="text-[11px] text-[#87d4c8]">{REGIONS[ph.region]?.name ?? ph.region}</div>
                        </div>
                        <span className="text-[10px] font-mono-tabular text-[#8d9ca8]">
                          {new Date(ph.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUESTS & RESTORATION */}
          {activeModal === 'QUESTS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 p-1 rounded-lg bg-[#0f161d] w-fit border border-[#263442]">
                  <button
                    type="button"
                    onClick={() => setQuestTab('quests')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      questTab === 'quests' ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                    }`}
                  >
                    Quests ({Object.values(save.quests).filter((q) => q.status === 'active').length} Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestTab('restoration')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      questTab === 'restoration' ? 'bg-[#e0a943] text-[#111921]' : 'text-[#b8c4ce] hover:text-white'
                    }`}
                  >
                    Aetheria Restoration ({getTotalRestorationPercent()}%)
                  </button>
                </div>

                {questTab === 'quests' && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'active', label: 'Active' },
                        { id: 'main', label: 'Main' },
                        { id: 'campaign', label: 'Islands' },
                        { id: 'side', label: 'Side' },
                        { id: 'completed', label: 'Done' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setQuestFilter(f.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                          questFilter === f.id
                            ? 'bg-[#2a3f52] text-[#f5cc6b] border border-[#4a6b88]'
                            : 'bg-[#0f161d] text-[#9aa6b2] hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {questTab === 'quests' ? (
                <div className="space-y-2.5">
                  {QUEST_ORDER.filter((qId) => {
                    const def = QUESTS[qId];
                    const state = save.quests[qId];
                    if (!def || !state) return false;
                    if (questFilter === 'active') return state.status === 'active';
                    if (questFilter === 'completed') return state.status === 'completed';
                    return def.category === questFilter;
                  }).map((qId) => {
                    const def = QUESTS[qId];
                    const state = save.quests[qId];
                    if (!state) return null;
                    const isTracked = save.trackedQuestId === qId;
                    return (
                      <div key={qId} className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#f3efe6]">{def.title}</h3>
                            <span className="text-[11px] text-[#87d4c8]">
                              ({REGIONS[def.region]?.name ?? def.region})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {state.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => setTrackedQuest(isTracked ? null : qId)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                                  isTracked
                                    ? 'bg-[#e0a943] text-[#111921]'
                                    : 'bg-[#233240] text-[#dce4ea] hover:bg-[#314559]'
                                }`}
                              >
                                <Compass className="w-3 h-3" />
                                {isTracked ? 'Tracked' : 'Track'}
                              </button>
                            )}
                            <span
                              className={`text-xs font-semibold ${
                                state.status === 'completed' ? 'text-emerald-400' : 'text-[#e0a943]'
                              }`}
                            >
                              {state.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#aeb9c4] mt-1">{def.summary}</p>
                        {def.locationHint && (
                          <p className="text-[11px] text-[#9aa6b2] mt-0.5">Area: {def.locationHint}</p>
                        )}
                        <div className="mt-2.5 space-y-1">
                          {state.objectives.map((o) => (
                            <div key={o.id} className="flex items-center justify-between text-xs text-[#dce4ea]">
                              <span>• {o.description}</span>
                              <span className="font-mono-tabular text-[#87d4c8]">
                                {o.current}/{o.required}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {QUEST_ORDER.filter((qId) => {
                    const def = QUESTS[qId];
                    const state = save.quests[qId];
                    if (!def || !state) return false;
                    if (questFilter === 'active') return state.status === 'active';
                    if (questFilter === 'completed') return state.status === 'completed';
                    return def.category === questFilter;
                  }).length === 0 && (
                    <p className="text-sm text-[#9aa6b2] py-6 text-center">
                      No quests in this filter yet—explore islands or speak with Mayor Theo in Brightfall!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.values(RESTORATION_PROJECTS).map((proj) => {
                    const done = save.completedRestorations.includes(proj.id);
                    const isBuildableFromBoard = proj.sparksCost > 0 && proj.id !== 'rest_newbrook_village';
                    return (
                      <div
                        key={proj.id}
                        className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[#f3efe6]">{proj.name}</span>
                            <span className="text-[11px] text-[#9aa6b2]">({REGIONS[proj.region]?.name})</span>
                            {done && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-xs text-[#aeb9c4]">{proj.description}</p>
                          <p className="text-[11px] text-[#87d4c8]">{proj.visualEffect}</p>
                        </div>
                        {!done && isBuildableFromBoard && (
                          <button
                            type="button"
                            onClick={() => completeRestoration(proj.id)}
                            className="px-3.5 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer"
                          >
                            Build ({proj.sparksCost} Sparks
                            {proj.requiredItem
                              ? ` + ${proj.requiredItem.quantity} ${INVENTORY_CATALOG[proj.requiredItem.id]?.name}`
                              : ''}
                            )
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* UPGRADES */}
          {activeModal === 'UPGRADES' && (
            <div className="space-y-3">
              <p className="text-xs text-[#aeb9c4]">Invest Luminos Sparks to strengthen every companion in your party.</p>
              {UPGRADE_NODES.map((node) => {
                const lvl = save.upgrades[node.id];
                const maxed = lvl >= node.maxLevel;
                const cost = maxed ? 0 : node.costPerLevel[lvl];
                return (
                  <div key={node.id} className="p-4 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[#f3efe6]">
                        {node.name} <span className="text-xs font-mono-tabular text-[#87d4c8] ml-1">Lv.{lvl}/{node.maxLevel}</span>
                      </div>
                      <p className="text-xs text-[#aeb9c4] mt-0.5">{node.description}</p>
                      <p className="text-[11px] text-[#e0a943] mt-1">{node.bonusPerLevelLabel} per rank</p>
                    </div>
                    <button
                      type="button"
                      disabled={maxed}
                      onClick={() => buyUpgrade(node.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer font-mono-tabular ${
                        maxed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#111921]'
                      }`}
                    >
                      {maxed ? 'Maxed' : `Upgrade (${cost})`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* COLLECTION JOURNAL */}
          {activeModal === 'JOURNAL' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center font-mono-tabular">
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.metNpcs.length}/{NPCS.length}</div>
                  <div className="text-[11px] text-[#9aa6b2]">Residents Met</div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.discoveredLandmarks.length}/{LANDMARKS.length}</div>
                  <div className="text-[11px] text-[#9aa6b2]">Landmarks</div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.defeatedGuardians.length}/12</div>
                  <div className="text-[11px] text-[#9aa6b2]">Guardians Purified</div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.discoveredFish.length}/{FISH_SPECIES.length}</div>
                  <div className="text-[11px] text-[#9aa6b2]">Fish Caught</div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.photos.length}</div>
                  <div className="text-[11px] text-[#9aa6b2]">Photos Saved</div>
                </div>
                <div className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                  <div className="text-lg font-bold text-[#f3efe6]">{save.discoveredSecrets.length}/3</div>
                  <div className="text-[11px] text-[#9aa6b2]">Secrets Found</div>
                </div>
              </div>

              {/* Fish Encyclopedia */}
              <div>
                <h3 className="text-xs font-semibold text-[#48b8c9] mb-2 flex items-center gap-1.5">
                  <Fish className="w-3.5 h-3.5" /> Aetheria Fish Encyclopedia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FISH_SPECIES.map((fish) => {
                    const caught = save.discoveredFish.includes(fish.id);
                    const best = save.fishRecords[fish.id] ?? 0;
                    return (
                      <div
                        key={fish.id}
                        className={`p-3 rounded-lg border text-xs ${
                          caught ? 'bg-[#192630] border-[#38586e]' : 'bg-[#131a21] border-[#25313d] opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#f3efe6]">{caught ? fish.name : 'Unknown Species'}</span>
                          <span className={caught ? 'text-[#7be3f5]' : 'text-[#6d7b88]'}>
                            {fish.rarity}{best > 0 ? ` · Best ${best}pt` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#aeb9c4] mt-1">
                          {caught ? fish.description : `Waters: ${fish.locations.join(', ')}`}
                        </p>
                        <p className="text-[11px] text-[#87d4c8] mt-1">
                          {fish.weatherHint} · {fish.timeHint}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 13 Mini-Game Personal Bests */}
              <div>
                <h3 className="text-xs font-semibold text-[#e0a943] mb-2">Mini-Game Personal Bests</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono-tabular">
                  {ALL_MINIGAMES.map((mg) => (
                    <div key={mg} className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f] flex justify-between gap-2">
                      <span className="capitalize text-[#dce4ea] truncate">{mg}</span>
                      <span className="text-[#87d4c8] shrink-0">{save.miniGameBestScores[mg] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12 Guardians */}
              <div>
                <h3 className="text-xs font-semibold text-[#87d4c8] mb-2">Guardians of Aetheria (12)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(GUARDIANS).map((g) => {
                    const done = save.defeatedGuardians.includes(g.id);
                    return (
                      <div key={g.id} className="p-3 rounded-lg bg-[#19232d] border border-[#2d3e4f]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#f3efe6]">{g.name} · {g.title}</span>
                          <span className={done ? 'text-emerald-400' : 'text-[#9aa6b2]'}>
                            {done ? 'Purified' : 'Unrest'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#aeb9c4] mt-1">{g.rewardText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-xs font-semibold text-[#e0a943] mb-2">Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACHIEVEMENTS.map((a) => {
                    const got = save.achievements.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                          got ? 'bg-[#1b2b27] border-emerald-500/40' : 'bg-[#131a21] border-[#25313d] opacity-65'
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 shrink-0 ${got ? 'text-[#e0a943]' : 'text-[#5b6875]'}`} />
                        <div>
                          <div className="font-semibold text-[#f3efe6]">{a.title}</div>
                          <div className="text-[11px] text-[#aeb9c4]">{a.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS, DIFFICULTY & KEY BINDINGS */}
          {activeModal === 'SETTINGS' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-lg bg-[#19232d] border border-[#2d3e4f] space-y-2">
                <div className="text-xs font-semibold text-[#e0a943]">Adventure Difficulty Mode</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'explorer', label: 'Explorer', desc: 'Gentle incoming damage & relaxed encounters' },
                      { id: 'adventure', label: 'Adventure', desc: 'Balanced tactical combat & exploration' },
                      { id: 'heroic', label: 'Heroic', desc: 'Fierce foes & high-stakes Guardian duels' },
                    ] as { id: DifficultyMode; label: string; desc: string }[]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                        save.settings.difficulty === d.id
                          ? 'bg-[#253646] border-[#e0a943]'
                          : 'bg-[#131b23] border-[#293947]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#f3efe6]">{d.label}</div>
                      <div className="text-[10px] text-[#9aa6b2] mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm text-[#dce4ea]">
                  <span>Music Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={save.settings.musicVolume}
                    onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                    className="w-48 accent-[#e0a943]"
                  />
                </label>
                <label className="flex items-center justify-between text-sm text-[#dce4ea]">
                  <span>Sound Effects Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={save.settings.sfxVolume}
                    onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
                    className="w-48 accent-[#e0a943]"
                  />
                </label>
                <label className="flex items-center justify-between text-sm text-[#dce4ea]">
                  <span>Mute All Audio</span>
                  <input
                    type="checkbox"
                    checked={save.settings.muted}
                    onChange={(e) => updateSettings({ muted: e.target.checked })}
                    className="w-4 h-4 accent-[#e0a943]"
                  />
                </label>
                <label className="flex items-center justify-between text-sm text-[#dce4ea]">
                  <span>Camera Impact Shake</span>
                  <input
                    type="checkbox"
                    checked={save.settings.screenShake}
                    onChange={(e) => updateSettings({ screenShake: e.target.checked })}
                    className="w-4 h-4 accent-[#e0a943]"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-[#273645]">
                <h3 className="text-xs font-semibold text-[#e0a943] mb-2.5">Key Bindings (Click to Rebind)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(save.settings.keyBindings) as (keyof KeyBindings)[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onKeyDown={(e) => {
                        if (rebindingKey === k) {
                          e.preventDefault();
                          updateSettings({
                            keyBindings: { ...save.settings.keyBindings, [k]: e.code },
                          });
                          setRebindingKey(null);
                        }
                      }}
                      onClick={() => setRebindingKey(k)}
                      className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer ${
                        rebindingKey === k
                          ? 'bg-[#e0a943] text-[#111921] border-white font-semibold'
                          : 'bg-[#19232d] border-[#2d3e4f] text-[#dce4ea]'
                      }`}
                    >
                      <span className="capitalize">{k}</span>
                      <span className="font-mono-tabular">
                        {rebindingKey === k ? 'Press key...' : save.settings.keyBindings[k]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#273645] flex justify-end">
                <button
                  type="button"
                  onClick={manualSave}
                  className="px-4 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] text-xs font-semibold cursor-pointer"
                >
                  Save Progress Now
                </button>
              </div>
            </div>
          )}

          {/* CREDITS */}
          {activeModal === 'CREDITS' && (
            <div className="space-y-4 text-sm text-[#dce4ea] py-2">
              <p className="font-display text-xl text-[#f5cc6b]">Bounce Back: Chronicles of Aetheria</p>
              <p className="text-[#aeb9c4]">
                Built with Phaser 3, React, TypeScript, procedural 16-bit pixel artwork, dynamic weather & day-night cycles, sailing across twelve regions, and a Web Audio API adaptive soundtrack.
              </p>
              <p className="text-[#aeb9c4]">
                Theme: A setback never writes the final chapter. Rebuild communities, reconnect neighbors, sail to distant horizons, and help the world bounce back.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

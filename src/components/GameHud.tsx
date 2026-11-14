import React, { useMemo } from 'react';
import {
  Anchor,
  Backpack,
  BookOpen,
  Camera,
  Compass,
  Image as ImageIcon,
  Map as MapIcon,
  Pause,
  Plane,
  ScrollText,
  Sparkles,
  Swords,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS } from '../data/characters';
import { COMPANIONS } from '../data/companions';
import { INVENTORY_CATALOG } from '../data/progression';
import { QUESTS } from '../data/quests';
import { gameBridge } from '../game/GameBridge';
import { getCharacterPortraitDataUrl, getCompanionPortraitDataUrl, TILE_SIZE } from '../game/PixelArtGenerator';
import { useGame } from '../state/GameStore';

function formatClock(hourFloat: number): string {
  const h = Math.floor(((hourFloat % 24) + 24) % 24);
  const m = Math.floor((hourFloat - Math.floor(hourFloat)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function cardinalLabel(angleRad: number): string {
  // 0 = East, PI/2 = South, PI = West, -PI/2 = North
  const deg = (((angleRad * 180) / Math.PI) + 360) % 360;
  if (deg >= 337.5 || deg < 22.5) return 'E';
  if (deg < 67.5) return 'SE';
  if (deg < 112.5) return 'S';
  if (deg < 157.5) return 'SW';
  if (deg < 202.5) return 'W';
  if (deg < 247.5) return 'NW';
  if (deg < 292.5) return 'N';
  return 'NE';
}

export const GameHud: React.FC = () => {
  const {
    screen,
    setScreen,
    activeModal,
    setActiveModal,
    activeDialogueNpcId,
    save,
    hud,
    toasts,
    pushToast,
    updateSettings,
    eatFoodItem,
    getRegionRestorationPercent,
    getWaypointTarget,
  } = useGame();

  const charDef = CHARACTERS[save.activeCharacter];
  const outfit = save.characterOutfits[save.activeCharacter] ?? 'default';

  const portraitUrl = useMemo(
    () => getCharacterPortraitDataUrl(save.activeCharacter, outfit),
    [save.activeCharacter, outfit]
  );

  const activeCompanionDef = save.activeCompanion ? COMPANIONS[save.activeCompanion] : null;
  const companionPortraitUrl = useMemo(
    () => (save.activeCompanion ? getCompanionPortraitDataUrl(save.activeCompanion) : ''),
    [save.activeCompanion]
  );

  const activeQuest = useMemo(() => {
    const active =
      (save.trackedQuestId && save.quests[save.trackedQuestId]?.status === 'active'
        ? save.quests[save.trackedQuestId]
        : Object.values(save.quests).find((q) => q.status === 'active')) ?? null;
    if (!active) return null;
    const def = QUESTS[active.id];
    if (!def) return null;
    const nextObj = active.objectives.find((o) => o.current < o.required) ?? active.objectives[0];
    return {
      title: def.title,
      step: nextObj ? `${nextObj.description} (${nextObj.current}/${nextObj.required})` : def.summary,
    };
  }, [save.quests, save.trackedQuestId]);

  const quickFood = useMemo(() => {
    return save.inventory.find((entry) => INVENTORY_CATALOG[entry.id]?.foodEffect) ?? null;
  }, [save.inventory]);

  const waypoint = getWaypointTarget();
  const regionPct = getRegionRestorationPercent(hud.region);

  if (screen !== 'PLAYING') return null;

  const hpPct = Math.max(0, Math.min(100, (hud.health / Math.max(1, hud.maxHealth)) * 100));
  const enPct = Math.max(0, Math.min(100, (hud.energy / Math.max(1, hud.maxEnergy)) * 100));
  const hungerPct = Math.max(0, Math.min(100, (hud.hunger / Math.max(1, hud.maxHunger)) * 100));

  let wpAngleDeg = 0;
  let wpDistMeters = 0;
  if (waypoint) {
    const wx = waypoint.tileX * TILE_SIZE + 16;
    const wy = waypoint.tileY * TILE_SIZE + 16;
    const dx = wx - hud.playerX;
    const dy = wy - hud.playerY;
    wpDistMeters = Math.round(Math.hypot(dx, dy) / 10);
    // CSS rotate(0deg) points UP (North = -PI/2). Convert atan2 angle to degrees clockwise from North:
    wpAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
      {/* Top Perimeter Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Character Portrait, HP/Energy/Hunger & Quick Food */}
        <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#111921]/92 border border-[#2c3b4a] shadow-lg">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'CHARACTERS' ? null : 'CHARACTERS')}
              className="relative w-12 h-12 rounded-lg bg-[#1c2936] border border-[#3a4f63] overflow-hidden shrink-0 cursor-pointer hover:border-[#e0a943] transition-colors"
              title="Switch Character [C]"
            >
              <img src={portraitUrl} alt={charDef.name} className="w-full h-full object-contain pixel-canvas" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'COMPANIONS' ? null : 'COMPANIONS')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#182430] hover:bg-[#223344] border border-[#324657] hover:border-[#e0a943] text-[10px] text-[#f5cc6b] cursor-pointer transition-colors"
              title={activeCompanionDef ? `${activeCompanionDef.name} (${activeCompanionDef.perkSummary}) — Companions [K]` : 'Choose Companion [K]'}
            >
              {companionPortraitUrl && (
                <img src={companionPortraitUrl} alt={activeCompanionDef?.name ?? 'Companion'} className="w-4 h-4 object-contain pixel-canvas" />
              )}
              <span className="truncate max-w-[44px] font-medium">{activeCompanionDef?.name ?? 'Pets'}</span>
            </button>
          </div>

          <div className="min-w-[175px] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#f3efe6]">{charDef.name}</span>
              <span className="text-[#e0a943] font-mono-tabular font-semibold">
                Lv.{save.level} · {save.sparks} Sparks
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] text-[#b8c4ce] font-mono-tabular">
                <span>HP</span>
                <span>{hud.health}/{hud.maxHealth}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e2a36] overflow-hidden">
                <div style={{ width: `${hpPct}%` }} className="h-full bg-[#4db876] transition-all duration-150" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] text-[#b8c4ce] font-mono-tabular">
                <span>{charDef.abilityName} [Q]</span>
                <span>
                  {hud.abilityCooldownRemaining > 0
                    ? `${hud.abilityCooldownRemaining.toFixed(1)}s`
                    : `${hud.energy}/${hud.maxEnergy}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e2a36] overflow-hidden">
                <div style={{ width: `${enPct}%` }} className="h-full bg-[#48b8c9] transition-all duration-150" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] text-[#b8c4ce] font-mono-tabular">
                <span>Hunger</span>
                <span>{hud.hunger}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e2a36] overflow-hidden">
                <div
                  style={{ width: `${hungerPct}%` }}
                  className={`h-full transition-all duration-150 ${hud.hunger <= 20 ? 'bg-rose-400' : 'bg-[#e0a943]'}`}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => quickFood && eatFoodItem(quickFood.id)}
            disabled={!quickFood}
            className="ml-1 px-2.5 py-2 rounded-lg bg-[#1c2833] hover:bg-[#273847] disabled:opacity-40 border border-[#324657] text-[11px] font-medium text-[#f5cc6b] flex flex-col items-center cursor-pointer whitespace-nowrap shrink-0"
            title={quickFood ? `Eat ${INVENTORY_CATALOG[quickFood.id]?.name}` : 'No food in satchel'}
          >
            <span>Eat</span>
            <span className="font-mono-tabular text-[#d0d8e0]">x{quickFood?.quantity ?? 0}</span>
          </button>
        </div>

        {/* Top-Center: Circular Brass Adventure Compass, Waypoint Bearing, Clock & Weather */}
        <div className="hidden md:flex pointer-events-auto flex-col items-center gap-1">
          <div className="relative w-[84px] h-[84px] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              <defs>
                <radialGradient id="compassFace" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#1b2a38" />
                  <stop offset="100%" stopColor="#0d151d" />
                </radialGradient>
                <linearGradient id="brassRim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f5cc6b" />
                  <stop offset="50%" stopColor="#c48a2d" />
                  <stop offset="100%" stopColor="#855b1b" />
                </linearGradient>
              </defs>
              {/* Outer brass ring & dark enamel dial */}
              <circle cx="50" cy="50" r="46" fill="url(#compassFace)" stroke="url(#brassRim)" strokeWidth="4.5" />
              <circle cx="50" cy="50" r="39" fill="none" stroke="#364b5e" strokeWidth="1" strokeDasharray="2 3" />

              {/* Intercardinal diagonal ticks */}
              <line x1="21" y1="21" x2="26" y2="26" stroke="#536b80" strokeWidth="1.5" />
              <line x1="79" y1="21" x2="74" y2="26" stroke="#536b80" strokeWidth="1.5" />
              <line x1="21" y1="79" x2="26" y2="74" stroke="#536b80" strokeWidth="1.5" />
              <line x1="79" y1="79" x2="74" y2="74" stroke="#536b80" strokeWidth="1.5" />

              {/* Cardinal Letters */}
              <text x="50" y="16" textAnchor="middle" fill="#f5cc6b" fontSize="10" fontWeight="700" fontFamily="monospace">N</text>
              <text x="86" y="53.5" textAnchor="middle" fill="#9fb1c2" fontSize="8.5" fontWeight="700" fontFamily="monospace">E</text>
              <text x="50" y="90" textAnchor="middle" fill="#9fb1c2" fontSize="8.5" fontWeight="700" fontFamily="monospace">S</text>
              <text x="14" y="53.5" textAnchor="middle" fill="#9fb1c2" fontSize="8.5" fontWeight="700" fontFamily="monospace">W</text>

              {/* Player Facing Chevron */}
              <g transform={`rotate(${((hud.facingAngle * 180) / Math.PI + 90).toFixed(1)} 50 50)`}>
                <polygon points="50,24 55,34 50,31 45,34" fill="#6ae0d6" opacity="0.85" />
              </g>

              {/* Tracked Waypoint Needle */}
              {waypoint && (
                <g transform={`rotate(${wpAngleDeg.toFixed(1)} 50 50)`}>
                  <polygon points="50,18 54.5,50 50,46 45.5,50" fill="#ffd466" />
                  <polygon points="50,72 53,50 47,50" fill="#4f6478" />
                </g>
              )}

              {/* Center Pivot Jewel */}
              <circle cx="50" cy="50" r="4.5" fill="#e0a943" stroke="#111921" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#111921]/88 border border-[#2c3b4a] text-center shadow-md">
            <div className="text-[11px] font-medium text-[#f3efe6] flex items-center justify-center gap-1.5 font-mono-tabular">
              {waypoint ? (
                <>
                  <span className="font-sans truncate max-w-[165px]">{waypoint.label}</span>
                  <span className="text-[#87d4c8]">· {wpDistMeters}m</span>
                </>
              ) : (
                <span className="text-[#9fb1c2] font-sans">Facing {cardinalLabel(hud.facingAngle)} · Free Roam</span>
              )}
            </div>
            <div className="text-[10px] font-mono-tabular text-[#9fb1c2] capitalize">
              {formatClock(hud.timeOfDay)} · {hud.weather.replace('_', ' ')}
              {hud.activeBuff ? <span className="text-[#f5cc6b]"> · {hud.activeBuff}</span> : null}
            </div>
          </div>
        </div>

        {/* Top-Right: Region Status, Active Quest, & Compact Menu Icons */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#111921]/92 border border-[#2c3b4a] shadow-lg">
            <div className="px-2 pr-3 border-r border-[#2c3b4a] text-right">
              <div className="text-xs font-semibold text-[#f3efe6] flex items-center justify-end gap-1.5">
                {hud.isFlying ? (
                  <Plane className="w-3.5 h-3.5 text-[#f5cc6b]" />
                ) : hud.isSailing ? (
                  <Anchor className="w-3.5 h-3.5 text-[#6ae0d6]" />
                ) : (
                  <Compass className="w-3.5 h-3.5 text-[#e0a943]" />
                )}
                <span>{hud.interiorName ?? hud.regionName}</span>
              </div>
              <div className="text-[11px] text-[#98a6b3] font-mono-tabular">
                {hud.isFlying
                  ? `Flying Airship Lv.${save.airship.speedLevel} [V]`
                  : hud.isSailing
                    ? `Sailing Boat Lv.${save.boatLevel}`
                    : hud.isSwimming
                      ? 'Swimming'
                      : hud.region === 'brightfall' && !hud.interiorId && hud.cityEvent !== 'none'
                        ? `${hud.cityEvent.replace('_', ' ')} · ${regionPct}%`
                        : `Restored ${regionPct}%`}
              </div>
            </div>

            {save.airship.unlocked && !hud.interiorId && (
              <button
                type="button"
                onClick={() => (hud.isFlying ? gameBridge.landAirship() : gameBridge.boardAirship())}
                className={`p-2 rounded-lg cursor-pointer ${
                  hud.isFlying
                    ? 'text-[#f5cc6b] bg-[#e0a943]/20 hover:bg-[#e0a943]/30'
                    : 'text-[#cfd8e0] hover:text-white hover:bg-white/10'
                }`}
                title={hud.isFlying ? 'Land Airship [V]' : 'Launch Airship [V]'}
              >
                <Plane className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (hud.interiorId) pushToast('Step outdoors to photograph wildlife and horizons!');
                else gameBridge.takePhoto();
              }}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Take Wildlife Photo [P]"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'PHOTOS' ? null : 'PHOTOS')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Photo Album"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'MAP' ? null : 'MAP')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="World Map [M]"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'QUESTS' ? null : 'QUESTS')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Quests & Restoration [J]"
            >
              <ScrollText className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'INVENTORY' ? null : 'INVENTORY')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Inventory [I]"
            >
              <Backpack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'EQUIPMENT' ? null : 'EQUIPMENT')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Equipment & Gear [G]"
            >
              <Swords className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'CHARACTERS' ? null : 'CHARACTERS')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Characters & Outfits [C]"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'UPGRADES' ? null : 'UPGRADES')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Upgrade Tree [U]"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'JOURNAL' ? null : 'JOURNAL')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Collection Journal [B]"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                updateSettings({ muted: !save.settings.muted });
              }}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title={save.settings.muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {save.settings.muted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setScreen('PAUSED')}
              className="p-2 rounded-lg text-[#cfd8e0] hover:text-white hover:bg-white/10 cursor-pointer"
              title="Pause [Esc]"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {activeQuest && !activeModal && !activeDialogueNpcId && (
            <div className="max-w-xs px-3.5 py-2 rounded-lg bg-[#111921]/88 border border-[#2c3b4a] text-right">
              <div className="text-[11px] font-semibold text-[#e0a943]">{activeQuest.title}</div>
              <div className="text-xs text-[#dce4ea]">{activeQuest.step}</div>
            </div>
          )}

          <div className="flex flex-col items-end gap-1.5 mt-1">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#182530]/95 border border-[#e0a943]/60 text-xs font-medium text-[#f5ecd8] shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e0a943] shrink-0" />
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guardian Boss Bar */}
      {hud.activeGuardian && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
          <div className="px-4 py-2.5 rounded-xl bg-[#161924]/95 border border-[#7c6aa3] shadow-xl">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-display font-semibold text-[#f3efe6]">
                {hud.activeGuardian.name} · {hud.activeGuardian.title}
              </span>
              <span className="font-mono-tabular text-[#c792ea]">
                Phase {hud.activeGuardian.phase} · {hud.activeGuardian.purity}/{hud.activeGuardian.maxPurity}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#242038] overflow-hidden">
              <div
                style={{
                  width: `${(hud.activeGuardian.purity / Math.max(1, hud.activeGuardian.maxPurity)) * 100}%`,
                }}
                className="h-full bg-gradient-to-r from-[#c792ea] to-[#6ae0d6] transition-all duration-150"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interaction Prompt */}
      <div className="flex justify-center pb-2">
        {hud.interactPrompt && !activeDialogueNpcId && !activeModal && (
          <div className="px-4 py-2 rounded-lg bg-[#111921]/95 border border-[#e0a943]/70 text-xs font-semibold text-[#f5ecd8] shadow-lg">
            <span className="font-mono-tabular text-[#e0a943] mr-2">[E]</span>
            {hud.interactPrompt}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import {
  Anchor,
  Compass,
  Flag,
  MapPin,
  Navigation,
  RotateCcw,
  Shield,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GUARDIANS, LANDMARKS, REGIONS } from '../../data/progression';
import { TILE_SIZE } from '../../game/PixelArtGenerator';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../../game/WorldData';
import { useGame } from '../../state/GameStore';
import { RegionId } from '../../types/game';

interface MapZone {
  id: RegionId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bg: string;
  border: string;
}

const MAP_ZONES: MapZone[] = [
  // Mainland Aetheria (inside x: 60..180, y: 40..140)
  { id: 'forgotten_kingdom', label: 'Forgotten Kingdom', x: 60, y: 40, w: 66, h: 28, bg: '#382b57', border: '#6e56a6' },
  { id: 'frostpeak', label: 'Frostpeak Mountains', x: 126, y: 40, w: 54, h: 55, bg: '#325878', border: '#7eb7de' },
  { id: 'whispering_woods', label: 'Whispering Woods', x: 60, y: 68, w: 36, h: 45, bg: '#215238', border: '#5cb874' },
  { id: 'brightfall', label: 'Brightfall Town', x: 96, y: 68, w: 30, h: 45, bg: '#3e6e48', border: '#e0a943' },
  { id: 'brightfall', label: '', x: 126, y: 95, w: 54, h: 18, bg: '#3e6e48', border: '#e0a943' },
  { id: 'sunset_coast', label: 'Sunset Coast & Harbour', x: 60, y: 113, w: 120, h: 27, bg: '#c7a467', border: '#48b8c9' },
  // Six Surrounding Islands
  { id: 'lost_kingdom', label: 'Lost Kingdom', x: 12, y: 6, w: 42, h: 36, bg: '#33254f', border: '#ffd466' },
  { id: 'sky_island', label: 'Sky Island', x: 98, y: 4, w: 40, h: 30, bg: '#4f82a8', border: '#9ee8ff' },
  { id: 'frozen_kingdom', label: 'Frozen Kingdom', x: 184, y: 8, w: 44, h: 36, bg: '#47769c', border: '#98d6ff' },
  { id: 'haunted_island', label: 'Haunted Island', x: 8, y: 66, w: 40, h: 40, bg: '#34294a', border: '#b78ce6' },
  { id: 'volcanic_island', label: 'Volcanic Island', x: 186, y: 84, w: 42, h: 44, bg: '#632a20', border: '#ff7b47' },
  { id: 'wild_jungle', label: 'Wild Jungle', x: 10, y: 124, w: 42, h: 44, bg: '#1d5736', border: '#45b864' },
];

export const WorldMapModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    save,
    hud,
    fastTravel,
    getRegionRestorationPercent,
    setCustomWaypoint,
    getWaypointTarget,
  } = useGame();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; moved: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  if (activeModal !== 'MAP') return null;

  const overworldTileX = hud.interiorId ? save.playerPos.x / TILE_SIZE : hud.playerX / TILE_SIZE;
  const overworldTileY = hud.interiorId ? save.playerPos.y / TILE_SIZE : hud.playerY / TILE_SIZE;
  const playerPctX = Math.max(1, Math.min(99, (overworldTileX / WORLD_WIDTH) * 100));
  const playerPctY = Math.max(1, Math.min(99, (overworldTileY / WORLD_HEIGHT) * 100));

  const boatPctX = Math.max(1, Math.min(99, (save.boatPos.x / (WORLD_WIDTH * TILE_SIZE)) * 100));
  const boatPctY = Math.max(1, Math.min(99, (save.boatPos.y / (WORLD_HEIGHT * TILE_SIZE)) * 100));

  const activeTarget = getWaypointTarget();

  const clampPan = (nx: number, ny: number, z: number) => {
    const maxOffset = ((z - 1) * 280) / 1;
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, nx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, ny)),
    };
  };

  const handleZoom = (nextZoom: number) => {
    const clamped = Math.max(1, Math.min(2.6, Number(nextZoom.toFixed(1))));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan((p) => clampPan(p.x, p.y, clamped));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || zoom <= 1) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
      setPan(clampPan(dragRef.current.origX + dx, dragRef.current.origY + dy, zoom));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    if (wasMoved) return;

    // Ignore clicks on nested buttons
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;

    const u = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(0.999, (e.clientY - rect.top) / rect.height));
    const tileX = Math.floor(u * WORLD_WIDTH);
    const tileY = Math.floor(v * WORLD_HEIGHT);

    setCustomWaypoint({
      label: `Map Pin (${tileX}, ${tileY})`,
      tileX,
      tileY,
      kind: 'custom',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/85 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-[#141c24] border border-[#304252] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#273645]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#e0a943]" />
            <div>
              <h2 className="font-display text-lg font-semibold text-[#f3efe6]">Archipelago Map of Aetheria</h2>
              <p className="text-[11px] text-[#9aa6b2]">
                Click anywhere on the sea or islands to drop a compass pin · Click shrines or harbours to fast travel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0f161d] border border-[#283847] rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleZoom(zoom - 0.5)}
                disabled={zoom <= 1}
                className="p-1.5 rounded text-[#dce4ea] hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono-tabular text-[#e0a943]">{zoom.toFixed(1)}x</span>
              <button
                type="button"
                onClick={() => handleZoom(zoom + 0.5)}
                disabled={zoom >= 2.5}
                className="p-1.5 rounded text-[#dce4ea] hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoom > 1 && (
                <button
                  type="button"
                  onClick={() => handleZoom(1)}
                  className="p-1.5 rounded text-[#9aa6b2] hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {save.customWaypoint && (
              <button
                type="button"
                onClick={() => setCustomWaypoint(null)}
                className="px-2.5 py-1.5 rounded-lg bg-[#233240] hover:bg-[#2f4254] text-xs font-medium text-[#dce4ea] border border-[#34485c] cursor-pointer whitespace-nowrap"
              >
                Clear Pin
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-lg text-[#a5a095] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map + Sidebar */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto game-scroll">
          {/* Interactive Archipelago Map */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                dragRef.current.active = false;
              }}
              className={`relative aspect-[4/3] w-full rounded-lg bg-[#164863] border border-[#335870] overflow-hidden select-none ${
                zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
              }`}
            >
              {/* Transformable Map Plane */}
              <div
                ref={canvasRef}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="relative w-full h-full transition-transform duration-100"
              >
                {/* Sea Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
                    backgroundSize: '12.5% 16.666%',
                  }}
                />

                {/* Aetheria Sea Label */}
                <div className="absolute left-[46%] bottom-[7%] text-[10px] tracking-[0.22em] uppercase font-semibold text-[#8ed8eb]/55 pointer-events-none">
                  Aetheria Sea
                </div>

                {/* Regions & Islands */}
                {MAP_ZONES.map((rz, idx) => (
                  <div
                    key={`${rz.id}-${idx}`}
                    style={{
                      left: `${(rz.x / WORLD_WIDTH) * 100}%`,
                      top: `${(rz.y / WORLD_HEIGHT) * 100}%`,
                      width: `${(rz.w / WORLD_WIDTH) * 100}%`,
                      height: `${(rz.h / WORLD_HEIGHT) * 100}%`,
                      backgroundColor: rz.bg,
                      borderColor: rz.border,
                    }}
                    className="absolute rounded-md border p-1.5 pointer-events-none shadow-inner"
                  >
                    {rz.label && (
                      <span className="text-[9px] sm:text-[10px] font-semibold text-white/90 drop-shadow">
                        {rz.label}
                      </span>
                    )}
                  </div>
                ))}

                {/* Guardian Icons */}
                {Object.values(GUARDIANS).map((g) => {
                  const gx = (g.arenaX / WORLD_WIDTH) * 100;
                  const gy = (g.arenaY / WORLD_HEIGHT) * 100;
                  const purified = save.defeatedGuardians.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      style={{ left: `${gx}%`, top: `${gy}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center border shadow ${
                        purified
                          ? 'bg-emerald-500/90 border-emerald-100 text-[#0e151b]'
                          : 'bg-purple-600/90 border-purple-200 text-white'
                      }`}
                      title={`${g.name} · ${g.title} (${purified ? 'Purified' : 'Guardian Arena'})`}
                    >
                      <Shield className="w-3 h-3" />
                    </div>
                  );
                })}

                {/* Landmarks, Shrines & Island Harbours */}
                {LANDMARKS.map((lm) => {
                  const lx = (lm.tileX / WORLD_WIDTH) * 100;
                  const ly = (lm.tileY / WORLD_HEIGHT) * 100;
                  const discovered = save.discoveredLandmarks.includes(lm.id);
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      disabled={!discovered || !lm.isFastTravel}
                      onClick={() => fastTravel(lm.id)}
                      style={{ left: `${lx}%`, top: `${ly}%` }}
                      title={
                        discovered
                          ? `${lm.name}${lm.isFastTravel ? ' — Click to Fast Travel' : ''}`
                          : `Undiscovered (${REGIONS[lm.region]?.name ?? 'Archipelago'})`
                      }
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center border transition-transform z-10 ${
                        discovered
                          ? lm.isHarbour
                            ? 'bg-[#38b6d4] border-white text-[#0d1921] hover:scale-125 cursor-pointer'
                            : lm.isFastTravel
                              ? 'bg-[#e0a943] border-white text-[#111921] hover:scale-125 cursor-pointer'
                              : 'bg-[#5cb874] border-white text-[#0f1b13]'
                          : 'bg-[#1a222b]/90 border-[#506273] text-[#7a8a99]'
                      }`}
                    >
                      {lm.isHarbour ? <Anchor className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}

                {/* Moored Boat Marker */}
                <div
                  style={{ left: `${boatPctX}%`, top: `${boatPctY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#102636] border border-[#7be3f5] text-[#7be3f5] flex items-center justify-center z-10 pointer-events-none shadow"
                  title="Your Moored Boat"
                >
                  <Anchor className="w-3 h-3" />
                </div>

                {/* Custom / Quest Waypoint Pin */}
                {activeTarget && (
                  <div
                    style={{
                      left: `${(activeTarget.tileX / WORLD_WIDTH) * 100}%`,
                      top: `${(activeTarget.tileY / WORLD_HEIGHT) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none"
                    title={activeTarget.label}
                  >
                    <div className="px-1.5 py-0.5 rounded bg-[#f5cc6b] text-[#111921] border border-white shadow-lg flex items-center gap-1 text-[9px] font-bold whitespace-nowrap">
                      <Flag className="w-2.5 h-2.5" />
                      {activeTarget.kind === 'custom' ? 'PIN' : 'QUEST'}
                    </div>
                  </div>
                )}

                {/* Player Live Marker */}
                <div
                  style={{ left: `${playerPctX}%`, top: `${playerPctY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_8px_rgba(255,212,102,0.9)] z-30 pointer-events-none"
                  title={hud.interiorId ? 'You are indoors near here' : 'You are here'}
                />
              </div>
            </div>

            {/* Map Legend Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0f161d] border border-[#243240] text-[11px] text-[#b8c4ce]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-amber-400" />
                  Player
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e0a943]" />
                  Shrine
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38b6d4]" />
                  Harbour / Boat
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Guardian
                </span>
              </div>
              {activeTarget && (
                <span className="text-[#f5cc6b] font-medium">
                  Compass: {activeTarget.label}
                </span>
              )}
            </div>
          </div>

          {/* Right Sidebar: Fast Travel & 12-Region Restoration */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-[#e0a943] mb-2">Fast Travel Shrines & Harbours</h3>
              <div className="space-y-1.5 max-h-52 overflow-y-auto game-scroll pr-1">
                {LANDMARKS.filter((l) => l.isFastTravel).map((lm) => {
                  const found = save.discoveredLandmarks.includes(lm.id);
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      disabled={!found}
                      onClick={() => fastTravel(lm.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border text-left transition-colors ${
                        found
                          ? 'bg-[#1d2834] hover:bg-[#273747] border-[#34485c] text-[#f3efe6] cursor-pointer'
                          : 'bg-[#121921] border-[#24303c] text-[#6d7b88] cursor-not-allowed'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {found ? lm.name : `Undiscovered (${REGIONS[lm.region]?.name ?? 'Island'})`}
                      </span>
                      {found && (
                        lm.isHarbour ? (
                          <Anchor className="w-3.5 h-3.5 text-[#48b8c9] shrink-0" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-[#e0a943] shrink-0" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#87d4c8] mb-2">Archipelago Recovery</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto game-scroll pr-1">
                {(Object.keys(REGIONS) as RegionId[])
                  .filter((rId) => rId !== 'ocean')
                  .map((rId) => {
                    const pct = getRegionRestorationPercent(rId);
                    return (
                      <div key={rId} className="space-y-1">
                        <div className="flex justify-between text-xs text-[#dce4ea]">
                          <span>{REGIONS[rId].name}</span>
                          <span className="font-mono-tabular">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1f2b38] overflow-hidden">
                          <div style={{ width: `${pct}%`, backgroundColor: REGIONS[rId].accentColor }} className="h-full" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

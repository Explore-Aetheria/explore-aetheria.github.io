import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Anchor,
  Compass,
  Flag,
  MapPin,
  Navigation,
  Plane,
  RotateCcw,
  Shield,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GUARDIANS, LANDMARKS, REGIONS } from '../../data/progression';
import { TILE_SIZE } from '../../game/PixelArtGenerator';
import { buildOverworldGrid, getMovingIslandSlotCoords, WORLD_HEIGHT, WORLD_WIDTH } from '../../game/WorldData';
import { useGame } from '../../state/GameStore';
import { RegionId } from '../../types/game';

const TILE_COLORS: Record<number, [number, number, number]> = {
  0: [92, 156, 88],    // Lush Grass
  1: [118, 178, 96],   // Meadow Flower Grass
  2: [168, 152, 126],  // Cobble Plaza
  3: [158, 122, 82],   // Trail Dirt
  4: [46, 108, 68],    // Whispering Woods Canopy
  5: [36, 90, 58],     // Deep Forest
  6: [224, 198, 134],  // Coastal Beach Sand
  7: [66, 178, 196],   // Shallow Reef Turquoise
  8: [24, 78, 118],    // Deep Aetheria Ocean
  9: [148, 104, 62],   // Timber Bridge / Pier
  10: [208, 228, 244], // Alpine Snow
  11: [130, 186, 224], // Glacial Ice
  12: [122, 114, 136], // Ancient Ruins Stone
  13: [94, 84, 118],   // Citadel Plaza
  14: [74, 82, 98],    // Mountain Cliff
  15: [54, 110, 74],   // Tall Border Hedge
  28: [36, 122, 68],   // Wild Jungle
  29: [86, 56, 52],    // Volcanic Basalt
  30: [236, 102, 46],  // Glowing Magma Channel
  31: [212, 228, 240], // Sky Marble
  32: [64, 54, 92],    // Haunted Mistvale Turf
  33: [48, 146, 82],   // Football Pitch
  34: [198, 112, 58],  // Basketball Court
  35: [112, 138, 66],  // Orchard Crop Rows
  36: [156, 194, 218], // Sky Cliff
  37: [96, 106, 120],  // Brightfall Crosswalk Avenue
  38: [128, 108, 86],  // Railway Tracks
  39: [128, 88, 166],  // Starfall Amusement Plaza
  42: [52, 132, 90],   // Tennis Court
  43: [74, 192, 228],  // Olympic Pool
  44: [142, 168, 224], // Crystal Light Tile
  45: [108, 196, 132], // Verdant Meadow
  48: [110, 212, 206], // Geothermal Hot Springs
};

const REGION_LABELS: { name: string; xPct: number; yPct: number }[] = [
  { name: 'Lost Kingdom', xPct: 12.5, yPct: 14 },
  { name: 'Sky Island', xPct: 50, yPct: 12 },
  { name: 'Frozen Kingdom', xPct: 84, yPct: 15 },
  { name: 'Haunted Island', xPct: 12, yPct: 53 },
  { name: 'Volcanic Island', xPct: 86, yPct: 54 },
  { name: 'Wild Jungle', xPct: 15, yPct: 85 },
  { name: 'Brightfall City', xPct: 48.5, yPct: 50.5 },
  { name: 'Whispering Woods', xPct: 37.5, yPct: 52 },
  { name: 'Frostpeak', xPct: 58, yPct: 38.5 },
  { name: 'Sunset Coast', xPct: 51, yPct: 65.5 },
  { name: 'Starfall Park', xPct: 61, yPct: 55 },
  { name: 'Newbrook', xPct: 40, yPct: 39.5 },
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
  const mapPlaneRef = useRef<HTMLDivElement | null>(null);
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const worldGrid = useMemo(() => buildOverworldGrid(save), [save]);

  useEffect(() => {
    if (activeModal !== 'MAP') return;
    const canvas = terrainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2;
    const w = WORLD_WIDTH * scale;
    const h = WORLD_HEIGHT * scale;
    canvas.width = w;
    canvas.height = h;

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const mi = getMovingIslandSlotCoords(save.movingIslandSlot);

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        let tile = worldGrid[y][x];

        // Hide Moving Island silhouette on map until discovered
        if (!save.movingIslandFound && Math.hypot(x - mi.x, y - mi.y) <= 14) {
          tile = 8;
        }

        const isSea = tile === 8;
        const nTop = y > 0 ? worldGrid[y - 1][x] : 8;
        const nLeft = x > 0 ? worldGrid[y][x - 1] : 8;
        const nBot = y < WORLD_HEIGHT - 1 ? worldGrid[y + 1][x] : 8;
        const nRight = x < WORLD_WIDTH - 1 ? worldGrid[y][x + 1] : 8;

        const isCoastInk =
          !isSea &&
          tile !== 7 &&
          (nTop === 8 || nLeft === 8 || nBot === 8 || nRight === 8 || nTop === 7 || nLeft === 7);

        let rgb = TILE_COLORS[tile] ?? [92, 156, 88];
        if (isSea) {
          // Subtle sea depth & cartographic wave striping
          const ripple = ((x + y) % 14 === 0 ? 5 : 0) - Math.round((Math.sin(x * 0.06) + Math.cos(y * 0.08)) * 4);
          rgb = [Math.max(12, rgb[0] + ripple), Math.max(40, rgb[1] + ripple), Math.max(70, rgb[2] + ripple * 2)];
        } else if (isCoastInk) {
          rgb = [44, 52, 58];
        } else if (nTop === 14 || nLeft === 14) {
          rgb = [Math.max(0, rgb[0] - 14), Math.max(0, rgb[1] - 14), Math.max(0, rgb[2] - 12)];
        }

        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const idx = ((y * scale + sy) * w + (x * scale + sx)) * 4;
            data[idx] = rgb[0];
            data[idx + 1] = rgb[1];
            data[idx + 2] = rgb[2];
            data[idx + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [activeModal, worldGrid, save.movingIslandFound, save.movingIslandSlot]);

  if (activeModal !== 'MAP') return null;

  const overworldTileX = hud.interiorId ? save.playerPos.x / TILE_SIZE : hud.playerX / TILE_SIZE;
  const overworldTileY = hud.interiorId ? save.playerPos.y / TILE_SIZE : hud.playerY / TILE_SIZE;
  const playerPctX = Math.max(1, Math.min(99, (overworldTileX / WORLD_WIDTH) * 100));
  const playerPctY = Math.max(1, Math.min(99, (overworldTileY / WORLD_HEIGHT) * 100));

  const boatPctX = Math.max(1, Math.min(99, (save.boatPos.x / (WORLD_WIDTH * TILE_SIZE)) * 100));
  const boatPctY = Math.max(1, Math.min(99, (save.boatPos.y / (WORLD_HEIGHT * TILE_SIZE)) * 100));

  const airPctX = Math.max(1, Math.min(99, (save.airship.pos.x / (WORLD_WIDTH * TILE_SIZE)) * 100));
  const airPctY = Math.max(1, Math.min(99, (save.airship.pos.y / (WORLD_HEIGHT * TILE_SIZE)) * 100));

  const activeTarget = getWaypointTarget();

  const clampPan = (nx: number, ny: number, z: number) => {
    const maxOffset = (z - 1) * 320;
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, nx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, ny)),
    };
  };

  const handleZoom = (nextZoom: number) => {
    const clamped = Math.max(1, Math.min(3.5, Number(nextZoom.toFixed(1))));
    setZoom(clamped);
    if (clamped === 1) setPan({ x: 0, y: 0 });
    else setPan((p) => clampPan(p.x, p.y, clamped));
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
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = mapPlaneRef.current?.getBoundingClientRect();
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
      <div className="w-full max-w-6xl rounded-xl bg-[#141c24] border border-[#304252] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#273645]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#e0a943]" />
            <div>
              <h2 className="font-display text-lg font-semibold text-[#f3efe6]">Illustrated Atlas of Aetheria</h2>
              <p className="text-[11px] text-[#9aa6b2]">
                Terrain-charted archipelago · Click sea or land to pin a compass waypoint · Click shrines, harbours, or skyports to fast travel
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
                disabled={zoom >= 3.5}
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
          {/* Interactive Illustrated Archipelago Map */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                dragRef.current.active = false;
              }}
              className={`relative aspect-[4/3] w-full rounded-lg bg-[#184e76] border-2 border-[#426680] overflow-hidden select-none shadow-inner ${
                zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
              }`}
            >
              <div
                ref={mapPlaneRef}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="relative w-full h-full transition-transform duration-100"
              >
                {/* Live Organic Terrain Canvas */}
                <canvas
                  ref={terrainCanvasRef}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Dotted Sea Routes & Nautical Grid */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
                  <path d="M51 67 Q36 74 22 82" stroke="#f5cc6b" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                  <path d="M51 67 Q28 60 19 56" stroke="#f5cc6b" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                  <path d="M51 67 Q72 62 77 58" stroke="#f5cc6b" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                  <path d="M51 67 Q75 40 78 24" stroke="#f5cc6b" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                  <path d="M51 67 Q50 38 50 22" stroke="#7be3f5" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                  <path d="M51 67 Q25 45 18 24" stroke="#f5cc6b" strokeWidth="0.45" strokeDasharray="1.2 1.2" fill="none" />
                </svg>

                {/* Geographic Labels */}
                {REGION_LABELS.map((lbl) => (
                  <div
                    key={lbl.name}
                    style={{ left: `${lbl.xPct}%`, top: `${lbl.yPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#0c141c]/65 text-[9px] sm:text-[10px] font-semibold text-[#f5efe2] tracking-wide pointer-events-none whitespace-nowrap shadow"
                  >
                    {lbl.name}
                  </div>
                ))}

                {save.movingIslandFound && (
                  <div
                    style={{
                      left: `${(getMovingIslandSlotCoords(save.movingIslandSlot).x / WORLD_WIDTH) * 100}%`,
                      top: `${(getMovingIslandSlotCoords(save.movingIslandSlot).y / WORLD_HEIGHT) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-4 px-1.5 py-0.5 rounded bg-[#0c141c]/80 text-[9px] font-semibold text-[#7be3f5] pointer-events-none whitespace-nowrap"
                  >
                    Driftspire Isle
                  </div>
                )}

                {/* Guardian Icons (overworld guardians) */}
                {Object.values(GUARDIANS)
                  .filter((g) => g.region !== 'dim_void' && (g.region !== 'moving_island' || save.movingIslandFound))
                  .map((g) => {
                    const gx = (g.arenaX / WORLD_WIDTH) * 100;
                    const gy = (g.arenaY / WORLD_HEIGHT) * 100;
                    const purified = save.defeatedGuardians.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        style={{ left: `${gx}%`, top: `${gy}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center border shadow ${
                          purified
                            ? 'bg-emerald-500 border-emerald-100 text-[#0e151b]'
                            : 'bg-purple-600 border-purple-200 text-white'
                        }`}
                        title={`${g.name} · ${g.title} (${purified ? 'Purified' : 'Guardian Arena'})`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                      </div>
                    );
                  })}

                {/* Landmarks, Shrines, Dungeons & Harbours */}
                {LANDMARKS.filter((lm) => lm.id !== 'lm_moving_island' || save.movingIslandFound).map((lm) => {
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
                          ? lm.isSkyport
                            ? 'bg-sky-300 border-white text-[#0d1921] hover:scale-125 cursor-pointer'
                            : lm.isHarbour
                              ? 'bg-[#38b6d4] border-white text-[#0d1921] hover:scale-125 cursor-pointer'
                              : lm.isFastTravel
                                ? 'bg-[#e0a943] border-white text-[#111921] hover:scale-125 cursor-pointer'
                                : 'bg-[#5cb874] border-white text-[#0f1b13]'
                          : 'bg-[#1a222b]/90 border-[#506273] text-[#7a8a99]'
                      }`}
                    >
                      {lm.isSkyport ? (
                        <Plane className="w-2.5 h-2.5" />
                      ) : lm.isHarbour ? (
                        <Anchor className="w-2.5 h-2.5" />
                      ) : (
                        <MapPin className="w-2.5 h-2.5" />
                      )}
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

                {/* Airship Marker */}
                {save.airship.unlocked && (
                  <div
                    style={{ left: `${airPctX}%`, top: `${airPctY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#241b12] border border-[#ffd466] text-[#ffd466] flex items-center justify-center z-10 pointer-events-none shadow"
                    title="Your Flying Airship"
                  >
                    <Plane className="w-3 h-3" />
                  </div>
                )}

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
                  title={hud.interiorId ? 'You are exploring an interior near here' : 'You are here'}
                />
              </div>

              {/* Compass Rose Emblem */}
              <div className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#0f1720]/85 border border-[#e0a943]/60 flex items-center justify-center pointer-events-none">
                <div className="text-center leading-none">
                  <div className="text-[8px] font-bold text-[#e0a943]">N</div>
                  <Compass className="w-4 h-4 text-[#f5efe2] mx-auto" />
                </div>
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
                  Shrine / Town
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38b6d4]" />
                  Harbour / Boat
                </span>
                {save.airship.unlocked && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                    Skyport / Airship
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Guardian
                </span>
              </div>
              {activeTarget && <span className="text-[#f5cc6b] font-medium">Compass: {activeTarget.label}</span>}
            </div>
          </div>

          {/* Right Sidebar: Fast Travel & Region Recovery */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-[#e0a943] mb-2">Fast Travel Shrines, Harbours & Skyports</h3>
              <div className="space-y-1.5 max-h-56 overflow-y-auto game-scroll pr-1">
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
                        {found ? lm.name : `Undiscovered (${REGIONS[lm.region]?.name ?? 'Archipelago'})`}
                      </span>
                      {found &&
                        (lm.isSkyport ? (
                          <Plane className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                        ) : lm.isHarbour ? (
                          <Anchor className="w-3.5 h-3.5 text-[#48b8c9] shrink-0" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-[#e0a943] shrink-0" />
                        ))}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#87d4c8] mb-2">Aetheria Recovery Atlas</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto game-scroll pr-1">
                {(Object.keys(REGIONS) as RegionId[])
                  .filter((rId) => rId !== 'ocean' && (rId !== 'moving_island' || save.movingIslandFound))
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

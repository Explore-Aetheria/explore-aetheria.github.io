import React, { useEffect, useRef, useState } from 'react';
import { Award, Play, RotateCcw, Trophy, Wind, X } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';
import { COMPANIONS } from '../../data/companions';
import { EQUIPMENT_CATALOG, FISH_SPECIES, FishSpeciesDef } from '../../data/equipmentAndFood';
import { TILE_SIZE } from '../../game/PixelArtGenerator';
import { getWaterTypeAt } from '../../game/WorldData';
import { useGame } from '../../state/GameStore';
import { MiniGameId, TimePhase, WeatherType } from '../../types/game';

interface BriefingInfo {
  title: string;
  subtitle: string;
  controls: string;
  goal: string;
  rewardHint: string;
}

const BRIEFINGS: Record<MiniGameId, BriefingInfo> = {
  archery: {
    title: 'Aether Archery Range',
    subtitle: 'Track wind drift & hit moving ring targets cleanly.',
    controls: 'Aim & Click (bullseye center awards double points)',
    goal: 'Chain consecutive hits in 25s while adjusting for wind.',
    rewardHint: '100+ pts unlocks Kael, The Frost Peak Mountaineer.',
  },
  fishing: {
    title: 'Tidewater Fishing',
    subtitle: 'Cast into local waters, spot the bobber plunge & reel!',
    controls: 'Spacebar or Click/Hold button to cast, hook & reel tension',
    goal: 'Catch rare biome/weather species across 4 casts.',
    rewardHint: 'Catch 4 species to unlock Splash the Otter & unlock Marina!',
  },
  rhythm: {
    title: 'Harmony Rhythm Stage',
    subtitle: 'Perform with Brightfall’s festival ensemble.',
    controls: 'D, F, J, K keys (or click lane buttons) on the beat',
    goal: 'Strike notes smoothly as they cross the golden chord bar.',
    rewardHint: 'Top scores earn Festival Sparks & Rhythm Trophy.',
  },
  timeslide: {
    title: 'Frostpeak Alpine Slalom',
    subtitle: 'Carve down snowy chutes between frost slalom flags.',
    controls: 'A / D or Arrow Keys (or click snow chute lane)',
    goal: 'Thread gold slalom gates & launch ramps while dodging boulders.',
    rewardHint: '100+ pts proves alpine agility across Frostpeak.',
  },
  runememory: {
    title: 'Ancient Rune Memory Seal',
    subtitle: 'Attune the four elemental chimes in exact sequence.',
    controls: 'Watch pattern, then Click the glowing rune tiles in order',
    goal: 'Complete all 4 ascending harmonic sequences without error.',
    rewardHint: 'Clear Round 4 (100+ pts) to unlock Sora, The Dawnkeeper!',
  },
  football: {
    title: 'Brightfall Football Penalty',
    subtitle: 'Outsmart Brightfall’s diving goalkeeper from the spot.',
    controls: 'Spacebar or Click "Kick Ball!" to fire toward aim cursor',
    goal: 'Curl shots into top corners across 6 penalty kicks.',
    rewardHint: 'High corner strikes award 35 pts each.',
  },
  basketball: {
    title: 'Brightfall Basketball Hoops',
    subtitle: 'Time clean arc releases for consecutive 3-point swishes.',
    controls: 'Spacebar or Click "Shoot Hoops!" inside green swish zone',
    goal: 'Build multi-shot streaks during the 25s clock.',
    rewardHint: 'Consecutive swishes build massive streak bonuses.',
  },
  bicyclerace: {
    title: 'Brightfall Trail Bicycle Race',
    subtitle: 'Outpace 3 rival cyclists along a 800m winding park course.',
    controls: 'A / D or Mouse Move to steer · Spacebar / Click to Sprint',
    goal: 'Hit speed chevrons, manage stamina & cross the finish 1st!',
    rewardHint: '1st Place finishes award a massive Gold Podium bonus.',
  },
  boatrace: {
    title: 'Ocean Boat Slalom Race',
    subtitle: 'Steer your vessel through drifting sea buoys & reefs.',
    controls: 'A / D or Mouse Move across waves',
    goal: 'Thread turquoise buoys cleanly; Boat upgrades boost steer speed.',
    rewardHint: 'Earn Marina renown & Sparks based on gate score.',
  },
  cooking: {
    title: 'Golden Skillet Cooking',
    subtitle: 'Master four culinary stages inside Brightfall’s bistro.',
    controls: 'Spacebar or Click "Cook Step!" inside the golden heat band',
    goal: 'Nail every course timing across all 4 dishes.',
    rewardHint: 'Score 70+ pts to receive a complimentary Berry Tart!',
  },
  tennis: {
    title: 'Brightfall Grand Tennis',
    subtitle: 'Rally across center court & place sharp cross-court aces.',
    controls: 'A / D or Mouse Move to slide along baseline',
    goal: 'Return shots cleanly & beat the rival baseline player.',
    rewardHint: 'Long rallies & aces quickly build championship points.',
  },
  swimming: {
    title: 'Olympic 100m Swimming',
    subtitle: 'Sprint four lanes in Brightfall’s Aquatics Center.',
    controls: 'Alternate A and D (or click Left / Right) in brisk rhythm',
    goal: 'Touch the wall 1st ahead of Leo, Marina, and Theo.',
    rewardHint: '1st Place wins the 160pt Gold Aquatics payout.',
  },
  carnival: {
    title: 'Starfall Carnival Midway',
    subtitle: 'Gallery booths with gliding stars, balloons & rail ducks.',
    controls: 'Aim & Click moving targets across 3 midway shelves',
    goal: 'Prioritize Star targets (30 pts) & Balloons (20 pts) in 25s.',
    rewardHint: 'High midway tallies award extra Sparks.',
  },
};

/* 1. AETHER ARCHERY */
const ArcheryGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wind, setWind] = useState(1.2);
  const [shots, setShots] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; dx: number; bonus: boolean }[]>([
    { id: 1, x: 25, y: 34, dx: 0.9, bonus: false },
    { id: 2, x: 68, y: 58, dx: -1.15, bonus: true },
    { id: 3, x: 46, y: 46, dx: 0.75, bonus: false },
  ]);
  const shotId = useRef(1);

  useEffect(() => {
    const moveTimer = window.setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => {
          let nx = t.x + t.dx;
          let ndx = t.dx;
          if (nx < 10 || nx > 90) {
            ndx = -ndx;
            nx = Math.max(10, Math.min(90, nx));
          }
          return { ...t, x: nx, dx: ndx };
        })
      );
    }, 30);
    const windTimer = window.setInterval(() => {
      setWind(Number(((Math.random() - 0.5) * 4.4).toFixed(1)));
    }, 5500);
    return () => {
      window.clearInterval(moveTimer);
      window.clearInterval(windTimer);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  const spawnPopup = (x: number, y: number, text: string) => {
    const id = shotId.current++;
    setShots((prev) => [...prev, { id, x, y, text }]);
    window.setTimeout(() => setShots((prev) => prev.filter((s) => s.id !== id)), 520);
  };

  const shootAtBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100 + wind * 1.4;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let hitOne: { id: number; bonus: boolean; bullseye: boolean } | null = null;
    for (const t of targets) {
      const dist = Math.hypot(clickX - t.x, clickY - t.y);
      if (dist <= 7.5) {
        hitOne = { id: t.id, bonus: t.bonus, bullseye: dist <= 3.1 };
        break;
      }
    }

    if (!hitOne) {
      soundEngine.playHit();
      setCombo(0);
      spawnPopup(clickX, clickY, 'Miss');
      return;
    }

    soundEngine.playBolt();
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    const base = hitOne.bonus ? 28 : 16;
    const pts = base + (hitOne.bullseye ? 14 : 0) + Math.min(20, nextCombo * 2);
    setScore((s) => s + pts);
    spawnPopup(clickX, clickY, hitOne.bullseye ? `BULLSEYE +${pts}` : `+${pts}`);

    setTargets((prev) =>
      prev.map((t) =>
        t.id === hitOne!.id
          ? {
              ...t,
              x: 15 + Math.random() * 70,
              y: 18 + Math.random() * 62,
              dx: (Math.random() > 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.95),
              bonus: Math.random() > 0.68,
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span className="inline-flex items-center gap-1 text-[#87d4c8]">
          <Wind className="w-3.5 h-3.5" /> Wind: {wind >= 0 ? `→ ${wind}` : `← ${Math.abs(wind)}`}
        </span>
        <span>Combo: {combo}x</span>
        <span className="text-amber-300 font-semibold text-sm">Score: {score}</span>
      </div>
      <div
        onClick={shootAtBoard}
        className="relative w-full h-80 rounded-lg bg-gradient-to-b from-[#172838] via-[#19303b] to-[#1f3b32] border border-[#324656] overflow-hidden cursor-crosshair select-none"
      >
        {/* Distance range lines */}
        <div className="absolute inset-x-0 top-[28%] border-t border-white/10 pointer-events-none" />
        <div className="absolute inset-x-0 top-[56%] border-t border-white/10 pointer-events-none" />
        {targets.map((t) => (
          <div
            key={t.id}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 flex items-center justify-center pointer-events-none ${
              t.bonus
                ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                : 'bg-teal-400/25 border-teal-300 text-teal-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-current border-2 border-white" />
          </div>
        ))}
        {shots.map((s) => (
          <div
            key={s.id}
            style={{ left: `${Math.max(8, Math.min(92, s.x))}%`, top: `${Math.max(10, Math.min(90, s.y))}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-[#0e151c]/90 text-[11px] font-bold text-[#ffd466] pointer-events-none"
          >
            {s.text}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Click moving rings before time runs out! Lead slightly against wind drift for Bullseyes.</p>
    </div>
  );
};

/* 2. TIDEWATER FISHING (Animated Water Scene + Companion + Full Tackle System) */
type WaterKind = 'harbour' | 'river' | 'lake' | 'beach' | 'ocean' | 'frozen' | 'jungle' | 'underground';

function pickCaughtFish(
  waterType: WaterKind,
  weather: WeatherType,
  timePhase: TimePhase,
  rarityBonus: number
): FishSpeciesDef {
  const candidates = FISH_SPECIES.filter((f) => {
    const waterMatch = f.waters.includes(waterType);
    if (!waterMatch) return false;
    if (f.requiredWeather && !f.requiredWeather.includes(weather)) return false;
    if (f.requiredTime && !f.requiredTime.includes(timePhase)) return false;
    return true;
  });
  const pool = candidates.length > 0 ? candidates : FISH_SPECIES.filter((f) => f.waters.includes(waterType));
  const safePool = pool.length > 0 ? pool : [FISH_SPECIES[0]];
  const weighted: FishSpeciesDef[] = [];
  safePool.forEach((f) => {
    let w =
      f.rarity === 'Legendary'
        ? 1 + Math.floor(rarityBonus / 20)
        : f.rarity === 'Rare'
          ? 2 + Math.floor(rarityBonus / 15)
          : f.rarity === 'Uncommon'
            ? 5
            : 8;
    w = Math.max(1, w);
    for (let i = 0; i < w; i++) weighted.push(f);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

const FishingGame: React.FC<{
  waterType: WaterKind;
  weather: WeatherType;
  timePhase: TimePhase;
  rodId: string;
  lineId: string;
  baitId: string;
  hookId: string;
  companionBonus: number;
  onCatchFish: (fishId: string, points: number) => void;
  onFinish: (score: number) => void;
}> = ({ waterType, weather, timePhase, rodId, lineId, baitId, hookId, companionBonus, onCatchFish, onFinish }) => {
  const rod = EQUIPMENT_CATALOG[rodId];
  const line = EQUIPMENT_CATALOG[lineId];
  const bait = EQUIPMENT_CATALOG[baitId];
  const hook = EQUIPMENT_CATALOG[hookId];

  const fishingBonus =
    (rod?.fishingBonus ?? 0) +
    (line?.fishingBonus ?? 0) +
    (bait?.fishingBonus ?? 0) +
    (hook?.fishingBonus ?? 0) +
    companionBonus;
  const rarityBonus = (rod?.rarityBonus ?? 0) + (bait?.rarityBonus ?? 0) + companionBonus;
  const zoneHalf = Math.min(28, 13 + Math.round(fishingBonus * 0.16));
  const fishDriftFactor = Math.max(0.48, 1 - (line?.fishingBonus ?? 0) * 0.015);

  const [phase, setPhase] = useState<'CAST' | 'WAITING' | 'BITE' | 'REEL'>('CAST');
  const [castsLeft, setCastsLeft] = useState(4);
  const [score, setScore] = useState(0);
  const [caughtCard, setCaughtCard] = useState<{ fish: FishSpeciesDef; pts: number; sizeCm: number } | null>(null);
  const [statusText, setStatusText] = useState(
    `Ready at ${waterType} waters with ${rod?.name ?? 'Rod'} + ${bait?.name ?? 'Bait'}.`
  );
  const [hudBars, setHudBars] = useState({ markerPos: 50, zoneCenter: 50, reelProgress: 42, biteTimerPct: 100 });

  const stateRef = useRef({
    phase: 'CAST' as 'CAST' | 'WAITING' | 'BITE' | 'REEL',
    markerPos: 50,
    markerVel: 0,
    zoneCenter: 50,
    zoneVel: 18,
    reelProgress: 42,
    holdingReel: false,
    castsLeft: 4,
    score: 0,
    waitRemaining: 0,
    biteRemaining: 0,
    biteMax: 2.2,
  });

  useEffect(() => {
    stateRef.current.phase = phase;
  }, [phase]);

  const beginCast = () => {
    soundEngine.playSplash();
    const waitTime = Math.max(0.75, 1.3 + Math.random() * 1.1 - fishingBonus * 0.012);
    stateRef.current.phase = 'WAITING';
    stateRef.current.waitRemaining = waitTime;
    setCaughtCard(null);
    setPhase('WAITING');
    setStatusText('Bobber is drifting smoothly... watch the ripples!');
  };

  const hookFish = () => {
    if (stateRef.current.phase !== 'BITE') return;
    soundEngine.playSplash();
    stateRef.current.phase = 'REEL';
    stateRef.current.markerPos = 50;
    stateRef.current.markerVel = 0;
    stateRef.current.zoneCenter = 50;
    stateRef.current.zoneVel = (Math.random() > 0.5 ? 1 : -1) * (20 * fishDriftFactor);
    stateRef.current.reelProgress = 42;
    stateRef.current.holdingReel = false;
    setPhase('REEL');
    setStatusText('Hold Space or "Hold to Reel!" to keep the gold float inside the teal fish wave!');
  };

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const st = stateRef.current;

      if (st.phase === 'WAITING') {
        st.waitRemaining -= dt;
        if (st.waitRemaining <= 0) {
          soundEngine.playCollect();
          const biteWindow = 1.9 + ((hook?.fishingBonus ?? 0) * 0.04);
          st.biteMax = biteWindow;
          st.biteRemaining = biteWindow;
          st.phase = 'BITE';
          setPhase('BITE');
          setStatusText('A FISH IS BITING! Press Space or Click "Hook Fish!" now!');
        }
      } else if (st.phase === 'BITE') {
        st.biteRemaining -= dt;
        setHudBars((prev) => ({
          ...prev,
          biteTimerPct: Math.max(0, (st.biteRemaining / Math.max(0.1, st.biteMax)) * 100),
        }));
        if (st.biteRemaining <= 0) {
          soundEngine.playHit();
          st.castsLeft -= 1;
          setCastsLeft(st.castsLeft);
          setStatusText('Too slow—the fish slipped away!');
          if (st.castsLeft <= 0) {
            onFinish(st.score);
            return;
          }
          st.phase = 'CAST';
          setPhase('CAST');
        }
      } else if (st.phase === 'REEL') {
        const accel = st.holdingReel ? 125 : -98;
        st.markerVel = Math.max(-72, Math.min(72, st.markerVel + accel * dt));
        st.markerPos = Math.max(4, Math.min(96, st.markerPos + st.markerVel * dt));
        if (st.markerPos <= 4 || st.markerPos >= 96) st.markerVel *= -0.25;

        if (Math.random() < dt * 1.4) {
          st.zoneVel = (Math.random() - 0.5) * 46 * fishDriftFactor;
        }
        st.zoneCenter += st.zoneVel * dt;
        if (st.zoneCenter < 20) {
          st.zoneCenter = 20;
          st.zoneVel = Math.abs(st.zoneVel) + 8;
        } else if (st.zoneCenter > 80) {
          st.zoneCenter = 80;
          st.zoneVel = -Math.abs(st.zoneVel) - 8;
        }

        const inZone = Math.abs(st.markerPos - st.zoneCenter) <= zoneHalf;
        const gainRate = 29 + (hook?.fishingBonus ?? 0) * 0.25;
        const loseRate = 17;
        st.reelProgress = Math.max(0, Math.min(100, st.reelProgress + (inZone ? gainRate : -loseRate) * dt));

        setHudBars({
          markerPos: st.markerPos,
          zoneCenter: st.zoneCenter,
          reelProgress: st.reelProgress,
          biteTimerPct: 100,
        });

        if (st.reelProgress >= 100) {
          soundEngine.playChest();
          const fish = pickCaughtFish(waterType, weather, timePhase, rarityBonus);
          const catchPts = fish.points + Math.floor(Math.random() * 18);
          const sizeCm = 24 + Math.floor(fish.points * 0.7 + Math.random() * 25);
          onCatchFish(fish.id, catchPts);
          st.score += catchPts;
          st.castsLeft -= 1;
          setScore(st.score);
          setCastsLeft(st.castsLeft);
          setCaughtCard({ fish, pts: catchPts, sizeCm });
          setStatusText(`Landed a ${fish.name} (${fish.rarity})!`);
          st.holdingReel = false;
          if (st.castsLeft <= 0) {
            window.setTimeout(() => onFinish(st.score), 900);
            return;
          }
          st.phase = 'CAST';
          setPhase('CAST');
        } else if (st.reelProgress <= 0) {
          soundEngine.playHit();
          st.castsLeft -= 1;
          setCastsLeft(st.castsLeft);
          setStatusText('Line tension snapped—it slipped off the hook!');
          st.holdingReel = false;
          if (st.castsLeft <= 0) {
            window.setTimeout(() => onFinish(st.score), 500);
            return;
          }
          st.phase = 'CAST';
          setPhase('CAST');
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (stateRef.current.phase === 'CAST') beginCast();
      else if (stateRef.current.phase === 'BITE') hookFish();
      else if (stateRef.current.phase === 'REEL') {
        stateRef.current.holdingReel = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stateRef.current.holdingReel = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [waterType, weather, timePhase, fishingBonus, rarityBonus, fishDriftFactor, zoneHalf, hook?.fishingBonus, onCatchFish, onFinish]);

  const waterBg =
    waterType === 'frozen'
      ? 'from-[#1a3e54] to-[#0f2433]'
      : waterType === 'jungle'
        ? 'from-[#14473e] to-[#0d2b28]'
        : waterType === 'underground'
          ? 'from-[#281f47] to-[#141029]'
          : 'from-[#185270] to-[#0d2b3e]';

  const bobberX = phase === 'REEL' ? hudBars.zoneCenter : 55;
  const bobberY = phase === 'CAST' ? 32 : phase === 'BITE' ? 66 : 58;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs text-[#cfc8b8] font-mono-tabular">
        <span>Casts Left: {castsLeft}</span>
        <span className="capitalize text-[#9fb0bf]">
          {waterType} Water · {weather.replace('_', ' ')} · {timePhase}
          {companionBonus > 0 ? ` · +${companionBonus}% Companion` : ''}
        </span>
        <span className="text-teal-300 font-semibold text-sm">Score: {score}</span>
      </div>

      {/* Scenic Pond / Harbour View */}
      <div className={`relative h-36 rounded-lg bg-gradient-to-b ${waterBg} border border-[#355d73] overflow-hidden`}>
        <svg viewBox="0 0 360 120" className="w-full h-full">
          {/* Horizon Pier / Shore */}
          <rect x="0" y="0" width="90" height="36" fill="#6b4b32" />
          <rect x="0" y="34" width="92" height="5" fill="#8f6745" />
          {/* Fishing Rod & Silk Line */}
          <line x1="72" y1="22" x2="145" y2="8" stroke="#d9b478" strokeWidth="3" strokeLinecap="round" />
          <path
            d={`M145,8 Q${(145 + (bobberX * 3.6)) / 2},${phase === 'REEL' ? 28 : 42} ${bobberX * 3.6},${bobberY * 1.1}`}
            fill="none"
            stroke="#d4f0ff"
            strokeWidth="1.2"
            strokeDasharray={phase === 'CAST' ? '3 3' : undefined}
          />
          {/* Water Ripples */}
          <path d="M100,48 Q130,43 160,48 T220,48 T280,48" fill="none" stroke="#6ae0d6" strokeOpacity="0.22" strokeWidth="2" />
          <path d="M120,86 Q160,81 200,86 T290,86" fill="none" stroke="#6ae0d6" strokeOpacity="0.18" strokeWidth="2" />
          {(phase === 'WAITING' || phase === 'BITE' || phase === 'REEL') && (
            <>
              <ellipse
                cx={bobberX * 3.6}
                cy={bobberY * 1.12}
                rx={phase === 'BITE' ? 26 : 16}
                ry={phase === 'BITE' ? 8 : 5}
                fill="none"
                stroke={phase === 'BITE' ? '#ffd466' : '#9ee8ff'}
                strokeOpacity={phase === 'BITE' ? 0.9 : 0.45}
                strokeWidth="2"
              />
              {/* Shadow Fish Silhouette circling or biting */}
              <ellipse
                cx={bobberX * 3.6 + (phase === 'WAITING' ? -18 : 0)}
                cy={bobberY * 1.18 + 8}
                rx="14"
                ry="5.5"
                fill="#0a1c26"
                fillOpacity="0.7"
              />
              {/* Red/White Bobber */}
              <circle cx={bobberX * 3.6} cy={bobberY * 1.1} r="5.5" fill="#e85848" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}
          {phase === 'BITE' && (
            <text x={bobberX * 3.6} y={bobberY * 1.1 - 14} textAnchor="middle" fill="#ffd466" fontSize="13" fontWeight="bold">
              BITE!
            </text>
          )}
        </svg>
      </div>

      <div className="p-4 rounded-lg bg-[#122634] border border-[#2c4f63] space-y-3 text-center">
        <p className="text-sm font-medium text-[#efe9dc]">{statusText}</p>

        {caughtCard && (
          <div className="p-3 rounded-lg bg-[#0d1c26] border border-[#e0a943]/60 flex items-center justify-between text-left gap-3">
            <div>
              <div className="text-xs font-semibold text-[#f5cc6b]">
                {caughtCard.fish.name} · {caughtCard.fish.rarity}
              </div>
              <div className="text-[11px] text-[#aeb9c4]">{caughtCard.fish.description}</div>
            </div>
            <div className="text-right font-mono-tabular shrink-0">
              <div className="text-xs font-bold text-[#6ae0d6]">{caughtCard.sizeCm} cm</div>
              <div className="text-[11px] text-[#f5cc6b]">+{caughtCard.pts} pts</div>
            </div>
          </div>
        )}

        {phase === 'BITE' && (
          <div className="h-2 max-w-xs mx-auto rounded-full bg-[#0c1a24] overflow-hidden">
            <div style={{ width: `${hudBars.biteTimerPct}%` }} className="h-full bg-amber-400" />
          </div>
        )}

        {phase === 'REEL' && (
          <div className="space-y-2.5">
            <div className="relative h-9 rounded bg-[#0c1a24] border border-[#355d73] overflow-hidden">
              <div
                style={{ left: `${hudBars.zoneCenter - zoneHalf}%`, width: `${zoneHalf * 2}%` }}
                className="absolute top-0 bottom-0 bg-teal-500/40 border-x-2 border-teal-300"
              />
              <div
                style={{ left: `${hudBars.markerPos}%` }}
                className="absolute top-1 bottom-1 w-3 -translate-x-1/2 rounded bg-amber-300 border border-white"
              />
            </div>
            <div className="h-3 rounded bg-[#0c1a24] border border-[#284757] overflow-hidden">
              <div style={{ width: `${hudBars.reelProgress}%` }} className="h-full bg-emerald-400" />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-1">
          {phase === 'CAST' && (
            <button
              type="button"
              onClick={beginCast}
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm cursor-pointer whitespace-nowrap"
            >
              Cast Line [Space]
            </button>
          )}
          {phase === 'BITE' && (
            <button
              type="button"
              onClick={hookFish}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-bold text-sm cursor-pointer animate-pulse whitespace-nowrap"
            >
              HOOK FISH! [Space]
            </button>
          )}
          {phase === 'REEL' && (
            <button
              type="button"
              onPointerDown={() => {
                stateRef.current.holdingReel = true;
              }}
              onPointerUp={() => {
                stateRef.current.holdingReel = false;
              }}
              onPointerLeave={() => {
                stateRef.current.holdingReel = false;
              }}
              onClick={() => {
                stateRef.current.markerVel = Math.min(72, stateRef.current.markerVel + 36);
              }}
              className="px-7 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-bold text-sm cursor-pointer select-none whitespace-nowrap"
            >
              Hold / Tap to Reel! [Space]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* 3. HARMONY RHYTHM */
const RhythmGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const LANES = [
    { key: 'KeyD', label: 'D', freq: 293.66, color: 'bg-amber-400' },
    { key: 'KeyF', label: 'F', freq: 349.23, color: 'bg-teal-400' },
    { key: 'KeyJ', label: 'J', freq: 440.0, color: 'bg-emerald-400' },
    { key: 'KeyK', label: 'K', freq: 523.25, color: 'bg-rose-400' },
  ];
  const [notes, setNotes] = useState<{ id: number; lane: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(24);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const nextId = useRef(1);

  useEffect(() => {
    const spawner = window.setInterval(() => {
      const lane = Math.floor(Math.random() * 4);
      setNotes((prev) => [...prev, { id: nextId.current++, lane, y: 0 }]);
    }, 500);
    const mover = window.setInterval(() => {
      setNotes((prev) => prev.map((n) => ({ ...n, y: n.y + 3.25 })).filter((n) => n.y < 102));
    }, 30);
    return () => {
      window.clearInterval(spawner);
      window.clearInterval(mover);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  const hitLane = (laneIdx: number) => {
    const candidate = notesRef.current.find((n) => n.lane === laneIdx && n.y >= 67 && n.y <= 94);
    if (candidate) {
      soundEngine.playNote(LANES[laneIdx].freq);
      const nextS = streak + 1;
      setStreak(nextS);
      setScore((s) => s + 25 + Math.min(15, nextS * 2));
      setNotes((prev) => prev.filter((n) => n.id !== candidate.id));
    } else {
      setStreak(0);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = LANES.findIndex((l) => l.key === e.code);
      if (idx >= 0) hitLane(idx);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span>Streak: {streak}x</span>
        <span className="text-amber-300 font-semibold">Score: {score}</span>
      </div>
      <div className="relative grid grid-cols-4 gap-2 h-72 p-2 rounded-lg bg-[#141c24] border border-[#304050] overflow-hidden">
        <div className="absolute inset-x-0 bottom-8 h-9 border-y border-amber-300/40 bg-amber-400/10 pointer-events-none" />
        {LANES.map((lane, idx) => (
          <div key={lane.key} className="relative h-full bg-[#1a2530]/60 rounded">
            {notes
              .filter((n) => n.lane === idx)
              .map((n) => (
                <div
                  key={n.id}
                  style={{ top: `${n.y}%` }}
                  className={`absolute left-2 right-2 h-4 -translate-y-1/2 rounded shadow ${lane.color}`}
                />
              ))}
            <button
              type="button"
              onClick={() => hitLane(idx)}
              className="absolute bottom-1 left-1 right-1 py-1.5 rounded bg-[#263544] hover:bg-[#324659] text-xs font-mono-tabular font-semibold text-white cursor-pointer"
            >
              {lane.label}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Press D, F, J, K (or click lane buttons) as notes cross the golden bar!</p>
    </div>
  );
};

/* 4. FROSTPEAK ALPINE SLALOM ICE SLIDE */
const TimeSlideGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(22);
  const [items, setItems] = useState<{ id: number; lane: number; y: number; kind: 'flag' | 'ramp' | 'rock' }[]>([]);
  const nextId = useRef(1);
  const laneRef = useRef(lane);
  laneRef.current = lane;

  useEffect(() => {
    const spawner = window.setInterval(() => {
      const r = Math.random();
      const kind = r > 0.45 ? 'flag' : r > 0.32 ? 'ramp' : 'rock';
      setItems((prev) => [...prev, { id: nextId.current++, lane: Math.floor(Math.random() * 3), y: 0, kind }]);
    }, 450);

    const tick = window.setInterval(() => {
      setItems((prev) => {
        const next: typeof prev = [];
        for (const it of prev) {
          const ny = it.y + 4.6;
          if (ny >= 78 && ny <= 90 && it.lane === laneRef.current) {
            if (it.kind === 'flag') {
              soundEngine.playCollect();
              setScore((s) => s + 25);
            } else if (it.kind === 'ramp') {
              soundEngine.playAbility();
              setScore((s) => s + 35);
            } else {
              soundEngine.playHit();
              setScore((s) => Math.max(0, s - 15));
            }
            continue;
          }
          if (ny < 100) next.push({ ...it, y: ny });
        }
        return next;
      });
    }, 34);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') setLane((l) => Math.max(0, l - 1));
      if (e.code === 'ArrowRight' || e.code === 'KeyD') setLane((l) => Math.min(2, l + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearInterval(spawner);
      window.clearInterval(tick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Alpine Descent: {timeLeft}s</span>
        <span className="text-sky-300 font-semibold">Score: {score}</span>
      </div>
      <div className="relative grid grid-cols-3 gap-2 h-72 p-3 rounded-lg bg-gradient-to-b from-[#23435e] to-[#172c3d] border border-[#5d8fb5] overflow-hidden">
        {[0, 1, 2].map((l) => (
          <div key={l} onClick={() => setLane(l)} className="relative h-full rounded bg-[#b8def5]/15 border-x border-white/10 cursor-pointer">
            {items
              .filter((it) => it.lane === l)
              .map((it) => (
                <div
                  key={it.id}
                  style={{ top: `${it.y}%` }}
                  className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded flex items-center justify-center text-xs font-bold shadow ${
                    it.kind === 'flag'
                      ? 'bg-amber-400 text-[#131a21]'
                      : it.kind === 'ramp'
                        ? 'bg-cyan-300 text-[#0e1924]'
                        : 'bg-slate-700 text-slate-200 border border-slate-400'
                  }`}
                >
                  {it.kind === 'flag' ? '⚑' : it.kind === 'ramp' ? '⏫' : '◆'}
                </div>
              ))}
            {lane === l && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-sky-300 border-2 border-white flex items-center justify-center text-[#0e151b] font-bold text-xs shadow-lg">
                  SLED
                </div>
                <div className="w-6 h-3 bg-white/30 rounded-b-full -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Carve Left/Right [A/D or Click] through Gold Flags (⚑) & Jump Ramps (⏫); dodge Ice Rocks (◆)!</p>
    </div>
  );
};

/* 5. ANCIENT RUNE MEMORY */
const RuneMemoryGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const RUNES = [
    { id: 0, symbol: '☀', name: 'Dawn', freq: 392.0, bg: 'bg-amber-500/25 border-amber-300 text-amber-200' },
    { id: 1, symbol: '✿', name: 'Grove', freq: 440.0, bg: 'bg-emerald-500/25 border-emerald-300 text-emerald-200' },
    { id: 2, symbol: '≈', name: 'Tide', freq: 493.88, bg: 'bg-teal-500/25 border-teal-300 text-teal-200' },
    { id: 3, symbol: '❄', name: 'Peak', freq: 587.33, bg: 'bg-sky-500/25 border-sky-300 text-sky-200' },
  ];

  const [sequence, setSequence] = useState<number[]>([0, 2]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [litRune, setLitRune] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const [round, setRound] = useState(1);

  useEffect(() => {
    setShowing(true);
    let i = 0;
    const playStep = () => {
      if (i >= sequence.length) {
        setLitRune(null);
        setShowing(false);
        return;
      }
      const r = sequence[i];
      setLitRune(r);
      soundEngine.playNote(RUNES[r].freq);
      i++;
      window.setTimeout(() => {
        setLitRune(null);
        window.setTimeout(playStep, 180);
      }, 420);
    };
    const start = window.setTimeout(playStep, 450);
    return () => window.clearTimeout(start);
  }, [sequence]);

  const pickRune = (id: number) => {
    if (showing) return;
    soundEngine.playNote(RUNES[id].freq);
    setLitRune(id);
    window.setTimeout(() => setLitRune(null), 180);

    if (sequence[playerIdx] !== id) {
      soundEngine.playHit();
      onFinish((round - 1) * 35);
      return;
    }

    const nextIdx = playerIdx + 1;
    if (nextIdx >= sequence.length) {
      if (round >= 4) {
        soundEngine.playRestoreFanfare();
        onFinish(150);
      } else {
        setRound((r) => r + 1);
        setPlayerIdx(0);
        setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
      }
    } else {
      setPlayerIdx(nextIdx);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Seal Round: {round} / 4</span>
        <span>{showing ? 'Watch the Runes...' : `Repeat Sequence (${playerIdx}/${sequence.length})`}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#1a1626] border border-[#443866]">
        {RUNES.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={showing}
            onClick={() => pickRune(r.id)}
            className={`h-28 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              litRune === r.id ? 'scale-105 bg-white/30 border-white text-white' : r.bg
            }`}
          >
            <span className="text-3xl">{r.symbol}</span>
            <span className="text-xs font-semibold">{r.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Clear Round 4 (100+ pts) to unlock Sora, The Dawnkeeper!</p>
    </div>
  );
};

/* 6. BRIGHTFALL FOOTBALL PENALTY CHALLENGE */
const FootballGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [kicksLeft, setKicksLeft] = useState(6);
  const [score, setScore] = useState(0);
  const [aimX, setAimX] = useState(50);
  const [aimDir, setAimDir] = useState(1.8);
  const [keeperX, setKeeperX] = useState(50);
  const [keeperDir, setKeeperDir] = useState(-1.4);
  const [shotBall, setShotBall] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState('Click "Kick Ball!" or press Space when your aim clears the keeper!');

  useEffect(() => {
    const id = window.setInterval(() => {
      setAimX((x) => {
        const nx = x + aimDir;
        if (nx > 88 || nx < 12) setAimDir((d) => -d);
        return Math.max(12, Math.min(88, nx));
      });
      setKeeperX((k) => {
        const nk = k + keeperDir;
        if (nk > 78 || nk < 22) setKeeperDir((d) => -d);
        return Math.max(22, Math.min(78, nk));
      });
    }, 30);
    return () => window.clearInterval(id);
  }, [aimDir, keeperDir]);

  const shoot = () => {
    setShotBall({ x: aimX, y: 20 });
    window.setTimeout(() => setShotBall(null), 380);
    const saved = Math.abs(aimX - keeperX) < 13;
    const cornerBonus = aimX < 25 || aimX > 75;
    let gained = 0;
    if (saved) {
      soundEngine.playHit();
      setFeedback('Keeper dove right across it! Aim wide to the corners.');
    } else {
      soundEngine.playRestoreFanfare();
      gained = cornerBonus ? 35 : 22;
      setScore((s) => s + gained);
      setFeedback(cornerBonus ? `TOP CORNER GOAL! (+${gained} pts)` : `GOAL! (+${gained} pts)`);
    }
    const rem = kicksLeft - 1;
    setKicksLeft(rem);
    if (rem <= 0) {
      window.setTimeout(() => onFinish(score + gained), 480);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Kicks Left: {kicksLeft}</span>
        <span className="text-emerald-300 font-semibold">Score: {score}</span>
      </div>
      <div className="relative h-64 rounded-lg bg-[#275e38] border-2 border-white/60 overflow-hidden p-4 flex flex-col justify-between">
        <div className="relative h-28 mx-6 border-t-4 border-x-4 border-white rounded-t bg-white/10">
          <div
            style={{ left: `${keeperX}%` }}
            className="absolute bottom-0 -translate-x-1/2 w-12 h-14 rounded-t bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#111921]"
          >
            GK
          </div>
          <div
            style={{ left: `${aimX}%` }}
            className="absolute top-3 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-amber-300 bg-amber-300/30"
          />
          {shotBall && (
            <div
              style={{ left: `${shotBall.x}%`, top: `${shotBall.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#111921] shadow-md"
            />
          )}
        </div>
        <div className="text-center text-xs text-white font-medium">{feedback}</div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={shoot}
            className="px-6 py-2.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
          >
            Kick Ball! [Space]
          </button>
        </div>
      </div>
    </div>
  );
};

/* 7. BRIGHTFALL BASKETBALL HOOPS */
const BasketballGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [meter, setMeter] = useState(50);
  const [dir, setDir] = useState(2.3);
  const [swishFx, setSwishFx] = useState(false);
  const [msg, setMsg] = useState('Shoot when the ball meter hits the glowing emerald Swish Zone!');

  useEffect(() => {
    const id = window.setInterval(() => {
      setMeter((m) => {
        const nm = m + dir;
        if (nm >= 96 || nm <= 4) setDir((d) => -d);
        return Math.max(4, Math.min(96, nm));
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [dir]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  const shoot = () => {
    const dist = Math.abs(meter - 50);
    if (dist <= 6) {
      soundEngine.playRestoreFanfare();
      const nextS = streak + 1;
      setStreak(nextS);
      const pts = 30 + Math.min(20, nextS * 4);
      setScore((s) => s + pts);
      setSwishFx(true);
      window.setTimeout(() => setSwishFx(false), 320);
      setMsg(`SWISH! 3-Pointer! (+${pts} pts · ${nextS}x Streak)`);
    } else if (dist <= 16) {
      soundEngine.playCollect();
      setStreak((s) => s + 1);
      setScore((s) => s + 18);
      setMsg('Bucket! Clean 2-pointer! (+18 pts)');
    } else {
      soundEngine.playHit();
      setStreak(0);
      setMsg('Off the rim! Catch the center timing.');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span>Streak: {streak}x</span>
        <span className="text-amber-300 font-semibold">Score: {score}</span>
      </div>
      <div className="p-6 rounded-lg bg-[#5e3d28] border border-[#b88b61] space-y-5 text-center">
        <div
          className={`mx-auto w-28 h-20 rounded border-2 border-white bg-white/15 flex flex-col items-center justify-end pb-2 transition-transform ${
            swishFx ? 'scale-110' : ''
          }`}
        >
          <div className="w-12 h-2.5 rounded-full bg-[#e05a2b] border border-white" />
          <div className="w-9 h-3 border-x border-b border-white/70 rounded-b" />
        </div>
        <p className="text-xs text-[#f5ecd8]">{msg}</p>
        <div className="relative h-8 rounded bg-[#1a130e] border border-[#8c5a37] overflow-hidden">
          <div className="absolute left-[34%] w-[32%] top-0 bottom-0 bg-amber-500/20 border-x border-amber-400/50" />
          <div className="absolute left-[44%] w-[12%] top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-300" />
          <div
            style={{ left: `${meter}%` }}
            className="absolute top-1 bottom-1 w-3 -translate-x-1/2 rounded-full bg-orange-400 border border-white"
          />
        </div>
        <button
          type="button"
          onClick={shoot}
          className="px-6 py-2.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
        >
          Shoot Hoops! [Space]
        </button>
      </div>
    </div>
  );
};

/* 8. BRIGHTFALL TRAIL BICYCLE RACE (Unique Continuous Steering + Peloton + Stamina Sprint!) */
const BicycleRaceGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [xPos, setXPos] = useState(50);
  const [distance, setDistance] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [sprinting, setSprinting] = useState(false);
  const [place, setPlace] = useState(2);
  const [items, setItems] = useState<{ id: number; x: number; y: number; kind: 'pad' | 'orb' | 'cone' }[]>([]);
  const sim = useRef({
    x: 50,
    distance: 0,
    stamina: 100,
    speed: 28,
    bonusPts: 0,
    rivals: [120, 145, 95],
    heldL: false,
    heldR: false,
    sprinting: false,
    done: false,
    nextId: 1,
    spawnAcc: 0,
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      if (s.done) return;

      if (s.heldL) s.x = Math.max(12, s.x - 62 * dt);
      if (s.heldR) s.x = Math.min(88, s.x + 62 * dt);

      const canSprint = s.sprinting && s.stamina > 8;
      if (canSprint) {
        s.stamina = Math.max(0, s.stamina - 34 * dt);
        s.speed = Math.min(54, s.speed + 40 * dt);
      } else {
        s.stamina = Math.min(100, s.stamina + 16 * dt);
        s.speed += (32 - s.speed) * Math.min(1, dt * 3);
      }

      s.distance += s.speed * dt;
      s.rivals = s.rivals.map((rd, idx) => rd + (29.5 + idx * 1.4 + Math.sin(now * 0.002 + idx) * 2) * dt);

      const currentPlace = 1 + s.rivals.filter((r) => r > s.distance).length;
      setPlace(currentPlace);
      setDistance(Math.min(800, Math.round(s.distance)));
      setStamina(Math.round(s.stamina));
      setXPos(s.x);
      setSprinting(canSprint);

      s.spawnAcc += dt;
      if (s.spawnAcc > 0.42) {
        s.spawnAcc = 0;
        const r = Math.random();
        const kind = r > 0.6 ? 'pad' : r > 0.32 ? 'orb' : 'cone';
        setItems((prev) => [...prev, { id: s.nextId++, x: 16 + Math.random() * 68, y: 0, kind }]);
      }

      setItems((prev) => {
        const next: typeof prev = [];
        for (const it of prev) {
          const ny = it.y + s.speed * 2.2 * dt;
          if (ny >= 78 && ny <= 90 && Math.abs(it.x - s.x) < 11) {
            if (it.kind === 'pad') {
              soundEngine.playAbility();
              s.speed = 58;
              s.bonusPts += 15;
            } else if (it.kind === 'orb') {
              soundEngine.playCollect();
              s.stamina = Math.min(100, s.stamina + 35);
              s.bonusPts += 18;
            } else {
              soundEngine.playHit();
              s.speed = 18;
            }
            continue;
          }
          if (ny < 102) next.push({ ...it, y: ny });
        }
        return next;
      });

      if (s.distance >= 800 && !s.done) {
        s.done = true;
        const placeBonus = currentPlace === 1 ? 130 : currentPlace === 2 ? 95 : currentPlace === 3 ? 70 : 50;
        soundEngine.playRestoreFanfare();
        window.setTimeout(() => onFinish(placeBonus + s.bonusPts), 320);
        return;
      }

      raf = window.requestAnimationFrame(step);
    };

    raf = window.requestAnimationFrame(step);

    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') sim.current.heldL = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') sim.current.heldR = true;
      if (e.code === 'Space') {
        e.preventDefault();
        sim.current.sprinting = true;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') sim.current.heldL = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') sim.current.heldR = false;
      if (e.code === 'Space') sim.current.sprinting = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [onFinish]);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs text-[#cfc8b8] font-mono-tabular">
        <span>Position: #{place} / 4</span>
        <span>Course: {distance}m / 800m</span>
        <span className="text-emerald-300 font-semibold">Stamina: {stamina}%</span>
      </div>
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          sim.current.x = Math.max(12, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
        }}
        className="relative h-72 rounded-lg bg-[#2e5239] border border-[#52855f] overflow-hidden cursor-ew-resize select-none"
      >
        {/* Park gravel cycling road */}
        <div className="absolute inset-y-0 left-[10%] right-[10%] bg-[#7a6045] border-x-4 border-[#e3d2b4]/50">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-[#f5e7c9]/40" />
        </div>
        {items.map((it) => (
          <div
            key={it.id}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow ${
              it.kind === 'pad'
                ? 'bg-emerald-400 text-[#111921]'
                : it.kind === 'orb'
                  ? 'bg-amber-300 text-[#111921] rounded-full'
                  : 'bg-orange-600 text-white border border-white'
            }`}
          >
            {it.kind === 'pad' ? '»' : it.kind === 'orb' ? '⚡' : '▲'}
          </div>
        ))}
        {/* Player Bike */}
        <div
          style={{ left: `${xPos}%` }}
          className={`absolute bottom-3 -translate-x-1/2 px-3 py-2 rounded-full border-2 border-white font-bold text-xs shadow-lg ${
            sprinting ? 'bg-amber-300 text-[#111921] scale-105' : 'bg-[#6ae0d6] text-[#0c1d24]'
          }`}
        >
          BIKE
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#a5a095]">Move mouse or A/D to steer · Hold Space / Sprint button for boost pads (») & energy orbs!</p>
        <button
          type="button"
          onPointerDown={() => {
            sim.current.sprinting = true;
          }}
          onPointerUp={() => {
            sim.current.sprinting = false;
          }}
          onPointerLeave={() => {
            sim.current.sprinting = false;
          }}
          className="px-4 py-1.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-xs whitespace-nowrap cursor-pointer"
        >
          Sprint [Space]
        </button>
      </div>
    </div>
  );
};

/* 9. OCEAN BOAT SLALOM RACE */
const BoatRaceGame: React.FC<{ boatLevel: number; onFinish: (score: number) => void }> = ({ boatLevel, onFinish }) => {
  const [xPos, setXPos] = useState(50);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [gates, setGates] = useState<{ id: number; x: number; y: number; kind: 'buoy' | 'rock' }[]>([]);
  const nextId = useRef(1);
  const xRef = useRef(xPos);
  xRef.current = xPos;
  const held = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  useEffect(() => {
    const spawner = window.setInterval(() => {
      setGates((prev) => [
        ...prev,
        { id: nextId.current++, x: 14 + Math.random() * 72, y: 0, kind: Math.random() > 0.35 ? 'buoy' : 'rock' },
      ]);
    }, 450);

    const tick = window.setInterval(() => {
      const steerSpeed = 2.6 + (boatLevel - 1) * 0.6;
      if (held.current.left) setXPos((x) => Math.max(8, x - steerSpeed));
      if (held.current.right) setXPos((x) => Math.min(92, x + steerSpeed));

      setGates((prev) => {
        const next: typeof prev = [];
        for (const g of prev) {
          const ny = g.y + 4.4;
          if (ny >= 78 && ny <= 90 && Math.abs(g.x - xRef.current) < 12) {
            if (g.kind === 'buoy') {
              soundEngine.playCollect();
              setScore((s) => s + 25);
            } else {
              soundEngine.playHit();
              setScore((s) => Math.max(0, s - 15));
            }
            continue;
          }
          if (ny < 100) next.push({ ...g, y: ny });
        }
        return next;
      });
    }, 32);

    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') held.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') held.current.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') held.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') held.current.right = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.clearInterval(spawner);
      window.clearInterval(tick);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [boatLevel]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s · Vessel Tier {boatLevel}</span>
        <span className="text-teal-300 font-semibold">Score: {score}</span>
      </div>
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = ((e.clientX - rect.left) / rect.width) * 100;
          setXPos(Math.max(8, Math.min(92, pct)));
        }}
        className="relative h-72 rounded-lg bg-gradient-to-b from-[#175573] to-[#0f3447] border border-[#3e85a6] overflow-hidden cursor-ew-resize"
      >
        {gates.map((g) => (
          <div
            key={g.id}
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              g.kind === 'buoy'
                ? 'bg-teal-400/30 border-teal-200 text-amber-200'
                : 'bg-slate-700 border-slate-400 text-slate-200'
            }`}
          >
            {g.kind === 'buoy' ? '◎' : '▲'}
          </div>
        ))}
        <div
          style={{ left: `${xPos}%` }}
          className="absolute bottom-3 -translate-x-1/2 flex flex-col items-center"
        >
          <div className="px-3 py-2 rounded-lg bg-[#8c5a37] border-2 border-[#f5cc6b] text-white font-bold text-xs shadow">
            BOAT
          </div>
          <div className="w-8 h-3 bg-cyan-200/30 rounded-b-full -mt-1" />
        </div>
      </div>
      <p className="text-xs text-[#a5a095]">Move mouse or use A / D to steer through Glowing Buoys (◎) and dodge Sea Rocks!</p>
    </div>
  );
};

/* 10. GOLDEN SKILLET COOKING CHALLENGE */
const CookingGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const STEPS = [
    { name: 'Chop Sun Berries & Greens', zoneW: 20 },
    { name: 'Simmer & Stir Herb Stock', zoneW: 16 },
    { name: 'Sear in Golden Skillet', zoneW: 13 },
    { name: 'Glaze & Plate Bistro Tart', zoneW: 12 },
  ];
  const [stepIdx, setStepIdx] = useState(0);
  const [needle, setNeedle] = useState(15);
  const [dir, setDir] = useState(2.5);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('Press Space or "Cook Step!" inside the glowing heat band!');

  useEffect(() => {
    const id = window.setInterval(() => {
      setNeedle((n) => {
        const nn = n + dir;
        if (nn >= 96 || nn <= 4) setDir((d) => -d);
        return Math.max(4, Math.min(96, nn));
      });
    }, 24);
    return () => window.clearInterval(id);
  }, [dir]);

  const performStep = () => {
    const dist = Math.abs(needle - 50);
    const halfZone = STEPS[stepIdx].zoneW / 2;
    let pts = 15;
    if (dist <= halfZone * 0.55) {
      soundEngine.playRestoreFanfare();
      pts = 45;
      setMsg('Masterful sear! (+45 pts)');
    } else if (dist <= halfZone) {
      soundEngine.playCollect();
      pts = 30;
      setMsg('Nice timing! (+30 pts)');
    } else {
      soundEngine.playHit();
      setMsg('Slightly off heat! (+15 pts)');
    }
    const nextScore = score + pts;
    setScore(nextScore);
    if (stepIdx + 1 >= STEPS.length) {
      window.setTimeout(() => onFinish(nextScore), 380);
    } else {
      setStepIdx((i) => i + 1);
      setDir((d) => (d > 0 ? d + 0.45 : d - 0.45));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        performStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const zoneW = STEPS[stepIdx].zoneW;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Course {stepIdx + 1} / {STEPS.length}</span>
        <span className="text-amber-300 font-semibold">Score: {score}</span>
      </div>
      <div className="p-5 rounded-lg bg-[#291f1a] border border-[#6e4b38] space-y-4 text-center">
        {/* Course progress icons */}
        <div className="flex justify-center gap-2">
          {STEPS.map((st, idx) => (
            <div
              key={st.name}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                idx < stepIdx
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : idx === stepIdx
                    ? 'bg-amber-500/25 border-amber-300 text-[#f5cc6b]'
                    : 'bg-[#1a130f] border-[#422f25] text-[#857870]'
              }`}
            >
              Stage {idx + 1}
            </div>
          ))}
        </div>

        <div className="text-base font-display font-semibold text-[#f5cc6b]">{STEPS[stepIdx].name}</div>
        <p className="text-xs text-[#dce4ea]">{msg}</p>
        <div className="relative h-8 rounded bg-[#140e0c] border border-[#593c2d] overflow-hidden">
          <div
            style={{ left: `${50 - zoneW / 2}%`, width: `${zoneW}%` }}
            className="absolute top-0 bottom-0 bg-amber-400/35 border-x border-amber-300"
          />
          <div
            style={{ left: `${needle}%` }}
            className="absolute top-1 bottom-1 w-2.5 -translate-x-1/2 rounded bg-white"
          />
        </div>
        <button
          type="button"
          onClick={performStep}
          className="px-6 py-2.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
        >
          Cook Step! [Space]
        </button>
      </div>
      <p className="text-xs text-[#a5a095]">Score 70+ pts to take home a freshly baked Hearth & Crumb Berry Tart!</p>
    </div>
  );
};

/* 11. BRIGHTFALL GRAND TENNIS RALLY */
const TennisGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(28);
  const [score, setScore] = useState(0);
  const [rally, setRally] = useState(0);
  const [renderState, setRenderState] = useState({ px: 50, ox: 50, bx: 50, by: 30 });
  const sim = useRef({
    px: 50,
    ox: 50,
    bx: 50,
    by: 30,
    vx: 26,
    vy: 38,
    score: 0,
    rally: 0,
    heldL: false,
    heldR: false,
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      if (s.heldL) s.px = Math.max(12, s.px - 68 * dt);
      if (s.heldR) s.px = Math.min(88, s.px + 68 * dt);

      s.ox += Math.max(-44 * dt, Math.min(44 * dt, s.bx - s.ox));
      s.ox = Math.max(14, Math.min(86, s.ox));

      s.bx += s.vx * dt;
      s.by += s.vy * dt;
      if (s.bx < 5) {
        s.bx = 5;
        s.vx = Math.abs(s.vx);
      } else if (s.bx > 95) {
        s.bx = 95;
        s.vx = -Math.abs(s.vx);
      }

      if (s.by <= 12 && s.vy < 0) {
        if (Math.abs(s.bx - s.ox) < 15) {
          s.vy = Math.abs(s.vy) * 1.03;
          s.vx = (s.bx - s.ox) * 2.2 + (Math.random() - 0.5) * 14;
          soundEngine.playNote(360);
        } else {
          soundEngine.playRestoreFanfare();
          s.score += 30;
          s.rally = 0;
          setScore(s.score);
          setRally(0);
          s.bx = 50;
          s.by = 30;
          s.vx = (Math.random() > 0.5 ? 1 : -1) * 24;
          s.vy = 36;
        }
      }

      if (s.by >= 86 && s.vy > 0) {
        if (Math.abs(s.bx - s.px) < 16) {
          soundEngine.playNote(520);
          s.rally += 1;
          const pts = 18 + Math.min(20, s.rally * 3);
          s.score += pts;
          setScore(s.score);
          setRally(s.rally);
          s.vy = -Math.min(72, Math.abs(s.vy) * 1.04);
          s.vx = (s.bx - s.px) * 2.6;
        } else {
          soundEngine.playHit();
          s.rally = 0;
          setRally(0);
          s.bx = 50;
          s.by = 28;
          s.vx = (Math.random() > 0.5 ? 1 : -1) * 24;
          s.vy = 36;
        }
      }

      setRenderState({ px: s.px, ox: s.ox, bx: s.bx, by: s.by });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') sim.current.heldL = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') sim.current.heldR = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') sim.current.heldL = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') sim.current.heldR = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(sim.current.score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, onFinish]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span>Rally: {rally}x</span>
        <span className="text-lime-300 font-semibold">Score: {score}</span>
      </div>
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          sim.current.px = Math.max(12, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
        }}
        className="relative h-72 rounded-lg bg-[#2f6e49] border-2 border-white/80 overflow-hidden cursor-ew-resize"
      >
        <div className="absolute inset-x-4 top-6 bottom-6 border border-white/30 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-white/80" />
        <div
          style={{ left: `${renderState.ox}%` }}
          className="absolute top-3 -translate-x-1/2 w-20 h-3 rounded-full bg-rose-400 border border-white"
        />
        <div
          style={{ left: `${renderState.bx}%`, top: `${renderState.by + 2}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-2 rounded-full bg-black/35 blur-[1px]"
        />
        <div
          style={{ left: `${renderState.bx}%`, top: `${renderState.by}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-lime-300 border border-[#142e1c] shadow"
        />
        <div
          style={{ left: `${renderState.px}%` }}
          className="absolute bottom-3 -translate-x-1/2 w-22 h-3.5 rounded-full bg-amber-300 border-2 border-white"
        />
      </div>
      <p className="text-xs text-[#a5a095]">Move mouse or use A / D to rally and score aces across the net!</p>
    </div>
  );
};

/* 12. OLYMPIC 100M SWIMMING SPRINT */
const SwimmingGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [progress, setProgress] = useState([0, 0, 0, 0]);
  const [lastKey, setLastKey] = useState<'A' | 'D'>('D');
  const [strokes, setStrokes] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const cpuTimer = window.setInterval(() => {
      if (doneRef.current) return;
      setProgress((prev) => {
        const next = [
          Math.min(100, prev[0] + 0.72 + Math.random() * 0.4),
          prev[1],
          Math.min(100, prev[2] + 0.65 + Math.random() * 0.45),
          Math.min(100, prev[3] + 0.6 + Math.random() * 0.4),
        ];
        if (!doneRef.current && next[1] >= 100) {
          doneRef.current = true;
          const rank = 1 + [next[0], next[2], next[3]].filter((x) => x >= 100).length;
          const pts = rank === 1 ? 160 : rank === 2 ? 120 : 85;
          soundEngine.playRestoreFanfare();
          window.setTimeout(() => onFinish(pts), 350);
        } else if (!doneRef.current && next[0] >= 100 && next[2] >= 100 && next[3] >= 100) {
          doneRef.current = true;
          window.setTimeout(() => onFinish(Math.max(40, Math.round(next[1]))), 350);
        }
        return next;
      });
    }, 55);
    return () => window.clearInterval(cpuTimer);
  }, [onFinish]);

  const stroke = (key: 'A' | 'D') => {
    if (doneRef.current) return;
    const bonus = key !== lastKey ? 3.2 : 1.1;
    setLastKey(key);
    setStrokes((s) => s + 1);
    soundEngine.playSplash();
    setProgress((prev) => {
      const next = [...prev];
      next[1] = Math.min(100, next[1] + bonus);
      if (next[1] >= 100 && !doneRef.current) {
        doneRef.current = true;
        const behind = [next[0], next[2], next[3]].filter((x) => x >= 100).length;
        const pts = behind === 0 ? 160 : behind === 1 ? 120 : 90;
        soundEngine.playRestoreFanfare();
        window.setTimeout(() => onFinish(pts), 350);
      }
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') stroke('A');
      else if (e.code === 'KeyD' || e.code === 'ArrowRight') stroke('D');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lanes = ['Lane 1 · Leo', 'Lane 2 · YOU', 'Lane 3 · Marina', 'Lane 4 · Theo'];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Brightfall 100m Freestyle</span>
        <span className="text-cyan-300 font-semibold">Strokes: {strokes}</span>
      </div>
      <div className="space-y-2.5 p-3 rounded-lg bg-[#155b7a] border border-[#48b8c9]">
        {lanes.map((name, i) => (
          <div key={name} className="relative h-12 rounded bg-[#1d789e] border border-[#7be3f5]/40 flex items-center px-3 overflow-hidden">
            <div
              style={{ width: `${Math.min(92, progress[i])}%` }}
              className="absolute left-0 top-3 bottom-3 bg-gradient-to-r from-transparent to-cyan-200/25 pointer-events-none"
            />
            <span className="text-[11px] font-semibold text-white/85 z-10">{name}</span>
            <div
              style={{ left: `${Math.min(92, progress[i])}%` }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-[10px] font-bold border ${
                i === 1 ? 'bg-amber-300 text-[#111921] border-white' : 'bg-[#0f3447] text-[#9ee8ff] border-[#48b8c9]'
              }`}
            >
              {i === 1 ? 'SWIM' : 'CPU'}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => stroke('A')}
          className="px-5 py-2.5 rounded-lg bg-[#234f66] hover:bg-[#2d6685] text-white font-semibold text-xs cursor-pointer"
        >
          Left Stroke [A]
        </button>
        <button
          type="button"
          onClick={() => stroke('D')}
          className="px-5 py-2.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-xs cursor-pointer"
        >
          Right Stroke [D]
        </button>
      </div>
      <p className="text-xs text-[#a5a095]">Alternate A & D rapidly for fastest freestyle strokes!</p>
    </div>
  );
};

/* 13. STARFALL CARNIVAL MIDWAY GALLERY */
const CarnivalGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([
    { id: 1, row: 0, x: 20, dx: 1.5, kind: 'star' as 'star' | 'duck' | 'balloon' },
    { id: 2, row: 1, x: 70, dx: -1.3, kind: 'duck' as 'star' | 'duck' | 'balloon' },
    { id: 3, row: 2, x: 45, dx: 1.8, kind: 'balloon' as 'star' | 'duck' | 'balloon' },
    { id: 4, row: 1, x: 25, dx: -1.6, kind: 'star' as 'star' | 'duck' | 'balloon' },
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => {
          let nx = t.x + t.dx;
          let ndx = t.dx;
          if (nx < 8 || nx > 92) {
            ndx = -ndx;
            nx = Math.max(8, Math.min(92, nx));
          }
          return { ...t, x: nx, dx: ndx };
        })
      );
    }, 30);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  const hit = (id: number, kind: 'star' | 'duck' | 'balloon') => {
    soundEngine.playCollect();
    const pts = kind === 'star' ? 30 : kind === 'balloon' ? 20 : 15;
    setScore((s) => s + pts);
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              x: 10 + Math.random() * 80,
              dx: (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.15),
              kind: (['star', 'duck', 'balloon'] as const)[Math.floor(Math.random() * 3)],
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span className="text-pink-300 font-semibold">Carnival Score: {score}</span>
      </div>
      <div className="p-4 rounded-lg bg-[#291a38] border border-[#6e4b8c] space-y-4">
        <div className="flex justify-around pb-1">
          {[0, 1, 2, 3, 4, 5, 6].map((b) => (
            <span key={b} className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd466]" />
          ))}
        </div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="relative h-16 rounded bg-[#1a1126] border-b-4 border-[#8c5a37] overflow-hidden">
            {targets
              .filter((t) => t.row === row)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => hit(t.id, t.kind)}
                  style={{ left: `${t.x}%` }}
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 font-bold text-xs cursor-pointer transition-transform active:scale-90 ${
                    t.kind === 'star'
                      ? 'bg-amber-400 text-[#111921] border-white'
                      : t.kind === 'balloon'
                        ? 'bg-pink-500 text-white border-pink-200'
                        : 'bg-teal-400 text-[#111921] border-white'
                  }`}
                >
                  {t.kind === 'star' ? '★30' : t.kind === 'balloon' ? '●20' : '◆15'}
                </button>
              ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Click moving Carnival Stars (30), Balloons (20), and Booth Targets (15)!</p>
    </div>
  );
};

export const MiniGameModal: React.FC = () => {
  const { activeMiniGame, closeMiniGame, recordMiniGameScore, recordFishCaught, save, hud } = useGame();
  const [stage, setStage] = useState<'BRIEFING' | 'PLAYING' | 'RESULTS'>('BRIEFING');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (activeMiniGame) {
      setStage('BRIEFING');
      setFinalScore(0);
    }
  }, [activeMiniGame]);

  if (!activeMiniGame) return null;

  const briefing = BRIEFINGS[activeMiniGame];
  const best = save.miniGameBestScores[activeMiniGame] ?? 0;
  const leaderboard = save.miniGameLeaderboards?.[activeMiniGame] ?? [];
  const waterType = getWaterTypeAt(
    Math.floor(hud.playerX / TILE_SIZE),
    Math.floor(hud.playerY / TILE_SIZE),
    hud.interiorId,
    save
  );
  const companionFishingBonus = save.activeCompanion
    ? COMPANIONS[save.activeCompanion]?.fishingBonusPct ?? 0
    : 0;

  const handleFinish = (score: number) => {
    setFinalScore(score);
    setStage('RESULTS');
    recordMiniGameScore(activeMiniGame, score);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/85 p-4">
      <div className="w-full max-w-xl rounded-xl bg-[#161e26] border border-[#324252] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#293644]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#f3efe6]">{briefing.title}</h2>
            <p className="text-xs text-[#9aa3ad] font-mono-tabular">Personal Best: {best} pts</p>
          </div>
          <button
            type="button"
            onClick={closeMiniGame}
            className="p-2 rounded-lg text-[#a5a095] hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close mini-game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {stage === 'BRIEFING' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#1c2834] border border-[#324657] space-y-2.5">
                <p className="text-sm text-[#f3efe6] font-medium">{briefing.subtitle}</p>
                <div className="text-xs text-[#b8c4ce] space-y-1 pt-1">
                  <div>
                    <strong className="text-[#f5cc6b]">Controls:</strong> {briefing.controls}
                  </div>
                  <div>
                    <strong className="text-[#87d4c8]">Objective:</strong> {briefing.goal}
                  </div>
                  <div>
                    <strong className="text-emerald-300">Reward:</strong> {briefing.rewardHint}
                  </div>
                </div>
              </div>

              {leaderboard.length > 0 && (
                <div className="p-3.5 rounded-lg bg-[#121a22] border border-[#273645]">
                  <div className="text-xs font-semibold text-[#f5cc6b] mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Hall of Fame · Top 5 Records
                  </div>
                  <div className="space-y-1">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div key={`${entry.name}-${idx}`} className="flex justify-between text-xs font-mono-tabular text-[#dce4ea]">
                        <span>#{idx + 1} · {entry.name}</span>
                        <span className="text-[#87d4c8]">{entry.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closeMiniGame}
                  className="px-4 py-2 rounded-lg bg-[#253240] hover:bg-[#314254] text-[#dce4ea] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunKey((k) => k + 1);
                    setStage('PLAYING');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
                >
                  <Play className="w-4 h-4" /> Start Challenge
                </button>
              </div>
            </div>
          )}

          {stage === 'RESULTS' && (
            <div className="py-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[#a5a095]">Activity Complete</p>
                <p className="font-display text-3xl font-bold text-[#f3efe6] font-mono-tabular">{finalScore} pts</p>
              </div>

              {leaderboard.length > 0 && (
                <div className="max-w-sm mx-auto p-3 rounded-lg bg-[#121a22] border border-[#273645] text-left">
                  <div className="text-[11px] font-semibold text-[#f5cc6b] mb-1.5">Local Hall of Fame</div>
                  <div className="space-y-1">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div key={`${entry.name}-${idx}`} className="flex justify-between text-xs font-mono-tabular text-[#dce4ea]">
                        <span>#{idx + 1} · {entry.name}</span>
                        <span className="text-[#87d4c8]">{entry.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRunKey((k) => k + 1);
                    setStage('PLAYING');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-semibold text-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={closeMiniGame}
                  className="px-4 py-2 rounded-lg bg-[#253240] hover:bg-[#314254] text-[#f3efe6] font-medium text-sm cursor-pointer"
                >
                  Return to World
                </button>
              </div>
            </div>
          )}

          {stage === 'PLAYING' && (
            <div key={runKey}>
              {activeMiniGame === 'archery' && <ArcheryGame onFinish={handleFinish} />}
              {activeMiniGame === 'fishing' && (
                <FishingGame
                  waterType={waterType}
                  weather={hud.weather}
                  timePhase={hud.timePhase}
                  rodId={save.equippedRod}
                  lineId={save.equippedLine}
                  baitId={save.equippedBait}
                  hookId={save.equippedHook}
                  companionBonus={companionFishingBonus}
                  onCatchFish={recordFishCaught}
                  onFinish={handleFinish}
                />
              )}
              {activeMiniGame === 'rhythm' && <RhythmGame onFinish={handleFinish} />}
              {activeMiniGame === 'timeslide' && <TimeSlideGame onFinish={handleFinish} />}
              {activeMiniGame === 'runememory' && <RuneMemoryGame onFinish={handleFinish} />}
              {activeMiniGame === 'football' && <FootballGame onFinish={handleFinish} />}
              {activeMiniGame === 'basketball' && <BasketballGame onFinish={handleFinish} />}
              {activeMiniGame === 'bicyclerace' && <BicycleRaceGame onFinish={handleFinish} />}
              {activeMiniGame === 'boatrace' && <BoatRaceGame boatLevel={save.boatLevel} onFinish={handleFinish} />}
              {activeMiniGame === 'cooking' && <CookingGame onFinish={handleFinish} />}
              {activeMiniGame === 'tennis' && <TennisGame onFinish={handleFinish} />}
              {activeMiniGame === 'swimming' && <SwimmingGame onFinish={handleFinish} />}
              {activeMiniGame === 'carnival' && <CarnivalGame onFinish={handleFinish} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

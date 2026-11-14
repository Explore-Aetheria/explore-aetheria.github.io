import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';
import { EQUIPMENT_CATALOG, FISH_SPECIES, FishSpeciesDef } from '../../data/equipmentAndFood';
import { useGame } from '../../state/GameStore';
import { MiniGameId, RegionId, TimePhase, WeatherType } from '../../types/game';

/* 1. AETHER ARCHERY */
const ArcheryGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; dx: number; bonus: boolean }[]>([
    { id: 1, x: 25, y: 35, dx: 0.9, bonus: false },
    { id: 2, x: 65, y: 60, dx: -1.1, bonus: true },
    { id: 3, x: 45, y: 45, dx: 0.7, bonus: false },
  ]);

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
    return () => window.clearInterval(moveTimer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, score, onFinish]);

  const hitTarget = (id: number, bonus: boolean) => {
    soundEngine.playBolt();
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    const pts = (bonus ? 25 : 15) + Math.min(20, nextCombo * 2);
    setScore((s) => s + pts);
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              x: 15 + Math.random() * 70,
              y: 18 + Math.random() * 64,
              dx: (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.9),
              bonus: Math.random() > 0.7,
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Time: {timeLeft}s</span>
        <span>Combo: {combo}x</span>
        <span className="text-amber-300 font-semibold">Score: {score}</span>
      </div>
      <div
        onClick={() => setCombo(0)}
        className="relative w-full h-80 rounded-lg bg-[#16232e] border border-[#324656] overflow-hidden cursor-crosshair select-none"
      >
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1f3b32]/60 to-transparent pointer-events-none" />
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              hitTarget(t.id, t.bonus);
            }}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-transform active:scale-90 ${
              t.bonus
                ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                : 'bg-teal-400/25 border-teal-300 text-teal-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-current" />
          </button>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Click moving energy targets before time runs out. Gold rings award bonus points!</p>
    </div>
  );
};

/* 2. TIDEWATER FISHING (Species + Weather + Time + Rod Bonus) */
function pickCaughtFish(region: RegionId, weather: WeatherType, timePhase: TimePhase, rodBonus: number): FishSpeciesDef {
  const candidates = FISH_SPECIES.filter((f) => {
    if (f.requiredWeather && !f.requiredWeather.includes(weather)) return false;
    if (f.requiredTime && !f.requiredTime.includes(timePhase)) return false;
    if (f.id === 'fish_frost_char' && region !== 'frozen_kingdom' && region !== 'frostpeak' && rodBonus < 25) return false;
    return true;
  });
  const pool = candidates.length > 0 ? candidates : [FISH_SPECIES[0]];
  const weighted: FishSpeciesDef[] = [];
  pool.forEach((f) => {
    const w =
      f.rarity === 'Mythic'
        ? rodBonus >= 25
          ? 2
          : 1
        : f.rarity === 'Rare'
          ? rodBonus >= 20
            ? 4
            : 2
          : f.rarity === 'Uncommon'
            ? 5
            : 8;
    for (let i = 0; i < w; i++) weighted.push(f);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

const FishingGame: React.FC<{
  region: RegionId;
  weather: WeatherType;
  timePhase: TimePhase;
  rodId: string;
  onCatchFish: (fishId: string, points: number) => void;
  onFinish: (score: number) => void;
}> = ({ region, weather, timePhase, rodId, onCatchFish, onFinish }) => {
  const rod = EQUIPMENT_CATALOG[rodId];
  const rodBonus = rod?.fishingBonus ?? 0;
  const zoneHalf = Math.min(26, 15 + Math.round(rodBonus * 0.14));

  const [phase, setPhase] = useState<'CAST' | 'WAITING' | 'BITE' | 'REEL'>('CAST');
  const [castsLeft, setCastsLeft] = useState(4);
  const [score, setScore] = useState(0);
  const [statusText, setStatusText] = useState(`Equipped: ${rod?.name ?? 'Rod'}. Click "Cast Line" to fish!`);
  const [markerPos, setMarkerPos] = useState(50);
  const [zoneCenter, setZoneCenter] = useState(50);
  const [reelProgress, setReelProgress] = useState(38);

  useEffect(() => {
    if (phase !== 'WAITING') return;
    const waitMs = Math.max(700, 1200 + Math.random() * 1200 - rodBonus * 8);
    const id = window.setTimeout(() => {
      soundEngine.playCollect();
      setPhase('BITE');
      setStatusText('A fish is nibbling! Click "Hook Fish!" fast!');
    }, waitMs);
    return () => window.clearTimeout(id);
  }, [phase, rodBonus]);

  useEffect(() => {
    if (phase !== 'REEL') return;
    const tick = window.setInterval(() => {
      setZoneCenter((z) => {
        const nz = z + (Math.random() - 0.5) * 13;
        return Math.max(20, Math.min(80, nz));
      });
      setMarkerPos((m) => Math.max(5, Math.min(95, m - 2.5)));
    }, 80);
    return () => window.clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'REEL') return;
    const inZone = Math.abs(markerPos - zoneCenter) < zoneHalf;
    const id = window.setTimeout(() => {
      setReelProgress((p) => {
        const np = inZone ? p + 7.5 : p - 4.2;
        if (np >= 100) {
          soundEngine.playChest();
          const fish = pickCaughtFish(region, weather, timePhase, rodBonus);
          const catchPts = fish.points + Math.floor(Math.random() * 15);
          onCatchFish(fish.id, catchPts);
          setScore((s) => s + catchPts);
          const rem = castsLeft - 1;
          setCastsLeft(rem);
          setStatusText(`Caught ${fish.name} (${fish.rarity})! (+${catchPts} pts)`);
          if (rem <= 0) {
            onFinish(score + catchPts);
          } else {
            setPhase('CAST');
          }
          return 38;
        }
        if (np <= 0) {
          soundEngine.playHit();
          const rem = castsLeft - 1;
          setCastsLeft(rem);
          setStatusText('It slipped off the hook!');
          if (rem <= 0) {
            onFinish(score);
          } else {
            setPhase('CAST');
          }
          return 38;
        }
        return np;
      });
    }, 100);
    return () => window.clearTimeout(id);
  }, [phase, markerPos, zoneCenter, zoneHalf, reelProgress, castsLeft, score, region, weather, timePhase, rodBonus, onCatchFish, onFinish]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#cfc8b8] font-mono-tabular">
        <span>Casts Left: {castsLeft}</span>
        <span className="capitalize text-[#9fb0bf]">{weather.replace('_', ' ')} · {timePhase}</span>
        <span className="text-teal-300 font-semibold text-sm">Score: {score}</span>
      </div>
      <div className="p-6 rounded-lg bg-[#122634] border border-[#2c4f63] space-y-5 text-center">
        <p className="text-sm text-[#efe9dc]">{statusText}</p>
        {phase === 'REEL' && (
          <div className="space-y-3">
            <div className="relative h-8 rounded bg-[#0c1a24] border border-[#355d73] overflow-hidden">
              <div
                style={{ left: `${zoneCenter - zoneHalf}%`, width: `${zoneHalf * 2}%` }}
                className="absolute top-0 bottom-0 bg-teal-500/35 border-x border-teal-300"
              />
              <div
                style={{ left: `${markerPos}%` }}
                className="absolute top-1 bottom-1 w-2 -translate-x-1/2 rounded bg-amber-300"
              />
            </div>
            <div className="h-2.5 rounded bg-[#0c1a24] overflow-hidden">
              <div style={{ width: `${reelProgress}%` }} className="h-full bg-emerald-400 transition-all" />
            </div>
          </div>
        )}
        <div className="flex justify-center gap-3">
          {phase === 'CAST' && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playDash();
                setPhase('WAITING');
                setStatusText('Watching the bobber on the waves...');
              }}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm cursor-pointer"
            >
              Cast Line
            </button>
          )}
          {phase === 'BITE' && (
            <button
              type="button"
              onClick={() => {
                setReelProgress(40);
                setMarkerPos(50);
                setPhase('REEL');
                setStatusText('Tap "Reel!" repeatedly to keep the gold marker inside the teal zone!');
              }}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-semibold text-sm cursor-pointer"
            >
              Hook Fish!
            </button>
          )}
          {phase === 'REEL' && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setMarkerPos((m) => Math.min(94, m + 12));
              }}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-semibold text-sm cursor-pointer"
            >
              Reel!
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
  const [timeLeft, setTimeLeft] = useState(24);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const nextId = useRef(1);

  useEffect(() => {
    const spawner = window.setInterval(() => {
      const lane = Math.floor(Math.random() * 4);
      setNotes((prev) => [...prev, { id: nextId.current++, lane, y: 0 }]);
    }, 520);
    const mover = window.setInterval(() => {
      setNotes((prev) => prev.map((n) => ({ ...n, y: n.y + 3.2 })).filter((n) => n.y < 102));
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
    const candidate = notesRef.current.find((n) => n.lane === laneIdx && n.y >= 68 && n.y <= 94);
    if (candidate) {
      soundEngine.playNote(LANES[laneIdx].freq);
      setScore((s) => s + 25);
      setNotes((prev) => prev.filter((n) => n.id !== candidate.id));
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
                  className={`absolute left-2 right-2 h-4 -translate-y-1/2 rounded ${lane.color}`}
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
      <p className="text-xs text-[#a5a095]">Press D, F, J, K (or click lane buttons) when notes cross the golden bar!</p>
    </div>
  );
};

/* 4. FROSTPEAK ICE SLIDE */
const TimeSlideGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [items, setItems] = useState<{ id: number; lane: number; y: number; kind: 'flag' | 'rock' }[]>([]);
  const nextId = useRef(1);
  const laneRef = useRef(lane);
  laneRef.current = lane;

  useEffect(() => {
    const spawner = window.setInterval(() => {
      setItems((prev) => [
        ...prev,
        { id: nextId.current++, lane: Math.floor(Math.random() * 3), y: 0, kind: Math.random() > 0.4 ? 'flag' : 'rock' },
      ]);
    }, 480);

    const tick = window.setInterval(() => {
      setItems((prev) => {
        const next: typeof prev = [];
        for (const it of prev) {
          const ny = it.y + 4.5;
          if (ny >= 78 && ny <= 90 && it.lane === laneRef.current) {
            if (it.kind === 'flag') {
              soundEngine.playCollect();
              setScore((s) => s + 25);
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
    }, 35);

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
        <span>Time: {timeLeft}s</span>
        <span className="text-sky-300 font-semibold">Score: {score}</span>
      </div>
      <div className="relative grid grid-cols-3 gap-2 h-72 p-3 rounded-lg bg-[#192b3b] border border-[#3e6482] overflow-hidden">
        {[0, 1, 2].map((l) => (
          <div key={l} onClick={() => setLane(l)} className="relative h-full rounded bg-[#233d54]/60 cursor-pointer">
            {items
              .filter((it) => it.lane === l)
              .map((it) => (
                <div
                  key={it.id}
                  style={{ top: `${it.y}%` }}
                  className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    it.kind === 'flag' ? 'bg-amber-400 text-[#131a21]' : 'bg-slate-600 text-slate-200'
                  }`}
                >
                  {it.kind === 'flag' ? '★' : '▲'}
                </div>
              ))}
            {lane === l && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-sky-400 border-2 border-white flex items-center justify-center text-[#0e151b] font-bold text-xs">
                YOU
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Use A / D, Arrow Keys, or click a lane to grab Gold Flags (★) and dodge Ice Rocks (▲).</p>
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
  const [feedback, setFeedback] = useState('Click "Kick!" or press Space when your aim clears the keeper!');

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
    const saved = Math.abs(aimX - keeperX) < 14;
    const cornerBonus = aimX < 25 || aimX > 75;
    let gained = 0;
    if (saved) {
      soundEngine.playHit();
      setFeedback('Keeper deflected it! Try aiming for the corners.');
    } else {
      soundEngine.playRestoreFanfare();
      gained = cornerBonus ? 35 : 22;
      setScore((s) => s + gained);
      setFeedback(cornerBonus ? `TOP CORNER GOAL! (+${gained} pts)` : `GOAL! (+${gained} pts)`);
    }
    const rem = kicksLeft - 1;
    setKicksLeft(rem);
    if (rem <= 0) {
      window.setTimeout(() => onFinish(score + gained), 450);
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
        {/* Goal Net */}
        <div className="relative h-24 mx-6 border-t-4 border-x-4 border-white rounded-t bg-white/10">
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
  const [msg, setMsg] = useState('Shoot when the ball meter hits the glowing orange Hoop Zone!');

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
        <div className="mx-auto w-24 h-16 rounded border-2 border-white bg-white/15 flex items-end justify-center pb-2">
          <div className="w-12 h-2.5 rounded-full bg-[#e05a2b] border border-white" />
        </div>
        <p className="text-xs text-[#f5ecd8]">{msg}</p>
        <div className="relative h-8 rounded bg-[#1a130e] border border-[#8c5a37] overflow-hidden">
          <div className="absolute left-[34%] width-[32%] w-[32%] top-0 bottom-0 bg-amber-500/20 border-x border-amber-400/50" />
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

/* 8. BRIGHTFALL TRAIL BICYCLE RACE */
const BicycleRaceGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(24);
  const [items, setItems] = useState<{ id: number; lane: number; y: number; kind: 'boost' | 'stump' }[]>([]);
  const nextId = useRef(1);
  const laneRef = useRef(lane);
  laneRef.current = lane;

  useEffect(() => {
    const spawner = window.setInterval(() => {
      setItems((prev) => [
        ...prev,
        { id: nextId.current++, lane: Math.floor(Math.random() * 3), y: 0, kind: Math.random() > 0.38 ? 'boost' : 'stump' },
      ]);
    }, 440);

    const tick = window.setInterval(() => {
      setItems((prev) => {
        const next: typeof prev = [];
        for (const it of prev) {
          const ny = it.y + 4.8;
          if (ny >= 78 && ny <= 90 && it.lane === laneRef.current) {
            if (it.kind === 'boost') {
              soundEngine.playCollect();
              setScore((s) => s + 22);
            } else {
              soundEngine.playHit();
              setScore((s) => Math.max(0, s - 12));
            }
            continue;
          }
          if (ny < 100) next.push({ ...it, y: ny });
        }
        return next;
      });
    }, 32);

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
        <span>Time: {timeLeft}s</span>
        <span className="text-emerald-300 font-semibold">Score: {score}</span>
      </div>
      <div className="relative grid grid-cols-3 gap-2 h-72 p-3 rounded-lg bg-[#274a34] border border-[#4f825b] overflow-hidden">
        {[0, 1, 2].map((l) => (
          <div key={l} onClick={() => setLane(l)} className="relative h-full rounded bg-[#8f6c47]/45 cursor-pointer">
            {items
              .filter((it) => it.lane === l)
              .map((it) => (
                <div
                  key={it.id}
                  style={{ top: `${it.y}%` }}
                  className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    it.kind === 'boost' ? 'bg-amber-400 text-[#111921]' : 'bg-[#4f3220] text-amber-200'
                  }`}
                >
                  {it.kind === 'boost' ? '⚡' : '🪵'}
                </div>
              ))}
            {lane === l && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-2 rounded-full bg-amber-300 border-2 border-white text-[#111921] font-bold text-xs">
                BIKE
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a5a095]">Use A / D, Arrow Keys, or click a trail lane to hit Speed Boosts (⚡) and dodge fallen stumps!</p>
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
    }, 460);

    const tick = window.setInterval(() => {
      const steerSpeed = 2.6 + (boatLevel - 1) * 0.55;
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
        className="relative h-72 rounded-lg bg-[#164b66] border border-[#3e85a6] overflow-hidden cursor-ew-resize"
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
            {g.kind === 'buoy' ? '◎' : '🪨'}
          </div>
        ))}
        <div
          style={{ left: `${xPos}%` }}
          className="absolute bottom-3 -translate-x-1/2 px-3 py-2 rounded-lg bg-[#8c5a37] border-2 border-[#f5cc6b] text-white font-bold text-xs"
        >
          ⛵ BOAT
        </div>
      </div>
      <p className="text-xs text-[#a5a095]">Move mouse or use A / D to steer through Glowing Buoys (◎) and dodge Sea Rocks!</p>
    </div>
  );
};

/* 10. GOLDEN SKILLET COOKING CHALLENGE */
const CookingGame: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const STEPS = ['Chop Fresh Produce', 'Simmer & Stir Spices', 'Sear in Golden Skillet', 'Plate Bistro Feast'];
  const [stepIdx, setStepIdx] = useState(0);
  const [needle, setNeedle] = useState(15);
  const [dir, setDir] = useState(2.5);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('Hit "Cook Step!" right inside the golden pan zone!');

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
    let pts = 15;
    if (dist <= 8) {
      soundEngine.playRestoreFanfare();
      pts = 45;
      setMsg('Masterful sear! (+45 pts)');
    } else if (dist <= 18) {
      soundEngine.playCollect();
      pts = 30;
      setMsg('Nice timing! (+30 pts)');
    } else {
      soundEngine.playHit();
      setMsg('Slightly overcooked! (+15 pts)');
    }
    const nextScore = score + pts;
    setScore(nextScore);
    if (stepIdx + 1 >= STEPS.length) {
      window.setTimeout(() => onFinish(nextScore), 350);
    } else {
      setStepIdx((i) => i + 1);
      setDir((d) => (d > 0 ? d + 0.4 : d - 0.4));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[#cfc8b8] font-mono-tabular">
        <span>Course {stepIdx + 1} / {STEPS.length}</span>
        <span className="text-amber-300 font-semibold">Score: {score}</span>
      </div>
      <div className="p-6 rounded-lg bg-[#291f1a] border border-[#6e4b38] space-y-5 text-center">
        <div className="text-base font-display font-semibold text-[#f5cc6b]">{STEPS[stepIdx]}</div>
        <p className="text-xs text-[#dce4ea]">{msg}</p>
        <div className="relative h-8 rounded bg-[#140e0c] border border-[#593c2d] overflow-hidden">
          <div className="absolute left-[42%] w-[16%] top-0 bottom-0 bg-amber-400/35 border-x border-amber-300" />
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
          Cook Step!
        </button>
      </div>
      <p className="text-xs text-[#a5a095]">Score 70+ pts to take home a freshly baked Hearth & Crumb Berry Tart!</p>
    </div>
  );
};

const TITLES: Record<MiniGameId, string> = {
  archery: 'Aether Archery Range',
  fishing: 'Tidewater Fishing',
  rhythm: 'Harmony Rhythm Stage',
  timeslide: 'Frostpeak Ice Slide Trial',
  runememory: 'Ancient Rune Memory Seal',
  football: 'Brightfall Football Penalty',
  basketball: 'Brightfall Basketball Hoops',
  bicyclerace: 'Brightfall Trail Bicycle Race',
  boatrace: 'Ocean Boat Slalom Race',
  cooking: 'Golden Skillet Cooking',
};

export const MiniGameModal: React.FC = () => {
  const { activeMiniGame, closeMiniGame, recordMiniGameScore, recordFishCaught, save, hud } = useGame();
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);

  if (!activeMiniGame) return null;

  const handleFinish = (score: number) => {
    setFinalScore(score);
    recordMiniGameScore(activeMiniGame, score);
  };

  const best = save.miniGameBestScores[activeMiniGame] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/85 p-4">
      <div className="w-full max-w-xl rounded-xl bg-[#161e26] border border-[#324252] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#293644]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#f3efe6]">{TITLES[activeMiniGame]}</h2>
            <p className="text-xs text-[#9aa3ad] font-mono-tabular">Personal Best: {best} pts</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFinalScore(null);
              closeMiniGame();
            }}
            className="p-2 rounded-lg text-[#a5a095] hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close mini-game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {finalScore !== null ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[#a5a095]">Activity Complete</p>
                <p className="font-display text-3xl font-bold text-[#f3efe6] font-mono-tabular">{finalScore} pts</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFinalScore(null);
                    setRunKey((k) => k + 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#131a21] font-semibold text-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFinalScore(null);
                    closeMiniGame();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#253240] hover:bg-[#314254] text-[#f3efe6] font-medium text-sm cursor-pointer"
                >
                  Return to World
                </button>
              </div>
            </div>
          ) : (
            <div key={runKey}>
              {activeMiniGame === 'archery' && <ArcheryGame onFinish={handleFinish} />}
              {activeMiniGame === 'fishing' && (
                <FishingGame
                  region={hud.region}
                  weather={hud.weather}
                  timePhase={hud.timePhase}
                  rodId={save.equippedRod}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

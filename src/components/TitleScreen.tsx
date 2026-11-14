import React, { useEffect } from 'react';
import { Play, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { useGame } from '../state/GameStore';
import { soundEngine } from '../audio/SoundEngine';

export const TitleScreen: React.FC = () => {
  const { screen, hasExistingSave, continueGame, startNewGame, setActiveModal } = useGame();

  useEffect(() => {
    if (screen !== 'TITLE_MENU') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (hasExistingSave) continueGame();
        else startNewGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, hasExistingSave, continueGame, startNewGame]);

  if (screen !== 'TITLE_MENU') return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[#0e151b] select-none overflow-hidden">
      {/* Generated 16-bit Pixel Art Key Art Backdrop */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/bounce_back_title_keyart_1794618547876.jpg"
          alt="Aetheria coastal town, forest, and mountains at twilight"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c131a]/88 via-[#0c131a]/48 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c131a]/90 via-transparent to-[#0c131a]/30" />
      </div>

      {/* Main Content Left-Anchored over Calm Negative Sky Space */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
        {/* Bespoke SVG Title Lockup */}
        <div className="mb-5">
          <svg
            viewBox="0 0 460 110"
            className="w-full max-w-[430px] h-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
            role="img"
            aria-label="Bounce Back"
          >
            <defs>
              <linearGradient id="bbGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe79e" />
                <stop offset="55%" stopColor="#e8b354" />
                <stop offset="100%" stopColor="#c47335" />
              </linearGradient>
            </defs>
            <path
              d="M12 24 L36 10 L60 24 L48 44 L24 44 Z"
              fill="#6ae0d6"
              opacity="0.9"
            />
            <path
              d="M24 26 L36 16 L48 26 L36 38 Z"
              fill="#fff7d6"
            />
            <text
              x="72"
              y="56"
              fill="url(#bbGold)"
              fontFamily="Fraunces, Georgia, serif"
              fontWeight="700"
              fontSize="48"
              letterSpacing="1.5"
            >
              BOUNCE BACK
            </text>
            <line x1="74" y1="68" x2="438" y2="68" stroke="#e8b354" strokeWidth="2" strokeOpacity="0.55" />
            <text
              x="74"
              y="91"
              fill="#d8e3e8"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="500"
              fontSize="14"
              letterSpacing="3.5"
            >
              CHRONICLES OF AETHERIA
            </text>
          </svg>
        </div>

        <p className="text-[#dce4ea] text-base leading-relaxed max-w-lg mb-8">
          After the Great Fall dimmed Aetheria’s lanterns, its towns and outer islands fell quiet. Explore nineteen interconnected regions across sea, subterranean depths, drifting isles, and skyborne horizons, rebuild communities, master ten playable companions, and prove a setback never writes the final chapter.
        </p>

        {/* Primary Menu Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {hasExistingSave && (
            <button
              type="button"
              onClick={continueGame}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#11181f] font-semibold text-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              Continue Journey
            </button>
          )}
          <button
            type="button"
            onClick={startNewGame}
            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
              hasExistingSave
                ? 'bg-[#1e2b36] hover:bg-[#293a48] text-[#f3efe6] border border-[#3a4f61]'
                : 'bg-[#e0a943] hover:bg-[#ebb754] text-[#11181f]'
            }`}
          >
            {hasExistingSave ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {hasExistingSave ? 'New Game' : 'Start Adventure'}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playUiClick();
              setActiveModal('SETTINGS');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#162029]/90 hover:bg-[#22313f] text-[#dce4ea] border border-[#304252] text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playUiClick();
              setActiveModal('CREDITS');
            }}
            className="px-4 py-3 rounded-lg bg-[#162029]/90 hover:bg-[#22313f] text-[#dce4ea] border border-[#304252] text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
          >
            Credits
          </button>
        </div>
      </div>

      {/* Single Flat Control-Hint Line */}
      <div className="relative z-10 px-8 md:px-16 py-4 border-t border-white/10 bg-[#0b1117]/75 flex flex-wrap items-center justify-between gap-4 text-xs text-[#b8c4ce]">
        <span>WASD Move · Shift Sprint · Space Dash · E Interact · Q Ability · V Airship · P Photo · G Gear · M Map · Esc Pause</span>
        <span className="text-[#94a3b0]">Press Enter to begin</span>
      </div>
    </div>
  );
};

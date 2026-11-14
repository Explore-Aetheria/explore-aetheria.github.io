import React from 'react';
import { Home, Play, Save, Settings, Sparkles } from 'lucide-react';
import { useGame } from '../../state/GameStore';

export const PauseAndEndingModal: React.FC = () => {
  const {
    screen,
    setScreen,
    setActiveModal,
    manualSave,
    save,
    getTotalRestorationPercent,
  } = useGame();

  if (screen === 'PAUSED') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/80 p-4">
        <div className="w-full max-w-sm rounded-xl bg-[#141c24] border border-[#304252] shadow-2xl p-6 space-y-5 text-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#f3efe6]">Paused</h2>
            <p className="text-xs text-[#87d4c8] capitalize mt-1">
              Difficulty: {save.settings.difficulty} · Brightfall Event: {save.cityEvent.replace('_', ' ')}
            </p>
          </div>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setScreen('PLAYING')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Resume Adventure
            </button>
            <button
              type="button"
              onClick={manualSave}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d2834] hover:bg-[#273747] text-[#f3efe6] border border-[#34485c] font-medium text-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Game
            </button>
            <button
              type="button"
              onClick={() => {
                setScreen('PLAYING');
                setActiveModal('SETTINGS');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d2834] hover:bg-[#273747] text-[#f3efe6] border border-[#34485c] font-medium text-sm cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Settings & Controls
            </button>
            <button
              type="button"
              onClick={() => {
                manualSave();
                setActiveModal(null);
                setScreen('TITLE_MENU');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#161e26] hover:bg-[#222d38] text-[#aeb9c4] border border-[#283644] font-medium text-sm cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Return to Title Screen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'ENDING') {
    const pct = getTotalRestorationPercent();
    const completedQuests = Object.values(save.quests).filter((q) => q.status === 'completed').length;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1016]/90 p-4">
        <div className="w-full max-w-xl rounded-xl bg-[#161f29] border border-[#e0a943]/60 shadow-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-300 text-amber-300 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-display text-3xl font-bold text-[#f5cc6b]">Aetheria Bounces Back!</h2>
          <p className="text-sm leading-relaxed text-[#dce4ea]">
            With Aurelius, The Last Remnant purified at the Dawn Sanctum, golden light sweeps back across Brightfall’s grand avenues, Frostpeak’s hearths, Sunset Coast’s lighthouse, Whispering Woods’ emerald canopy, the six outer islands, Subterranea, and distant horizons.
          </p>
          <p className="text-sm text-[#87d4c8]">
            You proved that a setback does not end the story—what we rebuild together defines what comes next.
          </p>

          <div className="grid grid-cols-3 gap-3 py-2 font-mono-tabular">
            <div className="p-3 rounded-lg bg-[#11181f] border border-[#2c3b4a]">
              <div className="text-xl font-bold text-[#f5cc6b]">{pct}%</div>
              <div className="text-[11px] text-[#9aa6b2]">World Restored</div>
            </div>
            <div className="p-3 rounded-lg bg-[#11181f] border border-[#2c3b4a]">
              <div className="text-xl font-bold text-[#87d4c8]">{save.defeatedGuardians.length}/12</div>
              <div className="text-[11px] text-[#9aa6b2]">Guardians Purified</div>
            </div>
            <div className="p-3 rounded-lg bg-[#11181f] border border-[#2c3b4a]">
              <div className="text-xl font-bold text-[#f3efe6]">{completedQuests}</div>
              <div className="text-[11px] text-[#9aa6b2]">Quests Completed</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScreen('PLAYING')}
            className="px-6 py-3 rounded-lg bg-[#e0a943] hover:bg-[#ebb754] text-[#111921] font-semibold text-sm cursor-pointer"
          >
            Continue Exploring Aetheria
          </button>
        </div>
      </div>
    );
  }

  return null;
};

import React, { useEffect } from 'react';
import { DialogueOverlay } from './components/DialogueOverlay';
import { GameHud } from './components/GameHud';
import { MiniGameModal } from './components/minigames/MiniGameModal';
import { GameMenusModal } from './components/modals/GameMenusModal';
import { PauseAndEndingModal } from './components/modals/PauseAndEndingModal';
import { WorldMapModal } from './components/modals/WorldMapModal';
import { PhaserViewport } from './components/PhaserViewport';
import { TitleScreen } from './components/TitleScreen';
import { gameBridge } from './game/GameBridge';
import { GameProvider, useGame } from './state/GameStore';

const GameShell: React.FC = () => {
  const {
    screen,
    setScreen,
    activeModal,
    setActiveModal,
    activeDialogueNpcId,
    setActiveDialogueNpcId,
    save,
    hud,
    pushToast,
  } = useGame();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen === 'TITLE_MENU') return;

      if (e.code === 'Escape') {
        e.preventDefault();
        if (activeDialogueNpcId) {
          setActiveDialogueNpcId(null);
          return;
        }
        if (activeModal && activeModal !== 'MINIGAME') {
          setActiveModal(null);
          return;
        }
        if (screen === 'PLAYING' && !activeModal) {
          setScreen('PAUSED');
        } else if (screen === 'PAUSED') {
          setScreen('PLAYING');
        }
        return;
      }

      if (screen !== 'PLAYING' || activeDialogueNpcId || activeModal === 'MINIGAME' || activeModal === 'SETTINGS') {
        return;
      }

      if (e.code === save.settings.keyBindings.map) {
        setActiveModal(activeModal === 'MAP' ? null : 'MAP');
      } else if (e.code === 'KeyI') {
        setActiveModal(activeModal === 'INVENTORY' ? null : 'INVENTORY');
      } else if (e.code === 'KeyC') {
        setActiveModal(activeModal === 'CHARACTERS' ? null : 'CHARACTERS');
      } else if (e.code === 'KeyG') {
        setActiveModal(activeModal === 'EQUIPMENT' ? null : 'EQUIPMENT');
      } else if (e.code === 'KeyH' && hud.interiorId === 'int_player_house') {
        setActiveModal(activeModal === 'HOUSE' ? null : 'HOUSE');
      } else if (e.code === 'KeyJ') {
        setActiveModal(activeModal === 'QUESTS' ? null : 'QUESTS');
      } else if (e.code === 'KeyU') {
        setActiveModal(activeModal === 'UPGRADES' ? null : 'UPGRADES');
      } else if (e.code === 'KeyB') {
        setActiveModal(activeModal === 'JOURNAL' ? null : 'JOURNAL');
      } else if (e.code === 'KeyK') {
        setActiveModal(activeModal === 'COMPANIONS' ? null : 'COMPANIONS');
      } else if (e.code === 'KeyP' && !activeModal) {
        if (hud.interiorId) {
          pushToast('Step outdoors to photograph wildlife and horizons!');
        } else {
          gameBridge.takePhoto();
        }
      } else if (e.code === 'KeyV' && !activeModal) {
        if (!save.airship.unlocked) {
          pushToast('Reopen Brightfall Railway & Skyport to unlock the Skywing Airship.');
        } else if (hud.interiorId) {
          pushToast('Step outdoors before launching the Airship.');
        } else if (hud.isFlying) {
          gameBridge.landAirship();
        } else {
          gameBridge.boardAirship();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    setScreen,
    activeModal,
    setActiveModal,
    activeDialogueNpcId,
    setActiveDialogueNpcId,
    save.settings.keyBindings.map,
    save.airship.unlocked,
    hud.interiorId,
    hud.isFlying,
    pushToast,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0e151b]">
      <PhaserViewport />
      <TitleScreen />
      <GameHud />
      <DialogueOverlay />
      <WorldMapModal />
      <GameMenusModal />
      <MiniGameModal />
      <PauseAndEndingModal />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { buildNpcDialogue } from '../data/npcs';
import { gameBridge } from '../game/GameBridge';
import { getNpcPortraitDataUrl } from '../game/PixelArtGenerator';
import { useGame } from '../state/GameStore';
import { DialogueChoice } from '../types/game';

export const DialogueOverlay: React.FC = () => {
  const {
    activeDialogueNpcId,
    setActiveDialogueNpcId,
    save,
    startQuest,
    completeQuest,
    completeRestoration,
    openMiniGame,
    setActiveModal,
    upgradeBoat,
    sleepUntil,
    updateSettings,
    pushToast,
  } = useGame();

  const [nodeId, setNodeId] = useState('root');

  useEffect(() => {
    setNodeId('root');
  }, [activeDialogueNpcId]);

  const tree = useMemo(() => {
    if (!activeDialogueNpcId) return null;
    return buildNpcDialogue(activeDialogueNpcId, save);
  }, [activeDialogueNpcId, save]);

  const portraitUrl = useMemo(() => {
    if (!activeDialogueNpcId) return '';
    return getNpcPortraitDataUrl(activeDialogueNpcId);
  }, [activeDialogueNpcId]);

  if (!activeDialogueNpcId || !tree) return null;
  const node = tree[nodeId] ?? tree.root;
  const charQuip = node.characterQuips?.[save.activeCharacter];

  const handleChoice = (choice: DialogueChoice) => {
    soundEngine.playUiClick();
    if (choice.action) {
      const act = choice.action;
      if (act.type === 'START_QUEST') startQuest(act.questId);
      else if (act.type === 'COMPLETE_QUEST') completeQuest(act.questId);
      else if (act.type === 'RESTORE_PROJECT') {
        const ok = completeRestoration(act.projectId);
        if (!ok) {
          setActiveDialogueNpcId(null);
          return;
        }
      } else if (act.type === 'OPEN_MINIGAME') {
        openMiniGame(act.miniGameId);
        return;
      } else if (act.type === 'OPEN_SHOP') {
        const shopId = act.shopId ?? 'market';
        const nextSave = { ...save, activeShopId: shopId };
        gameBridge.setLatestSave(nextSave);
        setActiveDialogueNpcId(null);
        // Persist activeShopId via callbacks pattern or store helper
        gameBridge.getCallbacks()?.onOpenShop(shopId);
        return;
      } else if (act.type === 'OPEN_EQUIPMENT') {
        setActiveDialogueNpcId(null);
        setActiveModal('EQUIPMENT');
        return;
      } else if (act.type === 'OPEN_HOUSE') {
        setActiveDialogueNpcId(null);
        setActiveModal('HOUSE');
        return;
      } else if (act.type === 'OPEN_VILLAGE') {
        setActiveDialogueNpcId(null);
        setActiveModal('VILLAGE');
        return;
      } else if (act.type === 'OPEN_AIRSHIP') {
        setActiveDialogueNpcId(null);
        setActiveModal('AIRSHIP');
        return;
      } else if (act.type === 'OPEN_EVENTS') {
        setActiveDialogueNpcId(null);
        setActiveModal('EVENTS');
        return;
      } else if (act.type === 'OPEN_CHARACTERS') {
        setActiveDialogueNpcId(null);
        setActiveModal('CHARACTERS');
        return;
      } else if (act.type === 'BOARD_BOAT') {
        setActiveDialogueNpcId(null);
        gameBridge.boardBoat();
        return;
      } else if (act.type === 'BOARD_AIRSHIP') {
        setActiveDialogueNpcId(null);
        gameBridge.boardAirship();
        return;
      } else if (act.type === 'UPGRADE_BOAT') {
        upgradeBoat();
        setActiveDialogueNpcId(null);
        return;
      } else if (act.type === 'ENTER_ZONE') {
        setActiveDialogueNpcId(null);
        gameBridge.enterZone(act.interiorId);
        return;
      } else if (act.type === 'CHALLENGE_GUARDIAN') {
        setActiveDialogueNpcId(null);
        gameBridge.startGuardianEncounter(act.guardianId);
        return;
      } else if (act.type === 'GIVE_ITEM') {
        gameBridge.getCallbacks()?.onCollectItem(`dlg_${act.itemId}_${Date.now()}`, act.itemId, act.quantity);
      } else if (act.type === 'SLEEP_TIME') {
        sleepUntil(act.targetHour);
        setActiveDialogueNpcId(null);
        return;
      } else if (act.type === 'HEAL_PLAYER') {
        gameBridge.healPlayer();
        pushToast('Health & Energy fully restored!');
      } else if (act.type === 'CLOSE') {
        setActiveDialogueNpcId(null);
        return;
      }
    }
    void updateSettings;

    if (choice.nextNodeId && tree[choice.nextNodeId]) {
      setNodeId(choice.nextNodeId);
    } else {
      setActiveDialogueNpcId(null);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl bg-[#131b24]/96 border border-[#3a4f63] shadow-2xl p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#1d2a38] border border-[#3e556b] overflow-hidden shrink-0">
            <img src={portraitUrl} alt={node.speaker} className="w-full h-full object-contain pixel-canvas" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-semibold text-[#f5cc6b]">{node.speaker}</span>
              <span className="text-xs text-[#94a3b0]">· {node.speakerRole}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#ece6da]">{node.text}</p>
            {charQuip && <p className="text-xs italic text-[#87d4c8] pt-1">{charQuip}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#263544]">
          {node.choices.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(c)}
              className="px-3.5 py-2 rounded-lg bg-[#1e2c3a] hover:bg-[#2a3e52] border border-[#364d63] text-xs font-medium text-[#f3efe6] text-left transition-colors cursor-pointer"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

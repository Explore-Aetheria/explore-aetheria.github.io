import { ISLAND_CAMPAIGN_QUESTS, getIslandCampaignCompletedCount } from './islandCampaigns';
import { GUARDIANS, MAIN_OFFSET_X as OX, MAIN_OFFSET_Y as OY } from './progression';
import { QUESTS } from './quests';
import { DialogueChoice, DialogueNode, NpcDef, RegionId, SaveData } from '../types/game';

export const NPCS: NpcDef[] = [
  // Brightfall Metropolis & Mainland NPCs (aligned to OX=120, OY=85)
  {
    id: 'npc_mayor_theo',
    name: 'Mayor Theo',
    role: 'Mayor of Brightfall City',
    region: 'brightfall',
    tileX: OX + 56,
    tileY: OY + 54,
    patrolRadius: 3,
    palette: { hair: '#b8b3a8', outfit: '#354f6b', trim: '#e0a943', skin: '#ecc4a0' },
    voicePitch: 290,
    questMarkerIds: ['q_welcome_brightfall'],
    scheduleNote: 'Brightfall Fountain Plaza all day & lantern evenings',
  },
  {
    id: 'npc_midnight_peddler',
    name: 'Curio Peddler Nyx',
    role: 'Moonlight Lantern & Chart Merchant',
    region: 'brightfall',
    tileX: OX + 52,
    tileY: OY + 56,
    patrolRadius: 1,
    palette: { hair: '#2e2246', outfit: '#2b2042', trim: '#c792ea', skin: '#ead0d8' },
    voicePitch: 435,
    questMarkerIds: ['q_night_watch'],
    activeHours: [19, 5],
    scheduleNote: 'Night Market Cart in Brightfall Plaza (19:00–05:00)',
  },
  {
    id: 'npc_builder_mae',
    name: 'Builder Mae',
    role: 'Chief Restorer & Village Architect',
    region: 'brightfall',
    interiorId: 'int_restoration_hall',
    tileX: 10,
    tileY: 8,
    patrolRadius: 2,
    palette: { hair: '#5e3528', outfit: '#b85c38', trim: '#f0c475', skin: '#d89b72' },
    voicePitch: 410,
    questMarkerIds: ['q_newbrook_founder'],
    scheduleNote: 'Indoors at Restoration Hall (always open)',
  },
  {
    id: 'npc_chef_clara',
    name: 'Chef Clara',
    role: 'Hearth & Crumb Baker',
    region: 'brightfall',
    tileX: OX + 44,
    tileY: OY + 52,
    patrolRadius: 2,
    palette: { hair: '#3b2c27', outfit: '#e8e2d5', trim: '#c95d43', skin: '#f0c5a4' },
    voicePitch: 460,
    questMarkerIds: ['q_cafe_beans'],
    scheduleNote: 'Tends Hearth & Crumb Café terrace from sunrise to evening',
  },
  {
    id: 'npc_merchant_milo',
    name: 'Merchant Milo',
    role: 'Brightfall Market & Mall Director',
    region: 'brightfall',
    tileX: OX + 64,
    tileY: OY + 56,
    patrolRadius: 2,
    palette: { hair: '#784b2a', outfit: '#436e56', trim: '#e4b363', skin: '#e8ba93' },
    voicePitch: 360,
    questMarkerIds: ['q_market_gears'],
    scheduleNote: 'Brightfall Market Promenade (07:00–22:00)',
  },
  {
    id: 'npc_tailor_june',
    name: 'Tailor June',
    role: 'Atelier Designer',
    region: 'brightfall',
    interiorId: 'int_atelier',
    tileX: 9,
    tileY: 7,
    patrolRadius: 1,
    palette: { hair: '#8c3f62', outfit: '#5a4378', trim: '#f2c879', skin: '#f2cba8' },
    voicePitch: 495,
    questMarkerIds: ['q_garden_bloom'],
  },
  {
    id: 'npc_trainer_kael',
    name: 'Trainer Kael',
    role: 'Aether Athletics Coach',
    region: 'brightfall',
    interiorId: 'int_training_hall',
    tileX: 10,
    tileY: 7,
    patrolRadius: 2,
    palette: { hair: '#2c303b', outfit: '#c45b42', trim: '#f0e7d8', skin: '#c98e6a' },
    voicePitch: 330,
    questMarkerIds: ['q_archery_champion'],
  },
  {
    id: 'npc_bard_oliver',
    name: 'Oliver the Bard',
    role: 'Festival & City Events Director',
    region: 'brightfall',
    tileX: OX + 52,
    tileY: OY + 61,
    patrolRadius: 3,
    palette: { hair: '#c48f45', outfit: '#634375', trim: '#ebd083', skin: '#f0c9a8' },
    voicePitch: 450,
    questMarkerIds: ['q_amusement_revival'],
  },
  {
    id: 'npc_neighbor_tessa',
    name: 'Tessa',
    role: 'Returning Resident',
    region: 'brightfall',
    tileX: OX + 48,
    tileY: OY + 48,
    patrolRadius: 4,
    palette: { hair: '#4a3228', outfit: '#4a7a78', trim: '#e6c580', skin: '#e6b895' },
    voicePitch: 480,
    requiresRestorationId: 'rest_brightfall_cafe',
  },
  {
    id: 'npc_grocer_hana',
    name: 'Grocer Hana',
    role: 'Aetheria Fresh Mart Owner',
    region: 'brightfall',
    interiorId: 'int_supermarket',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#24303c', outfit: '#3b7d54', trim: '#f2ead8', skin: '#eec5a4' },
    voicePitch: 470,
  },
  {
    id: 'npc_chef_marcus',
    name: 'Chef Marcus',
    role: 'Golden Skillet Bistro',
    region: 'brightfall',
    interiorId: 'int_restaurant',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#3b241c', outfit: '#e8e2d5', trim: '#b84b3e', skin: '#c78c68' },
    voicePitch: 320,
  },
  {
    id: 'npc_smith_garrick',
    name: 'Smith Garrick',
    role: 'Anvil & Spark Armory',
    region: 'brightfall',
    interiorId: 'int_smithy',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#4f3a31', outfit: '#634234', trim: '#e0a943', skin: '#d89d76' },
    voicePitch: 270,
  },
  {
    id: 'npc_coach_leo',
    name: 'Coach Leo',
    role: 'Olympic Sports Park Director',
    region: 'brightfall',
    tileX: OX + 70,
    tileY: OY + 66,
    patrolRadius: 2,
    palette: { hair: '#2b2b2b', outfit: '#2f6da3', trim: '#f5cc6b', skin: '#d4966e' },
    voicePitch: 340,
    questMarkerIds: ['q_island_sports'],
  },
  {
    id: 'npc_doctor_claire',
    name: 'Dr. Claire',
    role: 'Brightfall Hospital Chief & Naturalist',
    region: 'brightfall',
    interiorId: 'int_hospital',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#6b3e2e', outfit: '#eef5f8', trim: '#e05a47', skin: '#f2cba8' },
    voicePitch: 465,
    questMarkerIds: ['q_wildlife_photo'],
  },
  {
    id: 'npc_librarian_elena',
    name: 'Librarian Elena',
    role: 'Grand Library Archivist',
    region: 'brightfall',
    interiorId: 'int_library',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#3c2e4f', outfit: '#5a4378', trim: '#f5cc6b', skin: '#ecc4a0' },
    voicePitch: 455,
    questMarkerIds: ['q_moving_island_clue'],
  },
  {
    id: 'npc_engineer_vera',
    name: 'Engineer Vera',
    role: 'Grand Skyport & Rail Captain',
    region: 'brightfall',
    tileX: OX + 76,
    tileY: OY + 39,
    patrolRadius: 2,
    palette: { hair: '#944a2a', outfit: '#284c6b', trim: '#f5cc6b', skin: '#e8ba93' },
    voicePitch: 425,
    questMarkerIds: ['q_airship_wings'],
    scheduleNote: 'Inspects Skyport Runway beacons & airship hangar deck',
  },
  {
    id: 'npc_station_master',
    name: 'Conductor Bram',
    role: 'Brightfall Central Station',
    region: 'brightfall',
    tileX: OX + 64,
    tileY: OY + 40,
    patrolRadius: 2,
    palette: { hair: '#8f8c84', outfit: '#2c3d55', trim: '#e0a943', skin: '#e2b690' },
    voicePitch: 295,
    scheduleNote: 'Dispatches the Brightfall Express along the northern platform',
  },
  {
    id: 'npc_officer_blake',
    name: 'Officer Blake',
    role: 'Brightfall Civic Safety & Fire Chief',
    region: 'brightfall',
    tileX: OX + 40,
    tileY: OY + 44,
    patrolRadius: 3,
    palette: { hair: '#2a2c38', outfit: '#274469', trim: '#e6c565', skin: '#d89b72' },
    voicePitch: 300,
  },
  {
    id: 'npc_arcade_host',
    name: 'Rex',
    role: 'Starlight Cinema & Arcade Host',
    region: 'brightfall',
    interiorId: 'int_arcade',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#4a2870', outfit: '#75386e', trim: '#7be3f5', skin: '#e8ba93' },
    voicePitch: 390,
  },
  {
    id: 'npc_tackle_master',
    name: 'Reef',
    role: 'Grand Marina Tackle Outfitter',
    region: 'sunset_coast',
    interiorId: 'int_tackle_shop',
    tileX: 9,
    tileY: 6,
    patrolRadius: 1,
    palette: { hair: '#2f6c78', outfit: '#1f4e5c', trim: '#ffd466', skin: '#d9a079' },
    voicePitch: 350,
  },
  {
    id: 'npc_carnival_host',
    name: 'Pippa Star',
    role: 'Starfall Amusement Park Ringmaster',
    region: 'amusement_park',
    tileX: OX + 98,
    tileY: OY + 66,
    patrolRadius: 2,
    palette: { hair: '#c44d7a', outfit: '#6e326b', trim: '#ffd466', skin: '#f2c9a0' },
    voicePitch: 490,
    questMarkerIds: ['q_amusement_revival'],
  },
  {
    id: 'npc_newbrook_foreman',
    name: 'Foreman Alden',
    role: 'Newbrook Valley Planner',
    region: 'newbrook',
    tileX: OX + 27,
    tileY: OY + 26,
    patrolRadius: 2,
    palette: { hair: '#6b472d', outfit: '#4e6e42', trim: '#e4b363', skin: '#e6b895' },
    voicePitch: 315,
    questMarkerIds: ['q_newbrook_founder'],
  },
  {
    id: 'npc_delver_torin',
    name: 'Torin the Delver',
    role: 'Subterranean Warden',
    region: 'underground',
    interiorId: 'int_underground_city',
    tileX: 14,
    tileY: 11,
    patrolRadius: 2,
    palette: { hair: '#c9c4b9', outfit: '#385866', trim: '#87d4c8', skin: '#d8ad89' },
    voicePitch: 275,
    questMarkerIds: ['q_underground_depths'],
  },
  {
    id: 'npc_scholar_lyra_alt',
    name: 'Chronicle Vespera',
    role: 'Alternate Rift Guide',
    region: 'dim_mirror',
    interiorId: 'dim_mirror',
    tileX: 16,
    tileY: 12,
    patrolRadius: 2,
    palette: { hair: '#a6c8ff', outfit: '#3a2b59', trim: '#ff96e3', skin: '#ebd8f2' },
    voicePitch: 430,
    questMarkerIds: ['q_alternate_rifts'],
  },
  {
    id: 'npc_farmer_pippa',
    name: 'Farmer Pippa',
    role: 'Brightfall Orchard Keeper',
    region: 'brightfall',
    tileX: OX + 72,
    tileY: OY + 49,
    patrolRadius: 3,
    palette: { hair: '#c4713b', outfit: '#5a8244', trim: '#f2d08a', skin: '#f2c9a0' },
    voicePitch: 485,
  },
  {
    id: 'npc_dockmaster_vane',
    name: 'Dockmaster Vane',
    role: 'Harbour Master & Boatwright',
    region: 'sunset_coast',
    tileX: OX + 64,
    tileY: OY + 88,
    patrolRadius: 2,
    palette: { hair: '#7c8894', outfit: '#1e4a66', trim: '#f0c475', skin: '#dfa782' },
    voicePitch: 295,
  },
  {
    id: 'npc_townsperson_eli',
    name: 'Eli',
    role: 'Neighborhood Runner',
    region: 'brightfall',
    tileX: OX + 46,
    tileY: OY + 60,
    patrolRadius: 5,
    palette: { hair: '#3d2c22', outfit: '#d96b43', trim: '#f2eee4', skin: '#e8b994' },
    voicePitch: 380,
  },
  {
    id: 'npc_elder_moss',
    name: 'Elder Moss',
    role: 'Keeper of Mossbrook',
    region: 'whispering_woods',
    tileX: OX + 23,
    tileY: OY + 60,
    patrolRadius: 2,
    palette: { hair: '#d8e0d3', outfit: '#386346', trim: '#c7a45b', skin: '#d8ad89' },
    voicePitch: 270,
    questMarkerIds: ['q_woodland_giant'],
  },
  {
    id: 'npc_herbalist_fern',
    name: 'Herbalist Fern',
    role: 'Botanist & Healer',
    region: 'whispering_woods',
    tileX: OX + 20,
    tileY: OY + 65,
    patrolRadius: 3,
    palette: { hair: '#5a7838', outfit: '#6b533b', trim: '#98d68b', skin: '#eec5a2' },
    voicePitch: 470,
    questMarkerIds: ['q_missing_ferns'],
  },
  {
    id: 'npc_captain_finn',
    name: 'Captain Finn',
    role: 'Driftwood Harbor Master',
    region: 'sunset_coast',
    tileX: OX + 68,
    tileY: OY + 86,
    patrolRadius: 2,
    palette: { hair: '#c9c4b9', outfit: '#284c6b', trim: '#e6b95c', skin: '#d9a079' },
    voicePitch: 280,
    questMarkerIds: ['q_sunset_lighthouse'],
  },
  {
    id: 'npc_angler_marina',
    name: 'Angler Marina',
    role: 'Pier Champion',
    region: 'sunset_coast',
    tileX: OX + 72,
    tileY: OY + 88,
    patrolRadius: 2,
    palette: { hair: '#2c5c6e', outfit: '#d97a4a', trim: '#f2e8d5', skin: '#e8b994' },
    voicePitch: 445,
    questMarkerIds: ['q_coastal_catch'],
  },
  {
    id: 'npc_warden_ingrid',
    name: 'Warden Ingrid',
    role: 'Hearthstone Guide',
    region: 'frostpeak',
    tileX: OX + 88,
    tileY: OY + 32,
    patrolRadius: 2,
    palette: { hair: '#d49a57', outfit: '#3d5a73', trim: '#ebe8e1', skin: '#f2ccb0' },
    voicePitch: 415,
    questMarkerIds: ['q_frostpeak_hearth'],
  },
  {
    id: 'npc_skier_tobi',
    name: 'Tobi',
    role: 'Ice Trail Runner',
    region: 'frostpeak',
    tileX: OX + 83,
    tileY: OY + 28,
    patrolRadius: 3,
    palette: { hair: '#3d2c24', outfit: '#b84c44', trim: '#a6dcff', skin: '#eec5a4' },
    voicePitch: 500,
  },
  {
    id: 'npc_archivist_orin',
    name: 'Archivist Orin',
    role: 'Scholar of the Dawn',
    region: 'forgotten_kingdom',
    tileX: OX + 44,
    tileY: OY + 23,
    patrolRadius: 2,
    palette: { hair: '#e8e2d8', outfit: '#443563', trim: '#f0c469', skin: '#e0b38f' },
    voicePitch: 310,
    questMarkerIds: ['q_forgotten_kingdom', 'q_rune_scholar'],
  },

  // 6 MASSIVE ADVENTURE ISLANDS NPCS (Aligned to 360x270 organic islands!)
  {
    id: 'npc_freya_frost',
    name: 'Mayor Freya',
    role: 'Frosthaven Mayor (Frozen Kingdom)',
    region: 'frozen_kingdom',
    tileX: 286,
    tileY: 60,
    patrolRadius: 2,
    palette: { hair: '#e8d7a5', outfit: '#365e85', trim: '#eef7fc', skin: '#f5d2b8' },
    voicePitch: 440,
  },
  {
    id: 'npc_icecarver_bjorn',
    name: 'Fjord Angler Bjorn',
    role: 'Frozen Kingdom Harvester',
    region: 'frozen_kingdom',
    tileX: 278,
    tileY: 56,
    patrolRadius: 2,
    palette: { hair: '#8c5a37', outfit: '#543e33', trim: '#a6e3ff', skin: '#ecc3a4' },
    voicePitch: 290,
  },
  {
    id: 'npc_kora_jungle',
    name: 'Ranger Kora',
    role: 'Wild Jungle Canopy Ranger',
    region: 'wild_jungle',
    tileX: 74,
    tileY: 224,
    patrolRadius: 2,
    palette: { hair: '#2b241f', outfit: '#387544', trim: '#f09b4c', skin: '#c48660' },
    voicePitch: 430,
  },
  {
    id: 'npc_botanist_tali',
    name: 'Botanist Tali',
    role: 'Wild Jungle Orchid Researcher',
    region: 'wild_jungle',
    tileX: 64,
    tileY: 228,
    patrolRadius: 3,
    palette: { hair: '#593326', outfit: '#7d5a3c', trim: '#ff82a9', skin: '#d99e75' },
    voicePitch: 475,
  },
  {
    id: 'npc_flint_volcanic',
    name: 'Master Flint',
    role: 'Emberforge Foreman (Volcanic Island)',
    region: 'volcanic_island',
    tileX: 284,
    tileY: 152,
    patrolRadius: 2,
    palette: { hair: '#c9c4b9', outfit: '#6e2e24', trim: '#ff884d', skin: '#d19873' },
    voicePitch: 265,
  },
  {
    id: 'npc_miner_cinder',
    name: 'Prospector Cinder',
    role: 'Volcanic Ore Scout',
    region: 'volcanic_island',
    tileX: 294,
    tileY: 148,
    patrolRadius: 2,
    palette: { hair: '#382a27', outfit: '#4d4854', trim: '#f5b042', skin: '#e6b894' },
    voicePitch: 365,
  },
  {
    id: 'npc_zephyr_sky',
    name: 'Wind-Keeper Zephyr',
    role: 'Cloudspire Keeper (Sky Island)',
    region: 'sky_island',
    tileX: 180,
    tileY: 50,
    patrolRadius: 2,
    palette: { hair: '#f0ece1', outfit: '#3a6f94', trim: '#f5d47a', skin: '#f0c8a8' },
    voicePitch: 390,
  },
  {
    id: 'npc_ghost_bramwell',
    name: 'Chronicler Bramwell',
    role: 'Mistvale Historian (Haunted Island)',
    region: 'haunted_island',
    tileX: 60,
    tileY: 150,
    patrolRadius: 2,
    palette: { hair: '#a8a2b3', outfit: '#392c4f', trim: '#c792ea', skin: '#e0d6e8' },
    voicePitch: 295,
  },
  {
    id: 'npc_vaelen_lost',
    name: 'Sentinel Vaelen',
    role: 'Guardian of the Lost Capital',
    region: 'lost_kingdom',
    tileX: 58,
    tileY: 58,
    patrolRadius: 2,
    palette: { hair: '#f5d47a', outfit: '#3d2a5c', trim: '#ffd466', skin: '#f0d8c8' },
    voicePitch: 320,
  },
];

function itemCount(save: SaveData, itemId: string): number {
  return save.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
}

function getReadyCampaignQuests(save: SaveData, region: RegionId) {
  return ISLAND_CAMPAIGN_QUESTS.filter((q) => {
    if (q.region !== region) return false;
    const state = save.quests[q.id];
    if (!state || state.status !== 'active') return false;
    return state.objectives.every((o) => o.current >= o.required);
  });
}

function getNextCampaignQuest(save: SaveData, region: RegionId) {
  return ISLAND_CAMPAIGN_QUESTS.find((q) => {
    if (q.region !== region) return false;
    if (save.quests[q.id]) return false;
    if (!q.prerequisiteQuestId) return true;
    return save.quests[q.prerequisiteQuestId]?.status === 'completed';
  });
}

function appendCampaignChoices(save: SaveData, region: RegionId, choices: DialogueChoice[]) {
  const ready = getReadyCampaignQuests(save, region);
  for (const rq of ready.slice(0, 2)) {
    choices.push({
      label: `Claim Reward: ${rq.title}`,
      action: { type: 'COMPLETE_QUEST', questId: rq.id },
    });
  }
  const next = getNextCampaignQuest(save, region);
  if (next) {
    choices.push({
      label: `Start Chapter ${next.campaignOrder}: ${next.title}`,
      nextNodeId: 'campaign_started',
      action: { type: 'START_QUEST', questId: next.id },
    });
  }
}

export function getFriendshipTier(points: number): string {
  if (points >= 8) return 'Trusted Ally';
  if (points >= 4) return 'Friend';
  if (points >= 2) return 'Acquaintance';
  return 'New Face';
}

function getTimeGreeting(hour: number): string {
  if (hour >= 5 && hour < 7) return 'First light breaks softly over Aetheria.';
  if (hour >= 7 && hour < 9) return 'Fresh morning air settles across the plazas.';
  if (hour >= 9 && hour < 12) return 'Bright morning sunshine fills the streets.';
  if (hour >= 12 && hour < 17) return 'Good afternoon, traveler!';
  if (hour >= 17 && hour < 19) return 'The golden evening breeze is rolling in.';
  if (hour >= 19 && hour < 21) return 'Sunset lanterns are flickering awake along the avenues.';
  if (hour >= 21 && hour < 24) return 'Quiet starlight watches over the harbor tonight.';
  return 'The midnight watch is peaceful under the moon.';
}

export function buildNpcDialogue(npcId: string, save: SaveData): Record<string, DialogueNode> {
  const nodes = buildNpcDialogueCore(npcId, save);
  const hour = Math.floor(save.timeOfDay);
  const friendship = save.npcFriendship?.[npcId] ?? 0;
  const tier = getFriendshipTier(friendship);
  const npcDef = NPCS.find((n) => n.id === npcId);
  if (nodes.root) {
    const timeNote = hour >= 19 || hour < 7 ? `${getTimeGreeting(hour)} ` : '';
    nodes.root = {
      ...nodes.root,
      speakerRole: `${nodes.root.speakerRole} · ${tier}${npcDef?.scheduleNote ? '' : ''}`,
      text:
        npcId !== 'npc_mayor_theo' && timeNote && !nodes.root.text.startsWith(timeNote)
          ? `${timeNote}${nodes.root.text}`
          : nodes.root.text,
    };
  }
  return nodes;
}

function buildNpcDialogueCore(npcId: string, save: SaveData): Record<string, DialogueNode> {
  const charId = save.activeCharacter;
  const restoredCount = save.completedRestorations.length;
  const hour = Math.floor(save.timeOfDay);
  const isNight = hour >= 19 || hour < 6;

  switch (npcId) {
    case 'npc_midnight_peddler': {
      const nq = save.quests['q_night_watch'];
      const hasEel = itemCount(save, 'fish_lantern_eel') > 0;
      const choices: DialogueChoice[] = [
        { label: 'Browse Night Market Lanterns & Charts', action: { type: 'OPEN_SHOP', shopId: 'night_market' } },
      ];
      if (!nq) {
        choices.push({
          label: 'Accept Night Quest: Lanterns of the Midnight Coast',
          nextNodeId: 'nyx_quest',
          action: { type: 'START_QUEST', questId: 'q_night_watch' },
        });
      } else if (nq.status === 'active' && (hasEel || nq.objectives.every((o) => o.current >= o.required))) {
        choices.push({
          label: 'Turn in Moonlight Lantern Eel Quest!',
          nextNodeId: 'nyx_done',
          action: { type: 'COMPLETE_QUEST', questId: 'q_night_watch' },
        });
      }
      choices.push({ label: 'Step back into the starlight', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Curio Peddler Nyx',
          speakerRole: 'Midnight Curio Merchant',
          portraitKey: 'npc_midnight_peddler',
          text: 'Only between dusk and dawn do Aetheria’s quietest treasures surface. Need a Driftspire chart fragment, glowing crystal lamp, or nocturnal angling tip?',
          choices,
        },
        nyx_quest: {
          id: 'nyx_quest',
          speaker: 'Curio Peddler Nyx',
          speakerRole: 'Midnight Curio Merchant',
          portraitKey: 'npc_midnight_peddler',
          text: 'Moonlight Lantern Eels glide near Driftwood Marina and Haunted Lagoon from Evening through Midnight. Cast out once the sky turns indigo!',
          choices: [{ label: 'To the coast!', action: { type: 'CLOSE' } }],
        },
        nyx_done: {
          id: 'nyx_done',
          speaker: 'Curio Peddler Nyx',
          speakerRole: 'Midnight Curio Merchant',
          portraitKey: 'npc_midnight_peddler',
          text: 'What a shimmer! Take this Mistvale Wisp Lantern and Sparks—it’ll keep dark trails kind on every midnight voyage.',
          choices: [{ label: 'Safe travels, Nyx.', action: { type: 'CLOSE' } }],
        },
      };
    }
    case 'npc_mayor_theo': {
      const q = save.quests['q_welcome_brightfall'];
      const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
      const allBrightfallDone =
        cafeDone &&
        save.completedRestorations.includes('rest_brightfall_market') &&
        save.completedRestorations.includes('rest_brightfall_garden');

      let greeting =
        'Welcome to Brightfall City! Once our metropolis glowed with bustling avenues, holiday trees, trains, sports stadiums, and six neighbor islands across Aetheria Sea. Let’s bounce back—block by block!';
      if (allBrightfallDone) {
        greeting =
          'Look at Brightfall now! Crosswalks, cafés, shops, trains, Starfall Carnival, and Grand Skyport are thriving again—and folks are sailing to all six islands!';
      } else if (cafeDone) {
        greeting =
          'Fresh pastries at Hearth & Crumb brought smiles back to the avenue! Check your expanded Homestead west of the square, visit Newbrook Valley NW to build a new village, or sail south from Grand Marina.';
      }

      const choices: DialogueChoice[] = [];
      if (!q) {
        choices.push({
          label: 'I want to help Brightfall recover. Where do I start?',
          nextNodeId: 'theo_start',
          action: { type: 'START_QUEST', questId: 'q_welcome_brightfall' },
        });
      } else if (q.status === 'active' && cafeDone) {
        choices.push({
          label: 'Hearth & Crumb Café is back open!',
          nextNodeId: 'theo_cafe_complete',
          action: { type: 'COMPLETE_QUEST', questId: 'q_welcome_brightfall' },
        });
      }
      choices.push({ label: 'Manage Brightfall City Festivals & Events', action: { type: 'OPEN_EVENTS' } });
      choices.push({ label: 'Tell me about Aetheria’s islands & secrets.', nextNodeId: 'theo_regions' });
      choices.push({
        label: 'Rest by the fountain (Full Heal).',
        nextNodeId: 'theo_heal',
        action: { type: 'HEAL_PLAYER' },
      });
      choices.push({ label: 'See you around the avenue.', action: { type: 'CLOSE' } });

      return {
        root: {
          id: 'root',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall City',
          portraitKey: 'npc_mayor_theo',
          text: isNight ? `Look how the streetlights & holiday trees shimmer tonight! ${greeting}` : greeting,
          characterQuips: {
            explorer: 'Rowan, with your explorer instinct, Brightfall’s avenues and six outer islands are calling!',
            inventor: 'Pip! Those brass tools can fix our railway and Grand Skyport in record time.',
            mystic: 'Lyra, your presence calms the whole square.',
          },
          choices,
        },
        theo_start: {
          id: 'theo_start',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall City',
          portraitKey: 'npc_mayor_theo',
          text: 'Help Chef Clara reopen Hearth & Crumb Café, explore Brightfall’s Mall, Hospital, Library & Olympic Sports Park, or take a boat south from Grand Marina!',
          choices: [{ label: 'On it, Mayor!', action: { type: 'CLOSE' } }],
        },
        theo_cafe_complete: {
          id: 'theo_cafe_complete',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall City',
          portraitKey: 'npc_mayor_theo',
          text: 'Incredible work! Please accept my Cartographer’s Compass. Every setback in Aetheria is just chapter one of the bounce back.',
          choices: [{ label: 'Thank you, Mayor Theo.', action: { type: 'CLOSE' } }],
        },
        theo_regions: {
          id: 'theo_regions',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall City',
          portraitKey: 'npc_mayor_theo',
          text: 'Sail to six huge surrounding islands—Frozen Kingdom (NE), Volcanic Island (E), Wild Jungle (SW), Haunted Island (W), Sky Island (N), Lost Kingdom (NW)—plus Newbrook Village, Starfall Park, Subterranea underground, and the mysterious Moving Island!',
          choices: [{ label: 'Back', nextNodeId: 'root' }],
        },
        theo_heal: {
          id: 'theo_heal',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall City',
          portraitKey: 'npc_mayor_theo',
          text: 'Health & Energy restored to 100%!',
          choices: [{ label: 'Feeling ready!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_builder_mae': {
      const canCafe = !save.completedRestorations.includes('rest_brightfall_cafe');
      const canMarket = !save.completedRestorations.includes('rest_brightfall_market');
      const canGarden = !save.completedRestorations.includes('rest_brightfall_garden');
      const canHomes = !save.completedRestorations.includes('rest_brightfall_homes');
      const canRail = !save.completedRestorations.includes('rest_brightfall_railway');
      const canPark = !save.completedRestorations.includes('rest_amusement_park');
      const choices: DialogueChoice[] = [];
      if (canCafe) {
        choices.push({
          label: `Restore Café (30 Sparks + 2 Beans [${itemCount(save, 'cafe_beans')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_cafe' },
        });
      }
      if (canMarket) {
        choices.push({
          label: `Revive Market & Mall (40 Sparks + 2 Gears [${itemCount(save, 'brass_gear')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_market' },
        });
      }
      if (canGarden) {
        choices.push({
          label: `Restore Central Park (35 Sparks + 3 Berries [${itemCount(save, 'sun_berry')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_garden' },
        });
      }
      if (canHomes) {
        choices.push({
          label: 'Repair Residential Lanes & Stage (50 Sparks)',
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_homes' },
        });
      }
      if (canRail) {
        choices.push({
          label: `Reopen Central Railway & Skyport (85 Sparks + 3 Gears [${itemCount(save, 'brass_gear')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_railway' },
        });
      }
      if (canPark) {
        choices.push({
          label: `Restore Starfall Amusement Park (90 Sparks + 3 Shards [${itemCount(save, 'aether_shard')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_amusement_park' },
        });
      }
      choices.push({ label: 'Manage Newbrook Village Construction', action: { type: 'OPEN_VILLAGE' } });
      choices.push({ label: 'Just inspecting the blueprints.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Builder Mae',
          speakerRole: 'Chief Restorer & Village Architect',
          portraitKey: 'npc_builder_mae',
          text: `Welcome to Restoration Hall! Together we’ve completed ${restoredCount} major projects. Ready to rebuild Brightfall, Starfall Park, or your Newbrook Village?`,
          choices,
        },
        mae_build_result: {
          id: 'mae_build_result',
          speaker: 'Builder Mae',
          speakerRole: 'Chief Restorer & Village Architect',
          portraitKey: 'npc_builder_mae',
          text: 'Project funded! Step outside to watch Aetheria physically transform!',
          choices: [{ label: 'Amazing!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_engineer_vera': {
      const skyUnlocked = save.airship.unlocked || save.completedRestorations.includes('rest_brightfall_railway');
      const canRail = !save.completedRestorations.includes('rest_brightfall_railway');
      const choices: DialogueChoice[] = [];
      if (!skyUnlocked && !save.quests['q_airship_wings']) {
        choices.push({
          label: 'How do I unlock the Flying Airship?',
          nextNodeId: 'vera_quest',
          action: { type: 'START_QUEST', questId: 'q_airship_wings' },
        });
      }
      if (canRail) {
        choices.push({
          label: `Repair Skyport & Railway (85 Sparks + 3 Gears [${itemCount(save, 'brass_gear')}])`,
          nextNodeId: 'vera_unlocked',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_railway' },
        });
      }
      if (skyUnlocked) {
        choices.push({ label: 'Launch Flying Airship! [Shortcut: V]', action: { type: 'BOARD_AIRSHIP' } });
        choices.push({ label: 'Upgrade & Customize Airship Hangar', action: { type: 'OPEN_AIRSHIP' } });
      }
      choices.push({ label: 'Back to the skyport', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Engineer Vera',
          speakerRole: 'Grand Skyport & Rail Captain',
          portraitKey: 'npc_engineer_vera',
          text: skyUnlocked
            ? 'The Skywing Airship is prepped on the launch pad! Press [V] anytime outdoors to take flight above mountains and oceans, or upgrade speed & hull here.'
            : 'Brightfall’s Grand Skyport connects directly to Sky Island and the high peaks—once we repair the Central Railway & Skyport turbines!',
          choices,
        },
        vera_quest: {
          id: 'vera_quest',
          speaker: 'Engineer Vera',
          speakerRole: 'Grand Skyport Captain',
          portraitKey: 'npc_engineer_vera',
          text: 'Bring 3 Clockwork Gears and 85 Sparks to restore the Skyport & Railway, and the Skywing Airship becomes yours forever!',
          choices: [{ label: 'Got it!', action: { type: 'CLOSE' } }],
        },
        vera_unlocked: {
          id: 'vera_unlocked',
          speaker: 'Engineer Vera',
          speakerRole: 'Grand Skyport Captain',
          portraitKey: 'npc_engineer_vera',
          text: 'The propellers roar to life! Press [V] or click Launch Airship anytime to fly!',
          choices: [{ label: 'Take Flight Now!', action: { type: 'BOARD_AIRSHIP' } }, { label: 'Later', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_station_master':
      return {
        root: {
          id: 'root',
          speaker: 'Conductor Bram',
          speakerRole: 'Brightfall Central Station',
          portraitKey: 'npc_station_master',
          text: 'All aboard the Brightfall Express! Our rail line runs straight north toward Frostpeak & the Skyport and connects buses across brightfall.',
          choices: [
            { label: 'Fast Travel via World Map', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_doctor_claire': {
      const q = save.quests['q_wildlife_photo'];
      const choices: DialogueChoice[] = [
        { label: 'Medical Checkup & Full Vitality Heal', nextNodeId: 'doc_heal', action: { type: 'HEAL_PLAYER' } },
      ];
      if (!q) {
        choices.push({
          label: 'Accept Giants of Aetheria Photography Quest!',
          nextNodeId: 'doc_q',
          action: { type: 'START_QUEST', questId: 'q_wildlife_photo' },
        });
      }
      choices.push({ label: 'Thank you, Doctor!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Dr. Claire',
          speakerRole: 'Brightfall Hospital Chief & Naturalist',
          portraitKey: 'npc_doctor_claire',
          text: `Welcome to Brightfall Central Hospital! Need healing, or want to help document Aetheria’s Giant Roaming Creatures with your Camera [P]? You’ve snapped ${save.photos.length} photos so far.`,
          choices,
        },
        doc_heal: { id: 'doc_heal', speaker: 'Dr. Claire', speakerRole: 'Hospital Chief', portraitKey: 'npc_doctor_claire', text: 'Full Health, Energy, and rest restored!', choices: [{ label: 'Thanks!', action: { type: 'CLOSE' } }] },
        doc_q: { id: 'doc_q', speaker: 'Dr. Claire', speakerRole: 'Hospital Chief', portraitKey: 'npc_doctor_claire', text: 'Press [P] near any Giant Roaming Creature—Glacier Mammoth, Elder Forest Stag, Leviathan Whale, or Sky Manta—to capture a Wildlife Photo!', choices: [{ label: 'Camera ready!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_librarian_elena': {
      const q = save.quests['q_moving_island_clue'];
      const charts = itemCount(save, 'moving_logbook');
      const slotHints = [
        'southwest ocean channel between Brightfall and Wild Jungle',
        'southeastern sea south of Volcanic Island',
        'northeastern drift between Frozen Kingdom and Sky Island',
        'northwestern waters near Lost Kingdom',
      ];
      const choices: DialogueChoice[] = [];
      if (!q) {
        choices.push({
          label: 'Ask about the Mysterious Moving Island',
          nextNodeId: 'elena_moving',
          action: { type: 'START_QUEST', questId: 'q_moving_island_clue' },
        });
      } else if (q.status === 'active' && save.defeatedGuardians.includes('drift_leviathan')) {
        choices.push({
          label: 'I calmed Thalassa on Driftspire Isle!',
          action: { type: 'COMPLETE_QUEST', questId: 'q_moving_island_clue' },
        });
      }
      choices.push({ label: `Reveal Current Moving Island Bearing (${charts} Charts found)`, nextNodeId: 'elena_clue' });
      choices.push({ label: 'Back to reading', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Librarian Elena',
          speakerRole: 'Grand Library Archivist',
          portraitKey: 'npc_librarian_elena',
          text: 'Every ancient chart in Brightfall Grand Library tells of Driftspire Isle—an enchanted island that refuses to stay anchored in one corner of Aetheria Sea.',
          choices,
        },
        elena_moving: {
          id: 'elena_moving',
          speaker: 'Librarian Elena',
          speakerRole: 'Grand Library Archivist',
          portraitKey: 'npc_librarian_elena',
          text: `My latest current calculations place Driftspire Isle in the ${slotHints[save.movingIslandSlot % 4]}! Sail or fly there before the tide shifts!`,
          choices: [{ label: 'Chart set!', action: { type: 'CLOSE' } }],
        },
        elena_clue: {
          id: 'elena_clue',
          speaker: 'Librarian Elena',
          speakerRole: 'Grand Library Archivist',
          portraitKey: 'npc_librarian_elena',
          text: `Tidal charts indicate Driftspire Isle is currently anchored in the ${slotHints[save.movingIslandSlot % 4]}. Look for floating sea mist and coral rings!`,
          choices: [{ label: 'Thank you!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_tackle_master':
      return {
        root: {
          id: 'root',
          speaker: 'Reef',
          speakerRole: 'Grand Marina Tackle Outfitter',
          portraitKey: 'npc_tackle_master',
          text: `Catching rare and Legendary fish depends on your Rod, Line, Bait, Hook, weather, and water type! You’ve logged ${save.discoveredFish.length}/12 species so far.`,
          choices: [
            { label: 'Open Fishing Tackle & Equipment Shop', action: { type: 'OPEN_EQUIPMENT' } },
            { label: 'Cast Line off Marina Pier', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
            { label: 'Sell Fish & Browse Marina Goods', action: { type: 'OPEN_SHOP', shopId: 'harbour_shop' } },
            { label: 'Later, Reef', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_officer_blake':
      return {
        root: {
          id: 'root',
          speaker: 'Officer Blake',
          speakerRole: 'Brightfall Civic Safety & Fire Chief',
          portraitKey: 'npc_officer_blake',
          text: 'Police patrols and the Brightfall Fire Brigade are keeping every avenue safe while holiday lights brighten the city!',
          choices: [
            { label: 'Manage Brightfall Seasonal Events', action: { type: 'OPEN_EVENTS' } },
            { label: 'Stay safe, Officer!', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_arcade_host':
      return {
        root: {
          id: 'root',
          speaker: 'Rex',
          speakerRole: 'Starlight Cinema & Arcade Host',
          portraitKey: 'npc_arcade_host',
          text: 'Welcome to Brightfall Cinema & Arcade! Step up to our cabinets or relive festival rhythm shows anytime!',
          choices: [
            { label: 'Play Harmony Rhythm Cabinet', action: { type: 'OPEN_MINIGAME', miniGameId: 'rhythm' } },
            { label: 'Play Ancient Rune Memory Arcade', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } },
            { label: 'Play Starfall Carnival Shootout', action: { type: 'OPEN_MINIGAME', miniGameId: 'carnival' } },
            { label: 'Just watching the movie posters', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_carnival_host': {
      const done = save.completedRestorations.includes('rest_amusement_park');
      const choices: DialogueChoice[] = [
        { label: 'Play Starfall Carnival Midway!', action: { type: 'OPEN_MINIGAME', miniGameId: 'carnival' } },
        { label: 'Browse Prize & Treat Counter', action: { type: 'OPEN_SHOP', shopId: 'carnival_shop' } },
      ];
      if (!done) {
        choices.unshift({
          label: `Restore Starfall Amusement Park (90 Sparks + 3 Shards [${itemCount(save, 'aether_shard')}])`,
          nextNodeId: 'park_restored',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_amusement_park' },
        });
      }
      if (!save.quests['q_amusement_revival']) {
        choices.push({ label: 'Start Starfall Carnival Quest', action: { type: 'START_QUEST', questId: 'q_amusement_revival' } });
      }
      choices.push({ label: 'Back to the boardwalk', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Pippa Star',
          speakerRole: 'Starfall Amusement Park Ringmaster',
          portraitKey: 'npc_carnival_host',
          text: done
            ? 'The Ferris wheel is spinning, the coastal rollercoaster glows over the ocean, and everyone loves Starfall Amusement Park!'
            : 'Welcome to abandoned Starfall Amusement Park! Restore power with 90 Sparks & 3 Aether Shards to spin up the Ferris wheel, rollercoaster, bumper cars, and carnival prizes!',
          choices,
        },
        park_restored: {
          id: 'park_restored',
          speaker: 'Pippa Star',
          speakerRole: 'Ringmaster',
          portraitKey: 'npc_carnival_host',
          text: 'Lights up!! Look at the Ferris wheel and rollercoaster sparkling over the waves!',
          choices: [{ label: 'Play Carnival Game!', action: { type: 'OPEN_MINIGAME', miniGameId: 'carnival' } }, { label: 'Awesome!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_newbrook_foreman': {
      const built = save.village.buildings.length;
      return {
        root: {
          id: 'root',
          speaker: 'Foreman Alden',
          speakerRole: 'Newbrook Valley Planner',
          portraitKey: 'npc_newbrook_foreman',
          text: `Welcome to Newbrook Settlement! Right now we have ${built} buildings and ${save.village.residents.length} residents. Ready to construct cottages, bakeries, gardens, or bridges right here on the map?`,
          choices: [
            ...(!save.quests['q_newbrook_founder']
              ? [{ label: 'Accept Founding Newbrook Quest!', action: { type: 'START_QUEST' as const, questId: 'q_newbrook_founder' } }]
              : []),
            { label: 'Open Village Builder Blueprints', action: { type: 'OPEN_VILLAGE' } },
            { label: 'Back to inspecting the valley', action: { type: 'CLOSE' } },
          ],
        },
      };
    }

    case 'npc_delver_torin': {
      const gems = itemCount(save, 'lumina_gem');
      const q = save.quests['q_underground_depths'];
      const choices: DialogueChoice[] = [];
      if (!q) {
        choices.push({
          label: 'Tell me about Subterranea & Lumina Gems!',
          nextNodeId: 'torin_q',
          action: { type: 'START_QUEST', questId: 'q_underground_depths' },
        });
      } else if (q.status === 'active' && gems >= 2) {
        choices.push({
          label: 'Here are the 2 Lumina Cavern Gems! (Recruit Torin)',
          nextNodeId: 'torin_join',
          action: { type: 'COMPLETE_QUEST', questId: 'q_underground_depths' },
        });
      }
      choices.push({ label: 'Fish the Underground Crystal River', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } });
      choices.push({ label: 'Explore Subterranea Ancient Lab', action: { type: 'ENTER_ZONE', interiorId: 'int_ancient_lab' } });
      choices.push({ label: 'Rest at Delver Outpost (Heal)', nextNodeId: 'torin_heal', action: { type: 'HEAL_PLAYER' } });
      choices.push({ label: 'Carry on deeper', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Torin the Delver',
          speakerRole: 'Subterranean Warden',
          portraitKey: 'npc_delver_torin',
          text: `Welcome to Subterranea—Aetheria’s hidden underground civilisation! Our crystal streams and ancient clockwork laboratories kept burning even through the Great Fall. Lumina Gems carried: ${gems}/2.`,
          choices,
        },
        torin_q: { id: 'torin_q', speaker: 'Torin', speakerRole: 'Subterranean Warden', portraitKey: 'npc_delver_torin', text: 'Gather 2 Lumina Cavern Gems right here in Subterranea or the Ancient Lab and I’ll join your adventure team!', choices: [{ label: 'On it!', action: { type: 'CLOSE' } }] },
        torin_join: { id: 'torin_join', speaker: 'Torin', speakerRole: 'Subterranean Warden', portraitKey: 'npc_delver_torin', text: 'Subterranea stands with Brightfall! You can now switch to Torin in Characters anytime!', choices: [{ label: 'Welcome aboard!', action: { type: 'CLOSE' } }] },
        torin_heal: { id: 'torin_heal', speaker: 'Torin', speakerRole: 'Subterranean Warden', portraitKey: 'npc_delver_torin', text: 'Crystal springs restored your Health and Energy!', choices: [{ label: 'Thank you!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_scholar_lyra_alt': {
      const done = save.defeatedGuardians.includes('rift_archon');
      const q = save.quests['q_alternate_rifts'];
      return {
        root: {
          id: 'root',
          speaker: 'Chronicle Vespera',
          speakerRole: 'Alternate Rift Guide',
          portraitKey: 'npc_scholar_lyra_alt',
          text: done
            ? 'With Chronos-IX harmonized, the three Alternate Dimensions—Starlight Mirror, Primordial Aether, and Shattered Void—spin in peaceful orbit.'
            : 'You stepped across dimensional fabric! Explore Mirror Brightfall, Primordial Aether (where the Fall never occurred), and the Shattered Rift Citadel to face Chronos-IX!',
          choices: [
            ...(!q && !done ? [{ label: 'Accept Beyond the Mirror Rift Quest', action: { type: 'START_QUEST' as const, questId: 'q_alternate_rifts' } }] : []),
            { label: 'Step into Primordial Aether (Pre-Fall Timeline)', action: { type: 'ENTER_ZONE', interiorId: 'dim_verdant' } },
            { label: 'Step into Shattered Rift Citadel (Boss Dimension)', action: { type: 'ENTER_ZONE', interiorId: 'dim_void' } },
            { label: 'Stay in Mirror Brightfall', action: { type: 'CLOSE' } },
          ],
        },
      };
    }

    case 'npc_grocer_hana':
      return {
        root: {
          id: 'root',
          speaker: 'Grocer Hana',
          speakerRole: 'Aetheria Fresh Mart Owner',
          portraitKey: 'npc_grocer_hana',
          text: 'Welcome to Aetheria Fresh Mart! Fruits, vegetables, cheeses, roasts, and warm holiday cocoa ready anytime!',
          choices: [
            { label: 'Shop Fresh Mart Groceries', action: { type: 'OPEN_SHOP', shopId: 'supermarket' } },
            { label: 'Just browsing!', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_chef_marcus':
      return {
        root: {
          id: 'root',
          speaker: 'Chef Marcus',
          speakerRole: 'Golden Skillet Bistro',
          portraitKey: 'npc_chef_marcus',
          text: 'Pull up a chair at The Golden Skillet! Hot stews, skillet feasts, and berry tarts—perfect before voyages!',
          choices: [
            { label: 'Order from Bistro Menu', action: { type: 'OPEN_SHOP', shopId: 'restaurant' } },
            { label: 'Try Cooking Challenge Mini-Game', action: { type: 'OPEN_MINIGAME', miniGameId: 'cooking' } },
            { label: 'Maybe later, Chef!', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_smith_garrick':
      return {
        root: {
          id: 'root',
          speaker: 'Smith Garrick',
          speakerRole: 'Anvil & Spark Armory',
          portraitKey: 'npc_smith_garrick',
          text: 'Need blades, bows, forge hammers, protective armor, or fishing tackle? Check the forge anytime!',
          choices: [
            { label: 'Open Armory, Armor & Tackle Shop', action: { type: 'OPEN_EQUIPMENT' } },
            { label: 'Catch you later, Garrick.', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_coach_leo': {
      const q = save.quests['q_island_sports'];
      const choices: DialogueChoice[] = [
        { label: 'Play Football Penalty Challenge', action: { type: 'OPEN_MINIGAME', miniGameId: 'football' } },
        { label: 'Play Basketball Hoops Challenge', action: { type: 'OPEN_MINIGAME', miniGameId: 'basketball' } },
        { label: 'Play Tennis Rally Tournament', action: { type: 'OPEN_MINIGAME', miniGameId: 'tennis' } },
        { label: 'Enter Olympic Swimming Lap Sprint', action: { type: 'OPEN_MINIGAME', miniGameId: 'swimming' } },
        { label: 'Start Brightfall Bicycle Race', action: { type: 'OPEN_MINIGAME', miniGameId: 'bicyclerace' } },
      ];
      if (!q) {
        choices.unshift({
          label: 'Accept Brightfall Sports Championship Quest!',
          action: { type: 'START_QUEST', questId: 'q_island_sports' },
        });
      }
      choices.push({ label: 'Catch my breath first', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Coach Leo',
          speakerRole: 'Olympic Sports Park Director',
          portraitKey: 'npc_coach_leo',
          text: 'Welcome to Brightfall Olympic Sports Park! Football stadium, Basketball court, Tennis court, Swimming pool, and Cycling track—all open for competition!',
          choices,
        },
      };
    }

    case 'npc_dockmaster_vane':
      return {
        root: {
          id: 'root',
          speaker: 'Dockmaster Vane',
          speakerRole: 'Harbour Master & Boatwright',
          portraitKey: 'npc_dockmaster_vane',
          text: `Your vessel (${save.boatUpgrades.skin.toUpperCase()} · Speed Lv.${save.boatUpgrades.speedLevel}) is moored off Driftwood Grand Marina! Sail across reefs and waves to six outer islands, or upgrade hull & sails!`,
          choices: [
            { label: 'Board Boat & Set Sail!', action: { type: 'BOARD_BOAT' } },
            { label: 'Customize Boat & Buy Ship Upgrades', action: { type: 'OPEN_AIRSHIP' } },
            { label: 'Enter Ocean Boat Race Mini-Game', action: { type: 'OPEN_MINIGAME', miniGameId: 'boatrace' } },
            { label: 'Browse Marina Outfitters Shop', action: { type: 'OPEN_SHOP', shopId: 'harbour_shop' } },
            { label: 'Stay on dock', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_farmer_pippa':
      return {
        root: {
          id: 'root',
          speaker: 'Farmer Pippa',
          speakerRole: 'Brightfall Orchard Keeper',
          portraitKey: 'npc_farmer_pippa',
          text: 'Brightfall’s orchards are flourishing again! Need crisp apples, carrots, or warm cider?',
          choices: [
            { label: 'Buy Orchard Produce', action: { type: 'OPEN_SHOP', shopId: 'supermarket' } },
            { label: 'See you around!', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_townsperson_eli':
      return {
        root: {
          id: 'root',
          speaker: 'Eli',
          speakerRole: 'Neighborhood Runner',
          portraitKey: 'npc_townsperson_eli',
          text:
            save.cityEvent === 'christmas'
              ? 'Hot cocoa and twinkling holiday trees all down Brightfall Avenue—it feels like Christmas in New York!'
              : 'Nothing beats jogging from Central Station past the Olympic Stadium down to Sunset Beach!',
          choices: [{ label: 'Keep moving!', action: { type: 'CLOSE' } }],
        },
      };

    case 'npc_chef_clara': {
      const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
      const q = save.quests['q_cafe_beans'];
      const beans = itemCount(save, 'cafe_beans');
      const choices: DialogueChoice[] = [];
      if (!cafeDone) {
        if (!q) {
          choices.push({
            label: 'Where did your Roasted Amber Beans scatter?',
            nextNodeId: 'clara_quest',
            action: { type: 'START_QUEST', questId: 'q_cafe_beans' },
          });
        }
        if (beans >= 2 && save.sparks >= 30) {
          choices.push({
            label: 'Reopen Hearth & Crumb Café! (2 Beans + 30 Sparks)',
            nextNodeId: 'clara_reopened',
            action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_cafe' },
          });
        }
      } else {
        choices.push({ label: 'Have a warm Sunpetal Tart (Full Heal)!', nextNodeId: 'clara_heal', action: { type: 'HEAL_PLAYER' } });
        choices.push({ label: 'Try Baking / Cooking Mini-Game', action: { type: 'OPEN_MINIGAME', miniGameId: 'cooking' } });
      }
      choices.push({ label: 'Catch you later, Chef!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Chef Clara',
          speakerRole: 'Hearth & Crumb Baker',
          portraitKey: 'npc_chef_clara',
          text: cafeDone
            ? 'The ovens are singing again! Stop by anytime for tarts or a cooking match.'
            : `My Café took a beating in the Great Fall! You have ${beans}/2 Roasted Amber Beans.`,
          choices,
        },
        clara_quest: { id: 'clara_quest', speaker: 'Chef Clara', speakerRole: 'Baker', portraitKey: 'npc_chef_clara', text: 'Check Brightfall’s south park and eastern lane for 2 bean crates!', choices: [{ label: 'On it!', action: { type: 'CLOSE' } }] },
        clara_reopened: { id: 'clara_reopened', speaker: 'Chef Clara', speakerRole: 'Baker', portraitKey: 'npc_chef_clara', text: 'Hearth & Crumb Café is back open!', choices: [{ label: 'Cheers!', action: { type: 'CLOSE' } }] },
        clara_heal: { id: 'clara_heal', speaker: 'Chef Clara', speakerRole: 'Baker', portraitKey: 'npc_chef_clara', text: 'Health and Energy topped right back up!', choices: [{ label: 'Delicious!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_merchant_milo': {
      const marketDone = save.completedRestorations.includes('rest_brightfall_market');
      const q = save.quests['q_market_gears'];
      const gears = itemCount(save, 'brass_gear');
      const choices: DialogueChoice[] = [];
      if (marketDone) {
        choices.push({ label: 'Browse Brightfall Market & Mall', action: { type: 'OPEN_SHOP', shopId: 'market' } });
      } else {
        if (!q) {
          choices.push({
            label: 'Need help fixing the Market stalls?',
            nextNodeId: 'milo_quest',
            action: { type: 'START_QUEST', questId: 'q_market_gears' },
          });
        }
        if (gears >= 2 && save.sparks >= 40) {
          choices.push({
            label: 'Use 2 Brass Gears & 40 Sparks to Reopen Market!',
            nextNodeId: 'milo_open',
            action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_market' },
          });
        }
      }
      choices.push({ label: 'Later, Milo.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Merchant Milo',
          speakerRole: 'Brightfall Market & Mall',
          portraitKey: 'npc_merchant_milo',
          text: marketDone
            ? 'Welcome to Brightfall Market & Mall! Materials, winter trees, chandeliers, and gear await!'
            : `Bring 2 Clockwork Gears (${gears}/2) and 40 Sparks to reopen the Market & Mall!`,
          choices,
        },
        milo_quest: { id: 'milo_quest', speaker: 'Merchant Milo', speakerRole: 'Market', portraitKey: 'npc_merchant_milo', text: 'Check town chests or the Training Hall!', choices: [{ label: 'Got it!', action: { type: 'CLOSE' } }] },
        milo_open: { id: 'milo_open', speaker: 'Merchant Milo', speakerRole: 'Market', portraitKey: 'npc_merchant_milo', text: 'The market bell chimes again!', choices: [{ label: 'Open Shop', action: { type: 'OPEN_SHOP', shopId: 'market' } }, { label: 'Later', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_tailor_june': {
      const gardenDone = save.completedRestorations.includes('rest_brightfall_garden');
      const q = save.quests['q_garden_bloom'];
      const berries = itemCount(save, 'sun_berry');
      const choices: DialogueChoice[] = [{ label: 'Change Character or Outfit', action: { type: 'OPEN_CHARACTERS' } }];
      if (!gardenDone) {
        if (!q) choices.push({ label: 'Tell me about Central Park.', nextNodeId: 'june_quest', action: { type: 'START_QUEST', questId: 'q_garden_bloom' } });
        if (berries >= 3 && save.sparks >= 35) choices.push({ label: 'Restore Central Park (3 Berries + 35 Sparks)!', nextNodeId: 'june_done', action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_garden' } });
      }
      choices.push({ label: 'Back to exploring!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Tailor June',
          speakerRole: 'Atelier Designer',
          portraitKey: 'npc_tailor_june',
          text: gardenDone ? 'Central Park is blooming and Festival outfits are ready!' : `Bring 3 Sunpetal Berries (${berries}/3) to restore Brightfall Central Park.`,
          choices,
        },
        june_quest: { id: 'june_quest', speaker: 'Tailor June', speakerRole: 'Atelier', portraitKey: 'npc_tailor_june', text: 'Sunpetal Berries grow around the park and forest border.', choices: [{ label: 'On it!', action: { type: 'CLOSE' } }] },
        june_done: { id: 'june_done', speaker: 'Tailor June', speakerRole: 'Atelier', portraitKey: 'npc_tailor_june', text: 'Brightfall Festival outfits unlocked!', choices: [{ label: 'Try it on', action: { type: 'OPEN_CHARACTERS' } }, { label: 'Thanks!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_trainer_kael': {
      const q = save.quests['q_archery_champion'];
      const best = save.miniGameBestScores.archery ?? 0;
      const choices: DialogueChoice[] = [{ label: 'Play Aether Archery Challenge!', action: { type: 'OPEN_MINIGAME', miniGameId: 'archery' } }];
      if (!q) choices.push({ label: 'Accept Aether Range Quest.', nextNodeId: 'kael_q', action: { type: 'START_QUEST', questId: 'q_archery_champion' } });
      choices.push({ label: 'Later, Coach.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Trainer Kael',
          speakerRole: 'Aether Athletics Coach',
          portraitKey: 'npc_trainer_kael',
          text: `Steady aim! Personal best: ${best} pts. Ready for target practice?`,
          choices,
        },
        kael_q: { id: 'kael_q', speaker: 'Trainer Kael', speakerRole: 'Coach', portraitKey: 'npc_trainer_kael', text: 'Score points on the range to earn Sparks and a Clockwork Gear!', choices: [{ label: 'Start Archery', action: { type: 'OPEN_MINIGAME', miniGameId: 'archery' } }] },
      };
    }

    case 'npc_bard_oliver':
      return {
        root: {
          id: 'root',
          speaker: 'Oliver the Bard',
          speakerRole: 'Festival & Events Director',
          portraitKey: 'npc_bard_oliver',
          text: `Music & seasonal festivals lift the entire city! Personal best in Harmony Rhythm: ${save.miniGameBestScores.rhythm ?? 0} pts.`,
          choices: [
            { label: 'Play Harmony Rhythm', action: { type: 'OPEN_MINIGAME', miniGameId: 'rhythm' } },
            { label: 'Switch Brightfall City Event (Christmas / Music / Fireworks)', action: { type: 'OPEN_EVENTS' } },
            { label: 'Later', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_neighbor_tessa':
      return {
        root: {
          id: 'root',
          speaker: 'Tessa',
          speakerRole: 'Returning Resident',
          portraitKey: 'npc_neighbor_tessa',
          text: 'Seeing Brightfall avenues bustling with shoppers, runners, and holiday trees makes Aetheria feel whole again!',
          choices: [{ label: 'Welcome back!', action: { type: 'CLOSE' } }],
        },
      };

    case 'npc_elder_moss': {
      const defeated = save.defeatedGuardians.includes('woodland_giant');
      const q = save.quests['q_woodland_giant'];
      const choices: DialogueChoice[] = [];
      if (!q && !defeated) choices.push({ label: 'How can we calm The Woodland Giant?', nextNodeId: 'moss_explain', action: { type: 'START_QUEST', questId: 'q_woodland_giant' } });
      choices.push({ label: 'Farewell, Elder.', action: { type: 'CLOSE' } });
      return {
        root: { id: 'root', speaker: 'Elder Moss', speakerRole: 'Keeper of Mossbrook', portraitKey: 'npc_elder_moss', text: defeated ? 'Sylvaron rests peacefully beneath emerald leaves once more!' : 'Sylvaron waits in northwest Elderwood Sanctuary.', choices },
        moss_explain: { id: 'moss_explain', speaker: 'Elder Moss', speakerRole: 'Keeper', portraitKey: 'npc_elder_moss', text: 'Head north from Mossbrook Hamlet and light the 3 Rune Pillars!', choices: [{ label: 'On our way!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_herbalist_fern': {
      const q = save.quests['q_missing_ferns'];
      const ferns = itemCount(save, 'forest_fern');
      const choices: DialogueChoice[] = [];
      if (!q) choices.push({ label: 'I can gather 3 Whispering Ferns.', nextNodeId: 'fern_a', action: { type: 'START_QUEST', questId: 'q_missing_ferns' } });
      else if (q.status === 'active' && ferns >= 3) choices.push({ label: 'Here are the 3 Whispering Ferns!', nextNodeId: 'fern_d', action: { type: 'COMPLETE_QUEST', questId: 'q_missing_ferns' } });
      choices.push({ label: 'Brew herbal tea (Full Heal)', nextNodeId: 'fern_h', action: { type: 'HEAL_PLAYER' } });
      choices.push({ label: 'See you soon', action: { type: 'CLOSE' } });
      return {
        root: { id: 'root', speaker: 'Herbalist Fern', speakerRole: 'Botanist & Healer', portraitKey: 'npc_herbalist_fern', text: q?.status === 'completed' ? 'Those ferns made wonderful remedies!' : `Bring 3 Whispering Ferns (${ferns}/3).`, choices },
        fern_a: { id: 'fern_a', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Thank you kindly!', choices: [{ label: 'Got it!', action: { type: 'CLOSE' } }] },
        fern_d: { id: 'fern_d', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Here are Aether Shards and Sparks in thanks!', choices: [{ label: 'Happy to help!', action: { type: 'CLOSE' } }] },
        fern_h: { id: 'fern_h', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Restored Health & Energy!', choices: [{ label: 'Thanks!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_captain_finn': {
      const defeated = save.defeatedGuardians.includes('tidal_keeper');
      const q = save.quests['q_sunset_lighthouse'];
      return {
        root: {
          id: 'root',
          speaker: 'Captain Finn',
          speakerRole: 'Driftwood Harbor Master',
          portraitKey: 'npc_captain_finn',
          text: defeated ? 'Sunset Lighthouse shines across Aetheria Sea again!' : 'Neridia on eastern Sunken Atoll needs calming before our lighthouse glows steady.',
          choices: [
            ...(!q && !defeated ? [{ label: 'Accept Beacon on Sunset Coast Quest', action: { type: 'START_QUEST' as const, questId: 'q_sunset_lighthouse' } }] : []),
            { label: 'Smooth seas, Captain!', action: { type: 'CLOSE' } },
          ],
        },
      };
    }

    case 'npc_angler_marina': {
      const best = save.miniGameBestScores.fishing ?? 0;
      const q = save.quests['q_coastal_catch'];
      return {
        root: {
          id: 'root',
          speaker: 'Angler Marina',
          speakerRole: 'Pier Champion',
          portraitKey: 'npc_angler_marina',
          text: `Upgrade your Rod, Line, Bait & Hook at the Marina Tackle Shop for rare species! Personal best: ${best} pts.`,
          choices: [
            ...(!q ? [{ label: 'Accept Sunset Fishing Quest!', action: { type: 'START_QUEST' as const, questId: 'q_coastal_catch' } }] : []),
            { label: 'Cast Line (Tidewater Fishing)', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
            { label: 'Later, Marina!', action: { type: 'CLOSE' } },
          ],
        },
      };
    }

    case 'npc_warden_ingrid': {
      const defeated = save.defeatedGuardians.includes('frostbound_watcher');
      const q = save.quests['q_frostpeak_hearth'];
      return {
        root: {
          id: 'root',
          speaker: 'Warden Ingrid',
          speakerRole: 'Hearthstone Guide',
          portraitKey: 'npc_warden_ingrid',
          text: defeated ? 'The summit gale has warmed nicely!' : 'Ignite the 4 Alpine Braziers on Watcher’s Summit northeast!',
          choices: [
            ...(!q && !defeated ? [{ label: 'Accept Warmth on Frostpeak Quest', action: { type: 'START_QUEST' as const, questId: 'q_frostpeak_hearth' } }] : []),
            { label: 'Warm up by Hearthstone Lodge (Full Heal)', nextNodeId: 'ingrid_h', action: { type: 'HEAL_PLAYER' } },
            { label: 'Stay warm.', action: { type: 'CLOSE' } },
          ],
        },
        ingrid_h: { id: 'ingrid_h', speaker: 'Warden Ingrid', speakerRole: 'Guide', portraitKey: 'npc_warden_ingrid', text: 'Health & Energy restored!', choices: [{ label: 'Thanks!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_skier_tobi':
      return {
        root: {
          id: 'root',
          speaker: 'Tobi',
          speakerRole: 'Ice Trail Runner',
          portraitKey: 'npc_skier_tobi',
          text: `Mirror Lake is glassy smooth! Best Ice Slide score: ${save.miniGameBestScores.timeslide ?? 0} pts.`,
          choices: [
            { label: 'Start Ice Slide Trial', action: { type: 'OPEN_MINIGAME', miniGameId: 'timeslide' } },
            { label: 'Later', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_archivist_orin': {
      const defeated = save.defeatedGuardians.includes('last_remnant');
      const qMain = save.quests['q_forgotten_kingdom'];
      const qRune = save.quests['q_rune_scholar'];
      const choices: DialogueChoice[] = [];
      if (!qMain && !defeated) choices.push({ label: 'What really caused the Great Fall?', action: { type: 'START_QUEST', questId: 'q_forgotten_kingdom' } });
      if (!qRune) choices.push({ label: 'Tell me about the Memory Seal Puzzle.', action: { type: 'START_QUEST', questId: 'q_rune_scholar' } });
      else choices.push({ label: 'Play Ancient Rune Memory Seal', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } });
      choices.push({ label: 'Farewell.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Archivist Orin',
          speakerRole: 'Scholar of the Dawn',
          portraitKey: 'npc_archivist_orin',
          text: defeated
            ? 'Golden light crowns the Dawn Sanctum! Yet across the northwest ocean, The Lost Kingdom holds older secrets.'
            : `Ahead lies the Dawn Sanctum and Aurelius, The Last Remnant, ${charId === 'chronomancer' ? 'Sora' : 'traveler'}.`,
          choices,
        },
      };
    }

    // 6 ISLAND CAMPAIGN HUBS (with dynamic 1..20 chapter progression!)
    case 'npc_freya_frost':
    case 'npc_icecarver_bjorn': {
      const doneCount = getIslandCampaignCompletedCount(save, 'frozen_kingdom');
      const done = save.defeatedGuardians.includes('frost_empress');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'frozen_kingdom', choices);
      if (npcId === 'npc_icecarver_bjorn') {
        choices.push({ label: 'Fish the Frozen Fjord', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } });
      } else {
        choices.push({ label: 'Enter Frozen Spire Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_frozen' } });
        choices.push({ label: 'Warm up by Frosthaven Hearth (Heal)', action: { type: 'HEAL_PLAYER' } });
      }
      choices.push({ label: 'Explore Frozen Kingdom', action: { type: 'CLOSE' } });
      const isBjorn = npcId === 'npc_icecarver_bjorn';
      return {
        root: {
          id: 'root',
          speaker: isBjorn ? 'Fjord Angler Bjorn' : 'Mayor Freya',
          speakerRole: isBjorn ? 'Frozen Kingdom Harvester' : `Frosthaven Mayor · Campaign ${doneCount}/20`,
          portraitKey: npcId,
          text: done
            ? 'Aurora ribbons are dancing over Frosthaven again! Glacius rests peacefully.'
            : `Frozen Kingdom Campaign Progress: ${doneCount}/20 chapters completed. Complete chapter ${Math.min(20, doneCount + 1)} (or enter Frozen Spire Dungeon) to draw closer to unsealing Empress Glacius!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: isBjorn ? 'Fjord Angler Bjorn' : 'Mayor Freya',
          speakerRole: 'Frozen Kingdom',
          portraitKey: npcId,
          text: 'Chapter started and added to your Quests journal!',
          choices: [{ label: 'Onward!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_kora_jungle':
    case 'npc_botanist_tali': {
      const doneCount = getIslandCampaignCompletedCount(save, 'wild_jungle');
      const done = save.defeatedGuardians.includes('jungle_titan');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'wild_jungle', choices);
      if (npcId === 'npc_botanist_tali') {
        choices.push({ label: 'Fish Jungle River Bend', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } });
      } else {
        choices.push({ label: 'Enter Waterfall Temple Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_jungle' } });
        choices.push({ label: 'Rest at Canopy Camp (Heal)', action: { type: 'HEAL_PLAYER' } });
      }
      choices.push({ label: 'Explore Wild Jungle', action: { type: 'CLOSE' } });
      const isTali = npcId === 'npc_botanist_tali';
      return {
        root: {
          id: 'root',
          speaker: isTali ? 'Botanist Tali' : 'Ranger Kora',
          speakerRole: isTali ? 'Orchid Researcher' : `Canopy Ranger · Campaign ${doneCount}/20`,
          portraitKey: npcId,
          text: done
            ? 'The Wild Jungle blooms effortlessly once again!'
            : `Wild Jungle Campaign Progress: ${doneCount}/20 chapters completed. Unseal Waterfall Temple to challenge Zulra!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: isTali ? 'Botanist Tali' : 'Ranger Kora',
          speakerRole: 'Wild Jungle',
          portraitKey: npcId,
          text: 'Jungle chapter added to your Quests journal!',
          choices: [{ label: 'Into the canopy!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_flint_volcanic':
    case 'npc_miner_cinder': {
      const doneCount = getIslandCampaignCompletedCount(save, 'volcanic_island');
      const done = save.defeatedGuardians.includes('magma_colossus');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'volcanic_island', choices);
      if (npcId === 'npc_miner_cinder') {
        choices.push({ label: 'Fish Thermal Coastal Vents', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } });
      } else {
        choices.push({ label: 'Enter Caldera Magma Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_volcanic' } });
        choices.push({ label: 'Cool off at Hot Springs (Heal)', action: { type: 'HEAL_PLAYER' } });
      }
      choices.push({ label: 'Explore Volcanic Island', action: { type: 'CLOSE' } });
      const isCinder = npcId === 'npc_miner_cinder';
      return {
        root: {
          id: 'root',
          speaker: isCinder ? 'Prospector Cinder' : 'Master Flint',
          speakerRole: isCinder ? 'Volcanic Ore Scout' : `Emberforge Foreman · Campaign ${doneCount}/20`,
          portraitKey: npcId,
          text: done
            ? 'Emberforge vents hum steady and Pyromancer Ember walks among us!'
            : `Volcanic Island Campaign Progress: ${doneCount}/20 chapters completed. Cool the caldera mechanisms to unseal Ignis!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: isCinder ? 'Prospector Cinder' : 'Master Flint',
          speakerRole: 'Volcanic Island',
          portraitKey: npcId,
          text: 'Forge chapter accepted!',
          choices: [{ label: 'To the ridge!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_zephyr_sky': {
      const doneCount = getIslandCampaignCompletedCount(save, 'sky_island');
      const done = save.defeatedGuardians.includes('sky_seraph');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'sky_island', choices);
      choices.push({ label: 'Enter Sky Temple Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_sky' } });
      choices.push({ label: 'Play Wind-Chime Rhythm', action: { type: 'OPEN_MINIGAME', miniGameId: 'rhythm' } });
      choices.push({ label: 'Explore Sky Island', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Wind-Keeper Zephyr',
          speakerRole: `Cloudspire Keeper · Campaign ${doneCount}/20`,
          portraitKey: 'npc_zephyr_sky',
          text: done
            ? 'Skywarden Aero joined your team and Cloudspire wind-bridges sing!'
            : `Sky Island Campaign Progress: ${doneCount}/20 chapters completed. Align the wind-turbines and Sky Temple to awaken Zephyra!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: 'Wind-Keeper Zephyr',
          speakerRole: 'Sky Island',
          portraitKey: 'npc_zephyr_sky',
          text: 'Cloudspire chapter started!',
          choices: [{ label: 'To the skies!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_ghost_bramwell': {
      const doneCount = getIslandCampaignCompletedCount(save, 'haunted_island');
      const done = save.defeatedGuardians.includes('phantom_duke');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'haunted_island', choices);
      choices.push({ label: 'Enter Mistvale Castle Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_haunted' } });
      choices.push({ label: 'Fish Mistvale Lagoon', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } });
      choices.push({ label: 'Step into the mist', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Chronicler Bramwell',
          speakerRole: `Mistvale Historian · Campaign ${doneCount}/20`,
          portraitKey: 'npc_ghost_bramwell',
          text: done
            ? 'Mistvale Castle glows warm under moonbeams—Duke Vesper rests peacefully.'
            : `Haunted Island Campaign Progress: ${doneCount}/20 chapters completed. Uncover Mistvale Manor’s secrets to help Duke Vesper!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: 'Chronicler Bramwell',
          speakerRole: 'Haunted Island',
          portraitKey: 'npc_ghost_bramwell',
          text: 'Haunted Island chapter added!',
          choices: [{ label: 'Keep searching', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_vaelen_lost': {
      const doneCount = getIslandCampaignCompletedCount(save, 'lost_kingdom');
      const done = save.defeatedGuardians.includes('eclipse_sovereign');
      const choices: DialogueChoice[] = [];
      appendCampaignChoices(save, 'lost_kingdom', choices);
      choices.push({ label: 'Enter Eclipse Sanctum Dungeon', action: { type: 'ENTER_ZONE', interiorId: 'int_dungeon_lost' } });
      choices.push({ label: 'Attempt Ancient Rune Memory', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } });
      choices.push({ label: 'Restore Health & Energy', action: { type: 'HEAL_PLAYER' } });
      choices.push({ label: 'Step toward the Citadel', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Sentinel Vaelen',
          speakerRole: `Lost Capital Warden · Campaign ${doneCount}/20`,
          portraitKey: 'npc_vaelen_lost',
          text: done
            ? 'All of Aetheria radiates golden harmony! You gave our entire world its Bounce Back.'
            : `Lost Kingdom Campaign Progress: ${doneCount}/20 chapters completed. Complete the capital’s trials to challenge Aetherion!`,
          choices,
        },
        campaign_started: {
          id: 'campaign_started',
          speaker: 'Sentinel Vaelen',
          speakerRole: 'Lost Kingdom',
          portraitKey: 'npc_vaelen_lost',
          text: 'Royal chapter accepted!',
          choices: [{ label: 'Forward!', action: { type: 'CLOSE' } }],
        },
      };
    }

    default:
      return {
        root: {
          id: 'root',
          speaker: 'Traveler',
          speakerRole: 'Aetheria Citizen',
          portraitKey: 'npc_mayor_theo',
          text: 'Every lantern we relight brings Aetheria closer to home.',
          choices: [{ label: 'Farewell', action: { type: 'CLOSE' } }],
        },
      };
  }
}

export function getGuardianLockReason(save: SaveData, guardianId: keyof typeof GUARDIANS): string | null {
  const g = GUARDIANS[guardianId];
  if (!g.requiredCampaignCount) return null;
  const done = getIslandCampaignCompletedCount(save, g.region);
  if (done >= g.requiredCampaignCount) return null;
  return `${g.name} is sealed! Complete ${g.requiredCampaignCount} ${g.region.replace('_', ' ')} campaign chapters (${done}/${g.requiredCampaignCount} done) or claim ready chapters in Quests [J].`;
}

export function getQuestSummaryTitle(questId: string): string {
  return QUESTS[questId]?.title ?? questId;
}

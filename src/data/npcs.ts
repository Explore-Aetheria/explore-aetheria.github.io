import { DialogueNode, NpcDef, SaveData } from '../types/game';
import { MAIN_OFFSET_X as OX, MAIN_OFFSET_Y as OY } from './progression';

export const NPCS: NpcDef[] = [
  // Original Mainland NPCs (offset cleanly onto Main Island)
  {
    id: 'npc_mayor_theo',
    name: 'Mayor Theo',
    role: 'Mayor of Brightfall',
    region: 'brightfall',
    tileX: OX + 54,
    tileY: OY + 54,
    patrolRadius: 3,
    palette: { hair: '#b8b3a8', outfit: '#354f6b', trim: '#e0a943', skin: '#ecc4a0' },
    voicePitch: 290,
    questMarkerIds: ['q_welcome_brightfall'],
  },
  {
    id: 'npc_builder_mae',
    name: 'Builder Mae',
    role: 'Town Carpenter & Restorer',
    region: 'brightfall',
    interiorId: 'int_restoration_hall',
    tileX: 10,
    tileY: 8,
    patrolRadius: 2,
    palette: { hair: '#5e3528', outfit: '#b85c38', trim: '#f0c475', skin: '#d89b72' },
    voicePitch: 410,
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
  },
  {
    id: 'npc_merchant_milo',
    name: 'Merchant Milo',
    role: 'Brightfall General Goods',
    region: 'brightfall',
    tileX: OX + 62,
    tileY: OY + 56,
    patrolRadius: 2,
    palette: { hair: '#784b2a', outfit: '#436e56', trim: '#e4b363', skin: '#e8ba93' },
    voicePitch: 360,
    questMarkerIds: ['q_market_gears'],
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
    role: 'Festival Musician',
    region: 'brightfall',
    tileX: OX + 50,
    tileY: OY + 61,
    patrolRadius: 3,
    palette: { hair: '#c48f45', outfit: '#634375', trim: '#ebd083', skin: '#f0c9a8' },
    voicePitch: 450,
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
  // Expanded Main Island NPCs
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
    activeHours: [6, 22],
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
    activeHours: [7, 23],
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
    role: 'Brightfall Sports Director',
    region: 'brightfall',
    tileX: OX + 66,
    tileY: OY + 66,
    patrolRadius: 2,
    palette: { hair: '#2b2b2b', outfit: '#2f6da3', trim: '#f5cc6b', skin: '#d4966e' },
    voicePitch: 340,
    questMarkerIds: ['q_island_sports'],
  },
  {
    id: 'npc_farmer_pippa',
    name: 'Farmer Pippa',
    role: 'Brightfall Orchard Keeper',
    region: 'brightfall',
    tileX: OX + 69,
    tileY: OY + 51,
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
    tileY: OY + 85,
    patrolRadius: 2,
    palette: { hair: '#7c8894', outfit: '#1e4a66', trim: '#f0c475', skin: '#dfa782' },
    voicePitch: 295,
  },
  {
    id: 'npc_townsperson_eli',
    name: 'Eli',
    role: 'Neighborhood Jogger',
    region: 'brightfall',
    tileX: OX + 46,
    tileY: OY + 58,
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
    tileX: OX + 64,
    tileY: OY + 82,
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
    tileX: OX + 70,
    tileY: OY + 85,
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
    tileX: OX + 84,
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
    tileX: OX + 79,
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
    tileY: OY + 22,
    patrolRadius: 2,
    palette: { hair: '#e8e2d8', outfit: '#443563', trim: '#f0c469', skin: '#e0b38f' },
    voicePitch: 310,
    questMarkerIds: ['q_forgotten_kingdom', 'q_rune_scholar'],
  },

  // 6 NEW ISLANDS NPCS
  {
    id: 'npc_freya_frost',
    name: 'Freya',
    role: 'Frosthaven Mayor',
    region: 'frozen_kingdom',
    tileX: 204,
    tileY: 32,
    patrolRadius: 2,
    palette: { hair: '#e8d7a5', outfit: '#365e85', trim: '#eef7fc', skin: '#f5d2b8' },
    voicePitch: 440,
    questMarkerIds: ['q_frozen_kingdom'],
  },
  {
    id: 'npc_icecarver_bjorn',
    name: 'Bjorn',
    role: 'Fjord Angler',
    region: 'frozen_kingdom',
    tileX: 198,
    tileY: 28,
    patrolRadius: 2,
    palette: { hair: '#8c5a37', outfit: '#543e33', trim: '#a6e3ff', skin: '#ecc3a4' },
    voicePitch: 290,
  },
  {
    id: 'npc_kora_jungle',
    name: 'Kora',
    role: 'Canopy Ranger',
    region: 'wild_jungle',
    tileX: 34,
    tileY: 142,
    patrolRadius: 2,
    palette: { hair: '#2b241f', outfit: '#387544', trim: '#f09b4c', skin: '#c48660' },
    voicePitch: 430,
    questMarkerIds: ['q_wild_jungle'],
  },
  {
    id: 'npc_botanist_tali',
    name: 'Tali',
    role: 'Orchid Researcher',
    region: 'wild_jungle',
    tileX: 28,
    tileY: 148,
    patrolRadius: 3,
    palette: { hair: '#593326', outfit: '#7d5a3c', trim: '#ff82a9', skin: '#d99e75' },
    voicePitch: 475,
  },
  {
    id: 'npc_flint_volcanic',
    name: 'Master Flint',
    role: 'Emberforge Foreman',
    region: 'volcanic_island',
    tileX: 196,
    tileY: 108,
    patrolRadius: 2,
    palette: { hair: '#c9c4b9', outfit: '#6e2e24', trim: '#ff884d', skin: '#d19873' },
    voicePitch: 265,
    questMarkerIds: ['q_volcanic_island'],
  },
  {
    id: 'npc_miner_cinder',
    name: 'Cinder',
    role: 'Ore Prospector',
    region: 'volcanic_island',
    tileX: 204,
    tileY: 112,
    patrolRadius: 2,
    palette: { hair: '#382a27', outfit: '#4d4854', trim: '#f5b042', skin: '#e6b894' },
    voicePitch: 365,
  },
  {
    id: 'npc_caelum_sky',
    name: 'Caelum',
    role: 'Cloudspire Keeper',
    region: 'sky_island',
    tileX: 118,
    tileY: 25,
    patrolRadius: 2,
    palette: { hair: '#f0ece1', outfit: '#3a6f94', trim: '#f5d47a', skin: '#f0c8a8' },
    voicePitch: 390,
    questMarkerIds: ['q_sky_island'],
  },
  {
    id: 'npc_edgar_haunted',
    name: 'Caretaker Edgar',
    role: 'Mistvale Historian',
    region: 'haunted_island',
    tileX: 34,
    tileY: 88,
    patrolRadius: 2,
    palette: { hair: '#a8a2b3', outfit: '#392c4f', trim: '#c792ea', skin: '#e0d6e8' },
    voicePitch: 295,
    questMarkerIds: ['q_haunted_island'],
  },
  {
    id: 'npc_seraphina_lost',
    name: 'Queen Seraphina',
    role: 'Memory of the Lost Capital',
    region: 'lost_kingdom',
    tileX: 34,
    tileY: 30,
    patrolRadius: 2,
    palette: { hair: '#f5d47a', outfit: '#3d2a5c', trim: '#ffd466', skin: '#f0d8c8' },
    voicePitch: 420,
    questMarkerIds: ['q_lost_kingdom'],
  },
];

function itemCount(save: SaveData, itemId: string): number {
  return save.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
}

export function buildNpcDialogue(npcId: string, save: SaveData): Record<string, DialogueNode> {
  const charId = save.activeCharacter;
  const restoredCount = save.completedRestorations.length;
  const hour = Math.floor(save.timeOfDay);
  const isNight = hour >= 20 || hour < 6;

  switch (npcId) {
    case 'npc_mayor_theo': {
      const q = save.quests['q_welcome_brightfall'];
      const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
      const allBrightfallDone =
        cafeDone &&
        save.completedRestorations.includes('rest_brightfall_market') &&
        save.completedRestorations.includes('rest_brightfall_garden');

      let greeting =
        'Welcome to Brightfall Town, traveler. Before the Great Fall, lanterns hung from every eavesdrop and boats sailed from Driftwood Harbour to six neighboring islands. Now we are rebuilding—one porch, one neighbor at a time.';
      if (allBrightfallDone) {
        greeting =
          'Look around you! The Fresh Mart, Bistro, Sports Park, and Market are humming—and folks are sailing out to the six surrounding islands again. You gave Aetheria its bounce back!';
      } else if (cafeDone) {
        greeting =
          'Smelling fresh pastries from Hearth & Crumb lifted half the town’s spirits! Remember, your personal Homestead is just west of the square, and Dockmaster Vane can launch a boat from Driftwood Harbour.';
      }

      const choices: DialogueNode['choices'] = [];
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
      choices.push({ label: 'Tell me about the surrounding islands.', nextNodeId: 'theo_regions' });
      choices.push({
        label: 'Rest by the square fountain (Full Heal).',
        nextNodeId: 'theo_heal',
        action: { type: 'HEAL_PLAYER' },
      });
      choices.push({ label: 'See you around the square.', action: { type: 'CLOSE' } });

      return {
        root: {
          id: 'root',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall',
          portraitKey: 'npc_mayor_theo',
          text: isNight ? `Good evening! Notice how the town lanterns glow at night? ${greeting}` : greeting,
          characterQuips: {
            explorer: 'With Rowan’s keen eye for old trails, you’ll have our roads mapped in no time.',
            inventor: 'Pip! Those brass tools of yours might be exactly what our market stalls need.',
            mystic: 'Lyra, your calm presence steadies the whole plaza.',
          },
          choices,
        },
        theo_start: {
          id: 'theo_start',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall',
          portraitKey: 'npc_mayor_theo',
          text: 'First, help Chef Clara reopen the Café, or check your personal Homestead west of the square! When ready for the high seas, head south to Driftwood Harbour.',
          choices: [{ label: 'On it, Mayor!', action: { type: 'CLOSE' } }],
        },
        theo_cafe_complete: {
          id: 'theo_cafe_complete',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall',
          portraitKey: 'npc_mayor_theo',
          text: 'Incredible work! Please take my Cartographer’s Compass. A setback never writes the final chapter—what you build next does.',
          choices: [{ label: 'Thank you, Mayor Theo.', action: { type: 'CLOSE' } }],
        },
        theo_regions: {
          id: 'theo_regions',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall',
          portraitKey: 'npc_mayor_theo',
          text: 'Beyond our Main Island lie six realms across Aetheria Sea: Frozen Kingdom (NE), Volcanic Island (E), Wild Jungle (SW), Haunted Island (W), Sky Island (N), and the Lost Kingdom (NW).',
          choices: [{ label: 'Back', nextNodeId: 'root' }],
        },
        theo_heal: {
          id: 'theo_heal',
          speaker: 'Mayor Theo',
          speakerRole: 'Mayor of Brightfall',
          portraitKey: 'npc_mayor_theo',
          text: 'Your Health and Energy are completely restored!',
          choices: [{ label: 'Feeling ready!', action: { type: 'CLOSE' } }],
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
          text: isNight
            ? 'We keep a warm late-night counter stocked for hungry explorers! Fresh fruits, veggies, cheeses, meats, and cider ready anytime.'
            : 'Welcome to Aetheria Fresh Mart! Stock up on fruits, veggies, meats, snacks, and ingredients to keep your Hunger full or cook recipes at your House!',
          choices: [
            { label: 'Shop Fresh Mart Groceries', action: { type: 'OPEN_SHOP', shopId: 'supermarket' } },
            { label: 'Just browsing, thanks!', action: { type: 'CLOSE' } },
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
          text: 'Pull up a stool at The Golden Skillet! Hot stews, skillet feasts, and berry tarts—perfect before sailing across open ocean!',
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
          text: 'Looking to craft or upgrade fantasy blades, bows, forge hammers, staffs, or Mariner fishing rods? Step right up to the anvil!',
          choices: [
            { label: 'Open Armory & Equipment Forge', action: { type: 'OPEN_EQUIPMENT' } },
            { label: 'Catch you later, Garrick.', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_coach_leo': {
      const q = save.quests['q_island_sports'];
      const choices: DialogueNode['choices'] = [
        { label: 'Play Football Penalty Challenge', action: { type: 'OPEN_MINIGAME', miniGameId: 'football' } },
        { label: 'Play Basketball Hoops Challenge', action: { type: 'OPEN_MINIGAME', miniGameId: 'basketball' } },
        { label: 'Start Brightfall Bicycle Race', action: { type: 'OPEN_MINIGAME', miniGameId: 'bicyclerace' } },
      ];
      if (!q) {
        choices.unshift({
          label: 'Accept the Brightfall Sports Pentathlon Quest!',
          nextNodeId: 'leo_accepted',
          action: { type: 'START_QUEST', questId: 'q_island_sports' },
        });
      }
      choices.push({ label: 'Catch my breath first', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Coach Leo',
          speakerRole: 'Brightfall Sports Director',
          portraitKey: 'npc_coach_leo',
          text: 'Welcome to Brightfall Sports Park! Whether it’s sinking three-pointers, scoring goals, or pedaling the forest trail, sports bring folks back together!',
          choices,
        },
        leo_accepted: {
          id: 'leo_accepted',
          speaker: 'Coach Leo',
          speakerRole: 'Brightfall Sports Director',
          portraitKey: 'npc_coach_leo',
          text: 'Play a round of Football and Basketball right here to earn Sparks and a Woven Horizon Rug for your house!',
          choices: [
            { label: 'Play Football Now', action: { type: 'OPEN_MINIGAME', miniGameId: 'football' } },
            { label: 'Later', action: { type: 'CLOSE' } },
          ],
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
          text: `Your vessel is moored right off Driftwood Pier (Boat Tier ${save.boatLevel}/3). Board anytime to sail across Aetheria Sea to all six islands—or test your speed in the Ocean Boat Race!`,
          choices: [
            { label: 'Board Boat & Set Sail!', action: { type: 'BOARD_BOAT' } },
            {
              label:
                save.boatLevel < 3
                  ? `Upgrade Boat Hull & Sails (${save.boatLevel === 1 ? 80 : 150} Sparks)`
                  : 'Boat Fully Upgraded (Tier 3)',
              action: { type: 'UPGRADE_BOAT' },
            },
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
          text: 'Rain or shine, the Brightfall Orchards keep growing back stronger! Stop by whenever you need apples, carrots, or warm cider.',
          choices: [
            { label: 'Buy Orchard Produce', action: { type: 'OPEN_SHOP', shopId: 'supermarket' } },
            { label: 'See you around the orchard!', action: { type: 'CLOSE' } },
          ],
        },
      };

    case 'npc_townsperson_eli':
      return {
        root: {
          id: 'root',
          speaker: 'Eli',
          speakerRole: 'Neighborhood Jogger',
          portraitKey: 'npc_townsperson_eli',
          text:
            save.weather === 'light_rain' || save.weather === 'heavy_rain'
              ? 'Rain puddles across the cobbles! Good thing Golden Skillet Bistro serves hot chowder inside.'
              : 'Nothing beats jogging past the Sports Park and down to Sunset Beach!',
          choices: [{ label: 'Keep up the pace!', action: { type: 'CLOSE' } }],
        },
      };

    case 'npc_builder_mae': {
      const canCafe = !save.completedRestorations.includes('rest_brightfall_cafe');
      const canMarket = !save.completedRestorations.includes('rest_brightfall_market');
      const canGarden = !save.completedRestorations.includes('rest_brightfall_garden');
      const canHomes = !save.completedRestorations.includes('rest_brightfall_homes');
      const choices: DialogueNode['choices'] = [];
      if (canCafe) {
        choices.push({
          label: `Restore Café (30 Sparks + 2 Amber Beans [have ${itemCount(save, 'cafe_beans')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_cafe' },
        });
      }
      if (canMarket) {
        choices.push({
          label: `Revive Market (40 Sparks + 2 Brass Gears [have ${itemCount(save, 'brass_gear')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_market' },
        });
      }
      if (canGarden) {
        choices.push({
          label: `Restore Garden (35 Sparks + 3 Sunpetal Berries [have ${itemCount(save, 'sun_berry')}])`,
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_garden' },
        });
      }
      if (canHomes) {
        choices.push({
          label: 'Repair Cottages & Festival Stage (50 Sparks)',
          nextNodeId: 'mae_build_result',
          action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_homes' },
        });
      }
      choices.push({ label: 'Just checking the blueprints.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Builder Mae',
          speakerRole: 'Town Carpenter & Restorer',
          portraitKey: 'npc_builder_mae',
          text: `Welcome to the Restoration Hall! We’ve completed ${restoredCount} restoration milestones across Aetheria.`,
          choices,
        },
        mae_build_result: {
          id: 'mae_build_result',
          speaker: 'Builder Mae',
          speakerRole: 'Town Carpenter & Restorer',
          portraitKey: 'npc_builder_mae',
          text: 'Step outside to watch Brightfall transform!',
          choices: [{ label: 'Awesome!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_chef_clara': {
      const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
      const q = save.quests['q_cafe_beans'];
      const beans = itemCount(save, 'cafe_beans');
      const choices: DialogueNode['choices'] = [];
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
        clara_quest: {
          id: 'clara_quest',
          speaker: 'Chef Clara',
          speakerRole: 'Hearth & Crumb Baker',
          portraitKey: 'npc_chef_clara',
          text: 'Look around Brightfall’s south park and eastern lane for 2 bean crates!',
          choices: [{ label: 'On it!', action: { type: 'CLOSE' } }],
        },
        clara_reopened: {
          id: 'clara_reopened',
          speaker: 'Chef Clara',
          speakerRole: 'Hearth & Crumb Baker',
          portraitKey: 'npc_chef_clara',
          text: 'Hearth & Crumb Café is back open! Look at the warm lanterns across the plaza!',
          choices: [{ label: 'Cheers!', action: { type: 'CLOSE' } }],
        },
        clara_heal: {
          id: 'clara_heal',
          speaker: 'Chef Clara',
          speakerRole: 'Hearth & Crumb Baker',
          portraitKey: 'npc_chef_clara',
          text: 'Health and Energy topped right back up!',
          choices: [{ label: 'Delicious!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_merchant_milo': {
      const marketDone = save.completedRestorations.includes('rest_brightfall_market');
      const q = save.quests['q_market_gears'];
      const gears = itemCount(save, 'brass_gear');
      const choices: DialogueNode['choices'] = [];
      if (marketDone) {
        choices.push({ label: 'Browse Brightfall Market Goods', action: { type: 'OPEN_SHOP', shopId: 'market' } });
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
          speakerRole: 'Brightfall General Goods',
          portraitKey: 'npc_merchant_milo',
          text: marketDone
            ? 'Welcome to Brightfall Market! Supplies, house decor, and snacks in stock.'
            : `Bring me 2 Clockwork Gears (${gears}/2) and 40 Sparks to reopen the market!`,
          choices,
        },
        milo_quest: {
          id: 'milo_quest',
          speaker: 'Merchant Milo',
          speakerRole: 'Brightfall General Goods',
          portraitKey: 'npc_merchant_milo',
          text: 'Check town chests or the Training Hall!',
          choices: [{ label: 'Got it!', action: { type: 'CLOSE' } }],
        },
        milo_open: {
          id: 'milo_open',
          speaker: 'Merchant Milo',
          speakerRole: 'Brightfall General Goods',
          portraitKey: 'npc_merchant_milo',
          text: 'The market bell chimes again!',
          choices: [{ label: 'Open Shop', action: { type: 'OPEN_SHOP', shopId: 'market' } }, { label: 'Later', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_tailor_june': {
      const gardenDone = save.completedRestorations.includes('rest_brightfall_garden');
      const q = save.quests['q_garden_bloom'];
      const berries = itemCount(save, 'sun_berry');
      const choices: DialogueNode['choices'] = [{ label: 'Change Character or Outfit', action: { type: 'OPEN_CHARACTERS' } }];
      if (!gardenDone) {
        if (!q) {
          choices.push({
            label: 'Tell me about the Community Garden project.',
            nextNodeId: 'june_quest',
            action: { type: 'START_QUEST', questId: 'q_garden_bloom' },
          });
        }
        if (berries >= 3 && save.sparks >= 35) {
          choices.push({
            label: 'Restore the Garden (3 Berries + 35 Sparks)!',
            nextNodeId: 'june_done',
            action: { type: 'RESTORE_PROJECT', projectId: 'rest_brightfall_garden' },
          });
        }
      }
      choices.push({ label: 'Back to exploring!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Tailor June',
          speakerRole: 'Atelier Designer',
          portraitKey: 'npc_tailor_june',
          text: gardenDone
            ? 'The Community Garden is blooming and Festival outfits are ready!'
            : `Switch companions or outfits anytime here! Bring 3 Sunpetal Berries (${berries}/3) to restore the garden.`,
          choices,
        },
        june_quest: {
          id: 'june_quest',
          speaker: 'Tailor June',
          speakerRole: 'Atelier Designer',
          portraitKey: 'npc_tailor_june',
          text: 'Sunpetal Berries grow near Brightfall Park and the woods border.',
          choices: [{ label: 'On it!', action: { type: 'CLOSE' } }],
        },
        june_done: {
          id: 'june_done',
          speaker: 'Tailor June',
          speakerRole: 'Atelier Designer',
          portraitKey: 'npc_tailor_june',
          text: 'Brightfall Festival outfits are now unlocked!',
          choices: [{ label: 'Try it on', action: { type: 'OPEN_CHARACTERS' } }, { label: 'Thanks!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_trainer_kael': {
      const q = save.quests['q_archery_champion'];
      const best = save.miniGameBestScores.archery ?? 0;
      const choices: DialogueNode['choices'] = [
        { label: 'Play Aether Archery Challenge!', action: { type: 'OPEN_MINIGAME', miniGameId: 'archery' } },
      ];
      if (!q) {
        choices.push({
          label: 'Accept Aether Range Quest.',
          nextNodeId: 'kael_q',
          action: { type: 'START_QUEST', questId: 'q_archery_champion' },
        });
      }
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
        kael_q: {
          id: 'kael_q',
          speaker: 'Trainer Kael',
          speakerRole: 'Aether Athletics Coach',
          portraitKey: 'npc_trainer_kael',
          text: 'Score points on the range to earn Sparks and a Clockwork Gear!',
          choices: [{ label: 'Start Archery', action: { type: 'OPEN_MINIGAME', miniGameId: 'archery' } }],
        },
      };
    }

    case 'npc_bard_oliver':
      return {
        root: {
          id: 'root',
          speaker: 'Oliver the Bard',
          speakerRole: 'Festival Musician',
          portraitKey: 'npc_bard_oliver',
          text: `Music lifts the whole town! Personal best in Harmony Rhythm: ${save.miniGameBestScores.rhythm ?? 0} pts.`,
          choices: [
            { label: 'Play Harmony Rhythm', action: { type: 'OPEN_MINIGAME', miniGameId: 'rhythm' } },
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
          text: 'Seeing the Café open and neighbors jogging past the park makes Brightfall feel like home again!',
          choices: [{ label: 'Welcome back!', action: { type: 'CLOSE' } }],
        },
      };

    case 'npc_elder_moss': {
      const defeated = save.defeatedGuardians.includes('woodland_giant');
      const q = save.quests['q_woodland_giant'];
      const choices: DialogueNode['choices'] = [];
      if (!q && !defeated) {
        choices.push({
          label: 'How can we calm The Woodland Giant?',
          nextNodeId: 'moss_explain',
          action: { type: 'START_QUEST', questId: 'q_woodland_giant' },
        });
      }
      choices.push({ label: 'Farewell, Elder.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Elder Moss',
          speakerRole: 'Keeper of Mossbrook',
          portraitKey: 'npc_elder_moss',
          text: defeated
            ? 'Sylvaron rests peacefully beneath emerald leaves once more!'
            : 'Sylvaron has been restless in northwest Elderwood Sanctuary since the Great Fall.',
          choices,
        },
        moss_explain: {
          id: 'moss_explain',
          speaker: 'Elder Moss',
          speakerRole: 'Keeper of Mossbrook',
          portraitKey: 'npc_elder_moss',
          text: 'Head north from Mossbrook Hamlet and light the 3 Rune Pillars to purify Sylvaron!',
          choices: [{ label: 'On our way!', action: { type: 'CLOSE' } }],
        },
      };
    }

    case 'npc_herbalist_fern': {
      const q = save.quests['q_missing_ferns'];
      const ferns = itemCount(save, 'forest_fern');
      const choices: DialogueNode['choices'] = [];
      if (!q) {
        choices.push({
          label: 'I can gather 3 Whispering Ferns.',
          nextNodeId: 'fern_a',
          action: { type: 'START_QUEST', questId: 'q_missing_ferns' },
        });
      } else if (q.status === 'active' && ferns >= 3) {
        choices.push({
          label: 'Here are the 3 Whispering Ferns!',
          nextNodeId: 'fern_d',
          action: { type: 'COMPLETE_QUEST', questId: 'q_missing_ferns' },
        });
      }
      choices.push({ label: 'Brew herbal tea (Full Heal)', nextNodeId: 'fern_h', action: { type: 'HEAL_PLAYER' } });
      choices.push({ label: 'See you soon', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Herbalist Fern',
          speakerRole: 'Botanist & Healer',
          portraitKey: 'npc_herbalist_fern',
          text:
            q?.status === 'completed'
              ? 'Those ferns made wonderful restorative salves!'
              : `Bring 3 Whispering Ferns from the forest glades (${ferns}/3).`,
          choices,
        },
        fern_a: { id: 'fern_a', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Thank you kindly!', choices: [{ label: 'Got it!', action: { type: 'CLOSE' } }] },
        fern_d: { id: 'fern_d', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Here are Aether Shards and Sparks in thanks!', choices: [{ label: 'Happy to help!', action: { type: 'CLOSE' } }] },
        fern_h: { id: 'fern_h', speaker: 'Herbalist Fern', speakerRole: 'Botanist', portraitKey: 'npc_herbalist_fern', text: 'Restored Health & Energy!', choices: [{ label: 'Thanks!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_captain_finn': {
      const defeated = save.defeatedGuardians.includes('tidal_keeper');
      const q = save.quests['q_sunset_lighthouse'];
      const choices: DialogueNode['choices'] = [];
      if (!q && !defeated) {
        choices.push({
          label: 'Tell me about Sunset Lighthouse & Neridia.',
          nextNodeId: 'finn_e',
          action: { type: 'START_QUEST', questId: 'q_sunset_lighthouse' },
        });
      }
      choices.push({ label: 'Smooth seas, Captain!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Captain Finn',
          speakerRole: 'Driftwood Harbor Master',
          portraitKey: 'npc_captain_finn',
          text: defeated
            ? 'Sunset Lighthouse shines across the whole archipelago again!'
            : 'Neridia out on the eastern Sunken Atoll needs calming before our lighthouse glows steady.',
          choices,
        },
        finn_e: { id: 'finn_e', speaker: 'Captain Finn', speakerRole: 'Harbor Master', portraitKey: 'npc_captain_finn', text: 'Follow the boardwalk east to Sunken Atoll!', choices: [{ label: 'Anchors aweigh!', action: { type: 'CLOSE' } }] },
      };
    }

    case 'npc_angler_marina': {
      const best = save.miniGameBestScores.fishing ?? 0;
      const q = save.quests['q_coastal_catch'];
      const choices: DialogueNode['choices'] = [
        { label: 'Cast Line (Tidewater Fishing)', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
      ];
      if (!q) {
        choices.push({
          label: 'Accept Catch of the Sunset Quest!',
          nextNodeId: 'marina_q',
          action: { type: 'START_QUEST', questId: 'q_coastal_catch' },
        });
      }
      choices.push({ label: 'Later, Marina!', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Angler Marina',
          speakerRole: 'Pier Champion',
          portraitKey: 'npc_angler_marina',
          text: `Different weather and times attract rare fish! Your fishing best: ${best} pts.`,
          choices,
        },
        marina_q: { id: 'marina_q', speaker: 'Angler Marina', speakerRole: 'Pier Champion', portraitKey: 'npc_angler_marina', text: 'Reel in a coastal catch!', choices: [{ label: 'Let’s fish!', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } }] },
      };
    }

    case 'npc_warden_ingrid': {
      const defeated = save.defeatedGuardians.includes('frostbound_watcher');
      const q = save.quests['q_frostpeak_hearth'];
      const choices: DialogueNode['choices'] = [];
      if (!q && !defeated) {
        choices.push({
          label: 'How do we awaken The Frostbound Watcher?',
          nextNodeId: 'ingrid_e',
          action: { type: 'START_QUEST', questId: 'q_frostpeak_hearth' },
        });
      }
      choices.push({ label: 'Warm up by Hearthstone Lodge (Full Heal)', nextNodeId: 'ingrid_h', action: { type: 'HEAL_PLAYER' } });
      choices.push({ label: 'Stay warm.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Warden Ingrid',
          speakerRole: 'Hearthstone Guide',
          portraitKey: 'npc_warden_ingrid',
          text: defeated ? 'The summit gale has warmed nicely!' : 'Ignite the 4 Alpine Braziers on Watcher’s Summit northeast!',
          choices,
        },
        ingrid_e: { id: 'ingrid_e', speaker: 'Warden Ingrid', speakerRole: 'Guide', portraitKey: 'npc_warden_ingrid', text: 'Climb the switchback to Watcher’s Summit!', choices: [{ label: 'To the summit!', action: { type: 'CLOSE' } }] },
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
      const choices: DialogueNode['choices'] = [];
      if (!qMain && !defeated) {
        choices.push({
          label: 'What really caused the Great Fall?',
          nextNodeId: 'orin_l',
          action: { type: 'START_QUEST', questId: 'q_forgotten_kingdom' },
        });
      }
      if (!qRune) {
        choices.push({
          label: 'Tell me about the Memory Seal Puzzle.',
          nextNodeId: 'orin_r',
          action: { type: 'START_QUEST', questId: 'q_rune_scholar' },
        });
      } else {
        choices.push({ label: 'Play Ancient Rune Memory Seal', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } });
      }
      choices.push({ label: 'Farewell.', action: { type: 'CLOSE' } });
      return {
        root: {
          id: 'root',
          speaker: 'Archivist Orin',
          speakerRole: 'Scholar of the Dawn',
          portraitKey: 'npc_archivist_orin',
          text: defeated
            ? 'Golden light crowns the Dawn Sanctum! Yet across the northwest ocean, The Lost Kingdom still holds older memories.'
            : `Ahead lies the Dawn Sanctum and Aurelius, The Last Remnant, ${charId === 'chronomancer' ? 'Sora' : 'traveler'}.`,
          choices,
        },
        orin_l: { id: 'orin_l', speaker: 'Archivist Orin', speakerRole: 'Scholar', portraitKey: 'npc_archivist_orin', text: 'Purify Aurelius at the Sanctum north of here!', choices: [{ label: 'Ready!', action: { type: 'CLOSE' } }] },
        orin_r: { id: 'orin_r', speaker: 'Archivist Orin', speakerRole: 'Scholar', portraitKey: 'npc_archivist_orin', text: 'Solve the Memory Seal to awaken Sora, The Dawnkeeper!', choices: [{ label: 'Play Memory Seal', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } }] },
      };
    }

    // 6 ISLANDS NPCS
    case 'npc_freya_frost': {
      const done = save.defeatedGuardians.includes('frost_empress');
      const q = save.quests['q_frozen_kingdom'];
      return {
        root: {
          id: 'root',
          speaker: 'Freya',
          speakerRole: 'Frosthaven Mayor',
          portraitKey: 'npc_freya_frost',
          text: done
            ? 'Aurora ribbons are dancing over Frosthaven again! Enjoy the Alpine Parka outfit.'
            : 'Welcome to The Frozen Kingdom! North atop the Glacier Spire, Glacius the Frost Empress has frozen our harbour winds.',
          choices: [
            ...(!q && !done ? [{ label: 'I will help thaw Frosthaven!', action: { type: 'START_QUEST' as const, questId: 'q_frozen_kingdom' } }] : []),
            { label: 'Warm up by Frosthaven Hearth (Full Heal)', action: { type: 'HEAL_PLAYER' } },
            { label: 'Farewell', action: { type: 'CLOSE' } },
          ],
        },
      };
    }
    case 'npc_icecarver_bjorn':
      return {
        root: {
          id: 'root',
          speaker: 'Bjorn',
          speakerRole: 'Fjord Angler',
          portraitKey: 'npc_icecarver_bjorn',
          text: 'Cast your line right here in the northern fjord—you might hook a rare Glacier Crystal Char!',
          choices: [
            { label: 'Fish in Frozen Fjord', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
            { label: 'Try Ice Slide on Fjord', action: { type: 'OPEN_MINIGAME', miniGameId: 'timeslide' } },
            { label: 'Stay warm!', action: { type: 'CLOSE' } },
          ],
        },
      };
    case 'npc_kora_jungle': {
      const done = save.defeatedGuardians.includes('jungle_titan');
      const q = save.quests['q_wild_jungle'];
      return {
        root: {
          id: 'root',
          speaker: 'Kora',
          speakerRole: 'Canopy Ranger',
          portraitKey: 'npc_kora_jungle',
          text: done
            ? 'The Waterfall Temple sings again and Canopy Sun-Orchids are blooming!'
            : 'Welcome to The Wild Jungle! Head northwest into the dense canopy to find Zulra, The Jungle Titan.',
          choices: [
            ...(!q && !done ? [{ label: 'Accept Wild Jungle Quest!', action: { type: 'START_QUEST' as const, questId: 'q_wild_jungle' } }] : []),
            { label: 'Target Practice in the Canopy', action: { type: 'OPEN_MINIGAME', miniGameId: 'archery' } },
            { label: 'Explore the jungle', action: { type: 'CLOSE' } },
          ],
        },
      };
    }
    case 'npc_botanist_tali':
      return {
        root: {
          id: 'root',
          speaker: 'Tali',
          speakerRole: 'Orchid Researcher',
          portraitKey: 'npc_botanist_tali',
          text: 'Tropical rainstorms here wake up the rare Mistfall Rain Koi in our rivers!',
          choices: [
            { label: 'Cast a line in the Jungle River', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
            { label: 'Rest at Camp (Full Heal)', action: { type: 'HEAL_PLAYER' } },
            { label: 'Bye Tali!', action: { type: 'CLOSE' } },
          ],
        },
      };
    case 'npc_flint_volcanic': {
      const done = save.defeatedGuardians.includes('magma_colossus');
      const q = save.quests['q_volcanic_island'];
      return {
        root: {
          id: 'root',
          speaker: 'Master Flint',
          speakerRole: 'Emberforge Foreman',
          portraitKey: 'npc_flint_volcanic',
          text: done
            ? 'The magma vents settled and Ember the Pyromancer is thrilled to travel with you!'
            : 'Watch your step on the basalt bridges! Ignis the Magma Colossus is overheating north of Emberforge Camp.',
          choices: [
            ...(!q && !done ? [{ label: 'Accept Volcanic Island Quest!', action: { type: 'START_QUEST' as const, questId: 'q_volcanic_island' } }] : []),
            { label: 'Cool off & Heal', action: { type: 'HEAL_PLAYER' } },
            { label: 'Onward!', action: { type: 'CLOSE' } },
          ],
        },
      };
    }
    case 'npc_miner_cinder':
      return {
        root: {
          id: 'root',
          speaker: 'Cinder',
          speakerRole: 'Ore Prospector',
          portraitKey: 'npc_miner_cinder',
          text: 'Gather Basalt Ember Ore around the ridge—Smith Garrick back in Brightfall can forge it into the Emberforge Hammer!',
          choices: [{ label: 'Good tip!', action: { type: 'CLOSE' } }],
        },
      };
    case 'npc_caelum_sky': {
      const done = save.defeatedGuardians.includes('sky_seraph');
      const q = save.quests['q_sky_island'];
      return {
        root: {
          id: 'root',
          speaker: 'Caelum',
          speakerRole: 'Cloudspire Keeper',
          portraitKey: 'npc_caelum_sky',
          text: done
            ? 'Skywarden Aero joined your ranks and Cloudspire’s wind-bridges hum in harmony!'
            : 'Welcome atop The Sky Island! Cross the marble sky bridge north to harmonize Zephyra, The Sky Seraph.',
          choices: [
            ...(!q && !done ? [{ label: 'Accept Sky Island Quest!', action: { type: 'START_QUEST' as const, questId: 'q_sky_island' } }] : []),
            { label: 'Play Wind-Chime Rhythm', action: { type: 'OPEN_MINIGAME', miniGameId: 'rhythm' } },
            { label: 'Explore Cloudspire', action: { type: 'CLOSE' } },
          ],
        },
      };
    }
    case 'npc_edgar_haunted': {
      const done = save.defeatedGuardians.includes('phantom_duke');
      const q = save.quests['q_haunted_island'];
      return {
        root: {
          id: 'root',
          speaker: 'Caretaker Edgar',
          speakerRole: 'Mistvale Historian',
          portraitKey: 'npc_edgar_haunted',
          text: done
            ? 'Mistvale Castle glows gently in the moonlight now. Vesper finally rests easy.'
            : 'Don’t fear Mistvale’s fog—it’s only loneliness. Light the lanterns around Vesper, The Phantom Duke in the castle courtyard northwest.',
          choices: [
            ...(!q && !done ? [{ label: 'Accept Haunted Island Quest!', action: { type: 'START_QUEST' as const, questId: 'q_haunted_island' } }] : []),
            { label: 'Fish Mistvale Lagoon', action: { type: 'OPEN_MINIGAME', miniGameId: 'fishing' } },
            { label: 'Into the mist', action: { type: 'CLOSE' } },
          ],
        },
      };
    }
    case 'npc_seraphina_lost': {
      const done = save.defeatedGuardians.includes('eclipse_sovereign');
      const q = save.quests['q_lost_kingdom'];
      return {
        root: {
          id: 'root',
          speaker: 'Queen Seraphina',
          speakerRole: 'Memory of the Lost Capital',
          portraitKey: 'npc_seraphina_lost',
          text: done
            ? 'You united every island and every community across Aetheria. Truly, Aetheria has bounced back!'
            : 'You reached The Lost Kingdom—the cradle of Aetheria before the Great Fall. North in the Obsidian Citadel awaits Aetherion, The Eclipse Sovereign.',
          choices: [
            ...(!q && !done ? [{ label: 'I will awaken Aetherion!', action: { type: 'START_QUEST' as const, questId: 'q_lost_kingdom' } }] : []),
            { label: 'Attempt Ancient Rune Memory', action: { type: 'OPEN_MINIGAME', miniGameId: 'runememory' } },
            { label: 'Restore Health & Energy', action: { type: 'HEAL_PLAYER' } },
            { label: 'Step toward the Citadel', action: { type: 'CLOSE' } },
          ],
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

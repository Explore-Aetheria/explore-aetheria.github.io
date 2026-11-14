import { QuestDef, RegionId, SaveData } from '../types/game';

interface CampaignBeat {
  title: string;
  summary: string;
  location: string;
  giverNpcId: string;
  type: 'talk' | 'collect' | 'discover' | 'puzzle' | 'minigame' | 'fish' | 'photo' | 'restore';
  targetId: string;
  required: number;
  sparks: number;
  xp: number;
}

function getCampaignHint(type: CampaignBeat['type'], location: string): string {
  switch (type) {
    case 'talk':
      return `Seek out the indicated island contact near ${location} and press [E] to speak.`;
    case 'collect':
      return `Search sparkling drops around ${location}, or check Brightfall Fresh Mart / Bistro / Market if it is food or crafted gear.`;
    case 'discover':
      return `Explore toward ${location} until the region banner appears to discover the landmark.`;
    case 'puzzle':
      return `Interact ([E]) with the glowing ancient mechanism or switch at ${location}.`;
    case 'fish':
      return `Equip your fishing rod at any wooden pier or coastal water near ${location} and press [E].`;
    case 'photo':
      return `Approach a giant roaming creature on sea or land near ${location} and press [P] to take a wildlife photo.`;
    case 'minigame':
      return `Complete the matching trial via the nearby landmark or island contact at ${location}.`;
    case 'restore':
      return `Enter the Guardian’s sanctum at ${location}, activate its Rune Pillars, and purify the Guardian.`;
  }
}

function buildIslandCampaign(
  region: RegionId,
  prefix: string,
  beats: CampaignBeat[],
  unlockCharacterId?: QuestDef['unlockCharacterId'],
  unlockOutfit?: QuestDef['unlockOutfit'],
  finalRewardItem?: string
): QuestDef[] {
  return beats.map((b, idx) => {
    const step = idx + 1;
    const id = `camp_${prefix}_${String(step).padStart(2, '0')}`;
    const prevId = step > 1 ? `camp_${prefix}_${String(step - 1).padStart(2, '0')}` : undefined;
    const isFinal = step === beats.length;
    const timeNote = b.targetId === 'fish_lantern_eel' ? 'Active Evening–Midnight (17:00–05:00)' : undefined;
    return {
      id,
      title: `${step}. ${b.title}`,
      category: 'campaign',
      region,
      campaignOrder: step,
      giverNpcId: b.giverNpcId,
      locationHint: b.location,
      exactLocation: `${b.location} (${region.replace('_', ' ')})`,
      whyText: isFinal
        ? 'Culminating this chapter restores the island’s harmony and lifts the seal left by the Great Fall.'
        : `Chapter ${step} of ${beats.length} helping the local island community stabilize after the Great Fall.`,
      hintText: getCampaignHint(b.type, b.location),
      timeRequirementText: timeNote,
      postCompletionText: isFinal
        ? 'The island guardian’s peace radiates warmly across the entire archipelago.'
        : 'Another link in the island’s recovery chain locks cleanly into place.',
      summary: b.summary,
      objectives: [
        {
          id: `${id}_obj`,
          description: b.summary.split('.')[0],
          type: b.type,
          targetId: b.targetId,
          required: b.required,
        },
      ],
      rewardXp: b.xp,
      rewardSparks: b.sparks,
      prerequisiteQuestId: prevId,
      ...(isFinal && unlockCharacterId ? { unlockCharacterId } : {}),
      ...(isFinal && unlockOutfit ? { unlockOutfit } : {}),
      ...(isFinal && finalRewardItem ? { rewardItems: [{ id: finalRewardItem, quantity: 1 }] } : {}),
    };
  });
}

// 1. FROZEN KINGDOM (20 Campaign Quests)
const FROZEN_BEATS: CampaignBeat[] = [
  { title: 'Arrival at Frosthaven Pier', summary: 'Report to Mayor Freya at Frosthaven Harbour after landing.', location: 'Frosthaven Harbour', giverNpcId: 'npc_freya_frost', type: 'talk', targetId: 'npc_freya_frost', required: 1, sparks: 25, xp: 40 },
  { title: 'Warmth for the Watchtower', summary: 'Deliver Sunpetal Cider to keep the northern dock watch warm.', location: 'Frosthaven Village', giverNpcId: 'npc_freya_frost', type: 'collect', targetId: 'drink_cider', required: 1, sparks: 30, xp: 45 },
  { title: 'History of the Glacier Fall', summary: 'Speak with Fjord Angler Bjorn about how the Great Fall froze the fjord.', location: 'Frozen Fjord Shore', giverNpcId: 'npc_freya_frost', type: 'talk', targetId: 'npc_icecarver_bjorn', required: 1, sparks: 28, xp: 45 },
  { title: 'Chilled Waters Catch', summary: 'Fish along the frozen lake edge to catch a Glacier Crystal Char or Silverfin.', location: 'Frozen Fjord Lake', giverNpcId: 'npc_icecarver_bjorn', type: 'fish', targetId: 'fish_frost_char', required: 1, sparks: 40, xp: 60 },
  { title: 'The Missing Ice-Carver Tools', summary: 'Recover Glacial Embers scattered along the eastern ridge.', location: 'Eastern Snow Ridge', giverNpcId: 'npc_icecarver_bjorn', type: 'collect', targetId: 'frost_crystal', required: 2, sparks: 35, xp: 55 },
  { title: 'Echoes Beneath the Snow', summary: 'Discover the entrance to Glacier Crystal Cave west of Frosthaven.', location: 'Glacier Crystal Cave', giverNpcId: 'npc_freya_frost', type: 'discover', targetId: 'lm_frozen_cave', required: 1, sparks: 35, xp: 60 },
  { title: 'Snowboard Slalom Calibration', summary: 'Test the frost trails in Frostpeak Time Slide to prove alpine balance.', location: 'Frosthaven Ridge', giverNpcId: 'npc_freya_frost', type: 'minigame', targetId: 'timeslide', required: 1, sparks: 45, xp: 65 },
  { title: 'Lanterns Along the Timber Span', summary: 'Solve the Frozen Gate Switch puzzle to reopen the inner snow bridge.', location: 'Frosthaven Snow Bridge', giverNpcId: 'npc_freya_frost', type: 'puzzle', targetId: 'puz_frozen_bridge', required: 1, sparks: 45, xp: 70 },
  { title: 'Tracks of the Glacier Mammoth', summary: 'Photograph a Giant Roaming Creature in the northern wilderness.', location: 'North Glacier Plains', giverNpcId: 'npc_icecarver_bjorn', type: 'photo', targetId: 'any_giant', required: 1, sparks: 50, xp: 75 },
  { title: 'Tribute of Alpine Cheese', summary: 'Bring Alpine Meadow Cheese from Fresh Mart to restock Frosthaven Hall.', location: 'Frosthaven Hall', giverNpcId: 'npc_freya_frost', type: 'collect', targetId: 'food_cheese', required: 2, sparks: 40, xp: 60 },
  { title: 'Crystals of the Inner Cavern', summary: 'Explore Glacier Crystal Cave and gather Aether Shards from the snow drifts.', location: 'Glacier Crystal Cave', giverNpcId: 'npc_freya_frost', type: 'collect', targetId: 'aether_shard', required: 2, sparks: 45, xp: 65 },
  { title: 'Runes of Empress Glacius', summary: 'Study the ancient mural inside Glacier Crystal Cave with Archivist notes.', location: 'Glacier Cave Chamber', giverNpcId: 'npc_freya_frost', type: 'puzzle', targetId: 'puz_frozen_mural', required: 1, sparks: 50, xp: 75 },
  { title: 'Calm the Blizzards’ Edge', summary: 'Speak with Freya about unlocking the Glacier Spire Dungeon.', location: 'Frosthaven Village', giverNpcId: 'npc_freya_frost', type: 'talk', targetId: 'npc_freya_frost', required: 1, sparks: 35, xp: 55 },
  { title: 'Descend into the Frost Vault', summary: 'Enter the Frozen Kingdom Dungeon beneath the glacier spire.', location: 'Frozen Spire Dungeon', giverNpcId: 'npc_freya_frost', type: 'discover', targetId: 'lm_frozen_dungeon', required: 1, sparks: 55, xp: 85 },
  { title: 'Thaw the First Lock', summary: 'Gather Clockwork Gears to restart the dungeon’s geothermal heater.', location: 'Frozen Dungeon Gate', giverNpcId: 'npc_freya_frost', type: 'collect', targetId: 'brass_gear', required: 2, sparks: 50, xp: 75 },
  { title: 'Warm Cocoa for the Scouts', summary: 'Prepare or deliver Winter Holiday Cocoa to Frosthaven’s mountain scouts.', location: 'Glacier Camp', giverNpcId: 'npc_icecarver_bjorn', type: 'collect', targetId: 'drink_cocoa', required: 1, sparks: 45, xp: 70 },
  { title: 'Resonance of the Frozen Bell', summary: 'Complete the Rune Memory trial to harmonize the spire’s frozen chimes.', location: 'Glacier Spire', giverNpcId: 'npc_freya_frost', type: 'minigame', targetId: 'runememory', required: 1, sparks: 60, xp: 85 },
  { title: 'Armor for the Ascent', summary: 'Visit Brightfall Armory or craft upgrades to strengthen your gear for Glacius.', location: 'Anvil & Spark Armory', giverNpcId: 'npc_freya_frost', type: 'talk', targetId: 'npc_smith_garrick', required: 1, sparks: 40, xp: 65 },
  { title: 'Final Brazier Check', summary: 'Report to Mayor Freya to receive the Spire Key before facing Glacius.', location: 'Frosthaven Hall', giverNpcId: 'npc_freya_frost', type: 'talk', targetId: 'npc_freya_frost', required: 1, sparks: 60, xp: 90 },
  { title: 'Empress of the Eternal Snow', summary: 'Challenge and purify Glacius, The Frost Empress atop Glacier Peak.', location: 'Glacier Peak Arena', giverNpcId: 'npc_freya_frost', type: 'restore', targetId: 'rest_frozen_island', required: 1, sparks: 140, xp: 200 },
];

// 2. WILD JUNGLE (20 Campaign Quests)
const JUNGLE_BEATS: CampaignBeat[] = [
  { title: 'Landfall at Canopy Cove', summary: 'Meet Canopy Ranger Kora at the Wild Jungle landing outpost.', location: 'Canopy Landing', giverNpcId: 'npc_kora_jungle', type: 'talk', targetId: 'npc_kora_jungle', required: 1, sparks: 25, xp: 40 },
  { title: 'Voices in the Palms', summary: 'Speak with Orchid Researcher Tali near the jungle river trail.', location: 'Riverbank Camp', giverNpcId: 'npc_kora_jungle', type: 'talk', targetId: 'npc_botanist_tali', required: 1, sparks: 28, xp: 45 },
  { title: 'Orchids by the Waterfall', summary: 'Collect Canopy Sun-Orchids blooming near the waterfall basin.', location: 'Waterfall Basin', giverNpcId: 'npc_botanist_tali', type: 'collect', targetId: 'jungle_orchid', required: 2, sparks: 40, xp: 60 },
  { title: 'Reopening the Rope Bridge', summary: 'Solve the Vine Pulley puzzle to lower the rope bridge across the river.', location: 'Jungle Rope Bridge', giverNpcId: 'npc_kora_jungle', type: 'puzzle', targetId: 'puz_jungle_bridge', required: 1, sparks: 45, xp: 65 },
  { title: 'Fresh Fruit for the Rangers', summary: 'Bring Orchard Crisp Apples to nourish the jungle expedition team.', location: 'Ranger Outpost', giverNpcId: 'npc_kora_jungle', type: 'collect', targetId: 'food_apple', required: 2, sparks: 35, xp: 50 },
  { title: 'Arowana of the Emerald Bend', summary: 'Cast your line into the jungle river to record a rare catch.', location: 'Jungle River Bend', giverNpcId: 'npc_botanist_tali', type: 'fish', targetId: 'fish_jungle_arowana', required: 1, sparks: 45, xp: 70 },
  { title: 'Hidden Treehouse Trail', summary: 'Discover the Canopy Treehouse settlement high in the southern palms.', location: 'Treehouse Canopy', giverNpcId: 'npc_kora_jungle', type: 'discover', targetId: 'lm_jungle_treehouse', required: 1, sparks: 40, xp: 65 },
  { title: 'Marksman of the Vines', summary: 'Hone your aim at Aether Archery to clear high canopy bramble locks.', location: 'Training Hall / Outpost', giverNpcId: 'npc_kora_jungle', type: 'minigame', targetId: 'archery', required: 1, sparks: 45, xp: 65 },
  { title: 'Ruins of the Sun-Kings', summary: 'Collect Dawn Memory Tablets or Whispering Ferns from the overgrown plaza.', location: 'Overgrown Ruins', giverNpcId: 'npc_botanist_tali', type: 'collect', targetId: 'forest_fern', required: 2, sparks: 40, xp: 60 },
  { title: 'Ancient Jungle Hydrology', summary: 'Align the Waterfall Temple sluice valve to clear the flooded path.', location: 'Waterfall Sluice', giverNpcId: 'npc_kora_jungle', type: 'puzzle', targetId: 'puz_jungle_sluice', required: 1, sparks: 50, xp: 75 },
  { title: 'Whispering Mint Remedy', summary: 'Deliver Whispering Mint Tea to soothe fevered jungle scouts.', location: 'Ranger Outpost', giverNpcId: 'npc_botanist_tali', type: 'collect', targetId: 'drink_tea', required: 1, sparks: 40, xp: 60 },
  { title: 'Into the Waterfall Temple', summary: 'Discover the entrance to the sunken Wild Jungle Temple Dungeon.', location: 'Waterfall Temple', giverNpcId: 'npc_kora_jungle', type: 'discover', targetId: 'lm_jungle_dungeon', required: 1, sparks: 55, xp: 85 },
  { title: 'The Idol Pedestals', summary: 'Recover Aether Shards to illuminate the temple’s shadowed corridors.', location: 'Temple Corridor', giverNpcId: 'npc_kora_jungle', type: 'collect', targetId: 'aether_shard', required: 2, sparks: 45, xp: 70 },
  { title: 'Echoes of Zulra', summary: 'Report your temple findings to Botanist Tali.', location: 'Riverbank Camp', giverNpcId: 'npc_botanist_tali', type: 'talk', targetId: 'npc_botanist_tali', required: 1, sparks: 35, xp: 55 },
  { title: 'Wilderness Wildlife Survey', summary: 'Capture a photograph of one of Aetheria’s roaming giants or temple statues.', location: 'Wilds Survey', giverNpcId: 'npc_botanist_tali', type: 'photo', targetId: 'any_giant', required: 1, sparks: 50, xp: 75 },
  { title: 'Chime of the Canopy', summary: 'Play Harmony Rhythm to echo the jungle temple’s stone drums.', location: 'Canopy Plaza', giverNpcId: 'npc_kora_jungle', type: 'minigame', targetId: 'rhythm', required: 1, sparks: 50, xp: 75 },
  { title: 'Gears of the Sun-Dial', summary: 'Bring Clockwork Gears to repair the temple sun-gate mechanism.', location: 'Temple Gate', giverNpcId: 'npc_kora_jungle', type: 'collect', targetId: 'brass_gear', required: 2, sparks: 50, xp: 75 },
  { title: 'Rations for the Final Push', summary: 'Pack Driftwood Fish Chowder or a Berry Tart before entering the inner sanctum.', location: 'Canopy Camp', giverNpcId: 'npc_kora_jungle', type: 'collect', targetId: 'meal_berry_tart', required: 1, sparks: 50, xp: 75 },
  { title: 'Blessing of the Rangers', summary: 'Speak with Kora before challenging Zulra at the Waterfall Sanctum.', location: 'Ranger Outpost', giverNpcId: 'npc_kora_jungle', type: 'talk', targetId: 'npc_kora_jungle', required: 1, sparks: 60, xp: 90 },
  { title: 'Awakening the Jungle Titan', summary: 'Challenge and purify Zulra, The Jungle Titan inside Waterfall Temple.', location: 'Waterfall Temple Arena', giverNpcId: 'npc_kora_jungle', type: 'restore', targetId: 'rest_jungle_temple', required: 1, sparks: 145, xp: 200 },
];

// 3. VOLCANIC ISLAND (20 Campaign Quests)
const VOLCANIC_BEATS: CampaignBeat[] = [
  { title: 'Heat at Emberforge Pier', summary: 'Check in with Master Flint at Emberforge Camp upon docking.', location: 'Emberforge Camp', giverNpcId: 'npc_flint_volcanic', type: 'talk', targetId: 'npc_flint_volcanic', required: 1, sparks: 30, xp: 45 },
  { title: 'Testing the Basalt Veins', summary: 'Mine Basalt Ember Ore from the glowing ridge deposits.', location: 'Basalt Ridge', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'volcanic_ore', required: 2, sparks: 40, xp: 60 },
  { title: 'Steam Valve Calibration', summary: 'Solve the Emberforge Steam Conduit puzzle to vent pressure.', location: 'Emberforge Conduit', giverNpcId: 'npc_flint_volcanic', type: 'puzzle', targetId: 'puz_volcanic_valve', required: 1, sparks: 50, xp: 75 },
  { title: 'A Cold Drink in Hot Ash', summary: 'Bring Warm Sunpetal Cider to cool down the thirsty smiths.', location: 'Emberforge Camp', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'drink_cider', required: 1, sparks: 35, xp: 55 },
  { title: 'Hot Springs Discovery', summary: 'Discover the restorative Obsidian Hot Springs on the eastern shelf.', location: 'Obsidian Hot Springs', giverNpcId: 'npc_flint_volcanic', type: 'discover', targetId: 'lm_volcanic_springs', required: 1, sparks: 45, xp: 65 },
  { title: 'Clockwork Crucible Parts', summary: 'Supply Clockwork Gears to mend the forge bellows.', location: 'Emberforge Camp', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'brass_gear', required: 2, sparks: 45, xp: 65 },
  { title: 'Thermal Vent Fishing', summary: 'Fish off the warm coastal rocks to reel in a Thermal Vent Snapper.', location: 'Volcanic East Pier', giverNpcId: 'npc_flint_volcanic', type: 'fish', targetId: 'fish_magma_snapper', required: 1, sparks: 55, xp: 80 },
  { title: 'Consultation with Brightfall', summary: 'Deliver volcanic telemetry to Smith Garrick in Brightfall Armory.', location: 'Anvil & Spark Armory', giverNpcId: 'npc_flint_volcanic', type: 'talk', targetId: 'npc_smith_garrick', required: 1, sparks: 40, xp: 60 },
  { title: 'Reinforced Magma Bridge', summary: 'Complete the Volcanic Drawbridge switch puzzle across the lava channel.', location: 'Lava Channel Bridge', giverNpcId: 'npc_flint_volcanic', type: 'puzzle', targetId: 'puz_volcanic_bridge', required: 1, sparks: 50, xp: 75 },
  { title: 'Hearty Miners’ Roast', summary: 'Bring Savory Herb Roast for the deep-mine expedition crew.', location: 'Mine Entrance', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'food_meat', required: 2, sparks: 45, xp: 65 },
  { title: 'Into the Magma Mines', summary: 'Discover the Underground Lava Mine Dungeon beneath the caldera.', location: 'Volcanic Mine Dungeon', giverNpcId: 'npc_flint_volcanic', type: 'discover', targetId: 'lm_volcanic_dungeon', required: 1, sparks: 60, xp: 90 },
  { title: 'Cooling Crystal Cores', summary: 'Gather Glacial Embers or Frost Crystals to stabilize the magma core.', location: 'Caldera Mines', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'frost_crystal', required: 2, sparks: 55, xp: 80 },
  { title: 'Rhythm of the Anvil', summary: 'Prove hammer precision in Harmony Rhythm.', location: 'Emberforge Stage', giverNpcId: 'npc_flint_volcanic', type: 'minigame', targetId: 'rhythm', required: 1, sparks: 50, xp: 75 },
  { title: 'Shards of Ignis', summary: 'Collect Aether Shards from the upper volcanic ash forest.', location: 'Volcanic Forest', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'aether_shard', required: 3, sparks: 55, xp: 85 },
  { title: 'Survey the Caldera Wildlife', summary: 'Photograph a giant creature or oceanic leviathan during your travels.', location: 'Outer Seas / Ridge', giverNpcId: 'npc_flint_volcanic', type: 'photo', targetId: 'any_giant', required: 1, sparks: 55, xp: 80 },
  { title: 'Memory Seal of the Smiths', summary: 'Unlock the ancient forge seal with the Rune Memory challenge.', location: 'Caldera Gate', giverNpcId: 'npc_flint_volcanic', type: 'minigame', targetId: 'runememory', required: 1, sparks: 60, xp: 90 },
  { title: 'Skillet Feast Before Battle', summary: 'Carry a Golden Skillet Feast to endure the intense caldera heat.', location: 'Emberforge Camp', giverNpcId: 'npc_flint_volcanic', type: 'collect', targetId: 'meal_skillet_feast', required: 1, sparks: 65, xp: 90 },
  { title: 'Purify the Forge Spirits', summary: 'Speak with Pip or Flint regarding the final magma valve lock.', location: 'Emberforge Camp', giverNpcId: 'npc_flint_volcanic', type: 'talk', targetId: 'npc_flint_volcanic', required: 1, sparks: 45, xp: 65 },
  { title: 'Final Approach to Caldera Peak', summary: 'Confirm readiness with Master Flint to unseal the Magma Colossus altar.', location: 'Caldera Summit', giverNpcId: 'npc_flint_volcanic', type: 'talk', targetId: 'npc_flint_volcanic', required: 1, sparks: 65, xp: 95 },
  { title: 'Calming the Magma Colossus', summary: 'Challenge and purify Ignis, The Magma Colossus inside the Caldera.', location: 'Caldera Arena', giverNpcId: 'npc_flint_volcanic', type: 'restore', targetId: 'rest_volcanic_forge', required: 1, sparks: 155, xp: 220, },
];

// 4. SKY ISLAND (20 Campaign Quests)
const SKY_BEATS: CampaignBeat[] = [
  { title: 'Touchdown at Cloudspire', summary: 'Speak with Wind-Keeper Zephyr at Cloudspire Mooring.', location: 'Cloudspire Mooring', giverNpcId: 'npc_zephyr_sky', type: 'talk', targetId: 'npc_zephyr_sky', required: 1, sparks: 30, xp: 45 },
  { title: 'Shards in the Clouds', summary: 'Gather Zephyr Sky Crystals scattered across the marble plaza.', location: 'Cloudspire Plaza', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'sky_crystal', required: 2, sparks: 45, xp: 65 },
  { title: 'Tuning the First Windmill', summary: 'Solve the Cloudspire Turbine Alignment puzzle.', location: 'West Windmill', giverNpcId: 'npc_zephyr_sky', type: 'puzzle', targetId: 'puz_sky_turbine', required: 1, sparks: 50, xp: 75 },
  { title: 'Tea Above the Horizon', summary: 'Deliver Whispering Mint Tea to steady high-altitude pilots.', location: 'Cloudspire Pavilion', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'drink_tea', required: 1, sparks: 40, xp: 60 },
  { title: 'Marble Sky-Bridge Discovery', summary: 'Discover the northern Sky Bridge overlook.', location: 'Northern Sky Bridge', giverNpcId: 'npc_zephyr_sky', type: 'discover', targetId: 'lm_sky_bridge', required: 1, sparks: 45, xp: 65 },
  { title: 'Aerial Precision Test', summary: 'Score well in Aether Archery to calibrate wind-guided bolts.', location: 'Cloudspire Range', giverNpcId: 'npc_zephyr_sky', type: 'minigame', targetId: 'archery', required: 1, sparks: 50, xp: 70 },
  { title: 'Gears for the Skyport', summary: 'Collect Clockwork Gears to maintain Cloudspire’s airship moorings.', location: 'Airship Dock', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'brass_gear', required: 2, sparks: 45, xp: 65 },
  { title: 'Tides Below the Clouds', summary: 'Catch any ocean species to feed the Sky Island observatory gulls.', location: 'Cloudspire Pier', giverNpcId: 'npc_zephyr_sky', type: 'fish', targetId: 'fish_harbour_mackerel', required: 1, sparks: 50, xp: 75 },
  { title: 'Wings of Aetheria', summary: 'Photograph a Sky Manta or roaming giant creature from the cliffs.', location: 'Sky Cliffs', giverNpcId: 'npc_zephyr_sky', type: 'photo', targetId: 'any_giant', required: 1, sparks: 55, xp: 80 },
  { title: 'Second Wind-Vane Puzzle', summary: 'Align the East Sky-Gate resonance console.', location: 'East Sky Gate', giverNpcId: 'npc_zephyr_sky', type: 'puzzle', targetId: 'puz_sky_gate', required: 1, sparks: 55, xp: 80 },
  { title: 'Hidden Cloud Sanctuary', summary: 'Enter the Sky Temple Dungeon suspended above the northern spire.', location: 'Sky Temple Dungeon', giverNpcId: 'npc_zephyr_sky', type: 'discover', targetId: 'lm_sky_dungeon', required: 1, sparks: 60, xp: 90 },
  { title: 'Aether Batteries', summary: 'Gather Aether Shards to power the dungeon lift.', location: 'Sky Temple Lift', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'aether_shard', required: 3, sparks: 55, xp: 85 },
  { title: 'Advice from the Capital', summary: 'Consult Archivist Orin regarding Zephyra’s ancient wind hymns.', location: 'Forgotten Kingdom', giverNpcId: 'npc_zephyr_sky', type: 'talk', targetId: 'npc_archivist_orin', required: 1, sparks: 45, xp: 65 },
  { title: 'Symphony in the Stratosphere', summary: 'Perform Harmony Rhythm to resonate the Cloudspire organ pipes.', location: 'Cloudspire Organ', giverNpcId: 'npc_zephyr_sky', type: 'minigame', targetId: 'rhythm', required: 1, sparks: 55, xp: 80 },
  { title: 'Boat Slalom of the Winds', summary: 'Complete the Ocean Boat Race to chart coastal updrafts.', location: 'Aetheria Sea', giverNpcId: 'npc_zephyr_sky', type: 'minigame', targetId: 'boatrace', required: 1, sparks: 60, xp: 85 },
  { title: 'Bistro Tarts for the Crew', summary: 'Bring a Hearth & Crumb Berry Tart to Cloudspire Pavilion.', location: 'Cloudspire Pavilion', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'meal_berry_tart', required: 1, sparks: 55, xp: 80 },
  { title: 'Chasing Sky Ciphers', summary: 'Unlock the inner sanctum door via Rune Memory.', location: 'Sky Sanctum', giverNpcId: 'npc_zephyr_sky', type: 'minigame', targetId: 'runememory', required: 1, sparks: 65, xp: 95 },
  { title: 'Ancient Tablets of the Sky', summary: 'Collect Dawn Memory Tablets linking Cloudspire to the First Dawn.', location: 'Sky Archive', giverNpcId: 'npc_zephyr_sky', type: 'collect', targetId: 'dawn_tablet', required: 1, sparks: 60, xp: 90 },
  { title: 'Before the Seraph’s Storm', summary: 'Speak with Wind-Keeper Zephyr to open Zephyra’s Cloudspire Altar.', location: 'Cloudspire Spire', giverNpcId: 'npc_zephyr_sky', type: 'talk', targetId: 'npc_zephyr_sky', required: 1, sparks: 65, xp: 95 },
  { title: 'Harmony of the Sky Seraph', summary: 'Challenge and purify Zephyra, The Sky Seraph atop Cloudspire.', location: 'Cloudspire Arena', giverNpcId: 'npc_zephyr_sky', type: 'restore', targetId: 'rest_sky_spire', required: 1, sparks: 160, xp: 225 },
];

// 5. HAUNTED ISLAND (20 Campaign Quests)
const HAUNTED_BEATS: CampaignBeat[] = [
  { title: 'Lanterns at Mistvale Dock', summary: 'Greet Chronicler Bramwell at Mistvale Dock in the fog.', location: 'Mistvale Dock', giverNpcId: 'npc_ghost_bramwell', type: 'talk', targetId: 'npc_ghost_bramwell', required: 1, sparks: 30, xp: 45 },
  { title: 'Wisps in the Willows', summary: 'Gather Mistvale Wisp Lanterns to push back the gloom.', location: 'Mistvale Forest', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'spirit_lantern', required: 1, sparks: 45, xp: 65 },
  { title: 'Unlocking the Manor Foyer', summary: 'Discover and enter Mistvale Manor Hall.', location: 'Mistvale Manor', giverNpcId: 'npc_ghost_bramwell', type: 'discover', targetId: 'lm_haunted_manor', required: 1, sparks: 45, xp: 70 },
  { title: 'Portrait of the Forgotten Duke', summary: 'Solve the Manor Library Bookcase puzzle.', location: 'Mistvale Library', giverNpcId: 'npc_ghost_bramwell', type: 'puzzle', targetId: 'puz_haunted_library', required: 1, sparks: 55, xp: 80 },
  { title: 'Midnight Eel of the Marsh', summary: 'Fish at dusk or night to catch a Moonlight Lantern Eel.', location: 'Haunted Marsh Pier', giverNpcId: 'npc_ghost_bramwell', type: 'fish', targetId: 'fish_lantern_eel', required: 1, sparks: 60, xp: 85 },
  { title: 'Warmth Against the Chill', summary: 'Deliver Winter Holiday Cocoa to steady Mistvale’s timid settlers.', location: 'Mistvale Hamlet', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'drink_cocoa', required: 1, sparks: 45, xp: 65 },
  { title: 'The Forgotten Cemetery', summary: 'Explore the Mistvale Cemetery and recover Aether Shards.', location: 'Mistvale Cemetery', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'aether_shard', required: 2, sparks: 45, xp: 70 },
  { title: 'Secret Underground Laboratory', summary: 'Solve the Cemetery Crypt switch puzzle to reveal the old alchemist lab.', location: 'Haunted Crypt', giverNpcId: 'npc_ghost_bramwell', type: 'puzzle', targetId: 'puz_haunted_crypt', required: 1, sparks: 55, xp: 85 },
  { title: 'Speak with Scholar Lyra / Orin', summary: 'Discuss Vesper’s lost manor diary with Archivist Orin.', location: 'Forgotten Kingdom', giverNpcId: 'npc_ghost_bramwell', type: 'talk', targetId: 'npc_archivist_orin', required: 1, sparks: 45, xp: 65 },
  { title: 'Phantom Apparition Survey', summary: 'Photograph a mysterious giant creature or spectral spire.', location: 'Mistvale Woods', giverNpcId: 'npc_ghost_bramwell', type: 'photo', targetId: 'any_giant', required: 1, sparks: 55, xp: 80 },
  { title: 'Into Mistvale Castle Dungeon', summary: 'Discover the Haunted Dungeon beneath the castle courtyard.', location: 'Haunted Castle Dungeon', giverNpcId: 'npc_ghost_bramwell', type: 'discover', targetId: 'lm_haunted_dungeon', required: 1, sparks: 60, xp: 90 },
  { title: 'Winding the Haunted Clock', summary: 'Bring Clockwork Gears to restart the castle belltower chime.', location: 'Castle Belltower', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'brass_gear', required: 2, sparks: 50, xp: 75 },
  { title: 'Requiem on Strings', summary: 'Play Harmony Rhythm to calm the restless manor echoes.', location: 'Manor Courtyard', giverNpcId: 'npc_ghost_bramwell', type: 'minigame', targetId: 'rhythm', required: 1, sparks: 55, xp: 80 },
  { title: 'Candles of Brightfall', summary: 'Collect an Everwarm Lantern from Brightfall Market for the castle hall.', location: 'Brightfall Market', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'hearth_lantern', required: 1, sparks: 55, xp: 80 },
  { title: 'Cipher of the Duke’s Crest', summary: 'Complete the Rune Memory trial to break Vesper’s seal.', location: 'Castle Sanctum', giverNpcId: 'npc_ghost_bramwell', type: 'minigame', targetId: 'runememory', required: 1, sparks: 65, xp: 95 },
  { title: 'Tidal Pearls of Memory', summary: 'Gather Tidal Pearls recalling Vesper’s voyages before the Fall.', location: 'Mistvale Coast', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'tidal_pearl', required: 2, sparks: 55, xp: 80 },
  { title: 'Comforting Chowder', summary: 'Deliver Driftwood Fish Chowder to Chronicler Bramwell.', location: 'Mistvale Dock', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'meal_fish_stew', required: 1, sparks: 60, xp: 85 },
  { title: 'Tablets in the Vault', summary: 'Recover Dawn Memory Tablets documenting Mistvale’s true history.', location: 'Castle Vault', giverNpcId: 'npc_ghost_bramwell', type: 'collect', targetId: 'dawn_tablet', required: 1, sparks: 60, xp: 90 },
  { title: 'Unlocking the Phantom Courtyard', summary: 'Report back to Bramwell to unseal Vesper’s Courtyard.', location: 'Castle Courtyard', giverNpcId: 'npc_ghost_bramwell', type: 'talk', targetId: 'npc_ghost_bramwell', required: 1, sparks: 65, xp: 95 },
  { title: 'Peace for the Phantom Duke', summary: 'Challenge and purify Vesper, The Phantom Duke in Mistvale Castle.', location: 'Haunted Castle Arena', giverNpcId: 'npc_ghost_bramwell', type: 'restore', targetId: 'rest_haunted_castle', required: 1, sparks: 165, xp: 230 },
];

// 6. LOST KINGDOM (20 Campaign Quests)
const LOST_BEATS: CampaignBeat[] = [
  { title: 'Harbour of the First Dawn', summary: 'Speak with Sentinel Vaelen at Sunken Capital Harbour.', location: 'Sunken Capital Harbour', giverNpcId: 'npc_vaelen_lost', type: 'talk', targetId: 'npc_vaelen_lost', required: 1, sparks: 35, xp: 55 },
  { title: 'Mapping the Obsidian Ruins', summary: 'Discover the Lost Capital Archive Vault in the shattered plaza.', location: 'Lost Capital Archive', giverNpcId: 'npc_vaelen_lost', type: 'discover', targetId: 'lm_lost_vault', required: 1, sparks: 50, xp: 75 },
  { title: 'Memory Slates of Aetherion', summary: 'Recover Dawn Memory Tablets from the ruined boulevards.', location: 'Sunken Boulevard', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'dawn_tablet', required: 2, sparks: 55, xp: 85 },
  { title: 'Seal of the Fallen Crown', summary: 'Solve the First Causeway Pillar puzzle to open the Royal Way.', location: 'Royal Causeway', giverNpcId: 'npc_vaelen_lost', type: 'puzzle', targetId: 'puz_lost_causeway', required: 1, sparks: 60, xp: 90 },
  { title: 'Ancient Capital Angler', summary: 'Fish along the golden sunken piers for a rare or legendary catch.', location: 'Lost Capital Pier', giverNpcId: 'npc_vaelen_lost', type: 'fish', targetId: 'fish_dawn_leviathan', required: 1, sparks: 70, xp: 100 },
  { title: 'Counsel from Mayor Theo', summary: 'Share your Lost Kingdom discoveries with Mayor Theo in Brightfall.', location: 'Brightfall Square', giverNpcId: 'npc_vaelen_lost', type: 'talk', targetId: 'npc_mayor_theo', required: 1, sparks: 45, xp: 70 },
  { title: 'Lumina Crystals of the Suburbs', summary: 'Gather Lumina Cavern Gems from Subterranea to fuel royal beacons.', location: 'Underground City', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'lumina_gem', required: 2, sparks: 65, xp: 95 },
  { title: 'Sky Crystals of the Spire', summary: 'Collect Zephyr Sky Crystals for the Sovereign’s prism matrix.', location: 'Sky Island / Archive', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'sky_crystal', required: 2, sparks: 60, xp: 90 },
  { title: 'Basalt Forging Tribute', summary: 'Bring Basalt Ember Ore to reinforce the Eclipse gate hinges.', location: 'Obsidian Gate', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'volcanic_ore', required: 2, sparks: 60, xp: 90 },
  { title: 'Chronicle the Giants', summary: 'Photograph a giant creature roaming the outer horizons.', location: 'Aetheria Archipelago', giverNpcId: 'npc_vaelen_lost', type: 'photo', targetId: 'any_giant', required: 1, sparks: 65, xp: 95 },
  { title: 'Descending the Final Vault', summary: 'Discover the Lost Kingdom Final Dungeon beneath the Eclipse Gate.', location: 'Lost Capital Dungeon', giverNpcId: 'npc_vaelen_lost', type: 'discover', targetId: 'lm_lost_dungeon', required: 1, sparks: 70, xp: 105 },
  { title: 'Truth of the Great Fall', summary: 'Decode the Eclipse Vault Cipher puzzle inside the ruins.', location: 'Archive Vault', giverNpcId: 'npc_vaelen_lost', type: 'puzzle', targetId: 'puz_lost_cipher', required: 1, sparks: 70, xp: 105 },
  { title: 'Trial of Marksmanship', summary: 'Achieve high accuracy in Aether Archery to attune the Dawn Bow.', location: 'Training Hall', giverNpcId: 'npc_vaelen_lost', type: 'minigame', targetId: 'archery', required: 1, sparks: 60, xp: 90 },
  { title: 'Trial of Memory', summary: 'Master the Ancient Rune Memory Seal inside the Kingdom.', location: 'Rune Seal Plaza', giverNpcId: 'npc_vaelen_lost', type: 'minigame', targetId: 'runememory', required: 1, sparks: 70, xp: 105 },
  { title: 'Trial of the Waves', summary: 'Complete the Ocean Boat Race around Aetheria’s buoys.', location: 'Aetheria Sea', giverNpcId: 'npc_vaelen_lost', type: 'minigame', targetId: 'boatrace', required: 1, sparks: 70, xp: 105 },
  { title: 'Feast of Heroes', summary: 'Prepare or obtain a Golden Skillet Feast before entering the sanctum.', location: 'Brightfall Bistro', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'meal_skillet_feast', required: 1, sparks: 70, xp: 100 },
  { title: 'Uniting the Five Shards', summary: 'Gather Aether Shards to stabilize the Sovereign’s crown.', location: 'Eclipse Courtyard', giverNpcId: 'npc_vaelen_lost', type: 'collect', targetId: 'aether_shard', required: 4, sparks: 75, xp: 110 },
  { title: 'Archivist’s Blessing', summary: 'Consult Archivist Orin one final time about Aetherion’s sorrow.', location: 'Forgotten Kingdom', giverNpcId: 'npc_vaelen_lost', type: 'talk', targetId: 'npc_archivist_orin', required: 1, sparks: 60, xp: 90 },
  { title: 'Unsealing the Eclipse Throne', summary: 'Report to Sentinel Vaelen to unlock Aetherion’s final sanctum.', location: 'Eclipse Throne', giverNpcId: 'npc_vaelen_lost', type: 'talk', targetId: 'npc_vaelen_lost', required: 1, sparks: 85, xp: 120 },
  { title: 'Crown of the Bounce Back', summary: 'Challenge and purify Aetherion, The Eclipse Sovereign in the Lost Capital.', location: 'Eclipse Sanctum', giverNpcId: 'npc_vaelen_lost', type: 'restore', targetId: 'rest_lost_capital', required: 1, sparks: 250, xp: 350 },
];

export const ISLAND_CAMPAIGN_QUESTS: QuestDef[] = [
  ...buildIslandCampaign('frozen_kingdom', 'frozen', FROZEN_BEATS, undefined, 'alpine', 'crest_frozen_empress'),
  ...buildIslandCampaign('wild_jungle', 'jungle', JUNGLE_BEATS, undefined, undefined, 'crest_jungle_titan'),
  ...buildIslandCampaign('volcanic_island', 'volcanic', VOLCANIC_BEATS, 'pyromancer', undefined, 'crest_volcanic'),
  ...buildIslandCampaign('sky_island', 'sky', SKY_BEATS, 'skywarden', undefined, 'crest_sky'),
  ...buildIslandCampaign('haunted_island', 'haunted', HAUNTED_BEATS, undefined, undefined, 'crest_haunted'),
  ...buildIslandCampaign('lost_kingdom', 'lost', LOST_BEATS, undefined, 'starlight', 'crest_lost_kingdom'),
];

export const ISLAND_PREFIX_MAP: Partial<Record<RegionId, string>> = {
  frozen_kingdom: 'frozen',
  wild_jungle: 'jungle',
  volcanic_island: 'volcanic',
  sky_island: 'sky',
  haunted_island: 'haunted',
  lost_kingdom: 'lost',
};

export function getIslandCampaignCompletedCount(save: SaveData, region: RegionId): number {
  const prefix = ISLAND_PREFIX_MAP[region];
  if (!prefix) return 0;
  return ISLAND_CAMPAIGN_QUESTS.filter(
    (q) => q.region === region && save.quests[q.id]?.status === 'completed'
  ).length;
}

import { MAIN_OFFSET_X as OX, MAIN_OFFSET_Y as OY } from '../data/progression';
import { GuardianId, MiniGameId, RegionId, SaveData } from '../types/game';

export const WORLD_WIDTH = 240;
export const WORLD_HEIGHT = 180;

// Tiles that block walking on foot (Note: tile 8 Deep Ocean is navigable when sailing by Boat!)
export const SOLID_TILES = new Set([8, 14, 15, 19, 24, 30, 36]);

export interface WorldBuilding {
  id: string;
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
  textureDamaged: string;
  textureRestored: string;
  restorationKey?: string;
  doorTileX?: number;
  doorTileY?: number;
  targetInteriorId?: string;
  label: string;
}

export interface WorldProp {
  id: string;
  tileX: number;
  tileY: number;
  texture: string;
  restoredTexture?: string;
  restorationKey?: string;
  solid: boolean;
}

export interface WorldChest {
  id: string;
  tileX: number;
  tileY: number;
  interiorId?: string;
  sparks: number;
  items: { id: string; quantity: number }[];
  requiresMystic?: boolean;
}

export interface WorldCollectible {
  id: string;
  tileX: number;
  tileY: number;
  interiorId?: string;
  texture: string;
  itemId: string;
  quantity: number;
}

export interface WorldInteractable {
  id: string;
  tileX: number;
  tileY: number;
  interiorId?: string;
  prompt: string;
  kind:
    | 'noticeboard'
    | 'shrine'
    | 'minigame'
    | 'gear_puzzle'
    | 'guardian_altar'
    | 'secret_lore'
    | 'heal_camp'
    | 'boat_dock'
    | 'house_bed'
    | 'house_kitchen'
    | 'house_wardrobe'
    | 'house_customize'
    | 'supermarket'
    | 'restaurant'
    | 'smithy';
  miniGameId?: MiniGameId;
  guardianId?: GuardianId;
  landmarkId?: string;
  secretId?: string;
  puzzleId?: string;
  message?: string;
}

export interface EnemySpawn {
  id: string;
  tileX: number;
  tileY: number;
  region: RegionId;
  kind: 'bramble' | 'crab' | 'wisp' | 'echo';
  texture: string;
  hp: number;
  speed: number;
  restorationClearKey?: string;
}

export interface InteriorDef {
  id: string;
  name: string;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  exitX: number;
  exitY: number;
  returnWorldX: number;
  returnWorldY: number;
  floorTile: number;
  region: RegionId;
}

export const INTERIORS: Record<string, InteriorDef> = {
  int_player_house: {
    id: 'int_player_house',
    name: 'Your Brightfall Homestead',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: OX + 40,
    returnWorldY: OY + 54,
    floorTile: 16,
    region: 'brightfall',
  },
  int_supermarket: {
    id: 'int_supermarket',
    name: 'Aetheria Fresh Mart',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 51,
    returnWorldY: OY + 47,
    floorTile: 17,
    region: 'brightfall',
  },
  int_restaurant: {
    id: 'int_restaurant',
    name: 'The Golden Skillet Bistro',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 60,
    returnWorldY: OY + 47,
    floorTile: 17,
    region: 'brightfall',
  },
  int_smithy: {
    id: 'int_smithy',
    name: 'Anvil & Spark Armory',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 67,
    returnWorldY: OY + 52,
    floorTile: 18,
    region: 'brightfall',
  },
  int_cafe: {
    id: 'int_cafe',
    name: 'Hearth & Crumb Café',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 44,
    returnWorldY: OY + 51,
    floorTile: 17,
    region: 'brightfall',
  },
  int_restoration_hall: {
    id: 'int_restoration_hall',
    name: 'Aetheria Restoration Hall',
    width: 20,
    height: 14,
    spawnX: 10,
    spawnY: 11,
    exitX: 10,
    exitY: 12,
    returnWorldX: OX + 60,
    returnWorldY: OY + 51,
    floorTile: 16,
    region: 'brightfall',
  },
  int_atelier: {
    id: 'int_atelier',
    name: 'Tailor June’s Atelier',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 44,
    returnWorldY: OY + 64,
    floorTile: 16,
    region: 'brightfall',
  },
  int_training_hall: {
    id: 'int_training_hall',
    name: 'Brightfall Training Hall',
    width: 20,
    height: 14,
    spawnX: 10,
    spawnY: 11,
    exitX: 10,
    exitY: 12,
    returnWorldX: OX + 62,
    returnWorldY: OY + 64,
    floorTile: 16,
    region: 'brightfall',
  },
  int_woods_cave: {
    id: 'int_woods_cave',
    name: 'Whispering Hollow Cavern',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: OX + 12,
    returnWorldY: OY + 58,
    floorTile: 18,
    region: 'whispering_woods',
  },
  int_coral_grotto: {
    id: 'int_coral_grotto',
    name: 'Coral Reef Grotto',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: OX + 82,
    returnWorldY: OY + 88,
    floorTile: 18,
    region: 'sunset_coast',
  },
  // New Island Interiors
  int_frozen_cave: {
    id: 'int_frozen_cave',
    name: 'Glacier Crystal Cave',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: 200,
    returnWorldY: 27,
    floorTile: 11,
    region: 'frozen_kingdom',
  },
  int_haunted_manor: {
    id: 'int_haunted_manor',
    name: 'Mistvale Manor Hall',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: 28,
    returnWorldY: 85,
    floorTile: 18,
    region: 'haunted_island',
  },
  int_lost_vault: {
    id: 'int_lost_vault',
    name: 'Lost Capital Archive Vault',
    width: 18,
    height: 14,
    spawnX: 9,
    spawnY: 11,
    exitX: 9,
    exitY: 12,
    returnWorldX: 34,
    returnWorldY: 26,
    floorTile: 12,
    region: 'lost_kingdom',
  },
};

export function getRegionAtTile(tx: number, ty: number): RegionId {
  // Surrounding 6 Islands
  if (tx >= 182 && tx <= 232 && ty >= 6 && ty <= 48) return 'frozen_kingdom';
  if (tx >= 6 && tx <= 54 && ty >= 122 && ty <= 172) return 'wild_jungle';
  if (tx >= 184 && tx <= 232 && ty >= 82 && ty <= 132) return 'volcanic_island';
  if (tx >= 94 && tx <= 142 && ty >= 2 && ty <= 36) return 'sky_island';
  if (tx >= 6 && tx <= 50 && ty >= 64 && ty <= 110) return 'haunted_island';
  if (tx >= 8 && tx <= 56 && ty >= 4 && ty <= 46) return 'lost_kingdom';

  // Mainland Bounds (OX=60, OY=40 -> 60..179, 40..139)
  const mx = tx - OX;
  const my = ty - OY;
  if (mx >= 0 && mx < 120 && my >= 0 && my < 100) {
    if (mx >= 36 && mx <= 72 && my >= 42 && my <= 72) return 'brightfall';
    if (my > 72 || (mx >= 72 && my >= 54)) return 'sunset_coast';
    if (mx >= 66 && my <= 54) return 'frostpeak';
    if (mx < 66 && my < 28) return 'forgotten_kingdom';
    return 'whispering_woods';
  }
  return 'ocean';
}

export const WORLD_BUILDINGS: WorldBuilding[] = [
  // Player's Personal House
  {
    id: 'b_player_house',
    tileX: OX + 39,
    tileY: OY + 50,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_player_house',
    textureRestored: 'bldg_player_house',
    doorTileX: OX + 40,
    doorTileY: OY + 53,
    targetInteriorId: 'int_player_house',
    label: 'Your Homestead',
  },
  // Supermarket
  {
    id: 'b_supermarket',
    tileX: OX + 49,
    tileY: OY + 43,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_supermarket',
    textureRestored: 'bldg_supermarket',
    doorTileX: OX + 51,
    doorTileY: OY + 46,
    targetInteriorId: 'int_supermarket',
    label: 'Aetheria Fresh Mart',
  },
  // Restaurant
  {
    id: 'b_restaurant',
    tileX: OX + 58,
    tileY: OY + 43,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_restaurant',
    textureRestored: 'bldg_restaurant',
    doorTileX: OX + 60,
    doorTileY: OY + 46,
    targetInteriorId: 'int_restaurant',
    label: 'Golden Skillet Bistro',
  },
  // Smithy
  {
    id: 'b_smithy',
    tileX: OX + 66,
    tileY: OY + 48,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_smithy',
    textureRestored: 'bldg_smithy',
    doorTileX: OX + 67,
    doorTileY: OY + 51,
    targetInteriorId: 'int_smithy',
    label: 'Anvil & Spark Armory',
  },
  // Original Brightfall & Mainland Buildings
  {
    id: 'b_cafe',
    tileX: OX + 42,
    tileY: OY + 47,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_cafe_damaged',
    textureRestored: 'bldg_cafe_restored',
    restorationKey: 'rest_brightfall_cafe',
    doorTileX: OX + 44,
    doorTileY: OY + 50,
    targetInteriorId: 'int_cafe',
    label: 'Hearth & Crumb Café',
  },
  {
    id: 'b_restoration_hall',
    tileX: OX + 58,
    tileY: OY + 47,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_restoration_hall',
    textureRestored: 'bldg_restoration_hall',
    doorTileX: OX + 60,
    doorTileY: OY + 50,
    targetInteriorId: 'int_restoration_hall',
    label: 'Restoration Hall',
  },
  {
    id: 'b_atelier',
    tileX: OX + 42,
    tileY: OY + 60,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_atelier',
    textureRestored: 'bldg_atelier',
    doorTileX: OX + 43,
    doorTileY: OY + 63,
    targetInteriorId: 'int_atelier',
    label: 'Wardrobe Atelier',
  },
  {
    id: 'b_training_hall',
    tileX: OX + 60,
    tileY: OY + 60,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_training',
    textureRestored: 'bldg_training',
    doorTileX: OX + 62,
    doorTileY: OY + 63,
    targetInteriorId: 'int_training_hall',
    label: 'Training Hall',
  },
  {
    id: 'b_cottage_nw',
    tileX: OX + 42,
    tileY: OY + 42,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_cottage_damaged',
    textureRestored: 'bldg_cottage_restored',
    restorationKey: 'rest_brightfall_homes',
    label: 'West Lane Cottage',
  },
  {
    id: 'b_cottage_ne',
    tileX: OX + 65,
    tileY: OY + 43,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_cottage_damaged',
    textureRestored: 'bldg_cottage_restored',
    restorationKey: 'rest_brightfall_homes',
    label: 'East Lane Cottage',
  },
  {
    id: 'b_market',
    tileX: OX + 62,
    tileY: OY + 53,
    widthTiles: 4,
    heightTiles: 2,
    textureDamaged: 'bldg_market_damaged',
    textureRestored: 'bldg_market_restored',
    restorationKey: 'rest_brightfall_market',
    label: 'Brightfall Market',
  },
  {
    id: 'b_mossbrook_lodge',
    tileX: OX + 20,
    tileY: OY + 57,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_cottage_restored',
    textureRestored: 'bldg_cottage_restored',
    label: 'Mossbrook Hall',
  },
  {
    id: 'b_frost_lodge',
    tileX: OX + 82,
    tileY: OY + 26,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_lodge',
    textureRestored: 'bldg_lodge',
    label: 'Hearthstone Lodge',
  },
  {
    id: 'b_lighthouse',
    tileX: OX + 74,
    tileY: OY + 79,
    widthTiles: 2,
    heightTiles: 4,
    textureDamaged: 'bldg_lighthouse_damaged',
    textureRestored: 'bldg_lighthouse_restored',
    restorationKey: 'rest_coast_lighthouse',
    label: 'Sunset Lighthouse',
  },
  // Island Settlement Buildings
  {
    id: 'b_frozen_lodge',
    tileX: 202,
    tileY: 28,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_lodge',
    textureRestored: 'bldg_lodge',
    label: 'Frosthaven Hall',
  },
  {
    id: 'b_jungle_camp',
    tileX: 30,
    tileY: 138,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_cottage_restored',
    textureRestored: 'bldg_cottage_restored',
    label: 'Canopy Ranger Outpost',
  },
  {
    id: 'b_volcanic_smithy',
    tileX: 194,
    tileY: 103,
    widthTiles: 3,
    heightTiles: 3,
    textureDamaged: 'bldg_smithy',
    textureRestored: 'bldg_smithy',
    label: 'Emberforge Camp',
  },
  {
    id: 'b_sky_pavilion',
    tileX: 116,
    tileY: 20,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_sky_pavilion',
    textureRestored: 'bldg_sky_pavilion',
    label: 'Cloudspire Pavilion',
  },
  {
    id: 'b_haunted_manor',
    tileX: 26,
    tileY: 81,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_haunted_manor',
    textureRestored: 'bldg_haunted_manor',
    doorTileX: 28,
    doorTileY: 84,
    targetInteriorId: 'int_haunted_manor',
    label: 'Mistvale Manor',
  },
  {
    id: 'b_lost_palace',
    tileX: 32,
    tileY: 21,
    widthTiles: 4,
    heightTiles: 3,
    textureDamaged: 'bldg_sky_pavilion',
    textureRestored: 'bldg_sky_pavilion',
    doorTileX: 34,
    doorTileY: 24,
    targetInteriorId: 'int_lost_vault',
    label: 'Lost Capital Archive',
  },
];

export const WORLD_CHESTS: WorldChest[] = [
  { id: 'ch_brightfall_park', tileX: OX + 50, tileY: OY + 67, sparks: 25, items: [{ id: 'brass_gear', quantity: 1 }, { id: 'sun_berry', quantity: 2 }] },
  { id: 'ch_brightfall_secret', tileX: OX + 40, tileY: OY + 46, sparks: 35, items: [{ id: 'aether_shard', quantity: 2 }] },
  { id: 'ch_training_gear', tileX: 15, tileY: 5, interiorId: 'int_training_hall', sparks: 20, items: [{ id: 'brass_gear', quantity: 2 }] },
  { id: 'ch_cafe_pantry', tileX: 14, tileY: 4, interiorId: 'int_cafe', sparks: 20, items: [{ id: 'sun_berry', quantity: 2 }] },
  { id: 'ch_woods_cave', tileX: 9, tileY: 4, interiorId: 'int_woods_cave', sparks: 45, items: [{ id: 'aether_shard', quantity: 2 }, { id: 'forest_fern', quantity: 2 }] },
  { id: 'ch_woods_mystic', tileX: OX + 29, tileY: OY + 42, sparks: 40, items: [{ id: 'aether_shard', quantity: 2 }], requiresMystic: true },
  { id: 'ch_coast_grotto', tileX: 9, tileY: 4, interiorId: 'int_coral_grotto', sparks: 55, items: [{ id: 'tidal_pearl', quantity: 2 }, { id: 'lighthouse_lens', quantity: 1 }] },
  { id: 'ch_coast_island', tileX: OX + 91, tileY: OY + 92, sparks: 45, items: [{ id: 'tidal_pearl', quantity: 1 }, { id: 'brass_gear', quantity: 1 }] },
  { id: 'ch_frost_ridge', tileX: OX + 94, tileY: OY + 22, sparks: 50, items: [{ id: 'frost_crystal', quantity: 2 }, { id: 'aether_shard', quantity: 2 }] },
  { id: 'ch_kingdom_vault', tileX: OX + 26, tileY: OY + 16, sparks: 75, items: [{ id: 'dawn_tablet', quantity: 2 }, { id: 'aether_shard', quantity: 3 }] },
  // 6 Islands & Ocean Chests
  { id: 'ch_ocean_west', tileX: 52, tileY: 112, sparks: 55, items: [{ id: 'ocean_doubloon', quantity: 2 }, { id: 'tidal_pearl', quantity: 1 }] },
  { id: 'ch_ocean_east', tileX: 174, tileY: 70, sparks: 55, items: [{ id: 'ocean_doubloon', quantity: 2 }, { id: 'aether_shard', quantity: 2 }] },
  { id: 'ch_frozen_cave', tileX: 9, tileY: 4, interiorId: 'int_frozen_cave', sparks: 75, items: [{ id: 'frost_crystal', quantity: 3 }, { id: 'decor_ship_model', quantity: 1 }] },
  { id: 'ch_jungle_temple', tileX: 18, tileY: 146, sparks: 70, items: [{ id: 'jungle_orchid', quantity: 2 }, { id: 'aether_shard', quantity: 2 }] },
  { id: 'ch_volcanic_ridge', tileX: 214, tileY: 110, sparks: 75, items: [{ id: 'volcanic_ore', quantity: 3 }, { id: 'brass_gear', quantity: 2 }] },
  { id: 'ch_sky_vault', tileX: 108, tileY: 20, sparks: 80, items: [{ id: 'sky_crystal', quantity: 3 }, { id: 'aether_shard', quantity: 2 }] },
  { id: 'ch_haunted_manor', tileX: 9, tileY: 4, interiorId: 'int_haunted_manor', sparks: 80, items: [{ id: 'spirit_lantern', quantity: 2 }, { id: 'decor_plush_rug', quantity: 1 }] },
  { id: 'ch_lost_vault', tileX: 9, tileY: 4, interiorId: 'int_lost_vault', sparks: 120, items: [{ id: 'dawn_tablet', quantity: 3 }, { id: 'aether_shard', quantity: 4 }] },
];

export const WORLD_COLLECTIBLES: WorldCollectible[] = [
  { id: 'col_bean_1', tileX: OX + 52, tileY: OY + 66, texture: 'prop_collectible_crate', itemId: 'cafe_beans', quantity: 1 },
  { id: 'col_bean_2', tileX: OX + 68, tileY: OY + 59, texture: 'prop_collectible_crate', itemId: 'cafe_beans', quantity: 1 },
  { id: 'col_berry_1', tileX: OX + 47, tileY: OY + 66, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_berry_2', tileX: OX + 38, tileY: OY + 56, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_berry_3', tileX: OX + 57, tileY: OY + 68, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_berry_4', tileX: OX + 31, tileY: OY + 61, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_orchard_1', tileX: OX + 68, tileY: OY + 52, texture: 'prop_collectible_berry', itemId: 'food_apple', quantity: 2 },
  { id: 'col_orchard_2', tileX: OX + 70, tileY: OY + 50, texture: 'prop_collectible_berry', itemId: 'food_carrot', quantity: 2 },
  { id: 'col_fern_1', tileX: OX + 27, tileY: OY + 54, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_fern_2', tileX: OX + 16, tileY: OY + 49, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_fern_3', tileX: OX + 12, tileY: OY + 64, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_fern_4', tileX: OX + 23, tileY: OY + 44, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_shard_1', tileX: OX + 50, tileY: OY + 44, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  { id: 'col_shard_2', tileX: OX + 77, tileY: OY + 82, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  { id: 'col_shard_3', tileX: OX + 88, tileY: OY + 34, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  { id: 'col_shard_4', tileX: OX + 46, tileY: OY + 18, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  // New Island Collectibles
  { id: 'col_orchid_1', tileX: 25, tileY: 146, texture: 'prop_collectible_orchid', itemId: 'jungle_orchid', quantity: 1 },
  { id: 'col_orchid_2', tileX: 29, tileY: 154, texture: 'prop_collectible_orchid', itemId: 'jungle_orchid', quantity: 1 },
  { id: 'col_ore_1', tileX: 202, tileY: 102, texture: 'prop_collectible_ore', itemId: 'volcanic_ore', quantity: 2 },
  { id: 'col_ore_2', tileX: 212, tileY: 104, texture: 'prop_collectible_ore', itemId: 'volcanic_ore', quantity: 2 },
  { id: 'col_sky_1', tileX: 110, tileY: 16, texture: 'prop_collectible_shard', itemId: 'sky_crystal', quantity: 2 },
  { id: 'col_sky_2', tileX: 126, tileY: 18, texture: 'prop_collectible_shard', itemId: 'sky_crystal', quantity: 2 },
  { id: 'col_spirit_1', tileX: 18, tileY: 90, texture: 'prop_collectible_shard', itemId: 'spirit_lantern', quantity: 1 },
];

export const WORLD_INTERACTABLES: WorldInteractable[] = [
  { id: 'int_noticeboard', tileX: OX + 57, tileY: OY + 55, prompt: 'Read Town Noticeboard', kind: 'noticeboard' },
  { id: 'shrine_brightfall', tileX: OX + 54, tileY: OY + 57, prompt: 'Brightfall Square Shrine (Fast Travel / Heal)', kind: 'shrine', landmarkId: 'lm_brightfall_square' },
  { id: 'shrine_mossbrook', tileX: OX + 22, tileY: OY + 62, prompt: 'Mossbrook Shrine (Fast Travel / Heal)', kind: 'shrine', landmarkId: 'lm_whispering_hamlet' },
  { id: 'shrine_docks', tileX: OX + 66, tileY: OY + 84, prompt: 'Driftwood Harbour Shrine (Fast Travel / Heal)', kind: 'shrine', landmarkId: 'lm_sunset_docks' },
  { id: 'shrine_hearthstone', tileX: OX + 84, tileY: OY + 30, prompt: 'Hearthstone Shrine (Fast Travel / Heal)', kind: 'shrine', landmarkId: 'lm_hearthstone' },
  { id: 'shrine_kingdom', tileX: OX + 44, tileY: OY + 24, prompt: 'Citadel Causeway Shrine (Fast Travel / Heal)', kind: 'shrine', landmarkId: 'lm_kingdom_gate' },

  // Island Harbours (Shrines + Boat Boarding!)
  { id: 'dock_main', tileX: OX + 66, tileY: OY + 96, prompt: 'Board Boat at Driftwood Marina', kind: 'boat_dock', landmarkId: 'lm_sunset_docks' },
  { id: 'dock_frozen', tileX: 204, tileY: 36, prompt: 'Board Boat / Fast Travel (Frozen Kingdom)', kind: 'boat_dock', landmarkId: 'lm_island_frozen' },
  { id: 'dock_jungle', tileX: 36, tileY: 146, prompt: 'Board Boat / Fast Travel (Wild Jungle)', kind: 'boat_dock', landmarkId: 'lm_island_jungle' },
  { id: 'dock_volcanic', tileX: 192, tileY: 112, prompt: 'Board Boat / Fast Travel (Volcanic Island)', kind: 'boat_dock', landmarkId: 'lm_island_volcanic' },
  { id: 'dock_sky', tileX: 118, tileY: 30, prompt: 'Board Boat / Fast Travel (Sky Island)', kind: 'boat_dock', landmarkId: 'lm_island_sky' },
  { id: 'dock_haunted', tileX: 40, tileY: 94, prompt: 'Board Boat / Fast Travel (Haunted Island)', kind: 'boat_dock', landmarkId: 'lm_island_haunted' },
  { id: 'dock_lost', tileX: 34, tileY: 36, prompt: 'Board Boat / Fast Travel (Lost Kingdom)', kind: 'boat_dock', landmarkId: 'lm_island_lost' },

  // Player House Interior Stations
  { id: 'house_bed', tileX: 4, tileY: 4, interiorId: 'int_player_house', prompt: 'Sleep in Bed (Advance Time & Full Heal)', kind: 'house_bed' },
  { id: 'house_kitchen', tileX: 13, tileY: 4, interiorId: 'int_player_house', prompt: 'Cook at Homestead Kitchen', kind: 'house_kitchen' },
  { id: 'house_wardrobe', tileX: 4, tileY: 9, interiorId: 'int_player_house', prompt: 'Open Wardrobe & Equipment', kind: 'house_wardrobe' },
  { id: 'house_desk', tileX: 9, tileY: 6, interiorId: 'int_player_house', prompt: 'Customize Homestead, Storage & Trophies', kind: 'house_customize' },

  // Shop Counters Inside Interiors
  { id: 'counter_supermarket', tileX: 9, tileY: 4, interiorId: 'int_supermarket', prompt: 'Shop Aetheria Fresh Mart', kind: 'supermarket' },
  { id: 'counter_restaurant', tileX: 9, tileY: 4, interiorId: 'int_restaurant', prompt: 'Order from Golden Skillet Bistro', kind: 'restaurant' },
  { id: 'counter_smithy', tileX: 9, tileY: 4, interiorId: 'int_smithy', prompt: 'Forge & Upgrade Equipment', kind: 'smithy' },

  // Mini-games directly accessible in world spots
  { id: 'mg_archery', tileX: 10, tileY: 5, interiorId: 'int_training_hall', prompt: 'Play Aether Archery Challenge', kind: 'minigame', miniGameId: 'archery' },
  { id: 'mg_rhythm', tileX: OX + 50, tileY: OY + 63, prompt: 'Play Harmony Rhythm Stage', kind: 'minigame', miniGameId: 'rhythm' },
  { id: 'mg_fishing', tileX: OX + 70, tileY: OY + 87, prompt: 'Cast Line: Tidewater Fishing', kind: 'minigame', miniGameId: 'fishing' },
  { id: 'mg_fishing_frozen', tileX: 196, tileY: 28, prompt: 'Cast Line: Frozen Fjord Fishing', kind: 'minigame', miniGameId: 'fishing' },
  { id: 'mg_timeslide', tileX: OX + 78, tileY: OY + 27, prompt: 'Start Frostpeak Ice Slide Trial', kind: 'minigame', miniGameId: 'timeslide' },
  { id: 'mg_runememory', tileX: OX + 40, tileY: OY + 22, prompt: 'Activate Ancient Rune Memory Seal', kind: 'minigame', miniGameId: 'runememory' },
  { id: 'mg_football', tileX: OX + 65, tileY: OY + 65, prompt: 'Play Football Penalty Challenge', kind: 'minigame', miniGameId: 'football' },
  { id: 'mg_basketball', tileX: OX + 69, tileY: OY + 68, prompt: 'Play Basketball Hoops Challenge', kind: 'minigame', miniGameId: 'basketball' },
  { id: 'mg_bicycle', tileX: OX + 63, tileY: OY + 68, prompt: 'Start Brightfall Bicycle Race', kind: 'minigame', miniGameId: 'bicyclerace' },
  { id: 'mg_boatrace', tileX: OX + 64, tileY: OY + 93, prompt: 'Start Ocean Boat Slalom Race', kind: 'minigame', miniGameId: 'boatrace' },

  // Secret areas & character-specific environmental puzzles
  { id: 'sec_cafe_garden', tileX: OX + 40, tileY: OY + 47, prompt: 'Inspect Secret Sunlit Courtyard', kind: 'secret_lore', secretId: 'sec_brightfall_courtyard', message: 'You discovered the hidden Brightfall Courtyard! (+25 Sparks)' },
  { id: 'sec_woods_cave', tileX: 6, tileY: 6, interiorId: 'int_woods_cave', prompt: 'Examine Ancient Carvings', kind: 'secret_lore', secretId: 'sec_woods_carving', message: 'Inscription: "Neighbors are the mortar that binds Aetheria back together." (+30 Sparks)' },
  { id: 'sec_coral_grotto', tileX: 12, tileY: 6, interiorId: 'int_coral_grotto', prompt: 'Inspect Glowing Tide Pool', kind: 'secret_lore', secretId: 'sec_coral_pool', message: 'You discovered the Singing Tide Pool! (+30 Sparks)' },
  { id: 'puz_inventor_mill', tileX: OX + 39, tileY: OY + 54, prompt: 'Repair Ancient Watergate Console (Inventor)', kind: 'gear_puzzle', puzzleId: 'puz_watergate', message: 'Pip’s clockwork wrench tunes the gate—releasing Sparks!' },
  { id: 'puz_volcanic_valve', tileX: 202, tileY: 108, prompt: 'Tune Ancient Forge Valve (Inventor)', kind: 'gear_puzzle', puzzleId: 'puz_volcanic_valve', message: 'Pip stabilized the Emberforge steam conduit! (+55 Sparks)' },

  // Guardian Altars (4 Mainland + 6 Islands)
  { id: 'altar_woodland', tileX: OX + 16, tileY: OY + 39, prompt: 'Challenge Sylvaron, The Woodland Giant', kind: 'guardian_altar', guardianId: 'woodland_giant' },
  { id: 'altar_tidal', tileX: OX + 95, tileY: OY + 86, prompt: 'Challenge Neridia, The Tidal Keeper', kind: 'guardian_altar', guardianId: 'tidal_keeper' },
  { id: 'altar_frost', tileX: OX + 100, tileY: OY + 16, prompt: 'Challenge Kaelen, The Frostbound Watcher', kind: 'guardian_altar', guardianId: 'frostbound_watcher' },
  { id: 'altar_remnant', tileX: OX + 36, tileY: OY + 14, prompt: 'Enter Dawn Sanctum: The Last Remnant', kind: 'guardian_altar', guardianId: 'last_remnant' },
  { id: 'altar_frozen_empress', tileX: 206, tileY: 20, prompt: 'Challenge Glacius, The Frost Empress', kind: 'guardian_altar', guardianId: 'frost_empress' },
  { id: 'altar_jungle_titan', tileX: 22, tileY: 140, prompt: 'Challenge Zulra, The Jungle Titan', kind: 'guardian_altar', guardianId: 'jungle_titan' },
  { id: 'altar_magma_colossus', tileX: 208, tileY: 98, prompt: 'Challenge Ignis, The Magma Colossus', kind: 'guardian_altar', guardianId: 'magma_colossus' },
  { id: 'altar_sky_seraph', tileX: 118, tileY: 16, prompt: 'Challenge Zephyra, The Sky Seraph', kind: 'guardian_altar', guardianId: 'sky_seraph' },
  { id: 'altar_phantom_duke', tileX: 22, tileY: 78, prompt: 'Challenge Vesper, The Phantom Duke', kind: 'guardian_altar', guardianId: 'phantom_duke' },
  { id: 'altar_eclipse_sov', tileX: 28, tileY: 20, prompt: 'Challenge Aetherion, The Eclipse Sovereign', kind: 'guardian_altar', guardianId: 'eclipse_sovereign' },
];

export const ENEMY_SPAWNS: EnemySpawn[] = [
  { id: 'e_w1', tileX: OX + 28, tileY: OY + 56, region: 'whispering_woods', kind: 'bramble', texture: 'enemy_bramble', hp: 30, speed: 58, restorationClearKey: 'rest_woods_shrine' },
  { id: 'e_w2', tileX: OX + 18, tileY: OY + 48, region: 'whispering_woods', kind: 'bramble', texture: 'enemy_bramble', hp: 35, speed: 62, restorationClearKey: 'rest_woods_shrine' },
  { id: 'e_w3', tileX: OX + 14, tileY: OY + 44, region: 'whispering_woods', kind: 'wisp', texture: 'enemy_wisp', hp: 30, speed: 70, restorationClearKey: 'rest_woods_shrine' },
  { id: 'e_c1', tileX: OX + 78, tileY: OY + 86, region: 'sunset_coast', kind: 'crab', texture: 'enemy_crab', hp: 35, speed: 65, restorationClearKey: 'rest_coast_lighthouse' },
  { id: 'e_c2', tileX: OX + 88, tileY: OY + 85, region: 'sunset_coast', kind: 'crab', texture: 'enemy_crab', hp: 40, speed: 68, restorationClearKey: 'rest_coast_lighthouse' },
  { id: 'e_f1', tileX: OX + 91, tileY: OY + 26, region: 'frostpeak', kind: 'wisp', texture: 'enemy_wisp', hp: 42, speed: 75, restorationClearKey: 'rest_frost_hearth' },
  { id: 'e_f2', tileX: OX + 98, tileY: OY + 20, region: 'frostpeak', kind: 'wisp', texture: 'enemy_wisp', hp: 45, speed: 78, restorationClearKey: 'rest_frost_hearth' },
  { id: 'e_k1', tileX: OX + 34, tileY: OY + 20, region: 'forgotten_kingdom', kind: 'echo', texture: 'enemy_echo', hp: 50, speed: 80, restorationClearKey: 'rest_kingdom_beacon' },
  { id: 'e_k2', tileX: OX + 38, tileY: OY + 18, region: 'forgotten_kingdom', kind: 'echo', texture: 'enemy_echo', hp: 55, speed: 84, restorationClearKey: 'rest_kingdom_beacon' },
  // Island Enemies
  { id: 'e_i_froz1', tileX: 206, tileY: 23, region: 'frozen_kingdom', kind: 'wisp', texture: 'enemy_wisp', hp: 55, speed: 75, restorationClearKey: 'rest_frozen_island' },
  { id: 'e_i_jung1', tileX: 24, tileY: 148, region: 'wild_jungle', kind: 'bramble', texture: 'enemy_bramble', hp: 55, speed: 70, restorationClearKey: 'rest_jungle_temple' },
  { id: 'e_i_volc1', tileX: 208, tileY: 104, region: 'volcanic_island', kind: 'crab', texture: 'enemy_crab', hp: 65, speed: 76, restorationClearKey: 'rest_volcanic_forge' },
  { id: 'e_i_sky1', tileX: 112, tileY: 18, region: 'sky_island', kind: 'wisp', texture: 'enemy_wisp', hp: 60, speed: 82, restorationClearKey: 'rest_sky_spire' },
  { id: 'e_i_haunt1', tileX: 26, tileY: 88, region: 'haunted_island', kind: 'echo', texture: 'enemy_echo', hp: 65, speed: 78, restorationClearKey: 'rest_haunted_castle' },
  { id: 'e_i_lost1', tileX: 28, tileY: 24, region: 'lost_kingdom', kind: 'echo', texture: 'enemy_echo', hp: 80, speed: 88, restorationClearKey: 'rest_lost_capital' },
];

export function buildOverworldGrid(save: SaveData): number[][] {
  // Entire archipelago starts as Deep Ocean (tile 8)
  const g: number[][] = Array.from({ length: WORLD_HEIGHT }, () => Array(WORLD_WIDTH).fill(8));

  const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
  const marketDone = save.completedRestorations.includes('rest_brightfall_market');
  const gardenDone = save.completedRestorations.includes('rest_brightfall_garden');

  const paintRect = (x0: number, y0: number, x1: number, y1: number, tile: number) => {
    for (let y = Math.max(0, y0); y <= Math.min(WORLD_HEIGHT - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(WORLD_WIDTH - 1, x1); x++) {
        g[y][x] = tile;
      }
    }
  };

  // Helper for Mainland coordinates
  const mPaint = (x0: number, y0: number, x1: number, y1: number, tile: number) =>
    paintRect(OX + x0, OY + y0, OX + x1, OY + y1, tile);

  // 1. MAIN ISLAND (120x100 anchored at OX=60, OY=40)
  mPaint(1, 1, 118, 97, 0);
  // Coastal sandy perimeter around Main Island
  mPaint(0, 0, 119, 2, 6);
  mPaint(0, 74, 119, 86, 6);
  mPaint(0, 87, 119, 99, 8);

  // Whispering Woods
  mPaint(1, 26, 36, 74, 4);
  mPaint(4, 30, 24, 44, 5);
  // Forgotten Kingdom
  mPaint(1, 1, 66, 27, 13);
  mPaint(24, 4, 48, 25, 12);
  // Frostpeak Mountains
  mPaint(66, 1, 118, 54, 10);
  mPaint(74, 20, 82, 26, 11);
  // Sunset Reefs & Islands
  mPaint(62, 85, 72, 93, 7);
  mPaint(78, 86, 86, 94, 6);
  mPaint(88, 88, 94, 95, 6);
  mPaint(92, 81, 106, 92, 6);
  mPaint(94, 83, 104, 90, 12);

  // Brightfall Town (Center-South)
  mPaint(36, 42, 72, 72, gardenDone ? 1 : 0);
  mPaint(46, 51, 64, 60, cafeDone && marketDone ? 2 : 21);
  if (cafeDone) mPaint(46, 51, 55, 60, 2);
  if (marketDone) mPaint(56, 51, 64, 60, 2);
  mPaint(46, 65, 58, 70, gardenDone ? 26 : 25);
  mPaint(49, 66, 55, 68, gardenDone ? 1 : 0);

  // Brightfall Sports Park (Football Field + Basketball Court)
  mPaint(62, 64, 67, 68, 33); // Football turf
  mPaint(68, 65, 71, 70, 34); // Basketball court
  // Brightfall Orchards & Farm
  mPaint(67, 49, 71, 53, 35);

  // Town low walls with gates
  mPaint(37, 42, 71, 42, 24);
  mPaint(37, 71, 71, 71, 24);
  mPaint(37, 42, 37, 71, 24);
  mPaint(71, 42, 71, 71, 24);
  mPaint(52, 42, 56, 42, 3);
  mPaint(52, 71, 56, 71, 3);
  mPaint(37, 56, 37, 59, 3);
  mPaint(71, 56, 71, 59, 3);

  // Mainland Roads & Bridges
  mPaint(53, 38, 55, 51, 3);
  mPaint(53, 38, 84, 40, 3);
  mPaint(83, 30, 85, 40, 3);
  mPaint(43, 24, 55, 40, 3);
  mPaint(22, 57, 46, 59, 3);
  mPaint(14, 38, 22, 64, 3);
  mPaint(10, 30, 22, 42, 4);
  mPaint(13, 33, 19, 39, 12);
  mPaint(38, 47, 41, 49, 1);
  mPaint(37, 48, 37, 48, 22); // Bramble shortcut
  mPaint(26, 39, 32, 45, 8);
  mPaint(28, 41, 30, 43, 4);
  mPaint(25, 42, 27, 42, 23); // Mystic rune bridge
  mPaint(53, 60, 55, 78, 3);
  mPaint(53, 76, 68, 78, 3);
  mPaint(65, 78, 67, 97, 9); // Extended Harbour Marina Pier!
  mPaint(68, 86, 94, 87, 9);
  mPaint(84, 27, 86, 31, 3);
  mPaint(84, 24, 102, 26, 10);
  mPaint(101, 14, 103, 25, 10);
  mPaint(96, 10, 108, 19, 12);
  mPaint(62, 15, 76, 17, 12);
  mPaint(35, 10, 37, 25, 12);
  mPaint(28, 5, 44, 16, 12);
  mPaint(66, 2, 67, 14, 14);
  mPaint(66, 18, 67, 37, 14);
  mPaint(2, 25, 42, 26, 14);
  mPaint(46, 25, 65, 26, 14);

  // 2. SIX SURROUNDING EXPLORABLE ISLANDS (Surrounded by shallow swimming reefs tile 7!)
  // ISLAND 1: THE FROZEN KINGDOM (NE: 184..228, 8..44)
  paintRect(184, 8, 228, 44, 7);
  paintRect(188, 11, 224, 37, 10);
  paintRect(194, 24, 200, 32, 11); // Frozen Fjord lake
  paintRect(200, 12, 212, 24, 12); // Glacier Spire Arena
  paintRect(203, 24, 205, 38, 9); // Frosthaven Harbour Pier

  // ISLAND 2: THE WILD JUNGLE (SW: 10..52, 124..168)
  paintRect(10, 124, 52, 168, 7);
  paintRect(14, 128, 44, 160, 6);
  paintRect(16, 130, 41, 158, 28); // Lush Jungle floor
  paintRect(18, 132, 26, 142, 12); // Waterfall Temple Arena
  paintRect(27, 140, 38, 148, 3); // Jungle trail
  paintRect(35, 145, 47, 147, 9); // Canopy Landing Pier

  // ISLAND 3: THE VOLCANIC ISLAND (E: 186..228, 84..128)
  paintRect(186, 84, 228, 128, 7);
  paintRect(190, 88, 222, 120, 29); // Basalt rock
  paintRect(194, 98, 218, 100, 30); // Magma lava stream
  paintRect(207, 98, 209, 101, 9); // Basalt bridge across magma
  paintRect(202, 90, 214, 98, 29); // Caldera Arena
  paintRect(188, 111, 196, 113, 9); // Emberforge Pier

  // ISLAND 4: THE SKY ISLAND (N: 98..138, 4..34)
  paintRect(98, 4, 138, 34, 36); // Cloud border
  paintRect(104, 8, 132, 28, 31); // Sky Marble
  paintRect(112, 8, 124, 18, 12); // Cloudspire Arena
  paintRect(117, 26, 119, 32, 9); // Mooring Pier

  // ISLAND 5: THE HAUNTED ISLAND (W: 8..48, 66..106)
  paintRect(8, 66, 48, 106, 7);
  paintRect(12, 70, 42, 98, 32); // Mistvale Moss
  paintRect(17, 70, 27, 80, 12); // Castle Courtyard Arena
  paintRect(24, 80, 36, 94, 3);
  paintRect(36, 93, 46, 95, 9); // Mistvale Dock Pier

  // ISLAND 6: THE LOST KINGDOM (NW: 12..54, 6..42)
  paintRect(12, 6, 54, 42, 7);
  paintRect(16, 10, 48, 36, 13); // Obsidian Capital
  paintRect(22, 12, 34, 22, 12); // Eclipse Sanctum Arena
  paintRect(28, 22, 36, 35, 12); // Marble boulevard
  paintRect(33, 34, 35, 39, 9); // Sunken Capital Harbour Pier

  // Ocean Treasure Sandbar Islets
  paintRect(50, 110, 54, 114, 6);
  paintRect(172, 68, 176, 72, 6);

  return g;
}

export function buildInteriorGrid(def: InteriorDef): number[][] {
  const g: number[][] = Array.from({ length: def.height }, (_, y) =>
    Array.from({ length: def.width }, (__, x) => {
      if (y === 0 || y === def.height - 1 || x === 0 || x === def.width - 1) return 19;
      return def.floorTile;
    })
  );
  g[def.exitY][def.exitX] = 20;
  return g;
}

export function buildWorldProps(save: SaveData): WorldProp[] {
  const props: WorldProp[] = [
    {
      id: 'prop_fountain',
      tileX: OX + 54,
      tileY: OY + 57,
      texture: 'prop_fountain_dry',
      restoredTexture: 'prop_fountain_live',
      restorationKey: 'rest_brightfall_garden',
      solid: true,
    },
    { id: 'prop_noticeboard', tileX: OX + 57, tileY: OY + 54, texture: 'prop_noticeboard', solid: true },
    { id: 'prop_cave_woods', tileX: OX + 11, tileY: OY + 56, texture: 'prop_cave_arch', solid: true },
    { id: 'prop_cave_coral', tileX: OX + 81, tileY: OY + 86, texture: 'prop_cave_arch', solid: true },
    { id: 'prop_cave_frozen', tileX: 200, tileY: 26, texture: 'prop_cave_arch', solid: true },
    // Sports Park Props
    { id: 'prop_goal', tileX: OX + 65, tileY: OY + 64, texture: 'prop_goalpost', solid: false },
    { id: 'prop_hoop', tileX: OX + 70, tileY: OY + 66, texture: 'prop_hoop', solid: true },
  ];

  // Brightfall Lanterns
  const lanternCoords = [
    [46, 52], [46, 59], [62, 52], [62, 59], [51, 51], [57, 51], [51, 60], [57, 60], [40, 54],
  ];
  lanternCoords.forEach(([lx, ly], i) => {
    props.push({
      id: `lantern_${i}`,
      tileX: OX + lx,
      tileY: OY + ly,
      texture: 'prop_lantern_off',
      restoredTexture: 'prop_lantern_on',
      restorationKey: 'rest_brightfall_cafe',
      solid: true,
    });
  });

  // Mainland Trees
  const oakTrees = [
    [39, 44], [39, 65], [68, 49], [44, 68], [60, 68],
  ];
  oakTrees.forEach(([tx, ty], i) =>
    props.push({ id: `oak_${i}`, tileX: OX + tx, tileY: OY + ty, texture: 'prop_tree_oak', solid: true })
  );

  const pineTrees = [
    [8, 34], [6, 42], [26, 34], [30, 50], [10, 50], [27, 66], [16, 68], [8, 62], [32, 34],
  ];
  pineTrees.forEach(([tx, ty], i) =>
    props.push({ id: `pine_${i}`, tileX: OX + tx, tileY: OY + ty, texture: 'prop_tree_pine', solid: true })
  );

  const palmTrees = [
    [50, 77], [60, 76], [72, 77], [82, 82], [90, 90], [45, 81],
    [18, 152 - OY], [36, 156 - OY], [40, 134 - OY],
  ];
  palmTrees.forEach(([tx, ty], i) =>
    props.push({ id: `palm_${i}`, tileX: OX + tx, tileY: OY + ty, texture: 'prop_tree_palm', solid: true })
  );

  const snowTrees = [
    [72, 18], [76, 34], [90, 34], [95, 29], [108, 22], [92, 10], [74, 8],
  ];
  snowTrees.forEach(([tx, ty], i) =>
    props.push({ id: `snow_${i}`, tileX: OX + tx, tileY: OY + ty, texture: 'prop_tree_snow', solid: true })
  );

  // Island Trees
  [[192, 16], [218, 18], [216, 32], [192, 34]].forEach(([x, y], i) =>
    props.push({ id: `ifroz_t_${i}`, tileX: x, tileY: y, texture: 'prop_tree_snow', solid: true })
  );
  [[18, 150], [34, 154], [38, 134]].forEach(([x, y], i) =>
    props.push({ id: `ijung_t_${i}`, tileX: x, tileY: y, texture: 'prop_tree_palm', solid: true })
  );
  [[16, 84], [18, 94], [36, 76], [38, 86]].forEach(([x, y], i) =>
    props.push({ id: `ihaunt_t_${i}`, tileX: x, tileY: y, texture: 'prop_tree_haunted', solid: true })
  );

  void save;
  return props;
}

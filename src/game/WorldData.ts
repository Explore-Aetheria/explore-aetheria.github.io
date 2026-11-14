import { MAIN_OFFSET_X as OX, MAIN_OFFSET_Y as OY } from '../data/progression';
import { GuardianId, MiniGameId, MonsterSpeciesId, RegionId, SaveData } from '../types/game';

export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 270;

// Tiles that block walking on foot (8: Deep Ocean navigable by Boat, 46: Void Chasm solid)
export const SOLID_TILES = new Set([8, 14, 15, 19, 24, 30, 36, 46]);

export const MOVING_ISLAND_SLOTS: { x: number; y: number; name: string }[] = [
  { x: 104, y: 214, name: 'Southwest Current (Between Brightfall & Jungle)' },
  { x: 252, y: 222, name: 'Southeast Atoll Drift (South of Volcanic Island)' },
  { x: 246, y: 56, name: 'Northeast Eddy (Between Sky & Frozen Kingdom)' },
  { x: 102, y: 82, name: 'Northwest Tide (Near Lost Kingdom)' },
];

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
  requiresVillageBuilding?: string;
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
    | 'smithy'
    | 'village_board'
    | 'skyport_deck'
    | 'zone_portal'
    | 'events_board'
    | 'mailbox';
  miniGameId?: MiniGameId;
  guardianId?: GuardianId;
  landmarkId?: string;
  secretId?: string;
  puzzleId?: string;
  targetZoneId?: string;
  sparks?: number;
  message?: string;
}

export interface EnemySpawn {
  id: string;
  tileX: number;
  tileY: number;
  interiorId?: string;
  region: RegionId;
  speciesId: MonsterSpeciesId;
  kind: 'bramble' | 'crab' | 'wisp' | 'echo';
  texture: string;
  hp: number;
  speed: number;
  nocturnalOnly?: boolean;
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
  isLargeZone?: boolean;
}

export const INTERIORS: Record<string, InteriorDef> = {
  int_player_house: {
    id: 'int_player_house',
    name: 'Your Brightfall Residence',
    width: 22,
    height: 16,
    spawnX: 11,
    spawnY: 13,
    exitX: 11,
    exitY: 14,
    returnWorldX: OX + 36,
    returnWorldY: OY + 56,
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
    returnWorldX: OX + 49,
    returnWorldY: OY + 46,
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
    returnWorldX: OX + 58,
    returnWorldY: OY + 46,
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
    returnWorldY: OY + 46,
    floorTile: 18,
    region: 'brightfall',
  },
  int_hospital: {
    id: 'int_hospital',
    name: 'Brightfall Central Hospital',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 39,
    returnWorldY: OY + 41,
    floorTile: 17,
    region: 'brightfall',
  },
  int_library: {
    id: 'int_library',
    name: 'Brightfall Grand Library',
    width: 20,
    height: 14,
    spawnX: 10,
    spawnY: 11,
    exitX: 10,
    exitY: 12,
    returnWorldX: OX + 48,
    returnWorldY: OY + 41,
    floorTile: 16,
    region: 'brightfall',
  },
  int_arcade: {
    id: 'int_arcade',
    name: 'Starlight Cinema & Arcade',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 76,
    returnWorldY: OY + 46,
    floorTile: 39,
    region: 'brightfall',
  },
  int_tackle_shop: {
    id: 'int_tackle_shop',
    name: 'Grand Marina Tackle Shop',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 69,
    returnWorldY: OY + 85,
    floorTile: 16,
    region: 'sunset_coast',
  },
  int_restoration_hall: {
    id: 'int_restoration_hall',
    name: 'Brightfall Restoration Hall',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 56,
    returnWorldY: OY + 51,
    floorTile: 16,
    region: 'brightfall',
  },
  int_atelier: {
    id: 'int_atelier',
    name: 'Brightfall Tailor Atelier',
    width: 16,
    height: 12,
    spawnX: 8,
    spawnY: 9,
    exitX: 8,
    exitY: 10,
    returnWorldX: OX + 65,
    returnWorldY: OY + 51,
    floorTile: 17,
    region: 'brightfall',
  },
  int_training_hall: {
    id: 'int_training_hall',
    name: 'Aether Athletics & Archery Hall',
    width: 20,
    height: 14,
    spawnX: 10,
    spawnY: 11,
    exitX: 10,
    exitY: 12,
    returnWorldX: OX + 74,
    returnWorldY: OY + 56,
    floorTile: 18,
    region: 'brightfall',
  },
  int_cafe: {
    id: 'int_cafe',
    name: 'Hearth & Crumb Bakery Café',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 44,
    returnWorldY: OY + 52,
    floorTile: 16,
    region: 'brightfall',
  },
  int_mall: {
    id: 'int_mall',
    name: 'Brightfall Grand Shopping Mall',
    width: 22,
    height: 15,
    spawnX: 11,
    spawnY: 12,
    exitX: 11,
    exitY: 13,
    returnWorldX: OX + 72,
    returnWorldY: OY + 52,
    floorTile: 52,
    region: 'brightfall',
  },
  int_station: {
    id: 'int_station',
    name: 'Brightfall Central Rail Concourse',
    width: 20,
    height: 13,
    spawnX: 10,
    spawnY: 10,
    exitX: 10,
    exitY: 11,
    returnWorldX: OX + 64,
    returnWorldY: OY + 38,
    floorTile: 52,
    region: 'brightfall',
  },
  int_civic_station: {
    id: 'int_civic_station',
    name: 'Brightfall Civic Guard & Fire Command',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 37,
    returnWorldY: OY + 46,
    floorTile: 18,
    region: 'brightfall',
  },
  int_woods_lodge: {
    id: 'int_woods_lodge',
    name: 'Mossbrook Ranger Cabin',
    width: 16,
    height: 12,
    spawnX: 8,
    spawnY: 9,
    exitX: 8,
    exitY: 10,
    returnWorldX: OX + 20,
    returnWorldY: OY + 62,
    floorTile: 16,
    region: 'whispering_woods',
  },
  int_frost_lodge: {
    id: 'int_frost_lodge',
    name: 'Hearthstone Alpine Lodge',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: OX + 89,
    returnWorldY: OY + 31,
    floorTile: 16,
    region: 'frostpeak',
  },
  int_frozen_hall: {
    id: 'int_frozen_hall',
    name: 'Frosthaven Mead & Expedition Hall',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: 284,
    returnWorldY: 59,
    floorTile: 16,
    region: 'frozen_kingdom',
  },
  int_jungle_outpost: {
    id: 'int_jungle_outpost',
    name: 'Canopy Ranger Stilt Outpost',
    width: 16,
    height: 12,
    spawnX: 8,
    spawnY: 9,
    exitX: 8,
    exitY: 10,
    returnWorldX: 71,
    returnWorldY: 224,
    floorTile: 16,
    region: 'wild_jungle',
  },
  int_volcanic_hall: {
    id: 'int_volcanic_hall',
    name: 'Emberforge Smelting Hall',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: 283,
    returnWorldY: 151,
    floorTile: 18,
    region: 'volcanic_island',
  },
  int_sky_pavilion: {
    id: 'int_sky_pavilion',
    name: 'Cloudspire Celestial Pavilion',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: 180,
    returnWorldY: 49,
    floorTile: 31,
    region: 'sky_island',
  },
  int_haunted_manor: {
    id: 'int_haunted_manor',
    name: 'Mistvale Manor Study & Hall',
    width: 18,
    height: 13,
    spawnX: 9,
    spawnY: 10,
    exitX: 9,
    exitY: 11,
    returnWorldX: 38,
    returnWorldY: 147,
    floorTile: 16,
    region: 'haunted_island',
  },
  int_lost_archive: {
    id: 'int_lost_archive',
    name: 'Lost Capital Grand Archive',
    width: 20,
    height: 14,
    spawnX: 10,
    spawnY: 11,
    exitX: 10,
    exitY: 12,
    returnWorldX: 46,
    returnWorldY: 43,
    floorTile: 52,
    region: 'lost_kingdom',
  },
  // UNDERGROUND CIVILISATION
  int_underground_city: {
    id: 'int_underground_city',
    name: 'Subterranea · Lumina Depths',
    width: 34,
    height: 24,
    spawnX: 17,
    spawnY: 20,
    exitX: 17,
    exitY: 22,
    returnWorldX: OX + 46,
    returnWorldY: OY + 38,
    floorTile: 40,
    region: 'underground',
    isLargeZone: true,
  },
  int_ancient_lab: {
    id: 'int_ancient_lab',
    name: 'Subterranea Ancient Clockwork Lab',
    width: 24,
    height: 18,
    spawnX: 12,
    spawnY: 15,
    exitX: 12,
    exitY: 16,
    returnWorldX: OX + 46,
    returnWorldY: OY + 38,
    floorTile: 18,
    region: 'underground',
    isLargeZone: true,
  },
  // 6 ISLAND DUNGEONS
  int_dungeon_frozen: {
    id: 'int_dungeon_frozen',
    name: 'Frozen Spire Vault Dungeon',
    width: 28,
    height: 20,
    spawnX: 14,
    spawnY: 17,
    exitX: 14,
    exitY: 18,
    returnWorldX: 312,
    returnWorldY: 34,
    floorTile: 11,
    region: 'frozen_kingdom',
    isLargeZone: true,
  },
  int_dungeon_jungle: {
    id: 'int_dungeon_jungle',
    name: 'Waterfall Temple Dungeon',
    width: 28,
    height: 20,
    spawnX: 14,
    spawnY: 17,
    exitX: 14,
    exitY: 18,
    returnWorldX: 34,
    returnWorldY: 224,
    floorTile: 12,
    region: 'wild_jungle',
    isLargeZone: true,
  },
  int_dungeon_volcanic: {
    id: 'int_dungeon_volcanic',
    name: 'Caldera Magma Mine Dungeon',
    width: 28,
    height: 20,
    spawnX: 14,
    spawnY: 17,
    exitX: 14,
    exitY: 18,
    returnWorldX: 314,
    returnWorldY: 136,
    floorTile: 29,
    region: 'volcanic_island',
    isLargeZone: true,
  },
  int_dungeon_sky: {
    id: 'int_dungeon_sky',
    name: 'Sky Temple Sanctum Dungeon',
    width: 28,
    height: 20,
    spawnX: 14,
    spawnY: 17,
    exitX: 14,
    exitY: 18,
    returnWorldX: 180,
    returnWorldY: 30,
    floorTile: 31,
    region: 'sky_island',
    isLargeZone: true,
  },
  int_dungeon_haunted: {
    id: 'int_dungeon_haunted',
    name: 'Mistvale Castle Crypt Dungeon',
    width: 28,
    height: 20,
    spawnX: 14,
    spawnY: 17,
    exitX: 14,
    exitY: 18,
    returnWorldX: 24,
    returnWorldY: 132,
    floorTile: 13,
    region: 'haunted_island',
    isLargeZone: true,
  },
  int_dungeon_lost: {
    id: 'int_dungeon_lost',
    name: 'Eclipse Sanctum Labyrinth',
    width: 30,
    height: 22,
    spawnX: 15,
    spawnY: 19,
    exitX: 15,
    exitY: 20,
    returnWorldX: 36,
    returnWorldY: 34,
    floorTile: 13,
    region: 'lost_kingdom',
    isLargeZone: true,
  },
  // 3 ALTERNATE DIMENSIONS
  dim_mirror: {
    id: 'dim_mirror',
    name: 'Mirror Brightfall (Starlight Dimension)',
    width: 32,
    height: 22,
    spawnX: 16,
    spawnY: 19,
    exitX: 16,
    exitY: 20,
    returnWorldX: OX + 32,
    returnWorldY: OY + 42,
    floorTile: 44,
    region: 'dim_mirror',
    isLargeZone: true,
  },
  dim_verdant: {
    id: 'dim_verdant',
    name: 'Primordial Aether (Pre-Fall Dimension)',
    width: 32,
    height: 22,
    spawnX: 16,
    spawnY: 19,
    exitX: 16,
    exitY: 20,
    returnWorldX: OX + 32,
    returnWorldY: OY + 42,
    floorTile: 45,
    region: 'dim_verdant',
    isLargeZone: true,
  },
  dim_void: {
    id: 'dim_void',
    name: 'Shattered Rift Citadel (Void Dimension)',
    width: 34,
    height: 24,
    spawnX: 17,
    spawnY: 21,
    exitX: 17,
    exitY: 22,
    returnWorldX: OX + 32,
    returnWorldY: OY + 42,
    floorTile: 47,
    region: 'dim_void',
    isLargeZone: true,
  },
};

export const WORLD_BUILDINGS: WorldBuilding[] = [
  // Brightfall Metropolis Core
  { id: 'bldg_player_house', tileX: OX + 35, tileY: OY + 53, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_player_house', textureRestored: 'bldg_player_house', doorTileX: OX + 36, doorTileY: OY + 55, targetInteriorId: 'int_player_house', label: 'Your Homestead' },
  { id: 'bldg_hospital', tileX: OX + 38, tileY: OY + 38, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_hospital', textureRestored: 'bldg_hospital', doorTileX: OX + 39, doorTileY: OY + 40, targetInteriorId: 'int_hospital', label: 'Brightfall Central Hospital' },
  { id: 'bldg_library', tileX: OX + 46, tileY: OY + 38, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_library', textureRestored: 'bldg_library', doorTileX: OX + 48, doorTileY: OY + 40, targetInteriorId: 'int_library', label: 'Brightfall Grand Library' },
  { id: 'bldg_police', tileX: OX + 36, tileY: OY + 43, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_police', textureRestored: 'bldg_police', doorTileX: OX + 37, doorTileY: OY + 45, targetInteriorId: 'int_civic_station', label: 'Brightfall Civic & Fire Command' },
  { id: 'bldg_firestation', tileX: OX + 41, tileY: OY + 43, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_firestation', textureRestored: 'bldg_firestation', doorTileX: OX + 42, doorTileY: OY + 45, targetInteriorId: 'int_civic_station', label: 'Brightfall Fire Brigade' },
  { id: 'bldg_station', tileX: OX + 62, tileY: OY + 35, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_station', textureRestored: 'bldg_station', doorTileX: OX + 64, doorTileY: OY + 37, targetInteriorId: 'int_station', label: 'Brightfall Central Station' },
  { id: 'bldg_skyport', tileX: OX + 74, tileY: OY + 35, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_skyport', textureRestored: 'bldg_skyport', label: 'Brightfall Grand Skyport' },

  { id: 'bldg_supermarket', tileX: OX + 47, tileY: OY + 43, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_supermarket', textureRestored: 'bldg_supermarket', doorTileX: OX + 49, doorTileY: OY + 45, targetInteriorId: 'int_supermarket', label: 'Aetheria Fresh Mart' },
  { id: 'bldg_restaurant', tileX: OX + 56, tileY: OY + 43, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_restaurant', textureRestored: 'bldg_restaurant', doorTileX: OX + 58, doorTileY: OY + 45, targetInteriorId: 'int_restaurant', label: 'The Golden Skillet Bistro' },
  { id: 'bldg_smithy', tileX: OX + 66, tileY: OY + 43, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_smithy', textureRestored: 'bldg_smithy', doorTileX: OX + 67, doorTileY: OY + 45, targetInteriorId: 'int_smithy', label: 'Anvil & Spark Armory' },
  { id: 'bldg_cinema', tileX: OX + 74, tileY: OY + 43, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_cinema', textureRestored: 'bldg_cinema', doorTileX: OX + 76, doorTileY: OY + 45, targetInteriorId: 'int_arcade', label: 'Starlight Cinema & Arcade' },

  { id: 'bldg_cafe', tileX: OX + 42, tileY: OY + 49, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_cafe_damaged', textureRestored: 'bldg_cafe_restored', restorationKey: 'rest_brightfall_cafe', doorTileX: OX + 44, doorTileY: OY + 51, targetInteriorId: 'int_cafe', label: 'Hearth & Crumb Café' },
  { id: 'bldg_restoration_hall', tileX: OX + 54, tileY: OY + 48, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_restoration_hall', textureRestored: 'bldg_restoration_hall', doorTileX: OX + 56, doorTileY: OY + 50, targetInteriorId: 'int_restoration_hall', label: 'Restoration Hall' },
  { id: 'bldg_atelier', tileX: OX + 64, tileY: OY + 48, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_atelier', textureRestored: 'bldg_atelier', doorTileX: OX + 65, doorTileY: OY + 50, targetInteriorId: 'int_atelier', label: 'Atelier Boutique' },
  { id: 'bldg_mall', tileX: OX + 70, tileY: OY + 49, widthTiles: 5, heightTiles: 3, textureDamaged: 'bldg_market_damaged', textureRestored: 'bldg_mall', restorationKey: 'rest_brightfall_market', doorTileX: OX + 72, doorTileY: OY + 51, targetInteriorId: 'int_mall', label: 'Brightfall Grand Shopping Mall' },

  { id: 'bldg_market', tileX: OX + 60, tileY: OY + 54, widthTiles: 4, heightTiles: 2, textureDamaged: 'bldg_market_damaged', textureRestored: 'bldg_market_restored', restorationKey: 'rest_brightfall_market', label: 'Brightfall Promenade Market' },
  { id: 'bldg_training', tileX: OX + 72, tileY: OY + 53, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_training', textureRestored: 'bldg_training', doorTileX: OX + 74, doorTileY: OY + 55, targetInteriorId: 'int_training_hall', label: 'Aether Athletics & Archery Hall' },

  // Residential Cottages & Neighborhoods (enterable cozy Homestead-style neighborhood or guest quarters)
  { id: 'bldg_town_cottage_1', tileX: OX + 36, tileY: OY + 49, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_damaged', textureRestored: 'bldg_cottage_restored', restorationKey: 'rest_brightfall_homes', label: 'Maple Row Residences' },
  { id: 'bldg_town_cottage_2', tileX: OX + 40, tileY: OY + 60, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_damaged', textureRestored: 'bldg_cottage_restored', restorationKey: 'rest_brightfall_homes', label: 'Elm Park Brownstone' },
  { id: 'bldg_town_cottage_3', tileX: OX + 45, tileY: OY + 60, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_damaged', textureRestored: 'bldg_cottage_restored', restorationKey: 'rest_brightfall_homes', label: 'Cedar Lane Apartments' },
  { id: 'bldg_town_cottage_4', tileX: OX + 35, tileY: OY + 60, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_damaged', textureRestored: 'bldg_cottage_restored', restorationKey: 'rest_brightfall_homes', label: 'Parkview Flat' },

  // Sunset Coast & Tackle Shop
  { id: 'bldg_tackle', tileX: OX + 68, tileY: OY + 82, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_tackle', textureRestored: 'bldg_tackle', doorTileX: OX + 69, doorTileY: OY + 84, targetInteriorId: 'int_tackle_shop', label: 'Marina Tackle Outfitter' },
  { id: 'bldg_lighthouse', tileX: OX + 76, tileY: OY + 84, widthTiles: 2, heightTiles: 4, textureDamaged: 'bldg_lighthouse_damaged', textureRestored: 'bldg_lighthouse_restored', restorationKey: 'rest_coast_lighthouse', label: 'Sunset Lighthouse' },

  // Mainland Outer Settlements (Now Enterable!)
  { id: 'bldg_woods_cottage', tileX: OX + 19, tileY: OY + 59, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_restored', textureRestored: 'bldg_cottage_restored', doorTileX: OX + 20, doorTileY: OY + 61, targetInteriorId: 'int_woods_lodge', label: 'Mossbrook Ranger Cabin' },
  { id: 'bldg_frost_lodge', tileX: OX + 87, tileY: OY + 28, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_lodge', textureRestored: 'bldg_lodge', doorTileX: OX + 89, doorTileY: OY + 30, targetInteriorId: 'int_frost_lodge', label: 'Hearthstone Alpine Lodge' },

  // NEWBROOK PLAYER-BUILT VILLAGE (Dynamically unlocked)
  { id: 'nb_bldg_house_1', tileX: OX + 22, tileY: OY + 21, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_restored', textureRestored: 'bldg_cottage_restored', label: 'Newbrook Timber Cottage', requiresVillageBuilding: 'house_1' },
  { id: 'nb_bldg_bakery', tileX: OX + 29, tileY: OY + 21, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_cafe_restored', textureRestored: 'bldg_cafe_restored', label: 'Newbrook Bakery & Café', requiresVillageBuilding: 'bakery' },
  { id: 'nb_bldg_workshop', tileX: OX + 21, tileY: OY + 26, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_smithy', textureRestored: 'bldg_smithy', label: 'Newbrook Artisan Workshop', requiresVillageBuilding: 'workshop' },
  { id: 'nb_bldg_town_hall', tileX: OX + 25, tileY: OY + 19, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_town_hall', textureRestored: 'bldg_town_hall', label: 'Newbrook Village Hall', requiresVillageBuilding: 'town_hall' },
  { id: 'nb_bldg_house_2', tileX: OX + 31, tileY: OY + 26, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_cottage_restored', textureRestored: 'bldg_cottage_restored', label: 'Newbrook Lakeside Villa', requiresVillageBuilding: 'house_2' },
  { id: 'nb_bldg_observatory', tileX: OX + 25, tileY: OY + 28, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_sky_pavilion', textureRestored: 'bldg_sky_pavilion', label: 'Newbrook Sky Observatory', requiresVillageBuilding: 'observatory' },

  // 6 MASSIVE ISLANDS: DISTINCT ARCHITECTURAL SETTLEMENTS + DUNGEON GATES
  { id: 'bldg_frozen_village', tileX: 282, tileY: 56, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_lodge', textureRestored: 'bldg_lodge', doorTileX: 284, doorTileY: 58, targetInteriorId: 'int_frozen_hall', label: 'Frosthaven Hall' },
  { id: 'bldg_frozen_dungeon', tileX: 311, tileY: 31, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 312, doorTileY: 33, targetInteriorId: 'int_dungeon_frozen', label: 'Frozen Spire Dungeon' },

  { id: 'bldg_jungle_camp', tileX: 70, tileY: 221, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_jungle_hut', textureRestored: 'bldg_jungle_hut', doorTileX: 71, doorTileY: 223, targetInteriorId: 'int_jungle_outpost', label: 'Canopy Ranger Stilt Outpost' },
  { id: 'bldg_jungle_treehouse', tileX: 52, tileY: 234, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_jungle_hut', textureRestored: 'bldg_jungle_hut', label: 'Treehouse Outpost' },
  { id: 'bldg_jungle_dungeon', tileX: 33, tileY: 221, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 34, doorTileY: 223, targetInteriorId: 'int_dungeon_jungle', label: 'Waterfall Temple Dungeon' },

  { id: 'bldg_volcanic_forge', tileX: 282, tileY: 148, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_volcanic_forge', textureRestored: 'bldg_volcanic_forge', doorTileX: 283, doorTileY: 150, targetInteriorId: 'int_volcanic_hall', label: 'Emberforge Smelting Hall' },
  { id: 'bldg_volcanic_dungeon', tileX: 313, tileY: 133, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 314, doorTileY: 135, targetInteriorId: 'int_dungeon_volcanic', label: 'Caldera Magma Dungeon' },

  { id: 'bldg_sky_pavilion', tileX: 178, tileY: 46, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_sky_pavilion', textureRestored: 'bldg_sky_pavilion', doorTileX: 180, doorTileY: 48, targetInteriorId: 'int_sky_pavilion', label: 'Cloudspire Pavilion' },
  { id: 'bldg_sky_dungeon', tileX: 179, tileY: 27, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 180, doorTileY: 29, targetInteriorId: 'int_dungeon_sky', label: 'Sky Temple Dungeon' },

  { id: 'bldg_haunted_manor', tileX: 36, tileY: 144, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_haunted_manor', textureRestored: 'bldg_haunted_manor', doorTileX: 38, doorTileY: 146, targetInteriorId: 'int_haunted_manor', label: 'Mistvale Manor Hall' },
  { id: 'bldg_haunted_dungeon', tileX: 23, tileY: 129, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 24, doorTileY: 131, targetInteriorId: 'int_dungeon_haunted', label: 'Mistvale Castle Dungeon' },

  { id: 'bldg_lost_archive', tileX: 44, tileY: 40, widthTiles: 4, heightTiles: 3, textureDamaged: 'bldg_lost_temple', textureRestored: 'bldg_lost_temple', restorationKey: 'rest_lost_capital', doorTileX: 46, doorTileY: 42, targetInteriorId: 'int_lost_archive', label: 'Lost Capital Archive' },
  { id: 'bldg_lost_dungeon', tileX: 35, tileY: 31, widthTiles: 3, heightTiles: 3, textureDamaged: 'bldg_dungeon_gate', textureRestored: 'bldg_dungeon_gate', doorTileX: 36, doorTileY: 33, targetInteriorId: 'int_dungeon_lost', label: 'Eclipse Sanctum Dungeon' },
];

export const WORLD_CHESTS: WorldChest[] = [
  { id: 'chest_brightfall_1', tileX: OX + 43, tileY: OY + 67, sparks: 25, items: [{ id: 'brass_gear', quantity: 1 }, { id: 'sun_berry', quantity: 2 }] },
  { id: 'chest_park_hidden', tileX: OX + 77, tileY: OY + 41, sparks: 30, items: [{ id: 'aether_shard', quantity: 1 }, { id: 'food_cheese', quantity: 1 }] },
  { id: 'chest_woods_1', tileX: OX + 14, tileY: OY + 72, sparks: 35, items: [{ id: 'aether_shard', quantity: 2 }] },
  { id: 'chest_woods_mystic', tileX: OX + 11, tileY: OY + 46, sparks: 45, items: [{ id: 'decor_sun_bonsai', quantity: 1 }, { id: 'forest_fern', quantity: 2 }], requiresMystic: true },
  { id: 'chest_coast_cove', tileX: OX + 88, tileY: OY + 91, sparks: 40, items: [{ id: 'tidal_pearl', quantity: 2 }] },
  { id: 'chest_frost_ridge', tileX: OX + 77, tileY: OY + 14, sparks: 50, items: [{ id: 'hearth_lantern', quantity: 1 }, { id: 'frost_crystal', quantity: 2 }] },
  { id: 'chest_kingdom_vault', tileX: OX + 22, tileY: OY + 12, sparks: 70, items: [{ id: 'dawn_tablet', quantity: 2 }, { id: 'aether_shard', quantity: 2 }] },
  { id: 'chest_training', tileX: 16, tileY: 5, interiorId: 'int_training_hall', sparks: 25, items: [{ id: 'brass_gear', quantity: 1 }] },
  { id: 'chest_amusement', tileX: OX + 102, tileY: OY + 60, sparks: 55, items: [{ id: 'decor_holiday_tree', quantity: 1 }, { id: 'drink_cocoa', quantity: 2 }] },
  { id: 'chest_underground_1', tileX: 6, tileY: 6, interiorId: 'int_underground_city', sparks: 60, items: [{ id: 'lumina_gem', quantity: 2 }] },
  { id: 'chest_ancient_lab', tileX: 12, tileY: 4, interiorId: 'int_ancient_lab', sparks: 85, items: [{ id: 'brass_gear', quantity: 2 }, { id: 'moving_logbook', quantity: 1 }] },
  // 6 Island & Dungeon Chests
  { id: 'chest_frozen_isle', tileX: 295, tileY: 44, sparks: 60, items: [{ id: 'frost_crystal', quantity: 3 }, { id: 'moving_logbook', quantity: 1 }] },
  { id: 'chest_dungeon_frozen', tileX: 14, tileY: 5, interiorId: 'int_dungeon_frozen', sparks: 90, items: [{ id: 'aether_shard', quantity: 2 }, { id: 'frost_crystal', quantity: 2 }] },
  { id: 'chest_jungle_isle', tileX: 46, tileY: 242, sparks: 65, items: [{ id: 'jungle_orchid', quantity: 3 }] },
  { id: 'chest_dungeon_jungle', tileX: 14, tileY: 5, interiorId: 'int_dungeon_jungle', sparks: 95, items: [{ id: 'aether_shard', quantity: 2 }, { id: 'jungle_orchid', quantity: 2 }] },
  { id: 'chest_volcanic_isle', tileX: 325, tileY: 160, sparks: 75, items: [{ id: 'volcanic_ore', quantity: 3 }] },
  { id: 'chest_dungeon_volcanic', tileX: 14, tileY: 5, interiorId: 'int_dungeon_volcanic', sparks: 100, items: [{ id: 'volcanic_ore', quantity: 2 }, { id: 'brass_gear', quantity: 2 }] },
  { id: 'chest_sky_isle', tileX: 164, tileY: 36, sparks: 85, items: [{ id: 'sky_crystal', quantity: 3 }] },
  { id: 'chest_dungeon_sky', tileX: 14, tileY: 5, interiorId: 'int_dungeon_sky', sparks: 105, items: [{ id: 'sky_crystal', quantity: 2 }, { id: 'dawn_tablet', quantity: 1 }] },
  { id: 'chest_haunted_isle', tileX: 46, tileY: 164, sparks: 90, items: [{ id: 'spirit_lantern', quantity: 2 }] },
  { id: 'chest_dungeon_haunted', tileX: 14, tileY: 5, interiorId: 'int_dungeon_haunted', sparks: 110, items: [{ id: 'spirit_lantern', quantity: 1 }, { id: 'tidal_pearl', quantity: 2 }] },
  { id: 'chest_lost_isle', tileX: 60, tileY: 34, sparks: 120, items: [{ id: 'dawn_tablet', quantity: 2 }, { id: 'aether_shard', quantity: 3 }] },
  { id: 'chest_dungeon_lost', tileX: 15, tileY: 5, interiorId: 'int_dungeon_lost', sparks: 140, items: [{ id: 'dawn_tablet', quantity: 2 }, { id: 'aether_shard', quantity: 2 }] },
  // Dimension Chests
  { id: 'chest_dim_verdant', tileX: 16, tileY: 6, interiorId: 'dim_verdant', sparks: 110, items: [{ id: 'sun_berry', quantity: 4 }, { id: 'moving_logbook', quantity: 1 }] },
];

export const WORLD_COLLECTIBLES: WorldCollectible[] = [
  { id: 'col_beans_1', tileX: OX + 47, tileY: OY + 64, texture: 'prop_collectible_crate', itemId: 'cafe_beans', quantity: 1 },
  { id: 'col_beans_2', tileX: OX + 66, tileY: OY + 51, texture: 'prop_collectible_crate', itemId: 'cafe_beans', quantity: 1 },
  { id: 'col_berry_1', tileX: OX + 40, tileY: OY + 58, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_berry_2', tileX: OX + 70, tileY: OY + 60, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_berry_3', tileX: OX + 33, tileY: OY + 66, texture: 'prop_collectible_berry', itemId: 'sun_berry', quantity: 1 },
  { id: 'col_fern_1', tileX: OX + 17, tileY: OY + 54, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_fern_2', tileX: OX + 12, tileY: OY + 62, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_fern_3', tileX: OX + 22, tileY: OY + 46, texture: 'prop_collectible_fern', itemId: 'forest_fern', quantity: 1 },
  { id: 'col_shard_1', tileX: OX + 28, tileY: OY + 32, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  { id: 'col_shard_2', tileX: OX + 74, tileY: OY + 22, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  { id: 'col_shard_3', tileX: OX + 88, tileY: OY + 78, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 1 },
  // 6 Island Collectibles & Interior Collectibles
  { id: 'col_frozen_1', tileX: 274, tileY: 44, texture: 'prop_collectible_shard', itemId: 'frost_crystal', quantity: 2 },
  { id: 'col_frozen_2', tileX: 300, tileY: 48, texture: 'prop_collectible_shard', itemId: 'aether_shard', quantity: 2 },
  { id: 'col_orchid_1', tileX: 48, tileY: 224, texture: 'prop_collectible_orchid', itemId: 'jungle_orchid', quantity: 2 },
  { id: 'col_orchid_2', tileX: 60, tileY: 214, texture: 'prop_collectible_orchid', itemId: 'forest_fern', quantity: 2 },
  { id: 'col_ore_1', tileX: 298, tileY: 162, texture: 'prop_collectible_ore', itemId: 'volcanic_ore', quantity: 2 },
  { id: 'col_ore_2', tileX: 308, tileY: 144, texture: 'prop_collectible_ore', itemId: 'volcanic_ore', quantity: 2 },
  { id: 'col_sky_1', tileX: 168, tileY: 46, texture: 'prop_collectible_shard', itemId: 'sky_crystal', quantity: 2 },
  { id: 'col_sky_2', tileX: 192, tileY: 46, texture: 'prop_collectible_shard', itemId: 'sky_crystal', quantity: 2 },
  { id: 'col_haunt_1', tileX: 48, tileY: 136, texture: 'prop_collectible_shard', itemId: 'spirit_lantern', quantity: 1 },
  { id: 'col_lost_1', tileX: 44, tileY: 56, texture: 'prop_collectible_shard', itemId: 'dawn_tablet', quantity: 2 },
  { id: 'col_lumina_1', tileX: 24, tileY: 10, interiorId: 'int_underground_city', texture: 'prop_collectible_shard', itemId: 'lumina_gem', quantity: 1 },
  { id: 'col_lumina_2', tileX: 8, tileY: 16, interiorId: 'int_underground_city', texture: 'prop_collectible_shard', itemId: 'lumina_gem', quantity: 1 },
  // Open Ocean Drifting Crates
  { id: 'col_ocean_crate_1', tileX: 120, tileY: 64, texture: 'prop_treasure_crate', itemId: 'ocean_doubloon', quantity: 1 },
  { id: 'col_ocean_crate_2', tileX: 244, tileY: 96, texture: 'prop_treasure_crate', itemId: 'ocean_doubloon', quantity: 1 },
  { id: 'col_ocean_crate_3', tileX: 140, tileY: 214, texture: 'prop_treasure_crate', itemId: 'moving_logbook', quantity: 1 },
];

export const WORLD_INTERACTABLES: WorldInteractable[] = [
  // Brightfall Noticeboard, Events & Shops + Interactive Interior Cabinets/Counters
  { id: 'act_noticeboard', tileX: OX + 56, tileY: OY + 56, kind: 'noticeboard', prompt: 'Read Brightfall City Noticeboard & Quests [E]' },
  { id: 'act_events_board', tileX: OX + 59, tileY: OY + 56, kind: 'events_board', prompt: 'Manage Brightfall City Festivals & Events [E]' },
  { id: 'act_supermarket_counter', tileX: 9, tileY: 4, interiorId: 'int_supermarket', kind: 'supermarket', prompt: 'Shop Fresh Mart Groceries [E]' },
  { id: 'act_restaurant_counter', tileX: 9, tileY: 4, interiorId: 'int_restaurant', kind: 'restaurant', prompt: 'Order Bistro Hot Meals [E]' },
  { id: 'act_smithy_anvil', tileX: 9, tileY: 4, interiorId: 'int_smithy', kind: 'smithy', prompt: 'Open Armory, Armor & Tackle Shop [E]' },
  { id: 'act_tackle_counter', tileX: 9, tileY: 4, interiorId: 'int_tackle_shop', kind: 'smithy', prompt: 'Upgrade Fishing Rod, Line, Bait & Hook [E]' },
  { id: 'act_cafe_counter', tileX: 9, tileY: 4, interiorId: 'int_cafe', kind: 'restaurant', prompt: 'Order Fresh Coffee, Pastries & Bistro Meals [E]' },
  { id: 'act_mall_kiosk', tileX: 11, tileY: 5, interiorId: 'int_mall', kind: 'noticeboard', prompt: 'Browse Mall & Noticeboard Deals [E]' },
  { id: 'act_mall_market', tileX: 6, tileY: 7, interiorId: 'int_mall', kind: 'supermarket', prompt: 'Shop Fresh Mart Mall Express [E]' },
  { id: 'act_mall_forge', tileX: 16, tileY: 7, interiorId: 'int_mall', kind: 'smithy', prompt: 'Browse Mall Armory & Gear Boutique [E]' },
  { id: 'act_hospital_bed', tileX: 5, tileY: 6, interiorId: 'int_hospital', kind: 'heal_camp', prompt: 'Rest on Medical Bed (Full Heal) [E]' },
  { id: 'act_library_lore', tileX: 10, tileY: 5, interiorId: 'int_library', kind: 'secret_lore', secretId: 'sec_library_chronicles', prompt: 'Read Chronicles of the First Dawn [E]', message: 'Chronicle Read: The six Guardians once harmonized Aetheria via the Dawn Sanctum!' },
  { id: 'act_station_board', tileX: 10, tileY: 4, interiorId: 'int_station', kind: 'shrine', landmarkId: 'lm_train_station', prompt: 'Inspect Express Rail Schedule & Fast Travel [E]' },
  { id: 'act_civic_board', tileX: 9, tileY: 4, interiorId: 'int_civic_station', kind: 'events_board', prompt: 'Check Brightfall City Safety & Festival Bulletin [E]' },
  { id: 'act_rest_hall_board', tileX: 9, tileY: 5, interiorId: 'int_restoration_hall', kind: 'noticeboard', prompt: 'Review Brightfall Restoration Blueprints [E]' },
  { id: 'act_arcade_cab_1', tileX: 5, tileY: 7, interiorId: 'int_arcade', kind: 'minigame', miniGameId: 'rhythm', prompt: 'Play Harmony Rhythm Arcade Cabinet [E]' },
  { id: 'act_arcade_cab_2', tileX: 9, tileY: 7, interiorId: 'int_arcade', kind: 'minigame', miniGameId: 'runememory', prompt: 'Play Rune Memory Arcade Cabinet [E]' },
  { id: 'act_arcade_cab_3', tileX: 13, tileY: 7, interiorId: 'int_arcade', kind: 'minigame', miniGameId: 'carnival', prompt: 'Play Starfall Midway Arcade Cabinet [E]' },
  { id: 'act_lodge_woods_hearth', tileX: 8, tileY: 4, interiorId: 'int_woods_lodge', kind: 'heal_camp', prompt: 'Warm Up by Mossbrook Hearth (Full Heal) [E]' },
  { id: 'act_lodge_frost_hearth', tileX: 9, tileY: 4, interiorId: 'int_frost_lodge', kind: 'heal_camp', prompt: 'Rest by Alpine Hearth (Full Heal) [E]' },
  { id: 'act_lodge_frozen_hearth', tileX: 9, tileY: 4, interiorId: 'int_frozen_hall', kind: 'heal_camp', prompt: 'Warm Up at Frosthaven Hall (Full Heal) [E]' },
  { id: 'act_lodge_jungle_hearth', tileX: 8, tileY: 4, interiorId: 'int_jungle_outpost', kind: 'heal_camp', prompt: 'Rest at Canopy Outpost Hammock (Full Heal) [E]' },
  { id: 'act_lodge_volcanic_anvil', tileX: 9, tileY: 4, interiorId: 'int_volcanic_hall', kind: 'smithy', prompt: 'Forge & Upgrade Gear at Emberforge Anvil [E]' },
  { id: 'act_lodge_sky_shrine', tileX: 9, tileY: 4, interiorId: 'int_sky_pavilion', kind: 'heal_camp', prompt: 'Breathe Cloudspire Breeze (Full Heal) [E]' },
  { id: 'act_manor_folio', tileX: 9, tileY: 5, interiorId: 'int_haunted_manor', kind: 'secret_lore', secretId: 'sec_mistvale_manor', prompt: 'Read Mistvale Manor Family Ledger [E]', message: 'Ledger Discovered: Duke Vesper built Mistvale’s lanterns to guide lost ships home!' },
  { id: 'act_lost_codex', tileX: 10, tileY: 5, interiorId: 'int_lost_archive', kind: 'secret_lore', secretId: 'sec_lost_codex', prompt: 'Inspect Golden Pre-Fall Codex [E]', message: 'Secret Uncovered: Aetherion tried to contain the Great Fall single-handedly!' },

  // Expanded House Interactables (inside 22x16 Residence)
  { id: 'act_house_bed', tileX: 5, tileY: 5, interiorId: 'int_player_house', kind: 'house_bed', prompt: 'Sleep in Bed (Heal & Advance Time) [E]' },
  { id: 'act_house_kitchen', tileX: 16, tileY: 5, interiorId: 'int_player_house', kind: 'house_kitchen', prompt: 'Cook Recipes on Kitchen Hearth [E]' },
  { id: 'act_house_customize', tileX: 11, tileY: 7, interiorId: 'int_player_house', kind: 'house_customize', prompt: 'Customize Rooms, Furniture & Invite Guests [E]' },
  { id: 'act_player_mailbox', tileX: OX + 38, tileY: OY + 56, kind: 'mailbox', prompt: 'Check Homestead Mailbox & Treasure Letters [E]' },

  // Underground & Alternate Dimension Portals + Skyport
  { id: 'act_underground_lift', tileX: OX + 46, tileY: OY + 36, kind: 'zone_portal', targetZoneId: 'int_underground_city', landmarkId: 'lm_underground_gate', prompt: 'Descend Lift into Subterranea (Underground City) [E]' },
  { id: 'act_ancient_lab_door', tileX: 28, tileY: 7, interiorId: 'int_underground_city', kind: 'zone_portal', targetZoneId: 'int_ancient_lab', prompt: 'Enter Ancient Clockwork Laboratory [E]' },
  { id: 'act_mirror_portal', tileX: OX + 32, tileY: OY + 40, kind: 'zone_portal', targetZoneId: 'dim_mirror', landmarkId: 'lm_rift_mirror', prompt: 'Enter Mirror Brightfall Dimension Portal [E]' },
  { id: 'act_portal_verdant', tileX: 6, tileY: 10, interiorId: 'dim_mirror', kind: 'zone_portal', targetZoneId: 'dim_verdant', prompt: 'Step into Primordial Aether (Pre-Fall Timeline) [E]' },
  { id: 'act_portal_void', tileX: 26, tileY: 10, interiorId: 'dim_mirror', kind: 'zone_portal', targetZoneId: 'dim_void', prompt: 'Enter Shattered Rift Citadel Dimension [E]' },
  { id: 'act_skyport_deck', tileX: OX + 76, tileY: OY + 38, kind: 'skyport_deck', landmarkId: 'lm_skyport_main', prompt: 'Open Flying Airship Hangar & Flight Controls [E]' },

  // Newbrook Village Planner Sign
  { id: 'act_village_board', tileX: OX + 26, tileY: OY + 24, kind: 'village_board', landmarkId: 'lm_newbrook_village', prompt: 'Build Newbrook Village Structures [E]' },

  // Sports Park & Carnival
  { id: 'act_football_pitch', tileX: OX + 69, tileY: OY + 71, kind: 'minigame', miniGameId: 'football', prompt: 'Play Football Penalty Challenge [E]' },
  { id: 'act_basketball_court', tileX: OX + 76, tileY: OY + 71, kind: 'minigame', miniGameId: 'basketball', prompt: 'Play Basketball Hoops Challenge [E]' },
  { id: 'act_tennis_court', tileX: OX + 83, tileY: OY + 71, kind: 'minigame', miniGameId: 'tennis', prompt: 'Play Tennis Rally Tournament [E]' },
  { id: 'act_swimming_pool', tileX: OX + 75, tileY: OY + 64, kind: 'minigame', miniGameId: 'swimming', prompt: 'Enter Olympic Swimming Lap Sprint [E]' },
  { id: 'act_bicycle_start', tileX: OX + 64, tileY: OY + 73, kind: 'minigame', miniGameId: 'bicyclerace', prompt: 'Start Brightfall Bicycle Time Trial [E]' },
  { id: 'act_carnival_midway', tileX: OX + 99, tileY: OY + 64, kind: 'minigame', miniGameId: 'carnival', landmarkId: 'lm_amusement_park', prompt: 'Play Starfall Carnival Midway [E]' },

  // Fast Travel Shrines
  { id: 'shrine_brightfall', tileX: OX + 56, tileY: OY + 53, kind: 'shrine', landmarkId: 'lm_brightfall_square', prompt: 'Activate Waystone Shrine [E]' },
  { id: 'shrine_woods', tileX: OX + 20, tileY: OY + 63, kind: 'shrine', landmarkId: 'lm_whispering_hamlet', prompt: 'Mossbrook Waystone Shrine [E]' },
  { id: 'shrine_coast', tileX: OX + 64, tileY: OY + 90, kind: 'shrine', landmarkId: 'lm_sunset_docks', prompt: 'Driftwood Marina Waystone Shrine [E]' },
  { id: 'shrine_frost', tileX: OX + 88, tileY: OY + 31, kind: 'shrine', landmarkId: 'lm_hearthstone', prompt: 'Hearthstone Alpine Waystone Shrine [E]' },
  { id: 'shrine_kingdom', tileX: OX + 44, tileY: OY + 22, kind: 'shrine', landmarkId: 'lm_kingdom_gate', prompt: 'Citadel Causeway Waystone Shrine [E]' },
  { id: 'shrine_frozen_isl', tileX: 280, tileY: 65, kind: 'shrine', landmarkId: 'lm_island_frozen', prompt: 'Frosthaven Harbour Waystone [E]' },
  { id: 'shrine_jungle_isl', tileX: 79, tileY: 222, kind: 'shrine', landmarkId: 'lm_island_jungle', prompt: 'Canopy Landing Waystone [E]' },
  { id: 'shrine_volcanic_isl', tileX: 279, tileY: 155, kind: 'shrine', landmarkId: 'lm_island_volcanic', prompt: 'Emberforge Pier Waystone [E]' },
  { id: 'shrine_sky_isl', tileX: 180, tileY: 57, kind: 'shrine', landmarkId: 'lm_island_sky', prompt: 'Cloudspire Mooring Waystone [E]' },
  { id: 'shrine_haunted_isl', tileX: 69, tileY: 152, kind: 'shrine', landmarkId: 'lm_island_haunted', prompt: 'Mistvale Dock Waystone [E]' },
  { id: 'shrine_lost_isl', tileX: 65, tileY: 65, kind: 'shrine', landmarkId: 'lm_island_lost', prompt: 'Sunken Capital Waystone [E]' },

  // Mini-Games & Boat Docks
  { id: 'act_archery', tileX: 10, tileY: 4, interiorId: 'int_training_hall', kind: 'minigame', miniGameId: 'archery', prompt: 'Play Aether Archery Challenge [E]' },
  { id: 'act_fishing_pier', tileX: OX + 69, tileY: OY + 91, kind: 'minigame', miniGameId: 'fishing', prompt: 'Cast Fishing Line off Marina Pier [E]' },
  { id: 'act_fishing_frozen', tileX: 294, tileY: 60, kind: 'minigame', miniGameId: 'fishing', prompt: 'Fish Frozen Fjord Waters [E]' },
  { id: 'act_fishing_jungle', tileX: 60, tileY: 222, kind: 'minigame', miniGameId: 'fishing', prompt: 'Fish Emerald Jungle River [E]' },
  { id: 'act_fishing_haunted', tileX: 71, tileY: 156, kind: 'minigame', miniGameId: 'fishing', prompt: 'Fish Mistvale Night Lagoon [E]' },
  { id: 'act_fishing_underground', tileX: 17, tileY: 12, interiorId: 'int_underground_city', kind: 'minigame', miniGameId: 'fishing', prompt: 'Fish Subterranea Crystal Stream [E]' },
  { id: 'act_rhythm_stage', tileX: OX + 52, tileY: OY + 64, kind: 'minigame', miniGameId: 'rhythm', prompt: 'Play Festival Harmony Rhythm [E]' },
  { id: 'act_timeslide', tileX: OX + 82, tileY: OY + 28, kind: 'minigame', miniGameId: 'timeslide', prompt: 'Start Mirror Lake Ice Slide [E]' },
  { id: 'act_runememory', tileX: OX + 46, tileY: OY + 16, kind: 'minigame', miniGameId: 'runememory', prompt: 'Attempt Dawn Rune Memory Seal [E]' },
  { id: 'act_boat_dock', tileX: OX + 64, tileY: OY + 92, kind: 'boat_dock', prompt: 'Board / Moor Boat at Driftwood Marina [E]' },
  { id: 'act_boat_race', tileX: OX + 60, tileY: OY + 92, kind: 'minigame', miniGameId: 'boatrace', prompt: 'Enter Ocean Boat Race [E]' },

  // Campaign Puzzles (All 12 puzzles referenced in islandCampaigns.ts + original 2!)
  { id: 'puz_ancient_bridge', tileX: OX + 33, tileY: OY + 24, kind: 'gear_puzzle', puzzleId: 'puz_ancient_bridge', sparks: 25, prompt: 'Inspect Ancient Mechanism [E]', message: 'Gear alignment restored ancient causeway power!' },
  { id: 'puz_frost_echo', tileX: OX + 94, tileY: OY + 19, kind: 'gear_puzzle', puzzleId: 'puz_frost_echo', prompt: 'Align Alpine Wind Chimes [E]', message: 'Crystal chimes hum with warmth! +25 Sparks.' },

  { id: 'puz_frozen_bridge', tileX: 294, tileY: 54, kind: 'gear_puzzle', puzzleId: 'puz_frozen_bridge', prompt: 'Activate Frozen Snow Bridge Switch [E]', message: 'Timber bridge lanterns flare across the fjord!' },
  { id: 'puz_frozen_mural', tileX: 294, tileY: 45, kind: 'gear_puzzle', puzzleId: 'puz_frozen_mural', landmarkId: 'lm_frozen_cave', prompt: 'Inspect Glacier Cave Rune Mural [E]', message: 'Decoded Glacius’s ancient winter hymn!' },
  { id: 'puz_jungle_bridge', tileX: 60, tileY: 229, kind: 'gear_puzzle', puzzleId: 'puz_jungle_bridge', prompt: 'Release Vine Pulley Bridge [E]', message: 'Canopy rope bridge lowered over the emerald river!' },
  { id: 'puz_jungle_sluice', tileX: 44, tileY: 220, kind: 'gear_puzzle', puzzleId: 'puz_jungle_sluice', prompt: 'Align Waterfall Sluice Valve [E]', message: 'Waterfall parted, revealing the Temple entrance!' },
  { id: 'puz_volcanic_valve', tileX: 296, tileY: 146, kind: 'gear_puzzle', puzzleId: 'puz_volcanic_valve', prompt: 'Vent Emberforge Steam Conduit [E]', message: 'Pressure vented cleanly across Basalt Ridge!' },
  { id: 'puz_volcanic_bridge', tileX: 306, tileY: 140, kind: 'gear_puzzle', puzzleId: 'puz_volcanic_bridge', prompt: 'Lower Volcanic Drawbridge [E]', message: 'Basalt chains clanked tight across the lava stream!' },
  { id: 'puz_sky_turbine', tileX: 170, tileY: 44, kind: 'gear_puzzle', puzzleId: 'puz_sky_turbine', prompt: 'Tune Cloudspire Wind Turbine [E]', message: 'Turquoise wind sails catch the sky current!' },
  { id: 'puz_sky_gate', tileX: 190, tileY: 42, kind: 'gear_puzzle', puzzleId: 'puz_sky_gate', prompt: 'Align East Sky-Gate Console [E]', message: 'Wind chimes ring clear toward Sky Temple!' },
  { id: 'puz_haunted_library', tileX: 38, tileY: 147, kind: 'gear_puzzle', puzzleId: 'puz_haunted_library', landmarkId: 'lm_haunted_manor', prompt: 'Inspect Mistvale Manor Bookcase Secret [E]', message: 'A hidden folio slides open, revealing Vesper’s seal!' },
  { id: 'puz_haunted_crypt', tileX: 44, tileY: 132, kind: 'gear_puzzle', puzzleId: 'puz_haunted_crypt', prompt: 'Open Cemetery Alchemist Crypt [E]', message: 'Moonlight reveals the path to Haunted Castle Dungeon!' },
  { id: 'puz_lost_causeway', tileX: 52, tileY: 50, kind: 'gear_puzzle', puzzleId: 'puz_lost_causeway', prompt: 'Align Royal Causeway Pillar [E]', message: 'Golden runes illuminate the Sunken Capital road!' },
  { id: 'puz_lost_cipher', tileX: 46, tileY: 43, kind: 'gear_puzzle', puzzleId: 'puz_lost_cipher', landmarkId: 'lm_lost_vault', prompt: 'Decode Eclipse Vault Cipher [E]', message: 'You uncovered the truth behind Aetheria’s Great Fall!' },

  // Heal Camps
  { id: 'camp_woods', tileX: OX + 22, tileY: OY + 40, kind: 'heal_camp', prompt: 'Rest at Forest Campfire (Full Heal) [E]' },
  { id: 'camp_frost', tileX: OX + 94, tileY: OY + 27, kind: 'heal_camp', prompt: 'Warm Up by Alpine Brazier (Full Heal) [E]' },
  { id: 'camp_springs', tileX: 326, tileY: 156, kind: 'heal_camp', landmarkId: 'lm_volcanic_springs', prompt: 'Relax in Obsidian Hot Springs (Full Heal) [E]' },

  // 12 GUARDIAN ALTARS
  { id: 'altar_woodland', tileX: OX + 14, tileY: OY + 38, kind: 'guardian_altar', guardianId: 'woodland_giant', landmarkId: 'lm_woodland_grove', prompt: 'Challenge Sylvaron, The Woodland Giant [E]' },
  { id: 'altar_tidal', tileX: OX + 98, tileY: OY + 88, kind: 'guardian_altar', guardianId: 'tidal_keeper', landmarkId: 'lm_coral_atoll', prompt: 'Challenge Neridia, The Tidal Keeper [E]' },
  { id: 'altar_frost', tileX: OX + 102, tileY: OY + 16, kind: 'guardian_altar', guardianId: 'frostbound_watcher', landmarkId: 'lm_frost_summit', prompt: 'Challenge Kaelen, The Frostbound Watcher [E]' },
  { id: 'altar_remnant', tileX: OX + 36, tileY: OY + 12, kind: 'guardian_altar', guardianId: 'last_remnant', landmarkId: 'lm_sanctum_throne', prompt: 'Face Aurelius, The Last Remnant [E]' },
  { id: 'altar_frozen_empress', tileX: 316, tileY: 24, kind: 'guardian_altar', guardianId: 'frost_empress', prompt: 'Challenge Glacius, The Frost Empress [E]' },
  { id: 'altar_jungle_titan', tileX: 30, tileY: 214, kind: 'guardian_altar', guardianId: 'jungle_titan', prompt: 'Challenge Zulra, The Jungle Titan [E]' },
  { id: 'altar_magma_colossus', tileX: 322, tileY: 126, kind: 'guardian_altar', guardianId: 'magma_colossus', prompt: 'Challenge Ignis, The Magma Colossus [E]' },
  { id: 'altar_sky_seraph', tileX: 180, tileY: 22, kind: 'guardian_altar', guardianId: 'sky_seraph', prompt: 'Challenge Zephyra, The Sky Seraph [E]' },
  { id: 'altar_phantom_duke', tileX: 26, tileY: 124, kind: 'guardian_altar', guardianId: 'phantom_duke', prompt: 'Challenge Vesper, The Phantom Duke [E]' },
  { id: 'altar_eclipse_sov', tileX: 34, tileY: 26, kind: 'guardian_altar', guardianId: 'eclipse_sovereign', prompt: 'Challenge Aetherion, The Eclipse Sovereign [E]' },
  { id: 'altar_rift_archon', tileX: 17, tileY: 9, interiorId: 'dim_void', kind: 'guardian_altar', guardianId: 'rift_archon', prompt: 'Challenge Chronos-IX, The Rift Archon [E]' },

  // Hidden Lore Secrets
  { id: 'secret_grotto', tileX: OX + 8, tileY: OY + 88, kind: 'secret_lore', secretId: 'sec_whispering_grotto', prompt: 'Inspect Hidden Starlight Tablet [E]', message: 'Secret Discovered! Inscribed: "Every fall teaches the earth how to spring back higher."' },
  { id: 'secret_cove', tileX: OX + 94, tileY: OY + 96, kind: 'secret_lore', secretId: 'sec_tidal_cave', prompt: 'Inspect Coral Tide Stone [E]', message: 'Secret Discovered! You found a hidden tidepool cache of Sparks!' },
  { id: 'secret_summit', tileX: OX + 96, tileY: OY + 8, kind: 'secret_lore', secretId: 'sec_alpine_overlook', prompt: 'Inspect Northern Star Obelisk [E]', message: 'Secret Discovered! Starlight warms the icy stone.' },
  { id: 'secret_jungle', tileX: 24, tileY: 242, kind: 'secret_lore', secretId: 'sec_jungle_ruin', prompt: 'Inspect Moss-Grown Sun Obelisk [E]', message: 'Secret Discovered! Sun-kings danced beneath the waterfall centuries ago.' },
  { id: 'secret_underground', tileX: 5, tileY: 18, interiorId: 'int_underground_city', kind: 'secret_lore', secretId: 'sec_subterranean_archive', prompt: 'Read Ancient Delver Slab [E]', message: 'Secret Discovered! Lumina crystals power Aetheria’s deep roots.' },
];

export const ENEMY_SPAWNS: EnemySpawn[] = [
  // Mainland Biomes
  { id: 'en_w1', tileX: OX + 22, tileY: OY + 46, region: 'whispering_woods', speciesId: 'bramble_snapper', kind: 'bramble', texture: 'mon_bramble_snapper', hp: 38, speed: 64, restorationClearKey: 'rest_woods_shrine' },
  { id: 'en_w2', tileX: OX + 12, tileY: OY + 52, region: 'whispering_woods', speciesId: 'spore_shroom', kind: 'bramble', texture: 'mon_spore_shroom', hp: 48, speed: 52, restorationClearKey: 'rest_woods_shrine' },
  { id: 'en_w_night', tileX: OX + 25, tileY: OY + 56, region: 'whispering_woods', speciesId: 'shadow_stalker', kind: 'echo', texture: 'mon_shadow_stalker', hp: 56, speed: 90, nocturnalOnly: true },
  { id: 'en_c1', tileX: OX + 88, tileY: OY + 86, region: 'sunset_coast', speciesId: 'reef_pincher', kind: 'crab', texture: 'mon_reef_pincher', hp: 42, speed: 70, restorationClearKey: 'rest_coast_lighthouse' },
  { id: 'en_c2', tileX: OX + 76, tileY: OY + 88, region: 'sunset_coast', speciesId: 'tide_serpent', kind: 'crab', texture: 'mon_tide_serpent', hp: 58, speed: 78 },
  { id: 'en_f1', tileX: OX + 96, tileY: OY + 22, region: 'frostpeak', speciesId: 'frost_wisp', kind: 'wisp', texture: 'mon_frost_wisp', hp: 48, speed: 74, restorationClearKey: 'rest_frost_hearth' },
  { id: 'en_f2', tileX: OX + 90, tileY: OY + 18, region: 'frostpeak', speciesId: 'glacier_yeti', kind: 'wisp', texture: 'mon_glacier_yeti', hp: 96, speed: 56 },
  { id: 'en_k1', tileX: OX + 36, tileY: OY + 16, region: 'forgotten_kingdom', speciesId: 'crag_beetle', kind: 'echo', texture: 'mon_crag_beetle', hp: 62, speed: 72, restorationClearKey: 'rest_kingdom_beacon' },
  { id: 'en_k2', tileX: OX + 42, tileY: OY + 18, region: 'forgotten_kingdom', speciesId: 'crystal_golem', kind: 'echo', texture: 'mon_crystal_golem', hp: 108, speed: 54 },
  // 6 Massive Outer Islands
  { id: 'en_fr1', tileX: 304, tileY: 36, region: 'frozen_kingdom', speciesId: 'frost_wisp', kind: 'wisp', texture: 'mon_frost_wisp', hp: 54, speed: 76, restorationClearKey: 'rest_frozen_island' },
  { id: 'en_fr2', tileX: 312, tileY: 30, region: 'frozen_kingdom', speciesId: 'glacier_yeti', kind: 'wisp', texture: 'mon_glacier_yeti', hp: 110, speed: 58 },
  { id: 'en_jn1', tileX: 46, tileY: 222, region: 'wild_jungle', speciesId: 'spore_shroom', kind: 'bramble', texture: 'mon_spore_shroom', hp: 58, speed: 64, restorationClearKey: 'rest_jungle_temple' },
  { id: 'en_jn2', tileX: 38, tileY: 218, region: 'wild_jungle', speciesId: 'bramble_snapper', kind: 'bramble', texture: 'mon_bramble_snapper', hp: 52, speed: 76 },
  { id: 'en_vo1', tileX: 312, tileY: 138, region: 'volcanic_island', speciesId: 'magma_salamander', kind: 'crab', texture: 'mon_magma_salamander', hp: 66, speed: 84, restorationClearKey: 'rest_volcanic_forge' },
  { id: 'en_vo2', tileX: 318, tileY: 132, region: 'volcanic_island', speciesId: 'cinder_colossus', kind: 'crab', texture: 'mon_cinder_colossus', hp: 120, speed: 56 },
  { id: 'en_sk1', tileX: 180, tileY: 34, region: 'sky_island', speciesId: 'tempest_harpy', kind: 'wisp', texture: 'mon_tempest_harpy', hp: 68, speed: 92, restorationClearKey: 'rest_sky_spire' },
  { id: 'en_ha1', tileX: 36, tileY: 132, region: 'haunted_island', speciesId: 'umbral_specter', kind: 'echo', texture: 'mon_umbral_specter', hp: 74, speed: 82, restorationClearKey: 'rest_haunted_castle' },
  { id: 'en_ha_night', tileX: 46, tileY: 144, region: 'haunted_island', speciesId: 'shadow_stalker', kind: 'echo', texture: 'mon_shadow_stalker', hp: 70, speed: 94, nocturnalOnly: true },
  { id: 'en_lo1', tileX: 40, tileY: 36, region: 'lost_kingdom', speciesId: 'crystal_golem', kind: 'echo', texture: 'mon_crystal_golem', hp: 118, speed: 60, restorationClearKey: 'rest_lost_capital' },
  // Dungeon & Dimension Enemies
  { id: 'en_dun_fr', tileX: 14, tileY: 10, interiorId: 'int_dungeon_frozen', region: 'frozen_kingdom', speciesId: 'glacier_yeti', kind: 'wisp', texture: 'mon_glacier_yeti', hp: 96, speed: 62 },
  { id: 'en_dun_jn', tileX: 14, tileY: 10, interiorId: 'int_dungeon_jungle', region: 'wild_jungle', speciesId: 'spore_shroom', kind: 'bramble', texture: 'mon_spore_shroom', hp: 70, speed: 70 },
  { id: 'en_dun_vo', tileX: 14, tileY: 10, interiorId: 'int_dungeon_volcanic', region: 'volcanic_island', speciesId: 'cinder_colossus', kind: 'crab', texture: 'mon_cinder_colossus', hp: 112, speed: 60 },
  { id: 'en_dun_sk', tileX: 14, tileY: 10, interiorId: 'int_dungeon_sky', region: 'sky_island', speciesId: 'tempest_harpy', kind: 'wisp', texture: 'mon_tempest_harpy', hp: 76, speed: 90 },
  { id: 'en_dun_ha', tileX: 14, tileY: 10, interiorId: 'int_dungeon_haunted', region: 'haunted_island', speciesId: 'umbral_specter', kind: 'echo', texture: 'mon_umbral_specter', hp: 82, speed: 84 },
  { id: 'en_dun_lo', tileX: 15, tileY: 11, interiorId: 'int_dungeon_lost', region: 'lost_kingdom', speciesId: 'crystal_golem', kind: 'echo', texture: 'mon_crystal_golem', hp: 124, speed: 66 },
  { id: 'en_void_1', tileX: 11, tileY: 14, interiorId: 'dim_void', region: 'dim_void', speciesId: 'void_construct', kind: 'echo', texture: 'mon_void_construct', hp: 105, speed: 86 },
];

export function getMovingIslandSlotCoords(slot: number) {
  return MOVING_ISLAND_SLOTS[((slot % 4) + 4) % 4];
}

export function getRegionAtTile(tx: number, ty: number, movingSlot = 0): RegionId {
  // Check Moving Island first
  const mi = getMovingIslandSlotCoords(movingSlot);
  if (Math.hypot(tx - mi.x, ty - mi.y) <= 13) return 'moving_island';

  // 6 Massive Outer Islands
  if (tx >= 12 && tx <= 84 && ty >= 10 && ty <= 80) return 'lost_kingdom';
  if (tx >= 142 && tx <= 220 && ty >= 8 && ty <= 68) return 'sky_island';
  if (tx >= 260 && tx <= 348 && ty >= 10 && ty <= 82) return 'frozen_kingdom';
  if (tx >= 8 && tx <= 82 && ty >= 108 && ty <= 184) return 'haunted_island';
  if (tx >= 266 && tx <= 348 && ty >= 110 && ty <= 188) return 'volcanic_island';
  if (tx >= 14 && tx <= 96 && ty >= 194 && ty <= 262) return 'wild_jungle';

  // Mainland Check (OX=120, OY=85, extends slightly east to OX+106 for Starfall Amusement Park)
  if (tx < OX || tx >= OX + 114 || ty < OY || ty >= OY + 104) return 'ocean';

  const lx = tx - OX;
  const ly = ty - OY;
  if (lx >= 90 && ly >= 54 && ly <= 76) return 'amusement_park';
  if (lx >= 18 && lx <= 36 && ly >= 16 && ly <= 34) return 'newbrook';
  if (lx <= 58 && ly < 28) return 'forgotten_kingdom';
  if (lx > 68 && ly < 36) return 'frostpeak';
  if (lx < 32 && ly >= 28 && ly <= 84) return 'whispering_woods';
  if (ly >= 78) return 'sunset_coast';
  return 'brightfall';
}

export function getWaterTypeAt(
  tx: number,
  ty: number,
  interiorId: string | null,
  save: SaveData
): 'harbour' | 'river' | 'lake' | 'beach' | 'ocean' | 'frozen' | 'jungle' | 'underground' {
  if (interiorId === 'int_underground_city' || interiorId === 'int_ancient_lab') return 'underground';
  const region = getRegionAtTile(tx, ty, save.movingIslandSlot);
  if (region === 'frozen_kingdom' || region === 'frostpeak') return 'frozen';
  if (region === 'wild_jungle') return 'jungle';
  if (region === 'sunset_coast') return tx - OX < 72 ? 'harbour' : 'beach';
  if (region === 'ocean' || region === 'haunted_island' || region === 'volcanic_island' || region === 'lost_kingdom' || region === 'moving_island') {
    return 'ocean';
  }
  return ty - OY > 72 ? 'lake' : 'river';
}

function paintOrganicIsland(
  grid: number[][],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  landTile: number,
  innerTile: number,
  coastTile: number,
  seed: number,
  harbourDir?: { dx: number; dy: number }
) {
  const minX = Math.max(1, Math.floor(cx - rx - 7));
  const maxX = Math.min(WORLD_WIDTH - 2, Math.ceil(cx + rx + 7));
  const minY = Math.max(1, Math.floor(cy - ry - 7));
  const maxY = Math.min(WORLD_HEIGHT - 2, Math.ceil(cy + ry + 7));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const angle = Math.atan2(dy, dx);
      // Natural irregular coastline wobble using harmonics
      const wobble =
        1 +
        0.16 * Math.sin(angle * 2 + seed * 1.1) +
        0.12 * Math.cos(angle * 3 - seed * 0.7) +
        0.09 * Math.sin(angle * 5 + seed * 2.3) +
        0.05 * Math.cos(angle * 7 + seed * 3.1);

      let dist = Math.hypot(dx, dy) / wobble;

      // Carve a calm natural harbour bay if specified
      if (harbourDir) {
        const dot = (dx * harbourDir.dx + dy * harbourDir.dy) / (Math.hypot(dx, dy) + 0.001);
        if (dot > 0.78 && dist > 0.72) {
          dist += 0.2;
        }
      }

      if (dist <= 0.56) {
        grid[y][x] = innerTile;
      } else if (dist <= 0.94) {
        grid[y][x] = landTile;
      } else if (dist <= 1.07 && grid[y][x] === 8) {
        grid[y][x] = coastTile;
      } else if (dist <= 1.2 && grid[y][x] === 8) {
        grid[y][x] = 7; // Turquoise reef halo
      }
    }
  }
}

export function buildOverworldGrid(save: SaveData): number[][] {
  const grid: number[][] = Array.from({ length: WORLD_HEIGHT }, () => Array(WORLD_WIDTH).fill(8));
  const fillRect = (x1: number, y1: number, x2: number, y2: number, tile: number) => {
    for (let y = Math.max(1, y1); y <= Math.min(WORLD_HEIGHT - 2, y2); y++) {
      for (let x = Math.max(1, x1); x <= Math.min(WORLD_WIDTH - 2, x2); x++) {
        grid[y][x] = tile;
      }
    }
  };
  const drawRoad = (x1: number, y1: number, x2: number, y2: number, tile = 2) => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) + 1;
    for (let i = 0; i <= steps; i++) {
      const tx = Math.round(x1 + ((x2 - x1) * i) / steps);
      const ty = Math.round(y1 + ((y2 - y1) * i) / steps);
      fillRect(tx - 1, ty - 1, tx + 1, ty + 1, tile);
    }
  };

  // ========== 1. CENTRAL CONTINENT (ORGANIC MULTI-LOBE SHAPE) ==========
  paintOrganicIsland(grid, OX + 56, OY + 50, 50, 46, 0, 1, 6, 4.2, { dx: 0.1, dy: 1 });
  // West Whispering Woods Peninsula
  paintOrganicIsland(grid, OX + 18, OY + 56, 20, 28, 4, 5, 6, 1.8);
  // North Forgotten Kingdom Plateau
  paintOrganicIsland(grid, OX + 36, OY + 16, 24, 18, 12, 13, 14, 6.4);
  // Northeast Frostpeak Massif
  paintOrganicIsland(grid, OX + 88, OY + 22, 24, 22, 10, 11, 14, 9.1);
  // East Starfall Amusement Park Coastal Peninsula
  paintOrganicIsland(grid, OX + 98, OY + 64, 15, 14, 39, 39, 6, 5.5);

  // Newbrook Buildable Village Clearing (NW Brightfall)
  paintOrganicIsland(grid, OX + 26, OY + 24, 11, 10, 0, 1, 3, 2.7);
  if (save.village.buildings.includes('garden')) {
    fillRect(OX + 23, OY + 23, OX + 28, OY + 26, 45);
  }
  if (save.village.buildings.includes('bridge')) {
    fillRect(OX + 25, OY + 31, OX + 27, OY + 38, 9);
  }

  // Flowing Winding River from Frostpeak Lake down to Sunset Coast
  for (let i = 0; i <= 54; i++) {
    const ry = OY + 26 + i;
    const rx = Math.round(OX + 84 - Math.sin(i * 0.15) * 4 - i * 0.14);
    fillRect(rx - 1, ry, rx + 1, ry, 7);
  }

  // Brightfall Fantasy Town Layout — Organic Meadows, Cobblestone Boulevards, Scenic Canal & Pocket Parks
  // Outer neighborhoods retain natural meadows + wildflower patches (NO sterile giant black rectangle grid)
  for (let y = OY + 35; y <= OY + 76; y++) {
    for (let x = OX + 34; x <= OX + 84; x++) {
      if (grid[y][x] !== 8 && grid[y][x] !== 7) {
        const flowerPatch = ((x * 7 + y * 13) % 11 === 0) ? 1 : 0;
        grid[y][x] = flowerPatch;
      }
    }
  }

  // Grand Brightfall Central Plaza (Mosaic Courtyard + Cobble Promenade + Blossom Borders)
  fillRect(OX + 50, OY + 52, OX + 63, OY + 60, 2);
  fillRect(OX + 52, OY + 54, OX + 61, OY + 58, 49);

  // Flowing East-West Cobble Boulevards (with gentle organic wave)
  drawRoad(OX + 35, OY + 41, OX + 63, OY + 40, 37);
  drawRoad(OX + 63, OY + 40, OX + 78, OY + 42, 37);
  drawRoad(OX + 37, OY + 46, OX + 56, OY + 47, 37);
  drawRoad(OX + 56, OY + 47, OX + 77, OY + 46, 37);
  drawRoad(OX + 35, OY + 52, OX + 52, OY + 53, 37);
  drawRoad(OX + 61, OY + 53, OX + 78, OY + 52, 37);
  drawRoad(OX + 35, OY + 59, OX + 51, OY + 58, 37);
  drawRoad(OX + 62, OY + 58, OX + 75, OY + 60, 37);

  // North-South Cobble Avenues connecting Districts & Parks
  drawRoad(OX + 44, OY + 37, OX + 45, OY + 66, 37);
  drawRoad(OX + 55, OY + 36, OX + 56, OY + 79, 37);
  drawRoad(OX + 69, OY + 37, OX + 70, OY + 82, 37);

  // Scenic Brightfall Town Canal (curving stream along Southern Promenade) with Timber Bridges
  for (let i = 0; i <= 32; i++) {
    const cx = OX + 36 + i;
    const cy = Math.round(OY + 67 + Math.sin(i * 0.22) * 1.5);
    fillRect(cx, cy, cx, cy + 1, 7);
  }
  fillRect(OX + 44, OY + 65, OX + 46, OY + 70, 9); // West Canal Bridge
  fillRect(OX + 55, OY + 65, OX + 57, OY + 70, 9); // Central Canal Bridge
  fillRect(OX + 68, OY + 65, OX + 70, OY + 70, 9); // Sports Park Bridge

  // Railway Line from Central Station (OX+64, OY+37) North-East toward Frostpeak & Skyport
  drawRoad(OX + 64, OY + 36, OX + 88, OY + 32, 38);
  // Grand Skyport Tarmac Runway Strip & Homestead Garden Path
  fillRect(OX + 78, OY + 36, OX + 88, OY + 38, 37);
  fillRect(OX + 35, OY + 55, OX + 38, OY + 57, 2);

  // Lush Central Park Pocket Gardens & Blossom Borders
  const parkTile = save.completedRestorations.includes('rest_brightfall_garden') ? 1 : 0;
  fillRect(OX + 47, OY + 60, OX + 54, OY + 65, parkTile);
  fillRect(OX + 47, OY + 60, OX + 54, OY + 60, 50);
  fillRect(OX + 58, OY + 60, OX + 64, OY + 65, 1);
  fillRect(OX + 58, OY + 60, OX + 64, OY + 60, 50);

  // Residential Garden Yards around Maple/Elm Lanes
  fillRect(OX + 35, OY + 56, OX + 41, OY + 58, 1);
  fillRect(OX + 36, OY + 63, OX + 48, OY + 65, 1);

  // Olympic Sports Park Complex
  fillRect(OX + 65, OY + 68, OX + 72, OY + 75, 33); // Football Stadium
  fillRect(OX + 74, OY + 68, OX + 79, OY + 74, 34); // Basketball Court
  fillRect(OX + 81, OY + 68, OX + 86, OY + 74, 42); // Tennis Court
  fillRect(OX + 73, OY + 62, OX + 78, OY + 66, 43); // Olympic Swimming Pool

  // Brightfall Orchard Farm Rows & Meadow
  fillRect(OX + 78, OY + 51, OX + 84, OY + 56, 35);
  fillRect(OX + 78, OY + 48, OX + 84, OY + 50, 1);

  // Connecting Paved Roads & Bridges across Mainland
  drawRoad(OX + 35, OY + 56, OX + 20, OY + 62, 3); // To Mossbrook Hamlet
  drawRoad(OX + 20, OY + 60, OX + 14, OY + 38, 3); // To Woodland Giant
  drawRoad(OX + 55, OY + 80, OX + 65, OY + 88, 2); // To Sunset Coast Marina
  drawRoad(OX + 68, OY + 86, OX + 98, OY + 86, 9); // Wooden boardwalk to Sunken Atoll
  drawRoad(OX + 46, OY + 41, OX + 44, OY + 22, 12); // To Forgotten Kingdom
  drawRoad(OX + 44, OY + 22, OX + 36, OY + 10, 13); // To Dawn Sanctum
  drawRoad(OX + 82, OY + 54, OX + 98, OY + 64, 9); // Bridge to Starfall Amusement Park
  drawRoad(OX + 44, OY + 35, OX + 26, OY + 24, 3); // Trail to Newbrook

  // Grand Marina & Harbour Piers (South Coast)
  fillRect(OX + 62, OY + 86, OX + 72, OY + 93, 9);
  fillRect(OX + 63, OY + 93, OX + 67, OY + 97, 9); // Boat Mooring Pier

  // Sunset Atoll Shrine Platform
  paintOrganicIsland(grid, OX + 98, OY + 86, 7, 6, 6, 7, 7, 3.3);

  // ========== 2. SIX MASSIVE ORGANIC OUTER ISLANDS ==========
  // 2A. LOST KINGDOM (NW)
  paintOrganicIsland(grid, 46, 44, 34, 30, 12, 13, 14, 2.1, { dx: 0.7, dy: 0.7 });
  fillRect(62, 62, 68, 69, 9); // Pier
  drawRoad(64, 65, 46, 42, 12);
  drawRoad(46, 42, 34, 24, 13);

  // 2B. SKY ISLAND (North)
  paintOrganicIsland(grid, 180, 38, 32, 26, 31, 31, 36, 7.7);
  fillRect(177, 56, 183, 62, 9); // Cloudspire Mooring Pier
  drawRoad(180, 56, 180, 20, 31);
  drawRoad(166, 46, 194, 46, 31);

  // 2C. FROZEN KINGDOM (NE)
  paintOrganicIsland(grid, 304, 46, 38, 32, 10, 11, 6, 5.1, { dx: -0.7, dy: 0.7 });
  fillRect(277, 63, 283, 69, 9); // Frosthaven Harbour Pier
  // Frozen Fjord River
  for (let i = 0; i < 18; i++) fillRect(290 + Math.round(Math.sin(i * 0.3) * 2), 48 + i, 292, 48 + i, 11);
  drawRoad(280, 64, 286, 56, 3);
  drawRoad(286, 56, 316, 22, 10);
  fillRect(292, 53, 297, 55, 9); // Snow Bridge

  // 2D. HAUNTED ISLAND (West)
  paintOrganicIsland(grid, 44, 146, 34, 32, 32, 13, 6, 8.4, { dx: 0.9, dy: 0.2 });
  fillRect(67, 150, 74, 155, 9); // Mistvale Dock
  drawRoad(68, 152, 38, 146, 12);
  drawRoad(38, 146, 26, 122, 13);

  // 2E. VOLCANIC ISLAND (East)
  paintOrganicIsland(grid, 308, 148, 36, 32, 29, 29, 6, 3.9, { dx: -0.9, dy: 0.2 });
  fillRect(275, 154, 281, 159, 9); // Emberforge Pier
  // Glowing Magma Channels & Bridge
  fillRect(304, 130, 308, 168, 30);
  fillRect(303, 139, 309, 142, 9); // Lava Drawbridge
  fillRect(323, 153, 330, 159, 48); // Geothermal Hot Springs
  drawRoad(279, 156, 292, 148, 29);
  drawRoad(292, 148, 322, 124, 12);

  // 2F. WILD JUNGLE (SW)
  paintOrganicIsland(grid, 54, 228, 38, 30, 28, 4, 6, 6.2, { dx: 0.8, dy: -0.3 });
  fillRect(77, 220, 84, 225, 9); // Canopy Landing Pier
  // Winding Jungle River & Rope Bridge
  for (let i = 0; i < 24; i++) fillRect(58 + Math.round(Math.sin(i * 0.25) * 3), 212 + i, 61, 212 + i, 7);
  fillRect(56, 228, 63, 230, 9); // Rope Bridge
  drawRoad(79, 222, 54, 236, 3);
  drawRoad(54, 236, 30, 212, 12);

  // ========== 3. MYSTERIOUS MOVING ISLAND (Dynamic Slot) ==========
  const mi = getMovingIslandSlotCoords(save.movingIslandSlot);
  paintOrganicIsland(grid, mi.x, mi.y, 11, 10, 45, 44, 6, 11.3);
  fillRect(mi.x - 1, mi.y + 8, mi.x + 1, mi.y + 11, 9);

  // Coral Sea Sandbars & Buoys across Open Ocean
  const reefs = [
    { x: 112, y: 120 },
    { x: 248, y: 120 },
    { x: 162, y: 215 },
    { x: 215, y: 210 },
    { x: 115, y: 40 },
    { x: 238, y: 38 },
  ];
  reefs.forEach((r, idx) => {
    paintOrganicIsland(grid, r.x, r.y, 4, 4, 6, 6, 7, idx + 1.5);
  });

  // Safety clear solid obstacles from key spawn/altar tiles
  [
    [OX + 54, OY + 59],
    [OX + 64, OY + 92],
    [mi.x, mi.y],
    [mi.x, mi.y + 2],
    [mi.x, mi.y - 4],
  ].forEach(([sx, sy]) => {
    if (grid[sy]?.[sx] !== undefined && SOLID_TILES.has(grid[sy][sx])) {
      grid[sy][sx] = 2;
    }
  });

  return grid;
}

export function buildInteriorGrid(interiorId: string, save: SaveData): number[][] {
  const def = INTERIORS[interiorId] ?? INTERIORS.int_player_house;
  const grid: number[][] = Array.from({ length: def.height }, () => Array(def.width).fill(def.floorTile));

  for (let x = 0; x < def.width; x++) {
    grid[0][x] = 19;
    grid[def.height - 1][x] = 19;
  }
  for (let y = 0; y < def.height; y++) {
    grid[y][0] = 19;
    grid[y][def.width - 1] = 19;
  }

  if (interiorId === 'int_player_house') {
    const floorMap = { oak: 16, checker: 17, stone: 18 } as const;
    const baseFloor = floorMap[save.house.floorStyle] ?? 16;
    for (let y = 2; y < def.height - 2; y++) {
      for (let x = 2; x < def.width - 2; x++) grid[y][x] = baseFloor;
    }
    // Central Living Carpet, Bedroom, Kitchen & Washroom Zones
    for (let y = 6; y <= 10; y++) for (let x = 8; x <= 14; x++) grid[y][x] = 51;
    for (let y = 2; y <= 7; y++) grid[y][7] = 19; // Bedroom divider
    for (let y = 2; y <= 7; y++) grid[y][15] = 19; // Kitchen divider
    for (let y = 2; y <= 6; y++) for (let x = 16; x <= 20; x++) grid[y][x] = 17; // Kitchen checker
    for (let y = 10; y <= 13; y++) for (let x = 2; x <= 5; x++) grid[y][x] = 52; // Marble washroom nook
  } else if (interiorId === 'int_supermarket' || interiorId === 'int_mall') {
    for (let y = 2; y < def.height - 2; y++) {
      grid[y][Math.floor(def.width / 2)] = 51;
      grid[y][Math.floor(def.width / 2) - 1] = 51;
    }
    for (let x = 3; x < def.width - 3; x++) grid[4][x] = 16;
  } else if (interiorId === 'int_restaurant' || interiorId === 'int_cafe') {
    for (let y = 2; y <= 5; y++) for (let x = 2; x < def.width - 2; x++) grid[y][x] = 17; // Kitchen zone
    for (let y = 6; y < def.height - 2; y++) grid[y][Math.floor(def.width / 2)] = 51; // Dining runner
  } else if (interiorId === 'int_library' || interiorId === 'int_lost_archive') {
    for (let y = 3; y < def.height - 2; y++) {
      for (let x = Math.floor(def.width / 2) - 2; x <= Math.floor(def.width / 2) + 2; x++) {
        grid[y][x] = 51;
      }
    }
  } else if (interiorId === 'int_hospital') {
    for (let y = 2; y < def.height - 2; y++) grid[y][Math.floor(def.width / 2)] = 49;
  } else if (interiorId === 'int_arcade') {
    for (let y = 2; y <= 4; y++) for (let x = 3; x < def.width - 3; x++) grid[y][x] = 51; // Cinema theater row
    for (let x = 3; x < def.width - 3; x++) grid[8][x] = 44; // Neon floor strip
  } else if (interiorId === 'int_smithy' || interiorId === 'int_volcanic_hall') {
    for (let x = 3; x < def.width - 3; x++) {
      grid[2][x] = 29;
      grid[3][x] = 29;
    }
    grid[2][Math.floor(def.width / 2)] = 30; // Forge hearth glow
  } else if (interiorId === 'int_training_hall') {
    for (let y = 3; y <= 6; y++) for (let x = 4; x < def.width - 4; x++) grid[y][x] = 33; // Turf range
  } else if (interiorId === 'int_tackle_shop') {
    for (let y = 3; y <= 5; y++) for (let x = 4; x < def.width - 4; x++) grid[y][x] = 9; // Pier deck display
  } else if (interiorId === 'int_restoration_hall' || interiorId === 'int_station' || interiorId === 'int_civic_station') {
    for (let y = 3; y < def.height - 2; y++) grid[y][Math.floor(def.width / 2)] = 49;
  } else if (interiorId === 'int_atelier') {
    for (let y = 4; y <= 8; y++) for (let x = 4; x <= 11; x++) grid[y][x] = 51;
  } else if (interiorId === 'int_underground_city') {
    for (let x = 3; x < def.width - 3; x++) {
      grid[12][x] = 41; // Flowing Lumina Underground Crystal River
      grid[13][x] = 41;
    }
    grid[12][17] = 9;
    grid[13][17] = 9;
    grid[12][9] = 9;
    grid[13][9] = 9;
  } else if (interiorId === 'dim_void') {
    for (let y = 2; y < def.height - 2; y++) {
      for (let x = 2; x < def.width - 2; x++) {
        if (Math.abs(x - 17) > 8 && Math.abs(y - 12) > 4) grid[y][x] = 46;
      }
    }
  } else if (interiorId.startsWith('int_dungeon_')) {
    for (let y = 4; y < def.height - 4; y += 4) {
      grid[y][6] = 19;
      grid[y][def.width - 7] = 19;
    }
  }

  // Exit doormat always stays walkable tile 20
  grid[def.exitY][def.exitX] = 20;
  return grid;
}

export function buildWorldProps(save: SaveData): WorldProp[] {
  const props: WorldProp[] = [];
  const cafeDone = save.completedRestorations.includes('rest_brightfall_cafe');
  const homesDone = save.completedRestorations.includes('rest_brightfall_homes');
  const gardenDone = save.completedRestorations.includes('rest_brightfall_garden');
  const railDone = save.completedRestorations.includes('rest_brightfall_railway');
  const parkDone = save.completedRestorations.includes('rest_amusement_park');
  const woodsDone = save.completedRestorations.includes('rest_woods_shrine');
  const coastDone = save.completedRestorations.includes('rest_coast_lighthouse');
  const frostDone = save.completedRestorations.includes('rest_frost_hearth');
  const kingdomDone = save.completedRestorations.includes('rest_kingdom_beacon');

  // City Plaza Fountain, Founder Statue & Noticeboard
  props.push({
    id: 'prop_plaza_fountain',
    tileX: OX + 56,
    tileY: OY + 56,
    texture: gardenDone ? 'prop_fountain_live' : 'prop_fountain_dry',
    solid: true,
  });
  props.push({ id: 'prop_noticeboard', tileX: OX + 54, tileY: OY + 56, texture: 'prop_noticeboard', solid: true });
  props.push({ id: 'prop_plaza_statue', tileX: OX + 58, tileY: OY + 54, texture: 'prop_statue', solid: true });

  // Outdoor Café Patio Umbrellas & Flowerbeds in Brightfall
  props.push({ id: 'prop_patio_cafe_1', tileX: OX + 41, tileY: OY + 53, texture: 'prop_cafe_umbrella', solid: true });
  props.push({ id: 'prop_patio_cafe_2', tileX: OX + 46, tileY: OY + 53, texture: 'prop_cafe_umbrella', solid: true });
  props.push({ id: 'prop_patio_bistro_1', tileX: OX + 60, tileY: OY + 46, texture: 'prop_cafe_umbrella', solid: true });
  [
    [OX + 50, OY + 54], [OX + 62, OY + 54], [OX + 50, OY + 59], [OX + 62, OY + 59],
    [OX + 48, OY + 62], [OX + 53, OY + 64], [OX + 59, OY + 62], [OX + 63, OY + 64],
    [OX + 38, OY + 57], [OX + 43, OY + 64], [OX + 77, OY + 57],
  ].forEach(([fx, fy], i) => {
    props.push({ id: `prop_flowerbed_${i}`, tileX: fx, tileY: fy, texture: 'prop_flowerbed', solid: false });
  });

  // Brightfall Urban Shade Trees & Pocket Park Groves (eliminates empty grass lots)
  [
    [OX + 49, OY + 62], [OX + 53, OY + 62], [OX + 60, OY + 61], [OX + 63, OY + 62],
    [OX + 34, OY + 49], [OX + 34, OY + 64], [OX + 49, OY + 38], [OX + 53, OY + 39],
    [OX + 79, OY + 48], [OX + 84, OY + 58], [OX + 62, OY + 74], [OX + 48, OY + 72],
  ].forEach(([tx, ty], i) => {
    props.push({ id: `prop_city_tree_${i}`, tileX: tx, tileY: ty, texture: 'prop_tree_oak', solid: true });
  });

  // Festive Trees & Streetlight Lanterns along Brightfall Avenues
  const showHoliday = save.cityEvent === 'christmas' || save.cityEvent === 'fireworks';
  if (showHoliday) {
    props.push({ id: 'prop_xmas_square', tileX: OX + 52, tileY: OY + 55, texture: 'prop_christmas_tree', solid: true });
    props.push({ id: 'prop_xmas_mall', tileX: OX + 68, tileY: OY + 52, texture: 'prop_christmas_tree', solid: true });
    props.push({ id: 'prop_xmas_station', tileX: OX + 60, tileY: OY + 39, texture: 'prop_christmas_tree', solid: true });
  }

  // Street Benches, Bus Stops & Directional Signposts
  [
    [OX + 46, OY + 46],
    [OX + 62, OY + 46],
    [OX + 46, OY + 58],
    [OX + 62, OY + 58],
    [OX + 66, OY + 40],
    [OX + 51, OY + 63],
    [OX + 61, OY + 63],
  ].forEach(([bx, by], i) => {
    props.push({ id: `prop_bench_${i}`, tileX: bx, tileY: by, texture: 'prop_bench', solid: false });
  });
  props.push({ id: 'prop_bus_station', tileX: OX + 61, tileY: OY + 40, texture: 'prop_bus_stop', solid: false });
  props.push({ id: 'prop_bus_sports', tileX: OX + 67, tileY: OY + 64, texture: 'prop_bus_stop', solid: false });
  props.push({ id: 'prop_sign_harbour', tileX: OX + 58, tileY: OY + 78, texture: 'prop_signpost', solid: false });
  props.push({ id: 'prop_sign_woods', tileX: OX + 33, tileY: OY + 56, texture: 'prop_signpost', solid: false });
  props.push({ id: 'prop_sign_newbrook', tileX: OX + 39, tileY: OY + 34, texture: 'prop_signpost', solid: false });

  // Train at Brightfall Central Station
  props.push({
    id: 'prop_express_train',
    tileX: railDone ? OX + 66 : OX + 63,
    tileY: OY + 36,
    texture: 'prop_train_car',
    solid: false,
  });

  // City Street Lanterns
  [
    [OX + 49, OY + 52],
    [OX + 61, OY + 52],
    [OX + 49, OY + 60],
    [OX + 61, OY + 60],
    [OX + 43, OY + 45],
    [OX + 68, OY + 45],
    [OX + 63, OY + 85],
    [OX + 68, OY + 85],
    [OX + 54, OY + 66],
    [OX + 44, OY + 66],
  ].forEach(([lx, ly], idx) => {
    props.push({
      id: `prop_lantern_${idx}`,
      tileX: lx,
      tileY: ly,
      texture: cafeDone || homesDone ? 'prop_lantern_on' : 'prop_lantern_off',
      solid: false,
    });
  });

  // Homestead Mailbox & Skyport Runway Props
  props.push({ id: 'prop_player_mailbox', tileX: OX + 38, tileY: OY + 56, texture: 'prop_mailbox', solid: false });
  props.push({ id: 'prop_skyport_plane_docked', tileX: OX + 81, tileY: OY + 37, texture: 'prop_skyport_plane', solid: true });
  for (let rx = OX + 78; rx <= OX + 88; rx += 2) {
    props.push({ id: `prop_rw_n_${rx}`, tileX: rx, tileY: OY + 35, texture: 'prop_runway_light', solid: false });
    props.push({ id: `prop_rw_s_${rx}`, tileX: rx, tileY: OY + 39, texture: 'prop_runway_light', solid: false });
  }
  props.push({ id: 'prop_plaza_dummy', tileX: OX + 56, tileY: OY + 72, texture: 'prop_dummy_plaza', solid: false });

  // Fantastical Crystal Spires & Bioluminescent Mushroom Groves
  [
    [OX + 17, OY + 44], [OX + 10, OY + 60], [OX + 39, OY + 14], [296, 48], [174, 34],
  ].forEach(([cx, cy], idx) => {
    props.push({ id: `prop_crystal_spire_${idx}`, tileX: cx, tileY: cy, texture: 'prop_crystal_spire', solid: true });
  });
  [
    [OX + 18, OY + 52], [OX + 24, OY + 63], [40, 140], [50, 154], [48, 228],
  ].forEach(([mx, my], idx) => {
    props.push({ id: `prop_glow_shroom_${idx}`, tileX: mx, tileY: my, texture: 'prop_glow_mushroom', solid: false });
  });

  // Underground Lift & Mirror Dimension Portal
  props.push({ id: 'prop_sub_lift', tileX: OX + 46, tileY: OY + 36, texture: 'prop_elevator_sub', solid: true });
  props.push({ id: 'prop_rift_mirror', tileX: OX + 32, tileY: OY + 40, texture: 'prop_portal_mirror', solid: true });

  // Starfall Amusement Park Props
  props.push({ id: 'prop_ferris', tileX: OX + 96, tileY: OY + 60, texture: 'prop_ferris_wheel', solid: true });
  props.push({ id: 'prop_coaster_1', tileX: OX + 102, tileY: OY + 62, texture: 'prop_coaster', solid: true });
  props.push({ id: 'prop_park_bench_1', tileX: OX + 95, tileY: OY + 64, texture: 'prop_bench', solid: false });
  if (parkDone) {
    props.push({ id: 'prop_park_tree', tileX: OX + 94, tileY: OY + 66, texture: 'prop_christmas_tree', solid: true });
  }

  // Sports Park Goals & Hoops
  props.push({ id: 'prop_goal_n', tileX: OX + 69, tileY: OY + 68, texture: 'prop_goalpost', solid: false });
  props.push({ id: 'prop_hoop_w', tileX: OX + 77, tileY: OY + 68, texture: 'prop_hoop', solid: true });

  // Rich Environmental Density Across Outer Mainland & All 6 Islands (Trees, Rocks, Ruin Arches, Campfires)
  const addTrees = (coords: [number, number][], tex: string, prefix: string, solid = true) => {
    coords.forEach(([x, y], i) => props.push({ id: `${prefix}_${i}`, tileX: x, tileY: y, texture: tex, solid }));
  };
  addTrees(
    [
      [OX + 10, OY + 44], [OX + 16, OY + 48], [OX + 24, OY + 52], [OX + 14, OY + 66],
      [OX + 25, OY + 68], [OX + 10, OY + 58], [OX + 28, OY + 56], [OX + 26, OY + 43],
      [OX + 12, OY + 50], [OX + 18, OY + 72], [OX + 27, OY + 66],
    ],
    'prop_tree_oak',
    'tree_woods'
  );
  addTrees(
    [
      [OX + 78, OY + 22], [OX + 94, OY + 20], [OX + 96, OY + 34], [OX + 82, OY + 14],
      [OX + 80, OY + 29], [OX + 99, OY + 24],
    ],
    'prop_tree_snow',
    'tree_frost'
  );
  addTrees([[272, 46], [296, 36], [322, 44], [286, 34], [306, 58], [276, 54], [318, 52]], 'prop_tree_snow', 'tree_frozen_isl');
  addTrees([[40, 232], [68, 236], [42, 212], [64, 212], [50, 246], [74, 232], [38, 224], [66, 220]], 'prop_tree_palm', 'tree_jungle_isl');
  addTrees([[32, 136], [52, 134], [54, 158], [30, 158], [60, 144], [42, 160], [26, 148]], 'prop_tree_haunted', 'tree_haunted_isl');
  addTrees([[OX + 42, OY + 88], [OX + 78, OY + 92], [OX + 52, OY + 86], [OX + 84, OY + 84]], 'prop_tree_palm', 'tree_coast');

  // Rocks, Ruins, Campfires & Statues so outer islands feel crafted everywhere
  addTrees([[OX + 40, OY + 16], [OX + 28, OY + 18], [52, 54], [38, 48], [56, 34]], 'prop_ruin_arch', 'ruin_arch');
  addTrees([[OX + 22, OY + 40], [OX + 94, OY + 27], [286, 61], [68, 224], [287, 152]], 'prop_campfire', 'world_campfire', false);
  addTrees(
    [
      [288, 138], [316, 152], [296, 160], [328, 142],
      [274, 40], [314, 48], [172, 40], [190, 38],
      [48, 30], [58, 50], [OX + 16, OY + 40], [OX + 92, OY + 18],
    ],
    'prop_rock_cluster',
    'world_rocks'
  );
  addTrees([[176, 42], [184, 42], [180, 32]], 'prop_statue', 'sky_statues');
  addTrees([[OX + 24, OY + 22], [OX + 28, OY + 22]], 'prop_flowerbed', 'nb_flowers', false);

  // Dynamic Moving Island Lighthouse Shrine
  const mi = getMovingIslandSlotCoords(save.movingIslandSlot);
  props.push({ id: 'prop_moving_shrine', tileX: mi.x, tileY: mi.y - 3, texture: 'prop_shrine', solid: true });

  // Guardian Shrines & Dungeon Waystones
  [
    { x: OX + 14, y: OY + 36, id: 'alt_woods', clear: woodsDone },
    { x: OX + 98, y: OY + 86, id: 'alt_coast', clear: coastDone },
    { x: OX + 102, y: OY + 14, id: 'alt_frost', clear: frostDone },
    { x: OX + 36, y: OY + 10, id: 'alt_kingdom', clear: kingdomDone },
    { x: 316, y: 22, id: 'alt_frozen', clear: save.defeatedGuardians.includes('frost_empress') },
    { x: 30, y: 212, id: 'alt_jungle', clear: save.defeatedGuardians.includes('jungle_titan') },
    { x: 322, y: 124, id: 'alt_volc', clear: save.defeatedGuardians.includes('magma_colossus') },
    { x: 180, y: 20, id: 'alt_sky', clear: save.defeatedGuardians.includes('sky_seraph') },
    { x: 26, y: 122, id: 'alt_haunt', clear: save.defeatedGuardians.includes('phantom_duke') },
    { x: 34, y: 24, id: 'alt_lost', clear: save.defeatedGuardians.includes('eclipse_sovereign') },
  ].forEach((a) => {
    props.push({ id: `shrine_${a.id}`, tileX: a.x, tileY: a.y, texture: a.clear ? 'prop_pillar_on' : 'prop_shrine', solid: true });
  });

  // Newbrook Village Dynamic Props
  if (save.village.buildings.includes('garden')) {
    props.push({ id: 'nb_fountain', tileX: OX + 26, tileY: OY + 24, texture: 'prop_fountain_live', solid: true });
  }
  if (save.village.buildings.length > 0) {
    props.push({ id: 'nb_lantern_1', tileX: OX + 24, tileY: OY + 23, texture: 'prop_lantern_on', solid: false });
    props.push({ id: 'nb_lantern_2', tileX: OX + 28, tileY: OY + 23, texture: 'prop_lantern_on', solid: false });
  }

  return props;
}

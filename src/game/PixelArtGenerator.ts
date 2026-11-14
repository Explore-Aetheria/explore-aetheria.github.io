import Phaser from 'phaser';
import { CHARACTERS, OUTFIT_MODIFIERS } from '../data/characters';
import { COMPANIONS } from '../data/companions';
import { NPCS } from '../data/npcs';
import { CharacterId, CompanionId, OutfitId } from '../types/game';

export const TILE_SIZE = 32;

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function seededNoise(x: number, y: number, seed = 13): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function drawTileBase(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  base: string,
  speckA: string,
  speckB: string,
  seed: number
) {
  const ox = tx * TILE_SIZE;
  const oy = ty * TILE_SIZE;
  px(ctx, ox, oy, TILE_SIZE, TILE_SIZE, base);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = seededNoise(x + tx * 16, y + ty * 16, seed);
      if (r > 0.84) px(ctx, ox + x * 2, oy + y * 2, 2, 2, speckA);
      else if (r < 0.12) px(ctx, ox + x * 2, oy + y * 2, 2, 2, speckB);
    }
  }
}

export function generateWorldTilesetCanvas(): HTMLCanvasElement {
  // 16 columns x 4 rows of 32x32 tiles = 512 x 128
  const [canvas, ctx] = createCanvas(16 * TILE_SIZE, 4 * TILE_SIZE);

  // Row 0 (0..15)
  drawTileBase(ctx, 0, 0, '#5a9954', '#6aad5d', '#498245', 1);
  px(ctx, 6, 10, 2, 4, '#79bf69');
  px(ctx, 20, 22, 2, 4, '#79bf69');

  drawTileBase(ctx, 1, 0, '#62a659', '#77bd68', '#4f8c49', 2);
  px(ctx, 38, 8, 4, 4, '#f5cc6b');
  px(ctx, 40, 10, 2, 2, '#d96b43');
  px(ctx, 54, 20, 4, 4, '#f2eee4');

  drawTileBase(ctx, 2, 0, '#b5a894', '#c7baa5', '#998c79', 3);
  ctx.strokeStyle = '#7d7160';
  ctx.lineWidth = 2;
  ctx.strokeRect(2 * 32 + 2, 2, 13, 13);
  ctx.strokeRect(2 * 32 + 17, 2, 13, 13);
  ctx.strokeRect(2 * 32 + 8, 17, 15, 13);

  drawTileBase(ctx, 3, 0, '#b88e5e', '#c99f6d', '#9e7548', 4);

  drawTileBase(ctx, 4, 0, '#366947', '#447d54', '#2a5438', 5);
  px(ctx, 4 * 32 + 10, 12, 4, 2, '#5cb874');
  px(ctx, 4 * 32 + 22, 24, 4, 2, '#5cb874');

  drawTileBase(ctx, 5, 0, '#264d36', '#316143', '#1c3b29', 6);
  drawTileBase(ctx, 6, 0, '#e3c386', '#edd198', '#cfa96b', 7);

  drawTileBase(ctx, 7, 0, '#49b5bf', '#69cdd4', '#389aa6', 8);
  px(ctx, 7 * 32 + 4, 10, 10, 2, '#9ce8eb');
  px(ctx, 7 * 32 + 16, 22, 10, 2, '#9ce8eb');

  drawTileBase(ctx, 8, 0, '#236887', '#2f7c9c', '#1a526e', 9);
  px(ctx, 8 * 32 + 6, 14, 12, 2, '#5eaec7');

  px(ctx, 9 * 32, 0, 32, 32, '#8c5a37');
  for (let y = 0; y < 32; y += 8) {
    px(ctx, 9 * 32, y, 32, 2, '#613b21');
    px(ctx, 9 * 32 + 4, y + 3, 2, 2, '#a8724b');
    px(ctx, 9 * 32 + 24, y + 3, 2, 2, '#a8724b');
  }

  drawTileBase(ctx, 10, 0, '#ddebf5', '#eef6fc', '#bfd4e6', 10);
  drawTileBase(ctx, 11, 0, '#9bd1ed', '#bce3f7', '#7db7d9', 11);
  px(ctx, 11 * 32 + 4, 6, 12, 2, '#ffffff');
  px(ctx, 11 * 32 + 14, 20, 10, 2, '#e3f4fc');

  drawTileBase(ctx, 12, 0, '#8d879e', '#a39cb5', '#746e85', 12);
  ctx.strokeStyle = '#5c566b';
  ctx.lineWidth = 2;
  ctx.strokeRect(12 * 32 + 1, 1, 30, 30);

  drawTileBase(ctx, 13, 0, '#443b59', '#574c70', '#322b42', 13);
  px(ctx, 13 * 32 + 8, 8, 16, 2, '#7c6aa3');

  drawTileBase(ctx, 14, 0, '#5a6270', '#70798a', '#434954', 14);
  px(ctx, 14 * 32, 0, 32, 6, '#8791a3');
  px(ctx, 14 * 32, 26, 32, 6, '#363b45');

  drawTileBase(ctx, 15, 0, '#1e422c', '#2c593c', '#142e1e', 15);
  px(ctx, 15 * 32 + 6, 6, 20, 16, '#2f6342');

  // Row 1 (16..31)
  px(ctx, 0, 32, 32, 32, '#99653f');
  for (let y = 32; y < 64; y += 8) px(ctx, 0, y, 32, 2, '#784c2c');

  for (let cy = 0; cy < 2; cy++) {
    for (let cx = 0; cx < 2; cx++) {
      px(ctx, 32 + cx * 16, 32 + cy * 16, 16, 16, (cx + cy) % 2 === 0 ? '#e6dac5' : '#b8825a');
    }
  }

  drawTileBase(ctx, 2, 1, '#58536e', '#6d6787', '#444057', 18);

  px(ctx, 3 * 32, 32, 32, 32, '#3d342e');
  px(ctx, 3 * 32, 32, 32, 8, '#594b42');
  px(ctx, 3 * 32, 56, 32, 8, '#2b2420');

  px(ctx, 4 * 32, 32, 32, 32, '#99653f');
  px(ctx, 4 * 32 + 4, 38, 24, 20, '#b84b3e');
  px(ctx, 4 * 32 + 6, 40, 20, 16, '#d9a44a');

  drawTileBase(ctx, 5, 1, '#8c8376', '#9e9587', '#6e665b', 21);
  px(ctx, 5 * 32 + 8, 44, 8, 2, '#4a443c');
  px(ctx, 5 * 32 + 16, 52, 6, 4, '#597d4b');

  drawTileBase(ctx, 6, 1, '#3c5439', '#4f6e49', '#2b3d28', 22);
  px(ctx, 6 * 32 + 4, 38, 24, 4, '#6e4e35');
  px(ctx, 6 * 32 + 6, 48, 20, 4, '#5e422c');

  drawTileBase(ctx, 7, 1, '#236887', '#2f7c9c', '#1a526e', 23);
  px(ctx, 7 * 32 + 4, 36, 24, 24, '#64528a');
  px(ctx, 7 * 32 + 8, 40, 16, 16, '#87d4c8');

  drawTileBase(ctx, 8, 1, '#8c8376', '#a3998b', '#696257', 24);
  px(ctx, 8 * 32, 34, 32, 6, '#b8ae9e');

  drawTileBase(ctx, 9, 1, '#6b4d37', '#7d5b42', '#573d2b', 25);

  drawTileBase(ctx, 10, 1, '#588c48', '#6ba358', '#467038', 26);
  px(ctx, 10 * 32 + 6, 38, 6, 6, '#f5cc6b');
  px(ctx, 10 * 32 + 20, 42, 6, 6, '#f09b4c');

  drawTileBase(ctx, 11, 1, '#c5dceb', '#e8f4fc', '#9bb9cf', 27);
  px(ctx, 11 * 32 + 4, 38, 24, 18, '#eef7fc');

  // Tile 28: Wild Jungle Tropical Grass
  drawTileBase(ctx, 12, 1, '#2b6e3f', '#38874f', '#1e522e', 28);
  px(ctx, 12 * 32 + 6, 42, 6, 4, '#66d18a');
  px(ctx, 12 * 32 + 18, 50, 4, 4, '#ff82a9');

  // Tile 29: Volcanic Basalt Stone
  drawTileBase(ctx, 13, 1, '#473d42', '#594c52', '#332b2f', 29);

  // Tile 30: Glowing Magma Lava (solid)
  drawTileBase(ctx, 14, 1, '#d94d26', '#f58833', '#9e2e16', 30);
  px(ctx, 14 * 32 + 6, 40, 12, 4, '#ffd466');
  px(ctx, 14 * 32 + 14, 52, 10, 4, '#ffb347');

  // Tile 31: Sky Island Cloud Marble
  drawTileBase(ctx, 15, 1, '#d8ecf7', '#eef8fc', '#b6d6e8', 31);
  px(ctx, 15 * 32 + 4, 36, 24, 2, '#f5d47a');

  // Row 2 (32..47)
  // Tile 32: Haunted Mistvale Moss
  drawTileBase(ctx, 0, 2, '#34364a', '#44465e', '#262738', 32);
  px(ctx, 8, 72, 4, 4, '#8d6eb8');

  // Tile 33: Football Pitch Turf
  px(ctx, 1 * 32, 64, 16, 32, '#479447');
  px(ctx, 1 * 32 + 16, 64, 16, 32, '#3c803c');
  px(ctx, 1 * 32, 79, 32, 2, '#e8f0e8');

  // Tile 34: Basketball Court
  drawTileBase(ctx, 2, 2, '#c4743d', '#d4864e', '#a85d2c', 34);
  px(ctx, 2 * 32, 64, 32, 2, '#f2eee4');
  px(ctx, 2 * 32, 94, 32, 2, '#f2eee4');

  // Tile 35: Orchard Farm Soil Rows
  drawTileBase(ctx, 3, 2, '#694a33', '#7d593e', '#543a27', 35);
  px(ctx, 3 * 32 + 2, 68, 28, 4, '#4e8a45');
  px(ctx, 3 * 32 + 2, 82, 28, 4, '#4e8a45');

  // Tile 36: Sky Cloud Void (solid)
  drawTileBase(ctx, 4, 2, '#82b6d9', '#a6d2ed', '#6799bd', 36);

  // Tile 37: Sunlit Cobblestone & Flagstone Boulevard (replaces sterile grey asphalt)
  drawTileBase(ctx, 5, 2, '#9e9585', '#b0a695', '#877f70', 37);
  ctx.strokeStyle = '#756d5f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(5 * 32 + 2, 66, 13, 12);
  ctx.strokeRect(5 * 32 + 17, 66, 13, 12);
  ctx.strokeRect(5 * 32 + 7, 80, 18, 13);
  px(ctx, 5 * 32, 64, 32, 2, '#c4b89f');

  // Tile 38: Railway Track Bed
  drawTileBase(ctx, 6, 2, '#6b5748', '#7d6654', '#544337', 38);
  for (let y = 66; y < 96; y += 8) px(ctx, 6 * 32 + 3, y, 26, 4, '#4a3324');
  px(ctx, 6 * 32 + 7, 64, 3, 32, '#b0bcc9');
  px(ctx, 6 * 32 + 22, 64, 3, 32, '#b0bcc9');

  // Tile 39: Starfall Amusement Park Plaza
  drawTileBase(ctx, 7, 2, '#5a4978', '#6e5a91', '#473961', 39);
  px(ctx, 7 * 32 + 4, 68, 8, 8, '#ff82a9');
  px(ctx, 7 * 32 + 20, 82, 8, 8, '#ffd466');

  // Tile 40: Underground Subterranea Crystal Stone Floor
  drawTileBase(ctx, 8, 2, '#222845', '#2e365c', '#181d33', 40);
  px(ctx, 8 * 32 + 8, 72, 6, 4, '#87d4c8');
  px(ctx, 8 * 32 + 20, 84, 4, 6, '#7be3f5');

  // Tile 41: Underground Crystal Stream (shallow glow water)
  drawTileBase(ctx, 9, 2, '#1f4d63', '#296582', '#173c4f', 41);
  px(ctx, 9 * 32 + 4, 72, 12, 2, '#87d4c8');
  px(ctx, 9 * 32 + 14, 84, 10, 2, '#a6fff2');

  // Tile 42: Tennis Court Turf
  drawTileBase(ctx, 10, 2, '#2c6b8f', '#3881ab', '#225673', 42);
  px(ctx, 10 * 32, 64, 32, 2, '#ffffff');
  px(ctx, 10 * 32 + 15, 64, 2, 32, '#e6e8ed');

  // Tile 43: Olympic Swimming Pool
  drawTileBase(ctx, 11, 2, '#3bc2db', '#5ee0f5', '#29a1b8', 43);
  px(ctx, 11 * 32, 78, 32, 3, '#f5cc6b');

  // Tile 44: Mirror Brightfall Starlight Cobble
  drawTileBase(ctx, 12, 2, '#2e416e', '#3e568f', '#213054', 44);
  px(ctx, 12 * 32 + 10, 74, 4, 4, '#a6c8ff');

  // Tile 45: Primordial Pre-Fall Golden Grass
  drawTileBase(ctx, 13, 2, '#3d8f58', '#52ab6e', '#2e7345', 45);
  px(ctx, 13 * 32 + 8, 70, 4, 4, '#ffd466');
  px(ctx, 13 * 32 + 20, 84, 4, 4, '#ffe694');

  // Tile 46: Shattered Void Chasm (solid)
  drawTileBase(ctx, 14, 2, '#190f24', '#261838', '#0f0817', 46);

  // Tile 47: Obsidian Void Platform
  drawTileBase(ctx, 15, 2, '#392852', '#4c366e', '#281b3b', 47);
  px(ctx, 15 * 32, 64, 32, 2, '#ff96e3');

  // Row 3 (48..52)
  // Tile 48: Geothermal Hot Spring Water
  drawTileBase(ctx, 0, 3, '#52c4cf', '#82e6f0', '#389aa6', 48);
  px(ctx, 8, 104, 10, 2, '#ffffff');

  // Tile 49: Decorative Mosaic Courtyard Tile
  drawTileBase(ctx, 1, 3, '#cfc1a9', '#ded2bc', '#b5a68e', 49);
  px(ctx, 32 + 10, 96 + 10, 12, 12, '#d9a44a');
  px(ctx, 32 + 13, 96 + 13, 6, 6, '#f2ead8');

  // Tile 50: Garden Blossom Hedge Border
  drawTileBase(ctx, 2, 3, '#2d6b3e', '#3c8750', '#1e4d2b', 50);
  px(ctx, 64 + 6, 102, 4, 4, '#ff82a9');
  px(ctx, 64 + 20, 110, 4, 4, '#ffd466');
  px(ctx, 64 + 12, 118, 4, 4, '#f2eee4');

  // Tile 51: Plush Hallway Carpet Runner
  drawTileBase(ctx, 3, 3, '#7a353b', '#94434a', '#5c2429', 51);
  px(ctx, 96 + 3, 96, 2, 32, '#e0a943');
  px(ctx, 96 + 27, 96, 2, 32, '#e0a943');

  // Tile 52: Polished Marble Salon Tile
  drawTileBase(ctx, 4, 3, '#dde5eb', '#edf3f7', '#c2ced6', 52);
  px(ctx, 128, 96, 32, 1, '#9fb0bf');
  px(ctx, 128, 96, 1, 32, '#9fb0bf');

  return canvas;
}

function drawCharacterFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: 'down' | 'left' | 'right' | 'up',
  frame: number,
  pal: { hair: string; coat: string; trim: string; skin: string; boots?: string; accent?: string }
) {
  const stepY = frame === 0 ? 0 : -1;
  const legL = frame === 1 ? -2 : frame === 2 ? 1 : 0;
  const legR = frame === 2 ? -2 : frame === 1 ? 1 : 0;
  const boots = pal.boots ?? '#3b2e26';

  px(ctx, ox + 8, oy + 27, 16, 4, 'rgba(0,0,0,0.28)');
  px(ctx, ox + 10, oy + 23 + legL, 4, 5, boots);
  px(ctx, ox + 18, oy + 23 + legR, 4, 5, boots);
  px(ctx, ox + 9, oy + 14 + stepY, 14, 10, pal.coat);
  px(ctx, ox + 14, oy + 15 + stepY, 4, 9, pal.trim);

  const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  if (dir === 'left') {
    px(ctx, ox + 13, oy + 15 + stepY + armSwing, 4, 7, pal.coat);
    px(ctx, ox + 13, oy + 21 + stepY + armSwing, 4, 2, pal.skin);
  } else if (dir === 'right') {
    px(ctx, ox + 15, oy + 15 + stepY + armSwing, 4, 7, pal.coat);
    px(ctx, ox + 15, oy + 21 + stepY + armSwing, 4, 2, pal.skin);
  } else {
    px(ctx, ox + 6, oy + 15 + stepY + armSwing, 3, 7, pal.coat);
    px(ctx, ox + 23, oy + 15 + stepY - armSwing, 3, 7, pal.coat);
    px(ctx, ox + 6, oy + 21 + stepY + armSwing, 3, 2, pal.skin);
    px(ctx, ox + 23, oy + 21 + stepY - armSwing, 3, 2, pal.skin);
  }

  px(ctx, ox + 9, oy + 4 + stepY, 14, 11, pal.skin);
  px(ctx, ox + 8, oy + 2 + stepY, 16, 5, pal.hair);
  if (dir === 'up') {
    px(ctx, ox + 8, oy + 4 + stepY, 16, 10, pal.hair);
  } else if (dir === 'left') {
    px(ctx, ox + 15, oy + 4 + stepY, 9, 9, pal.hair);
    px(ctx, ox + 10, oy + 9 + stepY, 2, 3, '#1f1d24');
  } else if (dir === 'right') {
    px(ctx, ox + 8, oy + 4 + stepY, 9, 9, pal.hair);
    px(ctx, ox + 20, oy + 9 + stepY, 2, 3, '#1f1d24');
  } else {
    px(ctx, ox + 8, oy + 4 + stepY, 3, 6, pal.hair);
    px(ctx, ox + 21, oy + 4 + stepY, 3, 6, pal.hair);
    px(ctx, ox + 11, oy + 9 + stepY, 2, 3, '#1f1d24');
    px(ctx, ox + 19, oy + 9 + stepY, 2, 3, '#1f1d24');
  }
  if (pal.accent) {
    px(ctx, ox + 11, oy + 3 + stepY, 10, 2, pal.accent);
  }
}

function buildSpritesheetCanvas(pal: {
  hair: string;
  coat: string;
  trim: string;
  skin: string;
  boots?: string;
  accent?: string;
}): HTMLCanvasElement {
  const [c, ctx] = createCanvas(3 * 32, 4 * 32);
  const dirs: ('down' | 'left' | 'right' | 'up')[] = ['down', 'left', 'right', 'up'];
  dirs.forEach((dir, row) => {
    for (let col = 0; col < 3; col++) {
      drawCharacterFrame(ctx, col * 32, row * 32, dir, col, pal);
    }
  });
  return c;
}

export function getCharacterPortraitDataUrl(charId: CharacterId, outfit: OutfitId = 'default'): string {
  const def = CHARACTERS[charId] ?? CHARACTERS.explorer;
  const mod = OUTFIT_MODIFIERS[outfit] ?? OUTFIT_MODIFIERS.default;
  const [c, ctx] = createCanvas(32, 32);
  drawCharacterFrame(ctx, 0, 2, 'down', 0, {
    ...def.palette,
    coat: mod.coatTint ?? def.palette.coat,
    trim: mod.trimTint ?? def.palette.trim,
  });
  return c.toDataURL();
}

export function getNpcPortraitDataUrl(npcId: string): string {
  const npc = NPCS.find((n) => n.id === npcId) ?? NPCS[0];
  const [c, ctx] = createCanvas(32, 32);
  if (npc) {
    drawCharacterFrame(ctx, 0, 2, 'down', 0, {
      hair: npc.palette.hair,
      coat: npc.palette.outfit,
      trim: npc.palette.trim,
      skin: npc.palette.skin,
    });
  }
  return c.toDataURL();
}

function drawCompanionSprite(ctx: CanvasRenderingContext2D, compId: CompanionId, frame: number) {
  const pal = COMPANIONS[compId].palette;
  const bob = frame === 1 ? -2 : 0;
  px(ctx, 6, 19, 12, 3, 'rgba(0,0,0,0.28)');
  if (compId === 'comp_owl' || compId === 'comp_firefly') {
    const wingY = frame === 1 ? 6 : 10;
    px(ctx, 2, wingY, 5, 5, pal.secondary);
    px(ctx, 17, wingY, 5, 5, pal.secondary);
    px(ctx, 7, 6 + bob, 10, 10, pal.primary);
    px(ctx, 9, 9 + bob, 6, 6, pal.accent);
    px(ctx, 9, 8 + bob, 2, 2, pal.eye);
    px(ctx, 13, 8 + bob, 2, 2, pal.eye);
  } else if (compId === 'comp_ember') {
    px(ctx, 9, 3 + bob, 6, 4, pal.accent);
    px(ctx, 6, 6 + bob, 12, 11, pal.primary);
    px(ctx, 8, 9 + bob, 8, 7, pal.secondary);
    px(ctx, 9, 10 + bob, 2, 2, pal.eye);
    px(ctx, 13, 10 + bob, 2, 2, pal.eye);
  } else {
    // Fox, Otter, Golem quadruped/chibi body
    px(ctx, 3, 12 + bob, 4, 4, pal.accent); // Tail
    px(ctx, 6, 10 + bob, 12, 9, pal.primary);
    px(ctx, 8, 12 + bob, 8, 6, pal.secondary);
    px(ctx, 7, 4 + bob, 3, 3, pal.primary); // Ears
    px(ctx, 14, 4 + bob, 3, 3, pal.primary);
    px(ctx, 7, 6 + bob, 10, 7, pal.primary);
    px(ctx, 9, 8 + bob, 2, 2, pal.eye);
    px(ctx, 13, 8 + bob, 2, 2, pal.eye);
    px(ctx, 7, 18 + (frame === 1 ? -1 : 0), 3, 3, pal.primary);
    px(ctx, 14, 18 + (frame === 1 ? 0 : -1), 3, 3, pal.primary);
  }
}

export function getCompanionPortraitDataUrl(compId: CompanionId): string {
  const [c, ctx] = createCanvas(24, 24);
  drawCompanionSprite(ctx, compId, 0);
  return c.toDataURL();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  roofColor: string,
  roofShadow: string,
  wallColor: string,
  trimColor: string,
  damaged: boolean,
  awning?: string,
  lanternGlow?: boolean
) {
  px(ctx, 4, h - 8, w - 8, 8, 'rgba(0,0,0,0.28)');
  px(ctx, 6, 30, w - 12, h - 34, wallColor);
  px(ctx, 6, 30, w - 12, 4, 'rgba(0,0,0,0.18)');
  px(ctx, 6, 30, 4, h - 34, trimColor);
  px(ctx, w - 10, 30, 4, h - 34, trimColor);
  px(ctx, 2, 6, w - 4, 28, roofColor);
  px(ctx, 6, 2, w - 12, 8, roofShadow);
  px(ctx, 2, 30, w - 4, 4, roofShadow);
  if (damaged) {
    px(ctx, 18, 10, 16, 10, '#362c27');
    px(ctx, 22, 12, 10, 6, '#1f1916');
    px(ctx, w - 34, 16, 12, 8, '#362c27');
  }
  const doorX = Math.floor(w / 2) - 10;
  px(ctx, doorX, h - 28, 20, 24, '#593924');
  px(ctx, doorX + 2, h - 26, 16, 22, '#734b30');
  px(ctx, doorX + 14, h - 16, 3, 3, '#e4b363');

  const winColor = damaged ? '#42474f' : lanternGlow ? '#ffd97d' : '#85c4d6';
  px(ctx, 14, 44, 14, 14, '#3d2d24');
  px(ctx, 16, 46, 10, 10, winColor);
  px(ctx, w - 28, 44, 14, 14, '#3d2d24');
  px(ctx, w - 26, 46, 10, 10, winColor);

  if (awning && !damaged) {
    for (let x = 10; x < w - 10; x += 12) {
      px(ctx, x, 34, 6, 10, awning);
      px(ctx, x + 6, 34, 6, 10, '#f3efe6');
    }
  }
}

export function registerAllGameTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('world_tiles')) return;

  const tilesCanvas = generateWorldTilesetCanvas();
  scene.textures.addCanvas('world_tiles', tilesCanvas);

  // Playable Character Spritesheets (10 chars x 5 outfits)
  const allOutfits: OutfitId[] = ['default', 'festival', 'starlight', 'coastal', 'alpine'];
  (Object.keys(CHARACTERS) as CharacterId[]).forEach((charId) => {
    const def = CHARACTERS[charId];
    allOutfits.forEach((outfit) => {
      const mod = OUTFIT_MODIFIERS[outfit];
      const key = `char_${charId}_${outfit}`;
      const sheet = buildSpritesheetCanvas({
        ...def.palette,
        coat: mod.coatTint ?? def.palette.coat,
        trim: mod.trimTint ?? def.palette.trim,
      });
      scene.textures.addSpriteSheet(key, sheet as unknown as HTMLImageElement, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  });

  NPCS.forEach((npc) => {
    const key = npc.id;
    const sheet = buildSpritesheetCanvas({
      hair: npc.palette.hair,
      coat: npc.palette.outfit,
      trim: npc.palette.trim,
      skin: npc.palette.skin,
    });
    scene.textures.addSpriteSheet(key, sheet as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32,
    });
  });

  // Lightweight city resident crowd appearances
  const crowdPalettes = [
    { hair: '#3d2b1f', coat: '#385f8c', trim: '#e0a943', skin: '#e8ba93' },
    { hair: '#a65732', coat: '#9e3e3e', trim: '#f2e8d5', skin: '#f2c9a0' },
    { hair: '#212329', coat: '#3b7d54', trim: '#f5cc6b', skin: '#c98e6a' },
    { hair: '#d9b566', coat: '#5a4378', trim: '#e6c580', skin: '#f2cba8' },
    { hair: '#593326', coat: '#c46c3b', trim: '#eef5f8', skin: '#d89b72' },
    { hair: '#8c8780', coat: '#2c4c5e', trim: '#d96b43', skin: '#ecc4a0' },
  ];
  crowdPalettes.forEach((pal, idx) => {
    const key = `crowd_ped_${idx}`;
    const sheet = buildSpritesheetCanvas(pal);
    scene.textures.addSpriteSheet(key, sheet as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32,
    });
  });

  const addBldg = (key: string, w: number, h: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
    const [c, ctx] = createCanvas(w, h);
    drawFn(ctx);
    scene.textures.addCanvas(key, c);
  };

  addBldg('bldg_cafe_damaged', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#7a5748', '#593d32', '#cfc4b2', '#6b5545', true));
  addBldg('bldg_cafe_restored', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#c45b42', '#943e2a', '#efe4cf', '#7d5336', false, '#d96b43', true);
    px(ctx, 56, 12, 16, 12, '#f5cc6b'); // Golden coffee sign crest
    px(ctx, 14, 58, 14, 5, '#5cb874'); // Window flowerbox
    px(ctx, 100, 58, 14, 5, '#5cb874');
  });
  addBldg('bldg_restoration_hall', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#386375', '#254754', '#e8decb', '#755033', false, undefined, true));
  addBldg('bldg_atelier', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#5a4378', '#3e2c57', '#ebe1cf', '#6e4d36', false, '#e0a943', true));
  addBldg('bldg_training', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#a84f3d', '#7a3527', '#dfd4bf', '#694a33', false, undefined, true));
  addBldg('bldg_cottage_damaged', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#6e655c', '#4d4640', '#bfb5a4', '#635345', true));
  addBldg('bldg_cottage_restored', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#3f7d58', '#2a593d', '#ede3cf', '#755033', false, undefined, true));
  addBldg('bldg_player_house', 96, 96, (ctx) => {
    drawBuilding(ctx, 96, 96, '#d16b47', '#9e4729', '#f2e8d5', '#755033', false, '#e0a943', true);
    px(ctx, 72, 2, 10, 14, '#7d4d3a'); // Brick chimney
    px(ctx, 71, 0, 12, 4, '#b8a898');
    px(ctx, 6, 86, 84, 6, '#8f887d'); // Stone foundation
    px(ctx, 13, 58, 16, 6, '#3d7d47'); // Window boxes + blossoms
    px(ctx, 16, 56, 4, 3, '#ff82a9');
    px(ctx, 67, 58, 16, 6, '#3d7d47');
    px(ctx, 72, 56, 4, 3, '#ffd466');
  });
  addBldg('bldg_supermarket', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#2f7d57', '#1e573b', '#f2eee4', '#5c4b3b', false, '#3ea870', true);
    px(ctx, 44, 12, 40, 10, '#66d18a'); // Fresh Mart awning crest
    px(ctx, 50, 14, 28, 6, '#f2eee4');
  });
  addBldg('bldg_restaurant', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#b8423b', '#872923', '#ebe0cc', '#6e4930', false, '#e0a943', true));
  addBldg('bldg_smithy', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#4f5663', '#363b45', '#d4c9b8', '#4d3a2c', false, undefined, true));
  addBldg('bldg_haunted_manor', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#44335c', '#2b1e3d', '#8c839e', '#3c344f', false, undefined, true));
  addBldg('bldg_sky_pavilion', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#5897bf', '#396f94', '#edf6fc', '#d4af57', false, '#f5d47a', true));

  // New Metropolis Buildings
  addBldg('bldg_hospital', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#387d99', '#24586e', '#f2f7fa', '#9eb5c2', false, undefined, true);
    px(ctx, 59, 10, 10, 20, '#e05a47');
    px(ctx, 54, 15, 20, 10, '#e05a47');
  });
  addBldg('bldg_library', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#5c4278', '#3c2952', '#ebe2d0', '#8c7256', false, '#f5cc6b', true);
    px(ctx, 54, 10, 20, 12, '#ffd466');
    px(ctx, 20, 36, 6, 52, '#d4c5a9'); // Library columns
    px(ctx, 102, 36, 6, 52, '#d4c5a9');
  });
  addBldg('bldg_station', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#2f455c', '#1e2f40', '#dcd3c2', '#6e5038', false, '#d96b43', true);
    px(ctx, 50, 0, 28, 28, '#23364a'); // Iconic Station Clocktower
    px(ctx, 54, 4, 20, 20, '#f2eee4');
    px(ctx, 63, 7, 3, 8, '#1f2329');
    px(ctx, 63, 13, 6, 3, '#1f2329');
    px(ctx, 22, 66, 16, 26, '#48b8c9'); // Arched glass platform doors
    px(ctx, 90, 66, 16, 26, '#48b8c9');
  });
  addBldg('bldg_skyport', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#2a6b82', '#1b4757', '#e6eff5', '#d4af57', false, '#6ae0d6', true);
    px(ctx, 92, 0, 26, 40, '#1e4a5c'); // Control tower overlooking runway
    px(ctx, 96, 8, 18, 12, '#7be3f5');
    px(ctx, 103, 0, 4, 8, '#ffd466');
    px(ctx, 42, 6, 36, 10, '#f5cc6b'); // Skyport wing banner
    px(ctx, 48, 8, 24, 6, '#1b4757');
  });
  addBldg('bldg_cinema', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#7a2b57', '#521a39', '#382a45', '#f5cc6b', false, '#ff82a9', true);
    px(ctx, 34, 12, 60, 14, '#ffd466');
    px(ctx, 38, 15, 52, 8, '#7a2b57');
    for (let bx = 36; bx <= 90; bx += 8) {
      px(ctx, bx, 12, 3, 3, '#fff7cc');
    }
  });
  addBldg('bldg_mall', 160, 96, (ctx) => {
    drawBuilding(ctx, 160, 96, '#396b8c', '#24475e', '#f2ead8', '#d49a57', false, '#e0a943', true);
    px(ctx, 44, 10, 72, 14, '#7be3f5'); // Glass skylight atrium
    px(ctx, 50, 13, 60, 8, '#c7f5ff');
  });
  addBldg('bldg_police', 96, 96, (ctx) => {
    drawBuilding(ctx, 96, 96, '#274469', '#192d47', '#dfe6f0', '#5a6b80', false, undefined, true);
    px(ctx, 42, 6, 12, 10, '#7be3f5');
    px(ctx, 34, 8, 6, 6, '#e05a47');
  });
  addBldg('bldg_firestation', 96, 96, (ctx) => {
    drawBuilding(ctx, 96, 96, '#b83b32', '#82231c', '#ebded4', '#5c4b3b', false, '#ffd466', true);
    px(ctx, 42, 8, 12, 10, '#ffd466');
  });
  addBldg('bldg_tackle', 96, 96, (ctx) => {
    drawBuilding(ctx, 96, 96, '#24667d', '#164354', '#e8dfc9', '#6e4e35', false, '#48b8c9', true);
  });
  addBldg('bldg_town_hall', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#3f6e50', '#274a33', '#f0e5d1', '#b5894d', false, '#e4b363', true);
  });
  addBldg('bldg_dungeon_gate', 96, 96, (ctx) => {
    px(ctx, 6, 10, 84, 82, '#3d3f4d');
    px(ctx, 14, 18, 68, 74, '#56596e');
    px(ctx, 28, 36, 40, 56, '#14131c');
    px(ctx, 38, 10, 20, 12, '#c792ea');
  });

  addBldg('bldg_market_damaged', 128, 64, (ctx) => {
    px(ctx, 6, 16, 116, 44, '#6e5846');
    px(ctx, 12, 8, 104, 14, '#7a7066');
  });
  addBldg('bldg_market_restored', 128, 64, (ctx) => {
    px(ctx, 6, 18, 116, 42, '#8c5e3c');
    for (let x = 8; x < 120; x += 16) {
      px(ctx, x, 6, 8, 16, '#d96b43');
      px(ctx, x + 8, 6, 8, 16, '#f2eee4');
    }
    px(ctx, 18, 36, 14, 10, '#f5cc6b');
    px(ctx, 50, 36, 14, 10, '#5cb874');
    px(ctx, 84, 36, 14, 10, '#6ae0d6');
  });
  addBldg('bldg_lodge', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#dcebf5', '#a9c3d9', '#7d563c', '#523624', false, undefined, true));
  addBldg('bldg_lighthouse_damaged', 64, 128, (ctx) => {
    px(ctx, 18, 16, 28, 108, '#9e978b');
    px(ctx, 14, 6, 36, 16, '#57534d');
    px(ctx, 24, 100, 16, 24, '#4f3320');
  });
  addBldg('bldg_lighthouse_restored', 64, 128, (ctx) => {
    px(ctx, 18, 16, 28, 108, '#f0e9dc');
    px(ctx, 18, 42, 28, 16, '#c45b42');
    px(ctx, 18, 76, 28, 16, '#c45b42');
    px(ctx, 14, 4, 36, 18, '#284c6b');
    px(ctx, 22, 8, 20, 10, '#ffe27a');
    px(ctx, 24, 100, 16, 24, '#6b4228');
  });

  // Distinct Island Architectural Styles
  addBldg('bldg_jungle_hut', 96, 96, (ctx) => {
    px(ctx, 10, 74, 8, 18, '#6b452b');
    px(ctx, 78, 74, 8, 18, '#6b452b');
    px(ctx, 6, 68, 84, 8, '#8c5e3c');
    px(ctx, 12, 36, 72, 34, '#b88c5a');
    px(ctx, 4, 10, 88, 28, '#4e8c45');
    px(ctx, 10, 4, 76, 14, '#73b359');
    px(ctx, 38, 44, 20, 26, '#3d281a');
    px(ctx, 20, 44, 10, 10, '#ffd466');
    px(ctx, 66, 44, 10, 10, '#ffd466');
  });
  addBldg('bldg_volcanic_forge', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#4d3a40', '#2b1e22', '#5e5056', '#9e4729', false, undefined, true);
    px(ctx, 88, 2, 16, 26, '#383036');
    px(ctx, 90, 0, 12, 5, '#ff884d');
    px(ctx, 18, 46, 12, 10, '#ff884d');
    px(ctx, 98, 46, 12, 10, '#ff884d');
  });
  addBldg('bldg_lost_temple', 128, 96, (ctx) => {
    drawBuilding(ctx, 128, 96, '#87795c', '#5e533d', '#cfc1a3', '#e0a943', false, undefined, true);
    px(ctx, 48, 2, 32, 16, '#ffd466');
    px(ctx, 14, 34, 8, 56, '#ebe0c7');
    px(ctx, 106, 34, 8, 56, '#ebe0c7');
  });

  const addProp = (key: string, w: number, h: number, fn: (ctx: CanvasRenderingContext2D) => void) => {
    const [c, ctx] = createCanvas(w, h);
    fn(ctx);
    scene.textures.addCanvas(key, c);
  };

  // Boats (3 skins)
  addProp('prop_boat', 48, 48, (ctx) => {
    px(ctx, 10, 24, 28, 14, '#7d4d2c');
    px(ctx, 14, 36, 20, 6, '#59341c');
    px(ctx, 22, 6, 4, 24, '#d9c4a3');
    px(ctx, 26, 8, 14, 16, '#f5efe2');
    px(ctx, 16, 10, 6, 12, '#e0a943');
  });
  addProp('prop_boat_schooner', 52, 52, (ctx) => {
    px(ctx, 8, 26, 36, 14, '#6b4125');
    px(ctx, 12, 38, 28, 6, '#4a2b16');
    px(ctx, 24, 4, 4, 28, '#e8dbc1');
    px(ctx, 28, 6, 16, 18, '#9ee8ff');
    px(ctx, 14, 10, 10, 14, '#f5cc6b');
  });
  addProp('prop_boat_galleon', 56, 56, (ctx) => {
    px(ctx, 6, 28, 44, 16, '#4f2c1b');
    px(ctx, 10, 42, 36, 6, '#361d11');
    px(ctx, 26, 4, 4, 30, '#f0d8a8');
    px(ctx, 30, 6, 18, 20, '#ffd466');
    px(ctx, 12, 8, 14, 16, '#ff82a9');
  });

  // Flying Airships
  const drawAirship = (hull: string, trim: string) => (ctx: CanvasRenderingContext2D) => {
    px(ctx, 12, 38, 40, 12, '#593924'); // Gondola
    px(ctx, 18, 30, 28, 10, '#8c5e3c');
    px(ctx, 6, 8, 52, 24, hull);
    px(ctx, 12, 4, 40, 6, trim);
    px(ctx, 10, 18, 44, 4, trim);
    px(ctx, 2, 14, 6, 12, '#a3c9e0');
    px(ctx, 56, 14, 6, 12, '#a3c9e0');
  };
  addProp('prop_airship_gold', 64, 56, drawAirship('#e0a943', '#fff2cc'));
  addProp('prop_airship_azure', 64, 56, drawAirship('#3988b8', '#9ee8ff'));
  addProp('prop_airship_crimson', 64, 56, drawAirship('#b83e48', '#ffd466'));

  // Giant Roaming Creatures (for [P] Photography!)
  addProp('giant_mammoth', 80, 72, (ctx) => {
    px(ctx, 14, 58, 52, 10, 'rgba(0,0,0,0.28)');
    px(ctx, 16, 18, 48, 36, '#5c4132');
    px(ctx, 20, 10, 40, 16, '#755340');
    px(ctx, 18, 46, 10, 16, '#4a3327');
    px(ctx, 48, 46, 10, 16, '#4a3327');
    px(ctx, 56, 26, 16, 16, '#6e4e3c');
    px(ctx, 64, 34, 12, 6, '#f2eee4'); // Ivory tusk
    px(ctx, 22, 12, 36, 6, '#e6f3fa'); // Snow frost back
  });
  addProp('giant_stag', 72, 72, (ctx) => {
    px(ctx, 14, 58, 44, 10, 'rgba(0,0,0,0.25)');
    px(ctx, 20, 28, 34, 24, '#4b7a52');
    px(ctx, 22, 44, 6, 18, '#3d2c22');
    px(ctx, 44, 44, 6, 18, '#3d2c22');
    px(ctx, 44, 16, 16, 16, '#66d18a');
    px(ctx, 40, 2, 6, 16, '#f5cc6b'); // Glowing antlers
    px(ctx, 54, 2, 6, 16, '#f5cc6b');
  });
  addProp('giant_whale', 88, 64, (ctx) => {
    px(ctx, 10, 24, 64, 28, '#285678');
    px(ctx, 16, 18, 52, 16, '#397ea8');
    px(ctx, 20, 38, 44, 12, '#b8e3fa');
    px(ctx, 68, 18, 16, 20, '#1e425e');
    px(ctx, 28, 8, 6, 12, '#e3f9ff'); // Spout
  });
  addProp('giant_manta', 80, 64, (ctx) => {
    px(ctx, 6, 22, 68, 16, '#3c6e9c');
    px(ctx, 22, 14, 36, 30, '#5aa2d6');
    px(ctx, 34, 42, 12, 18, '#9ee8ff');
    px(ctx, 28, 22, 24, 8, '#ffd466');
  });

  // New Festive & Theme Park Props
  addProp('prop_christmas_tree', 56, 76, (ctx) => {
    px(ctx, 16, 64, 24, 8, 'rgba(0,0,0,0.26)');
    px(ctx, 23, 52, 10, 16, '#5c3b24');
    px(ctx, 8, 38, 40, 18, '#1f5e3b');
    px(ctx, 12, 24, 32, 18, '#297a4d');
    px(ctx, 18, 10, 20, 18, '#349961');
    px(ctx, 25, 2, 6, 8, '#ffd466'); // Star
    px(ctx, 16, 42, 4, 4, '#ff6b6b');
    px(ctx, 34, 44, 4, 4, '#ffd466');
    px(ctx, 22, 28, 4, 4, '#7be3f5');
    px(ctx, 30, 18, 4, 4, '#ff82a9');
  });
  addProp('prop_ferris_wheel', 96, 96, (ctx) => {
    px(ctx, 28, 72, 8, 22, '#5c6473');
    px(ctx, 60, 72, 8, 22, '#5c6473');
    ctx.strokeStyle = '#ffd466';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(48, 42, 34, 0, Math.PI * 2);
    ctx.stroke();
    px(ctx, 44, 38, 8, 8, '#ff82a9');
    px(ctx, 44, 4, 8, 8, '#7be3f5');
    px(ctx, 10, 38, 8, 8, '#66d18a');
    px(ctx, 78, 38, 8, 8, '#f5cc6b');
    px(ctx, 44, 72, 8, 8, '#ff82a9');
  });
  addProp('prop_coaster', 96, 64, (ctx) => {
    px(ctx, 10, 34, 6, 26, '#5a6270');
    px(ctx, 46, 18, 6, 42, '#5a6270');
    px(ctx, 80, 32, 6, 28, '#5a6270');
    px(ctx, 4, 28, 32, 8, '#e05a47');
    px(ctx, 32, 14, 32, 8, '#ffd466');
    px(ctx, 60, 26, 32, 8, '#7be3f5');
  });
  addProp('prop_train_car', 64, 40, (ctx) => {
    px(ctx, 4, 10, 56, 22, '#2d5375');
    px(ctx, 8, 6, 48, 6, '#e0a943');
    px(ctx, 12, 16, 10, 8, '#a6e3ff');
    px(ctx, 27, 16, 10, 8, '#a6e3ff');
    px(ctx, 42, 16, 10, 8, '#a6e3ff');
    px(ctx, 12, 32, 8, 6, '#1f2329');
    px(ctx, 44, 32, 8, 6, '#1f2329');
  });
  addProp('prop_portal_mirror', 48, 56, (ctx) => {
    px(ctx, 8, 6, 32, 46, '#394b7a');
    px(ctx, 14, 12, 20, 34, '#a6c8ff');
    px(ctx, 20, 18, 8, 22, '#ffffff');
  });
  addProp('prop_portal_verdant', 48, 56, (ctx) => {
    px(ctx, 8, 6, 32, 46, '#27593b');
    px(ctx, 14, 12, 20, 34, '#66d18a');
    px(ctx, 20, 18, 8, 22, '#fff2b8');
  });
  addProp('prop_portal_void', 48, 56, (ctx) => {
    px(ctx, 8, 6, 32, 46, '#391b4d');
    px(ctx, 14, 12, 20, 34, '#ff96e3');
    px(ctx, 20, 18, 8, 22, '#ffffff');
  });
  addProp('prop_elevator_sub', 48, 56, (ctx) => {
    px(ctx, 6, 8, 36, 44, '#455469');
    px(ctx, 12, 16, 24, 32, '#1f2738');
    px(ctx, 16, 20, 16, 12, '#87d4c8');
  });
  addProp('prop_bench', 36, 20, (ctx) => {
    px(ctx, 2, 4, 32, 8, '#8c5a37');
    px(ctx, 4, 12, 4, 6, '#3d2b1f');
    px(ctx, 28, 12, 4, 6, '#3d2b1f');
  });
  addProp('prop_bus_stop', 36, 48, (ctx) => {
    px(ctx, 4, 12, 28, 28, 'rgba(130, 210, 240, 0.45)');
    px(ctx, 2, 8, 32, 6, '#d96b43');
    px(ctx, 4, 14, 4, 30, '#5a6270');
    px(ctx, 28, 14, 4, 30, '#5a6270');
  });
  addProp('prop_treasure_crate', 32, 32, (ctx) => {
    px(ctx, 6, 10, 20, 16, '#9e6538');
    px(ctx, 8, 12, 16, 4, '#ffd466');
  });

  addProp('prop_goalpost', 64, 32, (ctx) => {
    px(ctx, 4, 6, 4, 24, '#ffffff');
    px(ctx, 56, 6, 4, 24, '#ffffff');
    px(ctx, 4, 4, 56, 4, '#ffffff');
    px(ctx, 8, 8, 48, 16, 'rgba(255,255,255,0.22)');
  });

  addProp('prop_hoop', 32, 48, (ctx) => {
    px(ctx, 14, 20, 4, 26, '#5a6270');
    px(ctx, 6, 6, 20, 14, '#f2eee4');
    px(ctx, 11, 14, 10, 4, '#d96b43');
  });

  addProp('prop_tree_oak', 48, 64, (ctx) => {
    px(ctx, 16, 52, 16, 8, 'rgba(0,0,0,0.25)');
    px(ctx, 19, 36, 10, 22, '#6b452b');
    px(ctx, 6, 12, 36, 28, '#2d633a');
    px(ctx, 10, 6, 28, 24, '#3d824d');
    px(ctx, 14, 10, 16, 12, '#57a365');
  });

  addProp('prop_tree_pine', 48, 64, (ctx) => {
    px(ctx, 16, 52, 16, 8, 'rgba(0,0,0,0.25)');
    px(ctx, 20, 42, 8, 16, '#573824');
    px(ctx, 8, 30, 32, 16, '#234f3b');
    px(ctx, 12, 18, 24, 16, '#2d634a');
    px(ctx, 16, 6, 16, 16, '#397d5e');
  });

  addProp('prop_tree_snow', 48, 64, (ctx) => {
    px(ctx, 16, 52, 16, 8, 'rgba(0,0,0,0.22)');
    px(ctx, 20, 42, 8, 16, '#573824');
    px(ctx, 8, 30, 32, 16, '#2e5461');
    px(ctx, 10, 28, 28, 6, '#e6f3fa');
    px(ctx, 12, 18, 24, 14, '#3b6a7a');
    px(ctx, 14, 16, 20, 6, '#eef7fc');
    px(ctx, 18, 6, 12, 12, '#eef7fc');
  });

  addProp('prop_tree_palm', 48, 64, (ctx) => {
    px(ctx, 16, 52, 16, 8, 'rgba(0,0,0,0.2)');
    px(ctx, 21, 22, 6, 36, '#8c6239');
    px(ctx, 6, 14, 36, 8, '#4e9c58');
    px(ctx, 12, 6, 24, 10, '#66b86b');
  });

  addProp('prop_tree_haunted', 48, 64, (ctx) => {
    px(ctx, 16, 52, 16, 8, 'rgba(0,0,0,0.28)');
    px(ctx, 19, 36, 10, 22, '#3d3347');
    px(ctx, 6, 12, 36, 28, '#3b2c52');
    px(ctx, 10, 6, 28, 22, '#533e73');
  });

  addProp('prop_fountain_dry', 64, 64, (ctx) => {
    px(ctx, 6, 20, 52, 34, '#8f887d');
    px(ctx, 12, 24, 40, 24, '#5e5850');
    px(ctx, 26, 12, 12, 24, '#9e978b');
  });

  addProp('prop_fountain_live', 64, 64, (ctx) => {
    px(ctx, 6, 20, 52, 34, '#b8b0a2');
    px(ctx, 12, 24, 40, 24, '#4ab8c4');
    px(ctx, 16, 28, 32, 16, '#7be0e8');
    px(ctx, 26, 10, 12, 24, '#cfc7b8');
    px(ctx, 28, 4, 8, 8, '#a6f4fa');
  });

  addProp('prop_noticeboard', 48, 48, (ctx) => {
    px(ctx, 8, 10, 32, 24, '#7d502d');
    px(ctx, 12, 14, 24, 16, '#e8dbc1');
    px(ctx, 14, 16, 8, 6, '#d96b43');
    px(ctx, 24, 18, 10, 8, '#48b8c9');
    px(ctx, 12, 34, 6, 12, '#59371e');
    px(ctx, 30, 34, 6, 12, '#59371e');
  });

  addProp('prop_lantern_off', 16, 36, (ctx) => {
    px(ctx, 6, 14, 4, 20, '#3e424a');
    px(ctx, 4, 6, 8, 10, '#5a606b');
  });

  addProp('prop_lantern_on', 16, 36, (ctx) => {
    px(ctx, 6, 14, 4, 20, '#3e424a');
    px(ctx, 4, 6, 8, 10, '#ffd466');
    px(ctx, 6, 8, 4, 6, '#fff7cc');
  });

  addProp('prop_chest_closed', 32, 32, (ctx) => {
    px(ctx, 4, 10, 24, 18, '#8c532b');
    px(ctx, 4, 10, 24, 6, '#a86738');
    px(ctx, 4, 16, 24, 2, '#e4b363');
    px(ctx, 14, 14, 4, 6, '#ffd466');
  });

  addProp('prop_chest_open', 32, 32, (ctx) => {
    px(ctx, 4, 14, 24, 14, '#8c532b');
    px(ctx, 6, 8, 20, 8, '#543018');
    px(ctx, 10, 14, 12, 4, '#ffd466');
  });

  addProp('prop_shrine', 48, 48, (ctx) => {
    px(ctx, 8, 28, 32, 16, '#6f7887');
    px(ctx, 14, 12, 20, 20, '#8d97a8');
    px(ctx, 18, 16, 12, 12, '#6ae0d6');
    px(ctx, 21, 19, 6, 6, '#ffffff');
  });

  addProp('prop_cave_arch', 64, 64, (ctx) => {
    px(ctx, 6, 8, 52, 52, '#4a4e57');
    px(ctx, 14, 20, 36, 40, '#181a21');
    px(ctx, 10, 8, 44, 10, '#686e7a');
  });

  addProp('prop_pillar_off', 32, 48, (ctx) => {
    px(ctx, 6, 12, 20, 32, '#5a616e');
    px(ctx, 12, 18, 8, 12, '#3a3f47');
  });

  addProp('prop_pillar_on', 32, 48, (ctx) => {
    px(ctx, 6, 12, 20, 32, '#7c8696');
    px(ctx, 12, 18, 8, 12, '#ffd466');
    px(ctx, 10, 4, 12, 8, '#7be0e8');
  });

  addProp('prop_collectible_berry', 24, 24, (ctx) => {
    px(ctx, 4, 8, 16, 12, '#3d7d47');
    px(ctx, 8, 6, 6, 6, '#f09b4c');
    px(ctx, 13, 10, 6, 6, '#f5cc6b');
  });

  addProp('prop_collectible_shard', 24, 24, (ctx) => {
    px(ctx, 10, 2, 4, 20, '#6ae0d6');
    px(ctx, 6, 8, 12, 8, '#4cb8c4');
    px(ctx, 10, 6, 4, 8, '#e3ffff');
  });

  addProp('prop_collectible_fern', 24, 24, (ctx) => {
    px(ctx, 10, 6, 4, 14, '#4eb86b');
    px(ctx, 6, 10, 12, 4, '#77e394');
    px(ctx, 8, 6, 8, 4, '#a6ffc0');
  });

  addProp('prop_collectible_crate', 24, 24, (ctx) => {
    px(ctx, 4, 6, 16, 14, '#a36839');
    px(ctx, 6, 8, 12, 10, '#c7834c');
    px(ctx, 8, 10, 8, 6, '#e4b363');
  });

  addProp('prop_collectible_orchid', 24, 24, (ctx) => {
    px(ctx, 10, 10, 4, 10, '#38874f');
    px(ctx, 6, 4, 12, 8, '#ff82a9');
    px(ctx, 10, 6, 4, 4, '#ffd466');
  });

  addProp('prop_collectible_ore', 24, 24, (ctx) => {
    px(ctx, 4, 8, 16, 12, '#4d4147');
    px(ctx, 8, 6, 8, 8, '#ff7b47');
    px(ctx, 10, 8, 4, 4, '#ffd466');
  });

  // Enemies (legacy fallbacks + 14 bespoke elemental species)
  addProp('enemy_bramble', 32, 32, (ctx) => {
    px(ctx, 6, 8, 20, 18, '#54355e');
    px(ctx, 4, 14, 24, 8, '#6e457a');
    px(ctx, 10, 14, 4, 4, '#ff7b7b');
    px(ctx, 18, 14, 4, 4, '#ff7b7b');
  });
  addProp('enemy_crab', 32, 32, (ctx) => {
    px(ctx, 6, 12, 20, 14, '#b84a42');
    px(ctx, 2, 8, 6, 8, '#d96b43');
    px(ctx, 24, 8, 6, 8, '#d96b43');
    px(ctx, 11, 14, 3, 3, '#fff0b8');
    px(ctx, 18, 14, 3, 3, '#fff0b8');
  });
  addProp('enemy_wisp', 32, 32, (ctx) => {
    px(ctx, 8, 6, 16, 18, '#4a6b9e');
    px(ctx, 11, 10, 10, 10, '#94d1ff');
    px(ctx, 12, 12, 3, 3, '#1d2842');
    px(ctx, 17, 12, 3, 3, '#1d2842');
  });
  addProp('enemy_echo', 32, 32, (ctx) => {
    px(ctx, 8, 4, 16, 22, '#3d2f59');
    px(ctx, 10, 8, 12, 12, '#9e70d6');
    px(ctx, 12, 12, 3, 3, '#ffe182');
    px(ctx, 17, 12, 3, 3, '#ffe182');
  });

  // 14 Distinct Elemental Monster Species Sprites
  addProp('mon_bramble_snapper', 32, 32, (ctx) => {
    px(ctx, 6, 10, 20, 16, '#2d6338');
    px(ctx, 4, 14, 24, 8, '#458f50');
    px(ctx, 10, 6, 4, 6, '#87c454');
    px(ctx, 18, 6, 4, 6, '#87c454');
    px(ctx, 10, 14, 4, 4, '#ffd466');
    px(ctx, 18, 14, 4, 4, '#ffd466');
    px(ctx, 8, 22, 16, 4, '#d96b43');
  });
  addProp('mon_spore_shroom', 34, 34, (ctx) => {
    px(ctx, 11, 18, 12, 12, '#ebe2d0');
    px(ctx, 4, 8, 26, 13, '#3c8c5e');
    px(ctx, 8, 4, 18, 6, '#58b878');
    px(ctx, 9, 10, 4, 4, '#ff82a9');
    px(ctx, 20, 12, 4, 4, '#a6ffc0');
    px(ctx, 13, 21, 2, 3, '#2b2420');
    px(ctx, 19, 21, 2, 3, '#2b2420');
  });
  addProp('mon_reef_pincher', 32, 32, (ctx) => {
    px(ctx, 7, 12, 18, 14, '#c44d43');
    px(ctx, 2, 6, 7, 9, '#48b8c9');
    px(ctx, 23, 6, 7, 9, '#48b8c9');
    px(ctx, 10, 9, 12, 4, '#ff8a66');
    px(ctx, 11, 15, 3, 3, '#ffffff');
    px(ctx, 18, 15, 3, 3, '#ffffff');
  });
  addProp('mon_tide_serpent', 36, 36, (ctx) => {
    px(ctx, 8, 22, 20, 10, '#1f5e78');
    px(ctx, 12, 10, 12, 16, '#3996b5');
    px(ctx, 10, 6, 16, 10, '#48c4db');
    px(ctx, 22, 6, 6, 12, '#7be3f5');
    px(ctx, 12, 10, 3, 3, '#ffd466');
    px(ctx, 19, 10, 3, 3, '#ffd466');
  });
  addProp('mon_magma_salamander', 32, 32, (ctx) => {
    px(ctx, 7, 14, 18, 12, '#692920');
    px(ctx, 4, 18, 6, 6, '#ff6d3b');
    px(ctx, 22, 18, 6, 6, '#ff6d3b');
    px(ctx, 9, 10, 14, 9, '#b83c2a');
    px(ctx, 12, 6, 8, 5, '#ff9d47');
    px(ctx, 11, 12, 3, 3, '#fff099');
    px(ctx, 18, 12, 3, 3, '#fff099');
  });
  addProp('mon_cinder_colossus', 48, 48, (ctx) => {
    px(ctx, 8, 10, 32, 32, '#3d2220');
    px(ctx, 12, 14, 24, 24, '#782c21');
    px(ctx, 4, 16, 8, 18, '#542620');
    px(ctx, 36, 16, 8, 18, '#542620');
    px(ctx, 18, 22, 12, 10, '#ff8833');
    px(ctx, 15, 16, 4, 4, '#ffd466');
    px(ctx, 29, 16, 4, 4, '#ffd466');
  });
  addProp('mon_frost_wisp', 28, 28, (ctx) => {
    px(ctx, 8, 4, 12, 16, '#487aa3');
    px(ctx, 10, 8, 8, 12, '#a6e3ff');
    px(ctx, 6, 10, 4, 8, '#7be3f5');
    px(ctx, 18, 10, 4, 8, '#7be3f5');
    px(ctx, 11, 12, 2, 3, '#102436');
    px(ctx, 15, 12, 2, 3, '#102436');
  });
  addProp('mon_glacier_yeti', 46, 46, (ctx) => {
    px(ctx, 8, 10, 30, 30, '#8fb8d6');
    px(ctx, 12, 6, 22, 16, '#d8eefc');
    px(ctx, 4, 18, 8, 16, '#a9cce3');
    px(ctx, 34, 18, 8, 16, '#a9cce3');
    px(ctx, 16, 12, 4, 3, '#3988b8');
    px(ctx, 26, 12, 4, 3, '#3988b8');
    px(ctx, 16, 22, 14, 8, '#66a8cc');
  });
  addProp('mon_shadow_stalker', 34, 34, (ctx) => {
    px(ctx, 9, 8, 16, 22, '#251a38');
    px(ctx, 5, 12, 24, 12, '#3c295c');
    px(ctx, 11, 4, 3, 6, '#6d4ca6');
    px(ctx, 20, 4, 3, 6, '#6d4ca6');
    px(ctx, 12, 13, 3, 3, '#ff6be3');
    px(ctx, 19, 13, 3, 3, '#ff6be3');
  });
  addProp('mon_umbral_specter', 36, 36, (ctx) => {
    px(ctx, 10, 4, 16, 26, '#2d1c45');
    px(ctx, 12, 8, 12, 14, '#7a49b8');
    px(ctx, 8, 18, 20, 8, '#4a2b75');
    px(ctx, 13, 12, 3, 3, '#ffd466');
    px(ctx, 20, 12, 3, 3, '#ffd466');
  });
  addProp('mon_crag_beetle', 34, 34, (ctx) => {
    px(ctx, 6, 10, 22, 18, '#544a42');
    px(ctx, 9, 8, 16, 14, '#7d6e60');
    px(ctx, 13, 4, 8, 5, '#e0a943');
    px(ctx, 11, 14, 4, 3, '#ff9d47');
    px(ctx, 19, 14, 4, 3, '#ff9d47');
  });
  addProp('mon_crystal_golem', 46, 46, (ctx) => {
    px(ctx, 10, 10, 26, 30, '#4f5a6e');
    px(ctx, 4, 16, 8, 18, '#66758f');
    px(ctx, 34, 16, 8, 18, '#66758f');
    px(ctx, 18, 4, 10, 10, '#7be3f5');
    px(ctx, 18, 20, 10, 10, '#6ae0d6');
    px(ctx, 15, 14, 4, 3, '#ffffff');
    px(ctx, 27, 14, 4, 3, '#ffffff');
  });
  addProp('mon_tempest_harpy', 34, 34, (ctx) => {
    px(ctx, 2, 12, 30, 8, '#7ec3e6');
    px(ctx, 11, 8, 12, 18, '#4a7fa3');
    px(ctx, 13, 4, 8, 6, '#ffd466');
    px(ctx, 13, 11, 3, 3, '#ffffff');
    px(ctx, 18, 11, 3, 3, '#ffffff');
  });
  addProp('mon_void_construct', 44, 44, (ctx) => {
    px(ctx, 8, 8, 28, 28, '#26143b');
    px(ctx, 14, 14, 16, 16, '#8740cc');
    px(ctx, 18, 18, 8, 8, '#ff96e3');
    px(ctx, 4, 18, 6, 8, '#c792ea');
    px(ctx, 34, 18, 6, 8, '#c792ea');
  });

  // 12 Guardians
  addProp('guardian_woodland_giant', 64, 64, (ctx) => {
    px(ctx, 12, 14, 40, 42, '#473326');
    px(ctx, 8, 6, 48, 22, '#31633b');
    px(ctx, 16, 24, 32, 24, '#5a3f2f');
    px(ctx, 20, 28, 6, 6, '#e89056');
    px(ctx, 38, 28, 6, 6, '#e89056');
    px(ctx, 26, 38, 12, 10, '#6ae09d');
  });
  addProp('guardian_tidal_keeper', 64, 64, (ctx) => {
    px(ctx, 12, 20, 40, 36, '#1e5f78');
    px(ctx, 16, 8, 32, 24, '#3593ab');
    px(ctx, 20, 4, 24, 8, '#f0c475');
    px(ctx, 22, 16, 5, 5, '#ffe891');
    px(ctx, 37, 16, 5, 5, '#ffe891');
    px(ctx, 24, 34, 16, 12, '#7ae8e6');
  });
  addProp('guardian_frostbound_watcher', 64, 64, (ctx) => {
    px(ctx, 14, 10, 36, 44, '#3d5e80');
    px(ctx, 20, 4, 24, 14, '#8cc8f0');
    px(ctx, 10, 22, 44, 14, '#5984ad');
    px(ctx, 22, 18, 6, 4, '#ffffff');
    px(ctx, 36, 18, 6, 4, '#ffffff');
    px(ctx, 26, 30, 12, 12, '#a6ecff');
  });
  addProp('guardian_last_remnant', 64, 64, (ctx) => {
    px(ctx, 6, 16, 52, 26, '#392854');
    px(ctx, 18, 8, 28, 48, '#533b78');
    px(ctx, 22, 4, 20, 10, '#f5cc6b');
    px(ctx, 22, 20, 6, 5, '#ffdf85');
    px(ctx, 36, 20, 6, 5, '#ffdf85');
    px(ctx, 26, 32, 12, 12, '#99f0ff');
  });
  addProp('guardian_frost_empress', 64, 64, (ctx) => {
    px(ctx, 16, 14, 32, 44, '#4b7ea8');
    px(ctx, 20, 4, 24, 12, '#dff4ff');
    px(ctx, 22, 18, 5, 4, '#ffffff');
    px(ctx, 37, 18, 5, 4, '#ffffff');
    px(ctx, 24, 32, 16, 14, '#9ee8ff');
  });
  addProp('guardian_jungle_titan', 64, 64, (ctx) => {
    px(ctx, 10, 16, 44, 40, '#2e5e38');
    px(ctx, 16, 6, 32, 16, '#66b86b');
    px(ctx, 20, 24, 6, 6, '#ffd466');
    px(ctx, 38, 24, 6, 6, '#ffd466');
    px(ctx, 24, 36, 16, 10, '#ff82a9');
  });
  addProp('guardian_magma_colossus', 64, 64, (ctx) => {
    px(ctx, 10, 12, 44, 44, '#4d2b24');
    px(ctx, 16, 18, 32, 28, '#9e3824');
    px(ctx, 20, 22, 6, 6, '#ffd466');
    px(ctx, 38, 22, 6, 6, '#ffd466');
    px(ctx, 24, 34, 16, 12, '#ff884d');
  });
  addProp('guardian_sky_seraph', 64, 64, (ctx) => {
    px(ctx, 4, 18, 56, 18, '#b8e3fa');
    px(ctx, 20, 10, 24, 42, '#538bb3');
    px(ctx, 24, 4, 16, 8, '#f5d47a');
    px(ctx, 26, 28, 12, 12, '#ffffff');
  });
  addProp('guardian_phantom_duke', 64, 64, (ctx) => {
    px(ctx, 14, 12, 36, 44, '#2d2240');
    px(ctx, 18, 6, 28, 12, '#6c5194');
    px(ctx, 22, 20, 5, 5, '#c792ea');
    px(ctx, 37, 20, 5, 5, '#c792ea');
    px(ctx, 26, 34, 12, 10, '#e2b8ff');
  });
  addProp('guardian_eclipse_sovereign', 64, 64, (ctx) => {
    px(ctx, 6, 12, 52, 28, '#2b1e42');
    px(ctx, 18, 6, 28, 50, '#443069');
    px(ctx, 20, 2, 24, 8, '#ffd466');
    px(ctx, 24, 28, 16, 16, '#ffd466');
  });
  addProp('guardian_drift_leviathan', 64, 64, (ctx) => {
    px(ctx, 10, 16, 44, 36, '#1f617a');
    px(ctx, 16, 8, 32, 16, '#7be3f5');
    px(ctx, 22, 24, 5, 5, '#ffd466');
    px(ctx, 37, 24, 5, 5, '#ffd466');
    px(ctx, 26, 36, 12, 10, '#ffffff');
  });
  addProp('guardian_rift_archon', 64, 64, (ctx) => {
    px(ctx, 8, 12, 48, 32, '#2d1a40');
    px(ctx, 20, 6, 24, 48, '#5a3280');
    px(ctx, 22, 20, 5, 5, '#ff96e3');
    px(ctx, 37, 20, 5, 5, '#ff96e3');
    px(ctx, 26, 34, 12, 12, '#a6c8ff');
  });

  addProp('fx_bolt', 16, 16, (ctx) => {
    px(ctx, 4, 4, 8, 8, '#6ae0d6');
    px(ctx, 6, 6, 4, 4, '#ffffff');
  });

  addProp('fx_drone', 20, 20, (ctx) => {
    px(ctx, 4, 4, 12, 12, '#e0a943');
    px(ctx, 7, 7, 6, 6, '#7be3f5');
  });

  // Interior Furnishing Props
  addProp('prop_counter_shop', 96, 32, (ctx) => {
    px(ctx, 2, 4, 92, 26, '#6b4228');
    px(ctx, 0, 2, 96, 8, '#c78c54');
    px(ctx, 12, 0, 16, 6, '#e0a943'); // Register
    px(ctx, 66, 0, 14, 6, '#7be3f5'); // Display jar
  });
  addProp('prop_shelf_produce', 64, 48, (ctx) => {
    px(ctx, 2, 4, 60, 40, '#7d4f2d');
    px(ctx, 6, 8, 52, 12, '#4a311e');
    px(ctx, 6, 24, 52, 12, '#4a311e');
    px(ctx, 8, 10, 12, 8, '#e05a47'); // Apples
    px(ctx, 24, 10, 12, 8, '#f09b4c'); // Oranges/carrots
    px(ctx, 40, 10, 14, 8, '#66d18a'); // Greens
    px(ctx, 10, 26, 14, 8, '#f5cc6b'); // Cheese
    px(ctx, 28, 26, 12, 8, '#d49a57'); // Bread
    px(ctx, 44, 26, 12, 8, '#7be3f5'); // Milk
  });
  addProp('prop_shelf_goods', 64, 48, (ctx) => {
    px(ctx, 2, 4, 60, 40, '#594233');
    px(ctx, 6, 8, 52, 12, '#36271d');
    px(ctx, 6, 24, 52, 12, '#36271d');
    px(ctx, 10, 10, 8, 8, '#ff82a9');
    px(ctx, 24, 10, 8, 8, '#6ae0d6');
    px(ctx, 38, 10, 8, 8, '#ffd466');
    px(ctx, 12, 26, 12, 8, '#c792ea');
    px(ctx, 34, 26, 14, 8, '#e0a943');
  });
  addProp('prop_bookshelf', 64, 48, (ctx) => {
    px(ctx, 2, 2, 60, 44, '#5c3b24');
    px(ctx, 6, 6, 52, 14, '#362214');
    px(ctx, 6, 24, 52, 14, '#362214');
    const cols = ['#d96b43', '#48b8c9', '#f5cc6b', '#66d18a', '#c792ea', '#e05a47', '#a6c8ff'];
    for (let i = 0; i < 8; i++) {
      px(ctx, 8 + i * 6, 8, 5, 11, cols[i % cols.length]);
      px(ctx, 8 + i * 6, 26, 5, 11, cols[(i + 3) % cols.length]);
    }
  });
  addProp('prop_dining_table', 48, 36, (ctx) => {
    px(ctx, 2, 12, 8, 14, '#8c5a37'); // Left chair
    px(ctx, 38, 12, 8, 14, '#8c5a37'); // Right chair
    px(ctx, 10, 6, 28, 22, '#ebe2d0'); // Tablecloth
    px(ctx, 12, 26, 24, 6, '#754929');
    px(ctx, 14, 12, 7, 7, '#f2eee4'); // Plate
    px(ctx, 27, 12, 7, 7, '#f2eee4');
    px(ctx, 22, 8, 4, 6, '#ffd466'); // Candle
  });
  addProp('prop_kitchen_stove', 64, 40, (ctx) => {
    px(ctx, 2, 6, 60, 30, '#464d59');
    px(ctx, 4, 8, 56, 10, '#646d7d');
    px(ctx, 10, 4, 14, 10, '#c78c54'); // Soup pot
    px(ctx, 13, 2, 8, 4, '#fff2cc');
    px(ctx, 34, 10, 20, 6, '#d9b589'); // Cutting board
    px(ctx, 10, 22, 18, 10, '#ff884d'); // Oven glow
  });
  addProp('prop_hospital_bed', 44, 52, (ctx) => {
    px(ctx, 4, 4, 36, 44, '#7a8a99');
    px(ctx, 6, 6, 32, 12, '#ffffff'); // Pillow
    px(ctx, 6, 18, 32, 26, '#62b6cb'); // Blanket
    px(ctx, 18, 24, 8, 8, '#ffffff');
  });
  addProp('prop_anvil_rack', 64, 44, (ctx) => {
    px(ctx, 4, 16, 22, 20, '#383e47'); // Anvil
    px(ctx, 0, 14, 28, 6, '#5c6675');
    px(ctx, 34, 6, 26, 32, '#593924'); // Weapon rack
    px(ctx, 38, 10, 4, 24, '#a6e3ff'); // Sword
    px(ctx, 48, 10, 6, 24, '#f09b4c'); // Hammer
  });
  addProp('prop_arcade_cabinet', 36, 52, (ctx) => {
    px(ctx, 4, 4, 28, 46, '#2d2442');
    px(ctx, 6, 6, 24, 6, '#ff82a9'); // Marquee
    px(ctx, 6, 14, 24, 16, '#48b8c9'); // Screen
    px(ctx, 10, 18, 16, 8, '#ffd466');
    px(ctx, 6, 32, 24, 6, '#6e5094'); // Control deck
  });
  addProp('prop_cinema_screen', 144, 48, (ctx) => {
    px(ctx, 0, 2, 144, 44, '#7a2232'); // Curtains
    px(ctx, 14, 6, 116, 34, '#e6f2fa'); // Screen
    px(ctx, 34, 12, 76, 22, '#3a6f94');
    px(ctx, 64, 16, 16, 12, '#ffd466');
  });
  addProp('prop_sofa', 64, 36, (ctx) => {
    px(ctx, 4, 4, 56, 14, '#8f3943');
    px(ctx, 2, 12, 60, 18, '#b84b57');
    px(ctx, 8, 14, 22, 12, '#d4636f');
    px(ctx, 34, 14, 22, 12, '#d4636f');
  });
  addProp('prop_bathtub', 48, 34, (ctx) => {
    px(ctx, 4, 4, 40, 26, '#e8f1f5');
    px(ctx, 8, 8, 32, 18, '#7be3f5');
    px(ctx, 34, 10, 6, 4, '#e0a943');
  });
  addProp('prop_blueprint_table', 64, 40, (ctx) => {
    px(ctx, 4, 6, 56, 28, '#7d4f2d');
    px(ctx, 10, 10, 44, 20, '#366596');
    px(ctx, 16, 14, 32, 12, '#9ee8ff');
  });
  addProp('prop_mannequin', 32, 48, (ctx) => {
    px(ctx, 14, 30, 4, 16, '#593924');
    px(ctx, 8, 12, 16, 18, '#c792ea');
    px(ctx, 12, 4, 8, 8, '#ebe2d0');
  });
  addProp('prop_tackle_rack', 64, 44, (ctx) => {
    px(ctx, 4, 6, 56, 34, '#6b4228');
    px(ctx, 10, 8, 3, 28, '#e0a943');
    px(ctx, 22, 8, 3, 28, '#7be3f5');
    px(ctx, 34, 12, 20, 18, '#9ed6d9'); // Net
  });
  addProp('prop_target_dummy', 36, 48, (ctx) => {
    px(ctx, 16, 28, 4, 16, '#6b4228');
    px(ctx, 6, 6, 24, 24, '#f2eee4');
    px(ctx, 10, 10, 16, 16, '#d9534f');
    px(ctx, 14, 14, 8, 8, '#ffd466');
  });

  // Exterior Polish & Scenery Props
  addProp('prop_flowerbed', 48, 28, (ctx) => {
    px(ctx, 2, 8, 44, 16, '#754929');
    px(ctx, 4, 6, 40, 12, '#3d7d47');
    px(ctx, 8, 4, 6, 6, '#ff82a9');
    px(ctx, 20, 6, 6, 6, '#ffd466');
    px(ctx, 32, 4, 6, 6, '#7be3f5');
  });
  addProp('prop_statue', 48, 64, (ctx) => {
    px(ctx, 8, 40, 32, 20, '#78808c');
    px(ctx, 14, 18, 20, 24, '#b8c2cf');
    px(ctx, 18, 8, 12, 12, '#ffd466');
  });
  addProp('prop_rock_cluster', 40, 32, (ctx) => {
    px(ctx, 4, 12, 20, 16, '#6c7380');
    px(ctx, 18, 16, 18, 12, '#575e69');
    px(ctx, 8, 10, 12, 6, '#8791a3');
  });
  addProp('prop_campfire', 36, 36, (ctx) => {
    px(ctx, 6, 18, 24, 12, '#5c626e');
    px(ctx, 10, 16, 16, 10, '#6e4528');
    px(ctx, 12, 6, 12, 14, '#ff7b47');
    px(ctx, 15, 10, 6, 8, '#ffd466');
  });
  addProp('prop_signpost', 32, 36, (ctx) => {
    px(ctx, 14, 16, 4, 18, '#5c3b24');
    px(ctx, 4, 6, 24, 12, '#9e6b3f');
    px(ctx, 8, 10, 16, 2, '#f2eee4');
  });
  addProp('prop_ruin_arch', 64, 56, (ctx) => {
    px(ctx, 6, 12, 14, 42, '#8d879e');
    px(ctx, 44, 12, 14, 42, '#8d879e');
    px(ctx, 4, 4, 56, 12, '#a39cb5');
    px(ctx, 18, 4, 14, 6, '#5cb874');
  });
  addProp('prop_cafe_umbrella', 48, 44, (ctx) => {
    px(ctx, 22, 20, 4, 22, '#6b4228');
    px(ctx, 12, 30, 24, 8, '#ebe2d0');
    px(ctx, 4, 6, 40, 14, '#d96b43');
    px(ctx, 14, 6, 10, 14, '#f5efe2');
    px(ctx, 34, 6, 10, 14, '#f5efe2');
  });

  // New Living-World Props & Fantastical Landmarks
  addProp('prop_mailbox', 24, 36, (ctx) => {
    px(ctx, 10, 18, 4, 16, '#5c3b24');
    px(ctx, 4, 8, 16, 12, '#c44b3f');
    px(ctx, 6, 6, 12, 4, '#e05a47');
    px(ctx, 16, 4, 4, 8, '#ffd466'); // Raised letter flag
  });
  addProp('prop_skyport_plane', 64, 48, (ctx) => {
    px(ctx, 6, 20, 52, 10, '#d96b43'); // Upper wing
    px(ctx, 18, 14, 28, 18, '#e6eff5'); // Fuselage
    px(ctx, 26, 8, 12, 8, '#6ae0d6'); // Cockpit canopy
    px(ctx, 14, 30, 36, 4, '#284c6b'); // Struts
    px(ctx, 30, 2, 4, 12, '#ffd466'); // Rotor blur
  });
  addProp('prop_runway_light', 16, 16, (ctx) => {
    px(ctx, 4, 6, 8, 8, '#284c6b');
    px(ctx, 6, 4, 4, 6, '#6ae0d6');
    px(ctx, 7, 5, 2, 3, '#ffffff');
  });
  addProp('prop_crystal_spire', 36, 56, (ctx) => {
    px(ctx, 12, 8, 12, 42, '#4eb8c9');
    px(ctx, 4, 24, 10, 26, '#7be3f5');
    px(ctx, 22, 20, 10, 30, '#c792ea');
    px(ctx, 16, 12, 4, 24, '#ffffff');
  });
  addProp('prop_glow_mushroom', 28, 28, (ctx) => {
    px(ctx, 11, 14, 6, 12, '#dcd3c2');
    px(ctx, 4, 6, 20, 10, '#5a3eb8');
    px(ctx, 8, 8, 4, 4, '#7be3f5');
    px(ctx, 16, 10, 4, 4, '#ff82a9');
  });
  addProp('prop_bird', 16, 16, (ctx) => {
    px(ctx, 4, 6, 8, 6, '#e0a943');
    px(ctx, 2, 4, 6, 4, '#fff2cc');
    px(ctx, 12, 7, 3, 2, '#d96b43');
  });
  addProp('prop_dummy_plaza', 36, 48, (ctx) => {
    px(ctx, 16, 28, 4, 18, '#6b4228');
    px(ctx, 8, 14, 20, 16, '#c48f5a');
    px(ctx, 4, 16, 28, 4, '#9e6b3f');
    px(ctx, 12, 4, 12, 10, '#e8dbc1');
    px(ctx, 14, 18, 8, 8, '#e05a47');
  });

  // Collectible Companion Spritesheets (2 frames)
  (Object.keys(COMPANIONS) as CompanionId[]).forEach((compId) => {
    const [c, ctx] = createCanvas(48, 24);
    drawCompanionSprite(ctx, compId, 0);
    ctx.save();
    ctx.translate(24, 0);
    drawCompanionSprite(ctx, compId, 1);
    ctx.restore();
    scene.textures.addSpriteSheet(compId, c as unknown as HTMLImageElement, {
      frameWidth: 24,
      frameHeight: 24,
    });
    if (!scene.anims.exists(`${compId}_idle`)) {
      scene.anims.create({
        key: `${compId}_idle`,
        frames: scene.anims.generateFrameNumbers(compId, { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1,
      });
    }
  });

  const dirs = ['down', 'left', 'right', 'up'];
  const registerAnim = (texKey: string) => {
    dirs.forEach((dir, row) => {
      const animKey = `${texKey}_walk_${dir}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(texKey, {
            start: row * 3,
            end: row * 3 + 2,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  };

  (Object.keys(CHARACTERS) as CharacterId[]).forEach((charId) => {
    allOutfits.forEach((outfit) => {
      registerAnim(`char_${charId}_${outfit}`);
    });
  });
  NPCS.forEach((npc) => registerAnim(npc.id));
  crowdPalettes.forEach((_, idx) => registerAnim(`crowd_ped_${idx}`));
}

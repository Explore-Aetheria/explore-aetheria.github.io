import Phaser from 'phaser';
import { CHARACTERS, OUTFIT_MODIFIERS } from '../data/characters';
import { NPCS } from '../data/npcs';
import { CharacterId, OutfitId } from '../types/game';

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
  // 16 columns x 3 rows of 32x32 tiles = 512 x 96
  const [canvas, ctx] = createCanvas(16 * TILE_SIZE, 3 * TILE_SIZE);

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

  // Row 2 (32..36)
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
  const npc = NPCS.find((n) => n.id === npcId);
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

  // Playable Character Spritesheets (8 chars x 5 outfits)
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

  const addBldg = (key: string, w: number, h: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
    const [c, ctx] = createCanvas(w, h);
    drawFn(ctx);
    scene.textures.addCanvas(key, c);
  };

  addBldg('bldg_cafe_damaged', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#7a5748', '#593d32', '#cfc4b2', '#6b5545', true));
  addBldg('bldg_cafe_restored', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#c45b42', '#943e2a', '#efe4cf', '#7d5336', false, '#d96b43', true));
  addBldg('bldg_restoration_hall', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#386375', '#254754', '#e8decb', '#755033', false, undefined, true));
  addBldg('bldg_atelier', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#5a4378', '#3e2c57', '#ebe1cf', '#6e4d36', false, '#e0a943', true));
  addBldg('bldg_training', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#a84f3d', '#7a3527', '#dfd4bf', '#694a33', false, undefined, true));
  addBldg('bldg_cottage_damaged', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#6e655c', '#4d4640', '#bfb5a4', '#635345', true));
  addBldg('bldg_cottage_restored', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#3f7d58', '#2a593d', '#ede3cf', '#755033', false, undefined, true));
  addBldg('bldg_player_house', 96, 96, (ctx) => {
    drawBuilding(ctx, 96, 96, '#d16b47', '#9e4729', '#f2e8d5', '#755033', false, '#e0a943', true);
    px(ctx, 72, 2, 10, 14, '#7d4d3a'); // Cozy chimney
  });
  addBldg('bldg_supermarket', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#2f7d57', '#1e573b', '#f2eee4', '#5c4b3b', false, '#3ea870', true));
  addBldg('bldg_restaurant', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#b8423b', '#872923', '#ebe0cc', '#6e4930', false, '#e0a943', true));
  addBldg('bldg_smithy', 96, 96, (ctx) => drawBuilding(ctx, 96, 96, '#4f5663', '#363b45', '#d4c9b8', '#4d3a2c', false, undefined, true));
  addBldg('bldg_haunted_manor', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#44335c', '#2b1e3d', '#8c839e', '#3c344f', false, undefined, true));
  addBldg('bldg_sky_pavilion', 128, 96, (ctx) => drawBuilding(ctx, 128, 96, '#5897bf', '#396f94', '#edf6fc', '#d4af57', false, '#f5d47a', true));

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

  const addProp = (key: string, w: number, h: number, fn: (ctx: CanvasRenderingContext2D) => void) => {
    const [c, ctx] = createCanvas(w, h);
    fn(ctx);
    scene.textures.addCanvas(key, c);
  };

  addProp('prop_boat', 48, 48, (ctx) => {
    px(ctx, 10, 24, 28, 14, '#7d4d2c');
    px(ctx, 14, 36, 20, 6, '#59341c');
    px(ctx, 22, 6, 4, 24, '#d9c4a3');
    px(ctx, 26, 8, 14, 16, '#f5efe2');
    px(ctx, 16, 10, 6, 12, '#e0a943');
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

  // Enemies
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

  // 10 Guardians
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

  addProp('fx_bolt', 16, 16, (ctx) => {
    px(ctx, 4, 4, 8, 8, '#6ae0d6');
    px(ctx, 6, 6, 4, 4, '#ffffff');
  });

  addProp('fx_drone', 20, 20, (ctx) => {
    px(ctx, 4, 4, 12, 12, '#e0a943');
    px(ctx, 7, 7, 6, 6, '#7be3f5');
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
}

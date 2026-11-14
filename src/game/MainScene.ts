import Phaser from 'phaser';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS } from '../data/characters';
import { EQUIPMENT_CATALOG } from '../data/equipmentAndFood';
import { NPCS } from '../data/npcs';
import { GUARDIANS, LANDMARKS, MAIN_OFFSET_X as OX, MAIN_OFFSET_Y as OY, REGIONS } from '../data/progression';
import {
  FoodEffect,
  GuardianId,
  MiniGameId,
  RegionId,
  SaveData,
  TimePhase,
  WeatherType,
} from '../types/game';
import { gameBridge } from './GameBridge';
import { registerAllGameTextures, TILE_SIZE } from './PixelArtGenerator';
import {
  buildInteriorGrid,
  buildOverworldGrid,
  buildWorldProps,
  ENEMY_SPAWNS,
  getRegionAtTile,
  INTERIORS,
  SOLID_TILES,
  WORLD_BUILDINGS,
  WORLD_CHESTS,
  WORLD_COLLECTIBLES,
  WORLD_HEIGHT,
  WORLD_INTERACTABLES,
  WORLD_WIDTH,
} from './WorldData';

interface RuntimeNpc {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  homeX: number;
  homeY: number;
  patrolRadius: number;
  targetX: number;
  targetY: number;
  waitTimer: number;
  markerText?: Phaser.GameObjects.Text;
}

interface RuntimeEnemy {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  homeX: number;
  homeY: number;
  hp: number;
  maxHp: number;
  speed: number;
  kind: 'bramble' | 'crab' | 'wisp' | 'echo';
  attackTimer: number;
  stunTimer: number;
}

interface RuntimeGuardianState {
  id: GuardianId;
  sprite: Phaser.Physics.Arcade.Sprite;
  purity: number;
  maxPurity: number;
  phase: number;
  pillars: { sprite: Phaser.Physics.Arcade.Sprite; lit: boolean; x: number; y: number }[];
  attackTimer: number;
  telegraphTimer: number;
  pendingStrike?: { x: number; y: number; radius: number; ring: Phaser.GameObjects.Arc };
}

export function getTimePhaseFromHour(h: number): TimePhase {
  const hr = ((h % 24) + 24) % 24;
  if (hr >= 5 && hr < 7.5) return 'sunrise';
  if (hr >= 7.5 && hr < 12) return 'morning';
  if (hr >= 12 && hr < 17) return 'afternoon';
  if (hr >= 17 && hr < 20) return 'sunset';
  return 'night';
}

export class MainScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer;
  private player!: Phaser.Physics.Arcade.Sprite;
  private boatSprite!: Phaser.GameObjects.Image;
  private playerDir: 'down' | 'left' | 'right' | 'up' = 'down';
  private facingAngle = Math.PI / 2;

  private currentInteriorId: string | null = null;
  private save!: SaveData;
  private isPaused = false;
  private isSailing = false;
  private isSwimming = false;

  private health = 100;
  private maxHealth = 100;
  private energy = 100;
  private maxEnergy = 100;
  private hunger = 100;
  private abilityCooldown = 0;
  private dashTimer = 0;
  private dashCooldown = 0;
  private invulnTimer = 0;
  private galeTimer = 0;
  private shieldTimer = 0;
  private droneTimer = 0;
  private chronoTimer = 0;
  private solarBuffTimer = 0;
  private droneFireTimer = 0;
  private attackCooldown = 0;
  private hitstopTimer = 0;
  private hudSyncTimer = 0;
  private posSaveTimer = 0;
  private hungerDecayTimer = 0;

  private activeFoodBuff: { name: string; stat: 'speed' | 'power' | 'regen'; remaining: number } | null = null;

  private timeOfDay = 9.0;
  private timeSyncTimer = 0;
  private weather: WeatherType = 'sunny';
  private weatherChangeTimer = 50;
  private lightningTimer = 7;

  private shieldGraphic?: Phaser.GameObjects.Arc;
  private droneSprite?: Phaser.GameObjects.Sprite;
  private lightingOverlay!: Phaser.GameObjects.Rectangle;
  private lightningOverlay!: Phaser.GameObjects.Rectangle;

  private solidGroup!: Phaser.Physics.Arcade.StaticGroup;
  private waterBlockGroup!: Phaser.Physics.Arcade.StaticGroup;
  private boatLandGroup!: Phaser.Physics.Arcade.StaticGroup;
  private waterCollider!: Phaser.Physics.Arcade.Collider;
  private boatLandCollider!: Phaser.Physics.Arcade.Collider;

  private npcs: RuntimeNpc[] = [];
  private enemies: RuntimeEnemy[] = [];
  private chests: {
    id: string;
    sprite: Phaser.GameObjects.Sprite;
    x: number;
    y: number;
    sparks: number;
    items: { id: string; quantity: number }[];
    requiresMystic?: boolean;
  }[] = [];
  private collectibles: {
    id: string;
    sprite: Phaser.GameObjects.Sprite;
    x: number;
    y: number;
    itemId: string;
    quantity: number;
  }[] = [];
  private interactables: {
    id: string;
    x: number;
    y: number;
    prompt: string;
    kind: string;
    payload: Record<string, unknown>;
  }[] = [];
  private doors: { x: number; y: number; targetInteriorId: string; label: string }[] = [];
  private buildingSprites: Phaser.GameObjects.Image[] = [];
  private propSprites: Phaser.GameObjects.GameObject[] = [];

  private playerBolts!: Phaser.Physics.Arcade.Group;
  private hostileOrbs!: Phaser.Physics.Arcade.Group;
  private guardianState: RuntimeGuardianState | null = null;
  private ambientParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private weatherParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

  private heldKeys = new Set<string>();
  private justPressedKeys = new Set<string>();
  private lastInteractPrompt: string | null = null;
  private currentGrid: number[][] = [];

  constructor() {
    super('MainScene');
  }

  create() {
    registerAllGameTextures(this);

    const latest = gameBridge.getLatestSave();
    if (latest) {
      this.save = latest;
      this.timeOfDay = latest.timeOfDay ?? 9.0;
      this.weather = latest.weather ?? 'sunny';
      this.hunger = latest.hunger ?? 100;
    }

    this.solidGroup = this.physics.add.staticGroup();
    this.waterBlockGroup = this.physics.add.staticGroup();
    this.boatLandGroup = this.physics.add.staticGroup();
    this.playerBolts = this.physics.add.group();
    this.hostileOrbs = this.physics.add.group();

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 4;
    pCanvas.height = 4;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, 4, 4);
    if (!this.textures.exists('px_particle')) {
      this.textures.addCanvas('px_particle', pCanvas);
    }

    const startX = this.save?.playerPos.x ?? (OX + 54) * TILE_SIZE + 16;
    const startY = this.save?.playerPos.y ?? (OY + 59) * TILE_SIZE + 16;
    const charId = this.save?.activeCharacter ?? 'explorer';
    const outfit = this.save?.characterOutfits[charId] ?? 'default';

    this.boatSprite = this.add.image(
      this.save?.boatPos.x ?? (OX + 66) * TILE_SIZE + 16,
      this.save?.boatPos.y ?? (OY + 97) * TILE_SIZE + 16,
      'prop_boat'
    );
    this.boatSprite.setDepth(17);

    this.player = this.physics.add.sprite(startX, startY, `char_${charId}_${outfit}`, 0);
    this.player.setDepth(20);
    this.player.setSize(16, 12);
    this.player.setOffset(8, 18);
    this.player.setCollideWorldBounds(true);

    this.shieldGraphic = this.add.circle(startX, startY, 22, 0x87d4c8, 0.25);
    this.shieldGraphic.setStrokeStyle(2, 0xc792ea, 0.9);
    this.shieldGraphic.setDepth(22);
    this.shieldGraphic.setVisible(false);

    this.droneSprite = this.add.sprite(startX, startY - 24, 'fx_drone');
    this.droneSprite.setDepth(23);
    this.droneSprite.setVisible(false);

    // Day/Night + Lightning screen overlays
    this.lightingOverlay = this.add.rectangle(0, 0, 3000, 2000, 0x0c1633, 0);
    this.lightingOverlay.setOrigin(0.5);
    this.lightingOverlay.setScrollFactor(0);
    this.lightingOverlay.setDepth(84);

    this.lightningOverlay = this.add.rectangle(0, 0, 3000, 2000, 0xe8f4ff, 0);
    this.lightningOverlay.setOrigin(0.5);
    this.lightningOverlay.setScrollFactor(0);
    this.lightningOverlay.setDepth(86);

    this.ambientParticles = this.add.particles(0, 0, 'px_particle', {
      x: { min: 0, max: 1000 },
      y: { min: 0, max: 700 },
      lifespan: 3400,
      speedY: { min: -10, max: 14 },
      speedX: { min: -12, max: 12 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 280,
      tint: [0xf5cc6b, 0x87d4c8],
    });
    this.ambientParticles.setScrollFactor(0);
    this.ambientParticles.setDepth(88);

    this.weatherParticles = this.add.particles(0, 0, 'px_particle', {
      x: { min: -100, max: 1100 },
      y: { min: -40, max: 0 },
      lifespan: 1200,
      speedY: { min: 260, max: 360 },
      speedX: { min: -40, max: -15 },
      scale: { start: 1.1, end: 0.6 },
      alpha: { start: 0.55, end: 0 },
      frequency: 30,
      tint: [0x9ed6ff],
      emitting: false,
    });
    this.weatherParticles.setScrollFactor(0);
    this.weatherParticles.setDepth(89);

    this.currentInteriorId = this.save?.playerPos.interiorId ?? null;
    this.buildCurrentZone(startX, startY);

    // Physics Colliders
    this.physics.add.collider(this.player, this.solidGroup);
    this.waterCollider = this.physics.add.collider(this.player, this.waterBlockGroup);
    this.boatLandCollider = this.physics.add.collider(this.player, this.boatLandGroup);
    this.boatLandCollider.active = false;

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.45);
    this.cameras.main.setRoundPixels(true);

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      this.heldKeys.add(e.code);
      this.justPressedKeys.add(e.code);
    });
    this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      this.heldKeys.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.heldKeys.clear();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused) return;
      if (pointer.leftButtonDown()) {
        const worldPt = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPt.x, worldPt.y);
        this.firePlayerBolt(angle);
      }
    });

    gameBridge.registerScene({
      refreshWorldFromSave: (nextSave) => this.onSaveUpdated(nextSave),
      fastTravelTo: (tx, ty) => this.fastTravelTo(tx, ty),
      startGuardianEncounter: (gId) => this.startGuardianEncounter(gId),
      healPlayer: () => this.healPlayer(),
      setPaused: (paused) => {
        this.isPaused = paused;
        if (paused) this.heldKeys.clear();
      },
      enterInteriorById: (intId, tx, ty) => this.transitionToZone(intId, tx, ty),
      boardBoat: () => this.tryBoardBoat(true),
      disembarkBoat: () => this.tryDisembarkBoat(),
      setTimeOfDay: (hour) => {
        this.timeOfDay = ((hour % 24) + 24) % 24;
        this.updateDayNightAndWeather(0);
      },
      setWeather: (w) => {
        this.weather = w;
        this.applyWeatherEmitter();
      },
      applyFoodEffect: (eff) => this.handleFoodEffect(eff),
    });

    this.recalcStats();
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.applyWeatherEmitter();
  }

  private recalcStats() {
    if (!this.save) return;
    const cDef = CHARACTERS[this.save.activeCharacter];
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const hpBonus = this.save.upgrades.recovery * 15;
    const enBonus =
      this.save.upgrades.energy * 20 + (eqWeapon?.energyBonus ?? 0) + (eqAcc?.energyBonus ?? 0);
    this.maxHealth = cDef.maxHealth + hpBonus;
    this.maxEnergy = cDef.maxEnergy + enBonus;
    this.health = Math.min(this.health, this.maxHealth);
    this.energy = Math.min(this.energy, this.maxEnergy);
  }

  private handleFoodEffect(eff: FoodEffect) {
    this.hunger = Math.min(100, this.hunger + eff.hunger);
    this.health = Math.min(this.maxHealth, this.health + eff.health);
    this.energy = Math.min(this.maxEnergy, this.energy + eff.energy);
    if (eff.buffName && eff.buffStat && eff.buffDuration) {
      this.activeFoodBuff = {
        name: eff.buffName,
        stat: eff.buffStat,
        remaining: eff.buffDuration,
      };
    }
    this.burstParticles(this.player.x, this.player.y, 0x66d18a, 14);
  }

  private onSaveUpdated(nextSave: SaveData) {
    const prevRestCount = this.save?.completedRestorations.length ?? 0;
    const prevHouseKey = this.save
      ? `${this.save.house.tier}_${this.save.house.floorStyle}_${this.save.house.placedDecor.join(',')}`
      : '';
    const nextHouseKey = `${nextSave.house.tier}_${nextSave.house.floorStyle}_${nextSave.house.placedDecor.join(',')}`;
    const prevChar = this.save?.activeCharacter;
    const prevOutfit = prevChar ? this.save?.characterOutfits[prevChar] : undefined;

    this.save = nextSave;
    this.hunger = nextSave.hunger;
    this.recalcStats();

    if (
      prevChar !== nextSave.activeCharacter ||
      prevOutfit !== nextSave.characterOutfits[nextSave.activeCharacter]
    ) {
      const key = `char_${nextSave.activeCharacter}_${nextSave.characterOutfits[nextSave.activeCharacter]}`;
      this.player.setTexture(key, 0);
      this.burstParticles(this.player.x, this.player.y, 0x87d4c8, 12);
    }

    if (
      (nextSave.completedRestorations.length !== prevRestCount && !this.currentInteriorId) ||
      (this.currentInteriorId === 'int_player_house' && prevHouseKey !== nextHouseKey)
    ) {
      this.buildCurrentZone(this.player.x, this.player.y);
    }
  }

  private clearZoneObjects() {
    this.solidGroup.clear(true, true);
    this.waterBlockGroup.clear(true, true);
    this.boatLandGroup.clear(true, true);
    this.npcs.forEach((n) => {
      n.sprite.destroy();
      n.markerText?.destroy();
    });
    this.npcs = [];
    this.enemies.forEach((e) => e.sprite.destroy());
    this.enemies = [];
    this.chests.forEach((c) => c.sprite.destroy());
    this.chests = [];
    this.collectibles.forEach((c) => c.sprite.destroy());
    this.collectibles = [];
    this.buildingSprites.forEach((b) => b.destroy());
    this.buildingSprites = [];
    this.propSprites.forEach((p) => p.destroy());
    this.propSprites = [];
    this.interactables = [];
    this.doors = [];
    this.groundLayer?.destroy();
    this.map?.destroy();
  }

  private buildCurrentZone(spawnPixelX: number, spawnPixelY: number) {
    this.clearZoneObjects();
    const save = this.save ?? gameBridge.getLatestSave()!;
    this.save = save;

    if (this.currentInteriorId && INTERIORS[this.currentInteriorId]) {
      this.isSailing = false;
      this.isSwimming = false;
      this.boatSprite.setVisible(false);
      if (this.waterCollider) this.waterCollider.active = true;
      if (this.boatLandCollider) this.boatLandCollider.active = false;

      const intDef = INTERIORS[this.currentInteriorId];
      const floorOverride =
        intDef.id === 'int_player_house'
          ? save.house.floorStyle === 'checker'
            ? 17
            : save.house.floorStyle === 'stone'
              ? 18
              : 16
          : intDef.floorTile;
      this.currentGrid = buildInteriorGrid({ ...intDef, floorTile: floorOverride });
      this.map = this.make.tilemap({
        data: this.currentGrid,
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
      const tiles = this.map.addTilesetImage('world_tiles', 'world_tiles', TILE_SIZE, TILE_SIZE)!;
      this.groundLayer = this.map.createLayer(0, tiles, 0, 0)!;
      this.groundLayer.setDepth(0);

      this.physics.world.setBounds(0, 0, intDef.width * TILE_SIZE, intDef.height * TILE_SIZE);
      this.cameras.main.setBounds(0, 0, intDef.width * TILE_SIZE, intDef.height * TILE_SIZE);

      for (let y = 0; y < intDef.height; y++) {
        for (let x = 0; x < intDef.width; x++) {
          if (SOLID_TILES.has(this.currentGrid[y][x])) {
            this.addBoxToGroup(this.solidGroup, x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      this.spawnInteriorFurniture(intDef.id);
      NPCS.filter((n) => n.interiorId === intDef.id).forEach((npc) => this.spawnNpc(npc));
      WORLD_CHESTS.filter((c) => c.interiorId === intDef.id).forEach((c) => this.spawnChest(c));
      WORLD_INTERACTABLES.filter((i) => i.interiorId === intDef.id).forEach((i) => {
        this.interactables.push({
          id: i.id,
          x: i.tileX * TILE_SIZE + 16,
          y: i.tileY * TILE_SIZE + 16,
          prompt: i.prompt,
          kind: i.kind,
          payload: i as unknown as Record<string, unknown>,
        });
      });

      this.player.setPosition(spawnPixelX, spawnPixelY);
      return;
    }

    // Overworld (240 x 180)
    this.boatSprite.setVisible(true);
    this.boatSprite.setPosition(save.boatPos.x, save.boatPos.y);

    this.currentGrid = buildOverworldGrid(save);
    this.map = this.make.tilemap({
      data: this.currentGrid,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tiles = this.map.addTilesetImage('world_tiles', 'world_tiles', TILE_SIZE, TILE_SIZE)!;
    this.groundLayer = this.map.createLayer(0, tiles, 0, 0)!;
    this.groundLayer.setDepth(0);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);

    // Optimized edge-aware colliders for 240x180 ocean map
    const isWaterTile = (t: number) => t === 7 || t === 8;
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const t = this.currentGrid[y][x];
        if (t === 8) {
          // Only block shoreline Deep Ocean tiles that border non-ocean tiles
          const n = this.currentGrid[y - 1]?.[x] ?? 8;
          const s = this.currentGrid[y + 1]?.[x] ?? 8;
          const w = this.currentGrid[y]?.[x - 1] ?? 8;
          const e = this.currentGrid[y]?.[x + 1] ?? 8;
          if (n !== 8 || s !== 8 || w !== 8 || e !== 8) {
            this.addBoxToGroup(this.waterBlockGroup, x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE);
          }
        } else if (SOLID_TILES.has(t)) {
          this.addBoxToGroup(this.solidGroup, x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE);
        } else {
          // Walkable land/beach/pier bordering water acts as shoreline stop when sailing
          const n = this.currentGrid[y - 1]?.[x] ?? 8;
          const s = this.currentGrid[y + 1]?.[x] ?? 8;
          const w = this.currentGrid[y]?.[x - 1] ?? 8;
          const e = this.currentGrid[y]?.[x + 1] ?? 8;
          if (!isWaterTile(t) && (isWaterTile(n) || isWaterTile(s) || isWaterTile(w) || isWaterTile(e))) {
            this.addBoxToGroup(this.boatLandGroup, x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // Buildings
    WORLD_BUILDINGS.forEach((b) => {
      const isRestored = !b.restorationKey || save.completedRestorations.includes(b.restorationKey);
      const tex = isRestored ? b.textureRestored : b.textureDamaged;
      const cx = (b.tileX + b.widthTiles / 2) * TILE_SIZE;
      const cy = (b.tileY + b.heightTiles / 2) * TILE_SIZE;
      const img = this.add.image(cx, cy, tex);
      img.setDepth(10);
      this.buildingSprites.push(img);
      this.addBoxToGroup(this.solidGroup, cx, cy + 6, b.widthTiles * TILE_SIZE - 8, b.heightTiles * TILE_SIZE - 12);

      if (b.targetInteriorId && b.doorTileX !== undefined && b.doorTileY !== undefined) {
        this.doors.push({
          x: b.doorTileX * TILE_SIZE + 16,
          y: b.doorTileY * TILE_SIZE + 16,
          targetInteriorId: b.targetInteriorId,
          label: `Enter ${b.label}`,
        });
      }
    });

    // Cave arches -> enter interiors
    this.doors.push({
      x: (OX + 11) * TILE_SIZE + 16,
      y: (OY + 57) * TILE_SIZE + 16,
      targetInteriorId: 'int_woods_cave',
      label: 'Enter Whispering Hollow Cavern',
    });
    this.doors.push({
      x: (OX + 81) * TILE_SIZE + 16,
      y: (OY + 87) * TILE_SIZE + 16,
      targetInteriorId: 'int_coral_grotto',
      label: 'Enter Coral Reef Grotto',
    });
    this.doors.push({
      x: 200 * TILE_SIZE + 16,
      y: 27 * TILE_SIZE + 16,
      targetInteriorId: 'int_frozen_cave',
      label: 'Enter Glacier Crystal Cave',
    });

    // World Props
    buildWorldProps(save).forEach((p) => {
      const isRestored = p.restorationKey && save.completedRestorations.includes(p.restorationKey);
      const tex = isRestored && p.restoredTexture ? p.restoredTexture : p.texture;
      const pxPos = p.tileX * TILE_SIZE + 16;
      const pyPos = p.tileY * TILE_SIZE + 16;
      const img = this.add.image(pxPos, pyPos - 6, tex);
      img.setDepth(p.tileY * 0.1 + 9);
      this.propSprites.push(img);
      if (p.solid) {
        this.addBoxToGroup(this.solidGroup, pxPos, pyPos, 24, 22);
      }
    });

    // NPCs
    NPCS.filter((n) => !n.interiorId).forEach((npc) => {
      if (npc.requiresRestorationId && !save.completedRestorations.includes(npc.requiresRestorationId)) {
        return;
      }
      this.spawnNpc(npc);
    });

    // Chests
    WORLD_CHESTS.filter((c) => !c.interiorId).forEach((c) => this.spawnChest(c));

    // Collectibles
    WORLD_COLLECTIBLES.filter((c) => !c.interiorId).forEach((col) => {
      const sx = col.tileX * TILE_SIZE + 16;
      const sy = col.tileY * TILE_SIZE + 16;
      const sprite = this.add.sprite(sx, sy, col.texture);
      sprite.setDepth(8);
      this.tweens.add({
        targets: sprite,
        y: sy - 3,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.collectibles.push({
        id: col.id,
        sprite,
        x: sx,
        y: sy,
        itemId: col.itemId,
        quantity: col.quantity,
      });
    });

    // Interactables & Shrines
    WORLD_INTERACTABLES.filter((i) => !i.interiorId).forEach((i) => {
      const ix = i.tileX * TILE_SIZE + 16;
      const iy = i.tileY * TILE_SIZE + 16;
      if (i.kind === 'shrine') {
        const s = this.add.image(ix, iy, 'prop_shrine');
        s.setDepth(9);
        this.propSprites.push(s);
      } else if (i.kind === 'guardian_altar') {
        const s = this.add.image(ix, iy, 'prop_pillar_on');
        s.setDepth(9);
        this.propSprites.push(s);
      } else if (i.kind === 'boat_dock') {
        const s = this.add.image(ix, iy - 6, 'prop_lantern_on');
        s.setDepth(9);
        this.propSprites.push(s);
      }
      this.interactables.push({
        id: i.id,
        x: ix,
        y: iy,
        prompt: i.prompt,
        kind: i.kind,
        payload: i as unknown as Record<string, unknown>,
      });
    });

    // Enemies
    ENEMY_SPAWNS.forEach((sp) => {
      if (sp.restorationClearKey && save.completedRestorations.includes(sp.restorationClearKey)) {
        return;
      }
      const ex = sp.tileX * TILE_SIZE + 16;
      const ey = sp.tileY * TILE_SIZE + 16;
      const sprite = this.physics.add.sprite(ex, ey, sp.texture);
      sprite.setDepth(15);
      sprite.setSize(22, 22);
      this.physics.add.collider(sprite, this.solidGroup);
      this.enemies.push({
        id: sp.id,
        sprite,
        homeX: ex,
        homeY: ey,
        hp: sp.hp,
        maxHp: sp.hp,
        speed: sp.speed,
        kind: sp.kind,
        attackTimer: 1.5 + Math.random(),
        stunTimer: 0,
      });
    });

    this.player.setPosition(spawnPixelX, spawnPixelY);
  }

  private spawnInteriorFurniture(interiorId: string) {
    if (interiorId === 'int_player_house') {
      const wallHex = Number.parseInt(this.save.house.wallColor.replace('#', ''), 16) || 0x4c3e73;
      const topTrim = this.add.rectangle(9 * TILE_SIZE, 16, 18 * TILE_SIZE, 10, wallHex, 0.9);
      topTrim.setDepth(5);
      this.propSprites.push(topTrim);

      // Bed (4,4), Kitchen Stove (13,4), Wardrobe (4,9), Customize/Trophy Desk (9,6)
      const bed = this.add.rectangle(4 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 36, 44, 0xc45b42);
      bed.setStrokeStyle(2, 0xf2eee4);
      bed.setDepth(6);
      const pillow = this.add.rectangle(4 * TILE_SIZE + 16, 4 * TILE_SIZE + 4, 24, 10, 0xf5efe6);
      pillow.setDepth(7);

      const stove = this.add.rectangle(13 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 42, 28, 0x4f5661);
      stove.setStrokeStyle(2, 0xe0a943);
      stove.setDepth(6);

      const wardrobe = this.add.rectangle(4 * TILE_SIZE + 16, 9 * TILE_SIZE + 16, 34, 28, 0x7d4d2c);
      wardrobe.setStrokeStyle(2, 0xe4b363);
      wardrobe.setDepth(6);

      const desk = this.add.rectangle(9 * TILE_SIZE + 16, 6 * TILE_SIZE + 16, 44, 26, 0x8c5a37);
      desk.setStrokeStyle(2, 0xf5cc6b);
      desk.setDepth(6);

      this.propSprites.push(bed, pillow, stove, wardrobe, desk);

      // Placed Decor Visuals
      if (this.save.house.placedDecor.includes('decor_plush_rug')) {
        const rug = this.add.rectangle(9 * TILE_SIZE + 16, 8 * TILE_SIZE + 16, 96, 54, 0xb84b3e, 0.9);
        rug.setStrokeStyle(3, 0xe4b363);
        rug.setDepth(2);
        this.propSprites.push(rug);
      }
      if (this.save.house.placedDecor.includes('decor_ship_model')) {
        const ship = this.add.image(9 * TILE_SIZE + 16, 6 * TILE_SIZE + 8, 'prop_boat').setScale(0.55).setDepth(8);
        this.propSprites.push(ship);
      }
      if (this.save.house.placedDecor.includes('decor_sun_bonsai')) {
        const tree = this.add.image(13 * TILE_SIZE + 16, 8 * TILE_SIZE + 16, 'prop_collectible_berry').setDepth(8);
        this.propSprites.push(tree);
      }
      if (this.save.house.tier >= 2) {
        const lamp = this.add.image(7 * TILE_SIZE + 16, 3 * TILE_SIZE + 16, 'prop_lantern_on').setDepth(8);
        this.propSprites.push(lamp);
      }
      if (this.save.house.tier >= 3) {
        const shrine = this.add.image(11 * TILE_SIZE + 16, 3 * TILE_SIZE + 16, 'prop_shrine').setScale(0.65).setDepth(8);
        this.propSprites.push(shrine);
      }
    } else if (interiorId === 'int_supermarket' || interiorId === 'int_restaurant') {
      const counter = this.add.rectangle(9 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 140, 24, 0x8c5a37);
      counter.setStrokeStyle(2, 0xe4b363);
      counter.setDepth(6);
      const crateL = this.add.image(4 * TILE_SIZE + 16, 6 * TILE_SIZE + 16, 'prop_collectible_crate').setDepth(7);
      const crateR = this.add.image(14 * TILE_SIZE + 16, 6 * TILE_SIZE + 16, 'prop_collectible_berry').setDepth(7);
      this.propSprites.push(counter, crateL, crateR);
    } else if (interiorId === 'int_smithy') {
      const anvil = this.add.rectangle(9 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 52, 26, 0x3b424d);
      anvil.setStrokeStyle(2, 0xff884d);
      anvil.setDepth(7);
      const forge = this.add.image(13 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 'prop_lantern_on').setDepth(8);
      this.propSprites.push(anvil, forge);
    } else if (interiorId === 'int_training_hall') {
      const target = this.add.image(10 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 'prop_pillar_on');
      target.setDepth(9);
      this.propSprites.push(target);
    } else if (interiorId === 'int_restoration_hall') {
      const board = this.add.image(10 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, 'prop_noticeboard');
      board.setDepth(9);
      this.propSprites.push(board);
    }
  }

  private addBoxToGroup(
    group: Phaser.Physics.Arcade.StaticGroup,
    cx: number,
    cy: number,
    w: number,
    h: number
  ) {
    const rect = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
    this.physics.add.existing(rect, true);
    group.add(rect);
  }

  private spawnNpc(npcDef: (typeof NPCS)[number]) {
    const nx = npcDef.tileX * TILE_SIZE + 16;
    const ny = npcDef.tileY * TILE_SIZE + 16;
    const sprite = this.physics.add.sprite(nx, ny, npcDef.id, 0);
    sprite.setDepth(18);
    sprite.setImmovable(true);
    sprite.setSize(18, 14);
    sprite.setOffset(7, 16);
    this.physics.add.collider(this.player, sprite);

    const hasQuest = npcDef.questMarkerIds?.some((qid) => !this.save.quests[qid]);
    let markerText: Phaser.GameObjects.Text | undefined;
    if (hasQuest) {
      markerText = this.add
        .text(nx, ny - 24, '!', {
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#ffd466',
          stroke: '#161b22',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(30);
    }

    this.npcs.push({
      id: npcDef.id,
      sprite,
      homeX: nx,
      homeY: ny,
      patrolRadius: npcDef.patrolRadius * TILE_SIZE,
      targetX: nx,
      targetY: ny,
      waitTimer: 1 + Math.random() * 2,
      markerText,
    });
  }

  private spawnChest(c: (typeof WORLD_CHESTS)[number]) {
    const opened = this.save.openedChests.includes(c.id);
    const cx = c.tileX * TILE_SIZE + 16;
    const cy = c.tileY * TILE_SIZE + 16;
    const sprite = this.add.sprite(cx, cy, opened ? 'prop_chest_open' : 'prop_chest_closed');
    sprite.setDepth(9);
    if (c.requiresMystic && !opened && this.save.activeCharacter !== 'mystic') {
      sprite.setAlpha(0.35);
    }
    this.chests.push({
      id: c.id,
      sprite,
      x: cx,
      y: cy,
      sparks: c.sparks,
      items: c.items,
      requiresMystic: c.requiresMystic,
    });
  }

  private transitionToZone(interiorId: string | null, tileX?: number, tileY?: number) {
    soundEngine.playDoor();
    this.cameras.main.fadeOut(180, 14, 21, 27);
    this.time.delayedCall(190, () => {
      if (interiorId && INTERIORS[interiorId]) {
        const def = INTERIORS[interiorId];
        this.currentInteriorId = interiorId;
        this.buildCurrentZone(def.spawnX * TILE_SIZE + 16, def.spawnY * TILE_SIZE + 16);
      } else {
        const prevDef = this.currentInteriorId ? INTERIORS[this.currentInteriorId] : null;
        this.currentInteriorId = null;
        const wx = (tileX ?? prevDef?.returnWorldX ?? OX + 54) * TILE_SIZE + 16;
        const wy = (tileY ?? prevDef?.returnWorldY ?? OY + 59) * TILE_SIZE + 16;
        this.buildCurrentZone(wx, wy);
      }
      gameBridge.getCallbacks()?.onPlayerMoved(this.player.x, this.player.y, this.currentInteriorId);
      this.cameras.main.fadeIn(200, 14, 21, 27);
    });
  }

  private fastTravelTo(tileX: number, tileY: number) {
    this.currentInteriorId = null;
    this.isSailing = false;
    if (this.waterCollider) this.waterCollider.active = true;
    if (this.boatLandCollider) this.boatLandCollider.active = false;
    this.guardianState = null;
    this.cameras.main.fadeOut(180, 14, 21, 27);
    this.time.delayedCall(190, () => {
      this.buildCurrentZone(tileX * TILE_SIZE + 16, tileY * TILE_SIZE + 16);
      this.burstParticles(this.player.x, this.player.y, 0x6ae0d6, 20);
      gameBridge.getCallbacks()?.onPlayerMoved(this.player.x, this.player.y, null);
      this.cameras.main.fadeIn(220, 14, 21, 27);
    });
  }

  private findNearestTileMatching(
    startPxX: number,
    startPxY: number,
    radiusTiles: number,
    predicate: (t: number) => boolean
  ): { x: number; y: number } | null {
    const cx = Math.floor(startPxX / TILE_SIZE);
    const cy = Math.floor(startPxY / TILE_SIZE);
    let best: { x: number; y: number; dist: number } | null = null;
    for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
      for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
        const tx = cx + dx;
        const ty = cy + dy;
        const t = this.currentGrid[ty]?.[tx];
        if (t !== undefined && predicate(t)) {
          const d = Math.hypot(dx, dy);
          if (!best || d < best.dist) {
            best = { x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 16, dist: d };
          }
        }
      }
    }
    return best ? { x: best.x, y: best.y } : null;
  }

  private tryBoardBoat(summonToDock = false) {
    if (this.currentInteriorId || this.isSailing) return;
    let targetBoatPos = { x: this.boatSprite.x, y: this.boatSprite.y };

    if (summonToDock && Phaser.Math.Distance.Between(this.player.x, this.player.y, targetBoatPos.x, targetBoatPos.y) > 96) {
      const waterSpot = this.findNearestTileMatching(
        this.player.x,
        this.player.y,
        4,
        (t) => t === 7 || t === 8
      );
      if (!waterSpot) {
        gameBridge.getCallbacks()?.onShowToast('Move closer to a Harbour Pier or ocean shore to launch your boat!');
        return;
      }
      targetBoatPos = waterSpot;
    }

    this.isSailing = true;
    this.isSwimming = false;
    this.waterCollider.active = false;
    this.boatLandCollider.active = true;
    this.boatSprite.setVisible(true);
    this.player.setPosition(targetBoatPos.x, targetBoatPos.y - 4);
    this.boatSprite.setPosition(targetBoatPos.x, targetBoatPos.y + 4);
    soundEngine.playDash();
    this.burstParticles(targetBoatPos.x, targetBoatPos.y, 0x6ae0d6, 16);
    gameBridge.getCallbacks()?.onBoatMoved(targetBoatPos.x, targetBoatPos.y);
    gameBridge.getCallbacks()?.onShowToast('Sailing Aetheria Sea! Approach any beach or pier & press [E] to dock.');
  }

  private tryDisembarkBoat(): boolean {
    if (!this.isSailing) return false;
    const shore = this.findNearestTileMatching(
      this.player.x,
      this.player.y,
      3,
      (t) => t !== 7 && t !== 8 && !SOLID_TILES.has(t)
    );
    if (!shore) {
      gameBridge.getCallbacks()?.onShowToast('Steer closer to a sandy beach or wooden pier to disembark!');
      return false;
    }
    const anchorWater =
      this.findNearestTileMatching(this.player.x, this.player.y, 1, (t) => t === 7 || t === 8) ?? {
        x: this.player.x,
        y: this.player.y,
      };
    this.isSailing = false;
    this.boatLandCollider.active = false;
    this.waterCollider.active = true;
    this.boatSprite.setPosition(anchorWater.x, anchorWater.y);
    this.player.setPosition(shore.x, shore.y);
    soundEngine.playDoor();
    gameBridge.getCallbacks()?.onBoatMoved(anchorWater.x, anchorWater.y);
    gameBridge.getCallbacks()?.onPlayerMoved(shore.x, shore.y, null);
    gameBridge.getCallbacks()?.onShowToast('Boat anchored safely!');
    return true;
  }

  private healPlayer() {
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.hunger = Math.max(this.hunger, 85);
    this.burstParticles(this.player.x, this.player.y, 0x66d18a, 16);
  }

  private startGuardianEncounter(guardianId: GuardianId) {
    if (this.guardianState) return;
    if (this.save.defeatedGuardians.includes(guardianId)) {
      gameBridge.getCallbacks()?.onShowToast(`${GUARDIANS[guardianId].name} is already at peace.`);
      return;
    }
    const gDef = GUARDIANS[guardianId];
    const gx = gDef.arenaX * TILE_SIZE + 16;
    const gy = gDef.arenaY * TILE_SIZE + 16;

    const texKey = `guardian_${guardianId}`;
    const sprite = this.physics.add.sprite(gx, gy, texKey);
    sprite.setDepth(21);
    sprite.setImmovable(true);
    sprite.setScale(1.15);

    const fourPillarIds: GuardianId[] = ['frostbound_watcher', 'last_remnant', 'frost_empress', 'eclipse_sovereign'];
    const offsets = fourPillarIds.includes(guardianId)
      ? [
          [-110, -70],
          [110, -70],
          [-110, 70],
          [110, 70],
        ]
      : [
          [-105, -50],
          [105, -50],
          [0, 95],
        ];

    const pillars = offsets.map(([ox, oy]) => {
      const ps = this.physics.add.sprite(gx + ox, gy + oy, 'prop_pillar_off');
      ps.setDepth(16);
      ps.setImmovable(true);
      return { sprite: ps, lit: false, x: gx + ox, y: gy + oy };
    });

    this.guardianState = {
      id: guardianId,
      sprite,
      purity: gDef.maxPurity,
      maxPurity: gDef.maxPurity,
      phase: 1,
      pillars,
      attackTimer: 1.6,
      telegraphTimer: 0,
    };

    soundEngine.playRestoreFanfare();
    gameBridge
      .getCallbacks()
      ?.onShowToast(`Guardian Encounter: ${gDef.name}, ${gDef.title}! Strike the Pillars with Bolts [F]!`);
  }

  update(_time: number, rawDelta: number) {
    const dt = Math.min(rawDelta / 1000, 0.05);
    if (this.isPaused || !this.save) {
      this.justPressedKeys.clear();
      return;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.justPressedKeys.clear();
      return;
    }

    this.updateTimers(dt);
    this.updateDayNightAndWeather(dt);
    this.handlePlayerInput(dt);
    this.updateNpcs(dt);
    this.updateEnemies(dt);
    this.updateGuardian(dt);
    this.updateProjectiles(dt);
    this.updateCollectiblesAndLandmarks();
    this.updateInteriorExit();
    this.syncHud(dt);

    this.justPressedKeys.clear();
  }

  private updateTimers(dt: number) {
    if (this.abilityCooldown > 0) this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    if (this.dashTimer > 0) this.dashTimer = Math.max(0, this.dashTimer - dt);
    if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      this.player.setAlpha(Math.sin(this.time.now * 0.03) > 0 ? 1 : 0.55);
    } else {
      this.player.setAlpha(this.isSwimming ? 0.85 : 1);
    }
    if (this.galeTimer > 0) this.galeTimer = Math.max(0, this.galeTimer - dt);
    if (this.solarBuffTimer > 0) this.solarBuffTimer = Math.max(0, this.solarBuffTimer - dt);

    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
      this.shieldGraphic?.setVisible(true);
      this.shieldGraphic?.setPosition(this.player.x, this.player.y);
    } else {
      this.shieldGraphic?.setVisible(false);
    }

    if (this.droneTimer > 0) {
      this.droneTimer = Math.max(0, this.droneTimer - dt);
      this.droneFireTimer -= dt;
      const angle = this.time.now * 0.004;
      const dx = this.player.x + Math.cos(angle) * 34;
      const dy = this.player.y + Math.sin(angle) * 34;
      this.droneSprite?.setVisible(true).setPosition(dx, dy);
      if (this.droneFireTimer <= 0) {
        this.droneFireTimer = 0.75;
        this.droneZapNearest(dx, dy);
      }
    } else {
      this.droneSprite?.setVisible(false);
    }

    if (this.chronoTimer > 0) this.chronoTimer = Math.max(0, this.chronoTimer - dt);
    if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (this.activeFoodBuff) {
      this.activeFoodBuff.remaining -= dt;
      if (this.activeFoodBuff.remaining <= 0) {
        this.activeFoodBuff = null;
      }
    }

    // Gentle hunger drain (~1 hunger every 14 seconds)
    this.hungerDecayTimer += dt;
    if (this.hungerDecayTimer >= 14) {
      this.hungerDecayTimer = 0;
      if (this.hunger > 0) {
        this.hunger = Math.max(0, this.hunger - 1);
        gameBridge.getCallbacks()?.onHungerChanged(this.hunger);
        if (this.hunger === 15) {
          gameBridge.getCallbacks()?.onShowToast('Getting hungry! Grab a bite from Fresh Mart, the Bistro, or your satchel.');
        }
      }
    }

    // Passive energy regen
    const foodRegen = this.activeFoodBuff?.stat === 'regen' ? 1.55 : 1;
    const regenMult =
      (this.save.activeCharacter === 'chronomancer' ? 1.3 : this.save.activeCharacter === 'explorer' ? 1.1 : 1) *
      (1 + this.save.upgrades.recovery * 0.2) *
      foodRegen;
    this.energy = Math.min(this.maxEnergy, this.energy + 9 * regenMult * dt);
  }

  private updateDayNightAndWeather(dt: number) {
    // Advance clock: 1 in-game hour per 30 real seconds
    this.timeOfDay = (this.timeOfDay + dt / 30) % 24;
    this.timeSyncTimer += dt;
    if (this.timeSyncTimer >= 6) {
      this.timeSyncTimer = 0;
      gameBridge.getCallbacks()?.onTimeChanged(this.timeOfDay);
    }

    // Dynamic biome-weighted weather transitions
    if (dt > 0) {
      this.weatherChangeTimer -= dt;
      if (this.weatherChangeTimer <= 0) {
        this.weatherChangeTimer = 50 + Math.random() * 35;
        const tx = Math.floor(this.player.x / TILE_SIZE);
        const ty = Math.floor(this.player.y / TILE_SIZE);
        const region = this.currentInteriorId ? INTERIORS[this.currentInteriorId].region : getRegionAtTile(tx, ty);
        const nextW = this.pickBiomeWeather(region);
        if (nextW !== this.weather) {
          this.weather = nextW;
          this.applyWeatherEmitter();
          gameBridge.getCallbacks()?.onWeatherChanged(nextW);
        }
      }
    }

    // Thunderstorm lightning flash
    if (this.weather === 'thunderstorm' && !this.currentInteriorId) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 7 + Math.random() * 10;
        soundEngine.playThunder();
        this.lightningOverlay.setAlpha(0.55);
        this.tweens.add({
          targets: this.lightningOverlay,
          alpha: 0,
          duration: 320,
        });
      }
    }

    // Smooth day/night + weather ambient tint
    const phase = getTimePhaseFromHour(this.timeOfDay);
    let tintColor = 0x0c1633;
    let tintAlpha = 0;
    if (this.currentInteriorId) {
      tintAlpha = 0.04;
    } else {
      if (phase === 'sunrise') {
        tintColor = 0xffa66b;
        tintAlpha = 0.11;
      } else if (phase === 'sunset') {
        tintColor = 0xe87343;
        tintAlpha = 0.17;
      } else if (phase === 'night') {
        tintColor = 0x0a132e;
        tintAlpha = 0.36;
      }
      if (this.weather === 'overcast' || this.weather === 'heavy_rain' || this.weather === 'thunderstorm') {
        tintColor = 0x162433;
        tintAlpha = Math.max(tintAlpha, 0.22);
      } else if (this.weather === 'fog') {
        tintColor = 0xb8ccd6;
        tintAlpha = Math.max(tintAlpha, 0.24);
      }
    }
    this.lightingOverlay.setFillStyle(tintColor, tintAlpha);
  }

  private pickBiomeWeather(region: RegionId): WeatherType {
    if (region === 'frozen_kingdom' || region === 'frostpeak') {
      const pool: WeatherType[] = ['snow', 'snowstorm', 'cloudy', 'sunny', 'windy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'haunted_island') {
      const pool: WeatherType[] = ['fog', 'overcast', 'cloudy', 'light_rain'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'wild_jungle') {
      const pool: WeatherType[] = ['sunny', 'light_rain', 'heavy_rain', 'thunderstorm', 'cloudy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'sky_island') {
      const pool: WeatherType[] = ['sunny', 'windy', 'cloudy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'volcanic_island') {
      const pool: WeatherType[] = ['sunny', 'overcast', 'windy', 'cloudy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const pool: WeatherType[] = ['sunny', 'sunny', 'cloudy', 'overcast', 'light_rain', 'heavy_rain', 'thunderstorm', 'windy', 'fog'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private applyWeatherEmitter() {
    if (!this.weatherParticles) return;
    if (this.currentInteriorId) {
      this.weatherParticles.stop();
      return;
    }
    if (this.weather === 'light_rain' || this.weather === 'heavy_rain' || this.weather === 'thunderstorm') {
      this.weatherParticles.setParticleTint(0x98d4ff);
      this.weatherParticles.setParticleSpeed(-45, 380);
      this.weatherParticles.frequency = this.weather === 'light_rain' ? 42 : 14;
      this.weatherParticles.start();
    } else if (this.weather === 'snow' || this.weather === 'snowstorm') {
      this.weatherParticles.setParticleTint(0xffffff);
      this.weatherParticles.setParticleSpeed(this.weather === 'snowstorm' ? -95 : -25, 110);
      this.weatherParticles.frequency = this.weather === 'snowstorm' ? 16 : 40;
      this.weatherParticles.start();
    } else if (this.weather === 'windy') {
      this.weatherParticles.setParticleTint(0x9be396);
      this.weatherParticles.setParticleSpeed(-160, 75);
      this.weatherParticles.frequency = 95;
      this.weatherParticles.start();
    } else {
      this.weatherParticles.stop();
    }
  }

  private droneZapNearest(dx: number, dy: number) {
    let target: { x: number; y: number } | null = null;
    let minDist = 200;
    this.enemies.forEach((e) => {
      const d = Phaser.Math.Distance.Between(dx, dy, e.sprite.x, e.sprite.y);
      if (d < minDist) {
        minDist = d;
        target = { x: e.sprite.x, y: e.sprite.y };
      }
    });
    if (!target && this.guardianState) {
      const unlit = this.guardianState.pillars.find((p) => !p.lit);
      if (unlit) target = { x: unlit.x, y: unlit.y };
    }
    if (target) {
      const ang = Phaser.Math.Angle.Between(dx, dy, target.x, target.y);
      this.firePlayerBolt(ang, dx, dy);
    }
  }

  private handlePlayerInput(dt: number) {
    const kb = this.save.settings.keyBindings;
    const isDown = (code: string, alt?: string) =>
      this.heldKeys.has(code) || (alt ? this.heldKeys.has(alt) : false);
    const justPressed = (code: string, alt?: string) =>
      this.justPressedKeys.has(code) || (alt ? this.justPressedKeys.has(alt) : false);

    let vx = 0;
    let vy = 0;
    if (isDown(kb.left, 'ArrowLeft')) vx -= 1;
    if (isDown(kb.right, 'ArrowRight')) vx += 1;
    if (isDown(kb.up, 'ArrowUp')) vy -= 1;
    if (isDown(kb.down, 'ArrowDown')) vy += 1;

    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);
    const curTile = this.currentGrid[tileY]?.[tileX] ?? 0;

    if (!this.currentInteriorId && !this.isSailing) {
      if (curTile === 22 && this.save.activeCharacter !== 'explorer') {
        vx *= 0.25;
        vy *= 0.25;
      }
      if (curTile === 23 && this.save.activeCharacter !== 'mystic') {
        vx *= 0.4;
        vy *= 0.4;
      }
      this.isSwimming = curTile === 7;
    } else {
      this.isSwimming = false;
    }

    const cDef = CHARACTERS[this.save.activeCharacter];
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const equipSpeedBonus = (eqWeapon?.speedBonus ?? 0) + (eqAcc?.speedBonus ?? 0);

    let speed = cDef.baseSpeed * (1 + this.save.upgrades.speed * 0.08) + equipSpeedBonus;
    if (this.isSailing) {
      speed = 245 + (this.save.boatLevel - 1) * 48 + (this.save.activeCharacter === 'skywarden' ? 25 : 0);
      if (this.weather === 'windy') speed *= 1.12;
    } else {
      if ((this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')) && this.hunger > 10) {
        speed *= 1.28;
      }
      if (this.hunger <= 15) speed *= 0.85;
      if (this.galeTimer > 0) speed *= 1.45;
      if (this.activeFoodBuff?.stat === 'speed') speed *= 1.2;
      if (this.isSwimming && this.save.activeCharacter !== 'tidecaller') speed *= 0.72;
      if (this.dashTimer > 0) speed *= 2.35;
    }

    // Dash
    if (justPressed(kb.dash) && !this.isSailing && this.dashCooldown <= 0 && this.energy >= 12) {
      this.energy -= 12;
      this.dashTimer = 0.22;
      this.dashCooldown = 0.75;
      this.invulnTimer = Math.max(this.invulnTimer, this.save.activeCharacter === 'chronomancer' ? 0.42 : 0.26);
      soundEngine.playDash();
      this.burstParticles(this.player.x, this.player.y, 0xede3cf, 8);
    }

    // Attack bolt
    if (justPressed(kb.attack) && this.attackCooldown <= 0) {
      const ang =
        this.playerDir === 'right'
          ? 0
          : this.playerDir === 'down'
            ? Math.PI / 2
            : this.playerDir === 'left'
              ? Math.PI
              : -Math.PI / 2;
      this.firePlayerBolt(ang);
    }

    // Special Ability
    if (justPressed(kb.ability) && !this.isSailing) {
      this.triggerCharacterAbility();
    }

    // Interact
    if (justPressed(kb.interact)) {
      this.tryInteract();
    }

    // Apply movement
    const len = Math.hypot(vx, vy);
    const texKey = `char_${this.save.activeCharacter}_${this.save.characterOutfits[this.save.activeCharacter]}`;
    if (len > 0) {
      const nx = (vx / len) * speed;
      const ny = (vy / len) * speed;
      this.player.setVelocity(nx, ny);
      this.facingAngle = Math.atan2(ny, nx);

      if (Math.abs(vx) > Math.abs(vy)) {
        this.playerDir = vx < 0 ? 'left' : 'right';
      } else {
        this.playerDir = vy < 0 ? 'up' : 'down';
      }

      if (this.isSailing) {
        this.player.anims.stop();
        const row = this.playerDir === 'down' ? 0 : this.playerDir === 'left' ? 1 : this.playerDir === 'right' ? 2 : 3;
        this.player.setFrame(row * 3);
      } else {
        this.player.anims.play(`${texKey}_walk_${this.playerDir}`, true);
        const surface =
          curTile === 6
            ? 'sand'
            : curTile === 10 || curTile === 11
              ? 'snow'
              : curTile === 9 || curTile === 16
                ? 'wood'
                : curTile === 2 || curTile === 12 || curTile === 21
                  ? 'stone'
                  : 'grass';
        soundEngine.playFootstep(surface);
      }
    } else {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      const row = this.playerDir === 'down' ? 0 : this.playerDir === 'left' ? 1 : this.playerDir === 'right' ? 2 : 3;
      this.player.setFrame(row * 3);
    }

    if (this.isSailing) {
      const bob = Math.sin(this.time.now * 0.006) * 2;
      this.boatSprite.setPosition(this.player.x, this.player.y + 6 + bob);
      this.boatSprite.setFlipX(this.playerDir === 'left');
    }

    this.posSaveTimer += dt;
    if (this.posSaveTimer > 2.5) {
      this.posSaveTimer = 0;
      gameBridge.getCallbacks()?.onPlayerMoved(this.player.x, this.player.y, this.currentInteriorId);
      if (this.isSailing) {
        gameBridge.getCallbacks()?.onBoatMoved(this.boatSprite.x, this.boatSprite.y);
      }
    }
  }

  private firePlayerBolt(angle: number, startX = this.player.x, startY = this.player.y) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.28;
    soundEngine.playBolt();
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const tintNum = eqWeapon ? Number.parseInt(eqWeapon.color.replace('#', ''), 16) : 0x6ae0d6;

    const spawnOne = (ang: number) => {
      const bolt = this.playerBolts.create(startX, startY, 'fx_bolt') as Phaser.Physics.Arcade.Sprite;
      bolt.setDepth(22);
      bolt.setTint(tintNum);
      bolt.setVelocity(Math.cos(ang) * 390, Math.sin(ang) * 390);
      bolt.setData('life', 1.15);
    };

    if (eqWeapon?.weaponType === 'bow') {
      spawnOne(angle - 0.1);
      spawnOne(angle + 0.1);
    } else {
      spawnOne(angle);
    }
  }

  private triggerCharacterAbility() {
    const cDef = CHARACTERS[this.save.activeCharacter];
    const cdMult = Math.max(0.55, 1 - this.save.upgrades.cooldown * 0.1);
    if (this.abilityCooldown > 0) {
      gameBridge.getCallbacks()?.onShowToast(`${cDef.abilityName} recharging (${this.abilityCooldown.toFixed(1)}s)`);
      return;
    }
    if (this.energy < cDef.abilityCost) {
      gameBridge.getCallbacks()?.onShowToast(`Need ${cDef.abilityCost} Energy for ${cDef.abilityName}!`);
      return;
    }

    this.energy -= cDef.abilityCost;
    this.abilityCooldown = cDef.abilityCooldown * cdMult;
    soundEngine.playAbility();

    switch (this.save.activeCharacter) {
      case 'explorer':
        this.galeTimer = 4.0;
        this.burstParticles(this.player.x, this.player.y, 0x5cb874, 16);
        gameBridge.getCallbacks()?.onShowToast('Gale Stride activated!');
        break;
      case 'inventor':
        this.droneTimer = 8.0;
        this.droneFireTimer = 0.1;
        this.burstParticles(this.player.x, this.player.y, 0xe0a943, 16);
        gameBridge.getCallbacks()?.onShowToast('Spark Drone deployed!');
        break;
      case 'mystic':
        this.shieldTimer = 4.5;
        this.burstParticles(this.player.x, this.player.y, 0xc792ea, 18);
        gameBridge.getCallbacks()?.onShowToast('Aether Dome raised!');
        break;
      case 'tidecaller': {
        this.health = Math.min(this.maxHealth, this.health + 15);
        const ring = this.add.circle(this.player.x, this.player.y, 12, 0x6ae0d6, 0.35);
        ring.setDepth(21);
        this.tweens.add({ targets: ring, radius: 130, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
        this.enemies.forEach((e) => {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) < 135) {
            this.damageEnemy(e, 24);
          }
        });
        gameBridge.getCallbacks()?.onShowToast('Tidal Pulse restored +15 HP!');
        break;
      }
      case 'mountaineer': {
        this.invulnTimer = Math.max(this.invulnTimer, 1.8);
        if (this.save.settings.screenShake) this.cameras.main.shake(180, 0.008);
        const slam = this.add.circle(this.player.x, this.player.y, 14, 0xf09b4c, 0.35);
        slam.setDepth(21);
        this.tweens.add({ targets: slam, radius: 115, alpha: 0, duration: 360, onComplete: () => slam.destroy() });
        this.enemies.forEach((e) => {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) < 120) {
            e.stunTimer = 2.5;
            this.damageEnemy(e, 26);
          }
        });
        gameBridge.getCallbacks()?.onShowToast('Hearth Slam stunned nearby foes!');
        break;
      }
      case 'chronomancer':
        this.chronoTimer = 5.0;
        [-0.3, 0, 0.3].forEach((offset) => {
          this.attackCooldown = 0;
          this.firePlayerBolt(this.facingAngle + offset);
        });
        this.burstParticles(this.player.x, this.player.y, 0x7ce2ff, 20);
        gameBridge.getCallbacks()?.onShowToast('Chrono Resonance slowed time!');
        break;
      case 'pyromancer':
        this.solarBuffTimer = 5.0;
        for (let i = 0; i < 8; i++) {
          this.attackCooldown = 0;
          this.firePlayerBolt((Math.PI * 2 * i) / 8);
        }
        this.burstParticles(this.player.x, this.player.y, 0xff884d, 22);
        gameBridge.getCallbacks()?.onShowToast('Solar Flare unleashed!');
        break;
      case 'skywarden':
        this.galeTimer = 4.0;
        this.energy = Math.min(this.maxEnergy, this.energy + 20);
        this.enemies.forEach((e) => {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) < 130) {
            e.stunTimer = 1.6;
            this.damageEnemy(e, 20);
          }
        });
        this.burstParticles(this.player.x, this.player.y, 0x9ee8ff, 20);
        gameBridge.getCallbacks()?.onShowToast('Zephyr Gust boosted speed & Energy!');
        break;
    }
  }

  private findNearestInteractive(): { prompt: string; trigger: () => void } | null {
    const px = this.player.x;
    const py = this.player.y;

    if (this.isSailing) {
      const canDock = this.findNearestTileMatching(
        px,
        py,
        3,
        (t) => t !== 7 && t !== 8 && !SOLID_TILES.has(t)
      );
      if (canDock) {
        return {
          prompt: 'Anchor & Disembark Boat onto Shore',
          trigger: () => this.tryDisembarkBoat(),
        };
      }
      return null;
    }

    // 1. Doors
    for (const d of this.doors) {
      if (Phaser.Math.Distance.Between(px, py, d.x, d.y) < 44) {
        return {
          prompt: d.label,
          trigger: () => this.transitionToZone(d.targetInteriorId),
        };
      }
    }

    // 2. NPCs
    for (const npc of this.npcs) {
      if (Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y) < 48) {
        const def = NPCS.find((n) => n.id === npc.id);
        return {
          prompt: `Speak with ${def?.name ?? 'Villager'}`,
          trigger: () => {
            soundEngine.playVoiceBlip(def?.voicePitch ?? 400);
            gameBridge.getCallbacks()?.onTalkNpc(npc.id);
          },
        };
      }
    }

    // 3. Chests
    for (const ch of this.chests) {
      if (!this.save.openedChests.includes(ch.id) && Phaser.Math.Distance.Between(px, py, ch.x, ch.y) < 44) {
        if (ch.requiresMystic && this.save.activeCharacter !== 'mystic') {
          return {
            prompt: 'Hidden Rune Chest (Switch to Lyra the Mystic to open)',
            trigger: () => gameBridge.getCallbacks()?.onShowToast('Only Lyra the Mystic can unseal this Rune Chest!'),
          };
        }
        return {
          prompt: 'Open Treasure Chest',
          trigger: () => {
            ch.sprite.setTexture('prop_chest_open');
            this.burstParticles(ch.x, ch.y, 0xffd466, 18);
            gameBridge.getCallbacks()?.onOpenChest(ch.id, ch.sparks, ch.items);
          },
        };
      }
    }

    // 4. World Interactables
    for (const inter of this.interactables) {
      if (Phaser.Math.Distance.Between(px, py, inter.x, inter.y) < 48) {
        return {
          prompt: inter.prompt,
          trigger: () => this.activateInteractable(inter),
        };
      }
    }

    // 5. Moored Boat anywhere along shore
    if (!this.currentInteriorId && Phaser.Math.Distance.Between(px, py, this.boatSprite.x, this.boatSprite.y) < 64) {
      return {
        prompt: 'Board Moored Boat',
        trigger: () => this.tryBoardBoat(false),
      };
    }

    return null;
  }

  private activateInteractable(inter: { id: string; kind: string; payload: Record<string, unknown> }) {
    const cb = gameBridge.getCallbacks();
    if (!cb) return;
    if (inter.kind === 'noticeboard') {
      cb.onOpenNoticeboard();
    } else if (inter.kind === 'shrine') {
      this.healPlayer();
      cb.onOpenFastTravel();
    } else if (inter.kind === 'minigame') {
      cb.onOpenMiniGame(inter.payload.miniGameId as MiniGameId);
    } else if (inter.kind === 'guardian_altar') {
      this.startGuardianEncounter(inter.payload.guardianId as GuardianId);
    } else if (inter.kind === 'boat_dock') {
      this.tryBoardBoat(true);
    } else if (
      inter.kind === 'house_bed' ||
      inter.kind === 'house_kitchen' ||
      inter.kind === 'house_wardrobe' ||
      inter.kind === 'house_customize'
    ) {
      cb.onOpenHouse();
    } else if (inter.kind === 'supermarket') {
      cb.onOpenShop('supermarket');
    } else if (inter.kind === 'restaurant') {
      cb.onOpenShop('restaurant');
    } else if (inter.kind === 'smithy') {
      cb.onOpenEquipment();
    } else if (inter.kind === 'secret_lore') {
      const sid = inter.payload.secretId as string;
      const msg = inter.payload.message as string;
      if (this.save.discoveredSecrets.includes(sid)) {
        cb.onShowToast(msg);
      } else {
        cb.onDiscoverSecret(sid, msg, 25);
      }
    } else if (inter.kind === 'gear_puzzle') {
      const pid = inter.payload.puzzleId as string;
      if (this.save.solvedPuzzles.includes(pid)) {
        cb.onShowToast('Clockwork conduit is humming smoothly!');
      } else if (this.save.activeCharacter !== 'inventor') {
        cb.onShowToast('This clockwork console requires Pip the Inventor!');
      } else {
        cb.onSolvePuzzle(pid, inter.payload.message as string, 45);
      }
    }
  }

  private tryInteract() {
    const found = this.findNearestInteractive();
    if (found) found.trigger();
  }

  private updateNpcs(dt: number) {
    this.npcs.forEach((npc) => {
      const distPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
      if (distPlayer < 58) {
        npc.sprite.setVelocity(0, 0);
        npc.sprite.anims.stop();
        const dx = this.player.x - npc.sprite.x;
        const dy = this.player.y - npc.sprite.y;
        const row = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
        npc.sprite.setFrame(row * 3);
      } else {
        const dTarget = Phaser.Math.Distance.Between(npc.sprite.x, npc.sprite.y, npc.targetX, npc.targetY);
        if (dTarget < 6) {
          npc.sprite.setVelocity(0, 0);
          npc.sprite.anims.stop();
          npc.waitTimer -= dt;
          if (npc.waitTimer <= 0) {
            npc.waitTimer = 1.8 + Math.random() * 2.5;
            const ang = Math.random() * Math.PI * 2;
            const rad = Math.random() * npc.patrolRadius;
            npc.targetX = npc.homeX + Math.cos(ang) * rad;
            npc.targetY = npc.homeY + Math.sin(ang) * rad;
          }
        } else {
          const ang = Phaser.Math.Angle.Between(npc.sprite.x, npc.sprite.y, npc.targetX, npc.targetY);
          const vx = Math.cos(ang) * 42;
          const vy = Math.sin(ang) * 42;
          npc.sprite.setVelocity(vx, vy);
          const dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down';
          npc.sprite.anims.play(`${npc.id}_walk_${dir}`, true);
        }
      }
      if (npc.markerText) {
        npc.markerText.setPosition(npc.sprite.x, npc.sprite.y - 24 + Math.sin(this.time.now * 0.005) * 2);
      }
    });
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        e.sprite.setVelocity(0, 0);
        continue;
      }
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y);
      if (dist < 240 && !this.isSailing) {
        const ang = Phaser.Math.Angle.Between(e.sprite.x, e.sprite.y, this.player.x, this.player.y);
        e.sprite.setVelocity(Math.cos(ang) * e.speed, Math.sin(ang) * e.speed);
        e.attackTimer -= dt;
        if (e.attackTimer <= 0 && dist < 210) {
          e.attackTimer = 2.4;
          this.spawnHostileOrb(e.sprite.x, e.sprite.y, ang, 130);
        }
        if (dist < 22) {
          this.hurtPlayer(10);
        }
      } else {
        const homeDist = Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, e.homeX, e.homeY);
        if (homeDist > 12) {
          const ang = Phaser.Math.Angle.Between(e.sprite.x, e.sprite.y, e.homeX, e.homeY);
          e.sprite.setVelocity(Math.cos(ang) * (e.speed * 0.6), Math.sin(ang) * (e.speed * 0.6));
        } else {
          e.sprite.setVelocity(0, 0);
        }
      }
    }
  }

  private updateGuardian(dt: number) {
    const g = this.guardianState;
    if (!g) return;

    g.sprite.y += Math.sin(this.time.now * 0.004) * 0.2;

    if (g.pendingStrike) {
      g.telegraphTimer -= dt;
      if (g.telegraphTimer <= 0) {
        const st = g.pendingStrike;
        st.ring.destroy();
        this.burstParticles(st.x, st.y, 0xf09b4c, 18);
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, st.x, st.y) < st.radius) {
          this.hurtPlayer(16);
        }
        g.pendingStrike = undefined;
      }
    }

    g.attackTimer -= dt;
    if (g.attackTimer <= 0) {
      g.attackTimer = g.phase === 1 ? 2.4 : g.phase === 2 ? 1.85 : 1.45;
      const baseAngle = Phaser.Math.Angle.Between(g.sprite.x, g.sprite.y, this.player.x, this.player.y);
      const count = g.phase === 1 ? 3 : g.phase === 2 ? 5 : 7;
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 0.28;
        this.spawnHostileOrb(g.sprite.x, g.sprite.y, baseAngle + offset, 155 + g.phase * 22);
      }

      if (!g.pendingStrike && Math.random() < 0.6) {
        const sx = this.player.x;
        const sy = this.player.y;
        const ring = this.add.circle(sx, sy, 46, 0xd96b43, 0.18);
        ring.setStrokeStyle(2, 0xf5cc6b, 0.9);
        ring.setDepth(5);
        g.pendingStrike = { x: sx, y: sy, radius: 48, ring };
        g.telegraphTimer = 1.05;
      }
    }
  }

  private spawnHostileOrb(x: number, y: number, angle: number, speed: number) {
    const orb = this.hostileOrbs.create(x, y, 'fx_bolt') as Phaser.Physics.Arcade.Sprite;
    orb.setTint(0xff7666);
    orb.setDepth(21);
    const mult = this.chronoTimer > 0 ? 0.45 : 1;
    orb.setVelocity(Math.cos(angle) * speed * mult, Math.sin(angle) * speed * mult);
    orb.setData('life', 2.4);
  }

  private updateProjectiles(dt: number) {
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const eqLvl = this.save.equipmentLevels[this.save.equippedWeapon] ?? 1;
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const equipPower = (eqWeapon?.powerBonus ?? 0) + (eqLvl - 1) * 3 + (eqAcc?.powerBonus ?? 0);
    const pyroMult = this.save.activeCharacter === 'pyromancer' ? 1.15 : 1;
    const foodPowerMult = this.activeFoodBuff?.stat === 'power' ? 1.25 : 1;
    const solarMult = this.solarBuffTimer > 0 ? 1.2 : 1;

    const boltPower = Math.round((12 + this.save.upgrades.resonance * 4 + equipPower) * pyroMult * foodPowerMult * solarMult);

    this.playerBolts.getChildren().forEach((obj) => {
      const bolt = obj as Phaser.Physics.Arcade.Sprite;
      const life = (bolt.getData('life') as number) - dt;
      bolt.setData('life', life);
      if (life <= 0) {
        bolt.destroy();
        return;
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (Phaser.Math.Distance.Between(bolt.x, bolt.y, e.sprite.x, e.sprite.y) < 22) {
          this.damageEnemy(e, boltPower);
          bolt.destroy();
          return;
        }
      }

      if (this.guardianState) {
        const g = this.guardianState;
        for (const p of g.pillars) {
          if (!p.lit && Phaser.Math.Distance.Between(bolt.x, bolt.y, p.x, p.y) < 26) {
            p.lit = true;
            p.sprite.setTexture('prop_pillar_on');
            this.burstParticles(p.x, p.y, 0xffd466, 16);
            soundEngine.playCollect();
            bolt.destroy();
            if (g.pillars.every((pl) => pl.lit)) {
              this.channelGuardianPurify(g);
            }
            return;
          }
        }

        if (Phaser.Math.Distance.Between(bolt.x, bolt.y, g.sprite.x, g.sprite.y) < 36) {
          g.purity = Math.max(0, g.purity - boltPower * 0.45);
          this.burstParticles(g.sprite.x, g.sprite.y, 0x87d4c8, 8);
          g.sprite.setTint(0xffffff);
          this.time.delayedCall(70, () => g.sprite?.clearTint());
          bolt.destroy();
          this.checkGuardianPhase(g);
          return;
        }
      }
    });

    this.hostileOrbs.getChildren().forEach((obj) => {
      const orb = obj as Phaser.Physics.Arcade.Sprite;
      const life = (orb.getData('life') as number) - dt;
      orb.setData('life', life);
      if (life <= 0) {
        orb.destroy();
        return;
      }
      if (Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y) < 18) {
        orb.destroy();
        this.hurtPlayer(12);
      }
    });
  }

  private channelGuardianPurify(g: RuntimeGuardianState) {
    g.purity = Math.max(0, g.purity - Math.ceil(g.maxPurity * 0.36));
    this.hitstopTimer = 0.05;
    if (this.save.settings.screenShake) this.cameras.main.shake(220, 0.01);
    this.burstParticles(g.sprite.x, g.sprite.y, 0xf5cc6b, 28);
    soundEngine.playRestoreFanfare();

    if (g.purity > 0) {
      this.time.delayedCall(650, () => {
        if (!this.guardianState) return;
        this.guardianState.pillars.forEach((p) => {
          p.lit = false;
          p.sprite.setTexture('prop_pillar_off');
        });
      });
    }
    this.checkGuardianPhase(g);
  }

  private checkGuardianPhase(g: RuntimeGuardianState) {
    const pct = g.purity / g.maxPurity;
    if (pct <= 0) {
      const purifiedId = g.id;
      this.burstParticles(g.sprite.x, g.sprite.y, 0x7be3f5, 42);
      g.pendingStrike?.ring.destroy();
      g.pillars.forEach((p) => p.sprite.destroy());
      g.sprite.destroy();
      this.guardianState = null;
      this.hostileOrbs.clear(true, true);
      gameBridge.getCallbacks()?.onGuardianPurified(purifiedId);
      return;
    }
    if (pct < 0.34 && g.phase < 3) {
      g.phase = 3;
      gameBridge.getCallbacks()?.onShowToast(`${GUARDIANS[g.id].name} enters Final Resonance!`);
    } else if (pct < 0.68 && g.phase < 2) {
      g.phase = 2;
      gameBridge.getCallbacks()?.onShowToast(`${GUARDIANS[g.id].name} shifts into Phase 2!`);
    }
  }

  private damageEnemy(e: RuntimeEnemy, amount: number) {
    e.hp -= amount;
    e.sprite.setTint(0xffffff);
    this.time.delayedCall(80, () => e.sprite?.clearTint());
    this.burstParticles(e.sprite.x, e.sprite.y, 0xc792ea, 8);
    if (e.hp <= 0) {
      this.hitstopTimer = 0.04;
      this.burstParticles(e.sprite.x, e.sprite.y, 0x87d4c8, 16);
      e.sprite.destroy();
      this.enemies = this.enemies.filter((item) => item.id !== e.id);
      gameBridge.getCallbacks()?.onDefeatEnemy(14, 22);
    }
  }

  private hurtPlayer(amount: number) {
    if (this.invulnTimer > 0) return;
    if (this.shieldTimer > 0) {
      this.burstParticles(this.player.x, this.player.y, 0x87d4c8, 10);
      return;
    }
    this.health -= amount;
    this.invulnTimer = 0.9;
    this.hitstopTimer = 0.04;
    if (this.save.settings.screenShake) this.cameras.main.shake(150, 0.007);
    gameBridge.getCallbacks()?.onPlayerDamaged(amount);

    if (this.health <= 0) {
      this.health = this.maxHealth;
      this.energy = this.maxEnergy;
      this.guardianState?.pendingStrike?.ring.destroy();
      this.guardianState?.pillars.forEach((p) => p.sprite.destroy());
      this.guardianState?.sprite.destroy();
      this.guardianState = null;
      this.hostileOrbs.clear(true, true);
      this.fastTravelTo(OX + 54, OY + 58);
      gameBridge.getCallbacks()?.onShowToast('You bounced back at Brightfall Shrine with full Health!');
    }
  }

  private updateCollectiblesAndLandmarks() {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, col.x, col.y) < 28) {
        this.burstParticles(col.x, col.y, 0xf5cc6b, 12);
        col.sprite.destroy();
        this.collectibles.splice(i, 1);
        gameBridge.getCallbacks()?.onCollectItem(col.id, col.itemId, col.quantity);
      }
    }

    if (!this.currentInteriorId) {
      const tx = Math.floor(this.player.x / TILE_SIZE);
      const ty = Math.floor(this.player.y / TILE_SIZE);
      LANDMARKS.forEach((lm) => {
        if (!this.save.discoveredLandmarks.includes(lm.id)) {
          if (Phaser.Math.Distance.Between(tx, ty, lm.tileX, lm.tileY) < 6) {
            gameBridge.getCallbacks()?.onDiscoverLandmark(lm.id);
          }
        }
      });
    }
  }

  private updateInteriorExit() {
    if (!this.currentInteriorId) return;
    const def = INTERIORS[this.currentInteriorId];
    if (!def) return;
    const ex = def.exitX * TILE_SIZE + 16;
    const ey = def.exitY * TILE_SIZE + 16;
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, ex, ey) < 20) {
      this.transitionToZone(null, def.returnWorldX, def.returnWorldY);
    }
  }

  private burstParticles(x: number, y: number, color: number, count = 12) {
    const emitter = this.add.particles(x, y, 'px_particle', {
      speed: { min: 35, max: 115 },
      lifespan: 380,
      scale: { start: 1.8, end: 0 },
      tint: color,
      emitting: false,
    });
    emitter.setDepth(50);
    emitter.explode(count);
    this.time.delayedCall(450, () => emitter.destroy());
  }

  private syncHud(dt: number) {
    this.hudSyncTimer += dt;
    const nearest = this.findNearestInteractive();
    const nextPrompt = nearest ? nearest.prompt : null;
    if (this.hudSyncTimer < 0.08 && nextPrompt === this.lastInteractPrompt) return;
    this.hudSyncTimer = 0;
    this.lastInteractPrompt = nextPrompt;

    const tx = Math.floor(this.player.x / TILE_SIZE);
    const ty = Math.floor(this.player.y / TILE_SIZE);
    const region: RegionId = this.currentInteriorId
      ? INTERIORS[this.currentInteriorId].region
      : getRegionAtTile(tx, ty);
    const cDef = CHARACTERS[this.save.activeCharacter];

    gameBridge.getCallbacks()?.onHudUpdate({
      health: Math.ceil(this.health),
      maxHealth: this.maxHealth,
      energy: Math.floor(this.energy),
      maxEnergy: this.maxEnergy,
      hunger: Math.ceil(this.hunger),
      maxHunger: 100,
      abilityCooldownRemaining: this.abilityCooldown,
      abilityCooldownTotal: cDef.abilityCooldown,
      region,
      regionName: REGIONS[region].name,
      interiorId: this.currentInteriorId,
      interiorName: this.currentInteriorId ? INTERIORS[this.currentInteriorId].name : null,
      playerX: this.player.x,
      playerY: this.player.y,
      facingAngle: this.facingAngle,
      isSailing: this.isSailing,
      isSwimming: this.isSwimming,
      weather: this.weather,
      timeOfDay: this.timeOfDay,
      timePhase: getTimePhaseFromHour(this.timeOfDay),
      activeBuff: this.activeFoodBuff
        ? `${this.activeFoodBuff.name} (${Math.ceil(this.activeFoodBuff.remaining)}s)`
        : null,
      interactPrompt: nextPrompt,
      activeGuardian: this.guardianState
        ? {
            id: this.guardianState.id,
            name: GUARDIANS[this.guardianState.id].name,
            title: GUARDIANS[this.guardianState.id].title,
            purity: Math.ceil(this.guardianState.purity),
            maxPurity: this.guardianState.maxPurity,
            phase: this.guardianState.phase,
          }
        : null,
    });
  }
}

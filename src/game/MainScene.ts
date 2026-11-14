import Phaser from 'phaser';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS } from '../data/characters';
import { COMPANIONS } from '../data/companions';
import { EQUIPMENT_CATALOG } from '../data/equipmentAndFood';
import { getGuardianLockReason, NPCS } from '../data/npcs';
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
  getMovingIslandSlotCoords,
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

interface CrowdWalker {
  sprite: Phaser.GameObjects.Sprite;
  sheetKey: string;
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  speed: number;
  waitTimer: number;
}

interface GiantCreature {
  id: string;
  title: string;
  region: RegionId;
  sprite: Phaser.GameObjects.Image;
  waypoints: { x: number; y: number }[];
  wpIndex: number;
  speed: number;
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
  private airshipSprite!: Phaser.GameObjects.Image;
  private playerDir: 'down' | 'left' | 'right' | 'up' = 'down';
  private facingAngle = Math.PI / 2;

  private currentInteriorId: string | null = null;
  private save!: SaveData;
  private isPaused = false;
  private isSailing = false;
  private isFlying = false;
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
  private fireworkTimer = 3;

  private activeFoodBuff: { name: string; stat: 'speed' | 'power' | 'regen'; remaining: number } | null = null;

  private timeOfDay = 9.0;
  private timeSyncTimer = 0;
  private weather: WeatherType = 'sunny';
  private weatherChangeTimer = 50;
  private lightningTimer = 7;

  private shieldGraphic?: Phaser.GameObjects.Arc;
  private droneSprite?: Phaser.GameObjects.Sprite;
  private companionSprite?: Phaser.GameObjects.Sprite;
  private companionGlow?: Phaser.GameObjects.Arc;
  private companionAssistTimer = 1.6;
  private companionRadarTimer = 2.6;
  private shimmerTimer = 0.5;
  private lightingOverlay!: Phaser.GameObjects.Rectangle;
  private lightningOverlay!: Phaser.GameObjects.Rectangle;

  private solidGroup!: Phaser.Physics.Arcade.StaticGroup;
  private waterBlockGroup!: Phaser.Physics.Arcade.StaticGroup;
  private boatLandGroup!: Phaser.Physics.Arcade.StaticGroup;
  private solidCollider!: Phaser.Physics.Arcade.Collider;
  private waterCollider!: Phaser.Physics.Arcade.Collider;
  private boatLandCollider!: Phaser.Physics.Arcade.Collider;

  private npcs: RuntimeNpc[] = [];
  private crowdWalkers: CrowdWalker[] = [];
  private giantCreatures: GiantCreature[] = [];
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
  private buildingFootprints: { x1: number; y1: number; x2: number; y2: number }[] = [];
  private propSprites: Phaser.GameObjects.GameObject[] = [];
  private nightGlows: Phaser.GameObjects.Arc[] = [];

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

    const boatTex =
      this.save?.boatUpgrades.skin === 'galleon'
        ? 'prop_boat_galleon'
        : this.save?.boatUpgrades.skin === 'schooner'
          ? 'prop_boat_schooner'
          : 'prop_boat';
    this.boatSprite = this.add.image(
      this.save?.boatPos.x ?? (OX + 65) * TILE_SIZE + 16,
      this.save?.boatPos.y ?? (OY + 97) * TILE_SIZE + 16,
      boatTex
    );
    this.boatSprite.setDepth(17);

    const airTex = `prop_airship_${this.save?.airship.hullColor ?? 'gold'}`;
    this.airshipSprite = this.add.image(
      this.save?.airship.pos.x ?? (OX + 76) * TILE_SIZE + 16,
      this.save?.airship.pos.y ?? (OY + 37) * TILE_SIZE + 16,
      airTex
    );
    this.airshipSprite.setDepth(35);
    this.airshipSprite.setVisible(false);

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

    this.companionGlow = this.add.circle(startX - 24, startY + 6, 36, 0xffdf7a, 0);
    this.companionGlow.setDepth(18);
    this.companionGlow.setVisible(false);

    const initComp = this.save?.activeCompanion ?? 'comp_fox';
    this.companionSprite = this.add.sprite(startX - 24, startY + 8, initComp, 0);
    this.companionSprite.setDepth(19);
    this.syncCompanionSprite();

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

    this.solidCollider = this.physics.add.collider(this.player, this.solidGroup);
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
      boardAirship: () => this.tryBoardAirship(),
      landAirship: () => this.tryLandAirship(),
      takePhoto: () => this.takePhoto(),
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
    const eqArmor = this.save.equippedArmor ? EQUIPMENT_CATALOG[this.save.equippedArmor] : undefined;
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const hpBonus = this.save.upgrades.recovery * 15;
    const enBonus =
      this.save.upgrades.energy * 20 +
      (eqWeapon?.energyBonus ?? 0) +
      (eqArmor?.energyBonus ?? 0) +
      (eqAcc?.energyBonus ?? 0);
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
      this.activeFoodBuff = { name: eff.buffName, stat: eff.buffStat, remaining: eff.buffDuration };
    }
    this.burstParticles(this.player.x, this.player.y, 0x66d18a, 14);
  }

  private onSaveUpdated(nextSave: SaveData) {
    const prevRestCount = this.save?.completedRestorations.length ?? 0;
    const prevVillageCount = this.save?.village.buildings.length ?? 0;
    const prevEvent = this.save?.cityEvent;
    const prevSlot = this.save?.movingIslandSlot;
    const prevBoatSkin = this.save?.boatUpgrades.skin;
    const prevAirHull = this.save?.airship.hullColor;
    const prevHouseKey = this.save
      ? `${this.save.house.tier}_${this.save.house.floorStyle}_${this.save.house.placedDecor.join(',')}_${this.save.house.invitedNpcs.join(',')}`
      : '';
    const nextHouseKey = `${nextSave.house.tier}_${nextSave.house.floorStyle}_${nextSave.house.placedDecor.join(',')}_${nextSave.house.invitedNpcs.join(',')}`;
    const prevChar = this.save?.activeCharacter;
    const prevOutfit = prevChar ? this.save?.characterOutfits[prevChar] : undefined;
    const prevCompanion = this.save?.activeCompanion;

    this.save = nextSave;
    this.hunger = nextSave.hunger;
    this.recalcStats();

    if (prevCompanion !== nextSave.activeCompanion) {
      this.syncCompanionSprite();
      if (this.companionSprite && nextSave.activeCompanion) {
        this.burstParticles(this.companionSprite.x, this.companionSprite.y, 0xf5cc6b, 12);
      }
    }

    if (prevBoatSkin !== nextSave.boatUpgrades.skin) {
      const boatTex =
        nextSave.boatUpgrades.skin === 'galleon'
          ? 'prop_boat_galleon'
          : nextSave.boatUpgrades.skin === 'schooner'
            ? 'prop_boat_schooner'
            : 'prop_boat';
      this.boatSprite.setTexture(boatTex);
    }
    if (prevAirHull !== nextSave.airship.hullColor) {
      this.airshipSprite.setTexture(`prop_airship_${nextSave.airship.hullColor}`);
    }

    if (
      prevChar !== nextSave.activeCharacter ||
      prevOutfit !== nextSave.characterOutfits[nextSave.activeCharacter]
    ) {
      const key = `char_${nextSave.activeCharacter}_${nextSave.characterOutfits[nextSave.activeCharacter]}`;
      this.player.setTexture(key, 0);
      this.burstParticles(this.player.x, this.player.y, 0x87d4c8, 12);
    }

    if (
      (!this.currentInteriorId &&
        (nextSave.completedRestorations.length !== prevRestCount ||
          nextSave.village.buildings.length !== prevVillageCount ||
          nextSave.cityEvent !== prevEvent ||
          nextSave.movingIslandSlot !== prevSlot)) ||
      (this.currentInteriorId === 'int_player_house' && prevHouseKey !== nextHouseKey)
    ) {
      this.buildCurrentZone(this.player.x, this.player.y);
    }
  }

  private syncCompanionSprite() {
    if (!this.companionSprite) return;
    const compId = this.save?.activeCompanion;
    if (!compId || !COMPANIONS[compId]) {
      this.companionSprite.setVisible(false);
      this.companionGlow?.setVisible(false);
      return;
    }
    this.companionSprite.setTexture(compId, 0);
    this.companionSprite.setVisible(true);
    if (this.anims.exists(`${compId}_idle`)) {
      this.companionSprite.anims.play(`${compId}_idle`, true);
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
    this.crowdWalkers.forEach((c) => c.sprite.destroy());
    this.crowdWalkers = [];
    this.giantCreatures.forEach((g) => g.sprite.destroy());
    this.giantCreatures = [];
    this.enemies.forEach((e) => e.sprite.destroy());
    this.enemies = [];
    this.chests.forEach((c) => c.sprite.destroy());
    this.chests = [];
    this.collectibles.forEach((c) => c.sprite.destroy());
    this.collectibles = [];
    this.buildingSprites.forEach((b) => b.destroy());
    this.buildingSprites = [];
    this.buildingFootprints = [];
    this.propSprites.forEach((p) => p.destroy());
    this.propSprites = [];
    this.nightGlows.forEach((g) => g.destroy());
    this.nightGlows = [];
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
      this.isFlying = false;
      this.isSwimming = false;
      this.boatSprite.setVisible(false);
      this.airshipSprite.setVisible(false);
      if (this.solidCollider) this.solidCollider.active = true;
      if (this.waterCollider) this.waterCollider.active = true;
      if (this.boatLandCollider) this.boatLandCollider.active = false;

      const intDef = INTERIORS[this.currentInteriorId];
      this.currentGrid = buildInteriorGrid(intDef.id, save);
      this.map = this.make.tilemap({ data: this.currentGrid, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
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

      // Also spawn NPCs invited to the Player's Residence!
      if (intDef.id === 'int_player_house') {
        save.house.invitedNpcs.forEach((nid, idx) => {
          const def = NPCS.find((n) => n.id === nid);
          if (def) {
            this.spawnNpc({ ...def, interiorId: 'int_player_house', tileX: 6 + idx * 4, tileY: 9, patrolRadius: 2 });
          }
        });
      }

      WORLD_CHESTS.filter((c) => c.interiorId === intDef.id).forEach((c) => this.spawnChest(c));
      WORLD_COLLECTIBLES.filter((c) => c.interiorId === intDef.id).forEach((col) => this.spawnCollectible(col));
      ENEMY_SPAWNS.filter((e) => e.interiorId === intDef.id).forEach((sp) => this.spawnEnemy(sp));
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

    // Overworld (360 x 270)
    this.boatSprite.setVisible(true);
    this.boatSprite.setPosition(save.boatPos.x, save.boatPos.y);
    if (save.airship.unlocked || save.completedRestorations.includes('rest_brightfall_railway')) {
      this.airshipSprite.setVisible(true);
      this.airshipSprite.setPosition(save.airship.pos.x, save.airship.pos.y);
    } else {
      this.airshipSprite.setVisible(false);
    }

    this.currentGrid = buildOverworldGrid(save);
    this.map = this.make.tilemap({ data: this.currentGrid, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tiles = this.map.addTilesetImage('world_tiles', 'world_tiles', TILE_SIZE, TILE_SIZE)!;
    this.groundLayer = this.map.createLayer(0, tiles, 0, 0)!;
    this.groundLayer.setDepth(0);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);

    const isWaterTile = (t: number) => t === 7 || t === 8;
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const t = this.currentGrid[y][x];
        if (t === 8) {
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

    // Buildings (including dynamic Newbrook Village structures)
    WORLD_BUILDINGS.forEach((b) => {
      if (b.requiresVillageBuilding && !save.village.buildings.includes(b.requiresVillageBuilding)) return;
      const isRestored = !b.restorationKey || save.completedRestorations.includes(b.restorationKey);
      const tex = isRestored ? b.textureRestored : b.textureDamaged;
      const cx = (b.tileX + b.widthTiles / 2) * TILE_SIZE;
      const cy = (b.tileY + b.heightTiles / 2) * TILE_SIZE;
      const img = this.add.image(cx, cy, tex);
      img.setDepth(10);
      this.buildingSprites.push(img);
      const colW = b.widthTiles * TILE_SIZE - 8;
      const colH = b.heightTiles * TILE_SIZE - 12;
      this.addBoxToGroup(this.solidGroup, cx, cy + 6, colW, colH);
      this.buildingFootprints.push({
        x1: cx - colW * 0.5 - 12,
        y1: cy + 6 - colH * 0.5 - 12,
        x2: cx + colW * 0.5 + 12,
        y2: cy + 6 + colH * 0.5 + 12,
      });

      if (b.targetInteriorId && b.doorTileX !== undefined && b.doorTileY !== undefined) {
        this.doors.push({
          x: b.doorTileX * TILE_SIZE + 16,
          y: b.doorTileY * TILE_SIZE + 16,
          targetInteriorId: b.targetInteriorId,
          label: `Enter ${b.label}`,
        });
      }
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
      if (tex === 'prop_lantern_on' || tex === 'prop_campfire') {
        const glow = this.add.circle(pxPos, pyPos - 4, tex === 'prop_campfire' ? 54 : 44, tex === 'prop_campfire' ? 0xff9b4a : 0xffdf7a, 0);
        glow.setDepth(82);
        glow.setVisible(false);
        this.nightGlows.push(glow);
      }
    });

    // Interactive Named NPCs
    NPCS.filter((n) => !n.interiorId).forEach((npc) => {
      if (npc.requiresRestorationId && !save.completedRestorations.includes(npc.requiresRestorationId)) return;
      this.spawnNpc(npc);
    });

    // Collision-free multi-zone Pedestrians across Brightfall, Marina, Sports Park, Newbrook & Islands
    this.spawnCityCrowdWalkers(120);

    // 4 Giant Roaming Creatures (for [P] Wildlife Photography)
    this.spawnGiantCreatures();

    // Chests, Collectibles, Interactables
    WORLD_CHESTS.filter((c) => !c.interiorId).forEach((c) => this.spawnChest(c));
    WORLD_COLLECTIBLES.filter((c) => !c.interiorId).forEach((col) => this.spawnCollectible(col));

    WORLD_INTERACTABLES.filter((i) => !i.interiorId).forEach((i) => {
      const ix = i.tileX * TILE_SIZE + 16;
      const iy = i.tileY * TILE_SIZE + 16;
      if (i.kind === 'shrine') {
        this.propSprites.push(this.add.image(ix, iy, 'prop_shrine').setDepth(9));
      } else if (i.kind === 'guardian_altar') {
        this.propSprites.push(this.add.image(ix, iy, 'prop_pillar_on').setDepth(9));
      } else if (i.kind === 'boat_dock') {
        this.propSprites.push(this.add.image(ix, iy - 6, 'prop_lantern_on').setDepth(9));
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

    // Dynamic Moving Island Guardian Altar
    const mi = getMovingIslandSlotCoords(save.movingIslandSlot);
    this.interactables.push({
      id: 'altar_moving_island',
      x: mi.x * TILE_SIZE + 16,
      y: (mi.y - 2) * TILE_SIZE + 16,
      prompt: 'Challenge Thalassa, Driftspire Tide-Spirit [E]',
      kind: 'guardian_altar',
      payload: { guardianId: 'drift_leviathan' },
    });

    // Overworld Enemies
    ENEMY_SPAWNS.filter((sp) => !sp.interiorId).forEach((sp) => {
      if (sp.restorationClearKey && save.completedRestorations.includes(sp.restorationClearKey)) return;
      this.spawnEnemy(sp);
    });

    this.player.setPosition(spawnPixelX, spawnPixelY);
    if (this.companionSprite) {
      this.companionSprite.setPosition(spawnPixelX - 24, spawnPixelY + 8);
    }
  }

  private isPointWalkableForCrowd(px: number, py: number): boolean {
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    if (tx < 2 || tx >= WORLD_WIDTH - 2 || ty < 2 || ty >= WORLD_HEIGHT - 2) return false;
    const t = this.currentGrid[ty]?.[tx];
    if (t === undefined || SOLID_TILES.has(t) || t === 7 || t === 43 || t === 48) return false;
    for (const fp of this.buildingFootprints) {
      if (px >= fp.x1 && px <= fp.x2 && py >= fp.y1 && py <= fp.y2) return false;
    }
    return true;
  }

  private spawnCityCrowdWalkers(count: number) {
    const zones: { xMin: number; xMax: number; yMin: number; yMax: number; weight: number }[] = [
      { xMin: OX + 36, xMax: OX + 77, yMin: OY + 40, yMax: OY + 67, weight: 66 }, // Brightfall Core & Boulevards
      { xMin: OX + 66, xMax: OX + 99, yMin: OY + 61, yMax: OY + 74, weight: 18 }, // Sports & Starfall Park
      { xMin: OX + 56, xMax: OX + 74, yMin: OY + 82, yMax: OY + 89, weight: 14 }, // Driftwood Marina
      { xMin: 277, xMax: 296, yMin: 56, yMax: 65, weight: 6 }, // Frosthaven Port
      { xMin: 66, xMax: 82, yMin: 219, yMax: 227, weight: 6 }, // Canopy Jungle Landing
      { xMin: 173, xMax: 187, yMin: 47, yMax: 56, weight: 5 }, // Cloudspire Pavilion
    ];
    if (this.save.village.buildings.length > 0) {
      zones.push({ xMin: OX + 22, xMax: OX + 33, yMin: OY + 19, yMax: OY + 27, weight: 8 });
    }
    const totalWeight = zones.reduce((s, z) => s + z.weight, 0);

    for (let i = 0; i < count; i++) {
      let r = ((i * 19 + 7) % totalWeight);
      let zone = zones[0];
      for (const z of zones) {
        if (r < z.weight) {
          zone = z;
          break;
        }
        r -= z.weight;
      }

      let hx = ((zone.xMin + zone.xMax) * 0.5) * TILE_SIZE + 16;
      let hy = ((zone.yMin + zone.yMax) * 0.5) * TILE_SIZE + 16;
      let placed = false;
      for (let attempt = 0; attempt < 26; attempt++) {
        const tx = zone.xMin + Math.floor(Math.random() * Math.max(1, zone.xMax - zone.xMin));
        const ty = zone.yMin + Math.floor(Math.random() * Math.max(1, zone.yMax - zone.yMin));
        const cx = tx * TILE_SIZE + 16;
        const cy = ty * TILE_SIZE + 16;
        if (this.isPointWalkableForCrowd(cx, cy)) {
          hx = cx;
          hy = cy;
          placed = true;
          break;
        }
      }
      if (!placed) continue;

      const sheetKey = `crowd_ped_${i % 6}`;
      const sprite = this.add.sprite(hx, hy, sheetKey, 0);
      sprite.setDepth(17);
      this.crowdWalkers.push({
        sprite,
        sheetKey,
        homeX: hx,
        homeY: hy,
        targetX: hx,
        targetY: hy,
        speed: 28 + (i % 5) * 5,
        waitTimer: Math.random() * 1.6,
      });
    }
  }

  private spawnGiantCreatures() {
    const defs = [
      {
        id: 'giant_mammoth',
        title: 'Glacier Ridge Mammoth',
        region: 'frozen_kingdom' as RegionId,
        tex: 'giant_mammoth',
        wps: [{ x: 292, y: 42 }, { x: 308, y: 50 }, { x: 282, y: 48 }],
        speed: 28,
      },
      {
        id: 'giant_stag',
        title: 'Elder Emerald Forest Stag',
        region: 'whispering_woods' as RegionId,
        tex: 'giant_stag',
        wps: [{ x: OX + 18, y: OY + 48 }, { x: OX + 12, y: OY + 60 }, { x: OX + 22, y: OY + 56 }],
        speed: 36,
      },
      {
        id: 'giant_whale',
        title: 'Azure Sea Leviathan Whale',
        region: 'ocean' as RegionId,
        tex: 'giant_whale',
        wps: [{ x: 145, y: 212 }, { x: 215, y: 215 }, { x: 195, y: 238 }, { x: 120, y: 225 }],
        speed: 44,
      },
      {
        id: 'giant_manta',
        title: 'Cloudspire Golden Sky Manta',
        region: 'sky_island' as RegionId,
        tex: 'giant_manta',
        wps: [{ x: 170, y: 42 }, { x: 194, y: 42 }, { x: 180, y: 30 }],
        speed: 48,
      },
    ];

    defs.forEach((d) => {
      const start = d.wps[0];
      const sprite = this.add.image(start.x * TILE_SIZE, start.y * TILE_SIZE, d.tex);
      sprite.setDepth(26);
      this.giantCreatures.push({
        id: d.id,
        title: d.title,
        region: d.region,
        sprite,
        waypoints: d.wps.map((w) => ({ x: w.x * TILE_SIZE, y: w.y * TILE_SIZE })),
        wpIndex: 1,
        speed: d.speed,
      });
    });
  }

  private spawnCollectible(col: (typeof WORLD_COLLECTIBLES)[number]) {
    const sx = col.tileX * TILE_SIZE + 16;
    const sy = col.tileY * TILE_SIZE + 16;
    const sprite = this.add.sprite(sx, sy, col.texture);
    sprite.setDepth(8);
    this.tweens.add({ targets: sprite, y: sy - 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.collectibles.push({ id: col.id, sprite, x: sx, y: sy, itemId: col.itemId, quantity: col.quantity });
  }

  private spawnEnemy(sp: (typeof ENEMY_SPAWNS)[number]) {
    const diffMult =
      this.save.settings.difficulty === 'explorer' ? 0.75 : this.save.settings.difficulty === 'heroic' ? 1.35 : 1;
    const hp = Math.round(sp.hp * diffMult);
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
      hp,
      maxHp: hp,
      speed: sp.speed,
      kind: sp.kind,
      attackTimer: 1.5 + Math.random(),
      stunTimer: 0,
    });
  }

  private placeInteriorProp(tx: number, ty: number, texture: string, solid = false, depth = 7) {
    const px = tx * TILE_SIZE + 16;
    const py = ty * TILE_SIZE + 16;
    const img = this.add.image(px, py, texture).setDepth(depth);
    this.propSprites.push(img);
    if (solid) {
      this.addBoxToGroup(this.solidGroup, px, py, 26, 22);
    }
    return img;
  }

  private spawnInteriorFurniture(interiorId: string) {
    const intDef = INTERIORS[interiorId];
    if (intDef && interiorId !== 'int_underground_city' && !interiorId.startsWith('int_dungeon_')) {
      // Subtle exit mat at interior threshold
      this.propSprites.push(
        this.add
          .rectangle(intDef.exitX * TILE_SIZE + 16, intDef.exitY * TILE_SIZE + 18, 30, 12, 0xc77b4c, 0.85)
          .setStrokeStyle(1, 0xf5cc6b)
          .setDepth(2)
      );
    }

    if (interiorId === 'int_player_house') {
      const wallHex = Number.parseInt(this.save.house.wallColor.replace('#', ''), 16) || 0x4c3e73;
      this.propSprites.push(this.add.rectangle(11 * TILE_SIZE, 16, 22 * TILE_SIZE, 10, wallHex, 0.9).setDepth(5));

      const bed = this.add.rectangle(5 * TILE_SIZE + 16, 5 * TILE_SIZE + 16, 38, 46, 0xc45b42).setStrokeStyle(2, 0xf2eee4).setDepth(6);
      const pillow = this.add.rectangle(5 * TILE_SIZE + 16, 5 * TILE_SIZE + 4, 24, 10, 0xf5efe6).setDepth(7);
      this.propSprites.push(bed, pillow);
      this.placeInteriorProp(16, 5, 'prop_kitchen_stove', false, 7);
      this.placeInteriorProp(11, 7, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(4, 10, 'prop_sofa', true, 7);
      this.placeInteriorProp(17, 10, 'prop_dining_table', true, 7);
      this.placeInteriorProp(18, 4, 'prop_bathtub', true, 7);
      this.placeInteriorProp(8, 3, 'prop_bookshelf', true, 7);
      this.placeInteriorProp(14, 3, 'prop_bookshelf', true, 7);

      if (this.save.house.placedDecor.includes('decor_plush_rug')) {
        this.propSprites.push(this.add.rectangle(11 * TILE_SIZE + 16, 9 * TILE_SIZE + 16, 110, 62, 0xb84b3e, 0.9).setStrokeStyle(3, 0xe4b363).setDepth(2));
      }
      if (this.save.house.placedDecor.includes('decor_ship_model')) {
        this.propSprites.push(this.add.image(11 * TILE_SIZE + 16, 7 * TILE_SIZE + 4, 'prop_boat').setScale(0.55).setDepth(8));
      }
      if (this.save.house.placedDecor.includes('decor_sun_bonsai')) {
        this.propSprites.push(this.add.image(16 * TILE_SIZE + 16, 9 * TILE_SIZE + 16, 'prop_flowerbed').setDepth(8));
      }
      if (this.save.house.placedDecor.includes('decor_holiday_tree') || this.save.house.tier >= 2) {
        this.propSprites.push(this.add.image(3 * TILE_SIZE + 16, 10 * TILE_SIZE + 16, 'prop_christmas_tree').setScale(0.75).setDepth(8));
      }
      if (this.save.house.placedDecor.includes('decor_crystal_lamp') || this.save.house.tier >= 3) {
        this.propSprites.push(this.add.image(11 * TILE_SIZE + 16, 3 * TILE_SIZE + 16, 'prop_shrine').setScale(0.65).setDepth(8));
      }
    } else if (interiorId === 'int_supermarket') {
      [7, 8, 9, 10, 11].forEach((x) => this.placeInteriorProp(x, 4, 'prop_counter_shop', x !== 9, 7));
      [4, 5, 13, 14].forEach((x) => {
        this.placeInteriorProp(x, 6, 'prop_shelf_produce', true, 7);
        this.placeInteriorProp(x, 8, 'prop_shelf_goods', true, 7);
      });
      this.placeInteriorProp(3, 3, 'prop_flowerbed', false, 6);
      this.placeInteriorProp(14, 3, 'prop_flowerbed', false, 6);
    } else if (interiorId === 'int_restaurant') {
      [7, 8, 9, 10, 11].forEach((x) => this.placeInteriorProp(x, 4, 'prop_counter_shop', x !== 9, 7));
      this.placeInteriorProp(13, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(14, 3, 'prop_kitchen_stove', true, 7);
      [4, 6, 12, 14].forEach((x) => {
        this.placeInteriorProp(x, 7, 'prop_dining_table', true, 7);
        this.placeInteriorProp(x, 9, 'prop_dining_table', true, 7);
      });
    } else if (interiorId === 'int_cafe') {
      [7, 8, 9, 10, 11].forEach((x) => this.placeInteriorProp(x, 4, 'prop_counter_shop', x !== 9, 7));
      this.placeInteriorProp(5, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(4, 7, 'prop_dining_table', true, 7);
      this.placeInteriorProp(6, 7, 'prop_sofa', true, 7);
      this.placeInteriorProp(12, 7, 'prop_dining_table', true, 7);
      this.placeInteriorProp(14, 8, 'prop_dining_table', true, 7);
      this.placeInteriorProp(13, 3, 'prop_flowerbed', false, 6);
    } else if (interiorId === 'int_mall') {
      this.placeInteriorProp(10, 4, 'prop_counter_shop', true, 7);
      this.placeInteriorProp(11, 5, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(12, 4, 'prop_counter_shop', true, 7);
      [4, 5, 6].forEach((x) => this.placeInteriorProp(x, 7, x === 6 ? 'prop_counter_shop' : 'prop_shelf_produce', x !== 6, 7));
      [15, 16, 17].forEach((x) => this.placeInteriorProp(x, 7, x === 16 ? 'prop_mannequin' : 'prop_anvil_rack', x !== 16, 7));
      this.placeInteriorProp(5, 10, 'prop_mannequin', true, 7);
      this.placeInteriorProp(16, 10, 'prop_sofa', true, 7);
      this.placeInteriorProp(11, 8, 'prop_statue', true, 7);
    } else if (interiorId === 'int_smithy') {
      this.placeInteriorProp(9, 4, 'prop_anvil_rack', false, 7);
      this.placeInteriorProp(7, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(11, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(4, 6, 'prop_mannequin', true, 7);
      this.placeInteriorProp(14, 6, 'prop_mannequin', true, 7);
      this.placeInteriorProp(4, 9, 'prop_anvil_rack', true, 7);
      this.placeInteriorProp(14, 9, 'prop_tackle_rack', true, 7);
    } else if (interiorId === 'int_hospital') {
      [4, 5, 12, 13].forEach((x) => {
        this.placeInteriorProp(x, 5, 'prop_hospital_bed', x !== 5, 7);
        this.placeInteriorProp(x, 8, 'prop_hospital_bed', true, 7);
      });
      this.placeInteriorProp(9, 4, 'prop_counter_shop', true, 7);
      this.placeInteriorProp(7, 3, 'prop_shelf_goods', true, 7);
    } else if (interiorId === 'int_library') {
      [3, 5, 7, 13, 15, 17].forEach((x) => {
        this.placeInteriorProp(x, 3, 'prop_bookshelf', true, 7);
        this.placeInteriorProp(x, 6, 'prop_bookshelf', true, 7);
      });
      this.placeInteriorProp(10, 5, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(5, 9, 'prop_dining_table', true, 7);
      this.placeInteriorProp(15, 9, 'prop_sofa', true, 7);
    } else if (interiorId === 'int_arcade') {
      this.placeInteriorProp(9, 3, 'prop_cinema_screen', true, 7);
      this.placeInteriorProp(5, 7, 'prop_arcade_cabinet', false, 7);
      this.placeInteriorProp(9, 7, 'prop_arcade_cabinet', false, 7);
      this.placeInteriorProp(13, 7, 'prop_arcade_cabinet', false, 7);
      this.placeInteriorProp(4, 9, 'prop_sofa', true, 7);
      this.placeInteriorProp(14, 9, 'prop_sofa', true, 7);
    } else if (interiorId === 'int_tackle_shop') {
      [7, 8, 9, 10].forEach((x) => this.placeInteriorProp(x, 4, 'prop_counter_shop', x !== 9, 7));
      [4, 5, 13, 14].forEach((x) => this.placeInteriorProp(x, 7, 'prop_tackle_rack', true, 7));
      this.placeInteriorProp(13, 3, 'prop_boat', false, 7);
    } else if (interiorId === 'int_restoration_hall') {
      this.placeInteriorProp(9, 5, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(5, 4, 'prop_bookshelf', true, 7);
      this.placeInteriorProp(13, 4, 'prop_bookshelf', true, 7);
      this.placeInteriorProp(5, 8, 'prop_sofa', true, 7);
      this.placeInteriorProp(13, 8, 'prop_dining_table', true, 7);
    } else if (interiorId === 'int_atelier') {
      this.placeInteriorProp(8, 4, 'prop_counter_shop', true, 7);
      [4, 5, 11, 12].forEach((x) => this.placeInteriorProp(x, 6, 'prop_mannequin', true, 7));
      this.placeInteriorProp(4, 8, 'prop_sofa', true, 7);
      this.placeInteriorProp(12, 8, 'prop_shelf_goods', true, 7);
    } else if (interiorId === 'int_training_hall') {
      [5, 8, 10, 12, 15].forEach((x) => this.placeInteriorProp(x, 3, 'prop_target_dummy', x !== 10, 7));
      this.placeInteriorProp(4, 8, 'prop_mannequin', true, 7);
      this.placeInteriorProp(16, 8, 'prop_anvil_rack', true, 7);
    } else if (interiorId === 'int_station') {
      this.placeInteriorProp(10, 4, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(6, 4, 'prop_counter_shop', true, 7);
      this.placeInteriorProp(14, 4, 'prop_counter_shop', true, 7);
      [4, 6, 14, 16].forEach((x) => this.placeInteriorProp(x, 8, 'prop_sofa', true, 7));
    } else if (interiorId === 'int_civic_station') {
      this.placeInteriorProp(9, 4, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(5, 4, 'prop_mannequin', true, 7);
      this.placeInteriorProp(13, 4, 'prop_bookshelf', true, 7);
      this.placeInteriorProp(5, 8, 'prop_dining_table', true, 7);
      this.placeInteriorProp(13, 8, 'prop_sofa', true, 7);
    } else if (interiorId === 'int_woods_lodge' || interiorId === 'int_frost_lodge' || interiorId === 'int_frozen_hall' || interiorId === 'int_jungle_outpost') {
      const midX = Math.floor((intDef?.width ?? 16) / 2);
      this.placeInteriorProp(midX, 4, 'prop_campfire', false, 7);
      this.placeInteriorProp(4, 5, 'prop_hospital_bed', true, 7);
      this.placeInteriorProp(midX + 4, 6, 'prop_dining_table', true, 7);
      this.placeInteriorProp(4, 8, 'prop_bookshelf', true, 7);
    } else if (interiorId === 'int_volcanic_hall') {
      this.placeInteriorProp(9, 4, 'prop_anvil_rack', false, 7);
      this.placeInteriorProp(6, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(12, 3, 'prop_kitchen_stove', true, 7);
      this.placeInteriorProp(5, 8, 'prop_mannequin', true, 7);
      this.placeInteriorProp(13, 8, 'prop_rock_cluster', true, 7);
    } else if (interiorId === 'int_sky_pavilion') {
      this.placeInteriorProp(9, 4, 'prop_shrine', false, 7);
      this.placeInteriorProp(5, 6, 'prop_sofa', true, 7);
      this.placeInteriorProp(13, 6, 'prop_blueprint_table', true, 7);
    } else if (interiorId === 'int_haunted_manor') {
      [4, 6, 12, 14].forEach((x) => this.placeInteriorProp(x, 3, 'prop_bookshelf', true, 7));
      this.placeInteriorProp(9, 5, 'prop_blueprint_table', false, 7);
      this.placeInteriorProp(5, 8, 'prop_sofa', true, 7);
      this.placeInteriorProp(13, 8, 'prop_dining_table', true, 7);
    } else if (interiorId === 'int_lost_archive') {
      [4, 6, 14, 16].forEach((x) => {
        this.placeInteriorProp(x, 3, 'prop_bookshelf', true, 7);
        this.placeInteriorProp(x, 7, 'prop_statue', true, 7);
      });
      this.placeInteriorProp(10, 5, 'prop_blueprint_table', false, 7);
    } else if (interiorId === 'dim_mirror') {
      this.propSprites.push(this.add.image(6 * TILE_SIZE + 16, 10 * TILE_SIZE + 16, 'prop_portal_verdant').setDepth(8));
      this.propSprites.push(this.add.image(26 * TILE_SIZE + 16, 10 * TILE_SIZE + 16, 'prop_portal_void').setDepth(8));
    } else if (interiorId === 'int_underground_city') {
      this.propSprites.push(this.add.image(28 * TILE_SIZE + 16, 7 * TILE_SIZE + 16, 'prop_elevator_sub').setDepth(8));
      this.propSprites.push(this.add.image(17 * TILE_SIZE + 16, 6 * TILE_SIZE + 16, 'prop_shrine').setDepth(8));
    } else if (interiorId === 'dim_void') {
      this.propSprites.push(this.add.image(17 * TILE_SIZE + 16, 9 * TILE_SIZE + 16, 'prop_pillar_on').setDepth(9));
    }
  }

  private addBoxToGroup(group: Phaser.Physics.Arcade.StaticGroup, cx: number, cy: number, w: number, h: number) {
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
    this.chests.push({ id: c.id, sprite, x: cx, y: cy, sparks: c.sparks, items: c.items, requiresMystic: c.requiresMystic });
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
    this.isFlying = false;
    this.solidCollider.active = true;
    this.waterCollider.active = true;
    this.boatLandCollider.active = false;
    this.airshipSprite.setVisible(this.save.airship.unlocked || this.save.completedRestorations.includes('rest_brightfall_railway'));
    this.guardianState = null;
    this.cameras.main.fadeOut(180, 14, 21, 27);
    this.time.delayedCall(190, () => {
      this.buildCurrentZone(tileX * TILE_SIZE + 16, tileY * TILE_SIZE + 16);
      this.burstParticles(this.player.x, this.player.y, 0x6ae0d6, 20);
      gameBridge.getCallbacks()?.onPlayerMoved(this.player.x, this.player.y, null);
      this.cameras.main.fadeIn(220, 14, 21, 27);
    });
  }

  private findNearestTileMatching(startPxX: number, startPxY: number, radiusTiles: number, predicate: (t: number) => boolean) {
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
          if (!best || d < best.dist) best = { x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 16, dist: d };
        }
      }
    }
    return best ? { x: best.x, y: best.y } : null;
  }

  private tryBoardBoat(summonToDock = false) {
    if (this.currentInteriorId || this.isSailing || this.isFlying) return;
    let targetBoatPos = { x: this.boatSprite.x, y: this.boatSprite.y };

    if (summonToDock && Phaser.Math.Distance.Between(this.player.x, this.player.y, targetBoatPos.x, targetBoatPos.y) > 96) {
      const waterSpot = this.findNearestTileMatching(this.player.x, this.player.y, 4, (t) => t === 7 || t === 8);
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
    soundEngine.playSplash();
    this.burstParticles(targetBoatPos.x, targetBoatPos.y, 0x6ae0d6, 16);
    gameBridge.getCallbacks()?.onBoatMoved(targetBoatPos.x, targetBoatPos.y);
    gameBridge.getCallbacks()?.onShowToast('Sailing Aetheria Sea! Approach any shore & press [E] to dock.');
  }

  private tryDisembarkBoat(): boolean {
    if (!this.isSailing) return false;
    const shore = this.findNearestTileMatching(this.player.x, this.player.y, 3, (t) => t !== 7 && t !== 8 && !SOLID_TILES.has(t));
    if (!shore) {
      gameBridge.getCallbacks()?.onShowToast('Steer closer to a sandy beach or wooden pier to disembark!');
      return false;
    }
    const anchorWater = this.findNearestTileMatching(this.player.x, this.player.y, 1, (t) => t === 7 || t === 8) ?? { x: this.player.x, y: this.player.y };
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

  private tryBoardAirship() {
    if (this.currentInteriorId) {
      gameBridge.getCallbacks()?.onShowToast('Step outdoors to launch your Flying Airship!');
      return;
    }
    const unlocked = this.save.airship.unlocked || this.save.completedRestorations.includes('rest_brightfall_railway');
    if (!unlocked) {
      gameBridge.getCallbacks()?.onShowToast('Repair Brightfall Central Railway & Skyport first to unlock the Airship!');
      return;
    }
    if (this.isFlying) {
      this.tryLandAirship();
      return;
    }
    this.isSailing = false;
    this.isFlying = true;
    this.solidCollider.active = false;
    this.waterCollider.active = false;
    this.boatLandCollider.active = false;
    this.airshipSprite.setVisible(true);
    this.airshipSprite.setScale(1.08 + this.save.airship.altitudeLevel * 0.08);
    this.player.setDepth(36);
    soundEngine.playAbility();
    this.burstParticles(this.player.x, this.player.y, 0xf5cc6b, 20);
    gameBridge.getCallbacks()?.onShowToast('Airship Airborne! Fly freely over oceans & peaks. Press [V] to land.');
  }

  private tryLandAirship() {
    if (!this.isFlying) return;
    const safeLand = this.findNearestTileMatching(this.player.x, this.player.y, 3, (t) => !SOLID_TILES.has(t) && t !== 7 && t !== 8);
    if (!safeLand) {
      gameBridge.getCallbacks()?.onShowToast('Fly over dry ground or an island before landing!');
      return;
    }
    this.isFlying = false;
    this.solidCollider.active = true;
    this.waterCollider.active = true;
    this.player.setDepth(20);
    this.player.setPosition(safeLand.x, safeLand.y);
    this.airshipSprite.setScale(1);
    this.airshipSprite.setPosition(safeLand.x, safeLand.y - 8);
    soundEngine.playDoor();
    gameBridge.getCallbacks()?.onAirshipMoved(safeLand.x, safeLand.y - 8);
    gameBridge.getCallbacks()?.onPlayerMoved(safeLand.x, safeLand.y, null);
    gameBridge.getCallbacks()?.onShowToast('Airship landed smoothly!');
  }

  public takePhoto() {
    if (this.isPaused) return;
    soundEngine.playShutter();
    this.lightningOverlay.setFillStyle(0xffffff, 0.72);
    this.tweens.add({ targets: this.lightningOverlay, alpha: 0, duration: 240 });

    const px = this.player.x;
    const py = this.player.y;
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    const region = this.currentInteriorId ? INTERIORS[this.currentInteriorId].region : getRegionAtTile(tx, ty, this.save.movingIslandSlot);

    // 1. Check Giant Roaming Creature
    for (const g of this.giantCreatures) {
      if (Phaser.Math.Distance.Between(px, py, g.sprite.x, g.sprite.y) < 280) {
        gameBridge.getCallbacks()?.onPhotoCaptured(g.id, g.title, g.region);
        return;
      }
    }
    // 2. Check Active Guardian
    if (this.guardianState) {
      const gd = GUARDIANS[this.guardianState.id];
      gameBridge.getCallbacks()?.onPhotoCaptured(`boss_${gd.id}`, gd.name, gd.region);
      return;
    }
    // 3. Check Landmark
    for (const lm of LANDMARKS) {
      if (!this.currentInteriorId && Phaser.Math.Distance.Between(tx, ty, lm.tileX, lm.tileY) < 12) {
        gameBridge.getCallbacks()?.onPhotoCaptured(lm.id, lm.name, lm.region);
        return;
      }
    }
    gameBridge.getCallbacks()?.onPhotoCaptured(`scenic_${region}`, `${REGIONS[region].name} Vista`, region);
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
    const lockReason = getGuardianLockReason(this.save, guardianId);
    if (lockReason) {
      gameBridge.getCallbacks()?.onShowToast(lockReason);
      return;
    }

    const gDef = GUARDIANS[guardianId];
    const mi = getMovingIslandSlotCoords(this.save.movingIslandSlot);
    const arenaX = guardianId === 'drift_leviathan' ? mi.x : gDef.arenaX;
    const arenaY = guardianId === 'drift_leviathan' ? mi.y - 3 : gDef.arenaY;
    const gx = arenaX * TILE_SIZE + 16;
    const gy = arenaY * TILE_SIZE + 16;

    const diffMult =
      this.save.settings.difficulty === 'explorer' ? 0.75 : this.save.settings.difficulty === 'heroic' ? 1.35 : 1;
    const maxPurity = Math.round(gDef.maxPurity * diffMult);

    const sprite = this.physics.add.sprite(gx, gy, `guardian_${guardianId}`);
    sprite.setDepth(21);
    sprite.setImmovable(true);
    sprite.setScale(1.18);

    const fourPillarIds: GuardianId[] = ['frostbound_watcher', 'last_remnant', 'frost_empress', 'eclipse_sovereign', 'rift_archon'];
    const offsets = fourPillarIds.includes(guardianId)
      ? [[-110, -70], [110, -70], [-110, 70], [110, 70]]
      : [[-105, -50], [105, -50], [0, 95]];

    const pillars = offsets.map(([ox, oy]) => {
      const ps = this.physics.add.sprite(gx + ox, gy + oy, 'prop_pillar_off');
      ps.setDepth(16);
      ps.setImmovable(true);
      return { sprite: ps, lit: false, x: gx + ox, y: gy + oy };
    });

    this.guardianState = {
      id: guardianId,
      sprite,
      purity: maxPurity,
      maxPurity,
      phase: 1,
      pillars,
      attackTimer: 1.6,
      telegraphTimer: 0,
    };

    soundEngine.playRestoreFanfare();
    gameBridge.getCallbacks()?.onShowToast(`Guardian Encounter: ${gDef.name}, ${gDef.title}! Strike the Pillars with Bolts [F]!`);
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
    this.updateCompanion(dt);
    this.updateNpcs(dt);
    this.updateCrowdWalkers(dt);
    this.updateGiantCreatures(dt);
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
      this.shieldGraphic?.setVisible(true).setPosition(this.player.x, this.player.y);
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
      if (this.activeFoodBuff.remaining <= 0) this.activeFoodBuff = null;
    }

    // Fireworks city event ambient bursts
    if (!this.currentInteriorId && (this.save.cityEvent === 'fireworks' || this.save.cityEvent === 'christmas')) {
      this.fireworkTimer -= dt;
      if (this.fireworkTimer <= 0) {
        this.fireworkTimer = this.save.cityEvent === 'fireworks' ? 2.4 : 4.5;
        const fx = (OX + 52 + Math.random() * 14) * TILE_SIZE;
        const fy = (OY + 50 + Math.random() * 10) * TILE_SIZE;
        const cols = [0xffd466, 0xff82a9, 0x7be3f5, 0x66d18a];
        this.burstParticles(fx, fy, cols[Math.floor(Math.random() * cols.length)], 16);
      }
    }

    this.hungerDecayTimer += dt;
    if (this.hungerDecayTimer >= 16) {
      this.hungerDecayTimer = 0;
      if (this.hunger > 0) {
        this.hunger = Math.max(0, this.hunger - 1);
        gameBridge.getCallbacks()?.onHungerChanged(this.hunger);
        if (this.hunger === 15) {
          gameBridge.getCallbacks()?.onShowToast('Getting hungry! Eat a meal from Fresh Mart, Bistro, or your satchel.');
        }
      }
    }

    const compDef = this.save.activeCompanion ? COMPANIONS[this.save.activeCompanion] : undefined;
    if (compDef && compDef.passiveHpRegen > 0 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + compDef.passiveHpRegen * dt);
    }

    const foodRegen = this.activeFoodBuff?.stat === 'regen' ? 1.55 : 1;
    const regenMult =
      (this.save.activeCharacter === 'chronomancer' || this.save.activeCharacter === 'riftwalker' ? 1.3 : 1.05) *
      (1 + this.save.upgrades.recovery * 0.2) *
      foodRegen;
    const compEn = compDef?.passiveEnRegen ?? 0;
    this.energy = Math.min(this.maxEnergy, this.energy + (9 * regenMult + compEn) * dt);
  }

  private updateDayNightAndWeather(dt: number) {
    this.timeOfDay = (this.timeOfDay + dt / 30) % 24;
    this.timeSyncTimer += dt;
    if (this.timeSyncTimer >= 6) {
      this.timeSyncTimer = 0;
      gameBridge.getCallbacks()?.onTimeChanged(this.timeOfDay);
    }

    if (dt > 0) {
      this.weatherChangeTimer -= dt;
      if (this.weatherChangeTimer <= 0) {
        this.weatherChangeTimer = 55 + Math.random() * 35;
        const tx = Math.floor(this.player.x / TILE_SIZE);
        const ty = Math.floor(this.player.y / TILE_SIZE);
        const region = this.currentInteriorId
          ? INTERIORS[this.currentInteriorId].region
          : getRegionAtTile(tx, ty, this.save.movingIslandSlot);
        const nextW = this.pickBiomeWeather(region);
        if (nextW !== this.weather) {
          this.weather = nextW;
          this.applyWeatherEmitter();
          gameBridge.getCallbacks()?.onWeatherChanged(nextW);
        }
      }
    }

    if (this.weather === 'thunderstorm' && !this.currentInteriorId) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 7 + Math.random() * 10;
        soundEngine.playThunder();
        this.lightningOverlay.setFillStyle(0xe8f4ff, 0.52);
        this.tweens.add({ targets: this.lightningOverlay, alpha: 0, duration: 320 });
      }
    }

    const phase = getTimePhaseFromHour(this.timeOfDay);
    let tintColor = 0x0c1633;
    let tintAlpha = 0;
    if (this.currentInteriorId) {
      tintAlpha = this.currentInteriorId === 'int_underground_city' ? 0.14 : 0.04;
    } else {
      if (phase === 'sunrise') {
        tintColor = 0xffa66b;
        tintAlpha = 0.11;
      } else if (phase === 'sunset') {
        tintColor = 0xe87343;
        tintAlpha = 0.17;
      } else if (phase === 'night') {
        tintColor = 0x0a132e;
        tintAlpha = 0.34;
      }
      if (this.weather === 'overcast' || this.weather === 'heavy_rain' || this.weather === 'thunderstorm') {
        tintColor = 0x162433;
        tintAlpha = Math.max(tintAlpha, 0.22);
      } else if (this.weather === 'fog') {
        tintColor = 0xb8ccd6;
        tintAlpha = Math.max(tintAlpha, 0.22);
      }
    }
    this.lightingOverlay.setFillStyle(tintColor, tintAlpha);

    const glowAlpha = !this.currentInteriorId && (phase === 'night' || phase === 'sunset')
      ? (phase === 'night' ? 0.16 : 0.08)
      : 0;
    for (const g of this.nightGlows) {
      if (glowAlpha > 0) {
        g.setVisible(true).setAlpha(glowAlpha);
      } else {
        g.setVisible(false);
      }
    }

    // Subtle water shimmer sparkles near shore tiles in viewport
    if (!this.currentInteriorId && dt > 0) {
      this.shimmerTimer -= dt;
      if (this.shimmerTimer <= 0) {
        this.shimmerTimer = 0.45;
        const rx = this.player.x + (Math.random() - 0.5) * 420;
        const ry = this.player.y + (Math.random() - 0.5) * 300;
        const wtx = Math.floor(rx / TILE_SIZE);
        const wty = Math.floor(ry / TILE_SIZE);
        const wt = this.currentGrid[wty]?.[wtx];
        if (wt === 7 || wt === 8 || wt === 43) {
          this.burstParticles(rx, ry, wt === 43 ? 0xffa652 : 0xb8f3ff, 2);
        }
      }
    }
  }

  private pickBiomeWeather(region: RegionId): WeatherType {
    if (region === 'frozen_kingdom' || region === 'frostpeak') {
      const pool: WeatherType[] = ['snow', 'snowstorm', 'cloudy', 'sunny', 'windy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'brightfall' && this.save.cityEvent === 'christmas') {
      return Math.random() < 0.7 ? 'snow' : 'sunny';
    }
    if (region === 'haunted_island') {
      const pool: WeatherType[] = ['fog', 'overcast', 'cloudy', 'light_rain'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (region === 'wild_jungle') {
      const pool: WeatherType[] = ['sunny', 'light_rain', 'heavy_rain', 'thunderstorm', 'cloudy'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const pool: WeatherType[] = ['sunny', 'sunny', 'cloudy', 'overcast', 'light_rain', 'windy', 'fog'];
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
      this.firePlayerBolt(Phaser.Math.Angle.Between(dx, dy, target.x, target.y), dx, dy);
    }
  }

  private handlePlayerInput(dt: number) {
    const kb = this.save.settings.keyBindings;
    const isDown = (code: string, alt?: string) => this.heldKeys.has(code) || (alt ? this.heldKeys.has(alt) : false);
    const justPressed = (code: string, alt?: string) => this.justPressedKeys.has(code) || (alt ? this.justPressedKeys.has(alt) : false);

    // Quick Photography [P] & Airship Toggle [V]
    if (justPressed('KeyP')) {
      this.takePhoto();
    }
    if (justPressed('KeyV')) {
      if (this.isFlying) this.tryLandAirship();
      else this.tryBoardAirship();
    }

    let vx = 0;
    let vy = 0;
    if (isDown(kb.left, 'ArrowLeft')) vx -= 1;
    if (isDown(kb.right, 'ArrowRight')) vx += 1;
    if (isDown(kb.up, 'ArrowUp')) vy -= 1;
    if (isDown(kb.down, 'ArrowDown')) vy += 1;

    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);
    const curTile = this.currentGrid[tileY]?.[tileX] ?? 0;

    if (!this.currentInteriorId && !this.isSailing && !this.isFlying) {
      if (curTile === 22 && this.save.activeCharacter !== 'explorer') {
        vx *= 0.25;
        vy *= 0.25;
      }
      if (curTile === 23 && this.save.activeCharacter !== 'mystic') {
        vx *= 0.4;
        vy *= 0.4;
      }
      this.isSwimming = curTile === 7 || curTile === 43 || curTile === 48;
    } else {
      this.isSwimming = false;
    }

    const cDef = CHARACTERS[this.save.activeCharacter];
    const compDef = this.save.activeCompanion ? COMPANIONS[this.save.activeCompanion] : undefined;
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const eqArmor = this.save.equippedArmor ? EQUIPMENT_CATALOG[this.save.equippedArmor] : undefined;
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const equipSpeedBonus = (eqWeapon?.speedBonus ?? 0) + (eqArmor?.speedBonus ?? 0) + (eqAcc?.speedBonus ?? 0);

    let speed = cDef.baseSpeed * (1 + this.save.upgrades.speed * 0.08 + (compDef?.speedBonusPct ?? 0) / 100) + equipSpeedBonus;
    if (this.isFlying) {
      speed = 320 + (this.save.airship.speedLevel - 1) * 58;
    } else if (this.isSailing) {
      const boatSpdLvl = Math.max(this.save.boatLevel, this.save.boatUpgrades.speedLevel);
      speed = 250 + (boatSpdLvl - 1) * 50 + (this.save.activeCharacter === 'skywarden' ? 25 : 0);
      if (this.weather === 'windy') speed *= 1.12;
    } else {
      if ((this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')) && this.hunger > 10) speed *= 1.28;
      if (this.hunger <= 15) speed *= 0.85;
      if (this.galeTimer > 0) speed *= 1.45;
      if (this.activeFoodBuff?.stat === 'speed') speed *= 1.2;
      if (this.isSwimming && this.save.activeCharacter !== 'tidecaller') speed *= 0.72;
      if (this.dashTimer > 0) speed *= 2.35;
    }

    if (justPressed(kb.dash) && !this.isSailing && !this.isFlying && this.dashCooldown <= 0 && this.energy >= 12) {
      this.energy -= 12;
      this.dashTimer = 0.22;
      this.dashCooldown = 0.75;
      this.invulnTimer = Math.max(this.invulnTimer, this.save.activeCharacter === 'chronomancer' ? 0.42 : 0.26);
      soundEngine.playDash();
      this.burstParticles(this.player.x, this.player.y, 0xede3cf, 8);
    }

    if (justPressed(kb.attack) && this.attackCooldown <= 0 && !this.isFlying) {
      const ang =
        this.playerDir === 'right' ? 0 : this.playerDir === 'down' ? Math.PI / 2 : this.playerDir === 'left' ? Math.PI : -Math.PI / 2;
      this.firePlayerBolt(ang);
    }

    if (justPressed(kb.ability) && !this.isSailing && !this.isFlying) {
      this.triggerCharacterAbility();
    }

    if (justPressed(kb.interact)) {
      this.tryInteract();
    }

    const len = Math.hypot(vx, vy);
    const texKey = `char_${this.save.activeCharacter}_${this.save.characterOutfits[this.save.activeCharacter]}`;
    if (len > 0) {
      const nx = (vx / len) * speed;
      const ny = (vy / len) * speed;
      this.player.setVelocity(nx, ny);
      this.facingAngle = Math.atan2(ny, nx);
      this.playerDir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down';

      if (this.isSailing || this.isFlying) {
        this.player.anims.stop();
        const row = this.playerDir === 'down' ? 0 : this.playerDir === 'left' ? 1 : this.playerDir === 'right' ? 2 : 3;
        this.player.setFrame(row * 3);
      } else {
        this.player.anims.play(`${texKey}_walk_${this.playerDir}`, true);
        const surface =
          curTile === 6 ? 'sand' : curTile === 10 || curTile === 11 ? 'snow' : curTile === 9 || curTile === 16 ? 'wood' : curTile === 2 || curTile === 12 || curTile === 21 || curTile === 37 ? 'stone' : 'grass';
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
    if (this.isFlying) {
      const hover = Math.sin(this.time.now * 0.005) * 3;
      this.airshipSprite.setPosition(this.player.x, this.player.y - 6 + hover);
      this.airshipSprite.setFlipX(this.playerDir === 'left');
    }

    this.posSaveTimer += dt;
    if (this.posSaveTimer > 2.5) {
      this.posSaveTimer = 0;
      gameBridge.getCallbacks()?.onPlayerMoved(this.player.x, this.player.y, this.currentInteriorId);
      if (this.isSailing) gameBridge.getCallbacks()?.onBoatMoved(this.boatSprite.x, this.boatSprite.y);
      if (this.isFlying) gameBridge.getCallbacks()?.onAirshipMoved(this.airshipSprite.x, this.airshipSprite.y);
    }
  }

  private firePlayerBolt(angle: number, startX = this.player.x, startY = this.player.y) {
    if (this.attackCooldown > 0) return;
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const wType = eqWeapon?.weaponType ?? 'sword';
    this.attackCooldown = wType === 'gadget' ? 0.2 : wType === 'hammer' ? 0.36 : 0.27;
    soundEngine.playBolt();
    const tintNum = eqWeapon ? Number.parseInt(eqWeapon.color.replace('#', ''), 16) : 0x6ae0d6;

    const spawnOne = (
      ang: number,
      spd = 395,
      scale = 1,
      opts?: { homing?: boolean; pierce?: number; stun?: number }
    ) => {
      const bolt = this.playerBolts.create(startX, startY, 'fx_bolt') as Phaser.Physics.Arcade.Sprite;
      bolt.setDepth(22);
      bolt.setTint(tintNum);
      bolt.setScale(scale);
      bolt.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
      bolt.setData('life', 1.15);
      if (opts?.homing) bolt.setData('homing', true);
      if (opts?.pierce) bolt.setData('pierce', opts.pierce);
      if (opts?.stun) bolt.setData('stun', opts.stun);
    };

    if (wType === 'bow') {
      spawnOne(angle - 0.09, 470, 0.95);
      spawnOne(angle + 0.09, 470, 0.95);
    } else if (wType === 'sword') {
      // Close-range glowing crescent slash + blade wave
      const sx = startX + Math.cos(angle) * 24;
      const sy = startY + Math.sin(angle) * 24;
      const arc = this.add.circle(sx, sy, 22, tintNum, 0.28).setStrokeStyle(2, 0xffffff, 0.85).setDepth(23);
      this.tweens.add({ targets: arc, scale: 1.5, alpha: 0, duration: 170, onComplete: () => arc.destroy() });
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (Phaser.Math.Distance.Between(sx, sy, e.sprite.x, e.sprite.y) < 42) {
          this.damageEnemy(e, 14 + this.save.upgrades.resonance * 2);
        }
      }
      if (this.save.equippedWeapon === 'eq_abyssal_trident') {
        spawnOne(angle - 0.14, 430, 1.15);
        spawnOne(angle + 0.14, 430, 1.15);
      } else {
        spawnOne(angle, 400, 1.2);
      }
    } else if (wType === 'hammer') {
      const sx = startX + Math.cos(angle) * 26;
      const sy = startY + Math.sin(angle) * 26;
      const ring = this.add.circle(sx, sy, 18, tintNum, 0.25).setStrokeStyle(3, 0xffd466, 0.9).setDepth(23);
      this.tweens.add({ targets: ring, radius: 52, alpha: 0, duration: 240, onComplete: () => ring.destroy() });
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (Phaser.Math.Distance.Between(sx, sy, e.sprite.x, e.sprite.y) < 54) {
          e.stunTimer = Math.max(e.stunTimer, 0.9);
          this.damageEnemy(e, 12);
        }
      }
      spawnOne(angle, 340, 1.38, { stun: 0.55 });
    } else if (wType === 'staff') {
      if (this.save.equippedWeapon === 'eq_starfall_scepter') {
        spawnOne(angle - 0.16, 410, 1.15, { homing: true });
        spawnOne(angle, 425, 1.2, { homing: true });
        spawnOne(angle + 0.16, 410, 1.15, { homing: true });
      } else {
        spawnOne(angle, 395, 1.18, { homing: true });
      }
    } else if (wType === 'gadget') {
      spawnOne(angle - 0.05, 450, 0.9);
      spawnOne(angle + 0.05, 450, 0.9);
    } else if (wType === 'tool') {
      if (this.save.equippedWeapon === 'eq_crystal_pick') {
        spawnOne(angle, 430, 1.18, { pierce: 2 });
      } else {
        spawnOne(angle, 465, 1.15, { stun: 1.35 });
      }
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
        const ring = this.add.circle(this.player.x, this.player.y, 12, 0x6ae0d6, 0.35).setDepth(21);
        this.tweens.add({ targets: ring, radius: 130, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
        this.enemies.forEach((e) => {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) < 135) this.damageEnemy(e, 24);
        });
        gameBridge.getCallbacks()?.onShowToast('Tidal Pulse restored +15 HP!');
        break;
      }
      case 'mountaineer': {
        this.invulnTimer = Math.max(this.invulnTimer, 1.8);
        if (this.save.settings.screenShake) this.cameras.main.shake(180, 0.008);
        const slam = this.add.circle(this.player.x, this.player.y, 14, 0xf09b4c, 0.35).setDepth(21);
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
      case 'subterranean': {
        this.shieldTimer = 3.0;
        const pulse = this.add.circle(this.player.x, this.player.y, 16, 0x87d4c8, 0.35).setDepth(21);
        this.tweens.add({ targets: pulse, radius: 145, alpha: 0, duration: 400, onComplete: () => pulse.destroy() });
        this.enemies.forEach((e) => {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) < 145) {
            e.stunTimer = 2.5;
            this.damageEnemy(e, 28);
          }
        });
        gameBridge.getCallbacks()?.onShowToast('Crystal Cavern Surge shattered surrounding threats!');
        break;
      }
      case 'riftwalker': {
        this.chronoTimer = 4.5;
        this.invulnTimer = Math.max(this.invulnTimer, 1.4);
        for (let i = 0; i < 6; i++) {
          this.attackCooldown = 0;
          this.firePlayerBolt((Math.PI * 2 * i) / 6);
        }
        this.burstParticles(this.player.x, this.player.y, 0xff96e3, 24);
        gameBridge.getCallbacks()?.onShowToast('Dimensional Rift Blink activated!');
        break;
      }
    }
  }

  private findNearestInteractive(): { prompt: string; trigger: () => void } | null {
    const px = this.player.x;
    const py = this.player.y;

    if (this.isFlying) {
      return {
        prompt: 'Press [V] or [E] to Land Airship on Island',
        trigger: () => this.tryLandAirship(),
      };
    }

    if (this.isSailing) {
      const canDock = this.findNearestTileMatching(px, py, 3, (t) => t !== 7 && t !== 8 && !SOLID_TILES.has(t));
      if (canDock) {
        return { prompt: 'Anchor & Disembark Boat onto Shore', trigger: () => this.tryDisembarkBoat() };
      }
      return null;
    }

    for (const d of this.doors) {
      if (Phaser.Math.Distance.Between(px, py, d.x, d.y) < 44) {
        return { prompt: d.label, trigger: () => this.transitionToZone(d.targetInteriorId) };
      }
    }

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

    for (const inter of this.interactables) {
      if (Phaser.Math.Distance.Between(px, py, inter.x, inter.y) < 48) {
        return { prompt: inter.prompt, trigger: () => this.activateInteractable(inter) };
      }
    }

    if (!this.currentInteriorId && Phaser.Math.Distance.Between(px, py, this.boatSprite.x, this.boatSprite.y) < 64) {
      return { prompt: 'Board Moored Boat', trigger: () => this.tryBoardBoat(false) };
    }

    return null;
  }

  private activateInteractable(inter: { id: string; kind: string; payload: Record<string, unknown> }) {
    const cb = gameBridge.getCallbacks();
    if (!cb) return;
    if (inter.kind === 'noticeboard') cb.onOpenNoticeboard();
    else if (inter.kind === 'events_board') cb.onOpenEvents();
    else if (inter.kind === 'village_board') cb.onOpenVillage();
    else if (inter.kind === 'skyport_deck') cb.onOpenAirship();
    else if (inter.kind === 'zone_portal') this.transitionToZone(inter.payload.targetZoneId as string);
    else if (inter.kind === 'shrine' || inter.kind === 'heal_camp') {
      this.healPlayer();
      if (inter.kind === 'shrine') cb.onOpenFastTravel();
      else cb.onShowToast('Restored Vitality, Energy & Hunger!');
    } else if (inter.kind === 'minigame') cb.onOpenMiniGame(inter.payload.miniGameId as MiniGameId);
    else if (inter.kind === 'guardian_altar') this.startGuardianEncounter(inter.payload.guardianId as GuardianId);
    else if (inter.kind === 'boat_dock') this.tryBoardBoat(true);
    else if (inter.kind === 'house_bed' || inter.kind === 'house_kitchen' || inter.kind === 'house_wardrobe' || inter.kind === 'house_customize') cb.onOpenHouse();
    else if (inter.kind === 'supermarket') cb.onOpenShop('supermarket');
    else if (inter.kind === 'restaurant') cb.onOpenShop('restaurant');
    else if (inter.kind === 'smithy') cb.onOpenEquipment();
    else if (inter.kind === 'secret_lore') {
      const sid = inter.payload.secretId as string;
      const msg = inter.payload.message as string;
      if (this.save.discoveredSecrets.includes(sid)) cb.onShowToast(msg);
      else cb.onDiscoverSecret(sid, msg, 35);
    } else if (inter.kind === 'gear_puzzle') {
      const pid = inter.payload.puzzleId as string;
      if (this.save.solvedPuzzles.includes(pid)) cb.onShowToast('Mechanism is humming smoothly!');
      else cb.onSolvePuzzle(pid, inter.payload.message as string, 45);
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

  private updateCompanion(dt: number) {
    if (!this.companionSprite || !this.save.activeCompanion) return;
    const compDef = COMPANIONS[this.save.activeCompanion];
    if (!compDef) return;

    const bob = Math.sin(this.time.now * 0.007) * 2.2;
    const followDist = this.isFlying ? 32 : this.isSailing ? 28 : 25;
    const targetX = this.player.x - Math.cos(this.facingAngle) * followDist;
    const targetY = this.player.y - Math.sin(this.facingAngle) * followDist + bob;

    const prevX = this.companionSprite.x;
    const nextX = Phaser.Math.Linear(prevX, targetX, Math.min(1, dt * 8.5));
    const nextY = Phaser.Math.Linear(this.companionSprite.y, targetY, Math.min(1, dt * 8.5));
    this.companionSprite.setPosition(nextX, nextY);
    this.companionSprite.setFlipX(this.player.x < nextX);
    this.companionSprite.setDepth(this.isFlying ? 37 : 19);

    // Glow halo (stronger for Luma Firefly at night or underground)
    if (this.companionGlow) {
      const phase = getTimePhaseFromHour(this.timeOfDay);
      const isDark = this.currentInteriorId === 'int_underground_city' || phase === 'night' || phase === 'sunset';
      if (compDef.id === 'comp_firefly' && isDark) {
        this.companionGlow.setVisible(true).setPosition(nextX, nextY).setAlpha(0.16);
      } else {
        this.companionGlow.setVisible(false);
      }
    }

    // Treasure / Secret Radar Pulse (Hootie Owl / Luma Firefly)
    if (compDef.hasRadar) {
      this.companionRadarTimer -= dt;
      if (this.companionRadarTimer <= 0) {
        this.companionRadarTimer = 3.2;
        let bestPos: { x: number; y: number } | null = null;
        let bestDist = 420;
        for (const ch of this.chests) {
          if (this.save.openedChests.includes(ch.id)) continue;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, ch.x, ch.y);
          if (d < bestDist) {
            bestDist = d;
            bestPos = { x: ch.x, y: ch.y };
          }
        }
        if (bestPos) {
          const ping = this.add.circle(bestPos.x, bestPos.y, 10, 0xf5cc6b, 0.18).setStrokeStyle(2, 0xf5cc6b, 0.85).setDepth(30);
          this.tweens.add({ targets: ping, radius: 34, alpha: 0, duration: 550, onComplete: () => ping.destroy() });
          this.burstParticles(nextX, nextY, 0xf5cc6b, 4);
        }
      }
    }

    // Combat Assist (Cobble Golem / Flicker Ember Sprite)
    if (compDef.hasCombatAssist && !this.isFlying) {
      this.companionAssistTimer -= dt;
      if (this.companionAssistTimer <= 0) {
        let nearest: RuntimeEnemy | null = null;
        let minDist = 210;
        for (const e of this.enemies) {
          const d = Phaser.Math.Distance.Between(nextX, nextY, e.sprite.x, e.sprite.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          this.companionAssistTimer = 2.6;
          if (compDef.id === 'comp_golem') {
            const shock = this.add.circle(nextX, nextY, 12, 0x87d4c8, 0.28).setStrokeStyle(2, 0xa6fff2, 0.85).setDepth(21);
            this.tweens.add({ targets: shock, radius: 85, alpha: 0, duration: 320, onComplete: () => shock.destroy() });
            this.enemies.forEach((foe) => {
              if (Phaser.Math.Distance.Between(nextX, nextY, foe.sprite.x, foe.sprite.y) < 92) {
                foe.stunTimer = Math.max(foe.stunTimer, 0.85);
                this.damageEnemy(foe, 10 + this.save.level);
              }
            });
          } else {
            const ang = Phaser.Math.Angle.Between(nextX, nextY, nearest.sprite.x, nearest.sprite.y);
            const bolt = this.playerBolts.create(nextX, nextY, 'fx_bolt') as Phaser.Physics.Arcade.Sprite;
            bolt.setDepth(22);
            bolt.setTint(0xff9642);
            bolt.setVelocity(Math.cos(ang) * 380, Math.sin(ang) * 380);
            bolt.setData('life', 0.95);
            this.burstParticles(nextX, nextY, 0xff9642, 4);
          }
        } else {
          this.companionAssistTimer = 0.6;
        }
      }
    }
  }

  private updateCrowdWalkers(dt: number) {
    if (this.currentInteriorId || this.crowdWalkers.length === 0) return;
    const camX = this.cameras.main.scrollX + this.cameras.main.width * 0.5;
    const camY = this.cameras.main.scrollY + this.cameras.main.height * 0.5;
    for (const c of this.crowdWalkers) {
      // Distance-based crowd simulation culling for smooth frame rates
      if (Math.abs(c.sprite.x - camX) > 780 || Math.abs(c.sprite.y - camY) > 620) continue;
      const dist = Phaser.Math.Distance.Between(c.sprite.x, c.sprite.y, c.targetX, c.targetY);
      if (dist < 6) {
        c.sprite.anims.stop();
        c.waitTimer -= dt;
        if (c.waitTimer <= 0) {
          c.waitTimer = 1.1 + Math.random() * 2.1;
          for (let tries = 0; tries < 8; tries++) {
            const ang = Math.random() * Math.PI * 2;
            const rad = 40 + Math.random() * 115;
            const tx = c.homeX + Math.cos(ang) * rad;
            const ty = c.homeY + Math.sin(ang) * rad;
            if (this.isPointWalkableForCrowd(tx, ty)) {
              c.targetX = tx;
              c.targetY = ty;
              break;
            }
          }
        }
      } else {
        const ang = Phaser.Math.Angle.Between(c.sprite.x, c.sprite.y, c.targetX, c.targetY);
        const dx = Math.cos(ang) * c.speed;
        const dy = Math.sin(ang) * c.speed;
        const nx = c.sprite.x + dx * dt;
        const ny = c.sprite.y + dy * dt;
        if (this.isPointWalkableForCrowd(nx, ny)) {
          c.sprite.x = nx;
          c.sprite.y = ny;
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
          c.sprite.anims.play(`${c.sheetKey}_walk_${dir}`, true);
        } else {
          // Blocked by building or shore edge — pause & choose another walkable spot
          c.targetX = c.sprite.x;
          c.targetY = c.sprite.y;
          c.waitTimer = 0.25;
        }
      }
    }
  }

  private updateGiantCreatures(dt: number) {
    if (this.currentInteriorId) return;
    for (const g of this.giantCreatures) {
      const wp = g.waypoints[g.wpIndex];
      const d = Phaser.Math.Distance.Between(g.sprite.x, g.sprite.y, wp.x, wp.y);
      if (d < 10) {
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
      } else {
        const ang = Phaser.Math.Angle.Between(g.sprite.x, g.sprite.y, wp.x, wp.y);
        g.sprite.x += Math.cos(ang) * g.speed * dt;
        g.sprite.y += Math.sin(ang) * g.speed * dt;
        g.sprite.setFlipX(Math.cos(ang) < 0);
      }
    }
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
      if (dist < 240 && !this.isSailing && !this.isFlying) {
        const ang = Phaser.Math.Angle.Between(e.sprite.x, e.sprite.y, this.player.x, this.player.y);
        e.sprite.setVelocity(Math.cos(ang) * e.speed, Math.sin(ang) * e.speed);
        e.attackTimer -= dt;
        if (e.attackTimer <= 0 && dist < 210) {
          e.attackTimer = 2.4;
          this.spawnHostileOrb(e.sprite.x, e.sprite.y, ang, 130);
        }
        if (dist < 22) this.hurtPlayer(10);
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
        const ring = this.add.circle(sx, sy, 46, 0xd96b43, 0.18).setStrokeStyle(2, 0xf5cc6b, 0.9).setDepth(5);
        g.pendingStrike = { x: sx, y: sy, radius: 48, ring };
        g.telegraphTimer = 1.05;
      }
    }
  }

  private spawnHostileOrb(x: number, y: number, angle: number, speed: number) {
    const orb = this.hostileOrbs.create(x, y, 'fx_bolt') as Phaser.Physics.Arcade.Sprite;
    orb.setTint(0xff7666).setDepth(21);
    const mult = this.chronoTimer > 0 ? 0.45 : 1;
    orb.setVelocity(Math.cos(angle) * speed * mult, Math.sin(angle) * speed * mult);
    orb.setData('life', 2.4);
  }

  private updateProjectiles(dt: number) {
    const compDef = this.save.activeCompanion ? COMPANIONS[this.save.activeCompanion] : undefined;
    const eqWeapon = EQUIPMENT_CATALOG[this.save.equippedWeapon];
    const eqArmor = this.save.equippedArmor ? EQUIPMENT_CATALOG[this.save.equippedArmor] : undefined;
    const eqLvl = this.save.equipmentLevels[this.save.equippedWeapon] ?? 1;
    const eqAcc = this.save.equippedAccessory ? EQUIPMENT_CATALOG[this.save.equippedAccessory] : undefined;
    const equipPower = (eqWeapon?.powerBonus ?? 0) + (eqLvl - 1) * 3 + (eqArmor?.powerBonus ?? 0) + (eqAcc?.powerBonus ?? 0);
    const pyroMult = this.save.activeCharacter === 'pyromancer' ? 1.15 : 1;
    const compMult = 1 + (compDef?.powerBonusPct ?? 0) / 100;
    const foodPowerMult = this.activeFoodBuff?.stat === 'power' ? 1.25 : 1;
    const solarMult = this.solarBuffTimer > 0 ? 1.2 : 1;

    const boltPower = Math.round((12 + this.save.upgrades.resonance * 4 + equipPower) * pyroMult * compMult * foodPowerMult * solarMult);

    this.playerBolts.getChildren().forEach((obj) => {
      const bolt = obj as Phaser.Physics.Arcade.Sprite;
      const life = (bolt.getData('life') as number) - dt;
      bolt.setData('life', life);
      if (life <= 0) {
        bolt.destroy();
        return;
      }

      if (bolt.getData('homing') && bolt.body) {
        let tgt: { x: number; y: number } | null = null;
        let minD = 180;
        for (const e of this.enemies) {
          const d = Phaser.Math.Distance.Between(bolt.x, bolt.y, e.sprite.x, e.sprite.y);
          if (d < minD) {
            minD = d;
            tgt = { x: e.sprite.x, y: e.sprite.y };
          }
        }
        if (tgt) {
          const ang = Phaser.Math.Angle.Between(bolt.x, bolt.y, tgt.x, tgt.y);
          const spd = Math.hypot(bolt.body.velocity.x, bolt.body.velocity.y) || 400;
          bolt.setVelocity(
            Phaser.Math.Linear(bolt.body.velocity.x, Math.cos(ang) * spd, Math.min(1, dt * 6)),
            Phaser.Math.Linear(bolt.body.velocity.y, Math.sin(ang) * spd, Math.min(1, dt * 6))
          );
        }
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (Phaser.Math.Distance.Between(bolt.x, bolt.y, e.sprite.x, e.sprite.y) < 22) {
          const stunVal = (bolt.getData('stun') as number | undefined) ?? 0;
          if (stunVal > 0) e.stunTimer = Math.max(e.stunTimer, stunVal);
          this.damageEnemy(e, boltPower);
          const pierce = (bolt.getData('pierce') as number | undefined) ?? 0;
          if (pierce > 1) {
            bolt.setData('pierce', pierce - 1);
          } else {
            bolt.destroy();
            return;
          }
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
            if (g.pillars.every((pl) => pl.lit)) this.channelGuardianPurify(g);
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
      gameBridge.getCallbacks()?.onDefeatEnemy(16, 24);
    }
  }

  private hurtPlayer(rawAmount: number) {
    if (this.invulnTimer > 0) return;
    if (this.shieldTimer > 0) {
      this.burstParticles(this.player.x, this.player.y, 0x87d4c8, 10);
      return;
    }
    const compDef = this.save.activeCompanion ? COMPANIONS[this.save.activeCompanion] : undefined;
    const eqArmor = this.save.equippedArmor ? EQUIPMENT_CATALOG[this.save.equippedArmor] : undefined;
    const defReduction = Math.min(0.7, ((eqArmor?.defenseBonus ?? 0) + (compDef?.defenseBonusPct ?? 0)) / 100);
    const diffMult =
      this.save.settings.difficulty === 'explorer' ? 0.65 : this.save.settings.difficulty === 'heroic' ? 1.45 : 1;
    const finalDmg = Math.max(2, Math.round(rawAmount * diffMult * (1 - defReduction)));

    this.health -= finalDmg;
    this.invulnTimer = 0.9;
    this.hitstopTimer = 0.04;
    if (this.save.settings.screenShake) this.cameras.main.shake(150, 0.007);
    gameBridge.getCallbacks()?.onPlayerDamaged(finalDmg);

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
    const magnetRange = this.save.activeCompanion === 'comp_fox' ? 56 : 28;
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, col.x, col.y) < magnetRange) {
        this.burstParticles(col.x, col.y, 0xf5cc6b, 12);
        col.sprite.destroy();
        this.collectibles.splice(i, 1);
        gameBridge.getCallbacks()?.onCollectItem(col.id, col.itemId, col.quantity);
      }
    }

    if (!this.currentInteriorId) {
      const tx = Math.floor(this.player.x / TILE_SIZE);
      const ty = Math.floor(this.player.y / TILE_SIZE);
      const region = getRegionAtTile(tx, ty, this.save.movingIslandSlot);
      if (region === 'moving_island' && !this.save.movingIslandFound) {
        gameBridge.getCallbacks()?.onMovingIslandFound();
      }
      LANDMARKS.forEach((lm) => {
        if (!this.save.discoveredLandmarks.includes(lm.id)) {
          if (Phaser.Math.Distance.Between(tx, ty, lm.tileX, lm.tileY) < 6) {
            gameBridge.getCallbacks()?.onDiscoverLandmark(lm.id);
          }
        }
      });
    } else if (this.currentInteriorId === 'int_underground_city' && !this.save.discoveredLandmarks.includes('lm_underground_gate')) {
      gameBridge.getCallbacks()?.onDiscoverLandmark('lm_underground_gate');
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
      : getRegionAtTile(tx, ty, this.save.movingIslandSlot);
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
      isFlying: this.isFlying,
      isSwimming: this.isSwimming,
      weather: this.weather,
      timeOfDay: this.timeOfDay,
      timePhase: getTimePhaseFromHour(this.timeOfDay),
      cityEvent: this.save.cityEvent,
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

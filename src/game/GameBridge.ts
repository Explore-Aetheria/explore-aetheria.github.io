import {
  FoodEffect,
  GuardianId,
  MiniGameId,
  PlayerHudSnapshot,
  SaveData,
  WeatherType,
} from '../types/game';

export interface SceneCallbacks {
  onHudUpdate: (hud: PlayerHudSnapshot) => void;
  onTalkNpc: (npcId: string) => void;
  onOpenNoticeboard: () => void;
  onOpenFastTravel: () => void;
  onOpenMiniGame: (miniGameId: MiniGameId) => void;
  onOpenShop: (shopId: string) => void;
  onOpenEquipment: () => void;
  onOpenHouse: () => void;
  onCollectItem: (collectibleId: string, itemId: string, quantity: number) => void;
  onOpenChest: (chestId: string, sparks: number, items: { id: string; quantity: number }[]) => void;
  onDiscoverLandmark: (landmarkId: string) => void;
  onDiscoverSecret: (secretId: string, message: string, sparks: number) => void;
  onSolvePuzzle: (puzzleId: string, message: string, sparks: number) => void;
  onPlayerDamaged: (amount: number) => void;
  onDefeatEnemy: (sparks: number, xp: number) => void;
  onGuardianPurified: (guardianId: GuardianId) => void;
  onPlayerMoved: (x: number, y: number, interiorId: string | null) => void;
  onBoatMoved: (x: number, y: number) => void;
  onTimeChanged: (hour: number) => void;
  onWeatherChanged: (weather: WeatherType) => void;
  onHungerChanged: (hunger: number) => void;
  onShowToast: (text: string) => void;
}

class GameBridge {
  private callbacks: SceneCallbacks | null = null;
  private sceneRef: {
    refreshWorldFromSave: (save: SaveData) => void;
    fastTravelTo: (tileX: number, tileY: number) => void;
    startGuardianEncounter: (guardianId: GuardianId) => void;
    healPlayer: () => void;
    setPaused: (paused: boolean) => void;
    enterInteriorById: (interiorId: string | null, tx?: number, ty?: number) => void;
    boardBoat: () => void;
    disembarkBoat: () => void;
    setTimeOfDay: (hour: number) => void;
    setWeather: (weather: WeatherType) => void;
    applyFoodEffect: (effect: FoodEffect) => void;
  } | null = null;

  private latestSave: SaveData | null = null;
  private desiredPaused = true;

  public registerCallbacks(cb: SceneCallbacks) {
    this.callbacks = cb;
  }

  public getCallbacks(): SceneCallbacks | null {
    return this.callbacks;
  }

  public registerScene(sceneApi: NonNullable<typeof this.sceneRef>) {
    this.sceneRef = sceneApi;
    this.sceneRef.setPaused(this.desiredPaused);
  }

  public setLatestSave(save: SaveData) {
    this.latestSave = save;
    this.sceneRef?.refreshWorldFromSave(save);
  }

  public getLatestSave(): SaveData | null {
    return this.latestSave;
  }

  public fastTravelTo(tileX: number, tileY: number) {
    this.sceneRef?.fastTravelTo(tileX, tileY);
  }

  public startGuardianEncounter(guardianId: GuardianId) {
    this.sceneRef?.startGuardianEncounter(guardianId);
  }

  public healPlayer() {
    this.sceneRef?.healPlayer();
  }

  public boardBoat() {
    this.sceneRef?.boardBoat();
  }

  public disembarkBoat() {
    this.sceneRef?.disembarkBoat();
  }

  public setTimeOfDay(hour: number) {
    this.sceneRef?.setTimeOfDay(hour);
  }

  public setWeather(weather: WeatherType) {
    this.sceneRef?.setWeather(weather);
  }

  public applyFoodEffect(effect: FoodEffect) {
    this.sceneRef?.applyFoodEffect(effect);
  }

  public setPaused(paused: boolean) {
    this.desiredPaused = paused;
    this.sceneRef?.setPaused(paused);
  }
}

export const gameBridge = new GameBridge();

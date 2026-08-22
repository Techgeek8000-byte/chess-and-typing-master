// ==========================================
// 🧟 APOCALYPSE TYPING MASTER - COMPLETE REWRITE
// Real zombie game with working mechanics, multiple scenes, and actual gameplay!
// ==========================================

export type SceneType = 
  | 'forest' 
  | 'desert' 
  | 'mall' 
  | 'bridge' 
  | 'hospital' 
  | 'village' 
  | 'school' 
  | 'highway' 
  | 'lab' 
  | 'military'
  | 'sewer'
  | 'graveyard';

export interface SceneConfig {
  id: SceneType;
  name: string;
  description: string;
  difficulty: number; // 1-10
  // Colors
  skyColor: string;
  groundColor: string;
  ambientColor: string;
  fogColor: string;
  fogDensity: number;
  // Lighting
  lightDirection: number;
  lightIntensity: number;
  hasRain: boolean;
  hasLightning: boolean;
  isNight: boolean;
  // Parallax layers (3 layers for depth)
  backgroundLayer: SceneElement[];
  midgroundLayer: SceneElement[];
  foregroundLayer: SceneElement[];
  // Ambient effects
  particles: ParticleEmitter[];
  soundscape: string[];
}

export interface SceneElement {
  type: 'tree' | 'building' | 'car' | 'rock' | 'tombstone' | 'bench' | 'shelf' | 'bed' | 'desk' | 'barrel' | 'crane' | 'fence' | 'road' | 'grass' | 'sand' | 'water' | 'blood' | 'debris' | 'body' | 'light' | 'window' | 'door';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  variant?: number;
  opacity?: number;
}

export interface ParticleEmitter {
  type: 'rain' | 'snow' | 'dust' | 'embers' | 'fog' | 'flies' | 'sparks' | 'leaves';
  rate: number; // particles per second
  color: string;
  speed: number;
  size: number;
}

export interface ZombieType {
  id: string;
  name: string;
  health: number;
  speed: number;
  damage: number;
  score: number;
  wordDifficulty: 'easy' | 'medium' | 'hard' | 'boss';
  size: number;
  color: string;
  secondaryColor: string;
  sprite: ZombieSprite;
  animations: AnimationSet;
  isBoss?: boolean;
  specialAbility?: string;
}

export interface ZombieSprite {
  bodyType: 'humanoid' | 'hulking' | 'crawler' | 'exploder' | 'runner' | 'armored';
  clothing: 'tattered' | 'military' | 'doctor' | 'student' | 'naked' | 'worker';
  decayLevel: number; // 0-1 (fresh to skeleton)
  hasLimbs: { leftArm: boolean; rightArm: boolean; leftLeg: boolean; rightLeg: boolean };
  features: string[]; // ['exposedBrain', 'gutsHanging', 'missingJaw', etc.]
}

export interface AnimationSet {
  idle: Frame[];
  walk: Frame[];
  attack: Frame[];
  death: Frame[];
  hit: Frame[];
}

export interface Frame {
  duration: number;
  transforms: Transform[];
}

export interface Transform {
  part: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface GameState {
  // Core state
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  
  // Player stats
  lives: number;
  maxLives: number;
  score: number;
  combo: number;
  maxCombo: number;
  totalKills: number;
  
  // Wave/Stage system
  currentWave: number;
  currentStage: number;
  zombiesRemaining: number;
  zombiesSpawned: number;
  zombiesKilledThisWave: number;
  
  // Current scene
  scene: SceneType;
  sceneTransition: number; // 0-1 for transition progress
  
  // Active entities
  zombies: ActiveZombie[];
  projectiles: Projectile[];
  particles: GameParticle[];
  powerUps: PowerUp[];
  damageNumbers: DamageNumber[];
  
  // Input
  currentInput: string;
  targetZombieId: string | null;
  
  // Timing
  lastSpawnTime: number;
  gameTime: number;
  waveStartTime: number;
  
  // Screen effects
  screenShake: { x: number; y: number; intensity: number };
  flash: { color: string; intensity: number; duration: number };
  vignette: number; // 0-1
  
  // Audio (visual representation)
  lowHealthPulse: boolean;
  comboDisplay: { text: string; scale: number; opacity: number };
}

export interface ActiveZombie {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  word: string;
  typedChars: number;
  state: 'spawning' | 'walking' | 'attacking' | 'dying' | 'dead';
  animationState: {
    currentAnimation: keyof AnimationSet;
    frameIndex: number;
    frameTime: number;
    facingLeft: boolean;
  };
  spawnTime: number;
  lastAttackTime: number;
  scale: number;
  opacity: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  isTargeted: boolean;
  hitFlashTime: number;
  deathTimer: number;
  dropPowerUp: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  type: 'bullet' | 'shotgun' | 'rifle' | 'explosive';
  owner: 'player' | 'zombie';
  pierceCount: number;
}

export interface GameParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'blood' | 'brain' | 'bone' | 'gore' | 'dirt' | 'spark' | 'smoke' | 'fire' | 'shell' | 'text';
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  text?: string;
}

export interface PowerUp {
  id: string;
  type: 'health' | 'ammo' | 'damage' | 'speed' | 'nuke' | 'slowmo' | 'shield';
  x: number;
  y: number;
  duration: number;
  value: number;
  pulsePhase: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  value: string;
  color: string;
  life: number;
  velocityY: number;
  scale: number;
}

export interface WaveConfig {
  waveNumber: number;
  zombieCount: number;
  spawnInterval: number; // ms
  zombieTypes: string[];
  bossWave: boolean;
  bossType?: string;
  scene: SceneType;
  difficultyMultiplier: number;
}

export interface StageConfig {
  stageNumber: number;
  name: string;
  description: string;
  waves: WaveConfig[];
  scene: SceneType;
  unlockRequirement: { type: 'score' | 'kills' | 'stageComplete'; value: number };
  rewards: { points: number; unlocks?: string[] };
}

// ==========================================
// SCENE DEFINITIONS - DETAILED ENVIRONMENTS
// ==========================================

export const SCENES: Record<SceneType, SceneConfig> = {
  forest: {
    id: 'forest',
    name: 'Haunted Forest',
    description: 'Ancient trees twist toward an eerie moonlight',
    difficulty: 2,
    skyColor: '#1a1a2e',
    groundColor: '#1a3a1a',
    ambientColor: '#2a4a2a',
    fogColor: '#3a5a3a',
    fogDensity: 0.03,
    lightDirection: Math.PI * 0.25,
    lightIntensity: 0.3,
    hasRain: false,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'tree', x: 50, y: 100, width: 120, height: 300, color: '#0a1a0a', variant: 1 },
      { type: 'tree', x: 200, y: 80, width: 150, height: 350, color: '#0a1a0a', variant: 2 },
      { type: 'tree', x: 400, y: 90, width: 130, height: 320, color: '#0a1a0a', variant: 3 },
      { type: 'tree', x: 600, y: 85, width: 140, height: 340, color: '#0a1a0a', variant: 1 },
      { type: 'tree', x: 800, y: 95, width: 125, height: 310, color: '#0a1a0a', variant: 2 },
      { type: 'moon', x: 700, y: 50, width: 80, height: 80, color: '#ffffcc', opacity: 0.8 },
    ],
    midgroundLayer: [
      { type: 'tree', x: 100, y: 180, width: 100, height: 250, color: '#152a15', variant: 3 },
      { type: 'tree', x: 350, y: 170, width: 110, height: 270, color: '#152a15', variant: 1 },
      { type: 'tree', x: 550, y: 175, width: 105, height: 260, color: '#152a15', variant: 2 },
      { type: 'grass', x: 0, y: 350, width: 900, height: 100, color: '#1a4a1a' },
      { type: 'rock', x: 250, y: 360, width: 40, height: 25, color: '#3a3a3a' },
      { type: 'rock', x: 500, y: 370, width: 35, height: 20, color: '#3a3a3a' },
    ],
    foregroundLayer: [
      { type: 'grass', x: 0, y: 400, width: 900, height: 80, color: '#2a5a2a' },
      { type: 'tree', x: -20, y: 280, width: 130, height: 220, color: '#1a3a1a', variant: 2 },
      { type: 'tree', x: 750, y: 290, width: 140, height: 210, color: '#1a3a1a', variant: 3 },
      { type: 'body', x: 300, y: 420, width: 30, height: 15, color: '#8b4513', opacity: 0.6 },
    ],
    particles: [
      { type: 'fog', rate: 5, color: '#4a6a4a', speed: 10, size: 50 },
      { type: 'flies', rate: 2, color: '#333333', speed: 20, size: 2 },
    ],
    soundscape: ['owl_hoot', 'wind_rustling', 'twigs_snapping'],
  },

  desert: {
    id: 'desert',
    name: 'Desert Wasteland',
    description: 'Burning sands stretch to the horizon',
    difficulty: 3,
    skyColor: '#ff9944',
    groundColor: '#c2956e',
    ambientColor: '#daa06d',
    fogColor: '#e8c89e',
    fogDensity: 0.02,
    lightDirection: Math.PI * 0.1,
    lightIntensity: 1.0,
    hasRain: false,
    hasLightning: false,
    isNight: false,
    backgroundLayer: [
      { type: 'sand', x: 0, y: 300, width: 900, height: 200, color: '#d4a574' },
      { type: 'cactus', x: 100, y: 250, width: 30, height: 80, color: '#2d5a27' },
      { type: 'cactus', x: 400, y: 240, width: 40, height: 100, color: '#2d5a27' },
      { type: 'cactus', x: 700, y: 255, width: 35, height: 70, color: '#2d5a27' },
      { type: 'sun', x: 750, y: 40, width: 100, height: 100, color: '#ffee88' },
    ],
    midgroundLayer: [
      { type: 'sand', x: 0, y: 350, width: 900, height: 100, color: '#c9956a' },
      { type: 'rock', x: 150, y: 340, width: 60, height: 40, color: '#8b7355' },
      { type: 'rock', x: 450, y: 350, width: 80, height: 50, color: '#8b7355' },
      { type: 'skull', x: 550, y: 380, width: 15, height: 12, color: '#e8dcc8' },
    ],
    foregroundLayer: [
      { type: 'sand', x: 0, y: 400, width: 900, height: 80, color: '#b8855a' },
      { type: 'rock', x: 50, y: 420, width: 40, height: 25, color: '#7a6347' },
      { type: 'bones', x: 350, y: 430, width: 30, height: 10, color: '#e8dcc8' },
    ],
    particles: [
      { type: 'dust', rate: 15, color: '#c9a67a', speed: 25, size: 3 },
      { type: 'heatShimmer', rate: 10, color: '#ffffff', speed: 5, size: 1 },
    ],
    soundscape: ['wind_hot', 'sand_sifting', 'vulture_cry'],
  },

  mall: {
    id: 'mall',
    name: 'Abandoned Mall',
    description: 'Shattered storefronts and forgotten shoppers',
    difficulty: 4,
    skyColor: '#2a2a3a',
    groundColor: '#4a4a5a',
    ambientColor: '#3a3a4a',
    fogColor: '#5a5a6a',
    fogDensity: 0.01,
    lightDirection: Math.PI * 0.5,
    lightIntensity: 0.4,
    hasRain: false,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'building', x: 0, y: 50, width: 900, height: 350, color: '#3a3a4a' },
      { type: 'window', x: 100, y: 100, width: 60, height: 80, color: '#1a1a2a', opacity: 0.8 },
      { type: 'window', x: 300, y: 100, width: 60, height: 80, color: '#1a1a2a', opacity: 0.6 },
      { type: 'window', x: 500, y: 100, width: 60, height: 80, color: '#ff4444', opacity: 0.3 }, // Emergency light
      { type: 'window', x: 700, y: 100, width: 60, height: 80, color: '#1a1a2a', opacity: 0.7 },
      { type: 'sign', x: 400, y: 170, width: 100, height: 40, color: '#666666' }, // Mall sign
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 350, width: 900, height: 100, color: '#5a5a6a' },
      { type: 'shelf', x: 80, y: 280, width: 40, height: 90, color: '#8b4513' },
      { type: 'shelf', x: 200, y: 290, width: 35, height: 80, color: '#8b4513' },
      { type: 'mannequin', x: 230, y: 340, width: 20, height: 50, color: '#deb887', opacity: 0.7 },
      { type: 'bench', x: 500, y: 360, width: 60, height: 20, color: '#4a4a4a' },
      { type: 'trash', x: 600, y: 365, width: 25, height: 30, color: '#3a3a3a' },
      { type: 'escalator', x: 750, y: 320, width: 80, height: 100, color: '#6a6a7a' },
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#4a4a5a' },
      { type: 'debris', x: 100, y: 430, width: 40, height: 15, color: '#6a6a6a' },
      { type: 'shoppingCart', x: 650, y: 420, width: 35, height: 30, color: '#8b0000' },
      { type: 'body', x: 400, y: 435, width: 25, height: 12, color: '#556b2f', opacity: 0.5 },
    ],
    particles: [
      { type: 'dust', rate: 8, color: '#888888', speed: 15, size: 2 },
      { type: 'sparks', rate: 1, color: '#ffaa00', speed: 30, size: 3 }, // Flickering lights
    ],
    soundscape: ['hum_fluorescent', 'echo_footsteps', 'glass_crunch'],
  },

  hospital: {
    id: 'hospital',
    name: 'Overrun Hospital',
    description: 'Blood trails lead to the morgue...',
    difficulty: 5,
    skyColor: '#1a1a2a',
    groundColor: '#4a4a5a',
    ambientColor: '#3a3a4a',
    fogColor: '#5a4a4a',
    fogDensity: 0.04,
    lightDirection: Math.PI * 0.3,
    lightIntensity: 0.2,
    hasRain: true,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'building', x: 0, y: 0, width: 900, height: 400, color: '#5a5a6a' },
      { type: 'window', x: 50, y: 80, width: 50, height: 60, color: '#2a3a4a' },
      { type: 'window', x: 150, y: 80, width: 50, height: 60, color: '#3a4a5a' },
      { type: 'cross', x: 800, y: 50, width: 40, height: 40, color: '#ffffff', opacity: 0.6 }, // Red cross sign
      { type: 'window', x: 650, y: 80, width: 50, height: 60, color: '#ff0000', opacity: 0.4 }, // Red emergency
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 340, width: 900, height: 110, color: '#6a6a7a' },
      { type: 'bed', x: 100, y: 360, width: 80, height: 50, color: '#ffffff' },
      { type: 'bed', x: 250, y: 365, width: 80, height: 50, color: '#ffcccc' }, // Blood-stained
      { type: 'gurney', x: 450, y: 355, width: 70, height: 45, color: '#8b8b8b' },
      { type: 'blood', x: 480, y: 395, width: 40, height: 15, color: '#8b0000', opacity: 0.7 },
      { type: 'shelf', x: 650, y: 300, width: 30, height: 80, color: '#ffffff' }, // Medicine cabinet
      { type: 'door', x: 780, y: 330, width: 40, height: 70, color: '#4a4a5a' },
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#5a5a6a' },
      { type: 'blood', x: 150, y: 430, width: 60, height: 12, color: '#660000', opacity: 0.6 },
      { type: 'ivBag', x: 550, y: 380, width: 10, height: 20, color: '#ffcccc' },
      { type: 'wheelchair', x: 720, y: 410, width: 35, height: 35, color: '#7a7a8a' },
      { type: 'body', x: 350, y: 435, width: 28, height: 14, color: '#4a6a4a', opacity: 0.4 },
    ],
    particles: [
      { type: 'rain', rate: 30, color: '#aaaacc', speed: 100, size: 2 },
      { type: 'fog', rate: 8, color: '#6a5a5a', speed: 8, size: 40 },
    ],
    soundscape: ['rain_on_glass', 'heart_monitor_beep', 'gurney_wheels'],
  },

  lab: {
    id: 'lab',
    name: 'Secret Research Lab',
    description: 'Patient Zero escaped from here...',
    difficulty: 7,
    skyColor: '#0a0a1a',
    groundColor: '#2a2a3a',
    ambientColor: '#1a1a2a',
    fogColor: '#3a2a4a',
    fogDensity: 0.05,
    lightDirection: Math.PI * 0,
    lightIntensity: 0.15,
    hasRain: false,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'building', x: 0, y: 0, width: 900, height: 400, color: '#2a2a3a' },
      { type: 'light', x: 100, y: 100, width: 30, height: 30, color: '#00ff00', opacity: 0.6 },
      { type: 'light', x: 400, y: 80, width: 25, height: 25, color: '#00ffff', opacity: 0.5 },
      { type: 'light', x: 700, y: 120, width: 35, height: 35, color: '#ff00ff', opacity: 0.4 },
      { type: 'tank', x: 500, y: 200, width: 60, height: 80, color: '#3a4a5a', opacity: 0.7 }, // Containment tank
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 350, width: 900, height: 100, color: '#3a3a4a' },
      { type: 'desk', x: 80, y: 330, width: 80, height: 40, color: '#5a5a6a' },
      { type: 'computer', x: 100, y: 310, width: 35, height: 25, color: '#1a1a1a' },
      { type: 'monitor', x: 105, y: 290, width: 25, height: 20, color: '#00ff00', opacity: 0.3 },
      { type: 'table', x: 300, y: 350, width: 100, height: 35, color: '#6a6a7a' }, // Operating table
      { type: 'restraints', x: 315, y: 345, width: 70, height: 10, color: '#8b4513' },
      { type: 'shelf', x: 600, y: 280, width: 40, height: 100, color: '#5a5a6a' },
      { type: 'chemicals', x: 610, y: 300, width: 20, height: 25, color: '#00ff00' },
      { type: 'chemicals', x: 635, y: 305, width: 15, height: 20, color: '#ff0000' },
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#2a2a3a' },
      { type: 'goo', x: 450, y: 430, width: 50, height: 15, color: '#00ff00', opacity: 0.5 }, // Glowing green goo
      { type: 'papers', x: 200, y: 420, width: 25, height: 18, color: '#ffffff' },
      { type: 'body', x: 320, y: 385, width: 22, height: 11, color: '#4a6a4a', opacity: 0.3 },
    ],
    particles: [
      { type: 'fog', rate: 10, color: '#4a3a5a', speed: 5, size: 30 },
      { type: 'sparks', rate: 3, color: '#00ff88', speed: 40, size: 2 }, // Electrical
      { type: 'embers', rate: 2, color: '#88ff00', speed: 15, size: 4 }, // Radioactive
    ],
    soundscape: ['electric_hum', 'liquid_bubbling', 'alarm_distant'],
  },

  highway: {
    id: 'highway',
    name: 'Highway Chaos',
    description: 'Abandoned vehicles block the escape route',
    difficulty: 4,
    skyColor: '#4a4a5a',
    groundColor: '#3a3a3a',
    ambientColor: '#5a5a5a',
    fogColor: '#6a6a6a',
    fogDensity: 0.02,
    lightDirection: Math.PI * 0.4,
    lightIntensity: 0.6,
    hasRain: false,
    hasLightning: false,
    isNight: false,
    backgroundLayer: [
      { type: 'road', x: 0, y: 250, width: 900, height: 200, color: '#3a3a3a' },
      { type: 'line', x: 450, y: 270, width: 10, height: 160, color: '#ffcc00' }, // Center line
      { type: 'car', x: 100, y: 300, width: 80, height: 40, color: '#cc0000' },
      { type: 'car', x: 350, y: 320, width: 75, height: 38, color: '#0000cc' },
      { type: 'truck', x: 600, y: 290, width: 120, height: 60, color: '#888888' },
      { type: 'car', x: 780, y: 310, width: 70, height: 35, color: '#00cc00' },
    ],
    midgroundLayer: [
      { type: 'road', x: 0, y: 360, width: 900, height: 90, color: '#4a4a4a' },
      { type: 'line', x: 450, y: 380, width: 8, height: 70, color: '#ffdd00' },
      { type: 'car', x: 50, y: 380, width: 65, height: 32, color: '#cccc00' },
      { type: 'barrier', x: 250, y: 400, width: 40, height: 15, color: '#ff8800' },
      { type: 'barrier', x: 295, y: 400, width: 40, height: 15, color: '#ff8800' },
      { type: 'debris', x: 500, y: 410, width: 30, height: 12, color: '#5a5a5a' },
    ],
    foregroundLayer: [
      { type: 'road', x: 0, y: 410, width: 900, height: 70, color: '#3a3a3a' },
      { type: 'line', x: 450, y: 425, width: 6, height: 50, color: '#ffee00' },
      { type: 'cone', x: 150, y: 430, width: 12, height: 18, color: '#ff8800' },
      { type: 'cone', x: 165, y: 432, width: 12, height: 18, color: '#ff8800' },
      { type: 'body', x: 400, y: 440, width: 26, height: 13, color: '#4a4a4a', opacity: 0.5 },
    ],
    particles: [
      { type: 'dust', rate: 12, color: '#777777', speed: 20, size: 2 },
      { type: 'smoke', rate: 3, color: '#666666', speed: 10, size: 15 }, // From cars
    ],
    soundscape: ['traffic_distant', 'horn_faint', 'wind_highway'],
  },

  village: {
    id: 'village',
    name: 'Ghost Village',
    description: 'The residents never left...',
    difficulty: 3,
    skyColor: '#2a2a3a',
    groundColor: '#4a5a3a',
    ambientColor: '#3a4a2a',
    fogColor: '#5a5a4a',
    fogDensity: 0.04,
    lightDirection: Math.PI * 0.3,
    lightIntensity: 0.35,
    hasRain: false,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'house', x: 50, y: 150, width: 100, height: 120, color: '#5a4a3a' },
      { type: 'house', x: 200, y: 130, width: 110, height: 140, color: '#4a3a2a' },
      { type: 'house', x: 400, y: 145, width: 95, height: 125, color: '#5a4a3a' },
      { type: 'house', x: 600, y: 135, width: 105, height: 135, color: '#4a3a2a' },
      { type: 'church', x: 750, y: 100, width: 120, height: 170, color: '#6a5a4a' },
      { type: 'steeple', x: 810, y: 50, width: 20, height: 60, color: '#5a4a3a' },
    ],
    midgroundLayer: [
      { type: 'grass', x: 0, y: 340, width: 900, height: 100, color: '#3a4a2a' },
      { type: 'well', x: 300, y: 350, width: 35, height: 35, color: '#4a4a4a' },
      { type: 'fence', x: 0, y: 360, width: 200, height: 25, color: '#6a5a4a' },
      { type: 'fence', x: 500, y: 365, width: 300, height: 25, color: '#6a5a4a' },
      { type: 'bench', x: 150, y: 375, width: 45, height: 15, color: '#5a4a3a' },
      { type: 'cart', x: 650, y: 370, width: 40, height: 25, color: '#6a5a4a' },
    ],
    foregroundLayer: [
      { type: 'grass', x: 0, y: 400, width: 900, height: 80, color: '#2a3a1a' },
      { type: 'gravestone', x: 100, y: 420, width: 25, height: 35, color: '#7a7a7a' },
      { type: 'gravestone', x: 135, y: 425, width: 22, height: 32, color: '#7a7a7a' },
      { type: 'gravestone', x: 165, y: 423, width: 24, height: 33, color: '#7a7a7a' },
      { type: 'flowers', x: 112, y: 435, width: 15, height: 10, color: '#aaaaaa', opacity: 0.4 },
    ],
    particles: [
      { type: 'fog', rate: 6, color: '#6a6a5a', speed: 8, size: 35 },
      { type: 'leaves', rate: 2, color: '#8a7a4a', speed: 12, size: 5 },
    ],
    soundscape: ['wind_ghostly', 'creak_door', 'crow_caw'],
  },

  school: {
    id: 'school',
    name: 'Infested School',
    description: 'Class is in session... forever',
    difficulty: 4,
    skyColor: '#3a3a4a',
    groundColor: '#5a5a5a',
    ambientColor: '#4a4a4a',
    fogColor: '#5a5a5a',
    fogDensity: 0.01,
    lightDirection: Math.PI * 0.5,
    lightIntensity: 0.5,
    hasRain: false,
    hasLightning: false,
    isNight: false,
    backgroundLayer: [
      { type: 'building', x: 0, y: 80, width: 900, height: 300, color: '#6a6a7a' },
      { type: 'window', x: 80, y: 140, width: 50, height: 60, color: '#4a5a6a' },
      { type: 'window', x: 180, y: 140, width: 50, height: 60, color: '#4a5a6a' },
      { type: 'window', x: 280, y: 140, width: 50, height: 60, color: '#4a5a6a' },
      { type: 'sign', x: 400, y: 120, width: 100, height: 50, color: '#4a6a8a' }, // School sign
      { type: 'clock', x: 450, y: 160, width: 25, height: 25, color: '#ffffff' },
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 350, width: 900, height: 100, color: '#6a6a6a' },
      { type: 'locker', x: 60, y: 290, width: 25, height: 80, color: '#8a7a6a' },
      { type: 'locker', x: 90, y: 290, width: 25, height: 80, color: '#8a7a6a' },
      { type: 'locker', x: 120, y: 290, width: 25, height: 80, color: '#8a7a6a' },
      { type: 'desk', x: 250, y: 365, width: 60, height: 30, color: '#8a6a4a' },
      { type: 'desk', x: 350, y: 368, width: 60, height: 30, color: '#8a6a4a' },
      { type: 'desk', x: 450, y: 365, width: 60, height: 30, color: '#8a6a4a' },
      { type: 'blackboard', x: 600, y: 300, width: 100, height: 60, color: '#2a3a2a' },
      { type: 'writing', x: 620, y: 320, width: 60, height: 20, color: '#ffffff' }, // Chalk writing
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#5a5a5a' },
      { type: 'book', x: 280, y: 420, width: 18, height: 12, color: '#4a6a8a' },
      { type: 'book', x: 380, y: 422, width: 16, height: 11, color: '#8a4a4a' },
      { type: 'backpack', x: 520, y: 415, width: 22, height: 18, color: '#4a4a6a' },
      { type: 'body', x: 350, y: 435, width: 24, height: 12, color: '#5a6a4a', opacity: 0.4 },
    ],
    particles: [
      { type: 'dust', rate: 6, color: '#888888', speed: 12, size: 2 },
      { type: 'paper', rate: 1, color: '#ffffff', speed: 8, size: 8 }, // Floating paper
    ],
    soundscape: ['bell_distant', 'locker_slam_echo', 'chalk_scratch'],
  },

  military: {
    id: 'military',
    name: 'Military Base',
    description: 'They could not contain the outbreak',
    difficulty: 8,
    skyColor: '#1a1a2a',
    groundColor: '#3a3a3a',
    ambientColor: '#2a2a2a',
    fogColor: '#3a3a3a',
    fogDensity: 0.03,
    lightDirection: Math.PI * 0.2,
    lightIntensity: 0.25,
    hasRain: false,
    hasLightning: true,
    isNight: true,
    backgroundLayer: [
      { type: 'building', x: 0, y: 50, width: 900, height: 350, color: '#3a3a3a' },
      { type: 'tower', x: 100, y: 0, width: 60, height: 200, color: '#4a4a4a' },
      { type: 'fence', x: 0, y: 320, width: 900, height: 40, color: '#5a5a5a' },
      { type: 'barbedWire', x: 0, y: 315, width: 900, height: 10, color: '#6a6a6a' },
      { type: 'spotlight', x: 200, y: 100, width: 40, height: 40, color: '#ffffcc', opacity: 0.5 },
      { type: 'spotlight', x: 700, y: 100, width: 40, height: 40, color: '#ffffcc', opacity: 0.5 },
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 350, width: 900, height: 100, color: '#4a4a4a' },
      { type: 'crate', x: 80, y: 360, width: 35, height: 35, color: '#8b7355' },
      { type: 'crate', x: 125, y: 365, width: 35, height: 35, color: '#8b7355' },
      { type: 'barrel', x: 300, y: 365, width: 25, height: 35, color: '#4a6a2a' },
      { type: 'jeep', x: 500, y: 345, width: 100, height: 55, color: '#5a6a3a' },
      { type: 'sandbag', x: 650, y: 370, width: 80, height: 25, color: '#8b7355' },
      { type: 'sandbag', x: 660, y: 350, width: 80, height: 25, color: '#8b7355' },
      { type: 'weaponCrate', x: 800, y: 355, width: 40, height: 30, color: '#6a5a4a' },
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#3a3a3a' },
      { type: 'shell', x: 150, y: 430, width: 8, height: 12, color: '#cc9900' },
      { type: 'shell', x: 165, y: 428, width: 8, height: 12, color: '#cc9900' },
      { type: 'body', x: 520, y: 400, width: 26, height: 13, color: '#5a6a4a', opacity: 0.5 }, // Soldier body
    ],
    particles: [
      { type: 'dust', rate: 8, color: '#666666', speed: 18, size: 2 },
      { type: 'sparks', rate: 2, color: '#ffcc00', speed: 35, size: 2 }, // Electrical
    ],
    soundscape: ['siren_distant', 'helicopter_far', 'radio_static'],
  },

  sewer: {
    id: 'sewer',
    name: 'Sewer Tunnels',
    description: 'Dark, wet, and full of the undead',
    difficulty: 6,
    skyColor: '#0a0a0a',
    groundColor: '#2a2a2a',
    ambientColor: '#1a1a1a',
    fogColor: '#3a3a2a',
    fogDensity: 0.08,
    lightDirection: Math.PI * 0,
    lightIntensity: 0.08,
    hasRain: false,
    hasLightning: false,
    isNight: true,
    backgroundLayer: [
      { type: 'tunnel', x: 0, y: 0, width: 900, height: 400, color: '#2a2a2a' },
      { type: 'pipe', x: 0, y: 100, width: 900, height: 20, color: '#4a4a4a' },
      { type: 'pipe', x: 0, y: 200, width: 900, height: 30, color: '#3a3a3a' },
      { type: 'water', x: 0, y: 380, width: 900, height: 40, color: '#2a3a2a' }, // Sewage water
    ],
    midgroundLayer: [
      { type: 'floor', x: 0, y: 350, width: 900, height: 100, color: '#1a1a1a' },
      { type: 'grate', x: 200, y: 360, width: 60, height: 40, color: '#4a4a4a' },
      { type: 'ladder', x: 600, y: 200, width: 30, height: 180, color: '#5a5a5a' },
      { type: 'rats', x: 350, y: 380, width: 15, height: 8, color: '#4a4a4a' },
      { type: 'rats', x: 370, y: 385, width: 12, height: 6, color: '#3a3a3a' },
    ],
    foregroundLayer: [
      { type: 'floor', x: 0, y: 400, width: 900, height: 80, color: '#151515' },
      { type: 'water', x: 0, y: 420, width: 900, height: 40, color: '#1a2a1a', opacity: 0.6 },
      { type: 'slime', x: 250, y: 440, width: 40, height: 12, color: '#2a4a2a', opacity: 0.5 },
      { type: 'bones', x: 500, y: 445, width: 25, height: 8, color: '#c8c8c8' },
    ],
    particles: [
      { type: 'fog', rate: 15, color: '#3a3a2a', speed: 5, size: 25 },
      { type: 'drips', rate: 5, color: '#4a5a4a', speed: 50, size: 3 }, // Water drips
    ],
    soundscape: ['water_dripping', 'rats_squeaking', 'echo_distant'],
  },

  graveyard: {
    id: 'graveyard',
    name: 'Cursed Graveyard',
    description: 'The dead don't stay buried here',
    difficulty: 5,
    skyColor: '#1a1a2e',
    groundColor: '#2a3a2a',
    ambientColor: '#1a2a1a',
    fogColor: '#3a4a3a',
    fogDensity: 0.07,
    lightDirection: Math.PI * 0.3,
    lightIntensity: 0.2,
    hasRain: false,
    hasLightning: true,
    isNight: true,
    backgroundLayer: [
      { type: 'tree', x: 50, y: 100, width: 100, height: 250, color: '#0a1a0a', variant: 2 },
      { type: 'tree', x: 300, y: 80, width: 120, height: 280, color: '#0a1a0a', variant: 3 },
      { type: 'tree', x: 600, y: 90, width: 110, height: 270, color: '#0a1a0a', variant: 1 },
      { type: 'tree', x: 800, y: 95, width: 105, height: 260, color: '#0a1a0a', variant: 2 },
      { type: 'moon', x: 750, y: 40, width: 70, height: 70, color: '#ddddff', opacity: 0.7 },
      { type: 'ironGate', x: 380, y: 250, width: 140, height: 100, color: '#3a3a3a' },
    ],
    midgroundLayer: [
      { type: 'grass', x: 0, y: 340, width: 900, height: 100, color: '#1a3a1a' },
      { type: 'gravestone', x: 80, y: 350, width: 25, height: 40, color: '#6a6a6a' },
      { type: 'gravestone', x: 150, y: 355, width: 22, height: 38, color: '#6a6a6a' },
      { type: 'gravestone', x: 220, y: 352, width: 24, height: 39, color: '#6a6a6a' },
      { type: 'crypt', x: 500, y: 300, width: 80, height: 70, color: '#4a4a4a' },
      { type: 'gravestone', x: 650, y: 358, width: 26, height: 37, color: '#6a6a6a' },
      { type: 'gravestone', x: 730, y: 353, width: 23, height: 39, color: '#6a6a6a' },
      { type: 'openGrave', x: 400, y: 365, width: 50, height: 25, color: '#1a1a1a' },
    ],
    foregroundLayer: [
      { type: 'grass', x: 0, y: 400, width: 900, height: 80, color: '#0a2a0a' },
      { type: 'gravestone', x: 100, y: 420, width: 20, height: 32, color: '#5a5a5a' },
      { type: 'flowers', x: 105, y: 440, width: 12, height: 8, color: '#aaaaaa', opacity: 0.3 },
      { type: 'hand', x: 415, y: 385, width: 12, height: 8, color: '#5a6a4a' }, // Zombie hand emerging!
      { type: 'cross', x: 700, y: 425, width: 15, height: 20, color: '#8a8a8a' },
    ],
    particles: [
      { type: 'fog', rate: 12, color: '#4a5a4a', speed: 6, size: 40 },
      { type: 'embers', rate: 2, color: '#88ff88', speed: 15, size: 3 }, // Ghostly
      { type: 'flies', rate: 3, color: '#333333', speed: 18, size: 2 },
    ],
    soundscape: ['wind_moaning', 'earth_creaking', 'ghost_whisper'],
  }
};

// ==========================================
// ZOMBIE TYPE DEFINITIONS
// ==========================================

export const ZOMBIE_TYPES: Record<string, ZombieType> = {
  walker: {
    id: 'walker',
    name: 'Walker',
    health: 1,
    speed: 0.8,
    damage: 1,
    score: 100,
    wordDifficulty: 'easy',
    size: 50,
    color: '#5a6b3a',
    secondaryColor: '#3d4a25',
    sprite: {
      bodyType: 'humanoid',
      clothing: 'tattered',
      decayLevel: 0.3,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['exposedSkin', 'darkEyes']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  runner: {
    id: 'runner',
    name: 'Runner',
    health: 1,
    speed: 2.0,
    damage: 1,
    score: 150,
    wordDifficulty: 'easy',
    size: 45,
    color: '#6b4a3a',
    secondaryColor: '#4a3020',
    sprite: {
      bodyType: 'runner',
      clothing: 'student',
      decayLevel: 0.2,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['leanBuild', 'fastTwitch']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  hulk: {
    id: 'hulk',
    name: 'Hulk',
    health: 3,
    speed: 0.5,
    damage: 3,
    score: 300,
    wordDifficulty: 'medium',
    size: 80,
    color: '#4a4a4a',
    secondaryColor: '#2a2a2a',
    sprite: {
      bodyType: 'hulking',
      clothing: 'worker',
      decayLevel: 0.4,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['muscular', 'thickSkin']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  crawler: {
    id: 'crawler',
    name: 'Crawler',
    health: 1,
    speed: 0.6,
    damage: 1,
    score: 120,
    wordDifficulty: 'easy',
    size: 40,
    color: '#5a4a3a',
    secondaryColor: '#3a2a1a',
    sprite: {
      bodyType: 'crawler',
      clothing: 'naked',
      decayLevel: 0.6,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: false, rightLeg: false },
      features: ['draggingBody', 'brokenBack']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  exploder: {
    id: 'exploder',
    name: 'Exploder',
    health: 1,
    speed: 1.2,
    damage: 5,
    score: 250,
    wordDifficulty: 'medium',
    size: 55,
    color: '#6a4a2a',
    secondaryColor: '#4a3020',
    sprite: {
      bodyType: 'exploder',
      clothing: 'tattered',
      decayLevel: 0.5,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['swollenBody', 'glowingVeins']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] },
    specialAbility: 'explodeOnDeath'
  },
  
  armored: {
    id: 'armored',
    name: 'Armored',
    health: 4,
    speed: 0.7,
    damage: 2,
    score: 400,
    wordDifficulty: 'hard',
    size: 65,
    color: '#4a4a5a',
    secondaryColor: '#2a2a3a',
    sprite: {
      bodyType: 'armored',
      clothing: 'military',
      decayLevel: 0.2,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['bodyArmor', 'helmet']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  doctor: {
    id: 'doctor',
    name: 'Doctor',
    health: 2,
    speed: 1.0,
    damage: 2,
    score: 200,
    wordDifficulty: 'medium',
    size: 52,
    color: '#ffffff',
    secondaryColor: '#cccccc',
    sprite: {
      bodyType: 'humanoid',
      clothing: 'doctor',
      decayLevel: 0.3,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['whiteCoat', 'stethoscope']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] }
  },
  
  boss_titan: {
    id: 'boss_titan',
    name: 'TITAN',
    health: 20,
    speed: 0.3,
    damage: 10,
    score: 2000,
    wordDifficulty: 'boss',
    size: 150,
    color: '#3a2a1a',
    secondaryColor: '#1a0a05',
    sprite: {
      bodyType: 'hulking',
      clothing: 'military',
      decayLevel: 0.4,
      hasLimbs: { leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
      features: ['massive', 'armorPlates', 'glowingEyes']
    },
    animations: { idle: [], walk: [], attack: [], death: [], hit: [] },
    isBoss: true,
    specialAbility: 'groundSlam'
  }
};

// ==========================================
// WORD LISTS BY DIFFICULTY
// ==========================================

export const WORD_LISTS = {
  easy: [
    'die', 'run', 'bite', 'kill', 'dead', 'eat', 'fear', 'pain', 'blood', 'guts',
    'rot', 'skin', 'bone', 'meat', 'hunt', 'prey', 'lost', 'gone', 'dark', 'cold',
    'end', 'war', 'gun', 'shot', 'aim', 'fire', 'burn', 'ash', 'doom', 'grim'
  ],
  medium: [
    'zombie', 'undead', 'horror', 'death', 'attack', 'monster', 'creature', 'infected',
    'nightmare', 'shadow', 'walking', 'rotting', 'screaming', 'chasing', 'hunting',
    'survivor', 'shelter', 'weapon', 'ammunition', 'infection', 'outbreak', 'quarantine',
    'apocalypse', 'devastation', 'annihilation', 'extermination', 'eradication'
  ],
  hard: [
    'reanimation', 'necromancy', 'putrescent', 'decimation', 'obliteration',
    'cataclysmic', 'insurrection', 'extermination', 'annihilation', 'devastation',
    'unprecedented', 'uncontrollable', 'indestructible', 'invincible', 'overwhelming',
    'catastrophic', 'apocalyptic', 'malevolent', 'omnipresent', 'inescapable'
  ],
  boss: [
    'TITAN', 'APOCALYPSE', 'ANNIHILATION', 'DESTRUCTION', 'OBLIVION',
    'INVINCIBLE', 'IMMORTAL', 'UNSTOPPABLE', 'DEVASTATOR', 'EXTERMINATOR',
    'CATACLYSM', 'ARMAGEDDON', 'GENOCIDE', 'MASSACRE', 'HOLOCAUST'
  ]
};

// ==========================================
// STAGE/WAVE CONFIGURATIONS
// ==========================================

export const STAGES: StageConfig[] = [
  {
    stageNumber: 1,
    stateNumber: 1,
    name: 'The Awakening',
    description: 'First contact in the haunted forest',
    scene: 'forest',
    waves: [
      { waveNumber: 1, zombieCount: 5, spawnInterval: 3000, zombieTypes: ['walker'], bossWave: false, scene: 'forest', difficultyMultiplier: 1.0 },
      { waveNumber: 2, zombieCount: 7, spawnInterval: 2800, zombieTypes: ['walker', 'walker'], bossWave: false, scene: 'forest', difficultyMultiplier: 1.1 },
      { waveNumber: 3, zombieCount: 10, spawnInterval: 2500, zombieTypes: ['walker', 'runner'], bossWave: true, bossType: 'boss_titan', scene: 'forest', difficultyMultiplier: 1.2 }
    ],
    unlockRequirement: { type: 'stageComplete', value: 0 },
    rewards: { points: 500, unlocks: ['desert'] }
  },
  {
    stageNumber: 2,
    stateNumber: 2,
    name: 'Scorched Earth',
    description: 'The infection spreads to the desert wasteland',
    scene: 'desert',
    waves: [
      { waveNumber: 4, zombieCount: 8, spawnInterval: 2600, zombieTypes: ['walker', 'runner'], bossWave: false, scene: 'desert', difficultyMultiplier: 1.3 },
      { waveNumber: 5, zombieCount: 12, spawnInterval: 2400, zombieTypes: ['walker', 'runner', 'crawler'], bossWave: false, scene: 'desert', difficultyMultiplier: 1.4 },
      { waveNumber: 6, zombieCount: 15, spawnInterval: 2200, zombieTypes: ['runner', 'crawler', 'hulk'], bossWave: true, bossType: 'boss_titan', scene: 'desert', difficultyMultiplier: 1.5 }
    ],
    unlockRequirement: { type: 'stageComplete', value: 1 },
    rewards: { points: 1000, unlocks: ['mall'] }
  },
  {
    stageNumber: 3,
    stateNumber: 3,
    name: 'Consumer Hell',
    description: 'Trapped in the abandoned shopping mall',
    scene: 'mall',
    waves: [
      { waveNumber: 7, zombieCount: 12, spawnInterval: 2300, zombieTypes: ['walker', 'runner', 'crawler'], bossWave: false, scene: 'mall', difficultyMultiplier: 1.6 },
      { waveNumber: 8, zombieCount: 15, spawnInterval: 2100, zombieTypes: ['runner', 'crawler', 'exploder'], bossWave: false, scene: 'mall', difficultyMultiplier: 1.7 },
      { waveNumber: 9, zombieCount: 18, spawnInterval: 1900, zombieTypes: ['crawler', 'exploder', 'hulk'], bossWave: true, bossType: 'boss_titan', scene: 'mall', difficultyMultiplier: 1.8 }
    ],
    unlockRequirement: { type: 'stageComplete', value: 2 },
    rewards: { points: 1500, unlocks: ['hospital'] }
  },
  {
    stageNumber: 4,
    stateNumber: 4,
    name: 'Code Blue',
    description: 'The hospital is ground zero',
    scene: 'hospital',
    waves: [
      { waveNumber: 10, zombieCount: 15, spawnInterval: 2000, zombieTypes: ['walker', 'crawler', 'doctor'], bossWave: false, scene: 'hospital', difficultyMultiplier: 1.9 },
      { waveNumber: 11, zombieCount: 18, spawnInterval: 1800, zombieTypes: ['doctor', 'exploder', 'hulk'], bossWave: false, scene: 'hospital', difficultyMultiplier: 2.0 },
      { waveNumber: 12, zombieCount: 22, spawnInterval: 1600, zombieTypes: ['doctor', 'exploder', 'armored'], bossWave: true, bossType: 'boss_titan', scene: 'hospital', difficultyMultiplier: 2.2 }
    ],
    unlockRequirement: { type: 'stageComplete', value: 3 },
    rewards: { points: 2000, unlocks: ['lab'] }
  },
  {
    stageNumber: 5,
    stateNumber: 5,
    name: 'Patient Zero',
    description: 'Find the source in the secret lab',
    scene: 'lab',
    waves: [
      { waveNumber: 13, zombieCount: 20, spawnInterval: 1700, zombieTypes: ['doctor', 'exploder', 'armored'], bossWave: false, scene: 'lab', difficultyMultiplier: 2.3 },
      { waveNumber: 14, zombieCount: 25, spawnInterval: 1500, zombieTypes: ['exploder', 'armored', 'hulk'], bossWave: false, scene: 'lab', difficultyMultiplier: 2.5 },
      { waveNumber: 15, zombieCount: 30, spawnInterval: 1300, zombieTypes: ['armored', 'hulk', 'all'], bossWave: true, bossType: 'boss_titan', scene: 'lab', difficultyMultiplier: 2.8 }
    ],
    unlockRequirement: { type: 'stageComplete', value: 4 },
    rewards: { points: 3000, unlocks: ['highway', 'village', 'school'] }
  }
];

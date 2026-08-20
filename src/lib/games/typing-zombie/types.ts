// Zombie Typing Master - Game Engine Types and Constants

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Zombie {
  id: string;
  word: string;
  displayWord: string;
  typedChars: string;
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  type: ZombieType;
  size: number;
  rotation: number;
  scale: number;
  opacity: number;
  isAttacking: boolean;
  isDying: boolean;
  deathAnimation: number;
  spawnTime: number;
  damageFlash: number;
  isBoss: boolean;
  color: string;
}

export type ZombieType = 
  | 'normal'      // Standard zombie - greenish
  | 'fast'        // Quick but weak - reddish
  | 'tank'        // Slow but strong - gray/blue
  | 'ghost'       // Transparent, moves through obstacles - purple
  | 'exploder'    // Explodes when killed - orange
  | 'boss'        // Boss zombie - large, multiple words;

export interface Particle {
  id: string;
  position: Position;
  velocity: Velocity;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'blood' | 'explosion' | 'text' | 'spark' | 'bone';
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Projectile {
  id: string;
  position: Position;
  velocity: Velocity;
  targetZombie: string;
  type: 'bullet' | 'laser' | 'rocket';
  damage: number;
  size: number;
  trail: Position[];
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  velocity: Velocity;
  size: number;
  rotation: number;
  duration: number;
  collected: boolean;
}

export type PowerUpType = 
  | 'freeze'      // Slows all zombies
  | 'nuke'        // Kills all zombies on screen
  | 'rapidFire'   // Faster typing detection
  | 'shield'      // Temporary invincibility
  | 'heal'        // Restore health
  | 'multiKill'   // Next 5 kills are instant';

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  health: number;
  maxHealth: number;
  level: number;
  wave: number;
  zombiesKilled: number;
  totalZombies: number;
  wordsTyped: number;
  accuracy: number;
  totalAttempts: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory' | 'levelComplete';
  activePowerUps: Map<PowerUpType, number>;
  screenShake: { intensity: number; duration: number };
  lastFrameTime: number;
  deltaTime: number;
}

export interface GameConfig {
  baseZombieSpeed: number;
  spawnRate: number;
  wordsPerWave: number;
  difficultyMultiplier: number;
  enableParticles: boolean;
  enableSound: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
}

// Word lists by difficulty
export const WORD_LISTS = {
  easy: [
    'cat', 'dog', 'run', 'jump', 'play', 'eat', 'sleep', 'walk',
    'book', 'tree', 'house', 'car', 'bird', 'fish', 'sun', 'moon',
    'star', 'fire', 'water', 'wind', 'rain', 'snow', 'hand', 'foot',
    'head', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg', 'back',
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'big', 'small',
    'hot', 'cold', 'fast', 'slow', 'good', 'bad', 'new', 'old'
  ],
  medium: [
    'zombie', 'attack', 'survive', 'weapon', 'danger', 'horror',
    'nightmare', 'scream', 'shadow', 'blood', 'death', 'alive',
    'brain', 'flesh', 'monster', 'creature', 'undead', 'corpse',
    'graveyard', 'coffin', 'skull', 'bones', 'tomb', 'crypt',
    'darkness', 'terror', 'fear', 'panic', 'escape', 'chase',
    'hunter', 'prey', 'victim', 'survivor', 'hero', 'warrior',
    'shotgun', 'pistol', 'rifle', 'ammo', 'bullet', 'blast',
    'flame', 'burn', 'destroy', 'eliminate', 'annihilate'
  ],
  hard: [
    'apocalypse', 'catastrophe', 'annihilation', 'extermination',
    'obliteration', 'devastation', 'decomposition', 'putrefaction',
    'necromancy', 'resurrection', 'reanimation', 'transformation',
    'infestation', 'contamination', 'epidemic', 'pandemic',
    'quarantine', 'containment', 'eradication', 'extermination',
    'overwhelming', 'insurmountable', 'indestructible', 'invincible',
    'phenomenal', 'extraordinary', 'supernatural', 'paranormal',
    'psychological', 'physiological', 'neurological', 'biological',
    'hemoglobin', 'adrenaline', 'testosterone', 'endorphins',
    'consciousness', 'subconscious', 'unconscious', 'intuition'
  ],
  boss: [
    'OVERLORD', 'DESTROYER', 'ANNIHILATOR', 'EXTINCTION',
    'APOCALYPSE', 'ARMAGEDDON', 'CATASTROPHE', 'DEVASTATION',
    'INFERNAL', 'DIABOLICAL', 'MALEVOLENT', 'NEFARIOUS',
    'OMNIPOTENT', 'IMMORTAL', 'INVINCIBLE', 'UNSTOPPABLE'
  ]
};

// Zombie configurations
export const ZOMBIE_CONFIGS: Record<ZombieType, {
  health: number;
  speed: number;
  size: number;
  color: string;
  wordLength: [number, number];
  scoreMultiplier: number;
  spawnWeight: number;
}> = {
  normal: {
    health: 100,
    speed: 1,
    size: 60,
    color: '#4a7c59',
    wordLength: [3, 5],
    scoreMultiplier: 1,
    spawnWeight: 50
  },
  fast: {
    health: 50,
    speed: 2.2,
    size: 45,
    color: '#c74b4b',
    wordLength: [3, 4],
    scoreMultiplier: 1.5,
    spawnWeight: 25
  },
  tank: {
    health: 300,
    speed: 0.5,
    size: 85,
    color: '#5a6a8a',
    wordLength: [6, 8],
    scoreMultiplier: 3,
    spawnWeight: 10
  },
  ghost: {
    health: 75,
    speed: 1.5,
    size: 55,
    color: '#9b59b6',
    wordLength: [4, 6],
    scoreMultiplier: 2,
    spawnWeight: 15
  },
  exploder: {
    health: 80,
    speed: 1.2,
    size: 55,
    color: '#e67e22',
    wordLength: [4, 5],
    scoreMultiplier: 2.5,
    spawnWeight: 10
  },
  boss: {
    health: 1000,
    speed: 0.3,
    size: 120,
    color: '#8b0000',
    wordLength: [8, 12],
    scoreMultiplier: 20,
    spawnWeight: 0 // Spawned specially
  }
};

// Game constants
export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 700,
  SAFE_ZONE_WIDTH: 200,
  COMBO_TIMEOUT: 2000,
  POWER_UP_DURATION: 5000,
  POWER_UP_SPAWN_CHANCE: 0.05,
  MAX_PARTICLES: 200,
  SCREEN_SHAKE_INTENSITY: 15,
  BASE_SPAWN_INTERVAL: 2500,
  MIN_SPAWN_INTERVAL: 800,
  ZOMBIE_DAMAGE: 10,
  PERFECT_TYPE_BONUS: 50,
  COMBO_MULTIPLIER: 0.5
};

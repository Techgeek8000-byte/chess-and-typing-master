// Enhanced Enemy Types for Typing Master Game
// Inspired by 3D realistic graphics reference

export type EnemyType = 'zombie' | 'dog' | 'cat' | 'spider' | 'bossZombie' | 'bossDog' | 'bossSpider' | 'bossCat' | 'special';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  health: number;
  speed: number;
  damage: number;
  score: number;
  wordLength: [number, number]; // min, max
  color: string;
  secondaryColor: string;
  size: number;
  isBoss: boolean;
  levelUnlock: number;
  description: string;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  // ==================== ZOMBIES (Level 1+) ====================
  zombie: {
    type: 'zombie',
    name: 'Zombie',
    health: 1,
    speed: 1,
    damage: 1,
    score: 100,
    wordLength: [3, 5],
    color: '#4a5d23',
    secondaryColor: '#2d3a15',
    size: 60,
    isBoss: false,
    levelUnlock: 1,
    description: 'Basic undead walker'
  },

  // ==================== DOGS (Level 3+) ====================
  dog: {
    type: 'dog',
    name: 'Hellhound',
    health: 1,
    speed: 1.8,
    damage: 1,
    score: 150,
    wordLength: [3, 4],
    color: '#8b4513',
    secondaryColor: '#5c2e0d',
    size: 50,
    isBoss: false,
    levelUnlock: 3,
    description: 'Infected canine, fast and aggressive'
  },

  // ==================== CATS (Level 5+) ====================
  cat: {
    type: 'cat',
    name: 'Shadow Cat',
    health: 1,
    speed: 1.5,
    damage: 1,
    score: 175,
    wordLength: [4, 6],
    color: '#2f2f2f',
    secondaryColor: '#1a1a1a',
    size: 45,
    isBoss: false,
    levelUnlock: 5,
    description: 'Stealthy feline predator'
  },

  // ==================== SPIDERS (Level 7+) ====================
  spider: {
    type: 'spider',
    name: 'Giant Spider',
    health: 1,
    speed: 1.3,
    damage: 2,
    score: 200,
    wordLength: [4, 7],
    color: '#1a1a2e',
    secondaryColor: '#0f0f1a',
    size: 55,
    isBoss: false,
    levelUnlock: 7,
    description: 'Eight-legged terror'
  },

  // ==================== BOSSES ====================
  bossZombie: {
    type: 'bossZombie',
    name: 'TITAN ZOMBIE',
    health: 10,
    speed: 0.6,
    damage: 5,
    score: 1000,
    wordLength: [6, 9],
    color: '#2d4a1a',
    secondaryColor: '#1a2d0f',
    size: 120,
    isBoss: true,
    levelUnlock: 2,
    description: 'Massive undead behemoth'
  },

  bossDog: {
    type: 'bossDog',
    name: 'CERBERUS',
    health: 8,
    speed: 1.2,
    damage: 4,
    score: 1500,
    wordLength: [5, 8],
    color: '#5c1a0d',
    secondaryColor: '#3d0f07',
    size: 100,
    isBoss: true,
    levelUnlock: 4,
    description: 'Three-headed hell hound'
  },

  bossCat: {
    type: 'bossCat',
    name: 'SHADOW LORD',
    health: 7,
    speed: 1.4,
    damage: 3,
    score: 1200,
    wordLength: [6, 10],
    color: '#0f0f1a',
    secondaryColor: '#050508',
    size: 90,
    isBoss: true,
    levelUnlock: 6,
    description: 'Master of darkness'
  },

  bossSpider: {
    type: 'bossSpider',
    name: 'QUEEN ARACHNE',
    health: 12,
    speed: 0.8,
    damage: 6,
    score: 2000,
    wordLength: [7, 11],
    color: '#16213e',
    secondaryColor: '#0a0f1e',
    size: 140,
    isBoss: true,
    levelUnlock: 8,
    description: 'Mother of all spiders'
  },

  special: {
    type: 'special',
    name: '???',
    health: 20,
    speed: 0.5,
    damage: 10,
    score: 5000,
    wordLength: [8, 12],
    color: '#ff00ff',
    secondaryColor: '#990099',
    size: 160,
    isBoss: true,
    levelUnlock: 10,
    description: 'Legendary creature'
  }
};

export interface LevelConfig {
  level: number;
  name: string;
  enemies: EnemyType[];
  boss: EnemyType | null;
  enemyCount: number;
  spawnRate: number; // ms between spawns
  backgroundTheme: string;
}

export const LEVELS: LevelConfig[] = [
  // Level 1: Zombie Introduction
  {
    level: 1,
    name: 'The Awakening',
    enemies: ['zombie'],
    boss: null,
    enemyCount: 8,
    spawnRate: 3000,
    backgroundTheme: 'graveyard'
  },
  // Level 2: First Boss
  {
    level: 2,
    name: 'Titan Rising',
    enemies: ['zombie', 'zombie'],
    boss: 'bossZombie',
    enemyCount: 6,
    spawnRate: 2800,
    backgroundTheme: 'darkForest'
  },
  // Level 3: Dogs Appear
  {
    level: 3,
    name: 'Pack Attack',
    enemies: ['zombie', 'dog'],
    boss: null,
    enemyCount: 10,
    spawnRate: 2600,
    backgroundTheme: 'urban'
  },
  // Level 4: Dog Boss
  {
    level: 4,
    name: 'Gates of Hell',
    enemies: ['zombie', 'dog', 'dog'],
    boss: 'bossDog',
    enemyCount: 8,
    spawnRate: 2400,
    backgroundTheme: 'hell'
  },
  // Level 5: Cats Join
  {
    level: 5,
    name: 'Nine Lives',
    enemies: ['zombie', 'dog', 'cat'],
    boss: null,
    enemyCount: 12,
    spawnRate: 2200,
    backgroundTheme: 'alley'
  },
  // Level 6: Cat Boss
  {
    level: 6,
    name: 'Eclipse',
    enemies: ['zombie', 'dog', 'cat', 'cat'],
    boss: 'bossCat',
    enemyCount: 10,
    spawnRate: 2000,
    backgroundTheme: 'midnight'
  },
  // Level 7: Spiders Emerge
  {
    level: 7,
    name: 'Web of Terror',
    enemies: ['dog', 'cat', 'spider'],
    boss: null,
    enemyCount: 14,
    spawnRate: 1800,
    backgroundTheme: 'cave'
  },
  // Level 8: Spider Boss
  {
    level: 8,
    name: 'Queen\'s Lair',
    enemies: ['zombie', 'dog', 'cat', 'spider'],
    boss: 'bossSpider',
    enemyCount: 12,
    spawnRate: 1600,
    backgroundTheme: 'nest'
  },
  // Level 9: All Together
  {
    level: 9,
    name: 'Apocalypse',
    enemies: ['zombie', 'dog', 'cat', 'spider', 'spider'],
    boss: null,
    enemyCount: 18,
    spawnRate: 1400,
    backgroundTheme: 'apocalypse'
  },
  // Level 10: Final Boss
  {
    level: 10,
    name: 'FINAL STAND',
    enemies: ['zombie', 'dog', 'cat', 'spider'],
    boss: 'special',
    enemyCount: 20,
    spawnRate: 1200,
    backgroundTheme: 'void'
  }
];

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  maxLives: number;
  wave: number;
  level: number;
  kills: number;
  totalKills: number;
  accuracy: { hits: number; misses: number };
  money: number;
  upgrades: Upgrades;
  currentInput: string;
  activeEnemies: EnhancedEnemy[];
  particles: Particle[];
  screenShake: number;
  lastSpawnTime: number;
  bossActive: boolean;
  bossHealth: number;
  bossMaxHealth: number;
}

export interface Upgrades {
  damage: number;
  fireRate: number;
  ammo: number;
  health: number;
  multiShot: boolean;
  pierce: boolean;
  criticalChance: number;
}

export interface EnhancedEnemy extends EnemyConfig {
  id: string;
  x: number;
  y: number;
  currentWord: string;
  typedChars: number;
  health: number;
  maxHealth: number;
  animationFrame: number;
  animationTimer: number;
  isHit: boolean;
  hitTimer: number;
  spawnTime: number;
  scale: number;
  opacity: number;
  angle: number;
  wobble: number;
  legPhase: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'blood' | 'spark' | 'bone' | 'fur' | 'web' | 'soul' | 'explosion' | 'text';
  text?: string;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
}

export interface WordDifficulty {
  easy: string[];
  medium: string[];
  hard: string[];
  expert: string[];
  boss: string[];
}

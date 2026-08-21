'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ==================== TYPES ====================
interface Enemy {
  id: string;
  type: 'zombie' | 'dog' | 'cat' | 'spider' | 'boss';
  x: number;
  y: number;
  word: string;
  typed: string;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
  color: string;
  isBoss: boolean;
  phase: number; // animation phase
  wobble: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'blood' | 'spark' | 'bone' | 'text' | 'explosion';
  text?: string;
}

interface Scene {
  name: string;
  skyColor: string;
  groundColor: string;
  bgColor1: string;
  bgColor2: string;
  objects: SceneObject[];
  ambientParticles: AmbientParticle[];
}

interface SceneObject {
  type: 'building' | 'tree' | 'car' | 'bed' | 'shelf' | 'road_line' | 'hospital_sign' | 'lamp' | 'bench' | 'trash';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface AmbientParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  type: 'dust' | 'rain' | 'snow' | 'ember' | 'fog';
}

// ==================== SCENE DEFINITIONS ====================
const SCENES: Record<number, Scene> = {
  1: { // HOSPITAL
    name: '🏥 Abandoned Hospital',
    skyColor: '#1a1a2e',
    groundColor: '#2d2d44',
    bgColor1: '#0f0f1a',
    bgColor2: '#1a1a3e',
    objects: [
      { type: 'building', x: 100, y: 200, width: 200, height: 300, color: '#2a2a3a' },
      { type: 'building', x: 400, y: 180, width: 250, height: 320, color: '#252535' },
      { type: 'hospital_sign', x: 450, y: 220, width: 80, height: 40, color: '#ff4444' },
      { type: 'bed', x: 150, y: 420, width: 60, height: 30, color: '#ffffff' },
      { type: 'bed', x: 250, y: 430, width: 60, height: 30, color: '#dddddd' },
      { type: 'lamp', x: 350, y: 350, width: 20, height: 80, color: '#ffffaa' },
      { type: 'lamp', x: 550, y: 360, width: 20, height: 70, color: '#ffff99' },
      { type: 'bench', x: 500, y: 440, width: 50, height: 25, color: '#8b4513' },
      { type: 'trash', x: 620, y: 450, width: 25, height: 35, color: '#555555' },
    ],
    ambientParticles: Array.from({ length: 30 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 600,
      speed: 0.3 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
      type: 'dust' as const
    }))
  },
  2: { // SHOPPING MALL
    name: '🛒 Dead Mall',
    skyColor: '#16213e',
    groundColor: '#1a1a2e',
    bgColor1: '#0a0a15',
    bgColor2: '#151530',
    objects: [
      { type: 'building', x: 50, y: 150, width: 350, height: 350, color: '#3a3a4a' },
      { type: 'building', x: 500, y: 170, width: 300, height: 330, color: '#353545' },
      { type: 'shelf', x: 100, y: 400, width: 80, height: 60, color: '#cd853f' },
      { type: 'shelf', x: 200, y: 410, width: 80, height: 50, color: '#daa520' },
      { type: 'shelf', x: 550, y: 400, width: 90, height: 60, color: '#b8860b' },
      { type: 'shelf', x: 680, y: 415, width: 80, height: 45, color: '#cd853f' },
      { type: 'car', x: 300, y: 460, width: 80, height: 40, color: '#cc0000' },
      { type: 'car', x: 650, y: 465, width: 70, height: 35, color: '#2255cc' },
      { type: 'lamp', x: 200, y: 300, width: 15, height: 100, color: '#ffcccc' },
      { type: 'lamp', x: 600, y: 310, width: 15, height: 90, color: '#ffcccc' },
    ],
    ambientParticles: Array.from({ length: 25 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 600,
      speed: 0.2 + Math.random() * 0.3,
      size: 2 + Math.random() * 3,
      opacity: 0.05 + Math.random() * 0.15,
      type: 'fog' as const
    }))
  },
  3: { // HIGHWAY
    name: '🛣️ Highway to Hell',
    skyColor: '#1a0a0a',
    groundColor: '#2a2a2a',
    bgColor1: '#0a0505',
    bgColor2: '#1a1010',
    objects: [
      { type: 'road_line', x: 0, y: 480, width: 1200, height: 8, color: '#ffff00' },
      { type: 'road_line', x: 200, y: 500, width: 150, height: 6, color: '#ffff00' },
      { type: 'road_line', x: 500, y: 495, width: 180, height: 6, color: '#ffff00' },
      { type: 'road_line', x: 850, y: 502, width: 120, height: 6, color: '#ffff00' },
      { type: 'car', x: 150, y: 430, width: 90, height: 45, color: '#333333' },
      { type: 'car', x: 400, y: 420, width: 85, height: 42, color: '#222222' },
      { type: 'car', x: 700, y: 435, width: 95, height: 48, color: '#444444' },
      { type: 'car', x: 950, y: 425, width: 80, height: 40, color: '#111111' },
      { type: 'trash', x: 350, y: 475, width: 20, height: 28, color: '#666666' },
      { type: 'bench', x: 600, y: 465, width: 45, height: 22, color: '#555555' },
    ],
    ambientParticles: Array.from({ length: 40 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 600,
      speed: 1 + Math.random() * 2,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      type: 'ember' as const
    }))
  },
  4: { // FOREST
    name: '🌲 Dark Forest',
    skyColor: '#0a1a0a',
    groundColor: '#1a2e1a',
    bgColor1: '#050f05',
    bgColor2: '#0a1a0a',
    objects: [
      { type: 'tree', x: 80, y: 200, width: 60, height: 280, color: '#2d4a1a' },
      { type: 'tree', x: 180, y: 230, width: 50, height: 250, color: '#3d5a2a' },
      { type: 'tree', x: 350, y: 190, width: 70, height: 290, color: '#2d4a1a' },
      { type: 'tree', x: 500, y: 220, width: 55, height: 260, color: '#3d5a2a' },
      { type: 'tree', x: 700, y: 180, width: 65, height: 300, color: '#2d4a1a' },
      { type: 'tree', x: 900, y: 210, width: 58, height: 270, color: '#3d5a2a' },
      { type: 'tree', x: 1050, y: 195, width: 62, height: 285, color: '#2d4a1a' },
      { type: 'bench', x: 280, y: 440, width: 50, height: 25, color: '#4a3728' },
      { type: 'trash', x: 620, y: 455, width: 22, height: 30, color: '#3a3a3a' },
    ],
    ambientParticles: Array.from({ length: 35 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 600,
      speed: 0.2 + Math.random() * 0.4,
      size: 3 + Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.2,
      type: 'dust' as const
    }))
  },
  5: { // DESERT
    name: '🏜️ Scorching Desert',
    skyColor: '#2a1a0a',
    groundColor: '#c2a060',
    bgColor1: '#1a0f05',
    bgColor2: '#2a1a0a',
    objects: [
      { type: 'building', x: 300, y: 280, width: 150, height: 170, color: '#b8956e' },
      { type: 'building', x: 600, y: 300, width: 120, height: 150, color: '#a08050' },
      { type: 'car', x: 200, y: 430, width: 85, height: 42, color: '#c4a060' },
      { type: 'car', x: 800, y: 438, width: 75, height: 38, color: '#b09058' },
      { type: 'bench', x: 450, y: 445, width: 45, height: 22, color: '#8b7355' },
      { type: 'trash', x: 550, y: 455, width: 20, height: 28, color: '#7a7a7a' },
      { type: 'lamp', x: 370, y: 340, width: 18, height: 70, color: '#ffdd88' },
    ],
    ambientParticles: Array.from({ length: 50 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 600,
      speed: 0.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.4,
      type: 'dust' as const
    }))
  }
};

// ==================== WORD LISTS ====================
const WORD_LISTS = {
  easy: ['cat', 'dog', 'run', 'hit', 'kill', 'dead', 'bite', 'fear', 'dark', 'blood', 
         'hunt', 'snap', 'fang', 'claw', 'fur', 'bone', 'shot', 'growl', 'skin', 'rage'],
  medium: ['zombie', 'undead', 'horror', 'death', 'attack', 'monster', 'beast', 'creature',
           'nightmare', 'shadow', 'hunting', 'screaming', 'rotting', 'walking', 'infected',
           'survive', 'weapon', 'danger', 'escape', 'fight'],
  hard: ['apocalypse', 'destruction', 'abomination', 'resurrection', 'annihilation',
          'cataclysm', 'obliteration', 'devastation', 'extermination', 'eradication',
          'infestation', 'putrefaction', 'decimation', 'slaughtering', 'overwhelming'],
  boss: ['TITAN', 'CERBERUS', 'SHADOW', 'QUEEN', 'LEGENDARY', 'INVINCIBLE',
          'DESTRUCTION', 'ANNIHILATION', 'APOCALYPSE', 'IMMORTAL', 'SUPREME']
};

// ==================== ENEMY CONFIGS ====================
const ENEMY_TYPES = {
  zombie: { health: 1, speed: 0.8, size: 55, color: '#4a5d23', wordRange: [3, 5] as [number, number] },
  dog: { health: 1, speed: 1.5, size: 45, color: '#8b4513', wordRange: [3, 4] as [number, number] },
  cat: { health: 1, speed: 1.3, size: 40, color: '#2f2f2f', wordRange: [4, 5] as [number, number] },
  spider: { health: 1, speed: 1.0, size: 50, color: '#1a1a2e', wordRange: [4, 6] as [number, number] },
  boss: { health: 10, speed: 0.5, size: 110, color: '#8b0000', wordRange: [6, 10] as [number, number] }
};

// ==================== LEVEL CONFIGS ====================
const LEVEL_CONFIGS = [
  { level: 1, name: 'Hospital Outbreak', scene: 1, enemies: ['zombie'], count: 8, spawnRate: 2500, bossAt: null },
  { level: 2, name: 'Hospital Boss', scene: 1, enemies: ['zombie'], count: 5, spawnRate: 2200, bossAt: 5 },
  { level: 3, name: 'Mall Invasion', scene: 2, enemies: ['zombie', 'dog'], count: 12, spawnRate: 2000, bossAt: null },
  { level: 4, name: 'Mall Master', scene: 2, enemies: ['zombie', 'dog', 'cat'], count: 10, spawnRate: 1800, bossAt: 8 },
  { level: 5, name: 'Highway Escape', scene: 3, enemies: ['zombie', 'dog', 'cat'], count: 15, spawnRate: 1600, bossAt: null },
  { level: 6, name: 'Road Warrior', scene: 3, enemies: ['dog', 'cat', 'spider'], count: 12, spawnRate: 1400, bossAt: 10 },
  { level: 7, name: 'Forest of Fear', scene: 4, enemies: ['zombie', 'cat', 'spider'], count: 18, spawnRate: 1200, bossAt: null },
  { level: 8, name: 'Dark Lord', scene: 4, enemies: ['zombie', 'dog', 'cat', 'spider'], count: 15, spawnRate: 1100, bossAt: 12 },
  { level: 9, name: 'Desert Storm', scene: 5, enemies: ['dog', 'cat', 'spider'], count: 20, spawnRate: 1000, bossAt: null },
  { level: 10, name: 'FINAL STAND', scene: 5, enemies: ['zombie', 'dog', 'cat', 'spider'], count: 25, spawnRate: 900, bossAt: 15 },
];

// ==================== MAIN COMPONENT ====================
export default function TypingApocalypse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [kills, setKills] = useState(0);
  const [levelKills, setLevelKills] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeEnemyWord, setActiveEnemyWord] = useState('');
  
  // Game state refs (for game loop access)
  const gameStateRef = useRef({
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    lastSpawn: 0,
    totalSpawned: 0,
    kills: 0,
    levelKills: 0,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    level: 1,
    isPaused: false,
    screenShake: 0,
    time: 0
  });
  
  const animFrameRef = useRef<number>();

  // Get random word
  const getRandomWord = useCallback((enemyType: string, isBoss: boolean): string => {
    const config = ENEMY_TYPES[enemyType as keyof typeof ENEMY_TYPES];
    if (!config) return 'ERROR';
    
    let wordList: string[];
    if (isBoss) {
      wordList = WORD_LISTS.boss;
    } else if (config.wordRange[1] >= 7) {
      wordList = [...WORD_LISTS.hard, ...WORD_LISTS.medium];
    } else if (config.wordRange[1] >= 5) {
      wordList = [...WORD_LISTS.medium, ...WORD_LISTS.easy];
    } else {
      wordList = WORD_LISTS.easy;
    }
    
    const filtered = wordList.filter(w => 
      w.length >= config.wordRange[0] && w.length <= config.wordRange[1]
    );
    return filtered[Math.floor(Math.random() * filtered.length)] || 'RUN';
  }, []);

  // Spawn enemy
  const spawnEnemy = useCallback((canvasWidth: number, canvasHeight: number, isBoss: boolean = false): Enemy => {
    const config = LEVEL_CONFIGS[gameStateRef.current.level - 1] || LEVEL_CONFIGS[0];
    const enemyTypeKey = config.enemies[Math.floor(Math.random() * config.enemies.length)];
    const typeConfig = ENEMY_TYPES[enemyTypeKey as keyof typeof ENEMY_TYPES];
    
    return {
      id: `e_${Date.now()}_${Math.random()}`,
      type: isBoss ? 'boss' : enemyTypeKey as Enemy['type'],
      x: canvasWidth + 60,
      y: 80 + Math.random() * (canvasHeight - 200),
      word: getRandomWord(enemyTypeKey, isBoss),
      typed: '',
      health: isBoss ? typeConfig.health * 10 : typeConfig.health,
      maxHealth: isBoss ? typeConfig.health * 10 : typeConfig.health,
      speed: isBoss ? typeConfig.speed * 0.7 : typeConfig.speed * (1 + gameStateRef.current.level * 0.08),
      size: isBoss ? typeConfig.size * 1.5 : typeConfig.size,
      color: isBoss ? '#8b0000' : typeConfig.color,
      isBoss,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.random() * Math.PI * 2
    };
  }, [getRandomWord]);

  // Create death particles
  const createDeathParticles = useCallback((x: number, y: number, enemyType: string, isBoss: boolean): Particle[] => {
    const particles: Particle[] = [];
    const colors = {
      zombie: ['#4a5d23', '#2d3a15', '#8b0000', '#ff0000'],
      dog: ['#8b4513', '#5c2e0d', '#ff4444'],
      cat: ['#2f2f2f', '#1a1a1a', '#ff6666'],
      spider: ['#1a1a2e', '#0f0f1a', '#ffffff'],
      boss: ['#8b0000', '#ff0000', '#ffaa00', '#ffff00']
    };
    
    const particleColors = colors[enemyType as keyof typeof colors] || colors.zombie;
    const count = isBoss ? 40 : 20;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * (isBoss ? 10 : 6);
      particles.push({
        x: x + (Math.random() - 0.5) * (isBoss ? 80 : 40),
        y: y + (Math.random() - 0.5) * (isBoss ? 80 : 40),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.6,
        size: 3 + Math.random() * (isBoss ? 10 : 6),
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        type: Math.random() > 0.5 ? 'blood' : 'spark'
      });
    }
    
    // Add score text particle
    particles.push({
      x, y,
      vx: 0,
      vy: -3,
      life: 1,
      maxLife: 1,
      size: isBoss ? 28 : 20,
      color: isBoss ? '#ffdd00' : '#ffffff',
      type: 'text',
      text: `+${isBoss ? 1000 : 100 * (gameStateRef.current.combo + 1)}`
    });
    
    return particles;
  }, []);

  // Handle input change - THIS IS THE KILL MECHANIC
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toUpperCase();
    setInputText(text);
    
    const state = gameStateRef.current;
    if (state.isPaused || state.enemies.length === 0) {
      // Find first enemy to target
      if (state.enemies.length > 0) {
        setActiveEnemyWord(state.enemies[0].word);
      }
      return;
    }
    
    // Find enemy that matches input (always target first/lowest enemy)
    let targetEnemy: Enemy | null = null;
    let targetIndex = -1;
    
    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      if (enemy.word.toUpperCase().startsWith(text)) {
        targetEnemy = enemy;
        targetIndex = i;
        break;
      }
    }
    
    if (targetEnemy) {
      setActiveEnemyWord(targetEnemy.word);
      
      // Update enemy's typed characters
      targetEnemy.typed = text;
      
      // CHECK FOR KILL - exact match!
      if (text === targetEnemy.word.toUpperCase()) {
        // KILL THE ENEMY!
        const newParticles = createDeathParticles(
          targetEnemy.x, 
          targetEnemy.y, 
          targetEnemy.type,
          targetEnemy.isBoss
        );
        state.particles.push(...newParticles);
        
        // Update score with combo
        const comboBonus = state.combo + 1;
        const baseScore = targetEnemy.isBoss ? 1000 : 100;
        state.score += baseScore * comboBonus;
        state.combo = comboBonus;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;
        state.kills++;
        state.levelKills++;
        
        // Remove enemy
        state.enemies.splice(targetIndex, 1);
        
        // Screen shake
        state.screenShake = targetEnemy.isBoss ? 15 : 5;
        
        // Update React state
        setScore(state.score);
        setCombo(state.combo);
        setMaxCombo(state.maxCombo);
        setKills(state.kills);
        setLevelKills(state.levelKills);
        
        // Clear input
        setInputText('');
        setActiveEnemyWord('');
        if (inputRef.current) inputRef.current.value = '';
        
        // Check for level complete
        const levelConfig = LEVEL_CONFIGS[state.level - 1];
        if (levelConfig && state.levelKills >= levelConfig.count && !levelConfig.bossAt) {
          setShowLevelComplete(true);
          state.isPaused = true;
        }
      }
    } else {
      // No matching enemy - check if we need to retarget
      if (state.enemies.length > 0) {
        setActiveEnemyWord(state.enemies[0].word);
      }
    }
  }, [createDeathParticles]);

  // Draw scene background
  const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, sceneId: number, time: number) => {
    const scene = SCENES[sceneId] || SCENES[1];
    
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGrad.addColorStop(0, scene.bgColor1);
    skyGrad.addColorStop(1, scene.bgColor2);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.6);
    
    // Ground
    ctx.fillStyle = scene.groundColor;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
    
    // Ground line/detail
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width, height * 0.6);
    ctx.stroke();
    
    // Draw scene objects
    scene.objects.forEach(obj => {
      ctx.save();
      
      switch (obj.type) {
        case 'building':
          // Building with windows
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          // Windows (some lit)
          const windowRows = Math.floor(obj.height / 40);
          const windowCols = Math.floor(obj.width / 30);
          for (let r = 0; r < windowRows; r++) {
            for (let c = 0; c < windowCols; c++) {
              if (Math.random() > 0.3) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,150,0.3)' : 'rgba(100,100,120,0.5)';
                ctx.fillRect(obj.x + 10 + c * 28, obj.y + 10 + r * 38, 18, 25);
              }
            }
          }
          break;
          
        case 'tree':
          // Tree trunk
          ctx.fillStyle = '#3d2817';
          ctx.fillRect(obj.x + obj.width * 0.35, obj.y + obj.height * 0.5, obj.width * 0.3, obj.height * 0.5);
          // Foliage (layered circles)
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + obj.height * 0.3, obj.width * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + obj.width * 0.3, obj.y + obj.height * 0.45, obj.width * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + obj.width * 0.7, obj.y + obj.height * 0.42, obj.width * 0.35, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'car':
          // Car body
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.roundRect(obj.x, obj.y, obj.width, obj.height * 0.6, 5);
          ctx.fill();
          // Car top
          ctx.beginPath();
          ctx.roundRect(obj.x + obj.width * 0.15, obj.y - obj.height * 0.3, obj.width * 0.7, obj.height * 0.4, 8);
          ctx.fill();
          // Windows
          ctx.fillStyle = 'rgba(150,180,210,0.6)';
          ctx.fillRect(obj.x + obj.width * 0.2, obj.y - obj.height * 0.25, obj.width * 0.6, obj.height * 0.3);
          // Wheels
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(obj.x + obj.width * 0.2, obj.y + obj.height * 0.55, obj.height * 0.22, 0, Math.PI * 2);
          ctx.arc(obj.x + obj.width * 0.8, obj.y + obj.height * 0.55, obj.height * 0.22, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'bed':
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height * 0.4);
          ctx.fillStyle = '#ffcccc';
          ctx.fillRect(obj.x, obj.y + obj.height * 0.3, obj.width, obj.height * 0.7);
          break;
          
        case 'shelf':
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          // Shelf lines
          ctx.strokeStyle = '#00000033';
          ctx.lineWidth = 1;
          for (let s = 1; s < 3; s++) {
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + (obj.height / 3) * s);
            ctx.lineTo(obj.x + obj.width, obj.y + (obj.height / 3) * s);
            ctx.stroke();
          }
          break;
          
        case 'road_line':
          ctx.fillStyle = obj.color;
          ctx.globalAlpha = 0.7 + Math.sin(time * 0.002 + obj.x) * 0.3;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.globalAlpha = 1;
          break;
          
        case 'hospital_sign':
          // Red cross sign
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.fillStyle = '#ffffff';
          const crossSize = Math.min(obj.width, obj.height) * 0.6;
          const cx = obj.x + obj.width / 2;
          const cy = obj.y + obj.height / 2;
          ctx.fillRect(cx - crossSize / 6, cy - crossSize / 2, crossSize / 3, crossSize);
          ctx.fillRect(cx - crossSize / 2, cy - crossSize / 6, crossSize, crossSize / 3);
          // Glow effect
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 15 + Math.sin(time * 0.005) * 5;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.shadowBlur = 0;
          break;
          
        case 'lamp':
          // Pole
          ctx.fillStyle = '#333333';
          ctx.fillRect(obj.x + obj.width * 0.4, obj.y, obj.width * 0.2, obj.height * 0.7);
          // Light
          ctx.fillStyle = obj.color;
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 20 + Math.sin(time * 0.003 + obj.x) * 10;
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y, obj.width * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
          
        case 'bench':
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height * 0.3); // seat
          ctx.fillRect(obj.x + 2, obj.y - obj.height * 0.3, 4, obj.height * 0.3); // leg1
          ctx.fillRect(obj.x + obj.width - 6, obj.y - obj.height * 0.3, 4, obj.height * 0.3); // leg2
          break;
          
        case 'trash':
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x + obj.width * 0.1, obj.y + obj.height);
          ctx.lineTo(obj.x + obj.width * 0.9, obj.y + obj.height);
          ctx.lineTo(obj.x + obj.width, obj.y);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    });
    
    // Ambient particles
    scene.ambientParticles.forEach(p => {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.type === 'ember' ? '#ff6600' : p.type === 'fog' ? '#888888' : '#aaaaaa';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
  }, []);

  // Draw enemy
  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // Wobble animation
    const wobbleX = Math.sin(time * 0.005 + enemy.wobble) * 3;
    const wobbleY = Math.cos(time * 0.007 + enemy.wobble) * 2;
    ctx.translate(wobbleX, wobbleY);
    
    const s = enemy.size / 55; // scale factor
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.size * 0.5, enemy.size * 0.4, enemy.size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    switch (enemy.type) {
      case 'zombie':
        drawZombie(ctx, s, enemy, time);
        break;
      case 'dog':
        drawDog(ctx, s, enemy, time);
        break;
      case 'cat':
        drawCat(ctx, s, enemy, time);
        break;
      case 'spider':
        drawSpider(ctx, s, enemy, time);
        break;
      case 'boss':
        drawBoss(ctx, s, enemy, time);
        break;
    }
    
    // Word bubble above enemy
    const bubbleY = -enemy.size * 0.7 - 20;
    
    // Bubble background
    const wordWidth = enemy.word.length * 14 + 20;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.roundRect(-wordWidth / 2, bubbleY - 15, wordWidth, 30, 8);
    ctx.fill();
    
    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(-5, bubbleY + 15);
    ctx.lineTo(5, bubbleY + 15);
    ctx.lineTo(0, bubbleY + 22);
    ctx.closePath();
    ctx.fill();
    
    // Word text
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Typed part (green)
    const typedPart = enemy.typed;
    const remainingPart = enemy.word.slice(typedPart.length);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(typedPart, - (remainingPart.length * 7), bubbleY);
    
    // Remaining part (white or red if targeted)
    ctx.fillStyle = enemy.word.toUpperCase().startsWith(inputText.toUpperCase()) ? '#ffffff' : '#ff6666';
    ctx.fillText(remainingPart, (typedPart.length * 7) - (typedPart.length * 7), bubbleY);
    
    // Health bar for bosses
    if (enemy.isBoss || enemy.maxHealth > 1) {
      const barWidth = enemy.size * 1.2;
      const barHeight = 8;
      const barY = enemy.size * 0.6;
      
      ctx.fillStyle = '#333333';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
      
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
    }
    
    ctx.restore();
  }, [inputText]);

  // Individual enemy drawing functions
  const drawZombie = (ctx: CanvasRenderingContext2D, s: number, enemy: Enemy, time: number) => {
    const size = 55 * s;
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#5d7a33';
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (glowing red)
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-size * 0.1, -size * 0.45, size * 0.06, 0, Math.PI * 2);
    ctx.arc(size * 0.1, -size * 0.45, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Mouth (teeth)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, size * 0.12, 0, Math.PI);
    ctx.fill();
    
    // Teeth
    ctx.fillStyle = '#ffffcc';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * size * 0.035 - 1, -size * 0.32, 2, size * 0.06);
    }
    
    // Arms (reaching forward)
    ctx.fillStyle = enemy.color;
    const armWave = Math.sin(time * 0.008) * 0.2;
    ctx.save();
    ctx.rotate(armWave - 0.5);
    ctx.beginPath();
    ctx.ellipse(size * 0.35, -size * 0.1, size * 0.12, size * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.rotate(-armWave + 0.5);
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size * 0.1, size * 0.12, size * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Legs (shuffling)
    const legPhase = Math.sin(time * 0.01) * 0.15;
    ctx.fillStyle = '#2d3a15';
    ctx.beginPath();
    ctx.ellipse(-size * 0.15, size * 0.4, size * 0.1, size * 0.2, legPhase, 0, Math.PI * 2);
    ctx.ellipse(size * 0.15, size * 0.4, size * 0.1, size * 0.2, -legPhase, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawDog = (ctx: CanvasRenderingContext2D, s: number, enemy: Enemy, time: number) => {
    const size = 45 * s;
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.ellipse(size * 0.35, -size * 0.15, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ears
    ctx.fillStyle = '#5c2e0d';
    const earFlap = Math.sin(time * 0.012) * 0.1;
    ctx.beginPath();
    ctx.ellipse(size * 0.28, -size * 0.35, size * 0.08, size * 0.15, earFlap - 0.3, 0, Math.PI * 2);
    ctx.ellipse(size * 0.45, -size * 0.32, size * 0.08, size * 0.15, -earFlap + 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (angry)
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(size * 0.42, -size * 0.18, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Snout
    ctx.fillStyle = '#3d1f0d';
    ctx.beginPath();
    ctx.ellipse(size * 0.52, -size * 0.08, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(size * 0.58, -size * 0.1, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    // Open mouth (showing teeth)
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.arc(size * 0.48, 0, size * 0.08, 0, Math.PI);
    ctx.fill();
    
    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size * 0.42, -size * 0.02, 3, size * 0.05);
    ctx.fillRect(size * 0.5, -size * 0.02, 3, size * 0.05);
    
    // Tail
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailWag = Math.sin(time * 0.015) * 0.3;
    ctx.moveTo(-size * 0.38, -size * 0.05);
    ctx.quadraticCurveTo(-size * 0.55, -size * 0.2 + tailWag * 20, -size * 0.5, -size * 0.3 + tailWag * 30);
    ctx.stroke();
    
    // Legs (running)
    const runPhase = time * 0.02;
    ctx.fillStyle = '#5c2e0d';
    [-1, 1].forEach(side => {
      const legAngle = Math.sin(runPhase + side * Math.PI) * 0.4;
      ctx.save();
      ctx.translate(side * size * 0.25, size * 0.15);
      ctx.rotate(legAngle);
      ctx.beginPath();
      ctx.ellipse(0, size * 0.12, size * 0.06, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawCat = (ctx: CanvasRenderingContext2D, s: number, enemy: Enemy, time: number) => {
    const size = 40 * s;
    
    // Body (sleek)
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(size * 0.3, -size * 0.12, size * 0.18, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pointed ears
    ctx.fillStyle = '#1a1a1a';
    const earTwitch = Math.sin(time * 0.01) * 0.05;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.25);
    ctx.lineTo(size * 0.15, -size * 0.45 + earTwitch * 10);
    ctx.lineTo(size * 0.28, -size * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.38, -size * 0.25);
    ctx.lineTo(size * 0.43, -size * 0.45 - earTwitch * 10);
    ctx.lineTo(size * 0.32, -size * 0.28);
    ctx.closePath();
    ctx.fill();
    
    // Eyes (slit pupils, glowing)
    ctx.fillStyle = '#00ffaa';
    ctx.shadowColor = '#00ffaa';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(size * 0.36, -size * 0.14, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    // Slit pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(size * 0.34, -size * 0.16, 2, size * 0.04);
    ctx.shadowBlur = 0;
    
    // Whiskers
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.moveTo(size * 0.42, -size * 0.1);
      ctx.lineTo(size * 0.55 + side * 5, -size * 0.14 + side * 3);
      ctx.lineTo(size * 0.55 + side * 5, -size * 0.06 + side * 3);
      ctx.stroke();
    });
    
    // Tail (long, swishing)
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailSwish = Math.sin(time * 0.008) * 0.5;
    ctx.moveTo(-size * 0.33, -size * 0.05);
    ctx.quadraticCurveTo(-size * 0.5, tailSwish * 20, -size * 0.45, -size * 0.25 + Math.abs(tailSwish) * 25);
    ctx.stroke();
    
    // Legs (stealthy walk)
    const prowlPhase = time * 0.008;
    ctx.fillStyle = '#2a2a2a';
    [[-0.2, 0], [0.2, 0]].forEach(([x, _]) => {
      const legLift = Math.abs(Math.sin(prowlPhase + x * 5)) * 0.1;
      ctx.beginPath();
      ctx.ellipse(x * size, size * 0.12 + legLift * 10, size * 0.05, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpider = (ctx: CanvasRenderingContext2D, s: number, enemy: Enemy, time: number) => {
    const size = 50 * s;
    
    // Abdomen (large, round back part)
    const abdomenGrad = ctx.createRadialGradient(0, size * 0.1, 0, 0, size * 0.1, size * 0.35);
    abdomenGrad.addColorStop(0, '#2a2a4e');
    abdomenGrad.addColorStop(1, enemy.color);
    ctx.fillStyle = abdomenGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.32, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pattern on abdomen
    ctx.fillStyle = '#3a3a5e';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.lineTo(-size * 0.15, size * 0.1);
    ctx.lineTo(0, size * 0.25);
    ctx.lineTo(size * 0.15, size * 0.1);
    ctx.closePath();
    ctx.fill();
    
    // Thorax (head area)
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.2, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (MULTIPLE - 8 eyes like real spider!)
    const eyePositions = [
      [-0.12, -0.24], [0.12, -0.24],
      [-0.08, -0.28], [0.08, -0.28],
      [-0.16, -0.2], [0.16, -0.2],
      [-0.04, -0.18], [0.04, -0.18]
    ];
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 5;
    eyePositions(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * size, y * size, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    
    // Fangs
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, -size * 0.12);
    ctx.lineTo(-size * 0.07, -size * 0.02);
    ctx.lineTo(-size * 0.02, -size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.05, -size * 0.12);
    ctx.lineTo(size * 0.07, -size * 0.02);
    ctx.lineTo(size * 0.02, -size * 0.12);
    ctx.closePath();
    ctx.fill();
    
    // 8 LEGS!
    ctx.strokeStyle = '#0f0f1a';
    ctx.lineWidth = 3 * s;
    ctx.lineCap = 'round';
    
    const legPhase = time * 0.012;
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1;
      const legIndex = i % 2;
      const baseAngle = (legIndex * 0.4 + 0.2) * side;
      const legMove = Math.sin(legPhase + i * 0.8) * 0.15;
      
      // Upper leg
      ctx.beginPath();
      ctx.moveTo(baseAngle * size * 0.5, size * 0.05);
      const midX = (baseAngle + side * 0.5 + legMove) * size * 0.6;
      const midY = size * 0.25;
      ctx.quadraticCurveTo(midX, midY, (baseAngle + side * 0.8 + legMove * 1.5) * size * 0.7, size * 0.4);
      ctx.stroke();
    }
    
    // Web hint near spider
    if (Math.random() > 0.99) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(Math.random() * size - size/2, Math.random() * size - size/2, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawBoss = (ctx: CanvasRenderingContext2D, s: number, enemy: Enemy, time: number) => {
    const size = 110 * s;
    
    // Aura/pulse effect
    const pulse = Math.sin(time * 0.005) * 0.1 + 1;
    ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(time * 0.008) * 0.2})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    
    // Massive body
    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
    bodyGrad.addColorStop(0, '#8b0000');
    bodyGrad.addColorStop(0.5, '#5c0000');
    bodyGrad.addColorStop(1, '#2a0000');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Armor plates
    ctx.fillStyle = '#3d0000';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const plateY = -size * 0.3 + i * size * 0.15;
      ctx.ellipse(0, plateY, size * 0.3 - i * size * 0.03, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Giant head
    ctx.fillStyle = '#6b0000';
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    
    // Crown/horns
    ctx.fillStyle = '#1a1a1a';
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      ctx.beginPath();
      ctx.moveTo(i * size * 0.1, -size * 0.6);
      ctx.lineTo(i * size * 0.08, -size * 0.78);
      ctx.lineTo(i * size * 0.14, -size * 0.58);
      ctx.closePath();
      ctx.fill();
    }
    
    // Glowing eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.44, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.44, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    
    // Third eye
    ctx.beginPath();
    ctx.arc(0, -size * 0.58, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Massive mouth with multiple rows of teeth
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.22, size * 0.18, size * 0.15, 0, 0, Math.PI);
    ctx.fill();
    
    // Teeth rows
    ctx.fillStyle = '#ffffcc';
    for (let row = 0; row < 2; row++) {
      for (let t = -4; t <= 4; t++) {
        const toothH = size * 0.05 - row * size * 0.01;
        ctx.fillRect(t * size * 0.035 - 2, -size * 0.24 + row * size * 0.04, 4, toothH);
      }
    }
    
    // Multiple arms
    ctx.fillStyle = '#5c0000';
    for (let arm = 0; arm < 4; arm++) {
      const armSide = arm < 2 ? -1 : 1;
      const armY = (arm % 2) * size * 0.2 - size * 0.1;
      const armWave = Math.sin(time * 0.006 + arm) * 0.15;
      
      ctx.save();
      ctx.translate(armSide * size * 0.4, armY);
      ctx.rotate((armWave + 0.5) * armSide);
      ctx.beginPath();
      ctx.ellipse(armSide * size * 0.2, 0, size * 0.1, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Claw
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.moveTo(armSide * size * 0.28, size * 0.3);
      ctx.lineTo(armSide * size * 0.38, size * 0.45);
      ctx.lineTo(armSide * size * 0.22, size * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  // Draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.life / p.maxLife) * Math.PI * 0.5);
      
      switch (p.type) {
        case 'text':
          ctx.font = `bold ${p.size}px "Arial", sans-serif`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.fillText(p.text || '', 0, 0);
          break;
        case 'blood':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'spark':
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.shadowBlur = 0;
          break;
        case 'explosion':
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          grad.addColorStop(0, '#ffff00');
          grad.addColorStop(0.5, '#ff8800');
          grad.addColorStop(1, 'rgba(255,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      ctx.restore();
    });
  }, []);

  // Update particles
  const updateParticles = useCallback((particles: Particle[], dt: number): Particle[] => {
    return particles.filter(p => {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += 0.15; // gravity
      p.life -= dt / p.maxLife;
      return p.life > 0;
    });
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dt = Math.min((timestamp - (gameStateRef.current.lastTime || timestamp)) / 1000, 0.1);
    gameStateRef.current.lastTime = timestamp;
    gameStateRef.current.time = timestamp;
    
    const state = gameStateRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with screen shake
    ctx.save();
    if (state.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * state.screenShake,
        (Math.random() - 0.5) * state.screenShake
      );
      state.screenShake *= 0.9;
      if (state.screenShake < 0.5) state.screenShake = 0;
    }
    
    // Draw scene
    const levelConfig = LEVEL_CONFIGS[state.level - 1] || LEVEL_CONFIGS[0];
    drawScene(ctx, width, height, levelConfig.scene, timestamp);
    
    // Update ambient particles
    const scene = SCENES[levelConfig.scene];
    scene.ambientParticles.forEach(p => {
      p.x -= p.speed;
      if (p.x < -10) p.x = width + 10;
    });
    
    if (!state.isPaused) {
      // Spawn enemies
      const now = Date.now();
      const shouldSpawnBoss = levelConfig.bossAt && state.levelKills >= levelConfig.bossAt - 1 && !state.enemies.some(e => e.isBoss);
      const shouldSpawnRegular = state.totalSpawned < levelConfig.count && now - state.lastSpawn > levelConfig.spawnRate;
      
      if (shouldSpawnBoss) {
        const boss = spawnEnemy(width, height, true);
        state.enemies.push(boss);
        state.lastSpawn = now;
      } else if (shouldSpawnRegular) {
        const enemy = spawnEnemy(width, height, false);
        state.enemies.push(enemy);
        state.totalSpawned++;
        state.lastSpawn = now;
      }
      
      // Update enemies
      state.enemies.forEach(enemy => {
        enemy.x -= enemy.speed * dt * 60;
        enemy.phase += dt * 5;
        
        // Check if enemy reached left side (player position)
        if (enemy.x < 60) {
          enemy.x = -100; // Mark for removal
          state.lives--;
          state.combo = 0;
          setLives(state.lives);
          setCombo(0);
          
          if (state.lives <= 0) {
            state.isPaused = true;
            setGameOver(true);
          }
        }
      });
      
      // Remove dead/off-screen enemies
      state.enemies = state.enemies.filter(e => e.x > -50);
      
      // Update particles
      state.particles = updateParticles(state.particles, dt);
    }
    
    // Draw particles (behind enemies)
    drawParticles(ctx, state.particles);
    
    // Sort enemies by Y position for depth
    state.enemies.sort((a, b) => a.y - b.y);
    
    // Draw enemies
    state.enemies.forEach(enemy => {
      drawEnemy(ctx, enemy, timestamp);
    });
    
    // Draw player/safe zone indicator
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.fillRect(0, 0, 50, height);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Player icon
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(25, height - 60, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(21, height - 64, 3, 0, Math.PI * 2);
    ctx.arc(29, height - 64, 3, 0, Math.PI * 2);
    ctx.shadowBlur = 0;
    
    ctx.restore();
    
    // Continue loop
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [drawScene, drawEnemy, drawParticles, updateParticles, spawnEnemy]);

  // Start game
  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    state.enemies = [];
    state.particles = [];
    state.lastSpawn = 0;
    state.totalSpawned = 0;
    state.kills = 0;
    state.levelKills = 0;
    state.score = 0;
    state.lives = 3;
    state.combo = 0;
    state.maxCombo = 0;
    state.level = 1;
    state.isPaused = false;
    state.screenShake = 0;
    
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setKills(0);
    setLevelKills(0);
    setCurrentLevel(1);
    setGameOver(false);
    setGameWon(false);
    setShowLevelComplete(false);
    setGameStarted(true);
    setInputText('');
    setActiveEnemyWord('');
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Next level
  const nextLevel = useCallback(() => {
    const state = gameStateRef.current;
    const nextLv = state.level + 1;
    
    if (nextLv > LEVEL_CONFIGS.length) {
      // GAME WON!
      setGameWon(true);
      setShowLevelComplete(false);
      setGameStarted(false);
      return;
    }
    
    state.level = nextLv;
    state.enemies = [];
    state.particles = [];
    state.lastSpawn = 0;
    state.totalSpawned = 0;
    state.levelKills = 0;
    state.isPaused = false;
    
    setCurrentLevel(nextLv);
    setLevelKills(0);
    setShowLevelComplete(false);
  }, []);

  // Setup canvas and start loop
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight || 500;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start game loop
    animFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, gameWon, gameLoop]);

  // Focus input on click anywhere
  const handleCanvasClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Get current level info
  const currentLevelConfig = LEVEL_CONFIGS[currentLevel - 1] || LEVEL_CONFIGS[0];
  const currentScene = SCENES[currentLevelConfig.scene];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" onClick={handleCanvasClick}>
      {!gameStarted && (
        /* MAIN MENU */
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-gray-900 via-black to-gray-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-500 mb-2 animate-pulse">
              ⌨️ TYPING APOCALYPSE 💀
            </h1>
            <p className="text-xl text-gray-400 mb-8">Type to Survive</p>
            
            <div className="space-y-4 mb-8">
              <button
                onClick={startGame}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-lg transform hover:scale-105 transition-all shadow-lg shadow-red-500/30"
              >
                🎮 START GAME
              </button>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>🧟 Type words before enemies reach you</p>
                <p>❤️ You have 3 lives - don&apos;t let them through!</p>
                <p>🔥 Build combos for bonus points</p>
                <p>👹 Defeat bosses to advance levels</p>
              </div>
            </div>
            
            {/* Level Preview */}
            <div className="grid grid-cols-5 gap-2 mt-8 max-w-2xl mx-auto px-4">
              {LEVEL_CONFIGS.map((lvl, i) => (
                <div key={lvl.level} className={`p-2 rounded text-xs ${i === 0 ? 'bg-red-900/50 border border-red-500' : 'bg-gray-800'}`}>
                  <div className="font-bold text-white">{lvl.level}</div>
                  <div className="text-gray-400 truncate">{lvl.name}</div>
                  <div className="text-gray-500">{SCENES[lvl.scene]?.name.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLevelComplete && (
        /* LEVEL COMPLETE OVERLAY */
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="bg-gradient-to-b from-green-900 to-green-950 p-8 rounded-xl border-2 border-green-500 text-center shadow-2xl shadow-green-500/20">
            <h2 className="text-4xl font-bold text-green-400 mb-4">
              ✅ LEVEL {currentLevel} COMPLETE!
            </h2>
            <div className="space-y-2 mb-6 text-gray-300">
              <p>Enemies Slain: <span className="text-white font-bold">{levelKills}</span></p>
              <p>Score: <span className="text-yellow-400 font-bold">{score}</span></p>
              <p>Max Combo: <span className="text-orange-400 font-bold">{maxCombo}x</span></p>
            </div>
            <button
              onClick={nextLevel}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transform hover:scale-105 transition-all"
            >
              {currentLevel < LEVEL_CONFIGS.length ? `➡️ Level ${currentLevel + 1}: ${LEVEL_CONFIGS[currentLevel].name}` : '🏆 VIEW RESULTS'}
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        /* GAME OVER SCREEN */
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/90">
          <div className="bg-gradient-to-b from-red-900 to-red-950 p-8 rounded-xl border-2 border-red-500 text-center shadow-2xl shadow-red-500/30">
            <h2 className="text-5xl font-bold text-red-500 mb-4">
              💀 GAME OVER 💀
            </h2>
            <div className="space-y-2 mb-6 text-gray-300">
              <p>You died on <span className="text-white font-bold">Level {currentLevel}</span></p>
              <p>Total Kills: <span className="text-red-400 font-bold">{kills}</span></p>
              <p>Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
              <p>Best Combo: <span className="text-orange-400 font-bold">{maxCombo}x</span></p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transform hover:scale-105 transition-all"
            >
              🔄 TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        /* VICTORY SCREEN */
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/90">
          <div className="bg-gradient-to-b from-yellow-900 via-yellow-800 to-yellow-950 p-8 rounded-xl border-2 border-yellow-500 text-center shadow-2xl shadow-yellow-500/30">
            <h2 className="text-5xl font-bold text-yellow-400 mb-4 animate-pulse">
              🏆 CHAMPION! 🏆
            </h2>
            <p className="text-xl text-yellow-200 mb-4">You survived the apocalypse!</p>
            <div className="space-y-2 mb-6 text-gray-200">
              <p>Total Kills: <span className="text-green-400 font-bold">{kills}</span></p>
              <p>Final Score: <span className="text-yellow-400 font-bold text-2xl">{score}</span></p>
              <p>Best Combo: <span className="text-orange-400 font-bold">{maxCombo}x</span></p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xl font-bold rounded-lg transform hover:scale-105 transition-all"
            >
              🔄 PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* GAME CANVAS */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: gameStarted ? 'block' : 'none' }}
      />

      {/* HUD */}
      {gameStarted && !gameOver && !gameWon && !showLevelComplete && (
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
          {/* Left HUD */}
          <div className="space-y-2">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-gray-400">Scene</div>
              <div className="text-sm font-bold text-white">{currentScene?.name}</div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-gray-400">Level</div>
              <div className="text-lg font-bold text-yellow-400">{currentLevel}: {currentLevelConfig.name}</div>
            </div>
          </div>
          
          {/* Center HUD */}
          <div className="text-center">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
              <div className="text-3xl font-bold text-white">{score.toLocaleString()}</div>
              <div className="text-xs text-gray-400">SCORE</div>
            </div>
            {combo > 1 && (
              <div className="mt-2 text-2xl font-bold text-orange-400 animate-bounce">
                {combo}x COMBO! 🔥
              </div>
            )}
          </div>
          
          {/* Right HUD */}
          <div className="space-y-2 text-right">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <div className="text-red-500 text-xl">
                {'❤️'.repeat(Math.max(0, lives))}{lives < 3 ? '🖤'.repeat(3 - lives) : ''}
              </div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-gray-400">Progress</div>
              <div className="text-sm font-bold text-green-400">
                {levelKills}/{currentLevelConfig.count} slain
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (levelKills / currentLevelConfig.count) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INPUT FIELD (hidden but functional) */}
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-80 px-6 py-3 bg-black/80 border-2 border-green-500 rounded-xl text-green-400 text-center text-xl font-mono outline-none focus:border-green-300 focus:shadow-lg focus:shadow-green-500/20 z-10"
        placeholder="TYPE HERE..."
        autoComplete="off"
        autoCapitalize="characters"
        style={{ display: gameStarted && !showLevelComplete ? 'block' : 'none' }}
      />
      
      {/* Target word indicator */}
      {gameStarted && activeEnemyWord && !showLevelComplete && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10">
          <div className="text-xs text-gray-500 mb-1">Target:</div>
          <div className="text-2xl font-mono font-bold text-yellow-400">
            {activeEnemyWord.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

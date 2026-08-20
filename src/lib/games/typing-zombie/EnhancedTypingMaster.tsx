'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ENEMY_CONFIGS,
  LEVELS,
  EnhancedEnemy,
  Particle,
  GameState,
  Upgrades,
  WordDifficulty,
  EnemyType
} from './enhanced-types';

// ==================== WORD LISTS ====================
const WORDS: WordDifficulty = {
  easy: ['cat', 'dog', 'run', 'jump', 'hit', 'kill', 'shot', 'dead', 'bite', 'fear',
    'dark', 'blood', 'hunt', 'growl', 'snap', 'fang', 'claw', 'fur', 'skin', 'bone'],
  medium: ['zombie', 'undead', 'horror', 'death', 'attack', 'monster', 'beast', 'creature',
    'nightmare', 'shadow', 'hunting', 'screaming', 'rotting', 'walking', 'infected'],
  hard: ['apocalypse', 'destruction', 'abomination', 'resurrection', 'annihilation',
    'cataclysm', 'obliteration', 'devastation', 'extermination', 'eradication'],
  expert: ['incomprehensible', 'indestructible', 'unprecedented', 'extraordinary',
    'sophisticated', 'unbelievable', 'revolutionary', 'contemplation'],
  boss: ['TITAN', 'CERBERUS', 'SHADOW', 'QUEEN', 'LEGENDARY', 'INVINCIBLE',
    'DESTRUCTION', 'ANNIHILATION', 'APOCALYPSE', 'IMMORTAL']
};

// ==================== MAIN COMPONENT ====================
export default function EnhancedTypingMaster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameStats, setGameStats] = useState({ gamesPlayed: 0, totalKills: 0, bestCombo: 0 });

  // Refs for game loop
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysPressedRef = useRef<Set<string>>(new Set());

  // Initialize game state
  const initGame = useCallback((level: number = 1) => {
    const initialState: GameState = {
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isLevelComplete: false,
      score: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      maxLives: 3,
      wave: 1,
      level: level,
      kills: 0,
      totalKills: 0,
      accuracy: { hits: 0, misses: 0 },
      money: 0,
      upgrades: {
        damage: 1,
        fireRate: 1,
        ammo: 10,
        health: 3,
        multiShot: false,
        pierce: false,
        criticalChance: 0.05
      },
      currentInput: '',
      activeEnemies: [],
      particles: [],
      screenShake: 0,
      lastSpawnTime: 0,
      bossActive: false,
      bossHealth: 0,
      bossMaxHealth: 0
    };
    
    setGameState(initialState);
    gameStateRef.current = initialState;
    setShowMenu(false);
    setShowLevelSelect(false);
  }, []);

  // Get random word based on enemy type and length
  const getRandomWord = useCallback((enemyType: EnemyType, minLength: number, maxLength: number): string => {
    const config = ENEMY_CONFIGS[enemyType];
    let wordList: string[];
    
    if (config.isBoss) {
      wordList = WORDS.boss;
    } else if (maxLength >= 8) {
      wordList = [...WORDS.hard, ...WORDS.expert];
    } else if (maxLength >= 5) {
      wordList = [...WORDS.medium, ...WORDS.hard];
    } else {
      wordList = [...WORDS.easy, ...WORDS.medium];
    }
    
    // Filter by length
    const filtered = wordList.filter(w => w.length >= minLength && w.length <= maxLength);
    if (filtered.length === 0) return 'ERROR';
    
    return filtered[Math.floor(Math.random() * filtered.length)];
  }, []);

  // Spawn enemy
  const spawnEnemy = useCallback((state: GameState, canvasWidth: number, canvasHeight: number, isBoss: boolean = false): EnhancedEnemy => {
    const levelConfig = LEVELS[state.level - 1] || LEVELS[0];
    let enemyType: EnemyType;
    
    if (isBoss && levelConfig.boss) {
      enemyType = levelConfig.boss;
    } else {
      const availableEnemies = levelConfig.enemies;
      enemyType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }
    
    const config = ENEMY_CONFIGS[enemyType];
    const word = getRandomWord(enemyType, config.wordLength[0], config.wordLength[1]);
    
    const minY = canvasHeight * 0.2;
    const maxY = canvasHeight * 0.7;
    
    return {
      ...config,
      id: `enemy_${Date.now()}_${Math.random()}`,
      x: canvasWidth + config.size,
      y: minY + Math.random() * (maxY - minY),
      currentWord: word,
      typedChars: 0,
      health: config.health,
      maxHealth: config.health,
      animationFrame: 0,
      animationTimer: 0,
      isHit: false,
      hitTimer: 0,
      spawnTime: Date.now(),
      scale: 0,
      opacity: 0,
      angle: 0,
      wobble: Math.random() * Math.PI * 2,
      legPhase: Math.random() * Math.PI * 2
    };
  }, [getRandomWord]);

  // Create particles on enemy hit/death
  const createParticles = useCallback((
    x: number, y: number, 
    count: number, 
    type: Particle['type'], 
    color: string,
    enemyType: EnemyType
  ): Particle[] => {
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 6;
      
      particles.push({
        id: `particle_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 3 + Math.random() * (type === 'explosion' ? 12 : 6),
        color,
        type,
        gravity: type === 'spark' ? 0.3 : 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      });
    }
    
    // Add special particles based on enemy type
    if (enemyType === 'spider' || enemyType === 'bossSpider') {
      for (let i = 0; i < 5; i++) {
        particles.push({
          id: `web_${Date.now()}_${i}`,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * -2,
          life: 1,
          maxLife: 1 + Math.random() * 0.5,
          size: 8 + Math.random() * 8,
          color: '#ffffff',
          type: 'web',
          gravity: 0.05,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }
    
    if (enemyType === 'dog' || enemyType === 'bossDog') {
      for (let i = 0; i < 4; i++) {
        particles.push({
          id: `fur_${Date.now()}_${i}`,
          x: x + (Math.random() - 0.5) * 25,
          y: y + (Math.random() - 0.5) * 25,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1,
          maxLife: 0.8 + Math.random() * 0.4,
          size: 4 + Math.random() * 6,
          color: '#8b4513',
          type: 'fur',
          gravity: 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    return particles;
  }, []);

  // Draw detailed zombie (inspired by 3D reference image)
  const drawZombie = useCallback((ctx: CanvasRenderingContext2D, enemy: EnhancedEnemy, time: number) => {
    const { x, y, size, scale, opacity, color, secondaryColor, isHit, legPhase } = enemy;
    const s = size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    // Wobble animation
    const wobbleX = Math.sin(time * 0.003 + enemy.wobble) * 3;
    ctx.rotate(Math.sin(time * 0.002) * 0.05);
    
    // Shadow
    ctx.beginPath();
    ctx.ellipse(wobbleX, s * 0.45, s * 0.35, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    
    // === BODY (Tattered clothing effect) ===
    const bodyGrad = ctx.createLinearGradient(-s * 0.25, -s * 0.1, s * 0.25, s * 0.4);
    bodyGrad.addColorStop(0, '#3d4a20');
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, secondaryColor);
    
    // Main torso
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.28, s * 0.15, -s * 0.2, s * 0.35);
    ctx.lineTo(s * 0.18, s * 0.32);
    ctx.quadraticCurveTo(s * 0.26, s * 0.1, s * 0.2, -s * 0.08);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    
    // Tattered edges on clothing
    ctx.strokeStyle = '#1a2d0f';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const tearY = s * 0.15 + (i * s * 0.05);
      const tearX = (i % 2 === 0 ? 1 : -1) * s * 0.2;
      ctx.beginPath();
      ctx.moveTo(tearX, tearY);
      ctx.lineTo(tearX + (Math.random() - 0.5) * s * 0.08, tearY + s * 0.06);
      ctx.stroke();
    }
    
    // Ribs showing through (like reference image!)
    ctx.strokeStyle = '#c4b49a';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const ribY = -s * 0.02 + i * s * 0.07;
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, ribY);
      ctx.quadraticCurveTo(0, ribY - s * 0.02, s * 0.14, ribY);
      ctx.stroke();
    }
    
    // === HEAD (Decayed skull-like) ===
    const headY = -s * 0.28;
    const headGrad = ctx.createRadialGradient(wobbleX * 0.3, headY, s * 0.02, wobbleX, headY, s * 0.18);
    headGrad.addColorStop(0, '#8b9a6b');
    headGrad.addColorStop(0.6, '#5a6b3a');
    headGrad.addColorStop(1, '#3d4a25');
    
    ctx.beginPath();
    ctx.ellipse(wobbleX, headY, s * 0.16, s * 0.19, 0.05, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();
    
    // Decayed skin patches
    ctx.fillStyle = '#4a5a30';
    ctx.beginPath();
    ctx.ellipse(wobbleX - s * 0.05, headY - s * 0.05, s * 0.06, s * 0.04, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Hollow eye sockets
    ctx.fillStyle = '#0a0a05';
    ctx.beginPath();
    ctx.ellipse(wobbleX - s * 0.06, headY - s * 0.04, s * 0.04, s * 0.025, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(wobbleX + s * 0.06, headY - s * 0.04, s * 0.04, s * 0.025, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Glowing eyes (evil red)
    ctx.fillStyle = isHit ? '#ff0000' : '#cc0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(wobbleX - s * 0.06, headY - s * 0.04, s * 0.02, s * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(wobbleX + s * 0.06, headY - s * 0.04, s * 0.02, s * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Nose hole
    ctx.fillStyle = '#1a1a0a';
    ctx.beginPath();
    ctx.moveTo(wobbleX, headY + s * 0.01);
    ctx.lineTo(wobbleX - s * 0.025, headY + s * 0.06);
    ctx.lineTo(wobbleX + s * 0.025, headY + s * 0.06);
    ctx.closePath();
    ctx.fill();
    
    // Open mouth with teeth
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(wobbleX, headY + s * 0.11, s * 0.05, s * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth
    ctx.fillStyle = '#d4c4a4';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(wobbleX + i * s * 0.015 - 1, headY + s * 0.085, 2, s * 0.025);
    }
    
    // === ARMS (Reaching forward like reference!) ===
    const armAngle = Math.sin(time * 0.004 + enemy.wobble) * 0.2;
    
    // Left arm
    ctx.save();
    ctx.translate(-s * 0.22, -s * 0.02);
    ctx.rotate(-0.3 + armAngle);
    const armGrad = ctx.createLinearGradient(0, 0, -s * 0.28, s * 0.08);
    armGrad.addColorStop(0, '#5a6b3a');
    armGrad.addColorStop(1, '#3d4a25');
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.roundRect(0, -s * 0.04, s * 0.3, s * 0.08, s * 0.03);
    ctx.fill();
    // Hand
    ctx.beginPath();
    ctx.ellipse(-s * 0.29, 0, s * 0.045, s * 0.035, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Right arm
    ctx.save();
    ctx.translate(s * 0.22, -s * 0.02);
    ctx.rotate(0.3 - armAngle);
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.roundRect(-s * 0.3, -s * 0.04, s * 0.3, s * 0.08, s * 0.03);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.29, 0, s * 0.045, s * 0.035, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // === LEGS (Walking animation) ===
    const legSwing = Math.sin(legPhase) * 0.25;
    
    // Left leg
    ctx.save();
    ctx.translate(-s * 0.08, s * 0.33);
    ctx.rotate(legSwing);
    ctx.fillStyle = '#2d3a18';
    ctx.beginPath();
    ctx.roundRect(-s * 0.06, 0, s * 0.12, s * 0.22, s * 0.03);
    ctx.fill();
    // Foot
    ctx.beginPath();
    ctx.ellipse(0, s * 0.23, s * 0.06, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Right leg
    ctx.save();
    ctx.translate(s * 0.08, s * 0.33);
    ctx.rotate(-legSwing);
    ctx.fillStyle = '#2d3a18';
    ctx.beginPath();
    ctx.roundRect(-s * 0.06, 0, s * 0.12, s * 0.22, s * 0.03);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, s * 0.23, s * 0.06, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Hit flash
    if (isHit) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(wobbleX, 0, s * 0.4, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Draw dog/hellhound
  const drawDog = useCallback((ctx: CanvasRenderingContext2D, enemy: EnhancedEnemy, time: number) => {
    const { x, y, size, scale, opacity, color, secondaryColor, isHit, legPhase } = enemy;
    const s = size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    const wobbleY = Math.sin(time * 0.005 + enemy.wobble) * 2;
    
    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, s * 0.4, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    
    // Body
    const bodyGrad = ctx.createRadialGradient(0, wobbleY, 0, 0, wobbleY, s * 0.28);
    bodyGrad.addColorStop(0, '#a0522d');
    bodyGrad.addColorStop(0.7, color);
    bodyGrad.addColorStop(1, secondaryColor);
    
    ctx.beginPath();
    ctx.ellipse(0, wobbleY + s * 0.15, s * 0.22, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    
    // Fur texture
    ctx.strokeStyle = '#3d2008';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const furAngle = (i / 8) * Math.PI * 2;
      const fx = Math.cos(furAngle) * s * 0.18;
      const fy = wobbleY + s * 0.15 + Math.sin(furAngle) * s * 0.12;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + (Math.random() - 0.5) * s * 0.06, fy + s * 0.04);
      ctx.stroke();
    }
    
    // Head
    const headX = s * 0.18;
    const headY = wobbleY;
    const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, s * 0.15);
    headGrad.addColorStop(0, '#cd853f');
    headGrad.addColorStop(1, color);
    
    ctx.beginPath();
    ctx.ellipse(headX, headY, s * 0.14, s * 0.12, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();
    
    // Ears (pointed, alert)
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.moveTo(headX - s * 0.05, headY - s * 0.09);
    ctx.lineTo(headX - s * 0.12, headY - s * 0.2);
    ctx.lineTo(headX + s * 0.01, headY - s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.06, headY - s * 0.08);
    ctx.lineTo(headX + s * 0.1, headY - s * 0.19);
    ctx.lineTo(headX + s * 0.13, headY - s * 0.06);
    ctx.closePath();
    ctx.fill();
    
    // Snout
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.12, headY + s * 0.03, s * 0.08, s * 0.05, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.17, headY + s * 0.01, s * 0.025, s * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (angry, glowing)
    ctx.fillStyle = isHit ? '#ffff00' : '#ff3300';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.06, headY - s * 0.02, s * 0.025, s * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Open mouth (growling)
    ctx.fillStyle = '#2a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.1, headY + s * 0.08, s * 0.05, s * 0.035, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth/Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.06, headY + s * 0.06);
    ctx.lineTo(headX + s * 0.07, headY + s * 0.1);
    ctx.lineTo(headX + s * 0.08, headY + s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.12, headY + s * 0.06);
    ctx.lineTo(headX + s * 0.13, headY + s * 0.1);
    ctx.lineTo(headX + s * 0.14, headY + s * 0.06);
    ctx.closePath();
    ctx.fill();
    
    // Tail
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, wobbleY + s * 0.1);
    const tailWag = Math.sin(time * 0.01) * 0.3;
    ctx.quadraticCurveTo(-s * 0.35, wobbleY + tailWag * s * 0.1, -s * 0.38, wobbleY - s * 0.1 + tailWag * s * 0.15);
    ctx.stroke();
    
    // Legs (running pose)
    const runCycle = legPhase;
    
    // Front legs
    [-1, 1].forEach((side, i) => {
      ctx.save();
      ctx.translate(side * s * 0.1, s * 0.28);
      ctx.rotate(Math.sin(runCycle + i * Math.PI) * 0.4);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-s * 0.04, 0, s * 0.08, s * 0.15, s * 0.02);
      ctx.fill();
      // Paw
      ctx.beginPath();
      ctx.ellipse(0, s * 0.15, s * 0.04, s * 0.02, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Back legs
    [-1, 1].forEach((side, i) => {
      ctx.save();
      ctx.translate(side * s * 0.12, s * 0.25);
      ctx.rotate(Math.sin(runCycle + i * Math.PI + Math.PI) * 0.35);
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.roundRect(-s * 0.04, 0, s * 0.08, s * 0.14, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, s * 0.14, s * 0.04, s * 0.02, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    if (isHit) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, wobbleY, s * 0.4, s * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Draw cat/shadow cat
  const drawCat = useCallback((ctx: CanvasRenderingContext2D, enemy: EnhancedEnemy, time: number) => {
    const { x, y, size, scale, opacity, color, secondaryColor, isHit, legPhase } = enemy;
    const s = size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    const floatY = Math.sin(time * 0.004 + enemy.wobble) * 3;
    const stealthPulse = 0.85 + Math.sin(time * 0.003) * 0.1;
    
    // Shadow (smaller because floating/stealthy)
    ctx.globalAlpha = opacity * 0.3 * stealthPulse;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.42, s * 0.2, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.globalAlpha = opacity * stealthPulse;
    
    // Body (sleek, cat-like)
    const bodyGrad = ctx.createLinearGradient(0, floatY - s * 0.15, 0, floatY + s * 0.2);
    bodyGrad.addColorStop(0, '#3a3a3a');
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, secondaryColor);
    
    ctx.beginPath();
    ctx.ellipse(0, floatY + s * 0.1, s * 0.16, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    
    // Tail (long, swishing)
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.035;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, floatY + s * 0.08);
    const tailSwish = Math.sin(time * 0.006) * 0.4;
    ctx.quadraticCurveTo(
      -s * 0.32, floatY + tailSwish * s * 0.15,
      -s * 0.35, floatY - s * 0.15 + tailSwish * s * 0.1
    );
    ctx.stroke();
    
    // Head
    const headX = s * 0.12;
    const headY = floatY - s * 0.02;
    
    ctx.beginPath();
    ctx.ellipse(headX, headY, s * 0.12, s * 0.1, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();
    
    // Cat ears (triangular, pointed)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(headX - s * 0.06, headY - s * 0.07);
    ctx.lineTo(headX - s * 0.1, headY - s * 0.18);
    ctx.lineTo(headX - s * 0.01, headY - s * 0.09);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.04, headY - s * 0.07);
    ctx.lineTo(headX + s * 0.08, headY - s * 0.18);
    ctx.lineTo(headX + s * 0.12, headY - s * 0.08);
    ctx.closePath();
    ctx.fill();
    
    // Inner ear
    ctx.fillStyle = '#4a3a3a';
    ctx.beginPath();
    ctx.moveTo(headX - s * 0.06, headY - s * 0.08);
    ctx.lineTo(headX - s * 0.09, headY - s * 0.15);
    ctx.lineTo(headX - s * 0.02, headY - s * 0.09);
    ctx.closePath();
    ctx.fill();
    
    // Eyes (slit pupils, glowing)
    ctx.fillStyle = isHit ? '#00ffff' : '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    
    // Eye whites
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.04, headY - s * 0.01, s * 0.035, s * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Slit pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.04, headY - s * 0.018);
    ctx.lineTo(headX + s * 0.055, headY - s * 0.01);
    ctx.lineTo(headX + s * 0.04, headY - s * 0.002);
    ctx.lineTo(headX + s * 0.025, headY - s * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Nose
    ctx.fillStyle = '#ff6699';
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.1, headY + s * 0.02);
    ctx.lineTo(headX + s * 0.13, headY + s * 0.04);
    ctx.lineTo(headX + s * 0.1, headY + s * 0.06);
    ctx.closePath();
    ctx.fill();
    
    // Whiskers
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 0.5;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(headX + s * 0.1, headY + s * 0.04);
      ctx.lineTo(headX + s * 0.1 + i * s * 0.1, headY + s * 0.02 + i * s * 0.02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + s * 0.1, headY + s * 0.05);
      ctx.lineTo(headX + s * 0.1 + i * s * 0.08, headY + s * 0.06 + i * s * 0.02);
      ctx.stroke();
    }
    
    // Legs (stealthy crouch-walk)
    const prowlCycle = legPhase * 0.7;
    
    [[-0.08, 0.18], [0.08, 0.18], [-0.1, 0.15], [0.1, 0.15]].forEach(([lx, ly], i) => {
      ctx.save();
      ctx.translate(lx * s, ly * s + floatY * 0.5);
      ctx.rotate(Math.sin(prowlCycle + i * Math.PI * 0.7) * 0.2);
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.roundRect(-s * 0.025, 0, s * 0.05, s * 0.1, s * 0.015);
      ctx.fill();
      ctx.restore();
    });
    
    // Stealth aura
    ctx.strokeStyle = `rgba(100, 255, 150, ${0.2 * (1 - stealthPulse)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, floatY + s * 0.1, s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    if (isHit) {
      ctx.fillStyle = 'rgba(0, 255, 200, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, floatY, s * 0.35, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Draw spider
  const drawSpider = useCallback((ctx: CanvasRenderingContext2D, enemy: EnhancedEnemy, time: number) => {
    const { x, y, size, scale, opacity, color, secondaryColor, isHit, legPhase } = enemy;
    const s = size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    const crawlBob = Math.abs(Math.sin(time * 0.006)) * s * 0.03;
    
    // Shadow (spider-shaped, multiple legs)
    ctx.beginPath();
    ctx.ellipse(0, s * 0.35, s * 0.35, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    // Abdomen (big round back part)
    const abdomenGrad = ctx.createRadialGradient(0, s * 0.12 + crawlBob, 0, 0, s * 0.15 + crawlBob, s * 0.2);
    abdomenGrad.addColorStop(0, '#2a2a4a');
    abdomenGrad.addColorStop(0.7, color);
    abdomenGrad.addColorStop(1, secondaryColor);
    
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12 + crawlBob, s * 0.18, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = abdomenGrad;
    ctx.fill();
    
    // Pattern on abdomen (like real spiders!)
    ctx.strokeStyle = '#3a3a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, crawlBob);
    ctx.lineTo(0, s * 0.24 + crawlBob);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, s * 0.14 + crawlBob, s * 0.06, 0, Math.PI * 2);
    ctx.stroke();
    
    // Thorax (head part)
    const thoraxGrad = ctx.createRadialGradient(0, -s * 0.05 + crawlBob, 0, 0, -s * 0.05 + crawlBob, s * 0.12);
    thoraxGrad.addColorStop(0, '#3a3a5a');
    thoraxGrad.addColorStop(1, color);
    
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.05 + crawlBob, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = thoraxGrad;
    ctx.fill();
    
    // Eyes (MULTIPLE eyes like real spiders! 8 eyes)
    const eyePositions = [
      { x: -s * 0.04, y: -s * 0.08, size: 0.018 },
      { x: s * 0.04, y: -s * 0.08, size: 0.018 },
      { x: -s * 0.06, y: -s * 0.04, size: 0.012 },
      { x: s * 0.06, y: -s * 0.04, size: 0.012 },
      { x: -s * 0.03, y: -s * 0.02, size: 0.01 },
      { x: s * 0.03, y: -s * 0.02, size: 0.01 },
      { x: 0, y: -s * 0.1, size: 0.015 },
      { x: 0, y: -s * 0.05, size: 0.008 }
    ];
    
    eyePositions.forEach((eye, i) => {
      const glow = isHit ? '#ff00ff' : (i < 2 ? '#ff0000' : '#ff6600');
      ctx.fillStyle = glow;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y + crawlBob, eye.size * s, eye.size * s * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    
    // Fangs/Chelicerae
    ctx.fillStyle = '#4a2020';
    ctx.beginPath();
    ctx.moveTo(-s * 0.03, -s * 0.01 + crawlBob);
    ctx.lineTo(-s * 0.04, s * 0.05 + crawlBob);
    ctx.lineTo(-s * 0.01, s * 0.01 + crawlBob);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.03, -s * 0.01 + crawlBob);
    ctx.lineTo(s * 0.04, s * 0.05 + crawlBob);
    ctx.lineTo(s * 0.01, s * 0.01 + crawlBob);
    ctx.closePath();
    ctx.fill();
    
    // Fang tips (venom drip)
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(-s * 0.04, s * 0.055 + crawlBob, s * 0.008, 0, Math.PI * 2);
    ctx.arc(s * 0.04, s * 0.055 + crawlBob, s * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // LEGS (8 legs, articulated!)
    const legAngles = [-0.8, -0.5, 0.2, 0.5, Math.PI - 0.5, Math.PI - 0.2, Math.PI + 0.5, Math.PI + 0.8];
    const legLengths = [s * 0.28, s * 0.32, s * 0.32, s * 0.28, s * 0.28, s * 0.32, s * 0.32, s * 0.28];
    
    legAngles.forEach((baseAngle, i) => {
      const side = i < 4 ? -1 : 1;
      const legWave = Math.sin(legPhase + i * 0.4) * 0.15;
      
      ctx.save();
      ctx.rotate(baseAngle + legWave);
      ctx.translate(0, side * s * 0.08);
      
      // Upper leg segment
      ctx.strokeStyle = color;
      ctx.lineWidth = s * 0.025;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      const midX = Math.cos(legWave * 2) * legLengths[i] * 0.5;
      const midY = side * legLengths[i] * 0.4;
      ctx.lineTo(midX, midY);
      
      // Lower leg segment
      const endX = midX + Math.cos(legWave * 3) * legLengths[i] * 0.5;
      const endY = midY + side * legLengths[i] * 0.45;
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Leg joints (little circles)
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(midX, midY, s * 0.015, 0, Math.PI * 2);
      ctx.fill();
      
      // Feet (little hooks)
      ctx.beginPath();
      ctx.arc(endX, endY + side * s * 0.02, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Silk thread (sometimes dangling)
    if (Math.random() > 0.995) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.27 + crawlBob);
      ctx.quadraticCurveTo(
        s * 0.05, s * 0.4,
        s * 0.02, s * 0.5 + Math.random() * s * 0.1
      );
      ctx.stroke();
    }
    
    if (isHit) {
      ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, crawlBob, s * 0.4, s * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Draw BOSS versions (larger, more detailed, with auras)
  const drawBoss = useCallback((
    ctx: CanvasRenderingContext2D, 
    enemy: EnhancedEnemy, 
    time: number,
    healthPercent: number
  ) => {
    const { type } = enemy;
    
    // Boss aura/pulse
    const pulseSize = 1 + Math.sin(time * 0.005) * 0.05;
    const auraColor = type.includes('Zombie') ? 'rgba(100, 50, 20,' :
                      type.includes('Dog') ? 'rgba(139, 69, 19,' :
                      type.includes('Cat') ? 'rgba(50, 50, 80,' :
                      'rgba(80, 0, 80,';
    
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(pulseSize, pulseSize);
    
    // Outer aura
    const auraGrad = ctx.createRadialGradient(0, 0, enemy.size * 0.3, 0, 0, enemy.size * 0.8);
    auraGrad.addColorStop(0, `${auraColor} 0)`);
    auraGrad.addColorStop(1, `${auraColor} 0)`);
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Draw base creature at larger scale
    switch (type) {
      case 'bossZombie':
        drawZombie(ctx, { ...enemy, size: enemy.size * 1.3 }, time);
        break;
      case 'bossDog':
        drawDog(ctx, { ...enemy, size: enemy.size * 1.25 }, time);
        break;
      case 'bossCat':
        drawCat(ctx, { ...enemy, size: enemy.size * 1.2 }, time);
        break;
      case 'bossSpider':
        drawSpider(ctx, { ...enemy, size: enemy.size * 1.35 }, time);
        break;
      case 'special':
        drawSpecialBoss(ctx, enemy, time);
        break;
    }
    
    // Health bar for bosses
    if (enemy.isBoss) {
      const barWidth = enemy.size * 1.5;
      const barHeight = 8;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - enemy.size * 0.7;
      
      // Background
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Health
      const healthColor = healthPercent > 0.5 ? '#00ff00' :
                          healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillStyle = healthColor;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      
      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Boss name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name.toUpperCase(), enemy.x, barY - 8);
    }
  }, [drawZombie, drawDog, drawCat, drawSpider]);

  // Special legendary boss
  const drawSpecialBoss = useCallback((ctx: CanvasRenderingContext2D, enemy: EnhancedEnemy, time: number) => {
    const { x, y, size, scale, opacity, isHit } = enemy;
    const s = size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    const morphPhase = time * 0.002;
    
    // Shifting aura (changes colors)
    const hue1 = (time * 0.05) % 360;
    const hue2 = (hue1 + 60) % 360;
    
    const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.7);
    auraGrad.addColorStop(0, `hsla(${hue1}, 100%, 50%, 0.3)`);
    auraGrad.addColorStop(0.5, `hsla(${hue2}, 100%, 40%, 0.2)`);
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Morphing body (shifts between all types)
    const morphFactor = (Math.sin(morphPhase) + 1) / 2;
    
    // Base shadow form
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wobble = Math.sin(angle * 3 + morphPhase * 3) * s * 0.1;
      const r = s * 0.35 + wobble;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.4);
    bodyGrad.addColorStop(0, `hsla(${hue1}, 80%, 60%, 0.8)`);
    bodyGrad.addColorStop(1, `hsla(${hue2}, 80%, 30%, 0.8)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    
    // Multiple glowing eyes
    const eyeCount = 6;
    for (let i = 0; i < eyeCount; i++) {
      const eyeAngle = (i / eyeCount) * Math.PI * 2 + morphPhase;
      const eyeDist = s * 0.15;
      const ex = Math.cos(eyeAngle) * eyeDist;
      const ey = Math.sin(eyeAngle) * eyeDist;
      
      ctx.fillStyle = `hsla(${(hue1 + i * 60) % 360}, 100%, 70%, 1)`;
      ctx.shadowColor = `hsla(${(hue1 + i * 60) % 360}, 100%, 50%, 1)`;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ex, ey, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Central eye
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Tentacles/reaching arms
    ctx.strokeStyle = `hsla(${hue1}, 70%, 50%, 0.7)`;
    ctx.lineWidth = s * 0.03;
    for (let i = 0; i < 6; i++) {
      const tentacleAngle = (i / 6) * Math.PI * 2 + morphPhase * 0.5;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(tentacleAngle) * s * 0.3,
        Math.sin(tentacleAngle) * s * 0.3
      );
      
      const cp1x = Math.cos(tentacleAngle + 0.3) * s * 0.5 + Math.sin(morphPhase + i) * s * 0.1;
      const cp1y = Math.sin(tentacleAngle + 0.3) * s * 0.5 + Math.cos(morphPhase + i) * s * 0.1;
      const endX = Math.cos(tentacleAngle + 0.5) * s * 0.55;
      const endY = Math.sin(tentacleAngle + 0.5) * s * 0.55;
      
      ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
      ctx.stroke();
    }
    
    if (isHit) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Draw particle effects
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[], deltaTime: number) => {
    particles.forEach(particle => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.life / particle.maxLife;
      
      switch (particle.type) {
        case 'blood':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * (2 - particle.life / particle.maxLife), 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'spark':
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          ctx.shadowBlur = 0;
          break;
          
        case 'bone':
          ctx.fillStyle = '#e4d4b4';
          ctx.beginPath();
          ctx.roundRect(-particle.size, -particle.size / 3, particle.size * 2, particle.size * 0.66, particle.size / 4);
          ctx.fill();
          break;
          
        case 'fur':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'web':
          ctx.strokeStyle = `rgba(255, 255, 255, ${particle.life / particle.maxLife})`;
          ctx.lineWidth = 1;
          // Draw web strand
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-particle.size + i * particle.size, -particle.size);
            ctx.lineTo(i * particle.size, particle.size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-particle.size, -particle.size + i * particle.size);
            ctx.lineTo(particle.size, i * particle.size);
            ctx.stroke();
          }
          break;
          
        case 'soul':
          ctx.fillStyle = `rgba(200, 200, 255, ${particle.life / particle.maxLife})`;
          ctx.shadowColor = '#aaaaff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, -particle.size);
          ctx.quadraticCurveTo(particle.size, -particle.size * 0.5, particle.size, 0);
          ctx.quadraticCurveTo(particle.size, particle.size * 0.5, 0, particle.size);
          ctx.quadraticCurveTo(-particle.size, particle.size * 0.5, -particle.size, 0);
          ctx.quadraticCurveTo(-particle.size, -particle.size * 0.5, 0, -particle.size);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
          
        case 'explosion':
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, particle.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'text':
          ctx.fillStyle = particle.color;
          ctx.font = `bold ${particle.size * 4}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(particle.text || '', 0, 0);
          break;
      }
      
      ctx.restore();
    });
  }, []);

  // Draw background based on level theme
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, level: number, time: number) => {
    const config = LEVELS[level - 1] || LEVELS[0];
    
    switch (config.backgroundTheme) {
      case 'graveyard': {
        // Dark graveyard with fog
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(0.5, '#16213e');
        grad.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Fog layers
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = `rgba(100, 100, 120, ${0.05 - i * 0.015})`;
          const fogY = height * (0.6 + i * 0.15);
          ctx.beginPath();
          ctx.moveTo(0, fogY);
          for (let x = 0; x <= width; x += 50) {
            ctx.lineTo(x, fogY + Math.sin(x * 0.01 + time * 0.001 + i) * 20);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fill();
        }
        
        // Tombstones in background
        ctx.fillStyle = '#2a2a3a';
        for (let i = 0; i < 5; i++) {
          const tx = width * (0.1 + i * 0.2);
          const th = 30 + Math.random() * 40;
          ctx.beginPath();
          ctx.roundRect(tx - 15, height * 0.65 - th, 30, th, 15, 15, 0, 0);
          ctx.fill();
        }
        break;
      }
      
      case 'darkForest': {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0a1a0a');
        grad.addColorStop(1, '#051005');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Trees silhouettes
        ctx.fillStyle = '#050a05';
        for (let i = 0; i < 8; i++) {
          const tx = width * (i / 8);
          const th = height * (0.3 + Math.random() * 0.3);
          ctx.beginPath();
          ctx.moveTo(tx - 30, height);
          ctx.lineTo(tx, height - th);
          ctx.lineTo(tx + 30, height);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      
      case 'hell': {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1a0a0a');
        grad.addColorStop(0.7, '#3a1010');
        grad.addColorStop(1, '#5a1515');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Lava glow at bottom
        const lavaGrad = ctx.createLinearGradient(0, height * 0.8, 0, height);
        lavaGrad.addColorStop(0, 'transparent');
        lavaGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
        lavaGrad.addColorStop(1, 'rgba(255, 50, 0, 0.5)');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(0, height * 0.8, width, height * 0.2);
        
        // Embers rising
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 20; i++) {
          const ex = (i / 20) * width + Math.sin(time * 0.002 + i) * 30;
          const ey = height - ((time * 0.05 + i * 50) % (height * 0.8));
          const es = 2 + Math.random() * 3;
          ctx.globalAlpha = 1 - ey / height;
          ctx.beginPath();
          ctx.arc(ex, ey, es, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      }
      
      case 'midnight':
      case 'void': {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
        grad.addColorStop(0, config.backgroundTheme === 'void' ? '#1a0a2e' : '#0a0a1a');
        grad.addColorStop(1, '#000005');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
          const sx = (i * 137) % width;
          const sy = (i * 97) % (height * 0.6);
          const twinkle = Math.sin(time * 0.003 + i) * 0.5 + 0.5;
          ctx.globalAlpha = twinkle * 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      }
      
      default: {
        // Urban/alley/cave/apocalypse - dark grays
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1a1a1a');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current || !gameStateRef.current?.isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    const state = { ...gameStateRef.current };
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear and apply screen shake
    ctx.save();
    if (state.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * state.screenShake,
        (Math.random() - 0.5) * state.screenShake
      );
      state.screenShake *= 0.9;
      if (state.screenShake < 0.5) state.screenShake = 0;
    }
    
    // Draw background
    drawBackground(ctx, width, height, state.level, timestamp);
    
    // Update and spawn enemies
    const levelConfig = LEVELS[state.level - 1] || LEVELS[0];
    const now = Date.now();
    
    // Check if should spawn boss or regular enemies
    const killsForBoss = levelConfig.enemyCount;
    const shouldSpawnBoss = !state.bossActive && state.kills >= killsForBoss && levelConfig.boss;
    
    if (shouldSpawnBoss) {
      const boss = spawnEnemy(state, width, height, true);
      state.activeEnemies.push(boss);
      state.bossActive = true;
      state.bossHealth = boss.maxHealth;
      state.bossMaxHealth = boss.maxHealth;
      state.lastSpawnTime = now;
    } else if (now - state.lastSpawnTime > levelConfig.spawnRate && 
               state.activeEnemies.length < 5 + state.level &&
               !state.bossActive) {
      state.activeEnemies.push(spawnEnemy(state, width, height));
      state.lastSpawnTime = now;
    }
    
    // Update and draw enemies
    state.activeEnemies = state.activeEnemies.filter(enemy => {
      // Spawn animation
      if (enemy.scale < 1) {
        enemy.scale += deltaTime * 0.003;
        if (enemy.scale > 1) enemy.scale = 1;
      }
      if (enemy.opacity < 1) {
        enemy.opacity += deltaTime * 0.004;
        if (enemy.opacity > 1) enemy.opacity = 1;
      }
      
      // Animation updates
      enemy.animationTimer += deltaTime;
      if (enemy.animationTimer > 150) {
        enemy.animationFrame = (enemy.animationFrame + 1) % 4;
        enemy.animationTimer = 0;
      }
      
      // Movement
      const speed = enemy.speed * (60 + state.level * 5) * deltaTime * 0.0001;
      enemy.x -= speed;
      enemy.legPhase += speed * 0.15;
      
      // Hit timer
      if (enemy.isHit) {
        enemy.hitTimer -= deltaTime;
        if (enemy.hitTimer <= 0) {
          enemy.isHit = false;
        }
      }
      
      // Draw enemy based on type
      const healthPercent = enemy.health / enemy.maxHealth;
      
      if (enemy.isBoss) {
        drawBoss(ctx, enemy, timestamp, healthPercent);
      } else {
        switch (enemy.type) {
          case 'zombie':
          case 'bossZombie':
            drawZombie(ctx, enemy, timestamp);
            break;
          case 'dog':
          case 'bossDog':
            drawDog(ctx, enemy, timestamp);
            break;
          case 'cat':
          case 'bossCat':
            drawCat(ctx, enemy, timestamp);
            break;
          case 'spider':
          case 'bossSpider':
            drawSpider(ctx, enemy, timestamp);
            break;
          default:
            drawZombie(ctx, enemy, timestamp);
        }
      }
      
      // Draw word above enemy
      const wordY = enemy.y - enemy.size * enemy.scale * 0.5 - 15;
      ctx.font = `${enemy.isBoss ? 'bold 18px' : '16px'} monospace`;
      ctx.textAlign = 'center';
      
      // Word background
      const wordMetrics = ctx.measureText(enemy.currentWord);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        enemy.x - wordMetrics.width / 2 - 4,
        wordY - 14,
        wordMetrics.width + 8,
        20
      );
      
      // Typed portion (green)
      const typedPart = enemy.currentWord.substring(0, enemy.typedChars);
      const untypedPart = enemy.currentWord.substring(enemy.typedChars);
      
      ctx.fillStyle = '#00ff00';
      ctx.fillText(typedPart, enemy.x, wordY);
      
      // Untyped portion (white)
      ctx.fillStyle = '#ffffff';
      const typedWidth = ctx.measureText(typedPart).width;
      ctx.fillText(untypedPart, enemy.x + typedWidth - wordMetrics.width / 2, wordY);
      
      // Cursor blink on next character
      if (Math.floor(timestamp / 500) % 2 === 0 && enemy.typedChars < enemy.currentWord.length) {
        ctx.fillStyle = '#ffff00';
        const cursorX = enemy.x + typedWidth - wordMetrics.width / 2;
        ctx.fillRect(cursorX, wordY - 12, 2, 16);
      }
      
      // Check if enemy reached left side
      if (enemy.x < -enemy.size) {
        state.lives--;
        state.combo = 0;
        state.accuracy.misses++;
        state.screenShake = 15;
        
        // Death particles
        state.particles.push(...createParticles(50, height - 50, 20, 'blood', '#ff0000', enemy.type));
        
        return false; // Remove enemy
      }
      
      return true; // Keep enemy
    });
    
    // Update and draw particles
    state.particles = state.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.life -= deltaTime / 1000 / particle.maxLife;
      particle.rotation += particle.rotationSpeed;
      
      if (particle.life > 0) {
        return true;
      }
      return false;
    });
    
    drawParticles(ctx, state.particles, deltaTime);
    
    // Draw player/base on left side
    ctx.fillStyle = '#4a90d9';
    ctx.shadowColor = '#4a90d9';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(30, height - 80);
    ctx.lineTo(70, height - 120);
    ctx.lineTo(110, height - 80);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Lives display
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i < state.maxLives; i++) {
      ctx.fillText(i < state.lives ? '❤️' : '🖤', 20 + i * 30, 40);
    }
    
    // UI Panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(width - 220, 10, 210, 130, 10);
    ctx.fill();
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`SCORE: ${state.score.toLocaleString()}`, width - 20, 35);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '16px monospace';
    ctx.fillText(`COMBO: x${state.combo}`, width - 20, 58);
    
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`LEVEL ${state.level}: ${levelConfig.name}`, width - 20, 81);
    
    ctx.fillStyle = '#ff88ff';
    ctx.fillText(`KILLS: ${state.kills}/${levelConfig.enemyCount}`, width - 20, 104);
    
    ctx.fillStyle = '#88ff88';
    const acc = state.accuracy.hits + state.accuracy.misses > 0 
      ? Math.round((state.accuracy.hits / (state.accuracy.hits + state.accuracy.misses)) * 100) 
      : 100;
    ctx.fillText(`ACC: ${acc}%`, width - 20, 127);
    
    // Current input display
    if (state.currentInput) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(width / 2 - 100, height - 60, 200, 40, 8);
      ctx.fill();
      
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`> ${state.currentInput}`, width / 2, height - 32);
    }
    
    // Level complete check
    if (state.bossActive && state.activeEnemies.length === 0) {
      state.isLevelComplete = true;
      state.isPlaying = false;
    }
    
    // Game over check
    if (state.lives <= 0) {
      state.isGameOver = true;
      state.isPlaying = false;
      
      // Update high score
      if (state.score > highScore) {
        setHighScore(state.score);
      }
    }
    
    ctx.restore();
    
    // Update state
    gameStateRef.current = state;
    setGameState(state);
    
    // Continue loop
    if (state.isPlaying && !state.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [
    spawnEnemy, 
    createParticles, 
    drawBackground, 
    drawZombie, 
    drawDog, 
    drawCat, 
    drawSpider, 
    drawBoss, 
    drawParticles,
    highScore
  ]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current?.isPlaying) return;
      
      const state = gameStateRef.current;
      
      if (e.key === 'Escape') {
        state.isPaused = !state.isPaused;
        setGameState({ ...state });
        return;
      }
      
      if (state.isPaused) return;
      
      if (e.key === 'Backspace') {
        state.currentInput = state.currentInput.slice(0, -1);
        setGameState({ ...state });
        return;
      }
      
      if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        state.currentInput += e.key.toLowerCase();
        
        // Check against active enemies
        let hitEnemy = false;
        state.activeEnemies.forEach(enemy => {
          if (enemy.currentWord.startsWith(state.currentInput)) {
            enemy.typedChars = state.currentInput.length;
            
            // Full word completed!
            if (state.currentInput === enemy.currentWord) {
              hitEnemy = true;
              enemy.health -= state.upgrades.damage;
              
              if (enemy.health <= 0) {
                // Enemy killed!
                const comboBonus = 1 + state.combo * 0.1;
                const scoreGain = Math.round(enemy.score * comboBonus);
                state.score += scoreGain;
                state.combo++;
                state.kills++;
                state.totalKills++;
                state.accuracy.hits++;
                state.money += enemy.isBoss ? 50 : 10;
                
                if (state.combo > state.maxCombo) {
                  state.maxCombo = state.combo;
                }
                
                // Death particles
                const particleCount = enemy.isBoss ? 50 : 20;
                const particleType = enemy.isBoss ? 'explosion' : 'blood';
                state.particles.push(...createParticles(
                  enemy.x, 
                  enemy.y, 
                  particleCount, 
                  particleType, 
                  enemy.color,
                  enemy.type
                ));
                
                // Score text particle
                state.particles.push({
                  id: `score_${Date.now()}`,
                  x: enemy.x,
                  y: enemy.y - 30,
                  vx: 0,
                  vy: -2,
                  life: 1,
                  maxLife: 1.5,
                  size: 12,
                  color: enemy.isBoss ? '#ffff00' : '#00ff00',
                  type: 'text',
                  text: `+${scoreGain}`,
                  gravity: 0,
                  rotation: 0,
                  rotationSpeed: 0
                });
                
                state.screenShake = enemy.isBoss ? 25 : 10;
                
                if (enemy.isBoss) {
                  state.bossActive = false;
                }
              } else {
                // Hit but not killed
                enemy.isHit = true;
                enemy.hitTimer = 100;
                state.particles.push(...createParticles(
                  enemy.x,
                  enemy.y,
                  8,
                  'spark',
                  '#ffffff',
                  enemy.type
                ));
                state.screenShake = 5;
              }
            }
          }
        });
        
        // Reset input if no match found (optional - makes harder)
        // Or keep input to allow partial matches across enemies
        
        setGameState({ ...state });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Start/stop game loop
  useEffect(() => {
    if (gameState?.isPlaying && !gameState.isPaused) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState?.isPlaying, gameState?.isPaused, gameLoop]);

  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono">
      {/* Game Canvas */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      
      {/* Main Menu */}
      {showMenu && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-8 p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 max-w-2xl">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
              🧟 TYPING MASTER 🐕🐈🕷️
            </h1>
            
            <p className="text-xl text-gray-400">
              Type words to defeat creatures! Survive the waves!
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-300 bg-black/50 p-4 rounded-lg">
              <div>🧟 <strong>Zombies</strong> - Level 1</div>
              <div>👹 <strong>Titan Boss</strong> - Level 2</div>
              <div>🐕 <strong>Hellhounds</strong> - Level 3</div>
              <div>🐕‍🦺 <strong>Cerberus</strong> - Level 4</div>
              <div>🐈 <strong>Shadow Cats</strong> - Level 5</div>
              <div>😺 <strong>Shadow Lord</strong> - Level 6</div>
              <div>🕷️ <strong>Giant Spiders</strong> - Level 7</div>
              <div>🕸️ <strong>Queen Arachne</strong> - Level 8</div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => initGame(1)}
                className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white text-2xl font-bold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg shadow-green-500/30"
              >
                ▶️ START GAME
              </button>
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowLevelSelect(true);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white text-lg font-bold rounded-xl transform hover:scale-105 transition-all"
              >
                📊 SELECT LEVEL
              </button>
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-yellow-400">🏆 High Score: {highScore.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-2">Games Played: {gameStats.gamesPlayed}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 pt-4">
              <p>Type words shown on enemies before they reach you!</p>
              <p>Press ESC to pause • Backspace to delete</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Level Select */}
      {showLevelSelect && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-blue-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-4xl font-bold text-white mb-6">SELECT LEVEL</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEVELS.map((level) => (
                <button
                  key={level.level}
                  onClick={() => {
                    setSelectedLevel(level.level);
                    initGame(level.level);
                  }}
                  disabled={level.level > 1} // Unlock levels as you progress
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedLevel === level.level
                      ? 'bg-purple-600 border-2 border-purple-400'
                      : 'bg-gray-800 border-2 border-gray-700 hover:bg-gray-700'
                  } ${level.level > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-white">
                      Level {level.level}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      level.boss ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {level.boss ? 'BOSS' : 'WAVE'}
                    </span>
                  </div>
                  <p className="text-lg text-purple-300 font-semibold">{level.name}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Enemies: {level.enemies.map(e => ENEMY_CONFIGS[e].name).join(', ')}
                  </p>
                  {level.boss && (
                    <p className="text-sm text-red-400 mt-1">
                      👹 Boss: {ENEMY_CONFIGS[level.boss].name}
                    </p>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowLevelSelect(false);
                setShowMenu(true);
              }}
              className="mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
            ]
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Pause Menu */}
      {gameState?.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gray-900 border border-yellow-500/30">
            <h2 className="text-4xl font-bold text-yellow-400">⏸️ PAUSED</h2>
            
            <div className="space-y-2 text-left bg-black/50 p-4 rounded-lg">
              <p className="text-white">Score: <span className="text-green-400">{gameState.score.toLocaleString()}</span></p>
              <p className="text-white">Combo: <span className="text-cyan-400">x{gameState.combo}</span></p>
              <p className="text-white">Level: <span className="text-yellow-400">{gameState.level}</span></p>
              <p className="text-white">Kills: <span className="text-red-400">{gameState.kills}</span></p>
            </div>
            
            <button
              onClick={() => {
                const newState = { ...gameState, isPaused: false };
                setGameState(newState);
                gameStateRef.current = newState;
              }}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl"
            >
              ▶️ RESUME
            </button>
            
            <button
              onClick={() => {
                setGameState(null);
                gameStateRef.current = null;
                setShowMenu(true);
              }}
              className="block mx-auto px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over */}
      {gameState?.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-red-900/50 to-black border border-red-500/50">
            <h2 className="text-5xl font-bold text-red-500 animate-pulse">💀 GAME OVER 💀</h2>
            
            <div className="space-y-3 text-left bg-black/50 p-6 rounded-lg">
              <p className="text-2xl text-white">
                Final Score: <span className="text-yellow-400 font-bold">{gameState.score.toLocaleString()}</span>
              </p>
              {gameState.score >= highScore && gameState.score > 0 && (
                <p className="text-xl text-green-400 animate-bounce">🎉 NEW HIGH SCORE! 🎉</p>
              )}
              <p className="text-lg text-gray-300">
                Max Combo: <span className="text-cyan-400">x{gameState.maxCombo}</span>
              </p>
              <p className="text-lg text-gray-300">
                Total Kills: <span className="text-red-400">{gameState.totalKills}</span>
              </p>
              <p className="text-lg text-gray-300">
                Accuracy: <span className="text-green-400">
                  {gameState.accuracy.hits + gameState.accuracy.misses > 0
                    ? Math.round((gameState.accuracy.hits / (gameState.accuracy.hits + gameState.accuracy.misses)) * 100)
                    : 100}%
                </span>
              </p>
              <p className="text-lg text-gray-300">
                Level Reached: <span className="text-purple-400">{gameState.level}</span>
              </p>
            </div>
            
            <div className="space-y-3 pt-4">
              <button
                onClick={() => initGame(gameState.level)}
                className="w-full py-3 px-8 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white text-xl font-bold rounded-xl transform hover:scale-105 transition-all"
              >
                🔄 TRY AGAIN
              </button>
              
              <button
                onClick={() => {
                  setGameState(null);
                  gameStateRef.current = null;
                  setShowMenu(true);
                }}
                className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white text-lg rounded-xl"
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Level Complete */}
      {gameState?.isLevelComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-green-900/50 to-black border border-green-500/50">
            <h2 className="text-5xl font-bold text-green-400 animate-bounce">
              🎉 LEVEL COMPLETE! 🎉
            </h2>
            
            <div className="space-y-3 text-left bg-black/50 p-6 rounded-lg">
              <p className="text-2xl text-white">
                Score: <span className="text-yellow-400 font-bold">{gameState.score.toLocaleString()}</span>
              </p>
              <p className="text-lg text-gray-300">
                Kills This Level: <span className="text-red-400">{gameState.kills}</span>
              </p>
            </div>
            
            {gameState.level < LEVELS.length ? (
              <button
                onClick={() => initGame(gameState.level + 1)}
                className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white text-xl font-bold rounded-xl transform hover:scale-105 transition-all"
              >
                ➡️ NEXT LEVEL: {LEVELS[gameState.level].name}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl text-yellow-400 font-bold">🏆 YOU BEAT THE GAME! 🏆</p>
                <button
                  onClick={() => {
                    setGameState(null);
                    gameStateRef.current = null;
                    setShowMenu(true);
                  }}
                  className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-white text-xl font-bold rounded-xl"
                >
                  🏠 Return to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

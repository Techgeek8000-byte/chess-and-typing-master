'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  SCENES,
  ZOMBIE_TYPES,
  WORD_LISTS,
  STAGES,
  SceneType,
  GameState,
  ActiveZombie,
  GameParticle,
  DamageNumber,
  WaveConfig,
  StageConfig,
  ZombieType,
  SceneConfig
} from './ApocalypseTypes';

// ==========================================
// 🧟 APOCALYPSE TYPING MASTER - MAIN GAME
// Complete rewrite with working mechanics!
// ==========================================

export default function ApocalypseTypingMaster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameOverStats, setGameOverStats] = useState<{ score: number; kills: number; maxCombo: number } | null>(null);
  
  // Refs for game loop
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysPressedRef = useRef<Set<string>>(new Set());
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  const initGame = useCallback((stageNumber: number = 1) => {
    const stage = STAGES.find(s => s.stageNumber === stageNumber) || STAGES[0];
    const scene = SCENES[stage.scene];
    
    const initialState: GameState = {
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      
      lives: 3,
      maxLives: 3,
      score: 0,
      combo: 0,
      maxCombo: 0,
      totalKills: 0,
      
      currentWave: 0,
      currentStage: stageNumber,
      zombiesRemaining: stage.waves[0]?.zombieCount || 5,
      zombiesSpawned: 0,
      zombiesKilledThisWave: 0,
      
      scene: stage.scene,
      sceneTransition: 0,
      
      zombies: [],
      projectiles: [],
      particles: [],
      powerUps: [],
      damageNumbers: [],
      
      currentInput: '',
      targetZombieId: null,
      
      lastSpawnTime: 0,
      gameTime: 0,
      waveStartTime: 0,
      
      screenShake: { x: 0, y: 0, intensity: 0 },
      flash: { color: '#ffffff', intensity: 0, duration: 0 },
      vignette: 0,
      
      lowHealthPulse: false,
      comboDisplay: { text: '', scale: 1, opacity: 0 }
    };
    
    setGameState(initialState);
    gameStateRef.current = initialState;
    setShowMenu(false);
    setShowStageSelect(false);
    setGameOverStats(null);
  }, []);
  
  // ==========================================
  // WORD GENERATION
  // ==========================================
  
  const getRandomWord = useCallback((difficulty: ZombieType['wordDifficulty']): string => {
    const words = WORD_LISTS[difficulty];
    return words[Math.floor(Math.random() * words.length)];
  }, []);
  
  // ==========================================
  // ZOMBIE SPAWNING
  // ==========================================
  
  const spawnZombie = useCallback((
    state: GameState, 
    canvasWidth: number, 
    canvasHeight: number,
    zombieTypeId?: string,
    isBoss: boolean = false
  ): ActiveZombie => {
    const stage = STAGES.find(s => s.stateNumber === state.currentStage) || STAGES[0];
    const waveIndex = Math.min(state.currentWave, stage.waves.length - 1);
    const wave = stage.waves[waveIndex];
    
    // Determine zombie type
    let typeId = zombieTypeId || wave.zombieTypes[Math.floor(Math.random() * wave.zombieTypes.length)];
    if (isBoss && wave.bossType) {
      typeId = wave.bossType;
    }
    
    const zombieType = ZOMBIE_TYPES[typeId] || ZOMBIE_TYPES.walker;
    const word = getRandomWord(zombieType.wordDifficulty);
    
    // Spawn position (right side of screen)
    const minY = canvasHeight * 0.25;
    const maxY = canvasHeight * 0.7;
    
    const newZombie: ActiveZombie = {
      id: `zombie_${Date.now()}_${Math.random()}`,
      type: zombieType,
      x: canvasWidth + zombieType.size,
      y: minY + Math.random() * (maxY - minY),
      health: zombieType.health,
      maxHealth: zombieType.health,
      word: word,
      typedChars: 0,
      state: 'spawning',
      animationState: {
        currentAnimation: 'walk',
        frameIndex: 0,
        frameTime: 0,
        facingLeft: true
      },
      spawnTime: Date.now(),
      lastAttackTime: 0,
      scale: 0,
      opacity: 0,
      rotation: 0,
      velocityX: 0,
      velocityY: 0,
      isTargeted: false,
      hitFlashTime: 0,
      deathTimer: 0,
      dropPowerUp: Math.random() < 0.1 // 10% chance to drop power-up
    };
    
    return newZombie;
  }, [getRandomWord]);
  
  // ==========================================
  // PARTICLE SYSTEMS
  // ==========================================
  
  const createDeathParticles = useCallback((
    x: number, 
    y: number, 
    zombieType: ZombieType,
    count: number = 20
  ): GameParticle[] => {
    const particles: GameParticle[] = [];
    
    // Blood particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 3 + Math.random() * 8;
      
      particles.push({
        id: `blood_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 4 + Math.random() * 8,
        color: ['#8b0000', '#a52a2a', '#b22222', '#dc143c'][Math.floor(Math.random() * 4)],
        type: 'blood',
        gravity: 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        alpha: 1
      });
    }
    
    // Bone fragments
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      
      particles.push({
        id: `bone_${Date.now()}_${i}`,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        maxLife: 1 + Math.random(),
        size: 8 + Math.random() * 12,
        color: '#e8dcc8',
        type: 'bone',
        gravity: 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }
    
    // Gore chunks
    if (zombieType.decayLevel > 0.3) {
      for (let i = 0; i < 3; i++) {
        particles.push({
          id: `gore_${Date.now()}_${i}`,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          maxLife: 0.8 + Math.random() * 0.4,
          size: 10 + Math.random() * 15,
          color: '#4a3a2a',
          type: 'gore',
          gravity: 0.25,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          alpha: 1
        });
      }
    }
    
    return particles;
  }, []);
  
  const createHitParticles = useCallback((x: number, y: number): GameParticle[] => {
    const particles: GameParticle[] = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 3;
      
      particles.push({
        id: `spark_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.3,
        size: 3 + Math.random() * 4,
        color: '#ffffff',
        type: 'spark',
        gravity: 0.1,
        rotation: 0,
        rotationSpeed: 0,
        alpha: 1
      });
    }
    
    return particles;
  }, []);
  
  const createDamageNumber = useCallback((x: number, y: number, value: string, color: string): DamageNumber => {
    return {
      id: `dmg_${Date.now()}_${Math.random()}`,
      x,
      y,
      value,
      color,
      life: 1,
      velocityY: -2,
      scale: value.includes('KILL') ? 1.5 : 1
    };
  }, []);
  
  // ==========================================
  // SCENE RENDERING
  // ==========================================
  
  const drawScene = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    sceneType: SceneType,
    time: number
  ) => {
    const scene = SCENES[sceneType];
    
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGrad.addColorStop(0, scene.skyColor);
    skyGrad.addColorStop(1, scene.ambientColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.6);
    
    // Fog layer (background)
    if (scene.fogDensity > 0) {
      ctx.fillStyle = `${scene.fogColor}${Math.floor(scene.fogDensity * 100).toString(16).padStart(2, '0')}`;
      ctx.fillRect(0, height * 0.3, width, height * 0.4);
    }
    
    // Background layer (parallax 0.2x)
    ctx.save();
    ctx.globalAlpha = 0.4;
    drawSceneLayer(ctx, scene.backgroundLayer, width, height, time, 0.2);
    ctx.restore();
    
    // Midground layer (parallax 0.5x)
    ctx.save();
    ctx.globalAlpha = 0.7;
    drawSceneLayer(ctx, scene.midgroundLayer, width, height, time, 0.5);
    ctx.restore();
    
    // Ground
    const groundGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    groundGrad.addColorStop(0, scene.groundColor);
    groundGrad.addColorStop(1, scene.ambientColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);
    
    // Foreground layer (parallax 1x)
    drawSceneLayer(ctx, scene.foregroundLayer, width, height, time, 1);
    
    // Atmospheric effects based on scene
    drawAtmosphericEffects(ctx, width, height, scene, time);
  }, []);
  
  const drawSceneLayer = useCallback((
    ctx: CanvasRenderingContext2D,
    elements: any[],
    width: number,
    height: number,
    time: number,
    parallaxFactor: number
  ) => {
    elements.forEach(element => {
      const x = element.x * parallaxFactor;
      const y = element.y;
      
      ctx.save();
      ctx.globalAlpha = element.opacity !== undefined ? element.opacity : 1;
      
      switch (element.type) {
        case 'tree':
          drawTree(ctx, x, y, element.width, element.height, element.color, element.variant || 1, time);
          break;
        case 'building':
          drawBuilding(ctx, x, y, element.width, element.height, element.color);
          break;
        case 'car':
          drawCar(ctx, x, y, element.width, element.height, element.color);
          break;
        case 'rock':
        case 'debris':
          ctx.fillStyle = element.color;
          ctx.beginPath();
          ctx.ellipse(x + element.width/2, y + element.height/2, element.width/2, element.height/2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'grass':
          ctx.fillStyle = element.color;
          ctx.fillRect(x, y, element.width, element.height);
          // Add grass texture
          ctx.strokeStyle = lightenColor(element.color, 20);
          ctx.lineWidth = 1;
          for (let i = 0; i < element.width; i += 8) {
            ctx.beginPath();
            ctx.moveTo(x + i, y + element.height);
            ctx.lineTo(x + i + 3, y + element.height - 5 - Math.random() * 5);
            ctx.stroke();
          }
          break;
        case 'window':
          ctx.fillStyle = element.color;
          ctx.fillRect(x, y, element.width, element.height);
          // Window glow
          if (element.color !== '#1a1a2a') {
            ctx.shadowColor = element.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, element.width, element.height);
            ctx.shadowBlur = 0;
          }
          break;
        case 'moon':
        case 'sun':
          ctx.fillStyle = element.color;
          ctx.shadowColor = element.color;
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(x + element.width/2, y + element.height/2, element.width/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        default:
          // Generic rectangle
          ctx.fillStyle = element.color;
          ctx.fillRect(x, y, element.width, element.height);
      }
      
      ctx.restore();
    });
  }, []);
  
  const drawTree = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    variant: number,
    time: number
  ) => {
    // Trunk
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x + width * 0.4, y + height * 0.5, width * 0.2, height * 0.5);
    
    // Foliage (different shapes based on variant)
    ctx.fillStyle = color;
    const swayX = Math.sin(time * 0.001 + x) * 3;
    
    ctx.beginPath();
    if (variant === 1) {
      // Round tree
      ctx.arc(x + width/2 + swayX, y + height * 0.35, width * 0.4, 0, Math.PI * 2);
    } else if (variant === 2) {
      // Pine tree
      ctx.moveTo(x + width/2 + swayX, y);
      ctx.lineTo(x + width * 0.8, y + height * 0.5);
      ctx.lineTo(x + width * 0.2, y + height * 0.5);
      ctx.closePath();
    } else {
      // Oak-like
      ctx.ellipse(x + width/2 + swayX, y + height * 0.35, width * 0.45, height * 0.35, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }, []);
  
  const drawBuilding = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    // Main structure
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // Roof line
    ctx.strokeStyle = darkenColor(color, 20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    
    // Windows (random lit/unlit)
    const windowRows = Math.floor(height / 60);
    const windowCols = Math.floor(width / 50);
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const wx = x + 15 + col * 50;
        const wy = y + 20 + row * 60;
        const isLit = Math.random() > 0.6;
        
        ctx.fillStyle = isLit ? '#ffffcc' : '#1a1a2a';
        ctx.globalAlpha = isLit ? 0.7 : 0.9;
        ctx.fillRect(wx, wy, 25, 35);
        
        if (isLit) {
          ctx.shadowColor = '#ffffcc';
          ctx.shadowBlur = 8;
          ctx.fillRect(wx, wy, 25, 35);
          ctx.shadowBlur = 0;
        }
      }
    }
    ctx.globalAlpha = 1;
  }, []);
  
  const drawCar = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y + height * 0.3, width, height * 0.5, 5);
    ctx.fill();
    
    // Top
    ctx.fillStyle = darkenColor(color, 15);
    ctx.beginPath();
    ctx.roundRect(x + width * 0.15, y, width * 0.7, height * 0.4, 5);
    ctx.fill();
    
    // Windows
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + width * 0.2, y + height * 0.08, width * 0.25, height * 0.22);
    ctx.fillRect(x + width * 0.55, y + height * 0.08, width * 0.25, height * 0.22);
    
    // Wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + width * 0.2, y + height * 0.85, height * 0.18, 0, Math.PI * 2);
    ctx.arc(x + width * 0.8, y + height * 0.85, height * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  
  const drawAtmosphericEffects = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: SceneConfig,
    time: number
  ) => {
    // Rain
    if (scene.hasRain) {
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 100; i++) {
        const rx = (time * 0.1 * (i % 5 + 1) + i * 37) % width;
        const ry = (time * 0.3 + i * 23) % height;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 15);
        ctx.stroke();
      }
    }
    
    // Lightning
    if (scene.hasLightning && Math.sin(time * 0.001) > 0.98) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
      ctx.fillRect(0, 0, width, height);
      
      // Lightning bolt
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let lx = width * 0.3 + Math.random() * width * 0.4;
      let ly = 0;
      ctx.moveTo(lx, ly);
      while (ly < height * 0.6) {
        lx += (Math.random() - 0.5) * 50;
        ly += 10 + Math.random() * 20;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    
    // Fog/mist overlay
    if (scene.fogDensity > 0.02) {
      const fogGrad = ctx.createRadialGradient(
        width / 2, height * 0.7, 0,
        width / 2, height * 0.7, width * 0.6
      );
      fogGrad.addColorStop(0, `${scene.fogColor}40`);
      fogGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }, []);
  
  // ==========================================
  // ZOMBIE RENDERING (DETAILED SPRITES)
  // ==========================================
  
  const drawZombie = useCallback((
    ctx: CanvasRenderingContext2D,
    zombie: ActiveZombie,
    time: number
  ) => {
    const { x, y, type, scale, opacity, rotation, hitFlashTime, state } = zombie;
    const s = type.size * scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    // Hit flash effect
    if (hitFlashTime > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.6, s * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.45, s * 0.35, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw based on body type
    switch (type.sprite.bodyType) {
      case 'humanoid':
        drawHumanoidZombie(ctx, s, type, time, zombie);
        break;
      case 'hulking':
        drawHulkingZombie(ctx, s, type, time, zombie);
        break;
      case 'crawler':
        drawCrawlerZombie(ctx, s, type, time, zombie);
        break;
      case 'runner':
        drawRunnerZombie(ctx, s, type, time, zombie);
        break;
      default:
        drawHumanoidZombie(ctx, s, type, time, zombie);
    }
    
    // Target indicator
    if (zombie.isTargeted) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.3, s * 0.5, s * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.restore();
    
    // Word display (always on top)
    drawZombieWord(ctx, zombie, s);
  }, []);
  
  const drawHumanoidZombie = useCallback((
    ctx: CanvasRenderingContext2D,
    s: number,
    type: ZombieType,
    time: number,
    zombie: ActiveZombie
  ) => {
    const walkCycle = time * 0.008;
    const wobble = Math.sin(walkCycle) * 2;
    
    // Legs
    const legSwing = Math.sin(walkCycle * 2) * 0.3;
    
    // Left leg
    ctx.save();
    ctx.translate(-s * 0.12, s * 0.25);
    ctx.rotate(legSwing);
    ctx.fillStyle = darkenColor(type.secondaryColor, 10);
    ctx.beginPath();
    ctx.roundRect(-s * 0.06, 0, s * 0.12, s * 0.28, s * 0.03);
    ctx.fill();
    ctx.restore();
    
    // Right leg
    ctx.save();
    ctx.translate(s * 0.12, s * 0.25);
    ctx.rotate(-legSwing);
    ctx.fillStyle = darkenColor(type.secondaryColor, 15);
    ctx.beginPath();
    ctx.roundRect(-s * 0.06, 0, s * 0.12, s * 0.28, s * 0.03);
    ctx.fill();
    ctx.restore();
    
    // Body/Torso
    const bodyGrad = ctx.createLinearGradient(0, -s * 0.15, 0, s * 0.3);
    bodyGrad.addColorStop(0, type.color);
    bodyGrad.addColorStop(1, type.secondaryColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.22, s * 0.15, -s * 0.15, s * 0.28);
    ctx.lineTo(s * 0.15, s * 0.26);
    ctx.quadraticCurveTo(s * 0.22, s * 0.1, s * 0.2, -s * 0.08);
    ctx.closePath();
    ctx.fill();
    
    // Tattered clothing details
    ctx.strokeStyle = darkenColor(type.color, 30);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const tearY = s * 0.05 + i * s * 0.07;
      ctx.beginPath();
      ctx.moveTo((i % 2 === 0 ? -1 : 1) * s * 0.18, tearY);
      ctx.lineTo((i % 2 === 0 ? -1 : 1) * s * 0.18 + (Math.random() - 0.5) * s * 0.06, tearY + s * 0.04);
      ctx.stroke();
    }
    
    // Arms (reaching forward!)
    const armAngle = Math.sin(walkCycle * 1.5) * 0.2;
    
    // Left arm
    ctx.save();
    ctx.translate(-s * 0.2, -s * 0.02);
    ctx.rotate(-0.4 + armAngle);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(0, -s * 0.035, s * 0.28, s * 0.07, s * 0.025);
    ctx.fill();
    // Hand
    ctx.fillStyle = darkenColor(type.color, 15);
    ctx.beginPath();
    ctx.ellipse(s * 0.27, 0, s * 0.04, s * 0.035, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Right arm
    ctx.save();
    ctx.translate(s * 0.2, -s * 0.02);
    ctx.rotate(0.4 - armAngle);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(-s * 0.28, -s * 0.035, s * 0.28, s * 0.07, s * 0.025);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-s * 0.27, 0, s * 0.04, s * 0.035, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Head
    const headY = -s * 0.28 + wobble * 0.3;
    const headGrad = ctx.createRadialGradient(0, headY, s * 0.02, 0, headY, s * 0.17);
    headGrad.addColorStop(0, lightenColor(type.color, 20));
    headGrad.addColorStop(0.7, type.color);
    headGrad.addColorStop(1, type.secondaryColor);
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, s * 0.16, s * 0.19, 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Decay details
    if (type.sprite.decayLevel > 0.2) {
      // Dark patches (decayed skin)
      ctx.fillStyle = `rgba(40, 30, 20, ${type.sprite.decayLevel * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(-s * 0.05, headY - s * 0.03, s * 0.06, s * 0.04, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Eyes (glowing evil red/orange)
    const eyeGlow = hitFlashTime > 0 ? '#ff0000' : '#cc3300';
    ctx.fillStyle = eyeGlow;
    ctx.shadowColor = eyeGlow;
    ctx.shadowBlur = 6 + Math.sin(time * 0.01) * 2;
    
    ctx.beginPath();
    ctx.ellipse(-s * 0.055, headY - s * 0.04, s * 0.035, s * 0.025, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.055, headY - s * 0.04, s * 0.035, s * 0.025, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Mouth (open, teeth visible if decayed)
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, headY + s * 0.09, s * 0.05, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (type.sprite.decayLevel > 0.3) {
      // Teeth
      ctx.fillStyle = '#d4c4a4';
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * s * 0.015 - 1, headY + s * 0.07, 2, s * 0.025);
      }
    }
  }, []);
  
  const drawHulkingZombie = useCallback((
    ctx: CanvasRenderingContext2D,
    s: number,
    type: ZombieType,
    time: number,
    zombie: ActiveZombie
  ) => {
    const walkCycle = time * 0.005;
    const wobble = Math.sin(walkCycle) * 1.5;
    
    // Massive legs
    const legSwing = Math.sin(walkCycle * 1.5) * 0.15;
    
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * s * 0.2, s * 0.3);
      ctx.rotate(side * legSwing);
      ctx.fillStyle = darkenColor(type.secondaryColor, 5);
      ctx.beginPath();
      ctx.roundRect(-s * 0.1, 0, s * 0.2, s * 0.25, s * 0.05);
      ctx.fill();
      ctx.restore();
    });
    
    // Huge torso
    const bodyGrad = ctx.createLinearGradient(0, -s * 0.1, 0, s * 0.35);
    bodyGrad.addColorStop(0, type.color);
    bodyGrad.addColorStop(1, type.secondaryColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.32, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Muscle definition lines
    ctx.strokeStyle = darkenColor(type.color, 20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.05);
    ctx.quadraticCurveTo(0, s * 0.05, s * 0.15, -s * 0.05);
    ctx.stroke();
    
    // Thick arms
    const armSwing = Math.sin(walkCycle) * 0.1;
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * s * 0.28, -s * 0.05);
      ctx.rotate(side * (0.3 + armSwing));
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.roundRect(0, -s * 0.06, s * 0.32, s * 0.12, s * 0.04);
      ctx.fill();
      // Big fist
      ctx.beginPath();
      ctx.ellipse(side * s * 0.3, 0, s * 0.07, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Head (smaller relative to body)
    const headY = -s * 0.25 + wobble;
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.ellipse(0, headY, s * 0.14, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Angry eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(-s * 0.045, headY - s * 0.02, s * 0.035, s * 0.028, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.045, headY - s * 0.02, s * 0.035, s * 0.028, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Roaring mouth
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, headY + s * 0.07, s * 0.06, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  
  const drawCrawlerZombie = useCallback((
    ctx: CanvasRenderingContext2D,
    s: number,
    type: ZombieType,
    time: number,
    zombie: ActiveZombie
  ) => {
    const crawlCycle = time * 0.01;
    
    // Dragging body (horizontal)
    const bodyGrad = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
    bodyGrad.addColorStop(0, type.secondaryColor);
    bodyGrad.addColorStop(0.5, type.color);
    bodyGrad.addColorStop(1, type.secondaryColor);
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15, s * 0.35, s * 0.18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms dragging forward
    const armDrag = Math.sin(crawlCycle) * 0.2;
    
    ctx.save();
    ctx.translate(-s * 0.25, s * 0.1);
    ctx.rotate(-0.5 + armDrag);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(0, -s * 0.04, s * 0.3, s * 0.08, s * 0.03);
    ctx.fill();
    // Fingers scraping ground
    ctx.fillStyle = darkenColor(type.color, 20);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(s * 0.28 + i * s * 0.03, s * 0.04, s * 0.015, s * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    ctx.save();
    ctx.translate(s * 0.25, s * 0.12);
    ctx.rotate(0.5 - armDrag);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(-s * 0.3, -s * 0.04, s * 0.3, s * 0.08, s * 0.03);
    ctx.fill();
    ctx.restore();
    
    // Head turned toward player (creepy)
    const headX = s * 0.2;
    const headY = s * 0.05 + Math.sin(crawlCycle * 0.5) * 0.02;
    
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.ellipse(headX, headY, s * 0.14, s * 0.13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dead eyes (no glow, just hollow)
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.03, headY - s * 0.02, s * 0.03, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.09, headY - s * 0.02, s * 0.03, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Jaw broken/hanging
    ctx.fillStyle = darkenColor(type.color, 25);
    ctx.beginPath();
    ctx.ellipse(headX + s * 0.06, headY + s * 0.06, s * 0.04, s * 0.03, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  
  const drawRunnerZombie = useCallback((
    ctx: CanvasRenderingContext2D,
    s: number,
    type: ZombieType,
    time: number,
    zombie: ActiveZombie
  ) => {
    const runCycle = time * 0.015;
    const leanForward = 0.15; // Running pose
    
    ctx.save();
    ctx.rotate(leanForward);
    
    // Fast legs (running animation)
    const runLegSwing = Math.sin(runCycle * 2) * 0.5;
    
    // Left leg
    ctx.save();
    ctx.translate(-s * 0.08, s * 0.22);
    ctx.rotate(runLegSwing);
    ctx.fillStyle = type.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(-s * 0.05, 0, s * 0.1, s * 0.26, s * 0.025);
    ctx.fill();
    ctx.restore();
    
    // Right leg
    ctx.save();
    ctx.translate(s * 0.08, s * 0.22);
    ctx.rotate(-runLegSwing);
    ctx.fillStyle = darkenColor(type.secondaryColor, 10);
    ctx.beginPath();
    ctx.roundRect(-s * 0.05, 0, s * 0.1, s * 0.26, s * 0.025);
    ctx.fill();
    ctx.restore();
    
    // Lean body
    const bodyGrad = ctx.createLinearGradient(0, -s * 0.15, 0, s * 0.2);
    bodyGrad.addColorStop(0, type.color);
    bodyGrad.addColorStop(1, type.secondaryColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.18, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms pumping
    const armPump = Math.sin(runCycle * 2) * 0.6;
    
    ctx.save();
    ctx.translate(-s * 0.18, -s * 0.08);
    ctx.rotate(-armPump);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(-s * 0.2, -s * 0.03, s * 0.24, s * 0.06, s * 0.02);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(s * 0.18, -s * 0.08);
    ctx.rotate(armPump);
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.roundRect(-s * 0.04, -s * 0.03, s * 0.24, s * 0.06, s * 0.02);
    ctx.fill();
    ctx.restore();
    
    // Head (forward, focused)
    const headY = -s * 0.3;
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.ellipse(0, headY, s * 0.13, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Intense eyes (bright, fast)
    ctx.fillStyle = '#ff4400';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(-s * 0.04, headY - s * 0.02, s * 0.03, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.04, headY - s * 0.02, s * 0.03, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Open mouth (panting/screaming)
    ctx.fillStyle = '#2a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, headY + s * 0.06, s * 0.04, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }, []);
  
  const drawZombieWord = useCallback((
    ctx: CanvasRenderingContext2D,
    zombie: ActiveZombie,
    s: number
  ) => {
    const { word, typedChars, isTargeted } = zombie;
    const wordY = -s * 0.5 - 15;
    
    // Word background
    ctx.font = `${zombie.type.isBoss ? 'bold 18px' : 'bold 16px'} monospace`;
    const metrics = ctx.measureText(word);
    
    ctx.fillStyle = isTargeted ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(
      -metrics.width / 2 - 6,
      wordY - 16,
      metrics.width + 12,
      22,
      5
    );
    ctx.fill();
    
    // Border when targeted
    if (isTargeted) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Typed portion (green)
    const typedPart = word.substring(0, typedChars);
    const untypedPart = word.substring(typedChars);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if (typedPart) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(typedPart, -metrics.width / 2 + ctx.measureText(typedPart).width / 2, wordY - 12);
    }
    
    // Untyped portion (white)
    if (untypedPart) {
      ctx.fillStyle = '#ffffff';
      const typedWidth = ctx.measureText(typedPart).width;
      ctx.fillText(untypedPart, -metrics.width / 2 + typedWidth + ctx.measureText(untypedPart).width / 2, wordY - 12);
    }
    
    // Cursor blink on next character
    if (isTargeted && typedChars < word.length && Math.floor(Date.now() / 500) % 2 === 0) {
      const cursorX = -metrics.width / 2 + ctx.measureText(word.substring(0, typedChars + 1)).width;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(cursorX - 1, wordY - 14, 2, 18);
    }
    
    // Health bar for tough zombies
    if (zombie.maxHealth > 1) {
      const barWidth = s * 0.8;
      const barHeight = 6;
      const barY = wordY - 26;
      const healthPercent = zombie.health / zombie.maxHealth;
      
      // Background
      ctx.fillStyle = '#333333';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
      
      // Health
      const healthColor = healthPercent > 0.6 ? '#00ff00' :
                          healthPercent > 0.3 ? '#ffff00' : '#ff0000';
      ctx.fillStyle = healthColor;
      ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
      
      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
    }
  }, []);
  
  // ==========================================
  // PARTICLE RENDERING
  // ==========================================
  
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: GameParticle[]) => {
    particles.forEach(particle => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.alpha * (particle.life / particle.maxLife);
      
      switch (particle.type) {
        case 'blood':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'bone':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.roundRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2, particle.size / 6);
          ctx.fill();
          break;
          
        case 'gore':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'spark':
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          ctx.shadowBlur = 0;
          break;
          
        case 'text':
          ctx.fillStyle = particle.color;
          ctx.font = `bold ${particle.size * 3}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(particle.text || '', 0, 0);
          break;
      }
      
      ctx.restore();
    });
  }, []);
  
  const drawDamageNumbers = useCallback((ctx: CanvasRenderingContext2D, numbers: DamageNumber[]) => {
    numbers.forEach(num => {
      ctx.save();
      ctx.translate(num.x, num.y);
      ctx.scale(num.scale, num.scale);
      ctx.globalAlpha = num.life;
      
      ctx.fillStyle = num.color;
      ctx.font = `bold ${num.value.includes('!') ? 24 : 18}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(num.value, 0, 0);
      
      ctx.restore();
    });
  }, []);
  
  // ==========================================
  // UI RENDERING
  // ==========================================
  
  const drawUI = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: GameState,
    time: number
  ) => {
    // Top-left: Lives
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let i = 0; i < state.maxLives; i++) {
      ctx.font = '24px monospace';
      ctx.fillText(i < state.lives ? '❤️' : '🖤', 15 + i * 30, 15);
    }
    
    // Top-right: Score & Combo panel
    const panelWidth = 220;
    const panelHeight = 110;
    const panelX = width - panelWidth - 15;
    const panelY = 15;
    
    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`SCORE: ${state.score.toLocaleString()}`, panelX + panelWidth - 15, panelY + 25);
    
    // Combo
    ctx.fillStyle = state.combo >= 10 ? '#ff00ff' : state.combo >= 5 ? '#00ffff' : '#00ff00';
    ctx.font = '18px monospace';
    ctx.fillText(`COMBO: x${state.combo}`, panelX + panelWidth - 15, panelY + 50);
    
    // Stage & Wave info
    const stage = STAGES.find(s => s.stateNumber === state.currentStage);
    ctx.fillStyle = '#ffaa00';
    ctx.font = '16px monospace';
    ctx.fillText(`STAGE ${state.currentStage}: ${(stage?.name || '')}`, panelX + panelWidth - 15, panelY + 73);
    
    ctx.fillStyle = '#aaaaff';
    ctx.font = '14px monospace';
    ctx.fillText(`Wave ${state.currentWave + 1}/${STAGES.reduce((acc, s) => acc + s.waves.length, 0)}`, panelX + panelWidth - 15, panelY + 93);
    
    // Current input display (bottom center)
    if (state.currentInput) {
      const inputWidth = 250;
      const inputHeight = 45;
      const inputX = width / 2 - inputWidth / 2;
      const inputY = height - 70;
      
      ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
      ctx.beginPath();
      ctx.roundRect(inputX, inputY, inputWidth, inputHeight, 10);
      ctx.fill();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`> ${state.currentInput}`, width / 2, inputY + inputHeight / 2);
    }
    
    // Low health vignette/pulse
    if (state.lives <= 1) {
      const pulseIntensity = 0.3 + Math.sin(time * 0.01) * 0.15;
      const vignetteGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height);
      vignetteGrad.addColorStop(0, 'transparent');
      vignetteGrad.addColorStop(1, `rgba(139, 0, 0, ${pulseIntensity})`);
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Combo display (big popup)
    if (state.comboDisplay.opacity > 0 && state.combo >= 5) {
      ctx.save();
      ctx.translate(width / 2, height * 0.3);
      ctx.scale(state.comboDisplay.scale, state.comboDisplay.scale);
      ctx.globalAlpha = state.comboDisplay.opacity;
      
      ctx.fillStyle = state.combo >= 20 ? '#ff00ff' : state.combo >= 10 ? '#00ffff' : '#ffff00';
      ctx.font = `bold ${48 + state.combo}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${state.combo}x COMBO!`, 0, 0);
      
      ctx.restore();
    }
  }, []);
  
  // ==========================================
  // COLOR UTILITIES
  // ==========================================
  
  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  const darkenColor = (color: string, amount: number): string => {
    return lightenColor(color, -amount);
  };
  
  // ==========================================
  // MAIN GAME LOOP
  // ==========================================
  
  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current || !gameStateRef.current?.isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Cap delta time to prevent huge jumps
    const dt = Math.min(deltaTime, 50);
    
    const state = { ...gameStateRef.current };
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with screen shake
    ctx.save();
    if (state.screenShake.intensity > 0) {
      ctx.translate(
        (Math.random() - 0.5) * state.screenShake.intensity,
        (Math.random() - 0.5) * state.screenShake.intensity
      );
      state.screenShake.intensity *= 0.9;
      if (state.screenShake.intensity < 0.5) {
        state.screenShake.intensity = 0;
      }
    }
    
    // Flash effect
    if (state.flash.duration > 0) {
      ctx.fillStyle = `${state.flash.color}${Math.floor(state.flash.intensity * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(0, 0, width, height);
      state.flash.duration -= dt;
    }
    
    // Draw scene/background
    drawScene(ctx, width, height, state.scene, timestamp);
    
    // Get current stage/wave config
    const stage = STAGES.find(s => s.stateNumber === state.currentStage) || STAGES[0];
    const waveIndex = Math.min(state.currentWave, stage.waves.length - 1);
    const wave = stage.waves[waveIndex];
    
    // Spawn zombies
    const now = Date.now();
    const spawnInterval = wave.spawnInterval / (1 + state.currentStage * 0.1); // Harder stages spawn faster
    
    if (now - state.lastSpawnTime > spawnInterval && 
        state.zombiesSpawned < wave.zombieCount &&
        state.zombies.length < 8) {
      const newZombie = spawnZombie(state, width, height);
      state.zombies.push(newZombie);
      state.zombiesSpawned++;
      state.lastSpawnTime = now;
    }
    
    // Update and draw zombies
    state.zombies = state.zombies.filter(zombie => {
      // Spawn animation
      if (zombie.state === 'spawning') {
        zombie.scale += dt * 0.004;
        zombie.opacity += dt * 0.005;
        if (zombie.scale >= 1) {
          zombie.scale = 1;
          zombie.opacity = 1;
          zombie.state = 'walking';
        }
      }
      
      // Death animation
      if (zombie.state === 'dying') {
        zombie.deathTimer -= dt;
        zombie.opacity -= dt * 0.003;
        zombie.rotation += dt * 0.002;
        
        if (zombie.deathTimer <= 0) {
          return false; // Remove dead zombie
        }
        
        // Still draw dying zombie (falling over)
        drawZombie(ctx, zombie, timestamp);
        return true;
      }
      
      // Movement (only if walking)
      if (zombie.state === 'walking') {
        const moveSpeed = zombie.type.speed * (60 + state.currentStage * 5) * dt * 0.00008;
        zombie.x -= moveSpeed;
        
        // Animation updates
        zombie.animationState.frameTime += dt;
        if (zombie.animationState.frameTime > 150) {
          zombie.animationState.frameIndex = (zombie.animationState.frameIndex + 1) % 4;
          zombie.animationState.frameTime = 0;
        }
      }
      
      // Hit flash timer
      if (zombie.hitFlashTime > 0) {
        zombie.hitFlashTime -= dt;
      }
      
      // Check if zombie reached left side (player base!)
      if (zombie.x < 60 && zombie.state === 'walking') {
        state.lives--;
        state.combo = 0;
        state.screenShake = { x: 0, y: 0, intensity: 20 };
        state.flash = { color: '#ff0000', intensity: 0.5, duration: 200 };
        
        // Damage number
        state.damageNumbers.push(createDamageNumber(80, height / 2, '-1 LIFE!', '#ff0000'));
        
        // Death particles at player location
        state.particles.push(...createHitParticles(80, height / 2));
        
        return false; // Remove zombie
      }
      
      // Draw zombie
      drawZombie(ctx, zombie, timestamp);
      
      return true; // Keep zombie
    });
    
    // Update particles
    state.particles = state.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.life -= dt / 1000 / particle.maxLife;
      particle.rotation += particle.rotationSpeed;
      particle.alpha = particle.life / particle.maxLife;
      
      return particle.life > 0;
    });
    
    // Update damage numbers
    state.damageNumbers = state.damageNumbers.filter(num => {
      num.y += num.velocityY;
      num.velocityY += 0.05;
      num.life -= dt / 800;
      num.scale *= 0.99;
      
      return num.life > 0;
    });
    
    // Draw particles and effects
    drawParticles(ctx, state.particles);
    drawDamageNumbers(ctx, state.damageNumbers);
    
    // Draw player/base indicator
    ctx.fillStyle = '#4a90d9';
    ctx.shadowColor = '#4a90d9';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(30, height - 60);
    ctx.lineTo(60, height - 100);
    ctx.lineTo(90, height - 60);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // "DEFEND" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEFEND', 60, height - 45);
    
    // Draw UI
    drawUI(ctx, width, height, state, timestamp);
    
    // Check win condition (all waves complete)
    const totalWavesInStage = stage.waves.length;
    const allWavesComplete = state.zombiesKilledThisWave >= wave.zombieCount && 
                             state.zombiesSpawned >= wave.zombieCount &&
                             state.zombies.length === 0;
    
    if (allWavesComplete) {
      if (state.currentWave < totalWavesInStage - 1) {
        // Next wave
        state.currentWave++;
        state.zombiesKilledThisWave = 0;
        state.zombiesSpawned = 0;
        state.waveStartTime = now;
        
        // Show wave transition message
        state.damageNumbers.push(createDamageNumber(width / 2, height / 2, `WAVE ${state.currentWave + 1}!`, '#00ffff'));
      } else if (state.currentStage < STAGES.length) {
        // Stage complete!
        state.isVictory = true;
        state.isPlaying = false;
      } else {
        // Game complete!
        state.isVictory = true;
        state.isPlaying = false;
      }
    }
    
    // Check lose condition
    if (state.lives <= 0) {
      state.isGameOver = true;
      state.isPlaying = false;
      state.score += state.totalKills * 10; // Bonus for kills
      
      if (state.score > highScore) {
        setHighScore(state.score);
      }
      
      setGameOverStats({
        score: state.score,
        kills: state.totalKills,
        maxCombo: state.maxCombo
      });
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
    spawnZombie,
    createDeathParticles,
    createHitParticles,
    createDamageNumber,
    drawScene,
    drawZombie,
    drawParticles,
    drawDamageNumbers,
    drawUI,
    highScore
  ]);
  
  // ==========================================
  // INPUT HANDLING
  // ==========================================
  
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
        
        // Clear targeting if input cleared
        if (state.currentInput === '') {
          state.targetZombieId = null;
          state.zombies.forEach(z => z.isTargeted = false);
        }
        
        setGameState({ ...state });
        return;
      }
      
      if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        const char = e.key.toLowerCase();
        state.currentInput += char;
        
        // Find matching zombie
        let foundMatch = false;
        let bestMatch: ActiveZombie | null = null;
        let bestMatchLength = 0;
        
        state.zombies.forEach(zombie => {
          if (zombie.word.startsWith(state.currentInput) && zombie.state === 'walking') {
            const matchLength = state.currentInput.length;
            
            if (matchLength > bestMatchLength) {
              bestMatch = zombie;
              bestMatchLength = matchLength;
            }
            
            foundMatch = true;
          }
        });
        
        // Clear old targets
        state.zombies.forEach(z => z.isTargeted = false);
        
        if (bestMatch) {
          // Set new target
          bestMatch.isTargeted = true;
          state.targetZombieId = bestMatch.id;
          bestMatch.typedChars = state.currentInput.length;
          
          // CHECK FOR KILL (exact match!)
          if (state.currentInput === bestMatch.word) {
            // DAMAGE THE ZOMBIE!
            bestMatch.health--;
            bestMatch.hitFlashTime = 150;
            
            if (bestMatch.health <= 0) {
              // ZOMBIE KILLED!
              const comboBonus = 1 + state.combo * 0.1;
              const scoreGain = Math.round(bestMatch.type.score * comboBonus);
              
              state.score += scoreGain;
              state.combo++;
              state.totalKills++;
              state.zombiesKilledThisWave++;
              
              if (state.combo > state.maxCombo) {
                state.maxCombo = state.combo;
                
                // Show combo popup
                if (state.combo >= 5) {
                  state.comboDisplay = {
                    text: `${state.combo}x COMBO!`,
                    scale: 1.5,
                    opacity: 1
                  };
                }
              }
              
              // Death effects
              state.particles.push(...createDeathParticles(bestMatch.x, bestMatch.y, bestMatch.type));
              state.damageNumbers.push(
                createDamageNumber(bestMatch.x, bestMatch.y - bestMatch.type.size * 0.5, `+${scoreGain}`, '#00ff00')
              );
              
              if (bestMatch.type.isBoss) {
                state.damageNumbers.push(
                  createDamageNumber(bestMatch.x, bestMatch.y - bestMatch.type.size * 0.7, 'BOSS KILL!', '#ffff00')
                );
              }
              
              if (state.combo % 10 === 0 && state.combo > 0) {
                state.damageNumbers.push(
                  createDamageNumber(width / 2, height / 3, `${state.combo}x COMBO!`, '#ff00ff')
                );
              }
              
              // Screen shake based on zombie size
              state.screenShake = {
                x: 0,
                y: 0,
                intensity: bestMatch.type.isBoss ? 30 : 15
              };
              
              // Flash
              state.flash = {
                color: bestMatch.type.isBoss ? '#ffff00' : '#ffffff',
                intensity: 0.3,
                duration: 100
              };
              
              // Mark as dying (will be removed by game loop)
              bestMatch.state = 'dying';
              bestMatch.deathTimer = 500; // 500ms death animation
              
              // Reset input
              state.currentInput = '';
              state.targetZombieId = null;
              
            } else {
              // Just hit, not killed yet
              state.particles.push(...createHitParticles(bestMatch.x, bestMatch.y));
              state.screenShake = { x: 0, y: 0, intensity: 5 };
            }
          }
        } else if (!foundMatch) {
          // No match found - reset input (optional punishment)
          // Comment out this block if you want to allow partial matches across zombies
          // state.currentInput = '';
          // state.targetZombieId = null;
        }
        
        setGameState({ ...state });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createDeathParticles, createHitParticles, createDamageNumber]);
  
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
  
  // Resize handler
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
  
  // ==========================================
  // RENDER
  // ==========================================
  
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20">
          <div className="text-center space-y-8 p-8 rounded-2xl bg-gradient-to-b from-gray-900 via-red-950 to-black border-2 border-red-500/40 max-w-3xl">
            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-black">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
                🧟 APOCALYPSE
              </span>
              <br />
              <span className="text-white text-4xl md:text-5xl mt-2 block">
                TYPING MASTER
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-xl mx-auto">
              Type words to kill zombies before they reach you!<br />
              Survive the apocalypse across multiple locations!
            </p>
            
            {/* Scene Preview Grid */}
            <div className="grid grid-cols-5 gap-2 p-4 bg-black/50 rounded-lg max-w-2xl mx-auto">
              {Object.entries(SCENES).slice(0, 10).map(([key, scene]) => (
                <div key={key} className="text-center p-2 rounded bg-gray-900/50 hover:bg-red-900/30 transition-colors cursor-default"
                     title={scene.name}>
                  <div className="text-2xl mb-1">
                    {key === 'forest' ? '🌲' : key === 'desert' ? '🏜️' : key === 'mall' ? '🏬' :
                     key === 'hospital' ? '🏥' : key === 'lab' ? '🔬' : key === 'highway' ? '🛣️' :
                     key === 'village' ? '👻' : key === 'school' ? '🏫' : key === 'military' ? '⚔️' : '🕸️'}
                  </div>
                  <div className="text-xs text-gray-400">{scene.name}</div>
                </div>
              ))}
            </div>
            
            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => initGame(1)}
                className="w-full py-5 px-8 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 text-white text-2xl font-bold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-red-500/40"
              >
                🎮 START SURVIVAL
              </button>
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowStageSelect(true);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold rounded-xl transform hover:scale-105 transition-all"
              >
                📍 SELECT STAGE
              </button>
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-yellow-400 font-semibold">🏆 High Score: {highScore.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>⌨️ Type words shown on zombies to kill them</p>
              <p>❤️ Don't let them reach your base!</p>
              <p>🔥 Build combos for bonus points</p>
              <p>Press ESC to pause • Backspace to delete</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stage Select */}
      {showStageSelect && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20 overflow-y-auto">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border-2 border-purple-500/40 max-w-4xl my-8">
            <h2 className="text-4xl font-bold text-white">SELECT STAGE</h2>
            
            <div className="grid gap-4">
              {STAGES.map((stage) => (
                <button
                  key={stage.stageNumber}
                  onClick={() => initGame(stage.stageNumber)}
                  disabled={stage.stageNumber > 1} // Unlock progression later
                  className={`relative p-6 rounded-xl text-left transition-all ${
                    stage.stageNumber === currentStage
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400'
                      : 'bg-gray-800 border-2 border-gray-700 hover:bg-gray-700'
                  } ${stage.stageNumber > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Stage {stage.stageNumber}: {stage.name}
                      </h3>
                      <p className="text-gray-300 mt-1">{stage.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1">
                          {Object.entries(SCENES).find(([k]) => k === stage.scene)?.[1]?.id === 'forest' ? '🌲' :
                           Object.entries(SCENES).find(([k]) => k === stage.scene)?.[1]?.id === 'desert' ? '🏜️' :
                           Object.entries(SCENES).find(([k]) => k === stage.scene)?.[1]?.id === 'mall' ? '🏬' :
                           Object.entries(SCENES).find(([k]) => k === stage.scene)?.[1]?.id === 'hospital' ? '🏥' : '📍'}
                          {' '}
                          {SCENES[stage.scene].name}
                        </span>
                        <span className="text-gray-400">
                          {stage.waves.length} Waves
                        </span>
                        <span className="text-yellow-400">
                          +{stage.rewards.points} pts
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {stage.stageNumber <= 1 ? (
                        <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
                          PLAY →
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mini scene preview colors */}
                  <div className="absolute bottom-3 right-3 flex gap-1 opacity-30">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCENES[stage.scene].skyColor }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCENES[stage.scene].groundColor }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCENES[stage.scene].ambientColor }}></div>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowStageSelect(false);
                setShowMenu(true);
              }}
              className="mt-6 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Pause Menu */}
      {gameState?.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gray-900 border-2 border-yellow-500/40">
            <h2 className="text-5xl font-bold text-yellow-400">⏸️ PAUSED</h2>
            
            <div className="space-y-2 text-left bg-black/50 p-6 rounded-lg min-w-[300px]">
              <p className="text-white text-lg">
                Score: <span className="text-green-400 font-bold ml-2">{gameState.score.toLocaleString()}</span>
              </p>
              <p className="text-white text-lg">
                Combo: <span className="text-cyan-400 font-bold ml-2">x{gameState.combo}</span>
              </p>
              <p className="text-white text-lg">
                Stage: <span className="text-yellow-400 font-bold ml-2">{gameState.currentStage}</span>
              </p>
              <p className="text-white text-lg">
                Kills: <span className="text-red-400 font-bold ml-2">{gameState.totalKills}</span>
              </p>
              <p className="text-white text-lg">
                Lives: <span className="text-red-500 font-bold ml-2">{gameState.lives}/{gameState.maxLives}</span>
              </p>
            </div>
            
            <button
              onClick={() => {
                const newState = { ...gameState, isPaused: false };
                setGameState(newState);
                gameStateRef.current = newState;
              }}
              className="w-full py-4 px-8 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl transition-all"
            >
              ▶️ RESUME
            </button>
            
            <button
              onClick={() => {
                setGameState(null);
                gameStateRef.current = null;
                setShowMenu(true);
              }}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState?.isGameOver && gameOverStats && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-red-950/80 to-black border-2 border-red-500/50">
            <h2 className="text-6xl font-bold text-red-500 animate-pulse">
              💀 YOU DIED 💀
            </h2>
            
            <div className="space-y-3 text-left bg-black/60 p-6 rounded-lg min-w-[350px]">
              <p className="text-2xl">
                Final Score: <span className="text-yellow-400 font-bold">{gameOverStats.score.toLocaleString()}</span>
              </p>
              
              {gameOverStats.score >= highScore && gameOverStats.score > 0 && (
                <p className="text-xl text-green-400 font-bold animate-bounce">
                  🎉 NEW HIGH SCORE! 🎉
                </p>
              )}
              
              <p className="text-lg text-gray-300">
                Zombies Killed: <span className="text-red-400 font-bold">{gameOverStats.kills}</span>
              </p>
              
              <p className="text-lg text-gray-300">
                Max Combo: <span className="text-cyan-400 font-bold">x{gameOverStats.maxCombo}</span>
              </p>
              
              <p className="text-lg text-gray-300">
                Stage Reached: <span className="text-purple-400 font-bold">{gameState.currentStage}</span>
              </p>
              
              <p className="text-lg text-gray-300">
                Waves Survived: <span className="text-orange-400 font-bold">{gameState.currentWave + 1}</span>
              </p>
            </div>
            
            <div className="space-y-3 pt-4">
              <button
                onClick={() => initGame(gameState.currentStage)}
                className="w-full py-4 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xl font-bold rounded-xl transform hover:scale-105 transition-all"
              >
                🔄 TRY AGAIN
              </button>
              
              <button
                onClick={() => {
                  setGameState(null);
                  gameStateRef.current = null;
                  setShowMenu(true);
                }}
                className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white text-lg rounded-xl transition-all"
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Victory Screen */}
      {gameState?.isVictory && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-green-950/80 to-black border-2 border-green-500/50">
            <h2 className="text-6xl font-bold text-green-400 animate-bounce">
              🎉 STAGE COMPLETE! 🎉
            </h2>
            
            <div className="space-y-3 text-left bg-black/60 p-6 rounded-lg">
              <p className="text-2xl text-white">
                Score: <span className="text-yellow-400 font-bold">{gameState.score.toLocaleString()}</span>
              </p>
              
              <p className="text-lg text-gray-300">
                Total Kills: <span className="text-red-400 font-bold">{gameState.totalKills}</span>
              </p>
              
              <p className="text-lg text-gray-300">
                Best Combo: <span className="text-cyan-400 font-bold">x{gameState.maxCombo}</span>
              </p>
            </div>
            
            {gameState.currentStage < STAGES.length ? (
              <button
                onClick={() => initGame(gameState.currentStage + 1)}
                className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xl font-bold rounded-xl transform hover:scale-105 transition-all"
              >
                ➡️ NEXT STAGE: {STAGES[gameState.currentStage]?.name || ''}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-3xl text-yellow-400 font-bold">
                  🏆 YOU BEAT THE GAME! 🏆
                </p>
                <p className="text-gray-300">
                  You survived the apocalypse!
                </p>
                <button
                  onClick={() => {
                    setGameState(null);
                    gameStateRef.current = null;
                    setShowMenu(true);
                  }}
                  className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-white text-xl font-bold rounded-xl transition-all"
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

// Fix: Add missing property to StageConfig interface
declare module './ApocalypseTypes' {
  interface StageConfig {
    stateNumber?: number;
  }
}

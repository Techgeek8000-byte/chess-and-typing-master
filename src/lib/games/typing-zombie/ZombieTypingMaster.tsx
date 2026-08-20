'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Zombie,
  ZombieType,
  Particle,
  PowerUp,
  PowerUpType,
  GameState,
  GameConfig,
  WORD_LISTS,
  ZOMBIE_CONFIGS,
  GAME_CONSTANTS
} from './types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  play(type: 'shoot' | 'hit' | 'explode' | 'death' | 'powerup' | 'damage' | 'boss' | 'combo') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'shoot':
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
      
      case 'hit':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;
      
      case 'explode':
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const noiseGain = this.audioContext.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        noise.start(now);
        break;
      
      case 'death':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
      
      case 'powerup':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
      
      case 'damage':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(80, now + 0.2);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
      
      case 'boss':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        for (let i = 0; i < 5; i++) {
          oscillator.frequency.setValueAtTime(100 + i * 50, now + i * 0.1);
        }
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
      
      case 'combo':
        oscillator.type = 'sine';
        const freqs = [523, 659, 784]; // C5, E5, G5
        freqs.forEach((freq, i) => {
          const osc = this.audioContext!.createOscillator();
          const gain = this.audioContext!.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext!.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.15);
        });
        return;
    }
  }
}

export default function ZombieTypingMaster() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    maxHealth: 100,
    level: 1,
    wave: 1,
    zombiesKilled: 0,
    totalZombies: 0,
    wordsTyped: 0,
    accuracy: 100,
    totalAttempts: 0,
    gameStatus: 'menu',
    activePowerUps: new Map(),
    screenShake: { intensity: 0, duration: 0 },
    lastFrameTime: 0,
    deltaTime: 0
  });

  // Game objects
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  // Input state
  const [currentInput, setCurrentInput] = useState('');
  const [targetZombieId, setTargetZombieId] = useState<string | null>(null);
  
  // Config
  const [config] = useState<GameConfig>({
    baseZombieSpeed: 40,
    spawnRate: 1,
    wordsPerWave: 10,
    difficultyMultiplier: 1,
    enableParticles: true,
    enableSound: true,
    graphicsQuality: 'high'
  });

  // Refs
  const gameLoopRef = useRef<number>();
  const spawnTimerRef = useRef<number>();
  const soundManagerRef = useRef<SoundManager>(new SoundManager(config.enableSound));
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize sound on first user interaction
  useEffect(() => {
    const initSound = () => {
      soundManagerRef.current.init();
      document.removeEventListener('click', initSound);
      document.removeEventListener('keydown', initSound);
    };
    
    document.addEventListener('click', initSound);
    document.addEventListener('keydown', initSound);
    
    return () => {
      document.removeEventListener('click', initSound);
      document.removeEventListener('keydown', initSound);
    };
  }, []);

  // Get word based on level and zombie type
  const getWord = useCallback((zombieType: ZombieType, isBoss: boolean): string => {
    const wordList = isBoss ? WORD_LISTS.boss :
      gameState.level <= 2 ? WORD_LISTS.easy :
      gameState.level <= 5 ? WORD_LISTS.medium : WORD_LISTS.hard;
    
    const config = ZOMBIE_CONFIGS[zombieType];
    let word = wordList[Math.floor(Math.random() * wordList.length)];
    
    // Ensure word length matches zombie type requirements
    let attempts = 0;
    while ((word.length < config.wordLength[0] || word.length > config.wordLength[1]) && attempts < 20) {
      word = wordList[Math.floor(Math.random() * wordList.length)];
      attempts++;
    }
    
    return word.toUpperCase();
  }, [gameState.level]);

  // Spawn zombie
  const spawnZombie = useCallback((isBoss = false) => {
    const types: ZombieType[] = ['normal', 'normal', 'normal', 'fast', 'fast', 'tank', 'ghost', 'exploder'];
    const type = isBoss ? 'boss' : types[Math.floor(Math.random() * types.length)];
    const zConfig = ZOMBIE_CONFIGS[type];
    
    const newZombie: Zombie = {
      id: generateId(),
      word: getWord(type, isBoss),
      displayWord: '',
      typedChars: '',
      position: {
        x: GAME_CONSTANTS.CANVAS_WIDTH + Math.random() * 200,
        y: 100 + Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 250)
      },
      velocity: { vx: 0, vy: 0 },
      health: zConfig.health * (isBoss ? 3 : 1),
      maxHealth: zConfig.health * (isBoss ? 3 : 1),
      type,
      size: zConfig.size * (isBoss ? 1.5 : 1),
      rotation: 0,
      scale: 0,
      opacity: 0,
      isAttacking: false,
      isDying: false,
      deathAnimation: 0,
      spawnTime: Date.now(),
      damageFlash: 0,
      isBoss,
      color: zConfig.color
    };

    setZombies(prev => [...prev, newZombie]);
    setGameState(prev => ({ ...prev, totalZombies: prev.totalZombies + 1 }));
  }, [getWord]);

  // Create particles
  const createParticles = useCallback((
    x: number, 
    y: number, 
    count: number, 
    type: Particle['type'],
    color?: string
  ) => {
    if (!config.enableParticles) return;
    
    const colors = {
      blood: ['#8b0000', '#a52a2a', '#b22222', '#dc143c', '#ff0000'],
      explosion: ['#ff4500', '#ff6347', '#ff8c00', '#ffa500', '#ffd700'],
      text: ['#00ff00', '#00cc00', '#009900', '#ffffff'],
      spark: ['#ffffff', '#ffff00', '#ffa500', '#ff6347'],
      bone: ['#f5f5dc', '#faebd7', '#fff8dc']
    };

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 100 + Math.random() * 200;
      
      newParticles.push({
        id: generateId(),
        position: { x, y },
        velocity: {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 50
        },
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 8,
        color: color || colors[type][Math.floor(Math.random() * colors[type].length)],
        type,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    setParticles(prev => [...prev.slice(-GAME_CONSTANTS.MAX_PARTICLES), ...newParticles]);
  }, [config.enableParticles]);

  // Create power-up
  const createPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > GAME_CONSTANTS.POWER_UP_SPAWN_CHANCE) return;
    
    const types: PowerUpType[] = ['freeze', 'nuke', 'rapidFire', 'shield', 'heal', 'multiKill'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newPowerUp: PowerUp = {
      id: generateId(),
      type,
      position: { x, y },
      velocity: { vx: 0, vy: 30 },
      size: 30,
      rotation: 0,
      duration: GAME_CONSTANTS.POWER_UP_DURATION,
      collected: false
    };

    setPowerUps(prev => [...prev, newPowerUp]);
  }, []);

  // Kill zombie (declared before handleInputChange which uses it)
  const killZombie = useCallback((zombieId: string) => {
    const zombie = zombies.find(z => z.id === zombieId);
    if (!zombie || zombie.isDying) return;

    soundManagerRef.current.play(zombie.isBoss ? 'boss' : 'death');
    
    // Calculate score with combo bonus
    const baseScore = 100 * ZOMBIE_CONFIGS[zombie.type].scoreMultiplier;
    const comboBonus = Math.floor(gameState.combo * GAME_CONSTANTS.COMBO_MULTIPLIER * 10);
    const totalScore = baseScore + comboBonus;
    
    // Create death effects
    createParticles(zombie.position.x, zombie.position.y, zombie.isBoss ? 30 : 15, 'blood');
    if (zombie.type === 'exploder') {
      createParticles(zombie.position.x, zombie.position.y, 25, 'explosion');
      soundManagerRef.current.play('explode');
    }

    // Chance to spawn power-up
    createPowerUp(zombie.position.x, zombie.position.y);

    // Update game state
    setGameState(prev => ({
      ...prev,
      score: prev.score + totalScore,
      combo: prev.combo + 1,
      maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
      zombiesKilled: prev.zombiesKilled + 1,
      wordsTyped: prev.wordsTyped + 1,
      totalAttempts: prev.totalAttempts + 1,
      screenShake: { intensity: zombie.isBoss ? 20 : 8, duration: 200 }
    }));

    // Play combo sound every 5 combos
    if ((gameState.combo + 1) % 5 === 0) {
      soundManagerRef.current.play('combo');
    }

    // Mark zombie as dying
    setZombies(prev => prev.map(z => 
      z.id === zombieId ? { ...z, isDying: true, deathAnimation: 1 } : z
    ));
  }, [zombies, gameState.combo, createParticles, createPowerUp]);

  // Handle typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCurrentInput(value);

    if (!value || gameState.gameStatus !== 'playing') return;

    // Find matching zombie
    const matchingZombie = zombies.find(z => 
      !z.isDying && 
      z.word.startsWith(value) &&
      z.typedChars === value.slice(0, -1)
    );

    if (matchingZombie) {
      setTargetZombieId(matchingZombie.id);
      
      // Update zombie's typed characters
      setZombies(prev => prev.map(z => 
        z.id === matchingZombie.id 
          ? { ...z, typedChars: value, damageFlash: 10 }
          : z
      ));

      // Check if word complete
      if (value === matchingZombie.word) {
        killZombie(matchingZombie.id);
        setCurrentInput('');
        setTargetZombieId(null);
      }
    } else {
      // No match found - check if any zombie starts with this
      const anyMatch = zombies.some(z => !z.isDying && z.word.startsWith(value));
      if (!anyMatch && value.length > 0) {
        // Wrong input - penalize accuracy
        setGameState(prev => ({
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          combo: 0
        }));
      }
    }
  }, [zombies, gameState.gameStatus, killZombie]);

  // Game loop ref (to avoid self-reference issue)
  const gameLoopRefInner = useRef<(timestamp: number) => void>(null!);
  
  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const deltaTime = timestamp - gameState.lastFrameTime;
    
    // Update zombies
    setZombies(prev => prev.map(zombie => {
      if (zombie.isDying) {
        return {
          ...zombie,
          deathAnimation: zombie.deathAnimation - deltaTime * 0.002,
          scale: zombie.scale + deltaTime * 0.005,
          opacity: zombie.deathAnimation,
          rotation: zombie.rotation + deltaTime * 0.01
        };
      }

      // Spawn animation
      if (zombie.scale < 1) {
        return {
          ...zombie,
          scale: Math.min(1, zombie.scale + deltaTime * 0.003),
          opacity: Math.min(1, zombie.opacity + deltaTime * 0.003)
        };
      }

      // Movement
      const speed = config.baseZombieSpeed * ZOMBIE_CONFIGS[zombie.type].speed * config.difficultyMultiplier;
      const freezeActive = gameState.activePowerUps.has('freeze');
      const actualSpeed = freezeActive ? speed * 0.2 : speed;
      
      const newX = zombie.position.x - actualSpeed * (deltaTime / 1000);
      const wobble = Math.sin(timestamp / 200 + zombie.id.charCodeAt(0)) * 2;

      // Check if reached safe zone
      if (newX < GAME_CONSTANTS.SAFE_ZONE_WIDTH) {
        // Damage player
        soundManagerRef.current.play('damage');
        setGameState(prev => ({
          ...prev,
          health: Math.max(0, prev.health - GAME_CONSTANTS.ZOMBIE_DAMAGE),
          combo: 0,
          screenShake: { intensity: 10, duration: 150 }
        }));

        if (gameState.health - GAME_CONSTANTS.ZOMBIE_DAMAGE <= 0) {
          setGameState(prev => ({ ...prev, gameStatus: 'gameOver' }));
        }

        return null; // Remove zombie
      }

      return {
        ...zombie,
        position: { x: newX, y: zombie.position.y + wobble },
        damageFlash: Math.max(0, zombie.damageFlash - deltaTime * 0.05)
      };
    }).filter(Boolean) as Zombie[]);

    // Update particles
    setParticles(prev => prev
      .map(p => ({
        ...p,
        position: {
          x: p.position.x + p.velocity.vx * (deltaTime / 1000),
          y: p.position.y + p.velocity.vy * (deltaTime / 1000) + 100 * (deltaTime / 1000) * (deltaTime / 1000)
        },
        velocity: {
          vx: p.velocity.vx * 0.98,
          vy: p.velocity.vy * 0.98
        },
        life: p.life - deltaTime / 1000,
        opacity: p.life / p.maxLife,
        rotation: p.rotation + p.rotationSpeed * (deltaTime / 1000),
        size: p.size * p.life
      }))
      .filter(p => p.life > 0)
    );

    // Update power-ups
    setPowerUps(prev => prev.map(p => ({
      ...p,
      position: {
        x: p.position.x,
        y: p.position.y + p.velocity.vy * (deltaTime / 1000)
      },
      rotation: p.rotation + deltaTime * 0.002
    })).filter(p => p.position.y < GAME_CONSTANTS.CANVAS_HEIGHT));

    // Update screen shake
    setGameState(prev => ({
      ...prev,
      lastFrameTime: timestamp,
      deltaTime,
      screenShake: {
        intensity: prev.screenShake.intensity * 0.9,
        duration: Math.max(0, prev.screenShake.duration - deltaTime)
      }
    }));

    gameLoopRef.current = requestAnimationFrame(gameLoopRefInner.current);
  }, [gameState, config, gameState.activePowerUps]);
  
  // Store the game loop in ref after definition
  useEffect(() => {
    gameLoopRefInner.current = gameLoop;
  }, [gameLoop]);

  // Spawn timer
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const spawnInterval = Math.max(
      GAME_CONSTANTS.MIN_SPAWN_INTERVAL,
      GAME_CONSTANTS.BASE_SPAWN_INTERVAL - gameState.level * 150
    );

    spawnTimerRef.current = window.setInterval(() => {
      if (zombies.length < 5 + gameState.level * 2) {
        // Spawn boss every 20 kills
        const shouldSpawnBoss = gameState.zombiesKilled > 0 && gameState.zombiesKilled % 20 === 0;
        spawnZombie(shouldSpawnBoss);
      }
    }, spawnInterval);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameState.gameStatus, gameState.level, zombies.length, spawnZombie, gameState.zombiesKilled]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.gameStatus, gameLoop]);

  // Start game
  const startGame = () => {
    setGameState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      wave: 1,
      zombiesKilled: 0,
      totalZombies: 0,
      wordsTyped: 0,
      accuracy: 100,
      totalAttempts: 0,
      gameStatus: 'playing',
      activePowerUps: new Map(),
      screenShake: { intensity: 0, duration: 0 },
      lastFrameTime: performance.now(),
      deltaTime: 0
    });
    setZombies([]);
    setParticles([]);
    setPowerUps([]);
    setCurrentInput('');
    setTargetZombieId(null);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Render zombie SVG
  const renderZombie = (zombie: Zombie) => {
    const isTargeted = zombie.id === targetZombieId;
    const progress = zombie.typedChars.length / zombie.word.length;
    
    return (
      <div
        key={zombie.id}
        className={`absolute transition-none ${isTargeted ? 'z-20' : 'z-10'}`}
        style={{
          left: zombie.position.x,
          top: zombie.position.y,
          width: zombie.size,
          height: zombie.size * 1.3,
          transform: `translate(-50%, -50%) scale(${zombie.scale}) rotate(${zombie.rotation}deg)`,
          opacity: zombie.opacity,
          filter: zombie.damageFlash > 0 ? `brightness(2) drop-shadow(0 0 10px #ff0000)` : undefined
        }}
      >
        {/* Zombie body */}
        <svg viewBox="0 0 60 78" className="w-full h-full">
          {/* Shadow */}
          <ellipse cx="30" cy="75" rx="20" ry="5" fill="rgba(0,0,0,0.3)" />
          
          {/* Legs */}
          <rect x="18" y="55" width="10" height="22" rx="3" fill={zombie.color} />
          <rect x="32" y="55" width="10" height="22" rx="3" fill={zombie.color} />
          
          {/* Body */}
          <rect x="12" y="28" width="36" height="32" rx="8" fill={zombie.color} />
          
          {/* Arms */}
          <rect x="2" y="30" width="12" height="24" rx="5" fill={zombie.color} 
                transform={`rotate(${-15 + Math.sin(Date.now()/300)*10} 8 42)`} />
          <rect x="46" y="30" width="12" height="24" rx="5" fill={zombie.color}
                transform={`rotate(${15 - Math.sin(Date.now()/300)*10} 52 42)`} />
          
          {/* Head */}
          <circle cx="30" cy="18" r="16" fill={zombie.color} />
          
          {/* Eyes */}
          <circle cx="24" cy="14" r="4" fill="#ffff00" className="animate-pulse" />
          <circle cx="36" cy="14" r="4" fill="#ffff00" className="animate-pulse" />
          <circle cx="24" cy="14" r="2" fill="#000" />
          <circle cx="36" cy="14" r="2" fill="#000" />
          
          {/* Mouth */}
          <path d="M 22 24 Q 30 30 38 24" stroke="#000" strokeWidth="2" fill="none" />
          
          {/* Boss crown */}
          {zombie.isBoss && (
            <>
              <polygon points="30,0 35,8 45,8 37,14 40,24 30,18 20,24 23,14 15,8 25,8" 
                       fill="#ffd700" stroke="#daa520" strokeWidth="1" />
              <text x="30" y="-5" textAnchor="middle" fontSize="8" fill="#ff0000" fontWeight="bold">
                BOSS
              </text>
            </>
          )}
          
          {/* Type-specific features */}
          {zombie.type === 'fast' && (
            <>
              <line x1="48" y1="38" x2="58" y2="34" stroke="#c74b4b" strokeWidth="3" />
              <line x1="48" y1="44" x2="58" y2="46" stroke="#c74b4b" strokeWidth="3" />
            </>
          )}
          {zombie.type === 'tank' && (
            <rect x="8" y="26" width="44" height="36" rx="4" fill="none" stroke="#2c3e50" strokeWidth="3" />
          )}
          {zombie.type === 'ghost' && (
            <circle cx="30" cy="39" r="22" fill="url(#ghostPattern)" opacity="0.5" />
          )}
          {zombie.type === 'exploder' && (
            <circle cx="30" cy="44" r="8" fill="#ff4500" opacity="0.6" className="animate-pulse" />
          )}

          {/* Health bar */}
          <rect x="5" y="-8" width={zombie.size - 10} height="6" rx="3" fill="#333" />
          <rect x="5" y="-8" width={(zombie.size - 10) * (zombie.health / zombie.maxHealth)} height="6" rx="3" 
                fill={zombie.health > zombie.maxHealth * 0.5 ? '#4caf50' : zombie.health > zombie.maxHealth * 0.25 ? '#ff9800' : '#f44336'} />
        </svg>

        {/* Word display */}
        <div 
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 font-mono font-bold text-lg whitespace-nowrap px-3 py-1 rounded-lg ${
            isTargeted 
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-110' 
              : 'bg-black/70 text-white'
          }`}
        >
          {zombie.word.split('').map((char, i) => (
            <span 
              key={i}
              className={i < zombie.typedChars.length ? 'text-green-400 line-through' : ''}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Target indicator */}
        {isTargeted && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15 9L22 10L17 15L18 22L12 19L6 22L7 15L2 10L9 9L12 2Z" 
                    fill="#ff0000" stroke="#ffff00" strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  // Render particle
  const renderParticle = (particle: Particle) => {
    if (particle.type === 'text') {
      return (
        <div
          key={particle.id}
          className="absolute font-bold pointer-events-none"
          style={{
            left: particle.position.x,
            top: particle.position.y,
            color: particle.color,
            fontSize: particle.size * 4,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}rad)`
          }}
        >
          +{Math.floor(particle.size * 10)}
        </div>
      );
    }

    return (
      <div
        key={particle.id}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: particle.position.x,
          top: particle.position.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          transform: `translate(-50%, -50%) rotate(${particle.rotation}rad)`,
          boxShadow: particle.type === 'explosion' ? `0 0 ${particle.size}px ${particle.color}` : undefined
        }}
      />
    );
  };

  // Render power-up
  const renderPowerUp = (powerUp: PowerUp) => {
    const icons: Record<PowerUpType, string> = {
      freeze: '❄️',
      nuke: '💥',
      rapidFire: '⚡',
      shield: '🛡️',
      heal: '❤️',
      multiKill: '⚔️'
    };

    return (
      <div
        key={powerUp.id}
        className="absolute cursor-pointer hover:scale-125 transition-transform animate-spin"
        style={{
          left: powerUp.position.x,
          top: powerUp.position.y,
          width: powerUp.size,
          height: powerUp.size,
          transform: `translate(-50%, -50%) rotate(${powerUp.rotation}rad)`
        }}
        onClick={() => collectPowerUp(powerUp.id)}
      >
        <div className="text-2xl">{icons[powerUp.type]}</div>
      </div>
    );
  };

  // Collect power-up
  const collectPowerUp = (id: string) => {
    const powerUp = powerUps.find(p => p.id === id);
    if (!powerUp) return;

    soundManagerRef.current.play('powerup');
    createParticles(powerUp.position.x, powerUp.position.y, 10, 'spark', '#ffd700');

    setGameState(prev => {
      const newPowerUps = new Map(prev.activePowerUps);
      newPowerUps.set(powerUp.type, Date.now() + powerUp.duration);
      return { ...prev, activePowerUps: newPowerUps };
    });

    setPowerUps(prev => prev.filter(p => p.id !== id));
  };

  // Screen shake effect
  const getScreenShakeStyle = () => {
    if (gameState.screenShake.intensity < 0.5) return {};
    
    const x = (Math.random() - 0.5) * gameState.screenShake.intensity;
    const y = (Math.random() - 0.5) * gameState.screenShake.intensity;
    return { transform: `translate(${x}px, ${y}px)` };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black overflow-hidden select-none">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main menu */}
      {gameState.gameStatus === 'menu' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-8 p-12 bg-gray-800/90 rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
                🧟 ZOMBIE
              </h1>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                TYPING MASTER
              </h2>
            </div>
            
            <p className="text-gray-400 text-lg">Type to kill zombies before they reach you!</p>
            
            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl font-bold rounded-xl 
                       hover:from-red-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-200
                       shadow-lg shadow-red-500/50 hover:shadow-red-500/80"
            >
              START GAME
            </button>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 pt-4 border-t border-gray-700">
              <div>⌨️ Type Words</div>
              <div>🎯 Kill Zombies</div>
              <div>🏆 Survive!</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {(gameState.gameStatus === 'gameOver' || gameState.gameStatus === 'victory') && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-sm">
          <div className="text-center space-y-6 p-12 bg-gray-800/95 rounded-3xl border border-red-500/50 shadow-2xl">
            <h2 className={`text-6xl font-black ${
              gameState.gameStatus === 'victory' ? 'text-green-400' : 'text-red-500'
            }`}>
              {gameState.gameStatus === 'victory' ? '🏆 VICTORY!' : '💀 GAME OVER'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-left bg-black/30 p-6 rounded-xl">
              <div>
                <p className="text-gray-400">Final Score</p>
                <p className="text-3xl font-bold text-yellow-400">{gameState.score.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Max Combo</p>
                <p className="text-3xl font-bold text-orange-400">{gameState.maxCombo}x</p>
              </div>
              <div>
                <p className="text-gray-400">Zombies Killed</p>
                <p className="text-3xl font-bold text-red-400">{gameState.zombiesKilled}</p>
              </div>
              <div>
                <p className="text-gray-400">Words Typed</p>
                <p className="text-3xl font-bold text-green-400">{gameState.wordsTyped}</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl 
                       hover:from-green-500 hover:to-emerald-500 transform hover:scale-105 transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Game HUD */}
      <div className="relative z-30 p-4">
        <div className="flex justify-between items-start max-w-[1200px] mx-auto">
          {/* Left HUD */}
          <div className="space-y-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/30">
              <p className="text-xs text-gray-400">SCORE</p>
              <p className="text-2xl font-bold text-yellow-400">{gameState.score.toLocaleString()}</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-500/30">
              <p className="text-xs text-gray-400">COMBO</p>
              <p className={`text-2xl font-bold ${gameState.combo >= 10 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>
                {gameState.combo}x
              </p>
            </div>
          </div>

          {/* Center - Level & Wave */}
          <div className="text-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-6 py-2 border border-purple-500/30 inline-block">
              <p className="text-xs text-gray-400">LEVEL {gameState.level}</p>
              <p className="text-lg font-bold text-purple-400">Wave {gameState.wave}</p>
            </div>
          </div>

          {/* Right HUD - Health */}
          <div className="w-64">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-500/30">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-400">HEALTH</p>
                <p className="text-sm font-bold text-green-400">{gameState.health}/{gameState.maxHealth}</p>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${(gameState.health / gameState.maxHealth) * 100}%`,
                    background: gameState.health > 50 ? 'linear-gradient(to right, #22c55e, #16a34a)' :
                               gameState.health > 25 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                               'linear-gradient(to right, #ef4444, #dc2626)'
                  }}
                />
              </div>
            </div>

            {/* Active Power-ups */}
            {gameState.activePowerUps.size > 0 && (
              <div className="flex gap-1 mt-2">
                {[...gameState.activePowerUps.entries()].map(([type, expiry]) => (
                  <div key={type} className="bg-blue-500/30 rounded px-2 py-1 text-xs text-blue-300">
                    {type}: {Math.ceil((expiry - Date.now()) / 1000)}s
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative mx-auto overflow-hidden rounded-2xl border-4 border-red-900/50 shadow-2xl shadow-red-900/20"
        style={{ 
          width: GAME_CONSTANTS.CANVAS_WIDTH, 
          height: GAME_CONSTANTS.CANVAS_HEIGHT,
          ...getScreenShakeStyle()
        }}
      >
        {/* Safe zone (left side) */}
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-900/30 to-transparent flex items-center justify-center"
             style={{ width: GAME_CONSTANTS.SAFE_ZONE_WIDTH }}>
          <div className="transform -rotate-90 text-green-400/50 font-bold tracking-widest text-sm">
            SAFE ZONE
          </div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent" />

        {/* Zombies */}
        {zombies.map(renderZombie)}

        {/* Particles */}
        {particles.map(renderParticle)}

        {/* Power-ups */}
        {powerUps.map(renderPowerUp)}

        {/* Input field (hidden but focused) */}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 px-6 py-4 bg-black/80 backdrop-blur-md border-2 border-red-500/50 rounded-xl text-2xl font-mono text-center text-white placeholder-gray-500 outline-none focus:border-red-400 focus:shadow-lg focus:shadow-red-500/30 transition-all z-40"
          placeholder="Type the words..."
          autoComplete="off"
          autoCapitalize="characters"
        />

        {/* Current input display above input field */}
        {currentInput && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
            <div className="px-6 py-3 bg-red-600/90 rounded-lg text-3xl font-mono font-bold text-white shadow-lg">
              {currentInput}
              <span className="animate-pulse ml-2">|</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions footer */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>Type the words above zombies to kill them • Don't let them reach the safe zone! • Build combos for bonus points!</p>
      </div>

      {/* SVG Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="ghostPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="#9b59b6" fillOpacity="0.3"/>
            <rect width="2" height="2" fill="#ffffff" fillOpacity="0.1"/>
          </pattern>
        </defs>
      </svg>
    </div>
  );
}

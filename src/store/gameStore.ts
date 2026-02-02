import { create } from 'zustand';

// Constants for game balance
const BASE_MONSTER_SPEED = 1.0;
const BASE_MONSTER_HP = 50;
const BASE_PLAYER_HP = 100;
const INITIAL_MONSTERS_PER_WAVE = 3;
const GAME_TICK_RATE = 1000 / 60; // 60 FPS

export interface Skill {
  id: string;
  name: string;
  description: string;
  effect: (state: GameState) => GameState; // Function to apply the skill's effect
  icon?: string; // Optional icon path or emoji
}

interface Monster {
  id: string;
  word: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
}

interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

interface GameState {
  player: Player;
  monsters: Monster[];
  currentWave: number;
  score: number;
  combo: number;
  inputWord: string;
  isGameOver: boolean;
  gameWidth: number;
  gameHeight: number;
  intervalRef: ReturnType<typeof setInterval> | null;
  
  availableSkills: Skill[];
  activeSkills: Skill[];

  setDimensions: (width: number, height: number) => void;
  setPlayer: (player: Player) => void;
  addMonster: (monster: Monster) => void;
  removeMonster: (id: string) => void;
  moveMonsters: () => void;
  updateInputWord: (word: string) => void;
  checkInput: () => void;
  takeDamage: (amount: number) => void;
  advanceWave: () => void;
  resetGame: () => void;
  setGameOver: (isOver: boolean) => void;
  spawnMonstersForWave: (wave: number) => void;
  useSkill: (skillId: string) => void;
  
  startGameLoop: () => void;
  stopGameLoop: () => void;
  gameTick: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { x: 0, y: 0, hp: BASE_PLAYER_HP, maxHp: BASE_PLAYER_HP },
  monsters: [],
  currentWave: 1,
  score: 0,
  combo: 0,
  inputWord: '',
  isGameOver: false,
  gameWidth: window.innerWidth,
  gameHeight: window.innerHeight,
  intervalRef: null,

  availableSkills: [],
  activeSkills: [],

  setDimensions: (width, height) => set({ gameWidth: width, gameHeight: height }),
  setPlayer: (player) => set({ player }),
  addMonster: (monster) => set((state) => ({ monsters: [...state.monsters, monster] })),
  removeMonster: (id) => set((state) => ({ monsters: state.monsters.filter(m => m.id !== id) })),

  moveMonsters: () => {
    const state = get();
    const playerTargetX = state.gameWidth / 2;
    const playerTargetY = state.gameHeight - 60;

    const updatedMonsters = state.monsters.map(monster => {
      const dx = playerTargetX - monster.x;
      const dy = playerTargetY - monster.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveSpeed = monster.speed;

      let nextX = monster.x;
      let nextY = monster.y;

      if (distance < moveSpeed) {
        nextX = playerTargetX;
        nextY = playerTargetY;
      } else {
        const angle = Math.atan2(dy, dx);
        nextX += Math.cos(angle) * moveSpeed;
        nextY += Math.sin(angle) * moveSpeed;
      }

      return { ...monster, x: nextX, y: nextY };
    });

    const reachedMonsters = updatedMonsters.filter(m => 
      Math.abs(m.x - playerTargetX) < 5 && Math.abs(m.y - playerTargetY) < 5
    );
    
    if (reachedMonsters.length > 0) {
      const damageAmount = reachedMonsters.reduce((sum, m) => sum + m.hp, 0);
      const remainingMonsters = updatedMonsters.filter(m => 
        !(Math.abs(m.x - playerTargetX) < 5 && Math.abs(m.y - playerTargetY) < 5)
      );
      
      set({ monsters: remainingMonsters });
      get().takeDamage(damageAmount);
    } else {
      set({ monsters: updatedMonsters });
    }
  },

  updateInputWord: (word) => set({ inputWord: word }),

  checkInput: () => {
    const state = get();
    let newScore = state.score;
    let newCombo = state.combo;
    let monstersAfterCheck = [...state.monsters];

    const matchingMonster = state.monsters.find(m => m.word === state.inputWord);

    if (matchingMonster) {
      newScore += 100 * (state.combo + 1);
      newCombo += 1;
      monstersAfterCheck = state.monsters.filter(m => m.id !== matchingMonster.id);
      
      if (state.activeSkills.some(skill => skill.id === 'chain_lightning')) {
          const otherMonsters = monstersAfterCheck.filter(m => m.id !== matchingMonster.id);
          if (otherMonsters.length > 0 && Math.random() < 0.3) {
              const additionalTarget = otherMonsters[Math.floor(Math.random() * otherMonsters.length)];
              const damageToAdditional = Math.round(matchingMonster.hp * 0.3);
              const updatedMonstersWithChain = monstersAfterCheck.map(m => 
                  m.id === additionalTarget.id ? {...m, hp: m.hp - damageToAdditional} : m
              ).filter(m => m.hp > 0);
              monstersAfterCheck = updatedMonstersWithChain;
          }
      }
       if (state.activeSkills.some(skill => skill.id === 'vampiric_touch')) {
           const healAmount = 1;
           set(state => ({
               player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + healAmount) }
           }));
       }

    } else if (state.inputWord.length > 0) {
      newCombo = 0; 
    }
    
    set({
      monsters: monstersAfterCheck,
      score: newScore,
      combo: newCombo,
      inputWord: '',
    });
  },

  takeDamage: (amount) => {
    set((state) => {
      const hasShield = state.activeSkills.some(skill => skill.id === 'shield_barrier');
      let damageToApply = amount;
      
      if (hasShield) {
          damageToApply = 0;
      }

      const healthToReduce = damageToApply > 0 ? amount : 0;
      const newHp = state.player.hp - healthToReduce;
      
      if (newHp <= 0) {
        state.setGameOver(true);
        state.stopGameLoop();
        return { player: { ...state.player, hp: 0 }, isGameOver: true, combo: 0 };
      }
      return { player: { ...state.player, hp: Math.max(0, newHp) }, combo: 0 };
    });
  },

  advanceWave: () => {
    set((state) => {
      const nextWave = state.currentWave + 1;
      state.spawnMonstersForWave(nextWave); 
      const updatedPlayerMaxHp = BASE_PLAYER_HP * (1 + (nextWave - 1) * 0.02);
      return { 
        currentWave: nextWave, 
        player: { ...state.player, maxHp: updatedPlayerMaxHp, hp: Math.min(state.player.hp + (updatedPlayerMaxHp - state.player.hp) * 0.2, updatedPlayerMaxHp) }
      };
    });
  },

  resetGame: () => {
    get().stopGameLoop();
    set({
      player: { x: 0, y: 0, hp: BASE_PLAYER_HP, maxHp: BASE_PLAYER_HP },
      monsters: [],
      currentWave: 1,
      score: 0,
      combo: 0,
      inputWord: '',
      isGameOver: false,
      availableSkills: [],
      activeSkills: [],
    });
    get().spawnMonstersForWave(1);
    get().startGameLoop();
  },

  setGameOver: (isOver) => set({ isGameOver: isOver }),
  
  spawnMonstersForWave: (wave) => {
    const state = get();
    const monstersToSpawnCount = INITIAL_MONSTERS_PER_WAVE + Math.ceil(wave * 0.8);
    const newMonsters: Monster[] = [];
    const words = ['react', 'code', 'game', 'skill', 'vite', 'claw', 'turbo', 'speed', 'logic', 'state', 'props', 'hooks', 'store', 'types', 'build', 'deploy', 'pages', 'actions', 'commit', 'error', 'debug', 'test', 'fetch', 'async', 'await', 'query', 'mutation', 'render']; 
    
    const waveMultiplier = 1 + (wave - 1) * 0.15;
    const currentMonsterSpeed = BASE_MONSTER_SPEED * (1 + (wave - 1) * 0.08);
    const currentMonsterHp = BASE_MONSTER_HP * waveMultiplier;

    for (let i = 0; i < monstersToSpawnCount; i++) {
      const newMonsterId = `monster-${Date.now()}-${Math.random()}`;
      const randomWord = words[Math.floor(Math.random() * words.length)];
      
      const spawnX = Math.random() * state.gameWidth;
      const spawnY = Math.random() * (state.gameHeight * 0.6);
      
      newMonsters.push({
        id: newMonsterId,
        word: randomWord,
        x: spawnX,
        y: spawnY,
        speed: currentMonsterSpeed,
        hp: currentMonsterHp,
        maxHp: currentMonsterHp,
      });
    }
    set({ monsters: [...state.monsters, ...newMonsters] });
  },

  useSkill: (skillId: string) => {
    set((state) => {
      const skillToActivate = state.availableSkills.find(skill => skill.id === skillId);
      if (!skillToActivate) return state;

      const isSkillAlreadyActive = state.activeSkills.some(s => s.id === skillId);
      if (isSkillAlreadyActive) return state;

      const newState = {
        ...state,
        activeSkills: [...state.activeSkills, skillToActivate],
        availableSkills: state.availableSkills.filter(skill => skill.id !== skillId),
      };
      return newState;
    });
  },

  startGameLoop: () => {
    const state = get();
    if (state.intervalRef === null && !state.isGameOver) {
      const newIntervalRef = setInterval(() => {
        get().gameTick();
      }, GAME_TICK_RATE);
      set({ intervalRef: newIntervalRef });
    }
  },
  stopGameLoop: () => {
    const { intervalRef } = get();
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      set({ intervalRef: null });
    }
  },
  gameTick: () => { 
    const state = get();
    if (state.isGameOver) {
      state.stopGameLoop();
      return;
    }

    if (state.player.x === 0 && state.player.y === 0 && state.gameWidth > 0 && state.gameHeight > 0) {
      const playerTargetX = state.gameWidth / 2;
      const playerTargetY = state.gameHeight - 60;
      set({ player: { ...state.player, x: playerTargetX, y: playerTargetY } });
    }
    
    state.moveMonsters(); 

    if (state.activeSkills.some(skill => skill.id === 'fire_aura')) {
        const nearbyMonsters = state.monsters.filter(m => {
            const dx = state.player.x - m.x;
            const dy = state.player.y - m.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            return distance < 70;
        });
        
        if(nearbyMonsters.length > 0) {
            const auraDamage = 5;
            const updatedMonsters = state.monsters.map(m => {
                if (nearbyMonsters.some(nm => nm.id === m.id)) {
                    return { ...m, hp: Math.max(0, m.hp - auraDamage) };
                }
                return m;
            }).filter(m => m.hp > 0);
            set({ monsters: updatedMonsters });
        }
    }
  },
}));

export const ALL_SKILLS: Skill[] = [
  {
    id: 'chain_lightning',
    name: '연쇄 번개',
    description: '처치 시 30% 확률로 주변 적 1기 추가 처치 (데미지: 30% of defeated monster HP)',
    effect: (state) => { 
      return state;
    },
    icon: '⚡',
  },
  {
    id: 'shield_barrier',
    name: '보호막',
    description: '처음 받는 피해 1회 무효화',
    effect: (state) => {
      return state;
    },
    icon: '🛡️',
  },
  {
    id: 'fire_aura',
    name: '화염 오라',
    description: '가까운 적에게 초당 5 피해',
    effect: (state) => {
      return state;
    },
    icon: '🔥',
  },
  {
    id: 'ice_shatter',
    name: '얼음 파편',
    description: '타이핑 시작 시 몬스터 1초 정지 (쿨다운 적용 필요)',
    effect: (state) => {
      return state;
    },
    icon: '❄️',
  },
  {
    id: 'vampiric_touch',
    name: '흡혈',
    description: '몬스터 처치 시 HP 1 회복 (쿨다운: 10초)',
    effect: (state) => {
      return state;
    },
    icon: '❤️',
  },
];

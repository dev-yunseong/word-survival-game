import { create } from 'zustand';

// Constants for game balance
const BASE_MONSTER_SPEED = 1.0;
const BASE_MONSTER_HP = 50;
const BASE_PLAYER_HP = 100;
const INITIAL_MONSTERS_PER_WAVE = 3;
const GAME_TICK_RATE = 1000 / 60; // 60 FPS

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

  setDimensions: (width, height) => set({ gameWidth: width, gameHeight: height }),
  setPlayer: (player) => set({ player }),
  addMonster: (monster) => set((state) => ({ monsters: [...state.monsters, monster] })),
  removeMonster: (id) => set((state) => ({ monsters: state.monsters.filter(m => m.id !== id) })),

  moveMonsters: () => {
    const state = get();
    const playerTargetX = state.gameWidth / 2;
    const playerTargetY = state.gameHeight - 50;

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
    const state = get();
    const newHp = state.player.hp - amount;
    
    if (newHp <= 0) {
      set({ 
        player: { ...state.player, hp: 0 }, 
        isGameOver: true, 
        combo: 0 
      });
      get().stopGameLoop();
    } else {
      set({ 
        player: { ...state.player, hp: Math.max(0, newHp) }, 
        combo: 0 
      });
    }
  },

  advanceWave: () => {
    const state = get();
    const nextWave = state.currentWave + 1;
    set({ 
      currentWave: nextWave,
      player: { 
        ...state.player, 
        maxHp: BASE_PLAYER_HP * (1 + (nextWave - 1) * 0.02) 
      }
    });
    get().spawnMonstersForWave(nextWave);
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
    });
    get().spawnMonstersForWave(1);
    get().startGameLoop();
  },

  setGameOver: (isOver) => set({ isGameOver: isOver }),

  spawnMonstersForWave: (wave) => {
    const state = get();
    const monstersToSpawnCount = INITIAL_MONSTERS_PER_WAVE + Math.floor(wave * 0.8);
    const newMonsters: Monster[] = [];
    const words = ['react', 'code', 'game', 'skill', 'vite', 'claw', 'turbo', 'speed', 'logic', 'state', 'props', 'hooks', 'store', 'types', 'build', 'deploy', 'pages', 'actions', 'commit', 'error', 'debug', 'test', 'fetch'];

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
    const state = get();
    if (state.intervalRef !== null) {
      clearInterval(state.intervalRef);
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
      const playerTargetY = state.gameHeight - 50;
      set({ player: { ...state.player, x: playerTargetX, y: playerTargetY } });
    }

    state.moveMonsters();
  },
}));

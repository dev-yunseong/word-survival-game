import { create } from 'zustand';

interface Monster {
  id: string;
  word: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
}

interface Player {
  x: number;
  y: number;
  hp: number;
}

interface GameState {
  player: Player;
  monsters: Monster[];
  currentWave: number;
  score: number;
  combo: number;
  inputWord: string;
  isGameOver: boolean;

  // Actions
  setPlayer: (player: Player) => void;
  addMonster: (monster: Monster) => void;
  removeMonster: (id: string) => void;
  moveMonsters: () => void;
  updateInputWord: (word: string) => void;
  checkInput: () => void;
  takeDamage: (amount: number) => void;
  levelUp: () => void;
  resetGame: () => void;
  setGameOver: (isOver: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { x: 0, y: 0, hp: 100 },
  monsters: [],
  currentWave: 1,
  score: 0,
  combo: 0,
  inputWord: '',
  isGameOver: false,

  setPlayer: (player) => set({ player }),
  addMonster: (monster) => set((state) => ({ monsters: [...state.monsters, monster] })),
  removeMonster: (id) => set((state) => ({ monsters: state.monsters.filter(m => m.id !== id) })),
  moveMonsters: () => {
    set((state) => {
      const gameWidth = window.innerWidth; // Assuming game width is viewport width, adjust as needed
      const gameHeight = window.innerHeight; // Assuming game height is viewport height, adjust as needed
      const playerTargetX = gameWidth / 2; // Assuming player is centered horizontally

      const updatedMonsters = state.monsters.map(monster => {
        // Simplified movement: move towards player's X position
        const dx = playerTargetX - monster.x;
        const speed = monster.speed;
        const distance = Math.sqrt(dx * dx);
        
        if (distance < speed) { // Monster reached player's X position
          return { ...monster, x: playerTargetX };
        }

        // Move towards player's X position
        const angle = Math.atan2(0, dx); // Angle towards player's Y (assuming player is at a fixed Y or center)
        const nextX = monster.x + Math.cos(angle) * speed;
        
        return { ...monster, x: nextX };
      });

      // Check if any monster reached the player
      const reachedMonsters = updatedMonsters.filter(m => m.x >= playerTargetX);
      if (reachedMonsters.length > 0) {
        const damageAmount = reachedMonsters.reduce((sum, m) => sum + m.hp, 0); // Example: sum of monster HP
        state.takeDamage(damageAmount); // Apply damage
        
        // Remove monsters that reached (and dealt damage)
        const remainingMonsters = updatedMonsters.filter(m => m.x < playerTargetX);
        return { monsters: remainingMonsters };
      }

      return { monsters: updatedMonsters };
    });
  },
  updateInputWord: (word) => set({ inputWord: word }),
  checkInput: () => {
    set((state) => {
      const matchedMonster = state.monsters.find(m => m.word.startsWith(state.inputWord));
      if (matchedMonster && matchedMonster.word === state.inputWord) {
        // Monster defeated
        state.removeMonster(matchedMonster.id);
        set((s) => ({
          score: s.score + 100 * (s.combo + 1), // Score increases with combo
          combo: s.combo + 1,
        }));
        // Potentially trigger level up based on score or monster defeated count
        // state.levelUp(); // Example
      } else if (matchedMonster) {
        // Partial match, do nothing yet, just update inputWord
      } else {
        // No match, reset input or penalize (e.g., clear combo)
        set({ combo: 0 }); // Reset combo on incorrect input
      }
      set({ inputWord: '' }); // Clear input after check
    });
  },
  takeDamage: (amount) => {
    set((state) => {
      const newHp = state.player.hp - amount;
      if (newHp <= 0) {
        state.setGameOver(true);
        return { player: { ...state.player, hp: 0 }, isGameOver: true };
      }
      return { player: { ...state.player, hp: newHp }, combo: 0 }; // Reset combo on damage
    });
  },
  levelUp: () => {
    // Placeholder for level-up logic
    // Increase wave, speed, maybe player stats or unlock skills
    set((state) => ({
      currentWave: state.currentWave + 1,
      // Potentially increase monster speed or spawn rate
    }));
    console.log('Level Up! Current Wave:', get().currentWave);
  },
  resetGame: () => {
    set({
      player: { x: 0, y: 0, hp: 100 },
      monsters: [],
      currentWave: 1,
      score: 0,
      combo: 0,
      inputWord: '',
      isGameOver: false,
    });
    // Potentially restart game loop, spawn initial monsters
  },
  setGameOver: (isOver) => set({ isGameOver: isOver }),
}));

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const GAME_TICK_RATE = 1000 / 60; // 60 FPS

const useGameLoop = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const monsters = useGameStore((state) => state.monsters);
  const player = useGameStore((state) => state.player);
  const isGameOver = useGameStore((state) => state.isGameOver);

  const gameTick = () => {
    const playerX = player.x; // Current player x position from store
    const gameWidth = window.innerWidth; // Get current game width
    const gameHeight = window.innerHeight; // Get current game height
    const gameBoard = document.querySelector('.game-board') as HTMLElement; // get game board for positioning
    
    if (gameBoard) {
        const playerTargetX = gameBoard.offsetWidth / 2; // center of the game board
        const playerTargetY = gameBoard.offsetHeight - 50; // player position from bottom adjusted for component
        
        // Update player position if it wasn't set correctly initially or if window resizes
        if (useGameStore.getState().player.x === 0 || useGameStore.getState().player.y === 0) {
            useGameStore.setState({
                player: {
                    ...player,
                    x: playerTargetX,
                    y: playerTargetY,
                },
            });
        }
        
        useGameStore.getState().moveMonsters(); // Move monsters
        
        // Basic monster spawning logic (will be improved with waves)
        // Only spawn if game is not over and there are fewer than X monsters
        const currentMonsters = useGameStore.getState().monsters;
        if (!isGameOver && currentMonsters.length < 5) { // Limit number of active monsters
            const newMonsterId = `monster-${Date.now()}-${Math.random()}`;
            const words = ['react', 'code', 'game', 'skill', 'vite', 'claw']; // Example words
            const randomWord = words[Math.floor(Math.random() * words.length)];
            
            const spawnX = Math.random() * gameBoard.offsetWidth;
            const spawnY = Math.random() * (gameBoard.offsetHeight * 0.6); // Spawn in upper 60%

            useGameStore.getState().addMonster({
                id: newMonsterId,
                word: randomWord,
                x: spawnX,
                y: spawnY,
                speed: Math.random() * 2 + 1, // Random speed between 1 and 3
                hp: 50, // Example HP
            });
        }

        // Check for game over condition if player HP drops to 0
        if (player.hp <= 0) {
            useGameStore.getState().setGameOver(true);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }
  };

  const start = () => {
    if (intervalRef.current === null) {
      if (!isGameOver) { // Only start if game is not over
        intervalRef.current = setInterval(gameTick, GAME_TICK_RATE);
        console.log('Game loop started.');
      }
    }
  };

  const stop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Game loop stopped.');
    }
  };

  // Effect to manage starting/stopping the game loop based on game state
  useEffect(() => {
     if (!isGameOver) {
       start();
     } else {
       stop();
     }
     // Cleanup on unmount
    return () => stop();
  }, [isGameOver, start, stop]); // Depend on isGameOver to control loop

  return { start, stop };
};

export default useGameLoop;

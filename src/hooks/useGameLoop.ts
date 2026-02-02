import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const useGameLoop = () => {
  const startGameLoop = useGameStore((state) => state.startGameLoop);
  const stopGameLoop = useGameStore((state) => state.stopGameLoop);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const monsters = useGameStore((state) => state.monsters);
  const advanceWave = useGameStore((state) => state.advanceWave);
  const spawnMonstersForWave = useGameStore((state) => state.spawnMonstersForWave);
  const currentWave = useGameStore((state) => state.currentWave);
  const setDimensions = useGameStore((state) => state.setDimensions);

  // Initialize game dimensions
  useEffect(() => {
    const updateGameDimensions = () => {
      const gameBoard = document.querySelector('.game-board') as HTMLElement;
      if (gameBoard) {
        setDimensions(gameBoard.offsetWidth, gameBoard.offsetHeight);
      } else {
        setDimensions(window.innerWidth, window.innerHeight);
      }
    };

    updateGameDimensions();
    window.addEventListener('resize', updateGameDimensions);
    return () => window.removeEventListener('resize', updateGameDimensions);
  }, [setDimensions]);

  // Start game loop on mount
  useEffect(() => {
    if (!isGameOver) {
      spawnMonstersForWave(1);
      startGameLoop();
    }
    return () => stopGameLoop();
  }, []);

  // Handle wave progression
  useEffect(() => {
    if (!isGameOver && monsters.length === 0 && currentWave >= 1) {
      const waveTimer = setTimeout(() => {
        if (!useGameStore.getState().isGameOver) {
          advanceWave();
        }
      }, 2000);

      return () => clearTimeout(waveTimer);
    }
  }, [isGameOver, monsters.length, currentWave, advanceWave]);

  return { start: startGameLoop, stop: stopGameLoop };
};

export default useGameLoop;

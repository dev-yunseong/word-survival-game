import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import Player from './Player';
import Monster from './Monster';
import WordInput from './WordInput';
import GameHUD from './GameHUD';
import useGameLoop from '@/hooks/useGameLoop'; // Assuming this hook will be created

const GameBoard: React.FC = () => {
  const monsters = useGameStore((state) => state.monsters);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const player = useGameStore((state) => state.player); // Assuming Player component will use player state

  // Initialize game loop
  const { start, stop } = useGameLoop();

  useEffect(() => {
    start();
    // Cleanup function to stop the game loop when the component unmounts
    return () => stop();
  }, [start, stop]);

  // The actual game board dimensions might be dynamically set or based on CSS
  // For now, let's assume it takes up available space.
  // The player's starting position will be centered.
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePlayerPosition = () => {
      if (gameContainerRef.current) {
        const containerRect = gameContainerRef.current.getBoundingClientRect();
        // Center the player horizontally, Y position can be adjusted as needed (e.g., bottom center)
        useGameStore.setState({
          player: {
            ...player,
            x: containerRect.width / 2,
            y: containerRect.height - 50, // Example: position player near the bottom
          },
        });
      }
    };

    updatePlayerPosition();
    window.addEventListener('resize', updatePlayerPosition);
    return () => window.removeEventListener('resize', updatePlayerPosition);
  }, [player]); // Re-run if player object changes significantly (less likely here, but good practice)

  if (isGameOver) {
    return (
      <div className="game-over-container">
        <GameHUD /> {/* Display score etc. */}
        <h1>Game Over!</h1>
        <p>Your Score: {useGameStore.getState().score}</p>
        <button onClick={() => useGameStore.getState().resetGame()}>Restart Game</button>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="game-board" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#222' }}>
      <GameHUD />
      <Player /> {/* Player component will read player state */}
      {monsters.map((monster) => (
        <Monster key={monster.id} {...monster} />
      ))}
      <WordInput />
    </div>
  );
};

export default GameBoard;

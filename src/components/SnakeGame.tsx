import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Game state refs to avoid dependency issues in requestAnimationFrame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const lastUpdateRef = useRef<number>(0);
  const gameOverRef = useRef(false);
  const isPausedRef = useRef(false);
  const glitchFramesRef = useRef(0);

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    glitchFramesRef.current = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOverRef.current) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
        case ' ':
        case 'p':
        case 'P':
          setIsPaused((prev) => {
            const next = !prev;
            isPausedRef.current = next;
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const deltaTime = timestamp - lastUpdateRef.current;

      // Update logic (runs every ~100ms)
      if (deltaTime > 100 && !gameOverRef.current && !isPausedRef.current) {
        directionRef.current = nextDirectionRef.current;
        const head = snakeRef.current[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Collision detection
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          snakeRef.current.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          gameOverRef.current = true;
          setGameOver(true);
          glitchFramesRef.current = 30; // Trigger death glitch
        } else {
          const newSnake = [newHead, ...snakeRef.current];

          // Food collision
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            setScore((s) => {
              const newScore = s + 10;
              setHighScore((h) => Math.max(h, newScore));
              return newScore;
            });
            foodRef.current = generateFood(newSnake);
            glitchFramesRef.current = 5; // Trigger eat glitch
          } else {
            newSnake.pop();
          }
          snakeRef.current = newSnake;
        }
        lastUpdateRef.current = timestamp;
      }

      // Render logic
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Apply glitch offset if active
      let offsetX = 0;
      let offsetY = 0;
      if (glitchFramesRef.current > 0) {
        offsetX = (Math.random() - 0.5) * 10;
        offsetY = (Math.random() - 0.5) * 10;
        glitchFramesRef.current--;
        
        // Random scanline artifact
        ctx.fillStyle = Math.random() > 0.5 ? '#00FFFF' : '#FF00FF';
        ctx.fillRect(0, Math.random() * CANVAS_SIZE, CANVAS_SIZE, Math.random() * 5);
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Draw Food (Magenta)
      ctx.fillStyle = '#FF00FF';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF00FF';
      ctx.fillRect(foodRef.current.x * TILE_SIZE + 2, foodRef.current.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      // Draw Snake (Cyan)
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
        ctx.shadowBlur = index === 0 ? 20 : 10;
        ctx.shadowColor = '#00FFFF';
        ctx.fillRect(segment.x * TILE_SIZE + 1, segment.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full lg:w-auto p-4 font-pixel">
      <div className="flex justify-between w-full mb-4 px-4 text-sm text-[#00FFFF] uppercase tracking-widest">
        <div className="glitch-text inline-block" data-text={`SCORE:${score.toString().padStart(4, '0')}`}>
          SCORE:{score.toString().padStart(4, '0')}
        </div>
        <div className="text-[#FF00FF]">
          HIGH:{highScore.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="relative border-4 border-[#00FFFF] shadow-[0_0_20px_#00FFFF,inset_0_0_20px_#00FFFF] bg-black mt-2">
        <div className="absolute -top-3 left-4 bg-[#00FFFF] text-black text-[10px] px-2 py-1 tracking-widest z-30">
          SNAKE_PROTOCOL.EXE
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
          style={{ width: 'min(90vw, 400px)', height: 'min(90vw, 400px)' }}
        />

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm text-center">
            <h2 className="text-2xl md:text-4xl text-[#FF00FF] mb-4 glitch-text inline-block" data-text="SYSTEM FAILURE">
              SYSTEM FAILURE
            </h2>
            <p className="text-[#00FFFF] mb-6 text-xs md:text-sm">SCORE_LOG: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 border-2 border-[#00FFFF] text-[#00FFFF] text-xs md:text-sm hover:bg-[#00FFFF] hover:text-black transition-colors shadow-[0_0_10px_#00FFFF]"
            >
              [ REBOOT ]
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 text-center">
            <h2 className="text-2xl md:text-3xl text-[#00FFFF] glitch-text tracking-widest inline-block" data-text="PAUSED">
              PAUSED
            </h2>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-[#FF00FF] text-[10px] md:text-xs text-center leading-loose opacity-70">
        INPUT: <span className="text-[#00FFFF]">W A S D</span> / <span className="text-[#00FFFF]">ARROWS</span><br/>
        HALT: <span className="text-[#00FFFF]">SPACE</span>
      </div>
    </div>
  );
}

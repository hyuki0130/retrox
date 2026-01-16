import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Canvas, Rect, RoundedRect, BlurMask } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = Math.floor((width - 32) / GRID_SIZE);
const BOARD_SIZE = CELL_SIZE * GRID_SIZE;
const FRAME_MS = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [_direction, setDirection] = useState<Direction>('RIGHT');

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const spawnFood = (currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      directionRef.current = nextDirectionRef.current;
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameover');
        onGameOver?.(scoreRef.current);
        return;
      }

      // Self collision
      if (currentSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameState('gameover');
        onGameOver?.(scoreRef.current);
        return;
      }

      currentSnake.unshift(head);

      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const newScore = scoreRef.current + 100;
        scoreRef.current = newScore;
        setScore(newScore);
        onScoreChange?.(newScore);
        
        const newFood = spawnFood(currentSnake);
        foodRef.current = newFood;
        setFood(newFood);
      } else {
        currentSnake.pop();
      }

      snakeRef.current = currentSnake;
      setSnake([...currentSnake]);
      setDirection(directionRef.current);
    }, FRAME_MS);

    return () => clearInterval(gameLoop);
  }, [gameState, onGameOver, onScoreChange]);

  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;

    const dx = e.nativeEvent.pageX - touchStartRef.current.x;
    const dy = e.nativeEvent.pageY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) return; // Too short swipe

    const currentDir = directionRef.current;
    let newDir: Direction = currentDir;

    if (absDx > absDy) {
      // Horizontal swipe
      if (dx > 0 && currentDir !== 'LEFT') newDir = 'RIGHT';
      else if (dx < 0 && currentDir !== 'RIGHT') newDir = 'LEFT';
    } else {
      // Vertical swipe
      if (dy > 0 && currentDir !== 'UP') newDir = 'DOWN';
      else if (dy < 0 && currentDir !== 'DOWN') newDir = 'UP';
    }

    nextDirectionRef.current = newDir;
    touchStartRef.current = null;
  };

  const restart = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = spawnFood(initialSnake);
    
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(initialFood);
    foodRef.current = initialFood;
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
  };

  const offsetX = (width - BOARD_SIZE) / 2;

  return (
    <View 
      style={styles.container} 
      testID="snake-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <View style={styles.scoreBar}>
        <Text style={styles.scoreText} testID="snake-score">Score: {score}</Text>
        <Text style={styles.lengthText}>Length: {snake.length}</Text>
      </View>

      <View style={[styles.boardContainer, { marginHorizontal: offsetX }]}>
        <Canvas style={[styles.canvas, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {/* Grid background */}
          <Rect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} color="#111" />
          
          {/* Grid lines */}
          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <Rect x={i * CELL_SIZE} y={0} width={1} height={BOARD_SIZE} color="#1a1a1a" />
              <Rect x={0} y={i * CELL_SIZE} width={BOARD_SIZE} height={1} color="#1a1a1a" />
            </React.Fragment>
          ))}

          {/* Food */}
          <RoundedRect
            x={food.x * CELL_SIZE + 2}
            y={food.y * CELL_SIZE + 2}
            width={CELL_SIZE - 4}
            height={CELL_SIZE - 4}
            r={4}
            color="#ff0066"
          >
            <BlurMask blur={4} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={food.x * CELL_SIZE + 2}
            y={food.y * CELL_SIZE + 2}
            width={CELL_SIZE - 4}
            height={CELL_SIZE - 4}
            r={4}
            color="#ff0066"
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <React.Fragment key={`snake-${index}`}>
              <RoundedRect
                x={segment.x * CELL_SIZE + 1}
                y={segment.y * CELL_SIZE + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                r={index === 0 ? 6 : 3}
                color={index === 0 ? '#00ff9d' : '#00cc7d'}
              >
                {index === 0 && <BlurMask blur={3} style="normal" />}
              </RoundedRect>
              <RoundedRect
                x={segment.x * CELL_SIZE + 1}
                y={segment.y * CELL_SIZE + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                r={index === 0 ? 6 : 3}
                color={index === 0 ? '#00ff9d' : '#00cc7d'}
              />
            </React.Fragment>
          ))}
        </Canvas>
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlHint}>Swipe to change direction</Text>
      </View>

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="snake-gameover">
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore} testID="snake-final-score">Score: {score}</Text>
          <Text style={styles.finalLength}>Length: {snake.length}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="snake-restart">
            <Text style={styles.restartText}>RESTART</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a',
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scoreText: {
    color: '#00ff9d',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  lengthText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  boardContainer: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#00ff9d',
    borderRadius: 4,
  },
  canvas: {
    backgroundColor: '#0a0a0a',
  },
  controls: {
    alignItems: 'center',
    marginTop: 24,
  },
  controlHint: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  gameOverText: { 
    color: '#ff0066', 
    fontSize: 36, 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
  },
  finalScore: { 
    color: '#00ff9d', 
    fontSize: 24, 
    marginTop: 20,
    fontFamily: 'monospace',
  },
  finalLength: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  restartBtn: { 
    marginTop: 30, 
    backgroundColor: '#00ff9d', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 8,
  },
  restartText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

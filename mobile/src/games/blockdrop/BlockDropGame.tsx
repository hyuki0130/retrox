import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';

import { Canvas, Rect, RoundedRect, BlurMask } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = Math.floor((width - 48) / COLS);
const BOARD_WIDTH = CELL_SIZE * COLS;
const BOARD_HEIGHT = CELL_SIZE * ROWS;
const INITIAL_DROP_INTERVAL = 800;
const MIN_DROP_INTERVAL = 100;
const SOFT_DROP_THRESHOLD = 30;
const HARD_DROP_VELOCITY = 800;
const MOVE_THRESHOLD = 20;
const LEVEL_UP_INTERVAL = 10000;

// Tetromino shapes (0-indexed rotations)
const TETROMINOES: { [key: string]: { shape: number[][][]; color: string } } = {
  I: {
    shape: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
    ],
    color: '#00ffff',
  },
  O: {
    shape: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
    ],
    color: '#ffff00',
  },
  T: {
    shape: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]],
    ],
    color: '#aa00ff',
  },
  S: {
    shape: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]],
    ],
    color: '#00ff00',
  },
  Z: {
    shape: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]],
    ],
    color: '#ff0000',
  },
  J: {
    shape: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]],
    ],
    color: '#0000ff',
  },
  L: {
    shape: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]],
    ],
    color: '#ff8800',
  },
};

const PIECE_TYPES = Object.keys(TETROMINOES);

interface Piece {
  type: string;
  x: number;
  y: number;
  rotation: number;
}

interface BlockDropGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

export const BlockDropGame: React.FC<BlockDropGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [board, setBoard] = useState<(string | null)[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<string>(PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]);

  const boardRef = useRef<(string | null)[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const currentPieceRef = useRef<Piece | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const linesRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameStartTimeRef = useRef(Date.now());

  const getRandomPiece = useCallback((): string => {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }, []);

  const spawnPiece = useCallback(() => {
    const type = nextPiece;
    const piece: Piece = {
      type,
      x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type].shape[0][0].length / 2),
      y: 0,
      rotation: 0,
    };
    
    if (!isValidPosition(piece, boardRef.current)) {
      setGameState('gameover');
      onGameOver?.(scoreRef.current);
      return null;
    }
    
    setNextPiece(getRandomPiece());
    currentPieceRef.current = piece;
    setCurrentPiece(piece);
    return piece;
  }, [nextPiece, getRandomPiece, onGameOver]);

  const isValidPosition = (piece: Piece, boardState: (string | null)[][]): boolean => {
    const shape = TETROMINOES[piece.type].shape[piece.rotation];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && boardState[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const mergePiece = useCallback((piece: Piece) => {
    const newBoard = boardRef.current.map(row => [...row]);
    const shape = TETROMINOES[piece.type].shape[piece.rotation];
    const color = TETROMINOES[piece.type].color;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = color;
        }
      }
    }
    
    // Clear lines
    let clearedLines = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(null));
        clearedLines++;
        y++; // Check same row again
      }
    }
    
    if (clearedLines > 0) {
      const lineScore = [0, 100, 300, 500, 800][clearedLines] * levelRef.current;
      scoreRef.current += lineScore;
      linesRef.current += clearedLines;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      onScoreChange?.(scoreRef.current);
    }
    
    boardRef.current = newBoard;
    setBoard(newBoard);
  }, [onScoreChange]);

  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!currentPieceRef.current) return false;
    
    const newPiece = {
      ...currentPieceRef.current,
      x: currentPieceRef.current.x + dx,
      y: currentPieceRef.current.y + dy,
    };
    
    if (isValidPosition(newPiece, boardRef.current)) {
      currentPieceRef.current = newPiece;
      setCurrentPiece(newPiece);
      return true;
    }
    return false;
  }, []);

  const rotatePiece = useCallback(() => {
    if (!currentPieceRef.current) return;
    
    const newRotation = (currentPieceRef.current.rotation + 1) % 4;
    const newPiece = { ...currentPieceRef.current, rotation: newRotation };
    
    // Wall kick: try moving left/right if rotation fails
    if (isValidPosition(newPiece, boardRef.current)) {
      currentPieceRef.current = newPiece;
      setCurrentPiece(newPiece);
    } else if (isValidPosition({ ...newPiece, x: newPiece.x - 1 }, boardRef.current)) {
      currentPieceRef.current = { ...newPiece, x: newPiece.x - 1 };
      setCurrentPiece(currentPieceRef.current);
    } else if (isValidPosition({ ...newPiece, x: newPiece.x + 1 }, boardRef.current)) {
      currentPieceRef.current = { ...newPiece, x: newPiece.x + 1 };
      setCurrentPiece(currentPieceRef.current);
    }
  }, []);

  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current) return;
    
    let dropDistance = 0;
    while (movePiece(0, 1)) {
      dropDistance++;
    }
    
    scoreRef.current += dropDistance * 2;
    setScore(scoreRef.current);
    
    mergePiece(currentPieceRef.current);
    currentPieceRef.current = null;
    spawnPiece();
  }, [movePiece, mergePiece, spawnPiece]);

  // Initial spawn
  useEffect(() => {
    if (gameState === 'playing' && !currentPieceRef.current) {
      spawnPiece();
    }
  }, [gameState, spawnPiece]);

  // Level-up timer (every 10 seconds)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const levelTimer = setInterval(() => {
      const elapsedTime = Date.now() - gameStartTimeRef.current;
      const newLevel = Math.floor(elapsedTime / LEVEL_UP_INTERVAL) + 1;
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel);
      }
    }, 1000);

    return () => clearInterval(levelTimer);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const dropInterval = Math.max(MIN_DROP_INTERVAL, INITIAL_DROP_INTERVAL - (levelRef.current - 1) * 50);
    
    const gameLoop = setInterval(() => {
      if (!currentPieceRef.current) return;
      
      if (!movePiece(0, 1)) {
        mergePiece(currentPieceRef.current);
        currentPieceRef.current = null;
        spawnPiece();
      }
    }, dropInterval);

    return () => clearInterval(gameLoop);
  }, [gameState, level, movePiece, mergePiece, spawnPiece]);

  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;
    
    const dx = e.nativeEvent.pageX - touchStartRef.current.x;
    const dy = e.nativeEvent.pageY - touchStartRef.current.y;
    
    if (Math.abs(dx) > MOVE_THRESHOLD) {
      movePiece(dx > 0 ? 1 : -1, 0);
      touchStartRef.current.x = e.nativeEvent.pageX;
    }
    
    if (dy > SOFT_DROP_THRESHOLD) {
      movePiece(0, 1);
      touchStartRef.current.y = e.nativeEvent.pageY;
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;

    const dx = e.nativeEvent.pageX - touchStartRef.current.x;
    const dy = e.nativeEvent.pageY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 20 && absDy < 20 && dt < 200) {
      rotatePiece();
    } else if (absDy > absDx && dy > 50) {
      const velocity = dy / Math.max(dt, 1) * 1000;
      if (velocity > HARD_DROP_VELOCITY) {
        hardDrop();
      }
    }

    touchStartRef.current = null;
  };

  const restart = () => {
    const emptyBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    boardRef.current = emptyBoard;
    setBoard(emptyBoard);
    setScore(0);
    setLevel(1);
    setLines(0);
    scoreRef.current = 0;
    levelRef.current = 1;
    linesRef.current = 0;
    gameStartTimeRef.current = Date.now();
    currentPieceRef.current = null;
    setCurrentPiece(null);
    setNextPiece(getRandomPiece());
    setGameState('playing');
  };

  const renderPiece = (piece: Piece, offsetX: number, offsetY: number) => {
    const shape = TETROMINOES[piece.type].shape[piece.rotation];
    const color = TETROMINOES[piece.type].color;
    const cells = [];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const cellX = offsetX + (piece.x + x) * CELL_SIZE;
          const cellY = offsetY + (piece.y + y) * CELL_SIZE;
          cells.push(
            <React.Fragment key={`piece-${x}-${y}`}>
              <RoundedRect
                x={cellX + 1}
                y={cellY + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                r={3}
                color={color}
                opacity={0.5}
              >
                <BlurMask blur={3} style="normal" />
              </RoundedRect>
              <RoundedRect
                x={cellX + 1}
                y={cellY + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                r={3}
                color={color}
              />
            </React.Fragment>
          );
        }
      }
    }
    return cells;
  };

  const boardOffsetX = (width - BOARD_WIDTH) / 2;

  return (
    <View 
      style={styles.container} 
      testID="blockdrop-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue} testID="blockdrop-score">{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LINES</Text>
          <Text style={styles.statValue}>{lines}</Text>
        </View>
      </View>

      <View style={[styles.boardContainer, { marginLeft: boardOffsetX }]}>
        <Canvas style={[styles.canvas, { width: BOARD_WIDTH, height: BOARD_HEIGHT }]}>
          {/* Background */}
          <Rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} color="#0a0a0a" />
          
          {/* Grid */}
          {Array.from({ length: COLS + 1 }).map((_, i) => (
            <Rect key={`v-${i}`} x={i * CELL_SIZE} y={0} width={1} height={BOARD_HEIGHT} color="#1a1a1a" />
          ))}
          {Array.from({ length: ROWS + 1 }).map((_, i) => (
            <Rect key={`h-${i}`} x={0} y={i * CELL_SIZE} width={BOARD_WIDTH} height={1} color="#1a1a1a" />
          ))}

          {/* Placed blocks */}
          {board.map((row, y) =>
            row.map((cell, x) =>
              cell && (
                <RoundedRect
                  key={`cell-${x}-${y}`}
                  x={x * CELL_SIZE + 1}
                  y={y * CELL_SIZE + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  r={3}
                  color={cell}
                />
              )
            )
          )}

          {/* Current piece */}
          {currentPiece && renderPiece(currentPiece, 0, 0)}
        </Canvas>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.hardDropButton} 
          onPress={hardDrop}
          activeOpacity={0.6}
          testID="blockdrop-harddrop"
        >
          <Text style={styles.hardDropText}>DROP</Text>
        </TouchableOpacity>
        <Text style={styles.controlHint}>Tap: Rotate | Swipe: Move | Button: Hard Drop</Text>
      </View>

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="blockdrop-gameover">
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore} testID="blockdrop-final-score">Score: {score}</Text>
          <Text style={styles.finalStats}>Level: {level} | Lines: {lines}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="blockdrop-restart">
            <Text style={styles.restartText}>PLAY AGAIN</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statValue: {
    color: '#00ff9d',
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  boardContainer: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#00ff9d',
  },
  canvas: {
    backgroundColor: '#0a0a0a',
  },
  controls: {
    alignItems: 'center',
    marginTop: 16,
  },
  controlHint: {
    color: '#666',
    fontSize: 12,
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
    fontSize: 28, 
    marginTop: 20,
    fontFamily: 'monospace',
  },
  finalStats: {
    color: '#fff',
    fontSize: 16,
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
  hardDropButton: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.5)',
    marginBottom: 12,
  },
  hardDropText: {
    color: '#00ff9d',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

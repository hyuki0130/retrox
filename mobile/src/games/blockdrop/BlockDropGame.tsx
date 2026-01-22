import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, GestureResponderEvent, LayoutChangeEvent, Animated } from 'react-native';

import { Canvas, Rect, RoundedRect, BlurMask, Image, SkImage } from '@shopify/react-native-skia';
import { GameCountdown } from '@/ui';
import { useBlockDropSprites, useParticles, ParticleSystem, useScreenEffects, useHaptics, useScorePopup, ScorePopup, useBlockDropAudio } from '@/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLS = 10;
const ROWS = 20;
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
  const sprites = useBlockDropSprites();
  const blockSprites: Record<string, SkImage | null> = {
    '#00ffff': sprites.blockCyan,
    '#ffff00': sprites.blockYellow,
    '#aa00ff': sprites.blockPurple,
    '#00ff00': sprites.blockGreen,
    '#ff0000': sprites.blockRed,
    '#0000ff': sprites.blockBlue,
    '#ff8800': sprites.blockOrange,
  };
  const { particles, burst, clear: clearParticles } = useParticles();
  const { flashColor, flashOpacity, shakeX, shake, flash } = useScreenEffects();
  const haptics = useHaptics();
  const { popups, show: showScorePopup, showText, clear: clearPopups } = useScorePopup();
  const audio = useBlockDropAudio();
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'gameover'>('countdown');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [board, setBoard] = useState<(string | null)[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<string>(PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]);
  const [containerHeight, setContainerHeight] = useState(0);

  const boardRef = useRef<(string | null)[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const currentPieceRef = useRef<Piece | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const linesRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameStartTimeRef = useRef(Date.now());

  const HEADER_HEIGHT = 60;
  const CONTROLS_HEIGHT = 80;
  const availableHeight = containerHeight - HEADER_HEIGHT - CONTROLS_HEIGHT;
  const cellSize = Math.min(
    Math.floor((SCREEN_WIDTH - 48) / COLS),
    Math.floor(availableHeight / ROWS)
  );
  const BOARD_WIDTH = cellSize * COLS;
  const BOARD_HEIGHT = cellSize * ROWS;
  const boardOffsetX = (SCREEN_WIDTH - BOARD_WIDTH) / 2;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  };

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
      audio.play('game_over');
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
    
    let clearedLines = 0;
    const clearedRows: number[] = [];
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        clearedRows.push(y);
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(null));
        clearedLines++;
        y++;
      }
    }
    
    if (clearedLines > 0) {
      const lineScore = [0, 100, 300, 500, 800][clearedLines] * levelRef.current;
      scoreRef.current += lineScore;
      linesRef.current += clearedLines;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      onScoreChange?.(scoreRef.current);
      
      clearedRows.forEach((row) => {
        for (let x = 0; x < COLS; x++) {
          const pixelX = x * cellSize + cellSize / 2;
          const pixelY = row * cellSize + cellSize / 2;
          burst(pixelX, pixelY, 3, ['#00ff9d', '#ffffff']);
        }
      });
      
      if (clearedLines === 4) {
        showText(SCREEN_WIDTH / 2, BOARD_HEIGHT / 2, 'TETRIS!', '#ffff00');
        flash('#ffff00');
        shake(8);
        haptics.heavy();
        audio.play('blockdrop_tetris');
      } else {
        showScorePopup(SCREEN_WIDTH / 2, BOARD_HEIGHT / 2, lineScore, '#00ff9d');
        shake(clearedLines * 2);
        haptics.medium();
        audio.play('blockdrop_line_clear');
      }
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
      audio.play('blockdrop_rotate');
    } else if (isValidPosition({ ...newPiece, x: newPiece.x - 1 }, boardRef.current)) {
      currentPieceRef.current = { ...newPiece, x: newPiece.x - 1 };
      setCurrentPiece(currentPieceRef.current);
      audio.play('blockdrop_rotate');
    } else if (isValidPosition({ ...newPiece, x: newPiece.x + 1 }, boardRef.current)) {
      currentPieceRef.current = { ...newPiece, x: newPiece.x + 1 };
      setCurrentPiece(currentPieceRef.current);
      audio.play('blockdrop_rotate');
    }
  }, [audio]);

  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current) return;
    
    let dropDistance = 0;
    while (movePiece(0, 1)) {
      dropDistance++;
    }
    
    scoreRef.current += dropDistance * 2;
    setScore(scoreRef.current);
    
    shake(3);
    audio.play('blockdrop_drop');
    
    mergePiece(currentPieceRef.current);
    currentPieceRef.current = null;
    spawnPiece();
  }, [movePiece, mergePiece, spawnPiece, shake, audio]);

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
      const moved = movePiece(dx > 0 ? 1 : -1, 0);
      if (moved) {
        audio.play('blockdrop_move', { debounceMs: 80 });
      }
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

    const isTap = absDx < 20 && absDy < 20 && dt < 200;
    const isSwipeDown = absDy > absDx && dy > 50;
    const swipeVelocity = dy / Math.max(dt, 1) * 1000;

    if (isTap) {
      rotatePiece();
    } else if (isSwipeDown && swipeVelocity > HARD_DROP_VELOCITY) {
      hardDrop();
    }

    touchStartRef.current = null;
  };

  const handleCountdownComplete = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    setGameState('playing');
  }, []);

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
    currentPieceRef.current = null;
    setCurrentPiece(null);
    setNextPiece(getRandomPiece());
    clearParticles();
    clearPopups();
    setGameState('countdown');
  };

  const renderPiece = (piece: Piece, offsetX: number, offsetY: number) => {
    const shape = TETROMINOES[piece.type].shape[piece.rotation];
    const color = TETROMINOES[piece.type].color;
    const sprite = blockSprites[color];
    const cells = [];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const cellX = offsetX + (piece.x + x) * cellSize;
          const cellY = offsetY + (piece.y + y) * cellSize;
          cells.push(
            sprite ? (
              <Image
                key={`piece-${x}-${y}`}
                image={sprite}
                x={cellX + 1}
                y={cellY + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fit="fill"
              />
            ) : (
              <RoundedRect
                key={`piece-${x}-${y}`}
                x={cellX + 1}
                y={cellY + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                r={3}
                color={color}
              />
            )
          );
        }
      }
    }
    return cells;
  };

  if (containerHeight === 0) {
    return <View style={styles.container} onLayout={handleLayout} testID="blockdrop-container" />;
  }

  return (
    <Animated.View 
      style={[styles.container, { transform: [{ translateX: shakeX }] }]} 
      testID="blockdrop-container"
      onLayout={handleLayout}
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

      <View style={[styles.boardWrapper]}>
        <View style={[styles.boardContainer, { marginLeft: boardOffsetX }]}>
          <Canvas style={[styles.canvas, { width: BOARD_WIDTH, height: BOARD_HEIGHT }]}>
            <Rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} color="#0a0a0a" />
            
            {Array.from({ length: COLS + 1 }).map((_, i) => (
              <Rect key={`v-${i}`} x={i * cellSize} y={0} width={1} height={BOARD_HEIGHT} color="#1a1a1a" />
            ))}
            {Array.from({ length: ROWS + 1 }).map((_, i) => (
              <Rect key={`h-${i}`} x={0} y={i * cellSize} width={BOARD_WIDTH} height={1} color="#1a1a1a" />
            ))}

            {board.map((row, y) =>
              row.map((cell, x) => {
                if (!cell) return null;
                const sprite = blockSprites[cell];
                return sprite ? (
                  <Image
                    key={`cell-${x}-${y}`}
                    image={sprite}
                    x={x * cellSize + 1}
                    y={y * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    fit="fill"
                  />
                ) : (
                  <RoundedRect
                    key={`cell-${x}-${y}`}
                    x={x * cellSize + 1}
                    y={y * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    r={3}
                    color={cell}
                  />
                );
              })
            )}

            {currentPiece && renderPiece(currentPiece, 0, 0)}

            <ParticleSystem particles={particles} />
            <ScorePopup popups={popups} />
          </Canvas>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.hardDropButton} 
          onPress={hardDrop}
          activeOpacity={0.7}
          testID="blockdrop-harddrop"
        >
          <Text style={styles.hardDropText}>⬇ HARD DROP</Text>
        </TouchableOpacity>
        <Text style={styles.controlHint}>Tap: Rotate | Swipe: Move | Button: Drop</Text>
      </View>

      {gameState === 'countdown' && (
        <GameCountdown onComplete={handleCountdownComplete} />
      )}

      {flashColor && (
        <View style={[styles.flashOverlay, { backgroundColor: flashColor, opacity: flashOpacity }]} pointerEvents="none" />
      )}

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
    </Animated.View>
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
    height: 60,
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
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 12,
    height: 80,
  },
  controlHint: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
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
    backgroundColor: 'rgba(0, 255, 157, 0.3)',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ff9d',
  },
  hardDropText: {
    color: '#00ff9d',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

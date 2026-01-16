import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';

import { Canvas, RoundedRect, Image, SkImage } from '@shopify/react-native-skia';
import { GameCountdown } from '@/ui';
import { usePuzzleSprites } from '@/core';

const { width } = Dimensions.get('window');
const GRID_SIZE = 6;
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE);
const COLORS = ['#ff0066', '#00ff9d', '#ffff00', '#00ccff', '#ff9900', '#cc00ff'];
const SWIPE_THRESHOLD = 20;

interface CellState {
  color: number;
  yOffset: number;
}

interface PuzzleGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

const createGrid = (): CellState[][] => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ color: Math.floor(Math.random() * COLORS.length), yOffset: 0 }))
    );
};

const DROP_SPEED = 15;

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const sprites = usePuzzleSprites();
  const gemSprites: (SkImage | null)[] = [
    sprites.gemRed,
    sprites.gemGreen,
    sprites.gemYellow,
    sprites.gemBlue,
    sprites.gemOrange,
    sprites.gemPurple,
  ];
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'gameover'>('countdown');
  const [grid, setGrid] = useState<CellState[][]>(createGrid);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const touchStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const selectedRef = useRef<{ row: number; col: number } | null>(null);
  const swapRef = useRef<(r1: number, c1: number, r2: number, c2: number) => void>(() => {});
  const animationRef = useRef<number | null>(null);
  const processMatchesRef = useRef<(matches: { row: number; col: number }[], chainCount?: number) => void>(() => {});
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainCountRef = useRef(1);
  const isFirstScoreUpdate = useRef(true);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  const boardSize = CELL_SIZE * GRID_SIZE;
  const verticalPadding = containerHeight > 0 ? Math.max(0, (containerHeight - boardSize - 60) / 2) : 0;

  const getColorGrid = useCallback((g: CellState[][]): (number | null)[][] => {
    return g.map(row => row.map(cell => cell.color === -1 ? null : cell.color));
  }, []);

  const checkMatches = useCallback((g: (number | null)[][]): { row: number; col: number }[] => {
    const matches: { row: number; col: number }[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (g[row][col] !== null && g[row][col] === g[row][col + 1] && g[row][col] === g[row][col + 2]) {
          matches.push({ row, col }, { row, col: col + 1 }, { row, col: col + 2 });
        }
      }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        if (g[row][col] !== null && g[row][col] === g[row + 1][col] && g[row][col] === g[row + 2][col]) {
          matches.push({ row, col }, { row: row + 1, col }, { row: row + 2, col });
        }
      }
    }

    return matches;
  }, []);

  const animateDrops = useCallback((chainCount: number = 1) => {
    setGrid(currentGrid => {
      const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
      let stillAnimating = false;

      for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE; row++) {
          if (newGrid[row][col].yOffset < 0) {
            newGrid[row][col].yOffset = Math.min(0, newGrid[row][col].yOffset + DROP_SPEED);
            if (newGrid[row][col].yOffset < 0) stillAnimating = true;
          }
        }
      }

      if (!stillAnimating) {
        setIsAnimating(false);
        setTimeout(() => {
          const colorGrid = getColorGrid(newGrid);
          const matches = checkMatches(colorGrid);
          if (matches.length > 0) {
            processMatchesRef.current(matches, chainCount + 1);
          } else {
            setComboCount(0);
          }
        }, 50);
      }

      return newGrid;
    });
  }, [checkMatches, getColorGrid]);

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        animateDrops(chainCountRef.current);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [isAnimating, animateDrops]);

  const processMatchesWithAnimation = useCallback((matches: { row: number; col: number }[], chainCount: number = 1) => {
    chainCountRef.current = chainCount;
    const comboMultiplier = Math.min(chainCount, 5);
    const points = matches.length * 10 * comboMultiplier;
    
    if (chainCount > 1) {
      setComboCount(chainCount);
      setShowCombo(true);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => setShowCombo(false), 800);
    }
    
    setScore(s => s + points);

    setGrid(currentGrid => {
      const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
      
      matches.forEach(({ row, col }) => {
        newGrid[row][col] = { color: -1, yOffset: 0 };
      });

      for (let col = 0; col < GRID_SIZE; col++) {
        let writeRow = GRID_SIZE - 1;
        const columnCells: CellState[] = [];
        
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (newGrid[row][col].color !== -1) {
            const dropDistance = (writeRow - row) * CELL_SIZE;
            columnCells.push({ 
              color: newGrid[row][col].color, 
              yOffset: dropDistance > 0 ? -dropDistance : 0 
            });
            writeRow--;
          }
        }

        const newCellsNeeded = GRID_SIZE - columnCells.length;
        for (let i = 0; i < newCellsNeeded; i++) {
          columnCells.push({ 
            color: Math.floor(Math.random() * COLORS.length), 
            yOffset: -(newCellsNeeded - i) * CELL_SIZE 
          });
        }

        columnCells.reverse();
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][col] = columnCells[row];
        }
      }

      setIsAnimating(true);
      return newGrid;
    });
  }, []);

  processMatchesRef.current = processMatchesWithAnimation;

  useEffect(() => {
    if (isFirstScoreUpdate.current) {
      isFirstScoreUpdate.current = false;
      return;
    }
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const swap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    if (isAnimating) return;
    
    setGrid(g => {
      const newGrid = g.map(row => row.map(cell => ({ ...cell })));
      const temp = newGrid[r1][c1];
      newGrid[r1][c1] = newGrid[r2][c2];
      newGrid[r2][c2] = temp;
      return newGrid;
    });

    setTimeout(() => {
      setGrid(currentGrid => {
        const colorGrid = getColorGrid(currentGrid);
        const matches = checkMatches(colorGrid);
        if (matches.length > 0) {
          processMatchesRef.current(matches);
        }
        return currentGrid;
      });
    }, 100);
  }, [isAnimating, checkMatches, getColorGrid]);

  swapRef.current = swap;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isAnimating,
    onMoveShouldSetPanResponder: () => !isAnimating,
    onPanResponderGrant: (evt) => {
      if (isAnimating) return;
      const { locationX, locationY } = evt.nativeEvent;
      const col = Math.floor(locationX / CELL_SIZE);
      const row = Math.floor(locationY / CELL_SIZE);
      
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        touchStart.current = { row, col, x: locationX, y: locationY };
      } else {
        touchStart.current = null;
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (isAnimating || !touchStart.current) return;
      
      const { row, col } = touchStart.current;
      const { dx, dy } = gestureState;

      if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
        let targetRow = row;
        let targetCol = col;

        if (Math.abs(dx) > Math.abs(dy)) {
          targetCol += dx > 0 ? 1 : -1;
        } else {
          targetRow += dy > 0 ? 1 : -1;
        }

        if (
          targetRow >= 0 && 
          targetRow < GRID_SIZE && 
          targetCol >= 0 && 
          targetCol < GRID_SIZE
        ) {
          swapRef.current(row, col, targetRow, targetCol);
          selectedRef.current = null;
          setSelected(null);
        }
      } else {
        const currentSelected = selectedRef.current;
        if (currentSelected) {
          const dr = Math.abs(currentSelected.row - row);
          const dc = Math.abs(currentSelected.col - col);

          if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
            swapRef.current(currentSelected.row, currentSelected.col, row, col);
          }
          selectedRef.current = null;
          setSelected(null);
        } else {
          selectedRef.current = { row, col };
          setSelected({ row, col });
        }
      }
      
      touchStart.current = null;
    },
    onPanResponderTerminate: () => {
      touchStart.current = null;
    }
  });

  const handleCountdownComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('gameover');
      onGameOver?.(score);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, onGameOver, score]);

  const restart = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    setIsAnimating(false);
    setGrid(createGrid());
    setScore(0);
    setTimeLeft(60);
    setSelected(null);
    selectedRef.current = null;
    setComboCount(0);
    setShowCombo(false);
    chainCountRef.current = 1;
    isFirstScoreUpdate.current = true;
    setGameState('countdown');
  };

  return (
    <View style={styles.container} testID="puzzle-container" onLayout={handleContainerLayout}>
      <View style={[styles.timeContainer, { marginTop: verticalPadding }]}>
        <Text style={[styles.time, timeLeft < 10 && styles.timeWarning]}>TIME: {timeLeft}</Text>
        <Text testID="puzzle-score" style={styles.hiddenText}>{score}</Text>
        <Text testID="puzzle-time" style={styles.hiddenText}>{timeLeft}</Text>
        {showCombo && comboCount > 1 && (
          <View style={styles.comboContainer}>
            <Text style={styles.comboText}>{comboCount}x COMBO!</Text>
          </View>
        )}
      </View>

      <View 
        style={styles.gameBoard} 
        {...panResponder.panHandlers}
      >
        <Canvas style={styles.canvas} testID="puzzle-canvas">
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (cell.color === -1) return null;
              const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
              const gemSprite = gemSprites[cell.color];
              const x = colIdx * CELL_SIZE + 2;
              const y = rowIdx * CELL_SIZE + 2 + cell.yOffset;
              const size = CELL_SIZE - 4;
              
              return gemSprite ? (
                <React.Fragment key={`${rowIdx}-${colIdx}`}>
                  <Image
                    image={gemSprite}
                    x={x}
                    y={y}
                    width={size}
                    height={size}
                    fit="contain"
                  />
                  {isSelected && (
                    <RoundedRect
                      x={x}
                      y={y}
                      width={size}
                      height={size}
                      r={8}
                      color="#fff"
                      style="stroke"
                      strokeWidth={3}
                    />
                  )}
                </React.Fragment>
              ) : (
                <RoundedRect
                  key={`${rowIdx}-${colIdx}`}
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  r={8}
                  color={COLORS[cell.color]}
                  style={isSelected ? 'stroke' : 'fill'}
                  strokeWidth={isSelected ? 4 : 0}
                />
              );
            })
          )}
        </Canvas>

        <View style={styles.gridOverlay} testID="puzzle-grid" pointerEvents="none">
          {grid.map((row, rowIdx) =>
            row.map((_, colIdx) => (
              <View
                key={`cell-${rowIdx}-${colIdx}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                testID={`puzzle-cell-${rowIdx}-${colIdx}`}
              />
            ))
          )}
        </View>
      </View>

      {gameState === 'countdown' && (
        <GameCountdown onComplete={handleCountdownComplete} />
      )}

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="puzzle-gameover">
          <Text style={styles.gameOverText}>TIME'S UP!</Text>
          <Text style={styles.finalScore} testID="puzzle-final-score">Final Score: {score}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="puzzle-restart">
            <Text style={styles.restartText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  timeContainer: { 
    alignItems: 'center', 
    marginBottom: 16,
  },
  time: { color: '#ffff00', fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace' },
  timeWarning: { color: '#ff0000' },
  hiddenText: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  comboContainer: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: '#ff0066',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  comboText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  
  gameBoard: { 
    alignSelf: 'center',
    width: CELL_SIZE * GRID_SIZE, 
    height: CELL_SIZE * GRID_SIZE,
    position: 'relative',
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  canvas: { flex: 1 },
  gridOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  gameOverText: { color: '#ff0066', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' },
  finalScore: { color: '#fff', fontSize: 24, marginTop: 20 },
  restartBtn: { marginTop: 30, backgroundColor: '#00ff9d', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  restartText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});

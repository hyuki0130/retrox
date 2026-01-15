import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Canvas, Rect, RoundedRect } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const GRID_SIZE = 6;
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE);
const COLORS = ['#ff0066', '#00ff9d', '#ffff00', '#00ccff', '#ff9900', '#cc00ff'];
const SWIPE_THRESHOLD = 20;

type CellType = number | null;

interface PuzzleGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

const createGrid = (): CellType[][] => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Math.floor(Math.random() * COLORS.length))
    );
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [grid, setGrid] = useState<CellType[][]>(createGrid);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [moves, setMoves] = useState(30);

  const touchStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null);

  const checkMatches = useCallback((g: CellType[][]): { row: number; col: number }[] => {
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

  const removeMatches = useCallback((g: CellType[][], matches: { row: number; col: number }[]): CellType[][] => {
    const newGrid = g.map((row) => [...row]);
    matches.forEach(({ row, col }) => {
      newGrid[row][col] = null;
    });
    return newGrid;
  }, []);

  const dropCells = useCallback((g: CellType[][]): CellType[][] => {
    const newGrid = g.map((row) => [...row]);

    for (let col = 0; col < GRID_SIZE; col++) {
      let writeRow = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col] !== null) {
          newGrid[writeRow][col] = newGrid[row][col];
          if (writeRow !== row) newGrid[row][col] = null;
          writeRow--;
        }
      }
      for (let row = writeRow; row >= 0; row--) {
        newGrid[row][col] = Math.floor(Math.random() * COLORS.length);
      }
    }

    return newGrid;
  }, []);

  const processMatches = useCallback(() => {
    setGrid((currentGrid) => {
      let newGrid = [...currentGrid.map((row) => [...row])];
      let totalMatches = 0;

      let matches = checkMatches(newGrid);
      while (matches.length > 0) {
        totalMatches += matches.length;
        newGrid = removeMatches(newGrid, matches);
        newGrid = dropCells(newGrid);
        matches = checkMatches(newGrid);
      }

      if (totalMatches > 0) {
        const points = totalMatches * 10;
        setScore((s) => {
          const newScore = s + points;
          onScoreChange?.(newScore);
          return newScore;
        });
      }

      return newGrid;
    });
  }, [checkMatches, removeMatches, dropCells, onScoreChange]);

  const swap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    setGrid((g) => {
      const newGrid = g.map((row) => [...row]);
      const temp = newGrid[r1][c1];
      newGrid[r1][c1] = newGrid[r2][c2];
      newGrid[r2][c2] = temp;
      return newGrid;
    });
    setMoves((m) => m - 1);
    setTimeout(processMatches, 100);
  }, [processMatches]);

  const handleTap = useCallback((row: number, col: number) => {
    if (selected) {
      const dr = Math.abs(selected.row - row);
      const dc = Math.abs(selected.col - col);

      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        swap(selected.row, selected.col, row, col);
      }
      setSelected(null);
    } else {
      setSelected({ row, col });
    }
  }, [selected, swap]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const col = Math.floor(locationX / CELL_SIZE);
        const row = Math.floor(locationY / CELL_SIZE);
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          touchStart.current = { row, col, x: locationX, y: locationY };
        } else {
          touchStart.current = null;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!touchStart.current) return;
        
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
            swap(row, col, targetRow, targetCol);
            setSelected(null);
          }
        } else {
          handleTap(row, col);
        }
        
        touchStart.current = null;
      },
      onPanResponderTerminate: () => {
        touchStart.current = null;
      }
    })
  ).current;

  useEffect(() => {
    if (moves <= 0) {
      onGameOver?.(score);
    }
  }, [moves, score, onGameOver]);

  const restart = () => {
    setGrid(createGrid());
    setScore(0);
    setMoves(30);
    setSelected(null);
  };

  return (
    <View style={styles.container} testID="puzzle-container">
      <View style={styles.header}>
        <Text style={styles.score}>SCORE: {score}</Text>
        <Text style={styles.moves}>MOVES: {moves}</Text>
        <Text testID="puzzle-score" style={styles.hiddenText}>{score}</Text>
        <Text testID="puzzle-moves" style={styles.hiddenText}>{moves}</Text>
      </View>

      <View 
        style={styles.gameBoard} 
        {...panResponder.panHandlers}
      >
        <Canvas style={styles.canvas} testID="puzzle-canvas">
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (cell === null) return null;
              const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
              return (
                <RoundedRect
                  key={`${rowIdx}-${colIdx}`}
                  x={colIdx * CELL_SIZE + 2}
                  y={rowIdx * CELL_SIZE + 2}
                  width={CELL_SIZE - 4}
                  height={CELL_SIZE - 4}
                  r={8}
                  color={COLORS[cell]}
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

      {moves <= 0 && (
        <View style={styles.overlay} testID="puzzle-gameover">
          <Text style={styles.gameOverText}>TIME UP!</Text>
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
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  score: { color: '#00ff9d', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  moves: { color: '#ffff00', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  hiddenText: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  
  gameBoard: { 
    alignSelf: 'center',
    width: CELL_SIZE * GRID_SIZE, 
    height: CELL_SIZE * GRID_SIZE,
    position: 'relative',
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

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';
import { Canvas, RoundedRect, Rect, Circle, BlurMask } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 14;
const FRAME_MS = 16.67;
const WINNING_SCORE = 11;
const AI_SPEED = 4;
const BALL_SPEED_INITIAL = 5;
const PADDLE_MARGIN = 30;

interface PongGameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}

export const PongGame: React.FC<PongGameProps> = ({
  onGameOver,
  onScoreChange,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerX, setPlayerX] = useState(width / 2 - PADDLE_WIDTH / 2);
  const [aiX, setAiX] = useState(width / 2 - PADDLE_WIDTH / 2);
  const [ballPos, setBallPos] = useState({ x: width / 2, y: 300 });
  const [canvasHeight, setCanvasHeight] = useState(600);

  const playerXRef = useRef(width / 2 - PADDLE_WIDTH / 2);
  const aiXRef = useRef(width / 2 - PADDLE_WIDTH / 2);
  const ballRef = useRef({ x: width / 2, y: 300, vx: BALL_SPEED_INITIAL, vy: BALL_SPEED_INITIAL });
  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const canvasHeightRef = useRef(600);

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setCanvasHeight(height);
    canvasHeightRef.current = height;
    ballRef.current.y = height / 2;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gameState !== 'playing') return;
        const newX = Math.max(0, Math.min(width - PADDLE_WIDTH, gestureState.moveX - PADDLE_WIDTH / 2));
        setPlayerX(newX);
        playerXRef.current = newX;
      },
    })
  ).current;

  const resetBall = (direction: number) => {
    ballRef.current = {
      x: width / 2,
      y: canvasHeightRef.current / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED_INITIAL,
      vy: direction * BALL_SPEED_INITIAL,
    };
    setBallPos({ x: width / 2, y: canvasHeightRef.current / 2 });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      const ball = ballRef.current;
      const height = canvasHeightRef.current;
      
      // Move ball
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collision (left/right)
      if (ball.x <= BALL_SIZE / 2 || ball.x >= width - BALL_SIZE / 2) {
        ball.vx *= -1;
        ball.x = Math.max(BALL_SIZE / 2, Math.min(width - BALL_SIZE / 2, ball.x));
      }

      // Player paddle collision (bottom)
      const playerPaddleY = height - PADDLE_MARGIN - PADDLE_HEIGHT;
      if (
        ball.vy > 0 &&
        ball.y + BALL_SIZE / 2 >= playerPaddleY &&
        ball.y - BALL_SIZE / 2 <= playerPaddleY + PADDLE_HEIGHT &&
        ball.x >= playerXRef.current &&
        ball.x <= playerXRef.current + PADDLE_WIDTH
      ) {
        ball.vy *= -1.05; // Speed up slightly
        ball.y = playerPaddleY - BALL_SIZE / 2;
        // Add angle based on hit position
        const hitPos = (ball.x - playerXRef.current) / PADDLE_WIDTH - 0.5;
        ball.vx += hitPos * 3;
      }

      // AI paddle collision (top)
      const aiPaddleY = PADDLE_MARGIN;
      if (
        ball.vy < 0 &&
        ball.y - BALL_SIZE / 2 <= aiPaddleY + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE / 2 >= aiPaddleY &&
        ball.x >= aiXRef.current &&
        ball.x <= aiXRef.current + PADDLE_WIDTH
      ) {
        ball.vy *= -1.05;
        ball.y = aiPaddleY + PADDLE_HEIGHT + BALL_SIZE / 2;
        const hitPos = (ball.x - aiXRef.current) / PADDLE_WIDTH - 0.5;
        ball.vx += hitPos * 3;
      }

      // AI movement
      const aiCenter = aiXRef.current + PADDLE_WIDTH / 2;
      const targetX = ball.x;
      if (aiCenter < targetX - 10) {
        aiXRef.current = Math.min(width - PADDLE_WIDTH, aiXRef.current + AI_SPEED);
      } else if (aiCenter > targetX + 10) {
        aiXRef.current = Math.max(0, aiXRef.current - AI_SPEED);
      }
      setAiX(aiXRef.current);

      // Scoring
      if (ball.y < 0) {
        // Player scores
        const newScore = playerScoreRef.current + 1;
        playerScoreRef.current = newScore;
        setPlayerScore(newScore);
        onScoreChange?.(newScore);
        
        if (newScore >= WINNING_SCORE) {
          setGameState('gameover');
          onGameOver?.(newScore);
        } else {
          resetBall(1);
        }
      } else if (ball.y > height) {
        // AI scores
        aiScoreRef.current += 1;
        setAiScore(aiScoreRef.current);
        
        if (aiScoreRef.current >= WINNING_SCORE) {
          setGameState('gameover');
          onGameOver?.(playerScoreRef.current);
        } else {
          resetBall(-1);
        }
      }

      // Clamp ball speed
      const maxSpeed = 12;
      ball.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vx));
      ball.vy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vy));

      setBallPos({ x: ball.x, y: ball.y });
    }, FRAME_MS);

    return () => clearInterval(gameLoop);
  }, [gameState, onGameOver, onScoreChange]);

  const restart = () => {
    setGameState('playing');
    setPlayerScore(0);
    setAiScore(0);
    playerScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPlayerX(width / 2 - PADDLE_WIDTH / 2);
    setAiX(width / 2 - PADDLE_WIDTH / 2);
    playerXRef.current = width / 2 - PADDLE_WIDTH / 2;
    aiXRef.current = width / 2 - PADDLE_WIDTH / 2;
    resetBall(1);
  };

  const isPlayerWinner = playerScore >= WINNING_SCORE;

  return (
    <View 
      style={styles.container} 
      testID="pong-container"
      {...panResponder.panHandlers}
    >
      <View style={styles.scoreBar}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>AI</Text>
          <Text style={[styles.scoreValue, { color: '#ff0066' }]} testID="pong-ai-score">{aiScore}</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>YOU</Text>
          <Text style={[styles.scoreValue, { color: '#00ff9d' }]} testID="pong-player-score">{playerScore}</Text>
        </View>
      </View>

      <View style={styles.canvasContainer} onLayout={handleCanvasLayout}>
        <Canvas style={styles.canvas}>
          {/* Center line */}
          <Rect x={0} y={canvasHeight / 2 - 1} width={width} height={2} color="#222" />
          
          {/* Center circle */}
          <Circle cx={width / 2} cy={canvasHeight / 2} r={40} color="#1a1a1a" style="stroke" strokeWidth={2} />

          {/* AI Paddle (top) */}
          <RoundedRect
            x={aiX}
            y={PADDLE_MARGIN}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#ff0066"
            opacity={0.5}
          >
            <BlurMask blur={4} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={aiX}
            y={PADDLE_MARGIN}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#ff0066"
          />

          {/* Player Paddle (bottom) */}
          <RoundedRect
            x={playerX}
            y={canvasHeight - PADDLE_MARGIN - PADDLE_HEIGHT}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#00ff9d"
            opacity={0.5}
          >
            <BlurMask blur={4} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={playerX}
            y={canvasHeight - PADDLE_MARGIN - PADDLE_HEIGHT}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            r={6}
            color="#00ff9d"
          />

          {/* Ball */}
          <Circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_SIZE / 2 + 4}
            color="#fff"
            opacity={0.3}
          >
            <BlurMask blur={6} style="normal" />
          </Circle>
          <Circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_SIZE / 2}
            color="#fff"
          />
        </Canvas>
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlHint}>Drag to move paddle</Text>
      </View>

      {gameState === 'gameover' && (
        <View style={styles.overlay} testID="pong-gameover">
          <Text style={[styles.gameOverText, { color: isPlayerWinner ? '#00ff9d' : '#ff0066' }]}>
            {isPlayerWinner ? 'YOU WIN!' : 'GAME OVER'}
          </Text>
          <Text style={styles.finalScore} testID="pong-final-score">
            {playerScore} - {aiScore}
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart} testID="pong-restart">
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
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 24,
  },
  scoreSection: {
    alignItems: 'center',
    minWidth: 60,
  },
  scoreLabel: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  vs: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  canvasContainer: { 
    flex: 1,
  },
  canvas: { 
    flex: 1,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 16,
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
    fontSize: 36, 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
  },
  finalScore: { 
    color: '#fff', 
    fontSize: 48, 
    marginTop: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
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

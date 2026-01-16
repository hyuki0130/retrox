import { useImage, SkImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { SpriteSource } from '@/assets/sprites';

type ImageSource = ReturnType<typeof require>;

export function useSprite(source: ImageSource): SkImage | null {
  return useImage(source);
}

export function useSprites<T extends Record<string, ImageSource>>(
  sources: T
): Record<keyof T, SkImage | null> {
  const keys = useMemo(() => Object.keys(sources) as (keyof T)[], [sources]);
  
  const images = keys.reduce((acc, key) => {
    acc[key] = useImage(sources[key]);
    return acc;
  }, {} as Record<keyof T, SkImage | null>);
  
  return images;
}

export function useShooterSprites() {
  const player = useImage(require('@/assets/sprites/shooter/playerShip1_blue.png'));
  const enemy1 = useImage(require('@/assets/sprites/shooter/enemyRed1.png'));
  const enemy2 = useImage(require('@/assets/sprites/shooter/enemyRed2.png'));
  const enemy3 = useImage(require('@/assets/sprites/shooter/enemyRed3.png'));
  const laserBlue = useImage(require('@/assets/sprites/shooter/laserBlue01.png'));
  const laserRed = useImage(require('@/assets/sprites/shooter/laserRed01.png'));
  
  return { player, enemy1, enemy2, enemy3, laserBlue, laserRed };
}

export function usePuzzleSprites() {
  const tileRed = useImage(require('@/assets/sprites/puzzle/tileRed.png'));
  const tileGreen = useImage(require('@/assets/sprites/puzzle/tileGreen.png'));
  const tileYellow = useImage(require('@/assets/sprites/puzzle/tileYellow.png'));
  const tileBlue = useImage(require('@/assets/sprites/puzzle/tileBlue.png'));
  const tileOrange = useImage(require('@/assets/sprites/puzzle/tileOrange.png'));
  const tilePink = useImage(require('@/assets/sprites/puzzle/tilePink.png'));
  
  return { tileRed, tileGreen, tileYellow, tileBlue, tileOrange, tilePink };
}

export function usePongSprites() {
  const paddleBlue = useImage(require('@/assets/sprites/pong/paddleBlue.png'));
  const paddleRed = useImage(require('@/assets/sprites/pong/paddleRed.png'));
  const ball = useImage(require('@/assets/sprites/pong/ballGrey.png'));
  
  return { paddleBlue, paddleRed, ball };
}

export function useSnakeSprites() {
  const head = useImage(require('@/assets/sprites/snake/head.png'));
  const body = useImage(require('@/assets/sprites/snake/body.png'));
  const tail = useImage(require('@/assets/sprites/snake/tail.png'));
  const apple = useImage(require('@/assets/sprites/snake/apple.png'));
  const cherry = useImage(require('@/assets/sprites/snake/cherry.png'));
  
  return { head, body, tail, apple, cherry };
}

export function useBlockDropSprites() {
  const blockCyan = useImage(require('@/assets/sprites/blockdrop/blockCyan.png'));
  const blockYellow = useImage(require('@/assets/sprites/blockdrop/blockYellow.png'));
  const blockPurple = useImage(require('@/assets/sprites/blockdrop/blockPurple.png'));
  const blockGreen = useImage(require('@/assets/sprites/blockdrop/blockGreen.png'));
  const blockRed = useImage(require('@/assets/sprites/blockdrop/blockRed.png'));
  const blockBlue = useImage(require('@/assets/sprites/blockdrop/blockBlue.png'));
  const blockOrange = useImage(require('@/assets/sprites/blockdrop/blockOrange.png'));
  
  return { blockCyan, blockYellow, blockPurple, blockGreen, blockRed, blockBlue, blockOrange };
}

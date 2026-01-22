import { useCallback, useEffect, useRef } from 'react';
import { audioService, SFXName, BGMName } from '@/services';

export function useAudio() {
  const lastPlayTime = useRef<Record<string, number>>({});

  const play = useCallback((name: SFXName, options?: { 
    volume?: number; 
    debounceMs?: number;
  }) => {
    const now = Date.now();
    const debounce = options?.debounceMs ?? 0;
    
    if (debounce > 0) {
      const lastTime = lastPlayTime.current[name] ?? 0;
      if (now - lastTime < debounce) return;
      lastPlayTime.current[name] = now;
    }

    audioService.playSFX(name, { volume: options?.volume });
  }, []);

  return { play };
}

export function useBGM() {
  const play = useCallback((name: BGMName, options?: { volume?: number }) => {
    audioService.playBGM(name, options);
  }, []);

  const stop = useCallback(() => {
    audioService.stopBGM();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioService.setBGMVolume(volume);
  }, []);

  return { play, stop, setVolume };
}

export function useGameAudio(preloadList: SFXName[], bgmType: BGMName) {
  const audio = useAudio();
  const bgm = useBGM();

  useEffect(() => {
    audioService.preloadSFX(preloadList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bgm.play(bgmType, { volume: 0.3 });
    return () => bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...audio, bgm };
}

export function useShooterAudio() {
  return useGameAudio([
    'countdown_voice',
    'game_over',
    'game_lose',
    'game_point',
    'shooter_laser',
    'shooter_enemy_hit',
    'shooter_enemy_fast_hit',
    'shooter_player_hit',
  ], 'battle');
}

export function usePuzzleAudio() {
  return useGameAudio([
    'countdown_voice',
    'game_over',
    'game_lose',
    'game_point',
    'puzzle_swap',
    'puzzle_match',
    'puzzle_combo',
  ], 'puzzle');
}

export function usePongAudio() {
  return useGameAudio([
    'countdown_voice',
    'game_over',
    'game_lose',
    'game_point',
    'pong_paddle_hit',
    'pong_wall_hit',
    'pong_score',
    'pong_miss',
  ], 'arcade');
}

export function useSnakeAudio() {
  return useGameAudio([
    'countdown_voice',
    'game_over',
    'game_lose',
    'game_point',
    'snake_eat',
    'snake_collision',
  ], 'adventure');
}

export function useBlockDropAudio() {
  return useGameAudio([
    'countdown_voice',
    'game_over',
    'game_lose',
    'game_point',
    'blockdrop_move',
    'blockdrop_rotate',
    'blockdrop_drop',
    'blockdrop_line_clear',
    'blockdrop_tetris',
  ], 'puzzle');
}

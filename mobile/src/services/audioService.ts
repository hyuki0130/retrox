import {
  AudioContext,
  AudioBuffer,
  AudioBufferSourceNode,
  GainNode,
} from 'react-native-audio-api';
import { Image } from 'react-native';
import { useSettingsStore } from '@/store';

type SFXName =
  | 'menu_click'
  | 'game_over'
  | 'game_lose'
  | 'game_point'
  | 'victory'
  | 'coin_earn'
  | 'coin_spend'
  | 'countdown_voice'
  | 'shooter_laser'
  | 'shooter_enemy_hit'
  | 'shooter_enemy_fast_hit'
  | 'shooter_player_hit'
  | 'puzzle_swap'
  | 'puzzle_match'
  | 'puzzle_combo'
  | 'pong_paddle_hit'
  | 'pong_wall_hit'
  | 'pong_score'
  | 'pong_miss'
  | 'snake_eat'
  | 'snake_collision'
  | 'blockdrop_move'
  | 'blockdrop_rotate'
  | 'blockdrop_drop'
  | 'blockdrop_line_clear'
  | 'blockdrop_tetris';

type BGMName = 'battle' | 'arcade' | 'puzzle' | 'adventure' | 'menu';

type AssetSource = ReturnType<typeof require>;

const SFX_FILES: Record<SFXName, AssetSource> = {
  menu_click: require('@/assets/audio/sfx/common/menu_click.ogg'),
  game_over: require('@/assets/audio/sfx/common/game_over.ogg'),
  game_lose: require('@/assets/audio/sfx/common/game_lose.mp3'),
  game_point: require('@/assets/audio/sfx/common/game_point.mp3'),
  victory: require('@/assets/audio/sfx/common/victory.ogg'),
  coin_earn: require('@/assets/audio/sfx/common/coin_earn.ogg'),
  coin_spend: require('@/assets/audio/sfx/common/coin_spend.ogg'),
  countdown_voice: require('@/assets/audio/sfx/common/countdown_voice.mp3'),
  shooter_laser: require('@/assets/audio/sfx/shooter/laser.ogg'),
  shooter_enemy_hit: require('@/assets/audio/sfx/shooter/enemy_hit.ogg'),
  shooter_enemy_fast_hit: require('@/assets/audio/sfx/shooter/enemy_fast_hit.ogg'),
  shooter_player_hit: require('@/assets/audio/sfx/shooter/player_hit.ogg'),
  puzzle_swap: require('@/assets/audio/sfx/puzzle/swap.ogg'),
  puzzle_match: require('@/assets/audio/sfx/puzzle/match.ogg'),
  puzzle_combo: require('@/assets/audio/sfx/puzzle/combo.ogg'),
  pong_paddle_hit: require('@/assets/audio/sfx/pong/paddle_hit.ogg'),
  pong_wall_hit: require('@/assets/audio/sfx/pong/wall_hit.ogg'),
  pong_score: require('@/assets/audio/sfx/pong/score.ogg'),
  pong_miss: require('@/assets/audio/sfx/pong/miss.ogg'),
  snake_eat: require('@/assets/audio/sfx/snake/eat.ogg'),
  snake_collision: require('@/assets/audio/sfx/snake/collision.ogg'),
  blockdrop_move: require('@/assets/audio/sfx/blockdrop/move.ogg'),
  blockdrop_rotate: require('@/assets/audio/sfx/blockdrop/rotate.ogg'),
  blockdrop_drop: require('@/assets/audio/sfx/blockdrop/drop.ogg'),
  blockdrop_line_clear: require('@/assets/audio/sfx/blockdrop/line_clear.ogg'),
  blockdrop_tetris: require('@/assets/audio/sfx/blockdrop/tetris.ogg'),
};

const BGM_FILES: Record<BGMName, AssetSource> = {
  battle: require('@/assets/audio/bgm/bgm_battle.mp3'),
  arcade: require('@/assets/audio/bgm/bgm_arcade.mp3'),
  puzzle: require('@/assets/audio/bgm/bgm_puzzle.ogg'),
  adventure: require('@/assets/audio/bgm/bgm_adventure.mp3'),
  menu: require('@/assets/audio/bgm/bgm_menu.ogg'),
};

class AudioService {
  private audioContext: AudioContext | null = null;
  private bufferCache: Map<SFXName, AudioBuffer> = new Map();
  private bgmBufferCache: Map<BGMName, AudioBuffer> = new Map();
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGain: GainNode | null = null;
  private currentBGM: BGMName | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new AudioContext();
      this.isInitialized = true;
    } catch (error) {
      console.warn('AudioService init failed:', error);
    }
  }

  private resolveAssetUri(asset: AssetSource): string {
    const resolved = Image.resolveAssetSource(asset);
    return resolved.uri;
  }

  private async loadAudioBuffer(asset: AssetSource): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      const uri = this.resolveAssetUri(asset);
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn('Failed to load audio:', error);
      return null;
    }
  }

  async preloadSFX(names: SFXName[]): Promise<void> {
    await this.init();
    if (!this.audioContext) return;

    const loadPromises = names.map(async (name) => {
      if (this.bufferCache.has(name)) return;

      const buffer = await this.loadAudioBuffer(SFX_FILES[name]);
      if (buffer) {
        this.bufferCache.set(name, buffer);
      }
    });

    await Promise.all(loadPromises);
  }

  playSFX(name: SFXName, options?: { volume?: number }): void {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled || !this.audioContext) return;

    const buffer = this.bufferCache.get(name);
    if (!buffer) {
      this.loadAndPlay(name, options);
      return;
    }

    this.playBuffer(buffer, options?.volume ?? 1.0);
  }

  private async loadAndPlay(name: SFXName, options?: { volume?: number }): Promise<void> {
    const buffer = await this.loadAudioBuffer(SFX_FILES[name]);
    if (buffer) {
      this.bufferCache.set(name, buffer);
      this.playBuffer(buffer, options?.volume ?? 1.0);
    }
  }

  private playBuffer(buffer: AudioBuffer, volume: number): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(this.audioContext.currentTime);
  }

  async playBGM(name: BGMName, options?: { volume?: number }): Promise<void> {
    const { musicEnabled } = useSettingsStore.getState();
    if (!musicEnabled) return;

    await this.init();
    if (!this.audioContext) return;

    if (this.currentBGM === name && this.bgmSource) return;

    this.stopBGM();

    let buffer: AudioBuffer | undefined = this.bgmBufferCache.get(name);
    if (!buffer) {
      const loaded = await this.loadAudioBuffer(BGM_FILES[name]);
      if (loaded) {
        buffer = loaded;
        this.bgmBufferCache.set(name, buffer);
      }
    }

    if (!buffer) return;

    this.bgmSource = this.audioContext.createBufferSource();
    this.bgmGain = this.audioContext.createGain();

    this.bgmSource.buffer = buffer;
    this.bgmSource.loop = true;
    this.bgmGain.gain.value = options?.volume ?? 0.5;

    this.bgmSource.connect(this.bgmGain);
    this.bgmGain.connect(this.audioContext.destination);

    this.bgmSource.start(this.audioContext.currentTime);
    this.currentBGM = name;
  }

  stopBGM(): void {
    if (this.bgmSource && this.audioContext) {
      try {
        this.bgmSource.stop(this.audioContext.currentTime);
      } catch {}
      this.bgmSource = null;
      this.bgmGain = null;
      this.currentBGM = null;
    }
  }

  setBGMVolume(volume: number): void {
    if (this.bgmGain && this.audioContext) {
      this.bgmGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }

  stopAllSFX(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new AudioContext();
    }
  }

  unloadAll(): void {
    this.stopBGM();
    this.bufferCache.clear();
    this.bgmBufferCache.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

export const audioService = new AudioService();

export type { SFXName, BGMName };

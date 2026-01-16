/**
 * Game Sprites Index
 *
 * Asset source: Kenney.nl (CC0 Public Domain)
 * Download assets from https://kenney.nl/assets and place in respective folders.
 *
 * Required asset packs:
 * - shooter/: Space Shooter Redux (https://kenney.nl/assets/space-shooter-redux)
 * - puzzle/: Puzzle Pack 2 (https://kenney.nl/assets/puzzle-pack-2)
 * - pong/: Puzzle Pack (https://kenney.nl/assets/puzzle-pack)
 * - snake/: Pixel Platformer Food (https://kenney.nl/assets/pixel-platformer-food-expansion)
 * - blockdrop/: Physics Assets (https://kenney.nl/assets/physics-assets)
 */

export const ShooterSprites = {
  player: require('./shooter/playerShip1_blue.png'),
  enemy1: require('./shooter/enemyRed1.png'),
  enemy2: require('./shooter/enemyRed2.png'),
  enemy3: require('./shooter/enemyRed3.png'),
  laserBlue: require('./shooter/laserBlue01.png'),
  laserRed: require('./shooter/laserRed01.png'),
} as const;

export const PuzzleSprites = {
  gemRed: require('./puzzle/gemRed.png'),
  gemGreen: require('./puzzle/gemGreen.png'),
  gemYellow: require('./puzzle/gemYellow.png'),
  gemBlue: require('./puzzle/gemBlue.png'),
  gemOrange: require('./puzzle/gemOrange.png'),
  gemPurple: require('./puzzle/gemPurple.png'),
} as const;

export const PongSprites = {
  paddleBlue: require('./pong/paddleBlue.png'),
  paddleRed: require('./pong/paddleRed.png'),
  ball: require('./pong/ballGrey.png'),
} as const;

export const SnakeSprites = {
  head: require('./snake/head.png'),
  body: require('./snake/body.png'),
  tail: require('./snake/tail.png'),
  apple: require('./snake/apple.png'),
  cherry: require('./snake/cherry.png'),
} as const;

export const BlockDropSprites = {
  blockCyan: require('./blockdrop/blockCyan.png'),
  blockYellow: require('./blockdrop/blockYellow.png'),
  blockPurple: require('./blockdrop/blockPurple.png'),
  blockGreen: require('./blockdrop/blockGreen.png'),
  blockRed: require('./blockdrop/blockRed.png'),
  blockBlue: require('./blockdrop/blockBlue.png'),
  blockOrange: require('./blockdrop/blockOrange.png'),
} as const;

export type SpriteSource = ReturnType<typeof require>;

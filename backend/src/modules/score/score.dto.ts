export class CreateScoreDto {
  declare gameId: string;
  declare score: number;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  displayName: string | null;
  gameId: string;
  score: number;
  createdAt: Date;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  score: number;
}

export interface GameRanking {
  gameId: string;
  rankings: RankingEntry[];
}

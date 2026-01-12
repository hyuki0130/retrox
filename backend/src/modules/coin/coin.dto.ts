export class AddCoinsDto {
  declare amount: number;
  declare reason: string;
}

export class SpendCoinsDto {
  declare amount: number;
  declare reason: string;
}

export interface CoinLedgerEntry {
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface CoinBalance {
  balance: number;
  ledger: CoinLedgerEntry[];
}

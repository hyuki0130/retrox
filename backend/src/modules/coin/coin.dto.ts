export class AddCoinsDto {
  amount: number;
  reason: string;
}

export class SpendCoinsDto {
  amount: number;
  reason: string;
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

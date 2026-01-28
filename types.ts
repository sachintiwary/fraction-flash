export interface FractionData {
  fraction: string;
  percent: string;
}

export interface Question extends FractionData {
  options: string[];
}

export type GameState = 'start' | 'playing' | 'end';

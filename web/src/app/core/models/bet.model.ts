export type BetType = 'Simples' | 'Multipla';
export type BetStatus = 'Pendente' | 'Ganha' | 'Perdida' | 'Anulada';

export interface BetLeg {
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  odd: number;
}

export interface Bet {
  id: number;
  type: BetType;
  status: BetStatus;
  sport?: string;
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  market?: string;
  odd: number;
  stake: number;
  profit: number;
  eventDate: string;
  legs: BetLeg[];
}

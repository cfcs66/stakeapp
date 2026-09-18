export interface GeneralStats {
  apostasNoMes: number;
  lucroMensal: number;
}

export interface CalendarDay {
  dia: number;
  valor: number;
}

export interface TeamStats {
  equipa: string;
  desporto: string;
  campeonatos: string;
  apostas: number;
  winRate: number;
  lucro: number;
}

export interface TypeStats {
  tipo: string;
  apostas: number;
  winRate: number;
  lucro: number;
}

export interface MarketStats {
  mercado: string;
  apostas: number;
  winRate: number;
  lucro: number;
}

export interface TypeStatsResponse {
  porTipo: TypeStats[];
  porMercado: MarketStats[];
}

export interface Sport {
  id: number;
  name: string;
}

export interface League {
  id: number;
  name: string;
  sportId: number;
}

export interface Team {
  id: number;
  name: string;
  sportId: number;
}

export interface Market {
  id: number;
  name: string;
  sportId: number;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bet, BetStatus } from '../models/bet.model';
import { League, Team, Sport, Market } from '../models/sports.model';
import { BankMovement } from '../models/bank.model';
import { GeneralStats, CalendarDay, TeamStats, TypeStatsResponse } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Apostas ---
  getBets(): Observable<Bet[]> {
    return this.http.get<Bet[]>(`${this.baseUrl}/bets`);
  }

  createBet(bet: Partial<Bet>): Observable<Bet> {
    return this.http.post<Bet>(`${this.baseUrl}/bets`, bet);
  }

  updateBetResult(id: number, status: BetStatus): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/bets/${id}/resultado`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- Catálogo: Modalidade / Campeonato / Equipa (geridos manualmente por ti) ---
  getSports(): Observable<Sport[]> {
    return this.http.get<Sport[]>(`${this.baseUrl}/sports`);
  }
  createSport(name: string): Observable<Sport> {
    return this.http.post<Sport>(`${this.baseUrl}/sports`, { name });
  }
  deleteSport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sports/${id}`);
  }

  getLeagues(sportId: number): Observable<League[]> {
    return this.http.get<League[]>(`${this.baseUrl}/sports/${sportId}/campeonatos`);
  }
  createLeague(sportId: number, name: string): Observable<League> {
    return this.http.post<League>(`${this.baseUrl}/sports/${sportId}/campeonatos`, { name });
  }
  deleteLeague(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/campeonatos/${id}`);
  }

  getTeams(sportId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/sports/${sportId}/equipas`);
  }
  createTeam(sportId: number, name: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/sports/${sportId}/equipas`, { name });
  }
  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/equipas/${id}`);
  }

  getMarkets(sportId: number): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.baseUrl}/sports/${sportId}/mercados`);
  }
  createMarket(sportId: number, name: string): Observable<Market> {
    return this.http.post<Market>(`${this.baseUrl}/sports/${sportId}/mercados`, { name });
  }
  deleteMarket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/mercados/${id}`);
  }

  // --- Banca ---
  getCurrentBank(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/bank/atual`);
  }

  getMovements(): Observable<BankMovement[]> {
    return this.http.get<BankMovement[]>(`${this.baseUrl}/bank/movimentos`);
  }

  addMovement(movement: Partial<BankMovement>): Observable<BankMovement> {
    return this.http.post<BankMovement>(`${this.baseUrl}/bank/movimentos`, movement);
  }

  // --- Estatísticas ---
  getGeneralStats(): Observable<GeneralStats> {
    return this.http.get<GeneralStats>(`${this.baseUrl}/stats/geral`);
  }

  getCalendar(year: number, month: number): Observable<CalendarDay[]> {
    return this.http.get<CalendarDay[]>(`${this.baseUrl}/stats/calendario`, { params: { year, month } as any });
  }

  getDayBets(year: number, month: number, day: number): Observable<Bet[]> {
    return this.http.get<Bet[]>(`${this.baseUrl}/stats/dia`, { params: { year, month, day } as any });
  }

  getTeamStats(): Observable<TeamStats[]> {
    return this.http.get<TeamStats[]>(`${this.baseUrl}/stats/equipas`);
  }

  getTypeStats(): Observable<TypeStatsResponse> {
    return this.http.get<TypeStatsResponse>(`${this.baseUrl}/stats/tipos`);
  }
}

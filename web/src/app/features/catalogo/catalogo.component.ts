import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Sport, League, Team, Market } from '../../core/models/sports.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  sports = signal<Sport[]>([]);
  leagues = signal<League[]>([]);
  teams = signal<Team[]>([]);
  markets = signal<Market[]>([]);

  selectedSport = signal<Sport | null>(null);

  newSportName = signal('');
  newLeagueName = signal('');
  newTeamName = signal('');
  newMarketName = signal('');

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSports();
  }

  loadSports(): void {
    this.api.getSports().subscribe(sports => this.sports.set(sports));
  }

  selectSport(sport: Sport): void {
    this.selectedSport.set(sport);
    this.api.getLeagues(sport.id).subscribe(leagues => this.leagues.set(leagues));
    this.api.getTeams(sport.id).subscribe(teams => this.teams.set(teams));
    this.api.getMarkets(sport.id).subscribe(markets => this.markets.set(markets));
  }

  addSport(): void {
    const name = this.newSportName().trim();
    if (!name) return;
    this.api.createSport(name).subscribe({
      next: (sport) => {
        this.newSportName.set('');
        this.loadSports();
        this.selectSport(sport);
      },
      error: (err) => alert(err.error ?? 'Não foi possível criar a modalidade.')
    });
  }

  addLeague(): void {
    const sport = this.selectedSport();
    const name = this.newLeagueName().trim();
    if (!sport || !name) return;
    this.api.createLeague(sport.id, name).subscribe({
      next: () => {
        this.newLeagueName.set('');
        this.selectSport(sport);
      },
      error: (err) => alert(err.error ?? 'Não foi possível criar o campeonato.')
    });
  }

  addTeam(): void {
    const sport = this.selectedSport();
    const name = this.newTeamName().trim();
    if (!sport || !name) return;
    this.api.createTeam(sport.id, name).subscribe({
      next: () => {
        this.newTeamName.set('');
        this.selectSport(sport);
      },
      error: (err) => alert(err.error ?? 'Não foi possível criar a equipa.')
    });
  }

  addMarket(): void {
    const sport = this.selectedSport();
    const name = this.newMarketName().trim();
    if (!sport || !name) return;
    this.api.createMarket(sport.id, name).subscribe({
      next: () => {
        this.newMarketName.set('');
        this.selectSport(sport);
      },
      error: (err) => alert(err.error ?? 'Não foi possível criar o mercado.')
    });
  }

  removeSport(sport: Sport, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Remover "${sport.name}"? Isto apaga também todos os campeonatos e equipas dentro dela.`)) return;
    this.api.deleteSport(sport.id).subscribe(() => {
      if (this.selectedSport()?.id === sport.id) {
        this.selectedSport.set(null);
        this.leagues.set([]);
        this.teams.set([]);
      }
      this.loadSports();
    });
  }

  removeLeague(league: League, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Remover "${league.name}"?`)) return;
    this.api.deleteLeague(league.id).subscribe(() => {
      const sport = this.selectedSport();
      if (sport) this.selectSport(sport);
    });
  }

  removeTeam(team: Team, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Remover "${team.name}"?`)) return;
    this.api.deleteTeam(team.id).subscribe(() => {
      const sport = this.selectedSport();
      if (sport) this.selectSport(sport);
    });
  }

  removeMarket(market: Market, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Remover "${market.name}"?`)) return;
    this.api.deleteMarket(market.id).subscribe(() => {
      const sport = this.selectedSport();
      if (sport) this.selectSport(sport);
    });
  }
}

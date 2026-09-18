import { Component, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BankStateService } from '../../core/services/bank-state.service';
import { Bet, BetStatus, BetLeg } from '../../core/models/bet.model';
import { League, Team, Market } from '../../core/models/sports.model';
import { BetTicketComponent } from '../../shared/bet-ticket/bet-ticket.component';
import { SearchSelectComponent, SelectOption } from '../../shared/search-select/search-select.component';

interface LegForm {
  sport: SelectOption | null;   // id = Sport.id
  leagues: League[];
  league: SelectOption | null;  // id = League.id
  teams: Team[];
  homeTeam: SelectOption | null; // id = Team.id
  awayTeam: SelectOption | null; // id = Team.id
  markets: Market[];
  market: SelectOption | null;  // id = Market.id
  odd: string;
}

function emptyLeg(): LegForm {
  return { sport: null, leagues: [], league: null, teams: [], homeTeam: null, awayTeam: null, markets: [], market: null, odd: '' };
}

@Component({
  selector: 'app-apostas',
  standalone: true,
  imports: [BetTicketComponent, SearchSelectComponent],
  templateUrl: './apostas.component.html'
})
export class ApostasComponent implements OnInit {
  bets = signal<Bet[]>([]);
  filter = signal<'todas' | 'Pendente' | 'Ganha' | 'Perdida'>('todas');
  modalOpen = signal(false);
  betType = signal<'Simples' | 'Multipla'>('Simples');
  saving = signal(false);

  sportOptions = signal<SelectOption[]>([]);

  // aposta simples: um único "leg"
  simples = signal<LegForm>(emptyLeg());
  simplesStake = signal('');

  // aposta múltipla: vários "legs"
  legs = signal<LegForm[]>([emptyLeg(), emptyLeg()]);
  multiStake = signal('');

  filteredBets = computed(() => {
    const f = this.filter();
    return f === 'todas' ? this.bets() : this.bets().filter(b => b.status === f);
  });

  counts = computed(() => {
    const all = this.bets();
    return {
      todas: all.length,
      Pendente: all.filter(b => b.status === 'Pendente').length,
      Ganha: all.filter(b => b.status === 'Ganha').length,
      Perdida: all.filter(b => b.status === 'Perdida').length
    };
  });

  multiOddTotal = computed(() => {
    const odds = this.legs().map(l => parseFloat((l.odd || '0').replace(',', '.'))).filter(v => v > 0);
    return odds.length ? odds.reduce((a, b) => a * b, 1) : 0;
  });

  multiReturn = computed(() => {
    const stake = parseFloat((this.multiStake() || '0').replace(',', '.')) || 0;
    return this.multiOddTotal() * stake;
  });

  constructor(private api: ApiService, public bankState: BankStateService) {}

  ngOnInit(): void {
    this.loadBets();
    this.api.getSports().subscribe(sports => this.sportOptions.set(sports.map(s => ({ id: s.id, label: s.name }))));
  }

  loadBets(): void {
    this.api.getBets().subscribe(bets => this.bets.set(bets));
  }

  // --- modal ---
  openModal(): void { this.modalOpen.set(true); }
  closeModal(): void { this.modalOpen.set(false); }

  setType(type: 'Simples' | 'Multipla'): void { this.betType.set(type); }

  // --- cascata Simples ---
  // Campeonato e Equipa carregam em paralelo, os dois dependem só da
  // Modalidade (uma equipa pode jogar em vários campeonatos ao mesmo tempo).
  onSimplesSportChange(opt: SelectOption | null): void {
    this.simples.set({ ...emptyLeg(), sport: opt });
    if (opt) {
      this.api.getLeagues(opt.id as number).subscribe(leagues => {
        this.simples.update(l => ({ ...l, leagues }));
      });
      this.api.getTeams(opt.id as number).subscribe(teams => {
        this.simples.update(l => ({ ...l, teams }));
      });
      this.api.getMarkets(opt.id as number).subscribe(markets => {
        this.simples.update(l => ({ ...l, markets }));
      });
    }
  }

  onSimplesLeagueChange(opt: SelectOption | null): void {
    this.simples.update(l => ({ ...l, league: opt }));
  }

  simplesLeagueOptions(): SelectOption[] {
    return this.simples().leagues.map(l => ({ id: l.id, label: l.name }));
  }
  simplesTeamOptions(): SelectOption[] {
    return this.simples().teams.map(t => ({ id: t.id, label: t.name }));
  }
  simplesMarketOptions(): SelectOption[] {
    return this.simples().markets.map(m => ({ id: m.id, label: m.name }));
  }

  onSimplesHomeTeamChange(opt: SelectOption | null): void {
    this.simples.update(l => ({ ...l, homeTeam: opt }));
  }
  onSimplesAwayTeamChange(opt: SelectOption | null): void {
    this.simples.update(l => ({ ...l, awayTeam: opt }));
  }
  onSimplesMarketChange(opt: SelectOption | null): void {
    this.simples.update(l => ({ ...l, market: opt }));
  }
  onSimplesOddInput(value: string): void {
    this.simples.update(l => ({ ...l, odd: value }));
  }

  // --- cascata Múltipla (por leg) ---
  onLegSportChange(index: number, opt: SelectOption | null): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...emptyLeg(), sport: opt, odd: l.odd } : l)));
    if (opt) {
      this.api.getLeagues(opt.id as number).subscribe(leagues => {
        this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, leagues } : l)));
      });
      this.api.getTeams(opt.id as number).subscribe(teams => {
        this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, teams } : l)));
      });
      this.api.getMarkets(opt.id as number).subscribe(markets => {
        this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, markets } : l)));
      });
    }
  }

  onLegLeagueChange(index: number, opt: SelectOption | null): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, league: opt } : l)));
  }

  legLeagueOptions(leg: LegForm): SelectOption[] {
    return leg.leagues.map(l => ({ id: l.id, label: l.name }));
  }
  legTeamOptions(leg: LegForm): SelectOption[] {
    return leg.teams.map(t => ({ id: t.id, label: t.name }));
  }
  legMarketOptions(leg: LegForm): SelectOption[] {
    return leg.markets.map(m => ({ id: m.id, label: m.name }));
  }

  onLegHomeTeamChange(index: number, opt: SelectOption | null): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, homeTeam: opt } : l)));
  }
  onLegAwayTeamChange(index: number, opt: SelectOption | null): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, awayTeam: opt } : l)));
  }
  onLegMarketChange(index: number, opt: SelectOption | null): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, market: opt } : l)));
  }

  addLeg(): void { this.legs.update(legs => [...legs, emptyLeg()]); }
  removeLeg(index: number): void { this.legs.update(legs => legs.filter((_, i) => i !== index)); }
  updateLegOdd(index: number, value: string): void {
    this.legs.update(legs => legs.map((l, i) => (i === index ? { ...l, odd: value } : l)));
  }

  // --- submeter ---
  canSave(): boolean {
    if (this.betType() === 'Simples') {
      const l = this.simples();
      return !!(l.sport && l.league && l.homeTeam && l.awayTeam && l.market && l.odd && this.simplesStake());
    }
    const legs = this.legs();
    return legs.length >= 2
      && legs.every(l => l.sport && l.league && l.homeTeam && l.awayTeam && l.market && l.odd)
      && !!this.multiStake();
  }

  save(): void {
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);

    const payload = this.betType() === 'Simples' ? this.buildSimplesPayload() : this.buildMultiplaPayload();

    this.api.createBet(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.resetForms();
        this.loadBets();
      },
      error: () => this.saving.set(false)
    });
  }

  private buildSimplesPayload(): Partial<Bet> {
    const l = this.simples();
    return {
      type: 'Simples',
      status: 'Pendente',
      sport: l.sport?.label,
      league: l.league?.label,
      homeTeam: l.homeTeam?.label,
      awayTeam: l.awayTeam?.label,
      market: l.market?.label,
      odd: parseFloat(l.odd.replace(',', '.')),
      stake: parseFloat(this.simplesStake().replace(',', '.')),
      profit: 0,
      eventDate: new Date().toISOString(),
      legs: []
    };
  }

  private buildMultiplaPayload(): Partial<Bet> {
    const legs: BetLeg[] = this.legs().map(l => ({
      sport: l.sport!.label,
      league: l.league!.label,
      homeTeam: l.homeTeam!.label,
      awayTeam: l.awayTeam!.label,
      market: l.market!.label,
      odd: parseFloat(l.odd.replace(',', '.'))
    }));

    return {
      type: 'Multipla',
      status: 'Pendente',
      odd: this.multiOddTotal(),
      stake: parseFloat(this.multiStake().replace(',', '.')),
      profit: 0,
      eventDate: new Date().toISOString(),
      legs
    };
  }

  private resetForms(): void {
    this.betType.set('Simples');
    this.simples.set(emptyLeg());
    this.simplesStake.set('');
    this.legs.set([emptyLeg(), emptyLeg()]);
    this.multiStake.set('');
  }

  setFilter(f: 'todas' | 'Pendente' | 'Ganha' | 'Perdida'): void { this.filter.set(f); }

  // --- marcar resultado diretamente na lista ---
  markResult(bet: Bet, status: BetStatus): void {
    this.api.updateBetResult(bet.id, status).subscribe(() => {
      this.loadBets();
      this.bankState.refresh();
    });
  }
}

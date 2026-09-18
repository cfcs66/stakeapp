import { Component, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Bet } from '../../core/models/bet.model';
import { GeneralStats, CalendarDay, TeamStats, TypeStats, MarketStats } from '../../core/models/stats.model';
import { BetTicketComponent } from '../../shared/bet-ticket/bet-ticket.component';

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [BetTicketComponent],
  templateUrl: './estatisticas.component.html'
})
export class EstatisticasComponent implements OnInit {
  subTab = signal<'geral' | 'equipa' | 'tipo'>('geral');

  // --- Geral ---
  general = signal<GeneralStats>({ apostasNoMes: 0, lucroMensal: 0 });
  calYear = signal(new Date().getFullYear());
  calMonth = signal(new Date().getMonth() + 1); // 1-12
  calendarDays = signal<CalendarDay[]>([]);
  selectedDay = signal<number | null>(null);
  dayBets = signal<Bet[]>([]);

  monthLabel = computed(() => `${MONTH_NAMES[this.calMonth() - 1]} ${this.calYear()}`);
  daysInMonth = computed(() => new Date(this.calYear(), this.calMonth(), 0).getDate());
  calendarGrid = computed(() => {
    const map = new Map(this.calendarDays().map(d => [d.dia, d.valor]));
    return Array.from({ length: this.daysInMonth() }, (_, i) => {
      const day = i + 1;
      const valor = map.get(day);
      return { day, valor, status: valor === undefined ? '' : (valor >= 0 ? 'win' : 'loss') };
    });
  });

  // --- Equipa ---
  teamStats = signal<TeamStats[]>([]);

  // --- Tipo ---
  typeStats = signal<TypeStats[]>([]);
  marketStats = signal<MarketStats[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getGeneralStats().subscribe(g => this.general.set(g));
    this.loadCalendar();
    this.api.getTeamStats().subscribe(t => this.teamStats.set(t));
    this.api.getTypeStats().subscribe(r => {
      this.typeStats.set(r.porTipo);
      this.marketStats.set(r.porMercado);
    });
  }

  setSubTab(tab: 'geral' | 'equipa' | 'tipo'): void { this.subTab.set(tab); }

  loadCalendar(): void {
    this.api.getCalendar(this.calYear(), this.calMonth()).subscribe(days => this.calendarDays.set(days));
    this.selectedDay.set(null);
    this.dayBets.set([]);
  }

  prevMonth(): void {
    let m = this.calMonth() - 1, y = this.calYear();
    if (m < 1) { m = 12; y--; }
    this.calMonth.set(m); this.calYear.set(y);
    this.loadCalendar();
  }

  nextMonth(): void {
    let m = this.calMonth() + 1, y = this.calYear();
    if (m > 12) { m = 1; y++; }
    this.calMonth.set(m); this.calYear.set(y);
    this.loadCalendar();
  }

  selectDay(day: number): void {
    this.selectedDay.set(day);
    this.api.getDayBets(this.calYear(), this.calMonth(), day).subscribe(bets => this.dayBets.set(bets));
  }

  formatMoney(v: number): string {
    const sign = v > 0 ? '+' : '';
    return `${sign}€ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
  }
}

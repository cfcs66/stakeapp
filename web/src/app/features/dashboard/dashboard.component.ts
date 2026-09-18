import { Component, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BankStateService } from '../../core/services/bank-state.service';
import { Bet } from '../../core/models/bet.model';
import { GeneralStats, CalendarDay } from '../../core/models/stats.model';
import { BetTicketComponent } from '../../shared/bet-ticket/bet-ticket.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BetTicketComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  bets = signal<Bet[]>([]);
  general = signal<GeneralStats>({ apostasNoMes: 0, lucroMensal: 0 });
  calendarDays = signal<CalendarDay[]>([]);

  today = new Date();
  monthLabel = this.today.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  ultimasApostas = computed(() => this.bets().slice(0, 4));

  // pontos SVG da evolução da banca, calculados a partir do lucro acumulado das apostas resolvidas
  chartPoints = computed(() => {
    const resolved = [...this.bets()]
      .filter(b => b.status === 'Ganha' || b.status === 'Perdida')
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    let acc = 0;
    const values = resolved.map(b => (acc += b.profit));
    return values.length ? values : [0];
  });

  chartPath = computed(() => {
    const points = this.chartPoints();
    const w = 1080, h = 170, pad = 8;
    const min = Math.min(...points, 0);
    const max = Math.max(...points, 0);
    const range = max - min || 1;
    const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;

    const coords = points.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
    const line = 'M' + coords.map(c => c.join(',')).join(' L');
    const area = line + ` L${coords[coords.length - 1][0]},${h} L${pad},${h} Z`;
    return { line, area, last: coords[coords.length - 1] };
  });

  daysInMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();
  calendarGrid = computed(() => {
    const map = new Map(this.calendarDays().map(d => [d.dia, d.valor]));
    return Array.from({ length: this.daysInMonth }, (_, i) => {
      const day = i + 1;
      const valor = map.get(day);
      return { day, valor, status: valor === undefined ? '' : (valor >= 0 ? 'win' : 'loss') };
    });
  });

  constructor(private api: ApiService, public bankState: BankStateService) {}

  ngOnInit(): void {
    this.api.getBets().subscribe(bets => this.bets.set(bets));
    this.bankState.refresh();
    this.api.getGeneralStats().subscribe(g => this.general.set(g));
    this.api.getCalendar(this.today.getFullYear(), this.today.getMonth() + 1)
      .subscribe(days => this.calendarDays.set(days));
  }

  formatMoney(v: number): string {
    const sign = v > 0 ? '+' : '';
    return `${sign}€ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
  }
}

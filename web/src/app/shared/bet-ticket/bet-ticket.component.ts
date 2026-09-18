import { Component, Input } from '@angular/core';
import { Bet, BetStatus } from '../../core/models/bet.model';

@Component({
  selector: 'app-bet-ticket',
  standalone: true,
  imports: [],
  templateUrl: './bet-ticket.component.html'
})
export class BetTicketComponent {
  @Input({ required: true }) bet!: Bet;

  statusLabel(status: BetStatus): string {
    return { Pendente: 'Pendente', Ganha: 'Ganha', Perdida: 'Perdida', Anulada: 'Anulada' }[status];
  }

  statusClass(status: BetStatus): string {
    return { Pendente: 'pending', Ganha: 'win', Perdida: 'loss', Anulada: 'void' }[status];
  }

  profitClass(): string {
    if (this.bet.profit > 0) return 'pos';
    if (this.bet.profit < 0) return 'neg';
    return 'zero';
  }

  profitText(): string {
    if (this.bet.profit === 0) {
      return this.bet.status === 'Pendente' ? `Risco € ${this.bet.stake.toFixed(2)}` : '€ 0,00';
    }
    const sign = this.bet.profit > 0 ? '+' : '';
    return `${sign}€ ${Math.abs(this.bet.profit).toFixed(2).replace('.', ',')}`;
  }

  eventLabel(): string {
    return this.bet.type === 'Multipla'
      ? `Múltipla · ${this.bet.legs.length} jogos`
      : `${this.bet.homeTeam} vs. ${this.bet.awayTeam}`;
  }

  marketLabel(): string {
    return this.bet.type === 'Multipla'
      ? this.bet.legs.map(l => `${l.homeTeam} ${l.market}`).join(' · ')
      : (this.bet.market ?? '');
  }

  dateLabel(): string {
    return new Date(this.bet.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  }
}

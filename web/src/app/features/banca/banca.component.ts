import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BankStateService } from '../../core/services/bank-state.service';
import { BankMovement, MovementType } from '../../core/models/bank.model';

@Component({
  selector: 'app-banca',
  standalone: true,
  imports: [],
  templateUrl: './banca.component.html'
})
export class BancaComponent implements OnInit {
  movements = signal<BankMovement[]>([]);

  formOpen = signal(false);
  formType = signal<MovementType>('Deposito');
  formAmount = signal('');
  formDescription = signal('');
  saving = signal(false);

  constructor(private api: ApiService, public bankState: BankStateService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bankState.refresh();
    this.api.getMovements().subscribe(m => this.movements.set(m));
  }

  lucroDesdeInicio(): number {
    const deposits = this.movements().filter(m => m.type === 'Deposito').reduce((a, m) => a + m.amount, 0);
    const withdrawals = this.movements().filter(m => m.type === 'Levantamento').reduce((a, m) => a + m.amount, 0);
    return (this.bankState.currentBank() ?? 0) - (deposits - withdrawals);
  }

  formatMoney(v: number): string {
    const sign = v > 0 ? '+' : '';
    return `${sign}€ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  }

  openForm(): void { this.formOpen.set(true); }
  closeForm(): void {
    this.formOpen.set(false);
    this.formAmount.set('');
    this.formDescription.set('');
  }

  save(): void {
    const amount = parseFloat(this.formAmount().replace(',', '.'));
    if (!amount || this.saving()) return;

    this.saving.set(true);
    this.api.addMovement({
      type: this.formType(),
      amount,
      description: this.formDescription() || undefined,
      date: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load(); // atualiza a lista local E a banca partilhada (sidebar)
      },
      error: () => this.saving.set(false)
    });
  }
}

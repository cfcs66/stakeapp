import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

// Estado partilhado da "Banca Atual" — usado pela sidebar e pela página
// Banca, para os dois mostrarem sempre o mesmo valor. Qualquer ação que
// mude a banca (novo movimento, aposta criada, resultado marcado) deve
// chamar refresh() para todos os sítios que mostram este valor
// atualizarem sozinhos.
@Injectable({ providedIn: 'root' })
export class BankStateService {
  currentBank = signal<number | null>(null);

  constructor(private api: ApiService) {}

  refresh(): void {
    this.api.getCurrentBank().subscribe({
      next: (v) => this.currentBank.set(v),
      error: () => this.currentBank.set(null)
    });
  }
}

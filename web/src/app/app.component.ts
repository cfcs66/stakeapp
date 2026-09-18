import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { BankStateService } from './core/services/bank-state.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  isLoginPage = computed(() => this.currentUrl().startsWith('/login'));

  constructor(
    public bankState: BankStateService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.bankState.refresh();
  }

  formatMoney(v: number): string {
    return '€ ' + v.toFixed(2).replace('.', ',');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  password = signal('');
  loading = signal(false);
  error = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    if (!this.password() || this.loading()) return;
    this.loading.set(true);
    this.error.set(false);

    this.auth.login(this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }
}

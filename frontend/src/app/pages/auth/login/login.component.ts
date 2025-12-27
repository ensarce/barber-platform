import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <!-- Header -->
          <div class="auth-header">
            <a routerLink="/" class="auth-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 5v14M18 5v14M6 12h12"/>
                <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
              </svg>
              <span>Kuaför<strong>Bul</strong></span>
            </a>
            <h1>Hoş Geldiniz</h1>
            <p>Hesabınıza giriş yapın</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
            @if (errorMessage()) {
              <div class="alert alert--error">{{ errorMessage() }}</div>
            }

            <div class="form-group">
              <label class="form-label">E-posta Adresi</label>
              <input 
                type="email" 
                class="form-input"
                [(ngModel)]="email"
                name="email"
                placeholder="ornek@email.com"
                required>
            </div>

            <div class="form-group">
              <label class="form-label">Şifre</label>
              <div class="password-input">
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-input"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  required>
                <button type="button" class="password-toggle" (click)="togglePassword()">
                  <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-row">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
                <span>Beni hatırla</span>
              </label>
              <a href="#" class="auth-link">Şifremi unuttum</a>
            </div>

            <button type="submit" class="btn btn--primary btn--full btn--lg" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="btn-spinner"></span>
                Giriş yapılıyor...
              } @else {
                Giriş Yap
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="auth-footer">
            <p>Hesabınız yok mu? <a routerLink="/register" class="auth-link">Kayıt Ol</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 50%, #ecfeff 100%);
      padding: 2rem 1rem;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
    }

    .auth-card {
      background: var(--white);
      border-radius: var(--radius-2xl);
      padding: 2.5rem;
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      color: var(--gray-800);
      margin-bottom: 1.5rem;
    }

    .auth-logo svg {
      color: var(--primary);
    }

    .auth-logo strong {
      color: var(--primary);
    }

    .auth-header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.375rem;
    }

    .auth-header p {
      color: var(--gray-500);
      font-size: 0.9375rem;
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .password-input {
      position: relative;
    }

    .password-input .form-input {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-toggle:hover {
      color: var(--gray-600);
    }

    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .checkbox input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--primary);
    }

    .auth-link {
      color: var(--primary);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    .auth-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-100);
    }

    .auth-footer p {
      color: var(--gray-600);
      font-size: 0.9375rem;
      margin: 0;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Alert Styles */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    .alert--error {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .alert--error::before {
      content: '✕';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #fee2e2;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .alert--success {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      color: #166534;
      border: 1px solid #86efac;
    }

    .alert--success::before {
      content: '✓';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #dcfce7;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 700;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Lütfen tüm alanları doldurun.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    });
  }
}

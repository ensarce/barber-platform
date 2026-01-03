import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
            <h1>Hesap Oluştur</h1>
            <p>Hemen ücretsiz kayıt olun</p>
          </div>

          <!-- Account Type Toggle -->
          <div class="account-type">
            <button 
              type="button"
              class="account-type__btn"
              [class.active]="accountType === 'customer'"
              (click)="accountType = 'customer'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Müşteri
            </button>
            <button 
              type="button"
              class="account-type__btn"
              [class.active]="accountType === 'barber'"
              (click)="accountType = 'barber'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 5v14M18 5v14M6 12h12"/>
                <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
              </svg>
              Kuaför
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
            @if (errorMessage()) {
              <div class="alert alert--error">{{ errorMessage() }}</div>
            }

            <div class="form-group">
              <label class="form-label">Ad Soyad</label>
              <input 
                type="text" 
                class="form-input"
                [(ngModel)]="fullName"
                name="fullName"
                placeholder="Adınız Soyadınız"
                required>
            </div>

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
              <label class="form-label">Telefon</label>
              <input 
                type="tel" 
                class="form-input"
                [(ngModel)]="phone"
                name="phone"
                placeholder="5XX XXX XX XX"
                required>
            </div>

            <div class="form-group">
              <label class="form-label">Şifre</label>
              <input 
                [type]="showPassword ? 'text' : 'password'"
                class="form-input"
                [(ngModel)]="password"
                name="password"
                placeholder="En az 8 karakter"
                required>
            </div>

            <div class="form-group">
              <label class="form-label">Şifre Tekrar</label>
              <input 
                type="password"
                class="form-input"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Şifrenizi tekrar girin"
                required>
            </div>

            <label class="custom-checkbox mb-4">
              <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required>
              <span class="checkbox-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span class="checkbox-label">
                <a href="#" class="auth-link">Kullanım koşullarını</a> kabul ediyorum
              </span>
            </label>

            <button type="submit" class="btn btn--primary btn--full btn--lg" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="btn-spinner"></span>
                Kayıt yapılıyor...
              } @else {
                Kayıt Ol
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="auth-footer">
            <p>Zaten hesabınız var mı? <a routerLink="/login" class="auth-link">Giriş Yap</a></p>
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
      max-width: 440px;
    }

    .auth-card {
      background: var(--white);
      border-radius: var(--radius-2xl);
      padding: 2rem 2.5rem 2.5rem;
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      color: var(--gray-800);
      margin-bottom: 1.25rem;
    }

    .auth-logo svg {
      color: var(--primary);
    }

    .auth-logo strong {
      color: var(--primary);
    }

    .auth-header h1 {
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.25rem;
    }

    .auth-header p {
      color: var(--gray-500);
      font-size: 0.9375rem;
    }

    /* Account Type Toggle */
    .account-type {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .account-type__btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--white);
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .account-type__btn:hover {
      border-color: var(--primary-light);
    }

    .account-type__btn.active {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
      color: var(--primary);
    }

    .account-type__btn.active svg {
      color: var(--primary);
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--gray-600);
      line-height: 1.4;
    }

    .checkbox input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      margin-top: 0.125rem;
      accent-color: var(--primary);
      flex-shrink: 0;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .auth-link {
      color: var(--primary);
      font-weight: 500;
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
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  accountType: 'customer' | 'barber' = 'customer';
  acceptTerms = false;
  showPassword = false;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.fullName || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Lütfen tüm alanları doldurun.');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Şifreler eşleşmiyor.');
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage.set('Kullanım koşullarını kabul etmelisiniz.');
      return;
    }

    this.isLoading.set(true);

    this.authService.register({
      name: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.accountType === 'barber' ? 'BARBER' : 'CUSTOMER'
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Kayıt yapılamadı. Lütfen tekrar deneyin.');
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-page">
      <div class="auth-container animate-slide-up">
        <div class="auth-header">
          <h1>Hesap Oluştur ✨</h1>
          <p>Hemen ücretsiz kayıt olun</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          @if (errorMessage) {
            <div class="alert alert--error">
              {{ errorMessage }}
            </div>
          }
          
          <!-- Role Selection -->
          <div class="role-selection">
            <label 
              class="role-option" 
              [class.selected]="registerForm.get('role')?.value === 'CUSTOMER'">
              <input type="radio" formControlName="role" value="CUSTOMER">
              <div class="role-option__content">
                <span class="role-option__icon">👤</span>
                <span class="role-option__label">Müşteri</span>
              </div>
            </label>
            <label 
              class="role-option" 
              [class.selected]="registerForm.get('role')?.value === 'BARBER'">
              <input type="radio" formControlName="role" value="BARBER">
              <div class="role-option__content">
                <span class="role-option__icon">✂️</span>
                <span class="role-option__label">Kuaför</span>
              </div>
            </label>
          </div>
          
          <div class="form-group">
            <label for="name">Ad Soyad</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              placeholder="Adınız Soyadınız">
            @if (registerForm.get('name')?.errors?.['required'] && registerForm.get('name')?.touched) {
              <span class="error-message">Ad soyad zorunludur</span>
            }
          </div>
          
          <div class="form-group">
            <label for="email">E-posta</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="ornek@email.com">
            @if (registerForm.get('email')?.errors?.['required'] && registerForm.get('email')?.touched) {
              <span class="error-message">E-posta zorunludur</span>
            }
            @if (registerForm.get('email')?.errors?.['email'] && registerForm.get('email')?.touched) {
              <span class="error-message">Geçerli bir e-posta giriniz</span>
            }
          </div>
          
          <div class="form-group">
            <label for="phone">Telefon (Opsiyonel)</label>
            <input 
              type="tel" 
              id="phone" 
              formControlName="phone" 
              placeholder="0555 123 4567">
          </div>
          
          <div class="form-group">
            <label for="password">Şifre</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="En az 6 karakter">
            @if (registerForm.get('password')?.errors?.['required'] && registerForm.get('password')?.touched) {
              <span class="error-message">Şifre zorunludur</span>
            }
            @if (registerForm.get('password')?.errors?.['minlength'] && registerForm.get('password')?.touched) {
              <span class="error-message">Şifre en az 6 karakter olmalıdır</span>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn--primary btn--full btn--lg" 
            [disabled]="registerForm.invalid || isLoading">
            @if (isLoading) {
              <span class="spinner spinner--sm"></span>
              Kayıt yapılıyor...
            } @else {
              Kayıt Ol
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Zaten hesabınız var mı? <a routerLink="/giris">Giriş Yap</a></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .auth-container {
      width: 100%;
      max-width: 480px;
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 3rem;
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h1 {
        font-size: 1.75rem;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .role-selection {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .role-option {
      cursor: pointer;
      
      input {
        display: none;
      }
      
      &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
      }
      
      &__icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      &__label {
        font-weight: 600;
        color: var(--text-primary);
      }
      
      &.selected .role-option__content {
        border-color: var(--accent);
        background: rgba(233, 69, 96, 0.05);
      }
      
      &:hover:not(.selected) .role-option__content {
        border-color: var(--text-muted);
      }
    }
    
    .auth-form {
      .form-group {
        margin-bottom: 1.25rem;
      }
    }
    
    .alert {
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      
      &--error {
        background: rgba(220, 53, 69, 0.1);
        color: var(--error);
        border: 1px solid rgba(220, 53, 69, 0.2);
      }
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      
      p {
        margin: 0;
        color: var(--text-secondary);
      }
    }
    
    .spinner--sm {
      width: 20px;
      height: 20px;
      border-width: 2px;
      margin-right: 0.5rem;
    }
  `]
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['CUSTOMER', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                const role = this.registerForm.get('role')?.value;
                if (role === 'BARBER') {
                    this.router.navigate(['/kuafor-paneli']);
                } else {
                    this.router.navigate(['/']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Kayıt sırasında bir hata oluştu';
            }
        });
    }
}

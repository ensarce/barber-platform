import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-page">
      <div class="auth-container animate-slide-up">
        <div class="auth-header">
          <h1>Hoş Geldiniz 👋</h1>
          <p>Hesabınıza giriş yapın</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          @if (errorMessage) {
            <div class="alert alert--error">
              {{ errorMessage }}
            </div>
          }
          
          <div class="form-group">
            <label for="email">E-posta</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="ornek@email.com"
              [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            @if (loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched) {
              <span class="error-message">E-posta zorunludur</span>
            }
            @if (loginForm.get('email')?.errors?.['email'] && loginForm.get('email')?.touched) {
              <span class="error-message">Geçerli bir e-posta giriniz</span>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Şifre</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="••••••••"
              [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            @if (loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched) {
              <span class="error-message">Şifre zorunludur</span>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn--primary btn--full btn--lg" 
            [disabled]="loginForm.invalid || isLoading">
            @if (isLoading) {
              <span class="spinner spinner--sm"></span>
              Giriş yapılıyor...
            } @else {
              Giriş Yap
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Hesabınız yok mu? <a routerLink="/kayit">Kayıt Ol</a></p>
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
      max-width: 440px;
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
    
    input.invalid {
      border-color: var(--error);
    }
    
    .spinner--sm {
      width: 20px;
      height: 20px;
      border-width: 2px;
      margin-right: 0.5rem;
    }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'E-posta veya şifre hatalı';
            }
        });
    }
}

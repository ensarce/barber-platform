import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ToastContainerComponent } from './core/components/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastContainerComponent],
  template: `
    <div class="app">
      <!-- Toast Notifications -->
      <app-toast-container />
      <!-- Header -->
      <header class="header" [class.scrolled]="isScrolled()">
        <div class="container">
          <nav class="nav">
            <!-- Logo -->
            <a routerLink="/" class="logo">
              <svg class="logo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 5v14M18 5v14M6 12h12"/>
                <circle cx="6" cy="5" r="2"/>
                <circle cx="18" cy="5" r="2"/>
                <circle cx="6" cy="19" r="2"/>
                <circle cx="18" cy="19" r="2"/>
              </svg>
              <span class="logo__text">Kuaför<span>Bul</span></span>
            </a>

            <!-- Desktop Navigation -->
            <div class="nav__links hide-mobile">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav__link">
                Ana Sayfa
              </a>
              <a routerLink="/barbers" routerLinkActive="active" class="nav__link">
                Kuaförler
              </a>
            </div>

            <!-- Desktop Auth -->
            <div class="nav__auth hide-mobile">
              @if (authService.isLoggedIn()) {
                <span class="nav__user">{{ authService.user()?.name }}</span>
                <button class="btn btn--ghost btn--sm" (click)="authService.logout()">
                  Çıkış
                </button>
              } @else {
                <a routerLink="/login" class="btn btn--ghost btn--sm">Giriş Yap</a>
                <a routerLink="/register" class="btn btn--primary btn--sm">Kayıt Ol</a>
              }
            </div>

            <!-- Mobile Menu Button -->
            <button class="hamburger hide-desktop" (click)="toggleMenu()" [class.active]="menuOpen()">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
        </div>
      </header>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="mobile-overlay" (click)="closeMenu()"></div>
        <aside class="mobile-menu animate-slideUp">
          <div class="mobile-menu__header">
            <svg class="logo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 5v14M18 5v14M6 12h12"/>
              <circle cx="6" cy="5" r="2"/>
              <circle cx="18" cy="5" r="2"/>
              <circle cx="6" cy="19" r="2"/>
              <circle cx="18" cy="19" r="2"/>
            </svg>
            <span class="logo__text">Kuaför<span>Bul</span></span>
            <button class="mobile-menu__close" (click)="closeMenu()">×</button>
          </div>
          
          <nav class="mobile-menu__nav">
            <a routerLink="/" (click)="closeMenu()" class="mobile-menu__link">
              Ana Sayfa
            </a>
            <a routerLink="/barbers" (click)="closeMenu()" class="mobile-menu__link">
              Kuaförler
            </a>
            
            @if (authService.isLoggedIn()) {
              <div class="mobile-menu__user">
                <span>{{ authService.user()?.name }}</span>
                <button class="btn btn--primary btn--full" (click)="logout()">
                  Çıkış Yap
                </button>
              </div>
            } @else {
              <div class="mobile-menu__auth">
                <a routerLink="/login" (click)="closeMenu()" class="btn btn--secondary btn--full">
                  Giriş Yap
                </a>
                <a routerLink="/register" (click)="closeMenu()" class="btn btn--primary btn--full">
                  Kayıt Ol
                </a>
              </div>
            }
          </nav>
        </aside>
      }

      <!-- Main Content -->
      <main class="main">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer__grid">
            <div class="footer__brand">
              <div class="logo">
                <svg class="logo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 5v14M18 5v14M6 12h12"/>
                  <circle cx="6" cy="5" r="2"/>
                  <circle cx="18" cy="5" r="2"/>
                  <circle cx="6" cy="19" r="2"/>
                  <circle cx="18" cy="19" r="2"/>
                </svg>
                <span class="logo__text">Kuaför<span>Bul</span></span>
              </div>
              <p class="footer__desc">
                Türkiye'nin en iyi kuaförlerini keşfedin, kolayca randevu alın.
              </p>
            </div>

            <div class="footer__links">
              <h4>Hızlı Linkler</h4>
              <a routerLink="/barbers">Kuaförler</a>
              <a routerLink="/register">Kuaför Ol</a>
            </div>

            <div class="footer__links">
              <h4>İletişim</h4>
              <p>info&#64;kuaforbul.com</p>
              <p>+90 555 123 45 67</p>
            </div>
          </div>

          <div class="footer__bottom">
            <p>© 2024 KuaförBul. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main {
      flex: 1;
      padding-top: var(--header-height);
    }

    /* ================================
       HEADER - Solid Background
       ================================ */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      height: var(--header-height);
      background: #ffffff;
      border-bottom: 1px solid var(--gray-200);
      transition: all var(--transition-base);
    }

    .header.scrolled {
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border-bottom-color: transparent;
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    /* Logo */
    .logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--gray-800);
    }

    .logo__icon {
      width: 28px;
      height: 28px;
      color: var(--primary);
    }

    .logo__text span {
      color: var(--primary);
    }

    /* Nav Links */
    .nav__links {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }

    .nav__link {
      font-weight: 500;
      font-size: 0.9375rem;
      color: var(--gray-600);
      padding: 0.5rem 0;
      position: relative;
    }

    .nav__link:hover,
    .nav__link.active {
      color: var(--primary);
    }

    .nav__link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary);
      border-radius: 1px;
    }

    .nav__auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav__user {
      font-weight: 500;
      font-size: 0.9375rem;
      color: var(--gray-700);
      padding-right: 0.75rem;
      border-right: 1px solid var(--gray-200);
    }

    /* Hamburger */
    .hamburger {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 26px;
      height: 26px;
      cursor: pointer;
    }

    .hamburger span {
      width: 100%;
      height: 2px;
      background: var(--gray-600);
      border-radius: 2px;
      transition: all var(--transition-base);
    }

    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    /* ================================
       MOBILE MENU
       ================================ */
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 200;
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 85%;
      max-width: 300px;
      height: 100vh;
      background: var(--white);
      z-index: 201;
      box-shadow: var(--shadow-xl);
      overflow-y: auto;
    }

    .mobile-menu__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .mobile-menu__header .logo__text {
      flex: 1;
      font-size: 1.125rem;
    }

    .mobile-menu__close {
      font-size: 1.5rem;
      color: var(--gray-400);
      line-height: 1;
    }

    .mobile-menu__nav {
      padding: 1rem;
    }

    .mobile-menu__link {
      display: block;
      padding: 0.875rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--gray-700);
      border-radius: var(--radius-md);
    }

    .mobile-menu__link:hover {
      background: var(--gray-50);
      color: var(--primary);
    }

    .mobile-menu__user,
    .mobile-menu__auth {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .mobile-menu__user span {
      display: block;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: 0.75rem;
      padding: 0 1rem;
    }

    .mobile-menu__auth {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    /* ================================
       FOOTER
       ================================ */
    .footer {
      background: var(--gray-800);
      color: var(--white);
      padding: 3.5rem 0 1.5rem;
      margin-top: auto;
    }

    .footer__grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 768px) {
      .footer__grid {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
      }
    }

    .footer__brand .logo {
      margin-bottom: 0.875rem;
      color: var(--white);
    }

    .footer__brand .logo__icon {
      color: var(--primary-light);
    }

    .footer__desc {
      color: var(--gray-400);
      font-size: 0.875rem;
      max-width: 280px;
    }

    @media (max-width: 768px) {
      .footer__desc {
        max-width: 100%;
        margin: 0 auto;
      }
    }

    .footer__links h4 {
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: 0.875rem;
      color: var(--white);
    }

    .footer__links a,
    .footer__links p {
      display: block;
      font-size: 0.875rem;
      color: var(--gray-400);
      margin-bottom: 0.5rem;
    }

    .footer__links a:hover {
      color: var(--primary-light);
    }

    .footer__bottom {
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-700);
      text-align: center;
    }

    .footer__bottom p {
      font-size: 0.8125rem;
      color: var(--gray-500);
      margin: 0;
    }

    @media (max-width: 767px) {
      .hide-mobile { display: none !important; }
    }

    @media (min-width: 768px) {
      .hide-desktop { display: none !important; }
    }
  `]
})
export class App {
  menuOpen = signal(false);
  isScrolled = signal(false);

  constructor(public authService: AuthService) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 10);
      });
    }
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}

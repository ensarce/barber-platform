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
              <div class="logo__icon-wrap">
                <svg class="logo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 5v14M18 5v14M6 12h12"/>
                  <circle cx="6" cy="5" r="2"/>
                  <circle cx="18" cy="5" r="2"/>
                  <circle cx="6" cy="19" r="2"/>
                  <circle cx="18" cy="19" r="2"/>
                </svg>
              </div>
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
              @if (authService.isLoggedIn()) {
                <a routerLink="/appointments" routerLinkActive="active" class="nav__link">
                  Randevularım
                </a>
                @if (authService.isBarber()) {
                  <a routerLink="/barber-panel" routerLinkActive="active" class="nav__link nav__link--barber">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 5v14M18 5v14M6 12h12"/>
                      <circle cx="6" cy="5" r="1.5"/><circle cx="18" cy="5" r="1.5"/>
                    </svg>
                    Kuaför Paneli
                  </a>
                }
                @if (authService.isAdmin()) {
                  <a routerLink="/admin" routerLinkActive="active" class="nav__link nav__link--admin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    Admin
                  </a>
                }
              }
            </div>

            <!-- Desktop Auth + Quick Booking -->
            <div class="nav__auth hide-mobile">
              @if (authService.isLoggedIn()) {
                @if (authService.isCustomer()) {
                  <a routerLink="/barbers" class="btn btn--gold btn--sm quick-book-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Hızlı Randevu
                  </a>
                }
                <div class="nav__user-menu">
                  <span class="nav__user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {{ authService.user()?.name }}
                  </span>
                  <button class="btn btn--ghost btn--sm" (click)="authService.logout()">
                    Çıkış
                  </button>
                </div>
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
              @if (authService.isCustomer()) {
                <a routerLink="/barbers" (click)="closeMenu()" class="mobile-menu__quick-book">
                  📅 Hızlı Randevu Al
                </a>
              }
              <a routerLink="/appointments" (click)="closeMenu()" class="mobile-menu__link">
                📋 Randevularım
              </a>
              @if (authService.isBarber()) {
                <a routerLink="/barber-panel" (click)="closeMenu()" class="mobile-menu__link mobile-menu__link--barber">
                  ✂️ Kuaför Paneli
                </a>
              }
              @if (authService.isAdmin()) {
                <a routerLink="/admin" (click)="closeMenu()" class="mobile-menu__link mobile-menu__link--admin">
                  ⚙️ Admin Paneli
                </a>
              }
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
       HEADER - Premium Design
       ================================ */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      height: var(--header-height);
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-bottom: 1px solid rgba(201, 162, 39, 0.2);
      transition: all var(--transition-base);
    }

    .header.scrolled {
      background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(201, 162, 39, 0.1);
      border-bottom-color: rgba(201, 162, 39, 0.4);
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
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
    }

    .logo__icon-wrap {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #c9a227 0%, #d4b847 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
    }

    .logo__icon {
      width: 24px;
      height: 24px;
      color: #1a1a1a;
    }

    .logo__text {
      font-family: 'Playfair Display', serif;
      letter-spacing: -0.5px;
    }

    .logo__text span {
      color: #c9a227;
    }

    /* Nav Links */
    .nav__links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav__link {
      font-weight: 500;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0;
      position: relative;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav__link:hover {
      color: #ffffff;
    }

    .nav__link.active {
      color: #c9a227;
    }

    .nav__link.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #c9a227, #d4b847);
      border-radius: 1px;
    }

    .nav__link--barber {
      background: linear-gradient(135deg, rgba(139, 0, 0, 0.2), rgba(139, 0, 0, 0.1));
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(139, 0, 0, 0.3);
      color: #ff6b6b;
    }

    .nav__link--barber:hover {
      background: linear-gradient(135deg, rgba(139, 0, 0, 0.3), rgba(139, 0, 0, 0.2));
      color: #ff8a8a;
      border-color: rgba(139, 0, 0, 0.5);
    }

    .nav__link--admin {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .nav__link--admin:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.2));
      color: #93c5fd;
      border-color: rgba(59, 130, 246, 0.5);
    }

    .nav__auth {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav__user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav__user {
      font-weight: 500;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-right: 0.75rem;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav__user svg {
      color: #c9a227;
    }

    /* Quick Booking Button */
    .quick-book-btn {
      animation: pulse-glow 2s infinite;
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(201, 162, 39, 0.5), 0 0 10px rgba(201, 162, 39, 0.3);
      }
      50% {
        box-shadow: 0 0 15px rgba(201, 162, 39, 0.8), 0 0 25px rgba(201, 162, 39, 0.5);
      }
    }

    .btn--gold {
      background: linear-gradient(135deg, #c9a227 0%, #d4b847 100%);
      color: #1a1a1a;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .btn--gold:hover {
      background: linear-gradient(135deg, #d4b847 0%, #e5c85a 100%);
      transform: translateY(-1px);
    }

    /* Update ghost button for dark header */
    .header .btn--ghost {
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .header .btn--ghost:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
      color: #ffffff;
    }

    /* Update primary button for dark header */
    .header .btn--primary {
      background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
      border: none;
    }

    .header .btn--primary:hover {
      background: linear-gradient(135deg, #a52a2a 0%, #b33c3c 100%);
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
      background: rgba(255, 255, 255, 0.9);
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

    /* Mobile Menu Quick Book Button */
    .mobile-menu__quick-book {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      margin: 0.5rem 0;
      background: linear-gradient(135deg, #c9a227 0%, #d4b847 100%);
      color: #1a1a1a;
      font-weight: 600;
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
    }

    .mobile-menu__quick-book:hover {
      background: linear-gradient(135deg, #d4b847 0%, #e5c85a 100%);
      color: #1a1a1a;
    }

    /* Mobile Menu Role-Specific Links */
    .mobile-menu__link--barber {
      background: linear-gradient(135deg, rgba(139, 0, 0, 0.08), rgba(139, 0, 0, 0.04));
      color: #8b0000 !important;
      border-left: 3px solid #8b0000;
      margin: 0.5rem 0;
    }

    .mobile-menu__link--admin {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
      color: #3b82f6 !important;
      border-left: 3px solid #3b82f6;
      margin: 0.5rem 0;
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

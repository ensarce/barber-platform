import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarberService } from '../../core/services/barber.service';
import { BarberListItem } from '../../core/models/barber.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero__grid">
          <div class="hero__content">
            <span class="hero__badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Türkiye'nin 1 Numaralı Kuaför Platformu
            </span>
            <h1 class="hero__title">
              Mükemmel<br><span>Kuaförünü</span> Bul
            </h1>
            <p class="hero__text">
              En iyi kuaförleri keşfet, online randevu al. Profesyonel hizmet, güvenli ve kolay rezervasyon.
            </p>
            <div class="hero__actions">
              <!-- Prominent Quick Booking Button -->
              <a routerLink="/barbers" class="btn btn--quick-book btn--lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M9 16l2 2 4-4"/>
                </svg>
                Hızlı Randevu Al
              </a>
              <a routerLink="/barbers" class="btn btn--primary btn--lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Kuaförleri Keşfet
              </a>
              <a routerLink="/register" class="btn btn--outline btn--lg">
                Kuaför Olarak Katıl
              </a>
            </div>
            <div class="hero__stats">
              <div class="stat">
                <strong>500+</strong>
                <span>Kuaför</span>
              </div>
              <div class="stat">
                <strong>10K+</strong>
                <span>Mutlu Müşteri</span>
              </div>
              <div class="stat">
                <strong>4.9</strong>
                <span>Ortalama Puan</span>
              </div>
            </div>
          </div>
          <div class="hero__visual">
            <div class="hero__cards">
              <div class="floating-card floating-card--1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M6 5v14M18 5v14M6 12h12"/>
                  <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                  <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
                </svg>
                <span>Saç Kesimi</span>
              </div>
              <div class="floating-card floating-card--2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Hızlı Randevu</span>
              </div>
              <div class="floating-card floating-card--3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>★ 4.9 Puan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section how-it-works">
      <div class="container">
        <div class="section__header">
          <span class="section__label">Nasıl Çalışır?</span>
          <h2 class="section__title">3 Adımda Randevu Al</h2>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step__number">1</div>
            <div class="step__content">
              <h3>Kuaför Bul</h3>
              <p>Konumunuza en yakın kuaförleri arayın ve inceleyin</p>
            </div>
          </div>
          <div class="step__connector"></div>
          <div class="step">
            <div class="step__number">2</div>
            <div class="step__content">
              <h3>Tarih Seç</h3>
              <p>Size uygun gün ve saati kolayca seçin</p>
            </div>
          </div>
          <div class="step__connector"></div>
          <div class="step">
            <div class="step__number">3</div>
            <div class="step__content">
              <h3>Randevu Al</h3>
              <p>Randevunuzu onaylayın ve hazır olun!</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features">
      <div class="container">
        <div class="section__header">
          <span class="section__label">Özellikler</span>
          <h2 class="section__title">Neden KuaförBul?</h2>
        </div>

        <div class="features__grid">
          <div class="feature-card">
            <div class="feature-card__icon feature-card__icon--purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3>Kolay Arama</h3>
            <p>Konumunuza en yakın kuaförleri anında bulun</p>
          </div>

          <div class="feature-card">
            <div class="feature-card__icon feature-card__icon--pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Hızlı Randevu</h3>
            <p>Birkaç tıkla randevunuzu oluşturun</p>
          </div>

          <div class="feature-card">
            <div class="feature-card__icon feature-card__icon--green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3>Gerçek Yorumlar</h3>
            <p>Müşteri değerlendirmelerini okuyun</p>
          </div>

          <div class="feature-card">
            <div class="feature-card__icon feature-card__icon--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>Güvenli Ödeme</h3>
            <p>%100 güvenli ödeme sistemi</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Barbers -->
    <section class="section barbers-section">
      <div class="container">
        <div class="section__header">
          <span class="section__label">Öne Çıkanlar</span>
          <h2 class="section__title">Popüler Kuaförler</h2>
          <p class="section__subtitle">En çok tercih edilen profesyoneller</p>
        </div>

        @if (isLoading()) {
          <div class="loading">
            <div class="spinner"></div>
            <span class="loading__text">Kuaförler yükleniyor...</span>
          </div>
        }

        @if (!isLoading() && barbers().length > 0) {
          <div class="barbers-grid">
            @for (barber of barbers().slice(0, 6); track barber.id) {
              <a [routerLink]="['/barbers', barber.id]" class="barber-card">
                <div class="barber-card__image">
                  <div class="barber-card__placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M6 5v14M18 5v14M6 12h12"/>
                      <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                      <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
                    </svg>
                  </div>
                  <div class="barber-card__badge">★ {{ barber.averageRating.toFixed(1) }}</div>
                </div>
                <div class="barber-card__body">
                  <h3 class="barber-card__name">{{ barber.shopName }}</h3>
                  <p class="barber-card__location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ barber.district }}, {{ barber.city }}
                  </p>
                  <div class="barber-card__footer">
                    <span class="barber-card__reviews">{{ barber.totalReviews }} değerlendirme</span>
                    @if (barber.startingPrice) {
                      <span class="barber-card__price">{{ barber.startingPrice }}₺'den</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>

          <div class="section__footer">
            <a routerLink="/barbers" class="btn btn--primary btn--lg">
              Tüm Kuaförleri Gör
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        }
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta__grid">
          <div class="cta__content">
            <h2>Kuaför müsünüz?</h2>
            <p>Platformumuza katılın, yeni müşteriler kazanın ve işinizi büyütün. İlk 30 gün ücretsiz!</p>
            <div class="cta__actions">
              <a routerLink="/register" class="btn btn--white btn--lg">
                Hemen Başla
              </a>
              <span class="cta__note">Kredi kartı gerekmez</span>
            </div>
          </div>
          <div class="cta__features">
            <div class="cta__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Online randevu yönetimi
            </div>
            <div class="cta__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Müşteri yorumları
            </div>
            <div class="cta__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Detaylı istatistikler
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ================================
       HERO
       ================================ */
    .hero {
      background: linear-gradient(160deg, #f8f7ff 0%, #fdf2f8 50%, #f0fdf4 100%);
      padding: 4rem 0 5rem;
      overflow: hidden;
    }

    .hero__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
    }

    @media (min-width: 1024px) {
      .hero {
        padding: 5rem 0 6rem;
      }
      .hero__grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .hero__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border-radius: 50px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-700);
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      margin-bottom: 1.5rem;
    }

    .hero__badge svg {
      color: #fbbf24;
    }

    .hero__title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.1;
      margin-bottom: 1.25rem;
    }

    .hero__title span {
      color: var(--primary);
    }

    .hero__text {
      font-size: 1.0625rem;
      color: var(--gray-600);
      line-height: 1.7;
      margin-bottom: 2rem;
      max-width: 440px;
    }

    .hero__actions {
      display: flex;
      gap: 0.875rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }

    .hero__stats {
      display: flex;
      gap: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat strong {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-800);
    }

    .stat span {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    @media (min-width: 768px) {
      .hero__title {
        font-size: 3.5rem;
      }
    }

    /* Hero Visual */
    .hero__visual {
      display: none;
      position: relative;
      height: 320px;
    }

    @media (min-width: 1024px) {
      .hero__visual {
        display: block;
      }
    }

    .hero__cards {
      position: relative;
      height: 100%;
    }

    .floating-card {
      position: absolute;
      background: white;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-700);
    }

    .floating-card svg {
      color: var(--primary);
    }

    .floating-card--1 {
      top: 10%;
      left: 5%;
      animation: float 3s ease-in-out infinite;
    }

    .floating-card--2 {
      top: 50%;
      right: 5%;
      animation: float 3s ease-in-out infinite 0.5s;
    }

    .floating-card--3 {
      bottom: 10%;
      left: 20%;
      animation: float 3s ease-in-out infinite 1s;
    }

    .floating-card--3 svg {
      color: #fbbf24;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* ================================
       HOW IT WORKS
       ================================ */
    .how-it-works {
      background: white;
      padding: 4rem 0;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    @media (min-width: 768px) {
      .steps {
        flex-direction: row;
        align-items: flex-start;
        gap: 0;
      }
    }

    .step {
      flex: 1;
      text-align: center;
      padding: 1.5rem;
    }

    .step__number {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 auto 1rem;
    }

    .step h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.375rem;
    }

    .step p {
      font-size: 0.875rem;
      color: var(--gray-500);
      line-height: 1.5;
    }

    .step__connector {
      display: none;
    }

    @media (min-width: 768px) {
      .step__connector {
        display: block;
        width: 60px;
        height: 2px;
        background: var(--gray-200);
        margin-top: 24px;
        flex-shrink: 0;
      }
    }

    /* ================================
       FEATURES
       ================================ */
    .features {
      background: var(--gray-50);
      padding: 4rem 0;
    }

    .features__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .features__grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
    }

    .feature-card {
      text-align: center;
      padding: 1.5rem 1rem;
      background: white;
      border-radius: 16px;
      border: 1px solid var(--gray-100);
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .feature-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .feature-card__icon--purple { background: #ede9fe; color: #7c3aed; }
    .feature-card__icon--pink { background: #fce7f3; color: #db2777; }
    .feature-card__icon--green { background: #dcfce7; color: #16a34a; }
    .feature-card__icon--blue { background: #dbeafe; color: #2563eb; }

    .feature-card h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.375rem;
    }

    .feature-card p {
      font-size: 0.8125rem;
      color: var(--gray-500);
      line-height: 1.5;
    }

    /* ================================
       SECTION COMMON
       ================================ */
    .section__label {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .section__subtitle {
      color: var(--gray-500);
      font-size: 1rem;
      margin-top: 0.375rem;
    }

    /* ================================
       BARBERS SECTION
       ================================ */
    .barbers-section {
      background: white;
      padding: 4rem 0;
    }

    .barbers-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    @media (min-width: 640px) {
      .barbers-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .barbers-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .barber-card {
      background: var(--gray-50);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--gray-200);
      transition: all 0.25s ease;
      display: block;
    }

    .barber-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      border-color: var(--gray-300);
    }

    .barber-card__image {
      height: 110px;
      position: relative;
      background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%);
    }

    .barber-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .barber-card__badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: white;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--gray-800);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .barber-card__body {
      padding: 1rem 1.25rem 1.25rem;
    }

    .barber-card__name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.25rem;
    }

    .barber-card__location {
      font-size: 0.75rem;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .barber-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--gray-200);
    }

    .barber-card__reviews {
      font-size: 0.6875rem;
      color: var(--gray-500);
    }

    .barber-card__price {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--primary);
    }

    .section__footer {
      text-align: center;
    }

    /* ================================
       CTA
       ================================ */
    .cta {
      background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
      padding: 4rem 0;
    }

    .cta__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      align-items: center;
    }

    @media (min-width: 768px) {
      .cta__grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .cta__content h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.75rem;
    }

    .cta__content p {
      font-size: 1rem;
      color: rgba(255,255,255,0.85);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .cta__actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cta__note {
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.7);
    }

    .cta__features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cta__feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9375rem;
      color: white;
      font-weight: 500;
    }

    .cta__feature svg {
      color: #86efac;
    }

    @media (min-width: 768px) {
      .cta__content h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  barbers = signal<BarberListItem[]>([]);
  isLoading = signal(true);

  constructor(private barberService: BarberService) { }

  ngOnInit(): void {
    this.loadFeaturedBarbers();
  }

  loadFeaturedBarbers(): void {
    this.barberService.getBarbers(undefined, undefined, 0, 6).subscribe({
      next: (response) => {
        this.barbers.set(response.content);
        this.isLoading.set(false);
      },
      error: () => {
        this.barbers.set([]);
        this.isLoading.set(false);
      }
    });
  }
}

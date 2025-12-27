import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../../core/services/barber.service';
import { BarberListItem } from '../../../core/models/barber.model';

@Component({
  selector: 'app-barber-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Page Header -->
    <section class="page-header">
      <div class="container">
        <h1>Kuaförleri Keşfet</h1>
        <p>{{ filteredBarbers().length }} profesyonel kuaför bulundu</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="page-content">
      <div class="container">
        <div class="page-layout">
          <!-- Filters Sidebar -->
          <aside class="filters">
            <div class="filters__card">
              <div class="filters__header">
                <h3>Filtreler</h3>
                <button class="btn btn--link" (click)="clearFilters()">Temizle</button>
              </div>

              <!-- Search -->
              <div class="form-group">
                <label class="form-label">Kuaför Ara</label>
                <div class="search-input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="İsim veya konum..."
                    [(ngModel)]="searchQuery"
                    (input)="onSearchChange()">
                </div>
              </div>

              <!-- City -->
              <div class="form-group">
                <label class="form-label">Şehir</label>
                <select class="form-select" [(ngModel)]="selectedCity" (change)="onCityChange()">
                  <option value="">Tüm Şehirler</option>
                  @for (city of cities; track city) {
                    <option [value]="city">{{ city }}</option>
                  }
                </select>
              </div>

              <!-- District -->
              <div class="form-group">
                <label class="form-label">İlçe</label>
                <select class="form-select" [(ngModel)]="selectedDistrict" (change)="loadBarbers()">
                  <option value="">Tüm İlçeler</option>
                  @for (district of districts; track district) {
                    <option [value]="district">{{ district }}</option>
                  }
                </select>
              </div>

              <button class="btn btn--primary btn--full" (click)="loadBarbers()">
                Filtrele
              </button>
            </div>
          </aside>

          <!-- Barber List -->
          <div class="barbers">
            @if (isLoading()) {
              <div class="loading">
                <div class="spinner"></div>
                <span class="loading__text">Kuaförler yükleniyor...</span>
              </div>
            }

            @if (error()) {
              <div class="empty-state">
                <div class="empty-state__icon">❌</div>
                <h3 class="empty-state__title">Bir hata oluştu</h3>
                <p class="empty-state__text">{{ error() }}</p>
                <button class="btn btn--primary" (click)="loadBarbers()">Tekrar Dene</button>
              </div>
            }

            @if (!isLoading() && !error() && filteredBarbers().length === 0) {
              <div class="empty-state">
                <svg class="empty-state__svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <h3 class="empty-state__title">Kuaför bulunamadı</h3>
                <p class="empty-state__text">Arama kriterlerinize uygun kuaför bulunamadı.</p>
                <button class="btn btn--primary" (click)="clearFilters()">Filtreleri Temizle</button>
              </div>
            }

            @if (!isLoading() && !error() && filteredBarbers().length > 0) {
              <div class="barbers-grid">
                @for (barber of filteredBarbers(); track barber.id) {
                  <a [routerLink]="['/barbers', barber.id]" class="barber-card">
                    <div class="barber-card__image">
                      <div class="barber-card__placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
                      <div class="barber-card__info">
                        <span class="barber-card__reviews">{{ barber.totalReviews }} değerlendirme</span>
                        @if (barber.startingPrice) {
                          <span class="barber-card__price">{{ barber.startingPrice }}₺'den</span>
                        }
                      </div>
                      <button class="btn btn--primary btn--full btn--sm">
                        Randevu Al
                      </button>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Page Header */
    .page-header {
      background: linear-gradient(160deg, #f8f7ff 0%, #fdf2f8 100%);
      padding: 2.25rem 0;
      text-align: center;
    }

    .page-header h1 {
      font-size: 1.625rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.25rem;
    }

    .page-header p {
      font-size: 0.9375rem;
      color: var(--gray-500);
      margin: 0;
    }

    @media (min-width: 768px) {
      .page-header {
        padding: 2.75rem 0;
      }
      .page-header h1 {
        font-size: 1.875rem;
      }
    }

    /* Page Content */
    .page-content {
      padding: 2rem 0 4rem;
      background: var(--gray-50);
    }

    .page-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 1024px) {
      .page-layout {
        grid-template-columns: 260px 1fr;
      }
    }

    /* Filters */
    .filters__card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid var(--gray-200);
      position: sticky;
      top: calc(var(--header-height) + 1.5rem);
    }

    .filters__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .filters__header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-800);
      margin: 0;
    }

    /* Search Input */
    .search-input {
      position: relative;
    }

    .search-input svg {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
    }

    .search-input .form-input {
      padding-left: 2.5rem;
    }

    /* Barbers Grid */
    .barbers-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 640px) {
      .barbers-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1280px) {
      .barbers-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Barber Card */
    .barber-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
      height: 100px;
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
      border-radius: 16px;
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .barber-card__location {
      font-size: 0.75rem;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .barber-card__info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-top: 1px solid var(--gray-100);
      border-bottom: 1px solid var(--gray-100);
      margin-bottom: 0.875rem;
    }

    .barber-card__reviews {
      font-size: 0.6875rem;
      color: var(--gray-500);
    }

    .barber-card__price {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
    }

    /* Empty State */
    .empty-state__svg {
      color: var(--gray-300);
      margin-bottom: 1rem;
    }

    /* Mobile */
    @media (max-width: 1023px) {
      .filters {
        order: 1;
      }
      .filters__card {
        position: static;
      }
    }
  `]
})
export class BarberListComponent implements OnInit {
  barbers = signal<BarberListItem[]>([]);
  filteredBarbers = signal<BarberListItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchQuery = '';
  selectedCity = '';
  selectedDistrict = '';
  districts: string[] = [];

  readonly cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Adana', 'Konya', 'Gaziantep', 'Kocaeli', 'Mersin'
  ];

  readonly cityDistricts: Record<string, string[]> = {
    'İstanbul': ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bakırköy', 'Fatih', 'Beyoğlu', 'Ataşehir'],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı'],
    'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım'],
    'Antalya': ['Muratpaşa', 'Konyaaltı', 'Kepez']
  };

  constructor(private barberService: BarberService) { }

  ngOnInit(): void {
    this.loadBarbers();
  }

  loadBarbers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.barberService.getBarbers(
      this.selectedCity || undefined,
      this.selectedDistrict || undefined
    ).subscribe({
      next: (response) => {
        this.barbers.set(response.content);
        this.applySearchFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Kuaförler yüklenirken bir hata oluştu.');
        this.isLoading.set(false);
      }
    });
  }

  onCityChange(): void {
    this.districts = this.cityDistricts[this.selectedCity] || [];
    this.selectedDistrict = '';
    this.loadBarbers();
  }

  onSearchChange(): void {
    this.applySearchFilter();
  }

  applySearchFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredBarbers.set(this.barbers());
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    const filtered = this.barbers().filter(barber =>
      barber.shopName.toLowerCase().includes(query) ||
      barber.city.toLowerCase().includes(query) ||
      barber.district.toLowerCase().includes(query)
    );
    this.filteredBarbers.set(filtered);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCity = '';
    this.selectedDistrict = '';
    this.districts = [];
    this.loadBarbers();
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../../core/services/barber.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BarberDetail, Service } from '../../../core/models/barber.model';
import { Review, TimeSlot } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (isLoading()) {
      <div class="loading-page">
        <div class="spinner"></div>
        <span class="loading__text">Kuaför bilgileri yükleniyor...</span>
      </div>
    }

    @if (error()) {
      <div class="error-page">
        <div class="empty-state">
          <svg class="empty-state__svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
          <h3 class="empty-state__title">Kuaför bulunamadı</h3>
          <p class="empty-state__text">{{ error() }}</p>
          <a routerLink="/barbers" class="btn btn--primary">Kuaförlere Dön</a>
        </div>
      </div>
    }

    @if (barber()) {
      <!-- Hero -->
      <section class="barber-hero">
        <div class="container">
          <div class="barber-hero__content">
            <div class="barber-hero__image">
              <div class="barber-hero__placeholder">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M6 5v14M18 5v14M6 12h12"/>
                  <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                  <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
                </svg>
              </div>
            </div>
            <div class="barber-hero__info">
              <h1>{{ barber()!.shopName }}</h1>
              <p class="barber-hero__owner">{{ barber()!.ownerName }}</p>
              <p class="barber-hero__location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ barber()!.address }}, {{ barber()!.district }}, {{ barber()!.city }}
              </p>
              
              <div class="barber-hero__rating">
                @for (star of [1,2,3,4,5]; track star) {
                  <span class="star" [class.filled]="star <= barber()!.averageRating">★</span>
                }
                <span class="rating-value">{{ barber()!.averageRating.toFixed(1) }}</span>
                <span class="rating-count">({{ barber()!.totalReviews }} değerlendirme)</span>
              </div>

              @if (barber()!.description) {
                <p class="barber-hero__desc">{{ barber()!.description }}</p>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="section">
        <div class="container">
          <div class="detail-layout">
            <!-- Left Column -->
            <div class="detail-main">
              <!-- Services -->
              <div class="detail-card">
                <h2 class="detail-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 5v14M18 5v14M6 12h12"/>
                    <circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/>
                    <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
                  </svg>
                  Hizmetler
                </h2>
                <div class="services-list">
                  @for (service of barber()!.services; track service.id) {
                    <div 
                      class="service-item" 
                      [class.selected]="selectedService()?.id === service.id"
                      (click)="selectService(service)">
                      <div class="service-item__info">
                        <h4>{{ service.name }}</h4>
                        <span>{{ service.durationMinutes }} dk</span>
                      </div>
                      <div class="service-item__price">{{ service.price }}₺</div>
                    </div>
                  }
                </div>
              </div>

              <!-- Working Hours -->
              <div class="detail-card">
                <h2 class="detail-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Çalışma Saatleri
                </h2>
                <div class="hours-list">
                  @for (wh of barber()!.workingHours; track wh.id) {
                    <div class="hours-item" [class.closed]="wh.isClosed">
                      <span class="hours-item__day">{{ wh.dayName }}</span>
                      <span class="hours-item__time">
                        @if (wh.isClosed) {
                          Kapalı
                        } @else {
                          {{ wh.startTime }} - {{ wh.endTime }}
                        }
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Reviews -->
              <div class="detail-card">
                <h2 class="detail-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Değerlendirmeler
                </h2>
                @if (reviews().length > 0) {
                  <div class="reviews-list">
                    @for (review of reviews(); track review.id) {
                      <div class="review-item">
                        <div class="review-item__header">
                          <span class="review-item__name">{{ review.customerName }}</span>
                          <div class="review-item__rating">
                            @for (star of [1,2,3,4,5]; track star) {
                              <span [class.filled]="star <= review.rating">★</span>
                            }
                          </div>
                        </div>
                        @if (review.comment) {
                          <p class="review-item__comment">{{ review.comment }}</p>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-muted">Henüz değerlendirme yok.</p>
                }
              </div>
            </div>

            <!-- Booking Sidebar -->
            <aside class="detail-sidebar">
              <div class="booking-card">
                <h3 class="booking-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Randevu Al
                </h3>

                @if (!authService.isLoggedIn()) {
                  <p class="booking-card__text">Randevu almak için giriş yapmalısınız.</p>
                  <a routerLink="/login" class="btn btn--primary btn--full">Giriş Yap</a>
                } @else if (!selectedService()) {
                  <p class="booking-card__text">Lütfen bir hizmet seçin.</p>
                } @else {
                  <div class="booking-card__selected">
                    <strong>{{ selectedService()!.name }}</strong>
                    <span>{{ selectedService()!.price }}₺</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Tarih Seçin</label>
                    <input 
                      type="date" 
                      class="form-input"
                      [(ngModel)]="selectedDate"
                      [min]="today"
                      (change)="loadSlots()">
                  </div>

                  @if (loadingSlots()) {
                    <p class="text-muted text-center">Saatler yükleniyor...</p>
                  }

                  @if (!loadingSlots() && slotsLoaded() && slots().length === 0) {
                    <div class="alert alert--warning">Bu tarihte müsait saat yok.</div>
                  }

                  @if (!loadingSlots() && slots().length > 0) {
                    <div class="time-slots">
                      @for (slot of slots(); track slot.startTime) {
                        @if (slot.available) {
                          <button 
                            class="time-slot"
                            [class.selected]="selectedSlot()?.startTime === slot.startTime"
                            (click)="selectSlot(slot)">
                            {{ slot.startTime.substring(0, 5) }}
                          </button>
                        }
                      }
                    </div>
                  }

                  @if (selectedSlot()) {
                    <button 
                      class="btn btn--primary btn--full btn--lg mt-4"
                      (click)="bookAppointment()"
                      [disabled]="isBooking()">
                      @if (isBooking()) {
                        Oluşturuluyor...
                      } @else {
                        Randevuyu Onayla
                      }
                    </button>
                  }

                  @if (bookingSuccess()) {
                    <div class="alert alert--success mt-3">
                      ✅ Randevunuz başarıyla oluşturuldu!
                    </div>
                  }
                }
              </div>
            </aside>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .loading-page,
    .error-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state__svg {
      color: var(--gray-300);
      margin-bottom: 1rem;
    }

    /* Hero Section */
    .barber-hero {
      background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
      padding: 2.5rem 0;
    }

    .barber-hero__content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .barber-hero {
        padding: 3rem 0;
      }
      .barber-hero__content {
        grid-template-columns: 180px 1fr;
        gap: 2rem;
        align-items: start;
      }
    }

    .barber-hero__image {
      width: 160px;
      height: 160px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%);
      box-shadow: var(--shadow-md);
    }

    .barber-hero__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .barber-hero__info h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.25rem;
    }

    .barber-hero__owner {
      font-size: 0.9375rem;
      color: var(--gray-600);
      margin-bottom: 0.5rem;
    }

    .barber-hero__location {
      font-size: 0.875rem;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 0.875rem;
    }

    .barber-hero__rating {
      display: flex;
      align-items: center;
      gap: 0.125rem;
      margin-bottom: 0.875rem;
    }

    .barber-hero__rating .star {
      color: var(--gray-300);
      font-size: 1rem;
    }

    .barber-hero__rating .star.filled {
      color: var(--gold);
    }

    .barber-hero__rating .rating-value {
      font-weight: 600;
      color: var(--gray-800);
      margin-left: 0.5rem;
      font-size: 0.9375rem;
    }

    .barber-hero__rating .rating-count {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .barber-hero__desc {
      font-size: 0.9375rem;
      color: var(--gray-600);
      line-height: 1.6;
      max-width: 480px;
    }

    @media (min-width: 768px) {
      .barber-hero__info h1 {
        font-size: 1.75rem;
      }
    }

    /* Detail Layout */
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 1024px) {
      .detail-layout {
        grid-template-columns: 1fr 340px;
      }
    }

    /* Detail Cards */
    .detail-card {
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      margin-bottom: 1.5rem;
    }

    .detail-card__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-card__title svg {
      color: var(--primary);
    }

    /* Services */
    .services-list {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .service-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: var(--gray-50);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .service-item:hover {
      border-color: var(--primary-light);
    }

    .service-item.selected {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
    }

    .service-item__info h4 {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--gray-800);
      margin-bottom: 0.125rem;
    }

    .service-item__info span {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .service-item__price {
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary);
    }

    /* Working Hours */
    .hours-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      padding: 0.625rem 0.875rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .hours-item.closed {
      opacity: 0.5;
    }

    .hours-item__day {
      font-weight: 500;
      color: var(--gray-700);
    }

    .hours-item__time {
      color: var(--gray-600);
    }

    .hours-item.closed .hours-item__time {
      color: var(--error);
    }

    /* Reviews */
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .review-item {
      padding: 0.875rem;
      background: var(--gray-50);
      border-radius: var(--radius-lg);
    }

    .review-item__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .review-item__name {
      font-weight: 500;
      color: var(--gray-800);
      font-size: 0.875rem;
    }

    .review-item__rating {
      color: var(--gray-300);
      font-size: 0.75rem;
    }

    .review-item__rating .filled {
      color: var(--gold);
    }

    .review-item__comment {
      font-size: 0.875rem;
      color: var(--gray-600);
      line-height: 1.5;
      margin: 0;
    }

    /* Booking Card */
    .booking-card {
      position: sticky;
      top: calc(var(--header-height) + 1.5rem);
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--gray-100);
    }

    .booking-card__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .booking-card__title svg {
      color: var(--primary);
    }

    .booking-card__text {
      text-align: center;
      color: var(--gray-500);
      font-size: 0.9375rem;
      margin-bottom: 1rem;
    }

    .booking-card__selected {
      display: flex;
      justify-content: space-between;
      padding: 0.875rem;
      background: rgba(99, 102, 241, 0.08);
      border-radius: var(--radius-lg);
      margin-bottom: 1rem;
    }

    .booking-card__selected strong {
      color: var(--gray-800);
      font-size: 0.9375rem;
    }

    .booking-card__selected span {
      font-weight: 600;
      color: var(--primary);
    }

    /* Time Slots */
    .time-slots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .time-slot {
      padding: 0.625rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.8125rem;
      color: var(--gray-700);
      background: var(--white);
      transition: all var(--transition-fast);
    }

    .time-slot:hover {
      border-color: var(--primary-light);
    }

    .time-slot.selected {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--white);
    }

    /* Mobile */
    @media (max-width: 1023px) {
      .detail-sidebar {
        order: -1;
      }
      .booking-card {
        position: static;
      }
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
      margin-top: 1rem;
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

    .alert--warning {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      color: #b45309;
      border: 1px solid #fcd34d;
    }

    .alert--warning::before {
      content: '⚠';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #fef3c7;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 700;
    }
  `]
})
export class BarberDetailComponent implements OnInit {
  barber = signal<BarberDetail | null>(null);
  reviews = signal<Review[]>([]);
  slots = signal<TimeSlot[]>([]);
  selectedService = signal<Service | null>(null);
  selectedSlot = signal<TimeSlot | null>(null);

  isLoading = signal(true);
  error = signal<string | null>(null);
  isBooking = signal(false);
  bookingSuccess = signal(false);
  loadingSlots = signal(false);
  slotsLoaded = signal(false);

  selectedDate = '';
  today = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private barberService: BarberService,
    private appointmentService: AppointmentService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadBarber(id);
    this.loadReviews(id);
  }

  loadBarber(id: number): void {
    this.barberService.getBarberById(id).subscribe({
      next: (barber) => {
        this.barber.set(barber);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Kuaför bilgileri yüklenemedi.');
        this.isLoading.set(false);
      }
    });
  }

  loadReviews(barberId: number): void {
    this.barberService.getBarberReviews(barberId).subscribe({
      next: (response) => this.reviews.set(response.content)
    });
  }

  selectService(service: Service): void {
    this.selectedService.set(service);
    this.selectedSlot.set(null);
    if (this.selectedDate) {
      this.loadSlots();
    }
  }

  loadSlots(): void {
    if (!this.barber() || !this.selectedDate || !this.selectedService()) return;

    this.loadingSlots.set(true);
    this.slotsLoaded.set(false);

    this.barberService.getAvailableSlots(
      this.barber()!.id,
      this.selectedDate,
      this.selectedService()!.durationMinutes
    ).subscribe({
      next: (response) => {
        this.slots.set(response.slots);
        this.loadingSlots.set(false);
        this.slotsLoaded.set(true);
      },
      error: () => {
        this.slots.set([]);
        this.loadingSlots.set(false);
        this.slotsLoaded.set(true);
      }
    });
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot.set(slot);
  }

  bookAppointment(): void {
    if (!this.barber() || !this.selectedService() || !this.selectedSlot()) return;

    this.isBooking.set(true);

    this.appointmentService.createAppointment({
      barberProfileId: this.barber()!.id,
      serviceId: this.selectedService()!.id,
      appointmentDate: this.selectedDate,
      startTime: this.selectedSlot()!.startTime
    }).subscribe({
      next: () => {
        this.isBooking.set(false);
        this.bookingSuccess.set(true);
        this.selectedSlot.set(null);
        this.loadSlots();

        this.notificationService.notifyAppointmentCreated(
          this.barber()!.shopName,
          this.selectedDate,
          this.selectedSlot()?.startTime.substring(0, 5) || ''
        );
      },
      error: (err) => {
        this.isBooking.set(false);
        this.notificationService.showError(
          err.error?.message || 'Randevu oluşturulamadı. Lütfen tekrar deneyin.'
        );
      }
    });
  }
}

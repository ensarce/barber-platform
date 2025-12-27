import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Randevularım</h1>
        <a routerLink="/kuaforler" class="btn btn--primary">+ Yeni Randevu</a>
      </div>
      
      @if (isLoading()) {
        <div class="loading-container">
          <div class="spinner"></div>
        </div>
      }
      
      @if (!isLoading() && appointments().length === 0) {
        <div class="empty-state">
          <span class="empty-state__icon">📅</span>
          <h3>Henüz randevunuz yok</h3>
          <p>Kuaförleri keşfedin ve ilk randevunuzu oluşturun!</p>
          <a routerLink="/kuaforler" class="btn btn--primary">Kuaför Ara</a>
        </div>
      }
      
      @if (!isLoading() && appointments().length > 0) {
        <div class="appointments-list">
          @for (apt of appointments(); track apt.id) {
            <div class="appointment-card" [class]="'status-' + apt.status.toLowerCase()">
              <div class="appointment-card__header">
                <span class="badge" [class]="getStatusClass(apt.status)">
                  {{ getStatusText(apt.status) }}
                </span>
                <span class="appointment-card__date">
                  {{ formatDate(apt.appointmentDate) }}
                </span>
              </div>
              
              <div class="appointment-card__body">
                <h3>{{ apt.barberShopName }}</h3>
                <p class="appointment-card__service">{{ apt.serviceName }}</p>
                <p class="appointment-card__time">
                  🕐 {{ apt.startTime.substring(0, 5) }} - {{ apt.endTime.substring(0, 5) }}
                </p>
                <p class="appointment-card__price">{{ apt.totalPrice }} ₺</p>
              </div>
              
              <div class="appointment-card__actions">
                @if (apt.status === 'PENDING' || apt.status === 'CONFIRMED') {
                  <button 
                    class="btn btn--ghost btn--sm" 
                    (click)="cancelAppointment(apt.id)">
                    İptal Et
                  </button>
                }
                
                @if (apt.canReview) {
                  <button 
                    class="btn btn--primary btn--sm"
                    (click)="openReviewModal(apt)">
                    ⭐ Değerlendir
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
      
      <!-- Review Modal -->
      @if (showReviewModal()) {
        <div class="modal-overlay" (click)="closeReviewModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal__header">
              <h3>Değerlendirme Yap</h3>
              <button class="modal__close" (click)="closeReviewModal()">×</button>
            </div>
            
            <div class="modal__body">
              <p class="modal__info">
                <strong>{{ selectedAppointment()?.barberShopName }}</strong> - {{ selectedAppointment()?.serviceName }}
              </p>
              
              <div class="rating-input">
                <label>Puanınız</label>
                <div class="stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button 
                      type="button"
                      class="star-btn" 
                      [class.filled]="star <= reviewRating()"
                      (click)="setRating(star)">
                      {{ star <= reviewRating() ? '★' : '☆' }}
                    </button>
                  }
                </div>
              </div>
              
              <div class="form-group">
                <label>Yorumunuz (Opsiyonel)</label>
                <textarea 
                  [(ngModel)]="reviewComment"
                  rows="4"
                  placeholder="Deneyiminizi paylaşın..."></textarea>
              </div>
              
              @if (reviewError()) {
                <div class="alert alert--error">{{ reviewError() }}</div>
              }
            </div>
            
            <div class="modal__footer">
              <button class="btn btn--ghost" (click)="closeReviewModal()">İptal</button>
              <button 
                class="btn btn--primary" 
                (click)="submitReview()"
                [disabled]="reviewRating() === 0 || submittingReview()">
                {{ submittingReview() ? 'Gönderiliyor...' : 'Gönder' }}
              </button>
            </div>
          </div>
        </div>
      }
      
      @if (successMessage()) {
        <div class="toast toast--success">{{ successMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2rem 0;
      
      h1 { margin: 0; }
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      
      &__icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
      h3 { margin-bottom: 0.5rem; }
      p { color: var(--text-secondary); margin-bottom: 1.5rem; }
    }
    
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    
    .appointment-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border-left: 4px solid var(--text-muted);
      overflow: hidden;
      
      &.status-pending { border-left-color: var(--warning); }
      &.status-confirmed { border-left-color: var(--success); }
      &.status-completed { border-left-color: var(--info); }
      &.status-cancelled { border-left-color: var(--error); opacity: 0.7; }
      
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: var(--background);
        border-bottom: 1px solid var(--border);
      }
      
      &__date {
        font-weight: 600;
        color: var(--text-primary);
      }
      
      &__body {
        padding: 1.5rem;
        
        h3 { margin-bottom: 0.5rem; font-size: 1.25rem; }
      }
      
      &__service {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }
      
      &__time {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }
      
      &__price {
        font-weight: 700;
        color: var(--accent);
        font-size: 1.1rem;
        margin: 0;
      }
      
      &__actions {
        display: flex;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border);
        justify-content: flex-end;
      }
    }
    
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .badge--warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .badge--success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .badge--info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .badge--error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal {
      background: var(--surface);
      border-radius: var(--radius-xl);
      width: 90%;
      max-width: 500px;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      
      h3 { margin: 0; }
    }
    
    .modal__close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      
      &:hover { color: var(--text-primary); }
    }
    
    .modal__body {
      padding: 1.5rem;
    }
    
    .modal__info {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--background);
      border-radius: var(--radius-md);
    }
    
    .modal__footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid var(--border);
    }
    
    .rating-input {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
    }
    
    .stars {
      display: flex;
      gap: 0.25rem;
    }
    
    .star-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: transform 0.1s, color 0.1s;
      
      &:hover { transform: scale(1.1); }
      &.filled { color: #fbbf24; }
    }
    
    .form-group {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
      
      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        resize: vertical;
        font-family: inherit;
        
        &:focus {
          outline: none;
          border-color: var(--accent);
        }
      }
    }
    
    .alert--error {
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-radius: var(--radius-md);
      margin-top: 1rem;
    }
    
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s ease;
      z-index: 1001;
      
      &--success {
        background: #10b981;
        color: white;
      }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class MyAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);

  // Review modal
  showReviewModal = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  reviewRating = signal(0);
  reviewComment = '';
  submittingReview = signal(false);
  reviewError = signal('');
  successMessage = signal('');

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        this.appointments.set(response.content);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => this.loadAppointments()
      });
    }
  }

  openReviewModal(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.reviewRating.set(0);
    this.reviewComment = '';
    this.reviewError.set('');
    this.showReviewModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.selectedAppointment.set(null);
  }

  setRating(rating: number): void {
    this.reviewRating.set(rating);
  }

  submitReview(): void {
    if (this.reviewRating() === 0) {
      this.reviewError.set('Lütfen bir puan seçin');
      return;
    }

    this.submittingReview.set(true);
    this.reviewError.set('');

    this.appointmentService.createReview({
      appointmentId: this.selectedAppointment()!.id,
      rating: this.reviewRating(),
      comment: this.reviewComment || undefined
    }).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.closeReviewModal();
        this.showSuccessMessage('Değerlendirmeniz başarıyla gönderildi! ⭐');
        this.loadAppointments();
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.reviewError.set(err.error?.message || 'Değerlendirme gönderilemedi');
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'badge--warning',
      CONFIRMED: 'badge--success',
      COMPLETED: 'badge--info',
      CANCELLED: 'badge--error'
    };
    return classes[status] || 'badge--pending';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      PENDING: 'Onay Bekliyor',
      CONFIRMED: 'Onaylandı',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi'
    };
    return texts[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

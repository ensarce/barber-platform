import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { BarberListItem } from '../../core/models/barber.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="panel-header">
        <h1>Admin Paneli</h1>
        <p>Platform yönetimi ve moderasyon</p>
      </div>
      
      <div class="admin-grid">
        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-card__value">{{ pendingBarbers().length }}</span>
            <span class="stat-card__label">Onay Bekleyen Kuaför</span>
          </div>
        </div>
        
        <!-- Pending Barbers -->
        <div class="section">
          <h2>Onay Bekleyen Kuaförler</h2>
          
          <div *ngIf="loading" class="loading">Yükleniyor...</div>
          
          <div *ngIf="!loading && pendingBarbers().length === 0" class="empty-state">
            <span class="empty-icon">✅</span>
            <p>Onay bekleyen kuaför bulunmuyor</p>
          </div>
          
          <div class="pending-list" *ngIf="!loading && pendingBarbers().length > 0">
            <div *ngFor="let barber of pendingBarbers()" class="pending-card">
              <div class="pending-card__info">
                <strong>{{ barber.shopName }}</strong>
                <p>📍 {{ barber.district }}, {{ barber.city }}</p>
                <div class="pending-card__rating">
                  ⭐ {{ barber.averageRating?.toFixed(1) || '0.0' }} ({{ barber.totalReviews || 0 }} yorum)
                </div>
              </div>
              <div class="pending-card__actions">
                <button 
                  class="btn btn--primary btn--sm" 
                  (click)="approveBarber(barber.id)"
                  [disabled]="processing">
                  ✅ Onayla
                </button>
                <button 
                  class="btn btn--danger btn--sm" 
                  (click)="rejectBarber(barber.id)"
                  [disabled]="processing">
                  ❌ Reddet
                </button>
              </div>
            </div>
          </div>
          
          <div *ngIf="successMessage" class="alert alert--success">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="alert alert--error">{{ errorMessage }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-header {
      margin: 2rem 0;
      h1 { margin-bottom: 0.25rem; }
      p { color: var(--text-secondary); margin: 0; }
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
      
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }
    
    .stat-card {
      padding: 1.5rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      text-align: center;
      box-shadow: var(--shadow-sm);
      
      &__value {
        display: block;
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 700;
        color: var(--accent);
      }
      
      &__label { color: var(--text-secondary); font-size: 0.9rem; }
    }
    
    .section {
      h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    }
    
    .loading { text-align: center; padding: 2rem; color: var(--text-secondary); }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      
      .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
      p { color: var(--text-secondary); margin: 0; }
    }
    
    .pending-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .pending-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      
      &__info {
        strong { display: block; font-size: 1.1rem; margin-bottom: 0.25rem; }
        p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }
      }
      
      &__rating { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }
      
      &__actions {
        display: flex;
        gap: 0.5rem;
      }
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &--primary { background: var(--accent); color: white; &:hover { filter: brightness(1.1); } }
      &--danger { background: #ef4444; color: white; &:hover { filter: brightness(1.1); } }
      &--sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    
    .alert {
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-top: 1rem;
      text-align: center;
      
      &--success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      &--error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  pendingBarbers = signal<BarberListItem[]>([]);
  loading = true;
  processing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadPendingBarbers();
  }

  loadPendingBarbers(): void {
    this.loading = true;
    this.adminService.getPendingBarbers().subscribe({
      next: (barbers) => {
        this.pendingBarbers.set(barbers);
        this.loading = false;
      },
      error: () => {
        this.pendingBarbers.set([]);
        this.loading = false;
      }
    });
  }

  approveBarber(barberId: number): void {
    this.processing = true;
    this.clearMessages();

    this.adminService.approveBarber(barberId).subscribe({
      next: () => {
        this.pendingBarbers.set(this.pendingBarbers().filter(b => b.id !== barberId));
        this.successMessage = 'Kuaför başarıyla onaylandı!';
        this.processing = false;
      },
      error: () => {
        this.errorMessage = 'Onaylama işlemi başarısız oldu';
        this.processing = false;
      }
    });
  }

  rejectBarber(barberId: number): void {
    if (!confirm('Bu kuaförü reddetmek istediğinizden emin misiniz?')) return;

    this.processing = true;
    this.clearMessages();

    this.adminService.rejectBarber(barberId).subscribe({
      next: () => {
        this.pendingBarbers.set(this.pendingBarbers().filter(b => b.id !== barberId));
        this.successMessage = 'Kuaför reddedildi';
        this.processing = false;
      },
      error: () => {
        this.errorMessage = 'Reddetme işlemi başarısız oldu';
        this.processing = false;
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}

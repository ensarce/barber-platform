import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BarberService } from '../../core/services/barber.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BarberDetail, Service, WorkingHours } from '../../core/models/barber.model';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  selector: 'app-barber-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="panel-header">
        <h1>Kuaför Paneli</h1>
        <p>Profilinizi, hizmetlerinizi ve randevularınızı yönetin</p>
      </div>
      
      <!-- Profile Status -->
      <div *ngIf="!hasProfile && !loading" class="no-profile-notice">
        <div class="notice-icon">📋</div>
        <h2>Profiliniz Henüz Oluşturulmadı</h2>
        <p>Müşterilerin sizi bulabilmesi için profilinizi oluşturun</p>
        <button class="btn btn-primary" (click)="activeTab = 'profile'">Profil Oluştur</button>
      </div>

      <div *ngIf="loading" class="loading">Yükleniyor...</div>

      <!-- Tabs -->
      <div *ngIf="hasProfile || activeTab === 'profile'" class="tabs">
        <button class="tab" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'" *ngIf="hasProfile">
          📊 Gösterge Paneli
        </button>
        <button class="tab" [class.active]="activeTab === 'appointments'" (click)="loadAppointments(); activeTab = 'appointments'" *ngIf="hasProfile">
          📅 Randevular
        </button>
        <button class="tab" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
          👤 Profil
        </button>
        <button class="tab" [class.active]="activeTab === 'services'" (click)="activeTab = 'services'" *ngIf="hasProfile">
          ✂️ Hizmetler
        </button>
        <button class="tab" [class.active]="activeTab === 'hours'" (click)="activeTab = 'hours'" *ngIf="hasProfile">
          🕐 Çalışma Saatleri
        </button>
      </div>

      <!-- Dashboard Tab -->
      <div *ngIf="activeTab === 'dashboard' && hasProfile" class="tab-content">
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-card__icon">⭐</span>
            <div class="stat-card__content">
              <span class="stat-card__value">{{ profile?.averageRating?.toFixed(1) || '0.0' }}</span>
              <span class="stat-card__label">Ortalama Puan</span>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-card__icon">💬</span>
            <div class="stat-card__content">
              <span class="stat-card__value">{{ profile?.totalReviews || 0 }}</span>
              <span class="stat-card__label">Toplam Yorum</span>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-card__icon">✂️</span>
            <div class="stat-card__content">
              <span class="stat-card__value">{{ profile?.services?.length || 0 }}</span>
              <span class="stat-card__label">Aktif Hizmet</span>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-card__icon">{{ getStatusIcon() }}</span>
            <div class="stat-card__content">
              <span class="stat-card__value">{{ getStatusText() }}</span>
              <span class="stat-card__label">Profil Durumu</span>
            </div>
          </div>
        </div>
        
        <div class="quick-info">
          <h3>Bilgileriniz</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Dükkan Adı</label>
              <span>{{ profile?.shopName }}</span>
            </div>
            <div class="info-item">
              <label>Şehir / İlçe</label>
              <span>{{ profile?.city }} / {{ profile?.district }}</span>
            </div>
            <div class="info-item">
              <label>Adres</label>
              <span>{{ profile?.address }}</span>
            </div>
            <div class="info-item">
              <label>Açıklama</label>
              <span>{{ profile?.description || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tab -->
      <div *ngIf="activeTab === 'profile'" class="tab-content">
        <div class="form-card">
          <h3>{{ hasProfile ? 'Profil Düzenle' : 'Profil Oluştur' }}</h3>
          
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="form-group">
              <label for="shopName">Dükkan Adı *</label>
              <input type="text" id="shopName" formControlName="shopName" placeholder="Örn: Ali Usta Berber">
            </div>
            
            <div class="form-group">
              <label for="description">Açıklama</label>
              <textarea id="description" formControlName="description" rows="3" 
                        placeholder="Dükkanınız hakkında kısa bir açıklama yazın..."></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">Şehir *</label>
                <select id="city" formControlName="city" (change)="onCityChange()">
                  <option value="">Şehir Seçin</option>
                  <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="district">İlçe *</label>
                <select id="district" formControlName="district">
                  <option value="">İlçe Seçin</option>
                  <option *ngFor="let district of districts" [value]="district">{{ district }}</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="address">Adres *</label>
              <input type="text" id="address" formControlName="address" placeholder="Tam adres">
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || saving">
                {{ saving ? 'Kaydediliyor...' : (hasProfile ? 'Güncelle' : 'Profil Oluştur') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Services Tab -->
      <div *ngIf="activeTab === 'services' && hasProfile" class="tab-content">
        <div class="section-header">
          <h3>Hizmetleriniz</h3>
          <button class="btn btn-primary btn-sm" (click)="showAddService = true" *ngIf="!showAddService">
            + Yeni Hizmet Ekle
          </button>
        </div>
        
        <!-- Add Service Form -->
        <div *ngIf="showAddService" class="form-card add-service-form">
          <h4>Yeni Hizmet Ekle</h4>
          <form [formGroup]="serviceForm" (ngSubmit)="addService()">
            <div class="form-row">
              <div class="form-group">
                <label for="serviceName">Hizmet Türü *</label>
                <select id="serviceName" formControlName="name" (change)="onServiceTypeChange()">
                  <option value="">Hizmet Seçin</option>
                  <optgroup *ngFor="let category of serviceCategories" [label]="category.name">
                    <option *ngFor="let service of category.services" [value]="service.name">
                      {{ service.name }} ({{ service.defaultDuration }} dk - {{ service.defaultPrice }} ₺)
                    </option>
                  </optgroup>
                  <option value="CUSTOM">+ Özel Hizmet Ekle</option>
                </select>
              </div>
              
              <div class="form-group" *ngIf="serviceForm.get('name')?.value === 'CUSTOM'">
                <label for="customName">Hizmet Adı *</label>
                <input type="text" id="customName" formControlName="customName" placeholder="Özel hizmet adı">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="duration">Süre (dk) *</label>
                <input type="number" id="duration" formControlName="durationMinutes" placeholder="30" min="5">
              </div>
              
              <div class="form-group">
                <label for="price">Fiyat (₺) *</label>
                <input type="number" id="price" formControlName="price" placeholder="100" min="0">
              </div>
            </div>
            
            <div class="form-group">
              <label for="serviceDesc">Açıklama</label>
              <input type="text" id="serviceDesc" formControlName="description" placeholder="Hizmet detayları...">
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="showAddService = false">İptal</button>
              <button type="submit" class="btn btn-primary" [disabled]="serviceForm.invalid || saving">
                {{ saving ? 'Ekleniyor...' : 'Ekle' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Services List -->
        <div class="services-list">
          <div *ngFor="let service of profile?.services" class="service-item">
            <div class="service-info">
              <strong>{{ service.name }}</strong>
              <span class="service-meta">{{ service.durationMinutes }} dk • {{ service.price }} ₺</span>
              <span *ngIf="service.description" class="service-desc">{{ service.description }}</span>
            </div>
            <div class="service-actions">
              <button class="btn btn-icon" (click)="deleteService(service.id)" title="Sil">🗑️</button>
            </div>
          </div>
          
          <div *ngIf="!profile?.services?.length" class="empty-state">
            <p>Henüz hizmet eklenmemiş</p>
          </div>
        </div>
      </div>

      <!-- Working Hours Tab -->
      <div *ngIf="activeTab === 'hours' && hasProfile" class="tab-content">
        <div class="form-card">
          <h3>Çalışma Saatleri</h3>
          <p class="text-muted">Her gün için çalışma saatlerinizi belirleyin</p>
          
          <form [formGroup]="workingHoursForm" (ngSubmit)="saveWorkingHours()">
            <div formArrayName="workingHours" class="hours-list">
              <div *ngFor="let day of workingHoursArray.controls; let i = index" [formGroupName]="i" class="hours-row">
                <div class="day-name">{{ getDayName(i) }}</div>
                
                <label class="checkbox-wrapper">
                  <input type="checkbox" formControlName="isClosed">
                  <span>Kapalı</span>
                </label>
                
                <div class="time-inputs" *ngIf="!day.get('isClosed')?.value">
                  <input type="time" formControlName="startTime">
                  <span>-</span>
                  <input type="time" formControlName="endTime">
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Appointments Tab -->
      <div *ngIf="activeTab === 'appointments' && hasProfile" class="tab-content">
        <div class="section-header">
          <h3>Gelen Randevular</h3>
        </div>
        
        <div *ngIf="loadingAppointments" class="loading">Randevular yükleniyor...</div>
        
        <div *ngIf="!loadingAppointments && appointments.length === 0" class="empty-state">
          <p>Henüz randevu yok</p>
        </div>
        
        <div *ngIf="!loadingAppointments && appointments.length > 0" class="appointments-list">
          <div *ngFor="let apt of appointments" class="appointment-card" [class]="'status-' + apt.status.toLowerCase()">
            <div class="appointment-card__header">
              <span class="badge" [class]="getAppointmentStatusClass(apt.status)">
                {{ getAppointmentStatusText(apt.status) }}
              </span>
              <span class="appointment-card__date">
                {{ formatAppointmentDate(apt.appointmentDate) }}
              </span>
            </div>
            
            <div class="appointment-card__body">
              <h4>👤 {{ apt.customerName }}</h4>
              <p class="appointment-card__service">✂️ {{ apt.serviceName }}</p>
              <p class="appointment-card__time">🕐 {{ apt.startTime.substring(0, 5) }} - {{ apt.endTime.substring(0, 5) }}</p>
              <p class="appointment-card__price">💰 {{ apt.totalPrice }} ₺</p>
            </div>
            
            <div class="appointment-card__actions">
              <button *ngIf="apt.status === 'PENDING'" class="btn btn-primary btn-sm" (click)="confirmAppointment(apt.id)">
                ✅ Onayla
              </button>
              <button *ngIf="apt.status === 'CONFIRMED'" class="btn btn-success btn-sm" (click)="completeAppointment(apt.id)">
                ✔️ Tamamlandı
              </button>
              <button *ngIf="apt.status === 'PENDING' || apt.status === 'CONFIRMED'" class="btn btn-outline btn-sm" (click)="cancelAppointmentByBarber(apt.id)">
                ❌ İptal
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Messages -->
      <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .panel-header {
      margin: 2rem 0;
      h1 { margin-bottom: 0.25rem; }
      p { color: var(--text-secondary); margin: 0; }
    }
    
    .loading { text-align: center; padding: 3rem; color: var(--text-secondary); }
    
    .no-profile-notice {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      
      .notice-icon { font-size: 4rem; margin-bottom: 1rem; }
      h2 { margin-bottom: 0.5rem; }
      p { color: var(--text-secondary); margin-bottom: 1.5rem; }
    }
    
    .tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--border);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar { display: none; }
      
      @media (max-width: 768px) {
        padding-bottom: 2px;
        margin: 0 -1rem 1.5rem;
        padding: 0 1rem;
      }
    }
    
    .tab {
      padding: 0.875rem 1.25rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-secondary);
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      
      &:hover { color: var(--text-primary); }
      &.active { 
        color: var(--accent); 
        border-bottom-color: var(--accent);
        background: rgba(247, 37, 133, 0.05);
      }
      
      @media (max-width: 768px) {
        padding: 0.75rem 1rem;
        font-size: 0.8rem;
      }
    }
    
    .tab-content { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      
      &__icon { font-size: 2.5rem; }
      &__content { display: flex; flex-direction: column; }
      &__value { font-size: 1.75rem; font-weight: 700; }
      &__label { font-size: 0.85rem; color: var(--text-secondary); }
    }
    
    .quick-info {
      background: var(--surface);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      h3 { margin-bottom: 1rem; }
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    
    .info-item {
      label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
      span { font-weight: 600; }
    }
    
    .form-card {
      background: var(--surface);
      padding: 2rem;
      border-radius: var(--radius-lg);
      h3 { margin-bottom: 1.5rem; }
      h4 { margin-bottom: 1rem; }
    }
    
    .form-group {
      margin-bottom: 1.25rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
      input, textarea, select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--background);
        color: var(--text-primary);
        font-size: 1rem;
        &:focus { outline: none; border-color: var(--accent); }
      }
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &-primary { background: var(--accent); color: white; &:hover { filter: brightness(1.1); } &:disabled { opacity: 0.5; } }
      &-outline { background: transparent; border: 2px solid var(--border); color: var(--text-primary); }
      &-sm { padding: 0.5rem 1rem; font-size: 0.9rem; }
      &-icon { padding: 0.5rem; background: transparent; border: none; cursor: pointer; font-size: 1.25rem; opacity: 0.7; &:hover { opacity: 1; } }
    }
    
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; h3 { margin: 0; } }
    .add-service-form { margin-bottom: 1.5rem; border: 2px dashed var(--border); }
    
    .services-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      
      .service-info { display: flex; flex-direction: column; gap: 0.25rem; }
      .service-meta { font-size: 0.9rem; color: var(--accent); font-weight: 600; }
      .service-desc { font-size: 0.85rem; color: var(--text-secondary); }
    }
    
    .empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); }
    .hours-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .hours-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      background: var(--background);
      border-radius: var(--radius-md);
      
      .day-name { min-width: 100px; font-weight: 600; }
      .checkbox-wrapper { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; input { width: auto; } }
      .time-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        input { width: 120px; padding: 0.5rem; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); }
      }
    }
    
    .alert {
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      margin-top: 1.5rem;
      &-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; }
      &-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
    }
    
    .text-muted { color: var(--text-secondary); margin-bottom: 1.5rem; }
    
    .appointments-list { display: flex; flex-direction: column; gap: 1rem; }
    .appointment-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--text-muted);
      overflow: hidden;
      
      &.status-pending { border-left-color: #f59e0b; }
      &.status-confirmed { border-left-color: #10b981; }
      &.status-completed { border-left-color: #3b82f6; }
      &.status-cancelled { border-left-color: #ef4444; opacity: 0.6; }
      
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: var(--background);
        border-bottom: 1px solid var(--border);
      }
      
      &__date { font-weight: 600; }
      
      &__body {
        padding: 1rem;
        h4 { margin: 0 0 0.5rem 0; }
        p { margin: 0.25rem 0; font-size: 0.9rem; color: var(--text-secondary); }
      }
      
      &__price { font-weight: 700; color: var(--accent) !important; }
      
      &__actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--border);
        justify-content: flex-end;
      }
    }
    
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .badge-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .badge-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    
    .btn-success { background: #10b981; color: white; &:hover { filter: brightness(1.1); } }
  `]
})
export class BarberPanelComponent implements OnInit {
  profile: BarberDetail | null = null;
  hasProfile = false;
  loading = true;
  showAddService = false;
  activeTab = 'dashboard';
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Appointments
  appointments: Appointment[] = [];
  loadingAppointments = false;

  profileForm: FormGroup;
  serviceForm: FormGroup;
  workingHoursForm: FormGroup;

  private readonly DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  private readonly DAY_NAMES: Record<string, string> = {
    'MONDAY': 'Pazartesi', 'TUESDAY': 'Salı', 'WEDNESDAY': 'Çarşamba',
    'THURSDAY': 'Perşembe', 'FRIDAY': 'Cuma', 'SATURDAY': 'Cumartesi', 'SUNDAY': 'Pazar'
  };
  // Predefined service types
  readonly serviceCategories = [
    {
      name: 'Saç Hizmetleri',
      services: [
        { name: 'Saç Kesimi', defaultDuration: 30, defaultPrice: 150 },
        { name: 'Saç Yıkama', defaultDuration: 15, defaultPrice: 50 },
        { name: 'Saç Boyama', defaultDuration: 60, defaultPrice: 300 },
        { name: 'Saç Şekillendirme', defaultDuration: 20, defaultPrice: 100 },
        { name: 'Keratin Bakım', defaultDuration: 90, defaultPrice: 500 },
        { name: 'Saç Maskesi', defaultDuration: 30, defaultPrice: 150 }
      ]
    },
    {
      name: 'Sakal Hizmetleri',
      services: [
        { name: 'Sakal Kesimi', defaultDuration: 15, defaultPrice: 80 },
        { name: 'Sakal Tıraşı', defaultDuration: 20, defaultPrice: 100 },
        { name: 'Sakal Şekillendirme', defaultDuration: 25, defaultPrice: 120 }
      ]
    },
    {
      name: 'Yüz Bakımı',
      services: [
        { name: 'Yüz Maskesi', defaultDuration: 30, defaultPrice: 150 },
        { name: 'Cilt Bakımı', defaultDuration: 45, defaultPrice: 200 },
        { name: 'Kaş Düzeltme', defaultDuration: 10, defaultPrice: 50 }
      ]
    },
    {
      name: 'Paket Hizmetler',
      services: [
        { name: 'Saç + Sakal', defaultDuration: 45, defaultPrice: 200 },
        { name: 'Damat Paketi', defaultDuration: 120, defaultPrice: 600 },
        { name: 'VIP Bakım Paketi', defaultDuration: 90, defaultPrice: 450 }
      ]
    }
  ];

  // Turkish cities and districts
  readonly cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın'];

  readonly cityDistricts: Record<string, string[]> = {
    'İstanbul': ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bakırköy', 'Fatih', 'Beyoğlu', 'Ataşehir', 'Maltepe', 'Kartal', 'Pendik', 'Başakşehir', 'Esenyurt', 'Küçükçekmece'],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Balçova'],
    'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Görükle', 'Mudanya', 'Gemlik'],
    'Antalya': ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara', 'Alanya', 'Manavgat'],
    'Adana': ['Seyhan', 'Çukurova', 'Yüreğir', 'Sarıçam'],
    'Konya': ['Selçuklu', 'Meram', 'Karatay'],
    'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Nizip'],
    'Şanlıurfa': ['Eyyübiye', 'Haliliye', 'Karaköprü'],
    'Kocaeli': ['İzmit', 'Gebze', 'Derince', 'Körfez'],
    'Mersin': ['Mezitli', 'Yenişehir', 'Toroslar', 'Akdeniz'],
    'Diyarbakır': ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur'],
    'Hatay': ['Antakya', 'İskenderun', 'Defne'],
    'Manisa': ['Yunusemre', 'Şehzadeler', 'Akhisar'],
    'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas'],
    'Samsun': ['İlkadım', 'Atakum', 'Canik'],
    'Balıkesir': ['Altıeylül', 'Karesi', 'Bandırma'],
    'Kahramanmaraş': ['Dulkadiroğlu', 'Onikişubat'],
    'Van': ['İpekyolu', 'Tuşba', 'Edremit'],
    'Aydın': ['Efeler', 'Kuşadası', 'Didim', 'Söke']
  };

  districts: string[] = [];

  constructor(
    private fb: FormBuilder,
    private barberService: BarberService,
    private appointmentService: AppointmentService
  ) {
    this.profileForm = this.fb.group({
      shopName: ['', Validators.required],
      description: [''],
      city: ['', Validators.required],
      district: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      customName: [''],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(5)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    this.workingHoursForm = this.fb.group({ workingHours: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get workingHoursArray(): FormArray {
    return this.workingHoursForm.get('workingHours') as FormArray;
  }

  loadProfile(): void {
    this.loading = true;
    this.barberService.getMyProfile().subscribe({
      next: (profile: BarberDetail) => {
        this.profile = profile;
        this.hasProfile = true;
        this.populateProfileForm();
        this.initWorkingHoursForm();
        this.loading = false;
      },
      error: () => {
        this.hasProfile = false;
        this.activeTab = 'profile';
        this.initWorkingHoursForm();
        this.loading = false;
      }
    });
  }

  populateProfileForm(): void {
    if (this.profile) {
      // Load districts for the current city
      this.districts = this.cityDistricts[this.profile.city] || [];

      this.profileForm.patchValue({
        shopName: this.profile.shopName,
        description: this.profile.description,
        city: this.profile.city,
        district: this.profile.district,
        address: this.profile.address
      });
    }
  }

  initWorkingHoursForm(): void {
    const arr = this.workingHoursForm.get('workingHours') as FormArray;
    arr.clear();
    this.DAYS.forEach(day => {
      const existing = this.profile?.workingHours?.find(wh => wh.dayOfWeek === day);
      arr.push(this.fb.group({
        dayOfWeek: [day],
        startTime: [existing?.startTime || '09:00'],
        endTime: [existing?.endTime || '19:00'],
        isClosed: [existing?.isClosed ?? (day === 'SUNDAY')]
      }));
    });
  }

  getDayName(index: number): string {
    return this.DAY_NAMES[this.DAYS[index]];
  }

  getStatusIcon(): string {
    return this.profile?.status === 'APPROVED' ? '✅' : this.profile?.status === 'PENDING' ? '⏳' : '❌';
  }

  getStatusText(): string {
    return this.profile?.status === 'APPROVED' ? 'Onaylı' : this.profile?.status === 'PENDING' ? 'Onay Bekliyor' : 'Reddedildi';
  }

  onCityChange(): void {
    const city = this.profileForm.get('city')?.value;
    this.districts = this.cityDistricts[city] || [];
    this.profileForm.get('district')?.setValue('');
  }

  onServiceTypeChange(): void {
    const selectedServiceName = this.serviceForm.get('name')?.value;
    if (selectedServiceName && selectedServiceName !== 'CUSTOM') {
      for (const category of this.serviceCategories) {
        const service = category.services.find(s => s.name === selectedServiceName);
        if (service) {
          this.serviceForm.patchValue({
            durationMinutes: service.defaultDuration,
            price: service.defaultPrice
          });
          break;
        }
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.clearMessages();

    const req = this.profileForm.value;
    const obs = this.hasProfile ? this.barberService.updateProfile(req) : this.barberService.createProfile(req);

    obs.subscribe({
      next: (profile: BarberDetail) => {
        this.profile = profile;
        this.hasProfile = true;
        this.activeTab = 'dashboard';
        this.successMessage = this.hasProfile ? 'Profil güncellendi!' : 'Profil oluşturuldu! Admin onayı bekleniyor.';
        this.saving = false;
        this.initWorkingHoursForm();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message || 'İşlem başarısız';
        this.saving = false;
      }
    });
  }

  addService(): void {
    if (this.serviceForm.invalid) return;
    this.saving = true;
    this.clearMessages();

    const formValue = this.serviceForm.value;
    const serviceData = {
      name: formValue.name === 'CUSTOM' ? formValue.customName : formValue.name,
      description: formValue.description,
      durationMinutes: formValue.durationMinutes,
      price: formValue.price
    };

    this.barberService.addService(serviceData).subscribe({
      next: (service: Service) => {
        if (!this.profile!.services) this.profile!.services = [];
        this.profile!.services.push(service);
        this.serviceForm.reset({ name: '', customName: '', durationMinutes: 30, price: 0 });
        this.showAddService = false;
        this.successMessage = 'Hizmet eklendi!';
        this.saving = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message || 'Hizmet eklenemedi';
        this.saving = false;
      }
    });
  }

  deleteService(serviceId: number): void {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;
    this.barberService.deleteService(serviceId).subscribe({
      next: () => {
        this.profile!.services = this.profile!.services?.filter(s => s.id !== serviceId);
        this.successMessage = 'Hizmet silindi!';
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message || 'Hizmet silinemedi';
      }
    });
  }

  saveWorkingHours(): void {
    this.saving = true;
    this.clearMessages();

    const request = {
      workingHours: this.workingHoursArray.value.map((wh: { dayOfWeek: string; startTime: string; endTime: string; isClosed: boolean }) => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.isClosed ? null : wh.startTime,
        endTime: wh.isClosed ? null : wh.endTime,
        isClosed: wh.isClosed
      }))
    };

    this.barberService.updateWorkingHours(request).subscribe({
      next: (hours: WorkingHours[]) => {
        this.profile!.workingHours = hours;
        this.successMessage = 'Çalışma saatleri kaydedildi!';
        this.saving = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message || 'Kayıt başarısız';
        this.saving = false;
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 5000);
  }

  // Appointment management methods
  loadAppointments(): void {
    this.loadingAppointments = true;
    this.appointmentService.getMyAppointments(0, 50).subscribe({
      next: (response) => {
        this.appointments = response.content;
        this.loadingAppointments = false;
      },
      error: () => {
        this.appointments = [];
        this.loadingAppointments = false;
      }
    });
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentService.updateAppointmentStatus(appointmentId, 'CONFIRMED').subscribe({
      next: () => {
        this.successMessage = 'Randevu onaylandı!';
        this.loadAppointments();
      },
      error: () => {
        this.errorMessage = 'Randevu onaylanamadı';
      }
    });
  }

  completeAppointment(appointmentId: number): void {
    this.appointmentService.updateAppointmentStatus(appointmentId, 'COMPLETED').subscribe({
      next: () => {
        this.successMessage = 'Randevu tamamlandı olarak işaretlendi!';
        this.loadAppointments();
      },
      error: () => {
        this.errorMessage = 'İşlem başarısız';
      }
    });
  }

  cancelAppointmentByBarber(appointmentId: number): void {
    if (!confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) return;
    this.appointmentService.cancelAppointment(appointmentId).subscribe({
      next: () => {
        this.successMessage = 'Randevu iptal edildi';
        this.loadAppointments();
      },
      error: () => {
        this.errorMessage = 'Randevu iptal edilemedi';
      }
    });
  }

  getAppointmentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-success',
      COMPLETED: 'badge-info',
      CANCELLED: 'badge-error'
    };
    return classes[status] || 'badge-pending';
  }

  getAppointmentStatusText(status: string): string {
    const texts: Record<string, string> = {
      PENDING: 'Onay Bekliyor',
      CONFIRMED: 'Onaylandı',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi'
    };
    return texts[status] || status;
  }

  formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}


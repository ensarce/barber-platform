import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BarberService } from '../../core/services/barber.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { BarberDetail, Service, WorkingHours } from '../../core/models/barber.model';
import { Review, TimeSlot } from '../../core/models/appointment.model';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './barber-detail.component.html',
  styleUrls: ['./barber-detail.component.css']
})
export class BarberDetailComponent implements OnInit {
  barber = signal<BarberDetail | null>(null);
  reviews = signal<Review[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  activeTab: 'overview' | 'services' | 'reviews' | 'gallery' = 'overview';
  selectedImage: string = '';

  // Appointment form
  showAppointmentModal = false;
  selectedService: Service | null = null;
  selectedDate: string = '';
  selectedTime: string = '';
  availableTimeSlots = signal<TimeSlot[]>([]);
  loadingSlots = signal(false);

  constructor(
    private route: ActivatedRoute,
    private barberService: BarberService,
    private appointmentService: AppointmentService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const barberId = +params['id'];
      this.loadBarber(barberId);
      this.loadReviews(barberId);
    });
  }

  loadBarber(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.barberService.getBarberById(id).subscribe({
      next: (barber) => {
        this.barber.set(barber);
        this.selectedImage = barber.profileImage || '';
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Kuaför bilgileri yüklenemedi.');
        this.isLoading.set(false);
        console.error('Error loading barber:', err);
      }
    });
  }

  loadReviews(barberId: number): void {
    this.barberService.getBarberReviews(barberId).subscribe({
      next: (response) => this.reviews.set(response.content),
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  setActiveTab(tab: 'overview' | 'services' | 'reviews' | 'gallery') {
    this.activeTab = tab;
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  openAppointmentModal(service?: Service) {
    this.selectedService = service || null;
    this.showAppointmentModal = true;
    if (this.selectedDate && this.selectedService) {
      this.loadTimeSlots();
    }
  }

  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.resetAppointmentForm();
  }

  resetAppointmentForm() {
    this.selectedService = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableTimeSlots.set([]);
  }

  onDateChange() {
    this.selectedTime = '';
    if (this.selectedDate && this.selectedService) {
      this.loadTimeSlots();
    }
  }

  loadTimeSlots(): void {
    if (!this.barber() || !this.selectedDate || !this.selectedService) return;

    this.loadingSlots.set(true);
    this.barberService.getAvailableSlots(
      this.barber()!.id,
      this.selectedDate,
      this.selectedService.durationMinutes
    ).subscribe({
      next: (response) => {
        this.availableTimeSlots.set(response.slots);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.availableTimeSlots.set([]);
        this.loadingSlots.set(false);
      }
    });
  }

  selectTimeSlot(slot: TimeSlot) {
    if (slot.available) {
      this.selectedTime = slot.startTime;
    }
  }

  submitAppointment() {
    if (!this.barber() || !this.selectedService || !this.selectedDate || !this.selectedTime) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      alert('Randevu almak için giriş yapmalısınız.');
      return;
    }

    this.appointmentService.createAppointment({
      barberProfileId: this.barber()!.id,
      serviceId: this.selectedService.id,
      appointmentDate: this.selectedDate,
      startTime: this.selectedTime
    }).subscribe({
      next: () => {
        alert('Randevunuz başarıyla oluşturuldu!');
        this.closeAppointmentModal();
      },
      error: (err) => {
        alert(err.error?.message || 'Randevu oluşturulamadı. Lütfen tekrar deneyin.');
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('tr-TR', options);
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }
}

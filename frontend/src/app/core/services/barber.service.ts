import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BarberDetail, BarberListItem, Service, WorkingHours } from '../models/barber.model';
import { AvailableSlotsResponse, Review } from '../models/appointment.model';

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

interface CreateProfileRequest {
    shopName: string;
    description?: string;
    address: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
    profileImage?: string;
}

interface CreateServiceRequest {
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
}

interface WorkingHoursRequest {
    workingHours: Array<{
        dayOfWeek: string;
        startTime?: string;
        endTime?: string;
        isClosed: boolean;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class BarberService {

    constructor(private http: HttpClient) { }

    // Public endpoints
    getBarbers(city?: string, district?: string, page = 0, size = 10): Observable<PageResponse<BarberListItem>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (city) params = params.set('city', city);
        if (district) params = params.set('district', district);

        return this.http.get<PageResponse<BarberListItem>>(`${environment.apiUrl}/barbers`, { params });
    }

    getBarberById(id: number): Observable<BarberDetail> {
        return this.http.get<BarberDetail>(`${environment.apiUrl}/barbers/${id}`);
    }

    getBarberServices(id: number): Observable<Service[]> {
        return this.http.get<Service[]>(`${environment.apiUrl}/barbers/${id}/services`);
    }

    getBarberReviews(id: number, page = 0, size = 10): Observable<PageResponse<Review>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<PageResponse<Review>>(`${environment.apiUrl}/barbers/${id}/reviews`, { params });
    }

    getWorkingHours(id: number): Observable<WorkingHours[]> {
        return this.http.get<WorkingHours[]>(`${environment.apiUrl}/barbers/${id}/working-hours`);
    }

    getAvailableSlots(barberProfileId: number, date: string, serviceDuration?: number): Observable<AvailableSlotsResponse> {
        let params = new HttpParams().set('date', date);
        if (serviceDuration) {
            params = params.set('serviceDuration', serviceDuration.toString());
        }
        return this.http.get<AvailableSlotsResponse>(`${environment.apiUrl}/appointments/barbers/${barberProfileId}/slots`, { params });
    }

    // Barber-only endpoints (authenticated)
    getMyProfile(): Observable<BarberDetail> {
        return this.http.get<BarberDetail>(`${environment.apiUrl}/barbers/profile/me`);
    }

    createProfile(request: CreateProfileRequest): Observable<BarberDetail> {
        return this.http.post<BarberDetail>(`${environment.apiUrl}/barbers/profile`, request);
    }

    updateProfile(request: Partial<CreateProfileRequest>): Observable<BarberDetail> {
        return this.http.put<BarberDetail>(`${environment.apiUrl}/barbers/profile`, request);
    }

    // Service management
    addService(request: CreateServiceRequest): Observable<Service> {
        return this.http.post<Service>(`${environment.apiUrl}/barbers/services`, request);
    }

    updateService(serviceId: number, request: Partial<CreateServiceRequest>): Observable<Service> {
        return this.http.put<Service>(`${environment.apiUrl}/barbers/services/${serviceId}`, request);
    }

    deleteService(serviceId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/barbers/services/${serviceId}`);
    }

    // Working hours management
    updateWorkingHours(request: WorkingHoursRequest): Observable<WorkingHours[]> {
        return this.http.put<WorkingHours[]>(`${environment.apiUrl}/barbers/working-hours`, request);
    }
}


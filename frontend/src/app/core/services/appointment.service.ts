import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, CreateAppointmentRequest, CreateReviewRequest, Review } from '../models/appointment.model';

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    constructor(private http: HttpClient) { }

    createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
        return this.http.post<Appointment>(`${environment.apiUrl}/appointments`, request);
    }

    getMyAppointments(page = 0, size = 10): Observable<PageResponse<Appointment>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<PageResponse<Appointment>>(`${environment.apiUrl}/appointments`, { params });
    }

    updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
        return this.http.patch<Appointment>(`${environment.apiUrl}/appointments/${id}/status`, { status });
    }

    cancelAppointment(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/appointments/${id}`);
    }

    createReview(request: CreateReviewRequest): Observable<Review> {
        return this.http.post<Review>(`${environment.apiUrl}/reviews`, request);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BarberListItem } from '../models/barber.model';

@Injectable({
    providedIn: 'root'
})
export class AdminService {

    constructor(private http: HttpClient) { }

    getPendingBarbers(): Observable<BarberListItem[]> {
        return this.http.get<BarberListItem[]>(`${environment.apiUrl}/admin/barbers/pending`);
    }

    approveBarber(barberId: number): Observable<BarberListItem> {
        return this.http.patch<BarberListItem>(`${environment.apiUrl}/admin/barbers/${barberId}/approve`, {});
    }

    rejectBarber(barberId: number): Observable<BarberListItem> {
        return this.http.patch<BarberListItem>(`${environment.apiUrl}/admin/barbers/${barberId}/reject`, {});
    }
}

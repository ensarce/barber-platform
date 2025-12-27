import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'barber_token';
    private readonly USER_KEY = 'barber_user';

    private currentUser = signal<User | null>(null);

    isLoggedIn = computed(() => !!this.currentUser());
    user = computed(() => this.currentUser());
    isBarber = computed(() => this.currentUser()?.role === 'BARBER');
    isCustomer = computed(() => this.currentUser()?.role === 'CUSTOMER');
    isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem(this.USER_KEY);
        if (userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                this.currentUser.set(user);
            } catch {
                this.clearStorage();
            }
        }
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
            .pipe(tap(response => this.handleAuthResponse(response)));
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
            .pipe(tap(response => this.handleAuthResponse(response)));
    }

    logout(): void {
        this.clearStorage();
        this.currentUser.set(null);
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        const user: User = {
            id: response.id,
            email: response.email,
            name: response.name,
            role: response.role
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
    }

    private clearStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

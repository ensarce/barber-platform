export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    role: 'CUSTOMER' | 'BARBER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'BARBER' | 'ADMIN';
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'CUSTOMER' | 'BARBER';
}

export interface LoginRequest {
    email: string;
    password: string;
}

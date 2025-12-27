export interface BarberListItem {
    id: number;
    shopName: string;
    city: string;
    district: string;
    profileImage?: string;
    averageRating: number;
    totalReviews: number;
    startingPrice?: string;
}

export interface BarberDetail {
    id: number;
    userId: number;
    ownerName: string;
    shopName: string;
    description?: string;
    address: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
    profileImage?: string;
    averageRating: number;
    totalReviews: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    services: Service[];
    workingHours: WorkingHours[];
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
}

export interface WorkingHours {
    id: number;
    dayOfWeek: string;
    dayName: string;
    startTime: string;
    endTime: string;
    isClosed: boolean;
}

export interface CreateProfileRequest {
    shopName: string;
    description?: string;
    address: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
    profileImage?: string;
}

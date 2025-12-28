export const environment = {
    production: false,
    get apiUrl(): string {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:8080/api';
        }
        return '/api';
    }
};

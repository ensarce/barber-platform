const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const environment = {
    production: false,
    apiUrl: isLocalhost ? 'http://localhost:8080/api' : '/api'
};

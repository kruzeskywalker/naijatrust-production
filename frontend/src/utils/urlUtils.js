export const getApiBaseUrl = (currentUrl) => {
    if (currentUrl && !currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
        return currentUrl.replace('/auth', '');
    }

    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    return isProd
        ? 'https://naijatrust-production-api.onrender.com/api'
        : 'http://localhost:5001/api';
};

export const getAuthApiUrl = (currentUrl) => {
    if (currentUrl && !currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
        return currentUrl;
    }

    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    return isProd
        ? 'https://naijatrust-production-api.onrender.com/api/auth'
        : 'http://localhost:5001/api/auth';
};

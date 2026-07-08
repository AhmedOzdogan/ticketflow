import axios from 'axios';

export function getApiErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return 'An unexpected error occurred.';
    }

    if (!error.response) {
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    const data = error.response.data;

    // Django REST Framework & SimpleJWT:
    // { "detail": "..." }
    if (
        data &&
        typeof data === 'object' &&
        'detail' in data &&
        typeof data.detail === 'string'
    ) {
        return data.detail;
    }

    // Django validation errors:
    // { "email": ["..."], "password": ["..."] }
    if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (Array.isArray(value) && typeof value[0] === 'string') {
                return value[0];
            }

            if (typeof value === 'string') {
                return value;
            }
        }
    }

    switch (error.response.status) {
        case 400:
            return 'Please check the information you entered.';
        case 401:
            return 'Authentication failed.';
        case 403:
            return "You don't have permission to perform this action.";
        case 404:
            return 'The requested resource could not be found.';
        case 409:
            return 'This resource already exists.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'An internal server error occurred. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
}
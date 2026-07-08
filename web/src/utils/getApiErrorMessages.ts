import axios from 'axios';

export function getApiErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return 'Unexpected error.';
    }

    switch (error.response?.status) {
        case 400:
            return 'Please check the information you entered.';
        case 401:

            return 'Your session has expired. Please sign in again.';
        case 403:
            return "You don't have permission to perform this action.";
        case 404:
            return 'Resource not found.';
        case 409:
            return 'This resource already exists.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'Something went wrong.';
    }
}
import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

function getStorage() {
    return localStorage.getItem('refresh')
        ? localStorage
        : sessionStorage;
}

function getAccessToken() {
    return getStorage().getItem('access');
}

function getRefreshToken() {
    return getStorage().getItem('refresh');
}

function saveAccessToken(token: string) {
    getStorage().setItem('access', token);
}

function saveRefreshToken(token: string) {
    getStorage().setItem('refresh', token);
}

function clearTokens() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        console.log(originalRequest)

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Never attempt token refresh for public authentication endpoints.
        const publicEndpoints = [
            '/v1/users/login/',
            '/v1/users/register/',
            '/v1/users/token/refresh/',
        ];

        const requestUrl = originalRequest.url;

        if (
            requestUrl &&
            publicEndpoints.some((endpoint) =>
                requestUrl.includes(endpoint),
            )
        ) {
            return Promise.reject(error);
        }

        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        // If there is no authenticated session, do not attempt a token refresh.
        if (!accessToken || !refreshToken) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            clearTokens();
            window.location.href = '/login';

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const response = await axios.post<{
                access: string;
                refresh: string;
            }>(
                `${API_BASE_URL}/v1/users/token/refresh/`,
                {
                    refresh: refreshToken,
                },
            );

            saveAccessToken(response.data.access);
            saveRefreshToken(response.data.refresh);

            originalRequest.headers.Authorization =
                `Bearer ${response.data.access}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearTokens();
            window.location.href = '/login';

            return Promise.reject(refreshError);
        }
    },
);
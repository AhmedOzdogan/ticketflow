import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { login, register } from '../api/authApi';

import type {
    LoginRequest,
    RegisterRequest,
} from '../types/auth';

import type { User } from '../types/user';

interface AuthContextType {
    user: User | null;

    accessToken: string | null;
    refreshToken: string | null;

    isAuthenticated: boolean;

    isPending: boolean;

    loginUser: (payload: LoginRequest, rememberMe?: boolean) => Promise<void>;

    registerUser: (payload: RegisterRequest, rememberMe?: boolean) => Promise<void>;

    logoutUser: () => void;

    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ticketflow-auth-storage';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

type AuthStorageType = 'local' | 'session';

const getAuthStorage = (storageType: AuthStorageType) => {
    return storageType === 'local' ? localStorage : sessionStorage;
};

const clearAuthStorage = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
};

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);

    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        const storedAuthStorageType = localStorage.getItem(AUTH_STORAGE_KEY) as AuthStorageType | null;
        const storage = storedAuthStorageType === 'local' ? localStorage : sessionStorage;

        const storedAccess = storage.getItem(ACCESS_TOKEN_KEY);
        const storedRefresh = storage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = storage.getItem(USER_KEY);

        if (storedAccess) setAccessToken(storedAccess);
        if (storedRefresh) setRefreshToken(storedRefresh);

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser) as User);
            } catch {
                clearAuthStorage();
            }
        }
    }, []);

    const saveAuth = (access: string, refresh: string, user: User, rememberMe = false) => {
        const storageType: AuthStorageType = rememberMe ? 'local' : 'session';
        const storage = getAuthStorage(storageType);

        clearAuthStorage();

        setAccessToken(access);
        setRefreshToken(refresh);
        setUser(user);

        if (rememberMe) {
            localStorage.setItem(AUTH_STORAGE_KEY, storageType);
        }

        storage.setItem(ACCESS_TOKEN_KEY, access);
        storage.setItem(REFRESH_TOKEN_KEY, refresh);
        storage.setItem(USER_KEY, JSON.stringify(user));
    };

    const loginUser = async (payload: LoginRequest, rememberMe = false) => {
        const response = await login(payload);

        saveAuth(response.access, response.refresh, response.user as User, rememberMe);
    };

    const registerUser = async (payload: RegisterRequest, rememberMe = false) => {
        const response = await register(payload);

        saveAuth(response.access, response.refresh, response.user as User, rememberMe);
    };

    const logoutUser = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        clearAuthStorage();
    };

    const value = useMemo(
        () => ({
            user,

            accessToken,
            refreshToken,

            isAuthenticated: !!accessToken,
            isPending: user?.organizer_approval_status === 'pending',

            loginUser,
            registerUser,
            logoutUser,

            setUser,
        }),
        [user, accessToken, refreshToken]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
}
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Factory: creates an axios instance with a dynamic token getter
export function createApiClient(getToken: () => Promise<string | null>): AxiosInstance {
    const instance = axios.create({
        baseURL: API_URL,
        headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (res) => res,
        (error) => {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Une erreur est survenue";
            return Promise.reject(new Error(message));
        }
    );

    return instance;
}

// Utility type for backend responses
export interface ApiResponse<T> {
    data: T;
    error?: string;
}

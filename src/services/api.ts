import { serviceRegistry } from './config';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
            public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiService {
    private AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

    private getHeaders(additionalHeaders: Record<string, string> = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...additionalHeaders,
        };

        // ALWAYS add the AUTH_TOKEN - REQUIRED for backend APIs
        const token = this.AUTH_TOKEN;
        if (token && token !== 'Token Not Found!' && token !== 'your-actual-auth-token-here') {
            headers['Authorization'] = `Token ${token}`;
        } else {
            console.error('❌ VITE_AUTH_TOKEN is missing or invalid!');
            console.error('Current token:', token);
            console.error('Please check your .env file');
            throw new Error('Authentication token is required but missing or invalid.');
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        console.log(`Response status: ${response.status} ${response.statusText}`);
        console.log(`Response URL: ${response.url}`);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.error('❌ Error response data:', errorData);
            } catch {
                errorData = { error: response.statusText };
            }

            // Detailed error logging
            if (response.status === 400) {
                console.error('400 Bad Request details:', {
                    url: response.url,
                    status: response.status,
                    data: errorData
                });
            } else if (response.status === 401) {
                console.error('401 Unauthorized - Check your VITE_AUTH_TOKEN');
            } else if (response.status === 404) {
                console.error('404 Not Found:', response.url);
            }

            throw new ApiError(
                errorData.error || errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                const data = await response.json();
                console.log('✅ Response data received');
                return data;
            } catch (error) {
                console.error('Failed to parse JSON response:', error);
                throw new ApiError('Invalid JSON response', 500);
            }
        }

        return response.text() as unknown as T;
    }

    async request<T>(
        method: string,
        baseUrl: string,
        endpoint: string,
        data?: any,
        headers: Record<string, string> = {}
    ): Promise<T> {
        const url = `${baseUrl}${endpoint}`;
        console.log(`🚀 API ${method}: ${url}`);

        if (data) {
            console.log('Request data:', {
                ...data,
                password: data.password ? '[HIDDEN]' : undefined
            });
        }

        const requestHeaders = this.getHeaders(headers);

        const options: RequestInit = {
            method,
            headers: requestHeaders,
            cache: 'no-cache' // Prevent caching issues
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            return await this.handleResponse<T>(response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                error instanceof Error ? error.message : 'Network error',
                0,
                error
            );
        }
    }

    async get<T>(baseUrl: string, endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>('GET', baseUrl, endpoint, undefined, headers);
    }

    async post<T>(baseUrl: string, endpoint: string, data: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>('POST', baseUrl, endpoint, data, headers);
    }

    async put<T>(baseUrl: string, endpoint: string, data: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>('PUT', baseUrl, endpoint, data, headers);
    }

    async delete<T>(baseUrl: string, endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>('DELETE', baseUrl, endpoint, undefined, headers);
    }
}

export const apiService = new ApiService();

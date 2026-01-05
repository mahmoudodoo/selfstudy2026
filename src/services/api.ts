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

    private async getHeaders(additionalHeaders: Record<string, string> = {}) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.AUTH_TOKEN}`,
            ...additionalHeaders,
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: response.statusText };
            }

            throw new ApiError(
                errorData.error || errorData.message || `HTTP ${response.status}`,
                response.status,
                errorData
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
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
        console.log(`API ${method}: ${url}`);

        const options: RequestInit = {
            method,
            headers: await this.getHeaders(headers),
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

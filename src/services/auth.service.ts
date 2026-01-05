import { apiService } from './api';
import { serviceRegistry } from './config';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user_id: string;
    expires_at: string;
    requires_verification?: boolean;
    verification_domain?: string;
    user_profile_domain?: string;
}

export interface TokenVerification {
    valid: boolean;
    user_id: string;
    expires_at: string;
}

export interface LogoutRequest {
    token: string;
}

export interface LogoutResponse {
    message: string;
}

export interface TokenValidationResponse {
    token: string;
    user_id: string;
    is_valid: boolean;
    validation_details: {
        expired: boolean;
        active: boolean;
        checks_performed: {
            expiry: boolean;
            active: boolean;
        };
        errors: string[];
    };
    metadata: {
        created_at: string;
        expires_at: string;
        ip_address?: string;
        user_agent?: string;
        time_remaining_seconds: number;
        time_remaining_days: number;
        age_days: number;
    };
}

class AuthService {
    private tokenKey = 'auth_token';
    private userKey = 'auth_user';
    private lastVerificationKey = 'last_token_verification';
    private verificationInterval = 5 * 60 * 1000; // 5 minutes

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const baseUrl = await serviceRegistry.getRandomAuthReplica();
        if (!baseUrl) {
            throw new Error('No auth service replicas available');
        }

        try {
            const response = await apiService.post<LoginResponse>(
                baseUrl,
                '/api/login/',
                credentials
            );

            if (response.token) {
                this.setToken(response.token);
                this.setUser({
                    id: response.user_id,
                    token: response.token,
                    expiresAt: response.expires_at,
                });
            }

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout(token: string): Promise<LogoutResponse> {
        const baseUrl = await serviceRegistry.getRandomAuthReplica();
        if (!baseUrl) {
            throw new Error('No auth service replicas available');
        }

        try {
            const response = await apiService.post<LogoutResponse>(
                baseUrl,
                '/api/logout/',
                { token }
            );

            this.clearAuth();
            return response;
        } catch (error) {
            console.error('Logout failed:', error);
            this.clearAuth(); // Clear local auth even if server logout fails
            throw error;
        }
    }

    async verifyToken(token: string, userId?: string): Promise<TokenVerification> {
        const baseUrl = await serviceRegistry.getRandomAuthReplica();
        if (!baseUrl) {
            throw new Error('No auth service replicas available');
        }

        const data: any = { token };
        if (userId) {
            data.user_id = userId;
        }

        try {
            return await apiService.post<TokenVerification>(
                baseUrl,
                '/api/verify-token/',
                data
            );
        } catch (error) {
            console.error('Token verification failed:', error);
            throw error;
        }
    }

    async validateToken(token: string): Promise<TokenValidationResponse> {
        const baseUrl = await serviceRegistry.getRandomAuthReplica();
        if (!baseUrl) {
            throw new Error('No auth service replicas available');
        }

        try {
            return await apiService.post<TokenValidationResponse>(
                baseUrl,
                '/api/external/tokens/validate/',
                {
                    token,
                    check_expiry: true,
                    check_active: true,
                }
            );
        } catch (error) {
            console.error('Token validation failed:', error);
            throw error;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        const token = this.getToken();
        const user = this.getUser();

        if (!token || !user) {
            return false;
        }

        // Check if we recently verified the token
        const lastVerification = localStorage.getItem(this.lastVerificationKey);
        if (lastVerification) {
            const lastVerificationTime = parseInt(lastVerification, 10);
            if (Date.now() - lastVerificationTime < this.verificationInterval) {
                return true;
            }
        }

        try {
            const validation = await this.validateToken(token);

            // Update last verification time
            localStorage.setItem(this.lastVerificationKey, Date.now().toString());

            return validation.is_valid && validation.validation_details.errors.length === 0;
        } catch (error) {
            console.error('Authentication check failed:', error);
            return false;
        }
    }

    async checkAndRefreshAuth(): Promise<boolean> {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            this.clearAuth();
        }
        return authenticated;
    }

    // Token management
    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setUser(user: { id: string; token: string; expiresAt: string }): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getUser(): { id: string; token: string; expiresAt: string } | null {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    clearAuth(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.lastVerificationKey);
    }

    getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { 'X-Auth-Token': token } : {};
    }
}

export const authService = new AuthService();

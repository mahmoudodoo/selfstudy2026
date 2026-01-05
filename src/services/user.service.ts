import { apiService } from './api';
import { serviceRegistry } from './config';

export interface UserProfile {
    user_id?: string;
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    gender?: 'M' | 'F';
    image_url?: string;
    lab_url?: string;
    is_email_verified?: boolean;
}

export interface RegisterResponse {
    user_id: string;
    username: string;
    email: string;
    message: string;
}

export interface EmailVerificationRequest {
    email: string;
    user_id: string;
}

export interface EmailVerificationResponse {
    status: string;
}

export interface CheckUsernameResponse {
    available: boolean;
}

export interface CheckEmailResponse {
    available: boolean;
}

export interface PasswordCheckRequest {
    username: string;
    password: string;
}

export interface PasswordCheckResponse {
    valid: boolean;
    user_id?: string;
    email?: string;
    is_email_verified?: boolean;
}

class UserService {
    async register(userData: UserProfile): Promise<RegisterResponse> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.post<RegisterResponse>(
                baseUrl,
                '/profiles/',
                userData
            );
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async verifyEmail(request: EmailVerificationRequest): Promise<EmailVerificationResponse> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.post<EmailVerificationResponse>(
                baseUrl,
                `/verify/${request.user_id}/verify_email/`,
                { email: request.email, user_id: request.user_id }
            );
        } catch (error) {
            console.error('Email verification failed:', error);
            throw error;
        }
    }

    async checkUsername(username: string): Promise<CheckUsernameResponse> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.get<CheckUsernameResponse>(
                baseUrl,
                `/check-username/${username}/`
            );
        } catch (error) {
            console.error('Username check failed:', error);
            throw error;
        }
    }

    async checkEmail(email: string): Promise<CheckEmailResponse> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.get<CheckEmailResponse>(
                baseUrl,
                `/check-email/${email}/`
            );
        } catch (error) {
            console.error('Email check failed:', error);
            throw error;
        }
    }

    async checkPassword(credentials: PasswordCheckRequest): Promise<PasswordCheckResponse> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.post<PasswordCheckResponse>(
                baseUrl,
                '/check-password/',
                credentials
            );
        } catch (error) {
            console.error('Password check failed:', error);
            throw error;
        }
    }

    async getUserProfile(userId: string): Promise<UserProfile> {
        const baseUrl = await serviceRegistry.getRandomUserProfileReplica();
        if (!baseUrl) {
            throw new Error('No user profile service replicas available');
        }

        try {
            return await apiService.get<UserProfile>(
                baseUrl,
                `/profiles/${userId}/`
            );
        } catch (error) {
            console.error('Get user profile failed:', error);
            throw error;
        }
    }
}

export const userService = new UserService();

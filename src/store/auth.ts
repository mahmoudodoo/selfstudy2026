import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { otpService } from '@/services/otp.service';
import type { LoginRequest, LoginResponse } from '@/services/auth.service';
import type { UserProfile, RegisterResponse } from '@/services/user.service';
import type { OTPGenerationRequest, OTPVerificationRequest } from '@/services/otp.service';
import { serviceRegistry } from '@/services/config';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const token = ref<string | null>(null);
    const isAuthenticated = ref(false);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const requiresVerification = ref(false);
    const verificationData = ref<any>(null);

    // Initialize from localStorage
    const initAuth = () => {
        const storedUser = authService.getUser();
        const storedToken = authService.getToken();

        if (storedUser && storedToken) {
            user.value = storedUser;
            token.value = storedToken;
            isAuthenticated.value = true;
        }
    };

    // Check authentication status
    const checkAuth = async (): Promise<boolean> => {
        try {
            const authenticated = await authService.checkAndRefreshAuth();
            isAuthenticated.value = authenticated;

            if (!authenticated) {
                user.value = null;
                token.value = null;
            }

            return authenticated;
        } catch (err) {
            console.error('Auth check failed:', err);
            isAuthenticated.value = false;
            user.value = null;
            token.value = null;
            return false;
        }
    };

    // Login function
    const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
        loading.value = true;
        error.value = null;
        requiresVerification.value = false;
        verificationData.value = null;

        try {
            // Clear service registry cache to get fresh replicas
            serviceRegistry.clearCache();

            const response = await authService.login(credentials);

            // Handle verification required response
            if (response.requires_verification) {
                requiresVerification.value = true;
                verificationData.value = {
                    user_id: response.user_id,
                    verification_domain: response.verification_domain,
                    user_profile_domain: response.user_profile_domain,
                    username: credentials.username,
                };
                return response;
            }

            // Successful login
            user.value = {
                id: response.user_id,
                token: response.token,
                expiresAt: response.expires_at,
                username: response.username,
                email: response.email
            };
            token.value = response.token;
            isAuthenticated.value = true;

            return response;
        } catch (err: any) {
            error.value = err.message || 'Login failed';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Register function
    const register = async (userData: UserProfile): Promise<RegisterResponse> => {
        loading.value = true;
        error.value = null;

        try {
            // Clear service registry cache
            serviceRegistry.clearCache();

            const response = await userService.register(userData);

            // Set verification data for OTP
            requiresVerification.value = true;
            verificationData.value = {
                user_id: response.user_id,
                username: response.username,
                email: userData.email,
            };

            return response;
        } catch (err: any) {
            error.value = err.message || 'Registration failed';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Generate OTP
    const generateOTP = async (data: OTPGenerationRequest) => {
        loading.value = true;
        error.value = null;

        try {
            serviceRegistry.clearCache();
            return await otpService.generateOTP(data);
        } catch (err: any) {
            error.value = err.message || 'Failed to generate OTP';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Verify OTP
    const verifyOTP = async (data: OTPVerificationRequest) => {
        loading.value = true;
        error.value = null;

        try {
            serviceRegistry.clearCache();
            const response = await otpService.verifyOTP(data);

            if (response.email_verified) {
                requiresVerification.value = false;
                verificationData.value = null;

                // Auto-login after verification
                try {
                    const userData = await userService.getUserProfile(data.user_id);
                    if (userData.is_email_verified) {
                        // Get current token or validate
                        const currentToken = authService.getToken();
                        if (currentToken) {
                            await authService.validateToken(currentToken);
                        }
                    }
                } catch (loginErr) {
                    console.warn('Auto-login after verification failed:', loginErr);
                }
            }

            return response;
        } catch (err: any) {
            error.value = err.message || 'Failed to verify OTP';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Resend OTP
    const resendOTP = async (data: OTPGenerationRequest) => {
        loading.value = true;
        error.value = null;

        try {
            serviceRegistry.clearCache();
            return await otpService.resendOTP(data);
        } catch (err: any) {
            error.value = err.message || 'Failed to resend OTP';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Verify email directly
    const verifyEmail = async (user_id: string) => {
        loading.value = true;
        error.value = null;

        try {
            serviceRegistry.clearCache();
            const response = await userService.verifyEmail(user_id);

            if (response.email_verified) {
                requiresVerification.value = false;
                verificationData.value = null;
            }

            return response;
        } catch (err: any) {
            error.value = err.message || 'Failed to verify email';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = async () => {
        loading.value = true;
        error.value = null;

        try {
            const currentToken = token.value;
            if (currentToken) {
                await authService.logout(currentToken);
            }
        } catch (err) {
            console.warn('Logout API failed, clearing local auth anyway:', err);
        } finally {
            user.value = null;
            token.value = null;
            isAuthenticated.value = false;
            requiresVerification.value = false;
            verificationData.value = null;
            authService.clearAuth();
            loading.value = false;
        }
    };

    // Check username availability
    const checkUsername = async (username: string) => {
        try {
            return await userService.checkUsername(username);
        } catch (err: any) {
            error.value = err.message || 'Failed to check username';
            throw err;
        }
    };

    // Check email availability
    const checkEmail = async (email: string) => {
        try {
            return await userService.checkEmail(email);
        } catch (err: any) {
            error.value = err.message || 'Failed to check email';
            throw err;
        }
    };

    // Clear errors
    const clearError = () => {
        error.value = null;
    };

    return {
        // State
        user,
        token,
        isAuthenticated,
        loading,
        error,
        requiresVerification,
        verificationData,

        // Actions
        initAuth,
        checkAuth,
        login,
        register,
        generateOTP,
        verifyOTP,
        resendOTP,
        verifyEmail,
        logout,
        checkUsername,
        checkEmail,
        clearError,
    };
});

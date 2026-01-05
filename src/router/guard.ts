import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/verify-email'];

export async function authGuard(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): Promise<void> {
    const authStore = useAuthStore();

    // Initialize auth from localStorage
    authStore.initAuth();

    // Check if route is public
    const isPublicRoute = publicRoutes.includes(to.path);

    if (isPublicRoute) {
        // For public routes, just proceed
        next();
        return;
    }

    // For protected routes, check authentication
    try {
        const isAuthenticated = await authStore.checkAuth();

        if (isAuthenticated) {
            // Check if user needs email verification
            if (authStore.requiresVerification && to.path !== '/verify-email') {
                next('/verify-email');
                return;
            }

            next();
        } else {
            // Redirect to login if not authenticated
            next('/login');
        }
    } catch (error) {
        console.error('Auth guard error:', error);
        next('/login');
    }
}

// Route guard for login/register pages
export function publicOnlyGuard(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void {
    const authStore = useAuthStore();
    authStore.initAuth();

    if (authStore.isAuthenticated) {
        // If already authenticated, redirect to home
        next('/');
    } else {
        next();
    }
}

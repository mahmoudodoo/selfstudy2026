import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, publicOnlyGuard } from './guard';
import Home from '../views/Home.vue';
import Courses from '../views/Courses.vue';
import Progress from '../views/Progress.vue';
import Profile from '../views/Profile.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import VerifyEmail from '../views/VerifyEmail.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { title: 'Dashboard', requiresAuth: true }
    },
{
    path: '/courses',
    name: 'Courses',
    component: Courses,
    meta: { title: 'Courses', requiresAuth: true }
},
{
    path: '/progress',
    name: 'Progress',
    component: Progress,
    meta: { title: 'Learning Progress', requiresAuth: true }
},
{
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: 'Profile', requiresAuth: true }
},
{
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login', publicOnly: true }
},
{
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'Register', publicOnly: true }
},
{
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { title: 'Verify Email' }
},
{
    path: '/:catchAll(.*)',
    redirect: '/'
}
];

const router = createRouter({
    history: createWebHistory(),
                            routes
});

// Global navigation guards
router.beforeEach(async (to, from, next) => {
    // Update page title
    document.title = `${to.meta.title} | Self Study JO`;

    // Apply appropriate guard based on route meta
    if (to.meta.publicOnly) {
        publicOnlyGuard(to, from, next);
    } else if (to.meta.requiresAuth) {
        await authGuard(to, from, next);
    } else {
        next();
    }
});

export default router;

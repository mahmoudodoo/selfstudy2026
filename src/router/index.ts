import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Courses from '../views/Courses.vue'
import Progress from '../views/Progress.vue'
import Profile from '../views/Profile.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { title: 'Dashboard' }
    },
{
    path: '/courses',
    name: 'Courses',
    component: Courses,
    meta: { title: 'Courses' }
},
{
    path: '/progress',
    name: 'Progress',
    component: Progress,
    meta: { title: 'Learning Progress' }
},
{
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: 'Profile' }
}
]

const router = createRouter({
    history: createWebHistory(),
                            routes
})

// Update page title
router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | Self Study JO`
    next()
})

export default router

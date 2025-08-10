import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// 页面组件
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Medication from '../pages/Medication.vue'
import Game from '../pages/Game.vue'
import HealthData from '../pages/HealthData.vue'
import DoctorDashboard from '../pages/DoctorDashboard.vue'
import Profile from '../pages/Profile.vue'
import Family from '../pages/Family.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/medication',
    name: 'Medication',
    component: Medication,
    meta: { requiresAuth: true, roles: ['patient'] }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: { requiresAuth: true }
  },
  {
    path: '/health',
    name: 'Health',
    component: () => import('@/pages/Health.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor',
    name: 'Doctor',
    component: () => import('@/pages/Doctor.vue'),
    meta: { requiresAuth: true, requiresRole: 'doctor' }
  },
  {
    path: '/health-data',
    name: 'HealthData',
    component: HealthData,
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor-dashboard',
    name: 'DoctorDashboard',
    component: DoctorDashboard,
    meta: { requiresAuth: true, roles: ['doctor'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/family',
    name: 'Family',
    component: Family,
    meta: { requiresAuth: true, roles: ['family', 'patient'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // If the route requires authentication
  if (to.meta.requiresAuth) {
    // If the user is not authenticated in the store, try to check the session
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth();
    }

    // After checking, if the user is still not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    // Check for role-based authorization
    if (to.meta.roles && authStore.user) {
      const userRole = authStore.user.user_type;
      if (!to.meta.roles.includes(userRole)) {
        next(userRole === 'doctor' ? '/doctor-dashboard' : '/');
        return;
      }
    }
  } else {
    // If the route does not require auth (e.g., /login, /register)
    // If the user is already authenticated, redirect them to the home page
    if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      const userRole = authStore.user?.user_type;
      next(userRole === 'doctor' ? '/doctor-dashboard' : '/');
      return;
    }
  }

  // If all checks pass, proceed with the navigation
  next();
});

export default router
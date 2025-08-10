import { createRouter, createWebHistory } from 'vue-router'

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
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/medication',
    name: 'Medication',
    component: Medication,
    meta: { requiresAuth: true }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true, requiresRole: 'doctor' }
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
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
    next('/')
  } else {
    next()
  }
})

export default router
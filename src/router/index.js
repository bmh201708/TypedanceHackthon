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
    meta: { requiresAuth: true, roles: ['patient'] }
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
  const authStore = useAuthStore()
  
  // 如果需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    if (!authStore.isAuthenticated) {
      // 尝试从本地存储恢复认证状态
      await authStore.checkAuth()
    }
    
    // 如果仍未登录，重定向到登录页
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // 检查角色权限
    if (to.meta.roles && authStore.user) {
      const userRole = authStore.user.user_type
      if (!to.meta.roles.includes(userRole)) {
        // 权限不足，重定向到首页或相应页面
        if (userRole === 'doctor') {
          next('/doctor-dashboard')
        } else {
          next('/')
        }
        return
      }
    }
  } else {
    // 如果是登录或注册页面，但用户已登录，重定向到首页
    if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
      const userRole = authStore.user?.user_type
      if (userRole === 'doctor') {
        next('/doctor-dashboard')
      } else {
        next('/')
      }
      return
    }
  }
  
  next()
})

export default router
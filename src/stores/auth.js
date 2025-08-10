import { reactive, computed } from 'vue'
import { auth } from '../utils/supabase'

// 认证状态管理
const authState = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
})

// 从localStorage恢复状态
const savedAuth = localStorage.getItem('auth-storage')
if (savedAuth) {
  try {
    const parsed = JSON.parse(savedAuth)
    if (parsed.state) {
      Object.assign(authState, parsed.state)
    }
  } catch (e) {
    console.warn('Failed to parse saved auth state:', e)
  }
}

// 保存状态到localStorage
const saveState = () => {
  localStorage.setItem('auth-storage', JSON.stringify({
    state: {
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error
    }
  }))
}

export const useAuthStore = () => ({
  // 状态
  user: computed(() => authState.user),
  isAuthenticated: computed(() => authState.isAuthenticated),
  isLoading: computed(() => authState.isLoading),
  error: computed(() => authState.error),

  // 动作
  // 设置用户信息
  setUser: (user) => {
    authState.user = user
    authState.isAuthenticated = !!user
    authState.error = null
    saveState()
  },

  // 设置加载状态
  setLoading: (isLoading) => {
    authState.isLoading = isLoading
    saveState()
  },

  // 设置错误信息
  setError: (error) => {
    authState.error = error
    saveState()
  },

  // 清除错误
  clearError: () => {
    authState.error = null
    saveState()
  },

  // 用户注册
  signUp: async (formData) => {
    authState.isLoading = true
    authState.error = null
    saveState()
    
    try {
      const userData = {
        user_type: formData.userType,
        real_name: formData.name,
        phone: formData.phone,
        medical_history: formData.medicalHistory || {},
        certification: formData.certification || {}
      }

      const { data, error } = await auth.signUp(
        formData.email,
        formData.password,
        userData
      )

      if (error) {
        throw new Error(error.message)
      }

      // 注册成功，但需要邮箱验证
      authState.isLoading = false
      authState.error = null
      saveState()

      return { success: true, needsVerification: !data.session }
    } catch (error) {
      authState.isLoading = false
      authState.error = error.message || '注册失败，请重试'
      saveState()
      return { success: false, error: error.message }
    }
  },

  // 用户登录
  signIn: async (email, password) => {
    authState.isLoading = true
    authState.error = null
    saveState()
    
    try {
      const { data, error } = await auth.signIn(email, password)

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // 获取完整用户信息
        const { user: fullUser, error: userError } = await auth.getCurrentUser()
        
        if (userError) {
          throw new Error(userError.message)
        }

        authState.user = fullUser
        authState.isAuthenticated = true
        authState.isLoading = false
        authState.error = null
        saveState()

        return { success: true, user: fullUser }
      }
    } catch (error) {
      authState.isLoading = false
      authState.error = error.message || '登录失败，请检查邮箱和密码'
      saveState()
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    authState.isLoading = true;
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Supabase signOut error:', error);
    }

    // Clear local state
    authState.user = null;
    authState.isAuthenticated = false;
    authState.error = null;
    authState.isLoading = false;

    // Save the cleared state to localStorage
    saveState();

    // Also clear Supabase-specific items from localStorage
    localStorage.removeItem('supabase.auth.token');

    return { success: true };
  },

  // 检查认证状态
  checkAuth: async () => {
    authState.isLoading = true
    
    try {
      // 检查是否有本地保存的用户信息
      if (authState.user && authState.isAuthenticated) {
        authState.isLoading = false
        return { user: authState.user, isAuthenticated: true }
      }
      
      // 尝试从Supabase获取用户信息
      const { user, error } = await auth.getCurrentUser()
      
      if (error) {
        console.warn('Supabase认证检查失败:', error.message)
        // 不自动启用演示模式，返回未认证状态
        authState.user = null
        authState.isAuthenticated = false
        authState.isLoading = false
        authState.error = null
        saveState()
        
        return { user: null, isAuthenticated: false }
      }

      authState.user = user
      authState.isAuthenticated = !!user
      authState.isLoading = false
      authState.error = null
      saveState()

      return { user, isAuthenticated: !!user }
    } catch (error) {
      console.warn('认证检查失败:', error.message)
      // 不自动启用演示模式，返回未认证状态
      authState.user = null
      authState.isAuthenticated = false
      authState.isLoading = false
      authState.error = null
      saveState()
      
      return { user: null, isAuthenticated: false }
    }
  },

  // 演示模式登录
  demoLogin: async (userType = 'patient') => {
    authState.isLoading = true
    authState.error = null
    saveState()
    
    try {
      const demoUsers = {
        patient: {
          id: 'demo-patient-id',
          email: 'demo-patient@mediquest.com',
          real_name: '演示患者',
          user_type: 'patient',
          phone: '138****8888',
          created_at: new Date().toISOString()
        },
        doctor: {
          id: 'demo-doctor-id',
          email: 'demo-doctor@mediquest.com',
          real_name: '演示医生',
          user_type: 'doctor',
          phone: '139****9999',
          created_at: new Date().toISOString()
        },
        family: {
          id: 'demo-family-id',
          email: 'demo-family@mediquest.com',
          real_name: '演示家属',
          user_type: 'family',
          phone: '137****7777',
          created_at: new Date().toISOString()
        }
      }

      const demoUser = demoUsers[userType]
      if (!demoUser) {
        authState.isLoading = false
        authState.error = '无效的用户类型'
        saveState()
        return { success: false, error: '无效的用户类型' }
      }

      authState.user = demoUser
      authState.isAuthenticated = true
      authState.isLoading = false
      authState.error = null
      saveState()

      return { success: true, user: demoUser }
    } catch (error) {
      authState.isLoading = false
      authState.error = error.message || '演示登录失败'
      saveState()
      return { success: false, error: error.message }
    }
  },

  // 快速登录（演示用）
  quickLogin: async (userType = 'patient') => {
    const demoAccounts = {
      patient: {
        email: 'demo-patient@mediquest.com',
        password: 'demo123456'
      },
      doctor: {
        email: 'demo-doctor@mediquest.com',
        password: 'demo123456'
      },
      family: {
        email: 'demo-family@mediquest.com',
        password: 'demo123456'
      }
    }

    const account = demoAccounts[userType]
    if (!account) {
      authState.error = '无效的用户类型'
      saveState()
      return { success: false, error: '无效的用户类型' }
    }

    const store = useAuthStore()
    return await store.signIn(account.email, account.password)
  },

  // 获取用户角色权限
  getUserPermissions: () => {
    if (!authState.user) return []

    const permissions = {
      patient: ['view_medication', 'manage_health_data', 'play_games'],
      doctor: ['view_patients', 'manage_prescriptions', 'view_reports'],
      family: ['view_patient_data', 'receive_notifications'],
      pharmacist: ['verify_prescriptions', 'manage_inventory']
    }

    return permissions[authState.user.user_type] || []
  },

  // 检查用户权限
  hasPermission: (permission) => {
    const store = useAuthStore()
    const permissions = store.getUserPermissions()
    return permissions.includes(permission)
  },

  // 获取用户显示名称
  getUserDisplayName: () => {
    return authState.user?.real_name || authState.user?.email || '未知用户'
  },

  // 获取用户类型显示文本
  getUserTypeText: () => {
    const typeMap = {
      patient: '患者',
      doctor: '医生',
      family: '家属',
      pharmacist: '药师'
    }
    return typeMap[authState.user?.user_type] || '未知'
  }
})

// 认证守卫Hook
export const useAuthGuard = () => {
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  
  return {
    isAuthenticated,
    user,
    checkAuth,
    requireAuth: () => {
      if (!isAuthenticated) {
        throw new Error('需要登录才能访问此功能')
      }
    },
    requireRole: (requiredRole) => {
      if (!isAuthenticated) {
        throw new Error('需要登录才能访问此功能')
      }
      if (user?.user_type !== requiredRole) {
        throw new Error('权限不足，无法访问此功能')
      }
    }
  }
}
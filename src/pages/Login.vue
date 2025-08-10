<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-medical-blue to-tech-purple rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
          🏥
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">MediQuest</h1>
        <p class="text-gray-600">让用药变成一场有趣的冒险</p>
      </div>

      <!-- 登录表单 -->
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        label-width="0"
        size="large"
      >
        <!-- 用户类型选择 -->
        <div class="mb-6">
          <el-radio-group v-model="loginForm.userType" class="w-full">
            <div class="grid grid-cols-2 gap-2">
              <el-radio-button label="patient" class="flex-1">
                <div class="flex flex-col items-center py-2">
                  <span class="text-lg mb-1">👤</span>
                  <span>患者</span>
                </div>
              </el-radio-button>
              <el-radio-button label="doctor" class="flex-1">
                <div class="flex flex-col items-center py-2">
                  <span class="text-lg mb-1">👨‍⚕️</span>
                  <span>医生</span>
                </div>
              </el-radio-button>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <el-radio-button label="family" class="flex-1">
                <div class="flex flex-col items-center py-2">
                  <span class="text-lg mb-1">👨‍👩‍👧‍👦</span>
                  <span>家属</span>
                </div>
              </el-radio-button>
              <el-radio-button label="pharmacist" class="flex-1">
                <div class="flex flex-col items-center py-2">
                  <span class="text-lg mb-1">💊</span>
                  <span>药师</span>
                </div>
              </el-radio-button>
            </div>
          </el-radio-group>
        </div>

        <!-- 邮箱输入 -->
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            type="email"
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            type="password"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 记住我和忘记密码 -->
        <div class="flex justify-between items-center mb-6">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-button type="text" size="small">忘记密码？</el-button>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="w-full btn-medical"
            :loading="authStore.isLoading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div class="text-center">
          <span class="text-gray-600">还没有账号？</span>
          <el-button type="text" @click="$router.push('/register')">
            立即注册
          </el-button>
        </div>
      </el-form>

      <!-- 快速登录（演示用） -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-center text-sm text-gray-500 mb-4">演示账号快速登录</p>
        <div class="grid grid-cols-2 gap-2">
          <el-button size="small" @click="quickLogin('patient')">
            患者演示
          </el-button>
          <el-button size="small" @click="quickLogin('doctor')">
            医生演示
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserCheck, Stethoscope, Users, Pill } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive({
  userType: 'patient',
  email: '',
  password: '',
  remember: false
})

// 表单引用
const loginFormRef = ref(null)

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 用户类型选项
const userTypes = [
  { value: 'patient', label: '患者', icon: UserCheck, color: 'text-medical-blue' },
  { value: 'doctor', label: '医生', icon: Stethoscope, color: 'text-tech-purple' },
  { value: 'family', label: '家属', icon: Users, color: 'text-green-600' },
  { value: 'pharmacist', label: '药师', icon: Pill, color: 'text-orange-600' }
]

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    authStore.clearError()
    
    const result = await authStore.signIn(loginForm.email, loginForm.password)
    
    if (result.success) {
      ElMessage.success('登录成功！')
      
      // 根据用户类型跳转到不同页面
      const routeMap = {
        patient: '/',
        doctor: '/doctor-dashboard',
        family: '/family',
        pharmacist: '/'
      }
      
      router.push(routeMap[result.user.user_type] || '/')
    } else {
      ElMessage.error(result.error || '登录失败，请重试')
    }
    
  } catch (error) {
    ElMessage.error('登录失败，请重试')
  }
}

// 快速登录（演示用）
const quickLogin = async (userType) => {
  try {
    authStore.clearError()
    
    const result = await authStore.quickLogin(userType)
    
    if (result.success) {
      ElMessage.success(`${userTypes.find(t => t.value === userType)?.label}演示账号登录成功！`)
      
      // 根据用户类型跳转到不同页面
      const routeMap = {
        patient: '/',
        doctor: '/doctor-dashboard',
        family: '/family',
        pharmacist: '/'
      }
      
      router.push(routeMap[result.user.user_type] || '/')
    } else {
      ElMessage.error(result.error || '快速登录失败')
    }
  } catch (error) {
    ElMessage.error('快速登录失败，请重试')
  }
}

// 检查是否已登录
onMounted(async () => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2E86AB 0%, #A23B72 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

:deep(.el-radio-button__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #2E86AB;
  border-color: #2E86AB;
  color: white;
}

:deep(.el-input__inner) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
}
</style>
<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo和标题 -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-medical-blue to-tech-purple rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
          🏥
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1">注册 MediQuest</h1>
        <p class="text-gray-600 text-sm">开始您的智能用药之旅</p>
      </div>

      <!-- 注册表单 -->
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        label-width="0"
        size="large"
      >
        <!-- 用户类型选择 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择用户类型</label>
          <el-radio-group v-model="registerForm.userType" class="w-full">
            <div class="grid grid-cols-2 gap-2">
              <el-radio-button label="patient">
                <div class="flex flex-col items-center py-1">
                  <span class="text-base mb-1">👤</span>
                  <span class="text-sm">患者</span>
                </div>
              </el-radio-button>
              <el-radio-button label="doctor">
                <div class="flex flex-col items-center py-1">
                  <span class="text-base mb-1">👨‍⚕️</span>
                  <span class="text-sm">医生</span>
                </div>
              </el-radio-button>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <el-radio-button label="family">
                <div class="flex flex-col items-center py-1">
                  <span class="text-base mb-1">👨‍👩‍👧‍👦</span>
                  <span class="text-sm">家属</span>
                </div>
              </el-radio-button>
              <el-radio-button label="pharmacist">
                <div class="flex flex-col items-center py-1">
                  <span class="text-base mb-1">💊</span>
                  <span class="text-sm">药师</span>
                </div>
              </el-radio-button>
            </div>
          </el-radio-group>
        </div>

        <!-- 基本信息 -->
        <el-form-item prop="realName">
          <el-input
            v-model="registerForm.realName"
            placeholder="真实姓名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱地址"
            prefix-icon="Message"
            type="email"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="手机号码"
            prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="设置密码（至少6位）"
            prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            placeholder="确认密码"
            prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>

        <!-- 医生/药师认证信息 -->
        <div v-if="registerForm.userType === 'doctor' || registerForm.userType === 'pharmacist'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ registerForm.userType === 'doctor' ? '医师' : '药师' }}执业证书
          </label>
          <el-form-item prop="licenseNumber">
            <el-input
              v-model="registerForm.licenseNumber"
              placeholder="执业证书编号"
              prefix-icon="Document"
            />
          </el-form-item>
          <el-form-item prop="institution">
            <el-input
              v-model="registerForm.institution"
              placeholder="所属医疗机构"
              prefix-icon="OfficeBuilding"
            />
          </el-form-item>
        </div>

        <!-- 家属邀请码 -->
        <div v-if="registerForm.userType === 'family'" class="mb-4">
          <el-form-item prop="inviteCode">
            <el-input
              v-model="registerForm.inviteCode"
              placeholder="患者邀请码"
              prefix-icon="Key"
            />
          </el-form-item>
        </div>

        <!-- 协议同意 -->
        <el-form-item prop="agree">
          <el-checkbox v-model="registerForm.agree">
            我已阅读并同意
            <el-button type="text" size="small">《用户协议》</el-button>
            和
            <el-button type="text" size="small">《隐私政策》</el-button>
          </el-checkbox>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="w-full btn-medical"
            :loading="loading"
            @click="handleRegister"
          >
            注册账号
          </el-button>
        </el-form-item>

        <!-- 登录链接 -->
        <div class="text-center">
          <span class="text-gray-600 text-sm">已有账号？</span>
          <el-button type="text" size="small" @click="$router.push('/login')">
            立即登录
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const registerFormRef = ref()
    const loading = ref(false)
    
    // 表单数据
    const registerForm = reactive({
      userType: 'patient',
      realName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      licenseNumber: '',
      institution: '',
      inviteCode: '',
      agree: false
    })
    
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    // 表单验证规则
    const registerRules = computed(() => {
      const baseRules = {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        agree: [
          { 
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请同意用户协议和隐私政策'))
              } else {
                callback()
              }
            }, 
            trigger: 'change' 
          }
        ]
      }
      
      // 根据用户类型添加额外验证
      if (registerForm.userType === 'doctor' || registerForm.userType === 'pharmacist') {
        baseRules.licenseNumber = [
          { required: true, message: '请输入执业证书编号', trigger: 'blur' }
        ]
        baseRules.institution = [
          { required: true, message: '请输入所属医疗机构', trigger: 'blur' }
        ]
      }
      
      if (registerForm.userType === 'family') {
        baseRules.inviteCode = [
          { required: true, message: '请输入患者邀请码', trigger: 'blur' }
        ]
      }
      
      return baseRules
    })
    
    // 注册处理
    const handleRegister = async () => {
      if (!registerFormRef.value) return
      
      try {
        const valid = await registerFormRef.value.validate()
        if (!valid) return
        
        loading.value = true
        
        // 模拟注册API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        ElMessage.success('注册成功！请登录您的账号')
        router.push('/login')
        
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    return {
      registerFormRef,
      registerForm,
      registerRules,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2E86AB 0%, #A23B72 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

:deep(.el-radio-button__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  padding: 8px 12px;
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

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
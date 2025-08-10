<template>
  <div class="profile-container">
    <!-- 顶部导航 -->
    <header class="bg-medical-blue text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">个人中心</h1>
        <el-button type="text" @click="$router.go(-1)" class="text-white">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="p-4 space-y-6">
      <!-- 用户信息卡片 -->
      <div class="card-medical">
        <div class="flex items-center space-x-4 mb-4">
          <el-avatar :size="80" :src="userAvatar" />
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ user?.real_name || '用户' }}</h2>
            <p class="text-gray-600">{{ getUserTypeText(user?.user_type) }}</p>
            <p class="text-sm text-gray-500">{{ user?.email || 'demo@example.com' }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-medical-blue">{{ adherenceDays }}</div>
            <div class="text-sm text-gray-600">连续用药天数</div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-tech-purple">{{ completedTasks }}</div>
            <div class="text-sm text-gray-600">完成任务数</div>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="card-medical">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">功能设置</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="$router.push('/medication')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center text-white">
                💊
              </div>
              <span class="font-medium">用药管理</span>
            </div>
            <el-icon class="text-gray-400"><ArrowRight /></el-icon>
          </div>
          
          <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="$router.push('/health-data')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-health-orange rounded-lg flex items-center justify-center text-white">
                📊
              </div>
              <span class="font-medium">健康数据</span>
            </div>
            <el-icon class="text-gray-400"><ArrowRight /></el-icon>
          </div>
          
          <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="$router.push('/family')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-tech-purple rounded-lg flex items-center justify-center text-white">
                👨‍👩‍👧‍👦
              </div>
              <span class="font-medium">家庭关联</span>
            </div>
            <el-icon class="text-gray-400"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div class="card-medical">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">系统设置</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg">
            <span class="font-medium">推送通知</span>
            <el-switch v-model="notificationEnabled" />
          </div>
          
          <div class="flex items-center justify-between p-3 border rounded-lg">
            <span class="font-medium">声音提醒</span>
            <el-switch v-model="soundEnabled" />
          </div>
          
          <div class="flex items-center justify-between p-3 border rounded-lg">
            <span class="font-medium">深色模式</span>
            <el-switch v-model="darkMode" />
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="card-medical">
        <el-button type="danger" class="w-full" @click="handleLogout">
          退出登录
        </el-button>
      </div>
    </main>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
const notificationEnabled = ref(true)
const soundEnabled = ref(true)
const darkMode = ref(false)
const adherenceDays = ref(15)
const completedTasks = ref(42)

// 计算属性
const user = computed(() => authStore.user)

// 方法
const getUserTypeText = (userType) => {
  const typeMap = {
    'patient': '患者',
    'doctor': '医生',
    'family': '家属'
  }
  return typeMap[userType] || '用户'
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await authStore.signOut()
    if (result.success) {
      ElMessage.success('已退出登录')
      router.push('/login')
    } else {
      ElMessage.error('退出失败，请重试')
    }
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  // 模拟加载用户统计数据
  // 在实际应用中，这里会从API获取数据
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
}
</style>
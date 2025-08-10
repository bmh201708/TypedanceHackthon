<template>
  <div class="home-container min-h-screen">
    <!-- 加载状态 -->
    <LoadingSpinner :show="isLoading" text="正在加载数据..." />
    
    <!-- 状态栏 -->
    <div class="flex justify-between items-center p-4 text-sm text-gray-600">
      <span class="font-semibold">{{ currentTime }}</span>
      <div class="flex space-x-2">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
        </svg>
      </div>
    </div>

    <!-- 顶部导航 -->
    <header class="flex justify-between items-center p-4">
      <button class="rounded-full p-3 bg-white shadow-card">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gradient">MediQuest</h1>
        <p class="text-gray-500 text-sm">守护您的健康之旅</p>
      </div>
      <div class="flex items-center space-x-2">
        <el-badge v-if="isAuthenticated" :value="pendingMedications" class="item">
          <button class="rounded-full p-3 bg-white shadow-card" @click="$router.push('/medication')">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
          </button>
        </el-badge>
        <button 
          v-if="!isAuthenticated" 
          @click="$router.push('/login')"
          class="rounded-full p-3 bg-white shadow-card"
        >
          <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
        </button>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout"
          class="rounded-full p-3 bg-white shadow-card"
        >
          <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
        <el-dropdown v-if="isAuthenticated" @command="handleUserAction">
          <el-avatar :src="userAvatar" class="cursor-pointer shadow-card" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="switch-account" divided>切换账户</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="p-4 space-y-6">
      <!-- 宠物状态展示区 -->
      <div class="px-4 mb-6">
        <div class="card-modern relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -mr-16 -mt-16"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-800">我的小药丸</h2>
              <div class="status-indicator bg-green-100 text-green-800">
                等级 {{ petStatus?.level || 1 }}
              </div>
            </div>
            
            <div class="flex items-center space-x-6">
              <!-- 3D风格宠物形象 -->
              <div class="relative animate-float">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                  🐾
                </div>
                <div class="absolute -top-2 -right-2 bg-orange-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                  {{ petStatus?.level || 1 }}
                </div>
                <!-- 状态气泡 -->
                <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md">
                  <span class="text-xs font-medium text-gray-600">健康 {{ petStatus?.health || 100 }}%</span>
                </div>
              </div>
              
              <!-- 宠物状态条 -->
              <div class="flex-1 space-y-3">
                <!-- 健康值 -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">健康值</span>
                    <span class="text-sm font-bold text-red-500">{{ petStatus?.health || 100 }}/100</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-500" 
                         :style="{ width: `${petStatus?.health || 100}%` }"></div>
                  </div>
                </div>
                
                <!-- 能量值 -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">能量值</span>
                    <span class="text-sm font-bold text-orange-500">{{ petStatus?.energy || 100 }}/100</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500" 
                         :style="{ width: `${petStatus?.energy || 100}%` }"></div>
                  </div>
                </div>
                
                <!-- 经验值 -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">经验值</span>
                    <span class="text-sm font-bold text-purple-500">{{ petStatus?.experience || 0 }}/{{ nextLevelExp }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full transition-all duration-500" 
                         :style="{ width: `${((petStatus?.experience || 0) / nextLevelExp) * 100}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 游戏入口按钮 -->
            <div class="mt-4 text-center">
              <button 
                @click="$router.push('/game')"
                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                进入游戏
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日用药任务 -->
      <div class="card-modern">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">今日用药任务</h2>
          <span 
            :class="{
              'bg-green-100 text-green-800': completionRate >= 80,
              'bg-yellow-100 text-yellow-800': completionRate >= 60 && completionRate < 80,
              'bg-red-100 text-red-800': completionRate < 60
            }"
            class="status-indicator"
          >
            完成率 {{ completionRate }}%
          </span>
        </div>
        
        <div v-if="todayMedications.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-6xl mb-4 animate-pulse-slow">💊</div>
          <p class="text-lg font-medium mb-2">今日暂无用药任务</p>
          <p class="text-sm text-gray-400 mb-4">添加您的第一个用药提醒</p>
          <button 
            @click="$router.push('/medication')"
            class="btn-primary"
          >
            添加用药计划
          </button>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="medication in todayMedications" 
            :key="medication.id"
            class="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-200"
            :class="{
              'border-green-200 bg-gradient-to-r from-green-50 to-green-100': medication.status === 'taken',
              'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50': medication.status === 'pending',
              'border-red-200 bg-gradient-to-r from-red-50 to-pink-50': medication.status === 'missed'
            }"
          >
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-white text-2xl">💊</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-lg">{{ medication.name }}</h3>
                <p class="text-sm text-gray-600 font-medium">{{ medication.dosage }} | {{ medication.timing }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(medication.scheduledTime) }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <span 
                :class="{
                  'bg-green-100 text-green-800': medication.status === 'taken',
                  'bg-yellow-100 text-yellow-800': medication.status === 'pending',
                  'bg-red-100 text-red-800': medication.status === 'missed'
                }"
                class="status-indicator"
              >
                {{ getStatusText(medication.status) }}
              </span>
              <button 
                v-if="medication.status === 'pending'"
                @click="takeMedication(medication)"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                确认服药
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康进度概览 -->
      <div class="card-modern">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">健康进度概览</h2>
          <button 
            @click="$router.push('/health-data')"
            class="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors duration-200"
          >
            查看详情 →
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <!-- 用药依从性 -->
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ adherenceRate }}%</div>
            <div class="text-sm font-medium text-gray-700">用药依从性</div>
            <div class="text-xs text-gray-500 mt-1">本周平均</div>
          </div>
          
          <!-- 康复天数 -->
          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-1">{{ recoveryDays }}</div>
            <div class="text-sm font-medium text-gray-700">康复天数</div>
            <div class="text-xs text-gray-500 mt-1">持续治疗</div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { database } from '../utils/supabase'
import BottomNavigation from '../components/BottomNavigation.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isLoading = ref(true)
const petStatus = ref(null)
const todayMedications = ref([])
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
const adherenceRate = ref(0)
const recoveryDays = ref(0)
const currentTime = ref('')

// 计算属性
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const nextLevelExp = computed(() => {
  return petStatus.value ? petStatus.value.level * 100 : 100
})

const pendingMedications = computed(() => {
  return todayMedications.value.filter(med => med.status === 'pending').length
})

const completionRate = computed(() => {
  const total = todayMedications.value.length
  if (total === 0) return 100
  const completed = todayMedications.value.filter(med => med.status === 'taken').length
  return Math.round((completed / total) * 100)
})

// 方法
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const loadData = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true

    // 并行加载数据
    const [petResult, tasksResult] = await Promise.all([
      database.getPetStatus(user.value.id),
      database.getTodayMedicationTasks(user.value.id)
    ])

    if (petResult.data) {
      petStatus.value = petResult.data
    } else {
      // 如果没有宠物状态，创建默认状态
      const defaultPetStatus = {
        user_id: user.value.id,
        level: 1,
        health: 100,
        energy: 100,
        experience: 0,
        last_fed: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      const createResult = await database.updatePetStatus(user.value.id, defaultPetStatus)
      if (createResult.data) {
        petStatus.value = createResult.data
      }
    }

    if (tasksResult.data) {
      todayMedications.value = tasksResult.data
    }

    // 计算健康进度
    adherenceRate.value = completionRate.value
    recoveryDays.value = calculateRecoveryDays()

  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  } finally {
    isLoading.value = false
  }
}

const calculateRecoveryDays = () => {
  if (!user.value?.created_at) return 0
  const createdDate = new Date(user.value.created_at)
  const today = new Date()
  const diffTime = Math.abs(today - createdDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusType = (status) => {
  const statusMap = {
    'taken': 'success',
    'pending': 'warning',
    'missed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'taken': '已服用',
    'pending': '待服用',
    'missed': '已错过'
  }
  return statusMap[status] || '未知'
}

const takeMedication = async (medication) => {
  try {
    const result = await database.confirmMedication(medication.id, 'manual')
    
    if (result.data) {
      // 更新本地状态
      medication.status = 'taken'
      medication.actualTime = new Date().toISOString()
      
      ElMessage.success('服药成功！小药丸获得了能量！')
      
      // 更新宠物状态
      await updatePetStatus()
      
    } else {
      throw new Error(result.error?.message || '确认失败')
    }
  } catch (error) {
    console.error('确认用药失败:', error)
    ElMessage.error('确认用药失败，请重试')
  }
}

const updatePetStatus = async () => {
  if (!petStatus.value) return
  
  try {
    const updates = {
      experience: petStatus.value.experience + 20,
      health: Math.min(100, petStatus.value.health + 5),
      energy: Math.min(100, petStatus.value.energy + 10)
    }
    
    // 检查是否升级
    const nextExp = petStatus.value.level * 100
    if (updates.experience >= nextExp) {
      updates.level = petStatus.value.level + 1
      updates.experience = updates.experience - nextExp
      ElMessage.success(`恭喜！小药丸升级到 ${updates.level} 级！`)
    }
    
    const result = await database.updatePetStatus(user.value.id, updates)
    
    if (result.data) {
      petStatus.value = result.data
    }
  } catch (error) {
    console.error('更新宠物状态失败:', error)
  }
}

const handleLogout = async () => {
  try {
    console.log('开始退出登录，当前认证状态:', isAuthenticated.value)
    const result = await authStore.signOut()
    console.log('退出登录结果:', result)
    console.log('退出后认证状态:', isAuthenticated.value)
    
    if (result.success) {
      ElMessage.success('已退出登录')
      // 强制页面重新加载以确保状态完全重置
      window.location.reload()
    } else {
      ElMessage.error('退出失败，请重试')
    }
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出失败，请重试')
  }
}

const handleUserAction = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'switch-account':
      await handleLogout()
      break
  }
}

onMounted(async () => {
  // 更新时间
  updateTime()
  setInterval(updateTime, 1000)
  
  // 只在页面首次加载时检查认证状态，避免在退出登录后重新认证
  const hasLocalAuth = localStorage.getItem('auth-storage')
  
  if (!isAuthenticated.value && hasLocalAuth) {
    await authStore.checkAuth()
  }
  
  if (isAuthenticated.value) {
    await loadData()
  }
  // 移除自动跳转到登录页的逻辑，允许用户在首页看到登录按钮
})
</script>

<style scoped>
.home-container {
  background: linear-gradient(180deg, #f0f4f8 0%, #d8e6f3 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

.pet-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.medication-card {
  transition: all 0.3s ease;
}

.medication-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring circle {
  transition: stroke-dashoffset 0.5s ease;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 慢速脉冲动画 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

.router-link-active {
  color: #2E86AB !important;
}
</style>
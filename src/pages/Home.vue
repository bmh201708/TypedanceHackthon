<template>
  <div class="home-container">
    <!-- 加载状态 -->
    <LoadingSpinner :show="isLoading" text="正在加载数据..." />
    <!-- 顶部导航 -->
    <header class="bg-medical-blue text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">MediQuest</h1>
        <div class="flex items-center space-x-4">
          <el-badge :value="pendingMedications" class="item">
            <el-button type="primary" size="small" @click="$router.push('/medication')">
              用药管理
            </el-button>
          </el-badge>
          <el-avatar :src="userAvatar" @click="$router.push('/profile')" class="cursor-pointer" />
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="p-4 space-y-6">
      <!-- 宠物状态展示区 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">我的小药丸</h2>
          <el-button type="primary" size="small" @click="$router.push('/game')">
            进入游戏
          </el-button>
        </div>
        <div class="flex items-center space-x-6">
          <!-- 宠物形象 -->
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-tech-purple to-medical-blue rounded-full flex items-center justify-center text-white text-3xl">
              🐾
            </div>
            <div class="absolute -top-2 -right-2 bg-health-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {{ petStatus.level }}
            </div>
          </div>
          
          <!-- 宠物状态 -->
          <div class="flex-1">
            <div class="mb-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">健康值</span>
                <span class="text-sm font-semibold">{{ petStatus.health }}/100</span>
              </div>
              <el-progress :percentage="petStatus.health" color="#C73E1D" />
            </div>
            <div class="mb-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">能量值</span>
                <span class="text-sm font-semibold">{{ petStatus.energy }}/100</span>
              </div>
              <el-progress :percentage="petStatus.energy" color="#F18F01" />
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">经验值</span>
                <span class="text-sm font-semibold">{{ petStatus.experience }}/{{ nextLevelExp }}</span>
              </div>
              <el-progress :percentage="(petStatus.experience / nextLevelExp) * 100" color="#A23B72" />
            </div>
          </div>
        </div>
      </div>

      <!-- 今日用药任务 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">今日用药任务</h2>
          <el-tag :type="completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'danger'">
            完成率 {{ completionRate }}%
          </el-tag>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="medication in todayMedications" 
            :key="medication.id"
            class="flex items-center justify-between p-4 border rounded-lg"
            :class="{
              'border-green-200 bg-green-50': medication.status === 'taken',
              'border-orange-200 bg-orange-50': medication.status === 'pending',
              'border-red-200 bg-red-50': medication.status === 'missed'
            }"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center text-white text-xl">
                💊
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ medication.name }}</h3>
                <p class="text-sm text-gray-600">{{ medication.dosage }} | {{ medication.timing }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(medication.scheduledTime) }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <el-tag 
                :type="getStatusType(medication.status)" 
                size="small"
              >
                {{ getStatusText(medication.status) }}
              </el-tag>
              <el-button 
                v-if="medication.status === 'pending'"
                type="primary" 
                size="small"
                @click="takeMedication(medication)"
              >
                确认服药
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-if="todayMedications.length === 0" class="text-center py-8 text-gray-500">
          <p>今日暂无用药任务</p>
          <el-button type="primary" @click="$router.push('/medication')" class="mt-2">
            添加用药计划
          </el-button>
        </div>
      </div>

      <!-- 健康进度概览 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">健康进度</h2>
          <el-button type="text" @click="$router.push('/health-data')">
            查看详情 →
          </el-button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-medical-blue mb-1">{{ adherenceRate }}%</div>
            <div class="text-sm text-gray-600">用药依从性</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-tech-purple mb-1">{{ recoveryDays }}</div>
            <div class="text-sm text-gray-600">康复天数</div>
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

// 计算属性
const user = computed(() => authStore.user)

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

onMounted(async () => {
  // 检查认证状态
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
  
  if (authStore.isAuthenticated) {
    await loadData()
  } else {
    router.push('/login')
  }
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
}

.router-link-active {
  color: #2E86AB !important;
}
</style>
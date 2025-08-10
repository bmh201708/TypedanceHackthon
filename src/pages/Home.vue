<template>
  <div class="home-container">
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
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="flex justify-around py-2">
        <router-link to="/" class="flex flex-col items-center p-2 text-medical-blue">
          <span class="text-xl mb-1">🏠</span>
          <span class="text-xs">首页</span>
        </router-link>
        <router-link to="/medication" class="flex flex-col items-center p-2 text-gray-500">
          <span class="text-xl mb-1">💊</span>
          <span class="text-xs">用药</span>
        </router-link>
        <router-link to="/game" class="flex flex-col items-center p-2 text-gray-500">
          <span class="text-xl mb-1">🎮</span>
          <span class="text-xs">游戏</span>
        </router-link>
        <router-link to="/health-data" class="flex flex-col items-center p-2 text-gray-500">
          <span class="text-xl mb-1">📊</span>
          <span class="text-xs">数据</span>
        </router-link>
        <router-link to="/profile" class="flex flex-col items-center p-2 text-gray-500">
          <span class="text-xl mb-1">👤</span>
          <span class="text-xs">我的</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Home',
  setup() {
    // 响应式数据
    const petStatus = ref({
      level: 5,
      health: 85,
      energy: 70,
      experience: 320
    })
    
    const todayMedications = ref([
      {
        id: 1,
        name: '阿莫西林胶囊',
        dosage: '500mg',
        timing: '餐后服用',
        scheduledTime: '2024-01-15T08:00:00',
        status: 'taken'
      },
      {
        id: 2,
        name: '维生素C片',
        dosage: '100mg',
        timing: '餐后服用',
        scheduledTime: '2024-01-15T12:00:00',
        status: 'pending'
      },
      {
        id: 3,
        name: '钙片',
        dosage: '600mg',
        timing: '睡前服用',
        scheduledTime: '2024-01-15T21:00:00',
        status: 'pending'
      }
    ])
    
    const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
    const adherenceRate = ref(78)
    const recoveryDays = ref(45)
    
    // 计算属性
    const nextLevelExp = computed(() => petStatus.value.level * 100)
    
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
    
    const takeMedication = (medication) => {
      medication.status = 'taken'
      medication.actualTime = new Date().toISOString()
      
      // 增加宠物能量
      petStatus.value.energy = Math.min(100, petStatus.value.energy + 10)
      petStatus.value.experience += 20
      
      // 检查是否升级
      if (petStatus.value.experience >= nextLevelExp.value) {
        petStatus.value.level += 1
        petStatus.value.experience = 0
        ElMessage.success(`恭喜！小药丸升级到 ${petStatus.value.level} 级！`)
      } else {
        ElMessage.success('服药成功！小药丸获得了能量！')
      }
    }
    
    onMounted(() => {
      // 页面加载时的初始化逻辑
      console.log('首页加载完成')
    })
    
    return {
      petStatus,
      todayMedications,
      userAvatar,
      adherenceRate,
      recoveryDays,
      nextLevelExp,
      pendingMedications,
      completionRate,
      formatTime,
      getStatusType,
      getStatusText,
      takeMedication
    }
  }
}
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
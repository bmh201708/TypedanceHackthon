<template>
  <div class="health-data-container min-h-screen">
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

    <!-- 头部导航 -->
    <header class="flex justify-between items-center p-4 mb-6">
      <button @click="$router.go(-1)" class="rounded-full p-3 bg-white shadow-card">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gradient">健康数据</h1>
        <p class="text-gray-500 text-sm">追踪您的健康进展</p>
      </div>
      <button class="rounded-full p-3 bg-white shadow-card">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
    </header>

    <!-- 健康指标卡片 -->
    <div class="px-4 space-y-4">
      <!-- 用药依从性卡片 -->
      <div class="card-modern">
        <div class="flex justify-between">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <svg class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
              <h2 class="font-bold text-lg text-gray-800">用药依从性</h2>
            </div>
            <p class="text-gray-400 text-xs mb-2">{{ currentMonth }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-3xl font-bold text-blue-600">{{ adherenceRate }}%</span>
              <span class="bg-white rounded-lg p-1 shadow-sm">
                <svg class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <p class="text-gray-400 text-xs">较上月提升</p>
          </div>
          <div class="w-28 h-16 flex items-end">
            <!-- 迷你图表 -->
            <div v-for="(value, index) in adherenceChart" :key="index" 
                 class="w-3 bg-blue-300 rounded-t-sm mx-0.5 transition-all duration-300"
                 :style="{ height: `${value}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 康复进度卡片 -->
      <div class="card-modern">
        <div class="flex justify-between">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              <h2 class="font-bold text-lg text-gray-800">康复进度</h2>
            </div>
            <p class="text-gray-400 text-xs mb-2">{{ currentMonth }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-3xl font-bold text-green-600">{{ recoveryProgress }}%</span>
              <span class="bg-white rounded-lg p-1 shadow-sm">
                <svg class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <p class="text-gray-400 text-xs">持续改善</p>
          </div>
          <div class="w-28 h-16 flex items-end">
            <div v-for="(value, index) in recoveryChart" :key="index" 
                 class="w-3 bg-green-300 rounded-t-sm mx-0.5 transition-all duration-300"
                 :style="{ height: `${value}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 睡眠质量卡片 -->
      <div class="card-modern">
        <div class="flex justify-between">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <svg class="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <h2 class="font-bold text-lg text-gray-800">睡眠质量</h2>
            </div>
            <p class="text-gray-400 text-xs mb-2">{{ currentMonth }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-3xl font-bold text-purple-600">{{ sleepQuality }}%</span>
              <span class="bg-white rounded-lg p-1 shadow-sm">
                <svg class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <p class="text-gray-400 text-xs">质量提升</p>
          </div>
          <div class="w-28 h-16 flex items-end">
            <div v-for="(value, index) in sleepChart" :key="index" 
                 class="w-3 bg-purple-300 rounded-t-sm mx-0.5 transition-all duration-300"
                 :style="{ height: `${value}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 心情状态卡片 -->
      <div class="card-modern">
        <div class="flex justify-between">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <svg class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
              <h2 class="font-bold text-lg text-gray-800">心情状态</h2>
            </div>
            <p class="text-gray-400 text-xs mb-2">{{ currentMonth }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-3xl font-bold text-yellow-600">{{ moodScore }}%</span>
              <span class="bg-white rounded-lg p-1 shadow-sm">
                <svg class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <p class="text-gray-400 text-xs">情绪稳定</p>
          </div>
          <div class="w-28 h-16 flex items-end">
            <div v-for="(value, index) in moodChart" :key="index" 
                 class="w-3 bg-yellow-300 rounded-t-sm mx-0.5 transition-all duration-300"
                 :style="{ height: `${value}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 周进度总览 -->
      <div class="card-modern">
        <h2 class="font-bold text-lg text-gray-800 mb-4">本周进度总览</h2>
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div v-for="(day, index) in weekDays" :key="index" class="text-center">
            <div class="text-xs text-gray-500 mb-2">{{ day.name }}</div>
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
              :class="{
                'bg-blue-500 text-white': day.completed,
                'bg-gray-200 text-gray-500': !day.completed && day.date < today,
                'bg-blue-100 text-blue-600': !day.completed && day.date >= today
              }"
            >
              {{ day.date.getDate() }}
            </div>
            <div class="text-xs mt-1" :class="day.completed ? 'text-green-600' : 'text-gray-400'">
              {{ day.completed ? '✓' : '-' }}
            </div>
          </div>
        </div>
        <div class="bg-gray-100 rounded-full h-2 mb-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${weekProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 text-center">本周完成率: {{ weekProgress }}%</p>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BottomNavigation from '../components/BottomNavigation.vue'

// 响应式数据
const currentTime = ref('')
const adherenceRate = ref(85)
const recoveryProgress = ref(72)
const sleepQuality = ref(68)
const moodScore = ref(78)
const today = ref(new Date())

// 图表数据
const adherenceChart = ref([20, 35, 50, 40, 70, 60, 85])
const recoveryChart = ref([15, 25, 40, 30, 50, 65, 72])
const sleepChart = ref([30, 45, 35, 60, 55, 70, 68])
const moodChart = ref([40, 50, 45, 65, 70, 75, 78])

// 周进度数据
const weekDays = ref([])

// 计算属性
const currentMonth = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

const weekProgress = computed(() => {
  const completedDays = weekDays.value.filter(day => day.completed).length
  return Math.round((completedDays / 7) * 100)
})

// 生命周期
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  generateWeekDays()
})

// 方法
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const generateWeekDays = () => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const currentDate = new Date()
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
  
  weekDays.value = days.map((name, index) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)
    return {
      name,
      date,
      completed: Math.random() > 0.3 // 模拟完成状态
    }
  })
}
</script>

<style scoped>
.health-data-container {
  background: linear-gradient(180deg, #f0f4f8 0%, #d8e6f3 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}
</style>
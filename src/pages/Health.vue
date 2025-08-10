<template>
  <div class="health-container min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <!-- 顶部导航 -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold text-tech-purple">健康数据</h1>
      <div class="flex items-center space-x-2">
        <button 
          @click="refreshData"
          class="text-gray-600 hover:text-purple-600 transition-colors"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
        <button 
          @click="exportReport"
          class="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors"
        >
          导出报告
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="isLoading" />

    <div v-else class="p-4 space-y-6">
      <!-- 健康概览卡片 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">健康概览</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ completionRate }}%</div>
            <div class="text-sm text-gray-600">服药依从性</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ recoveryDays }}</div>
            <div class="text-sm text-gray-600">康复天数</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ totalMedications }}</div>
            <div class="text-sm text-gray-600">总服药次数</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ petLevel }}</div>
            <div class="text-sm text-gray-600">宠物等级</div>
          </div>
        </div>
      </div>

      <!-- 服药趋势图表 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">服药趋势</h2>
        
        <!-- 时间范围选择 -->
        <div class="flex space-x-2 mb-4">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            :class="selectedPeriod === period.value 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ period.label }}
          </button>
        </div>
        
        <!-- 图表容器 -->
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div v-if="chartData.length === 0" class="text-gray-500">
            暂无数据
          </div>
          <div v-else class="w-full h-full p-4">
            <!-- 简化的图表展示 -->
            <div class="flex items-end justify-between h-full space-x-1">
              <div 
                v-for="(data, index) in chartData" 
                :key="index"
                class="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t transition-all duration-300 hover:from-purple-600 hover:to-purple-400"
                :style="{ height: `${(data.value / maxChartValue) * 100}%` }"
                :title="`${data.date}: ${data.value}次`"
              ></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span v-for="(data, index) in chartData" :key="index">
                {{ formatChartDate(data.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康指标 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">健康指标</h2>
        
        <div class="space-y-4">
          <div 
            v-for="indicator in healthIndicators" 
            :key="indicator.name"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="text-xl">{{ indicator.icon }}</div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ indicator.name }}</h3>
                <p class="text-sm text-gray-600">{{ indicator.description }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold" :class="getIndicatorColor(indicator.status)">
                {{ indicator.value }}
              </div>
              <div class="text-xs text-gray-500">{{ indicator.unit }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 康复报告 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">康复报告</h2>
        
        <div class="space-y-4">
          <!-- 康复进度 -->
          <div class="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">康复进度</h3>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${recoveryProgress}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>康复进度</span>
              <span>{{ recoveryProgress }}%</span>
            </div>
          </div>
          
          <!-- 康复建议 -->
          <div class="p-4 bg-yellow-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">康复建议</h3>
            <ul class="space-y-1 text-sm text-gray-600">
              <li v-for="suggestion in recoverySuggestions" :key="suggestion" class="flex items-start space-x-2">
                <span class="text-yellow-500 mt-0.5">•</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
          </div>
          
          <!-- 医生评价 -->
          <div class="p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">医生评价</h3>
            <p class="text-sm text-gray-600">{{ doctorEvaluation }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <div class="flex space-x-1">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  class="fas fa-star text-sm"
                  :class="star <= doctorRating ? 'text-yellow-400' : 'text-gray-300'"
                ></i>
              </div>
              <span class="text-xs text-gray-500">{{ doctorRating }}/5</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">历史记录</h2>
        
        <div class="space-y-3">
          <div 
            v-for="record in healthRecords" 
            :key="record.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="text-lg">{{ record.icon }}</div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ record.title }}</h3>
                <p class="text-sm text-gray-600">{{ record.description }}</p>
                <div class="text-xs text-gray-500">{{ formatDate(record.date) }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold" :class="getRecordColor(record.type)">
                {{ record.value }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="healthRecords.length === 0" class="text-center text-gray-500 py-8">
          暂无健康记录
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { toast } from 'vue-sonner'

export default {
  name: 'Health',
  components: {
    LoadingSpinner,
    BottomNavigation
  },
  setup() {
    const authStore = useAuthStore()
    const isLoading = ref(true)
    const selectedPeriod = ref('week')
    
    const healthData = ref({
      completionRate: 85,
      recoveryDays: 12,
      totalMedications: 156,
      petLevel: 5
    })
    
    const chartData = ref([
      { date: '2024-01-15', value: 8 },
      { date: '2024-01-16', value: 6 },
      { date: '2024-01-17', value: 9 },
      { date: '2024-01-18', value: 7 },
      { date: '2024-01-19', value: 8 },
      { date: '2024-01-20', value: 5 },
      { date: '2024-01-21', value: 9 }
    ])
    
    const healthRecords = ref([
      {
        id: 1,
        title: '血压测量',
        description: '收缩压/舒张压正常',
        icon: '🩺',
        value: '120/80',
        type: 'normal',
        date: new Date('2024-01-21')
      },
      {
        id: 2,
        title: '体温记录',
        description: '体温略高，需要注意',
        icon: '🌡️',
        value: '37.2°C',
        type: 'warning',
        date: new Date('2024-01-20')
      },
      {
        id: 3,
        title: '服药记录',
        description: '按时服用阿莫西林',
        icon: '💊',
        value: '已完成',
        type: 'success',
        date: new Date('2024-01-20')
      }
    ])

    const user = computed(() => authStore.user)
    const completionRate = computed(() => healthData.value.completionRate)
    const recoveryDays = computed(() => healthData.value.recoveryDays)
    const totalMedications = computed(() => healthData.value.totalMedications)
    const petLevel = computed(() => healthData.value.petLevel)
    const maxChartValue = computed(() => Math.max(...chartData.value.map(d => d.value)))
    const recoveryProgress = computed(() => Math.min(100, (recoveryDays.value / 30) * 100))

    // 时间周期选项
    const timePeriods = ref([
      { label: '7天', value: 'week' },
      { label: '30天', value: 'month' },
      { label: '90天', value: 'quarter' }
    ])

    // 健康指标
    const healthIndicators = ref([
      {
        name: '血压',
        description: '收缩压/舒张压',
        icon: '🩺',
        value: '120/80',
        unit: 'mmHg',
        status: 'normal'
      },
      {
        name: '心率',
        description: '静息心率',
        icon: '❤️',
        value: '72',
        unit: 'bpm',
        status: 'normal'
      },
      {
        name: '体温',
        description: '当前体温',
        icon: '🌡️',
        value: '36.8',
        unit: '°C',
        status: 'normal'
      },
      {
        name: '血糖',
        description: '空腹血糖',
        icon: '🩸',
        value: '5.2',
        unit: 'mmol/L',
        status: 'normal'
      }
    ])

    // 康复建议
    const recoverySuggestions = ref([
      '继续按时服药，保持良好的服药依从性',
      '适当进行轻度运动，如散步或瑜伽',
      '保持充足的睡眠，每天7-8小时',
      '饮食清淡，多吃蔬菜水果',
      '定期复查，监测康复进度'
    ])

    // 医生评价
    const doctorEvaluation = ref('患者康复情况良好，服药依从性较高，建议继续当前治疗方案。')
    const doctorRating = ref(4)

    // 获取指标颜色
    const getIndicatorColor = (status) => {
      switch (status) {
        case 'normal': return 'text-green-600'
        case 'warning': return 'text-yellow-600'
        case 'danger': return 'text-red-600'
        default: return 'text-gray-600'
      }
    }

    // 获取记录颜色
    const getRecordColor = (type) => {
      switch (type) {
        case 'success': return 'text-green-600'
        case 'warning': return 'text-yellow-600'
        case 'danger': return 'text-red-600'
        default: return 'text-gray-600'
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    // 格式化图表日期
    const formatChartDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    // 加载数据
    const loadData = async () => {
      try {
        isLoading.value = true
        
        // 获取健康数据
        const { data: healthDataResult, error: healthError } = await supabase.getHealthData(user.value.id)
        if (healthError) throw healthError
        
        if (healthDataResult && healthDataResult.length > 0) {
          // 处理健康数据
          const latestData = healthDataResult[healthDataResult.length - 1]
          healthData.value = {
            completionRate: latestData.completion_rate || 85,
            recoveryDays: latestData.recovery_days || 12,
            totalMedications: latestData.total_medications || 156,
            petLevel: latestData.pet_level || 5
          }
        }
        
        // 获取用药记录用于图表
        const { data: medicationLogs, error: logsError } = await supabase.getMedicationLogs(user.value.id)
        if (logsError) throw logsError
        
        if (medicationLogs && medicationLogs.length > 0) {
          // 处理图表数据
          const groupedData = {}
          medicationLogs.forEach(log => {
            const date = log.taken_at.split('T')[0]
            groupedData[date] = (groupedData[date] || 0) + 1
          })
          
          chartData.value = Object.entries(groupedData)
            .slice(-7) // 最近7天
            .map(([date, value]) => ({ date, value }))
        }
        
      } catch (error) {
        console.error('加载健康数据失败:', error)
        toast.error('加载健康数据失败')
      } finally {
        isLoading.value = false
      }
    }

    // 刷新数据
    const refreshData = async () => {
      await loadData()
      toast.success('数据已刷新')
    }

    // 导出报告
    const exportReport = () => {
      const reportData = {
        user: user.value.email,
        date: new Date().toISOString().split('T')[0],
        completionRate: completionRate.value,
        recoveryDays: recoveryDays.value,
        totalMedications: totalMedications.value,
        petLevel: petLevel.value,
        healthIndicators: healthIndicators.value,
        recoverySuggestions: recoverySuggestions.value,
        doctorEvaluation: doctorEvaluation.value,
        doctorRating: doctorRating.value
      }
      
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `健康报告_${reportData.date}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('报告已导出')
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        authStore.router.push('/login')
        return
      }
      loadData()
    })

    return {
      isLoading,
      selectedPeriod,
      healthData,
      chartData,
      healthRecords,
      user,
      completionRate,
      recoveryDays,
      totalMedications,
      petLevel,
      maxChartValue,
      recoveryProgress,
      timePeriods,
      healthIndicators,
      recoverySuggestions,
      doctorEvaluation,
      doctorRating,
      getIndicatorColor,
      getRecordColor,
      formatDate,
      formatChartDate,
      refreshData,
      exportReport
    }
  }
}
</script>
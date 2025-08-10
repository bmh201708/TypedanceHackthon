<template>
  <div class="doctor-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 顶部导航 -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold text-tech-purple">医生工作台</h1>
      <div class="flex items-center space-x-2">
        <div class="text-sm text-gray-600">Dr. {{ user?.user_metadata?.name || user?.email }}</div>
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {{ (user?.user_metadata?.name || user?.email || 'D').charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="isLoading" />

    <div v-else class="p-4 space-y-6">
      <!-- 统计概览 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalPatients }}</div>
          <div class="text-sm text-gray-600">管理患者</div>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ todayTasks }}</div>
          <div class="text-sm text-gray-600">今日任务</div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">快速操作</h2>
        
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="showAddPatient = true"
            class="bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-user-plus"></i>
            <span>添加患者</span>
          </button>
          <button 
            @click="showCreatePlan = true"
            class="bg-green-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-prescription-bottle-alt"></i>
            <span>创建用药计划</span>
          </button>
          <button 
            @click="showPatientReports = true"
            class="bg-purple-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-chart-line"></i>
            <span>查看报告</span>
          </button>
          <button 
            @click="showFamilyManagement = true"
            class="bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="fas fa-users"></i>
            <span>家属管理</span>
          </button>
        </div>
      </div>

      <!-- 患者列表 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">我的患者</h2>
          <div class="flex items-center space-x-2">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="搜索患者..."
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
            <button 
              @click="loadPatients"
              class="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="patient in filteredPatients" 
            :key="patient.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
            @click="selectPatient(patient)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {{ patient.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ patient.name }}</h3>
                  <p class="text-sm text-gray-600">{{ patient.email }}</p>
                  <div class="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>年龄: {{ patient.age }}岁</span>
                    <span>性别: {{ patient.gender }}</span>
                    <span>状态: {{ getPatientStatus(patient.status) }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold" :class="getStatusColor(patient.status)">
                  {{ getPatientStatus(patient.status) }}
                </div>
                <div class="text-xs text-gray-500">{{ formatDate(patient.last_visit) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredPatients.length === 0" class="text-center text-gray-500 py-8">
          {{ searchQuery ? '未找到匹配的患者' : '暂无患者' }}
        </div>
      </div>

      <!-- 今日任务 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">今日任务</h2>
        
        <div class="space-y-3">
          <div 
            v-for="task in todayTasksList" 
            :key="task.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            :class="{ 'bg-green-50 border-green-300': task.completed }"
          >
            <div class="flex items-center space-x-3">
              <div class="text-lg">{{ task.icon }}</div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ task.title }}</h3>
                <p class="text-sm text-gray-600">{{ task.description }}</p>
                <div class="text-xs text-gray-500">{{ task.time }}</div>
              </div>
            </div>
            <button 
              @click="toggleTask(task)"
              class="text-sm px-3 py-1 rounded-lg transition-colors"
              :class="task.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
            >
              {{ task.completed ? '已完成' : '标记完成' }}
            </button>
          </div>
        </div>
        
        <div v-if="todayTasksList.length === 0" class="text-center text-gray-500 py-8">
          今日暂无任务
        </div>
      </div>
    </div>

    <!-- 添加患者弹窗 -->
    <div v-if="showAddPatient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加患者</h3>
        
        <form @submit.prevent="addPatient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">患者姓名</label>
            <input 
              v-model="newPatient.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <input 
              v-model="newPatient.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              <input 
                v-model="newPatient.age"
                type="number"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select 
                v-model="newPatient.gender"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">诊断</label>
            <textarea 
              v-model="newPatient.diagnosis"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
          
          <div class="flex space-x-3">
            <button 
              type="submit"
              class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              添加患者
            </button>
            <button 
              type="button"
              @click="showAddPatient = false"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 家属管理弹窗 -->
    <div v-if="showFamilyManagement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-96 overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 mb-4">家属关联管理</h3>
        
        <div class="space-y-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-800 mb-2">添加家属关联</h4>
            <form @submit.prevent="addFamilyRelation" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">患者</label>
                <select 
                  v-model="newFamilyRelation.patientId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">请选择患者</option>
                  <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                    {{ patient.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">家属邮箱</label>
                <input 
                  v-model="newFamilyRelation.familyEmail"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">关系</label>
                <select 
                  v-model="newFamilyRelation.relationship"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">请选择关系</option>
                  <option value="parent">父母</option>
                  <option value="spouse">配偶</option>
                  <option value="child">子女</option>
                  <option value="sibling">兄弟姐妹</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <button 
                type="submit"
                class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                添加关联
              </button>
            </form>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-800 mb-2">现有关联</h4>
            <div class="space-y-2">
              <div 
                v-for="relation in familyRelations" 
                :key="relation.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div class="text-sm">
                  <span class="font-medium">{{ relation.patient_name }}</span>
                  <span class="text-gray-500"> - {{ relation.family_email }}</span>
                  <span class="text-gray-400">({{ getRelationshipText(relation.relationship) }})</span>
                </div>
                <button 
                  @click="removeFamilyRelation(relation.id)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div v-if="familyRelations.length === 0" class="text-center text-gray-500 py-4">
              暂无家属关联
            </div>
          </div>
        </div>
        
        <button 
          @click="showFamilyManagement = false"
          class="w-full mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
        >
          关闭
        </button>
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
  name: 'Doctor',
  components: {
    LoadingSpinner,
    BottomNavigation
  },
  setup() {
    const authStore = useAuthStore()
    const isLoading = ref(true)
    const searchQuery = ref('')
    const showAddPatient = ref(false)
    const showCreatePlan = ref(false)
    const showPatientReports = ref(false)
    const showFamilyManagement = ref(false)
    
    const patients = ref([])
    const familyRelations = ref([])
    const todayTasksList = ref([
      {
        id: 1,
        title: '查看患者报告',
        description: '审查3位患者的康复进度报告',
        icon: '📊',
        time: '09:00',
        completed: false
      },
      {
        id: 2,
        title: '调整用药方案',
        description: '为张三调整用药剂量',
        icon: '💊',
        time: '10:30',
        completed: false
      },
      {
        id: 3,
        title: '家属沟通',
        description: '与李四家属讨论治疗进展',
        icon: '👨‍👩‍👧‍👦',
        time: '14:00',
        completed: true
      }
    ])
    
    const newPatient = ref({
      name: '',
      email: '',
      age: '',
      gender: '',
      diagnosis: ''
    })
    
    const newFamilyRelation = ref({
      patientId: '',
      familyEmail: '',
      relationship: ''
    })

    const user = computed(() => authStore.user)
    const totalPatients = computed(() => patients.value.length)
    const todayTasks = computed(() => todayTasksList.value.filter(task => !task.completed).length)
    
    const filteredPatients = computed(() => {
      if (!searchQuery.value) return patients.value
      return patients.value.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    // 获取患者状态文本
    const getPatientStatus = (status) => {
      const statusMap = {
        active: '治疗中',
        recovered: '已康复',
        inactive: '暂停治疗'
      }
      return statusMap[status] || '未知'
    }

    // 获取状态颜色
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'text-blue-600'
        case 'recovered': return 'text-green-600'
        case 'inactive': return 'text-gray-600'
        default: return 'text-gray-600'
      }
    }

    // 获取关系文本
    const getRelationshipText = (relationship) => {
      const relationshipMap = {
        parent: '父母',
        spouse: '配偶',
        child: '子女',
        sibling: '兄弟姐妹',
        other: '其他'
      }
      return relationshipMap[relationship] || '未知'
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未知'
      return new Intl.DateTimeFormat('zh-CN', {
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    }

    // 加载患者数据
    const loadPatients = async () => {
      try {
        // 模拟患者数据，实际应该从数据库获取
        patients.value = [
          {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            age: 45,
            gender: 'male',
            status: 'active',
            diagnosis: '高血压',
            last_visit: '2024-01-20'
          },
          {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            age: 38,
            gender: 'female',
            status: 'active',
            diagnosis: '糖尿病',
            last_visit: '2024-01-19'
          },
          {
            id: 3,
            name: '王五',
            email: 'wangwu@example.com',
            age: 52,
            gender: 'male',
            status: 'recovered',
            diagnosis: '感冒',
            last_visit: '2024-01-15'
          }
        ]
      } catch (error) {
        console.error('加载患者数据失败:', error)
        toast.error('加载患者数据失败')
      }
    }

    // 加载家属关联数据
    const loadFamilyRelations = async () => {
      try {
        const { data, error } = await supabase.getFamily(user.value.id)
        if (error) throw error
        
        familyRelations.value = data || []
      } catch (error) {
        console.error('加载家属关联失败:', error)
        toast.error('加载家属关联失败')
      }
    }

    // 加载数据
    const loadData = async () => {
      try {
        isLoading.value = true
        await Promise.all([
          loadPatients(),
          loadFamilyRelations()
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败')
      } finally {
        isLoading.value = false
      }
    }

    // 选择患者
    const selectPatient = (patient) => {
      toast.info(`已选择患者: ${patient.name}`)
      // 这里可以跳转到患者详情页面或显示患者详情
    }

    // 切换任务状态
    const toggleTask = (task) => {
      task.completed = !task.completed
      toast.success(task.completed ? '任务已完成' : '任务已重置')
    }

    // 添加患者
    const addPatient = async () => {
      try {
        // 这里应该调用实际的API来添加患者
        const newPatientData = {
          id: Date.now(),
          ...newPatient.value,
          status: 'active',
          last_visit: new Date().toISOString().split('T')[0]
        }
        
        patients.value.push(newPatientData)
        
        // 重置表单
        newPatient.value = {
          name: '',
          email: '',
          age: '',
          gender: '',
          diagnosis: ''
        }
        
        showAddPatient.value = false
        toast.success('患者添加成功')
      } catch (error) {
        console.error('添加患者失败:', error)
        toast.error('添加患者失败')
      }
    }

    // 添加家属关联
    const addFamilyRelation = async () => {
      try {
        const selectedPatient = patients.value.find(p => p.id == newFamilyRelation.value.patientId)
        if (!selectedPatient) {
          toast.error('请选择患者')
          return
        }
        
        const relationData = {
          id: Date.now(),
          patient_id: newFamilyRelation.value.patientId,
          patient_name: selectedPatient.name,
          family_email: newFamilyRelation.value.familyEmail,
          relationship: newFamilyRelation.value.relationship,
          created_at: new Date().toISOString()
        }
        
        familyRelations.value.push(relationData)
        
        // 重置表单
        newFamilyRelation.value = {
          patientId: '',
          familyEmail: '',
          relationship: ''
        }
        
        toast.success('家属关联添加成功')
      } catch (error) {
        console.error('添加家属关联失败:', error)
        toast.error('添加家属关联失败')
      }
    }

    // 删除家属关联
    const removeFamilyRelation = async (relationId) => {
      try {
        familyRelations.value = familyRelations.value.filter(r => r.id !== relationId)
        toast.success('家属关联已删除')
      } catch (error) {
        console.error('删除家属关联失败:', error)
        toast.error('删除家属关联失败')
      }
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        authStore.router.push('/login')
        return
      }
      
      // 检查用户角色
      if (authStore.userRole !== 'doctor') {
        toast.error('您没有访问医生工作台的权限')
        authStore.router.push('/')
        return
      }
      
      loadData()
    })

    return {
      isLoading,
      searchQuery,
      showAddPatient,
      showCreatePlan,
      showPatientReports,
      showFamilyManagement,
      patients,
      familyRelations,
      todayTasksList,
      newPatient,
      newFamilyRelation,
      user,
      totalPatients,
      todayTasks,
      filteredPatients,
      getPatientStatus,
      getStatusColor,
      getRelationshipText,
      formatDate,
      loadPatients,
      selectPatient,
      toggleTask,
      addPatient,
      addFamilyRelation,
      removeFamilyRelation
    }
  }
}
</script>
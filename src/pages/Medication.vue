<template>
  <div class="medication-container">
    <!-- 加载状态 -->
    <LoadingSpinner :show="isLoading" text="正在加载用药数据..." />
    
    <!-- 顶部导航 -->
    <header class="bg-medical-blue text-white p-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <el-button 
            type="text" 
            @click="$router.back()" 
            class="text-white p-0"
          >
            <ArrowLeft class="w-6 h-6" />
          </el-button>
          <h1 class="text-xl font-bold">用药管理</h1>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          @click="showAddMedicationDialog = true"
        >
          添加用药
        </el-button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="p-4 space-y-6">
      <!-- AI用药顾问 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">🤖</span>
            AI用药顾问
          </h2>
          <el-button type="text" @click="showAIChat = !showAIChat">
            {{ showAIChat ? '收起' : '展开' }}
          </el-button>
        </div>
        
        <div v-if="showAIChat" class="space-y-3">
          <!-- AI建议卡片 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700 mb-2">{{ aiSuggestion }}</p>
                <div class="flex space-x-2">
                  <el-button size="small" type="primary" @click="acceptAISuggestion">
                    采纳建议
                  </el-button>
                  <el-button size="small" @click="getNewSuggestion">
                    换个建议
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 快速咨询 -->
          <div class="flex space-x-2">
            <el-input 
              v-model="userQuestion" 
              placeholder="向AI顾问提问..." 
              @keyup.enter="askAI"
            />
            <el-button type="primary" @click="askAI" :loading="isAskingAI">
              提问
            </el-button>
          </div>
        </div>
      </div>

      <!-- 用药时间表 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">📅</span>
            用药时间表
          </h2>
          <div class="flex space-x-2">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              size="small"
              @change="loadMedicationSchedule"
            />
          </div>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="schedule in medicationSchedule" 
            :key="schedule.id"
            class="flex items-center justify-between p-4 border rounded-lg"
            :class="{
              'border-green-200 bg-green-50': schedule.status === 'taken',
              'border-orange-200 bg-orange-50': schedule.status === 'pending',
              'border-red-200 bg-red-50': schedule.status === 'missed'
            }"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center text-white text-xl">
                💊
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ schedule.medication_name }}</h3>
                <p class="text-sm text-gray-600">{{ schedule.dosage }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(schedule.scheduled_time) }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <el-tag 
                :type="getStatusType(schedule.status)" 
                size="small"
              >
                {{ getStatusText(schedule.status) }}
              </el-tag>
              <el-button 
                v-if="schedule.status === 'pending'"
                type="primary" 
                size="small"
                @click="confirmMedication(schedule)"
              >
                确认服药
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-if="medicationSchedule.length === 0" class="text-center py-8 text-gray-500">
          <p>当日暂无用药安排</p>
        </div>
      </div>

      <!-- 拍照识别 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">📸</span>
            拍照识别药品
          </h2>
        </div>
        
        <div class="space-y-4">
          <!-- 拍照区域 -->
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-medical-blue transition-colors"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              class="hidden"
            />
            <div v-if="!selectedImage">
              <Camera class="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p class="text-gray-600">点击拍照或选择图片</p>
              <p class="text-sm text-gray-500 mt-1">支持JPG、PNG格式</p>
            </div>
            <div v-else class="space-y-3">
              <img :src="selectedImage" alt="选中的图片" class="max-w-full h-48 object-contain mx-auto rounded" />
              <div class="flex justify-center space-x-2">
                <el-button type="primary" @click="recognizeMedication" :loading="isRecognizing">
                  识别药品
                </el-button>
                <el-button @click="clearImage">
                  重新选择
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 识别结果 -->
          <div v-if="recognitionResult" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-800 mb-2">识别结果</h3>
            <div class="space-y-2">
              <p><strong>药品名称：</strong>{{ recognitionResult.name }}</p>
              <p><strong>规格：</strong>{{ recognitionResult.specification }}</p>
              <p><strong>用法用量：</strong>{{ recognitionResult.dosage }}</p>
              <p><strong>注意事项：</strong>{{ recognitionResult.precautions }}</p>
            </div>
            <div class="mt-3">
              <el-button type="primary" size="small" @click="addRecognizedMedication">
                添加到用药计划
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 用药计划列表 -->
      <div class="card-medical">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">📋</span>
            我的用药计划
          </h2>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="plan in medicationPlans" 
            :key="plan.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800">{{ plan.medication_name }}</h3>
                <p class="text-sm text-gray-600">{{ plan.dosage }} | {{ plan.frequency }}</p>
                <p class="text-xs text-gray-500">开始时间：{{ formatDate(plan.start_date) }}</p>
                <p class="text-xs text-gray-500">结束时间：{{ formatDate(plan.end_date) }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <el-tag 
                  :type="plan.is_active ? 'success' : 'info'" 
                  size="small"
                >
                  {{ plan.is_active ? '进行中' : '已结束' }}
                </el-tag>
                <el-dropdown>
                  <el-button type="text" class="text-gray-500">
                    <MoreHorizontal class="w-4 h-4" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editMedicationPlan(plan)">
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click="deleteMedicationPlan(plan.id)" class="text-red-500">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="medicationPlans.length === 0" class="text-center py-8 text-gray-500">
          <p>暂无用药计划</p>
          <el-button type="primary" @click="showAddMedicationDialog = true" class="mt-2">
            创建第一个用药计划
          </el-button>
        </div>
      </div>
    </main>

    <!-- 添加用药计划对话框 -->
    <el-dialog 
      v-model="showAddMedicationDialog" 
      title="添加用药计划" 
      width="90%"
      :before-close="handleCloseDialog"
    >
      <el-form :model="medicationForm" :rules="medicationRules" ref="medicationFormRef" label-width="80px">
        <el-form-item label="药品名称" prop="medication_name">
          <el-input v-model="medicationForm.medication_name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="用法用量" prop="dosage">
          <el-input v-model="medicationForm.dosage" placeholder="例如：每次1片" />
        </el-form-item>
        <el-form-item label="服药频率" prop="frequency">
          <el-select v-model="medicationForm.frequency" placeholder="请选择服药频率">
            <el-option label="每日一次" value="daily_once" />
            <el-option label="每日两次" value="daily_twice" />
            <el-option label="每日三次" value="daily_three" />
            <el-option label="每日四次" value="daily_four" />
            <el-option label="每周一次" value="weekly_once" />
            <el-option label="按需服用" value="as_needed" />
          </el-select>
        </el-form-item>
        <el-form-item label="服药时间" prop="times">
          <el-time-picker
            v-model="medicationForm.times"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
            v-if="medicationForm.frequency === 'daily_once'"
          />
          <div v-else class="space-y-2">
            <el-time-picker
              v-for="(time, index) in getTimePickerCount()"
              :key="index"
              v-model="medicationForm.times[index]"
              placeholder="选择时间"
              format="HH:mm"
              value-format="HH:mm"
            />
          </div>
        </el-form-item>
        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker
            v-model="medicationForm.start_date"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker
            v-model="medicationForm.end_date"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="medicationForm.notes" 
            type="textarea" 
            placeholder="可选：添加备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddMedicationDialog = false">取消</el-button>
          <el-button type="primary" @click="saveMedicationPlan" :loading="isSaving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Camera, MoreHorizontal } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { database } from '../utils/supabase'
import BottomNavigation from '../components/BottomNavigation.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isLoading = ref(true)
const showAIChat = ref(false)
const showAddMedicationDialog = ref(false)
const selectedDate = ref(new Date())
const medicationSchedule = ref([])
const medicationPlans = ref([])
const selectedImage = ref(null)
const recognitionResult = ref(null)
const isRecognizing = ref(false)
const isAskingAI = ref(false)
const isSaving = ref(false)
const userQuestion = ref('')
const fileInput = ref(null)
const medicationFormRef = ref(null)

// AI建议
const aiSuggestions = [
  '建议您在饭后30分钟服用此药物，可以减少胃部不适。',
  '请注意此药物可能会引起嗜睡，服药后避免驾驶。',
  '建议您定时服药，保持血药浓度稳定，提高治疗效果。',
  '此药物与维生素C同服可能影响吸收，建议间隔2小时。',
  '请多喝水，有助于药物代谢和减少副作用。'
]

const aiSuggestion = ref(aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)])

// 用药计划表单
const medicationForm = reactive({
  medication_name: '',
  dosage: '',
  frequency: '',
  times: [],
  start_date: '',
  end_date: '',
  notes: ''
})

// 表单验证规则
const medicationRules = {
  medication_name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' }
  ],
  dosage: [
    { required: true, message: '请输入用法用量', trigger: 'blur' }
  ],
  frequency: [
    { required: true, message: '请选择服药频率', trigger: 'change' }
  ],
  start_date: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  end_date: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 计算属性
const user = computed(() => authStore.user)

// 方法
const loadData = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true
    
    // 加载用药计划和当日时间表
    const [plansResult, scheduleResult] = await Promise.all([
      database.getMedicationPlans(user.value.id),
      database.getTodayMedicationTasks(user.value.id)
    ])

    if (plansResult.data) {
      medicationPlans.value = plansResult.data
    }

    if (scheduleResult.data) {
      medicationSchedule.value = scheduleResult.data
    }

  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  } finally {
    isLoading.value = false
  }
}

const loadMedicationSchedule = async () => {
  if (!user.value || !selectedDate.value) return
  
  try {
    const result = await database.getMedicationTasksByDate(user.value.id, selectedDate.value)
    if (result.data) {
      medicationSchedule.value = result.data
    }
  } catch (error) {
    console.error('加载用药时间表失败:', error)
    ElMessage.error('加载用药时间表失败')
  }
}

const confirmMedication = async (schedule) => {
  try {
    const result = await database.confirmMedication(schedule.id, 'manual')
    
    if (result.data) {
      schedule.status = 'taken'
      schedule.actual_time = new Date().toISOString()
      ElMessage.success('服药确认成功！')
    } else {
      throw new Error(result.error?.message || '确认失败')
    }
  } catch (error) {
    console.error('确认用药失败:', error)
    ElMessage.error('确认用药失败，请重试')
  }
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

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// AI相关方法
const acceptAISuggestion = () => {
  ElMessage.success('已采纳AI建议')
  getNewSuggestion()
}

const getNewSuggestion = () => {
  aiSuggestion.value = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]
}

const askAI = async () => {
  if (!userQuestion.value.trim()) {
    ElMessage.warning('请输入您的问题')
    return
  }
  
  try {
    isAskingAI.value = true
    // 模拟AI回答
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const responses = [
      '根据您的描述，建议您咨询医生调整用药时间。',
      '这种情况比较常见，建议您按时服药并观察症状变化。',
      '请注意药物的相互作用，建议间隔服用。',
      '建议您记录症状变化，便于医生调整治疗方案。'
    ]
    
    aiSuggestion.value = responses[Math.floor(Math.random() * responses.length)]
    userQuestion.value = ''
    ElMessage.success('AI顾问已回答您的问题')
    
  } catch (error) {
    ElMessage.error('AI顾问暂时无法回答，请稍后重试')
  } finally {
    isAskingAI.value = false
  }
}

// 拍照识别相关方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  }
}

const processImageFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    recognitionResult.value = null
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  selectedImage.value = null
  recognitionResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const recognizeMedication = async () => {
  if (!selectedImage.value) {
    ElMessage.warning('请先选择图片')
    return
  }
  
  try {
    isRecognizing.value = true
    // 模拟药品识别
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟识别结果
    const mockResults = [
      {
        name: '阿莫西林胶囊',
        specification: '0.25g×24粒',
        dosage: '成人一次0.5g，一日3次',
        precautions: '青霉素过敏者禁用，饭后服用'
      },
      {
        name: '布洛芬缓释胶囊',
        specification: '0.3g×10粒',
        dosage: '成人一次0.3g，一日2次',
        precautions: '饭后服用，避免空腹，孕妇慎用'
      }
    ]
    
    recognitionResult.value = mockResults[Math.floor(Math.random() * mockResults.length)]
    ElMessage.success('药品识别成功！')
    
  } catch (error) {
    ElMessage.error('药品识别失败，请重试')
  } finally {
    isRecognizing.value = false
  }
}

const addRecognizedMedication = () => {
  if (!recognitionResult.value) return
  
  // 填充表单
  medicationForm.medication_name = recognitionResult.value.name
  medicationForm.dosage = recognitionResult.value.dosage
  medicationForm.notes = recognitionResult.value.precautions
  
  showAddMedicationDialog.value = true
  clearImage()
}

// 用药计划相关方法
const getTimePickerCount = () => {
  const frequencyMap = {
    'daily_once': 1,
    'daily_twice': 2,
    'daily_three': 3,
    'daily_four': 4,
    'weekly_once': 1,
    'as_needed': 1
  }
  
  const count = frequencyMap[medicationForm.frequency] || 1
  // 确保times数组有足够的元素
  while (medicationForm.times.length < count) {
    medicationForm.times.push('')
  }
  
  return Array.from({ length: count }, (_, i) => i)
}

const saveMedicationPlan = async () => {
  if (!medicationFormRef.value) return
  
  try {
    const valid = await medicationFormRef.value.validate()
    if (!valid) return
    
    isSaving.value = true
    
    const planData = {
      user_id: user.value.id,
      medication_name: medicationForm.medication_name,
      dosage: medicationForm.dosage,
      frequency: medicationForm.frequency,
      times: medicationForm.times.filter(time => time), // 过滤空值
      start_date: medicationForm.start_date,
      end_date: medicationForm.end_date,
      notes: medicationForm.notes,
      is_active: true
    }
    
    const result = await database.createMedicationPlan(planData)
    
    if (result.data) {
      ElMessage.success('用药计划创建成功！')
      showAddMedicationDialog.value = false
      resetForm()
      await loadData() // 重新加载数据
    } else {
      throw new Error(result.error?.message || '创建失败')
    }
    
  } catch (error) {
    console.error('保存用药计划失败:', error)
    ElMessage.error('保存用药计划失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const editMedicationPlan = (plan) => {
  // 填充表单数据
  Object.assign(medicationForm, {
    medication_name: plan.medication_name,
    dosage: plan.dosage,
    frequency: plan.frequency,
    times: plan.times || [],
    start_date: plan.start_date,
    end_date: plan.end_date,
    notes: plan.notes || ''
  })
  
  showAddMedicationDialog.value = true
}

const deleteMedicationPlan = async (planId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个用药计划吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await database.deleteMedicationPlan(planId)
    
    if (result.data) {
      ElMessage.success('用药计划删除成功！')
      await loadData() // 重新加载数据
    } else {
      throw new Error(result.error?.message || '删除失败')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用药计划失败:', error)
      ElMessage.error('删除用药计划失败，请重试')
    }
  }
}

const resetForm = () => {
  Object.assign(medicationForm, {
    medication_name: '',
    dosage: '',
    frequency: '',
    times: [],
    start_date: '',
    end_date: '',
    notes: ''
  })
  
  medicationFormRef.value?.resetFields()
}

const handleCloseDialog = () => {
  resetForm()
  showAddMedicationDialog.value = false
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
.medication-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
}

.card-medical {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 拖拽区域样式 */
.drag-area {
  transition: all 0.3s ease;
}

.drag-area:hover {
  border-color: #2E86AB;
  background-color: #f8fafc;
}
</style>
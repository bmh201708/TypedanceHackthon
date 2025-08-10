<template>
  <div class="game-container min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
    <!-- 顶部导航 -->
    <div class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold text-tech-purple">游戏中心</h1>
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-1 text-yellow-600">
          <i class="fas fa-coins"></i>
          <span class="font-semibold">{{ user?.coins || 0 }}</span>
        </div>
        <div class="flex items-center space-x-1 text-purple-600">
          <i class="fas fa-gem"></i>
          <span class="font-semibold">{{ user?.gems || 0 }}</span>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="isLoading" />

    <div v-else class="p-4 space-y-6">
      <!-- 宠物状态卡片 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">我的宠物</h2>
          <div class="text-sm text-gray-500">等级 {{ petStatus.level }}</div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 宠物头像 -->
          <div class="relative">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl">
              {{ getPetEmoji() }}
            </div>
            <div v-if="petStatus.mood === 'happy'" class="absolute -top-1 -right-1 text-yellow-400">
              ✨
            </div>
          </div>
          
          <!-- 宠物信息 -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-2">{{ petStatus.name || '小药师' }}</h3>
            
            <!-- 经验值条 -->
            <div class="mb-2">
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>经验值</span>
                <span>{{ petStatus.experience }}/{{ nextLevelExp }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(petStatus.experience / nextLevelExp) * 100}%` }"
                ></div>
              </div>
            </div>
            
            <!-- 属性值 -->
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="text-center">
                <div class="text-red-500 font-semibold">{{ petStatus.health }}/100</div>
                <div class="text-gray-500">健康</div>
              </div>
              <div class="text-center">
                <div class="text-blue-500 font-semibold">{{ petStatus.happiness }}/100</div>
                <div class="text-gray-500">快乐</div>
              </div>
              <div class="text-center">
                <div class="text-green-500 font-semibold">{{ petStatus.energy }}/100</div>
                <div class="text-gray-500">精力</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 宠物护理按钮 -->
        <div class="grid grid-cols-3 gap-3 mt-4">
          <button 
            @click="feedPet"
            :disabled="petStatus.health >= 100"
            class="bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
          >
            <i class="fas fa-heart mr-1"></i>
            喂食
          </button>
          <button 
            @click="playWithPet"
            :disabled="petStatus.happiness >= 100"
            class="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <i class="fas fa-gamepad mr-1"></i>
            玩耍
          </button>
          <button 
            @click="restPet"
            :disabled="petStatus.energy >= 100"
            class="bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
          >
            <i class="fas fa-bed mr-1"></i>
            休息
          </button>
        </div>
      </div>

      <!-- 冒险模式 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">冒险模式</h2>
        
        <div class="space-y-3">
          <div 
            v-for="adventure in adventures" 
            :key="adventure.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-2xl">{{ adventure.icon }}</div>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ adventure.name }}</h3>
                  <p class="text-sm text-gray-600">{{ adventure.description }}</p>
                  <div class="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>需要精力: {{ adventure.energyCost }}</span>
                    <span>奖励: {{ adventure.reward }}</span>
                  </div>
                </div>
              </div>
              <button 
                @click="startAdventure(adventure)"
                :disabled="petStatus.energy < adventure.energyCost || isAdventuring"
                class="bg-purple-500 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
              >
                {{ isAdventuring ? '冒险中...' : '开始' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就系统 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">成就系统</h2>
        
        <div class="grid grid-cols-1 gap-3">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            :class="{ 'bg-yellow-50 border-yellow-300': achievement.completed }"
          >
            <div class="flex items-center space-x-3">
              <div class="text-xl" :class="{ 'grayscale': !achievement.completed }">{{ achievement.icon }}</div>
              <div>
                <h3 class="font-semibold text-gray-800">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                <div class="text-xs text-gray-500 mt-1">
                  进度: {{ achievement.progress }}/{{ achievement.target }}
                </div>
              </div>
            </div>
            <div v-if="achievement.completed" class="text-green-500">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 商店 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">宠物商店</h2>
        
        <div class="grid grid-cols-2 gap-3">
          <div 
            v-for="item in shopItems" 
            :key="item.id"
            class="border border-gray-200 rounded-lg p-3 text-center hover:border-purple-300 transition-colors"
          >
            <div class="text-2xl mb-2">{{ item.icon }}</div>
            <h3 class="font-semibold text-gray-800 text-sm">{{ item.name }}</h3>
            <p class="text-xs text-gray-600 mb-2">{{ item.description }}</p>
            <div class="flex items-center justify-center space-x-1 text-xs text-yellow-600 mb-2">
              <i class="fas fa-coins"></i>
              <span>{{ item.price }}</span>
            </div>
            <button 
              @click="buyItem(item)"
              :disabled="(user?.coins || 0) < item.price"
              class="w-full bg-yellow-500 text-white py-1 px-2 rounded text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors"
            >
              购买
            </button>
          </div>
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
  name: 'Game',
  components: {
    LoadingSpinner,
    BottomNavigation
  },
  setup() {
    const authStore = useAuthStore()
    const isLoading = ref(true)
    const isAdventuring = ref(false)
    const petStatus = ref({
      id: null,
      name: '小药师',
      level: 1,
      experience: 0,
      health: 80,
      happiness: 70,
      energy: 60,
      mood: 'normal'
    })

    const user = computed(() => authStore.user)
    const nextLevelExp = computed(() => petStatus.value.level * 100)

    // 冒险数据
    const adventures = ref([
      {
        id: 1,
        name: '药草采集',
        description: '到森林中采集珍贵的药草',
        icon: '🌿',
        energyCost: 20,
        reward: '经验值 +15, 金币 +10'
      },
      {
        id: 2,
        name: '知识探索',
        description: '学习新的医学知识',
        icon: '📚',
        energyCost: 15,
        reward: '经验值 +20, 智慧 +5'
      },
      {
        id: 3,
        name: '帮助患者',
        description: '协助医生治疗患者',
        icon: '🏥',
        energyCost: 30,
        reward: '经验值 +25, 金币 +20'
      }
    ])

    // 成就数据
    const achievements = ref([
      {
        id: 1,
        name: '按时服药',
        description: '连续7天按时服药',
        icon: '💊',
        progress: 3,
        target: 7,
        completed: false
      },
      {
        id: 2,
        name: '健康达人',
        description: '宠物健康值达到100',
        icon: '❤️',
        progress: 80,
        target: 100,
        completed: false
      },
      {
        id: 3,
        name: '冒险家',
        description: '完成10次冒险',
        icon: '🗺️',
        progress: 2,
        target: 10,
        completed: false
      }
    ])

    // 商店物品
    const shopItems = ref([
      {
        id: 1,
        name: '营养药丸',
        description: '恢复20点健康值',
        icon: '💊',
        price: 50,
        effect: { health: 20 }
      },
      {
        id: 2,
        name: '快乐玩具',
        description: '增加15点快乐值',
        icon: '🎾',
        price: 30,
        effect: { happiness: 15 }
      },
      {
        id: 3,
        name: '能量饮料',
        description: '恢复25点精力值',
        icon: '⚡',
        price: 40,
        effect: { energy: 25 }
      },
      {
        id: 4,
        name: '经验书籍',
        description: '获得50点经验值',
        icon: '📖',
        price: 100,
        effect: { experience: 50 }
      }
    ])

    // 获取宠物表情
    const getPetEmoji = () => {
      if (petStatus.value.health < 30) return '😷'
      if (petStatus.value.happiness > 80) return '😊'
      if (petStatus.value.energy < 30) return '😴'
      return '🐱'
    }

    // 加载数据
    const loadData = async () => {
      try {
        isLoading.value = true
        
        // 获取宠物状态
        const { data: pet, error } = await supabase.getPetStatus(user.value.id)
        if (error) throw error
        
        if (pet) {
          petStatus.value = { ...petStatus.value, ...pet }
        }
        
        // 更新成就进度
        await updateAchievements()
        
      } catch (error) {
        console.error('加载游戏数据失败:', error)
        toast.error('加载游戏数据失败')
      } finally {
        isLoading.value = false
      }
    }

    // 喂食宠物
    const feedPet = async () => {
      try {
        const newHealth = Math.min(100, petStatus.value.health + 20)
        const updatedStatus = { ...petStatus.value, health: newHealth }
        
        await supabase.updatePetStatus(user.value.id, updatedStatus)
        petStatus.value = updatedStatus
        
        toast.success('宠物健康值 +20')
        await updateAchievements()
      } catch (error) {
        console.error('喂食失败:', error)
        toast.error('喂食失败')
      }
    }

    // 与宠物玩耍
    const playWithPet = async () => {
      try {
        const newHappiness = Math.min(100, petStatus.value.happiness + 15)
        const updatedStatus = { ...petStatus.value, happiness: newHappiness }
        
        await supabase.updatePetStatus(user.value.id, updatedStatus)
        petStatus.value = updatedStatus
        
        toast.success('宠物快乐值 +15')
        await updateAchievements()
      } catch (error) {
        console.error('玩耍失败:', error)
        toast.error('玩耍失败')
      }
    }

    // 宠物休息
    const restPet = async () => {
      try {
        const newEnergy = Math.min(100, petStatus.value.energy + 25)
        const updatedStatus = { ...petStatus.value, energy: newEnergy }
        
        await supabase.updatePetStatus(user.value.id, updatedStatus)
        petStatus.value = updatedStatus
        
        toast.success('宠物精力值 +25')
      } catch (error) {
        console.error('休息失败:', error)
        toast.error('休息失败')
      }
    }

    // 开始冒险
    const startAdventure = async (adventure) => {
      try {
        isAdventuring.value = true
        
        // 消耗精力
        const newEnergy = petStatus.value.energy - adventure.energyCost
        const newExperience = petStatus.value.experience + 15
        
        // 检查是否升级
        let newLevel = petStatus.value.level
        let finalExp = newExperience
        if (newExperience >= nextLevelExp.value) {
          newLevel += 1
          finalExp = newExperience - nextLevelExp.value
          toast.success(`恭喜！宠物升级到 ${newLevel} 级！`)
        }
        
        const updatedStatus = {
          ...petStatus.value,
          energy: newEnergy,
          experience: finalExp,
          level: newLevel
        }
        
        await supabase.updatePetStatus(user.value.id, updatedStatus)
        petStatus.value = updatedStatus
        
        // 模拟冒险时间
        setTimeout(() => {
          isAdventuring.value = false
          toast.success(`冒险完成！${adventure.reward}`)
        }, 2000)
        
      } catch (error) {
        console.error('冒险失败:', error)
        toast.error('冒险失败')
        isAdventuring.value = false
      }
    }

    // 购买物品
    const buyItem = async (item) => {
      try {
        const currentCoins = user.value.coins || 0
        if (currentCoins < item.price) {
          toast.error('金币不足')
          return
        }
        
        // 应用物品效果
        const updatedStatus = { ...petStatus.value }
        Object.keys(item.effect).forEach(key => {
          if (key === 'experience') {
            updatedStatus[key] += item.effect[key]
          } else {
            updatedStatus[key] = Math.min(100, updatedStatus[key] + item.effect[key])
          }
        })
        
        await supabase.updatePetStatus(user.value.id, updatedStatus)
        petStatus.value = updatedStatus
        
        toast.success(`购买成功！${item.name} 已使用`)
        await updateAchievements()
        
      } catch (error) {
        console.error('购买失败:', error)
        toast.error('购买失败')
      }
    }

    // 更新成就进度
    const updateAchievements = async () => {
      achievements.value.forEach(achievement => {
        switch (achievement.id) {
          case 2: // 健康达人
            achievement.progress = petStatus.value.health
            achievement.completed = petStatus.value.health >= 100
            break
        }
      })
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
      isAdventuring,
      petStatus,
      user,
      nextLevelExp,
      adventures,
      achievements,
      shopItems,
      getPetEmoji,
      feedPet,
      playWithPet,
      restPet,
      startAdventure,
      buyItem
    }
  }
}
</script>
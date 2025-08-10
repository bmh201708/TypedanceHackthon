<template>
  <div class="game-container min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
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

```
<!-- 顶部导航 -->
<header class="flex justify-between items-center p-4 mb-6">
  <button @click="$router.go(-1)" class="rounded-full p-3 bg-white shadow-lg hover:shadow-xl transition-shadow">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  </button>
  <div class="text-center">
    <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">游戏中心</h1>
    <p class="text-gray-500 text-sm">与小药丸一起冒险</p>
  </div>
  
  <!-- 货币显示 -->
  <div class="flex items-center space-x-2">
    <div class="bg-white rounded-full px-3 py-2 shadow-lg flex items-center space-x-1">
      <span class="text-yellow-500 text-lg">🪙</span>
      <span class="font-bold text-gray-800">{{ user?.coins || 0 }}</span>
    </div>
    <div class="bg-white rounded-full px-3 py-2 shadow-lg flex items-center space-x-1">
      <span class="text-purple-500 text-lg">💎</span>
      <span class="font-bold text-gray-800">{{ user?.gems || 0 }}</span>
    </div>
  </div>
</header>

<LoadingSpinner v-if="isLoading" />

<div v-else class="p-4 space-y-6">
  <!-- 宠物状态卡片 -->
  <div class="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-full -mr-16 -mt-16"></div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">{{ petStatus.name || '小药师' }}</h2>
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          等级 {{ petStatus.level }}
        </div>
      </div>
      
      <div class="flex items-center space-x-6 mb-6">
        <!-- 宠物头像 -->
        <div class="relative">
          <div class="w-28 h-28 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-4xl shadow-xl transform hover:scale-105 transition-transform">
            {{ getPetEmoji() }}
          </div>
          <div v-if="petStatus.mood === 'happy'" class="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-pulse">
            ✨
          </div>
          <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
            <span class="text-xs font-medium text-gray-600">活力满满!</span>
          </div>
        </div>
        
        <!-- 宠物信息 -->
        <div class="flex-1">
          <!-- 经验值条 -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span class="font-medium">经验值</span>
              <span class="font-bold">{{ petStatus.experience }}/{{ nextLevelExp }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                :style="{ width: `${(petStatus.experience / nextLevelExp) * 100}%` }"
              ></div>
            </div>
          </div>
          
          <!-- 属性值 -->
          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-600">健康</span>
                <span class="text-sm font-bold text-red-500">{{ petStatus.health }}/100</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: `${petStatus.health}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-600">快乐</span>
                <span class="text-sm font-bold text-blue-500">{{ petStatus.happiness }}/100</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: `${petStatus.happiness}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-600">精力</span>
                <span class="text-sm font-bold text-green-500">{{ petStatus.energy }}/100</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: `${petStatus.energy}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 宠物护理按钮 -->
      <div class="grid grid-cols-3 gap-4">
        <button 
          @click="feedPet"
          :disabled="petStatus.health >= 100"
          class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <span class="text-lg">🍎</span>
          <span>喂食</span>
        </button>
        <button 
          @click="playWithPet"
          :disabled="petStatus.happiness >= 100"
          class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <span class="text-lg">🎾</span>
          <span>玩耍</span>
        </button>
        <button 
          @click="restPet"
          :disabled="petStatus.energy >= 100"
          class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <span class="text-lg">😴</span>
          <span>休息</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 冒险模式 -->
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <span class="text-2xl mr-2">🗺️</span>
      冒险模式
    </h2>
    
    <div class="space-y-3">
      <div 
        v-for="adventure in adventures" 
        :key="adventure.id"
        class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-102"
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
            class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {{ isAdventuring ? '冒险中...' : '开始' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 成就系统 -->
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <span class="text-2xl mr-2">🏆</span>
      成就系统
    </h2>
    
    <div class="grid grid-cols-1 gap-3">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-lg"
        :class="{ 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md': achievement.completed }"
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
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <span class="text-2xl mr-2">🛒</span>
      宠物商店
    </h2>
    
    <div class="grid grid-cols-2 gap-3">
      <div 
        v-for="item in shopItems" 
        :key="item.id"
        class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
          class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          购买
        </button>
      </div>
    </div>
  </div>
</div>

<BottomNavigation />
```

  </div>
</template>

<style scoped>
.game-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding-bottom: 2rem;
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
  animation: pulse-slow 2s ease-in-out infinite;
}

/* 悬停缩放效果 */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* 卡片阴影 */
.shadow-card {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 状态指示器 */
.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 渐变文字 */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

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
    const currentTime = ref('')
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

    // 更新时间
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }

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
      updateTime()
      setInterval(updateTime, 1000)
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
      currentTime,
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

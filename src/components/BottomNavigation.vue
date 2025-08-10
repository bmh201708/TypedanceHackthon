<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
    <div class="flex justify-around py-2">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path" 
        class="flex flex-col items-center p-2 transition-colors duration-200"
        :class="{
          'text-medical-blue': $route.path === item.path,
          'text-gray-500': $route.path !== item.path
        }"
      >
        <span class="text-xl mb-1">{{ item.icon }}</span>
        <span class="text-xs">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// 根据用户角色显示不同的导航项
const navItems = computed(() => {
  const userRole = authStore.user?.user_type
  
  if (userRole === 'doctor') {
    return [
      { path: '/doctor-dashboard', icon: '🏥', label: '工作台' },
      { path: '/health-data', icon: '📊', label: '数据' },
      { path: '/family', icon: '👨‍👩‍👧‍👦', label: '患者' },
      { path: '/profile', icon: '👤', label: '我的' }
    ]
  }
  
  if (userRole === 'family') {
    return [
      { path: '/', icon: '🏠', label: '首页' },
      { path: '/medication', icon: '💊', label: '用药' },
      { path: '/health-data', icon: '📊', label: '数据' },
      { path: '/health', icon: '❤️', label: '健康' },
      { path: '/family', icon: '👨‍👩‍👧‍👦', label: '关联' },
      { path: '/profile', icon: '👤', label: '我的' }
    ]
  }
  
  // 默认患者导航
  return [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/medication', icon: '💊', label: '用药' },
    { path: '/game', icon: '🎮', label: '游戏' },
    { path: '/health-data', icon: '📊', label: '数据' },
    { path: '/health', icon: '❤️', label: '健康' },
    { path: '/profile', icon: '👤', label: '我的' }
  ]
})
</script>

<style scoped>
.router-link-active {
  color: #2E86AB !important;
}

/* 添加点击效果 */
.router-link:active {
  transform: scale(0.95);
}
</style>
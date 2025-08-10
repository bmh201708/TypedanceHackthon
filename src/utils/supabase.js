import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://ntectzhxtgdxdmasvgku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50ZWN0emh4dGdkeGRtYXN2Z2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDAwOTEsImV4cCI6MjA3MDM3NjA5MX0.DQY9wATs1509AfEamFOftu33dVXbWtziZWkOuZ1KV5I'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 认证相关函数
export const auth = {
  // 用户注册
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      
      // 如果注册成功，创建用户记录
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            user_type: userData.user_type,
            real_name: userData.real_name,
            phone: userData.phone,
            medical_history: userData.medical_history || {},
            certification: userData.certification || {},
            is_verified: false
          })
        
        if (insertError) throw insertError
        
        // 如果是患者，创建宠物状态
        if (userData.user_type === 'patient') {
          const { error: petError } = await supabase
            .from('pet_status')
            .insert({
              user_id: data.user.id,
              pet_name: '小药丸',
              level: 1,
              energy: 100,
              health: 100,
              experience: 0
            })
          
          if (petError) console.warn('创建宠物状态失败:', petError)
        }
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 用户登录
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 用户登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        // 获取用户详细信息
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) throw profileError
        
        return { user: { ...user, ...userProfile }, error: null }
      }
      
      return { user: null, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  // 监听认证状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 数据库操作函数
export const database = {
  // 获取用药方案
  async getMedicationPlans(userId) {
    try {
      const { data, error } = await supabase
        .from('medication_plans')
        .select(`
          *,
          medication_items(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 获取今日用药任务
  async getTodayMedicationTasks(userId) {
    try {
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()
      
      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medication_items(*)
        `)
        .eq('user_id', userId)
        .gte('scheduled_time', startOfDay)
        .lte('scheduled_time', endOfDay)
        .order('scheduled_time', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 确认服药
  async confirmMedication(logId, confirmationMethod = 'manual') {
    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .update({
          status: 'taken',
          actual_time: new Date().toISOString(),
          confirmation_method: confirmationMethod
        })
        .eq('id', logId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 获取宠物状态
  async getPetStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('pet_status')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 更新宠物状态
  async updatePetStatus(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('pet_status')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 获取健康数据
  async getHealthData(userId, dataType = null, limit = 30) {
    try {
      let query = supabase
        .from('health_data')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(limit)
      
      if (dataType) {
        query = query.eq('data_type', dataType)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 添加健康数据
  async addHealthData(userId, dataType, value, unit, recordedAt = null) {
    try {
      const { data, error } = await supabase
        .from('health_data')
        .insert({
          user_id: userId,
          data_type: dataType,
          value: parseFloat(value),
          unit,
          recorded_at: recordedAt || new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 获取家属关联
  async getFamilyRelations(userId) {
    try {
      const { data, error } = await supabase
        .from('family_relations')
        .select(`
          *,
          patient:users!family_relations_patient_id_fkey(*),
          family:users!family_relations_family_id_fkey(*)
        `)
        .or(`patient_id.eq.${userId},family_id.eq.${userId}`)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 获取健康数据
  async getHealthData(userId) {
    const { data, error } = await supabase
      .from('health_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
    
    return { data, error }
  },

  // 添加健康数据
  async addHealthData(userId, healthData) {
    const { data, error } = await supabase
      .from('health_data')
      .insert({
        user_id: userId,
        data_type: healthData.type,
        value: healthData.value,
        unit: healthData.unit,
        recorded_at: new Date().toISOString(),
        ...healthData
      })
      .select()
    
    return { data, error }
  },

  // 获取用药记录
  async getMedicationLogs(userId) {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
    
    return { data, error }
  },

  // 用药计划管理
  async getMedicationPlans(userId) {
    try {
      const { data, error } = await supabase
        .from('medication_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      return { data, error }
    } catch (error) {
      console.error('获取用药计划失败:', error)
      return { data: null, error }
    }
  },

  async createMedicationPlan(planData) {
    try {
      const { data, error } = await supabase
        .from('medication_plans')
        .insert([planData])
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('创建用药计划失败:', error)
      return { data: null, error }
    }
  },

  async updateMedicationPlan(planId, updates) {
    try {
      const { data, error } = await supabase
        .from('medication_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('更新用药计划失败:', error)
      return { data: null, error }
    }
  },

  async deleteMedicationPlan(planId) {
    try {
      const { data, error } = await supabase
        .from('medication_plans')
        .delete()
        .eq('id', planId)
      
      return { data, error }
    } catch (error) {
      console.error('删除用药计划失败:', error)
      return { data: null, error }
    }
  },

  // 用药任务管理
  async getMedicationTasksByDate(userId, date) {
    try {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      
      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medication_plan:plan_id(medication_name, dosage)
        `)
        .eq('user_id', userId)
        .gte('scheduled_time', startDate.toISOString())
        .lte('scheduled_time', endDate.toISOString())
        .order('scheduled_time', { ascending: true })
      
      return { data, error }
    } catch (error) {
      console.error('获取用药任务失败:', error)
      return { data: null, error }
    }
  }
}

// 实时订阅
export const realtime = {
  // 订阅用药记录变化
  subscribeMedicationLogs(userId, callback) {
    return supabase
      .channel('medication_logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_logs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // 订阅宠物状态变化
  subscribePetStatus(userId, callback) {
    return supabase
      .channel('pet_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_status',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

export default supabase
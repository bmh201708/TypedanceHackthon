-- MediQuest数据库表结构创建脚本
-- 基于技术架构文档的数据模型设计

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表 (users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('patient', 'doctor', 'family', 'pharmacist')),
    real_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    medical_history JSONB DEFAULT '{}',
    certification JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_phone ON users(phone);

-- 创建用药方案表 (medication_plans)
CREATE TABLE medication_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(200) NOT NULL,
    ai_recommendations JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用药方案表索引
CREATE INDEX idx_medication_plans_user_id ON medication_plans(user_id);
CREATE INDEX idx_medication_plans_is_active ON medication_plans(is_active);

-- 创建用药项目表 (medication_items)
CREATE TABLE medication_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES medication_plans(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    timing VARCHAR(100) NOT NULL,
    side_effects JSONB DEFAULT '[]',
    drug_interactions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用药项目表索引
CREATE INDEX idx_medication_items_plan_id ON medication_items(plan_id);

-- 创建用药记录表 (medication_logs)
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_item_id UUID NOT NULL REFERENCES medication_items(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('taken', 'missed', 'delayed', 'skipped')),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE,
    confirmation_method VARCHAR(50) CHECK (confirmation_method IN ('photo', 'qr_code', 'manual')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用药记录表索引
CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_scheduled_time ON medication_logs(scheduled_time DESC);
CREATE INDEX idx_medication_logs_status ON medication_logs(status);

-- 创建宠物状态表 (pet_status)
CREATE TABLE pet_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_name VARCHAR(100) DEFAULT '小药丸',
    level INTEGER DEFAULT 1,
    energy INTEGER DEFAULT 100,
    health INTEGER DEFAULT 100,
    experience INTEGER DEFAULT 0,
    skills JSONB DEFAULT '[]',
    last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建宠物状态表索引
CREATE INDEX idx_pet_status_user_id ON pet_status(user_id);

-- 创建健康数据表 (health_data)
CREATE TABLE health_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建健康数据表索引
CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_type ON health_data(data_type);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at DESC);

-- 创建家属关联表 (family_relations)
CREATE TABLE family_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, family_id)
);

-- 创建家属关联表索引
CREATE INDEX idx_family_relations_patient_id ON family_relations(patient_id);
CREATE INDEX idx_family_relations_family_id ON family_relations(family_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略：用户只能查看和修改自己的信息
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 用药方案表策略：用户只能查看自己的用药方案
CREATE POLICY "Users can view own medication plans" ON medication_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication plans" ON medication_plans
    FOR ALL USING (auth.uid() = user_id);

-- 用药项目表策略：通过用药方案关联控制访问
CREATE POLICY "Users can view own medication items" ON medication_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medication_plans 
            WHERE medication_plans.id = medication_items.plan_id 
            AND medication_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own medication items" ON medication_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medication_plans 
            WHERE medication_plans.id = medication_items.plan_id 
            AND medication_plans.user_id = auth.uid()
        )
    );

-- 用药记录表策略：用户只能查看自己的用药记录
CREATE POLICY "Users can view own medication logs" ON medication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication logs" ON medication_logs
    FOR ALL USING (auth.uid() = user_id);

-- 宠物状态表策略：用户只能查看自己的宠物
CREATE POLICY "Users can view own pet status" ON pet_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pet status" ON pet_status
    FOR ALL USING (auth.uid() = user_id);

-- 健康数据表策略：用户只能查看自己的健康数据
CREATE POLICY "Users can view own health data" ON health_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health data" ON health_data
    FOR ALL USING (auth.uid() = user_id);

-- 家属关联表策略：患者和家属都可以查看关联关系
CREATE POLICY "Users can view family relations" ON family_relations
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = family_id);

CREATE POLICY "Patients can manage family relations" ON family_relations
    FOR ALL USING (auth.uid() = patient_id);

-- 授予权限给anon和authenticated角色
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_plans_updated_at BEFORE UPDATE ON medication_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_status_updated_at BEFORE UPDATE ON pet_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些初始数据用于演示
INSERT INTO users (email, password_hash, user_type, real_name, phone, is_verified) VALUES
('demo-patient@mediquest.com', '$2b$10$demo.hash.for.patient', 'patient', '张三', '13800138001', true),
('demo-doctor@mediquest.com', '$2b$10$demo.hash.for.doctor', 'doctor', '李医生', '13800138002', true),
('demo-family@mediquest.com', '$2b$10$demo.hash.for.family', 'family', '王家属', '13800138003', true);

-- 为演示患者创建宠物状态
INSERT INTO pet_status (user_id, pet_name, level, energy, health, experience)
SELECT id, '小药丸', 5, 85, 90, 320
FROM users WHERE email = 'demo-patient@mediquest.com';

-- 创建演示用药方案
INSERT INTO medication_plans (user_id, plan_name, ai_recommendations, is_active)
SELECT id, '感冒康复方案', '{"recommendation": "按时服药，多休息"}', true
FROM users WHERE email = 'demo-patient@mediquest.com';

-- 添加演示用药项目
INSERT INTO medication_items (plan_id, medication_name, dosage, frequency, timing)
SELECT mp.id, '阿莫西林胶囊', '500mg', '每日3次', '餐后服用'
FROM medication_plans mp
JOIN users u ON mp.user_id = u.id
WHERE u.email = 'demo-patient@mediquest.com';

INSERT INTO medication_items (plan_id, medication_name, dosage, frequency, timing)
SELECT mp.id, '维生素C片', '100mg', '每日2次', '餐后服用'
FROM medication_plans mp
JOIN users u ON mp.user_id = u.id
WHERE u.email = 'demo-patient@mediquest.com';

-- 添加一些健康数据
INSERT INTO health_data (user_id, data_type, value, unit, recorded_at)
SELECT id, 'blood_pressure_systolic', 120, 'mmHg', NOW() - INTERVAL '1 day'
FROM users WHERE email = 'demo-patient@mediquest.com';

INSERT INTO health_data (user_id, data_type, value, unit, recorded_at)
SELECT id, 'blood_pressure_diastolic', 80, 'mmHg', NOW() - INTERVAL '1 day'
FROM users WHERE email = 'demo-patient@mediquest.com';

INSERT INTO health_data (user_id, data_type, value, unit, recorded_at)
SELECT id, 'weight', 65.5, 'kg', NOW() - INTERVAL '2 days'
FROM users WHERE email = 'demo-patient@mediquest.com';
<template>
  <div class="profile-view">
    <el-row :gutter="20">
      <!-- 基本信息卡片 -->
      <el-col :span="16">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <div class="header-buttons">
                <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
              </div>
            </div>
          </template>
          
          <el-form 
            ref="formRef"
            :model="profileForm"
            :rules="rules"
            label-width="120px"
            class="profile-form"
          >
            <!-- 头像上传 -->
            <el-form-item label="头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                action="http://localhost:5000/api/users/avatar"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
                :before-upload="beforeAvatarUpload"
                :headers="uploadHeaders"
                name="avatar"
              >
                <img v-if="getAvatarUrl" :src="getAvatarUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <!-- 基本信息表单 -->
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>

            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="profileForm.realName" />
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="profileForm.gender">
                <el-radio :value="'male'">男</el-radio>
                <el-radio :value="'female'">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="职称" prop="title">
              <el-input v-model="profileForm.title" />
            </el-form-item>

            <el-form-item label="专业领域" prop="expertiseList">
              <el-select
                v-model="profileForm.expertiseList"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入专业领域"
              >
                <el-option
                  v-for="item in expertiseOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="个人简介" prop="introduction">
              <el-input
                v-model="profileForm.introduction"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
              />
            </el-form-item>

            <el-form-item label="教育背景" prop="education">
              <el-input
                v-model="profileForm.education"
                type="textarea"
                :rows="3"
                placeholder="请输入教育背景"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>

            <el-form-item label="电话" prop="phone">
              <el-input v-model="profileForm.phone" />
            </el-form-item>

            <!-- 只读信息展示 -->
            <el-form-item label="咨询次数">
              <el-input v-model="profileForm.consultationCount" disabled>
                <template #append>次</template>
              </el-input>
            </el-form-item>

            <el-form-item label="评分">
              <el-rate
                v-model="profileForm.rating"
                disabled
                show-score
                :max="5"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </el-form-item>

            <el-form-item label="满意度">
              <el-input v-model="profileForm.satisfactionRate" disabled>
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 修改密码卡片 -->
      <el-col :span="8">
        <el-card class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handlePasswordChange"
                :loading="passwordLoading"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import userService from '@/services/user.service'

// 获取头像完整URL
const getAvatarUrl = computed(() => {
  if (!profileForm.value.avatar) return '';
  // 如果已经是完整URL，直接返回
  if (profileForm.value.avatar.startsWith('http')) {
    return profileForm.value.avatar;
  }
  // 否则拼接基础URL
  return `http://localhost:5000${profileForm.value.avatar}`;
});

// 表单引用
const formRef = ref(null)
const passwordFormRef = ref(null)

// 加载状态
const loading = ref(false)
const passwordLoading = ref(false)

// 专业领域选项
const expertiseOptions = [
  '抑郁症',
  '焦虑症',
  '人际关系',
  '情感问题',
  '压力管理',
  '职业规划',
  '学业压力',
  '自我认知',
  '生涯规划'
]

// 个人信息表单数据
const profileForm = ref({
  username: '',
  realName: '',
  gender: '',
  email: '',
  phone: '',
  title: '',
  expertiseList: [],
  introduction: '',
  education: '',
  avatar: '',
  consultationCount: 0,
  rating: 0,
  satisfactionRate: 0
})

// 密码表单数据
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入职称', trigger: 'blur' }
  ],
  expertiseList: [
    { required: true, message: '请选择专业领域', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个专业领域', trigger: 'change' }
  ],
  introduction: [
    { required: true, message: '请输入个人简介', trigger: 'blur' }
  ],
  education: [
    { required: true, message: '请输入教育背景', trigger: 'blur' }
  ],
  avatar: [
    { required: true, message: '请上传头像', trigger: 'change' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, max: 20, message: '密码长度在 8 到 20 个字符', trigger: 'blur' },
        { 
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/,
          message: '密码必须包含大小写字母和数字',
          trigger: 'blur'
        }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const uploadHeaders = computed(() => ({
  'x-access-token': localStorage.getItem('token')
}));

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    loading.value = true;
    const response = await userService.getCurrentUserInfo();
    // 更新基本信息
    Object.assign(profileForm.value, {
      username: response.username || '',
      realName: response.realName || response.real_name || '',
      gender: response.gender || '',
      email: response.email || '',
      phone: response.phone || '',
      // 咨询师特有信息
      title: response.counselor_profile?.title || '',
      expertiseList: response.counselor_profile?.expertise ? response.counselor_profile.expertise.split(',').filter(Boolean) : [],
      introduction: response.counselor_profile?.introduction || '',
      education: response.counselor_profile?.education || '',
      // 不设置默认头像
      avatar: response.counselor_profile?.avatar ? `http://localhost:5000${response.counselor_profile.avatar}` : '',
      // 统计信息（只读）
      consultationCount: response.counselor_profile?.consultation_count || 0,
      rating: response.counselor_profile?.rating || 0,
      satisfactionRate: response.counselor_profile?.satisfaction_rate || 0
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 保存个人信息
const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    // 处理头像路径
    let avatarPath = profileForm.value.avatar;
    if (avatarPath.startsWith('http://localhost:5000')) {
      avatarPath = avatarPath.replace('http://localhost:5000', '');
    }
    
    // 构造更新数据
    const updateData = {
      realName: profileForm.value.realName,
      gender: profileForm.value.gender,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      counselor_profile: {
        title: profileForm.value.title,
        expertise: profileForm.value.expertiseList.join(','),
        introduction: profileForm.value.introduction,
        education: profileForm.value.education,
        avatar: avatarPath
      }
    };

    await userService.updateProfile(updateData);
    ElMessage.success('保存成功');
    await fetchUserInfo(); // 刷新用户信息
  } catch (error) {
    console.error('保存失败:', error);
    // 显示具体的错误信息
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error(error.message || '保存失败');
    }
  } finally {
    loading.value = false;
  }
};

// 修改密码
const handlePasswordChange = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    await userService.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })

    ElMessage.success('密码修改成功')
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    if (passwordFormRef.value) {
      passwordFormRef.value.clearValidate()
    }
  } catch (error) {
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 头像上传相关方法
const handleAvatarSuccess = (response) => {
  if (response.success) {
    // 只使用相对路径
    profileForm.value.avatar = response.data.avatar;
  }
};

const handleAvatarError = (error) => {
  console.error('上传头像失败:', error);
  ElMessage.error(error.message || '上传头像失败');
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 页面加载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-view {
  padding: 20px;
}

.profile-card,
.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.avatar-uploader {
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  line-height: 100px;
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}
</style> 
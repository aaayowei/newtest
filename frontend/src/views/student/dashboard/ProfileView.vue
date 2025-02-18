<template>
  <div class="profile-view">
    <el-row :gutter="20">
      <!-- 基本信息卡片 -->
      <el-col :span="16">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="primary" @click="handleSave" :loading="loading">
                保存修改
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>

            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" />
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :value="'male'">男</el-radio>
                <el-radio :value="'female'">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="学号" prop="studentId">
              <el-input v-model="form.studentId" />
            </el-form-item>

            <el-form-item label="院系" prop="department">
              <el-input v-model="form.department" />
            </el-form-item>

            <el-form-item label="专业" prop="major">
              <el-input v-model="form.major" />
            </el-form-item>

            <el-form-item label="年级" prop="grade">
              <el-input v-model="form.grade" />
            </el-form-item>

            <el-form-item label="班级" prop="className">
              <el-input v-model="form.className" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>

            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" />
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

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userService from '@/services/user.service'

export default {
  name: 'ProfileView',
  setup() {
    const formRef = ref(null)
    const passwordFormRef = ref(null)
    const loading = ref(false)
    const passwordLoading = ref(false)
    const userInfo = ref({
      userType: ''
    })

    // 表单数据
    const form = reactive({
      username: '',
      realName: '',
      gender: '',
      email: '',
      phone: '',
      // 学生特有字段
      studentId: '',
      department: '',
      major: '',
      grade: '',
      className: ''
    })

    // 密码表单数据
    const passwordForm = reactive({
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
      studentId: [
        { required: true, message: '请输入学号', trigger: 'blur' },
        { pattern: /^\d{8,12}$/, message: '请输入8-12位数字的学号', trigger: 'blur' }
      ],
      department: [
        { required: true, message: '请输入院系', trigger: 'blur' }
      ],
      major: [
        { required: true, message: '请输入专业', trigger: 'blur' }
      ],
      grade: [
        { required: true, message: '请输入年级', trigger: 'blur' },
        { pattern: /^(20)\d{2}$/, message: '请输入正确的年级格式，如：2020', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ]
    }

    // 密码验证规则
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
            if (value === '') {
              callback(new Error('请再次输入新密码'))
            } else if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        }
      ]
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await userService.getCurrentUserInfo()
        // 更新基本信息
        Object.assign(form, {
          username: response.username || '',
          realName: response.realName || response.real_name || '',
          gender: response.gender || '',
          email: response.email || '',
          phone: response.phone || ''
        })

        // 更新用户类型
        userInfo.value = {
          ...userInfo.value,
          userType: response.userType
        }

        // 如果是学生，添加学生特有字段
        if (response.userType === 'student' && response.student_profile) {
          Object.assign(form, {
            studentId: response.student_profile.student_id || '',
            department: response.student_profile.department || '',
            major: response.student_profile.major || '',
            grade: response.student_profile.grade || '',
            className: response.student_profile.class_name || ''
          })
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败，请稍后重试')
      }
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return

      formRef.value.validate(async (valid, fields) => {
        if (!valid) {
          // 检查是否存在未填写的必填项
          const hasEmptyFields = Object.values(fields).some(field => 
            field.some(error => {
              // 只有当字段为空时才显示"请填写所有必填项"
              const isEmptyField = error.message === '请输入真实姓名' ||
                error.message === '请选择性别' ||
                error.message === '请输入学号' ||
                error.message === '请输入院系' ||
                error.message === '请输入专业' ||
                error.message === '请输入年级' ||
                error.message === '请输入邮箱' ||
                error.message === '请输入手机号'
              return isEmptyField
            })
          )
          
          if (hasEmptyFields) {
            ElMessage.warning('请填写所有必填项')
          } else {
            ElMessage.error('修改失败，请检查填写的信息是否正确')
          }
          return
        }

        try {
          loading.value = true
          
          // 转换表单数据为后端需要的格式
          const submitData = {
            username: form.username,
            realName: form.realName,
            gender: form.gender,
            email: form.email,
            phone: form.phone
          }

          // 如果是学生，添加学生信息
          if (userInfo.value.userType === 'student') {
            submitData.student = {
              student_id: form.studentId,
              department: form.department,
              major: form.major,
              grade: form.grade,
              class_name: form.className
            }
          }
          
          const result = await userService.updateProfile(submitData)
          
          if (result.success) {
            ElMessage.success('个人信息修改成功')
            await fetchUserInfo()
          } else {
            throw new Error(result.message || '修改失败')
          }
        } catch (error) {
          ElMessage.error(error.message || '修改失败，请检查填写的信息是否正确')
        } finally {
          loading.value = false
        }
      })
    }

    // 处理修改密码
    const handlePasswordChange = async () => {
      if (!passwordFormRef.value) return

      passwordFormRef.value.validate(async (valid) => {
        if (!valid) {
          return
        }
        
        try {
          loading.value = true
          // 尝试修改密码
          await userService.changePassword({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          })
          
          // 如果成功，显示成功消息并重置表单
          ElMessage.success('密码修改成功')
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
          if (passwordFormRef.value) {
            passwordFormRef.value.clearValidate()
          }
        } catch (error) {
          // 显示后端返回的错误消息
          ElMessage.error(error.message || '修改密码失败，请稍后重试')
        } finally {
          loading.value = false
        }
      })
    }

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
        fetchUserInfo()
      }
    }

    // 重置密码表单
    const resetPasswordForm = () => {
      if (passwordFormRef.value) {
        passwordFormRef.value.resetFields()
      }
    }

    // 保存基本信息
    const handleSave = async () => {
      if (!formRef.value) return
      
      try {
        loading.value = true
        await formRef.value.validate()
        
        // 转换表单数据为后端需要的格式
        const submitData = {
          realName: form.realName,
          gender: form.gender,
          email: form.email,
          phone: form.phone,
          student_profile: {
            student_id: form.studentId,
            department: form.department,
            major: form.major,
            grade: form.grade,
            class_name: form.className
          }
        }
        
        const result = await userService.updateProfile(submitData)
        
        if (result.success) {
          ElMessage.success('保存成功')
          await fetchUserInfo()
        } else {
          throw new Error(result.message || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserInfo()
    })

    return {
      formRef,
      passwordFormRef,
      form,
      passwordForm,
      rules,
      passwordRules,
      loading,
      passwordLoading,
      userInfo,
      handleSubmit,
      handlePasswordChange,
      resetForm,
      resetPasswordForm,
      handleSave
    }
  }
}
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

.card-header span {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style> 
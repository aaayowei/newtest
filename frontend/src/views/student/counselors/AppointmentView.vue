<template>
  <div class="appointment-view">
    <el-card class="appointment-card">
      <template #header>
        <div class="card-header">
          <h2>预约咨询</h2>
        </div>
      </template>

      <!-- 咨询师信息卡片 -->
      <div v-if="counselor && counselor.user" class="counselor-card">
        <div class="counselor-avatar">
          <el-avatar 
            :size="80" 
            :src="getAvatarUrl(counselor.avatar)"
            :fallback="handleAvatarError()"
          />
        </div>
        <div class="counselor-info">
          <div class="counselor-header">
            <h3 class="counselor-name">{{ counselor.user.real_name }}</h3>
            <span class="counselor-title">{{ counselor.title }}</span>
          </div>
          <div class="counselor-stats">
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>评分：{{ counselor.rating }}分</span>
            </div>
            <div class="stat-item">
              <el-icon><User /></el-icon>
              <span>咨询量：{{ counselor.consultation_count }}次</span>
            </div>
          </div>
          <div class="counselor-expertise">
            <span class="label">专业领域：</span>
            <div class="tags">
              <el-tag 
                v-for="(field, index) in counselor.expertise.split(',')" 
                :key="index"
                size="small"
                type="primary"
                effect="light"
                class="expertise-tag"
              >
                {{ field.trim() }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 预约表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="appointment-form"
      >
        <!-- 预约日期 -->
        <el-form-item label="预约日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :locale="zhCn"
          />
        </el-form-item>

        <!-- 时间段选择 -->
        <el-form-item label="时间段" prop="schedule_id">
          <el-select
            v-model="form.schedule_id"
            placeholder="请选择时间段"
            style="width: 100%"
            :disabled="!form.date"
          >
            <el-option
              v-for="slot in availableTimeSlots"
              :key="slot.id"
              :label="slot.time_slot"
              :value="slot.id"
            />
          </el-select>
        </el-form-item>

        <!-- 咨询方式 -->
        <el-form-item label="咨询方式" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="'online'">在线咨询</el-radio>
            <el-radio :value="'offline'">面对面咨询</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 咨询问题描述 -->
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请简要描述您想咨询的问题，这将帮助咨询师更好地了解您的需求"
          />
        </el-form-item>

        <!-- 隐私选项 -->
        <el-form-item label="隐私选项">
          <el-checkbox v-model="form.is_anonymous">匿名咨询</el-checkbox>
          <el-tooltip
            content="选择匿名咨询后咨询师将无法看到您的真实身份信息"
            placement="right"
          >
            <i class="el-icon-question" style="margin-left: 5px"></i>
          </el-tooltip>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitAppointment" :loading="submitting">
            确认预约
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>

      <!-- 预约须知 -->
      <div class="appointment-notice">
        <h4>预约须知</h4>
        <ul>
          <li>请至少提前24小时预约咨询</li>
          <li>如需取消预约，请提前12小时通知</li>
          <li>咨询时长为50分钟</li>
          <li>请准时参加咨询，迟到将缩短咨询时间</li>
          <li>如选择在线咨询，请确保网络通畅</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, User } from '@element-plus/icons-vue'
import counselorService from '@/services/counselor.service'
import appointmentService from '@/services/appointment.service'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default {
  name: 'AppointmentView',
  components: {
    Star,
    User
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref(null)
    const counselor = ref(null)
    const availableTimeSlots = ref([])
    const submitting = ref(false)

    // 表单数据
    const form = reactive({
      date: '',
      schedule_id: '',
      type: 'online',
      description: '',
      is_anonymous: false
    })

    // 表单验证规则
    const rules = {
      date: [
        { required: true, message: '请选择预约日期', trigger: 'change' }
      ],
      schedule_id: [
        { required: true, message: '请选择时间段', trigger: 'change' }
      ],
      type: [
        { required: true, message: '请选择咨询方式', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请描述您的咨询问题', trigger: 'blur' },
        { min: 10, message: '描述不能少于10个字符', trigger: 'blur' }
      ]
    }

    // 禁用日期
    const disabledDate = (time) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1) // 至少提前24小时
      
      const thirtyDaysLater = new Date(today)
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
      
      return time.getTime() < tomorrow.getTime() || time.getTime() > thirtyDaysLater.getTime()
    }

    // 获取咨询师信息
    const fetchCounselorInfo = async () => {
      try {
        const id = route.params.id
        console.log('正在获取咨询师信息，ID:', id)
        const response = await counselorService.getCounselorById(id)
        console.log('获取到的咨询师信息:', response)
        console.log('头像路径:', response.avatar)
        
        if (!response) {
          throw new Error('获取咨询师信息失败：返回数据为空')
        }
        
        counselor.value = response
        console.log('设置后的 counselor.value:', counselor.value)
      } catch (error) {
        console.error('获取咨询师信息失败:', error)
        ElMessage.error(error.message || '获取咨询师信息失败')
      }
    }

    // 处理头像URL
    const getAvatarUrl = (avatar) => {
      console.log('处理头像路径:', avatar)
      if (!avatar) return ''
      return avatar.startsWith('/') ? 'http://localhost:5000' + avatar : 'http://localhost:5000/' + avatar
    }

    // 处理头像加载错误
    const handleAvatarError = () => {
      console.log('头像加载失败，使用默认头像')
      return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }

    // 获取可用时间段
    const fetchAvailableTimeSlots = async () => {
      if (!form.date) return
      try {
        console.log('获取可用时间段，日期:', form.date)
        const response = await counselorService.getCounselorSchedule(
          route.params.id,
          form.date,
          form.date
        )
        console.log('获取到的时间段数据:', response)
        
        if (!response || !Array.isArray(response.data)) {
          console.error('返回的时间段数据格式不正确:', response)
          ElMessage.warning('获取时间段数据格式不正确')
          availableTimeSlots.value = []
          return
        }

        // 过滤出可用的时间段
        availableTimeSlots.value = response.data.filter(schedule => schedule.status === 'available')
        console.log('可用的时间段:', availableTimeSlots.value)

        if (availableTimeSlots.value.length === 0) {
          ElMessage.info('当前日期没有可预约的时间段')
        }
      } catch (error) {
        console.error('获取可用时间段失败:', error)
        ElMessage.error(error.message || '获取可用时间段失败')
        availableTimeSlots.value = []
      }
    }

    // 提交预约
    const submitAppointment = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        submitting.value = true

        // 获取选中的时间段信息
        const selectedTimeSlot = availableTimeSlots.value.find(
          slot => slot.id === form.schedule_id
        )

        const appointmentData = {
          counselor_id: route.params.id,
          schedule_id: form.schedule_id,
          type: form.type,
          description: form.description,
          is_anonymous: form.is_anonymous,
          selectedTimeSlot // 添加选中的时间段信息
        }
        console.log('提交预约数据:', appointmentData)

        await appointmentService.createAppointment(appointmentData)

        ElMessage.success('预约成功！')
        router.push('/student/dashboard/appointments')
      } catch (error) {
        if (error === false) return // 表单验证失败
        console.error('提交预约失败:', error)
        ElMessage.error(error.message || '提交预约失败')
      } finally {
        submitting.value = false
      }
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 监听日期变化
    watch(() => form.date, () => {
      form.schedule_id = ''
      if (form.date) {
        fetchAvailableTimeSlots()
      }
    })

    // 监听 counselor 的变化
    watch(counselor, (newVal) => {
      console.log('counselor changed:', newVal)
      if (newVal) {
        console.log('counselor.user:', newVal.user)
      }
    }, { deep: true, immediate: true })


    onMounted(() => {
      fetchCounselorInfo()
    })

    return {
      counselor,
      form,
      formRef,
      availableTimeSlots,
      disabledDate,
      rules,
      submitting,
      submitAppointment,
      goBack,
      getAvatarUrl,
      handleAvatarError,
      zhCn
    }
  }
}
</script>

<style scoped>
.appointment-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.appointment-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background-color: #fff;
  padding: 15px 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.counselor-card {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin: 20px 0 30px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: linear-gradient(to right, #f8f9fa, #fff);
}

.counselor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.counselor-avatar {
  flex-shrink: 0;
}

.counselor-avatar :deep(.el-avatar) {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.counselor-info {
  flex: 1;
}

.counselor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.counselor-name {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.counselor-title {
  color: #409EFF;
  font-size: 15px;
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.counselor-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 15px;
}

.stat-item .el-icon {
  color: #f0a500;
  font-size: 18px;
}

.counselor-expertise {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.counselor-expertise .label {
  color: #606266;
  font-size: 15px;
  white-space: nowrap;
  padding-top: 2px;
}

.counselor-expertise .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.expertise-tag {
  border-radius: 4px;
  padding: 0 12px;
  height: 28px;
  line-height: 26px;
  font-size: 14px;
  margin-right: 0;  /* 移除标签右边距 */
}

.expertise-tag:deep(.el-tag--primary) {
  --el-tag-bg-color: rgba(64, 158, 255, 0.1);
  --el-tag-border-color: var(--el-color-primary-light-7);
  --el-tag-hover-color: var(--el-color-primary);
}

.appointment-form {
  padding: 20px 0;
}

.appointment-notice {
  margin-top: 30px;
  background-color: #fdf6ec;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #faecd8;
}

.appointment-notice h4 {
  color: #e6a23c;
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
}

.appointment-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.8;
}

.appointment-notice li {
  margin-bottom: 8px;
}

.appointment-notice li:last-child {
  margin-bottom: 0;
}
</style> 
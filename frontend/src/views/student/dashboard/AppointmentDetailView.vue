<template>
  <div class="appointment-detail-view">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>预约详情</span>
          <div class="header-actions">
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="预约状态">
          <el-tag :type="getStatusType(appointment.status)">
            {{ getStatusText(appointment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约编号">
          {{ appointment.id }}
        </el-descriptions-item>
        <el-descriptions-item label="预约日期">
          {{ formatDate(appointment.schedule?.date) }}
        </el-descriptions-item>
        <el-descriptions-item label="时间段">
          {{ appointment.schedule?.time_slot }}
        </el-descriptions-item>
        <el-descriptions-item label="咨询师">
          {{ appointment.counselor?.real_name }}
        </el-descriptions-item>
        <el-descriptions-item label="咨询方式">
          <el-tag :type="appointment.type === 'online' ? 'success' : 'warning'">
            {{ appointment.type === 'online' ? '线上咨询' : '线下咨询' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item 
          :label="appointment.type === 'online' ? '聊天室' : '咨询地点'"
        >
          <template v-if="appointment.type === 'online'">
            <template v-if="appointment.online_meeting_url">
              <el-link 
                type="primary" 
                @click="enterChatRoom"
              >
                进入聊天室
              </el-link>
            </template>
            <template v-else>
              <el-tag type="info">待分配线上聊天室</el-tag>
            </template>
          </template>
          <template v-else>
            <template v-if="appointment.room_number">
              {{ appointment.room_number }}
            </template>
            <template v-else>
              <el-tag type="info">待分配线下咨询室</el-tag>
            </template>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="咨询时长">
          {{ appointment.duration || '50' }}分钟
        </el-descriptions-item>
        <el-descriptions-item label="是否匿名">
          <el-tag size="small" :type="appointment.is_anonymous ? 'info' : 'success'">
            {{ appointment.is_anonymous ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" >
          {{ formatDateTime(appointment.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="咨询问题" :span="2">
          {{ appointment.description }}
        </el-descriptions-item>
        <template v-if="appointment.status === 'cancelled'">
          <el-descriptions-item label="取消原因" :span="2">
            {{ appointment.cancel_reason || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="取消人">
            {{ getCancelledBy(appointment.cancelled_by) }}
          </el-descriptions-item>
          <el-descriptions-item label="取消时间">
            {{ formatDateTime(appointment.cancelled_at) }}
          </el-descriptions-item>
        </template>
        <template v-if="appointment.status === 'completed'">
          <!-- 先显示咨询记录 -->
          <template v-if="appointment.notes">
            <el-descriptions-item label="咨询记录" :span="2">
              <div class="text-content">
                {{ appointment.notes }}
              </div>
            </el-descriptions-item>
          </template>
          <!-- 再显示评价内容 -->
          <template v-if="appointment.rating">
            <el-descriptions-item label="评分" :span="2">
              <el-rate v-model="appointment.rating" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="反馈内容" :span="2">
              <div class="text-content">{{ appointment.feedback }}</div>
            </el-descriptions-item>
          </template>
        </template>
      </el-descriptions>

      <div class="actions" v-if="['pending', 'confirmed'].includes(appointment.status)">
        <el-button type="danger" @click="handleCancelClick">取消预约</el-button>
      </div>
    </el-card>

    <!-- 评价卡片 -->
    <el-card v-if="appointment.status === 'completed' && !appointment.rating" class="review-card">
      <template #header>
        <div class="card-header">
          <span>咨询评价</span>
        </div>
      </template>
      
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="评分" required>
          <el-rate v-model="feedbackForm.rating" />
        </el-form-item>
        <el-form-item label="反馈" required>
          <el-input
            v-model="feedbackForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请分享您的咨询体验..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitFeedback">提交评价</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 取消预约对话框 -->
    <el-dialog
      v-model="showCancelDialog"
      title="取消预约"
      width="500px"
      destroy-on-close
    >
      <el-form :model="cancelForm" label-width="80px">
        <el-form-item label="取消原因" required>
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消预约的原因..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCancelDialog = false">返回</el-button>
          <el-button type="danger" @click="confirmCancel">确认取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 在线咨询聊天室 -->
    <el-dialog
      v-model="showChatRoom"
      title="在线咨询"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      class="chat-dialog"
    >
      <ChatRoom
        :appointment-id="appointment.id"
        :receiver-id="appointment.counselor_id"
      />
      <template #footer>
        <el-button @click="showChatRoom = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatDate, formatDateTime } from '@/utils/date'
import appointmentService from '@/services/appointment.service'
import ChatRoom from '@/components/chat/ChatRoom.vue'
import socketService from '@/services/socket.service'
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  name: 'AppointmentDetailView',
  components: {
    ChatRoom
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const appointment = ref({})
    const showCancelDialog = ref(false)
    const cancelForm = ref({
      reason: ''
    })
    const feedbackForm = ref({
      rating: 0,
      feedback: ''
    })
    const loading = ref(true)

    // 获取当前用户信息
    const store = useStore()
    const currentUser = computed(() => store.state.auth.user)
    const showChatRoom = ref(false)

    // 获取预约详情
    const fetchAppointmentDetail = async (id) => {
      try {
        loading.value = true
        const response = await appointmentService.getAppointmentDetail(id)
        appointment.value = response
      } catch (error) {
        console.error('获取预约详情失败:', error)
        ElMessage.error('获取预约详情失败')
      } finally {
        loading.value = false
      }
    }

    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          fetchAppointmentDetail(newId)
        }
      }
    )

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        pending: 'warning',
        confirmed: 'success',
        completed: 'info',
        cancelled: 'danger'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
      }
      return texts[status] || status
    }

    // 获取取消人文本
    const getCancelledBy = (cancelledBy) => {
      const texts = {
        student: '学生',
        counselor: '咨询师',
        system: '系统'
      }
      return texts[cancelledBy] || cancelledBy
    }

    // 处理取消按钮点击
    const handleCancelClick = async () => {
      try {
        // 先检查是否可以取消预约
        await appointmentService.checkCancellable(appointment.value.id)
        // 如果可以取消，显示取消对话框
        showCancelDialog.value = true
      } catch (error) {
        ElMessage.error(error.message || '无法取消预约')
      }
    }

    // 确认取消预约
    const confirmCancel = async () => {
      try {
        if (!cancelForm.value.reason.trim()) {
          ElMessage.warning('请输入取消原因')
          return
        }

        await appointmentService.updateAppointmentStatus(appointment.value.id, {
          status: 'cancelled',
          cancel_reason: cancelForm.value.reason,
          cancelled_by: 'student'
        })

        ElMessage.success('预约已取消')
        showCancelDialog.value = false
        await fetchAppointmentDetail(route.params.id)
      } catch (error) {
        console.error('取消预约失败:', error)
        ElMessage.error(error.message || '取消预约失败')
      }
    }

    // 提交评价
    const submitFeedback = async () => {
      try {
        if (!feedbackForm.value.rating) {
          ElMessage.warning('请选择评分')
          return
        }
        if (!feedbackForm.value.feedback.trim()) {
          ElMessage.warning('请填写反馈内容')
          return
        }

        await appointmentService.submitReview(appointment.value.id, {
          rating: feedbackForm.value.rating,
          feedback: feedbackForm.value.feedback
        })

        ElMessage.success('评价提交成功')
        await fetchAppointmentDetail(route.params.id)
      } catch (error) {
        console.error('提交评价失败:', error)
        ElMessage.error(error.message || '提交评价失败')
      }
    }

    // 进入聊天室
    const enterChatRoom = () => {
      showChatRoom.value = true
    }

    onMounted(() => {
      if (route.params.id) {
        fetchAppointmentDetail(route.params.id)
      }
      // 如果预约已确认且是在线咨询，连接WebSocket
      if (appointment.value?.status === 'confirmed' && appointment.value?.type === 'online') {
        socketService.connect(currentUser.value.accessToken)
      }
    })

    onUnmounted(() => {
      // 断开WebSocket连接
      socketService.disconnect()
    })

    return {
      appointment,
      showCancelDialog,
      cancelForm,
      feedbackForm,
      formatDate,
      formatDateTime,
      goBack,
      getStatusType,
      getStatusText,
      getCancelledBy,
      handleCancelClick,
      confirmCancel,
      submitFeedback,
      enterChatRoom,
      showChatRoom
    }
  }
}
</script>

<style scoped>
.appointment-detail-view {
  padding: 20px;
}

.detail-card,
.review-card {
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

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

:deep(.el-descriptions) {
  margin-bottom: 16px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}

.chat-dialog {
  :deep(.el-dialog__body) {
    height: 70vh;
    padding: 0;
  }
}
</style> 
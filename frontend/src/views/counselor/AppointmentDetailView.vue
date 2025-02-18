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
        <el-descriptions-item label="学生姓名">
          {{ appointment.is_anonymous ? '匿名用户' : appointment.student?.real_name }}
        </el-descriptions-item>
        <el-descriptions-item label="咨询方式">
          <el-tag :type="appointment.type === 'online' ? 'success' : 'warning'">
            {{ appointment.type === 'online' ? '线上咨询' : '线下咨询' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="咨询地点" :span="2" v-if="appointment.type === 'offline' && appointment.room_number">
          {{ appointment.room_number }}
        </el-descriptions-item>
        <el-descriptions-item label="聊天室" v-if="appointment.type === 'online' && appointment.online_meeting_url">
          <el-link type="primary" @click="enterChatRoom">
            进入聊天室
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="咨询时长">
          {{ appointment.duration }}分钟
        </el-descriptions-item>
        <el-descriptions-item label="是否匿名">
          <el-tag size="small" :type="appointment.is_anonymous ? 'info' : 'success'">
            {{ appointment.is_anonymous ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" >
          {{ formatDateTime(appointment.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式" :span="2" v-if="!appointment.is_anonymous">
          <div>电话：{{ appointment.student?.phone }}</div>
          <div>邮箱：{{ appointment.student?.email }}</div>
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
            <el-descriptions-item label="评价内容" :span="2">
              <div class="text-content">{{ appointment.feedback }}</div>
            </el-descriptions-item>
          </template>
        </template>
      </el-descriptions>

      <div class="action-buttons" v-if="appointment.status === 'pending'">
        <el-button type="success" @click="showConfirmDialog">确认预约</el-button>
        <el-button type="danger" @click="rejectAppointment">拒绝预约</el-button>
      </div>
    </el-card>

    <!-- 确认预约对话框 -->
    <el-dialog
      v-model="confirmDialog.visible"
      title="确认预约"
      width="500px"
    >
      <el-form
        ref="confirmForm"
        :model="confirmDialog.form"
        :rules="confirmDialog.rules"
        label-width="100px"
        v-if="appointment.type === 'offline'"
      >
        <el-form-item label="咨询室" prop="room_number">
          <el-input 
            v-model="confirmDialog.form.room_number"
            placeholder="请输入咨询室房间号"
          />
        </el-form-item>
      </el-form>
      <template v-else>
        <p>确认后系统将自动为您创建线上咨询室。</p>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 拒绝预约对话框 -->
    <el-dialog
      v-model="rejectDialog.visible"
      title="拒绝预约"
      width="500px"
    >
      <el-form :model="rejectDialog.form" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectDialog.form.reason"
            type="textarea"
            rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleReject">确认</el-button>
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
        :receiver-id="appointment.student_id"
      />
      <template #footer>
        <el-button @click="showChatRoom = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加咨询记录表单 -->
    <el-card v-if="appointment.status === 'completed' && !appointment.notes" class="notes-form">
      <template #header>
        <div class="card-header">
          <span>填写咨询记录</span>
        </div>
      </template>
      <el-form :model="notesForm" label-width="100px">
        <el-form-item label="咨询记录">
          <el-input
            v-model="notesForm.notes"
            type="textarea"
            :rows="6"
            placeholder="请记录本次咨询的主要内容、观察和建议..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitNotes" :loading="submittingNotes">
            提交记录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import appointmentService from '@/services/appointment.service'
import { formatDate, formatDateTime } from '@/utils/date'
import ChatRoom from '@/components/chat/ChatRoom.vue'
import socketService from '@/services/socket.service'
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  name: 'CounselorAppointmentDetailView',
  components: {
    ChatRoom
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const appointment = ref({})
    const rejectDialog = ref({
      visible: false,
      form: {
        reason: ''
      }
    })
    const confirmDialog = ref({
      visible: false,
      form: {
        room_number: ''
      },
      rules: {
        room_number: [
          { required: true, message: '请输入咨询室房间号', trigger: 'blur' }
        ]
      }
    })
    const store = useStore()
    const currentUser = computed(() => store.state.auth.user)
    const showChatRoom = ref(false)
    const loading = ref(true)
    const notesForm = ref({
      notes: ''
    });
    const submittingNotes = ref(false);

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

    // 显示确认对话框
    const showConfirmDialog = () => {
      confirmDialog.value.visible = true
    }

    // 处理确认预约
    const handleConfirm = async () => {
      if (appointment.value.type === 'offline') {
        if (!confirmDialog.value.form.room_number) {
          ElMessage.warning('请输入咨询室房间号')
          return
        }
      }

      try {
        console.log('确认预约，发送数据:', {
          status: 'confirmed',
          room_number: appointment.value.type === 'offline' ? confirmDialog.value.form.room_number : undefined
        })

        const response = await appointmentService.updateAppointmentStatus(
          appointment.value.id,
          {
            status: 'confirmed',
            room_number: appointment.value.type === 'offline' ? confirmDialog.value.form.room_number : undefined
          }
        )
        
        console.log('确认预约响应:', response)
        ElMessage.success('已确认预约')
        confirmDialog.value.visible = false
        confirmDialog.value.form.room_number = ''  // 重置表单
        fetchAppointmentDetail(route.params.id)
      } catch (error) {
        console.error('确认预约失败:', error)
        ElMessage.error(error.response?.data?.message || '确认预约失败')
      }
    }

    // 拒绝预约
    const rejectAppointment = () => {
      rejectDialog.value.visible = true
    }

    // 处理拒绝预约
    const handleReject = async () => {
      if (!rejectDialog.value.form.reason) {
        ElMessage.warning('请输入拒绝原因')
        return
      }

      try {
        await appointmentService.updateAppointmentStatus(
          appointment.value.id,
          {
            status: 'cancelled',
            cancel_reason: rejectDialog.value.form.reason,
            cancelled_by: 'counselor'
          }
        )
        ElMessage.success('已拒绝预约')
        rejectDialog.value.visible = false
        rejectDialog.value.form.reason = ''
        fetchAppointmentDetail(route.params.id)
      } catch (error) {
        console.error('拒绝预约失败:', error)
        ElMessage.error('拒绝预约失败')
      }
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

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 进入聊天室
    const enterChatRoom = () => {
      showChatRoom.value = true
    }

    // 提交咨询记录
    const submitNotes = async () => {
      if (!notesForm.value.notes.trim()) {
        ElMessage.warning('请填写咨询记录');
        return;
      }

      try {
        submittingNotes.value = true;
        await appointmentService.submitNotes(appointment.value.id, {
          notes: notesForm.value.notes
        });
        ElMessage.success('咨询记录提交成功');
        // 重新加载预约详情
        await fetchAppointmentDetail(appointment.value.id);
      } catch (error) {
        console.error('提交咨询记录失败:', error);
        ElMessage.error(error.message || '提交咨询记录失败');
      } finally {
        submittingNotes.value = false;
      }
    };

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
      rejectDialog,
      confirmDialog,
      formatDate,
      formatDateTime,
      showConfirmDialog,
      handleConfirm,
      rejectAppointment,
      handleReject,
      getStatusType,
      getStatusText,
      getCancelledBy,
      goBack,
      enterChatRoom,
      showChatRoom,
      notesForm,
      submittingNotes,
      submitNotes
    }
  }
}
</script>

<style scoped>
.appointment-detail-view {
  padding: 20px;
}

.detail-card {
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

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
  width: 120px;
}

.chat-dialog {
  :deep(.el-dialog__body) {
    height: 70vh;
    padding: 0;
  }
}

.notes-form {
  margin-top: 20px;
}
</style> 
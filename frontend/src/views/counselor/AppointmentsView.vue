<template>
  <div class="appointments-view">
    <el-card class="appointments-card">
      <template #header>
        <div class="card-header">
          <span>预约管理</span>
          <el-radio-group v-model="status" @change="handleStatusChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待确认</el-radio-button>
            <el-radio-button label="confirmed">已确认</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
            <el-radio-button label="cancelled">已取消</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="appointments" style="width: 100%">
        <el-table-column prop="schedule.date" label="预约日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.schedule.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="schedule.time_slot" label="时间段" width="120" />
        <el-table-column prop="student.real_name" label="学生姓名" width="120">
          <template #default="{ row }">
            {{ row.is_anonymous ? '匿名用户' : row.student.real_name }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="咨询方式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'online' ? 'success' : 'warning'">
              {{ row.type === 'online' ? '线上' : '线下' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="咨询描述" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link
              @click="viewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>
    </el-card>

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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import appointmentService from '@/services/appointment.service'
import { formatDate } from '@/utils/date'

export default {
  name: 'CounselorAppointmentsView',
  setup() {
    const router = useRouter()
    const appointments = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const status = ref('')
    const rejectDialog = ref({
      visible: false,
      appointmentId: null,
      form: {
        reason: ''
      }
    })

    // 获取预约列表
    const fetchAppointments = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }
        if (status.value) {
          params.status = status.value
        }
        const response = await appointmentService.getAppointments(params)
        appointments.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('获取预约列表失败:', error)
        ElMessage.error('获取预约列表失败')
      }
    }

    // 确认预约
    const confirmAppointment = async (appointment) => {
      try {
        await ElMessageBox.confirm(
          '确认接受该预约请求吗？',
          '确认提示',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await appointmentService.updateAppointmentStatus(appointment.id, {
          status: 'confirmed'
        })
        ElMessage.success('已确认预约')
        fetchAppointments()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认预约失败:', error)
          ElMessage.error('确认预约失败')
        }
      }
    }

    // 拒绝预约
    const rejectAppointment = (appointment) => {
      rejectDialog.value.appointmentId = appointment.id
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
          rejectDialog.value.appointmentId,
          {
            status: 'cancelled',
            cancel_reason: rejectDialog.value.form.reason,
            cancelled_by: 'counselor'
          }
        )
        ElMessage.success('已拒绝预约')
        rejectDialog.value.visible = false
        rejectDialog.value.form.reason = ''
        fetchAppointments()
      } catch (error) {
        console.error('拒绝预约失败:', error)
        ElMessage.error('拒绝预约失败')
      }
    }

    // 查看详情
    const viewDetail = (appointment) => {
      router.push(`/counselor/appointments/${appointment.id}`)
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

    // 处理状态变化
    const handleStatusChange = () => {
      currentPage.value = 1
      fetchAppointments()
    }

    // 处理每页数量变化
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      fetchAppointments()
    }

    // 处理页码变化
    const handleCurrentChange = (val) => {
      currentPage.value = val
      fetchAppointments()
    }

    onMounted(() => {
      fetchAppointments()
    })

    return {
      appointments,
      currentPage,
      pageSize,
      total,
      status,
      rejectDialog,
      formatDate,
      confirmAppointment,
      rejectAppointment,
      handleReject,
      viewDetail,
      getStatusType,
      getStatusText,
      handleStatusChange,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.appointments-view {
  padding: 20px;
}

.appointments-card {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style> 
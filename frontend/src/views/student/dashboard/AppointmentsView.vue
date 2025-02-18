<template>
  <div class="appointments-view">
    <el-card class="appointments-card">
      <template #header>
        <div class="card-header">
          <span>预约记录</span>
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
        <el-table-column prop="counselor.real_name" label="咨询师" width="120" />
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
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/date'
import appointmentService from '@/services/appointment.service'

export default {
  name: 'AppointmentsView',
  setup() {
    const router = useRouter()
    const appointments = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const status = ref('')

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
      }
    }

    // 查看详情
    const viewDetail = (appointment) => {
      router.push(`/student/dashboard/appointments/${appointment.id}`)
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
      formatDate,
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
<template>
  <div class="dashboard-view">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.totalAppointments }}</div>
            <div class="stats-label">总预约数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #f0f9eb">
            <i class="fas fa-clock" style="color: #67c23a"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.pendingAppointments }}</div>
            <div class="stats-label">待确认预约</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #fdf6ec">
            <i class="fas fa-star" style="color: #e6a23c"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.rating }}</div>
            <div class="stats-label">平均评分</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #fef0f0">
            <i class="fas fa-thumbs-up" style="color: #f56c6c"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.satisfactionRate }}%</div>
            <div class="stats-label">满意度</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>预约统计</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- TODO: 添加预约统计图表 -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>评分分布</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- TODO: 添加评分分布图表 -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-row">
      <el-col :span="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近预约</span>
              <el-button type="primary" link @click="viewAllAppointments">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAppointments" style="width: 100%">
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
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import appointmentService from '@/services/appointment.service'
import { formatDate } from '@/utils/date'

export default {
  name: 'CounselorDashboardView',
  setup() {
    const router = useRouter()
    const stats = ref({
      totalAppointments: 0,
      pendingAppointments: 0,
      rating: 0,
      satisfactionRate: 0
    })
    const recentAppointments = ref([])

    // 获取统计数据
    const fetchStats = async () => {
      try {
        // TODO: 从后端获取统计数据
        stats.value = {
          totalAppointments: 120,
          pendingAppointments: 5,
          rating: 4.8,
          satisfactionRate: 98
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    // 获取最近预约
    const fetchRecentAppointments = async () => {
      try {
        const response = await appointmentService.getAppointments({
          page: 1,
          limit: 5
        })
        recentAppointments.value = response.data
      } catch (error) {
        console.error('获取最近预约失败:', error)
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

    // 查看详情
    const viewDetail = (appointment) => {
      router.push(`/counselor/appointments/${appointment.id}`)
    }

    // 查看全部预约
    const viewAllAppointments = () => {
      router.push('/counselor/appointments')
    }

    onMounted(() => {
      fetchStats()
      fetchRecentAppointments()
    })

    return {
      stats,
      recentAppointments,
      formatDate,
      getStatusType,
      getStatusText,
      viewDetail,
      viewAllAppointments
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stats-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stats-icon i {
  font-size: 32px;
  color: #409eff;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #999;
}

.chart-row {
  margin-top: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 100%;
}

.table-row {
  margin-top: 20px;
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
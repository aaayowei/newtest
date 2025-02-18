<template>
  <div class="dashboard-view">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.appointmentCount }}</div>
            <div class="stats-label">预约次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #f0f9eb">
            <i class="fas fa-clipboard-list" style="color: #67c23a"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.assessmentCount }}</div>
            <div class="stats-label">测评次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #fdf6ec">
            <i class="fas fa-book-reader" style="color: #e6a23c"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.articleCount }}</div>
            <div class="stats-label">阅读文章</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon" style="background-color: #fef0f0">
            <i class="fas fa-user" style="color: #f56c6c"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ profileCompleteness }}%</div>
            <div class="stats-label">信息完整度</div>
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
              <span>测评分析</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- TODO: 添加测评分析图表 -->
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
            <el-table-column prop="date" label="预约日期" width="120" />
            <el-table-column prop="time" label="预约时间" width="120" />
            <el-table-column prop="counselor" label="咨询师" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.status === '待咨询'"
                  type="primary" 
                  link 
                  @click="cancelAppointment(scope.row)"
                >
                  取消预约
                </el-button>
                <el-button 
                  v-if="scope.row.status === '已完成'"
                  type="primary" 
                  link 
                  @click="viewDetail(scope.row)"
                >
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'StudentDashboardView',
  setup() {
    const router = useRouter()
    const stats = ref({
      appointmentCount: 0,
      assessmentCount: 0,
      articleCount: 0
    })

    // 计算个人信息完整度
    const profileCompleteness = computed(() => {
      return 85 // TODO: 实现个人信息完整度计算
    })

    const recentAppointments = ref([
      {
        id: 1,
        date: '2024-01-20',
        time: '14:00-15:00',
        counselor: '张医生',
        status: '待咨询'
      },
      {
        id: 2,
        date: '2024-01-18',
        time: '10:00-11:00',
        counselor: '李医生',
        status: '已完成'
      }
    ])

    const getStatusType = (status) => {
      const types = {
        '待咨询': 'warning',
        '已完成': 'success',
        '已取消': 'info'
      }
      return types[status] || 'info'
    }

    const cancelAppointment = () => {
      ElMessage.success('预约已取消')
    }

    const viewDetail = (appointment) => {
      router.push(`/student/dashboard/appointments/${appointment.id}`)
    }

    const viewAllAppointments = () => {
      router.push('/student/dashboard/appointments')
    }

    onMounted(() => {
      // TODO: 获取统计数据
      stats.value = {
        appointmentCount: 5,
        assessmentCount: 8,
        articleCount: 15
      }
    })

    return {
      stats,
      profileCompleteness,
      recentAppointments,
      getStatusType,
      cancelAppointment,
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
  align-items: center;
  justify-content: space-between;
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style> 
<template>
  <div class="dashboard-view">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.totalUsers }}</div>
            <div class="stats-label">总用户数</div>
          </div>
        </el-card>
      </el-col>
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
          <div class="stats-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.totalAssessments }}</div>
            <div class="stats-label">总测评数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-newspaper"></i>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.totalArticles }}</div>
            <div class="stats-label">总文章数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 用户增长趋势图表 -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>预约统计</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 预约统计图表 -->
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
            </div>
          </template>
          <el-table :data="recentAppointments" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="student" label="学生" />
            <el-table-column prop="counselor" label="咨询师" />
            <el-table-column prop="date" label="预约日期" />
            <el-table-column prop="time" label="预约时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboardView',
  data() {
    return {
      stats: {
        totalUsers: 1234,
        totalAppointments: 567,
        totalAssessments: 890,
        totalArticles: 123
      },
      recentAppointments: [
        {
          id: 1,
          student: '张三',
          counselor: '李医生',
          date: '2024-01-15',
          time: '14:00-15:00',
          status: '待咨询'
        },
        {
          id: 2,
          student: '李四',
          counselor: '王医生',
          date: '2024-01-15',
          time: '15:00-16:00',
          status: '已完成'
        },
        {
          id: 3,
          student: '王五',
          counselor: '张医生',
          date: '2024-01-16',
          time: '09:00-10:00',
          status: '已取消'
        }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const types = {
        '待咨询': 'warning',
        '已完成': 'success',
        '已取消': 'info'
      }
      return types[status] || 'info'
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
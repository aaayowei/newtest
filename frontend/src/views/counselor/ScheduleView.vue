<template>
  <div class="schedule-manage">
    <el-card class="schedule-manage-card">
      <template #header>
        <div class="card-header">
          <span>我的排班情况</span>
          <div class="header-controls">
            <el-date-picker
              v-model="currentMonth"
              type="month"
              format="YYYY年M月"
              value-format="YYYY-MM"
              :clearable="false"
              @change="handleMonthChange"
            />
          </div>
        </div>
      </template>

      <!-- 排班表格 -->
      <div class="schedule-table-container">
        <div class="month-header">
          <h3>{{ currentMonth }} 排班表</h3>
          <div class="month-controls">
            <el-button-group>
              <el-button @click="changeMonth(-1)">上个月</el-button>
              <el-button @click="goToCurrentMonth">本月</el-button>
              <el-button @click="changeMonth(1)">下个月</el-button>
            </el-button-group>
          </div>
        </div>
        
        <el-table :data="getMonthScheduleData()" border style="width: 100%">
          <el-table-column prop="date" label="日期" width="120">
            <template #default="{ row }">
              <div :class="{ 'is-today': isToday(row.date) }">
                {{ formatDisplayDate(row.date) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="weekday" label="星期" width="100">
            <template #default="{ row }">
              {{ getWeekdayText(new Date(row.date).getDay()) }}
            </template>
          </el-table-column>
          <el-table-column label="排班时间段">
            <template #default="{ row }">
              <div class="schedule-slots-container">
                <template v-if="row.schedules.length > 0">
                  <el-tag
                    v-for="schedule in row.schedules"
                    :key="schedule.id"
                    :type="getScheduleTagType(schedule.status)"
                    class="schedule-tag"
                    @click="handleScheduleClick(schedule)"
                  >
                    {{ schedule.time_slot }}
                  </el-tag>
                </template>
                <span v-else class="no-schedule-text">
                  无排班数据
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 图例说明 -->
      <div class="schedule-legend">
        <div class="legend-item">
          <el-tag type="success" size="small">09:00-10:00</el-tag>
          <span>可预约时间段</span>
        </div>
        <div class="legend-item">
          <el-tag type="warning" size="small">10:00-11:00</el-tag>
          <span>已被预约</span>
        </div>
      </div>
    </el-card>

    <!-- 查看预约详情对话框 -->
    <el-dialog
      v-model="scheduleDetailDialog.visible"
      title="预约详情"
      width="400px"
    >
      <div v-if="scheduleDetailDialog.schedule">
        <p>日期：{{ scheduleDetailDialog.schedule.date }}</p>
        <p>时间段：{{ scheduleDetailDialog.schedule.time_slot }}</p>
        <p>状态：{{ getScheduleStatusText(scheduleDetailDialog.schedule.status) }}</p>
        <template v-if="scheduleDetailDialog.schedule.appointment">
          <p v-if="!scheduleDetailDialog.schedule.appointment.is_anonymous">
            预约学生：{{ scheduleDetailDialog.schedule.appointment.student.real_name }}
          </p>
          <p v-else>预约学生：匿名预约</p>
          <p>咨询问题：{{ scheduleDetailDialog.schedule.appointment.description }}</p>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scheduleDetailDialog.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/date'
import scheduleService from '@/services/schedule.service'

export default {
  name: 'ScheduleView',
  setup() {
    // 日历相关
    const currentDate = ref(new Date())
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const currentMonth = ref(`${year}-${month}`)
    const schedules = ref([])

    // 预约详情对话框
    const scheduleDetailDialog = ref({
      visible: false,
      schedule: null
    })

    // 获取月份数据
    const getMonthScheduleData = () => {
      if (!currentMonth.value) return []
      
      const [year, month] = currentMonth.value.split('-')
      if (!year || !month) {
        console.error('无效的月份格式:', currentMonth.value)
        return []
      }

      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
      const monthData = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${month}-${String(day).padStart(2, '0')}`
        // 对每个时间段只保留最新的记录
        const daySchedules = schedules.value
          .filter(s => s.date === date)
          .reduce((unique, schedule) => {
            const existingIndex = unique.findIndex(s => s.time_slot === schedule.time_slot)
            if (existingIndex >= 0) {
              // 如果已存在相同时间段，使用最新的记录
              const existing = unique[existingIndex]
              const current = schedule
              
              // 比较更新时间，使用最新的记录
              if (new Date(current.updated_at) > new Date(existing.updated_at)) {
                // 如果新记录是已预约状态，保留最新的预约信息
                if (current.status === 'booked' && current.appointment) {
                  unique[existingIndex] = current
                }
                // 如果新记录是可预约状态，且旧记录是已预约状态，保留旧记录
                else if (current.status === 'available' && existing.status === 'booked') {
                  // 保持旧记录不变
                }
                // 其他情况使用新记录
                else {
                  unique[existingIndex] = current
                }
              }
            } else {
              unique.push(schedule)
            }
            return unique
          }, [])
          .sort((a, b) => a.time_slot.localeCompare(b.time_slot))

        monthData.push({
          date,
          schedules: daySchedules
        })
      }

      return monthData
    }

    // 格式化显示日期
    const formatDisplayDate = (date) => {
      return date.split('-')[2] + '日'
    }

    // 获取星期文本
    const getWeekdayText = (day) => {
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      return '星期' + weekdays[day]
    }

    // 切换月份
    const changeMonth = (offset) => {
      const [year, month] = currentMonth.value.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1 + offset, 1)
      const newYear = date.getFullYear()
      const newMonth = String(date.getMonth() + 1).padStart(2, '0')
      currentMonth.value = `${newYear}-${newMonth}`
      handleMonthChange()
    }

    // 跳转到当前月份
    const goToCurrentMonth = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      currentMonth.value = `${year}-${month}`
      handleMonthChange()
    }

    // 获取排班状态对应的标签类型
    const getScheduleTagType = (status) => {
      const statusMap = {
        'available': 'success',
        'booked': 'warning',
        'unavailable': 'info'
      }
      return statusMap[status] || 'info'
    }

    // 获取排班状态文本
    const getScheduleStatusText = (status) => {
      const texts = {
        available: '可预约',
        booked: '已预约',
        unavailable: '不可用'
      }
      return texts[status] || status
    }

    // 处理月份变化
    const handleMonthChange = async () => {
      await fetchSchedules()
    }

    // 处理排班点击
    const handleScheduleClick = (schedule) => {
      // 如果排班已被取消，清除相关的预约信息
      if (schedule.status === 'available') {
        schedule.appointment = null
      } else if (schedule.status === 'booked' && schedule.appointment) {
        // 确保显示最新的预约信息
        const latestSchedule = schedules.value
          .filter(s => 
            s.date === schedule.date && 
            s.time_slot === schedule.time_slot &&
            s.appointment
          )
          .sort((a, b) => new Date(b.appointment.updated_at) - new Date(a.appointment.updated_at))[0]

        if (latestSchedule) {
          schedule.appointment = latestSchedule.appointment
        }
      }
      
      scheduleDetailDialog.value.schedule = schedule
      scheduleDetailDialog.value.visible = true
    }

    // 获取排班数据
    const fetchSchedules = async () => {
      try {
        const [year, month] = currentMonth.value.split('-')
        if (!year || !month) {
          console.error('无效的月份格式:', currentMonth.value)
          return
        }

        const response = await scheduleService.getMyCounselorSchedules(year, month)
        schedules.value = response.data
      } catch (error) {
        console.error('获取排班数据失败:', error)
        ElMessage.error('获取排班数据失败')
      }
    }

    // 判断是否是今天
    const isToday = (date) => {
      const today = formatDate(new Date())
      return date === today
    }

    // 初始化
    fetchSchedules()

    return {
      currentDate,
      currentMonth,
      schedules,
      scheduleDetailDialog,
      getMonthScheduleData,
      formatDisplayDate,
      getWeekdayText,
      changeMonth,
      goToCurrentMonth,
      getScheduleTagType,
      getScheduleStatusText,
      handleMonthChange,
      handleScheduleClick,
      isToday
    }
  }
}
</script>

<style scoped>
.schedule-manage {
  padding: 20px;
}

.schedule-manage-card {
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

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.schedule-table-container {
  margin: 20px 0;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-header h3 {
  margin: 0;
}

.schedule-slots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}

.schedule-tag {
  cursor: pointer;
}

.schedule-tag:hover {
  opacity: 0.8;
}

.is-today {
  color: var(--el-color-primary);
  font-weight: bold;
}

.schedule-legend {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-schedule-text {
  color: #999;
  font-size: 14px;
  padding: 8px;
}
</style> 
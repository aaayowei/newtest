<template>
  <div class="schedule-manage">
    <!-- 咨询师列表卡片 -->
    <el-card class="counselor-list-card" v-if="!selectedCounselor">
      <template #header>
        <div class="card-header">
          <span>咨询师列表</span>
          <div class="header-controls">
            <el-input
              v-model="searchQuery"
              placeholder="搜索咨询师（咨询师ID/姓名/职称/专业领域）"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
              class="search-input"
            />
          </div>
        </div>
      </template>

      <el-table :data="filteredCounselors" style="width: 100%">
        <el-table-column prop="id" label="咨询师ID" width="100" align="center" />
        <el-table-column prop="user.real_name" label="姓名" width="120" />
        <el-table-column prop="title" label="职称" width="150" />
        <el-table-column prop="expertise" label="专业领域" />
        <el-table-column prop="consultation_count" label="咨询次数" width="100" align="center" />
        <el-table-column prop="rating" label="评分" width="100" align="center">
          <template #default="scope">
            {{ scope.row.rating ? scope.row.rating.toFixed(1) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button 
              type="primary" 
              link
              @click="handleSelectCounselor(scope.row)"
            >
              排班管理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="totalCounselors"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 排班管理卡片 -->
    <el-card v-else class="schedule-manage-card">
      <template #header>
        <div class="card-header">
          <div class="counselor-info">
            <el-button link @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-divider direction="vertical" />
            <span>{{ selectedCounselorName }} 的排班管理</span>
          </div>
          <div class="header-controls">
            <el-button type="primary" @click="openBatchScheduleDialog">
              批量排班
            </el-button>
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

      <!-- 排班管理表格 -->
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
                <el-button 
                  v-if="!isPastDate(row.date)"
                  link
                  type="primary"
                  size="small"
                  @click="openAddScheduleDialog(row.date)"
                >
                  添加时间段
                </el-button>
                <span v-else-if="row.schedules.length === 0" class="no-schedule-text">
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

    <!-- 添加时间段对话框 -->
    <el-dialog
      v-model="addScheduleDialog.visible"
      :title="addScheduleDialog.title"
      width="400px"
    >
      <el-form :model="addScheduleDialog.form">
        <el-form-item label="日期">
          <el-date-picker
            v-model="addScheduleDialog.form.date"
            type="date"
            format="YYYY-MM-DD"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="时间段">
          <el-select
            v-model="addScheduleDialog.form.timeSlots"
            multiple
            placeholder="请选择时间段"
            style="width: 100%"
          >
            <el-option
              v-for="slot in availableTimeSlots"
              :key="slot.value"
              :label="slot.label"
              :value="slot.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addScheduleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSchedule">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量排班对话框 -->
    <el-dialog
      v-model="batchScheduleDialog.visible"
      title="批量排班"
      width="600px"
    >
      <el-form :model="batchScheduleDialog.form" label-width="100px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="batchScheduleDialog.form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="工作日">
          <el-checkbox-group v-model="batchScheduleDialog.form.workdays">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="时间段">
          <el-checkbox-group v-model="batchScheduleDialog.form.timeSlots">
            <el-checkbox
              v-for="slot in availableTimeSlots"
              :key="slot.value"
              :label="slot.value"
            >
              {{ slot.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchScheduleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSchedule">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
          <el-button
            v-if="canCancelSchedule(scheduleDetailDialog.schedule)"
            type="danger"
            @click="handleCancelSchedule(scheduleDetailDialog.schedule)"
          >
            取消排班
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import scheduleService from '@/services/schedule.service'
import counselorService from '@/services/counselor.service'

export default {
  name: 'ScheduleManageView',
  components: {
    ArrowLeft
  },
  setup() {
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalCounselors = ref(0)

    // 搜索相关
    const searchQuery = ref('')
    const filteredCounselors = computed(() => {
      if (!searchQuery.value) return counselors.value
      const query = searchQuery.value.toLowerCase()
      const filtered = counselors.value.filter(counselor => 
        counselor.user.real_name.toLowerCase().includes(query) ||
        (counselor.title && counselor.title.toLowerCase().includes(query)) ||
        (counselor.expertise && counselor.expertise.toLowerCase().includes(query)) ||
        counselor.id.toString().includes(query)
      )
      return filtered.sort((a, b) => a.id - b.id)
    })

    // 日历相关
    const currentDate = ref(new Date())
    const currentMonth = ref(formatDate(new Date()).substring(0, 7))  // 格式：YYYY-MM
    const schedules = ref([])
    const counselors = ref([])
    const selectedCounselor = ref(null)
    const selectedCounselorName = computed(() => {
      if (!selectedCounselor.value) return ''
      const counselor = counselors.value.find(c => c.id === selectedCounselor.value)
      return counselor ? `${counselor.user.real_name} (${counselor.title || '咨询师'})` : ''
    })

    // 返回列表
    const handleBack = () => {
      selectedCounselor.value = null
      schedules.value = []
    }

    // 选择咨询师
    const handleSelectCounselor = (counselor) => {
      selectedCounselor.value = counselor.id
      // 确保月份格式正确
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      currentMonth.value = `${year}-${month}`
      fetchSchedules()
    }

    // 搜索处理
    const handleSearch = () => {
      // 实时过滤，无需额外处理
    }

    // 可选时间段
    const availableTimeSlots = [
      { label: '09:00-10:00', value: '09:00-10:00' },
      { label: '10:00-11:00', value: '10:00-11:00' },
      { label: '14:00-15:00', value: '14:00-15:00' },
      { label: '15:00-16:00', value: '15:00-16:00' },
      { label: '16:00-17:00', value: '16:00-17:00' }
    ]

    // 添加时间段对话框
    const addScheduleDialog = ref({
      visible: false,
      title: '',
      form: {
        date: null,
        timeSlots: []
      }
    })

    // 批量排班对话框
    const batchScheduleDialog = ref({
      visible: false,
      form: {
        dateRange: null,
        workdays: ['1', '2', '3', '4', '5'],
        timeSlots: []
      }
    })

    // 预约详情对话框
    const scheduleDetailDialog = ref({
      visible: false,
      schedule: null
    })

    // 获取咨询师列表
    const fetchCounselors = async () => {
      try {
        const response = await counselorService.getCounselors({
          page: currentPage.value,
          limit: pageSize.value,
        })
        counselors.value = response.data.sort((a, b) => a.id - b.id)
        totalCounselors.value = response.total
      } catch (error) {
        console.error('获取咨询师列表失败:', error)
        ElMessage.error('获取咨询师列表失败')
      }
    }

    // 获取选中咨询师姓名
    const getSelectedCounselorName = () => {
      const counselor = counselors.value.find(c => c.id === selectedCounselor.value)
      return counselor ? counselor.real_name : ''
    }

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

    // 判断是否可以取消排班
    const canCancelSchedule = (schedule) => {
      if (!schedule) return false
      return schedule.status === 'available'
    }

    // 处理咨询师变化
    const handleCounselorChange = async () => {
      await fetchSchedules()
    }

    // 处理月份变化
    const handleMonthChange = async () => {
      await fetchSchedules()
    }

    // 打开添加时间段对话框
    const openAddScheduleDialog = (date) => {
      addScheduleDialog.value.title = `添加排班 - ${date}`
      addScheduleDialog.value.form.date = date
      addScheduleDialog.value.form.timeSlots = []
      addScheduleDialog.value.visible = true
    }

    // 打开批量排班对话框
    const openBatchScheduleDialog = () => {
      batchScheduleDialog.value.form = {
        dateRange: null,
        workdays: ['1', '2', '3', '4', '5'],
        timeSlots: []
      }
      batchScheduleDialog.value.visible = true
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
      if (!selectedCounselor.value || !currentMonth.value) return

      try {
        const [year, month] = currentMonth.value.split('-')
        if (!year || !month) {
          console.error('无效的月份格式:', currentMonth.value)
          return
        }

        console.log('fetchSchedules - 请求参数:', {
          year,
          month,
          counselorId: selectedCounselor.value
        })
        
        const response = await scheduleService.getSchedules(year, month, selectedCounselor.value)
        schedules.value = response.data
      } catch (error) {
        console.error('获取排班数据失败:', error)
        ElMessage.error('获取排班数据失败')
      }
    }

    // 添加排班
    const handleAddSchedule = async () => {
      try {
        const { date, timeSlots } = addScheduleDialog.value.form
        await scheduleService.addSchedules(selectedCounselor.value, date, timeSlots)
        ElMessage.success('添加排班成功')
        addScheduleDialog.value.visible = false
        await fetchSchedules()
      } catch (error) {
        console.error('添加排班失败:', error)
        ElMessage.error('添加排班失败')
      }
    }

    // 批量排班
    const handleBatchSchedule = async () => {
      try {
        const { dateRange, workdays, timeSlots } = batchScheduleDialog.value.form
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
          return ElMessage.warning('请选择日期范围')
        }
        if (workdays.length === 0) {
          return ElMessage.warning('请选择工作日')
        }
        if (timeSlots.length === 0) {
          return ElMessage.warning('请选择时间段')
        }

        await scheduleService.batchAddSchedules({
          counselorId: selectedCounselor.value,
          startDate: formatDate(dateRange[0]),
          endDate: formatDate(dateRange[1]),
          workdays: workdays.map(Number),
          timeSlots
        })
        ElMessage.success('批量排班成功')
        batchScheduleDialog.value.visible = false
        await fetchSchedules()
      } catch (error) {
        console.error('批量排班失败:', error)
        ElMessage.error('批量排班失败')
      }
    }

    // 取消排班
    const handleCancelSchedule = async (schedule) => {
      try {
        await scheduleService.cancelSchedule(schedule.id)
        ElMessage.success('取消排班成功')
        scheduleDetailDialog.value.visible = false
        await fetchSchedules()
      } catch (error) {
        console.error('取消排班失败:', error)
        ElMessage.error('取消排班失败')
      }
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      fetchCounselors()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      fetchCounselors()
    }

    // 初始化
    fetchCounselors()

    // 判断是否是今天
    const isToday = (date) => {
      const today = formatDate(new Date())
      return date === today
    }

    // 判断是否是过去的日期
    const isPastDate = (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(date) < today
    }

    // 跳转到当前月份
    const goToCurrentMonth = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      currentMonth.value = `${year}-${month}`
      handleMonthChange()
    }

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .schedule-manage {
        padding: 20px;
      }
      .counselor-list-card,
      .schedule-manage-card {
        margin-bottom: 20px;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .counselor-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .header-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .search-input {
        width: 330px;
      }
      .empty-state {
        padding: 40px;
        background: #fff;
        border-radius: 4px;
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
      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
      .no-schedule-text {
        color: #999;
        font-size: 14px;
        padding: 8px;
      }
    `
    document.head.appendChild(style)

    return {
      searchQuery,
      filteredCounselors,
      currentDate,
      currentMonth,
      schedules,
      counselors,
      selectedCounselor,
      selectedCounselorName,
      handleBack,
      handleSelectCounselor,
      handleSearch,
      availableTimeSlots,
      addScheduleDialog,
      batchScheduleDialog,
      scheduleDetailDialog,
      formatDate,
      getSelectedCounselorName,
      getMonthScheduleData,
      formatDisplayDate,
      getWeekdayText,
      changeMonth,
      getScheduleTagType,
      getScheduleStatusText,
      canCancelSchedule,
      handleCounselorChange,
      handleMonthChange,
      openAddScheduleDialog,
      openBatchScheduleDialog,
      handleScheduleClick,
      handleAddSchedule,
      handleBatchSchedule,
      handleCancelSchedule,
      currentPage,
      pageSize,
      totalCounselors,
      handleSizeChange,
      handleCurrentChange,
      isToday,
      isPastDate,
      goToCurrentMonth
    }
  }
}
</script>

<style scoped>
.schedule-manage {
  padding: 20px;
}

.counselor-list-card,
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

.counselor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 330px;
}

.empty-state {
  padding: 40px;
  background: #fff;
  border-radius: 4px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.no-schedule-text {
  color: #999;
  font-size: 14px;
  padding: 8px;
}
</style> 
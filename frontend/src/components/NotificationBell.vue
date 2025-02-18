<template>
  <div class="notification-bell">
    <el-popover
      placement="bottom"
      :width="300"
      trigger="click"
      popper-class="notification-popover"
    >
      <template #reference>
        <el-badge :value="unreadCount || ''" :hidden="!unreadCount">
          <el-button :icon="Bell" circle />
        </el-badge>
      </template>

      <div class="notification-list">
        <div class="notification-header">
          <span>通知</span>
          <el-button
            v-if="notifications.length"
            type="primary"
            link
            @click="markAllAsRead"
          >
            全部标记为已读
          </el-button>
        </div>

        <div v-if="!notifications.length" class="no-notifications">
          暂无通知
        </div>

        <el-scrollbar max-height="400px">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'is-read': notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-content">{{ notification.content }}</div>
            <div class="notification-time">
              {{ formatTime(notification.created_at) }}
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import notificationService from '@/services/notification.service'
import moment from 'moment'

const router = useRouter()
const notifications = ref([])
const unreadCount = ref(0)
let pollingInterval = null

// 获取未读通知
const fetchNotifications = async () => {
  try {
    const data = await notificationService.getUnreadNotifications()
    if (Array.isArray(data)) {
      notifications.value = data
      unreadCount.value = data.length
    } else {
      console.error('获取通知返回的数据格式不正确:', data)
      notifications.value = []
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    notifications.value = []
    unreadCount.value = 0
  }
}

// 标记通知为已读
const markAsRead = async (notification) => {
  try {
    await notificationService.markAsRead(notification.id)
    notification.is_read = true
    unreadCount.value = notifications.value.filter(n => !n.is_read).length
  } catch (error) {
    console.error('标记通知已读失败:', error)
    ElMessage.error('标记通知已读失败')
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    for (const notification of notifications.value) {
      if (!notification.is_read) {
        await markAsRead(notification)
      }
    }
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('标记全部已读失败')
  }
}

// 处理通知点击
const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    await markAsRead(notification)
  }

  // 根据通知类型处理跳转
  if (notification.type === 'appointment' && notification.related_id) {
    // 跳转到预约详情页
    const route = notification.user_type === 'counselor' 
      ? `/counselor/appointments/${notification.related_id}`
      : `/student/dashboard/appointments/${notification.related_id}`
    
    // 使用replace而不是push，避免在同一路由重复导航
    if (router.currentRoute.value.path !== route) {
      await router.replace(route)
    }
  }
}

// 格式化时间
const formatTime = (time) => {
  moment.locale('zh-cn'); // 设置语言为中文
  const date = moment(time);
  const now = moment();
  const diff = now.diff(date, 'minutes');

  if (diff < 1) {
    return '刚刚';
  } else if (diff < 60) {
    return `${diff}分钟前`;
  } else if (diff < 24 * 60) {
    return `${Math.floor(diff / 60)}小时前`;
  } else if (diff < 48 * 60) {
    return '昨天';
  } else {
    return date.format('MM-DD HH:mm');
  }
}

// 组件挂载时开始轮询
onMounted(() => {
  fetchNotifications()
  // 每分钟检查一次新通知
  pollingInterval = setInterval(fetchNotifications, 60000)
})

// 组件卸载时清除轮询
onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
.notification-bell {
  display: inline-block;
}

.notification-list {
  padding: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.notification-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.is-read {
  opacity: 0.7;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.notification-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.no-notifications {
  padding: 24px;
  text-align: center;
  color: #909399;
}
</style> 
<template>
  <div class="chat-room">
    <!-- 状态提示 -->
    <div v-if="chatStatus === 'waiting'" class="chat-status-notice waiting">
      <el-alert
        :title="countdown"
        type="info"
        :closable="false"
        center
      >
        <template #default>
          请耐心等待，咨询尚未开始
        </template>
      </el-alert>
    </div>
    
    <div v-if="chatStatus === 'ended'" class="chat-status-notice ended">
      <el-alert
        title="咨询已结束"
        type="warning"
        :closable="false"
        center
      >
        <template #default>
          您正在查看历史记录
        </template>
      </el-alert>
    </div>
    
    <div class="chat-messages" ref="chatContainer" @scroll="handleScroll">
      <template v-for="(message, index) in messages" :key="message.id">
        <!-- 时间分割线 -->
        <div v-if="shouldShowTimeDivider(message, messages[index - 1])" 
             class="time-divider">
          <span class="time-text">{{ formatMessageTime(message.created_at) }}</span>
        </div>
        
        <!-- 消息内容 -->
        <div v-if="message.type === 'system'" class="system-notice">
          {{ message.content }}
        </div>
        <div v-else :class="['message', messageClass(message)]">
          <div class="message-sender" :class="{ 'sender-self': message.sender_id === currentUserId }">
            {{ getSenderName(message.sender_id) }}
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </template>
    </div>
    
    <!-- 输入区域 -->
    <div class="chat-input" v-if="chatStatus === 'ready'">
      <div class="input-wrapper">
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.shift.enter.prevent="handleShiftEnter"
          class="message-textarea"
        />
        <div class="input-toolbar">
          <el-button class="emoji-picker-trigger" @click="showEmojiPicker = !showEmojiPicker">
            😊
          </el-button>
          <el-button type="primary" class="send-button" @click="sendMessage">发送(S)</el-button>
        </div>
      </div>
      
      <!-- 表情选择器 -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div v-for="emoji in emojis" 
             :key="emoji"
             class="emoji-item"
             @click="addEmoji(emoji)">
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment';
import 'moment/locale/zh-cn';
import socketService from '@/services/socket.service';
import { ElMessage } from 'element-plus';

const props = defineProps({
  appointmentId: {
    type: [Number, String],
    required: true
  },
  receiverId: {
    type: [Number, String],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
});

const store = useStore();
const messages = ref([]);
const messageInput = ref('');
const chatContainer = ref(null);
const showNewMessageNotification = ref(false);
const lastReadPosition = ref(0);
const showEmojiPicker = ref(false);
const currentUserId = ref(null);

// 新增用户信息相关
const userInfo = ref({
  currentUser: null,
  otherUser: null
});

// 在 setup 中添加新的响应式变量
const appointmentInfo = ref(null);
const chatStatus = ref('loading'); // loading, waiting, ready, ended
const countdown = ref('');
const hasShownEndReminder = ref(false);

// 监听滚动事件
const handleScroll = () => {
  if (!chatContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  
  if (isNearBottom) {
    showNewMessageNotification.value = false;
    lastReadPosition.value = messages.value.length;
  }
};

// 滚动到最新消息
const scrollToLatest = () => {
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  showNewMessageNotification.value = false;
  lastReadPosition.value = messages.value.length;
};

// 添加表情
const addEmoji = (emoji) => {
  messageInput.value += emoji;
  showEmojiPicker.value = false;
};

// 表情列表
const emojis = [
  '😊', '😂', '🤔', '👍', '❤️', '😭', '😡', '🎉',
  '😄', '😅', '😆', '😉', '😋', '😎', '😍', '😘',
  '🤗', '🤩', '🥳', '😌', '🤓', '😛', '😜', '😝',
  '🤪', '😏', '😒', '😔', '😢', '😭', '😤', '😠'
];

// 获取用户昵称
const getSenderName = (senderId) => {
  if (senderId === currentUserId.value) {
    return userInfo.value.currentUser?.name || '我';
  }
  return userInfo.value.otherUser?.name || '对方';
};

// 处理Shift+Enter换行
const handleShiftEnter = (e) => {
  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  messageInput.value = messageInput.value.substring(0, start) + '\n' + messageInput.value.substring(end);
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1;
  });
};

// 检查聊天室状态
const checkChatStatus = () => {
  if (!appointmentInfo.value?.schedule) {
    chatStatus.value = 'loading';
    return;
  }

  const now = moment();
  const [startTime] = appointmentInfo.value.schedule.time_slot.split('-');
  const appointmentStart = moment(`${appointmentInfo.value.schedule.date} ${startTime}`);
  const appointmentEnd = appointmentStart.clone().add(appointmentInfo.value.duration || 50, 'minutes');
  
  // 提前5分钟可以进入
  const earlyAccess = appointmentStart.clone().subtract(5, 'minutes');
  // 提前5分钟提醒结束
  const endReminder = appointmentEnd.clone().subtract(5, 'minutes');
  
  if (now.isBefore(earlyAccess)) {
    chatStatus.value = 'waiting';
    updateCountdown(appointmentStart);
  } else if (now.isBefore(appointmentEnd)) {
    chatStatus.value = 'ready';
    // 检查是否需要显示即将结束提醒
    if (now.isAfter(endReminder) && !hasShownEndReminder.value) {
      ElMessage({
        message: '咨询将在5分钟后结束',
        type: 'warning',
        duration: 0,
        showClose: true
      });
      hasShownEndReminder.value = true;
    }
  } else {
    chatStatus.value = 'ended';
  }
};

// 更新倒计时
const updateCountdown = (startTime) => {
  const now = moment();
  const diff = moment.duration(startTime.diff(now));
  
  if (diff.asMinutes() > 60) {
    countdown.value = `距离咨询开始还有 ${Math.floor(diff.asHours())} 小时 ${diff.minutes()} 分钟`;
  } else {
    countdown.value = `距离咨询开始还有 ${diff.minutes()} 分钟 ${diff.seconds()} 秒`;
  }
};

// 加载预约信息
const loadAppointmentInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/appointments/${props.appointmentId}`, {
      headers: {
        'x-access-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error('获取预约信息失败');
    }
    
    const data = await response.json();
    appointmentInfo.value = data;
    checkChatStatus();
    
    // 如果在等待状态，启动倒计时
    if (chatStatus.value === 'waiting') {
      const interval = setInterval(() => {
        checkChatStatus();
        if (chatStatus.value !== 'waiting') {
          clearInterval(interval);
        }
      }, 1000);
      
      // 组件卸载时清除定时器
      onUnmounted(() => {
        clearInterval(interval);
      });
    }
  } catch (error) {
    console.error('加载预约信息失败:', error);
    ElMessage.error('无法加载预约信息');
  }
};

// 修改发送消息函数
const sendMessage = async () => {
  if (chatStatus.value === 'ended') {
    ElMessage.warning('咨询已结束，无法发送新消息');
    return;
  }
  
  if (chatStatus.value === 'waiting') {
    ElMessage.warning('咨询尚未开始，请耐心等待');
    return;
  }
  
  if (!messageInput.value.trim()) {
    ElMessage.warning('不能发送空消息');
    return;
  }
  
  try {
    if (!currentUserId.value) {
      throw new Error('用户未登录或身份信息获取失败');
    }

    const message = await socketService.sendMessage(
      props.appointmentId,
      props.receiverId,
      messageInput.value
    );
    
    messages.value.push({
      ...message,
      sender_id: currentUserId.value,
      content: messageInput.value,
      created_at: new Date().toISOString()
    });
    
    messageInput.value = '';
    showEmojiPicker.value = false;
    nextTick(() => {
      scrollToLatest();
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error(error.message || '发送消息失败，请重试');
  }
};

// 格式化消息组时间
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = moment(timestamp);
  const now = moment();
  
  // 如果是今天的消息
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm');
  }
  
  // 如果是昨天的消息
  if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return '昨天 ' + date.format('HH:mm');
  }
  
  // 如果是今年的消息
  if (date.isSame(now, 'year')) {
    return date.format('MM月DD日 HH:mm');
  }
  
  // 其他日期
  return date.format('YYYY年MM月DD日 HH:mm');
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/appointments/${props.appointmentId}/users`, {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    const data = await response.json();
    if (data.success) {
      userInfo.value = {
        currentUser: data.currentUser,
        otherUser: data.otherUser
      };
      console.log('用户信息加载成功:', userInfo.value);
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.warning('无法加载用户信息，将使用默认显示');
  }
};

// 加载历史消息
const loadChatHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/messages/${props.appointmentId}`, {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      messages.value = data.messages;
      nextTick(() => {
        scrollToLatest();
      });
    } else {
      throw new Error(data.message || '加载历史消息失败');
    }
  } catch (error) {
    console.error('加载历史消息失败:', error);
    ElMessage.warning(error.message || '无法加载历史消息');
  }
};

// 初始化聊天室
const initializeChat = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到登录令牌');
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      currentUserId.value = user.id;
    } else {
      currentUserId.value = store.state.auth?.user?.id;
    }

    if (!currentUserId.value) {
      throw new Error('用户未登录或身份信息获取失败');
    }

    await socketService.connect();
    await socketService.joinRoom(props.appointmentId);
    
    // 注册消息处理器
    socketService.registerMessageHandler(props.appointmentId, (message) => {
      if (!message || !message.content) {
        console.error('收到无效消息:', message);
        return;
      }

      // 如果是系统消息，直接显示提示
      if (message.type === 'system') {
        // 只有在咨询进行中时才显示匿名提示
        if (message.content.includes('匿名咨询') && chatStatus.value !== 'ready') {
          return;
        }
        ElMessage({
          message: message.content,
          type: 'info',
          duration: 3000
        });
        return;
      }

      const newMessage = {
        id: message.id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at || new Date().toISOString()
      };

      const isDuplicate = messages.value.some(
        m => m.id === newMessage.id || 
            (m.content === newMessage.content && 
             m.sender_id === newMessage.sender_id &&
             Math.abs(new Date(m.created_at) - new Date(newMessage.created_at)) < 1000)
      );

      if (!isDuplicate) {
        messages.value.push(newMessage);
        nextTick(() => {
          scrollToLatest();
        });
      }
    });
  } catch (error) {
    console.error('初始化聊天室失败:', error);
    ElMessage.error(error.message || '初始化聊天室失败，请刷新页面重试');
    throw error;
  }
};

// 修改 getSenderName 的使用
const messageClass = computed(() => (message) => {
  const isSelf = message.sender_id === currentUserId.value;
  const isSystem = message.type === 'system';
  return {
    'message-self': isSelf,
    'message-other': !isSelf && !isSystem,
    'message-system': isSystem
  };
});

// 添加判断是否显示时间分割线的函数
const shouldShowTimeDivider = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentTime = moment(currentMessage.created_at);
  const previousTime = moment(previousMessage.created_at);
  
  // 如果是不同的日期，显示分割线
  if (!currentTime.isSame(previousTime, 'day')) {
    return true;
  }
  
  // 如果是同一天，但时间间隔超过30分钟，显示分割线
  return currentTime.diff(previousTime, 'minutes') >= 30;
};

// 在初始化时加载用户信息
onMounted(async () => {
  await loadAppointmentInfo();
  await loadUserInfo();
  await loadChatHistory();
  await initializeChat();
});

onUnmounted(() => {
  socketService.removeMessageHandler(props.appointmentId);
});
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 600px;
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 10px;
  height: calc(100% - 200px);
}

.message-group {
  margin-bottom: 15px;
}

.time-divider {
  text-align: center;
  margin: 15px 0;
  clear: both;
}

.time-text {
  background: #f2f2f2;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #999;
  display: inline-block;
}

.message {
  margin: 8px 0;
  max-width: 70%;
  clear: both;
  position: relative;
}

.message-self {
  float: right;
  margin-right: 0;
}

.message-other {
  float: left;
  margin-left: 0;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  text-align: left;
}

.sender-self {
  text-align: right;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 10px;
  background: #e1f3ff;
  word-break: break-word;
  text-align: left;
  white-space: pre-wrap;
}

.message-self .message-content {
  background: #95ec69;
}

.system-notice {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 5px 10px;
  margin: 10px auto;
  display: block;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  position: relative;
  margin-top: auto;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-textarea {
  width: 100%;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.emoji-picker-trigger {
  padding: 8px 15px;
  border: none;
  background: transparent;
  font-size: 20px;
}

.emoji-picker-trigger:hover {
  background: #f5f5f5;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 10px;
  background: white;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.emoji-item {
  font-size: 20px;
  cursor: pointer;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
}

.emoji-item:hover {
  background: #f5f5f5;
}

.send-button {
  margin-left: auto;
}

:deep(.el-textarea__inner) {
  resize: none;
}

.new-message-notification {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.chat-status-notice {
  padding: 10px;
  text-align: center;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.chat-status-notice.waiting {
  background-color: #e6f1fc;
}

.chat-status-notice.ended {
  background-color: #fdf6ec;
}
</style> 
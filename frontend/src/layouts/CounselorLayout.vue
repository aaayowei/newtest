<template>
  <el-container class="counselor-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span>心理咨询系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        router
      >
        <el-menu-item index="/counselor/appointments">
          <i class="fas fa-calendar-check"></i>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/counselor/schedule">
          <i class="fas fa-clock"></i>
          <span>排班信息</span>
        </el-menu-item>
        <el-menu-item index="/counselor/assessments">
          <i class="fas fa-clipboard-list"></i>
          <span>学生测评</span>
        </el-menu-item>
        <el-menu-item index="/counselor/articles">
          <i class="fas fa-book"></i>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/counselor/profile">
          <i class="fas fa-user"></i>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="main-container">
      <el-header class="header">
        <div class="page-title">{{ currentPageTitle }}</div>
        <div class="header-right">
          <NotificationBell class="notification-bell" />
          <el-dropdown>
            <span class="user-info">
              {{ username }}
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AuthService from '@/services/auth.service';
import NotificationBell from '@/components/NotificationBell.vue';
import { CaretBottom } from '@element-plus/icons-vue';

export default {
  name: 'CounselorLayout',
  components: {
    NotificationBell,
    CaretBottom
  },
  data() {
    return {
      username: '',
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path;
    },
    currentPageTitle() {
      const routeTitles = {
        '/counselor/appointments': '预约管理',
        '/counselor/schedule': '排班信息',
        '/counselor/assessments': '学生测评',
        '/counselor/articles': '文章管理',
        '/counselor/profile': '个人信息'
      };
      return routeTitles[this.$route.path] || '';
    }
  },
  methods: {
    async logout() {
      AuthService.logout();
      this.$router.push('/login');
    }
  },
  created() {
    const user = AuthService.getCurrentUser();
    if (user) {
      this.username = user.username;
    }
  }
}
</script>

<style scoped>
.counselor-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px !important;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo img {
  height: 32px;
  margin-right: 10px;
}

.menu {
  border-right: none;
  background-color: transparent;
}

.main-container {
  margin-left: 200px;
  min-height: 100vh;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  z-index: 1000;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-bell {
  margin-right: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.main-content {
  margin-top: 60px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

:deep(.el-menu) {
  background-color: transparent;
}

:deep(.el-menu-item) {
  color: #a6adb4;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF;
  background-color: #1890ff1a;
}

:deep(.el-menu-item:hover) {
  color: white;
  background-color: #1890ff33;
}

:deep(.el-menu-item i) {
  margin-right: 10px;
  width: 16px;
  text-align: center;
}
</style> 
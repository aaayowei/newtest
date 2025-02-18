<template>
  <div class="student-home-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo" />
          <span>心理咨询系统</span>
        </div>
        <nav class="nav-menu">
          <router-link 
            to="/student" 
            class="nav-item"
            :class="{ active: $route.path === '/student' }"
          >首页</router-link>
          <router-link 
            to="/student/counselors" 
            class="nav-item"
            :class="{ active: $route.path.startsWith('/student/counselors') }"
          >咨询预约</router-link>
          <router-link 
            to="/student/assessments" 
            class="nav-item"
            :class="{ active: $route.path.startsWith('/student/assessments') }"
          >心理测评</router-link>
          <router-link 
            to="/student/articles" 
            class="nav-item"
            :class="{ active: $route.path.startsWith('/student/articles') }"
          >知识库</router-link>
        </nav>
        <div class="user-menu">
          <template v-if="isLoggedIn">
            <router-link 
              to="/student/dashboard" 
              class="nav-item"
              :class="{ active: $route.path.startsWith('/student/dashboard') }"
            >个人中心</router-link>
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                {{ username }}
                <i class="fas fa-chevron-down"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item">登录</router-link>
            <router-link to="/register" class="nav-item register">注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>心理咨询系统致力于为学生提供专业的心理健康服务</p>
        </div>
        <div class="footer-section">
          <h3>联系方式</h3>
          <p>邮箱：support@example.com</p>
          <p>电话：123-456-7890</p>
        </div>
        <div class="footer-section">
          <h3>快速链接</h3>
          <router-link to="/student/counselors">寻找咨询师</router-link>
          <router-link to="/student/assessments">心理测评</router-link>
          <router-link to="/student/articles">心理知识</router-link>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 心理咨询系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service';

export default {
  name: 'StudentHomeLayout',
  data() {
    return {
      username: '',
      isLoggedIn: false
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        AuthService.logout();
        this.$router.push('/login');
      }
    },
    checkLoginStatus() {
      const user = AuthService.getCurrentUser();
      if (user) {
        this.isLoggedIn = true;
        this.username = user.username;
      } else {
        this.isLoggedIn = false;
        this.username = '';
      }
    }
  },
  created() {
    this.checkLoginStatus();
  },
  watch: {
    '$route'() {
      this.checkLoginStatus();
    }
  }
}
</script>

<style scoped>
.student-home-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  height: 32px;
}

.logo span {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 0;
  position: relative;
}

.nav-item:hover {
  color: #409EFF;
}

.nav-item.active {
  color: #409EFF;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409EFF;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #666;
}

.register {
  background-color: #409EFF;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

.register:hover {
  background-color: #66b1ff;
  color: white;
}

.main-content {
  margin-top: 64px;
  flex: 1;
  min-height: calc(100vh - 64px - 300px); /* 减去头部和底部的高度 */
}

.footer {
  background-color: #001529;
  color: #fff;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #fff;
}

.footer-section p {
  color: #a6adb4;
  line-height: 1.6;
}

.footer-section a {
  display: block;
  color: #a6adb4;
  text-decoration: none;
  margin-bottom: 10px;
}

.footer-section a:hover {
  color: #fff;
}

.footer-bottom {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 20px 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #a6adb4;
}

@media screen and (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style> 
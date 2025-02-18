<template>
  <div class="login-container">
    <div class="welcome-section">
      <h1>欢迎使用心理咨询系统</h1>
      <p class="sub-title">您的心理健康，我们来守护</p>
    </div>
    <div class="form-container">
      <form @submit.prevent="login" class="login-form">
        <h2>用户登录</h2>
        <div class="input-group">
          <i class="fas fa-user"></i>
          <select 
            v-model="userType" 
            class="user-type-select"
            @blur="validateUserType"
          >
            <option value="" disabled selected>请选择用户类型</option>
            <option value="student">学生</option>
            <option value="counselor">心理咨询师</option>
            <option value="admin">管理员</option>
          </select>
          <span class="error-message" v-if="errors.userType">{{ errors.userType }}</span>
        </div>
        <div class="input-group">
          <i class="fas fa-user-circle"></i>
          <input 
            v-model="username" 
            placeholder="请输入用户名" 
            required 
            class="input-field"
            @blur="validateUsername"
          />
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input 
            v-model="password" 
            :type="passwordVisible ? 'text' : 'password'" 
            placeholder="请输入密码" 
            required 
            class="input-field"
            @blur="validatePassword"
          />
          <i 
            class="fas" 
            :class="passwordVisible ? 'fa-eye-slash' : 'fa-eye'"
            @click="togglePasswordVisibility"
            style="cursor: pointer;"
          ></i>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="rememberMe" />
          <label for="remember">记住密码</label>
        </div>
        <button type="submit" class="submit-button" :disabled="!isFormValid">登录</button>
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
    <div v-if="showSuccessMessage" class="success-message">
      注册成功！请登录
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service';

export default {
  data() {
    return {
      userType: '',
      username: '',
      password: '',
      passwordVisible: false,
      rememberMe: false,
      errors: {
        userType: '',
        username: '',
        password: ''
      },
      showSuccessMessage: false,
      savedPassword: ''
    };
  },
  computed: {
    isFormValid() {
      return !Object.values(this.errors).some(error => error !== '') &&
             this.userType && this.username && this.password;
    }
  },
  methods: {
    validateUserType() {
      if (!this.userType) {
        this.errors.userType = '请选择用户类型';
      } else {
        this.errors.userType = '';
      }
    },
    validateUsername() {
      if (!this.username) {
        this.errors.username = '请输入用户名';
      } else {
        this.errors.username = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = '请输入密码';
      } else {
        this.errors.password = '';
      }
    },
    async login() {
      // 登录前进行所有验证
      this.validateUserType();
      this.validateUsername();
      this.validatePassword();

      if (!this.isFormValid) {
        return;
      }

      try {
        await AuthService.login(this.username, this.password, this.userType);
        
        // 处理记住密码
        if (this.rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            username: this.username,
            password: this.password,
            userType: this.userType
          }));
        } else {
          localStorage.removeItem('rememberedUser');
        }

        this.$message({
          message: '登录成功',
          type: 'success',
          duration: 2000
        });
        
        // 根据用户类型重定向到不同页面
        const user = JSON.parse(localStorage.getItem('user'));
        switch (user.userType) {
          case 'admin':
            this.$router.push('/admin/users');
            break;
          case 'counselor':
            this.$router.push('/counselor/appointments');
            break;
          case 'student':
            this.$router.push('/student');
            break;
          default:
            this.$router.push('/');
        }
      } catch (error) {
        if (error.message.includes('用户不存在')) {
          this.errors.username = '用户名不存在';
        } else if (error.message.includes('密码错误')) {
          this.errors.password = '密码错误';
        } else if (error.message.includes('用户类型')) {
          this.errors.userType = '用户类型不匹配';
        } else if (error.message.includes('账号已被禁用')) {
          this.$message({
            message: '账号已被禁用',
            type: 'error',
            duration: 2000
          });
        } else {
          console.error('登录失败:', error);
          this.$message({
            message: '登录失败，请稍后重试',
            type: 'error',
            duration: 2000
          });
        }
      }
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
  },
  // 如果启用了记住密码，在组件加载时恢复保存的信息
  mounted() {
    // 恢复保存的用户信息
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      this.username = userData.username;
      this.password = userData.password;
      this.userType = userData.userType;
      this.rememberMe = true;
    }
  },
};
</script>

<style scoped>
.login-container {
  background-image: url('@/assets/image/back.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.welcome-section {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: 1rem;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.sub-title {
  font-size: 1.2em;
  opacity: 0.9;
}

.form-container {
  width: 400px;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 30px 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-form {
  width: 100%;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1em;
}

.input-group i.fa-eye,
.input-group i.fa-eye-slash {
  left: auto;
  right: 12px;
  cursor: pointer;
}

.user-type-select {
  width: 100%;
  padding: 8px 30px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  color: #666;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.user-type-select::-ms-expand {
  display: none;
}

.input-field {
  width: 100%;
  padding: 8px 30px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  color: #666;
}

.remember-me {
  display: flex;
  align-items: center;
  margin: 10px 0;
  color: #666;
  height: 42px;
}

.remember-me input[type="checkbox"] {
  margin-right: 5px;
}

.remember-me label {
  font-size: 14px;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin: 5px 0 10px; 
}

.submit-button:hover {
  background-color: #66b1ff;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #409EFF;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

.input-field[type="password"] {
  -webkit-text-security: disc;
  -webkit-appearance: none;
  appearance: none;
}

.input-field[type="password"]::-ms-reveal,
.input-field[type="password"]::-ms-clear {
  display: none;
}

.error-message {
  color: #ff4949;
  font-size: 12px;
  margin-top: 4px;
  position: absolute;
  bottom: -20px;
  left: 0;
}

.submit-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.success-message {
  background-color: rgba(103, 194, 58, 0.8); /* 半透明的绿色 */
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style> 
<template>
  <div class="register-container">
    <div class="welcome-section">
      <h1>欢迎注册心理咨询系统</h1>
      <p class="sub-title">让我们一起守护心灵的港湾</p>
    </div>
    <div class="form-container">
      <form @submit.prevent="register" class="register-form">
        <h2>用户注册</h2>
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
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input 
            v-model="confirmPassword" 
            :type="confirmPasswordVisible ? 'text' : 'password'" 
            placeholder="请确认密码" 
            required 
            class="input-field"
            @blur="validateConfirmPassword"
          />
          <i 
            class="fas" 
            :class="confirmPasswordVisible ? 'fa-eye-slash' : 'fa-eye'"
            @click="toggleConfirmPasswordVisibility"
            style="cursor: pointer;"
          ></i>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>
        <button type="submit" class="submit-button" :disabled="!isFormValid">注册</button>
        <div class="login-link">
          <span>已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
        </div>
      </form>
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
      confirmPassword: '',
      passwordVisible: false,
      confirmPasswordVisible: false,
      errors: {
        userType: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  computed: {
    isFormValid() {
      return !Object.values(this.errors).some(error => error !== '') &&
             this.userType && this.username && this.password && this.confirmPassword;
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
      const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;
      if (!this.username) {
        this.errors.username = '请输入用户名';
      } else if (!usernameRegex.test(this.username)) {
        this.errors.username = '用户名必须是6-20位字母、数字或下划线';
      } else {
        this.errors.username = '';
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()]{8,20}$/;
      if (!this.password) {
        this.errors.password = '请输入密码';
      } else if (!passwordRegex.test(this.password)) {
        this.errors.password = '密码必须包含大小写字母和数字，长度8-20位';
      } else {
        this.errors.password = '';
      }
    },
    validateConfirmPassword() {
      if (!this.confirmPassword) {
        this.errors.confirmPassword = '请确认密码';
      } else if (this.confirmPassword !== this.password) {
        this.errors.confirmPassword = '两次输入的密码不一致';
      } else {
        this.errors.confirmPassword = '';
      }
    },
    async register() {
      // 注册前进行所有验证
      this.validateUserType();
      this.validateUsername();
      this.validatePassword();
      this.validateConfirmPassword();

      if (!this.isFormValid) {
        return;
      }

      try {
        // 先检查用户名是否已存在
        const checkResponse = await AuthService.checkUsername(this.username);
        if (checkResponse.exists) {
          this.errors.username = '该用户名已被注册';
          return;
        }

        await AuthService.register(this.username, this.password, this.userType);
        this.$message({
          message: '注册成功！正在跳转到登录页面...',
          type: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          this.$router.push({
            path: '/login',
            query: { registered: 'success' }
          });
        }, 2000);
      } catch (error) {
        if (error.message.includes('用户名已被注册')) {
          this.errors.username = '该用户名已被注册';
          // 禁用注册按钮
          this.isFormValid = false;
        } else {
          this.$message({
            message: error.message || '注册失败，请稍后重试',
            type: 'error',
            duration: 3000
          });
        }
      }
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    },
  },
};
</script>

<style scoped>
.register-container {
  background-image: url('@/assets/image/back.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh; /* 改为固定高度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 添加垂直居中 */
  padding: 0; /* 移除内边距 */
}

.welcome-section {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: 1rem; /* 调整欢迎文字的位置，与登录页面保持一致 */
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

.register-form {
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
  appearance: none; /* 移除默认的下拉图标 */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px; /* 为下拉图标留出空间 */
}

.user-type-select::-ms-expand {
  display: none; /* 为 IE 移除默认的下拉图标 */
}

.input-field {
  width: 100%;
  padding: 8px 30px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  color: #666;
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
  margin: 5px 0 10px; /* 与登录页面保持一致 */
}

.submit-button:hover {
  background-color: #66b1ff;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #409EFF;
  text-decoration: none;
  margin-left: 5px;
}

.login-link a:hover {
  text-decoration: underline;
}

.remember-me {
  display: none;
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

</style>

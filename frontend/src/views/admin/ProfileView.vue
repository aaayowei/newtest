<template>
  <div class="profile-view">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import userService from '@/services/user.service';

export default {
  name: 'AdminProfileView',
  data() {
    return {
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 8, max: 20, message: '密码长度在 8 到 20 个字符', trigger: 'blur' },
          { 
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/,
            message: '密码必须包含大小写字母和数字',
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    };
  },
  methods: {
    async handleChangePassword() {
      try {
        await this.$refs.passwordForm.validate();
        await userService.changePassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        });
        ElMessage.success('密码修改成功');
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate()
        }
      } catch (error) {
        ElMessage.error(error.message || '修改密码失败')
      }
    }
  }
};
</script>

<style scoped>
.profile-view {
  padding: 20px;
}

.password-card {
  max-width: 600px;
  margin: 0 auto;
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
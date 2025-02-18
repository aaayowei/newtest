<template>
  <div class="user-manage">
    <el-card class="user-manage-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <div class="filter-container">
              <el-select v-model="userTypeFilter" placeholder="用户类型" @change="handleFilter" class="type-select">
                <el-option label="全部" value=""></el-option>
                <el-option label="学生" value="student"></el-option>
                <el-option label="咨询师" value="counselor"></el-option>
              </el-select>
              <el-input
                v-model="searchQuery"
                placeholder="搜索用户名/真实姓名/邮箱"
                class="search-input"
                @input="handleSearch"
                clearable
              >
                <template #prefix>
                  <i class="fas fa-search"></i>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </template>

      <el-table :data="filteredUsers" style="width: 100%" v-loading="loading" :height="tableHeight">
        <el-table-column prop="username" label="用户名" width="110" show-overflow-tooltip></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="110" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.realName || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.email || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="120" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.phone || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="userType" label="用户类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getUserTypeTag(scope.row.userType)" size="small">
              {{ getUserTypeLabel(scope.row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              @change="handleStatusChange(scope.row)"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="warning" link @click="handleResetPassword(scope.row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalFilteredUsers"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @update:page-size="val => pageSize = val"
        />
      </div>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑用户信息" width="500px" destroy-on-close>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus';

export default {
  name: 'UserManageView',
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: '',
      userTypeFilter: '',
      editDialogVisible: false,
      editForm: {
        id: null,
        username: '',
        realName: '',
        email: '',
        phone: '',
      },
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      tableHeight: 'calc(100vh - 280px)', // 动态计算表格高度
    }
  },
  computed: {
    // 过滤后的总用户数
    totalFilteredUsers() {
      if (!this.users) return 0;
      const nonAdminUsers = this.users.filter(user => user.userType !== 'admin');
      return nonAdminUsers.filter(user => {
        const matchSearch =
          !this.searchQuery ||
          user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (user.realName && user.realName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchType = !this.userTypeFilter || user.userType === this.userTypeFilter;
        return matchSearch && matchType;
      }).length;
    },
    // 分页后的用户列表
    filteredUsers() {
      if (!this.users) return [];
      
      // 过滤掉管理员用户
      const nonAdminUsers = this.users.filter(user => user.userType !== 'admin');
      
      const filtered = nonAdminUsers.filter(user => {
        const matchSearch =
          !this.searchQuery ||
          user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (user.realName && user.realName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchType = !this.userTypeFilter || user.userType === this.userTypeFilter;
        return matchSearch && matchType;
      });

      // 分页处理
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return filtered.slice(start, end);
    },
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const response = await this.$axios.get('/admin/users');
        console.log('获取到的用户列表:', response);
        this.users = Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败');
        this.users = [];
      } finally {
        this.loading = false;
      }
    },
    getUserTypeLabel(type) {
      const types = {
        student: '学生',
        counselor: '咨询师',
        admin: '管理员',
      };
      return types[type] || type;
    },
    getUserTypeTag(type) {
      const types = {
        student: '',
        counselor: 'success',
        admin: 'danger',
      };
      return types[type] || '';
    },
    handleSearch() {
      // 搜索功能已通过计算属性实现
    },
    handleFilter() {
      // 筛选功能已通过计算属性实现
    },
    async handleStatusChange(user) {
      try {
        await this.$axios.patch(`/admin/users/${user.id}/status`, {
          status: user.status,
        });
        this.$message.success(`用户已${user.status ? '启用' : '禁用'}`);
      } catch (error) {
        console.error('更新用户状态失败:', error);
        this.$message.error('更新用户状态失败');
        user.status = !user.status; // 恢复状态
      }
    },
    handleEdit(user) {
      this.editForm = { ...user };
      this.editDialogVisible = true;
    },
    async handleSave() {
      try {
        await this.$axios.put(`/admin/users/${this.editForm.id}`, {
          realName: this.editForm.realName,
          email: this.editForm.email,
          phone: this.editForm.phone
        });
        this.$message.success('用户信息更新成功');
        this.editDialogVisible = false;
        await this.fetchUsers(); // 刷新用户列表
      } catch (error) {
        console.error('更新用户信息失败:', error);
        this.$message.error('更新用户信息失败');
      }
    },
    async handleResetPassword(user) {
      try {
        await ElMessageBox.confirm(
          '确定要重置该用户的密码吗？重置后的密码将为：123456',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        await this.$axios.post(`/admin/users/${user.id}/reset-password`);
        this.$message.success('密码重置成功');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('重置密码失败:', error);
          this.$message.error('重置密码失败');
        }
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1; // 重置到第一页
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
  },
  async created() {
    await this.fetchUsers();
  },
}
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.user-manage-card {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.type-select {
  width: 120px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-button.is-link) {
  padding: 4px 8px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  margin: 0;
  border-top: 1px solid #e4e7ed;
}
</style>
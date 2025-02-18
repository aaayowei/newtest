<template>
  <div class="articles-manage">
    <el-card class="articles-card">
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">写文章</el-button>
          </div>
        </div>
      </template>

      <div class="filter-container">
        <el-select v-model="filter.category" placeholder="选择分类" clearable @change="handleFilter">
          <el-option
            v-for="item in categories"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-select v-model="filter.status" placeholder="文章状态" clearable @change="handleFilter">
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
        <el-input
          v-model="filter.author"
          placeholder="作者"
          clearable
          @clear="handleFilter"
          @keyup.enter="handleFilter"
        />
      </div>

      <el-table
        v-loading="loading"
        :data="articles"
        style="width: 100%"
        :height="tableHeight"
      >
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="light">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="100">
          <template #default="{ row }">
            {{ row.author?.real_name || row.author?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="阅读量" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              type="success"
              link
              v-if="row.status === 'draft'"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              type="warning"
              link
              v-else
              @click="handleUnpublish(row)"
            >
              下架
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑文章' : '写文章'"
      width="80%"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="封面" prop="cover_image">
          <el-upload
            class="cover-uploader"
            :action="`${baseURL}/articles/upload/cover`"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :on-error="handleCoverError"
            :before-upload="beforeCoverUpload"
            name="cover"
          >
            <el-image
              v-if="form.cover_image"
              :src="form.cover_image"
              class="cover"
              fit="cover"
              :preview-src-list="[]"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
              <template #placeholder>
                <div class="image-slot">
                  <el-icon><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
            </el-image>
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择文章分类">
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <rich-text-editor v-model="form.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Picture, Loading } from '@element-plus/icons-vue';
import articleService from '@/services/article.service';
import RichTextEditor from '@/components/RichTextEditor.vue';

// 预定义的文章分类
const categories = [
  '心理健康知识',
  '压力管理',
  '情绪调节',
  '人际关系',
  '学业指导',
  '职业规划',
  '心理疾病知识'
];

export default {
  name: 'ArticlesManage',
  components: {
    RichTextEditor,
    Plus,
    Picture,
    Loading
  },
  setup() {
    const loading = ref(false);
    const articles = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const tableHeight = ref('calc(100vh - 280px)');

    const filter = ref({
      category: '',
      status: '',
      author: ''
    });

    const form = ref({
      id: '',
      title: '',
      category: '',
      content: '',
      cover_image: ''
    });

    const rules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' },
        { min: 10, message: '内容不能少于 10 个字符', trigger: 'blur' }
      ]
    };

    const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';
    const uploadHeaders = {
      'x-access-token': localStorage.getItem('token')
    };

    const fetchArticles = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          ...filter.value,
          includeAll: 'true'
        };
        console.log('Fetching articles with params:', params);
        const response = await articleService.getArticles(params);
        console.log('Articles response:', response);
        articles.value = response.articles;
        total.value = response.total;
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        ElMessage.error('获取文章列表失败');
      } finally {
        loading.value = false;
      }
    };

    const handleFilter = () => {
      currentPage.value = 1;
      fetchArticles();
    };

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
      fetchArticles();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchArticles();
    };

    const handleCreate = () => {
      form.value = {
        title: '',
        category: '',
        content: '',
        cover_image: ''
      };
      dialogVisible.value = true;
    };

    const handleEdit = (row) => {
      form.value = { 
        ...row,
        cover_image: row.cover_image ? `${baseURL}${row.cover_image}` : ''
      };
      console.log('Editing article with cover:', form.value.cover_image);
      dialogVisible.value = true;
    };

    const handleSave = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 处理封面图片路径，确保保存相对路径
            const formData = { ...form.value };
            if (formData.cover_image) {
              // 如果是完整URL，提取相对路径
              const urlPattern = new RegExp(`^${baseURL}(/articles/.+)$`);
              const match = formData.cover_image.match(urlPattern);
              if (match) {
                formData.cover_image = match[1];
              }
            }
            
            if (form.value.id) {
              await articleService.updateArticle(form.value.id, formData);
              ElMessage.success('文章更新成功');
            } else {
              await articleService.createArticle(formData);
              ElMessage.success('文章创建成功');
            }
            dialogVisible.value = false;
            fetchArticles();
          } catch (error) {
            console.error('Save article error:', error);
            ElMessage.error('操作失败');
          }
        }
      });
    };

    const handlePublish = async (row) => {
      try {
        await articleService.updateArticle(row.id, { status: 'published' });
        ElMessage.success('文章发布成功');
        fetchArticles();
      } catch (error) {
        ElMessage.error('发布失败');
      }
    };

    const handleUnpublish = async (row) => {
      try {
        await articleService.updateArticle(row.id, { status: 'draft' });
        ElMessage.success('文章已下架');
        fetchArticles();
      } catch (error) {
        ElMessage.error('操作失败');
      }
    };

    const handleDelete = (row) => {
      ElMessageBox.confirm(
        '确定要删除这篇文章吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await articleService.deleteArticle(row.id);
          ElMessage.success('删除成功');
          fetchArticles();
        } catch (error) {
          ElMessage.error('删除失败');
        }
      }).catch(() => {});
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleCoverSuccess = (response) => {
      console.log('Cover upload response:', response);
      form.value.cover_image = `${baseURL}${response.url}`;
      console.log('Updated cover_image:', form.value.cover_image);
    };

    const handleCoverError = (err) => {
      console.error('Cover upload error:', err);
      let errorMessage;
      
      if (err.response?.data) {
        // 直接使用后端返回的错误信息
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = '封面上传失败，请重试';
      }
      
      ElMessage.error(errorMessage);
    };

    const beforeCoverUpload = (file) => {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const isValidType = allowedTypes.includes(file.type.toLowerCase());
      
      // 检查文件扩展名
      const fileName = file.name.toLowerCase();
      const isValidExtension = /\.(jpg|jpeg|png|gif)$/.test(fileName);
      
      // 文件大小限制（5MB）
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isValidType || !isValidExtension) {
        ElMessage.error('只能上传 JPG、JPEG、PNG 和 GIF 格式的图片！');
        return false;
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB');
        return false;
      }
      return true;
    };

    onMounted(() => {
      fetchArticles();
      // 添加窗口大小变化监听
      window.addEventListener('resize', () => {
        tableHeight.value = 'calc(100vh - 280px)';
      });
    });

    return {
      loading,
      articles,
      total,
      currentPage,
      pageSize,
      dialogVisible,
      filter,
      form,
      formRef,
      rules,
      categories,
      handleFilter,
      handleSizeChange,
      handleCurrentChange,
      handleCreate,
      handleEdit,
      handleSave,
      handlePublish,
      handleUnpublish,
      handleDelete,
      formatDate,
      baseURL,
      uploadHeaders,
      handleCoverSuccess,
      handleCoverError,
      beforeCoverUpload,
      tableHeight
    };
  }
};
</script>

<style scoped>
.articles-manage {
  padding: 20px;
}

.articles-card {
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
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
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

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-uploader:hover {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 40px;
  height: 40px;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.image-slot .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
</style> 
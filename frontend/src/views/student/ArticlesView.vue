<template>
  <div class="articles-view">
    <div class="filter-container">
      <el-select v-model="category" placeholder="选择分类" clearable @change="handleFilter">
        <el-option
          v-for="item in categories"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-input
        v-model="search"
        placeholder="搜索文章"
        class="search-input"
        clearable
        @clear="handleFilter"
        @keyup.enter="handleFilter"
      >
        <template #append>
          <el-button :icon="Search" @click="handleFilter" />
        </template>
      </el-input>
    </div>

    <article-list
      v-loading="loading"
      :articles="articles"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @article-click="handleArticleClick"
      @update:current-page="handlePageChange"
      @update:page-size="handleSizeChange"
      @refresh="fetchArticles"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="currentArticle?.title"
      width="70%"
      destroy-on-close
    >
      <div v-if="currentArticle" class="article-detail">
        <div class="article-meta">
          <el-tag>{{ currentArticle.category }}</el-tag>
          <span class="author">作者：{{ currentArticle.author?.real_name || currentArticle.author?.username }}</span>
          <span class="time">发布时间：{{ formatDate(currentArticle.created_at) }}</span>
        </div>
        <div class="article-content" v-html="currentArticle.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ArticleList from '@/components/ArticleList.vue';
import articleService from '@/services/article.service';

// 预定义的文章分类
const predefinedCategories = [
  '心理健康知识',
  '压力管理',
  '情绪调节',
  '人际关系',
  '学业指导',
  '职业规划',
  '心理疾病知识'
];

export default {
  name: 'ArticlesView',
  components: {
    ArticleList
  },
  setup() {
    const loading = ref(false);
    const articles = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(8);
    const category = ref('');
    const search = ref('');
    const dialogVisible = ref(false);
    const currentArticle = ref(null);

    const fetchArticles = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          category: category.value,
          search: search.value
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

    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchArticles();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchArticles();
    };

    const handleArticleClick = async (article) => {
      try {
        const response = await articleService.getArticle(article.id);
        currentArticle.value = response;
        dialogVisible.value = true;
      } catch (error) {
        console.error('Failed to fetch article details:', error);
        ElMessage.error('获取文章详情失败');
      }
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

    onMounted(() => {
      fetchArticles();
    });

    return {
      loading,
      articles,
      total,
      currentPage,
      pageSize,
      category,
      categories: predefinedCategories,
      search,
      dialogVisible,
      currentArticle,
      Search,
      handleFilter,
      handlePageChange,
      handleSizeChange,
      handleArticleClick,
      fetchArticles,
      formatDate
    };
  }
};
</script>

<style scoped>
.articles-view {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.article-detail {
  padding: 20px;
}

.article-meta {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
}

.article-content {
  line-height: 1.8;
}

.author, .time {
  font-size: 14px;
}

/* 添加深度选择器来确保样式能够影响到文章内容 */
:deep(.article-content) {
  text-align: left !important;
}

:deep(.article-content img) {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 10px auto !important;
  box-sizing: border-box !important;
}

:deep(.article-content p) {
  text-align: left !important;
  margin: 1em 0;
}

:deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog) {
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
</style> 
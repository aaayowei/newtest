<template>
  <div class="favorite-articles">
    <el-card class="articles-card">
      <template #header>
        <div class="card-header">
          <span>我的收藏</span>
        </div>
      </template>

      <article-list
        v-loading="loading"
        :articles="articles"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @article-click="handleArticleClick"
        @update:current-page="handlePageChange"
        @update:page-size="handleSizeChange"
        @refresh="fetchFavorites"
      >
        <template #empty>
          <el-empty description="暂无收藏的文章">
            <el-button type="primary" @click="goToArticles">浏览文章</el-button>
          </el-empty>
        </template>
      </article-list>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="currentArticle?.title"
      width="70%"
      destroy-on-close
      class="article-dialog"
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
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import ArticleList from '@/components/ArticleList.vue';
import articleService from '@/services/article.service';

export default {
  name: 'FavoriteArticlesView',
  components: {
    ArticleList
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const articles = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(8);
    const dialogVisible = ref(false);
    const currentArticle = ref(null);

    const fetchFavorites = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        };

        const response = await articleService.getFavorites(params);
        articles.value = response.articles;
        total.value = response.total;
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        ElMessage.error('获取收藏文章失败');
      } finally {
        loading.value = false;
      }
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchFavorites();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchFavorites();
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

    const goToArticles = () => {
      router.push('/student/articles');
    };

    onMounted(() => {
      fetchFavorites();
    });

    return {
      loading,
      articles,
      total,
      currentPage,
      pageSize,
      dialogVisible,
      currentArticle,
      handlePageChange,
      handleSizeChange,
      handleArticleClick,
      fetchFavorites,
      formatDate,
      goToArticles
    };
  }
};
</script>

<style scoped>
.favorite-articles {
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

.article-dialog :deep(.el-dialog__body) {
  background-color: #f5f7fa;
}

.article-dialog .article-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
</style> 
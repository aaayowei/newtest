<template>
  <div class="article-list">
    <div v-if="articles.length > 0" class="article-grid">
      <el-row :gutter="20">
        <el-col
          v-for="article in articles"
          :key="article.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <div class="article-item">
            <el-card
              class="article-card"
              :body-style="{ padding: '0px' }"
              @click="handleArticleClick(article)"
            >
              <div class="article-cover">
                <el-image
                  :src="article.cover_image ? (article.cover_image.startsWith('http') ? article.cover_image : `${baseURL}${article.cover_image}`) : getDefaultCover()"
                  fit="cover"
                  :lazy="true"
                >
                  <template #error>
                    <div class="image-error">
                      <div class="default-cover">
                        <el-icon class="cover-icon"><Reading /></el-icon>
                        <div class="category-text">{{ article.category || '文章' }}</div>
                      </div>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="article-info">
                <h3 class="article-title">{{ article.title }}</h3>
                <div class="article-meta">
                  <span class="author">
                    {{ article.author?.real_name || article.author?.username || '未知作者' }}
                  </span>
                  <span class="category" v-if="article.category">
                    {{ article.category }}
                  </span>
                </div>
                <div class="article-stats">
                  <span class="views">
                    <el-icon><View /></el-icon>
                    {{ article.view_count || 0 }}
                  </span>
                  <span class="favorite" v-if="showFavorite" @click.stop="handleFavorite(article)">
                    <el-icon>
                      <Star v-if="!article.isFavorited" />
                      <StarFilled v-else />
                    </el-icon>
                    {{ article.favorite_count || 0 }}
                  </span>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>

      <div v-if="showPagination && total > 0" class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[8, 16, 24, 32]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @update:current-page="handleCurrentChange"
          @update:page-size="handleSizeChange"
        />
      </div>
    </div>

    <slot v-if="!loading && articles.length === 0" name="empty">
      <el-empty description="暂无文章" />
    </slot>
  </div>
</template>

<script>
import { onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import articleService from '@/services/article.service';
import { View, Star, StarFilled, Reading } from '@element-plus/icons-vue';

export default {
  name: 'ArticleList',
  components: {
    View,
    Star,
    StarFilled,
    Reading
  },
  props: {
    articles: {
      type: Array,
      required: true,
      default: () => []
    },
    showFavorite: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 8
    },
    total: {
      type: Number,
      default: 0
    }
  },
  emits: ['article-click', 'update:currentPage', 'update:pageSize', 'refresh'],
  setup(props, { emit }) {
    // 默认封面数组
    const defaultCovers = [
      '/articles/default-covers/default-cover1.jpg',
      '/articles/default-covers/default-cover2.jpg',
      '/articles/default-covers/default-cover3.jpg'
    ];

    const getDefaultCover = () => {
      const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';
      // 随机选择一个默认封面
      const randomIndex = Math.floor(Math.random() * defaultCovers.length);
      return `${baseURL}${defaultCovers[randomIndex]}`;
    };

    const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

    // 监听 articles 变化
    watch(() => props.articles, (newArticles) => {
      console.log('Articles updated:', newArticles);
    }, { deep: true });

    const handleArticleClick = (article) => {
      console.log('Article clicked:', article);
      emit('article-click', article);
    };

    const handleFavorite = async (article) => {
      try {
        if (article.isFavorited) {
          await articleService.unfavoriteArticle(article.id);
          ElMessage.success('取消收藏成功');
        } else {
          await articleService.favoriteArticle(article.id);
          ElMessage.success('收藏成功');
        }
        emit('refresh');
      } catch (error) {
        console.error('Favorite operation failed:', error);
        ElMessage.error('操作失败');
      }
    };

    const handleSizeChange = (val) => {
      console.log('Page size changed:', val);
      emit('update:pageSize', val);
    };

    const handleCurrentChange = (val) => {
      console.log('Current page changed:', val);
      emit('update:currentPage', val);
    };

    onMounted(() => {
      console.log('ArticleList mounted with props:', props);
      console.log('Using baseURL:', baseURL);
      if (props.articles.length > 0) {
        console.log('First article cover:', props.articles[0].cover_image);
      }
    });

    return {
      baseURL,
      getDefaultCover,
      handleArticleClick,
      handleFavorite,
      handleSizeChange,
      handleCurrentChange
    };
  }
};
</script>

<style scoped>
.article-list {
  padding: 20px 0;
  min-height: 400px; /* 添加最小高度 */
}

.article-grid {
  position: relative; /* 添加定位上下文 */
}

.article-item {
  margin-bottom: 20px;
  height: 100%;
}

.article-card {
  height: 100%;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.article-cover {
  width: 100%;
  height: 160px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0; /* 防止图片区域被压缩 */
}

.article-cover .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.article-card:hover .article-cover .el-image {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f9ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.default-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  padding: 20px;
  text-align: center;
}

.cover-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.category-text {
  font-size: 14px;
  color: #606266;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-info {
  padding: 14px;
  flex-grow: 1; /* 让信息区域自适应高度 */
  display: flex;
  flex-direction: column;
}

.article-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-stats {
  margin-top: auto; /* 将统计信息推到底部 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.no-data {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 40px 0;
}

.favorite {
  cursor: pointer;
  transition: color 0.3s;
}

.favorite:hover {
  color: #e6a23c;
}

.favorite .is-favorited {
  color: #e6a23c;
}

/* 添加响应式布局的优化 */
@media screen and (max-width: 768px) {
  .article-card {
    margin-bottom: 15px;
  }
  
  .article-cover {
    height: 140px;
  }
  
  .article-title {
    font-size: 14px;
    height: 40px;
  }
}
</style> 
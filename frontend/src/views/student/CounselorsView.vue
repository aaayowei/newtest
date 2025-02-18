<template>
  <div class="counselors-view">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索咨询师姓名/专长/职称"
            clearable
          >
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="searchForm.expertise"
            placeholder="专长领域"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in expertiseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="searchForm.rating"
            placeholder="评分筛选"
            clearable
            style="width: 100%"
          >
            <el-option label="4.5分以上" value="4.5" />
            <el-option label="4分以上" value="4.0" />
            <el-option label="3.5分以上" value="3.5" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 咨询师列表 -->
    <div class="counselors-list" v-loading="loading" v-infinite-scroll="loadMore" infinite-scroll-distance="10">
      <el-row :gutter="20">
        <template v-if="counselors && counselors.length > 0">
          <el-col :span="8" v-for="counselor in counselors" :key="counselor.id">
            <el-card class="counselor-card" shadow="hover">
              <div class="counselor-header">
                <el-avatar :size="80" :src="getAvatarUrl(counselor.avatar)" />
                <div class="counselor-info">
                  <h3>{{ counselor?.user?.real_name || counselor?.user?.username }}</h3>
                  <p class="title">{{ counselor?.title }}</p>
                  <div class="rating">
                    <el-rate v-model="counselor.rating" disabled show-score />
                  </div>
                </div>
              </div>
              <div class="expertise-tags">
                <el-tag
                  v-for="tag in (counselor?.expertise || '').split(',')"
                  :key="tag"
                  size="small"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="counselor-intro">
                {{ counselor?.introduction }}
              </div>
              <div class="counselor-stats">
                <div class="stat-item">
                  <span class="label">咨询次数</span>
                  <span class="value">{{ counselor?.consultation_count || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">好评率</span>
                  <span class="value">{{ counselor?.satisfaction_rate || 0 }}%</span>
                </div>
              </div>
              <div class="counselor-actions">
                <el-button type="primary" @click="handleAppointment(counselor)">预约咨询</el-button>
                <el-button type="text" @click="viewDetails(counselor)">查看详情</el-button>
              </div>
            </el-card>
          </el-col>
        </template>
        <template v-else>
          <el-col :span="24">
            <el-empty
              description="暂无符合条件的咨询师"
              :image-size="200"
            />
          </el-col>
        </template>
      </el-row>
      <!-- 加载更多提示 -->
      <div v-if="loading" class="loading-more">
        <el-icon class="loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-if="noMore" class="no-more">
        没有更多数据了
      </div>
    </div>
  </div>
</template>

<style scoped>
.counselors-view {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.counselors-list {
  margin-bottom: 20px;
  min-height: 200px;
}

.counselor-card {
  height: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.counselor-header {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.counselor-info {
  flex: 1;
}

.counselor-info h3 {
  margin: 0 0 5px;
  font-size: 18px;
  color: #333;
}

.title {
  color: #666;
  margin: 0 0 5px;
  font-size: 14px;
}

.expertise-tags {
  margin-bottom: 15px;
}

.tag {
  margin: 0 5px 5px 0;
}

.counselor-intro {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  height: 63px; /* 3行文字的高度 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  box-orient: vertical;
}

.counselor-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #999;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-item .value {
  color: #409EFF;
  font-size: 16px;
  font-weight: bold;
}

.counselor-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.loading-more {
  text-align: center;
  margin: 20px 0;
  color: #909399;
}

.loading-more .loading {
  margin-right: 5px;
}

.no-more {
  text-align: center;
  margin: 20px 0;
  color: #909399;
  font-size: 14px;
}
</style>

<script>
import { Loading } from '@element-plus/icons-vue'

export default {
  components: {
    Loading
  },
  data() {
    return {
      searchForm: {
        keyword: '',
        expertise: '',
        rating: ''
      },
      expertiseOptions: [
        { label: '抑郁症', value: '抑郁症' },
        { label: '焦虑症', value: '焦虑症' },
        { label: '人际关系', value: '人际关系' },
        { label: '情感问题', value: '情感问题' },
        { label: '压力管理', value: '压力管理' },
        { label: '职业规划', value: '职业规划' },
        { label: '学业压力', value: '学业压力' },
        { label: '自我认知', value: '自我认知' }
      ],
      counselors: [],
      loading: false,
      noMore: false,
      page: 1,
      limit: 9
    }
  },
  methods: {
    async fetchCounselors(append = false) {
      if (this.loading || (this.noMore && append)) return;
      
      try {
        this.loading = true;
        console.log('正在请求咨询师列表...');
        const response = await this.$axios.get('/counselors', {
          params: {
            page: this.page,
            limit: this.limit,
            keyword: this.searchForm.keyword,
            expertise: this.searchForm.expertise,
            rating: this.searchForm.rating
          }
        });
        console.log('获取到的响应数据:', response.data);
        
        const newData = Array.isArray(response.data) ? response.data : (response.data.data || []);
        
        if (append) {
          this.counselors = [...this.counselors, ...newData];
        } else {
          this.counselors = newData;
        }
        
        this.noMore = newData.length < this.limit;
        console.log('当前咨询师列表:', this.counselors);
        
      } catch (error) {
        console.error('获取咨询师列表失败:', error);
        this.$message.error('获取咨询师列表失败');
        if (!append) {
          this.counselors = [];
        }
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page += 1;
        this.fetchCounselors(true);
      }
    },
    handleSearch() {
      this.page = 1;
      this.noMore = false;
      this.fetchCounselors();
    },
    resetSearch() {
      this.searchForm = {
        keyword: '',
        expertise: '',
        rating: ''
      };
      this.page = 1;
      this.noMore = false;
      this.fetchCounselors();
    },
    getAvatarUrl(avatar) {
      if (!avatar) return '';
      return avatar.startsWith('/') ? `http://localhost:5000${avatar}` : `http://localhost:5000/${avatar}`;
    },
    handleAppointment(counselor) {
      this.$router.push(`/student/counselors/${counselor.id}/appointment`);
    },
    viewDetails(counselor) {
      this.$router.push(`/student/counselors/${counselor.id}`);
    }
  },
  created() {
    this.fetchCounselors();
  }
}
</script> 
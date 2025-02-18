<template>
  <div class="counselor-detail">
    <el-card v-loading="loading" class="detail-card">
      <!-- 基本信息 -->
      <div v-if="counselor" class="basic-info">
        <el-avatar :size="120" :src="getAvatarUrl(counselor.avatar)" />
        <div class="info-content">
          <h2>{{ counselor?.user?.real_name || counselor?.user?.username }}</h2>
          <p class="title">{{ counselor.title }}</p>
          <div class="rating">
            <el-rate v-model="counselor.rating" disabled show-score />
            <span class="consultation-count">咨询次数: {{ counselor.consultation_count }}</span>
            <span class="satisfaction-rate">满意度: {{ counselor.satisfaction_rate }}%</span>
          </div>
          <div class="expertise-tags">
            <el-tag
              v-for="tag in (counselor.expertise || '').split(',')"
              :key="tag"
              size="small"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="handleAppointment">
            立即预约
          </el-button>
        </div>
      </div>

      <!-- 详细信息标签页 -->
      <el-tabs v-if="counselor" class="detail-tabs">
        <el-tab-pane label="详细介绍">
          <div class="introduction">
            <h3>个人简介</h3>
            <p>{{ counselor.introduction }}</p>
            
            <h3>教育背景</h3>
            <div v-if="counselor.education" class="education" v-html="formatEducation(counselor.education)"></div>
            <el-empty v-else description="暂无教育背景信息" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="历史评价">
          <div class="reviews">
            <div class="review-stats">
              <div class="stat-item">
                <span class="label">总评分</span>
                <span class="value">{{ counselor.rating.toFixed(1) }}</span>
                <el-rate v-model="counselor.rating" disabled />
              </div>
              <div class="stat-item">
                <span class="label">满意度</span>
                <span class="value">{{ counselor.satisfaction_rate }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">总咨询次数</span>
                <span class="value">{{ counselor.consultation_count }}</span>
              </div>
            </div>

            <!-- 评价列表 -->
            <div class="review-list">
              <el-empty v-if="!reviews?.length" description="暂无评价" />
              <div v-else v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <span class="reviewer">{{ review.student?.real_name || '匿名用户' }}</span>
                  <el-rate v-model="review.rating" disabled />
                  <span class="review-time">{{ formatDate(review.time) }}</span>
                </div>
                <div class="review-content">{{ review.feedback }}</div>
              </div>
            </div>

            <!-- 分页器 -->
            <div class="pagination" v-if="reviews?.length">
              <el-pagination
                :current-page="reviewPage"
                :page-size="reviewPageSize"
                :total="totalReviews"
                layout="prev, pager, next"
                @current-change="handleReviewPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-empty v-else-if="!loading" description="未找到咨询师信息" />
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import counselorService from '@/services/counselor.service'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const counselor = ref(null)
    const reviews = ref([])
    const reviewPage = ref(1)
    const reviewPageSize = ref(10)
    const totalReviews = ref(0)

    // 获取咨询师详情
    const fetchCounselorDetail = async () => {
      try {
        console.log('正在获取咨询师详情, ID:', route.params.id)
        const data = await counselorService.getCounselorById(route.params.id)
        console.log('获取到的咨询师详情:', data)
        counselor.value = data
      } catch (error) {
        console.error('获取咨询师详情失败:', error)
        ElMessage.error('获取咨询师详情失败')
        throw error
      }
    }

    // 获取评价列表
    const fetchReviews = async () => {
      try {
        console.log('正在获取评价列表, 页码:', reviewPage.value)
        const response = await counselorService.getCounselorReviews(
          route.params.id,
          { page: reviewPage.value, limit: reviewPageSize.value }
        )
        console.log('获取到的评价列表:', response)
        reviews.value = response?.data || []
        totalReviews.value = response?.total || 0
      } catch (error) {
        console.error('获取评价列表失败:', error)
        ElMessage.error('获取评价列表失败')
      }
    }

    // 格式化教育背景
    const formatEducation = (education) => {
      return education.replace(/\n/g, '<br>')
    }

    // 立即预约
    const handleAppointment = () => {
      router.push('/student/counselors/' + route.params.id + '/appointment')
    }

    // 处理评价分页
    const handleReviewPageChange = (page) => {
      reviewPage.value = page
      fetchReviews()
    }

    // 格式化日期
    const formatDate = (date) => {
      return moment(date).format('YYYY-MM-DD HH:mm')
    }

    // 获取头像URL
    const getAvatarUrl = (avatar) => {
      if (!avatar) return ''
      return avatar.startsWith('/') ? 'http://localhost:5000' + avatar : 'http://localhost:5000/' + avatar
    }

    onMounted(async () => {
      try {
        console.log('组件挂载，开始获取数据')
        loading.value = true
        await fetchCounselorDetail()
        await fetchReviews()
        console.log('数据获取完成')
      } catch (error) {
        console.error('数据获取失败:', error)
        ElMessage.error('数据获取失败')
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      counselor,
      reviews,
      reviewPage,
      reviewPageSize,
      totalReviews,
      formatEducation,
      handleAppointment,
      handleReviewPageChange,
      formatDate,
      getAvatarUrl
    }
  }
}
</script>

<style scoped>
.counselor-detail {
  padding: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.basic-info {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.info-content {
  flex: 1;
}

.info-content h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.title {
  color: #666;
  margin: 0 0 10px;
  font-size: 16px;
}

.rating {
  margin-bottom: 15px;
}

.consultation-count,
.satisfaction-rate {
  margin-left: 20px;
  color: #666;
}

.expertise-tags {
  margin-top: 10px;
}

.tag {
  margin: 0 5px 5px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.detail-tabs {
  margin-top: 20px;
}

.introduction h3 {
  margin: 20px 0 10px;
  font-size: 18px;
  color: #333;
}

.introduction p {
  color: #666;
  line-height: 1.6;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.calendar-day {
  margin: 0;
  padding: 8px;
}

.calendar-day.is-available {
  background-color: #f0f9eb;
  color: #67c23a;
  border-radius: 50%;
}

.available-slots {
  font-size: 12px;
  color: #67c23a;
}

.time-slots {
  margin-top: 20px;
}

.time-slot-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-slot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.time-slot-card.selected {
  border-color: #409EFF;
}

.time {
  font-size: 16px;
  margin-bottom: 10px;
}

.review-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #666;
  margin-bottom: 5px;
}

.stat-item .value {
  font-size: 24px;
  color: #409EFF;
  font-weight: bold;
  margin: 5px 0;
}

.review-list {
  margin-top: 20px;
}

.review-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer {
  margin-right: 15px;
  font-weight: bold;
}

.review-time {
  margin-left: auto;
  color: #999;
}

.review-content {
  color: #666;
  line-height: 1.6;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 
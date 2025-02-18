<template>
  <div class="student-home">
    <!-- 轮播图 -->
    <el-carousel height="500px" class="banner">
      <el-carousel-item v-for="(item, index) in banners" :key="index">
        <div class="banner-item" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="banner-content">
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <el-button type="primary" size="large" @click="handleBannerAction(item)">
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 服务特色 -->
    <section class="features">
      <h2 class="section-title">我们的服务</h2>
      <div class="features-grid">
        <div class="feature-item" v-for="(feature, index) in features" :key="index">
          <i :class="feature.icon"></i>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- 咨询师推荐 -->
    <section class="counselors" v-loading="loading">
      <h2 class="section-title">优质的咨询师</h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="(counselor, index) in counselors" :key="index">
          <el-card class="counselor-card" shadow="hover">
            <img :src="counselor.avatar" class="counselor-avatar" />
            <h3>{{ counselor.name }}</h3>
            <p class="counselor-title">{{ counselor.title }}</p>
            <p class="counselor-description">{{ counselor.description }}</p>
            <div class="counselor-tags">
              <el-tag v-for="(tag, tagIndex) in counselor.tags" :key="tagIndex" size="small">
                {{ tag }}
              </el-tag>
            </div>
            <el-button type="primary" @click="handleAppointment(counselor)">预约咨询</el-button>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 心理测评推荐 -->
    <section class="assessments" v-loading="loading">
      <h2 class="section-title">心理测评</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(assessment, index) in assessments" :key="index">
          <el-card class="assessment-card" shadow="hover">
            <img :src="assessment.image" class="assessment-image" />
            <h3>{{ assessment.title }}</h3>
            <p>{{ assessment.description }}</p>
            <el-button type="primary" @click="handleAssessment(assessment)">开始测评</el-button>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 心理知识 -->
    <section class="articles" v-loading="loading">
      <h2 class="section-title">心理知识</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(article, index) in articles" :key="index">
          <el-card class="article-card" shadow="hover">
            <img :src="article.image" class="article-image" />
            <div class="article-content">
              <h3>{{ article.title }}</h3>
              <p>{{ article.summary }}</p>
              <div class="article-meta">
                <span><i class="far fa-clock"></i> {{ article.date }}</span>
                <span><i class="far fa-eye"></i> {{ article.views }}</span>
              </div>
              <el-button type="text" @click="handleArticle(article)">阅读更多</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import counselorService from '@/services/counselor.service';
import articleService from '@/services/article.service';
import assessmentService from '@/services/assessment.service';

export default {
  name: 'StudentHomeView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const counselors = ref([]);
    const articles = ref([]);
    const assessments = ref([]);

    const banners = [
      {
        image: require('@/assets/banner1.jpg'),
        title: '专业心理咨询服务',
        description: '我们提供专业的心理咨询服务，帮助你解决心理困扰',
        buttonText: '立即咨询',
        action: 'counselors'
      },
      {
        image: require('@/assets/banner2.jpg'),
        title: '心理健康评估',
        description: '通过专业的心理测评，了解自己的心理健康状况',
        buttonText: '开始测评',
        action: 'assessments'
      }
    ];

    const features = [
      {
        icon: 'fas fa-comments',
        title: '在线咨询',
        description: '随时随地与专业咨询师交流'
      },
      {
        icon: 'fas fa-clipboard-list',
        title: '心理测评',
        description: '科学的心理健康评估工具'
      },
      {
        icon: 'fas fa-book-reader',
        title: '心理知识',
        description: '丰富的心理健康知识库'
      },
      {
        icon: 'fas fa-user-shield',
        title: '隐私保护',
        description: '严格的隐私保护机制'
      }
    ];

    const fetchData = async () => {
      loading.value = true;
      try {
        // 获取推荐咨询师
        const counselorsRes = await counselorService.getRecommendedCounselors();
        counselors.value = counselorsRes.data.map(counselor => ({
          id: counselor.id,
          name: counselor.user.real_name || counselor.user.username,
          title: counselor.title,
          description: counselor.introduction || '暂无简介',
          avatar: counselor.avatar 
            ? (counselor.avatar.startsWith('/') 
                ? `http://localhost:5000${counselor.avatar}` 
                : `http://localhost:5000/${counselor.avatar}`)
            : require('@/assets/default-avatar.png'),
          tags: counselor.expertise ? counselor.expertise.split(',') : []
        }));

        // 获取热门文章
        const articlesRes = await articleService.getArticles({ 
          limit: 3, 
          sort: 'view_count',
          order: 'desc'
        });
        articles.value = articlesRes.articles.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.content.replace(/<[^>]+>/g, '').slice(0, 100) + '...',
          image: article.cover_image 
            ? `${process.env.VUE_APP_API_URL}${article.cover_image}`
            : require('@/assets/default-article.jpg'),
          date: new Date(article.created_at).toLocaleDateString('zh-CN'),
          views: article.view_count || 0
        }));

        // 获取测评类型
        const assessmentsRes = await assessmentService.getAssessments();
        if (Array.isArray(assessmentsRes.assessmentTypes)) {
          assessments.value = assessmentsRes.assessmentTypes.map(type => ({
            type,
            title: getAssessmentTitle(type),
            description: getAssessmentDescription(type),
            image: getAssessmentImage(type)
          }));
        } else {
          console.error('Invalid assessment types:', assessmentsRes);
          assessments.value = [];
        }

        console.log('Fetched counselors:', counselors.value);
      } catch (error) {
        console.error('Error fetching home data:', error);
        ElMessage.error('获取数据失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const getAssessmentTitle = (type) => {
      const titles = {
        anxiety: 'SAS焦虑自评量表',
        depression: 'SDS抑郁自评量表',
        personality: '人格特质测评'
      };
      return titles[type] || '未知测评';
    };

    const getAssessmentDescription = (type) => {
      const descriptions = {
        anxiety: '评估当前的焦虑水平，帮助了解自己的心理状态。',
        depression: '评估当前的抑郁风险，及时发现情绪问题。',
        personality: '了解自己的性格特点，促进自我认知。'
      };
      return descriptions[type] || '';
    };

    const getAssessmentImage = (type) => {
      const images = {
        anxiety: require('@/assets/image/assessments/anxiety.jpg'),
        depression: require('@/assets/image/assessments/depression.jpg'),
        personality: require('@/assets/image/assessments/personality.jpg')
      };
      return images[type] || require('@/assets/image/assessments/default.jpg');
    };

    const handleBannerAction = (banner) => {
      router.push(`/student/${banner.action}`);
    };

    const handleAppointment = (counselor) => {
      router.push(`/student/counselors/${counselor.id}/appointment`);
    };

    const handleAssessment = (assessment) => {
      router.push({
        name: 'assessment-process',
        params: { type: assessment.type }
      });
    };

    const handleArticle = (article) => {
      router.push({
        name: 'student-articles',
        query: { id: article.id }
      });
    };

    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      banners,
      features,
      counselors,
      articles,
      assessments,
      handleBannerAction,
      handleAppointment,
      handleAssessment,
      handleArticle
    };
  }
};
</script>

<style scoped>
.student-home {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.banner {
  margin-bottom: 60px;
}

.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.banner-content {
  max-width: 800px;
  padding: 0 20px;
}

.banner-content h2 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
}

.banner-content p {
  font-size: 24px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  color: #303133;
}

.features {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-item {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-item i {
  font-size: 36px;
  color: #409EFF;
  margin-bottom: 20px;
}

.feature-item h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.feature-item p {
  color: #606266;
  line-height: 1.6;
}

.counselors,
.assessments,
.articles {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.counselor-card {
  height: 410px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.counselor-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.counselor-card h3 {
  margin: 0 0 5px;
  font-size: 18px;
  color: #303133;
}

.counselor-title {
  margin: 0 0 10px;
  color: #606266;
  font-size: 14px;
}

.counselor-description {
  margin: 0 0 15px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  height: 63px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  text-align: center;
}

.counselor-tags {
  margin-bottom: 15px;
  height: 32px;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
}

.counselor-tags .el-tag {
  margin: 0;
}

.assessment-card {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.assessment-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.assessment-card h3 {
  margin: 15px 0 10px;
  font-size: 18px;
  color: #303133;
  padding: 0 20px;
}

.assessment-card p {
  margin: 0 0 15px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  height: 63px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  text-align: center;
  padding: 0 20px;
}

.assessment-card .el-button {
  margin-top: auto;
  margin-bottom: 20px;
}

.article-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.article-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.article-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.article-content p {
  flex: 1;
  margin: 0 0 15px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  color: #909399;
  font-size: 14px;
  display: flex;
  gap: 20px;
}

.article-meta i {
  margin-right: 5px;
}

@media screen and (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .banner-content h2 {
    font-size: 36px;
  }

  .banner-content p {
    font-size: 18px;
  }
}
</style> 
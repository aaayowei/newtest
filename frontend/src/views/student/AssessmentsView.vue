<template>
  <div class="assessments-view">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2 class="page-title">心理测评</h2>
        <p class="page-description">
          通过专业的心理测评量表，了解自己的心理健康状况，获取个性化的建议。
        </p>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="assessment-cards">
      <el-col
        v-for="type in assessmentTypes"
        :key="type"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="assessment-card" :body-style="{ padding: '0px' }">
          <div class="assessment-image">
            <el-image
              :src="getAssessmentImage(type)"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="assessment-info">
            <h3>{{ getAssessmentTitle(type) }}</h3>
            <p>{{ getAssessmentDescription(type) }}</p>
            <div class="assessment-footer">
              <el-button type="primary" @click="startAssessment(type)">开始测评</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测评说明对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="getAssessmentTitle(selectedType)"
      width="50%"
    >
      <div class="assessment-intro">
        <h4>测评说明</h4>
        <p>{{ getAssessmentIntro(selectedType) }}</p>
        <h4>注意事项</h4>
        <ul>
          <li>请在安静的环境下完成测评</li>
          <li>请根据实际情况如实作答</li>
          <li>测评过程中请勿中途退出</li>
          <li>完成测评后可查看详细分析报告</li>
        </ul>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStart">
            开始测评
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import assessmentService from '@/services/assessment.service';
import anxietyImg from '@/assets/image/assessments/anxiety.jpg';
import depressionImg from '@/assets/image/assessments/depression.jpg';
import personalityImg from '@/assets/image/assessments/personality.jpg';
import defaultImg from '@/assets/image/assessments/default.jpg';

export default {
  name: 'AssessmentsView',
  components: {
    Picture
  },
  setup() {
    const router = useRouter();
    const assessmentTypes = ref([]);
    const dialogVisible = ref(false);
    const selectedType = ref('');

    const getAssessmentImage = (type) => {
      const images = {
        anxiety: anxietyImg,
        depression: depressionImg,
        personality: personalityImg
      };
      return images[type] || defaultImg;
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

    const getAssessmentIntro = (type) => {
      const intros = {
        anxiety: '本测评包含20个问题，用于评估您当前的焦虑水平。测评时间约为10-15分钟。',
        depression: '本测评包含20个问题，用于评估您当前的抑郁风险水平。测评时间约为10-15分钟。',
        personality: '本测评包含30个问题，用于评估您的性格特征。测评时间约为15-20分钟。'
      };
      return intros[type] || '';
    };

    const startAssessment = (type) => {
      selectedType.value = type;
      dialogVisible.value = true;
    };

    const confirmStart = () => {
      dialogVisible.value = false;
      router.push({
        name: 'assessment-process',
        params: { type: selectedType.value }
      });
    };

    const fetchAssessmentTypes = async () => {
      try {
        const response = await assessmentService.getAssessments();
        assessmentTypes.value = response.assessmentTypes;
      } catch (error) {
        console.error('Failed to fetch assessment types:', error);
      }
    };

    onMounted(() => {
      fetchAssessmentTypes();
    });

    return {
      assessmentTypes,
      dialogVisible,
      selectedType,
      getAssessmentImage,
      getAssessmentTitle,
      getAssessmentDescription,
      getAssessmentIntro,
      startAssessment,
      confirmStart
    };
  }
};
</script>

<style scoped>
.assessments-view {
  padding: 20px;
}

.page-title {
  margin: 0 0 10px;
  color: #303133;
}

.page-description {
  color: #606266;
  margin-bottom: 30px;
}

.assessment-cards {
  margin-top: 20px;
}

.assessment-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.assessment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.assessment-image {
  height: 200px;
  overflow: hidden;
}

.assessment-image .el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.assessment-info {
  padding: 20px;
}

.assessment-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.assessment-info p {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
  min-height: 42px;
}

.assessment-footer {
  text-align: center;
}

.assessment-intro h4 {
  color: #303133;
  margin: 20px 0 10px;
}

.assessment-intro p {
  color: #606266;
  line-height: 1.6;
}

.assessment-intro ul {
  color: #606266;
  padding-left: 20px;
}

.assessment-intro li {
  line-height: 2;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 
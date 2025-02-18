<template>
  <div class="assessment-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>测评详情</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-descriptions v-if="assessment" :column="2" border>
        <el-descriptions-item label="学生姓名">
          {{ assessment.user?.real_name }}
        </el-descriptions-item>
        <el-descriptions-item label="测评类型">
          {{ getAssessmentType(assessment.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="得分">
          <span :class="getScoreClass(assessment.score)">{{ assessment.score }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="评估等级">
          <el-tag :type="getLevelType(assessment.result?.level)">
            {{ assessment.result?.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ formatDate(assessment.completed_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="测评建议" :span="2">
          {{ assessment.result?.advice }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="assessment?.answers?.length" class="answers-section">
        <h3>答题详情</h3>
        <div class="answers-list">
          <div
            v-for="(answer, index) in assessment.answers"
            :key="answer.id"
            class="answer-item"
          >
            <div class="question">
              <span class="question-number">Q{{ index + 1 }}.</span>
              {{ answer.question.question }}
            </div>
            <div class="answer">
              <span class="answer-label">学生答案：</span>
              {{ answer.question.options[answer.answer] }}
            </div>
            <div class="score">
              <span class="score-label">得分：</span>
              {{ answer.score }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import assessmentService from '@/services/assessment.service';

export default {
  name: 'AssessmentDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const assessment = ref(null);

    const getAssessmentType = (type) => {
      const types = {
        anxiety: '焦虑测评',
        depression: '抑郁测评',
        personality: '性格测评'
      };
      return types[type] || type;
    };

    const getScoreClass = (score) => {
      if (score < 30) return 'score-low';
      if (score < 60) return 'score-medium';
      return 'score-high';
    };

    const getLevelType = (level) => {
      const types = {
        '正常': 'success',
        '轻度焦虑': 'warning',
        '中度焦虑': 'danger',
        '重度焦虑': 'danger',
        '轻度抑郁': 'warning',
        '中度抑郁': 'danger',
        '重度抑郁': 'danger',
        'A型': 'success',
        'B型': 'warning',
        'C型': 'info'
      };
      return types[level] || 'info';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const fetchAssessmentDetail = async (id) => {
      try {
        const response = await assessmentService.getAssessmentDetail(id);
        if (response.result && typeof response.result === 'string') {
          try {
            response.result = JSON.parse(response.result);
          } catch (error) {
            console.error('Error parsing result:', error);
            response.result = null;
          }
        }
        assessment.value = response;
      } catch (error) {
        console.error('获取测评详情失败:', error);
        ElMessage.error('获取测评详情失败');
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      if (route.params.id) {
        fetchAssessmentDetail(route.params.id);
      }
    });

    return {
      assessment,
      getAssessmentType,
      getScoreClass,
      getLevelType,
      formatDate,
      goBack
    };
  }
};
</script>

<style scoped>
.assessment-detail {
  padding: 20px;
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

.score-low {
  color: #67C23A;
}

.score-medium {
  color: #E6A23C;
}

.score-high {
  color: #F56C6C;
}

.answers-section {
  margin-top: 20px;
}

.answers-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.answers-list {
  padding: 10px;
}

.answer-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.answer-item:last-child {
  border-bottom: none;
}

.question {
  margin-bottom: 10px;
  color: #303133;
}

.question-number {
  font-weight: bold;
  margin-right: 8px;
  color: #409EFF;
}

.answer,
.score {
  color: #606266;
  margin: 5px 0;
  padding-left: 25px;
}

.answer-label,
.score-label {
  color: #909399;
  margin-right: 8px;
}
</style> 
<template>
  <div class="assessment-result">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>测评结果</span>
          <el-button type="primary" @click="backToList">返回列表</el-button>
        </div>
      </template>

      <div v-if="result" class="result-container">
        <div class="result-header">
          <h2>{{ getAssessmentType(result.type) }}</h2>
          <div class="completion-time">
            完成时间：{{ formatDate(result.completed_at) }}
          </div>
        </div>

        <div class="score-section">
          <div class="score-display">
            <div class="score-label">标准分</div>
            <div class="score-value">{{ result.score }}</div>
          </div>
          <div class="level-info" v-if="parsedResult">
            <el-tag :type="getLevelType(parsedResult.level)">
              {{ parsedResult.level }}
            </el-tag>
          </div>
        </div>

        <div class="advice-section" v-if="parsedResult">
          <h3>评估建议</h3>
          <p>{{ parsedResult.advice }}</p>
        </div>

        <div v-if="showAnswers" class="answers-section">
          <h3>答题详情</h3>
          <div
            v-for="(answer, index) in result.answers"
            :key="answer.id"
            class="answer-item"
          >
            <div class="question-info">
              <span class="question-number">第 {{ index + 1 }} 题</span>
              <div class="question-text">{{ answer.question.question }}</div>
            </div>
            <div class="answer-info">
              <span class="answer-label">你的答案：</span>
              <span>{{ answer.question.options[answer.answer] }}</span>
              <span class="score-info">得分：{{ answer.score }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import assessmentService from '@/services/assessment.service';
import dayjs from 'dayjs';

export default {
  name: 'AssessmentResultView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const result = ref(null);
    const parsedResult = ref(null);
    const showAnswers = ref(true);

    const getAssessmentType = (type) => {
      const types = {
        anxiety: 'SAS焦虑自评量表',
        depression: 'SDS抑郁自评量表',
        personality: '人格测评'
      };
      return types[type] || '心理测评';
    };

    const parseResult = (result) => {
      if (!result || !result.result) return null;
      try {
        return typeof result.result === 'string' 
          ? JSON.parse(result.result)
          : result.result;
      } catch (error) {
        console.error('Error parsing result:', error);
        return null;
      }
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
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    };

    const fetchResult = async () => {
      try {
        loading.value = true;
        const response = await assessmentService.getAssessmentDetail(route.params.id);
        console.log('Fetched assessment result:', response);
        result.value = response;
        parsedResult.value = parseResult(response);
        console.log('Parsed result:', parsedResult.value);
      } catch (error) {
        console.error('Failed to fetch assessment result:', error);
        ElMessage.error('获取测评结果失败');
        router.push({ name: 'student-assessments' });
      } finally {
        loading.value = false;
      }
    };

    const backToList = () => {
      router.push({ name: 'student-assessments' });
    };

    onMounted(() => {
      fetchResult();
    });

    return {
      loading,
      result,
      parsedResult,
      showAnswers,
      getAssessmentType,
      getLevelType,
      formatDate,
      backToList
    };
  }
};
</script>

<style scoped>
.assessment-result {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-container {
  padding: 20px 0;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-header h2 {
  margin: 0 0 10px;
  color: #303133;
}

.completion-time {
  color: #909399;
  font-size: 14px;
}

.score-section {
  text-align: center;
  margin-bottom: 40px;
}

.score-display {
  margin-bottom: 20px;
}

.score-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.score-value {
  font-size: 48px;
  color: #409EFF;
  font-weight: bold;
}

.level-info {
  .el-tag {
    font-size: 16px;
    padding: 8px 16px;
  }
}

.advice-section {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 40px;
}

.advice-section h3 {
  margin: 0 0 15px;
  color: #303133;
}

.advice-section p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.answers-section {
  margin-top: 40px;
}

.answers-section h3 {
  margin: 0 0 20px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.answer-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 4px;
  background: #f5f7fa;
}

.question-info {
  margin-bottom: 10px;
}

.question-number {
  color: #909399;
  margin-right: 10px;
}

.question-text {
  color: #303133;
  margin: 5px 0;
}

.answer-info {
  color: #606266;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-label {
  margin-right: 10px;
}

.score-info {
  color: #409EFF;
  font-weight: bold;
}
</style> 
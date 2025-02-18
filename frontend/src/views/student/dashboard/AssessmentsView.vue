<template>
  <div class="assessments-view">
    <el-card class="assessments-card">
      <template #header>
        <div class="card-header">
          <span>我的测评</span>
          <el-button type="primary" @click="startNewAssessment">开始新测评</el-button>
        </div>
      </template>

      <el-table
        v-if="assessments.length > 0"
        v-loading="loading"
        :data="assessments"
        style="width: 100%"
      >
        <el-table-column prop="title" label="测评名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="viewResult(row)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="测评类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getAssessmentType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span :class="getScoreClass(row.score)">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="result.level" label="评估等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(getResultLevel(row))">
              {{ getResultLevel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completed_at" label="完成时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.completed_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewResult(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-else
        description="暂无测评记录"
      >
        <el-button type="primary" @click="startNewAssessment">开始测评</el-button>
      </el-empty>

      <div v-if="assessments.length > 0" class="pagination">
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

    <!-- 测评结果对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedAssessment?.title"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedAssessment" class="result-dialog">
        <div class="result-summary">
          <div class="summary-item">
            <span class="label">得分：</span>
            <span :class="getScoreClass(selectedAssessment.score)">
              {{ selectedAssessment.score }}
            </span>
          </div>
          <div class="summary-item">
            <span class="label">评估等级：</span>
            <el-tag :type="getLevelType(getResultLevel(selectedAssessment))">
              {{ getResultLevel(selectedAssessment) }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="label">完成时间：</span>
            <span>{{ formatDate(selectedAssessment.completed_at) }}</span>
          </div>
        </div>

        <div class="result-advice">
          <h4>专业建议</h4>
          <p>{{ getResultAdvice(selectedAssessment) }}</p>
        </div>

        <div class="result-details">
          <h4>答题详情</h4>
          <div class="answers-list">
            <div
              v-for="(answer, index) in selectedAssessment.answers"
              :key="answer.id"
              class="answer-item"
            >
              <div class="question">
                <span class="question-number">Q{{ index + 1 }}.</span>
                {{ answer.question.question }}
              </div>
              <div class="answer">
                <span class="answer-label">您的答案：</span>
                {{ getAnswerText(answer) }}
              </div>
              <div class="score">
                <span class="score-label">得分：</span>
                {{ answer.score }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import assessmentService from '@/services/assessment.service';

export default {
  name: 'StudentAssessmentsView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const assessments = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const dialogVisible = ref(false);
    const selectedAssessment = ref(null);

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

    const getResultLevel = (assessment) => {
      if (!assessment) {
        console.log('No assessment provided');
        return '';
      }
      console.log('Processing assessment:', assessment);
      console.log('Raw result:', assessment.result);
      
      if (!assessment.result) {
        console.log('No result data available');
        return '';
      }

      const result = assessment.result;
      const level = result.level;
      console.log('Extracted level:', level);
      return level || '';
    };

    const getResultAdvice = (assessment) => {
      if (!assessment) {
        console.log('No assessment provided');
        return '';
      }
      console.log('Processing assessment for advice:', assessment);
      console.log('Raw result for advice:', assessment.result);
      
      if (!assessment.result) {
        console.log('No result data available');
        return '';
      }

      const result = assessment.result;
      const advice = result.advice;
      console.log('Extracted advice:', advice);
      return advice || '';
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

    const fetchAssessments = async () => {
      try {
        loading.value = true;
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current user:', user);
        
        if (!user) {
          console.error('User not logged in');
          ElMessage.error('请先登录');
          router.push('/login');
          return;
        }

        if (!user.id) {
          console.error('Invalid user data:', user);
          ElMessage.error('用户信息不完整，请重新登录');
          router.push('/login');
          return;
        }

        console.log('Fetching assessments for user:', user.id);
        const response = await assessmentService.getUserAssessments(user.id, {
          page: currentPage.value,
          limit: pageSize.value,
          include: ['answers', 'answers.question']
        });

        console.log('Assessment response:', response);
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }

        assessments.value = response.assessments || [];
        total.value = response.total || 0;

        assessments.value.forEach(assessment => {
          console.log(`Assessment ${assessment.id} answers:`, assessment.answers);
        });
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
        ElMessage.error(error.response?.data?.message || '获取测评记录失败');
      } finally {
        loading.value = false;
      }
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchAssessments();
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchAssessments();
    };

    const startNewAssessment = () => {
      router.push('/student/assessments');
    };

    const viewResult = async (assessment) => {
      try {
        console.log('Selected assessment:', assessment);
        if (!assessment.answers) {
          // 如果没有答题详情，尝试重新获取完整的测评信息
          const response = await assessmentService.getAssessmentDetail(assessment.id);
          selectedAssessment.value = response;
        } else {
          selectedAssessment.value = assessment;
        }
        console.log('Assessment answers:', selectedAssessment.value?.answers);
        dialogVisible.value = true;
      } catch (error) {
        console.error('Error loading assessment details:', error);
        ElMessage.error('加载测评详情失败');
      }
    };

    const getAnswerText = (answer) => {
      try {
        if (!answer.question || !answer.question.options) {
          console.error('Missing question or options:', answer);
          return '';
        }
        const options = typeof answer.question.options === 'string'
          ? JSON.parse(answer.question.options)
          : answer.question.options;
        return options[answer.answer] || '';
      } catch (error) {
        console.error('Error parsing answer options:', error);
        return '';
      }
    };

    onMounted(() => {
      fetchAssessments();
    });

    return {
      loading,
      assessments,
      currentPage,
      pageSize,
      total,
      dialogVisible,
      selectedAssessment,
      getAssessmentType,
      getScoreClass,
      getLevelType,
      formatDate,
      handleSizeChange,
      handleCurrentChange,
      startNewAssessment,
      viewResult,
      getResultLevel,
      getResultAdvice,
      getAnswerText
    };
  }
};
</script>

<style scoped>
.assessments-view {
  padding: 20px;
}

.assessments-card {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table .cell) {
  white-space: nowrap;
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

.result-dialog {
  padding: 20px;
}

.result-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  color: #606266;
  margin-right: 8px;
}

.result-advice {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-advice h4 {
  margin: 0 0 10px;
  color: #303133;
}

.result-advice p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.result-details {
  margin-top: 20px;
}

.result-details h4 {
  margin: 0 0 15px;
  color: #303133;
  font-size: 16px;
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
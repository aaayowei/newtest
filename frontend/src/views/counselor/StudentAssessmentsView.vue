<template>
  <div class="student-assessments">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生测评记录</span>
          <el-input
            v-model="search"
            placeholder="搜索学生姓名"
            style="width: 200px"
            @input="handleSearch"
          />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="assessments"
        style="width: 100%"
      >
        <el-table-column prop="user.real_name" label="学生姓名" />
        <el-table-column prop="type" label="测评类型">
          <template #default="{ row }">
            {{ getAssessmentType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span :class="getScoreClass(row.score)">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="result.level" label="评估等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.result.level)">
              {{ row.result.level }}
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
            <el-button type="primary" link @click="viewDetail(row.id)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedAssessment?.title"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedAssessment" class="result-dialog">
        <div class="student-info">
          <h4>学生信息</h4>
          <div class="info-item">
            <span class="label">姓名：</span>
            <span>{{ selectedAssessment.user.real_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">学号：</span>
            <span>{{ selectedAssessment.user.student_id }}</span>
          </div>
        </div>

        <div class="result-summary">
          <div class="summary-item">
            <span class="label">得分：</span>
            <span :class="getScoreClass(selectedAssessment.score)">
              {{ selectedAssessment.score }}
            </span>
          </div>
          <div class="summary-item">
            <span class="label">评估等级：</span>
            <el-tag :type="getLevelType(selectedAssessment.result.level)">
              {{ selectedAssessment.result.level }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="label">完成时间：</span>
            <span>{{ formatDate(selectedAssessment.completed_at) }}</span>
          </div>
        </div>

        <div class="result-advice">
          <h4>专业建议</h4>
          <p>{{ selectedAssessment.result.advice }}</p>
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
    const search = ref('');
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
        const response = await assessmentService.getStatistics({
          page: currentPage.value,
          limit: pageSize.value,
          search: search.value
        });

        if (!response || !response.assessments) {
          throw new Error('Invalid response format');
        }

        assessments.value = response.assessments;
        total.value = response.total;
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
        ElMessage.error(error.response?.data?.message || '获取测评记录失败');
        assessments.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchAssessments();
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

    const viewDetail = (id) => {
      router.push(`/counselor/assessment/${id}`);
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
      search,
      dialogVisible,
      selectedAssessment,
      getAssessmentType,
      getScoreClass,
      getLevelType,
      formatDate,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      viewDetail
    };
  }
};
</script>

<style scoped>
.student-assessments {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.student-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.student-info h4 {
  margin: 0 0 15px;
  color: #303133;
  font-size: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.result-summary {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-item .label {
  color: #909399;
}

.result-advice {
  margin-bottom: 30px;
}

.result-advice h4,
.result-details h4 {
  margin: 0 0 15px;
  color: #303133;
  font-size: 16px;
}

.result-advice p {
  color: #606266;
  line-height: 1.8;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
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
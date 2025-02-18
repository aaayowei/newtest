<template>
  <div class="assessment-process">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ assessmentTitle }}</span>
          <div class="progress">
            第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
          </div>
        </div>
      </template>

      <div v-if="currentQuestion" class="question-container">
        <div class="question-content">
          {{ currentQuestion.question }}
        </div>

        <div class="options-container">
          <el-radio-group v-model="currentAnswer" class="options-list">
            <el-radio
              v-for="(option, key) in currentQuestion.options"
              :key="key"
              :label="key"
              class="option-item"
            >
              {{ option }}
            </el-radio>
          </el-radio-group>
        </div>

        <div class="actions">
          <el-space>
            <el-button
              v-if="currentIndex > 0"
              type="default"
              @click="previousQuestion"
            >
              上一题
            </el-button>
            <el-button
              type="primary"
              :disabled="!currentAnswer"
              @click="nextQuestion"
            >
              {{ isLastQuestion ? '提交' : '下一题' }}
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import assessmentService from '@/services/assessment.service';

export default {
  name: 'AssessmentProcessView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const questions = ref([]);
    const currentIndex = ref(0);
    const answers = ref([]);
    const currentAnswer = ref('');

    const assessmentType = computed(() => route.params.type);
    const assessmentTitle = computed(() => {
      const titles = {
        anxiety: 'SAS焦虑自评量表',
        depression: 'SDS抑郁自评量表',
        personality: '人格测评'
      };
      return titles[assessmentType.value] || '心理测评';
    });

    const currentQuestion = computed(() => 
      questions.value[currentIndex.value] || null
    );

    const isLastQuestion = computed(() => 
      currentIndex.value === questions.value.length - 1
    );

    const fetchQuestions = async () => {
      try {
        loading.value = true;
        const response = await assessmentService.getAssessmentQuestions(assessmentType.value);
        questions.value = response.questions;
        
        // 初始化答案数组
        answers.value = new Array(questions.value.length).fill('');
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        ElMessage.error('获取题目失败');
        router.push({ name: 'student-assessments' });
      } finally {
        loading.value = false;
      }
    };

    const previousQuestion = () => {
      if (currentIndex.value > 0) {
        // 保存当前答案
        answers.value[currentIndex.value] = currentAnswer.value;
        currentIndex.value--;
        // 恢复上一题的答案
        currentAnswer.value = answers.value[currentIndex.value];
      }
    };

    const nextQuestion = async () => {
      if (!currentAnswer.value) {
        ElMessage.warning('请选择一个选项');
        return;
      }

      // 保存当前答案
      answers.value[currentIndex.value] = currentAnswer.value;

      if (isLastQuestion.value) {
        // 最后一题，确认提交
        try {
          await ElMessageBox.confirm(
            '确定要提交测评吗？提交后将无法修改答案。',
            '提示',
            {
              confirmButtonText: '确定提交',
              cancelButtonText: '再检查一下',
              type: 'warning'
            }
          );
          submitAssessment();
        } catch {
          // 用户取消提交
        }
      } else {
        // 进入下一题
        currentIndex.value++;
        // 恢复下一题的答案（如果之前已答过）
        currentAnswer.value = answers.value[currentIndex.value];
      }
    };

    const submitAssessment = async () => {
      try {
        loading.value = true;
        
        // 检查是否所有题目都已答完
        const unansweredQuestions = answers.value.findIndex(answer => !answer);
        if (unansweredQuestions !== -1) {
          ElMessage.warning(`第 ${unansweredQuestions + 1} 题还未作答`);
          currentIndex.value = unansweredQuestions;
          return;
        }
        
        // 准备提交数据
        const answerData = questions.value.map((question, index) => ({
          questionId: question.id,
          answer: answers.value[index],
          score: parseInt(question.score_rules[answers.value[index]])
        }));

        console.log('Preparing to submit assessment');
        console.log('Assessment type:', assessmentType.value);
        console.log('Answer data:', answerData);

        const response = await assessmentService.submitAssessment(
          assessmentType.value,
          { answers: answerData }
        );

        console.log('Assessment submission response:', response);

        ElMessage.success('提交成功');
        // 跳转到结果页面
        router.push({
          name: 'assessment-result',
          params: { id: response.assessmentId }
        });
      } catch (error) {
        console.error('Failed to submit assessment:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          answers: answers.value,
          questions: questions.value.length
        });
        ElMessage.error(error.response?.data?.message || '提交失败');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchQuestions();
    });

    return {
      loading,
      questions,
      currentIndex,
      currentAnswer,
      assessmentTitle,
      currentQuestion,
      isLastQuestion,
      previousQuestion,
      nextQuestion
    };
  }
};
</script>

<style scoped>
.assessment-process {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress {
  font-size: 14px;
  color: #909399;
}

.question-container {
  padding: 20px 0;
}

.question-content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #303133;
}

.options-container {
  margin-bottom: 40px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-item {
  margin: 0;
  padding: 15px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-space {
  display: flex;
  gap: 10px;
}
</style> 
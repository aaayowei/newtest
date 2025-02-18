<template>
  <div class="question-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>测评题库管理</span>
          <el-button type="primary" @click="showAddDialog">
            添加题目
          </el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-select v-model="filterType" placeholder="选择测评类型" clearable @change="handleFilter">
          <el-option
            v-for="type in assessmentTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>

      <el-table
        v-loading="loading"
        :data="questions"
        :height="tableHeight"
        style="width: 100%"
      >
        <el-table-column prop="assessment_type" label="测评类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getAssessmentType(row.assessment_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目内容" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="question-content">
              {{ row.question }}
              <el-tag v-if="row.isStandard" size="small" type="warning" class="standard-tag">
                标准题目
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="选项" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewOptions(row)">
              查看选项
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              :disabled="row.isStandard"
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              :disabled="row.isStandard"
              @click="handleDelete(row.id)"
            >
              删除
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

    <!-- 添加/编辑题目对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <el-form
        ref="questionForm"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="测评类型" prop="assessment_type">
          <el-select 
            v-model="formData.assessment_type" 
            placeholder="请选择测评类型"
            :disabled="isEdit"
          >
            <el-option
              v-for="type in availableTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="question">
          <el-input
            v-model="formData.question"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>
        <el-form-item label="选项">
          <div
            v-for="(option, index) in formData.options"
            :key="index"
            class="option-item"
          >
            <el-input
              v-model="formData.options[index]"
              placeholder="请输入选项内容"
            >
              <template #prepend>
                选项 {{ String.fromCharCode(65 + index) }}
              </template>
            </el-input>
            <el-input-number
              v-model="formData.score_rules[index]"
              :min="0"
              :max="100"
              placeholder="分值"
            />
            <el-button
              v-if="index === formData.options.length - 1"
              type="primary"
              circle
              @click="addOption"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button
              v-if="formData.options.length > 2"
              type="danger"
              circle
              @click="removeOption(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看选项对话框 -->
    <el-dialog
      v-model="optionsDialogVisible"
      title="选项详情"
      width="30%"
    >
      <div v-if="selectedQuestion" class="options-list">
        <div
          v-for="(option, index) in selectedQuestion.options"
          :key="index"
          class="option-detail"
        >
          <div class="option-content">
            <span class="option-label">选项 {{ String.fromCharCode(65 + index) }}:</span>
            <span>{{ option }}</span>
          </div>
          <div class="option-score">
            <span class="score-label">分值:</span>
            <span>{{ selectedQuestion.score_rules[index] }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import assessmentService from '@/services/assessment.service';
import debounce from 'lodash/debounce';

export default {
  name: 'AssessmentQuestionManageView',
  components: {
    Plus,
    Delete
  },
  setup() {
    const loading = ref(false);
    const questions = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const filterType = ref('');
    const dialogVisible = ref(false);
    const dialogTitle = ref('添加题目');
    const tableHeight = ref('400px');
    const formData = ref({
      assessment_type: '',
      question: '',
      options: [],
      score_rules: []
    });
    const isEdit = ref(false);
    const optionsDialogVisible = ref(false);
    const selectedQuestion = ref(null);

    const assessmentTypes = [
      { value: 'anxiety', label: 'SAS焦虑量表' },
      { value: 'depression', label: 'SDS抑郁量表' },
      { value: 'personality', label: '人格测评' }
    ];

    const availableTypes = computed(() => 
      assessmentTypes.filter(type => type.value === 'personality')
    );

    const rules = {
      assessment_type: [
        { required: true, message: '请选择测评类型', trigger: 'change' }
      ],
      question: [
        { required: true, message: '请输入题目内容', trigger: 'blur' },
        { min: 3, max: 500, message: '长度在 3 到 500 个字符', trigger: 'blur' }
      ]
    };

    const getAssessmentType = (type) => {
      const found = assessmentTypes.find(t => t.value === type);
      return found ? found.label : type;
    };

    const updateTableHeight = debounce(() => {
      const offset = 280; // 头部和其他元素的总高度
      const height = window.innerHeight - offset;
      tableHeight.value = `${Math.max(400, height)}px`;
    }, 100);

    const fetchQuestions = async () => {
      try {
        loading.value = true;
        const response = await assessmentService.getQuestionsList({
          page: currentPage.value,
          limit: pageSize.value,
          type: filterType.value
        });

        if (!response || !response.questions) {
          throw new Error('Invalid response format');
        }

        setTimeout(() => {
          questions.value = response.questions;
          total.value = response.total;
          updateTableHeight();
        }, 0);

      } catch (error) {
        console.error('Failed to fetch questions:', error);
        ElMessage.error(error.response?.data?.message || '获取题目列表失败');
      } finally {
        loading.value = false;
      }
    };

    const handleFilter = () => {
      currentPage.value = 1;
      fetchQuestions();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchQuestions();
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchQuestions();
    };

    const resetForm = () => {
      formData.value = {
        assessment_type: '',
        question: '',
        options: ['', ''],
        score_rules: [0, 0]
      };
      isEdit.value = false;
    };

    const showAddDialog = () => {
      dialogTitle.value = '添加题目';
      resetForm();
      dialogVisible.value = true;
    };

    const showEditDialog = (row) => {
      dialogTitle.value = '编辑题目';
      const options = Array.isArray(row.options) ? row.options : Object.values(row.options || {});
      const scores = Array.isArray(row.score_rules) ? row.score_rules : Object.values(row.score_rules || {});
      
      formData.value = {
        id: row.id,
        assessment_type: row.assessment_type,
        question: row.question,
        options: options,
        score_rules: scores
      };
      isEdit.value = true;
      dialogVisible.value = true;
    };

    const validateForm = async () => {
      if (!formData.value.options || formData.value.options.length < 2) {
        ElMessage.error('至少需要添加两个选项');
        return false;
      }

      // 检查是否有空选项
      const hasEmptyOption = formData.value.options.some(option => !option.trim());
      if (hasEmptyOption) {
        ElMessage.error('选项内容不能为空');
        return false;
      }

      // 检查分值是否都已设置
      const hasInvalidScore = formData.value.score_rules.some(score => score === undefined || score === null || score === 0);
      if (hasInvalidScore) {
        ElMessage.error('请为每个选项设置有效的分值（不能为0）');
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      try {
        if (!formData.value.assessment_type || !formData.value.question) {
          ElMessage.error('请填写完整的题目信息');
          return;
        }

        const valid = await validateForm();
        if (!valid) return;

        if (isEdit.value) {
          await assessmentService.updateQuestion(formData.value.id, formData.value);
          ElMessage.success('更新成功');
        } else {
          await assessmentService.createQuestion(formData.value);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        fetchQuestions();
      } catch (error) {
        console.error('Failed to submit question:', error);
        if (error.response?.status !== 400) {
          ElMessage.error(error.response?.data?.message || '操作失败');
        }
      }
    };

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这个题目吗？删除后无法恢复',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        await assessmentService.deleteQuestion(id);
        ElMessage.success('删除成功');
        fetchQuestions();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete question:', error);
          ElMessage.error(error.response?.data?.message || '删除失败');
        }
      }
    };

    const addOption = () => {
      formData.value.options.push('');
      formData.value.score_rules.push(0);
    };

    const removeOption = (index) => {
      formData.value.options.splice(index, 1);
      formData.value.score_rules.splice(index, 1);
    };

    const viewOptions = (row) => {
      const options = Array.isArray(row.options) ? row.options : Object.values(row.options || {});
      const scores = Array.isArray(row.score_rules) ? row.score_rules : Object.values(row.score_rules || {});
      
      selectedQuestion.value = {
        ...row,
        options: options,
        score_rules: scores
      };
      optionsDialogVisible.value = true;
    };

    onMounted(() => {
      fetchQuestions();
      updateTableHeight();
      window.addEventListener('resize', updateTableHeight);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateTableHeight);
    });

    return {
      loading,
      questions,
      currentPage,
      pageSize,
      total,
      filterType,
      assessmentTypes,
      dialogVisible,
      dialogTitle,
      formData,
      isEdit,
      optionsDialogVisible,
      selectedQuestion,
      rules,
      getAssessmentType,
      handleFilter,
      handleSizeChange,
      handleCurrentChange,
      showAddDialog,
      showEditDialog,
      handleSubmit,
      handleDelete,
      addOption,
      removeOption,
      viewOptions,
      tableHeight,
      availableTypes
    };
  }
};
</script>

<style scoped>
.question-manage {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
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

.filter-container {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-item .el-input {
  flex: 1;
}

.option-item .el-input-number {
  width: 120px;
}

.options-list {
  padding: 10px;
}

.option-detail {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.option-detail:last-child {
  border-bottom: none;
}

.option-content {
  margin-bottom: 5px;
}

.option-label,
.score-label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.question-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.standard-tag {
  margin-left: 8px;
}
</style> 
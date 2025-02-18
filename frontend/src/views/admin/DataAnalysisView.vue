<template>
  <div class="data-analysis">
    <div class="date-picker-container mb-4">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        @change="handleDateChange"
      />
    </div>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="12" v-for="(item, key) in overviewData" :key="key">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-title">{{ item.title }}</div>
            <div class="overview-value">{{ item.value }}</div>
            <div class="overview-trend" :class="{ 'positive': item.trend >= 0, 'negative': item.trend < 0 }">
              <el-icon><component :is="item.trend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              <span>{{ Math.abs(item.trend).toFixed(2) }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>测评类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="assessmentTypeOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预约趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="appointmentTrendOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>测评等级分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="assessmentLevelOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预约状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="appointmentStatusOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import statisticsService from '@/services/statistics.service';
import { ElMessage } from 'element-plus';

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'DataAnalysisView',
  components: {
    VChart
  },
  setup() {
    const dateRange = ref([]);
    const loading = ref(false);
    
    // 数据总览
    const overviewData = ref({
      assessments: { title: '总测评数', value: 0, trend: 0 },
      appointments: { title: '总预约数', value: 0, trend: 0 }
    });

    // 图表配置
    const assessmentTypeOption = ref({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });

    const appointmentTrendOption = ref({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [],
        type: 'line',
        smooth: true
      }]
    });

    const assessmentLevelOption = ref({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [],
        type: 'bar'
      }]
    });

    const appointmentStatusOption = ref({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        type: 'pie',
        radius: '50%',
        data: []
      }]
    });

    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一周',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        }
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 1);
          return [start, end];
        }
      },
      {
        text: '最近三个月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 3);
          return [start, end];
        }
      }
    ];

    // 处理日期变化
    const handleDateChange = async () => {
      await fetchAllData();
    };

    // 获取所有数据
    const fetchAllData = async () => {
      loading.value = true;
      try {
        const params = dateRange.value ? {
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        } : {};

        const [overviewRes, assessmentRes, appointmentRes] = await Promise.all([
          statisticsService.getOverviewStats(params),
          statisticsService.getAssessmentStats(params),
          statisticsService.getAppointmentTrends(params)
        ]);

        // 更新总览数据
        overviewData.value = {
          assessments: {
            title: '总测评数',
            value: overviewRes.overview.totalAssessments.value,
            trend: overviewRes.overview.totalAssessments.trend
          },
          appointments: {
            title: '总预约数',
            value: overviewRes.overview.totalAppointments.value,
            trend: overviewRes.overview.totalAppointments.trend
          }
        };

        // 更新测评类型分布
        assessmentTypeOption.value.series[0].data = assessmentRes.typeDistribution.map(item => ({
          name: getAssessmentTypeName(item.type),
          value: item.count
        }));

        // 更新测评等级分布
        const levelData = assessmentRes.levelDistribution;
        assessmentLevelOption.value.xAxis.data = levelData.map(item => item.level);
        assessmentLevelOption.value.series[0].data = levelData.map(item => item.count);

        // 更新预约趋势
        const trendData = appointmentRes.trends;
        appointmentTrendOption.value.xAxis.data = trendData.map(item => item.date);
        appointmentTrendOption.value.series[0].data = trendData.map(item => item.count);

        // 更新预约状态分布
        appointmentStatusOption.value.series[0].data = appointmentRes.statusDistribution.map(item => ({
          name: getAppointmentStatusName(item.status),
          value: item.count
        }));

      } catch (error) {
        console.error('Error fetching statistics:', error);
        ElMessage.error('获取统计数据失败');
      } finally {
        loading.value = false;
      }
    };

    // 获取测评类型名称
    const getAssessmentTypeName = (type) => {
      const types = {
        anxiety: '焦虑测评',
        depression: '抑郁测评',
        personality: '人格测评'
      };
      return types[type] || type;
    };

    // 获取预约状态名称
    const getAppointmentStatusName = (status) => {
      const statuses = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statuses[status] || status;
    };

    onMounted(() => {
      fetchAllData();
    });

    return {
      dateRange,
      dateShortcuts,
      loading,
      overviewData,
      assessmentTypeOption,
      appointmentTrendOption,
      assessmentLevelOption,
      appointmentStatusOption,
      handleDateChange
    };
  }
};
</script>

<style scoped>
.data-analysis {
  padding: 20px;
}

.date-picker-container {
  display: flex;
  justify-content: flex-end;
}

.overview-card {
  height: 120px;
  margin-bottom: 20px;
}

.overview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.overview-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.overview-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.overview-trend.positive {
  color: #67C23A;
}

.overview-trend.negative {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 
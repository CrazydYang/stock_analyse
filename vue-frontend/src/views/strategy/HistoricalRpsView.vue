<template>
  <div class="historical-rps-view" v-loading="loading" element-loading-text="正在加载历史RPS数据...">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-card shadow="hover">
        <div class="header-content">
          <div class="strategy-info">
            <h1 class="strategy-title">历史RPS数据分析</h1>
            <p class="strategy-subtitle">指数强度历史趋势与变化</p>
          </div>
          <div class="header-actions">
            <el-button @click="refreshData" :loading="loading" :icon="Refresh" type="primary">刷新数据</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 查询条件 -->
    <div class="query-section">
      <el-card shadow="hover">
        <template #header>
          <h3>查询条件</h3>
        </template>
        <el-form :inline="true">
          <el-form-item label="RPS周期">
            <el-select v-model="queryParams.period" placeholder="选择RPS周期" @change="refreshData">
              <el-option label="5日" :value="5"></el-option>
              <el-option label="10日" :value="10"></el-option>
              <el-option label="20日" :value="20"></el-option>
              <el-option label="60日" :value="60"></el-option>
              <el-option label="120日" :value="120"></el-option>
              <el-option label="250日" :value="250"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据量">
            <el-select v-model="queryParams.limit" placeholder="选择返回数量" @change="refreshData">
              <el-option label="50条" :value="50"></el-option>
              <el-option label="100条" :value="100"></el-option>
              <el-option label="200条" :value="200"></el-option>
              <el-option label="500条" :value="500"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 历史RPS数据表格 -->
    <div class="historical-data-section" v-if="historicalData.length > 0">
      <el-card shadow="hover">
        <template #header>
          <div class="table-header">
            <h3>历史RPS数据 ({{ queryParams.period }}日周期)</h3>
            <div class="table-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索指数名称"
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
            </div>
          </div>
        </template>
        
        <el-table
          :data="filteredHistoricalData"
          stripe
          border
          style="width: 100%"
          :default-sort="{ prop: 'rps_value', order: 'descending' }"
          height="600"
        >
          <el-table-column prop="index_code" label="指数代码" width="100" sortable />
          <el-table-column prop="index_name" label="指数名称" width="120" sortable />
          <el-table-column prop="period" label="周期(天)" width="100" sortable />
          <el-table-column label="涨跌幅" width="120" sortable prop="change_percent">
            <template #default="scope">
              <span :class="{ 'up': scope.row.change_percent > 0, 'down': scope.row.change_percent < 0 }">
                {{ scope.row.change_percent.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="RPS值" width="120" sortable prop="rps_value">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.rps_value"
                :color="getRpsColor(scope.row.rps_value)"
                :format="(val: number) => val.toFixed(1)"
                :stroke-width="10"
              />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" sortable>
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="queryParams.limit"
            :page-sizes="[50, 100, 200, 500]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalCount"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 趋势图表 -->
    <div class="chart-section" v-if="selectedIndexData.length > 0">
      <el-card shadow="hover">
        <template #header>
          <div class="chart-header">
            <h3>{{ selectedIndex ? selectedIndex.index_name : '' }} RPS趋势</h3>
            <div class="chart-controls">
              <el-select v-model="selectedIndexCode" placeholder="选择指数" @change="updateChart">
                <el-option
                  v-for="item in uniqueIndices"
                  :key="item.index_code"
                  :label="item.index_name"
                  :value="item.index_code"
                ></el-option>
              </el-select>
            </div>
          </div>
        </template>
        
        <!-- 这里可以使用ECharts或其他图表库来展示趋势 -->
        <div class="chart-container" style="height: 400px;">
          <!-- 图表将在这里渲染 -->
          <div ref="chartRef" style="width: 100%; height: 100%;"></div>
        </div>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!loading && historicalData.length === 0" description="暂无历史RPS数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getHistoricalRps } from '@/services/strategyApi'
import type { HistoricalRpsItem } from '@/services/strategyApi'
import * as echarts from 'echarts'

// 数据加载状态
const loading = ref(false)

// 历史RPS数据
const historicalData = ref<HistoricalRpsItem[]>([])
const totalCount = ref(0)
const currentPage = ref(1)

// 查询参数
const queryParams = ref({
  period: 20,
  limit: 100,
  offset: 0
})

// 搜索关键词
const searchKeyword = ref('')

// 图表相关
const chartRef = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)
const selectedIndexCode = ref('')
const selectedIndex = ref<HistoricalRpsItem | null>(null)
const selectedIndexData = ref<HistoricalRpsItem[]>([])

// 过滤后的历史RPS数据
const filteredHistoricalData = computed(() => {
  if (!searchKeyword.value) {
    return historicalData.value
  }
  return historicalData.value.filter(item => {
    return item.index_name.includes(searchKeyword.value)
  })
})

// 获取唯一的指数列表
const uniqueIndices = computed(() => {
  const indices = new Map<string, HistoricalRpsItem>()
  historicalData.value.forEach(item => {
    if (!indices.has(item.index_code)) {
      indices.set(item.index_code, item)
    }
  })
  return Array.from(indices.values())
})

// 获取RPS颜色
const getRpsColor = (rpsValue: number) => {
  if (rpsValue >= 90) return '#f56c6c' // 红色
  if (rpsValue >= 80) return '#e6a23c' // 橙色
  if (rpsValue >= 70) return '#67c23a' // 绿色
  return '#909399' // 灰色
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 刷新数据
const refreshData = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await getHistoricalRps(
      queryParams.value.period,
      queryParams.value.limit,
      queryParams.value.offset
    )
    
    if (response.code === 200) {
      historicalData.value = response.data.data
      totalCount.value = response.data.total
      
      // 如果有数据，默认选择第一个指数
      if (historicalData.value.length > 0 && !selectedIndexCode.value) {
        selectedIndexCode.value = historicalData.value[0].index_code
        updateChart()
      }
      
      ElMessage.success('历史RPS数据加载成功')
    } else {
      ElMessage.error(`加载失败: ${response.message}`)
    }
  } catch (error) {
    console.error('加载历史RPS数据失败:', error)
    ElMessage.error('加载历史RPS数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.value.limit = size
  queryParams.value.offset = 0
  currentPage.value = 1
  refreshData()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  queryParams.value.offset = (page - 1) * queryParams.value.limit
  refreshData()
}

// 更新图表
const updateChart = () => {
  if (!selectedIndexCode.value) return
  
  // 找到选中的指数
  selectedIndex.value = historicalData.value.find(item => item.index_code === selectedIndexCode.value) || null
  
  // 过滤出选中指数的所有数据
  selectedIndexData.value = historicalData.value.filter(item => item.index_code === selectedIndexCode.value)
  
  // 初始化图表
  initChart()
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 如果图表已经存在，销毁它
  if (chart.value) {
    chart.value.dispose()
  }
  
  // 创建新图表
  chart.value = echarts.init(chartRef.value)
  
  // 准备数据
  const dates = selectedIndexData.value.map(item => formatDate(item.created_at))
  const rpsValues = selectedIndexData.value.map(item => item.rps_value)
  const changeValues = selectedIndexData.value.map(item => item.change_percent)
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['RPS值', '涨跌幅']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: dates
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'RPS值',
        min: 0,
        max: 100,
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '涨跌幅(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: 'RPS值',
        type: 'line',
        yAxisIndex: 0,
        data: rpsValues,
        smooth: true,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '涨跌幅',
        type: 'line',
        yAxisIndex: 1,
        data: changeValues,
        smooth: true,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  
  // 设置图表选项
  chart.value.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.value?.resize()
  })
}

// 监听窗口大小变化
watch(
  () => selectedIndexData.value,
  () => {
    if (selectedIndexData.value.length > 0) {
      // 使用nextTick确保DOM已更新
      nextTick(() => {
        initChart()
      })
    }
  }
)

// 组件挂载时加载数据
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.historical-rps-view {
  padding: 20px;
}

.page-header,
.query-section,
.historical-data-section,
.chart-section {
  margin-bottom: 20px;
}

.header-content,
.table-header,
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strategy-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.strategy-subtitle {
  margin: 5px 0 0;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 涨跌颜色 */
.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}
</style>
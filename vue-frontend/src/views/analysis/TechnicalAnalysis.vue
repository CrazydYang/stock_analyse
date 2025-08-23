<template>
  <div class="technical-analysis">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span>技术分析</span>
          <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <div class="analysis-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="analysis-card">
              <template #header>
                <span>K线图</span>
              </template>
              <div class="chart-placeholder">
                <el-icon size="48"><TrendCharts /></el-icon>
                <p>K线图区域</p>
                <el-button type="primary" size="small">选择股票</el-button>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="analysis-card">
              <template #header>
                <span>技术指标</span>
              </template>
              <div class="indicators">
                <el-form :model="indicatorForm" label-width="100px">
                  <el-form-item label="MACD">
                    <el-switch v-model="indicatorForm.macd" />
                  </el-form-item>
                  <el-form-item label="RSI">
                    <el-switch v-model="indicatorForm.rsi" />
                  </el-form-item>
                  <el-form-item label="KDJ">
                    <el-switch v-model="indicatorForm.kdj" />
                  </el-form-item>
                  <el-form-item label="BOLL">
                    <el-switch v-model="indicatorForm.boll" />
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="analysis-card">
              <template #header>
                <span>交易信号</span>
              </template>
              <div class="signals">
                <el-timeline>
                  <el-timeline-item
                    v-for="signal in tradingSignals"
                    :key="signal.id"
                    :timestamp="signal.time"
                    :type="signal.type"
                  >
                    {{ signal.content }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="mt-20">
          <el-col :span="24">
            <el-card>
              <template #header>
                <span>历史数据</span>
              </template>
              <el-table :data="stockData" style="width: 100%">
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="open" label="开盘价" width="100" />
                <el-table-column prop="close" label="收盘价" width="100" />
                <el-table-column prop="high" label="最高价" width="100" />
                <el-table-column prop="low" label="最低价" width="100" />
                <el-table-column prop="volume" label="成交量" width="100" />
                <el-table-column prop="change" label="涨跌幅" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'

const indicatorForm = reactive({
  macd: true,
  rsi: false,
  kdj: true,
  boll: false
})

const tradingSignals = ref([
  {
    id: 1,
    time: '2024-01-15 14:30:00',
    type: 'success',
    content: 'MACD金叉信号出现，建议买入'
  },
  {
    id: 2,
    time: '2024-01-14 10:15:00',
    type: 'warning',
    content: 'RSI超买警告，注意风险'
  },
  {
    id: 3,
    time: '2024-01-13 09:45:00',
    type: 'info',
    content: 'KDJ指标显示超卖状态'
  }
])

const stockData = ref([
  {
    date: '2024-01-15',
    open: 15.20,
    close: 15.85,
    high: 15.90,
    low: 15.10,
    volume: 1250000,
    change: '+4.28%'
  },
  {
    date: '2024-01-14',
    open: 14.95,
    close: 15.20,
    high: 15.35,
    low: 14.80,
    volume: 980000,
    change: '+1.67%'
  },
  {
    date: '2024-01-13',
    open: 15.50,
    close: 14.95,
    high: 15.60,
    low: 14.85,
    volume: 1100000,
    change: '-3.55%'
  }
])

const refreshData = () => {
  // 这里可以添加刷新数据的逻辑
  console.log('刷新数据...')
}
</script>

<style scoped>
.technical-analysis {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-content {
  margin-top: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.indicators {
  padding: 20px;
}

.signals {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
<template>
  <div class="fundamental-analysis">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span>基本面分析</span>
          <div class="header-actions">
            <el-input
              v-model="searchStock"
              placeholder="输入股票代码或名称"
              style="width: 200px; margin-right: 10px"
            />
            <el-button type="primary" @click="searchStockData">查询</el-button>
          </div>
        </div>
      </template>
      
      <div class="analysis-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="analysis-card">
              <template #header>
                <span>公司基本信息</span>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="公司名称">{{ companyInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="股票代码">{{ companyInfo.code }}</el-descriptions-item>
                <el-descriptions-item label="所属行业">{{ companyInfo.industry }}</el-descriptions-item>
                <el-descriptions-item label="市值">{{ companyInfo.marketCap }}</el-descriptions-item>
                <el-descriptions-item label="市盈率">{{ companyInfo.pe }}</el-descriptions-item>
                <el-descriptions-item label="市净率">{{ companyInfo.pb }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="analysis-card">
              <template #header>
                <span>财务指标</span>
              </template>
              <el-progress 
                type="dashboard" 
                :percentage="financialScore" 
                :color="financialColors"
                class="financial-score"
              />
              <div class="financial-indicators">
                <div class="indicator-item">
                  <span class="indicator-label">ROE:</span>
                  <span class="indicator-value">{{ financialIndicators.roe }}%</span>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">净利润增长率:</span>
                  <span class="indicator-value">{{ financialIndicators.profitGrowth }}%</span>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">资产负债率:</span>
                  <span class="indicator-value">{{ financialIndicators.debtRatio }}%</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="mt-20">
          <el-col :span="24">
            <el-card>
              <template #header>
                <span>财务报表</span>
              </template>
              <el-tabs v-model="activeTab">
                <el-tab-pane label="资产负债表" name="balance">
                  <el-table :data="balanceSheetData" style="width: 100%">
                    <el-table-column prop="item" label="项目" />
                    <el-table-column prop="current" label="本期金额" />
                    <el-table-column prop="previous" label="上期金额" />
                    <el-table-column prop="change" label="变动比例" />
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="利润表" name="income">
                  <el-table :data="incomeStatementData" style="width: 100%">
                    <el-table-column prop="item" label="项目" />
                    <el-table-column prop="amount" label="金额" />
                    <el-table-column prop="percentage" label="占比" />
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="现金流量表" name="cashflow">
                  <el-table :data="cashFlowData" style="width: 100%">
                    <el-table-column prop="item" label="项目" />
                    <el-table-column prop="amount" label="金额" />
                    <el-table-column prop="direction" label="流向" />
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const searchStock = ref('')
const activeTab = ref('balance')

const companyInfo = reactive({
  name: '示例科技有限公司',
  code: '000001.SZ',
  industry: '软件开发',
  marketCap: '500亿',
  pe: 25.8,
  pb: 3.2
})

const financialScore = ref(85)
const financialColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

const financialIndicators = reactive({
  roe: 15.8,
  profitGrowth: 25.6,
  debtRatio: 45.2
})

const balanceSheetData = ref([
  { item: '流动资产', current: '100亿', previous: '90亿', change: '+11.1%' },
  { item: '非流动资产', current: '200亿', previous: '180亿', change: '+11.1%' },
  { item: '流动负债', current: '80亿', previous: '75亿', change: '+6.7%' },
  { item: '非流动负债', current: '120亿', previous: '110亿', change: '+9.1%' },
  { item: '所有者权益', current: '100亿', previous: '85亿', change: '+17.6%' }
])

const incomeStatementData = ref([
  { item: '营业收入', amount: '150亿', percentage: '100%' },
  { item: '营业成本', amount: '90亿', percentage: '60%' },
  { item: '营业利润', amount: '30亿', percentage: '20%' },
  { item: '净利润', amount: '25亿', percentage: '16.7%' }
])

const cashFlowData = ref([
  { item: '经营活动现金流', amount: '35亿', direction: '流入' },
  { item: '投资活动现金流', amount: '-20亿', direction: '流出' },
  { item: '筹资活动现金流', amount: '5亿', direction: '流入' },
  { item: '现金净增加额', amount: '20亿', direction: '净流入' }
])

const searchStockData = () => {
  console.log('搜索股票:', searchStock.value)
  // 这里可以添加实际的搜索逻辑
}
</script>

<style scoped>
.fundamental-analysis {
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

.header-actions {
  display: flex;
  align-items: center;
}

.analysis-content {
  margin-top: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.financial-score {
  margin: 20px auto;
  display: block;
}

.financial-indicators {
  margin-top: 20px;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.indicator-label {
  font-weight: bold;
  color: #606266;
}

.indicator-value {
  color: #409EFF;
  font-weight: bold;
}

.mt-20 {
  margin-top: 20px;
}
</style>
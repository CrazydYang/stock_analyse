<template>
  <div class="portfolio">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span>投资组合管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="addStock">添加股票</el-button>
            <el-button type="success" @click="refreshPortfolio">刷新组合</el-button>
          </div>
        </div>
      </template>
      
      <div class="portfolio-content">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card>
              <template #header>
                <span>持仓股票</span>
              </template>
              <el-table :data="portfolioStocks" style="width: 100%">
                <el-table-column prop="code" label="股票代码" width="100" />
                <el-table-column prop="name" label="股票名称" width="120" />
                <el-table-column prop="quantity" label="持股数量" width="100" />
                <el-table-column prop="currentPrice" label="当前价格" width="100" />
                <el-table-column prop="costPrice" label="成本价格" width="100" />
                <el-table-column prop="marketValue" label="市值" width="120" />
                <el-table-column prop="profit" label="盈亏" width="100">
                  <template #default="scope">
                    <span :class="{ 'profit-positive': scope.row.profit > 0, 'profit-negative': scope.row.profit < 0 }">
                      {{ scope.row.profit > 0 ? '+' : '' }}{{ scope.row.profit }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="editStock(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="sellStock(scope.row)">卖出</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="summary-card">
              <template #header>
                <span>组合概览</span>
              </template>
              <div class="portfolio-summary">
                <div class="summary-item">
                  <span class="label">总资产:</span>
                  <span class="value">¥{{ totalAssets.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">总盈亏:</span>
                  <span :class="{ 'profit-positive': totalProfit > 0, 'profit-negative': totalProfit < 0 }">
                    {{ totalProfit > 0 ? '+' : '' }}¥{{ Math.abs(totalProfit).toLocaleString() }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">收益率:</span>
                  <span :class="{ 'profit-positive': Number(totalReturn) > 0, 'profit-negative': Number(totalReturn) < 0 }">
                    {{ Number(totalReturn) > 0 ? '+' : '' }}{{ totalReturn }}%
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">持仓股票:</span>
                  <span class="value">{{ portfolioStocks.length }}只</span>
                </div>
              </div>
              
              <el-divider />
              
              <div class="sector-distribution">
                <h4>行业分布</h4>
                <div v-for="sector in sectorDistribution" :key="sector.name" class="sector-item">
                  <span class="sector-name">{{ sector.name }}</span>
                  <el-progress 
                    :percentage="sector.percentage" 
                    :color="sector.color"
                    :format="formatProgress"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="mt-20">
          <el-col :span="24">
            <el-card>
              <template #header>
                <span>收益走势</span>
              </template>
              <div class="chart-placeholder">
                <el-icon size="48"><TrendCharts /></el-icon>
                <p>收益走势图区域</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 添加股票对话框 -->
    <el-dialog v-model="addStockDialogVisible" title="添加股票" width="400px">
      <el-form :model="addStockForm" label-width="80px">
        <el-form-item label="股票代码">
          <el-input v-model="addStockForm.code" placeholder="请输入股票代码" />
        </el-form-item>
        <el-form-item label="股票名称">
          <el-input v-model="addStockForm.name" placeholder="请输入股票名称" />
        </el-form-item>
        <el-form-item label="买入价格">
          <el-input-number v-model="addStockForm.price" :precision="2" :step="0.01" />
        </el-form-item>
        <el-form-item label="买入数量">
          <el-input-number v-model="addStockForm.quantity" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddStock">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'

const portfolioStocks = ref([
  {
    code: '000001',
    name: '平安银行',
    quantity: 1000,
    currentPrice: 12.50,
    costPrice: 11.80,
    marketValue: 12500,
    profit: 5.93
  },
  {
    code: '000002',
    name: '万科A',
    quantity: 500,
    currentPrice: 15.20,
    costPrice: 16.50,
    marketValue: 7600,
    profit: -7.88
  },
  {
    code: '000858',
    name: '五粮液',
    quantity: 200,
    currentPrice: 180.50,
    costPrice: 175.00,
    marketValue: 36100,
    profit: 3.14
  }
])

const totalAssets = computed(() => {
  return portfolioStocks.value.reduce((sum, stock) => sum + stock.marketValue, 0)
})

const totalProfit = computed(() => {
  return portfolioStocks.value.reduce((sum, stock) => {
    const profit = (stock.currentPrice - stock.costPrice) * stock.quantity
    return sum + profit
  }, 0)
})

const totalReturn = computed(() => {
  const totalCost = portfolioStocks.value.reduce((sum, stock) => {
    return sum + (stock.costPrice * stock.quantity)
  }, 0)
  return totalCost > 0 ? ((totalProfit.value / totalCost) * 100).toFixed(2) : 0
})

const sectorDistribution = ref([
  { name: '金融', percentage: 40, color: '#409EFF' },
  { name: '房地产', percentage: 25, color: '#67C23A' },
  { name: '消费', percentage: 35, color: '#E6A23C' }
])

const addStockDialogVisible = ref(false)
const addStockForm = ref({
  code: '',
  name: '',
  price: 0,
  quantity: 0
})

const addStock = () => {
  addStockDialogVisible.value = true
}

const confirmAddStock = () => {
  // 添加股票逻辑
  console.log('添加股票:', addStockForm.value)
  addStockDialogVisible.value = false
}

const refreshPortfolio = () => {
  console.log('刷新投资组合数据...')
}

const editStock = (stock: any) => {
  console.log('编辑股票:', stock)
}

const sellStock = (stock: any) => {
  console.log('卖出股票:', stock)
}

const formatProgress = (percentage: number) => {
  return `${percentage}%`
}
</script>

<style scoped>
.portfolio {
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

.portfolio-content {
  margin-top: 20px;
}

.summary-card {
  margin-bottom: 20px;
}

.portfolio-summary {
  padding: 20px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #606266;
}

.value {
  font-weight: bold;
  color: #409EFF;
}

.profit-positive {
  color: #67C23A;
}

.profit-negative {
  color: #F56C6C;
}

.sector-distribution {
  margin-top: 20px;
}

.sector-item {
  margin: 10px 0;
}

.sector-name {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.mt-20 {
  margin-top: 20px;
}
</style>
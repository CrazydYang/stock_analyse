<template>
  <div class="stock-picker">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>智能选股</span>
          <el-button type="primary" @click="runStockPicker" :loading="loading">
            <el-icon><Refresh /></el-icon>
            开始选股
          </el-button>
        </div>
      </template>
      
      <div class="picker-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="市值范围">
              <el-select v-model="filters.marketCap" placeholder="选择市值范围">
                <el-option label="全部" value="" />
                <el-option label="大盘股 (>1000亿)" value="large" />
                <el-option label="中盘股 (100-1000亿)" value="mid" />
                <el-option label="小盘股 (<100亿)" value="small" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行业分类">
              <el-select v-model="filters.industry" placeholder="选择行业">
                <el-option label="全部" value="" />
                <el-option label="科技" value="tech" />
                <el-option label="医疗" value="medical" />
                <el-option label="消费" value="consumer" />
                <el-option label="金融" value="finance" />
                <el-option label="能源" value="energy" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="技术指标">
              <el-select v-model="filters.technical" placeholder="选择技术指标">
                <el-option label="全部" value="" />
                <el-option label="MACD金叉" value="macd" />
                <el-option label="RSI超卖" value="rsi" />
                <el-option label="突破均线" value="ma" />
                <el-option label="放量上涨" value="volume" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="估值指标">
              <el-select v-model="filters.valuation" placeholder="选择估值指标">
                <el-option label="全部" value="" />
                <el-option label="低PE (<15)" value="low_pe" />
                <el-option label="低PB (<2)" value="low_pb" />
                <el-option label="高ROE (>15%)" value="high_roe" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险等级">
              <el-select v-model="filters.risk" placeholder="选择风险等级">
                <el-option label="全部" value="" />
                <el-option label="低风险" value="low" />
                <el-option label="中风险" value="medium" />
                <el-option label="高风险" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="results-card" v-if="results.length > 0">
      <template #header>
        <span>选股结果 ({{ results.length }}只股票)</span>
      </template>
      
      <el-table :data="results" style="width: 100%">
        <el-table-column prop="code" label="股票代码" width="100" />
        <el-table-column prop="name" label="股票名称" width="120" />
        <el-table-column prop="price" label="当前价格" width="100" />
        <el-table-column prop="change" label="涨跌幅" width="100">
          <template #default="scope">
            <span :class="scope.row.change > 0 ? 'positive' : 'negative'">
              {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="智能评分" width="100">
          <template #default="scope">
            <el-rate v-model="scope.row.score" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="推荐理由" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-else-if="!loading" description="暂无选股结果，请设置筛选条件后开始选股" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const filters = reactive({
  marketCap: '',
  industry: '',
  technical: '',
  valuation: '',
  risk: ''
})

interface StockResult {
  code: string
  name: string
  price: number
  change: number
  score: number
  reason: string
}

const results = ref<StockResult[]>([])

const runStockPicker = async () => {
  loading.value = true
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 模拟选股结果
  results.value = [
    {
      code: '000001',
      name: '平安银行',
      price: 12.35,
      change: 2.15,
      score: 4.5,
      reason: 'MACD金叉 + 低估值 + 业绩超预期'
    },
    {
      code: '600519',
      name: '贵州茅台',
      price: 1680.50,
      change: 1.85,
      score: 4.8,
      reason: '消费龙头 + 高ROE + 机构重仓'
    },
    {
      code: '000858',
      name: '五粮液',
      price: 156.78,
      change: 3.21,
      score: 4.3,
      reason: '白酒龙头 + 估值修复 + 技术面突破'
    },
    {
      code: '002415',
      name: '海康威视',
      price: 35.67,
      change: -0.85,
      score: 4.2,
      reason: '安防龙头 + AI概念 + 估值低位'
    },
    {
      code: '300750',
      name: '宁德时代',
      price: 198.45,
      change: 4.56,
      score: 4.7,
      reason: '新能源龙头 + 技术突破 + 业绩高增长'
    }
  ]
  
  loading.value = false
}

const viewDetail = (stock: StockResult) => {
  router.push(`/analysis/technical?code=${stock.code}`)
}
</script>

<style scoped>
.stock-picker {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-form {
  padding: 20px 0;
}

.results-card {
  margin-top: 20px;
}

.positive {
  color: #67C23A;
  font-weight: bold;
}

.negative {
  color: #F56C6C;
  font-weight: bold;
}

.el-form-item {
  margin-bottom: 0;
}
</style>
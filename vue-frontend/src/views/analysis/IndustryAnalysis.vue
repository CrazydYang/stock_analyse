<template>
  <div class="industry-analysis">

    <!-- 统计概览 -->
    <div class="stats-section">
      <el-row :gutter="20" class="stats-grid">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ totalIndustries }}</div>
            <div class="stat-label">行业总数</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ totalStocks }}</div>
            <div class="stat-label">股票总数</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ avgStocksPerIndustry }}</div>
            <div class="stat-label">平均行业股票数</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ largestIndustry?.count || 0 }}</div>
            <div class="stat-label">最大行业股票数</div>
          </el-card>
        </el-col>
      </el-row>
    </div>


    <!-- 行业列表 -->
    <div class="list-section">
      <div class="list-header">
        <h2>行业分类详情</h2>
        <div class="list-actions">
          <span class="result-count">
            共找到 {{ industries.length }} 个行业
          </span>
        </div>
      </div>

      <div class="table-container">
        <el-table 
          :data="paginatedIndustries" 
          style="width: 100%"
          stripe
          border
          :loading="loading"
          empty-text="暂无行业数据"
        >
          <el-table-column prop="industry" label="行业名称" width="120">
            <template #default="scope">
              <div class="industry-info">
                <span class="industry-name">{{ scope.row.industry }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="count" label="股票数量" width="120" align="center" sortable>
            <template #default="scope">
              <el-tag type="info" size="small">{{ scope.row.count }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="市场占比" width="120" align="center" sortable>
            <template #default="scope">
              <span class="percentage-value">{{ calculatePercentage(scope.row.count) }}%</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="avgChangePercent" label="行业平均涨跌幅" width="200" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.avgChangePercent > 0,
                  'negative': scope.row.avgChangePercent < 0,
                  'neutral': scope.row.avgChangePercent === 0
                }"
              >
                {{ formatChangePercent(scope.row.avgChangePercent) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="avgPeRatio" label="平均PE" width="100" align="center">
            <template #default="scope">
              <span class="value-badge">{{ scope.row.avgPeRatio ? scope.row.avgPeRatio.toFixed(2) : 'N/A' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="avgPbRatio" label="平均PB" width="100" align="center">
            <template #default="scope">
              <span class="value-badge">{{ scope.row.avgPbRatio ? scope.row.avgPbRatio.toFixed(2) : 'N/A' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="avgChange60Day" label="60天涨跌幅" width="120" align="center">
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.avgChange60Day > 0,
                  'negative': scope.row.avgChange60Day < 0,
                  'neutral': scope.row.avgChange60Day === 0
                }"
              >
                {{ formatChangePercent(scope.row.avgChange60Day) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="avgChangeYtd" label="年初至今涨跌幅" width="130" align="center">
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.avgChangeYtd > 0,
                  'negative': scope.row.avgChangeYtd < 0,
                  'neutral': scope.row.avgChangeYtd === 0
                }"
              >
                {{ formatChangePercent(scope.row.avgChangeYtd) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small"
                @click="showIndustryDetail(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="industries.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>



    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载行业数据...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchIndustriesData, type Industry, type Stock } from '../../services/industryApi'

// 响应式数据
const industries = ref<Industry[]>([])
const loading = ref(false)

const currentPage = ref(1)
const pageSize = ref(12)

// 路由
const router = useRouter()

// 计算属性
const totalIndustries = computed(() => industries.value.length)
const totalStocks = computed(() => 
  industries.value.reduce((sum, industry) => sum + industry.count, 0)
)
const avgStocksPerIndustry = computed(() => 
  totalIndustries.value > 0 ? Math.round(totalStocks.value / totalIndustries.value) : 0
)
const largestIndustry = computed(() => 
  industries.value.reduce((max, industry) => 
    industry.count > max.count ? industry : max, 
    { industry: '', count: 0, stocks: [] }
  )
)

const totalPages = computed(() => 
  Math.ceil(industries.value.length / pageSize.value)
)

const paginatedIndustries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return industries.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 方法
const fetchIndustries = async () => {
  loading.value = true
  
  try {
    const industriesData = await fetchIndustriesData()
    industries.value = industriesData
  } catch (error) {
    console.error('获取行业数据错误:', error)
  } finally {
    loading.value = false
  }
}

const calculatePercentage = (count: number) => {
  return totalStocks.value > 0 ? ((count / totalStocks.value) * 100).toFixed(1) : '0.0'
}

// 格式化涨跌幅
const formatChangePercent = (percent: number | undefined) => {
  if (percent === undefined || percent === null) return '0.00%'
  const formattedValue = percent.toFixed(2)
  return percent > 0 ? `+${formattedValue}%` : `${formattedValue}%`
}

// Element Plus 分页事件处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}



const showIndustryDetail = (industry: Industry) => {
  // 跳转到行业详情页面
  router.push({
    name: 'industry-detail',
    params: {
      industry: encodeURIComponent(industry.industry)
    }
  })
}

// 生命周期
onMounted(() => {
  fetchIndustries()
})
</script>

<style scoped>
.industry-analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 统计概览 */
.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 行业列表 */
.list-section {
  margin-bottom: 32px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.result-count {
  font-size: 14px;
  color: #666;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.industry-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.industry-table th,
.industry-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.industry-table th {
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
  border-bottom: 2px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 10;
}

.industry-table .table-row {
  transition: all 0.2s ease;
}

.industry-table .table-row:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 列宽设置 */
.col-industry {
  width: 15%;
}

.col-count {
  width: 8%;
  text-align: center;
}

.col-percentage {
  width: 8%;
}

.col-change {
  width: 10%;
}

.col-pe {
  width: 8%;
  text-align: center;
}

.col-pb {
  width: 8%;
  text-align: center;
}

.col-change-60 {
  width: 10%;
}

.col-change-ytd {
  width: 10%;
}

.col-actions {
  width: 10%;
  text-align: center;
}

/* 行业名称 */
.industry-info {
  display: flex;
  align-items: center;
}

.industry-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

/* 数量徽章 */
.count-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 百分比值 */
.percentage-value {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 数值徽章 */
.value-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f9f0ff;
  color: #722ed1;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 涨跌幅值 */
.change-value {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.change-value.negative {
  background: #f0f9eb;
  color: #67C23A;
}

.change-value.positive {
  background: #fef0f0;
  color: #F56C6C;
}

.change-value.neutral {
  background: #f4f4f5;
  color: #909399;
}

/* 股票标签 */
.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stock-tag {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
}

.more-stocks {
  background: #fafafa;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px dashed #ddd;
}

/* 行业名称样式 */
.industry-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

/* Element Plus 响应式调整 */
@media (max-width: 768px) {
  .search-actions {
    text-align: left;
  }
}

/* Element Plus 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.stock-tag {
  font-size: 11px;
  padding: 2px 6px;
  background: #f0f2f5;
  border-radius: 4px;
  color: #666;
}



/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.empty-desc {
  font-size: 14px;
  color: #999;
}

/* Element Plus 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .industry-analysis {
    padding: 16px;
  }
  
  .header h1 {
    font-size: 28px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  

  
  .industry-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    gap: 8px;
  }
  
  .btn-page {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 32px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

/* Element Plus 表格容器 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

/* 行业名称 */
.industry-info {
  display: flex;
  align-items: center;
}

.industry-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

/* Element Plus 表格内容样式 */
.percentage-value {
  font-weight: 600;
  color: #1890ff;
}

.value-badge {
  font-weight: 600;
  color: #333;
}

/* 涨跌幅颜色 */
.change-value {
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.change-value.positive {
  color: #f56565;
  background-color: #fed7d7;
}

.change-value.negative {
  color: #38a169;
  background-color: #c6f6d5;
}

.change-value.neutral {
  color: #718096;
  background-color: #edf2f7;
}

/* 股票标签 */
.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stock-tag {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
}

.more-stocks {
  background: #fafafa;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px dashed #ddd;
}

/* Element Plus 响应式调整 */
@media (max-width: 768px) {
  .pagination-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    padding: 12px;
  }
  
  .table-container {
    margin: 0 -12px;
    border-radius: 0;
  }
}
</style>
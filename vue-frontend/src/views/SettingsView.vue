<template>
  <div class="settings">
    <el-card class="page-header">
      <template #header>
        <span>系统设置</span>
      </template>
      
      <div class="settings-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="settings-card">
              <template #header>
                <span>用户设置</span>
              </template>
              <el-form :model="userSettings" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="userSettings.username" disabled />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userSettings.email" />
                </el-form-item>
                <el-form-item label="通知设置">
                  <el-switch v-model="userSettings.enableNotifications" />
                </el-form-item>
                <el-form-item label="主题设置">
                  <el-select v-model="userSettings.theme" style="width: 100%">
                    <el-option label="浅色主题" value="light" />
                    <el-option label="深色主题" value="dark" />
                    <el-option label="跟随系统" value="auto" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveUserSettings">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="settings-card">
              <template #header>
                <span>数据源设置</span>
              </template>
              <el-form :model="dataSettings" label-width="120px">
                <el-form-item label="行情数据源">
                  <el-select v-model="dataSettings.marketDataSource" style="width: 100%">
                    <el-option label="腾讯财经" value="tencent" />
                    <el-option label="新浪财经" value="sina" />
                    <el-option label="东方财富" value="eastmoney" />
                  </el-select>
                </el-form-item>
                <el-form-item label="数据更新频率">
                  <el-select v-model="dataSettings.updateFrequency" style="width: 100%">
                    <el-option label="实时" value="realtime" />
                    <el-option label="5分钟" value="5min" />
                    <el-option label="15分钟" value="15min" />
                    <el-option label="30分钟" value="30min" />
                    <el-option label="1小时" value="1hour" />
                  </el-select>
                </el-form-item>
                <el-form-item label="缓存设置">
                  <el-switch v-model="dataSettings.enableCache" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveDataSettings">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="settings-card">
              <template #header>
                <span>系统信息</span>
              </template>
              <div class="system-info">
                <div class="info-item">
                  <span class="info-label">系统版本:</span>
                  <span class="info-value">{{ systemInfo.version }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">最后更新:</span>
                  <span class="info-value">{{ systemInfo.lastUpdate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">运行时间:</span>
                  <span class="info-value">{{ systemInfo.uptime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">API状态:</span>
                  <span :class="['status', systemInfo.apiStatus]">{{ systemInfo.apiStatusText }}</span>
                </div>
              </div>
              
              <el-divider />
              
              <div class="system-actions">
                <el-button type="warning" @click="clearCache">清除缓存</el-button>
                <el-button type="danger" @click="resetSettings">恢复默认设置</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="mt-20">
          <el-col :span="24">
            <el-card>
              <template #header>
                <span>操作日志</span>
              </template>
              <el-table :data="operationLogs" style="width: 100%" max-height="400">
                <el-table-column prop="time" label="时间" width="180" />
                <el-table-column prop="operation" label="操作" width="200" />
                <el-table-column prop="details" label="详情" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
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

const userSettings = reactive({
  username: 'admin',
  email: 'admin@example.com',
  enableNotifications: true,
  theme: 'light'
})

const dataSettings = reactive({
  marketDataSource: 'tencent',
  updateFrequency: '5min',
  enableCache: true
})

const systemInfo = reactive({
  version: '1.0.0',
  lastUpdate: '2024-01-15 14:30:00',
  uptime: '2天 5小时 30分钟',
  apiStatus: 'online',
  apiStatusText: '正常'
})

const operationLogs = ref([
  {
    time: '2024-01-15 14:30:00',
    operation: '登录系统',
    details: '用户 admin 登录系统',
    status: '成功'
  },
  {
    time: '2024-01-15 14:25:00',
    operation: '修改设置',
    details: '修改了数据源设置',
    status: '成功'
  },
  {
    time: '2024-01-15 14:20:00',
    operation: '数据同步',
    details: '同步股票数据',
    status: '成功'
  },
  {
    time: '2024-01-15 14:15:00',
    operation: '添加股票',
    details: '添加了股票 000001',
    status: '成功'
  }
])

const saveUserSettings = () => {
  console.log('保存用户设置:', userSettings)
  // 这里可以添加保存用户设置的逻辑
}

const saveDataSettings = () => {
  console.log('保存数据源设置:', dataSettings)
  // 这里可以添加保存数据源设置的逻辑
}

const clearCache = () => {
  console.log('清除缓存')
  // 这里可以添加清除缓存的逻辑
}

const resetSettings = () => {
  console.log('恢复默认设置')
  // 这里可以添加恢复默认设置的逻辑
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.settings-content {
  margin-top: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.system-info {
  padding: 20px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: bold;
  color: #606266;
}

.info-value {
  color: #409EFF;
  font-weight: bold;
}

.status.online {
  color: #67C23A;
}

.status.offline {
  color: #F56C6C;
}

.system-actions {
  text-align: center;
}

.mt-20 {
  margin-top: 20px;
}
</style>
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <el-form
        ref="loginForm$"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名/邮箱" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名或邮箱"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="isLoading"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
        </div>
      </el-form>

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="true"
        @close="errorMessage = ''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login, isLoading, error as authError } from '../../services/auth';

const router = useRouter();
const route = useRoute();

// 表单引用
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' }
  ]
};

// 其他状态
const rememberMe = ref(false);
const errorMessage = ref('');
const loginForm$ = ref();

// 登录处理
async function handleLogin() {
  try {
    // 清空错误信息
    errorMessage.value = '';
    
    // 表单验证
    await loginForm$.value.validate();
    
    // 调用登录API
    await login(loginForm.username, loginForm.password);
    
    // 登录成功提示
    ElMessage.success('登录成功');
    
    // 如果有重定向参数，则跳转到该页面，否则跳转到首页
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  } catch (e: any) {
    console.error('登录过程中发生错误:', e);
    // 显示错误信息
    errorMessage.value = authError.value || e.message || '登录失败，请检查您的凭据';
  }
}

// 忘记密码处理
function forgotPassword() {
  ElMessage.info('忘记密码功能暂未实现，请联系管理员');
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 1.75rem;
  color: #303133;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #909399;
  font-size: 0.875rem;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #909399;
  font-size: 0.875rem;
}

.login-footer a {
  color: #409EFF;
  text-decoration: none;
}
</style>
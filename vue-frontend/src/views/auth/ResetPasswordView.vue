<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="reset-password-header">
        <h2>重置密码</h2>
        <p>请输入您的邮箱和新密码</p>
      </div>

      <el-form
        ref="resetForm$"
        :model="resetForm"
        :rules="resetRules"
        label-position="top"
        @submit.prevent="handleResetPassword"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="resetForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            placeholder="请输入新密码"
            type="password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            placeholder="请再次输入新密码"
            type="password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleResetPassword"
            :loading="isLoading"
            class="reset-button"
          >
            重置密码
          </el-button>
        </el-form-item>

        <div class="reset-password-footer">
          <p>记起密码了？<router-link to="/login">返回登录</router-link></p>
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
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { resetPassword } from '../../services/auth';

const router = useRouter();

// 表单引用
const resetForm$ = ref();

// 表单数据
const resetForm = reactive({
  email: '',
  newPassword: '',
  confirmPassword: ''
});

// 加载状态
const isLoading = ref(false);
const errorMessage = ref('');

// 表单验证规则
const resetRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/, 
      message: '密码必须包含数字和字母，长度在6-20个字符之间', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== resetForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 重置密码处理
async function handleResetPassword() {
  try {
    // 清空错误信息
    errorMessage.value = '';
    
    // 表单验证
    await resetForm$.value.validate();
    
    // 设置加载状态
    isLoading.value = true;
    
    // 调用重置密码API
    await resetPassword(resetForm.email, resetForm.newPassword);
    
    // 重置密码成功提示
    ElMessage.success('密码重置成功');
    
    // 跳转到登录页面
    router.push('/login');
  } catch (e: any) {
    console.error('重置密码过程中发生错误:', e);
    // 显示错误信息
    errorMessage.value = e.message || '重置密码失败，请稍后再试';
  } finally {
    // 无论成功或失败，都关闭加载状态
    isLoading.value = false;
  }
}
</script>

<style scoped>
.reset-password-container {
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

.reset-password-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reset-password-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-password-header h2 {
  font-size: 1.75rem;
  color: #303133;
  margin-bottom: 0.5rem;
}

.reset-password-header p {
  color: #909399;
  font-size: 0.875rem;
}

.reset-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.reset-password-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #909399;
  font-size: 0.875rem;
}

.reset-password-footer a {
  color: #409EFF;
  text-decoration: none;
}
</style>
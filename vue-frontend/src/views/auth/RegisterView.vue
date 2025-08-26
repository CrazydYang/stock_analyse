<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>注册账号</h2>
        <p>创建您的股票分析系统账号</p>
      </div>

      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="验证邀请码" />
        <el-step title="填写账号信息" />
        <el-step title="完成注册" />
      </el-steps>

      <!-- 步骤1: 验证邀请码 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-form
          ref="inviteCodeForm"
          :model="registerForm"
          :rules="inviteCodeRules"
          label-position="top"
          @submit.prevent="validateInviteCodeStep"
        >
          <el-form-item label="邀请码" prop="inviteCode">
            <el-input
              v-model="registerForm.inviteCode"
              placeholder="请输入邀请码"
              prefix-icon="Key"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isValidatingCode"
              class="step-button"
            >
              验证邀请码
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 填写账号信息 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-form
          ref="accountForm"
          :model="registerForm"
          :rules="accountRules"
          label-position="top"
          @submit.prevent="validateAccountStep"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              type="email"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              placeholder="请输入密码"
              type="password"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              type="password"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <div class="step-buttons">
              <el-button @click="currentStep = 0">上一步</el-button>
              <el-button type="primary" native-type="submit">下一步</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 完成注册 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="register-summary">
          <h3>确认您的注册信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ registerForm.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ registerForm.email }}</el-descriptions-item>
            <el-descriptions-item label="邀请码">{{ registerForm.inviteCode }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="step-buttons">
          <el-button @click="currentStep = 1">上一步</el-button>
          <el-button
            type="primary"
            @click="submitRegistration"
            :loading="isRegistering"
          >
            完成注册
          </el-button>
        </div>
      </div>

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="true"
        @close="errorMessage = ''"
        style="margin-top: 1rem;"
      />

      <div class="register-footer">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { register, isLoading as authLoading, error as authError } from '../../services/auth';
import { validateInviteCode } from '../../services/userApi';

const router = useRouter();

// 表单引用
const inviteCodeForm = ref();
const accountForm = ref();

// 步骤控制
const currentStep = ref(0);

// 加载状态
const isValidatingCode = ref(false);
const isRegistering = ref(false);

// 错误信息
const errorMessage = ref('');

// 注册表单
const registerForm = reactive({
  inviteCode: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 邀请码验证规则
const inviteCodeRules = {
  inviteCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' },
    { min: 6, message: '邀请码长度不能少于6个字符', trigger: 'blur' }
  ]
};

// 账号信息验证规则
const accountRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 验证邀请码步骤
async function validateInviteCodeStep() {
  try {
    // 表单验证
    await inviteCodeForm.value.validate();
    
    // 验证邀请码
    isValidatingCode.value = true;
    errorMessage.value = '';
    
    const response = await validateInviteCode(registerForm.inviteCode);
    
    if (response.valid) {
      ElMessage.success('邀请码验证成功');
      currentStep.value = 1; // 进入下一步
    } else {
      errorMessage.value = response.message || '邀请码无效';
    }
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || '邀请码验证失败';
  } finally {
    isValidatingCode.value = false;
  }
}

// 验证账号信息步骤
async function validateAccountStep() {
  try {
    // 表单验证
    await accountForm.value.validate();
    currentStep.value = 2; // 进入下一步
  } catch (e) {
    // 表单验证失败，不进行任何操作
  }
}

// 提交注册
async function submitRegistration() {
  try {
    isRegistering.value = true;
    errorMessage.value = '';
    
    // 调用注册API
    await register(
      registerForm.username,
      registerForm.email,
      registerForm.password,
      registerForm.inviteCode
    );
    
    // 注册成功提示
    ElMessage.success('注册成功，欢迎加入！');
    
    // 跳转到首页
    router.push('/');
  } catch (e) {
    // 显示错误信息
    errorMessage.value = authError.value || '注册失败，请稍后再试';
  } finally {
    isRegistering.value = false;
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.register-card {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h2 {
  font-size: 1.75rem;
  color: #303133;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: #909399;
  font-size: 0.875rem;
}

.step-content {
  margin-top: 2rem;
}

.step-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.step-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.register-summary {
  margin-bottom: 2rem;
}

.register-summary h3 {
  margin-bottom: 1rem;
  color: #303133;
}

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #909399;
  font-size: 0.875rem;
}

.register-footer a {
  color: #409EFF;
  text-decoration: none;
}
</style>
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your Self Study JO account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="Enter your username"
            :class="{ 'error': errors.username }"
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter your password"
              :class="{ 'error': errors.password }"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
          <button type="button" @click="authStore.clearError()" class="alert-close">×</button>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
          <span v-if="authStore.loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>

        <div class="login-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="link">Sign up</router-link>
          </p>
        </div>
      </form>
    </div>

    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const errors = reactive({
  username: '',
  password: '',
});

const showPassword = ref(false);

const validateForm = () => {
  let isValid = true;

  errors.username = '';
  errors.password = '';

  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  try {
    const response = await authStore.login({
      username: form.username.toLowerCase(),
      password: form.password,
    });

    if (response.requires_verification) {
      // Redirect to verification page
      router.push('/verify-email');
    } else {
      // Redirect to home
      router.push('/');
    }
  } catch (error) {
    // Error is already handled by auth store
    console.error('Login error:', error);
  }
};

onMounted(() => {
  // Clear any previous errors
  authStore.clearError();
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: #718096;
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #fc8181;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  color: #718096;
}

.error-message {
  color: #fc8181;
  font-size: 14px;
  margin-top: 4px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeIn 0.3s ease;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
}

.btn {
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #718096;
  font-size: 14px;
}

.login-footer .link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.login-footer .link:hover {
  text-decoration: underline;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  left: -100px;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  right: 20%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .login-header h1 {
    font-size: 28px;
  }

  .login-header p {
    font-size: 14px;
  }
}
</style>

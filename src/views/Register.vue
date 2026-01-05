<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Create Account</h1>
        <p>Join Self Study JO and start learning today</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="form.first_name"
              type="text"
              placeholder="John"
              :class="{ 'error': errors.first_name }"
            />
            <div v-if="errors.first_name" class="error-message">{{ errors.first_name }}</div>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              v-model="form.last_name"
              type="text"
              placeholder="Doe"
              :class="{ 'error': errors.last_name }"
            />
            <div v-if="errors.last_name" class="error-message">{{ errors.last_name }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="username">Username *</label>
          <div class="input-with-validation">
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              placeholder="johndoe"
              @blur="validateUsername"
              :class="{ 'error': errors.username, 'valid': usernameValid }"
            />
            <div v-if="usernameChecking" class="validation-status">
              <span class="loading"></span>
            </div>
            <div v-if="usernameValid" class="validation-status valid">
              ✓
            </div>
          </div>
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <div class="input-with-validation">
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="john@example.com"
              @blur="validateEmail"
              :class="{ 'error': errors.email, 'valid': emailValid }"
            />
            <div v-if="emailChecking" class="validation-status">
              <span class="loading"></span>
            </div>
            <div v-if="emailValid" class="validation-status valid">
              ✓
            </div>
          </div>
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label for="password">Password *</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Create a strong password"
              :class="{ 'error': errors.password }"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrengthClass"></div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password *</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="Confirm your password"
              :class="{ 'error': errors.confirmPassword }"
            />
            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>

        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="form.gender" class="select-input">
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
          <button type="button" @click="authStore.clearError()" class="alert-close">×</button>
        </div>

        <div class="terms">
          <input
            id="terms"
            v-model="acceptedTerms"
            type="checkbox"
            required
          />
          <label for="terms">
            I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.loading || !acceptedTerms">
          <span v-if="authStore.loading">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>

        <div class="register-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="link">Sign in</router-link>
          </p>
        </div>
      </form>
    </div>

    <div class="register-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  gender: '' as 'M' | 'F' | '',
});

const confirmPassword = ref('');
const acceptedTerms = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const usernameValid = ref(false);
const emailValid = ref(false);
const usernameChecking = ref(false);
const emailChecking = ref(false);

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
});

const passwordStrength = computed(() => {
  const password = form.password;
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
});

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 2) return 'weak';
  if (passwordStrength.value <= 3) return 'medium';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  if (!form.password) return '';
  if (passwordStrength.value <= 2) return 'Weak';
  if (passwordStrength.value <= 3) return 'Medium';
  return 'Strong';
});

const validateForm = () => {
  let isValid = true;

  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '');

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
    isValid = false;
  }

  // Email validation
  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  // Confirm password validation
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.password !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const validateUsername = async () => {
  const username = form.username.trim().toLowerCase();

  if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
    usernameValid.value = false;
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
    usernameValid.value = false;
    return;
  }

  usernameChecking.value = true;
  try {
    const result = await authStore.checkUsername(username);
    if (result.available) {
      errors.username = '';
      usernameValid.value = true;
    } else {
      errors.username = 'Username is already taken';
      usernameValid.value = false;
    }
  } catch (error) {
    errors.username = 'Unable to check username availability';
    usernameValid.value = false;
  } finally {
    usernameChecking.value = false;
  }
};

const validateEmail = async () => {
  const email = form.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
    emailValid.value = false;
    return;
  }

  emailChecking.value = true;
  try {
    const result = await authStore.checkEmail(email);
    if (result.available) {
      errors.email = '';
      emailValid.value = true;
    } else {
      errors.email = 'Email is already registered';
      emailValid.value = false;
    }
  } catch (error) {
    errors.email = 'Unable to check email availability';
    emailValid.value = false;
  } finally {
    emailChecking.value = false;
  }
};

watch(() => form.password, () => {
  if (confirmPassword.value && form.password !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    errors.confirmPassword = '';
  }
});

watch(() => confirmPassword.value, () => {
  if (form.password !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    errors.confirmPassword = '';
  }
});

const handleRegister = async () => {
  if (!validateForm() || !acceptedTerms.value) return;

  try {
    const userData = {
      ...form,
      username: form.username.toLowerCase(),
      email: form.email.toLowerCase(),
    };

    const response = await authStore.register(userData);

    // Store verification data
    localStorage.setItem('verification_user_id', response.user_id);
    localStorage.setItem('verification_email', form.email.toLowerCase());

    // Redirect to verification page
    router.push('/verify-email');
  } catch (error) {
    console.error('Registration error:', error);
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1;
  animation: slideUp 0.6s ease-out;
  overflow-y: auto;
  max-height: 90vh;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-header p {
  color: #718096;
  font-size: 16px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

.form-group input,
.select-input {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  width: 100%;
}

.form-group input:focus,
.select-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input.error {
  border-color: #fc8181;
}

.form-group input.valid {
  border-color: #48bb78;
}

.input-with-validation {
  position: relative;
}

.validation-status {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #48bb78;
  font-size: 18px;
}

.validation-status .loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  overflow: hidden;
}

.strength-bar::before {
  content: '';
  display: block;
  height: 100%;
  width: var(--strength, 0%);
  transition: width 0.3s ease;
}

.strength-bar.weak {
  --strength: 33%;
  background: linear-gradient(to right, #fc8181 33%, #e2e8f0 33%);
}

.strength-bar.medium {
  --strength: 66%;
  background: linear-gradient(to right, #f6ad55 66%, #e2e8f0 66%);
}

.strength-bar.strong {
  --strength: 100%;
  background: linear-gradient(to right, #48bb78 100%, #e2e8f0 100%);
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  min-width: 50px;
}

.error-message {
  color: #fc8181;
  font-size: 14px;
  margin-top: 4px;
}

.terms {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 20px 0;
}

.terms input[type="checkbox"] {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: #4f46e5;
}

.terms label {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.4;
}

.terms .link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
}

.terms .link:hover {
  text-decoration: underline;
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
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #718096;
  font-size: 14px;
}

.register-footer .link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.register-footer .link:hover {
  text-decoration: underline;
}

.register-background {
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
  width: 400px;
  height: 400px;
  top: -200px;
  left: -200px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  right: -150px;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: 10%;
}

@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .register-header h1 {
    font-size: 28px;
  }

  .register-header p {
    font-size: 14px;
  }
}
</style>

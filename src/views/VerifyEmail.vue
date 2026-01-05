<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="verify-header">
        <div class="verify-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor"/>
          </svg>
        </div>
        <h1>Verify Your Email</h1>
        <p>We've sent a 6-digit code to {{ userEmail }}</p>
      </div>

      <form @submit.prevent="handleVerify" class="verify-form">
        <div class="otp-inputs">
          <input
            v-for="index in 6"
            :key="index"
            :ref="el => otpInputs[index - 1] = el"
            v-model="otp[index - 1]"
            type="text"
            maxlength="1"
            inputmode="numeric"
            pattern="[0-9]*"
            @input="handleOtpInput(index - 1, $event)"
            @keydown="handleOtpKeydown(index - 1, $event)"
            @paste="handleOtpPaste"
            :class="{ 'error': verificationError }"
          />
        </div>

        <div v-if="verificationError" class="alert alert-error">
          {{ verificationError }}
        </div>

        <div v-if="verificationSuccess" class="alert alert-success">
          Email verified successfully! Redirecting...
        </div>

        <div class="verification-info">
          <p v-if="timeLeft > 0">
            Code expires in {{ formattedTime }}
          </p>
          <p v-else class="expired">
            Code has expired
          </p>
        </div>

        <div class="actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="authStore.loading || !isOtpComplete || timeLeft <= 0"
          >
            <span v-if="authStore.loading">Verifying...</span>
            <span v-else>Verify Email</span>
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            @click="resendCode"
            :disabled="resendDisabled"
          >
            {{ resendButtonText }}
          </button>
        </div>

        <div class="alternative">
          <p>
            Didn't receive the code?
            <button type="button" class="link" @click="changeEmail">
              Change email address
            </button>
          </p>
        </div>
      </form>
    </div>

    <div class="verify-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const otp = reactive(Array(6).fill(''));
const otpInputs = ref<HTMLInputElement[]>([]);
const verificationError = ref('');
const verificationSuccess = ref(false);
const timeLeft = ref(15 * 60); // 15 minutes in seconds
const resendCooldown = ref(60); // 1 minute cooldown
const userEmail = ref('');

let timer: NodeJS.Timeout | null = null;
let resendTimer: NodeJS.Timeout | null = null;

const isOtpComplete = computed(() => otp.every(digit => digit !== ''));
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const resendDisabled = computed(() => resendCooldown.value > 0);
const resendButtonText = computed(() => {
  if (resendCooldown.value > 0) {
    return `Resend Code (${resendCooldown.value}s)`;
  }
  return 'Resend Code';
});

onMounted(() => {
  // Get user email from localStorage or auth store
  const storedEmail = localStorage.getItem('verification_email') ||
                     authStore.verificationData?.email ||
                     'your email';
  userEmail.value = storedEmail;

  // Generate OTP automatically
  generateOTP();

  // Start timers
  startTimers();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (resendTimer) clearInterval(resendTimer);
});

const startTimers = () => {
  // OTP expiration timer
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      if (timer) clearInterval(timer);
    }
  }, 1000);

  // Resend cooldown timer
  resendTimer = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--;
    } else {
      if (resendTimer) clearInterval(resendTimer);
    }
  }, 1000);
};

const generateOTP = async () => {
  const userId = localStorage.getItem('verification_user_id') ||
                authStore.verificationData?.user_id;
  const username = localStorage.getItem('verification_username') ||
                  authStore.verificationData?.username ||
                  userEmail.value.split('@')[0];

  if (!userId || !userEmail.value) {
    verificationError.value = 'Unable to generate OTP. Please try registering again.';
    return;
  }

  try {
    await authStore.generateOTP({
      user_id: userId,
      email: userEmail.value,
      username: username,
    });
  } catch (error: any) {
    verificationError.value = error.message || 'Failed to generate OTP';
  }
};

const handleOtpInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    otp[index] = '';
    return;
  }

  // Update OTP value
  otp[index] = value;

  // Clear error when user starts typing
  if (verificationError.value) {
    verificationError.value = '';
  }

  // Move to next input if value entered
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otp[index] && index > 0) {
    // Move to previous input on backspace
    otpInputs.value[index - 1]?.focus();
  } else if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus();
    event.preventDefault();
  } else if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus();
    event.preventDefault();
  }
};

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const paste = event.clipboardData?.getData('text') || '';
  const digits = paste.replace(/\D/g, '').slice(0, 6);

  digits.split('').forEach((digit, index) => {
    if (index < 6) {
      otp[index] = digit;
    }
  });

  // Focus last input
  const lastIndex = Math.min(digits.length - 1, 5);
  otpInputs.value[lastIndex]?.focus();
};

const handleVerify = async () => {
  if (!isOtpComplete.value || timeLeft.value <= 0) {
    verificationError.value = 'Please enter a valid OTP';
    return;
  }

  const otpCode = otp.join('');
  const userId = localStorage.getItem('verification_user_id') ||
                authStore.verificationData?.user_id;

  if (!userId) {
    verificationError.value = 'Unable to verify. Please try registering again.';
    return;
  }

  try {
    const response = await authStore.verifyOTP({
      user_id: userId,
      code: otpCode,
    });

    if (response.email_verified) {
      verificationSuccess.value = true;
      verificationError.value = '';

      // Store verification status
      localStorage.setItem('email_verified', 'true');

      // Redirect after delay
      setTimeout(() => {
        if (authStore.isAuthenticated) {
          router.push('/');
        } else {
          router.push('/login');
        }
      }, 2000);
    } else {
      verificationError.value = response.warning || 'Verification failed. Please try again.';
    }
  } catch (error: any) {
    verificationError.value = error.message || 'Verification failed. Please try again.';

    // Shake OTP inputs on error
    otpInputs.value.forEach(input => {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    });
  }
};

const resendCode = async () => {
  if (resendDisabled.value) return;

  const userId = localStorage.getItem('verification_user_id') ||
                authStore.verificationData?.user_id;
  const username = localStorage.getItem('verification_username') ||
                  authStore.verificationData?.username ||
                  userEmail.value.split('@')[0];

  if (!userId || !userEmail.value) {
    verificationError.value = 'Unable to resend OTP';
    return;
  }

  try {
    // Reset OTP
    otp.forEach((_, index) => otp[index] = '');
    otpInputs.value[0]?.focus();

    // Reset timers
    timeLeft.value = 15 * 60;
    resendCooldown.value = 60;
    startTimers();

    // Generate new OTP
    await authStore.resendOTP({
      user_id: userId,
      email: userEmail.value,
      username: username,
    });

    verificationError.value = '';
  } catch (error: any) {
    verificationError.value = error.message || 'Failed to resend OTP';
  }
};

const changeEmail = () => {
  // Clear verification data and redirect to register
  localStorage.removeItem('verification_user_id');
  localStorage.removeItem('verification_email');
  localStorage.removeItem('verification_username');
  router.push('/register');
};
</script>

<style scoped>
.verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.verify-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1;
  animation: slideUp 0.6s ease-out;
  text-align: center;
}

.verify-header {
  margin-bottom: 40px;
}

.verify-icon {
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.verify-icon svg {
  width: 32px;
  height: 32px;
}

.verify-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.verify-header p {
  color: #718096;
  font-size: 16px;
  line-height: 1.5;
}

.verify-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}

.otp-inputs input {
  width: 52px;
  height: 64px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  color: #1a202c;
  transition: all 0.3s ease;
  background: white;
}

.otp-inputs input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.otp-inputs input.error {
  border-color: #fc8181;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.verification-info {
  color: #718096;
  font-size: 14px;
  margin: 10px 0;
}

.verification-info .expired {
  color: #fc8181;
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
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
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #3b82f6;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alternative {
  margin-top: 20px;
  color: #718096;
  font-size: 14px;
}

.alternative .link {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.alternative .link:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  animation: fadeIn 0.3s ease;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-success {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.verify-background {
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

@media (max-width: 480px) {
  .verify-card {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .verify-header h1 {
    font-size: 28px;
  }

  .verify-header p {
    font-size: 14px;
  }

  .otp-inputs input {
    width: 44px;
    height: 56px;
    font-size: 24px;
  }
}
</style>

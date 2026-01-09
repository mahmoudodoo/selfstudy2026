<template>
  <div class="homework-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading homework...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="error-title">Unable to load homework</h3>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="fetchHomeworkData">
        Try Again
      </button>
      <router-link :to="`/course/${route.params.courseId}`" class="back-btn">
        Back to Course
      </router-link>
    </div>

    <!-- Homework Content -->
    <div v-else-if="homework" class="homework-content">
      <!-- Header -->
      <div class="homework-header">
        <div class="breadcrumb">
          <router-link :to="`/course/${route.params.courseId}`" class="breadcrumb-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Course
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ homework.title }}</span>
        </div>

        <div class="homework-hero">
          <div class="homework-info">
            <div class="homework-meta">
              <span class="homework-badge">Homework</span>
              <span class="lesson-title" v-if="lesson">Lesson: {{ lesson.title }}</span>
            </div>
            <h1 class="homework-title">{{ homework.title }}</h1>
            <p class="homework-description">{{ homework.description }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="content-grid">
          <!-- Left Column - Homework Details -->
          <div class="left-column">
            <section class="section homework-details">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Assignment Details
                </h2>
              </div>

              <div class="details-content">
                <div class="details-card">
                  <h3 class="details-title">Instructions</h3>
                  <div class="details-text" v-html="formatInstructions(homework.description)"></div>

                  <div v-if="homework.homework_url" class="assignment-link">
                    <a :href="homework.homework_url" target="_blank" class="link-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      View Assignment Material
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <!-- Submission Section -->
            <section class="section submission-section">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Your Submission
                </h2>
                <span v-if="submission" class="submission-status submitted">Submitted</span>
                <span v-else class="submission-status not-submitted">Not Submitted</span>
              </div>

              <div class="submission-content">
                <!-- Show existing submission -->
                <div v-if="submission" class="existing-submission">
                  <div class="submission-card">
                    <div class="submission-header">
                      <div class="submission-info">
                        <h3 class="submission-title">Submitted Work</h3>
                        <span class="submission-date">
                          Submitted {{ formatDate(submission.date_submitted) }}
                        </span>
                      </div>
                      <button
                        class="edit-btn"
                        @click="showSubmissionForm = true"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Submission
                      </button>
                    </div>

                    <div class="submission-details">
                      <div v-if="submission.submitted_homework_url" class="submission-link">
                        <a :href="submission.submitted_homework_url" target="_blank" class="link-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          View Your Submission
                        </a>
                      </div>

                      <div v-if="submission.description" class="submission-description">
                        <h4>Submission Notes:</h4>
                        <p>{{ submission.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submission Form -->
                <div v-if="showSubmissionForm || !submission" class="submission-form">
                  <h3 class="form-title">
                    {{ submission ? 'Update Submission' : 'Submit Homework' }}
                  </h3>

                  <form @submit.prevent="submitHomework">
                    <div class="form-group">
                      <label for="submissionUrl" class="form-label">
                        Submission URL
                        <span class="required">*</span>
                      </label>
                      <input
                        id="submissionUrl"
                        v-model="submissionForm.submitted_homework_url"
                        type="url"
                        placeholder="https://example.com/your-work"
                        class="form-input"
                        :disabled="submitting"
                        required
                      >
                      <p class="form-hint">
                        Provide a link to your work (GitHub repository, Google Drive, etc.)
                      </p>
                    </div>

                    <div class="form-group">
                      <label for="description" class="form-label">
                        Description / Notes
                      </label>
                      <textarea
                        id="description"
                        v-model="submissionForm.description"
                        placeholder="Add any notes about your submission..."
                        class="form-textarea"
                        :disabled="submitting"
                        rows="4"
                      ></textarea>
                    </div>

                    <div class="form-actions">
                      <button
                        v-if="submission && !showSubmissionForm"
                        type="button"
                        class="cancel-btn"
                        @click="showSubmissionForm = false"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="submit-btn"
                        :disabled="submitting || !submissionForm.submitted_homework_url"
                      >
                        <span v-if="submitting" class="btn-loading"></span>
                        <span v-else>{{ submission ? 'Update Submission' : 'Submit Homework' }}</span>
                      </button>
                    </div>

                    <div v-if="submitError" class="error-message">
                      {{ submitError }}
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column - Resources & Info -->
          <div class="right-column">
            <section class="section resources-section">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Resources
                </h2>
              </div>

              <div class="resources-content">
                <div class="resource-card">
                  <h3 class="resource-title">Helpful Links</h3>
                  <ul class="resource-list">
                    <li v-if="homework.homework_url">
                      <a :href="homework.homework_url" target="_blank" class="resource-link">
                        Assignment Materials
                      </a>
                    </li>
                    <li v-if="lesson?.reading_url">
                      <a :href="lesson.reading_url" target="_blank" class="resource-link">
                        Lesson Reading Material
                      </a>
                    </li>
                    <li v-if="lesson?.source_code_url">
                      <a :href="lesson.source_code_url" target="_blank" class="resource-link">
                        Source Code Examples
                      </a>
                    </li>
                  </ul>
                </div>

                <div class="resource-card">
                  <h3 class="resource-title">Submission Guidelines</h3>
                  <ul class="guidelines-list">
                    <li>Ensure your work is accessible via the provided URL</li>
                    <li>Include clear documentation if applicable</li>
                    <li>Test your submission thoroughly</li>
                    <li>Add notes to help understand your approach</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="section deadline-section">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Submission Status
                </h2>
              </div>

              <div class="deadline-content">
                <div class="status-card">
                  <div class="status-item">
                    <span class="status-label">Status</span>
                    <span class="status-value" :class="submission ? 'status-submitted' : 'status-pending'">
                      {{ submission ? 'Submitted' : 'Pending' }}
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Due Date</span>
                    <span class="status-value">Self-paced</span>
                  </div>
                  <div v-if="submission" class="status-item">
                    <span class="status-label">Last Submitted</span>
                    <span class="status-value">{{ formatDate(submission.date_submitted) }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseService, type Homework, type SubmittedHomework, type Lesson } from '@/services/course.service';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const homework = ref<Homework | null>(null);
const lesson = ref<Lesson | null>(null);
const submission = ref<SubmittedHomework | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);
const submitError = ref<string | null>(null);
const showSubmissionForm = ref(false);

// Form data
const submissionForm = ref({
  submitted_homework_url: '',
  description: '',
});

// Methods
const fetchHomeworkData = async () => {
  const homeworkId = route.params.homeworkId as string;
  const courseId = route.params.courseId as string;
  const lessonId = route.params.lessonId as string;

  if (!homeworkId || !courseId || !lessonId) {
    error.value = 'Invalid route parameters';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch homework
    homework.value = await courseService.getHomework(homeworkId);

    // Fetch lesson
    lesson.value = await courseService.getLesson(lessonId);

    // Fetch user's submission
    const userId = authStore.user?.id;
    if (userId) {
      const submissions = await courseService.getUserSubmissions(userId, homeworkId);
      if (submissions.length > 0) {
        submission.value = submissions[0];
        // Pre-fill form with existing submission
        submissionForm.value = {
          submitted_homework_url: submission.value.submitted_homework_url,
          description: submission.value.description || '',
        };
      }
    }
  } catch (err: any) {
    console.error('Error fetching homework data:', err);
    error.value = err.message || 'Failed to load homework. Please try again.';
  } finally {
    loading.value = false;
  }
};

const submitHomework = async () => {
  if (!homework.value || !authStore.user?.id) return;

  submitting.value = true;
  submitError.value = null;

  try {
    const submissionData = {
      external_submitted_homework_id: submission.value?.external_submitted_homework_id ||
                                     `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: authStore.user.id,
      homework: homework.value.external_homework_id,
      submitted_homework_url: submissionForm.value.submitted_homework_url.trim(),
      description: submissionForm.value.description.trim() || undefined,
    };

    if (submission.value) {
      // Update existing submission
      const updated = await courseService.submitHomework(submissionData);
      submission.value = updated;
    } else {
      // Create new submission
      const newSubmission = await courseService.submitHomework(submissionData);
      submission.value = newSubmission;
    }

    showSubmissionForm.value = false;
    alert(submission.value ? 'Submission updated successfully!' : 'Homework submitted successfully!');
  } catch (err: any) {
    console.error('Error submitting homework:', err);
    submitError.value = err.message || 'Failed to submit homework. Please try again.';
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const formatInstructions = (text: string) => {
  if (!text) return '';

  // Replace newlines with <br> and wrap URLs in links
  return text
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-link">$1</a>');
};

// Lifecycle
onMounted(() => {
  fetchHomeworkData();
});
</script>

<style scoped>
.homework-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #64748b;
  font-size: 1.125rem;
}

.error-container {
  text-align: center;
}

.error-icon {
  color: #f56565;
  margin-bottom: 24px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.error-message {
  color: #718096;
  margin-bottom: 24px;
  max-width: 400px;
}

.retry-btn,
.back-btn {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  margin: 0 8px;
}

.retry-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

.back-btn {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.back-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.homework-header {
  margin-bottom: 40px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #64748b;
  font-size: 0.875rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: #5a67d8;
}

.breadcrumb-separator {
  color: #cbd5e0;
}

.breadcrumb-current {
  color: #334155;
  font-weight: 500;
}

.homework-hero {
  padding: 0 20px;
}

.homework-info {
  max-width: 1200px;
  margin: 0 auto;
}

.homework-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.homework-badge {
  background: var(--primary-gradient);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.lesson-title {
  color: #64748b;
  font-size: 0.875rem;
}

.homework-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 16px;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .homework-title {
    font-size: 2rem;
  }
}

.homework-description {
  color: #64748b;
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 800px;
}

.main-content {
  padding: 20px;
}

.content-grid {
  display: grid;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.submission-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.submission-status.submitted {
  background: #c6f6d5;
  color: #22543d;
}

.submission-status.not-submitted {
  background: #fed7d7;
  color: #742a2a;
}

.details-content {
  padding: 24px;
}

.details-card {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.details-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.details-text {
  color: #334155;
  line-height: 1.7;
  margin-bottom: 24px;
}

.details-text :deep(.text-link) {
  color: #667eea;
  text-decoration: none;
}

.details-text :deep(.text-link:hover) {
  text-decoration: underline;
}

.assignment-link {
  margin-top: 24px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-gradient);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.link-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.submission-content {
  padding: 24px;
}

.existing-submission {
  margin-bottom: 24px;
}

.submission-card {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.submission-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.submission-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.submission-date {
  color: #94a3b8;
  font-size: 0.875rem;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.submission-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.submission-link .link-btn {
  width: fit-content;
}

.submission-description h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.submission-description p {
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.submission-form {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.required {
  color: #f56565;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  color: #334155;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-hint {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-btn {
  padding: 10px 24px;
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.submit-btn {
  padding: 10px 24px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.btn-loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #f56565;
  font-size: 0.875rem;
  margin-top: 16px;
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}

.resources-content {
  padding: 24px;
}

.resource-card {
  margin-bottom: 24px;
}

.resource-card:last-child {
  margin-bottom: 0;
}

.resource-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.resource-list li {
  margin-bottom: 12px;
}

.resource-list li:last-child {
  margin-bottom: 0;
}

.resource-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.resource-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.guidelines-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guidelines-list li {
  padding-left: 24px;
  margin-bottom: 12px;
  position: relative;
  color: #334155;
  line-height: 1.5;
}

.guidelines-list li:before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #667eea;
  font-weight: bold;
}

.guidelines-list li:last-child {
  margin-bottom: 0;
}

.deadline-content {
  padding: 24px;
}

.status-card {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.status-value {
  font-weight: 600;
  font-size: 1rem;
}

.status-submitted {
  color: #c6f6d5;
}

.status-pending {
  color: #fed7d7;
}
</style>

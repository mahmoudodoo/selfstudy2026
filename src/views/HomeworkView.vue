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
        <!-- Homework Content & Submission -->
        <div class="homework-main-content">
          <!-- Homework Content Section -->
          <section class="section homework-content-section">
            <div class="section-header">
              <h2 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Assignment Content
              </h2>
            </div>

            <div class="homework-content-wrapper">
              <!-- Homework Materials -->
              <div v-if="homework.homework_url" class="homework-materials">
                <div class="materials-header">
                  <h3 class="materials-title">Homework Materials</h3>
                  <a :href="homework.homework_url" target="_blank" class="external-link">
                    Open in new tab
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>

                <!-- Show direct link for Google Docs (can't be embedded) -->
                <div v-if="isGoogleDocsLink" class="docs-warning">
                  <div class="warning-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="warning-content">
                    <p>This Google Docs link cannot be embedded. Please use the link below to view the document:</p>
                    <a :href="homework.homework_url" target="_blank" class="docs-link">
                      {{ homework.homework_url }}
                    </a>
                  </div>
                </div>

                <!-- Embedded content for non-Google Docs -->
                <div v-else class="embed-container">
                  <iframe
                    v-if="!isGoogleDocsLink"
                    :src="homework.homework_url"
                    class="homework-iframe"
                    :title="homework.title"
                    allowfullscreen
                  ></iframe>
                  <div v-else class="no-embed">
                    <p>Preview not available. Please use the link above to view the content.</p>
                  </div>
                </div>
              </div>

              <!-- Instructions -->
              <div class="instructions-container">
                <h3 class="instructions-title">Instructions</h3>
                <div class="instructions-content" v-html="formatInstructions(homework.description)"></div>
              </div>
            </div>
          </section>

          <!-- Submission Section -->
          <section class="section submission-section">
            <div class="section-header">
              <h2 class="section-title">
                <svg xmlns="http://www.w3.org2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Your Submission
              </h2>
              <span v-if="submission" class="submission-status submitted">Submitted</span>
              <span v-else class="submission-status not-submitted">Not Submitted</span>
            </div>

            <div class="submission-content">
              <!-- Show existing submission -->
              <div v-if="submission && !showSubmissionForm" class="existing-submission">
                <div class="submission-card">
                  <div class="submission-header">
                    <div class="submission-info">
                      <h3 class="submission-title">Submitted Work</h3>
                      <span class="submission-date">
                        Submitted {{ formatDate(submission.date_submitted) }}
                      </span>
                    </div>
                    <div class="submission-actions">
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
                      placeholder="https://github.com/your-username/project or https://drive.google.com/file/d/..."
                      class="form-input"
                      :disabled="submitting"
                      required
                    >
                    <p class="form-hint">
                      Provide a link to your work (GitHub repository, Google Drive, CodePen, etc.)
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
                      v-if="submission && showSubmissionForm"
                      type="button"
                      class="cancel-btn"
                      @click="cancelEdit"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseService, type Homework, type SubmittedHomework, type Lesson, type Course } from '@/services/course.service';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const homework = ref<Homework | null>(null);
const lesson = ref<Lesson | null>(null);
const course = ref<Course | null>(null);
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

// Computed
const isGoogleDocsLink = computed(() => {
  return homework.value?.homework_url?.includes('docs.google.com') ||
         homework.value?.homework_url?.includes('drive.google.com');
});

// Helper function to generate UUID v4
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback for older browsers or non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// Methods
const fetchHomeworkData = async () => {
  const courseId = route.params.courseId as string;
  const lessonId = route.params.lessonId as string;

  if (!courseId || !lessonId) {
    error.value = 'Invalid route parameters';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch course
    course.value = await courseService.getCourse(courseId);

    // Fetch lesson
    lesson.value = await courseService.getLesson(lessonId);

    // Fetch homework - get the first homework for this lesson
    const homeworks = await courseService.getLessonHomeworks(lessonId);
    console.log('Fetched homeworks:', homeworks);

    if (homeworks.length === 0) {
      throw new Error('No homeworks found for this lesson');
    }

    // Use the first homework
    homework.value = homeworks[0];

    console.log('Selected homework:', homework.value);
    console.log('Homework ID:', homework.value.id);
    console.log('Homework external ID:', homework.value.external_homework_id);

    // Fetch user's submission if logged in
    const userId = authStore.user?.id;
    if (userId && homework.value) {
      try {
        const submissions = await courseService.getUserSubmissions(userId, homework.value.external_homework_id);
        if (submissions.length > 0) {
          submission.value = submissions[0];
          console.log('Found existing submission:', submission.value);
          // Pre-fill form with existing submission
          submissionForm.value = {
            submitted_homework_url: submission.value.submitted_homework_url,
            description: submission.value.description || '',
          };
        } else {
          console.log('No existing submission found for this homework');
        }
      } catch (err) {
        console.warn('Failed to fetch submissions:', err);
        // Don't show error for submission fetch failures
      }
    }

    // Set showSubmissionForm to true if no submission exists
    if (!submission.value) {
      showSubmissionForm.value = true;
    }

  } catch (err: any) {
    console.error('Error fetching homework data:', err);
    error.value = err.message || 'Failed to load homework. Please try again.';
  } finally {
    loading.value = false;
  }
};

const submitHomework = async () => {
  if (!homework.value || !authStore.user?.id) {
    submitError.value = 'Please login to submit homework';
    return;
  }

  submitting.value = true;
  submitError.value = null;

  try {
    console.log('Homework object:', homework.value);
    console.log('User ID:', authStore.user.id);

    // Generate a proper UUID for new submissions
    const externalId = submission.value?.external_submitted_homework_id || generateUUID();
    console.log('Generated external ID:', externalId);

    // The backend expects the homework_external_id for proper sync
    const submissionData = {
      external_submitted_homework_id: externalId,
      user_id: authStore.user.id,
      homework: homework.value.external_homework_id, // Use external ID for sync compatibility
      submitted_homework_url: submissionForm.value.submitted_homework_url.trim(),
      description: submissionForm.value.description.trim() || undefined,
    };

    console.log('Submitting homework with data:', submissionData);

    if (submission.value) {
      // Update existing submission using PUT to submitted-homeworks endpoint
      const updated = await courseService.updateHomeworkSubmission(
        submission.value.external_submitted_homework_id,
        submissionData
      );
      submission.value = updated;
      console.log('Update response:', updated);
    } else {
      // Create new submission
      console.log('Creating new submission...');
      const newSubmission = await courseService.submitHomework(submissionData);
      submission.value = newSubmission;
      console.log('Submission created:', newSubmission);
    }

    showSubmissionForm.value = false;
    alert(submission.value ? 'Submission updated successfully!' : 'Homework submitted successfully!');
  } catch (err: any) {
    console.error('Error submitting homework:', err);

    // More detailed error message
    if (err.data) {
      console.error('Error data:', err.data);
      if (err.data.homework) {
        submitError.value = `Homework field error: ${Array.isArray(err.data.homework) ? err.data.homework[0] : err.data.homework}`;
      } else if (err.data.detail) {
        submitError.value = err.data.detail;
      } else if (err.data.error) {
        submitError.value = err.data.error;
      } else if (typeof err.data === 'string') {
        submitError.value = err.data;
      } else {
        submitError.value = 'Failed to submit homework. Please check the form data and try again.';
      }
    } else {
      submitError.value = err.message || 'Failed to submit homework. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
};

const cancelEdit = () => {
  showSubmissionForm.value = false;
  // Reset form to original submission data
  if (submission.value) {
    submissionForm.value = {
      submitted_homework_url: submission.value.submitted_homework_url,
      description: submission.value.description || '',
    };
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';

  try {
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
  } catch {
    return 'Recently';
  }
};

const formatInstructions = (text: string) => {
  if (!text) return '<p>No instructions provided.</p>';

  // Replace newlines with paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim());
  return paragraphs.map(p => `<p>${p}</p>`).join('');
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
  max-width: 1200px;
  margin: 0 auto;
}

.homework-main-content {
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

.homework-content-wrapper {
  padding: 24px;
}

.homework-materials {
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.materials-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.materials-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.external-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.docs-warning {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #fef3c7;
  border-bottom: 1px solid #fbbf24;
}

.warning-icon {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 4px;
}

.warning-content {
  flex: 1;
}

.warning-content p {
  color: #92400e;
  margin-bottom: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.docs-link {
  display: block;
  color: #667eea;
  word-break: break-all;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.docs-link:hover {
  text-decoration: underline;
}

.embed-container {
  padding: 24px;
  background: #f8fafc;
}

.homework-iframe {
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 8px;
  background: white;
}

.no-embed {
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
}

.instructions-container {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.instructions-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.instructions-content {
  color: #334155;
  line-height: 1.7;
}

.instructions-content :deep(p) {
  margin-bottom: 12px;
}

.instructions-content :deep(p:last-child) {
  margin-bottom: 0;
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
  flex-wrap: wrap;
  gap: 16px;
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

.submission-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
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
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
}

.link-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
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
</style>

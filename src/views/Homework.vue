<template>
  <div class="homework-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading homework...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Unable to load homework</h3>
      <p>{{ error }}</p>
      <button @click="router.back()" class="back-btn">Go Back</button>
    </div>

    <!-- Homework Content -->
    <div v-else-if="homeworks.length > 0" class="homework-content">
      <!-- Header -->
      <div class="homework-header">
        <button @click="router.back()" class="back-btn">
          <i class="arrow">←</i> Back to Course
        </button>
        <h1 class="page-title">Homework Assignment</h1>
        <p class="page-subtitle">Complete and submit your work</p>
      </div>

      <!-- Homework List -->
      <div class="homework-list">
        <div
          v-for="homework in homeworks"
          :key="homework.external_homework_id"
          class="homework-card"
        >
          <div class="homework-header">
            <h2 class="homework-title">{{ homework.title }}</h2>
            <div class="homework-meta">
              <span class="meta-badge">
                <i class="icon">📝</i>
                Assignment
              </span>
              <span class="meta-badge">
                <i class="icon">⏰</i>
                Due Date: {{ getDueDate(homework) }}
              </span>
            </div>
          </div>

          <div class="homework-description">
            <h3 class="section-title">Description</h3>
            <div class="description-content">
              {{ homework.description }}
            </div>
          </div>

          <div class="homework-resources">
            <h3 class="section-title">Resources</h3>
            <a
              :href="homework.homework_url"
              target="_blank"
              class="resource-link"
            >
              <i class="icon">📎</i>
              Assignment Instructions
            </a>
          </div>

          <!-- Submission Section -->
          <div class="submission-section">
            <h3 class="section-title">Your Submission</h3>

            <div v-if="hasSubmitted" class="submission-status submitted">
              <div class="status-header">
                <i class="icon">✅</i>
                <h4>Submitted</h4>
              </div>
              <div class="submission-details">
                <p><strong>Submitted on:</strong> {{ formatDate(currentSubmission?.date_submitted || '') }}</p>
                <a
                  v-if="currentSubmission?.submitted_homework_url"
                  :href="currentSubmission.submitted_homework_url"
                  target="_blank"
                  class="submission-link"
                >
                  View Submission
                </a>
                <p v-if="currentSubmission?.description">
                  <strong>Notes:</strong> {{ currentSubmission.description }}
                </p>
              </div>
            </div>

            <div v-else class="submission-status pending">
              <div class="status-header">
                <i class="icon">⏳</i>
                <h4>Not Submitted</h4>
              </div>
              <p class="status-message">You haven't submitted this assignment yet.</p>
            </div>

            <!-- Submission Form -->
            <div class="submission-form">
              <h4>Submit Your Work</h4>

              <div class="form-group">
                <label for="submissionUrl">Submission URL</label>
                <input
                  id="submissionUrl"
                  v-model="submissionUrl"
                  type="url"
                  placeholder="https://github.com/your-repo or https://drive.google.com/your-file"
                  class="form-input"
                />
                <small class="form-help">
                  Provide a link to your GitHub repository, Google Drive file, or any other hosted solution
                </small>
              </div>

              <div class="form-group">
                <label for="submissionNotes">Additional Notes (Optional)</label>
                <textarea
                  id="submissionNotes"
                  v-model="submissionNotes"
                  placeholder="Any additional information about your submission..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-actions">
                <button
                  @click="submitHomework(homework)"
                  :disabled="!submissionUrl.trim() || submitting"
                  class="submit-btn"
                >
                  <span v-if="submitting">
                    <span class="spinner"></span> Submitting...
                  </span>
                  <span v-else>
                    <i class="icon">📤</i> Submit Assignment
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Homework -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No homework assignments</h3>
      <p>This lesson doesn't have any homework assigned yet.</p>
      <button @click="router.back()" class="back-btn">Back to Lessons</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseService, type Homework, type SubmittedHomework } from '@/services/course.service';
import { useAuthStore } from '@/store/auth';
import { v4 as uuidv4 } from 'uuid';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const homeworks = ref<Homework[]>([]);
const submissions = ref<SubmittedHomework[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const submissionUrl = ref('');
const submissionNotes = ref('');
const submitting = ref(false);

const currentSubmission = computed(() => {
  if (!homeworks.value[0] || !submissions.value) return null;
  return submissions.value.find(
    sub => sub.homework === homeworks.value[0].id
  );
});

const hasSubmitted = computed(() => {
  return !!currentSubmission.value;
});

const fetchHomework = async () => {
  loading.value = true;
  error.value = null;

  try {
    const lessonId = route.params.lessonId as string;
    homeworks.value = await courseService.getLessonHomeworks(lessonId);

    // Fetch user submissions if authenticated
    if (authStore.user && homeworks.value.length > 0) {
      // In a real app, you'd fetch submissions for this user
      // For now, we'll leave submissions empty
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load homework';
    console.error('Error fetching homework:', err);
  } finally {
    loading.value = false;
  }
};

const submitHomework = async (homework: Homework) => {
  if (!authStore.user || !submissionUrl.value.trim()) return;

  submitting.value = true;
  try {
    await courseService.submitHomework({
      external_submitted_homework_id: uuidv4(),
      user_id: authStore.user.id,
      homework: homework.external_homework_id,
      submitted_homework_url: submissionUrl.value.trim(),
      description: submissionNotes.value.trim() || undefined,
    });

    // Reset form and refresh data
    submissionUrl.value = '';
    submissionNotes.value = '';
    await fetchHomework();

    // Show success message
    alert('Homework submitted successfully!');
  } catch (err: any) {
    console.error('Error submitting homework:', err);
    alert('Failed to submit homework. Please try again.');
  } finally {
    submitting.value = false;
  }
};

const getDueDate = (homework: Homework) => {
  // In a real app, you'd have a due date field
  // For now, return a placeholder
  const date = new Date();
  date.setDate(date.getDate() + 7); // One week from now
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchHomework();
});
</script>

<style scoped>
.homework-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.homework-header {
  margin-bottom: 3rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #667eea;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
}

/* Homework Card */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.homework-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.homework-header {
  margin-bottom: 2rem;
}

.homework-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.homework-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  color: #667eea;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Description */
.homework-description {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.description-content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  white-space: pre-wrap;
}

/* Resources */
.homework-resources {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.resource-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border-radius: 8px;
  transition: all 0.3s;
}

.resource-link:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

/* Submission Section */
.submission-section {
  margin-top: 2rem;
}

.submission-status {
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.submission-status.submitted {
  background: linear-gradient(135deg, #48bb7815 0%, #38a16915 100%);
  border: 1px solid #48bb78;
}

.submission-status.pending {
  background: linear-gradient(135deg, #ed893615 0%, #dd6b2015 100%);
  border: 1px solid #ed8936;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.status-header .icon {
  font-size: 1.5rem;
}

.status-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.submission-details {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.submission-details p {
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.submission-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 6px;
  transition: all 0.3s;
}

.submission-link:hover {
  background: #e5e7eb;
}

.status-message {
  color: #9ca3af;
  font-size: 1rem;
}

/* Submission Form */
.submission-form {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.submission-form h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

/* Loading, Error, Empty States */
.loading-container,
.error-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.error-container h3,
.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-container p,
.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .homework-container {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .homework-card {
    padding: 1.5rem;
  }

  .homework-title {
    font-size: 1.5rem;
  }

  .submission-form {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .homework-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .homework-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-actions {
    justify-content: stretch;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

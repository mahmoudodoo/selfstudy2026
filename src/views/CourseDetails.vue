<template>
  <div class="course-details-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading course details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Unable to load course</h3>
      <p>{{ error }}</p>
      <button @click="fetchCourseDetails" class="retry-btn">Try Again</button>
    </div>

    <!-- Course Content -->
    <div v-else-if="course" class="course-content">
      <!-- Course Header -->
      <div class="course-header">
        <button @click="router.back()" class="back-btn">
          <i class="arrow">←</i> Back to Courses
        </button>

        <div class="header-content">
          <div class="course-image-wrapper">
            <img
              :src="course.image_url || 'https://via.placeholder.com/800x400?text=Course+Image'"
              :alt="course.title"
              class="course-header-image"
              @error="handleImageError"
            />
          </div>
          <div class="course-info">
            <h1 class="course-title">{{ course.title }}</h1>
            <div class="course-meta">
              <span class="meta-badge">
                <i class="icon">📅</i>
                {{ formatDate(course.date_added) }}
              </span>
              <span class="meta-badge" v-if="isRegistered">
                <i class="icon">✅</i>
                Registered
              </span>
              <span class="meta-badge" v-else>
                <i class="icon">👥</i>
                {{ course.registrations?.length || 0 }} students
              </span>
            </div>
            <p class="course-description">{{ course.description }}</p>

            <div class="action-buttons">
              <button
                v-if="!isRegistered"
                @click="registerToCourse"
                :disabled="registerLoading"
                class="register-btn"
              >
                <span v-if="registerLoading">
                  <span class="spinner"></span> Registering...
                </span>
                <span v-else>
                  <i class="icon">📝</i> Enroll in Course
                </span>
              </button>
              <button v-else class="registered-btn" disabled>
                <i class="icon">✅</i> Already Enrolled
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Tabs -->
      <div class="course-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Lessons Tab -->
      <div v-if="activeTab === 'lessons'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon">📚</i>
            Lessons ({{ course.lessons?.length || 0 }})
          </h2>
        </div>

        <div v-if="course.lessons && course.lessons.length > 0" class="lessons-list">
          <div
            v-for="lesson in course.lessons"
            :key="lesson.external_lesson_id"
            class="lesson-card"
          >
            <div class="lesson-content">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <p class="lesson-date">Added {{ formatDate(lesson.date_added) }}</p>

              <div v-if="lesson.source_code_url || lesson.reading_url" class="lesson-links">
                <a
                  v-if="lesson.source_code_url"
                  :href="lesson.source_code_url"
                  target="_blank"
                  class="lesson-link"
                >
                  <i class="icon">💻</i> Source Code
                </a>
                <a
                  v-if="lesson.reading_url"
                  :href="lesson.reading_url"
                  target="_blank"
                  class="lesson-link"
                >
                  <i class="icon">📖</i> Reading Material
                </a>
              </div>
            </div>

            <div class="lesson-actions">
              <button
                v-if="isRegistered && hasHomework(lesson)"
                @click="viewHomework(lesson.external_lesson_id)"
                class="homework-btn"
              >
                <i class="icon">📝</i> Homework
              </button>
              <button v-else class="disabled-btn" disabled>
                <i class="icon">📝</i> No Homework
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-lessons">
          <div class="empty-icon">📚</div>
          <h3>No lessons available yet</h3>
          <p>Check back soon for course content!</p>
        </div>
      </div>

      <!-- Comments Tab -->
      <div v-if="activeTab === 'comments'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon">💬</i>
            Discussions ({{ course.comments?.length || 0 }})
          </h2>
        </div>

        <!-- Add Comment Form -->
        <div class="add-comment-form">
          <textarea
            v-model="newComment"
            placeholder="Share your thoughts about this course..."
            class="comment-input"
            rows="4"
          ></textarea>
          <div class="form-actions">
            <button
              @click="submitComment"
              :disabled="!newComment.trim() || commentLoading"
              class="submit-comment-btn"
            >
              <span v-if="commentLoading">
                <span class="spinner"></span> Posting...
              </span>
              <span v-else>Post Comment</span>
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="course.comments && course.comments.length > 0" class="comments-list">
          <div
            v-for="comment in course.comments"
            :key="comment.external_comment_id"
            class="comment-card"
          >
            <div class="comment-header">
              <div class="user-info">
                <div class="user-avatar">
                  {{ comment.user_id.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="user-name">User {{ comment.user_id }}</h4>
                  <span class="comment-date">{{ formatDate(comment.date_added) }}</span>
                </div>
              </div>
              <button
                v-if="comment.user_id === authStore.user?.id"
                @click="deleteComment(comment.external_comment_id)"
                class="delete-comment-btn"
              >
                Delete
              </button>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>
        </div>
        <div v-else class="empty-comments">
          <div class="empty-icon">💬</div>
          <h3>No comments yet</h3>
          <p>Be the first to share your thoughts!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseService, type CourseDetails } from '@/services/course.service';
import { useAuthStore } from '@/store/auth';
import { v4 as uuidv4 } from 'uuid';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const course = ref<CourseDetails | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('lessons');
const newComment = ref('');
const commentLoading = ref(false);
const registerLoading = ref(false);

const tabs = [
  { id: 'lessons', label: 'Lessons' },
  { id: 'comments', label: 'Comments' },
];

const isRegistered = computed(() => {
  if (!course.value || !authStore.user) return false;
  return course.value.registrations?.some(
    reg => reg.user_id === authStore.user?.id
  );
});

const fetchCourseDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    const courseId = route.params.id as string;
    course.value = await courseService.getCourseDetails(courseId);
  } catch (err: any) {
    error.value = err.message || 'Failed to load course details';
    console.error('Error fetching course details:', err);
  } finally {
    loading.value = false;
  }
};

const registerToCourse = async () => {
  if (!authStore.user || !course.value) return;

  registerLoading.value = true;
  try {
    await courseService.registerToCourse({
      external_id: uuidv4(),
      user_id: authStore.user.id,
      course: course.value.external_course_id,
    });
    // Refresh course details to update registration status
    await fetchCourseDetails();
  } catch (err: any) {
    console.error('Error registering to course:', err);
    alert('Failed to register to course. Please try again.');
  } finally {
    registerLoading.value = false;
  }
};

const submitComment = async () => {
  if (!authStore.user || !course.value || !newComment.value.trim()) return;

  commentLoading.value = true;
  try {
    await courseService.createComment({
      external_comment_id: uuidv4(),
      content: newComment.value.trim(),
      user_id: authStore.user.id,
      course: course.value.external_course_id,
    });
    // Refresh course details to show new comment
    await fetchCourseDetails();
    newComment.value = '';
  } catch (err: any) {
    console.error('Error posting comment:', err);
    alert('Failed to post comment. Please try again.');
  } finally {
    commentLoading.value = false;
  }
};

const deleteComment = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    await courseService.deleteComment(commentId);
    // Refresh course details to remove comment
    await fetchCourseDetails();
  } catch (err: any) {
    console.error('Error deleting comment:', err);
    alert('Failed to delete comment. Please try again.');
  }
};

const viewHomework = (lessonId: string) => {
  router.push(`/homework/${lessonId}`);
};

const hasHomework = (lesson: any) => {
  if (!course.value?.homeworks) return false;
  return course.value.homeworks.some(hw => hw.lesson === lesson.id);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'https://via.placeholder.com/800x400?text=Course+Image';
};

onMounted(() => {
  fetchCourseDetails();
});
</script>

<style scoped>
.course-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Back Button */
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #667eea;
}

/* Course Header */
.course-header {
  margin-bottom: 3rem;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .header-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.course-image-wrapper {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.course-header-image {
  width: 100%;
  height: auto;
  display: block;
}

.course-info {
  padding: 1rem 0;
}

.course-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #4b5563;
}

.course-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.register-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.registered-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: default;
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

/* Tabs */
.course-tabs {
  display: flex;
  gap: 1px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 120px;
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  border-radius: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Lessons */
.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.lesson-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.lesson-content {
  flex-grow: 1;
}

.lesson-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.lesson-date {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.lesson-links {
  display: flex;
  gap: 1rem;
}

.lesson-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s;
}

.lesson-link:hover {
  color: #5a67d8;
}

.lesson-actions {
  flex-shrink: 0;
}

.homework-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.homework-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.disabled-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #e5e7eb;
  color: #9ca3af;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: not-allowed;
}

/* Comments */
.add-comment-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.comment-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  resize: vertical;
  transition: border-color 0.3s;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.submit-comment-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-comment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-comment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.comment-date {
  font-size: 0.875rem;
  color: #9ca3af;
}

.delete-comment-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-comment-btn:hover {
  background: #dc2626;
  color: white;
}

.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #4b5563;
}

/* Empty States */
.empty-lessons,
.empty-comments {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-lessons h3,
.empty-comments h3 {
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-lessons p,
.empty-comments p {
  color: #6b7280;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .course-details-container {
    padding: 1.5rem;
  }

  .course-title {
    font-size: 2rem;
  }

  .header-content {
    gap: 1.5rem;
  }

  .course-tabs {
    flex-wrap: wrap;
  }

  .lesson-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .lesson-actions {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .course-details-container {
    padding: 1rem;
  }

  .course-title {
    font-size: 1.75rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .register-btn,
  .registered-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

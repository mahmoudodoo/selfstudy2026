<template>
  <div class="course-details-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading course details...</p>
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
      <h3 class="error-title">Unable to load course</h3>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="fetchCourseData">
        Try Again
      </button>
      <router-link to="/courses" class="back-btn">
        Back to Courses
      </router-link>
    </div>

    <!-- Course Content -->
    <div v-else-if="course" class="course-content">
      <!-- Course Header -->
      <div class="course-header">
        <div class="breadcrumb">
          <router-link to="/courses" class="breadcrumb-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Courses
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ course.title }}</span>
        </div>

        <div class="course-hero">
          <div class="course-image-container">
            <div
              class="course-image-generated"
              :style="{ background: getCourseColor(course.title) }"
            >
              <span class="course-initials">{{ getCourseInitials(course.title) }}</span>
              <div class="image-overlay-generated"></div>
            </div>
            <img
              v-if="course.image_url && !shouldUseGeneratedImage(course.image_url)"
              :src="course.image_url"
              :alt="course.title"
              class="course-image"
              @error="handleImageError"
            >
            <div class="image-overlay"></div>
          </div>

          <div class="course-info">
            <div class="course-meta">
              <span class="course-badge">Course</span>
              <span class="course-date">
                Added {{ formatDate(course.date_added) }}
              </span>
            </div>

            <h1 class="course-title">{{ course.title }}</h1>

            <div class="course-stats">
              <div class="stat-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <div class="stat-content">
                  <span class="stat-number">{{ lessons.length }}</span>
                  <span class="stat-label">Lessons</span>
                </div>
              </div>

              <div class="stat-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="stat-content">
                  <span class="stat-number">{{ comments.length }}</span>
                  <span class="stat-label">Comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Sidebar Tabs for Mobile -->
        <div class="mobile-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="mobile-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <div class="content-grid">
          <!-- Left Column - Lessons & Comments -->
          <div class="left-column">
            <!-- Lessons Section -->
            <section class="section lessons-section" :class="{ active: activeTab === 'lessons' }">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Lessons
                </h2>
                <span class="section-count">{{ lessons.length }}</span>
              </div>

              <div class="lessons-list">
                <div v-if="lessons.length === 0" class="empty-lessons">
                  <p>No lessons available for this course yet.</p>
                </div>

                <div
                  v-for="lesson in lessons"
                  :key="lesson.external_lesson_id"
                  class="lesson-card"
                >
                  <div class="lesson-info">
                    <h3 class="lesson-title">{{ lesson.title }}</h3>
                    <p class="lesson-date">
                      Added {{ formatDate(lesson.date_added) }}
                    </p>

                    <div class="lesson-links">
                      <a
                        v-if="lesson.reading_url"
                        :href="lesson.reading_url"
                        target="_blank"
                        class="lesson-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Reading Material
                      </a>

                      <a
                        v-if="lesson.source_code_url"
                        :href="lesson.source_code_url"
                        target="_blank"
                        class="lesson-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        Source Code
                      </a>
                    </div>

                    <!-- Homework Button -->
                    <button
                      v-if="isUserRegistered && lesson.homeworks && lesson.homeworks.length > 0"
                      class="homework-btn"
                      @click="navigateToHomework(lesson.external_lesson_id)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      View Homework ({{ lesson.homeworks.length }})
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Comments Section -->
            <section class="section comments-section" :class="{ active: activeTab === 'comments' }">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Comments
                </h2>
                <span class="section-count">{{ comments.length }}</span>
              </div>

              <!-- Add Comment Form -->
              <div class="add-comment-form">
                <div class="form-header">
                  <h3 class="form-title">Add a Comment</h3>
                  <p class="form-subtitle" v-if="!authStore.user">
                    Please <router-link to="/login">login</router-link> to comment
                  </p>
                </div>
                <form v-if="authStore.user" @submit.prevent="submitComment">
                  <div class="form-group">
                    <textarea
                      v-model="newComment"
                      placeholder="Share your thoughts about this course..."
                      class="comment-input"
                      rows="4"
                      :disabled="submittingComment"
                      required
                    ></textarea>
                    <div v-if="commentError" class="error-message">
                      {{ commentError }}
                    </div>
                  </div>
                  <div class="form-actions">
                    <button
                      type="submit"
                      class="submit-btn"
                      :disabled="!newComment.trim() || submittingComment"
                    >
                      <span v-if="submittingComment" class="btn-loading"></span>
                      <span v-else>Post Comment</span>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Comments List -->
              <div class="comments-list">
                <div v-if="comments.length === 0" class="empty-comments">
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>

                <div
                  v-for="comment in comments"
                  :key="comment.external_comment_id"
                  class="comment-card"
                >
                  <div class="comment-header">
                    <div class="user-info">
                      <div class="user-avatar" :style="{ background: getUserColor(comment.user_id) }">
                        {{ getUserInitials(comment.user_id) }}
                      </div>
                      <div class="user-details">
                        <span class="user-name">{{ getUserDisplayName(comment.user_id) }}</span>
                        <span class="comment-date">{{ formatDate(comment.date_added) }}</span>
                      </div>
                    </div>

                    <div v-if="comment.user_id === authStore.user?.id" class="comment-actions">
                      <button
                        class="action-btn delete-btn"
                        @click="deleteComment(comment.external_comment_id)"
                        :disabled="deletingCommentId === comment.external_comment_id"
                      >
                        <span v-if="deletingCommentId === comment.external_comment_id" class="btn-loading"></span>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="comment-content">
                    <p>{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column - Course Description -->
          <div class="right-column">
            <section class="section description-section">
              <div class="section-header">
                <h2 class="section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  Course Description
                </h2>
              </div>

              <div class="description-content">
                <p>{{ course.description || 'No description available.' }}</p>
              </div>

              <!-- Course Stats -->
              <div class="course-stats-card">
                <h3 class="stats-title">Course Statistics</h3>
                <div class="stats-grid">
                  <div class="stat-box">
                    <div class="stat-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">Active</span>
                      <span class="stat-label">Status</span>
                    </div>
                  </div>

                  <div class="stat-box">
                    <div class="stat-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">Self-paced</span>
                      <span class="stat-label">Learning</span>
                    </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseService, type Course, type Lesson, type Comment } from '@/services/course.service';
import { useAuthStore } from '@/store/auth';
import { getCourseInitials, getCourseColor, shouldUseGeneratedImage } from '@/utils/courseImage';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const course = ref<Course | null>(null);
const lessons = ref<Lesson[]>([]);
const comments = ref<Comment[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('lessons');
const newComment = ref('');
const submittingComment = ref(false);
const commentError = ref<string | null>(null);
const deletingCommentId = ref<string | null>(null);
const isUserRegistered = ref(false);

// Computed
const tabs = computed(() => [
  { id: 'lessons', label: 'Lessons', icon: '📚' },
  { id: 'comments', label: 'Comments', icon: '💬' },
]);

// Methods
const fetchCourseData = async () => {
  const courseId = route.params.id as string;
  if (!courseId) {
    error.value = 'Invalid course ID';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch course details
    course.value = await courseService.getCourse(courseId);
    console.log('Course loaded:', course.value);

    // Fetch lessons
    lessons.value = await courseService.getCourseLessons(courseId);

    // Fetch comments
    comments.value = await courseService.getCourseComments(courseId);

    // Check if user is registered for this course
    if (authStore.user?.id) {
      isUserRegistered.value = await courseService.isUserRegisteredForCourse(authStore.user.id, courseId);
    }

    // Load homeworks for each lesson
    for (const lesson of lessons.value) {
      try {
        lesson.homeworks = await courseService.getLessonHomeworks(lesson.external_lesson_id);
      } catch (err) {
        console.error(`Failed to load homeworks for lesson ${lesson.external_lesson_id}:`, err);
        lesson.homeworks = [];
      }
    }
  } catch (err: any) {
    console.error('Error fetching course data:', err);
    error.value = err.message || 'Failed to load course details. Please try again.';
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || !course.value || !authStore.user?.id) return;

  submittingComment.value = true;
  commentError.value = null;

  try {
    const commentData = {
      external_comment_id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: newComment.value.trim(),
      user_id: authStore.user.id,
      course: course.value.external_course_id, // Pass the UUID, service will handle conversion
    };

    console.log('Submitting comment with data:', commentData);
    const newCommentObj = await courseService.createComment(commentData);
    comments.value.unshift(newCommentObj);
    newComment.value = '';

    // Show success message
    alert('Comment added successfully!');
  } catch (err: any) {
    console.error('Error submitting comment:', err);
    commentError.value = err.message || 'Failed to submit comment. Please try again.';
    alert('Failed to submit comment. Please check console for details.');
  } finally {
    submittingComment.value = false;
  }
};

const deleteComment = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  deletingCommentId.value = commentId;

  try {
    await courseService.deleteComment(commentId);
    comments.value = comments.value.filter(comment => comment.external_comment_id !== commentId);
    alert('Comment deleted successfully!');
  } catch (err: any) {
    console.error('Error deleting comment:', err);
    alert('Failed to delete comment. Please try again.');
  } finally {
    deletingCommentId.value = null;
  }
};

const navigateToHomework = (lessonId: string) => {
  router.push(`/course/${route.params.id}/lesson/${lessonId}/homework`);
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';

  const container = img.closest('.course-image-container');
  if (container) {
    const generatedDiv = container.querySelector('.course-image-generated') as HTMLElement;
    if (generatedDiv) {
      generatedDiv.style.display = 'flex';
    }
  }
};

const getUserInitials = (userId: string) => {
  if (!userId) return 'U';
  const parts = userId.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return userId.substring(0, 2).toUpperCase() || 'U';
};

const getUserDisplayName = (userId: string) => {
  if (!userId) return 'User';
  if (userId === authStore.user?.id) return 'You';
  return userId;
};

const getUserColor = (userId: string) => {
  const colors = [
    '#667eea', '#764ba2', '#f56565', '#ed8936', '#48bb78',
    '#38b2ac', '#4299e1', '#9f7aea', '#ed64a6', '#f6ad55'
  ];

  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

// Lifecycle
onMounted(() => {
  fetchCourseData();
});
</script>


<style scoped>
.course-details-page {
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

.course-header {
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

.course-hero {
  position: relative;
}

.course-image-container {
  height: 400px;
  overflow: hidden;
  position: relative;
}

.course-image-generated {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.course-initials {
  font-size: 120px;
  font-weight: bold;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 2;
  position: relative;
}

.image-overlay-generated {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.course-info {
  position: relative;
  z-index: 1;
  padding: 0 20px;
  margin-top: -100px;
  color: white;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.course-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.course-date {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.course-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .course-title {
    font-size: 2rem;
  }
}

.course-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item svg {
  color: rgba(255, 255, 255, 0.9);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.main-content {
  padding: 20px;
}

.mobile-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

@media (min-width: 1024px) {
  .mobile-tabs {
    display: none;
  }
}

.mobile-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.mobile-tab.active {
  background: var(--primary-gradient);
  color: white;
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.content-grid {
  display: grid;
  gap: 32px;
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

@media (max-width: 1023px) {
  .section {
    display: none;
  }

  .section.active {
    display: block;
  }
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

.section-count {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.lessons-list {
  padding: 24px;
}

.empty-lessons {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.lesson-card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.lesson-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.lesson-date {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.lesson-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.lesson-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  color: #475569;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.lesson-link:hover {
  background: #667eea;
  color: white;
}

.lesson-link svg {
  flex-shrink: 0;
}

.homework-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  width: fit-content;
}

.homework-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.add-comment-form {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.form-header {
  margin-bottom: 20px;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.form-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.form-subtitle a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.form-subtitle a:hover {
  text-decoration: underline;
}

.comment-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  color: #334155;
  resize: vertical;
  transition: all 0.3s ease;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
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
  min-width: 120px;
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

.comments-list {
  padding: 24px;
}

.empty-comments {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.comment-card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
}

.comment-date {
  color: #94a3b8;
  font-size: 0.75rem;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #f56565;
  color: #f56565;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn:hover {
  border-color: #f56565;
  color: #f56565;
}

.comment-content {
  color: #334155;
  line-height: 1.6;
}

.description-content {
  padding: 24px;
  color: #334155;
  line-height: 1.7;
  font-size: 1.0625rem;
}

.course-stats-card {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin: 24px;
}

.stats-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
}

.stat-icon svg {
  color: white;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.error-message {
  color: #f56565;
  font-size: 0.875rem;
  margin-top: 4px;
}
</style>

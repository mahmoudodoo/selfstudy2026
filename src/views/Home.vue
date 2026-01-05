<template>
  <div class="home-container">
    <!-- Hero Welcome Section -->
    <div class="hero-welcome">
      <div class="welcome-content">
        <h1 class="welcome-title">
          Welcome back, <span class="gradient-text">John!</span> 👋
        </h1>
        <p class="welcome-subtitle">
          Ready to continue your learning journey? You have 3 active courses waiting for you.
        </p>
      </div>
      <div class="welcome-actions">
        <button class="primary-btn">
          <BookOpen :size="18" />
          <span>Continue Learning</span>
        </button>
        <button class="secondary-btn">
          <Plus :size="18" />
          <span>New Course</span>
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card gradient-1">
        <div class="stat-icon">
          <Clock :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">42h 15m</h3>
          <p class="stat-label">Total Study Time</p>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 75%"></div>
            </div>
            <span class="progress-text">+12% from last week</span>
          </div>
        </div>
      </div>

      <div class="stat-card gradient-2">
        <div class="stat-icon">
          <BookOpen :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">8/12</h3>
          <p class="stat-label">Courses Completed</p>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 66%"></div>
            </div>
            <span class="progress-text">3 in progress</span>
          </div>
        </div>
      </div>

      <div class="stat-card gradient-3">
        <div class="stat-icon">
          <Award :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">24</h3>
          <p class="stat-label">Achievements</p>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 60%"></div>
            </div>
            <span class="progress-text">4 new this month</span>
          </div>
        </div>
      </div>

      <div class="stat-card gradient-4">
        <div class="stat-icon">
          <TrendingUp :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">96%</h3>
          <p class="stat-label">Success Rate</p>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 96%"></div>
            </div>
            <span class="progress-text">Top 5% of students</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Active Courses Section -->
      <div class="courses-section">
        <div class="section-header">
          <h2 class="section-title">Active Courses</h2>
          <router-link to="/courses" class="view-all">
            View All
            <ChevronRight :size="16" />
          </router-link>
        </div>

        <div class="courses-grid">
          <div v-for="course in activeCourses" :key="course.id" class="course-card">
            <div class="course-header">
              <div class="course-icon" :style="{ background: course.color }">
                <component :is="course.icon" :size="20" />
              </div>
              <div class="course-info">
                <h4 class="course-title">{{ course.title }}</h4>
                <p class="course-instructor">{{ course.instructor }}</p>
              </div>
              <div class="course-progress">
                <span class="progress-percent">{{ course.progress }}%</span>
              </div>
            </div>

            <div class="course-progress-bar">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: `${course.progress}%`, background: course.color }"
                ></div>
              </div>
            </div>

            <div class="course-meta">
              <div class="meta-item">
                <Clock :size="14" />
                <span>{{ course.duration }}</span>
              </div>
              <div class="meta-item">
                <FileText :size="14" />
                <span>{{ course.lessons }} lessons</span>
              </div>
              <div class="meta-item">
                <div class="difficulty-badge" :class="course.difficulty">
                  {{ course.difficulty }}
                </div>
              </div>
            </div>

            <button class="course-action-btn">
              Continue
              <Play :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Upcoming Sessions -->
      <div class="sessions-section">
        <div class="section-header">
          <h2 class="section-title">Upcoming Live Sessions</h2>
          <router-link to="/sessions" class="view-all">
            View All
            <ChevronRight :size="16" />
          </router-link>
        </div>

        <div class="sessions-list">
          <div v-for="session in upcomingSessions" :key="session.id" class="session-card">
            <div class="session-time">
              <div class="session-date">
                <span class="month">{{ session.month }}</span>
                <span class="day">{{ session.day }}</span>
              </div>
              <div class="time-info">
                <span class="time">{{ session.time }}</span>
                <span class="duration">{{ session.duration }}</span>
              </div>
            </div>

            <div class="session-details">
              <h4 class="session-title">{{ session.title }}</h4>
              <p class="session-instructor">By {{ session.instructor }}</p>
              <div class="session-tags">
                <span class="tag" v-for="tag in session.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>

            <button class="session-action-btn">
              Join Now
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-label">Today's Goal</div>
            <div class="stat-value">2h / 3h</div>
            <div class="progress-bar small">
              <div class="progress-fill" style="width: 66%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Weekly Streak</div>
            <div class="stat-value">7 days 🔥</div>
            <div class="streak-days">
              <div v-for="day in 7" :key="day" class="streak-day active"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <div class="section-header">
        <h2 class="section-title">Recent Activity</h2>
      </div>

      <div class="activity-list">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :style="{ background: activity.color }">
            <component :is="activity.icon" :size="18" />
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
          <div class="activity-badge" v-if="activity.badge">
            {{ activity.badge }}
          </div>
        </div>
      </div>
    </div>

    <!-- Motivational Quote -->
    <div class="motivation-card">
      <div class="quote-icon">💡</div>
      <div class="quote-content">
        <p class="quote-text">
          "The beautiful thing about learning is that no one can take it away from you."
        </p>
        <p class="quote-author">– B.B. King</p>
      </div>
      <button class="share-btn">
        <Share2 :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  Play,
  FileText,
  Video,
  MessageSquare,
  CheckCircle,
  Star,
  Plus,
  Share2
} from 'lucide-vue-next'

const activeCourses = [
  {
    id: 1,
    title: 'Advanced JavaScript',
    instructor: 'Sarah Johnson',
    progress: 75,
    duration: '8h 30m',
    lessons: 24,
    difficulty: 'Advanced',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: BookOpen
  },
  {
    id: 2,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mike Chen',
    progress: 45,
    duration: '12h 15m',
    lessons: 18,
    difficulty: 'Intermediate',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: Video
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    instructor: 'Dr. Alex Rivera',
    progress: 30,
    duration: '15h 00m',
    lessons: 32,
    difficulty: 'Beginner',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: TrendingUp
  }
]

const upcomingSessions = [
  {
    id: 1,
    month: 'JAN',
    day: '15',
    time: '14:00',
    duration: '1h 30m',
    title: 'Live Q&A: Vue.js 3 Masterclass',
    instructor: 'David Park',
    tags: ['Vue.js', 'Frontend', 'Q&A']
  },
  {
    id: 2,
    month: 'JAN',
    day: '16',
    time: '10:00',
    duration: '2h 00m',
    title: 'Advanced React Patterns',
    instructor: 'Lisa Wong',
    tags: ['React', 'Advanced', 'Patterns']
  },
  {
    id: 3,
    month: 'JAN',
    day: '17',
    time: '16:00',
    duration: '1h 00m',
    title: 'Career Growth in Tech 2026',
    instructor: 'Marcus Lee',
    tags: ['Career', 'Tech', 'Growth']
  }
]

const recentActivity = [
  {
    id: 1,
    icon: CheckCircle,
    text: 'Completed "JavaScript Async Patterns" quiz',
    time: '2 hours ago',
    badge: 'A+',
    color: 'linear-gradient(135deg, #2ed573 0%, #1e90ff 100%)'
  },
  {
    id: 2,
    icon: BookOpen,
    text: 'Started new course "Advanced CSS Grid"',
    time: '5 hours ago',
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
  },
  {
    id: 3,
    icon: MessageSquare,
    text: 'Participated in "Vue vs React" discussion',
    time: '1 day ago',
    badge: '🔥',
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  },
  {
    id: 4,
    icon: Star,
    text: 'Earned "Fast Learner" achievement',
    time: '2 days ago',
    badge: '🏆',
    color: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
  }
]
</script>

<style scoped>
.home-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Hero Welcome Section */
.hero-welcome {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .hero-welcome {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #333 0%, #666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-mode .welcome-title {
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  max-width: 600px;
}

.dark-mode .welcome-subtitle {
  color: #aaa;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.dark-mode .secondary-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.secondary-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dark-mode .stat-card {
  background: rgba(255, 255, 255, 0.05);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.dark-mode .stat-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.gradient-1::before { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
.gradient-2::before { background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); }
.gradient-3::before { background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
.gradient-4::before { background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); }

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.gradient-1 .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.gradient-2 .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.gradient-3 .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.gradient-4 .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #333;
}

.dark-mode .stat-value {
  color: #fff;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 12px 0;
}

.dark-mode .stat-label {
  color: #aaa;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.dark-mode .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
}

.dark-mode .progress-text {
  color: #aaa;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.dark-mode .section-title {
  color: #fff;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: gap 0.3s ease;
}

.view-all:hover {
  gap: 8px;
}

/* Courses Grid */
.courses-grid {
  display: grid;
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-mode .course-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.dark-mode .course-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.course-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.course-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #333;
}

.dark-mode .course-title {
  color: #fff;
}

.course-instructor {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.dark-mode .course-instructor {
  color: #aaa;
}

.course-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-percent {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.dark-mode .progress-percent {
  color: #fff;
}

.course-progress-bar {
  margin-bottom: 20px;
}

.progress-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.dark-mode .progress-track {
  background: rgba(255, 255, 255, 0.1);
}

.course-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
}

.dark-mode .meta-item {
  color: #aaa;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.Beginner {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.difficulty-badge.Intermediate {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.difficulty-badge.Advanced {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.course-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  justify-content: center;
}

.course-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Sessions List */
.sessions-list {
  margin-bottom: 24px;
}

.session-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.dark-mode .session-card {
  background: rgba(255, 255, 255, 0.05);
}

.session-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dark-mode .session-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.session-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.session-date {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 8px;
  color: white;
  text-align: center;
}

.month {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.day {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
}

.time-info {
  text-align: center;
}

.time {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.dark-mode .time {
  color: #fff;
}

.duration {
  display: block;
  font-size: 0.75rem;
  color: #666;
}

.dark-mode .duration {
  color: #aaa;
}

.session-details {
  flex: 1;
}

.session-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #333;
}

.dark-mode .session-title {
  color: #fff;
}

.session-instructor {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 8px 0;
}

.dark-mode .session-instructor {
  color: #aaa;
}

.session-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.session-action-btn {
  background: #2ed573;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.session-action-btn:hover {
  background: #26c064;
  transform: scale(1.05);
}

/* Quick Stats */
.quick-stats {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dark-mode .quick-stats {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
}

.dark-mode .stat-label {
  color: #aaa;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.dark-mode .stat-value {
  color: #fff;
}

.progress-bar.small {
  height: 4px;
}

.streak-days {
  display: flex;
  gap: 4px;
}

.streak-day {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
}

.dark-mode .streak-day {
  background: rgba(255, 255, 255, 0.1);
}

.streak-day.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
}

.dark-mode .activity-section {
  background: rgba(255, 255, 255, 0.05);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.dark-mode .activity-item {
  background: rgba(255, 255, 255, 0.02);
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 4px 0;
  color: #333;
  font-weight: 500;
}

.dark-mode .activity-text {
  color: #fff;
}

.activity-time {
  font-size: 0.8rem;
  color: #666;
}

.dark-mode .activity-time {
  color: #aaa;
}

.activity-badge {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Motivation Card */
.motivation-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;
}

.quote-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.quote-content {
  flex: 1;
}

.quote-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.quote-author {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.share-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(15deg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-welcome {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }

  .primary-btn, .secondary-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .session-card {
    flex-direction: column;
    text-align: center;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>

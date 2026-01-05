<template>
  <div class="app-container">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobile && navOpen"
      class="mobile-overlay"
      @click="toggleNav"
    ></div>

    <!-- Side Navigation -->
    <aside
      class="side-nav"
      :class="{
        'nav-open': navOpen,
        'nav-collapsed': !navOpen,
        'mobile-nav': isMobile
      }"
    >
      <!-- Logo Section -->
      <div class="nav-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-show="navOpen" class="logo-text">
            <h2 class="logo-title">Self Study JO</h2>
            <p class="logo-subtitle">E-Learning Platform</p>
          </div>
        </div>
        <button
          class="nav-toggle-btn"
          @click="toggleNav"
          :aria-label="navOpen ? 'Collapse menu' : 'Expand menu'"
        >
          <svg class="toggle-icon" :class="{ 'rotated': !navOpen }" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <div class="menu-section">
          <h3 v-show="navOpen" class="section-title">Main Menu</h3>
          <ul class="nav-list">
            <li v-for="item in mainMenu" :key="item.name">
              <router-link
                :to="item.path"
                class="nav-item"
                :class="{ 'active': $route.path === item.path }"
                @click="handleMobileNav"
              >
                <div class="nav-icon">
                  <component :is="item.icon" :size="20" />
                </div>
                <span v-show="navOpen" class="nav-label">{{ item.name }}</span>
                <span v-if="item.badge && navOpen" class="nav-badge">{{ item.badge }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Learning Section -->
        <div class="menu-section">
          <h3 v-show="navOpen" class="section-title">Learning</h3>
          <ul class="nav-list">
            <li v-for="item in learningMenu" :key="item.name">
              <router-link
                :to="item.path"
                class="nav-item"
                :class="{ 'active': $route.path === item.path }"
                @click="handleMobileNav"
              >
                <div class="nav-icon">
                  <component :is="item.icon" :size="20" />
                </div>
                <span v-show="navOpen" class="nav-label">{{ item.name }}</span>
                <span v-if="item.progress && navOpen" class="progress-badge">
                  {{ item.progress }}%
                </span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Stats Section (Only when expanded) -->
        <div v-show="navOpen" class="stats-section">
          <div class="stats-card">
            <div class="stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <Clock :size="16" />
              </div>
              <div class="stat-info">
                <p class="stat-value">42h 15m</p>
                <p class="stat-label">Study Time</p>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <Award :size="16" />
              </div>
              <div class="stat-info">
                <p class="stat-value">24</p>
                <p class="stat-label">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Profile -->
      <div class="user-profile">
        <div class="profile-avatar" @click="toggleProfileMenu">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=JO"
            alt="User Avatar"
            class="avatar-img"
          />
          <div v-show="navOpen" class="profile-status online"></div>
        </div>
        <div v-show="navOpen" class="profile-info">
          <h4 class="profile-name">John Doe</h4>
          <p class="profile-email">john@selfstudy.com</p>
        </div>
        <button
          v-show="navOpen"
          class="logout-btn"
          @click="logout"
          aria-label="Logout"
        >
          <LogOut :size="18" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'expanded': !navOpen }">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button
            class="mobile-menu-btn"
            @click="toggleNav"
            v-if="isMobile"
          >
            <Menu :size="24" />
          </button>
          <div class="breadcrumb">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <nav class="breadcrumb-nav">
              <router-link to="/" class="breadcrumb-item">Home</router-link>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ pageTitle }}</span>
            </nav>
          </div>
        </div>
        <div class="header-right">
          <button class="header-btn search-btn" aria-label="Search">
            <Search :size="20" />
          </button>
          <button class="header-btn notification-btn" aria-label="Notifications">
            <Bell :size="20" />
            <span class="notification-badge">3</span>
          </button>
          <div class="theme-toggle">
            <button class="theme-btn" @click="toggleTheme" aria-label="Toggle theme">
              <Sun v-if="darkMode" :size="20" />
              <Moon v-else :size="20" />
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Home as HomeIcon,
  BookOpen,
  BarChart3,
  User,
  FileText,
  Video,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Clock,
  Award,
  Menu
} from 'lucide-vue-next'

const route = useRoute()
const navOpen = ref(true)
const darkMode = ref(false)
const isMobile = ref(false)
const profileMenuOpen = ref(false)

// Navigation items
const mainMenu = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Courses', path: '/courses', icon: BookOpen, badge: '5' },
  { name: 'Progress', path: '/progress', icon: BarChart3 },
  { name: 'Profile', path: '/profile', icon: User }
]

const learningMenu = [
  { name: 'My Courses', path: '/my-courses', icon: FileText, progress: 75 },
  { name: 'Live Sessions', path: '/sessions', icon: Video, progress: 30 },
  { name: 'Discussions', path: '/discussions', icon: MessageSquare },
  { name: 'Settings', path: '/settings', icon: Settings }
]

// Computed page title
const pageTitle = computed(() => {
  return route.meta?.title || 'Self Study JO'
})

// Toggle navigation
const toggleNav = () => {
  navOpen.value = !navOpen.value
  localStorage.setItem('navState', JSON.stringify(navOpen.value))
}

// Handle mobile navigation
const handleMobileNav = () => {
  if (isMobile.value && navOpen.value) {
    navOpen.value = false
  }
}

// Toggle theme
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-mode', darkMode.value)
  localStorage.setItem('darkMode', JSON.stringify(darkMode.value))
}

// Toggle profile menu
const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

// Logout function
const logout = () => {
  console.log('Logging out...')
  // Implement logout logic
}

// Handle responsive behavior
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    navOpen.value = false
  } else {
    // Restore saved state on desktop
    const savedState = localStorage.getItem('navState')
    if (savedState !== null) {
      navOpen.value = JSON.parse(savedState)
    }
  }
}

// Initialize from localStorage
const initializeFromStorage = () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = JSON.parse(savedDarkMode)
    document.documentElement.classList.toggle('dark-mode', darkMode.value)
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeFromStorage()
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Watch for route changes on mobile
watch(() => route.path, () => {
  if (isMobile.value) {
    navOpen.value = false
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  position: relative;
}

.dark-mode .app-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* Side Navigation Styles */
.side-nav {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
}

.dark-mode .side-nav {
  background: rgba(26, 26, 46, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.nav-open {
  width: 280px;
}

.nav-collapsed {
  width: 80px;
}

.mobile-nav {
  transform: translateX(-100%);
}

.mobile-nav.nav-open {
  transform: translateX(0);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.nav-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.dark-mode .nav-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.logo-text {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #666;
  margin: 2px 0 0 0;
}

.dark-mode .logo-subtitle {
  color: #aaa;
}

.nav-toggle-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-toggle-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.toggle-icon {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.nav-menu {
  padding: 24px 16px;
  flex-grow: 1;
}

.menu-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 12px 16px;
  font-weight: 600;
}

.dark-mode .section-title {
  color: #aaa;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  color: #555;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-bottom: 4px;
  position: relative;
}

.dark-mode .nav-item {
  color: #ccc;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  flex-grow: 1;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: #ff4757;
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.progress-badge {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.stats-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  margin: 24px 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .stats-section {
  background: rgba(255, 255, 255, 0.05);
}

.stats-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex-grow: 1;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.dark-mode .stat-value {
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin: 2px 0 0 0;
}

.dark-mode .stat-label {
  color: #aaa;
}

.user-profile {
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.dark-mode .user-profile {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.profile-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.profile-status.online {
  background: #2ed573;
}

.profile-info {
  flex-grow: 1;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.profile-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-mode .profile-name {
  color: #fff;
}

.profile-email {
  font-size: 0.75rem;
  color: #666;
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-mode .profile-email {
  color: #aaa;
}

.logout-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 0.2);
  transform: scale(1.05);
}

/* Main Content Styles */
.main-content {
  flex-grow: 1;
  margin-left: 280px;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content.expanded {
  margin-left: 80px;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }
}

.top-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dark-mode .top-header {
  background: rgba(26, 26, 46, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: flex;
  }
}

.mobile-menu-btn:hover {
  background: rgba(102, 126, 234, 0.2);
}

.breadcrumb {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-mode .page-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.dark-mode .breadcrumb-item {
  color: #aaa;
}

.breadcrumb-item:hover {
  color: #667eea;
}

.breadcrumb-item.current {
  color: #333;
  font-weight: 500;
}

.dark-mode .breadcrumb-item.current {
  color: #fff;
}

.breadcrumb-separator {
  color: #999;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.dark-mode .header-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.header-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #ff4757;
  color: white;
  font-size: 0.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.theme-toggle {
  margin-left: 8px;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.dark-mode .theme-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.theme-btn:hover {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  transform: rotate(15deg);
}

.content-container {
  flex-grow: 1;
  padding: 32px;
  overflow-y: auto;
}

/* Page Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Scrollbar Styling */
.side-nav::-webkit-scrollbar,
.content-container::-webkit-scrollbar {
  width: 6px;
}

.side-nav::-webkit-scrollbar-track,
.content-container::-webkit-scrollbar-track {
  background: transparent;
}

.side-nav::-webkit-scrollbar-thumb,
.content-container::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.side-nav::-webkit-scrollbar-thumb:hover,
.content-container::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-open {
    width: 100%;
    max-width: 320px;
  }

  .content-container {
    padding: 20px;
  }

  .top-header {
    padding: 16px 20px;
  }

  .header-right {
    gap: 8px;
  }

  .header-btn {
    width: 36px;
    height: 36px;
  }
}
</style>

<template>
  <div class="app-container">
    <aside :class="['sidebar', { 'collapsed': isCollapsed }]">
      <div class="sidebar-header">
        <div class="logo" @click="toggleSidebar">
          <div class="logo-icon">🎓</div>
          <span v-if="!isCollapsed" class="logo-text">Self Study JO</span>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ 'active': isActive(item.to) }"
        >
          <div class="nav-icon">
            <component :is="item.icon" />
          </div>
          <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            {{ userInitials }}
          </div>
          <div v-if="!isCollapsed" class="user-info">
            <p class="username">{{ username }}</p>
            <p class="email">{{ userEmail }}</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <div class="logout-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
            </svg>
          </div>
          <span v-if="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Icons components
const DashboardIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
    </svg>
  `
};

const CoursesIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};

const ProgressIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

const ProfileIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
    </svg>
  `
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isCollapsed = ref(false);

const navItems = [
  { to: '/', text: 'Dashboard', icon: DashboardIcon },
  { to: '/courses', text: 'Courses', icon: CoursesIcon },
  { to: '/progress', text: 'Progress', icon: ProgressIcon },
  { to: '/profile', text: 'Profile', icon: ProfileIcon },
];

const isActive = (path: string) => {
  return route.path === path;
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const username = computed(() => {
  const user = authStore.user;
  if (user && user.username) {
    return user.username;
  }
  return 'Guest';
});

const userEmail = computed(() => {
  const user = authStore.user;
  if (user && user.email) {
    return user.email;
  }
  return 'user@example.com';
});

const userInitials = computed(() => {
  const name = username.value;
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .logo-text {
  display: none;
}

.sidebar-toggle {
  width: 40px;
  height: 40px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: #edf2f7;
  color: #667eea;
}

.sidebar.collapsed .sidebar-toggle svg {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid #e2e8f0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.user-info {
  overflow: hidden;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email {
  font-size: 14px;
  color: #718096;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .user-info {
  display: none;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fed7d7;
  color: #c53030;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #fc8181;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(252, 129, 129, 0.3);
}

.logout-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon svg {
  width: 100%;
  height: 100%;
}

.sidebar.collapsed .logout-btn span {
  display: none;
}

.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 14px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    z-index: 1000;
  }

  .sidebar.collapsed {
    transform: translateX(0);
    width: 280px;
  }

  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .sidebar.collapsed {
    width: 100%;
  }

  .logo-text {
    font-size: 18px;
  }
}
</style>

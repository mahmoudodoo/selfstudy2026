<template>
  <div class="default-layout">
    <!-- Only show SideNav if user is authenticated -->
    <SideNav v-if="authStore.isAuthenticated" />

    <main :class="['main-content', { 'with-sidenav': authStore.isAuthenticated }]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideNav from '@/components/SideNav.vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.main-content.with-sidenav {
  margin-left: 250px; /* Adjust based on SideNav width */
}

@media (max-width: 768px) {
  .main-content.with-sidenav {
    margin-left: 0;
    padding: 15px;
  }
}
</style>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <NuxtLink to="/" class="logo">
          <span class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[rgb(var(--color-primary))]"><path d="M12 3c-1.5 0-2.7.4-3.6 1.1-.9.7-1.4 1.7-1.4 2.9 0 1.2.4 2.1 1.1 2.8.3.3.7.6 1.2.8l-1.1 4.3c-.1.5.3.9.8.9h5.4c.5 0 .9-.4.8-.9l-1.1-4.3c.5-.2.9-.5 1.2-.8.7-.7 1.1-1.6 1.1-2.8 0-1.2-.5-2.2-1.4-2.9-.9-.7-2.1-1.1-3.6-1.1z"/><path d="M6 17v2"/><path d="M18 17v2"/></svg>
          </span>
          <span class="logo-text">AI Blog Studio</span>
        </NuxtLink>
        <nav class="nav">
          <NuxtLink to="/" class="nav-link" active-class="active">首页</NuxtLink>
          <NuxtLink to="/blog" class="nav-link" active-class="active">博客</NuxtLink>
          <NuxtLink to="/console" class="nav-link" active-class="active">控制台</NuxtLink>
          <a href="#" class="nav-link">关于</a>
        </nav>
        <div class="header-actions">
          <ThemeSwitcher />
          <NuxtLink to="/console" class="btn btn-primary">
            <span>开始写作</span>
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue'
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(var(--color-background), 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(var(--color-border), 0.5);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--color-text));
  transition: transform 0.15s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  padding: 10px 16px;
  border-radius: 8px;
  color: rgb(var(--color-text-muted));
  font-weight: 500;
  font-size: 15px;
  transition: all 0.15s ease;
}

.nav-link:hover {
  color: rgb(var(--color-text));
  background: rgba(var(--color-primary), 0.1);
}

.nav-link.active {
  color: rgb(var(--color-text));
  background: rgba(var(--color-primary), 0.15);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.btn-secondary {
  background: transparent;
  color: rgb(var(--color-text));
  border: 1px solid rgb(var(--color-border));
}

.btn-secondary:hover {
  background: rgb(var(--color-surface));
  border-color: rgb(var(--color-text-muted));
}

.btn-primary {
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  color: white;
  box-shadow: 0 4px 15px rgba(var(--color-primary), 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary), 0.5);
}

.btn-icon {
  font-size: 18px;
  transition: transform 0.15s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(3px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}
</style>

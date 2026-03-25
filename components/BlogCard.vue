<template>
  <article class="blog-card">
    <div class="card-image">
      <div class="image-placeholder" :style="{ background: gradient }">
        <span class="image-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </span>
      </div>
      <div class="card-badge" v-if="isFeatured">精选</div>
    </div>
    <div class="card-content">
      <div class="card-meta">
        <span class="card-category">{{ category }}</span>
        <span class="card-date">{{ date }}</span>
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-excerpt">{{ excerpt }}</p>
      <div class="card-footer">
        <div class="author">
          <div class="author-avatar" :style="{ background: authorColor }">
            {{ authorInitial }}
          </div>
          <span class="author-name">{{ author }}</span>
        </div>
        <div class="card-stats">
          <span class="stat">
            <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ views }}
          </span>
          <span class="stat">
            <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ comments }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  title: string
  excerpt: string
  category: string
  date: string
  author: string
  views: number
  comments: number
  isFeatured?: boolean
  emoji?: string
  gradient?: string
}

const props = withDefaults(defineProps<Props>(), {
  isFeatured: false,
  emoji: '',
  gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
})

const authorColor = computed(() => {
  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #f97316)'
  ]
  const index = props.author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
})

const authorInitial = computed(() => props.author[0].toUpperCase())
</script>

<style scoped>
.blog-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(99, 102, 241, 0.5);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-normal);
}

.blog-card:hover .image-placeholder {
  transform: scale(1.05);
}

.image-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, var(--color-accent), #f43f5e);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-content {
  padding: 24px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-category {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-date {
  color: var(--color-text-muted);
  font-size: 13px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-excerpt {
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.author-name {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.stat-icon {
  font-size: 16px;
}
</style>

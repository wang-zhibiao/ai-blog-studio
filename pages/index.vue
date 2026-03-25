<template>
  <div class="home-page">
    <AppHeader />

    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <FaIcon icon="rocket" class="badge-icon" />
            <span>100% 本地优先</span>
          </div>
          <h1 class="hero-title">
            用 <span class="gradient-text">本地 AI</span><br>
            写博客，更自由
          </h1>
          <p class="hero-description">
            完全本地运行的博客写作工具。支持本地大模型、本地文件存储，
            也可免费托管到 GitHub/Gitee，数据永远由你掌控。
          </p>
          <div class="hero-actions">
            <NuxtLink to="/console" class="btn btn-primary btn-large">
              <span>进入控制台</span>
              <span class="btn-icon">→</span>
            </NuxtLink>
            <button class="btn btn-secondary btn-large">
              <span>查看文档</span>
            </button>
          </div>
          <div class="hero-features">
            <div class="mini-feature">
              <FaIcon icon="floppy-disk" class="mini-icon" />
              <span>本地存储</span>
            </div>
            <div class="mini-feature">
              <FaIcon icon="robot" class="mini-icon" />
              <span>本地 AI</span>
            </div>
            <div class="mini-feature">
              <FaIcon :icon="['fab', 'github']" class="mini-icon" />
              <span>GitHub/Gitee</span>
            </div>
            <div class="mini-feature">
              <FaIcon icon="lock-open" class="mini-icon" />
              <span>完全开源</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="card-header-bar">
              <span class="window-dot"></span>
              <span class="window-dot"></span>
              <span class="window-dot"></span>
            </div>
            <div class="card-content">
              <div class="editor-line title-line"></div>
              <div class="editor-line"></div>
              <div class="editor-line short"></div>
              <div class="editor-line"></div>
              <div class="editor-line medium"></div>
            </div>
            <div class="ai-badge">
              <FaIcon icon="wand-magic-sparkles" class="text-xl" />
              <span>本地 AI 写作中</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="core-features">
      <div class="container">
        <div class="section-header-center">
          <h2 class="section-title">核心优势</h2>
          <p class="section-description">重新定义博客写作体验</p>
        </div>
        <div class="core-features-grid">
          <div class="core-feature-card">
            <div class="feature-icon-wrapper local">
              <FaIcon icon="floppy-disk" class="feature-icon" />
            </div>
            <h3 class="feature-title">本地文件存储</h3>
            <p class="feature-description">
              文章直接存储在本地文件夹，Markdown 格式，随时可访问，不依赖任何云服务。
            </p>
          </div>
          <div class="core-feature-card">
            <div class="feature-icon-wrapper ai">
              <FaIcon icon="robot" class="feature-icon" />
            </div>
            <h3 class="feature-title">本地大模型</h3>
            <p class="feature-description">
              支持接入本地运行的 LLM，AI 写作完全离线，保护隐私，无需付费 API。
            </p>
          </div>
          <div class="core-feature-card">
            <div class="feature-icon-wrapper git">
              <FaIcon :icon="['fab', 'github']" class="feature-icon" />
            </div>
            <h3 class="feature-title">免费托管</h3>
            <p class="feature-description">
              一键同步到 GitHub 或 Gitee，利用 Pages 服务免费部署你的博客网站。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="section-header-center">
          <h2 class="section-title">完整功能</h2>
          <p class="section-description">专业级的写作工具链</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-small"><FaIcon icon="pen-to-square" /></div>
            <h3 class="feature-title-small">富文本编辑器</h3>
            <p class="feature-description-small">所见即所得的 SunEditor，Markdown 与 HTML 完美兼容</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-small"><FaIcon icon="palette" /></div>
            <h3 class="feature-title-small">多主题切换</h3>
            <p class="feature-description-small">五种精心设计的主题配色，打造舒适写作环境</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-small">🔄</div>
            <h3 class="feature-title-small">多仓库管理</h3>
            <p class="feature-description-small">本地、GitHub、Gitee 自由切换，灵活管理</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-small"><FaIcon icon="wand-magic-sparkles" /></div>
            <h3 class="feature-title-small">AI 智能续写</h3>
            <p class="feature-description-small">灵感枯竭时，AI 帮你继续创作</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-small"><FaIcon icon="bullseye" /></div>
            <h3 class="feature-title-small">智能润色</h3>
            <p class="feature-description-small">AI 帮你优化表达，提升文章质量</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-small"><FaIcon icon="pen-to-square" /></div>
            <h3 class="feature-title-small">摘要生成</h3>
            <p class="feature-description-small">一键生成文章摘要，SEO 更轻松</p>
          </div>
        </div>
      </div>
    </section>

    <section class="workflow">
      <div class="container">
        <div class="section-header-center">
          <h2 class="section-title">简单三步</h2>
          <p class="section-description">从写作到发布，一气呵成</p>
        </div>
        <div class="workflow-steps">
          <div class="workflow-step">
            <div class="step-number">1</div>
            <h3 class="step-title">本地写作</h3>
            <p class="step-description">在本地编辑器中创作，文件实时保存到你的电脑</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="workflow-step">
            <div class="step-number">2</div>
            <h3 class="step-title">AI 辅助</h3>
            <p class="step-description">用本地大模型续写、润色，让文章更精彩</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="workflow-step">
            <div class="step-number">3</div>
            <h3 class="step-title">一键发布</h3>
            <p class="step-description">推送到 GitHub/Gitee，自动部署为博客网站</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">准备好开始了吗？</h2>
          <p class="cta-description">本地优先，数据自由。开启你的博客写作新体验。</p>
          <NuxtLink to="/console" class="btn btn-primary btn-large">
            <span>立即开始</span>
            <span class="btn-icon">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <FaIcon icon="bolt" class="logo-icon" />
              <span class="logo-text">AI Blog Studio</span>
            </div>
            <p class="footer-description">本地优先的博客写作工具</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>产品</h4>
              <a href="#">功能</a>
              <a href="#">文档</a>
              <a href="#">GitHub</a>
            </div>
            <div class="footer-column">
              <h4>资源</h4>
              <a href="#">教程</a>
              <a href="#">示例</a>
              <a href="#">社区</a>
            </div>
            <div class="footer-column">
              <h4>关于</h4>
              <a href="#">愿景</a>
              <a href="#">贡献</a>
              <a href="#">许可证</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 AI Blog Studio. 开源 · 自由</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.hero {
  padding: 80px 0 100px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(var(--color-primary), 0.15), transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(var(--color-secondary), 0.1), transparent 50%);
  pointer-events: none;
}

.hero .container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--color-success), 0.15);
  border: 1px solid rgba(var(--color-success), 0.3);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--color-success));
  margin-bottom: 24px;
}

.badge-icon {
  font-size: 18px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  color: rgb(var(--color-text));
}

.gradient-text {
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  line-height: 1.8;
  color: rgb(var(--color-text-muted));
  margin-bottom: 32px;
  max-width: 560px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
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
  color: rgb(var(--color-text-inverse));
  box-shadow: 0 4px 15px rgba(var(--color-primary), 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary), 0.5);
}

.btn-icon {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(3px);
}

.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.mini-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--color-text));
}

.mini-icon {
  font-size: 16px;
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.card-header-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.window-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(var(--color-surface-light));
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-line {
  height: 12px;
  background: rgb(var(--color-surface-light));
  border-radius: 6px;
}

.editor-line.title-line {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  opacity: 0.3;
}

.editor-line.short {
  width: 40%;
}

.editor-line.medium {
  width: 70%;
}

.ai-badge {
  position: absolute;
  bottom: -16px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  color: rgb(var(--color-text-inverse));
  padding: 12px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 8px 20px rgba(var(--color-primary), 0.4);
}

.ai-badge span:first-child {
  font-size: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.core-features {
  padding: 100px 0;
  background: rgba(var(--color-surface), 0.5);
}

.section-header-center {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: rgb(var(--color-text));
}

.section-description {
  font-size: 18px;
  color: rgb(var(--color-text-muted));
}

.core-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.core-feature-card {
  text-align: center;
  padding: 40px 32px;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 24px;
  transition: all 0.3s ease;
}

.core-feature-card:hover {
  transform: translateY(-8px);
  border-color: rgb(var(--color-primary));
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.feature-icon-wrapper.local {
  background: linear-gradient(135deg, rgba(var(--color-primary), 0.2), rgba(var(--color-primary), 0.1));
}

.feature-icon-wrapper.ai {
  background: linear-gradient(135deg, rgba(var(--color-secondary), 0.2), rgba(var(--color-secondary), 0.1));
}

.feature-icon-wrapper.git {
  background: linear-gradient(135deg, rgba(var(--color-success), 0.2), rgba(var(--color-success), 0.1));
}

.feature-icon {
  font-size: 40px;
}

.feature-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: rgb(var(--color-text));
}

.feature-description {
  font-size: 15px;
  line-height: 1.8;
  color: rgb(var(--color-text-muted));
}

.features {
  padding: 100px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  text-align: center;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--color-primary), 0.5);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon-small {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-title-small {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: rgb(var(--color-text));
}

.feature-description-small {
  font-size: 14px;
  line-height: 1.7;
  color: rgb(var(--color-text-muted));
}

.workflow {
  padding: 100px 0;
  background: rgba(var(--color-surface), 0.5);
}

.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.workflow-step {
  flex: 1;
  text-align: center;
  padding: 40px 32px;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 24px;
  max-width: 300px;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  color: rgb(var(--color-text-inverse));
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.step-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: rgb(var(--color-text));
}

.step-description {
  font-size: 14px;
  line-height: 1.7;
  color: rgb(var(--color-text-muted));
}

.step-arrow {
  font-size: 32px;
  color: rgb(var(--color-primary));
  font-weight: 300;
}

.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, rgba(var(--color-primary), 0.2), rgba(var(--color-secondary), 0.2));
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  color: rgb(var(--color-text));
}

.cta-description {
  font-size: 18px;
  color: rgb(var(--color-text-muted));
  margin-bottom: 40px;
}

.footer {
  padding: 80px 0 40px;
  border-top: 1px solid rgba(var(--color-border), 0.5);
  background: rgb(var(--color-background));
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: 80px;
  margin-bottom: 48px;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--color-text));
  margin-bottom: 12px;
}

.footer-brand .logo-icon {
  font-size: 24px;
}

.footer-brand .logo-text {
  background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: rgb(var(--color-text-muted));
  font-size: 15px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-column h4 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--color-text-muted));
  margin-bottom: 16px;
}

.footer-column a {
  display: block;
  color: rgb(var(--color-text));
  font-size: 15px;
  margin-bottom: 12px;
  transition: color 0.2s ease;
}

.footer-column a:hover {
  color: rgb(var(--color-primary));
}

.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid rgba(var(--color-border), 0.5);
  text-align: center;
  color: rgb(var(--color-text-muted));
  font-size: 14px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}
</style>

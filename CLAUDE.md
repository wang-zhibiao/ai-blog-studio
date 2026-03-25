# AI Blog Studio - Claude 开发指令

## 项目概述

AI Blog Studio 是一个集博客编写后台、博客网站于一体，并能连接 AI 大模型的现代化博客工作室。

- **技术栈**: Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS
- **UI库**: Element Plus
- **编辑器**: SunEditor (富文本), md-editor-v3 (Markdown)
- **状态管理**: Pinia

## 强制规则

### 1. UI/UX 开发必须使用 ui-ux-pro-max Skill

**每次进行界面开发时，必须按照以下流程使用 ui-ux-pro-max skill：**

```bash
# 步骤 1: 生成设计系统（必须）
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <行业> <风格关键词>" --design-system -p "<项目名称>"

# 步骤 2: 补充详细搜索（按需）
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<关键词>" --domain <domain>

# 步骤 3: 技术栈指南
cd /Users/admin/Documents/work-code/ai-blog-studio && python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<关键词>" --stack html-tailwind
```

### 2. 设计检查清单（交付前必须检查）

- [ ] **无 Emoji 图标** - 使用 SVG 图标（Heroicons/Lucide）
- [ ] **正确的品牌 Logo** - 从 Simple Icons 获取
- [ ] `cursor-pointer` - 所有可点击元素
- [ ] 悬停状态 - 提供视觉反馈（颜色/阴影/边框）
- [ ] 平滑过渡 - `transition-colors duration-200`
- [ ] 焦点状态 - 键盘导航可见
- [ ] 文本对比度 - 符合 WCAG 标准（4.5:1）
- [ ] 暗黑模式支持
- [ ] 响应式设计（375px, 768px, 1024px, 1440px）
- [ ] 无水平滚动条（移动端）
- [ ] 图片有 alt 文本
- [ ] 表单输入有 label
- [ ] `prefers-reduced-motion` 支持

### 3. Light/Dark 模式颜色规范

**Light Mode:**
- 玻璃卡片: `bg-white/80` 或更高透明度
- 正文文本: `#0F172A` (slate-900)
- 弱化文本: `#475569` (slate-600) 最低
- 边框: `border-gray-200`

**Dark Mode:**
- 使用主题变量 `--color-primary`, `--color-secondary`
- 确保对比度足够

### 4. 布局规范

- **浮动导航栏**: `top-4 left-4 right-4` 间距
- **内容最大宽度**: `max-w-6xl` 或 `max-w-7xl`
- **固定导航栏高度**: 确保内容不被遮挡
- **一致的容器宽度**: 不要混用不同宽度

### 5. 图标规范

- 使用 **Heroicons** 或 **Lucide** 图标
- 固定 viewBox `24x24`
- 统一尺寸 `w-6 h-6`
- **绝不使用 Emoji 作为 UI 图标**

## 常用命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生成静态站点
npm run generate

# 预览生产版本
npm run preview
```

## 项目结构速查

```
ai-blog-studio/
├── components/              # 组件目录
│   ├── layout/             # 布局组件
│   ├── editor/             # 编辑器组件
│   ├── article/            # 文章组件
│   ├── console/            # 控制台组件
│   └── settings/           # 设置组件
├── pages/                  # 页面
│   ├── index.vue          # 首页
│   └── console/           # 控制台
├── stores/                 # Pinia Store
├── composables/            # 组合式函数
├── server/                 # 服务端代码
├── types/                  # TypeScript 类型
└── utils/                  # 工具函数
```

## 记忆文件位置

项目记忆保存在:
`/Users/admin/.claude/projects/-Users-admin-Documents-work-code-ai-blog-studio/memory/MEMORY.md`

## 注意事项

1. **必须**在每次 UI 开发前运行设计系统生成命令
2. **必须**在交付前完成设计检查清单
3. **绝不**使用 Emoji 作为图标
4. **始终**考虑暗黑模式
5. **始终**测试响应式布局

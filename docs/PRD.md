# 公众号 Markdown 编辑器 — 重构 PRD

> 版本：v2.0 | 更新日期：2026-04-16
> 分支：fix-wechat-darkmode-quotes（基于当前分支，重构完成后合并到 master）

---

## 1. 项目目标

将当前单文件结构（index.html + app.js + styles.js）重构为清晰的 ES6 模块化项目。

**核心约束（不可违背）**：
- 零构建工具（无 Vite/Webpack/npm/package.json）
- 双击 index.html 或本地服务器即可运行
- 保留所有现有功能（18 个主题、智能图片处理、实时预览、一键复制等）
- 保持向后兼容（IndexedDB 数据、localStorage 偏好、img:// 协议格式不变）

---

## 2. 重构原则

1. **保持极致轻量**：无 node_modules，纯前端
2. **ES6 Module 拆分**：使用 `<script type="module">` + `import`/`export`
3. **代码清晰可读**：添加 JSDoc 注释，统一代码风格（const/let、箭头函数、模板字符串）
4. **CSS 变量管理 UI 样式**：编辑器外壳使用 CSS 变量；内容主题保持内联 CSS 字符串格式（微信兼容性）
5. **删除死代码**：移除已废弃的 ImageHostManager（163 行）
6. **用户体验一致**：界面布局、快捷键、功能流程保持不变

---

## 3. 两阶段路线图

### 第一阶段：核心重构 + UI 改进
1. 模块化拆分（app.js → 多个模块）
2. CSS 提取 + CSS 变量体系
3. 右侧操作面板（主题、代码主题、文件、设置）
4. 手机/桌面预览切换
5. 代码块主题选择（内置 6 个热门主题）
6. 编辑区与预览区同步滚动
7. 快捷键支持
8. 字数/阅读时间统计

### 第二阶段：多文件管理 + 高级功能
1. IndexedDB FileStore（多文件存储）
2. 多文件管理 UI
3. 导出格式增强（Markdown / HTML / 纯文本）

---

## 4. 新布局设计

### 4.1 布局变化

```
当前布局:                          新布局:
┌────────┬────────┐                ┌────────┬──────────────────────────┐
│ 编辑器  │ 预览    │                │        │ [主题][代码][文件][⚙️]      │
│        │ [复制]  │                │        │ [📱][🖥️]   [复制到公众号]  │
│        │        │                │ 编辑器  │ ──────────────────────── │
│        │ 预览区  │                │        │                          │
├────────┴────────┤                │        │       预览区              │
│ 主题选择器(横向)  │                │        │                          │
└─────────────────┘                └────────┴──────────────────────────┘
```

### 4.2 预览区顶部工具栏（两行）

**第 1 行（功能导航）**：面板切换按钮
- `[🎨 主题]` `[💻 代码主题]` `[📁 文件]` `[⚙️ 设置]`
- 点击展开/收起对应面板，同一时间只展开一个

**第 2 行（预览控制 + 核心操作）**：
- 左侧：`[📱 手机]` `[🖥️ 桌面]` — 设备预览模式切换
- 右侧：`[复制到公众号]` — 最核心最高频的操作，醒目突出

### 4.3 可展开面板说明

**主题面板**（点击 🎨）：
- 18 个主题按分类分组（经典公众号 / 传统媒体 / 现代数字）
- 已收藏主题置顶
- 主题卡片式选择，当前选中高亮
- 替代现有顶部水平滚动选择器

**代码主题面板**（点击 💻）：
- 6 个内置代码高亮主题卡片
- 每个主题显示代码块预览效果
- 选择后实时更新渲染

**文件面板**（点击 📁）：
- 导入 .md 文件
- 导出 Markdown / HTML / 纯文本
- 清空编辑器
- 第二阶段：多文件列表

**设置面板**（点击 ⚙️）：
- 编辑器偏好（字号、行高、自动保存开关）
- 快捷键说明

---

## 5. 文件结构

```
rico-md/
├── index.html                    # HTML 骨架 + CDN 引入 + CSS 引入
├── js/
│   ├── main.js                   # 入口：创建 Vue 应用，组装所有模块
│   ├── core/
│   │   ├── image-store.js        # ImageStore 类（IndexedDB CRUD）
│   │   ├── image-compressor.js   # ImageCompressor 类（Canvas 压缩）
│   │   ├── markdown-engine.js    # markdown-it 初始化 + CJK 补丁 + 预处理
│   │   ├── paste-handler.js      # TurndownService + 智能粘贴 + 格式检测
│   │   └── render-pipeline.js    # 渲染管线编排（渲染→处理图片→应用样式→分组图片）
│   ├── export/
│   │   └── clipboard-exporter.js # 复制流程 + Grid 转 Table + Base64 + 微信兼容变换
│   ├── ui/
│   │   ├── theme-manager.js      # STYLES 数据、收藏管理、样式查询
│   │   ├── code-themes.js        # 6 个代码高亮主题定义
│   │   ├── toast.js              # Toast 通知工具
│   │   └── panel-manager.js      # 右侧面板状态管理（展开/折叠/切换）
│   └── storage/
│       └── preferences.js        # localStorage 读写：用户偏好、自动保存
├── styles/
│   ├── base.css                  # 重置、CSS 变量、布局、header、toast、滚动条、响应式
│   ├── editor.css                # 编辑器面板、预览面板
│   ├── panel.css                 # 右侧面板样式
│   └── themes.js                 # 18 个内容主题（内联 CSS 字符串，ES Module 导出）
├── assets/
│   ├── icon.svg
│   ├── favicon.svg
│   └── logo.svg
├── docs/
│   ├── PRD.md                    # 本文档
│   └── PROGRESS.md               # 重构进度记录
├── README.md
└── start.sh
```

---

## 6. 模块依赖关系

```
index.html
  → <link> base.css, editor.css, panel.css
  → <script> CDN: Vue 3, markdown-it, highlight.js, TurndownService
  → <script type="module"> js/main.js

js/main.js
  → imports image-store.js         (ImageStore 类)
  → imports image-compressor.js    (ImageCompressor 类)
  → imports markdown-engine.js     (创建 md 实例 + CJK 补丁)
  → imports paste-handler.js       (智能粘贴逻辑)
  → imports render-pipeline.js     (渲染管线)
  → imports clipboard-exporter.js  (复制 + 微信兼容变换)
  → imports theme-manager.js       (主题管理)
  → imports code-themes.js         (代码主题数据)
  → imports toast.js               (Toast 通知)
  → imports panel-manager.js       (面板状态)
  → imports preferences.js         (localStorage 持久化)
  → imports themes.js              (STYLES 主题数据)
  → 创建 Vue 应用，注入所有模块
```

**关键约束**：无循环依赖，所有箭头单向指向 main.js。

### CDN 全局变量使用约定

模块中通过 `window.xxx` 访问 CDN 加载的全局变量：
- `window.markdownit` → markdown-it
- `window.hljs` → highlight.js
- `window.TurndownService` → Turndown
- `window.Vue` → Vue 3

### `this` 上下文解决方案

从 Vue Options API 迁移到 **Composition API** 风格：
- main.js 中使用 `Vue.createApp()` + `setup()` 函数
- 各模块导出纯函数/对象，通过参数传入依赖
- 不再依赖 `this` 访问共享状态，改用闭包和响应式引用

---

## 7. 各模块详细职责

### 7.1 js/core/image-store.js

**来源**：app.js 第 9-213 行（ImageStore 类）

```javascript
/**
 * IndexedDB 图片存储管理器
 * @property {string} dbName - 数据库名称 'WechatEditorImages'（保持不变）
 * @property {string} storeName - 存储名称 'images'
 */
export class ImageStore {
  constructor()
  async init()                    // 初始化 IndexedDB
  async saveImage(id, blob, meta) // 保存图片
  async getImage(id)              // 获取 Object URL（含缓存管理）
  async getImageBlob(id)          // 获取原始 Blob（用于 Base64 转换）
  async deleteImage(id)           // 删除图片
  async getAllImages()             // 获取所有图片列表
  async clearAll()                // 清空所有图片
  async getTotalSize()            // 计算总存储大小
  revokeAll()                     // 释放所有 Object URL（防内存泄漏）
}
```

**改进点**：
- 内部管理 `imageIdToObjectURL` 缓存，不再由 Vue 管理
- 新增 `revokeAll()` 方法，在适当时机释放 Object URL
- 保持原有 dbName、storeName、schema 不变

### 7.2 js/core/image-compressor.js

**来源**：app.js 第 218-313 行（ImageCompressor 类）

```javascript
/**
 * Canvas API 图片压缩器
 * @param {number} maxWidth - 最大宽度 1920px
 * @param {number} maxHeight - 最大高度 1920px
 * @param {number} quality - 压缩质量 0.85
 */
export class ImageCompressor {
  constructor(options = {})
  async compress(file)            // 压缩图片，返回 { blob, originalSize, compressedSize }
  static formatSize(bytes)        // 格式化文件大小
}
```

**无改动**，直接提取。

### 7.3 js/core/markdown-engine.js

**来源**：app.js mounted() 中的 markdown-it 初始化（563-598）+ CJK 补丁（485-504, 1492-1584）

```javascript
/**
 * 创建并配置 markdown-it 实例
 * 包含 CJK 强调符号补丁，必须在实例创建后立即应用
 * @returns {Object} 配置好的 markdown-it 实例
 */
export function createMarkdownEngine()

/**
 * 预处理 Markdown 文本（列表格式规范化等）
 * @param {string} text - 原始 Markdown 文本
 * @returns {string} 处理后的文本
 */
export function preprocessMarkdown(text)
```

**加载顺序约束**：
1. 创建 markdown-it 实例
2. 配置 highlight.js 代码高亮
3. 立即应用 CJK `scanDelims` 补丁
4. 导出实例

### 7.4 js/core/render-pipeline.js

**来源**：app.js 的 renderMarkdown()、processImageProtocol()、applyInlineStyles()、groupConsecutiveImages()

```javascript
/**
 * 渲染管线：Markdown → HTML → 处理图片 → 应用样式 → 分组图片
 * @param {string} markdown - Markdown 文本
 * @param {Object} md - markdown-it 实例
 * @param {Object} imageStore - ImageStore 实例
 * @param {Object} currentStyle - 当前主题样式对象
 * @param {Object} codeTheme - 当前代码主题
 * @returns {Promise<string>} 渲染后的 HTML
 */
export async function renderPipeline({ markdown, md, imageStore, currentStyle, codeTheme })
```

**内部编排**：
1. `preprocessMarkdown(text)` — 文本预处理
2. `md.render(text)` — Markdown 转 HTML
3. `processImageProtocol(html, imageStore)` — 处理 img:// 协议
4. `applyInlineStyles(html, style, codeTheme)` — 应用主题样式
5. `groupConsecutiveImages(html)` — 分组连续图片为网格布局

### 7.5 js/core/paste-handler.js

**来源**：app.js 的 handleSmartPaste()、isMarkdown()、isIDEFormattedHTML()、initTurndownService()

```javascript
/**
 * 创建智能粘贴处理器
 * @param {Object} options - { turndownService, handleImageUpload }
 * @returns {Function} pasteHandler(event, textarea)
 */
export function createPasteHandler(options)
```

### 7.6 js/export/clipboard-exporter.js

**来源**：app.js 的 copyToClipboard()、convertGridToTable()、convertToTable()、convertImageToBase64()、extractBackgroundColor()

```javascript
/**
 * 复制渲染内容到剪贴板（微信兼容格式）
 * 执行：Grid→Table 转换 → 图片 Base64 转换 → section 容器包裹 → 代码块简化 → 列表扁平化
 * @param {Object} options - { previewEl, imageStore, currentStyle, showToast }
 */
export async function copyToWechat(options)

/**
 * 将 Grid 布局转换为 Table 布局（微信兼容）
 */
export function convertGridToTable(html)
```

### 7.7 js/ui/theme-manager.js

**来源**：styles.js 的 STYLES 数据 + app.js 的主题相关方法

```javascript
/**
 * 主题管理器
 * 提供 18 个主题的数据访问、收藏管理、分类查询
 */
export const THEME_CATEGORIES = { ... }     // 主题分类
export function getStyleList()               // 获取主题列表
export function getStyle(key)                // 获取单个主题样式
export function getStyleName(key)            // 获取主题显示名
export function isRecommended(key)           // 是否推荐主题
export function getStarredStyles()           // 从 localStorage 读取收藏
export function saveStarredStyles(list)      // 保存收藏到 localStorage
export function toggleStarStyle(key)         // 切换收藏状态
```

### 7.8 js/ui/code-themes.js

**新增模块**

```javascript
/**
 * 代码高亮主题定义
 * 每个主题包含代码块背景色、文字色、关键字色等
 */
export const CODE_THEMES = {
  'github-light': { name: 'GitHub Light', ... },
  'one-dark':     { name: 'One Dark', ... },
  'monokai':      { name: 'Monokai', ... },
  'dracula':      { name: 'Dracula', ... },
  'solarized':    { name: 'Solarized', ... },
  'night-owl':    { name: 'Night Owl', ... },
}

export function getCodeTheme(key)
export function applyCodeTheme(styleObj, codeTheme)
```

**内置主题**：

| 主题名 | 风格 | 适用场景 |
|--------|------|----------|
| GitHub Light | 浅色，经典 | 技术博客、通用 |
| One Dark | 深色，VS Code 风格 | 代码密集文章 |
| Monokai | 深色，经典编辑器 | 编程教程 |
| Dracula | 深色，紫色调 | 个性风格 |
| Solarized | 浅/深双版本 | 长文阅读 |
| Night Owl | 深色，高对比度 | 夜间阅读 |

### 7.9 js/ui/toast.js

```javascript
export function showToast(message, type = 'info', duration = 3000)
```

### 7.10 js/ui/panel-manager.js

```javascript
/**
 * 右侧面板状态管理
 * 管理哪个面板当前展开（theme / code / file / settings / null）
 */
export function createPanelManager()
```

### 7.11 js/storage/preferences.js

**来源**：app.js 的 loadUserPreferences()、saveUserPreferences()、loadStarredStyles()、saveStarredStyles()

```javascript
export function loadPreferences()           // 从 localStorage 读取所有偏好
export function savePreferences(prefs)      // 保存偏好到 localStorage
export function loadEditorContent()         // 读取编辑器内容
export function saveEditorContent(content)  // 防抖保存编辑器内容
```

**localStorage key 保持不变**：`starredStyles`、`currentStyle`、`markdownInput`

### 7.12 styles/themes.js

**来源**：styles.js 全文，转为 ES Module 导出

```javascript
export const STYLES = { /* 18 个主题 */ }
```

**内容格式不变**：保持内联 CSS 字符串格式（微信兼容性要求）

---

## 8. CSS 变量体系

**仅用于编辑器 UI 外壳**，不用于内容主题。

```css
/* styles/base.css */
:root {
  /* 颜色 */
  --color-bg: #ffffff;
  --color-bg-secondary: #f7f7f7;
  --color-bg-hover: #f0f0f0;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e5e5e5;
  --color-primary: #07c160;
  --color-primary-hover: #06ad56;
  --color-danger: #fa5151;

  /* 布局 */
  --header-height: 48px;
  --toolbar-height: 80px;
  --panel-max-height: 320px;
  --sidebar-width: 280px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;

  /* 预览 */
  --preview-width-mobile: 375px;
  --preview-width-desktop: 720px;
}
```

---

## 9. 新功能详细设计

### 9.1 手机/桌面预览切换

- 预览区第 2 行左侧增加 `[📱 手机]` `[🖥️ 桌面]` 切换按钮
- 手机模式：预览容器宽度 375px，可选带手机外框圆角装饰
- 桌面模式：max-width 720px（默认）
- CSS 变量 `--preview-width` 控制切换，带过渡动画
- 不影响复制内容

### 9.2 编辑区与预览区同步滚动

- 编辑区 textarea 和预览区 content 区域按比例同步滚动
- 根据各自的 `scrollTop / (scrollHeight - clientHeight)` 计算比例
- 用户手动滚动一方时，另一方跟随
- 防抖处理，避免循环触发
- 可通过设置面板关闭

### 9.3 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + S | 保存当前内容 |
| Ctrl/Cmd + B | 插入粗体标记 `**text**` |
| Ctrl/Cmd + I | 插入斜体标记 `*text*` |
| Ctrl/Cmd + K | 插入链接 `[text](url)` |
| Tab | 缩进（插入 2/4 空格） |
| Shift + Tab | 反缩进 |

### 9.4 字数/阅读时间统计

- 编辑器底部状态栏显示
- 统计：总字数（中文按字计、英文按词计）、预计阅读时间（按 300 字/分钟）
- 实时更新（随编辑器内容变化）

---

## 10. 需要删除的代码

| 代码 | 位置 | 原因 |
|------|------|------|
| ImageHostManager 类 | app.js 318-481 行 | 已废弃，无任何调用 |
| 小红书相关代码 | app.js 2008-2430 行 | 暂缓处理，先注释隔离 |
| html2canvas CDN | index.html | 小红书功能依赖，暂保留 |

---

## 11. 数据兼容性要求

| 数据类型 | 存储位置 | 兼容性要求 |
|----------|----------|------------|
| 图片数据 | IndexedDB `WechatEditorImages` | 数据库名、store 名、keyPath 保持不变 |
| 图片 ID 格式 | `img-timestamp-random` | 保持生成格式不变 |
| 收藏的主题 | localStorage `starredStyles` | key 名保持不变 |
| 当前主题 | localStorage `currentStyle` | key 名保持不变 |
| 编辑器内容 | localStorage `markdownInput` | key 名保持不变 |

---

## 12. 实现顺序

按以下顺序逐步实现，每步完成后验证：

1. 创建目录结构
2. 提取 `image-store.js` + `image-compressor.js`（独立类，无依赖）
3. 提取 `markdown-engine.js`（含 CJK 补丁）
4. 提取 `themes.js`（数据转换）
5. 提取 `theme-manager.js`
6. 提取 `render-pipeline.js`（依赖上述模块）
7. 提取 `clipboard-exporter.js`
8. 提取 `paste-handler.js`
9. 提取 `preferences.js` + `toast.js` + `panel-manager.js`
10. 新增 `code-themes.js`
11. 提取 CSS → `base.css` + `editor.css` + `panel.css`
12. 创建 `main.js`（组装 Vue 应用）
13. 重写 `index.html`（新布局 + 面板 + 预览切换）
14. 实现同步滚动
15. 实现快捷键
16. 实现字数统计
17. 删除死代码
18. 全流程验证

---

## 13. 验证清单

- [ ] 18 个主题逐一切换，渲染正确
- [ ] 粘贴图片 → 预览显示 → 复制到公众号 → 图片正确显示
- [ ] **粗体**、*斜体* 在中文文本中正确渲染（CJK 补丁生效）
- [ ] 复制到微信公众号编辑器，所有样式保留
- [ ] 响应式布局：桌面/平板/移动端正常
- [ ] 刷新页面后主题选择和编辑器内容保留
- [ ] 拖拽和选择 .md 文件正常工作
- [ ] 右侧面板展开/折叠流畅
- [ ] 手机/桌面预览模式正确切换
- [ ] 代码主题切换后预览实时更新
- [ ] 编辑区和预览区同步滚动正常
- [ ] 快捷键（Ctrl+B/I/S/K、Tab）正常
- [ ] 字数统计准确
- [ ] Chrome + Firefox + Safari 基本验证
- [ ] 无 console.error 或未捕获异常

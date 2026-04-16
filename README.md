# Rico MD - 公众号 Markdown 编辑器

<div align="center">
  <img src="logo.svg" width="120" height="120" alt="Rico MD">

  一个专为微信公众号设计的 Markdown 编辑器

  [![在线体验](https://md.uiineed.com)](https://md.uiineed.com)
  [![GitHub](https://img.shields.io/badge/GitHub-源代码-000?style=for-the-badge&logo=github)](https://github.com/ricocc/rico-md)
  [![个人网站](https://img.shields.io/badge/个人网站-ricoui.com-0066FF?style=for-the-badge)](https://ricoui.com)
</div>

> 本项目基于 [huasheng_editor](https://github.com/alchaincyf/huasheng_editor) 进行二次开发

## 🌟 在线体验

👉 **[https://md.uiineed.com](https://md.uiineed.com)**

## ✨ 功能特点

### 🎨 18 种精美样式
- **经典公众号系列**：默认、技术、优雅、深度阅读
- **传统媒体系列**：杂志风格、纽约时报、金融时报、Jony Ive
- **现代数字系列**：Wired 连线、Medium 长文、Apple 极简、Anthropic Claude、AI Coder 特调

### 📸 智能图片处理（⭐ 核心功能）
- **智能粘贴**：支持从任何地方粘贴图片（截图、浏览器、文件管理器）
- **自动压缩**：图片自动压缩到合理大小（最高压缩 80%+）
- **本地存储**：使用 IndexedDB 持久化存储，刷新不丢失
- **编辑友好**：编辑器中使用短链接（`img://img-xxx`），不会卡顿
- **多图网格**：2-3 列自动排版，类似朋友圈
- **完美兼容**：复制到公众号时自动转 Base64

### 🚀 强大功能
- **实时预览**：左侧编辑，右侧即时查看效果
- **一键复制**：直接粘贴到公众号编辑器，格式完美保留
- **智能粘贴**：支持从飞书、Notion、Word 等富文本应用直接粘贴
- **图片拖拽**：支持拖拽图片文件到编辑器
- **样式收藏**：收藏常用样式，快速切换
- **文件上传**：支持 .md / .markdown 文件
- **代码高亮**：优雅的代码块展示，支持多种语言
- **可调布局**：拖拽分割线调整各区域宽度
- **响应式设计**：完美适配桌面、平板、手机

## 📖 使用指南

### 快速开始
1. 访问 [在线编辑器](https://md.uiineed.com)
2. 在左侧输入或粘贴 Markdown 内容
3. 选择喜欢的样式主题
4. 点击「复制到公众号」
5. 粘贴到微信公众号编辑器

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/ricocc/rico-md.git

# 进入目录
cd rico-md

# 启动本地服务器（Python）
python3 -m http.server 8080

# 或使用提供的脚本
./start.sh

# 访问 http://localhost:8080
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式前端框架
- **Markdown-it** - 强大的 Markdown 解析器
- **Highlight.js** - 代码语法高亮
- **IndexedDB** - 本地图片持久化存储
- **Canvas API** - 客户端图片压缩
- **Turndown** - HTML 转 Markdown（智能粘贴）
- **纯 CSS** - 无需构建工具，开箱即用

## 📂 项目结构

```
rico-md/
├── index.html           # 主页面
├── assets/               # 静态资源
│   ├── scripts/         # JavaScript 模块
│   │   ├── main.js      # Vue 应用入口
│   │   ├── core/        # 核心功能
│   │   │   ├── render-pipeline.js   # 渲染管线
│   │   │   ├── markdown-engine.js   # Markdown 引擎
│   │   │   ├── image-store.js       # 图片存储
│   │   │   ├── image-compressor.js  # 图片压缩
│   │   │   └── paste-handler.js     # 粘贴处理
│   │   ├── ui/          # UI 组件
│   │   ├── export/      # 导出功能
│   │   └── storage/     # 本地存储
│   ├── styles/         # 样式文件
│   │   ├── base.css    # 基础样式
│   │   ├── editor.css # 编辑器样式
│   │   ├── panel.css  # 面板样式
│   │   └── themes/    # 主题配置
│   └── images/         # 图片资源
│       ├── favicon.svg
│       ├── logo.svg
│       └── icon.svg
├── docs/               # 文档
│   ├── PRD.md         # 产品需求文档
│   ├── PROGRESS.md    # 开发进度
│   ├── CHANGELOG.md   # 更新日志
│   └── CONTRIBUTING.md # 贡献指南
├── start.sh            # 启动脚本
├── README.md          # 项目说明
└── LICENSE            # 开源许可证
```

## 💡 核心特性

### ⭐ 图片处理系统

**技术架构**：
```
用户粘贴图片
    ↓
Canvas API 压缩（最大 1920px，质量 85%）
    ↓
IndexedDB 持久化存储
    ↓
编辑器显示短链接（img://img-xxx）
    ↓
预览区从 IndexedDB 加载显示
    ↓
复制时自动转 Base64
```

**核心优势**：
- ✅ **100% 成功率**：不依赖外部图床，完全本地化
- ✅ **编辑器流畅**：短链接不会造成卡顿
- ✅ **刷新不丢失**：IndexedDB 持久化存储
- ✅ **智能压缩**：平均压缩 50%-80%
- ✅ **跨平台支持**：支持截图、浏览器、文件管理器等所有粘贴来源

**多图网格布局**：
- 连续 2 张图片：并排两列展示
- 连续 3 张图片：一行三列展示
- 连续 4 张图片：2×2 网格
- 5 张及以上：3 列网格布局

### 公众号完美兼容
- ✅ 自动将 CSS Grid 转换为 Table 布局
- ✅ 所有样式转为内联样式
- ✅ 图片自动转 Base64
- ✅ 强制样式优先级（!important）

### 推荐样式
- **Anthropic Claude** - 优雅的技术文档风格
- **金融时报** - 专业的财经风格
- **纽约时报** - 经典的新闻风格
- **技术风格** - 程序员最爱

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 如何贡献
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 添加新样式
1. 在 `styles/themes/` 中添加新的主题配置文件
2. 在 `styles/themes/index.js` 中注册主题
3. 确保包含所有必需的元素样式
4. 测试各种 Markdown 元素的渲染效果

## 👨‍💻 作者

**Rico**
- 🌐 个人网站：[https://ricoui.com](https://ricoui.com)
- 💻 GitHub：[@ricocc](https://github.com/ricocc)

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

你可以自由地：
- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私有使用

## 🙏 致谢

- 感谢原项目 [huasheng_editor](https://github.com/alchaincyf/huasheng_editor) 的作者花生


## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ricocc/rico-md&type=Date)](https://star-history.com/#ricocc/rico-md&Date)

---

<div align="center">
  Made with ❤️ by <a href="https://ricoui.com">Rico</a>
  <br>
  如果觉得有用，请给个 ⭐️ Star 支持一下！
</div>
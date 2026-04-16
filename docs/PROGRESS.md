# 重构进度记录

> 开始日期：2026-04-16

## 完成的模块

### 核心模块 (js/core/)
- [x] image-store.js — ImageStore 类（IndexedDB CRUD + URL 缓存 + revokeAll）
- [x] image-compressor.js — ImageCompressor 类（Canvas API 压缩）
- [x] markdown-engine.js — markdown-it 初始化 + CJK scanDelims 补丁
- [x] paste-handler.js — TurndownService + 智能粘贴 + IDE/Markdown 检测
- [x] render-pipeline.js — 渲染管线编排（预处理→渲染→图片→样式→网格）

### 导出模块 (js/export/)
- [x] clipboard-exporter.js — 复制到微信（Grid→Table + Base64 + 深色模式适配）

### UI 模块 (js/ui/)
- [x] theme-manager.js — 18 个主题分类管理、收藏、查询
- [x] code-themes.js — 6 个代码高亮主题（GitHub Light/One Dark/Monokai/Dracula/Solarized/Night Owl）
- [x] toast.js — Toast 通知
- [x] panel-manager.js — 右侧面板状态管理

### 存储模块 (js/storage/)
- [x] preferences.js — localStorage 持久化（防抖保存）

### 样式 (styles/)
- [x] base.css — CSS 变量体系 + 重置 + 布局 + 响应式
- [x] editor.css — 编辑器面板 + 预览面板
- [x] panel.css — 右侧面板 + 主题卡片 + 代码主题 + 文件操作

### 主题 (styles/themes/)
- [x] 18 个独立主题文件（每个主题一个 .js）
- [x] index.js 汇总入口

### 入口
- [x] js/main.js — Vue 3 Composition API 入口
- [x] index.html — 新布局（右侧面板 + 手机/桌面切换）

## 新功能（已集成到 main.js）
- [x] 编辑区与预览区同步滚动（可关闭）
- [x] 快捷键（Ctrl+S/B/I/K、Tab）
- [x] 字数/阅读时间统计
- [x] 手机/桌面预览切换
- [x] 代码块主题选择（6 个内置主题）
- [x] 右侧面板（主题/代码/文件/设置）

## 已删除的代码
- [x] ImageHostManager（163 行死代码）
- [x] 小红书相关代码（暂注释保留）
- [x] 内联 CSS（已提取到外部文件）

## 待验证
- [ ] 启动本地服务器测试
- [ ] 18 个主题渲染验证
- [ ] 图片粘贴→预览→复制流程
- [ ] 中文 **粗体** *斜体* 渲染（CJK 补丁）
- [ ] 复制到微信公众号兼容性
- [ ] 响应式布局
- [ ] 快捷键功能
- [ ] 同步滚动

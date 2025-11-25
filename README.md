# Obsidian EditorJS Plugin

一个功能强大的 Obsidian 插件，将 Editor.js 富文本编辑器集成到 Obsidian 中，提供 34 种专业编辑工具和完整的 Markdown 双向转换。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性

- 🎨 **34 种编辑工具** - 从基础到高级，满足所有编辑需求
- 🔄 **完整 Markdown 转换** - 无损双向转换，完全兼容 Obsidian
- ⌨️ **丰富快捷键** - 提升编辑效率
- 🎯 **拖拽排序** - 直观的块管理
- ↩️ **撤销/重做** - 完整的编辑历史
- 💾 **自动保存** - 实时同步到 Markdown
- 🎨 **主题适配** - 支持 Obsidian 所有主题

## 🚀 快速开始

### 安装

#### 方式一：手动安装（推荐）
1. 从 [Releases](https://github.com/springrain1/obsidian-editorjs-plugin/releases) 下载最新版本
2. 解压文件到 Obsidian 插件文件夹：`<vault>/.obsidian/plugins/obsidian-editorjs-plugin/`
3. 重启 Obsidian 或重新加载插件
4. 在设置中启用 "EditorJS Plugin"

#### 方式二：从源码构建
```bash
git clone https://github.com/springrain1/obsidian-editorjs-plugin.git
cd obsidian-editorjs-plugin
npm install
npm run build
```

### 使用

1. 打开任意 Markdown 文件
2. 右键点击编辑器，选择 "打开为富文本"
3. 或使用命令面板（Ctrl+P）搜索 "EditorJS"
4. 开始编辑！

## 📚 文档

- **[快速参考](./docs/QUICK_REFERENCE.md)** - 快捷键和常用语法
- **[插件指南](./docs/PLUGINS_GUIDE.md)** - 所有工具的详细说明
- **[测试指南](./docs/TESTING_GUIDE.md)** - 如何测试所有功能
- **[功能总结](./docs/FEATURES_SUMMARY.md)** - 完整功能列表
- **[技术细节](./docs/FINAL_SOLUTION.md)** - 实现原理和解决方案

## 🎯 核心功能

### 块工具（20 种）
- 标题、列表、表格、代码、引用、图片
- Alert 提示框、按钮、折叠块
- 数学公式、多列布局、个性化引用
- 分隔符、警告框、嵌入内容、链接卡片、附件

### 行内工具（11 种）
- 加粗、斜体、下划线、删除线
- 高亮、行内代码、超链接
- 文本颜色、剧透遮罩、工具提示、大小写转换

### 块调整工具（4 种）
- 脚注、文本对齐、自定义样式、文本变体

### 实用功能
- 撤销/重做（Ctrl+Z/Y）
- 拖拽排序
- 自动保存
- 快捷键支持

## ⌨️ 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `/` | 打开工具菜单 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+B` | 加粗 |
| `Ctrl+I` | 斜体 |
| `Ctrl+U` | 下划线 |
| `Ctrl+Shift+M` | 行内代码 |

更多快捷键请查看 [快速参考](QUICK_REFERENCE.md)

## 🎨 支持的 Markdown 语法

### Obsidian Callout
```markdown
> [!info] 信息
> 这是一个信息提示框
```

### 折叠块
```markdown
<details>
<summary>点击展开</summary>
隐藏的内容
</details>
```

### 数学公式
```markdown
$$
E=mc^2
$$
```

### 脚注
```markdown
这是文本[^1]

[^1]: 这是脚注
```

### 双链和嵌入
```markdown
[[链接到其他笔记]]
![[嵌入其他笔记]]
```

## 🔧 开发

### 环境要求
- Node.js 16+
- npm 或 yarn

### 构建

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

### 项目结构
```
obsidian-editorjs-plugin/
├── src/
│   ├── main.ts              # 插件入口
│   ├── views/
│   │   └── EditorJSView.ts  # 编辑器视图
│   ├── converters/
│   │   ├── MarkdownToBlocks.ts  # Markdown → JSON
│   │   └── BlocksToMarkdown.ts  # JSON → Markdown
│   ├── settings/
│   │   └── SettingsManager.ts   # 设置管理
│   └── types/
│       └── editorjs-plugins.d.ts # 类型定义
├── main.js                  # 编译输出
├── manifest.json            # 插件清单
└── package.json             # 依赖配置
```

## 📊 性能指标

- **编译时间**：~8 秒
- **插件大小**：~1.1 MB（已优化）
- **启动时间**：< 1 秒
- **内存占用**：< 50 MB
- **支持的块类型**：34 种
- **支持的快捷键**：15+ 个
- **Markdown 转换**：毫秒级响应

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南
1. Fork 本仓库
2. 创建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2024-11-11)
- ✅ 初始版本发布
- ✅ 集成 34 个 Editor.js 插件
- ✅ 完整的 Markdown 双向转换
- ✅ 撤销/重做功能
- ✅ 拖拽排序
- ✅ 自动保存
- ✅ 完整的快捷键支持
- ✅ 优化性能，移除调试日志
- ✅ 完善错误处理机制

## 🐛 已知问题

目前没有已知的严重问题。如果遇到问题，请提交 [Issue](https://github.com/springrain1/obsidian-editorjs-plugin/issues)。

### 注意事项
- 某些第三方 Editor.js 插件可能使用 `eval()`，这是插件本身的实现方式，不影响功能
- 大型文档（100+ 块）建议分段编辑以获得最佳性能
- Layout 工具在某些主题下可能需要微调样式

## 📄 许可证

MIT License

## 🙏 致谢

本插件基于以下优秀项目：
- [Editor.js](https://editorjs.io/) - 核心编辑器
- [Obsidian](https://obsidian.md/) - 知识管理平台
- 所有 Editor.js 插件的作者们

## 📞 支持

- 📖 查看 [文档](QUICK_REFERENCE.md)
- 🐛 提交 [Issue](https://github.com/springrain1/obsidian-editorjs-plugin/issues)
- 💬 加入讨论
- ⭐ 如果觉得有用，请给个 Star！

## 🔒 安全性

- 所有数据保存在本地 Vault 中
- 不收集任何用户数据
- 不需要网络连接（图片上传除外）
- 开源代码，可审计

## 🌟 为什么选择这个插件？

- **无缝集成**：完美融入 Obsidian 工作流
- **功能丰富**：34 种工具满足各种编辑需求
- **数据安全**：完全本地化，Markdown 格式存储
- **持续维护**：活跃开发，快速响应问题
- **开源免费**：MIT 许可证，自由使用

---

**享受富文本编辑的乐趣！** 🎉

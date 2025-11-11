# Obsidian Editor.js 插件 - 功能总结

## 🎯 核心功能

### 1. 富文本编辑器
- 基于 Editor.js 的块状编辑器
- 支持 34+ 种内容块类型
- 拖拽排序、撤销/重做
- 实时自动保存

### 2. Markdown 双向转换
- **无损转换**：JSON ↔ Markdown
- **Obsidian 兼容**：支持双链、嵌入、Callout
- **智能解析**：自动识别块类型
- **降级支持**：无 JSON 时从 Markdown 解析

### 3. Obsidian 集成
- 右键菜单切换视图
- 命令面板支持
- 主题自适应（亮色/暗色）
- 多语言支持（中文/英文）

## 📦 已安装插件（34个）

### 基础内容块
| 插件 | 功能 | Markdown 支持 |
|------|------|--------------|
| Header | 标题（H1-H6） | `# 标题` |
| Paragraph | 段落 | 纯文本 |
| Nested List | 嵌套列表 | `- 项目`（4空格缩进） |
| Checklist | 任务列表 | `- [ ] 任务` |
| Table | 表格 | `\| 列1 \| 列2 \|` |
| Code | 代码块 | ` ```语言 ``` ` |
| Quote | 引用 | `> 引用文字` |
| Delimiter | 分隔符 | `---` |

### 媒体内容
| 插件 | 功能 | Markdown 支持 |
|------|------|--------------|
| Image | 图片 | `![描述](URL)` |
| Simple Image | 简单图片 | `![](URL)` |
| Embed | 嵌入内容 | `<iframe>` |
| Attaches | 附件 | `[📎 文件](URL)` |

### 高级块
| 插件 | 功能 | Markdown 支持 |
|------|------|--------------|
| Alert | 提示框 | `> [!info]` Callout |
| Warning | 警告框 | `> ⚠️ **标题**` |
| Button | 按钮 | `[🔘 文本](链接)` |
| Toggle | 折叠块 | `<details>` |
| Math | 数学公式 | `$$公式$$` |
| Layout | 多列布局 | `<!-- columns -->` |
| Personality | 个性化引用 | 引用块 + 头像 |
| Link Tool | 链接卡片 | `[标题](URL)` |
| Raw | 原始HTML | `<!-- raw-html -->` |

### 行内工具
| 插件 | 功能 | 快捷键 | Markdown |
|------|------|--------|----------|
| Bold | 加粗 | Ctrl+B | `**文字**` |
| Italic | 斜体 | Ctrl+I | `*文字*` |
| Underline | 下划线 | Ctrl+U | `<u>文字</u>` |
| Strikethrough | 删除线 | Ctrl+Shift+X | `~~文字~~` |
| Marker | 高亮 | Ctrl+Shift+M | `==文字==` |
| Inline Code | 行内代码 | Ctrl+Shift+C | `` `代码` `` |
| Hyperlink | 超链接 | Ctrl+L | `[文字](URL)` |
| Color | 文本颜色 | - | `<span style="color">` |
| Spoiler | 剧透遮罩 | - | `<span class="spoiler">` |
| Tooltip | 工具提示 | - | 悬停显示 |

### 实用工具
| 插件 | 功能 |
|------|------|
| Undo | 撤销/重做（Ctrl+Z/Y） |
| Drag-Drop | 拖拽排序 |
| Change Case | 大小写转换 |
| Alignment | 文本对齐 |
| Style | 自定义样式 |
| Text Variant | 文本变体 |

## 🔄 Markdown 转换示例

### Alert（提示框）
**富文本：**
```json
{
  "type": "alert",
  "data": {
    "type": "info",
    "message": "这是提示信息"
  }
}
```

**Markdown（Obsidian Callout）：**
```markdown
> [!info]
> 这是提示信息
```

### Toggle（折叠块）
**富文本：**
```json
{
  "type": "toggle",
  "data": {
    "title": "点击展开",
    "text": "隐藏内容",
    "status": "closed"
  }
}
```

**Markdown：**
```markdown
<details>
<summary>点击展开</summary>

隐藏内容
</details>
```

### Math（数学公式）
**富文本：**
```json
{
  "type": "math",
  "data": {
    "math": "E = mc^2"
  }
}
```

**Markdown（Obsidian 兼容）：**
```markdown
$$
E = mc^2
$$
```

### Layout（多列布局）
**Markdown：**
```markdown
<!-- columns -->

<!-- column -->
第一列内容

<!-- column -->
第二列内容

<!-- /columns -->
```

## 🎨 Obsidian 特性支持

### 双链语法
- `[[文件名]]` - 内部链接
- `[[文件名|显示文本]]` - 带别名的链接
- `![[文件名]]` - 嵌入文件
- 在所有块类型中都支持

### Callout 语法
Alert 插件完全兼容 Obsidian Callout：
- `[!note]` - 笔记
- `[!info]` - 信息
- `[!warning]` - 警告
- `[!error]` - 错误
- `[!success]` - 成功
- `[!tip]` - 提示

### 数学公式
使用 Obsidian 的 `$$` 语法：
```markdown
$$
\int_{a}^{b} f(x) dx
$$
```

### 标签
支持 Obsidian 标签：`#标签名`

## ⚙️ 配置选项

### 启用的工具
在设置中可以启用/禁用任何工具：
```typescript
enabledTools: [
  'header', 'list', 'table', 'image',
  'alert', 'button', 'toggle', 'math',
  // ... 更多
]
```

### 自动保存
- 默认间隔：30 秒
- 防抖延迟：500ms
- 手动保存：Ctrl+S

### 图片存储
- 默认文件夹：`attachments`
- 支持本地上传
- 支持 URL 导入

### 主题
- 自动跟随 Obsidian 主题
- 支持亮色/暗色模式
- CSS 变量自适应

## 🚀 性能优化

### 虚拟滚动
- 大文档自动启用
- 阈值：500 个块
- 提升渲染性能

### 防抖保存
- 避免频繁写入
- 延迟：500ms
- 自动合并更改

### 按需加载
- 工具按需初始化
- 减少内存占用
- 提升启动速度

## 📝 使用场景

### 1. 笔记编写
- 使用 Header、Paragraph、List
- 插入图片和代码块
- 添加 Callout 提示

### 2. 文档编辑
- 使用 Table 组织数据
- 使用 Toggle 折叠内容
- 使用 Layout 多列布局

### 3. 学术写作
- 使用 Math 公式
- 使用 Quote 引用
- 使用双链引用文献

### 4. 项目管理
- 使用 Checklist 任务列表
- 使用 Button 快速链接
- 使用 Alert 重要提示

## 🔧 快捷键列表

### 编辑器操作
- **Ctrl+Z** - 撤销
- **Ctrl+Y** - 重做
- **Ctrl+S** - 保存
- **Tab** - 选择块类型
- **Enter** - 新建块
- **Backspace** - 删除空块

### 文本格式
- **Ctrl+B** - 加粗
- **Ctrl+I** - 斜体
- **Ctrl+U** - 下划线
- **Ctrl+Shift+X** - 删除线
- **Ctrl+Shift+M** - 高亮
- **Ctrl+Shift+C** - 行内代码
- **Ctrl+L** - 超链接

### 视图切换
- 右键菜单 → "打开为富文本"
- 右键菜单 → "打开为 Markdown"
- 命令面板 → "Open as EditorJS"
- 命令面板 → "Open as Markdown"

## 📊 数据格式

### 存储格式
```markdown
# 标题

段落内容

> [!info]
> 提示信息
<!-- editorjs-data: {"type":"alert","data":{...}} -->
```

### JSON 注释
- 存储完整的 Editor.js 数据
- 确保无损转换
- 对 Obsidian 透明
- 不影响渲染

## 🎯 最佳实践

### 1. 使用双链
在富文本中使用 `[[]]` 语法，自动转换为 Obsidian 链接

### 2. 善用 Callout
使用 Alert 插件创建 Obsidian Callout，完美兼容

### 3. 数学公式
使用 Math 插件，自动转换为 Obsidian `$$` 语法

### 4. 折叠内容
使用 Toggle 插件创建可折叠区域，提升可读性

### 5. 多列布局
使用 Layout 插件创建复杂布局，增强表现力

## 🔮 未来计划

- [ ] 添加更多 Obsidian 特性支持
- [ ] 优化大文档性能
- [ ] 添加协作编辑功能
- [ ] 支持更多第三方插件
- [ ] 改进移动端体验
- [ ] 添加导入/导出功能

## 📚 相关文档

- [插件使用指南](PLUGINS_GUIDE.md)
- [编译状态报告](BUILD_STATUS.md)
- [Markdown 转换规范](CONVERSION_SPEC.md)
- [开发者文档](DEVELOPER.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

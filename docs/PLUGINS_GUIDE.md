# Editor.js 插件集成指南

## 已安装的插件

### 核心插件（原有）
1. **@editorjs/header** - 标题
2. **@editorjs/list** → **@editorjs/nested-list** - 嵌套列表（已升级）
3. **@editorjs/table** - 表格
4. **@editorjs/image** - 图片
5. **@editorjs/code** - 代码块
6. **@editorjs/quote** - 引用
7. **@editorjs/checklist** - 任务列表
8. **@editorjs/inline-code** - 行内代码
9. **@editorjs/marker** - 高亮标记
10. **@editorjs/underline** - 下划线
11. **@editorjs/delimiter** - 分隔符
12. **@editorjs/warning** - 警告框
13. **@editorjs/raw** - 原始HTML
14. **@editorjs/embed** - 嵌入内容
15. **@editorjs/link** - 链接工具
16. **@editorjs/attaches** - 附件
17. **@editorjs/simple-image** - 简单图片

### 新增插件（第一批）
18. **editorjs-undo** - 撤销/重做（Ctrl+Z/Ctrl+Y）
19. **editorjs-drag-drop** - 拖拽排序
20. **editorjs-alert** - 提示框（支持多种类型）
21. **editorjs-button** - 按钮
22. **editorjs-tooltip** - 工具提示
23. **editorjs-style** - 自定义样式
24. **editorjs-text-alignment-blocktune** - 文本对齐
25. **@editorjs/personality** - 个性化引用

### 新增插件（第二批）
26. **@editorjs/footnotes** - 脚注支持
27. **editorjs-hyperlink** - 超链接（行内工具）
28. **editorjs-toggle-block** - 折叠块
29. **editorjs-change-case** - 大小写转换
30. **editorjs-strikethrough** - 删除线
31. **editorjs-inline-spoiler-tool** - 剧透遮罩
32. **@editorjs/text-variant-tune** - 文本变体
33. **editorjs-text-color-plugin** - 文本颜色和背景色
34. **editorjs-math** - LaTeX 数学公式
35. **editorjs-layout** - 多列布局

## Markdown 转换支持

### Alert（提示框）
**Editor.js 格式：**
```json
{
  "type": "alert",
  "data": {
    "type": "info",
    "message": "这是一条提示信息",
    "align": "left"
  }
}
```

**Markdown 格式（Obsidian Callout）：**
```markdown
> [!info]
> 这是一条提示信息
<!-- editorjs-data: {...} -->
```

**类型映射：**
- `primary` → `[!note]`
- `secondary` → `[!abstract]`
- `info` → `[!info]`
- `success` → `[!success]`
- `warning` → `[!warning]`
- `danger` → `[!error]`
- `light` → `[!tip]`
- `dark` → `[!quote]`

### Button（按钮）
**Editor.js 格式：**
```json
{
  "type": "button",
  "data": {
    "text": "点击这里",
    "link": "https://example.com"
  }
}
```

**Markdown 格式：**
```markdown
[🔘 点击这里](https://example.com)
<!-- editorjs-data: {...} -->
```

### Personality（个性化引用）
**Editor.js 格式：**
```json
{
  "type": "personality",
  "data": {
    "name": "张三",
    "description": "软件工程师",
    "link": "https://example.com",
    "photo": "https://example.com/photo.jpg",
    "text": "这是一段引用文字"
  }
}
```

**Markdown 格式：**
```markdown
![张三](https://example.com/photo.jpg)

> 这是一段引用文字
>
> — **张三**, *软件工程师*
>
> [https://example.com](https://example.com)
<!-- editorjs-data: {...} -->
```

### Nested List（嵌套列表）
**Markdown 格式（4空格缩进）：**
```markdown
- 一级列表
    - 二级列表
        - 三级列表
```

## 快捷键

### 编辑器快捷键
- **Ctrl+Z** / **Cmd+Z** - 撤销
- **Ctrl+Y** / **Cmd+Shift+Z** - 重做
- **Ctrl+S** / **Cmd+S** - 保存
- **Tab** - 选择块类型
- **Ctrl+B** - 加粗
- **Ctrl+I** - 斜体
- **Ctrl+U** - 下划线
- **Ctrl+Shift+M** - 高亮
- **Ctrl+Shift+C** - 行内代码

### 块操作
- **拖拽** - 重新排列块（editorjs-drag-drop）
- **Enter** - 创建新块
- **Backspace** - 删除空块
- **Ctrl+Shift+Backspace** - 删除块

## 数据无损转换

所有新增插件都实现了完整的 Markdown 双向转换：

1. **JSON 数据保存**：使用 HTML 注释存储完整的 Editor.js 数据
   ```html
   <!-- editorjs-data: {"type":"alert","data":{...}} -->
   ```

2. **优先恢复**：读取 Markdown 时优先从 JSON 注释恢复数据

3. **降级支持**：如果没有 JSON 注释，从 Markdown 语法解析

4. **Obsidian 兼容**：
   - Alert → Obsidian Callout
   - Button → 带图标的链接
   - Personality → 引用块
   - 所有双链 `[[]]` 和嵌入 `![[]]` 语法

## 配置

在 `src/settings/SettingsManager.ts` 中启用/禁用工具：

```typescript
enabledTools: [
  'header',
  'list',
  'alert',      // 新增
  'button',     // 新增
  'personality' // 新增
  // ...
]
```

## 使用建议

1. **Alert** - 替代 Warning，支持更多类型
2. **Nested List** - 已替代原 List，支持多级嵌套
3. **Button** - 创建可点击的行动号召
4. **Personality** - 添加带头像的引用
5. **Drag-Drop** - 自动启用，无需配置

### Footnotes（脚注）
**Editor.js 格式：**
```json
{
  "type": "footnotes",
  "data": {
    "text": "这是正文",
    "footnote": "这是脚注内容",
    "id": "1"
  }
}
```

**Markdown 格式：**
```markdown
这是正文[^1]

[^1]: 这是脚注内容
<!-- editorjs-data: {...} -->
```

### Toggle（折叠块）
**Editor.js 格式：**
```json
{
  "type": "toggle",
  "data": {
    "title": "点击展开",
    "text": "隐藏的内容",
    "status": "closed"
  }
}
```

**Markdown 格式：**
```markdown
<details>
<summary>点击展开</summary>

隐藏的内容
</details>
<!-- editorjs-data: {...} -->
```

### Math（数学公式）
**Editor.js 格式：**
```json
{
  "type": "math",
  "data": {
    "math": "E = mc^2"
  }
}
```

**Markdown 格式（Obsidian 兼容）：**
```markdown
$$
E = mc^2
$$
<!-- editorjs-data: {...} -->
```

### Layout（多列布局）
**Editor.js 格式：**
```json
{
  "type": "layout",
  "data": {
    "itemContent": {
      "col-0": { "blocks": [...] },
      "col-1": { "blocks": [...] }
    },
    "layout": {
      "col-0": { "width": 50 },
      "col-1": { "width": 50 }
    }
  }
}
```

**Markdown 格式：**
```markdown
<!-- columns -->

<!-- column -->

第一列内容

<!-- column -->

第二列内容

<!-- /columns -->
<!-- editorjs-data: {...} -->
```

## 行内工具

### Strikethrough（删除线）
- 快捷键：**Ctrl+Shift+X**
- Markdown：`~~删除的文字~~`

### Spoiler（剧透遮罩）
- 鼠标悬停显示
- Markdown：`<span class="spoiler">剧透内容</span>`

### Color（文本颜色）
- 支持文本颜色和背景色
- 自定义颜色选择器
- Markdown：`<span style="color: #FF0000">红色文字</span>`

### Hyperlink（超链接）
- 快捷键：**Ctrl+L**
- 支持目标和关系属性
- Markdown：`[链接文字](URL)`

### Change Case（大小写转换）
- 大写、小写、首字母大写
- 选中文字后使用

## 注意事项

1. 所有新插件都支持 Obsidian 双链语法
2. 数据通过 HTML 注释保存，确保无损转换
3. 拖拽功能自动启用
4. 撤销/重做功能已集成
5. 表格缩进使用 4 个空格（Markdown 标准）
6. Math 公式使用 Obsidian 的 `$$` 语法
7. Toggle 使用 HTML `<details>` 标签
8. Layout 使用 HTML 注释标记列

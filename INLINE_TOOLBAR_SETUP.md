# 内联工具栏和完整工具菜单设置指南

## 问题描述

当前"打开为富文本视图"功能缺少：
1. 内联工具栏（选中文本时显示的加粗、斜体、链接等工具）
2. Checklist（任务列表）工具

## 解决方案

已更新代码以支持完整的 Editor.js 功能，包括：

### 新增功能

1. **内联工具栏** - 选中文本时自动显示
   - Bold（加粗）- 内置
   - Italic（斜体）- 内置
   - Link（链接）- 内置
   - Underline（下划线）- 新增
   - Marker（高亮标记）- 新增
   - Inline Code（行内代码）- 新增

2. **Checklist 工具** - 任务列表
   - 支持勾选/取消勾选
   - 与 Markdown 任务列表格式兼容

3. **改进的占位符提示**
   - 从 "Start writing or press / for commands..."
   - 改为 "Press Tab to select a Block"（与 Editor.js 官方一致）

## 安装步骤

### 1. 安装新的依赖包

在 `obsidian-editorjs-plugin` 目录下运行：

```bash
npm install
```

这将安装以下新增的包：
- `@editorjs/checklist@^1.6.0` - 任务列表工具
- `@editorjs/inline-code@^1.5.1` - 行内代码工具
- `@editorjs/marker@^1.4.0` - 高亮标记工具
- `@editorjs/underline@^1.1.0` - 下划线工具

### 2. 重新编译插件

```bash
npm run build
```

或者在开发模式下：

```bash
npm run dev
```

### 3. 重新加载 Obsidian 插件

1. 在 Obsidian 中打开设置
2. 进入"社区插件"
3. 找到"Editor.js Plugin"
4. 点击重新加载按钮
5. 或者重启 Obsidian

## 功能验证

### 测试内联工具栏

1. 打开一个 Markdown 文件
2. 使用命令"打开为富文本视图"
3. 输入一些文本
4. **选中文本**
5. 应该看到内联工具栏弹出，包含：
   - **B** - 加粗
   - **I** - 斜体
   - **U** - 下划线
   - **🔗** - 链接
   - **🖍** - 高亮标记
   - **</>** - 行内代码

### 测试 Toolbox（工具菜单）

1. 在编辑器中，点击左侧的 **+** 按钮
2. 应该看到垂直的工具列表：
   - Header 1, 2, 3
   - Bulleted List
   - Numbered List
   - **Checklist**（新增）
   - Table
   - Image
   - Code
   - Quote

### 测试 Checklist

1. 点击 + 按钮，选择 Checklist
2. 输入任务项
3. 点击复选框可以勾选/取消勾选
4. 保存后切换到 Markdown 视图
5. 应该看到标准的 Markdown 任务列表格式：
   ```markdown
   - [ ] 未完成的任务
   - [x] 已完成的任务
   ```

### 测试 Block Tunes（块设置）

1. 点击块右侧的设置按钮（三个点）
2. 应该看到垂直菜单，包含：
   - Move Up（上移）
   - Move Down（下移）
   - Delete Block（删除块）
   - **Convert to**（转换为）- 可以转换块类型

## 代码更改摘要

### 1. `package.json`
添加了新的依赖包：
```json
"@editorjs/checklist": "^1.6.0",
"@editorjs/inline-code": "^1.5.1",
"@editorjs/marker": "^1.4.0",
"@editorjs/underline": "^1.1.0"
```

### 2. `src/views/EditorJSView.ts`
- 导入新的工具类
- 配置内联工具栏：
  ```typescript
  inlineToolbar: ['bold', 'italic', 'underline', 'link', 'marker', 'inlineCode']
  ```
- 添加 Checklist 工具配置
- 添加内联工具（Marker, InlineCode, Underline）

### 3. `src/settings/SettingsTab.ts`
- 在可用工具列表中添加 Checklist

### 4. `src/settings/SettingsManager.ts`
- 在默认启用工具中添加 'checklist'

### 5. `src/converters/MarkdownToBlocks.ts`
- 添加 `isChecklistItem()` 方法识别任务列表
- 添加 `parseChecklist()` 方法解析任务列表
- 支持 `- [ ]` 和 `- [x]` 格式

### 6. `src/converters/BlocksToMarkdown.ts`
- 添加 `convertChecklist()` 方法
- 将 Checklist 块转换为 Markdown 任务列表格式

## 配置说明

### 内联工具栏配置

内联工具栏在 Editor.js 初始化时配置：

```typescript
this.editor = new EditorJS({
  // ... 其他配置
  inlineToolbar: ['bold', 'italic', 'underline', 'link', 'marker', 'inlineCode'],
  // ...
});
```

这些工具会在用户选中文本时自动显示。

### 工具启用/禁用

用户可以在插件设置中启用或禁用各个工具：

1. 打开 Obsidian 设置
2. 进入"Editor.js Plugin"设置页
3. 在"Enabled Tools"部分切换工具开关

## 故障排除

### 内联工具栏不显示

1. **确认已选中文本** - 内联工具栏只在选中文本时显示
2. **检查控制台错误** - 打开开发者工具（Ctrl+Shift+I）查看错误
3. **确认依赖已安装** - 运行 `npm install` 确保所有包已安装
4. **重新编译** - 运行 `npm run build` 重新编译插件

### Checklist 不显示

1. **检查设置** - 确认 Checklist 在插件设置中已启用
2. **清除缓存** - 重启 Obsidian
3. **检查版本** - 确认使用的是 Editor.js 2.31.0

### 工具菜单不完整

1. **检查 package.json** - 确认所有依赖包都已添加
2. **运行 npm install** - 安装缺失的包
3. **检查导入语句** - 确认 EditorJSView.ts 中导入了所有工具

## 技术细节

### Editor.js 内联工具栏工作原理

1. 用户选中文本
2. Editor.js 检测到选区变化
3. 触发 `InlineToolbar` 模块
4. 根据 `inlineToolbar` 配置显示工具
5. 使用 `PopoverInline` 组件渲染工具栏
6. 工具栏自动定位在选区上方

### Checklist 数据格式

**Editor.js 格式：**
```json
{
  "type": "checklist",
  "data": {
    "items": [
      { "text": "任务1", "checked": false },
      { "text": "任务2", "checked": true }
    ]
  }
}
```

**Markdown 格式：**
```markdown
- [ ] 任务1
- [x] 任务2
```

## 参考资料

- [Editor.js 官方文档](https://editorjs.io/)
- [Editor.js Inline Toolbar](https://editorjs.io/inline-tools-api-1)
- [Checklist Tool](https://github.com/editor-js/checklist)
- [Marker Tool](https://github.com/editor-js/marker)
- [Inline Code Tool](https://github.com/editor-js/inline-code)
- [Underline Tool](https://github.com/editor-js/underline)

## 下一步

完成安装后，你应该能够：

1. ✅ 看到完整的工具菜单（包括 Checklist）
2. ✅ 选中文本时显示内联工具栏
3. ✅ 使用所有文本格式化工具
4. ✅ 创建和编辑任务列表
5. ✅ 在 Markdown 和富文本视图之间无缝切换

如有问题，请查看控制台日志或提交 issue。

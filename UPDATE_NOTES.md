# 更新说明

## 本次更新内容

### 1. 修复显示不完整问题

#### 问题描述
- Editor.js 的工具栏菜单（Plus按钮菜单）显示不完整
- 设置菜单（Tune Settings）无法正确显示
- 弹出菜单可能被裁剪

#### 解决方案
更新了 `styles.css`，添加了以下改进：

- 为所有 Editor.js UI 元素设置了正确的 z-index
- 改进了弹出菜单（popover）的样式和滚动条
- 确保所有下拉菜单和工具栏不会被裁剪
- 添加了 `!important` 标记以覆盖可能的主题冲突
- 优化了菜单项的间距和显示

关键样式更新：
```css
/* 确保 UI 元素可见且不被裁剪 */
.obsidian-editorjs-plugin .ce-toolbar,
.obsidian-editorjs-plugin .ce-popover,
.obsidian-editorjs-plugin .ce-inline-toolbar,
.obsidian-editorjs-plugin .ce-conversion-toolbar,
.obsidian-editorjs-plugin .ce-settings {
  z-index: 1000 !important;
}

/* 弹出菜单样式 */
.obsidian-editorjs-plugin .ce-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
  border-radius: 6px !important;
}
```

### 2. 添加多语言支持

#### 新增功能
- 支持中文（简体）和英文两种语言
- 默认语言：简体中文
- 可在设置中随时切换语言

#### 实现细节

**新增文件：**
- `src/i18n/index.ts` - 国际化系统，包含所有翻译文本

**修改文件：**
- `src/settings/SettingsManager.ts` - 添加 `language` 设置项
- `src/settings/SettingsTab.ts` - 使用国际化文本显示设置界面
- `src/main.ts` - 命令和通知消息使用国际化文本

**已国际化的内容：**
- 所有设置选项的名称和描述
- 命令面板中的命令
- 右键菜单项
- 通知消息
- 工具名称

### 3. 设置立即生效

#### 新增功能
所有设置更改都会立即生效，无需重启 Obsidian：

**立即生效的设置：**
- **语言切换** - 设置界面立即刷新为新语言
- **主题切换** - 所有打开的编辑器立即应用新主题
- **工具启用/禁用** - 所有打开的编辑器立即重新加载

#### 实现细节

**新增方法：**

1. `main.ts` 中的 `refreshUI()` 方法：
```typescript
refreshUI(): void {
  // 遍历所有打开的 EditorJS 视图并刷新
  this.app.workspace.iterateAllLeaves((leaf) => {
    if (leaf.view.getViewType() === VIEW_TYPE_EDITORJS) {
      const view = leaf.view as EditorJSView;
      view.refresh();
    }
  });
}
```

2. `EditorJSView.ts` 中的 `refresh()` 方法：
```typescript
refresh(): void {
  // 重新应用主题
  if (this.editorContainer) {
    this.themeAdapter.applyTheme(this.editorContainer);
  }

  // 保存当前状态并重新初始化编辑器
  if (this.editor && this.file && this.isInitialized) {
    this.editor.save().then(async (data) => {
      this.destroyEditor();
      await this.initializeEditor(data);
      // 重新应用主题
      if (this.editorContainer) {
        this.themeAdapter.applyTheme(this.editorContainer);
      }
    });
  }
}
```

**触发刷新的设置：**
- 语言切换 → 刷新设置界面 + 刷新所有编辑器
- 主题切换 → 刷新所有编辑器
- 工具切换 → 刷新所有编辑器

### 4. 修复 Editor.js 初始化错误

#### 问题描述
```
TypeError: Cannot read properties of undefined (reading 'isInternal')
```

#### 原因
之前尝试为 Image 工具添加 tune 配置，但没有正确安装和配置 tune 插件。

#### 解决方案
移除了不必要的 tune 配置：
- 从 Image 工具配置中移除 `tunes` 属性
- 从 EditorJS 初始化配置中移除 `tunes` 选项

## 使用指南

### 切换语言
1. 打开 Obsidian 设置
2. 找到 "Editor.js Plugin Settings" 或 "Editor.js 插件设置"
3. 在顶部找到 "Language" / "语言" 选项
4. 选择你想要的语言（English 或 简体中文）
5. 设置界面会立即刷新为新语言

### 切换主题
1. 在设置中找到 "Editor theme" / "编辑器主题"
2. 选择：
   - Auto (follow Obsidian) / 自动（跟随 Obsidian）
   - Light / 浅色
   - Dark / 深色
3. 所有打开的编辑器会立即应用新主题

### 启用/禁用工具
1. 在设置中找到 "Enabled Tools" / "启用的工具" 部分
2. 切换任何工具的开关
3. 所有打开的编辑器会立即重新加载以应用更改

## 技术说明

### 文件结构
```
src/
  i18n/
    index.ts              # 国际化系统
  settings/
    SettingsManager.ts    # 设置管理（添加了 language）
    SettingsTab.ts        # 设置界面（使用国际化）
  views/
    EditorJSView.ts       # 编辑器视图（添加了 refresh 方法）
  main.ts                 # 主插件（添加了 refreshUI 方法）
```

### 支持的语言
- `en` - English
- `zh-CN` - 简体中文

### 扩展新语言
要添加新语言，编辑 `src/i18n/index.ts`：

1. 在 `Language` 类型中添加新语言代码
2. 创建新的翻译对象（复制 `en` 或 `zhCN` 作为模板）
3. 添加到 `translations` 记录中
4. 在 `getAvailableLanguages()` 中添加新选项

## 测试建议

1. **语言切换测试**
   - 切换语言后检查所有设置项是否正确翻译
   - 检查命令面板中的命令是否更新
   - 检查右键菜单项是否更新

2. **主题切换测试**
   - 打开多个 EditorJS 视图
   - 切换主题
   - 确认所有视图都立即更新

3. **工具切换测试**
   - 打开一个 EditorJS 视图
   - 禁用某个工具（如 Table）
   - 确认编辑器重新加载后该工具不可用
   - 重新启用工具
   - 确认工具立即可用

4. **UI 显示测试**
   - 点击 Plus 按钮，检查块选择菜单是否完整显示
   - 点击设置按钮（三个点），检查设置菜单是否完整显示
   - 选中文本，检查内联工具栏是否正确显示

## 已知问题

无

## 下一步计划

1. 添加更多语言支持（日语、韩语等）
2. 添加自定义工具配置
3. 改进性能优化
4. 添加更多 Editor.js 插件支持

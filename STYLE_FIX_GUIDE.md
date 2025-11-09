# 样式修复指南 - Popover 文字截断问题

## 问题描述

Editor.js 的 Popover 菜单中文字被截断，例如：
- "Filter" 显示为 "ilter"
- "Convert to" 显示为 "onvert to"
- "Move Up" 显示为 "ove Up"

## 根本原因

Editor.js 2.31.0 使用的 CSS 类名是：
- `.ce-popover-item` - 菜单项容器
- `.ce-popover-item__title` - 菜单项文字
- `.ce-popover-item__icon` - 菜单项图标

默认样式可能有 `overflow: hidden` 或宽度限制导致文字被截断。

## 修复方案

已在 `styles.css` 中添加以下关键修复：

```css
/* 关键修复 1: 确保 popover 有足够宽度 */
.ce-popover {
  min-width: 220px !important;
  width: auto !important;
  max-width: 400px !important;
}

/* 关键修复 2: 修复文字截断 */
.ce-popover-item__title {
  flex: 1 !important;
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
}

/* 关键修复 3: 确保 flex 布局正确 */
.ce-popover-item {
  display: flex !important;
  align-items: center !important;
  padding: 10px 14px !important;
}
```

## 应用步骤

### 1. 重新加载插件

在 Obsidian 中：
1. 打开设置 → 社区插件
2. 找到 "Editor.js Plugin"
3. 点击重新加载按钮
4. **或者直接重启 Obsidian（推荐）**

### 2. 清除缓存（如果重新加载无效）

如果重新加载后问题仍然存在，尝试：

**Windows:**
```bash
# 删除 Obsidian 缓存
rmdir /s /q "%APPDATA%\obsidian\Cache"
rmdir /s /q "%APPDATA%\obsidian\GPUCache"
```

**macOS/Linux:**
```bash
# 删除 Obsidian 缓存
rm -rf ~/Library/Application\ Support/obsidian/Cache
rm -rf ~/Library/Application\ Support/obsidian/GPUCache
```

然后重启 Obsidian。

### 3. 验证样式是否应用

1. 在 Obsidian 中打开一个 Markdown 文件
2. 执行命令："打开为富文本视图"
3. 点击左侧的 **+** 按钮
4. 打开开发者工具（Ctrl+Shift+I 或 Cmd+Option+I）
5. 在 Elements 标签中检查 `.ce-popover-item__title` 元素
6. 确认以下样式已应用：
   - `overflow: visible`
   - `text-overflow: clip`
   - `white-space: nowrap`

## 调试步骤

如果问题仍然存在，请按以下步骤调试：

### 步骤 1: 检查样式文件是否被加载

1. 打开开发者工具（Ctrl+Shift+I）
2. 切换到 "Sources" 标签
3. 查找 `styles.css` 文件
4. 确认文件内容包含最新的修复

### 步骤 2: 检查 CSS 优先级

1. 在开发者工具中选择一个被截断的文字元素
2. 在 "Styles" 面板中查看应用的样式
3. 如果看到样式被划掉，说明有更高优先级的样式覆盖了它
4. 可能需要增加 `!important` 的数量或提高选择器优先级

### 步骤 3: 手动注入样式测试

在开发者工具的 Console 中运行：

```javascript
// 手动注入修复样式
const style = document.createElement('style');
style.textContent = `
  .ce-popover {
    min-width: 220px !important;
    width: auto !important;
  }
  .ce-popover-item__title {
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
  }
`;
document.head.appendChild(style);
```

如果这样可以修复问题，说明样式文件没有被正确加载。

### 步骤 4: 检查 Editor.js 版本

确认使用的是 Editor.js 2.31.0：

```javascript
// 在控制台运行
console.log(EditorJS.version);
```

## 替代方案

如果上述方法都不起作用，可以尝试以下替代方案：

### 方案 A: 直接修改 Editor.js 配置

在 `EditorJSView.ts` 中添加自定义 CSS：

```typescript
onReady: () => {
  // 注入自定义样式
  const style = document.createElement('style');
  style.textContent = `
    .ce-popover { min-width: 220px !important; }
    .ce-popover-item__title { overflow: visible !important; }
  `;
  this.editorContainer?.appendChild(style);
}
```

### 方案 B: 使用内联样式

修改 Editor.js 初始化配置，添加 `holder` 的样式：

```typescript
this.editorContainer.style.setProperty('--popover-min-width', '220px');
```

## 预期结果

修复后，Popover 菜单应该：
- ✅ 显示完整的文字（"Filter" 而不是 "ilter"）
- ✅ 有足够的宽度容纳所有菜单项
- ✅ 图标和文字正确对齐
- ✅ 搜索框正常显示
- ✅ 嵌套菜单正常工作

## 测试清单

- [ ] Toolbox（+ 按钮菜单）文字完整显示
- [ ] Block Tunes（设置按钮菜单）文字完整显示
- [ ] Convert to（转换菜单）文字完整显示
- [ ] 搜索框正常显示
- [ ] 内联工具栏正常显示
- [ ] 所有图标正确对齐

## 常见问题

### Q: 重新加载后仍然看到旧样式？
A: 尝试完全重启 Obsidian，或清除缓存后重启。

### Q: 样式在开发者工具中看起来正确，但显示还是错误？
A: 可能是浏览器缓存问题，按 Ctrl+F5 强制刷新。

### Q: 只有部分菜单项被修复？
A: 检查是否所有 `.ce-popover-item__title` 元素都应用了样式。

### Q: 修复后菜单太宽了？
A: 调整 `styles.css` 中的 `min-width` 和 `max-width` 值。

## 技术细节

### Editor.js Popover 结构

```html
<div class="ce-popover">
  <div class="ce-popover__search">
    <input type="text" placeholder="Filter">
  </div>
  <div class="ce-popover__items">
    <div class="ce-popover-item">
      <div class="ce-popover-item__icon">...</div>
      <div class="ce-popover-item__title">Header 1</div>
    </div>
    <!-- 更多项目 -->
  </div>
</div>
```

### CSS 优先级

我们使用 `!important` 来确保样式优先级：
1. Editor.js 默认样式（优先级低）
2. Obsidian 主题样式（优先级中）
3. 我们的插件样式 + `!important`（优先级高）

### BEM 命名规范

Editor.js 使用 BEM（Block Element Modifier）命名：
- Block: `.ce-popover`
- Element: `.ce-popover-item__title`
- Modifier: `.ce-popover-item--active`

## 支持

如果问题仍然存在：
1. 截图显示问题
2. 提供开发者工具中的样式信息
3. 检查控制台是否有错误
4. 确认 Editor.js 版本

---

**最后更新:** 2024-11-09  
**适用版本:** Editor.js 2.31.0

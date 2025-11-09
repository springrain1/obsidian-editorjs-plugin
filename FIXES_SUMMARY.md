# 问题修复总结

## 已修复的问题

### 1. 图片加载问题 ✅

**问题**: 富文本视图下图片未能正常加载，显示 `ERR_FILE_NOT_FOUND`

**原因**: 图片使用相对路径，但 Obsidian 需要使用资源协议路径

**解决方案**:
- 修改 `ImageHandler.ts` 中的 `uploadByFile` 和 `uploadByUrl` 方法
- 使用 `app.vault.getResourcePath()` 获取正确的资源路径
- 返回的 URL 现在是 Obsidian 可以正确加载的资源路径

**修改文件**:
- `src/image/ImageHandler.ts`

### 2. 工具箱不完整 ✅

**问题**: 缺少多个 Editor.js 官方工具

**解决方案**: 添加了以下工具

#### 新增工具列表:
1. **Delimiter** (分隔符) - 添加水平分隔线
2. **Warning** (警告) - 警告提示框
3. **Raw HTML** (原始 HTML) - 插入原始 HTML 代码
4. **Embed** (嵌入) - 嵌入 YouTube, Vimeo, Twitter 等
5. **Link** (链接) - 链接嵌入工具
6. **Attaches** (附件) - 文件附件上传
7. **Simple Image** (简单图片) - 无需后端的简单图片工具

**修改文件**:
- `package.json` - 添加新依赖
- `src/views/EditorJSView.ts` - 导入并配置新工具
- `src/settings/SettingsManager.ts` - 默认启用新工具
- `src/settings/SettingsTab.ts` - 设置界面添加新工具选项
- `src/i18n/index.ts` - 添加中英文翻译

### 3. 菜单位置问题 ✅

**问题**: 左侧拖拽块和 `/` 菜单显示不完整，被窗口边缘裁剪

**解决方案**:
- 修改 `styles.css`，调整工具栏位置到右侧
- 修复弹出菜单的定位方式
- 确保所有 UI 元素有正确的 z-index

**修改文件**:
- `styles.css`

**关键样式**:
```css
/* 工具栏移到右侧 */
.obsidian-editorjs-plugin .ce-toolbar {
  position: absolute !important;
  left: auto !important;
  right: 100% !important;
  margin-right: 10px !important;
}

/* 修复弹出菜单定位 */
.obsidian-editorjs-plugin .ce-popover {
  position: fixed !important;
  left: auto !important;
  transform: none !important;
}
```

## 安装的新工具包

```json
{
  "@editorjs/delimiter": "^1.4.2",
  "@editorjs/warning": "^1.4.0",
  "@editorjs/raw": "^2.5.0",
  "@editorjs/embed": "^2.7.4",
  "@editorjs/link": "^2.6.2",
  "@editorjs/attaches": "^1.3.0",
  "@editorjs/simple-image": "^1.6.0"
}
```

## 使用说明

### 启用/禁用工具

1. 打开 Obsidian 设置
2. 找到 "Editor.js 插件设置"
3. 滚动到 "启用的工具" 部分
4. 切换任何工具的开关
5. 更改立即生效，无需重启

### 新工具使用方法

#### Delimiter (分隔符)
- 点击 `+` 按钮选择 "Delimiter"
- 自动插入水平分隔线

#### Warning (警告)
- 点击 `+` 按钮选择 "Warning"
- 输入标题和消息
- 创建醒目的警告框

#### Raw HTML (原始 HTML)
- 点击 `+` 按钮选择 "Raw HTML"
- 直接输入 HTML 代码
- 适合需要自定义样式的内容

#### Embed (嵌入)
- 点击 `+` 按钮选择 "Embed"
- 粘贴 YouTube、Vimeo、Twitter 等链接
- 自动嵌入媒体内容

#### Link (链接)
- 点击 `+` 按钮选择 "Link"
- 输入 URL
- 创建链接预览卡片

#### Attaches (附件)
- 点击 `+` 按钮选择 "Attaches"
- 上传文件
- 文件保存到 vault 的附件文件夹

#### Simple Image (简单图片)
- 点击 `+` 按钮选择 "Simple Image"
- 输入图片 URL
- 快速插入外部图片

## 测试建议

### 1. 测试图片加载
- 创建新的 EditorJS 视图
- 插入图片（使用 Image 或 Simple Image 工具）
- 确认图片正确显示
- 保存并重新打开，确认图片仍然显示

### 2. 测试新工具
- 逐个测试每个新工具
- 确认工具按预期工作
- 测试保存和加载功能

### 3. 测试菜单位置
- 点击左侧的 `+` 按钮
- 确认菜单完整显示在右侧
- 测试 `/` 快捷键打开菜单
- 确认菜单不被窗口边缘裁剪

### 4. 测试设置
- 在设置中禁用某个工具
- 确认该工具从工具栏消失
- 重新启用工具
- 确认工具立即可用

## 已知限制

1. **Link Tool**: 需要后端 API 才能获取链接元数据，当前配置为无后端模式
2. **Embed Tool**: 仅支持配置中列出的服务（YouTube, Vimeo, Twitter 等）
3. **Attaches Tool**: 使用与图片相同的上传逻辑，保存到同一文件夹

## 下一步改进建议

1. 为 Link Tool 添加本地元数据提取
2. 添加更多 Embed 服务支持
3. 为附件创建单独的文件夹配置
4. 添加工具的自定义配置选项
5. 改进工具栏的响应式布局

## 编译说明

重新编译插件:
```bash
npm install --legacy-peer-deps
npm run build
```

注意: 使用 `--legacy-peer-deps` 是因为 rollup-plugin-terser 与 Rollup 4.x 的依赖冲突。

## 文件更改清单

- ✅ `package.json` - 添加新依赖
- ✅ `src/image/ImageHandler.ts` - 修复图片路径
- ✅ `src/views/EditorJSView.ts` - 添加新工具
- ✅ `src/settings/SettingsManager.ts` - 更新默认设置
- ✅ `src/settings/SettingsTab.ts` - 更新设置界面
- ✅ `src/i18n/index.ts` - 添加翻译
- ✅ `styles.css` - 修复菜单位置

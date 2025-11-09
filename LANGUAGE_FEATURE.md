# 语言切换功能说明

## 新增功能

### 1. 多语言支持
- 支持中文（简体）和英文
- 默认语言：简体中文
- 可在设置中切换语言

### 2. 即时生效
所有设置更改都会立即生效，无需重启 Obsidian：

- **语言切换**：切换后设置界面立即刷新为新语言
- **主题切换**：切换后所有打开的编辑器立即应用新主题
- **工具启用/禁用**：切换后所有打开的编辑器立即重新加载以应用新工具配置

### 3. 国际化文本
以下界面文本已国际化：
- 设置界面所有选项
- 命令面板命令
- 右键菜单项
- 通知消息

## 使用方法

1. 打开 Obsidian 设置
2. 找到 "Editor.js Plugin Settings" 或 "Editor.js 插件设置"
3. 在顶部找到 "Language" / "语言" 选项
4. 选择你想要的语言
5. 设置界面会立即刷新为新语言

## 技术实现

### 文件结构
```
src/
  i18n/
    index.ts          # 国际化系统，包含所有翻译
  settings/
    SettingsManager.ts # 添加了 language 设置
    SettingsTab.ts     # 使用国际化文本
  main.ts             # 添加了 refreshUI() 方法
  views/
    EditorJSView.ts   # 添加了 refresh() 方法
```

### 关键方法

#### `refreshUI()`
在 main.ts 中，当设置更改时调用此方法：
- 遍历所有打开的 EditorJS 视图
- 调用每个视图的 refresh() 方法

#### `refresh()`
在 EditorJSView.ts 中，刷新单个编辑器：
- 重新应用主题
- 保存当前内容
- 销毁并重新初始化编辑器（应用新工具配置）

### 支持的语言

#### 英文 (en)
- 完整的英文界面
- 所有设置、命令、菜单项都有英文翻译

#### 简体中文 (zh-CN)
- 完整的中文界面
- 所有设置、命令、菜单项都有中文翻译

## 扩展新语言

要添加新语言，编辑 `src/i18n/index.ts`：

1. 在 `Language` 类型中添加新语言代码
2. 创建新的翻译对象
3. 添加到 `translations` 记录中
4. 在 `getAvailableLanguages()` 中添加新选项

示例：
```typescript
export type Language = 'en' | 'zh-CN' | 'ja';

const ja: Translations = {
  settingsTitle: 'Editor.js プラグイン設定',
  // ... 其他翻译
};

const translations: Record<Language, Translations> = {
  'en': en,
  'zh-CN': zhCN,
  'ja': ja
};
```

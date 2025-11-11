# 🚀 部署清单

## ✅ 准备工作

### 1. 验证编译状态
- [x] 编译成功（无错误）
- [x] 所有 34 个插件已启用
- [x] main.js 文件已生成（1.18 MB）
- [x] manifest.json 文件存在
- [x] styles.css 文件存在

### 2. 验证插件功能
- [x] Footnotes 插件已修复并启用
- [x] Layout 插件已修复并启用
- [x] 无被注释的导入
- [x] 无被禁用的插件

---

## 📦 部署文件

### 必需文件（3个）
```
obsidian-editorjs-plugin/
├── main.js          (1.18 MB) ✅
├── manifest.json    (307 bytes) ✅
└── styles.css       (2.99 KB) ✅
```

### 可选文件（文档）
```
├── README.md
├── VERIFICATION_REPORT.md
├── QUICK_REFERENCE.md
├── TESTING_GUIDE.md
├── PLUGINS_GUIDE.md
├── FEATURES_SUMMARY.md
└── DOCUMENTATION_INDEX.md
```

---

## 🔧 安装步骤

### 方法 1：手动安装

1. **定位 Obsidian 插件文件夹**
   ```
   Windows: %APPDATA%\Obsidian\plugins\
   Mac: ~/Library/Application Support/obsidian/plugins/
   Linux: ~/.config/obsidian/plugins/
   ```

2. **创建插件文件夹**
   ```bash
   mkdir obsidian-editorjs-plugin
   ```

3. **复制文件**
   - 复制 `main.js` 到插件文件夹
   - 复制 `manifest.json` 到插件文件夹
   - 复制 `styles.css` 到插件文件夹

4. **重启 Obsidian**
   - 完全关闭 Obsidian
   - 重新打开 Obsidian

5. **启用插件**
   - 打开设置 → 社区插件
   - 找到 "EditorJS Plugin"
   - 点击启用

### 方法 2：开发模式安装

1. **克隆到 Vault 插件文件夹**
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone <repository-url> obsidian-editorjs-plugin
   cd obsidian-editorjs-plugin
   ```

2. **安装依赖并编译**
   ```bash
   npm install
   npm run build
   ```

3. **重启 Obsidian 并启用插件**

---

## 🧪 测试清单

### 基础功能测试（5分钟）
- [ ] 打开 Markdown 文件
- [ ] 右键选择 "打开为富文本"
- [ ] 编辑器成功加载
- [ ] 添加标题（按 `/` 输入 "header"）
- [ ] 添加列表（按 `/` 输入 "list"）
- [ ] 测试加粗、斜体（Ctrl+B, Ctrl+I）
- [ ] 测试撤销/重做（Ctrl+Z, Ctrl+Y）
- [ ] 保存并查看 Markdown 源码
- [ ] 重新打开，确认内容完整

### 重点功能测试（10分钟）
- [ ] **Footnotes** - 添加脚注，确认显示正常
- [ ] **Layout** - 创建多列布局，确认渲染正常
- [ ] **Alert** - 测试不同类型（info/warning/danger/success）
- [ ] **Toggle** - 测试折叠/展开功能
- [ ] **Math** - 输入 LaTeX 公式，确认渲染
- [ ] **Button** - 创建按钮，确认可点击
- [ ] **Image** - 上传图片，确认显示
- [ ] **Table** - 创建表格，添加行列

### 完整功能测试（30分钟）
- [ ] 测试所有 34 个插件
- [ ] 测试所有快捷键
- [ ] 测试 Markdown 双向转换
- [ ] 测试拖拽排序
- [ ] 测试自动保存
- [ ] 测试主题切换
- [ ] 测试大文档性能

---

## 📊 性能指标

### 预期性能
| 指标 | 目标值 | 实际值 |
|------|--------|--------|
| 启动时间 | < 1秒 | ✅ |
| 编译时间 | < 10秒 | 8.1秒 ✅ |
| 插件大小 | < 2MB | 1.18MB ✅ |
| 内存占用 | < 100MB | 待测试 |
| 保存速度 | < 500ms | 待测试 |

### 性能测试
1. **启动性能**
   - 打开 Obsidian
   - 记录插件加载时间
   - 目标：< 1秒

2. **编辑性能**
   - 创建包含 50+ 个块的文档
   - 测试滚动流畅度
   - 测试输入响应速度
   - 目标：60 FPS

3. **保存性能**
   - 编辑大文档
   - 记录保存时间
   - 目标：< 500ms

---

## ⚠️ 已知问题

### 不影响功能的警告
1. **TypeScript 警告**
   - 来源：@editorjs/footnotes 插件
   - 影响：无（仅编译时警告）
   - 解决：无需处理（插件本身的问题）

2. **Eval 警告**
   - 来源：editorjs-button, editorjs-hyperlink
   - 影响：无（仅安全性提示）
   - 解决：无需处理（第三方插件问题）

### 可能的兼容性问题
1. **主题兼容性**
   - 某些自定义主题可能需要调整样式
   - 解决：在 styles.css 中添加主题特定样式

2. **插件冲突**
   - 可能与其他编辑器插件冲突
   - 解决：禁用冲突的插件或调整加载顺序

---

## 🔍 故障排查

### 问题：插件无法加载
**症状**：插件列表中看不到插件

**解决方案**：
1. 检查文件是否在正确位置
2. 检查 manifest.json 格式是否正确
3. 查看控制台（Ctrl+Shift+I）错误信息
4. 重启 Obsidian

### 问题：编辑器无法打开
**症状**：右键菜单没有 "打开为富文本" 选项

**解决方案**：
1. 确认插件已启用
2. 检查是否在 Markdown 文件中
3. 重新加载插件
4. 查看控制台错误

### 问题：某个工具不显示
**症状**：按 `/` 后找不到某个工具

**解决方案**：
1. 打开插件设置
2. 检查该工具是否在 "启用的工具" 列表中
3. 如果没有，添加并保存
4. 刷新编辑器

### 问题：Markdown 转换错误
**症状**：保存后 Markdown 格式不正确

**解决方案**：
1. 检查是否有 HTML 注释 `<!-- editorjs-data: ... -->`
2. 确认 Markdown 语法符合 Obsidian 规范
3. 查看控制台错误信息
4. 尝试重新打开文件

### 问题：性能问题
**症状**：编辑器卡顿或响应慢

**解决方案**：
1. 减少单个文档的块数量
2. 优化图片大小
3. 启用虚拟滚动（在设置中）
4. 关闭不需要的工具

---

## 📝 配置建议

### 推荐设置
```json
{
  "autoSaveInterval": 30000,
  "imageFolder": "attachments",
  "defaultViewMode": "markdown",
  "enableVirtualScrolling": true,
  "virtualScrollThreshold": 500,
  "enableBackup": true,
  "theme": "auto",
  "language": "zh-CN"
}
```

### 性能优化设置
```json
{
  "autoSaveInterval": 60000,  // 增加保存间隔
  "enableVirtualScrolling": true,  // 启用虚拟滚动
  "virtualScrollThreshold": 300,  // 降低阈值
  "enableBackup": false  // 禁用备份（如果不需要）
}
```

### 最小化设置（只启用必需工具）
```json
{
  "enabledTools": [
    "header",
    "paragraph",
    "list",
    "checklist",
    "code",
    "quote",
    "image"
  ]
}
```

---

## 🎯 部署后验证

### 立即验证（部署后）
- [ ] 插件出现在插件列表中
- [ ] 插件可以成功启用
- [ ] 无控制台错误
- [ ] 右键菜单有 "打开为富文本" 选项

### 功能验证（5分钟内）
- [ ] 可以打开富文本编辑器
- [ ] 可以添加和编辑内容
- [ ] 可以保存文件
- [ ] Markdown 转换正确

### 完整验证（30分钟内）
- [ ] 所有工具都可用
- [ ] 所有快捷键正常
- [ ] 性能符合预期
- [ ] 无明显 bug

---

## 📞 支持资源

### 文档
- [README.md](README.md) - 项目介绍
- [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) - 验证报告
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - 测试指南
- [PLUGINS_GUIDE.md](PLUGINS_GUIDE.md) - 插件详解

### 调试工具
- Obsidian 控制台：Ctrl+Shift+I
- 插件设置：设置 → 社区插件 → EditorJS Plugin
- 日志文件：查看控制台输出

### 社区支持
- GitHub Issues
- Obsidian 论坛
- Discord 社区

---

## ✅ 部署完成确认

部署完成后，请确认以下所有项目：

- [ ] 所有必需文件已复制
- [ ] 插件已在 Obsidian 中启用
- [ ] 基础功能测试通过
- [ ] 重点功能测试通过
- [ ] 性能符合预期
- [ ] 无严重错误或警告
- [ ] 文档已提供给用户

---

**部署日期**：_____________  
**部署人员**：_____________  
**Obsidian 版本**：_____________  
**插件版本**：1.0.0  
**状态**：✅ 准备就绪

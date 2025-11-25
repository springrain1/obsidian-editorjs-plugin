# 快速参考卡片

## ⌨️ 常用快捷键

### 编辑器操作
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+S` | 保存 |
| `/` | 打开工具菜单 |
| `Tab` | 增加缩进 |
| `Shift+Tab` | 减少缩进 |
| `Enter` | 新建块 |
| `Backspace` | 删除空块 |

### 文本格式
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+B` | 加粗 |
| `Ctrl+I` | 斜体 |
| `Ctrl+U` | 下划线 |
| `Ctrl+Shift+M` | 行内代码 |
| `Ctrl+K` | 插入链接 |

### 块操作
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+↑` | 向上移动块 |
| `Ctrl+Shift+↓` | 向下移动块 |
| `Ctrl+D` | 复制块 |
| `Ctrl+Alt+Enter` | 在上方插入块 |

## 🔧 工具速查

### 按 `/` 后输入：

#### 基础工具
- `header` - 标题（H1-H6）
- `list` - 嵌套列表
- `table` - 表格
- `checklist` - 任务列表
- `code` - 代码块
- `quote` - 引用
- `image` - 图片

#### 增强工具
- `alert` - 提示框（info/warning/danger/success）
- `button` - 按钮
- `toggle` - 折叠块
- `math` - 数学公式
- `layout` - 多列布局
- `personality` - 个性化引用
- `delimiter` - 分隔符
- `warning` - 警告框
- `embed` - 嵌入内容
- `link` - 链接卡片
- `attaches` - 附件

### 行内工具（选中文本后）
- **B** - 加粗
- **I** - 斜体
- **U** - 下划线
- **S** - 删除线
- **🖍️** - 高亮标记
- **`<>`** - 行内代码
- **🔗** - 超链接
- **🎨** - 文本颜色
- **👁️** - 剧透遮罩
- **💬** - 工具提示
- **Aa** - 大小写转换

### 块调整工具（点击块右侧）
- **📝** - 脚注
- **⬅️ ➡️** - 对齐方式
- **🎨** - 自定义样式
- **Aa** - 文本变体

## 📝 Markdown 语法对照

### 基础语法
```markdown
# 标题 1
## 标题 2
### 标题 3

**加粗** *斜体* ~~删除线~~ ==高亮== `代码`

- 列表项
  - 嵌套项

1. 有序列表
2. 第二项

- [ ] 未完成任务
- [x] 已完成任务

> 引用文本

[链接文本](URL)

![图片](路径)
```

### Obsidian 特殊语法
```markdown
> [!info] 信息提示
> 内容

> [!warning] 警告
> 内容

> [!danger] 危险
> 内容

> [!success] 成功
> 内容

<details>
<summary>折叠标题</summary>
折叠内容
</details>

$$
E=mc^2
$$

[🔘 按钮文本](链接)

[[双链]]
![[嵌入]]

这是文本[^1]
[^1]: 脚注内容
```

## 🎨 Alert 类型

| 类型 | 语法 | 图标 | 颜色 |
|------|------|------|------|
| Info | `[!info]` | ℹ️ | 蓝色 |
| Warning | `[!warning]` | ⚠️ | 黄色 |
| Danger | `[!danger]` | ❌ | 红色 |
| Success | `[!success]` | ✅ | 绿色 |
| Note | `[!note]` | 📝 | 灰色 |
| Tip | `[!tip]` | 💡 | 绿色 |
| Question | `[!question]` | ❓ | 橙色 |

## 🔢 数学公式示例

### 行内公式
```markdown
这是行内公式 $E=mc^2$ 的示例
```

### 块公式
```markdown
$$
\frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$
```

### 常用符号
- 分数：`\frac{a}{b}`
- 根号：`\sqrt{x}`
- 求和：`\sum_{i=1}^{n}`
- 积分：`\int_{a}^{b}`
- 希腊字母：`\alpha \beta \gamma`
- 上标：`x^2`
- 下标：`x_i`

## 🎯 最佳实践

### 1. 性能优化
- 避免在单个文档中使用过多图片
- 大型表格考虑分页
- 复杂布局使用 Layout 工具

### 2. 内容组织
- 使用标题建立层次结构
- 使用 Toggle 折叠长内容
- 使用 Alert 突出重要信息
- 使用 Checklist 管理任务

### 3. 协作建议
- 使用标准 Markdown 语法保证兼容性
- 重要数据添加脚注说明
- 使用 Button 创建快速导航
- 使用 Personality 标注作者信息

### 4. 备份策略
- 定期导出为 Markdown
- 使用 Git 版本控制
- 保留 JSON 数据注释
- 测试双向转换

## 🐛 常见问题

### Q: 工具菜单不显示？
A: 按 `/` 键，确保光标在空行或块的开始位置

### Q: 快捷键不工作？
A: 检查是否与其他插件冲突，在设置中重新配置

### Q: Markdown 转换丢失数据？
A: 确保保留 HTML 注释 `<!-- editorjs-data: ... -->`

### Q: 图片无法显示？
A: 检查图片路径是否正确，使用相对路径或 Obsidian 附件

### Q: 数学公式不渲染？
A: 确保使用正确的 LaTeX 语法，检查是否有语法错误

### Q: 性能变慢？
A: 减少单个文档的块数量，优化图片大小

## 📞 获取帮助

1. 查看 [PLUGINS_GUIDE.md](./PLUGINS_GUIDE.md) - 详细插件说明
2. 查看 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 测试指南
3. 查看 [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md) - 功能总结
4. 查看 [FINAL_SOLUTION.md](./FINAL_SOLUTION.md) - 技术细节

---

**打印此页面，放在手边随时查阅！** 📋

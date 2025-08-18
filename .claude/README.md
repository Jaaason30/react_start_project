# Claude Code /save 指令

这个配置为Claude Code添加了一个自定义的 `/save` 指令，可以自动提交和推送整个项目。

## 使用方法

1. **基本用法**：
   ```
   /save
   ```
   这会自动提交所有更改并推送到git仓库，使用默认的commit消息。

2. **带自定义消息**：
   ```
   /save 修复了视频播放器的bug
   ```
   这会使用自定义消息来描述本次提交的内容。

## 功能

- 自动执行 `git add .`（添加所有更改）
- 自动创建commit（包含时间戳和可选的自定义消息）
- 自动推送到 `origin main` 分支
- 提供详细的操作反馈

## 文件结构

- `.claude/settings.json` - Claude Code的hook配置
- `.claude/save_hook.py` - 处理/save指令的Python脚本

## 注意事项

- 确保git仓库已经配置了远程origin
- 确保当前分支是main（或修改脚本中的分支名）
- 如果没有更改，会显示"工作目录干净"的消息
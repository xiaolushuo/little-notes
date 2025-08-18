# GitHub 自动同步使用说明

## 快速开始

### 1. 连接到 GitHub

#### 方法一：使用 Node.js 脚本（推荐）
```bash
# 运行 GitHub 连接脚本
node connect-github.js
```

按照提示输入：
- GitHub 用户名
- 仓库名称（默认：little-notes）
- 个人访问令牌

#### 方法二：手动设置
```bash
# 添加远程仓库
git remote add origin https://github.com/您的用户名/little-notes.git

# 推送代码
git push -u origin master
```

### 2. 获取 GitHub 个人访问令牌

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置令牌名称（如：little-notes-sync）
4. 选择权限：勾选 `repo`（完全控制仓库）
5. 点击 "Generate token"
6. 复制生成的令牌（只显示一次）

### 3. 自动同步

#### 手动同步
```bash
# 运行自动同步脚本
node auto-sync.js
```

#### 设置定时同步
```bash
# 编辑 crontab
crontab -e

# 添加以下行（每5分钟同步一次）
*/5 * * * * cd /home/z/my-project && node auto-sync.js

# 或者使用 bash 脚本
*/5 * * * * cd /home/z/my-project && bash auto-sync.sh
```

#### 监控同步日志
```bash
# 查看同步日志
tail -f sync.log

# 查看最近的同步记录
cat sync.log | tail -20
```

## 脚本说明

### connect-github.js
- 功能：自动创建 GitHub 仓库并配置 Git 远程仓库
- 用法：`node connect-github.js`
- 需要：GitHub 用户名和个人访问令牌

### auto-sync.js
- 功能：自动检测更改、提交并推送到 GitHub
- 用法：`node auto-sync.js`
- 特点：
  - 自动检测文件更改
  - 智能提交（无更改时不提交）
  - 详细的日志记录
  - 错误处理和报告

### auto-sync.sh
- 功能：bash 版本的自动同步脚本
- 用法：`bash auto-sync.sh`
- 特点：简单轻量，依赖少

## 常用命令

### 检查状态
```bash
# 检查 Git 状态
git status

# 检查远程仓库
git remote -v

# 检查同步日志
cat sync.log
```

### 手动操作
```bash
# 快速提交并推送
git add .
git commit -m "更新: $(date)"
git push origin master

# 强制推送（谨慎使用）
git push -f origin master
```

### 故障排除
```bash
# 重置 Git 状态
git reset --hard HEAD

# 清理未跟踪的文件
git clean -fd

# 重新配置远程仓库
git remote set-url origin https://github.com/用户名/仓库名.git
```

## 安全建议

1. **令牌安全**
   - 不要将个人访问令牌提交到代码仓库
   - 定期更换令牌（建议每3个月）
   - 使用最小权限原则

2. **仓库安全**
   - 定期检查仓库访问权限
   - 启用分支保护（如需要）
   - 监控异常活动

3. **数据备份**
   - 定期检查同步日志
   - 保持本地和远程代码同步
   - 重要更改及时提交

## 常见问题

### Q: 推送失败，提示认证错误
A: 检查个人访问令牌是否有效，是否有足够的权限。

### Q: 仓库创建失败
A: 确保用户名正确，令牌有创建仓库的权限。

### Q: 同步脚本无反应
A: 检查网络连接，查看 sync.log 文件了解详细错误。

### Q: 定时任务不执行
A: 检查 crontab 配置，确保路径正确，查看系统日志。

---

## 技术支持

如果遇到问题，请：
1. 检查 sync.log 文件
2. 确认网络连接正常
3. 验证 GitHub 令牌有效性
4. 查看 Git 配置是否正确

完成设置后，您的代码将自动同步到 GitHub，实现版本控制和数据备份。
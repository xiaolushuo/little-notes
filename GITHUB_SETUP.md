# GitHub 连接设置指南

## 方法一：使用 GitHub CLI (推荐)

如果您已经安装了 GitHub CLI，可以按照以下步骤操作：

```bash
# 1. 登录 GitHub
gh auth login

# 2. 创建仓库
gh repo create little-notes --public --description "小纸条 - 用心记录 轻便生活"

# 3. 推送代码
git remote add origin https://github.com/您的用户名/little-notes.git
git push -u origin master
```

## 方法二：手动创建仓库

1. **在 GitHub 上创建仓库**
   - 访问 https://github.com
   - 点击右上角的 "+" 号，选择 "New repository"
   - 仓库名称：`little-notes`
   - 描述：`小纸条 - 用心记录 轻便生活`
   - 设置为 Public（公开）
   - 不要初始化 README（因为我们已经有代码了）

2. **连接本地仓库**
   ```bash
   # 添加远程仓库
   git remote add origin https://github.com/您的用户名/little-notes.git
   
   # 推送到 GitHub
   git push -u origin master
   ```

## 方法三：使用提供的脚本

### 1. 运行设置脚本
```bash
bash setup-github.sh
```
按照提示输入您的 GitHub 用户名和个人访问令牌。

### 2. 获取 GitHub 个人访问令牌
- 访问 https://github.com/settings/tokens
- 点击 "Generate new token" → "Generate new token (classic)"
- 设置令牌名称，选择权限（至少需要 `repo` 权限）
- 生成令牌并复制

## 实时同步设置

### 自动同步脚本
使用 `auto-sync.sh` 脚本进行自动同步：

```bash
# 运行自动同步
bash auto-sync.sh
```

### 设置定时同步（可选）
您可以设置 cron 任务来定期同步：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每5分钟同步一次）
*/5 * * * * cd /home/z/my-project && bash auto-sync.sh >> /home/z/my-project/sync.log 2>&1
```

### 手动同步命令
```bash
# 快速提交并推送
git add .
git commit -m "更新: $(date)"
git push origin master
```

## 验证连接

```bash
# 检查远程仓库
git remote -v

# 检查同步状态
git status

# 测试推送
git push origin master
```

## 故障排除

### 1. 认证失败
- 确保您的 GitHub 令牌有效
- 检查令牌是否有足够的权限
- 如果使用 HTTPS，可能需要输入用户名和令牌作为密码

### 2. 推送失败
- 检查网络连接
- 确保远程仓库 URL 正确
- 检查是否有冲突需要解决

### 3. 权限问题
- 确保您对仓库有写入权限
- 检查 GitHub 令牌的权限设置

## 安全提示

- 不要将您的 GitHub 令牌提交到代码仓库
- 定期轮换您的个人访问令牌
- 使用最小权限原则设置令牌权限

---

完成设置后，您的代码将自动同步到 GitHub，实现版本控制和备份。
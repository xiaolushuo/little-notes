# 手动 GitHub 设置指南

## 当前状态
✅ 代码已提交到本地 Git 仓库
✅ 所有更改已准备好推送
❌ 尚未配置远程 GitHub 仓库

## 快速设置步骤

### 方法一：使用 GitHub 网页界面（推荐）

1. **创建 GitHub 仓库**
   - 访问 https://github.com
   - 点击右上角的 "+" → "New repository"
   - 仓库名称：`little-notes`
   - 描述：`小纸条 - 用心记录 轻便生活`
   - 设置为 **Public**（公开）
   - **不要** 勾选 "Add a README file"（因为我们已经有代码了）
   - 点击 "Create repository"

2. **连接并推送代码**
   ```bash
   # 替换 YOUR_USERNAME 为您的 GitHub 用户名
   git remote add origin https://github.com/YOUR_USERNAME/little-notes.git
   git push -u origin master
   ```

### 方法二：使用 GitHub CLI（如果已安装）

```bash
# 登录 GitHub
gh auth login

# 创建仓库
gh repo create little-notes --public --description "小纸条 - 用心记录 轻便生活"

# 推送代码
git push -u origin master
```

### 方法三：使用环境变量设置

如果您有 GitHub 个人访问令牌，可以设置环境变量：

```bash
# 设置环境变量
export GITHUB_USERNAME="your-username"
export GITHUB_REPO="little-notes"
export GITHUB_TOKEN="your-personal-access-token"

# 运行设置脚本
node simple-github-setup.js
```

## 获取 GitHub 个人访问令牌

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置令牌名称（如：little-notes-app）
4. 选择权限：
   - ✅ `repo`（完全访问仓库）
   - ✅ `workflow`（如果需要 CI/CD）
5. 点击 "Generate token"
6. **复制生成的令牌**（只显示一次）

## 验证设置

设置完成后，您可以验证：

```bash
# 检查远程仓库
git remote -v

# 检查同步状态
git status

# 测试连接
git ls-remote origin
```

## 后续同步

设置完成后，您可以使用以下命令同步：

```bash
# 快速同步
git add .
git commit -m "更新: $(date)"
git push origin master

# 或使用自动同步脚本
bash auto-sync.sh
```

## 故障排除

### 1. 认证失败
- 确保令牌有效且具有 `repo` 权限
- 如果使用 HTTPS，可能需要输入用户名和令牌作为密码

### 2. 仓库不存在
- 确保在 GitHub 上已创建仓库
- 检查仓库名称和用户名是否正确

### 3. 权限问题
- 确保您对仓库有写入权限
- 检查令牌权限设置

### 4. 网络问题
- 检查网络连接
- 如果在公司网络，可能需要配置代理

## 完成后的功能

一旦同步成功，您将获得：

- ✅ 代码版本控制
- ✅ 云端备份
- ✅ 协作功能
- ✅ CI/CD 集成能力
- ✅ 项目展示页面

---

**注意**：请确保不要将您的 GitHub 令牌提交到代码仓库中！
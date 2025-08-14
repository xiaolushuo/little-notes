#!/bin/bash

# GitHub仓库设置脚本
echo "=== GitHub仓库设置脚本 ==="

# 获取用户输入
read -p "请输入您的GitHub用户名: " GITHUB_USERNAME
read -p "请输入仓库名称 (默认: little-notes): " REPO_NAME
REPO_NAME=${REPO_NAME:-little-notes}

read -p "请输入GitHub个人访问令牌 (Personal Access Token): " GITHUB_TOKEN

# 验证输入
if [[ -z "$GITHUB_USERNAME" || -z "$GITHUB_TOKEN" ]]; then
    echo "错误: 用户名和访问令牌不能为空"
    exit 1
fi

echo "正在创建GitHub仓库..."

# 创建GitHub仓库
CREATE_REPO_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"小纸条 - 用心记录 轻便生活\",\"private\":false,\"auto_init\":false}")

# 检查是否创建成功
if echo "$CREATE_REPO_RESPONSE" | grep -q "full_name"; then
    echo "✅ GitHub仓库创建成功!"
    
    # 获取仓库URL
    REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "仓库URL: $REPO_URL"
    
    # 添加远程仓库
    echo "正在添加远程仓库..."
    git remote add origin "$REPO_URL"
    
    # 推送到GitHub
    echo "正在推送代码到GitHub..."
    git push -u origin master
    
    if [ $? -eq 0 ]; then
        echo "✅ 代码成功推送到GitHub!"
        echo "🎉 设置完成! 您的仓库地址: $REPO_URL"
    else
        echo "❌ 推送失败，请检查网络连接和权限"
    fi
else
    echo "❌ 仓库创建失败"
    echo "错误信息: $CREATE_REPO_RESPONSE"
    exit 1
fi
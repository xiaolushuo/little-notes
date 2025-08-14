#!/bin/bash

# 自动同步脚本 - 实时同步代码到GitHub
echo "=== 自动同步脚本 ==="

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "发现未提交的更改，正在提交..."
    
    # 添加所有更改
    git add .
    
    # 创建提交消息
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MESSAGE="自动同步更新 - $TIMESTAMP"
    
    # 提交更改
    git commit -m "$COMMIT_MESSAGE
    
🤖 Generated with auto-sync script

Co-Authored-By: Auto-Sync <noreply@anthropic.com>"
    
    echo "✅ 更改已提交"
fi

# 推送到GitHub
echo "正在推送到GitHub..."
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ 同步成功!"
    echo "📅 同步时间: $(date)"
else
    echo "❌ 同步失败，请检查网络连接"
fi
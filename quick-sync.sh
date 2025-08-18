#!/bin/bash

# 快速 GitHub 同步脚本
echo "=== 快速 GitHub 同步 ==="

# 检查是否已配置远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ 发现已配置的远程仓库"
    echo "远程仓库 URL: $(git remote get-url origin)"
    
    # 尝试推送
    echo "正在推送到 GitHub..."
    if git push origin master 2>/dev/null; then
        echo "✅ 推送成功!"
        echo "📅 同步时间: $(date)"
        echo "🔗 仓库地址: $(git remote get-url origin | sed 's/\.git$//' | sed 's/^https:\/\//https:\/\/github.com\//')"
    else
        echo "❌ 推送失败，请检查："
        echo "1. 网络连接"
        echo "2. 认证信息"
        echo "3. 仓库权限"
        echo ""
        echo "手动推送命令:"
        echo "git push origin master"
    fi
else
    echo "❌ 未发现远程仓库配置"
    echo ""
    echo "请按以下步骤设置："
    echo ""
    echo "1. 在 GitHub 上创建仓库："
    echo "   - 访问 https://github.com"
    echo "   - 创建新仓库 'little-notes'"
    echo "   - 设置为公开仓库"
    echo ""
    echo "2. 配置远程仓库（替换 YOUR_USERNAME）："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/little-notes.git"
    echo ""
    echo "3. 推送代码："
    echo "   git push -u origin master"
    echo ""
    echo "4. 验证同步："
    echo "   git remote -v"
fi

echo ""
echo "=== 当前状态 ==="
echo "最新提交: $(git log --oneline -1)"
echo "分支: $(git branch --show-current)"
echo "工作目录状态: $(git status --porcelain | wc -l) 个文件待提交"

if [ $(git status --porcelain | wc -l) -gt 0 ]; then
    echo ""
    echo "⚠️  发现未提交的更改，建议先提交："
    echo "git add ."
    echo "git commit -m '更新: \$(date)'"
fi
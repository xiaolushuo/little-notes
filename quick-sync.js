#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== 快速 GitHub 同步指南 ===\n');

// 检查 Git 状态
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
        console.log('⚠️  发现未提交的更改');
        console.log('正在提交更改...\n');
        
        execSync('git add .');
        execSync('git commit -m "自动同步更新\n\n🤖 Generated with quick-sync script\n\nCo-Authored-By: Auto-Sync <noreply@anthropic.com>"');
        console.log('✅ 更改已提交\n');
    } else {
        console.log('✅ 没有未提交的更改\n');
    }
} catch (error) {
    console.log('❌ Git 操作失败:', error.message);
}

// 检查远程仓库
try {
    execSync('git remote get-url origin', { stdio: 'pipe' });
    console.log('✅ 远程仓库已配置\n');
    
    // 尝试推送
    console.log('正在推送到 GitHub...');
    execSync('git push origin master', { stdio: 'inherit' });
    console.log('\n✅ 推送成功!');
    
} catch (error) {
    console.log('❌ 远程仓库未配置或推送失败\n');
    
    console.log('请按以下步骤手动设置:\n');
    console.log('1. 在 GitHub 上创建仓库:');
    console.log('   - 访问: https://github.com');
    console.log('   - 点击 "+" → "New repository"');
    console.log('   - 仓库名: little-notes');
    console.log('   - 设置为 Public');
    console.log('   - 不要初始化 README\n');
    
    console.log('2. 连接并推送代码:');
    console.log('   git remote add origin https://github.com/YOUR_USERNAME/little-notes.git');
    console.log('   git push -u origin master\n');
    
    console.log('3. 如果需要认证:');
    console.log('   - 用户名: GitHub 用户名');
    console.log('   - 密码: GitHub Personal Access Token\n');
    
    console.log('获取 Token: https://github.com/settings/tokens');
}

console.log('\n=== 项目信息 ===');
console.log('📁 项目名称: little-notes');
console.log('📝 描述: 小纸条 - 用心记录 轻便生活');
console.log('🚀 技术栈: Next.js 15 + TypeScript + Tailwind CSS');
console.log('✨ 主要功能: 笔记管理、置顶、搜索、本地存储');

// 显示最近的提交
try {
    const commits = execSync('git log --oneline -5', { encoding: 'utf8' });
    console.log('\n📋 最近提交:');
    console.log(commits);
} catch (error) {
    // 忽略错误
}
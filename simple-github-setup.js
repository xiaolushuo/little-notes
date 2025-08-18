#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// 简化的GitHub设置脚本
console.log('=== GitHub 简化设置 ===');

// 默认配置
const config = {
    username: process.env.GITHUB_USERNAME || 'your-github-username',
    repoName: process.env.GITHUB_REPO || 'little-notes',
    token: process.env.GITHUB_TOKEN || 'your-github-token'
};

console.log(`使用配置:`);
console.log(`用户名: ${config.username}`);
console.log(`仓库名: ${config.repoName}`);
console.log(`Token: ${config.token.substring(0, 4)}...`);

// 构建仓库URL
const repoUrl = `https://${config.token}@github.com/${config.username}/${config.repoName}.git`;

try {
    // 检查是否已存在远程仓库
    try {
        execSync('git remote get-url origin', { stdio: 'pipe' });
        console.log('远程仓库已存在，正在更新...');
        execSync(`git remote set-url origin ${repoUrl}`);
    } catch (e) {
        // 远程仓库不存在，添加新的
        execSync(`git remote add origin ${repoUrl}`);
        console.log('✅ 远程仓库添加成功!');
    }

    // 推送代码
    console.log('正在推送代码到 GitHub...');
    execSync('git push -u origin master', { stdio: 'inherit' });
    
    console.log('✅ 代码推送成功!');
    console.log(`📁 仓库地址: https://github.com/${config.username}/${config.repoName}`);
    
} catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.log('\n请检查：');
    console.log('1. 确保在GitHub上已创建仓库');
    console.log('2. 检查用户名和仓库名称是否正确');
    console.log('3. 确认GitHub令牌有效且有权限');
    console.log('4. 检查网络连接');
    
    console.log('\n手动设置命令:');
    console.log(`git remote add origin https://github.com/${config.username}/${config.repoName}.git`);
    console.log('git push -u origin master');
}
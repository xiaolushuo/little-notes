#!/usr/bin/env node

// 演示脚本 - 展示如何使用GitHub同步功能
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== GitHub 同步功能演示 ===\n');

// 检查是否已连接到GitHub
function checkGitHubConnection() {
    try {
        const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8', stdio: 'pipe' }).trim();
        console.log('✅ 已连接到GitHub远程仓库:');
        console.log(`   ${remoteUrl}\n`);
        return true;
    } catch (error) {
        console.log('❌ 尚未连接到GitHub远程仓库\n');
        console.log('请先运行以下命令连接到GitHub:');
        console.log('   node connect-github.js');
        console.log('   # 或手动设置: git remote add origin <your-repo-url>\n');
        return false;
    }
}

// 检查未提交的更改
function checkUncommittedChanges() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        if (status) {
            console.log('📝 发现未提交的更改:');
            console.log(status);
            return true;
        } else {
            console.log('✅ 没有未提交的更改\n');
            return false;
        }
    } catch (error) {
        console.log('❌ 检查更改状态失败\n');
        return false;
    }
}

// 模拟自动同步
function simulateAutoSync() {
    console.log('🔄 模拟自动同步过程...\n');
    
    // 检查更改
    if (checkUncommittedChanges()) {
        console.log('📤 正在提交更改...');
        try {
            execSync('git add .', { stdio: 'pipe' });
            const timestamp = new Date().toLocaleString('zh-CN');
            execSync(`git commit -m "演示同步更新 - ${timestamp}"`, { stdio: 'pipe' });
            console.log('✅ 更改已提交\n');
        } catch (error) {
            console.log('❌ 提交失败\n');
        }
    }
    
    // 推送到远程
    console.log('📤 正在推送到GitHub...');
    try {
        execSync('git push origin master', { stdio: 'pipe' });
        console.log('✅ 推送成功!\n');
    } catch (error) {
        console.log('❌ 推送失败，请检查网络连接和权限\n');
    }
}

// 显示使用说明
function showUsageInstructions() {
    console.log('📋 使用说明:\n');
    console.log('1. 连接到GitHub:');
    console.log('   node connect-github.js\n');
    console.log('2. 手动同步:');
    console.log('   node auto-sync.js\n');
    console.log('3. 设置定时同步:');
    console.log('   # 编辑 crontab: crontab -e');
    console.log('   # 添加: */5 * * * * cd /home/z/my-project && node auto-sync.js\n');
    console.log('4. 查看同步日志:');
    console.log('   cat sync.log\n');
    console.log('5. 查看详细指南:');
    console.log('   cat SYNC_GUIDE.md\n');
}

// 主函数
function main() {
    console.log('🎯 演示开始!\n');
    
    // 检查GitHub连接
    const isConnected = checkGitHubConnection();
    
    if (isConnected) {
        // 模拟同步过程
        simulateAutoSync();
    }
    
    // 显示使用说明
    showUsageInstructions();
    
    console.log('🎉 演示完成!');
    console.log('💡 提示: 运行 node connect-github.js 开始设置GitHub同步');
}

// 运行演示
main();
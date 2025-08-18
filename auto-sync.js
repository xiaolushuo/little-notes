#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

class AutoSync {
    constructor() {
        this.logFile = '/home/z/my-project/sync.log';
    }

    // 记录日志
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }

    // 检查是否有未提交的更改
    hasChanges() {
        try {
            const output = execSync('git status --porcelain', { encoding: 'utf8' });
            return output.trim().length > 0;
        } catch (error) {
            this.log('检查更改状态失败: ' + error.message);
            return false;
        }
    }

    // 添加所有更改
    addChanges() {
        try {
            execSync('git add .', { stdio: 'pipe' });
            this.log('✅ 所有更改已添加到暂存区');
            return true;
        } catch (error) {
            this.log('❌ 添加更改失败: ' + error.message);
            return false;
        }
    }

    // 提交更改
    commitChanges() {
        try {
            const timestamp = new Date().toLocaleString('zh-CN');
            const message = `自动同步更新 - ${timestamp}`;
            
            execSync(`git commit -m "${message}

🤖 Generated with auto-sync script

Co-Authored-By: Auto-Sync <noreply@anthropic.com>"`, { stdio: 'pipe' });
            
            this.log('✅ 更改已提交');
            return true;
        } catch (error) {
            this.log('❌ 提交失败: ' + error.message);
            return false;
        }
    }

    // 推送到远程仓库
    pushToRemote() {
        try {
            execSync('git push origin master', { stdio: 'pipe' });
            this.log('✅ 代码已推送到 GitHub');
            return true;
        } catch (error) {
            this.log('❌ 推送失败: ' + error.message);
            return false;
        }
    }

    // 检查远程仓库连接
    checkRemoteConnection() {
        try {
            execSync('git remote get-url origin', { stdio: 'pipe' });
            this.log('✅ 远程仓库连接正常');
            return true;
        } catch (error) {
            this.log('❌ 未找到远程仓库配置，请先运行 GitHub 连接设置');
            return false;
        }
    }

    // 主同步流程
    async sync() {
        this.log('=== 开始自动同步 ===');
        
        // 检查远程仓库连接
        if (!this.checkRemoteConnection()) {
            return false;
        }

        let success = true;

        // 检查是否有更改
        if (this.hasChanges()) {
            this.log('发现未提交的更改');
            
            // 添加更改
            if (!this.addChanges()) {
                success = false;
            }
            
            // 提交更改
            if (success && !this.commitChanges()) {
                success = false;
            }
        } else {
            this.log('没有发现更改，跳过提交');
        }

        // 推送到远程仓库
        if (success && !this.pushToRemote()) {
            success = false;
        }

        if (success) {
            this.log('🎉 同步完成!');
        } else {
            this.log('❌ 同步过程中出现错误');
        }

        return success;
    }

    // 运行同步
    run() {
        this.sync().catch(error => {
            this.log('❌ 同步失败: ' + error.message);
            process.exit(1);
        });
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const sync = new AutoSync();
    sync.run();
}

module.exports = AutoSync;
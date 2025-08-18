#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

// GitHub API 配置
const GITHUB_API = 'api.github.com';

class GitHubConnector {
    constructor() {
        this.username = '';
        this.token = '';
        this.repoName = 'little-notes';
    }

    // 获取用户输入
    async getUserInput() {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            console.log('=== GitHub 连接设置 ===');
            
            readline.question('请输入您的 GitHub 用户名: ', (username) => {
                this.username = username;
                
                readline.question('请输入仓库名称 (默认: little-notes): ', (repoName) => {
                    this.repoName = repoName || 'little-notes';
                    
                    readline.question('请输入 GitHub 个人访问令牌: ', (token) => {
                        this.token = token;
                        readline.close();
                        resolve();
                    });
                });
            });
        });
    }

    // 创建 HTTP 请求
    makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: GITHUB_API,
                port: 443,
                path: path,
                method: method,
                headers: {
                    'User-Agent': 'Node.js-GitHub-Connector',
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            if (data) {
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
            }

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve({
                            statusCode: res.statusCode,
                            body: JSON.parse(body)
                        });
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // 创建仓库
    async createRepository() {
        console.log('正在创建 GitHub 仓库...');
        
        const repoData = {
            name: this.repoName,
            description: '小纸条 - 用心记录 轻便生活',
            private: false,
            auto_init: false
        };

        try {
            const response = await this.makeRequest('/user/repos', 'POST', repoData);
            
            if (response.statusCode === 201) {
                console.log('✅ 仓库创建成功!');
                return response.body;
            } else {
                throw new Error(`创建失败: ${response.body.message}`);
            }
        } catch (error) {
            console.error('❌ 仓库创建失败:', error.message);
            throw error;
        }
    }

    // 配置 Git 远程仓库
    async setupGitRemote(repoUrl) {
        console.log('正在配置 Git 远程仓库...');
        
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
            return true;
        } catch (error) {
            console.error('❌ Git 操作失败:', error.message);
            throw error;
        }
    }

    // 主流程
    async run() {
        try {
            // 获取用户输入
            await this.getUserInput();

            // 验证输入
            if (!this.username || !this.token) {
                console.error('❌ 用户名和令牌不能为空');
                return;
            }

            // 创建仓库
            const repo = await this.createRepository();
            const repoUrl = repo.clone_url;

            console.log(`仓库地址: ${repoUrl}`);

            // 配置 Git 并推送
            await this.setupGitRemote(repoUrl);

            console.log('\n🎉 设置完成!');
            console.log(`📁 仓库地址: ${repo.html_url}`);
            console.log('🔗 远程地址: ' + repoUrl);
            
        } catch (error) {
            console.error('\n❌ 设置失败:', error.message);
            console.log('\n请检查：');
            console.log('1. GitHub 用户名是否正确');
            console.log('2. 个人访问令牌是否有效且有权限');
            console.log('3. 网络连接是否正常');
        }
    }
}

// 运行连接器
const connector = new GitHubConnector();
connector.run();
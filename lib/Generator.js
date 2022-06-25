/*
 * @Author: rzh
 * @Date: 2021-10-10 20:33:47
 * @LastEditors: rzh
 * @LastEditTime: 2021-10-10 22:17:46
 * @Description: Do not edit
 */
const path = require('path')
const chalk = require('chalk')
const { getRepoList } = require('./http')
// ora处理loading特效
const ora = require('ora')
// 用户选择模版逻辑
const inquirer = require('inquirer')
// promise化下列下载库
const util = require('util')
// 从git上下载的库
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
// 添加加载动画
async function wrapLoading(fn, message, ...args) {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora(message);
    // 开始加载动画
    spinner.start();

    try {
        // 执行传入方法 fn
        const result = await fn(...args);
        // 状态为修改为成功
        spinner.succeed();
        return result;
    } catch (error) {
        // 状态为修改为失败
        spinner.fail('Request failed, refetch ...')
        console.log('失败', error.message)
    }
}
// 新建Generator处理项目创建逻辑
class Generator {
    constructor(name, targetDir) {
        // 目录名称
        this.name = name;
        // 创建位置
        this.targetDir = targetDir;
        // 对 download-git-repo 进行 promise 化改造
        this.downloadGitRepo = util.promisify(downloadGitRepo);
    }
    // 下载远程模板
    // 1）拼接下载地址
    // 2）调用下载方法
    async download(repo) {

        // 1）拼接下载地址
        const requestUrl = `gitlab:template-cli/${repo}#main`;

        // 2）调用下载方法
        await wrapLoading(
            this.downloadGitRepo, // 远程下载方法
            'waiting download template', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            path.resolve(process.cwd(), this.targetDir),// 参数2: 创建位置
            { clone: true })
    }
    // 获取用户选择的模板
    // 1）从远程拉取模板数据
    // 2）用户选择自己新下载的模板名称
    // 3）return 用户选择的名称
    async getRepo() {
        // 1）从远程拉取模板数据
        const repoList = await wrapLoading(getRepoList, 'waiting fetch template');
        if (!repoList) return;

        // 过滤我们需要的模板名称
        const repos = repoList.map(item => item.name);

        // 2）用户选择自己新下载的模板名称
        const { repo } = await inquirer.prompt({
            name: 'repo',
            type: 'list',
            choices: repos,
            message: 'Please choose a template to create project'
        })

        // 3）return 用户选择的名称
        return repo;
    }

    // 核心创建逻辑
    // 1）获取模板名称
    // 2）获取 tag 名称
    // 3）下载模板到模板目录
    async create() {
        // 1）获取模板名称
        const repo = await this.getRepo()
        // // 2) 获取 tag 名称
        // const tag = await this.getTag(repo)
        // 3）下载模板到模板目录
        // await this.download(repo, tag)
        await this.download(repo)

        // 4) 成功后的提示
        console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
        console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
        console.log('  npm run dev\r\n')



        // git@gitlab.com:template-cli/rollup-cli.git
        // console.log('用户选择了，repo=' + repo)
    }
}

module.exports = Generator;
